import type { BookingStatus, PaymentStatus, PrismaClient } from "@prisma/client"
import dayjs from "dayjs"
import { v4 as uuidv4 } from "uuid"
import { requireAuth } from "../../lib/context.js"
import { createBookingSchema, updateBookingSchema, updatePaymenStatusSchema, } from "./validators/bookingSchema.js"
import Upload from "graphql-upload/Upload.mjs"
import { uploadToMinio } from "../../lib/uploadToMinio.js"
import { minioClient, BUCKET } from "../../lib/minioClient.js"
import { sendEmail } from "../../lib/email/emailService.js"
import { generateBookingConfirmationEmail } from "../../lib/email/templates/bookingConfirmation.js"
import { generateBookingCancellationEmail } from "../../lib/email/templates/bookingCancellation.js"
const DEFAULT_ACADEMIC_SURAT_URL = process.env.DEFAULT_ACADEMIC_SURAT_URL ?? "https://example.com/uploads/placeholder-surat.pdf"

interface BookingArgs {
    bookingCode: string
    stadionId?: number | string
    date?: Date
    startDate?: Date
    endDate?: Date
    status?: string
    paymentStatus?: string
    search?: string
    page?: number
    limit?: number
    sortOrder?: string
}

interface CreateBookingArgs {
    name: string
    contact: string
    email: string
    institution?: string
    suratFile?: Upload
    isAcademic?: boolean
    status?: BookingStatus
    details: BookingDetailInput[]
}

interface UpdateStatusArgs {
    bookingCode: string
    status: BookingStatus
}

interface UpdatePaymentArgs {
    bookingCode: string
    paymentStatus: PaymentStatus
}

interface BookingDetailInput {
    fieldId: number
    bookingDate: Date | string
    startHour: number
    pricePerHour?: number
    subtotal?: number
}

type ResolverContext = {
    prisma: PrismaClient
    admin: {
        adminId: number
        email: string | null
        name: string
    } | null
}

function buildBookingWhereClause(args: BookingArgs) {
    const { status, paymentStatus, search, stadionId, startDate, endDate, date } = args
    const where: any = {}
    if (status) {
        where.status = status
    }
    if (paymentStatus) {
        where.paymentStatus = paymentStatus
    }
    if (search && search.trim()) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { bookingCode: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
        ]
    }
    if (stadionId) {
        where.details = {
            some: {
                Field: {
                    stadionId: Number(stadionId)
                }
            }
        }
    }

    if (date) {
        const selectedDate = new Date(date)
        const startOfDay = new Date(selectedDate)
        startOfDay.setUTCHours(0, 0, 0, 0)
        const endOfDay = new Date(selectedDate)
        endOfDay.setUTCHours(23, 59, 59, 999)

        if (where.details) {
            where.details.some = {
                ...where.details.some,
                bookingDate: {
                    gte: startOfDay,
                    lte: endOfDay,
                }
            }
        } else {
            where.details = {
                some: {
                    bookingDate: {
                        gte: startOfDay,
                        lte: endOfDay,
                    }
                }
            }
        }
    }
    else if (startDate && endDate) {
        const endDateTime = new Date(endDate)
        endDateTime.setUTCHours(23, 59, 59, 999)
        where.createdAt = {
            gte: new Date(startDate),
            lte: endDateTime
        }
    }
    return where
}

export const bookingResolvers = {
    Query: {
        bookings: async (_: unknown, args: BookingArgs, { prisma }: ResolverContext) => {
            const {
                page = 1,
                limit = 10,
                sortOrder = 'desc',
            } = args
            const where = buildBookingWhereClause(args)
            const pageNum = Math.max(1, Number(page) || 1)
            const limitNum = Math.min(100, Math.max(1, Number(limit) || 10))
            const skip = (pageNum - 1) * limitNum
            const [
                data,
                total,
                paidAggregation,
                unpaidCount,
                academicPaidAggregation,
                nonAcademicPaidAggregation,
                academicCount,
                nonAcademicCount,
                approvedCount,
                cancelledCount,
                pendingCount
            ] = await Promise.all([
                prisma.booking.findMany({
                    where,
                    skip,
                    take: limitNum,
                    orderBy: { createdAt: sortOrder === 'asc' ? 'asc' : 'desc' },
                    include: {
                        details: {
                            include: {
                                Field: {
                                    include: {
                                        Stadion: true
                                    }
                                }
                            }
                        }
                    }
                }),
                prisma.booking.count({ where }),
                prisma.booking.aggregate({
                    where: { ...where, paymentStatus: 'PAID' },
                    _sum: { totalPrice: true },
                    _count: true
                }),
                prisma.booking.count({
                    where: { ...where, paymentStatus: 'UNPAID' }
                }),
                prisma.booking.aggregate({
                    where: { ...where, isAcademic: true, paymentStatus: 'PAID' },
                    _sum: { totalPrice: true },
                    _count: true
                }),
                prisma.booking.aggregate({
                    where: { ...where, isAcademic: false, paymentStatus: 'PAID' },
                    _sum: { totalPrice: true },
                    _count: true
                }),
                prisma.booking.count({
                    where: { ...where, isAcademic: true }
                }),
                prisma.booking.count({
                    where: { ...where, isAcademic: false }
                }),
                prisma.booking.count({ where: { ...where, status: 'APPROVED' } }),
                prisma.booking.count({ where: { ...where, status: 'CANCELLED' } }),
                prisma.booking.count({ where: { ...where, status: 'PENDING' } })
            ])

            const totalRevenue = paidAggregation._sum.totalPrice ?? 0
            const paidCount = paidAggregation._count ?? 0
            const academicRevenue = academicPaidAggregation._sum.totalPrice ?? 0
            const nonAcademicRevenue = nonAcademicPaidAggregation._sum.totalPrice ?? 0
            const paidPercentage = total > 0 ? (paidCount / total) * 100 : 0
            const averagePerBooking = paidCount > 0 ? totalRevenue / paidCount : 0
            const totalPages = Math.ceil(total / limitNum)
            return {
                data,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages,
                    hasNextPage: pageNum < totalPages,
                    hasPrevPage: pageNum > 1
                },
                summary: {
                    totalRevenue,
                    totalCount: total,
                    paidCount,
                    unpaidCount,
                    academicCount,
                    nonAcademicCount,
                    academicRevenue,
                    nonAcademicRevenue,
                    paidPercentage,
                    averagePerBooking,
                    approvedCount,
                    cancelledCount,
                    pendingCount
                }
            }
        },
        booking: async (_: unknown, { bookingCode }: BookingArgs, { prisma }: ResolverContext) => {
            return prisma.booking.findUnique({
                where: { bookingCode },
                include: {
                    details: {
                        include: { Field: true }
                    },
                },
            })
        },
    },
    Mutation: {
        createBooking: async (_: unknown, args: CreateBookingArgs, { prisma }: ResolverContext) => {
            const validated = await createBookingSchema.validate(args, { abortEarly: false })
            const { name, contact, email, institution, suratFile, isAcademic = false, details, status, paymentStatus } = validated
            let suratUrl = null;
            let uploadedObjectName: string | null = null
            if (!details || !Array.isArray(details) || details.length === 0) {
                throw new Error("Detail booking harus diisi")
            }
            if (suratFile) {
                let resolvedFile: any
                try {
                    if (typeof (suratFile as any).promise === 'function' || (suratFile as any).promise) {
                        resolvedFile = await (suratFile as any).promise
                    } else {
                        resolvedFile = suratFile
                    }
                } catch (e) {
                    throw new Error('Gagal memproses file surat')
                }
                const mimetype = resolvedFile.mimetype || ''
                if (!mimetype.includes('pdf')) {
                    throw new Error('Surat harus berformat PDF')
                }
                const uploadResult = await uploadToMinio(resolvedFile, 'surat')
                suratUrl = uploadResult.publicUrl
                uploadedObjectName = uploadResult.objectName
            }
            const bookingCode = `DS-${uuidv4().split("-")[0]?.toUpperCase()}`
            const today = dayjs().startOf("day")
            const operatingHour = await prisma.operatingHour.findUnique({
                where: { id: 1 },
            })
            const openHour = operatingHour?.openHour ?? 8
            const closeHour = operatingHour?.closeHour ?? 21
            const minBookingHour = openHour
            const maxBookingHour = closeHour - 1
            const detailPayload = await Promise.all(
                details.map(async (item) => {
                    const bookingDate = dayjs(item.bookingDate)
                    if (bookingDate.isBefore(today.add(1, "day"))) {
                        throw new Error("Maksimal booking harus dilakukan minimal H-1")
                    }
                    if (item.startHour < minBookingHour || item.startHour > maxBookingHour) {
                        throw new Error(
                            `Jam mulai booking harus antara ${minBookingHour}:00 - ${maxBookingHour}:00 ` +
                            `(Stadion operasional: ${openHour}:00 - ${closeHour}:00)`
                        )
                    }
                    const field = await prisma.field.findUnique({
                        where: { id: item.fieldId },
                        select: { pricePerHour: true },
                    })
                    if (!field) {
                        throw new Error("Field tidak ditemukan")
                    }
                    const pricePerHour = item.pricePerHour ?? field.pricePerHour ?? 0
                    const subtotal = item.subtotal ?? (pricePerHour * 1)
                    return {
                        fieldId: item.fieldId,
                        bookingDate: bookingDate.toDate(),
                        startHour: item.startHour,
                        pricePerHour,
                        subtotal,
                    }
                })
            )
            const totalPrice = isAcademic ? 0 : detailPayload.reduce((acc, curr) => acc + curr.subtotal, 0)
            try {
                const booking = await prisma.booking.create({
                    data: {
                        bookingCode,
                        name,
                        contact,
                        email,
                        institution,
                        suratUrl,
                        isAcademic,
                        totalPrice,
                        status: status ?? "PENDING",
                        paymentStatus: paymentStatus ?? "UNPAID",
                        details: {
                            create: detailPayload,
                        },
                    },
                    include: {
                        details: {
                            include: {
                                Field: {
                                    include: {
                                        Stadion: true
                                    }
                                }
                            }
                        },
                    },
                })
                const option = await prisma.option.findFirst({ where: { id: 1 } })
                const contactEmail = option?.email ?? 'helpdesk@live.undip.ac.id'
                const contactPhone = option?.nohp ?? '+62 851-6566-0339'
                try {
                    const emailHtml = generateBookingConfirmationEmail({
                        bookingCode: booking.bookingCode,
                        name: booking.name,
                        email: booking.email,
                        contact: booking.contact,
                        institution: booking.institution || undefined,
                        isAcademic: booking.isAcademic,
                        totalPrice: booking.totalPrice,
                        details: booking.details,
                        contactEmail,
                        contactPhone,
                    })
                    await sendEmail({
                        to: booking.email,
                        subject: `Konfirmasi Booking - ${booking.bookingCode} | VENUE UNDIP`,
                        html: emailHtml,
                    })
                } catch (emailError) {
                    console.error('Failed to send confirmation email:', emailError)
                }
                return booking
            } catch (err) {
                if (typeof uploadedObjectName === 'string' && uploadedObjectName) {
                    try {
                        await minioClient.removeObject(BUCKET, uploadedObjectName)
                    } catch (removeErr) {
                        console.error('Failed to remove uploaded object after DB error:', removeErr)
                    }
                }
                throw err
            }
        },
        updateStatusBooking: async (_: unknown, args: UpdateStatusArgs, { prisma, admin }: ResolverContext) => {
            requireAuth(admin)
            const validated = await updateBookingSchema.validate(args, { abortEarly: false })
            const { bookingCode, status } = validated
            if (status === 'CANCELLED') {
                const bookingBeforeCancel = await prisma.booking.findUnique({
                    where: { bookingCode },
                    include: {
                        details: {
                            include: {
                                Field: {
                                    include: {
                                        Stadion: true
                                    }
                                }
                            }
                        }
                    }
                })
                if (!bookingBeforeCancel) throw new Error('Booking not found')
                const [, updated] = await prisma.$transaction([
                    prisma.bookingDetail.deleteMany({ where: { bookingId: bookingBeforeCancel.id } }),
                    prisma.booking.update({
                        where: { bookingCode },
                        data: { status },
                        include: {
                            details: {
                                include: {
                                    Field: {
                                        include: {
                                            Stadion: true
                                        }
                                    }
                                }
                            }
                        }
                    }),
                ])
                const option = await prisma.option.findFirst({ where: { id: 1 } })
                const contactEmail = option?.email ?? 'helpdesk@live.undip.ac.id'
                const contactPhone = option?.nohp ?? '+62 851-6566-0339'
                try {
                    const emailHtml = generateBookingCancellationEmail({
                        bookingCode: bookingBeforeCancel.bookingCode,
                        name: bookingBeforeCancel.name,
                        email: bookingBeforeCancel.email,
                        institution: bookingBeforeCancel.institution || undefined,
                        isAcademic: bookingBeforeCancel.isAcademic,
                        details: bookingBeforeCancel.details,
                        contactEmail,
                        contactPhone,
                    })
                    await sendEmail({
                        to: bookingBeforeCancel.email,
                        subject: `Pembatalan Booking - ${bookingBeforeCancel.bookingCode} | VENUE UNDIP`,
                        html: emailHtml,
                    })
                } catch (emailError) {
                    console.error('Failed to send cancellation email:', emailError)
                }
                return updated
            }
            return prisma.booking.update({
                where: { bookingCode },
                data: {
                    status,
                },
                include: {
                    details: true,
                },
            })
        },
        updatePaymentStatus: async (_: unknown, args: UpdatePaymentArgs, { prisma, admin }: ResolverContext) => {
            requireAuth(admin)
            const validate = await updatePaymenStatusSchema.validate(args, { abortEarly: false })
            const { bookingCode, paymentStatus } = validate
            return prisma.booking.update({
                where: { bookingCode },
                data: {
                    paymentStatus,
                },
                include: {
                    details: true,
                },
            })
        },
    },
}
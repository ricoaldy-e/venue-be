import type { PrismaClient, Status } from "@prisma/client"
import { requireAuth } from "../../lib/context.js"
import {
  stadionCreateSchema,
  stadionUpdateSchema,
  stadionDeleteSchema,
} from "./validators/stadionSchema.js"

type ID = number | string
interface StadionArgs { stadionId: ID }
interface CreateStadionArgs { name: string; description?: string; mapUrl: string; status?: Status; facilityIds?: number[]; images?: { imageUrl: string }[] }
interface UpdateStadionArgs extends CreateStadionArgs { stadionId: ID }
interface DeleteStadionArgs { stadionId: ID }

type ResolverContext = {
  prisma: PrismaClient
  admin: { adminId: number; email: string | null; name: string } | null
}

export const stadionResolvers = {
  Query: {
    stadions: async (_: unknown, __: unknown, { prisma }: ResolverContext) => {
      return prisma.stadion.findMany({
        where: { deletedAt: null },
        include: {
          fields: { where: { deletedAt: null } },
          facilities: { include: { Facility: true } },
          images: true,
        },
      })
    },
    stadion: async (_: unknown, { stadionId }: StadionArgs, { prisma }: ResolverContext) => {
      return prisma.stadion.findFirst({
        where: { id: Number(stadionId), deletedAt: null },
        include: {
          fields: { where: { deletedAt: null }, include: { images: true } },
          facilities: { include: { Facility: true } },
          images: true,
        },
      })
    },
  },

  Mutation: {
    createStadion: async (_: unknown, args: CreateStadionArgs, { prisma, admin }: ResolverContext) => {
      requireAuth(admin)
      const validated = await stadionCreateSchema.validate(args, { abortEarly: false })
      const { name, description, mapUrl, status, facilityIds, images } = validated

      return prisma.stadion.create({
        data: {
          name, description, mapUrl, status,
          facilities: {
            create: (facilityIds || []).map((facId) => ({
              Facility: { connect: { id: Number(facId) } },
            }))
          },
          images: images ? { create: images.map((img) => ({ imageUrl: img.imageUrl })) } : undefined,
        },
        include: { fields: true, facilities: { include: { Facility: true } }, images: true },
      })
    },

    updateStadion: async (_: unknown, args: UpdateStadionArgs, { prisma, admin }: ResolverContext) => {
      requireAuth(admin)
      const validated = await stadionUpdateSchema.validate(args, { abortEarly: false })
      const { stadionId, name, description, mapUrl, status, facilityIds, images } = validated
      const id = Number(stadionId)
      const existing = await prisma.stadion.findFirst({ where: { id, deletedAt: null } })
      if (!existing) throw new Error("Stadion tidak ditemukan atau sudah dihapus.")

      return prisma.$transaction(async (tx) => {
        await tx.stadionFacility.deleteMany({ where: { stadionId: id } })
        if (images) await tx.imageStadion.deleteMany({ where: { stadionId: id } })

        const updated = await tx.stadion.update({
          where: { id },
          data: {
            name, description, mapUrl, status,
            facilities: {
              create: (facilityIds || []).map((facId) => ({
                Facility: { connect: { id: Number(facId) } },
              }))
            },
            images: images ? { create: images.map((img) => ({ imageUrl: img.imageUrl })) } : undefined,
          },
          include: { fields: true, facilities: { include: { Facility: true } }, images: true },
        })
        if (status === "INACTIVE") {
          await tx.field.updateMany({
            where: { stadionId: id, deletedAt: null },
            data: { status: "INACTIVE" },
          })
        }
        return updated
      })
    },

    deleteStadion: async (_: unknown, args: DeleteStadionArgs, { prisma, admin }: ResolverContext) => {
      requireAuth(admin)
      const validated = await stadionDeleteSchema.validate(args, { abortEarly: false })
      const id = Number(validated.stadionId)
      return prisma.$transaction(async (tx) => {
        const now = new Date()
        await tx.field.updateMany({
          where: { stadionId: id },
          data: {
            deletedAt: now,
            status: "INACTIVE"
          }
        })
        return tx.stadion.update({
          where: { id },
          data: {
            deletedAt: now,
            status: "INACTIVE"
          },
          include: { fields: true, facilities: true, images: true },
        })
      })
    },
  },
}

export const stadionFieldResolvers = {
  bookingCount: async (parent: any, _: unknown, { prisma }: ResolverContext) => {
    return prisma.booking.count({
      where: {
        status: 'APPROVED',
        details: {
          some: {
            Field: {
              stadionId: parent.id,
              status: 'ACTIVE',
              deletedAt: null
            }
          }
        }
      }
    })
  },
  operatingHours: async (_: unknown, __: unknown, { prisma }: ResolverContext) => {
    return prisma.operatingHour.findUnique({ where: { id: 1 } })
  },
}

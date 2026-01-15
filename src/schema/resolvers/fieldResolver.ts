import type { PrismaClient, Status } from "@prisma/client"
import { requireAuth } from "../../lib/context.js"
import {
  fieldCreateSchema, fieldUpdateSchema, fieldDeleteSchema,
} from "./validators/fieldSchema.js"

type ID = number | string
interface CreateFieldArgs { stadionId: number; name: string; description?: string; pricePerHour?: number; images?: {imageUrl: string}[]; status?: Status }
interface UpdateFieldArgs extends CreateFieldArgs { fieldId: ID }
interface DeleteFieldArgs { fieldId: ID }
interface FieldsArgs { stadionId?: ID }
interface FieldArgs { fieldId: ID }

type ResolverContext = {
  prisma: PrismaClient
  admin: { adminId: number; email: string | null; name: string } | null
}

export const fieldResolvers = {
  Query: {
    fields: async (_: unknown, args: FieldsArgs, { prisma }: ResolverContext) => {
      return prisma.field.findMany({
        where: { 
          ...(args.stadionId ? { stadionId: Number(args.stadionId) } : {}),
          deletedAt: null 
        },
        include: { images: true, bookingDetails: true, Stadion: true },
      })
    },
    field: async (_: unknown, { fieldId }: FieldArgs, { prisma }: ResolverContext) => {
      return prisma.field.findFirst({
        where: { id: Number(fieldId), deletedAt: null },
        include: { images: true, bookingDetails: true, Stadion: true },
      })
    },
  },

  Mutation: {
    createField: async (_: unknown, args: CreateFieldArgs, { prisma, admin }: ResolverContext) => {
      requireAuth(admin)
      const validated = await fieldCreateSchema.validate(args, { abortEarly: false })
      const { stadionId, name, description, pricePerHour, images, status } = validated
      
      const parentStadion = await prisma.stadion.findUnique({
        where: { id: Number(stadionId) },
        select: { status: true, deletedAt: true },
      })

      if (!parentStadion) throw new Error('Stadion induk tidak ditemukan.')
      if (parentStadion.deletedAt) throw new Error('Stadion induk sudah dihapus. Operasi ditolak.')
      if (parentStadion.status === 'INACTIVE' && status === 'ACTIVE') throw new Error('Stadion induk Non-Aktif.')

      return prisma.field.create({
        data: {
          stadionId: Number(stadionId),
          name, description: description ?? null, pricePerHour: pricePerHour ?? 0,
          status: status ?? 'ACTIVE',
          images: images ? { create: images.map((img) => ({ imageUrl: img.imageUrl })) } : undefined,
        },
        include: { images: true, bookingDetails: true },
      })
    },

    updateField: async (_: unknown, args: UpdateFieldArgs, { prisma, admin }: ResolverContext) => {
      requireAuth(admin)
      const validated = await fieldUpdateSchema.validate(args, { abortEarly: false })
      const { fieldId, stadionId, name, description, pricePerHour, images, status } = validated

      const existing = await prisma.field.findFirst({ where: { id: Number(fieldId), deletedAt: null } })
      if(!existing) throw new Error("Lapangan tidak ditemukan atau sudah dihapus.")

      if (status === "ACTIVE") {
        const parent = await prisma.stadion.findUnique({ where: { id: Number(stadionId) }, select: { status: true, deletedAt: true } })
        if (parent?.deletedAt) throw new Error("Stadion induk sudah dihapus.")
        if (parent?.status === "INACTIVE") throw new Error("Stadion induk Non-Aktif.")
      }

      return prisma.$transaction(async (tx) => {
        if (images) await tx.imageField.deleteMany({ where: { fieldId: Number(fieldId) } })
        
        const updateData: any = {
          stadionId, 
          name, 
          description, 
          status: status || undefined,
          images: images ? { create: images.map((img) => ({ imageUrl: img.imageUrl })) } : undefined,
        }
        
        if (pricePerHour !== undefined) {
          updateData.pricePerHour = pricePerHour ?? 0
        }
        
        return tx.field.update({
          where: { id: Number(fieldId) },
          data: updateData,
          include: { images: true, bookingDetails: true },
        })
      })
    },
    
    deleteField: async (_: unknown, args: DeleteFieldArgs, { prisma, admin }: ResolverContext) => {
      requireAuth(admin)
      const validated = await fieldDeleteSchema.validate(args, { abortEarly: false })

      return prisma.field.update({
        where: { id: Number(validated.fieldId) },
        data: { 
            deletedAt: new Date(),
            status: "INACTIVE"
        },
        include: { images: true, bookingDetails: true },
      })
    },
  },
}
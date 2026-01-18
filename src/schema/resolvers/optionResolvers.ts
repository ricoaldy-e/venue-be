import type { PrismaClient } from "@prisma/client";
import { requireAuth } from "../../lib/context.js";
import { optionSchema } from "./validators/optionSchema.js";

type ResolverContext = {
  prisma: PrismaClient
  admin: {
    adminId: number
    email: string | null
    name: string
  } | null
}

export const optionResolvers = {
  Query: {
    options: async(_: unknown, __:unknown, {prisma}: ResolverContext) => {
      return prisma.option.findUnique({where: {id: 1}})
    }
  },

  Mutation: {
    createOption: async(
      _: unknown, 
      args: {name: string, description: string, email: string, nohp: string, address: string, unitName: string, unitDesc: string }, 
      {prisma, admin}: ResolverContext
    ) => {
      requireAuth(admin)
      const validated = await optionSchema.validate(args, {abortEarly: false})
      return prisma.option.create({
        data: {
          name: validated.name,
          description: validated.description,
          unitName: validated.unitName,
          unitDesc: validated.unitDesc,
          email: validated.email,
          nohp: validated.nohp,
          address: validated.address
        }
      })
    },

    updateOption: async(
      _: unknown,
      args: {name: string, description: string, email: string, nohp: string, address: string},
      {prisma, admin} : ResolverContext
    ) => {
      requireAuth(admin)
      const validated = await optionSchema.validate(args, {abortEarly: false})
      return prisma.option.upsert({
        where: {id: 1},
        create: {
          name: validated.name,
          description: validated.description,
          unitName: validated.unitName,
          unitDesc: validated.unitDesc,
          email: validated.email,
          nohp: validated.nohp,
          address: validated.address
        },
        update: {
          name: validated.name,
          description: validated.description,
          unitName: validated.unitName,
          unitDesc: validated.unitDesc,
          email: validated.email,
          nohp: validated.nohp,
          address: validated.address
        }
      })
    }
  }
} 
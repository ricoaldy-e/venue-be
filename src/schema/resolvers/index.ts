import type { PrismaClient } from "@prisma/client"
import { DateTimeResolver } from "graphql-scalars"
import { GraphQLError } from "graphql"
import { generateToken, verifyPassword } from "../../lib/auth.js"
import { requireAuth } from "../../lib/context.js"
import { stadionResolvers, stadionFieldResolvers } from "./stadionResolver.js"
import { fieldResolvers } from "./fieldResolver.js"
import { bookingResolvers } from "./bookingResolver.js"
import { operatingHourResolvers } from "./operatingHourResolver.js"
import { fieldImageResolvers, stadionImageResolvers } from "./uploadToMinioResolver.js"
import { facilityResolvers } from "./facilityResolver.js"
import { dashboardResolvers } from "./dashboardResolvers.js"
import { verifyTurnstileToken } from "../../lib/verifyTurnstileToken.js"

type ResolverContext = {
  prisma: PrismaClient
  admin: {
    adminId: number
    email: string | null
    name: string
  } | null
}

const resolvers = {
  Query: {
    ...stadionResolvers.Query,
    ...fieldResolvers.Query,
    ...bookingResolvers.Query,
    ...operatingHourResolvers.Query,
    ...facilityResolvers.Query,
    ...dashboardResolvers.Query,
    me: async (_: unknown, __: unknown, { prisma, admin }: ResolverContext) => {
      const currentAdmin = requireAuth(admin)

      return prisma.admin.findUnique({
        where: { id: currentAdmin.adminId },
      })
    },
  },
  Mutation: {
    ...stadionResolvers.Mutation,
    ...fieldResolvers.Mutation,
    ...bookingResolvers.Mutation,
    ...operatingHourResolvers.Mutation,
    ...stadionImageResolvers.Mutation,
    ...fieldImageResolvers.Mutation,
    ...facilityResolvers.Mutation,
    login: async (_: unknown, { email, password, turnstile }: { email: string; password: string, turnstile: string }, { prisma }: ResolverContext) => {
      const result = await verifyTurnstileToken(turnstile)
      if (!result.success) {
        throw new GraphQLError("Invalid turnstile token", {
          extensions: {code: "UNAUTHENTICATED"}
        })
      }

      const admin = await prisma.admin.findUnique({
        where: { email },
      })

      if (!admin) {
        throw new GraphQLError("Invalid email or password", {
          extensions: { code: "UNAUTHENTICATED" },
        })
      }

      const isValidPassword = await verifyPassword(password, admin.password)

      if (!isValidPassword) {
        throw new GraphQLError("Invalid email or password", {
          extensions: { code: "UNAUTHENTICATED" },
        })
      }

      const token = generateToken({
        adminId: admin.id,
        email: admin.email ?? null,
        name: admin.name,
      })

      const { password: _password, ...safeAdmin } = admin

      return {
        token,
        admin: safeAdmin,
      }
    },
    logout: async (_: unknown, __: unknown, { prisma, admin }: ResolverContext) => {
      const currentAdmin = requireAuth(admin)

      await prisma.adminLog.create({
        data: {
          adminId: currentAdmin.adminId,
          action: "LOGOUT",
          targetTable: null,
          targetId: null,
          description: null,
        },
      })

      return true
    },
  },
  DateTime: DateTimeResolver,
  Stadion: stadionFieldResolvers,
}

export default resolvers

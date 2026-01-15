import type { Request } from "express"
import { GraphQLError } from "graphql"
import { prisma } from "./prisma.js"
import { extractTokenFromHeader, verifyToken, JWTPayload } from "./auth.js"

export interface GraphQLContext {
  prisma: typeof prisma
  admin: JWTPayload | null
}

export function buildContext(req: Request): GraphQLContext {
  const token = extractTokenFromHeader(req.headers.authorization)

  if (!token) {
    return { prisma, admin: null }
  }

  try {
    const admin = verifyToken(token)
    return {
      prisma,
      admin,
    }
  } catch (error) {
    return {
      prisma,
      admin: null,
    }
  }
}

export function requireAuth(admin: JWTPayload | null): JWTPayload {
  if (!admin) {
    throw new GraphQLError("Not authenticated", {
      extensions: { code: "UNAUTHENTICATED" },
    })
  }

  return admin
}
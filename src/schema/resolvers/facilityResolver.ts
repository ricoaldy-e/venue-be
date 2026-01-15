import type { PrismaClient } from "@prisma/client";
import { requireAuth } from "../../lib/context.js";
import {
  facilityCreateSchema,
  facilityUpdateSchema,
  facilityDeleteSchema,
} from "./validators/facilitySchema.js";

type ID = number | string;

interface FacilityArgs {
  facilityId: ID;
}

interface CreateFacilityArgs {
  name: string;
  icon?: string;
}

interface UpdateFacilityArgs extends CreateFacilityArgs {
  facilityId: ID;
}

interface DeleteFacilityArgs {
  facilityId: ID;
}

type ResolverContext = {
  prisma: PrismaClient;
  admin: {
    adminId: number;
    email: string | null;
    name: string;
  } | null;
};

export const facilityResolvers = {
  Query: {
    facility: async (
      _: unknown,
      { facilityId }: FacilityArgs,
      { prisma }: ResolverContext
    ) => {
      return prisma.facility.findUnique({
        where: { id: Number(facilityId) },
      });
    },

    facilities: async (
      _: unknown,
      __: unknown,
      { prisma }: ResolverContext
    ) => {
      return prisma.facility.findMany();
    },
  },

  Mutation: {
    createFacility: async (
      _: unknown,
      args: CreateFacilityArgs,
      { prisma, admin }: ResolverContext
    ) => {
      requireAuth(admin);
      const validated = await facilityCreateSchema.validate(args, {
        abortEarly: false,
      });

      return prisma.facility.create({
        data: {
          name: validated.name!,
          ...(('icon' in validated && (validated as any).icon != null)
            ? { icon: (validated as any).icon }
            : {}),
        },
      });
    },

    updateFacility: async (
      _: unknown,
      args: UpdateFacilityArgs,
      { prisma, admin }: ResolverContext
    ) => {
      requireAuth(admin);
      const validated = await facilityUpdateSchema.validate(args, {
        abortEarly: false,
      });

      return prisma.facility.update({
        where: { id: Number(validated.facilityId) },
        data: {
          name: validated.name!,
          ...(('icon' in validated && (validated as any).icon != null)
            ? { icon: (validated as any).icon }
            : {}),
        },
      });
    },

    deleteFacility: async (
      _: unknown,
      args: DeleteFacilityArgs,
      { prisma, admin }: ResolverContext
    ) => {
      requireAuth(admin);
      const validated = await facilityDeleteSchema.validate(args, {
        abortEarly: false,
      });
      const id = Number(validated.facilityId);

      return prisma.$transaction(async (tx) => {
        await tx.stadionFacility.deleteMany({
          where: { facilityId: id },
        });

        return tx.facility.delete({
          where: { id },
        });
      });
    },
  },
};
import { PrismaClient } from "@prisma/client";
import GraphQLUpload, { FileUpload } from "graphql-upload/GraphQLUpload.mjs";
import { requireAuth } from "../../lib/context.js";
import { uploadToMinio } from "../../lib/uploadToMinio.js";
import { BUCKET, minioClient, PUBLIC_URL } from "../../lib/minioClient.js";

type ResolverContext = {
  prisma: PrismaClient;
  admin: {
    adminId: number;
    email: string | null;
    name: string;
  } | null;
};

async function handleImageUpload(
  files: any[],
  folder: string,
  prismaCreateMany: (data: { imageUrl: string; parentId: number }[]) => Promise<any>,
  parentId: number
) {
  const resolvedFiles = await Promise.all(files.map((f) => f.promise));

  const uploadedImages: string[] = [];
  for (const file of resolvedFiles) {
    const { publicUrl } = await uploadToMinio(file, folder);
    uploadedImages.push(publicUrl);
  }

  await prismaCreateMany(
    uploadedImages.map((url) => ({
      imageUrl: url,
      parentId,
    }))
  );

  return {
    count: uploadedImages.length,
    imageUrls: uploadedImages,
  };
}

export const stadionImageResolvers = {
  Upload: GraphQLUpload,

  Mutation: {
    uploadStadionImages: async (
      _: unknown,
      { stadionId, files }: { stadionId: number; files: FileUpload[] },
      { prisma, admin }: ResolverContext
    ) => {
      requireAuth(admin);

      const stadion = await prisma.stadion.findUnique({ where: { id: stadionId } });
      if (!stadion) throw new Error("Stadion tidak ditemukan");

      const result = await handleImageUpload(
        files,
        "stadion-images",
        async (data) =>
          prisma.imageStadion.createMany({
            data: data.map((d) => ({
              imageUrl: d.imageUrl,
              stadionId: d.parentId,
            })),
          }),
        stadionId
      );

      return result;
    },
    deleteStadionImage: async (_: unknown, { imageId }: { imageId: number }, { prisma, admin }: ResolverContext) => {
      requireAuth(admin);

      const img = await prisma.imageStadion.findUnique({ where: { id: Number(imageId) } });
      if (!img) throw new Error('Image tidak ditemukan');

      try {
        const prefix = `https://${PUBLIC_URL}/${BUCKET}/`;
        let objectName = img.imageUrl;
        if (objectName.startsWith(prefix)) {
          objectName = objectName.slice(prefix.length);
        } else {
          // fallback: try to extract after bucket name
          const bucketMarker = `/${BUCKET}/`;
          const idx = img.imageUrl.indexOf(bucketMarker);
          if (idx !== -1) {
            objectName = img.imageUrl.slice(idx + bucketMarker.length);
          }
        }

        if (objectName) {
          // best-effort remove from MinIO
          // @ts-ignore
          await minioClient.removeObject(BUCKET, objectName);
        }
      } catch (e) {
        const emsg = (e as any)?.message ?? String(e);
        console.warn('Failed to delete MinIO object for image', imageId, emsg);
      }

      const deleted = await prisma.imageStadion.delete({ where: { id: Number(imageId) } });
      return deleted;
    },
  },
};

export const fieldImageResolvers = {
  Upload: GraphQLUpload,

  Mutation: {
    uploadFieldImages: async (
      _: unknown,
      { fieldId, files }: { fieldId: number; files: FileUpload[] },
      { prisma, admin }: ResolverContext
    ) => {
      requireAuth(admin);

      const field = await prisma.field.findUnique({ where: { id: fieldId } });
      if (!field) throw new Error("Field tidak ditemukan");

      const result = await handleImageUpload(
        files,
        "field-images",
        async (data) =>
          prisma.imageField.createMany({
            data: data.map((d) => ({
              imageUrl: d.imageUrl,
              fieldId: d.parentId,
            })),
          }),
        fieldId
      );

      return result;
    },

    deleteFieldImage: async (_: unknown, { imageId }: { imageId: number }, { prisma, admin }: ResolverContext) => {
      requireAuth(admin);

      const img = await prisma.imageField.findUnique({ where: { id: Number(imageId) } });
      if (!img) throw new Error('Image tidak ditemukan');

      try {
        const prefix = `https://${PUBLIC_URL}/${BUCKET}/`;
        let objectName = img.imageUrl;
        if (objectName.startsWith(prefix)) {
          objectName = objectName.slice(prefix.length);
        } else {
          const bucketMarker = `/${BUCKET}/`;
          const idx = img.imageUrl.indexOf(bucketMarker);
          if (idx !== -1) {
            objectName = img.imageUrl.slice(idx + bucketMarker.length);
          }
        }

        if (objectName) {
          // best-effort remove from MinIO
          // @ts-ignore
          await minioClient.removeObject(BUCKET, objectName);
        }
      } catch (e) {
        const emsg = (e as any)?.message ?? String(e);
        console.warn('Failed to delete MinIO object for image', imageId, emsg);
      }

      const deleted = await prisma.imageField.delete({ where: { id: Number(imageId) } });
      return deleted;
    },
  },
};

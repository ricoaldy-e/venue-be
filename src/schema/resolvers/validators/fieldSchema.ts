import * as yup from "yup";
import { Status } from "@prisma/client";

const statusValues = Object.values(Status);

const imageSchema = yup
  .object({
    imageUrl: yup
      .string()
      .trim()
      .url("URL gambar harus valid")
      .matches(/^https?:\/\//i, "URL gambar harus dimulai dengan http atau https")
      .required("URL gambar wajib diisi"),
  })
  .strict(true);

export const fieldCreateSchema = yup
  .object({
    stadionId: yup
      .number()
      .typeError("stadionId harus berupa angka")
      .integer("stadionId harus bilangan bulat")
      .positive("stadionId harus lebih besar dari 0")
      .required("stadionId wajib diisi"),
    name: yup
      .string()
      .trim()
      .min(3, "Nama lapangan minimal 3 karakter")
      .max(100, "Nama lapangan maksimal 100 karakter")
      .required("Nama lapangan wajib diisi"),
    description: yup
      .string()
      .trim()
      .max(1000, "Deskripsi maksimal 1000 karakter")
      .optional(),
    pricePerHour: yup
      .number()
      .typeError("Harga per jam harus berupa angka")
      .integer("Harga per jam harus bilangan bulat")
      .min(0, "Harga tidak boleh negatif")
      .max(5000000, "Harga per jam terlalu besar")
      .default(0),
    images: yup
      .array()
      .of(imageSchema)
      .max(10, "Maksimal 10 gambar")
      .optional()
      .nullable(),
    status: yup
      .mixed<Status>()
      .oneOf(statusValues, `Status tidak valid. Pilihan: ${statusValues.join(", ")}`)
      .optional()
      .nullable(),
  })
  .strict(true);

export const fieldUpdateSchema = fieldCreateSchema.shape({
  fieldId: yup
    .string()
    .trim()
    .matches(/^\d+$/, "fieldId harus berupa angka")
    .required("fieldId wajib diisi"),
});

export const fieldDeleteSchema = yup.object({
  fieldId: yup
    .string()
    .trim()
    .matches(/^\d+$/, "fieldId harus berupa string angka")
    .required("fieldId wajib diisi"),
})
.strict(true);
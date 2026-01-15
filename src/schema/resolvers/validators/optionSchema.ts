import * as yup from 'yup'
export const optionSchema = yup.object({
    name: yup.string().required('Nama wajib diisi'),
    description: yup.string().required('Deskripsi wajib diisi'),
    email: yup.string().required('Email wajib diisi'),
    nohp: yup.string().required('Nomor HP wajib diisi'),
    address: yup.string().required('Alamat wajib diisi'),
})
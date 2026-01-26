import * as yup from 'yup'
export const optionSchema = yup.object({
    name: yup.string().required('Nama wajib diisi').min(2, 'Nama minimal 2 karakter').max(30, 'Nama maksimal 30 karakter'),
    nameKet: yup.string().required('Keterangan nama wajib diisi').min(10, 'Keterangan nama minimal 10 karakter').max(70, 'Keterangan nama maksimal 70 karakter'),
    description: yup.string().required('Deskripsi wajib diisi').min(20, 'Deskripsi minimal 20 karakter').max(300, 'Deskripsi maksimal 300 karakter'),
    unitName: yup.string().required('Nama unit wajib diisi').min(5, 'Nama unit minimal 5 karakter').max(70, 'Nama unit maksimal 70 karakter'),
    unitDesc: yup.string().required('Deskripsi unit wajib diisi').min(20, 'Deskripsi unit minimal 20 karakter').max(300, 'Deskripsi unit maksimal 300 karakter'),
    email: yup.string().required('Email wajib diisi').min(5, 'Email minimal 5 karakter').max(100, 'Email maksimal 100 karakter'),
    nohp: yup.string().required('Nomor HP wajib diisi').matches(/^(\+62|62)[\d\s]+$/, 'Nomor HP harus diawali dengan 62 atau +62 (tidak boleh diawali dengan 0) dan boleh menggunakan spasi').min(10, 'Nomor HP minimal 10 karakter').max(25, 'Nomor HP maksimal 20 karakter'),
    address: yup.string().required('Alamat wajib diisi').min(20, 'Alamat minimal 20 karakter').max(200, 'Alamat maksimal 200 karakter'),
})
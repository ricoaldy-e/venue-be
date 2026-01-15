import * as yup from 'yup'

export const optionSchema = yup.object({
    name: yup.string().required(),
    description: yup.string().required(),
    email: yup.string().email('Pastikan email valid').required(),
    nohp: yup.string().min(9).max(16).required(),
    address: yup.string().required(),
})
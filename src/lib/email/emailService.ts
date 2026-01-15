import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

let transporter: Transporter | null = null

export const initializeEmailService = () => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('⚠️ Email configuration missing. Email service disabled.')
    return null
  }

  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  })

  console.log('✅ Email service initialized')
  return transporter
}

export const getEmailTransporter = (): Transporter | null => {
  if (!transporter) {
    return initializeEmailService()
  }
  return transporter
}

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export const sendEmail = async (options: SendEmailOptions): Promise<boolean> => {
  const emailTransporter = getEmailTransporter()
  
  if (!emailTransporter) {
    console.error('❌ Email service not configured. Cannot send email.')
    return false
  }

  try {
    const info = await emailTransporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'VENUE UNDIP'}" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    })

    console.log('✅ Email sent successfully:', info.messageId)
    return true
  } catch (error) {
    console.error('❌ Failed to send email:', error)
    return false
  }
}

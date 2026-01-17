import cron from 'node-cron'
import { prisma } from '../lib/prisma.js'
import dayjs from 'dayjs'
import 'dayjs/locale/id'
import timezone from 'dayjs/plugin/timezone.js'
import utc from 'dayjs/plugin/utc.js'
import { sendEmail } from '../lib/email/emailService.js'
import { generateBookingReminderEmail } from '../lib/email/templates/bookingReminder.js'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale('id')

export const initializeBookingReminderScheduler = () => {

  const cronSchedule = '0 10 * * *'

  cron.schedule(cronSchedule, async () => {


    try {
      const tomorrow = dayjs().tz('Asia/Jakarta').add(1, 'day').startOf('day')
      const tomorrowStart = tomorrow.toDate()
      const tomorrowEnd = tomorrow.endOf('day').toDate()



      const bookingsForTomorrow = await prisma.booking.findMany({
        where: {
          status: 'APPROVED',
          details: {
            some: {
              bookingDate: {
                gte: tomorrowStart,
                lte: tomorrowEnd,
              }
            }
          }
        },
        include: {
          details: {
            where: {
              bookingDate: {
                gte: tomorrowStart,
                lte: tomorrowEnd,
              }
            },
            include: {
              Field: {
                include: {
                  Stadion: true
                }
              }
            }
          }
        }
      })



      if (bookingsForTomorrow.length === 0) {
        return
      }

      const option = await prisma.option.findFirst({ where: { id: 1 } })
      const contactEmail = option?.email ?? 'helpdesk@live.undip.ac.id'
      const contactPhone = option?.nohp ?? '+62 851-6566-0339'

      let successCount = 0
      let failCount = 0

      for (const booking of bookingsForTomorrow) {
        try {
          const emailHtml = generateBookingReminderEmail({
            bookingCode: booking.bookingCode,
            name: booking.name,
            email: booking.email,
            contact: booking.contact,
            institution: booking.institution || undefined,
            renterType: booking.renterType,
            totalPrice: booking.totalPrice,
            paymentStatus: booking.paymentStatus,
            details: booking.details,
            contactEmail,
            contactPhone,
          })

          const sent = await sendEmail({
            to: booking.email,
            subject: `🔔 Pengingat: Booking Besok - ${booking.bookingCode} | VENUE UNDIP`,
            html: emailHtml,
          })

          if (sent) {
            successCount++
          } else {
            failCount++
          }

          await new Promise(resolve => setTimeout(resolve, 1000))

        } catch (error) {
          failCount++
        }
      }



    } catch (error) {
    }
  }, {
    timezone: 'Asia/Jakarta'
  })


}

export const testBookingReminderScheduler = async () => {

  try {
    const tomorrow = dayjs().tz('Asia/Jakarta').add(1, 'day').startOf('day')
    const tomorrowStart = tomorrow.toDate()
    const tomorrowEnd = tomorrow.endOf('day').toDate()



    const bookingsForTomorrow = await prisma.booking.findMany({
      where: {
        status: 'APPROVED',
        details: {
          some: {
            bookingDate: {
              gte: tomorrowStart,
              lte: tomorrowEnd,
            }
          }
        }
      },
      include: {
        details: {
          where: {
            bookingDate: {
              gte: tomorrowStart,
              lte: tomorrowEnd,
            }
          },
          include: {
            Field: {
              include: {
                Stadion: true
              }
            }
          }
        }
      }
    })



    if (bookingsForTomorrow.length === 0) {
      return
    }

    const option = await prisma.option.findFirst({ where: { id: 1 } })
    const contactEmail = option?.email ?? 'helpdesk@live.undip.ac.id'
    const contactPhone = option?.nohp ?? '+62 851-6566-0339'

    for (const booking of bookingsForTomorrow) {
      const emailHtml = generateBookingReminderEmail({
        bookingCode: booking.bookingCode,
        name: booking.name,
        email: booking.email,
        contact: booking.contact,
        institution: booking.institution || undefined,
        renterType: booking.renterType,
        totalPrice: booking.totalPrice,
        paymentStatus: booking.paymentStatus,
        details: booking.details,
        contactEmail,
        contactPhone,
      })

      const sent = await sendEmail({
        to: booking.email,
        subject: `🧪 TEST - Pengingat: Booking Besok - ${booking.bookingCode} | VENUE UNDIP`,
        html: emailHtml,
      })

    }

  } catch (error) {
  }
}

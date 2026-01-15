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
    console.log(`[${dayjs().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss')}] 🔔 Running booking reminder scheduler...`)
    
    try {
      const tomorrow = dayjs().tz('Asia/Jakarta').add(1, 'day').startOf('day')
      const tomorrowStart = tomorrow.toDate()
      const tomorrowEnd = tomorrow.endOf('day').toDate()
      
      console.log(`📅 Checking bookings for: ${tomorrow.format('YYYY-MM-DD')}`)
      
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
      
      console.log(`📊 Found ${bookingsForTomorrow.length} bookings for tomorrow`)
      
      if (bookingsForTomorrow.length === 0) {
        console.log('✅ No bookings to remind for tomorrow')
        return
      }
      
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
            isAcademic: booking.isAcademic,
            totalPrice: booking.totalPrice,
            paymentStatus: booking.paymentStatus,
            details: booking.details,
          })
          
          const sent = await sendEmail({
            to: booking.email,
            subject: `🔔 Pengingat: Booking Besok - ${booking.bookingCode} | VENUE UNDIP`,
            html: emailHtml,
          })
          
          if (sent) {
            successCount++
            console.log(`✅ Reminder sent to: ${booking.email} (${booking.bookingCode})`)
          } else {
            failCount++
            console.error(`❌ Failed to send reminder to: ${booking.email} (${booking.bookingCode})`)
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000))
          
        } catch (error) {
          failCount++
          console.error(`❌ Error sending reminder for ${booking.bookingCode}:`, error)
        }
      }
      
      console.log(`📊 Reminder Summary: ${successCount} sent, ${failCount} failed`)
      console.log(`✅ Booking reminder scheduler completed`)
      
    } catch (error) {
      console.error('❌ Error in booking reminder scheduler:', error)
    }
  }, {
    timezone: 'Asia/Jakarta'
  })
  
  console.log('✅ Booking reminder scheduler initialized (10:00 WIB daily)')
}

export const testBookingReminderScheduler = async () => {
  console.log('🧪 Testing booking reminder scheduler manually...')
  
  try {
    const tomorrow = dayjs().tz('Asia/Jakarta').add(1, 'day').startOf('day')
    const tomorrowStart = tomorrow.toDate()
    const tomorrowEnd = tomorrow.endOf('day').toDate()
    
    console.log(`📅 Checking bookings for: ${tomorrow.format('YYYY-MM-DD')}`)
    
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
    
    console.log(`📊 Found ${bookingsForTomorrow.length} bookings for testing`)
    
    if (bookingsForTomorrow.length === 0) {
      console.log('ℹ️ No bookings found for tomorrow. Create a booking for tomorrow to test.')
      return
    }
    
    for (const booking of bookingsForTomorrow) {
      const emailHtml = generateBookingReminderEmail({
        bookingCode: booking.bookingCode,
        name: booking.name,
        email: booking.email,
        contact: booking.contact,
        institution: booking.institution || undefined,
        isAcademic: booking.isAcademic,
        totalPrice: booking.totalPrice,
        paymentStatus: booking.paymentStatus,
        details: booking.details,
      })
      
      const sent = await sendEmail({
        to: booking.email,
        subject: `🧪 TEST - Pengingat: Booking Besok - ${booking.bookingCode} | VENUE UNDIP`,
        html: emailHtml,
      })
      
      console.log(`${sent ? '✅' : '❌'} Test reminder for ${booking.bookingCode}: ${sent ? 'SUCCESS' : 'FAILED'}`)
    }
    
  } catch (error) {
    console.error('❌ Error testing scheduler:', error)
  }
}

import dayjs from 'dayjs'
import 'dayjs/locale/id'

dayjs.locale('id')

interface BookingDetail {
  fieldId: number
  bookingDate: Date | string
  startHour: number
  pricePerHour: number
  subtotal: number
  Field?: {
    name: string
    Stadion?: {
      name: string
      mapUrl: string
    }
  }
}

interface BookingConfirmationData {
  bookingCode: string
  name: string
  email: string
  contact: string
  institution?: string
  isAcademic: boolean
  totalPrice: number
  details: BookingDetail[]
}

export const generateBookingConfirmationEmail = (booking: BookingConfirmationData): string => {
  const detailsByDate = booking.details.reduce((acc, detail) => {
    const dateKey = dayjs(detail.bookingDate).format('YYYY-MM-DD')
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(detail)
    return acc
  }, {} as Record<string, typeof booking.details>)

  const firstDetail = booking.details[0]
  const stadionName = firstDetail?.Field?.Stadion?.name || 'Stadion'
  const fieldName = firstDetail?.Field?.name || 'Lapangan'
  const mapUrl = firstDetail?.Field?.Stadion?.mapUrl || '#'

  const bookingDetailsHtml = Object.entries(detailsByDate).map(([dateKey, details]) => {
    const formattedDate = dayjs(dateKey).format('dddd, DD MMMM YYYY')
    const timeSlots = details
      .sort((a, b) => a.startHour - b.startHour)
      .map(d => `${String(d.startHour).padStart(2, '0')}:00-${String(d.startHour + 1).padStart(2, '0')}:00`)
      .join(', ')
    
    return `
      <tr>
        <td style="padding: 8px 0; color: #374151; font-size: 15px; line-height: 1.6;">
          <strong style="color: #1f2937;">${formattedDate}</strong><br>
          <span style="color: #6b7280;">${timeSlots}</span>
        </td>
      </tr>
    `
  }).join('')

  return `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Konfirmasi Booking - VENUE UNDIP</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; line-height: 1.6;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8fafc;">
        <tr>
            <td style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #1e40af; padding: 32px 32px 28px 32px; text-align: center;">
                            <h1 style="margin: 0 0 8px 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">Booking Berhasil Dikonfirmasi</h1>
                            <p style="margin: 0; color: #dbeafe; font-size: 14px; font-weight: 400;">VENUE UNDIP - Universitas Diponegoro</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 32px;">
                            
                            <p style="margin: 0 0 24px 0; font-size: 15px; color: #374151;">
                                Halo <strong style="color: #1f2937;">${booking.name}</strong>,
                            </p>
                            
                            <p style="margin: 0 0 32px 0; font-size: 15px; color: #6b7280; line-height: 1.6;">
                                Terima kasih telah melakukan booking. Booking Anda telah berhasil dikonfirmasi dengan detail sebagai berikut:
                            </p>
                            
                            <!-- Booking Code -->
                            <table role="presentation" style="width: 100%; margin-bottom: 32px;">
                                <tr>
                                    <td style="background-color: #f8fafc; border: 2px solid #e5e7eb; border-radius: 8px; padding: 24px; text-align: center;">
                                        <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Kode Booking</p>
                                        <p style="margin: 0; color: #1e40af; font-size: 28px; font-weight: 700; letter-spacing: 2px; font-family: 'Courier New', monospace;">${booking.bookingCode}</p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Booking Details -->
                            <table role="presentation" style="width: 100%; margin-bottom: 28px;">
                                <tr>
                                    <td style="padding-bottom: 16px; border-bottom: 2px solid #e5e7eb;">
                                        <h3 style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 600;">Detail Booking</h3>
                                    </td>
                                </tr>
                            </table>
                            
                            <table role="presentation" style="width: 100%; margin-bottom: 28px;">
                                <tr>
                                    <td style="padding: 12px 0; color: #6b7280; font-size: 14px; width: 35%; vertical-align: top;">Nama Pemesan</td>
                                    <td style="padding: 12px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${booking.name}</td>
                                </tr>
                                ${booking.isAcademic && booking.institution ? `
                                <tr>
                                    <td style="padding: 12px 0; border-top: 1px solid #f3f4f6; color: #6b7280; font-size: 14px; vertical-align: top;">Institusi</td>
                                    <td style="padding: 12px 0; border-top: 1px solid #f3f4f6; color: #1f2937; font-size: 14px; font-weight: 500;">${booking.institution}</td>
                                </tr>
                                ` : ''}
                                <tr>
                                    <td style="padding: 12px 0; border-top: 1px solid #f3f4f6; color: #6b7280; font-size: 14px; vertical-align: top;">Stadion</td>
                                    <td style="padding: 12px 0; border-top: 1px solid #f3f4f6; color: #1f2937; font-size: 14px; font-weight: 500;">${stadionName}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0; border-top: 1px solid #f3f4f6; color: #6b7280; font-size: 14px; vertical-align: top;">Lapangan</td>
                                    <td style="padding: 12px 0; border-top: 1px solid #f3f4f6; color: #1f2937; font-size: 14px; font-weight: 500;">${fieldName}</td>
                                </tr>
                            </table>
                            
                            <!-- Schedule -->
                            <table role="presentation" style="width: 100%; margin-bottom: 28px;">
                                <tr>
                                    <td style="padding-bottom: 12px;">
                                        <h4 style="margin: 0; color: #1f2937; font-size: 15px; font-weight: 600;">Jadwal Booking</h4>
                                    </td>
                                </tr>
                                ${bookingDetailsHtml}
                            </table>
                            
                            <!-- Important Info -->
                            <table role="presentation" style="width: 100%; margin-bottom: 28px;">
                                <tr>
                                    <td style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 4px;">
                                        <p style="margin: 0 0 12px 0; color: #78350f; font-size: 14px; font-weight: 600;">Hal Penting</p>
                                        <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px; line-height: 1.7;">
                                            <li style="margin-bottom: 6px;">Harap datang 15 menit sebelum waktu booking.</li>
                                            <li style="margin-bottom: 6px;">Tunjukkan kode booking kepada petugas.</li>
                                            <li style="margin-bottom: 6px;">Bawa kartu identitas yang valid.</li>
                                            ${!booking.isAcademic ? '<li>Lakukan pembayaran di tempat sebelum mulai</li>' : ''}
                                        </ul>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Location Button -->
                            <table role="presentation" style="width: 100%; margin-bottom: 28px;">
                                <tr>
                                    <td style="text-align: center;">
                                        <a href="${mapUrl}" style="display: inline-block; background-color: #1e40af; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">Lihat Lokasi</a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Contact -->
                            <table role="presentation" style="width: 100%;">
                                <tr>
                                    <td style="background-color: #f8fafc; padding: 20px; border-radius: 6px; text-align: center;">
                                        <p style="margin: 0 0 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">Butuh Bantuan?</p>
                                        <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                                            +62 851-6566-0339<br>
                                            helpdesk@live.undip.ac.id
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; color: #9ca3af; font-size: 13px; line-height: 1.5;">
                                Email otomatis dari sistem VENUE UNDIP<br>
                                © ${new Date().getFullYear()} Universitas Diponegoro
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `
}
import bcrypt from "bcrypt"
import { PrismaClient, Status } from "@prisma/client"

const prisma = new PrismaClient()

type StadionSeed = {
  name: string
  description: string
  mapUrl: string
  status?: Status
  facilityNames: string[]
  images: string[]
  fields: Array<{
    name: string
    description: string
    pricePerHour: number
    priceTendik: number
    status?: Status
    images: string[]
  }>
}

async function main() {
  console.log("🚀 Seeding database with demo data...")

  console.log("♻️ Clearing existing data...")
  await prisma.$transaction([
    prisma.adminLog.deleteMany(),
    prisma.bookingDetail.deleteMany(),
    prisma.booking.deleteMany(),
    prisma.imageField.deleteMany(),
    prisma.field.deleteMany(),
    prisma.imageStadion.deleteMany(),
    prisma.stadionFacility.deleteMany(),
    prisma.facility.deleteMany(),
    prisma.operatingHour.deleteMany(),
    prisma.admin.deleteMany(),
    prisma.stadion.deleteMany(),
  ])

  const defaultPassword = "admin123"
  const hashedPassword = await bcrypt.hash(defaultPassword, 10)

  const [admin, admin2] = await Promise.all([
    prisma.admin.create({
      data: {
        name: "Super Admin",
        email: "admin@dipsport.com",
        password: hashedPassword,
      },
    }),
    prisma.admin.create({
      data: {
        name: "Admin 2",
        email: "admin2@dipsport.com",
        password: hashedPassword,
      },
    }),
  ])

  console.log("👥 Admin accounts created:", [
    { id: admin.id, email: admin.email },
    { id: admin2.id, email: admin2.email },
  ])

  const facilitySeeds = [
    { name: "Parking Area", icon: "lucide:bike" },
    { name: "Locker Room", icon: "heroicons:lock-closed" },
    { name: "Rest Room", icon: "lucide:shower-head" },
    { name: "WiFi Gratis", icon: "heroicons:wifi" },
    { name: "Sound System", icon: "heroicons:speaker-wave" },
    { name: "Tribun / Kursi", icon: "lucide:armchair" },
  ]

  const facilities = await Promise.all(
    facilitySeeds.map((facility) =>
      prisma.facility.create({
        data: facility,
      })
    )
  )
  const facilityMap = new Map(facilities.map((facility) => [facility.name, facility.id]))

  const stadionSeeds: StadionSeed[] = [
    {
      name: "Stadion Gelora DipSport",
      description: "Indoor multi-sport arena dengan fasilitas lengkap untuk sepak bola dan atletik.",
      mapUrl: "https://goo.gl/maps/6hXfG1m6Q6v6cSxY6",
      status: "ACTIVE",
      facilityNames: ["Parking Area", "Locker Room", "WiFi Gratis", "Sound System"],
      images: [
        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=1200&q=80",
      ],
      fields: [
        {
          name: "Lapangan Utama",
          description: "Lapangan rumput sintetis standar nasional dengan kapasitas penonton besar.",
          pricePerHour: 250000,
          priceTendik: 150000,
          status: "ACTIVE",
          images: [
            "https://images.unsplash.com/photo-1444491741275-3747c53c99b4?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1471295253337-3ceaaedca402?auto=format&fit=crop&w=1200&q=80",
          ],
        },
        {
          name: "Lapangan Pendukung",
          description: "Lapangan multi-fungsi untuk basket dan futsal dengan lantai vinyl premium.",
          pricePerHour: 180000,
          priceTendik: 100000,
          status: "ACTIVE",
          images: [
            "https://images.unsplash.com/photo-1426024120108-99cc76989c71?auto=format&fit=crop&w=1200&q=80",
          ],
        },
      ],
    },
    {
      name: "Arena Fajar Nusantara",
      description: "Arena outdoor dengan pencahayaan malam lengkap untuk turnamen komunitas.",
      mapUrl: "https://goo.gl/maps/3M1YcCTmUqU1qfVt8",
      status: "ACTIVE",
      facilityNames: ["Parking Area", "Rest Room", "Tribun / Kursi"],
      images: [
        "https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1508606572321-901ea443707f?auto=format&fit=crop&w=1200&q=80",
      ],
      fields: [
        {
          name: "Lapangan Selatan",
          description: "Lapangan outdoor dengan rumput alami, cocok untuk latihan harian.",
          pricePerHour: 150000,
          priceTendik: 80000,
          status: "ACTIVE",
          images: [
            "https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?auto=format&fit=crop&w=1200&q=80",
          ],
        },
      ],
    },
  ]

  const allFields: Array<{ id: number; pricePerHour: number; priceTendik: number }> = []

  for (const stadionSpec of stadionSeeds) {
    const stadion = await prisma.stadion.create({
      data: {
        name: stadionSpec.name,
        description: stadionSpec.description,
        mapUrl: stadionSpec.mapUrl,
        status: stadionSpec.status ?? "ACTIVE",
      },
    })

    const facilityIds = stadionSpec.facilityNames
      .map((name) => facilityMap.get(name))
      .filter((id): id is number => typeof id === "number")

    if (facilityIds.length > 0) {
      await prisma.stadionFacility.createMany({
        data: facilityIds.map((facilityId) => ({
          stadionId: stadion.id,
          facilityId,
        })),
      })
    }

    if (stadionSpec.images.length) {
      await prisma.imageStadion.createMany({
        data: stadionSpec.images.map((imageUrl) => ({
          stadionId: stadion.id,
          imageUrl,
        })),
      })
    }

    for (const fieldSpec of stadionSpec.fields) {
      const field = await prisma.field.create({
        data: {
          stadionId: stadion.id,
          name: fieldSpec.name,
          description: fieldSpec.description,
          pricePerHour: fieldSpec.pricePerHour,
          priceTendik: fieldSpec.priceTendik,
          status: fieldSpec.status ?? "ACTIVE",
          images: {
            create: fieldSpec.images.map((imageUrl) => ({ imageUrl })),
          },
        },
      })

      allFields.push({ id: field.id, pricePerHour: field.pricePerHour, priceTendik: field.priceTendik })
    }
  }

  await prisma.operatingHour.upsert({
    where: { id: 1 },
    update: {
      openHour: 8,
      closeHour: 22,
    },
    create: {
      id: 1,
      openHour: 8,
      closeHour: 22,
    },
  })

  if (allFields.length === 0) {
    throw new Error("Field seeding failed; at least one field is required to create bookings.")
  }

  const bookingCodes: string[] = []

  for (let dayOffset = 0; dayOffset < 8; dayOffset++) {
    const targetField = allFields[dayOffset % allFields.length]
    const bookingDate = new Date()
    bookingDate.setDate(bookingDate.getDate() + dayOffset)
    const startHour = Math.min(20, 9 + dayOffset)
    bookingDate.setHours(startHour, 0, 0, 0)

    const renterType = dayOffset % 3 === 0 ? 'AKADEMIK' : (dayOffset % 3 === 1 ? 'TENDIK' : 'UMUM')
    const bookingCode = `DS-SEED-${(dayOffset + 1).toString().padStart(3, "0")}`

    // Calculate price based on renterType
    let bookingPrice = targetField.pricePerHour
    if (renterType === 'AKADEMIK') {
      bookingPrice = 0
    } else if (renterType === 'TENDIK') {
      bookingPrice = targetField.priceTendik
    }

    const booking = await prisma.booking.create({
      data: {
        bookingCode,
        name: `Seed User ${dayOffset + 1}`,
        contact: `08123${(456780 + dayOffset).toString()}`,
        email: `seeduser${dayOffset + 1}@example.com`,
        institution: renterType !== 'UMUM' ? "Universitas DipSport" : null,
        suratUrl: renterType !== 'UMUM' ? `https://example.com/uploads/surat-${dayOffset + 1}.pdf` : null,
        sptjmUrl: `https://example.com/uploads/sptjm-${dayOffset + 1}.pdf`,
        renterType,
        totalPrice: bookingPrice,
        status: dayOffset % 2 === 0 ? "APPROVED" : "PENDING",
        paymentStatus: dayOffset % 2 === 0 ? "PAID" : "UNPAID",
        details: {
          create: [
            {
              fieldId: targetField.id,
              bookingDate,
              startHour,
              pricePerHour: bookingPrice,
              subtotal: bookingPrice,
            },
          ],
        },
      },
      include: {
        details: true,
      },
    })

    bookingCodes.push(booking.bookingCode)

    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: "SEED_BOOKING",
        targetTable: "Booking",
        targetId: booking.id,
        description: `Seed booking created for ${bookingDate.toDateString()}`,
      },
    })
  }

  console.log("Stadions and fields seeded with Unsplash imagery.")
  console.log("Booking samples created:", bookingCodes)
  console.log("Seeding completed! Default admin password:", defaultPassword)

}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

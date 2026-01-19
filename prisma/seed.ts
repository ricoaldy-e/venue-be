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
  console.log("🚀 Seeding database with UNDIP venue data...")

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
    prisma.option.deleteMany(),
    prisma.admin.deleteMany(),
    prisma.stadion.deleteMany(),
  ])

  const defaultPassword = "admin123"
  const passAdminVenue = "operatorvenue333"
  const hashedPassword = await bcrypt.hash(defaultPassword, 10)
  const hashPassAdminVenue = await bcrypt.hash(passAdminVenue, 10)

  const [admin, admin2, admin3] = await Promise.all([
    prisma.admin.create({
      data: {
        name: "Super Admin",
        email: "admin@venueundip.com",
        password: hashPassAdminVenue,
      },
    }),
    prisma.admin.create({
      data: {
        name: "Operator Venue 1",
        email: "operator1@undip.ac.id",
        password: hashedPassword,
      },
    }),
    prisma.admin.create({
      data: {
        name: "Operator Venue 2",
        email: "operator2@undip.ac.id",
        password: hashedPassword,
      },
    }),
  ])

  console.log("👥 Admin accounts created:", [
    { id: admin.id, email: admin.email },
    { id: admin2.id, email: admin2.email },
    { id: admin3.id, email: admin3.email },
  ])

  const facilitySeeds = [
    { name: "Area Parkir", icon: "lucide:parking-circle" },
    { name: "Ruang Ganti", icon: "heroicons:lock-closed" },
    { name: "Toilet & Kamar Mandi", icon: "lucide:shower-head" },
    { name: "WiFi Gratis", icon: "heroicons:wifi" },
    { name: "Sound System", icon: "heroicons:speaker-wave" },
    { name: "Tribun Penonton", icon: "lucide:armchair" },
    { name: "Lampu Sorot", icon: "lucide:sun" },
    { name: "Kantin", icon: "lucide:coffee" },
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
      name: "Stadion Diponegoro",
      description: "Stadion utama Universitas Diponegoro yang terletak di kawasan Kampus Tembalang. Stadion ini memiliki fasilitas lengkap dengan lintasan atletik standar nasional, tribun penonton berkapasitas besar, serta lapangan sepak bola berstandar FIFA. Ideal untuk kegiatan olahraga akademik, pertandingan antar fakultas, dan event kampus berskala besar.",
      mapUrl: "https://maps.app.goo.gl/QdBzYVwUvkKN8nQp6",
      status: "ACTIVE",
      facilityNames: ["Area Parkir", "Ruang Ganti", "Toilet & Kamar Mandi", "WiFi Gratis", "Tribun Penonton", "Lampu Sorot"],
      images: [
        "https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
      ],
      fields: [
        {
          name: "Lapangan Sepak Bola Utama",
          description: "Lapangan sepak bola dengan rumput sintetis berkualitas tinggi, dilengkapi dengan gawang standar FIFA dan sistem drainase modern. Cocok untuk pertandingan resmi dan latihan tim sepak bola kampus.",
          pricePerHour: 300000,
          priceTendik: 180000,
          status: "ACTIVE",
          images: [
            "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=1200&q=80",
          ],
        },
        {
          name: "Lintasan Atletik",
          description: "Lintasan atletik 400 meter dengan permukaan tartan berkualitas, dilengkapi fasilitas untuk lompat jauh, lompat tinggi, dan lempar lembing. Ideal untuk latihan dan kompetisi atletik.",
          pricePerHour: 200000,
          priceTendik: 120000,
          status: "ACTIVE",
          images: [
            "https://images.unsplash.com/photo-1587893904903-4f37fa12a6ae?auto=format&fit=crop&w=1200&q=80",
          ],
        },
      ],
    },
    {
      name: "GOR Undip Tembalang",
      description: "Gedung Olahraga (GOR) indoor Universitas Diponegoro yang terletak di area Kampus Tembalang. Dilengkapi dengan lapangan multi-fungsi untuk berbagai cabang olahraga indoor seperti badminton, basket, futsal, dan voli. Fasilitas AC dan pencahayaan modern memberikan kenyamanan optimal untuk beraktivitas.",
      mapUrl: "https://maps.app.goo.gl/QdBzYVwUvkKN8nQp6",
      status: "ACTIVE",
      facilityNames: ["Area Parkir", "Ruang Ganti", "Toilet & Kamar Mandi", "WiFi Gratis", "Sound System", "Kantin"],
      images: [
        "https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1577416412292-747c6607f055?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80",
      ],
      fields: [
        {
          name: "Lapangan Badminton 1",
          description: "Lapangan badminton standar BWF dengan lantai vinyl premium dan pencahayaan optimal. Dilengkapi net berkualitas tinggi dan area bebas yang luas.",
          pricePerHour: 100000,
          priceTendik: 60000,
          status: "ACTIVE",
          images: [
            "https://images.unsplash.com/photo-1613918431703-aa50889e3be5?auto=format&fit=crop&w=1200&q=80",
          ],
        },
        {
          name: "Lapangan Badminton 2",
          description: "Lapangan badminton standar BWF dengan spesifikasi sama seperti Lapangan 1. Ideal untuk latihan rutin maupun pertandingan.",
          pricePerHour: 100000,
          priceTendik: 60000,
          status: "ACTIVE",
          images: [
            "https://images.unsplash.com/photo-1613918431703-aa50889e3be5?auto=format&fit=crop&w=1200&q=80",
          ],
        },
        {
          name: "Lapangan Basket Indoor",
          description: "Lapangan basket ukuran penuh dengan lantai parkit, ring basket standar FIBA, dan papan skor elektronik. Cocok untuk pertandingan dan latihan tim basket.",
          pricePerHour: 200000,
          priceTendik: 120000,
          status: "ACTIVE",
          images: [
            "https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=1200&q=80",
          ],
        },
        {
          name: "Lapangan Futsal",
          description: "Lapangan futsal dengan lantai vinyl berkualitas, gawang standar FIFA, dan pencahayaan merata. Kapasitas penonton hingga 200 orang.",
          pricePerHour: 180000,
          priceTendik: 100000,
          status: "ACTIVE",
          images: [
            "https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=1200&q=80",
          ],
        },
      ],
    },
    {
      name: "Lapangan Tenis Undip",
      description: "Kompleks lapangan tenis outdoor Universitas Diponegoro dengan 4 lapangan berstandar ITF. Terletak di area Kampus Tembalang dengan pemandangan hijau yang asri. Dilengkapi dengan tribun penonton, area istirahat, dan fasilitas pendukung lengkap.",
      mapUrl: "https://maps.app.goo.gl/QdBzYVwUvkKN8nQp6",
      status: "ACTIVE",
      facilityNames: ["Area Parkir", "Toilet & Kamar Mandi", "Tribun Penonton", "Lampu Sorot"],
      images: [
        "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1200&q=80",
      ],
      fields: [
        {
          name: "Lapangan Tenis 1 (Hard Court)",
          description: "Lapangan tenis dengan permukaan hard court yang memberikan pantulan bola konsisten. Dilengkapi net berkualitas dan garis lapangan yang jelas.",
          pricePerHour: 80000,
          priceTendik: 50000,
          status: "ACTIVE",
          images: [
            "https://images.unsplash.com/photo-1529926706528-db9e5010cd3e?auto=format&fit=crop&w=1200&q=80",
          ],
        },
        {
          name: "Lapangan Tenis 2 (Hard Court)",
          description: "Lapangan tenis standar ITF dengan permukaan hard court berkualitas. Cocok untuk latihan maupun pertandingan.",
          pricePerHour: 80000,
          priceTendik: 50000,
          status: "ACTIVE",
          images: [
            "https://images.unsplash.com/photo-1529926706528-db9e5010cd3e?auto=format&fit=crop&w=1200&q=80",
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
      openHour: 7,
      closeHour: 22,
    },
    create: {
      id: 1,
      openHour: 7,
      closeHour: 22,
    },
  })

  await prisma.option.upsert({
    where: { id: 1 },
    create: {
      name: 'VENUE UNDIP',
      nameKet: 'Sistem Reservasi Fasilitas Olahraga Universitas Diponegoro',
      description: 'Platform booking lapangan olahraga terpercaya untuk Sivitas Akademika Universitas Diponegoro. Menyediakan berbagai fasilitas olahraga berkualitas dengan proses reservasi yang mudah dan cepat.',
      unitName: 'UPT Layanan Seni, Budaya dan Olahraga',
      unitDesc: 'Unit Pelaksana Teknis yang mengelola fasilitas seni, budaya, dan olahraga di lingkungan Universitas Diponegoro',
      email: 'upt.sbor@undip.ac.id',
      nohp: '+6285165660339',
      address: 'Gedung Rektorat Lt. 1, Jl. Prof. Soedarto SH, Tembalang, Semarang 50275'
    },
    update: {
      name: 'VENUE UNDIP',
      nameKet: 'Sistem Reservasi Fasilitas Olahraga Universitas Diponegoro',
      description: 'Platform booking lapangan olahraga terpercaya untuk Sivitas Akademika Universitas Diponegoro. Menyediakan berbagai fasilitas olahraga berkualitas dengan proses reservasi yang mudah dan cepat.',
      unitName: 'UPT Layanan Seni, Budaya dan Olahraga',
      unitDesc: 'Unit Pelaksana Teknis yang mengelola fasilitas seni, budaya, dan olahraga di lingkungan Universitas Diponegoro',
      email: 'upt.sbor@undip.ac.id',
      nohp: '+6285165660339',
      address: 'Gedung Rektorat Lt. 1, Jl. Prof. Soedarto SH, Tembalang, Semarang 50275'
    }
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
    const bookingCode = `UNDIP-${(dayOffset + 1).toString().padStart(4, "0")}`

    let bookingPrice = targetField.pricePerHour
    if (renterType === 'AKADEMIK') {
      bookingPrice = 0
    } else if (renterType === 'TENDIK') {
      bookingPrice = targetField.priceTendik
    }

    const booking = await prisma.booking.create({
      data: {
        bookingCode,
        name: `Pengguna Demo ${dayOffset + 1}`,
        contact: `08123${(456780 + dayOffset).toString()}`,
        email: `user${dayOffset + 1}@students.undip.ac.id`,
        institution: renterType !== 'UMUM' ? "Universitas Diponegoro" : null,
        suratUrl: renterType !== 'UMUM' ? `https://example.com/uploads/surat-pengantar-${dayOffset + 1}.pdf` : null,
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
        description: `Demo booking created for ${bookingDate.toDateString()}`,
      },
    })
  }

  console.log("✅ Stadions and fields seeded successfully!")
  console.log("📋 Sample bookings created:", bookingCodes)
  console.log("🔐 Default admin password:", defaultPassword)
  console.log("🔐 Super admin password:", passAdminVenue)

}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

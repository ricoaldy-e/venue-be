// src/schema/resolvers/validators/facilitySchema.ts
import * as yup from "yup";

export type FacilityIconOption = {
  name: string;
  value: string;
};

export const availableIcons: FacilityIconOption[] = [
  { name: "Toilet / WC", value: "lucide:bath" },
  { name: "Toilet Bersih", value: "heroicons:home-modern" },
  { name: "Shower / Kamar Mandi", value: "lucide:shower-head" },
  { name: "Ruang Ganti / Changing Room", value: "lucide:door-open" },
  { name: "Loker / Lemari Penyimpanan", value: "lucide:lock-keyhole" },
  { name: "Kamar Mandi Difabel", value: "heroicons:user-circle" },

  { name: "Parkir Motor", value: "lucide:bike" },
  { name: "Parkir Mobil", value: "lucide:car" },
  { name: "Parkir Gratis", value: "lucide:parking-circle" },
  { name: "Parkir Bus / Luas", value: "heroicons:truck" },

  { name: "Air Minum Gratis", value: "lucide:droplet" },
  { name: "Dispenser", value: "lucide:glass-water" },

  { name: "WiFi Gratis", value: "heroicons:wifi" },

  { name: "Keamanan 24 Jam", value: "heroicons:shield-check" },
  { name: "CCTV", value: "heroicons:video-camera" },
  { name: "Penjaga / Security", value: "lucide:shield" },
  { name: "Kotak P3K", value: "lucide:cross" },
  { name: "Fasilitas Medis", value: "heroicons:heart" },
  { name: "APAR / Pemadam Kebakaran", value: "lucide:fire-extinguisher" },

  { name: "Lampu Sorot / Floodlight", value: "heroicons:light-bulb" },
  { name: "Pencahayaan LED", value: "lucide:lightbulb" },
  { name: "Tersedia Jam Malam", value: "lucide:moon" },

  { name: "Indoor / Tertutup", value: "heroicons:building-office-2" },
  { name: "Outdoor / Terbuka", value: "lucide:sun" },
  { name: "Beratap / Anti Hujan", value: "lucide:umbrella" },
  { name: "Semi-Indoor", value: "lucide:cloud-sun" },
  { name: "AC / Air Conditioner", value: "lucide:wind" },
  { name: "Kipas Angin", value: "lucide:fan" },

  { name: "Rumput Sintetis / Artificial", value: "lucide:grid-3x3" },
  { name: "Rumput Asli / Natural Grass", value: "lucide:leaf" },
  { name: "Vinyl / Karpet", value: "lucide:square-dashed-bottom" },
  { name: "Parket / Kayu", value: "lucide:square" },
  { name: "Matras / Tatami", value: "lucide:frame" },
  { name: "Beton / Concrete", value: "lucide:box" },
  { name: "Tanah Liat / Clay", value: "lucide:mountain" },

  { name: "Peralatan Olahraga Lengkap", value: "lucide:dumbbell" },
  { name: "Bola Disediakan", value: "lucide:circle-dot" },
  { name: "Net / Jaring", value: "lucide:network" },
  { name: "Goal / Gawang", value: "lucide:goal" },
  { name: "Rompi / Jersey Tim", value: "lucide:shirt" },
  { name: "Cone / Marker", value: "lucide:triangle" },

  { name: "Tribun / Tempat Duduk", value: "lucide:armchair" },
  { name: "Kapasitas Penonton Besar", value: "heroicons:user-group" },
  { name: "Area Berdiri / Standing", value: "lucide:users" },

  { name: "Cocok untuk Turnamen", value: "heroicons:trophy" },
  { name: "Sertifikasi Resmi", value: "heroicons:check-badge" },
  { name: "Sistem Poin / Scoring", value: "lucide:hash" },

  { name: "Papan Skor Digital", value: "heroicons:tv" },
  { name: "Papan Skor", value: "heroicons:presentation-chart-bar" },
  { name: "Sound System", value: "heroicons:speaker-wave" },
  { name: "Timer / Stopwatch", value: "lucide:timer" },
  { name: "TV Layar Lebar", value: "heroicons:computer-desktop" },

  { name: "Kantin / Restoran", value: "heroicons:building-storefront" },
  { name: "Coffee Shop / Kafe", value: "lucide:coffee" },
  { name: "Snack Bar", value: "lucide:candy" },
  { name: "Vending Machine", value: "lucide:refrigerator" },

  { name: "Mushola / Prayer Room", value: "lucide:home" },
  { name: "Tempat Wudhu", value: "lucide:droplets" },

  { name: "Charging Station / Colokan", value: "heroicons:bolt" },
  { name: "Stop Kontak", value: "lucide:plug" },
  { name: "Genset / Listrik Cadangan", value: "lucide:battery-charging" },

  { name: "Kebersihan Terjaga", value: "lucide:sparkles" },
  { name: "Tempat Sampah Memadai", value: "lucide:trash-2" },
  { name: "Cleaning Service", value: "lucide:spray-can" },

  { name: "Dilarang Merokok", value: "lucide:cigarette-off" },
  { name: "Area Merokok Khusus", value: "lucide:cigarette" },

  { name: "Ruang Tunggu Nyaman", value: "lucide:sofa" },
  { name: "Area Penitipan Barang", value: "lucide:briefcase" },
  { name: "Ruang Ganti Wasit", value: "lucide:door-closed" },

  { name: "QRIS / E-Wallet", value: "lucide:qr-code" },
  { name: "Kartu Kredit / Debit", value: "heroicons:credit-card" },
  { name: "Tunai / Cash", value: "heroicons:banknotes" },
  { name: "Transfer Bank", value: "heroicons:building-library" },

  { name: "Booking Online", value: "heroicons:device-phone-mobile" },
  { name: "Customer Service 24/7", value: "heroicons:phone" },
  { name: "Resepsionis / Front Desk", value: "lucide:contact" },
  { name: "Informasi / Info Desk", value: "lucide:info" },
  { name: "Walk-in Welcome", value: "lucide:door-open" },
  { name: "Loket Tiket", value: "heroicons:ticket" },

  { name: "Coaching / Pelatih", value: "lucide:user-check" },
  { name: "Private Lesson", value: "lucide:user-square" },
  { name: "Group Activity", value: "lucide:users-2" },
  { name: "Workshop / Training", value: "lucide:graduation-cap" },

  { name: "Ramah Difabel", value: "heroicons:user-circle" },
  { name: "Akses Mudah", value: "lucide:door-open" },
  { name: "Ramp / Jalur Landai", value: "lucide:arrow-down-to-line" },
  { name: "Lift / Elevator", value: "lucide:move-vertical" },

  { name: "Akses Transportasi Umum", value: "lucide:bus" },

  { name: "Rating Tinggi", value: "heroicons:star" },
  { name: "Fasilitas Premium", value: "heroicons:sparkles" },
  { name: "Bersertifikat", value: "heroicons:academic-cap" },
  { name: "Award Winning", value: "lucide:award" },
  { name: "VIP Lounge / Ruang VIP", value: "heroicons:sparkles" },

  { name: "Kolam Renang", value: "lucide:waves" },
  { name: "Lapangan Multifungsi", value: "lucide:layout-grid" },
  { name: "Running Track", value: "lucide:route" },

  { name: "Event Organizer", value: "lucide:megaphone" },
  { name: "Fotografi / Videografi", value: "lucide:video" },
  { name: "Live Streaming", value: "lucide:cast" },
  { name: "Fotografer", value: "lucide:camera" },
  { name: "Proyektor", value: "lucide:projector" },
  { name: "Announcer / MC", value: "lucide:mic" },

  { name: "Sauna", value: "lucide:thermometer" },
  { name: "Spa / Massage", value: "lucide:hand" },

  { name: "Family Friendly", value: "lucide:heart-handshake" },
  { name: "Kids Area / Playground", value: "lucide:baby" },
  { name: "Pet Friendly", value: "lucide:dog" },

  { name: "Ruang Meeting", value: "lucide:presentation" },
  { name: "Concierge", value: "lucide:bell-ring" },
  { name: "Cicilan / Installment", value: "lucide:calendar-clock" },

  { name: "Ambulance Standby", value: "lucide:ambulance" },

  { name: "Fasilitas Lainnya", value: "lucide:more-horizontal" },
];

export const VALID_FACILITY_ICONS = availableIcons.map(
  (i) => i.value
) as readonly string[]; 

export const facilityCreateSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(3, "Nama fasilitas minimal 3 karakter")
    .max(100, "Nama fasilitas maksimal 100 karakter")
    .optional()
    .nullable(),
}).strict(true);

export const facilityUpdateSchema = facilityCreateSchema.shape({
  facilityId: yup
    .string()
    .trim()
    .matches(/^\d+$/, "ID fasilitas harus berupa angka (string)")
    .required("ID fasilitas wajib diisi"),
});

export const facilityDeleteSchema = yup
  .object({
    facilityId: yup
      .string()
      .trim()
      .matches(/^\d+$/, "ID fasilitas harus berupa angka (string)")
      .required("ID fasilitas wajib diisi"),
  })
  .strict(true);
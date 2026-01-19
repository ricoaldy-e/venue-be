import { gql } from "graphql-tag"

export default gql`
  scalar DateTime
  scalar Upload

  enum BookingStatus {
    PENDING
    APPROVED
    CANCELLED
    DONE
  }

  enum Status {
    ACTIVE
    INACTIVE
  }

  enum RenterType {
    UMUM
    TENDIK
    AKADEMIK
  }

  enum PaymentStatus {
    UNPAID
    PAID
  }

  type Stadion {
    id: ID!
    name: String!
    description: String
    mapUrl: String!
    status: Status!
    facilities: [StadionFacility!]
    fields: [Field!]
    images: [ImageStadion!]
    operatingHours: OperatingHour
  }

  type StadionFacility {
    id: ID!
    stadionId: Int!
    facilityId: Int!
    Stadion: Stadion
    Facility: Facility
  }

  type Facility {
    id: ID!
    name: String!
    icon: String
    stadionFacilities: [StadionFacility!]
  }

  type Field {
    id: ID!
    stadionId: Int!
    name: String!
    description: String
    pricePerHour: Int!
    priceTendik: Int!
    status: Status!
    images: [ImageField!]
    bookingDetails: [BookingDetail!]
    Stadion: Stadion
  }

  type ImageStadion {
    id: ID!
    stadionId: Int!
    imageUrl: String!
    Stadion: Stadion
  }

  type ImageField {
    id: ID!
    fieldId: Int!
    imageUrl: String!
    Field: Field
  }

  type Booking {
    id: ID!
    bookingCode: String!
    name: String!
    contact: String!
    email: String!
    institution: String
    suratUrl: String
    renterType: RenterType!
    sptjmUrl: String
    totalPrice: Int!
    status: BookingStatus!
    paymentStatus: PaymentStatus!
    createdAt: DateTime!
    details: [BookingDetail!]
  }

  type BookingDetail {
    id: ID!
    bookingId: Int!
    fieldId: Int!
    bookingDate: DateTime!
    startHour: Int!
    pricePerHour: Int!
    subtotal: Int!
    createdAt: DateTime!
    Field: Field
  }

  type BookingSummary {
    totalRevenue: Float!
    totalCount: Int!
    paidCount: Int!
    unpaidCount: Int!
    academicCount: Int!
    nonAcademicCount: Int!
    academicRevenue: Float!
    nonAcademicRevenue: Float!
    paidPercentage: Float!
    averagePerBooking: Float!
    approvedCount: Int!
    cancelledCount: Int!
    pendingCount: Int!
  }
  
  type BookingPagination {
    data: [Booking!]!
    pagination: PaginationInfo!
    summary: BookingSummary!
  }

  type PaginationInfo {
    page: Int!
    limit: Int!
    total: Int!
    totalPages: Int!
    hasNextPage: Boolean!
    hasPrevPage: Boolean!
  }

  type OperatingHour {
    id: ID!
    openHour: Int!
    closeHour: Int!
  }

  type Option {
    id: ID!
    name: String!
    nameKet: String!
    description: String!
    unitName: String!
    unitDesc: String!
    email: String!
    nohp: String!
    address: String!
  }

  type AdminLog {
    id: ID!
    adminId: Int!
    action: String!
    targetTable: String
    targetId: Int
    description: String
    createdAt: DateTime!
    Admin: Admin
  }

  type Admin {
    id: ID!
    name: String!
    email: String
    adminLogs: [AdminLog!]
  }

  type AuthPayload {
    token: String!
    admin: Admin!
  }

  type uploadResponse {
    count: Int!
    imageUrls: [String!]!
  }

  type DailyBookingCount {
    date: String!
    count: Int!
  }

  type DailySlot {
    date: String!
    bookedHours: Int!
    availableHours: Int!
  }

  type UserDemographic {
    category: String!
    count: Int!
  }

  type Query {
    stadions: [Stadion!]
    stadion(stadionId: ID!): Stadion
    fields(stadionId: ID): [Field!]
    field(fieldId: ID!): Field
    bookings(
      stadionId: ID
      date: DateTime
      startDate: DateTime
      endDate: DateTime
      status: BookingStatus
      paymentStatus: PaymentStatus
      search: String
      page: Int
      limit: Int
      sortOrder: String
    ): BookingPagination!
    booking(bookingCode: String!): Booking
    operatingHours: OperatingHour
    options: Option
    me: Admin
    facilities: [Facility!]
    facility(facilityId: ID!): Facility
  }

  input FieldImageInput {
    imageUrl: String!
  }

  input BookingDetailInput {
    fieldId: Int!
    bookingDate: DateTime!
    startHour: Int!
    pricePerHour: Int
    subtotal: Int
  }

  type Mutation {
    login(email: String!, password: String!, turnstile: String!): AuthPayload!
    logout: Boolean!

    createStadion(
      name: String!
      description: String
      mapUrl: String!
      status: Status
      facilityIds: [Int]
    ): Stadion!

    updateStadion(
      stadionId: ID!
      name: String!
      description: String
      mapUrl: String!
      status: Status
      facilityIds: [Int]
    ): Stadion!

    deleteStadion(
      stadionId: ID!
    ): Stadion!

    createField(
      stadionId: Int!
      name: String!
      description: String
      pricePerHour: Int!
      priceTendik: Int
      images: [FieldImageInput!]
      status: Status
    ): Field!

    updateField(
      fieldId: ID!
      stadionId: Int!
      name: String!
      description: String
      pricePerHour: Int!
      priceTendik: Int
      images: [FieldImageInput!]
      status: Status
    ): Field!

    deleteField(
      fieldId: ID!
    ): Field!

    createBooking(
      name: String!
      contact: String!
      email: String!
      institution: String
      suratFile: Upload
      renterType: RenterType!
      sptjmFile: Upload
      details: [BookingDetailInput!]!
      status: BookingStatus
      paymentStatus: PaymentStatus
    ): Booking!

    updateStatusBooking(
      bookingCode: String!
      status: BookingStatus!
    ): Booking!

    updatePaymentStatus(
      bookingCode: String!
      paymentStatus: PaymentStatus!
    ): Booking!

    updateOperatingHour(
      openHour: Int!
      closeHour: Int!
    ): OperatingHour

    createOption(
      name: String!
      nameKet: String!
      description: String!
      unitName: String!
      unitDesc: String!
      email: String!
      nohp: String!
      address: String!
    ): Option

    updateOption(
      name: String!
      nameKet: String!
      description: String!
      unitName: String!
      unitDesc: String!
      email: String!
      nohp: String!
      address: String!
    ): Option

    uploadStadionImages(
      stadionId: Int!
      files: [Upload!]!
    ): uploadResponse!

    deleteStadionImage(
      imageId: ID!
    ): ImageStadion!

    uploadFieldImages(
      fieldId: Int!
      files: [Upload!]!
    ): uploadResponse!

    deleteFieldImage(
      imageId: ID!
    ): ImageField!

    createFacility(
      name: String!
      icon: String
    ): Facility!

    updateFacility(
      facilityId: ID!
      name: String!
      icon: String
    ): Facility!

    deleteFacility(
      facilityId: ID!
    ): Facility!
  }
`
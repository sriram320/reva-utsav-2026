import { pgTable, text, serial, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    password: text('password'), // Optional for OAuth users
    role: text('role').default('user'), // user, admin, coordinator
    college: text('college'),
    phone: text('phone'),
    state: text('state'), // For non-REVA students
    district: text('district'), // For non-REVA students
    createdAt: timestamp('created_at').defaultNow(),
    image: text('image'),
    visiblePassword: text('visible_password'), // For Admin reference (Volunteer only)
    participantId: text('participant_id').unique(), // REVA-UTS-001 format
    verified: boolean('verified').default(false), // ID verification status
    govtIdUrl: text('govt_id_url'), // URL to uploaded ID proof
    srn: text('srn'), // Reva SRN
    department: text('department'), // Reva Department/School
    gender: text('gender'), // Male, Female, Other
});

export const events = pgTable('events', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    category: text('category').notNull(),
    rules: jsonb('rules'), // Array of rules
    imageUrl: text('image_url'),
    date: timestamp('date'),
    venue: text('venue'),
    teamSize: integer('team_size').default(1),
    fees: integer('fees').default(0),
    coordinators: jsonb('coordinators'), // {name, phone}
});

export const registrations = pgTable('registrations', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id),
    eventId: integer('event_id').references(() => events.id),
    status: text('status').default('pending'), // pending, paid, cancelled
    paymentId: text('payment_id'),
    registeredAt: timestamp('registered_at').defaultNow(),
    couponCode: text('coupon_code'), // Track referral
    teamId: integer('team_id'), // Link to team if applicable
});

export const teams = pgTable('teams', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    leaderId: integer('leader_id').references(() => users.id).notNull(),
    eventId: integer('event_id').references(() => events.id).notNull(),
    code: text('code').unique(),
    createdAt: timestamp('created_at').defaultNow(),
});

export const teamMembers = pgTable('team_members', {
    id: serial('id').primaryKey(),
    teamId: integer('team_id').references(() => teams.id).notNull(),
    userId: integer('user_id').references(() => users.id),
    name: text('name'),
    email: text('email'),
    role: text('role').default('member'), // leader, member
    status: text('status').default('pending'), // joined, pending
    invitedAt: timestamp('invited_at').defaultNow(),
});

export const credits = pgTable('credits', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    amount: integer('amount').notNull(),
    reason: text('reason'),
    relatedTeamId: integer('related_team_id').references(() => teams.id),
    used: boolean('used').default(false),
    createdAt: timestamp('created_at').defaultNow(),
});

export const passwordResetTokens = pgTable('password_reset_tokens', {
    id: serial('id').primaryKey(), // ... rest of file
    userId: integer('user_id').references(() => users.id).notNull(),
    token: text('token').notNull().unique(), // Hashed token
    expiresAt: timestamp('expires_at').notNull(),
    used: boolean('used').default(false),
    createdAt: timestamp('created_at').defaultNow(),
});

export const passes = pgTable('passes', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    passType: text('pass_type').notNull(), // 'Tech Gold', 'Cultural Silver', etc.
    passId: text('pass_id').notNull().unique(), // REVA-RTC-XXXX
    purchaseDate: timestamp('purchase_date').defaultNow(),
    amountPaid: integer('amount_paid').notNull(),
    status: text('status').default('active'), // active, expired, cancelled
    checkedIn: boolean('checked_in').default(false), // For entry tracking
    couponCode: text('coupon_code'), // Track referral
});

// Accommodation Properties (PG Partners, Hostels)
export const accommodationProperties = pgTable('accommodation_properties', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    type: text('type').notNull(), // Hostel, PG, Hotel
    gender: text('gender'), // Boys, Girls, Co-ed
    capacity: integer('capacity').default(0),
    occupied: integer('occupied').default(0),
    costPrice: integer('cost_price').default(0), // What we pay per bed
    sellingPrice: integer('selling_price').default(0), // What we charge per bed
    contactPerson: text('contact_person'),
    contactPhone: text('contact_phone'),
    address: text('address'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const accommodationRequests = pgTable('accommodation_requests', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    paymentStatus: text('payment_status').default('pending'), // pending, paid
    assignedPropertyId: integer('assigned_property_id').references(() => accommodationProperties.id),
    checkInDate: timestamp('check_in_date'),
    checkOutDate: timestamp('check_out_date'),
    numberOfDays: integer('number_of_days'),
    roomNumber: text('room_number'),
    status: text('status').default('pending'), // pending, approved, rejected
    checkedIn: boolean('checked_in').default(false),
    createdAt: timestamp('created_at').defaultNow(),
});

export const settings = pgTable('settings', {
    key: text('key').primaryKey(), // e.g., 'accommodation_enabled'
    value: text('value').notNull(), // 'true', 'false', or JSON string
});

export const coupons = pgTable('coupons', {
    id: serial('id').primaryKey(),
    code: text('code').notNull().unique(),
    discountPercent: integer('discount_percent').notNull(),
    assignedTo: integer('assigned_to').references(() => users.id), // Volunteer ID
    usageCount: integer('usage_count').default(0),
    createdAt: timestamp('created_at').defaultNow(),
});

export const tasks = pgTable('tasks', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    assignedTo: integer('assigned_to').references(() => users.id),
    status: text('status').default('Pending'), // Pending, In Progress, Completed
    createdAt: timestamp('created_at').defaultNow(),
});

// Financials - Transactions (Income & Expenses)
export const transactions = pgTable('transactions', {
    id: serial('id').primaryKey(),
    description: text('description').notNull(),
    category: text('category').notNull(), // Technical, Marketing, Logistics, Sponsorship, Registration, Accommodation
    amount: integer('amount').notNull(),
    isIncome: boolean('is_income').default(false),
    date: timestamp('date').defaultNow(),
    createdBy: integer('created_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow(),
});

// Financials - Settlements (PG/Partner Payments)
export const settlements = pgTable('settlements', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(), // PG Name or Partner Name
    type: text('type').notNull(), // PG, Internal, Partner
    amountDue: integer('amount_due').default(0),
    status: text('status').default('Pending'), // Pending, Settled
    lastPaidDate: timestamp('last_paid_date'),
    createdAt: timestamp('created_at').defaultNow(),
});

// Ticketing - Batches
export const ticketBatches = pgTable('ticket_batches', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    price: integer('price').default(299), // Price per pass in this batch
    capacity: integer('capacity').default(0), // Total capacity for this batch
    status: text('status').default('Scheduled'), // Scheduled, Active, Sold Out
    totalTickets: integer('total_tickets').default(0),
    soldTickets: integer('sold_tickets').default(0),
    createdAt: timestamp('created_at').defaultNow(),
});

// Ticketing - Sales (for live tracking)
export const ticketSales = pgTable('ticket_sales', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id),
    batchId: integer('batch_id').references(() => ticketBatches.id),
    amount: integer('amount').notNull(),
    couponCode: text('coupon_code'),
    soldAt: timestamp('sold_at').defaultNow(),
});

export const otpVerifications = pgTable('otp_verifications', {
    id: serial('id').primaryKey(),
    email: text('email').notNull(),
    otp: text('otp').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    verified: boolean('verified').default(false),
    createdAt: timestamp('created_at').defaultNow(),
});

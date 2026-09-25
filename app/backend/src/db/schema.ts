import { sql } from 'drizzle-orm';
import {pgTable, serial, varchar, numeric, text, timestamp, pgEnum, integer, date, boolean, uniqueIndex, primaryKey, index} from 'drizzle-orm/pg-core'

export const userRoles = pgEnum("user_roles", ["CUSTOMER", "CASHIER", "ADMIN"])

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: varchar("email", {length: 256}).unique().notNull(),
    passwordHash: varchar("password_hash", {length: 60}).notNull(), //bcrypt hash always 60 symbols long.
    role: userRoles().notNull().default("CUSTOMER"),
    createdAt: timestamp("created_at", {withTimezone: true}).notNull().defaultNow()
});


export const movieAgeRatings = pgEnum("age_ratings",["0+","4+","8+","10+", "12+", "14+", "16+", "18+"])
export const movieStatuses = pgEnum("movie_statuses", ["COMING_SOON", "NOW_SHOWING", "ARCHIVED"])

export const movies = pgTable("movies", {
    id: serial("id").primaryKey(),
    title: varchar("title", {length: 256}).notNull(),
    description: text("description").notNull().default(""),
    durationMinutes: integer("duration_minutes"),
    releaseDate: date("release_date"),
    ageRating: movieAgeRatings().notNull(),
    posterUrl: varchar("poster_url", {length: 512}),
    trailerUrl: varchar("trailer_url", {length: 512}),
    status: movieStatuses().notNull().default("COMING_SOON")
})


export const genres = pgTable("genres", {
    id: serial("id").primaryKey(),
    name: varchar("name", {length: 256}).notNull(),
    slug: varchar("slug", {length: 256}).notNull().unique()
});


export const movieGenres = pgTable("movie_genres", {
    movieId: integer("movie_id").notNull().references(() => movies.id, {onDelete: 'cascade'}),
    genreId: integer("genre_id").notNull().references(() => genres.id, {onDelete: 'cascade'})
    },
    (table) => [
        primaryKey({columns: [table.movieId, table.genreId]})
    ]
);


export const hallTypes = pgEnum("hall_types", ["STANDARD", "IMAX", "VIP", "4DX"])

export const halls = pgTable("halls", {
    id: serial("id").primaryKey(),
    name: varchar("name", {length: 256}).notNull().unique(),
    type: hallTypes().notNull().default("STANDARD")
})

export const seatTypes = pgEnum("seat_types", ["STANDARD", "VIP", "WHEELCHAIR", "COUPLE"])

export const seats = pgTable("seats", {
    id: serial("id").primaryKey(),
    hallId: integer("hall_id").notNull().references(() => halls.id, {onDelete: 'cascade'}),
    rowNumber: integer("row_number").notNull(),
    seatNumber: integer("seat_number").notNull(),
    seatType: seatTypes().notNull().default("STANDARD"),
    isActive: boolean("is_active").notNull().default(true)
    },
    (table) => [
        uniqueIndex('uniq_seat_position_in_hall')
            .on(table.hallId, table.rowNumber,  table.seatNumber)
    ]
)


export const showingFormats = pgEnum("showing_formats", ["2D", "3D", "IMAX"])
export const showingStatuses = pgEnum("showing_statuses", ["SCHEDULED", "FINISHED", "CANCELLED"])

export const showings = pgTable("showings", {
    id: serial("id").primaryKey(),
    movieId: integer("movie_id").notNull().references(() => movies.id, {onDelete: 'restrict'}),
    hallId: integer("hall_id").notNull().references(() => halls.id, {onDelete: 'restrict'}),
    startTime: timestamp("start_time", {withTimezone: true}).notNull(),
    endTime: timestamp("end_time", {withTimezone: true}).notNull(),
    format: showingFormats().notNull().default("2D"),
    basePrice: numeric("base_price", {precision: 10, scale: 2}).notNull(),
    status: showingStatuses().notNull().default("SCHEDULED")
    },
    (table) => [
        index("idx_showings_movie_id").on(table.movieId),
        index('idx_showings_hall_id').on(table.hallId),
        index('idx_showings_start_time').on(table.startTime)
    ]
)


export const bookingStatuses = pgEnum("booking_statuses", ["PENDING", "PAID", "CANCELLED", "EXPIRED"])

export const bookings = pgTable("bookings", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, {onDelete: 'restrict'}),
    status: bookingStatuses().notNull().default("PENDING"),
    createdAt: timestamp("created_at", {withTimezone: true}).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", {withTimezone: true}).notNull(),
    paidAt: timestamp("paid_at", {withTimezone: true}),
    updatedAt: timestamp("updated_at", {withTimezone: true})
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date())
    },
    (table) => [
        index("idx_booking_user_id").on(table.userId)
    ]
)

export const ticketTypes = pgEnum("ticket_types", ["CHILD", "ADULT", "STUDENT", "VIP"])
export const ticketStatuses = pgEnum("ticket_statuses", ["RESERVED", "PAID", "CANCELLED", "USED"])

export const tickets = pgTable("tickets", {
    id: serial("id").primaryKey(),
    bookingId: integer("booking_id").notNull().references(() => bookings.id, {onDelete: 'cascade'}),
    showingId: integer("showing_id").notNull().references(() => showings.id, {onDelete: 'restrict'}),
    seatId: integer("seat_id").notNull().references(() => seats.id, {onDelete: 'restrict'}),
    ticketType: ticketTypes().notNull().default("ADULT"),
    price: numeric("price", {precision: 10, scale: 2}).notNull(),
    status: ticketStatuses().notNull().default("RESERVED"),
    updatedAt: timestamp("updated_at", {withTimezone: true})
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date())
    },
    (table) => [
        index("idx_tickets_booking_id").on(table.bookingId),
        index("idx_tickets_showing_id").on(table.showingId),
        index("idx_tickets_seat_id").on(table.seatId),
        uniqueIndex("uniq_active_seat_per_showing")
            .on(table.showingId, table.seatId)
            .where(sql`status != 'CANCELLED'`)
    ]
)

export const paymentMethods = pgEnum("payment_methods", ["CARD", "CASH", "ONLINE"])
export const paymentStatuses = pgEnum("payment_statuses", ["PENDING", "SUCCESS", "FAILED", "REFUNDED"]) 

export const payments = pgTable("payments", {
    id: serial("id").primaryKey(),
    bookingId: integer("booking_id").notNull().references(() => bookings.id, {onDelete: 'cascade'}),
    amount: numeric("amount", {precision: 10, scale: 2}).notNull(),
    method: paymentMethods().notNull(),
    status: paymentStatuses().notNull().default("PENDING"),
    createdAt: timestamp("created_at", {withTimezone: true}).notNull().defaultNow(),
    paidAt: timestamp("paid_at", {withTimezone: true})
    },
    (table) => [
        index("idx_payment_booking_id").on(table.bookingId)
    ]
)
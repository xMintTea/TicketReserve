import { relations, sql } from 'drizzle-orm';
import {pgTable, varchar, numeric, text, timestamp, pgEnum, integer, date, boolean, uniqueIndex, primaryKey, index, check} from 'drizzle-orm/pg-core'

export const userRoles = pgEnum("user_roles", ["CUSTOMER", "CASHIER", "ADMIN"])

export const users = pgTable('users', {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    email: varchar("email", {length: 256}).unique().notNull(),
    passwordHash: varchar("password_hash", {length: 60}).notNull(), //bcrypt hash always 60 symbols long.
    role: userRoles("role").notNull().default("CUSTOMER"),
    createdAt: timestamp("created_at", {withTimezone: true}).notNull().defaultNow()
});


export const movieAgeRatings = pgEnum("age_ratings",["0+","4+","8+","10+", "12+", "14+", "16+", "18+"])
export const movieStatuses = pgEnum("movie_statuses", ["COMING_SOON", "NOW_SHOWING", "ARCHIVED"])

export const movies = pgTable("movies", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    title: varchar("title", {length: 256}).notNull(),
    description: text("description").notNull().default(""),
    durationMinutes: integer("duration_minutes"),
    releaseDate: date("release_date"),
    ageRating: movieAgeRatings("age_rating").notNull(),
    posterUrl: varchar("poster_url", {length: 512}),
    trailerUrl: varchar("trailer_url", {length: 512}),
    status: movieStatuses("status").notNull().default("COMING_SOON")
})


export const genres = pgTable("genres", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
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


export const hallTypes = pgEnum("hall_types", ["STANDARD", "IMAX"])

export const halls = pgTable("halls", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name", {length: 256}).notNull().unique(),
    type: hallTypes("type").notNull().default("STANDARD")
})

export const seatTypes = pgEnum("seat_types", ["STANDARD", "VIP", "WHEELCHAIR", "COUPLE"])

export const seats = pgTable("seats", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    hallId: integer("hall_id").notNull().references(() => halls.id, {onDelete: 'cascade'}),
    rowNumber: integer("row_number").notNull(),
    seatNumber: integer("seat_number").notNull(),
    seatType: seatTypes("seat_type").notNull().default("STANDARD"),
    isActive: boolean("is_active").notNull().default(true)
    },
    (table) => [
        uniqueIndex('uniq_seat_position_in_hall')
            .on(table.hallId, table.rowNumber,  table.seatNumber)
    ]
)


export const showingFormats = pgEnum("showing_formats", ["2D", "3D"])
export const showingStatuses = pgEnum("showing_statuses", ["SCHEDULED", "FINISHED", "CANCELLED"])

export const showings = pgTable("showings", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    movieId: integer("movie_id").notNull().references(() => movies.id, {onDelete: 'restrict'}),
    hallId: integer("hall_id").notNull().references(() => halls.id, {onDelete: 'restrict'}),
    startTime: timestamp("start_time", {withTimezone: true}).notNull(),
    endTime: timestamp("end_time", {withTimezone: true}).notNull(),
    format: showingFormats("format").notNull().default("2D"),
    basePrice: numeric("base_price", {precision: 10, scale: 2}).notNull(),
    status: showingStatuses("status").notNull().default("SCHEDULED")
    },
    (table) => [
        check("showings_time_valid", sql`${table.endTime} > ${table.startTime}`),
        index("idx_showings_movie_id").on(table.movieId),
        index('idx_showings_hall_id').on(table.hallId),
        index('idx_showings_start_time').on(table.startTime)
    ]
)


export const bookingStatuses = pgEnum("booking_statuses", ["PENDING", "PAID", "CANCELLED", "EXPIRED"])

export const bookings = pgTable("bookings", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id").notNull().references(() => users.id, {onDelete: 'restrict'}),
    status: bookingStatuses("status").notNull().default("PENDING"),
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
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    bookingId: integer("booking_id").notNull().references(() => bookings.id, {onDelete: 'cascade'}),
    showingId: integer("showing_id").notNull().references(() => showings.id, {onDelete: 'restrict'}),
    seatId: integer("seat_id").notNull().references(() => seats.id, {onDelete: 'restrict'}),
    ticketType: ticketTypes("ticket_type").notNull().default("ADULT"),
    price: numeric("price", {precision: 10, scale: 2}).notNull(),
    status: ticketStatuses("status").notNull().default("RESERVED"),
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
            .where(sql`${table.status} != 'CANCELLED'`)
    ]
)

export const paymentMethods = pgEnum("payment_methods", ["CARD", "CASH", "ONLINE"])
export const paymentStatuses = pgEnum("payment_statuses", ["PENDING", "SUCCESS", "FAILED", "REFUNDED"]) 

export const payments = pgTable("payments", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    bookingId: integer("booking_id").notNull().references(() => bookings.id, {onDelete: 'cascade'}),
    amount: numeric("amount", {precision: 10, scale: 2}).notNull(),
    method: paymentMethods("method").notNull(),
    status: paymentStatuses("status").notNull().default("PENDING"),
    createdAt: timestamp("created_at", {withTimezone: true}).notNull().defaultNow(),
    paidAt: timestamp("paid_at", {withTimezone: true})
    },
    (table) => [
        index("idx_payment_booking_id").on(table.bookingId)
    ]
)


export const usersRelations = relations(users, ({ many }) => ({
    bookings: many(bookings),
}))


export const moviesRelations = relations(movies, ({ many }) => ({
    movieGenres: many(movieGenres),
    showings: many(showings)
}))


export const genresRelations = relations(genres, ({ many }) => ({
    movieGenres: many(movieGenres)
}))

export const movieGenresRelations = relations(movieGenres, ({ one }) => ({
    movie: one(movies, {
        fields: [movieGenres.movieId],
        references: [movies.id]
    }),
    genre: one(genres, {
        fields: [movieGenres.genreId],
        references: [genres.id]
    })
}))


export const hallsRelations = relations(halls, ({ many }) => ({
    seats: many(seats),
    showings: many(showings)
}))


export const seatsRelations = relations(seats, ({one, many}) => ({
    hall: one(halls, {
        fields: [seats.hallId],
        references: [halls.id]
    }),
    tickets: many(tickets)
}))


export const showingsRelations = relations(showings, ({ one, many }) => ({
    movie: one(movies, {
        fields: [showings.movieId],
        references: [movies.id]
    }),
    hall: one(halls, {
        fields: [showings.hallId],
        references: [halls.id]
    }),
    tickets: many(tickets)
})) 


export const bookingsRelations = relations(bookings, ({ one, many }) => ({
    user: one(users, {
        fields: [bookings.userId],
        references: [users.id]
    }),
    tickets: many(tickets),
    payments: many(payments)
}))


export const ticketsRelations = relations(tickets, ({ one }) => ({
    booking: one(bookings, {
        fields: [tickets.bookingId],
        references: [bookings.id]
    }),
    showing: one(showings, {
        fields: [tickets.showingId],
        references: [showings.id]
    }),
    seat: one(seats, {
        fields: [tickets.seatId],
        references: [seats.id]
    })
}))

export const paymentsRelations = relations(payments, ({ one }) => ({
    booking: one(bookings, {
        fields: [payments.bookingId],
        references: [bookings.id]
    })
}))
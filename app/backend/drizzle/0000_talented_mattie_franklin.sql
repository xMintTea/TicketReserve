CREATE TYPE "public"."booking_statuses" AS ENUM('PENDING', 'PAID', 'CANCELLED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."hall_types" AS ENUM('STANDARD', 'IMAX');--> statement-breakpoint
CREATE TYPE "public"."age_ratings" AS ENUM('0+', '4+', '8+', '10+', '12+', '14+', '16+', '18+');--> statement-breakpoint
CREATE TYPE "public"."movie_statuses" AS ENUM('COMING_SOON', 'NOW_SHOWING', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."payment_methods" AS ENUM('CARD', 'CASH', 'ONLINE');--> statement-breakpoint
CREATE TYPE "public"."payment_statuses" AS ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "public"."seat_types" AS ENUM('STANDARD', 'VIP', 'WHEELCHAIR', 'COUPLE');--> statement-breakpoint
CREATE TYPE "public"."showing_formats" AS ENUM('2D', '3D');--> statement-breakpoint
CREATE TYPE "public"."showing_statuses" AS ENUM('SCHEDULED', 'FINISHED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."ticket_statuses" AS ENUM('RESERVED', 'PAID', 'CANCELLED', 'USED');--> statement-breakpoint
CREATE TYPE "public"."ticket_types" AS ENUM('CHILD', 'ADULT', 'STUDENT', 'VIP');--> statement-breakpoint
CREATE TYPE "public"."user_roles" AS ENUM('CUSTOMER', 'CASHIER', 'ADMIN');--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "bookings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"status" "booking_statuses" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"paid_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "genres" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "genres_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(256) NOT NULL,
	"slug" varchar(256) NOT NULL,
	CONSTRAINT "genres_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "halls" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "halls_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(256) NOT NULL,
	"type" "hall_types" DEFAULT 'STANDARD' NOT NULL,
	CONSTRAINT "halls_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "movie_genres" (
	"movie_id" integer NOT NULL,
	"genre_id" integer NOT NULL,
	CONSTRAINT "movie_genres_movie_id_genre_id_pk" PRIMARY KEY("movie_id","genre_id")
);
--> statement-breakpoint
CREATE TABLE "movies" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "movies_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar(256) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"duration_minutes" integer,
	"release_date" date,
	"age_rating" "age_ratings" NOT NULL,
	"poster_url" varchar(512),
	"trailer_url" varchar(512),
	"status" "movie_statuses" DEFAULT 'COMING_SOON' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "payments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"booking_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"method" "payment_methods" NOT NULL,
	"status" "payment_statuses" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"paid_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "seats" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "seats_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"hall_id" integer NOT NULL,
	"row_number" integer NOT NULL,
	"seat_number" integer NOT NULL,
	"seat_type" "seat_types" DEFAULT 'STANDARD' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "uniq_seat_in_hall" UNIQUE("id","hall_id")
);
--> statement-breakpoint
CREATE TABLE "showings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "showings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"movie_id" integer NOT NULL,
	"hall_id" integer NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"format" "showing_formats" DEFAULT '2D' NOT NULL,
	"base_price" numeric(10, 2) NOT NULL,
	"status" "showing_statuses" DEFAULT 'SCHEDULED' NOT NULL,
	CONSTRAINT "uniq_showing_id_hall" UNIQUE("id","hall_id"),
	CONSTRAINT "showings_time_valid" CHECK ("showings"."end_time" > "showings"."start_time")
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tickets_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"booking_id" integer NOT NULL,
	"showing_id" integer NOT NULL,
	"seat_id" integer NOT NULL,
	"hall_id" integer NOT NULL,
	"ticket_type" "ticket_types" DEFAULT 'ADULT' NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"status" "ticket_statuses" DEFAULT 'RESERVED' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"email" varchar(256) NOT NULL,
	"password_hash" varchar(60) NOT NULL,
	"role" "user_roles" DEFAULT 'CUSTOMER' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_genres" ADD CONSTRAINT "movie_genres_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_genres" ADD CONSTRAINT "movie_genres_genre_id_genres_id_fk" FOREIGN KEY ("genre_id") REFERENCES "public"."genres"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seats" ADD CONSTRAINT "seats_hall_id_halls_id_fk" FOREIGN KEY ("hall_id") REFERENCES "public"."halls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "showings" ADD CONSTRAINT "showings_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "showings" ADD CONSTRAINT "showings_hall_id_halls_id_fk" FOREIGN KEY ("hall_id") REFERENCES "public"."halls"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_showing_id_showings_id_fk" FOREIGN KEY ("showing_id") REFERENCES "public"."showings"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "fk_tickets_showing_hall" FOREIGN KEY ("showing_id","hall_id") REFERENCES "public"."showings"("id","hall_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "fk_tickets_seat_hall" FOREIGN KEY ("seat_id","hall_id") REFERENCES "public"."seats"("id","hall_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_booking_user_id" ON "bookings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_payment_booking_id" ON "payments" USING btree ("booking_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_seat_position_in_hall" ON "seats" USING btree ("hall_id","row_number","seat_number");--> statement-breakpoint
CREATE INDEX "idx_showings_movie_id" ON "showings" USING btree ("movie_id");--> statement-breakpoint
CREATE INDEX "idx_showings_hall_id" ON "showings" USING btree ("hall_id");--> statement-breakpoint
CREATE INDEX "idx_showings_start_time" ON "showings" USING btree ("start_time");--> statement-breakpoint
CREATE INDEX "idx_tickets_booking_id" ON "tickets" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "idx_tickets_showing_id" ON "tickets" USING btree ("showing_id");--> statement-breakpoint
CREATE INDEX "idx_tickets_seat_id" ON "tickets" USING btree ("seat_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_active_seat_per_showing" ON "tickets" USING btree ("showing_id","seat_id") WHERE "tickets"."status" != 'CANCELLED';--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_users_email_lower" ON "users" USING btree (lower("email"));
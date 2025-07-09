import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  unique,
  date,
  time,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// Users table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  phone: varchar("phone").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  emailVerified: boolean("email_verified").default(false),
  phoneVerified: boolean("phone_verified").default(false),
  location: varchar("location"),
  preferredLanguage: varchar("preferred_language").default("en"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Movies table
export const movies = pgTable("movies", {
  id: serial("id").primaryKey(),
  tmdbId: integer("tmdb_id").unique().notNull(),
  title: varchar("title").notNull(),
  overview: text("overview"),
  posterPath: varchar("poster_path"),
  backdropPath: varchar("backdrop_path"),
  releaseDate: date("release_date"),
  runtime: integer("runtime"),
  genres: text("genres").array(),
  rating: decimal("rating", { precision: 3, scale: 1 }),
  voteCount: integer("vote_count"),
  trailerUrl: varchar("trailer_url"),
  cast: jsonb("cast"), // Array of cast members with name, character, profile_path
  crew: jsonb("crew"), // Array of crew members with name, job, profile_path
  director: varchar("director"),
  language: varchar("language"),
  certification: varchar("certification"), // PG, PG-13, R, etc.
  isNowShowing: boolean("is_now_showing").default(false),
  isComingSoon: boolean("is_coming_soon").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Theaters table
export const theaters = pgTable("theaters", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  location: varchar("location").notNull(),
  address: text("address"),
  city: varchar("city").notNull(),
  state: varchar("state").notNull(),
  pincode: varchar("pincode"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  amenities: text("amenities").array(),
  tier: varchar("tier").default("tier2"), // tier1, tier2 for pricing
  rating: decimal("rating", { precision: 3, scale: 1 }).default("4.5"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Screens table
export const screens = pgTable("screens", {
  id: serial("id").primaryKey(),
  theaterId: integer("theater_id").references(() => theaters.id).notNull(),
  screenNumber: integer("screen_number").notNull(),
  capacity: integer("capacity").notNull(),
  screenType: varchar("screen_type").default("standard"), // standard, premium, imax
  createdAt: timestamp("created_at").defaultNow(),
});

// Showtimes table
export const showtimes = pgTable("showtimes", {
  id: serial("id").primaryKey(),
  movieId: integer("movie_id").references(() => movies.id).notNull(),
  screenId: integer("screen_id").references(() => screens.id).notNull(),
  showDate: date("show_date").notNull(),
  showTime: time("show_time").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  availableSeats: integer("available_seats").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Seats table
export const seats = pgTable("seats", {
  id: serial("id").primaryKey(),
  screenId: integer("screen_id").references(() => screens.id).notNull(),
  seatNumber: varchar("seat_number").notNull(), // A1, A2, B1, etc.
  row: varchar("row").notNull(),
  column: integer("column").notNull(),
  seatType: varchar("seat_type").default("regular"), // regular, premium, recliner
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
});

// Watchlist table
export const watchlist = pgTable("watchlist", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  movieId: integer("movie_id").references(() => movies.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique("unique_user_movie").on(table.userId, table.movieId),
]);

// Bookings table
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  showtimeId: integer("showtime_id").references(() => showtimes.id).notNull(),
  bookingReference: varchar("booking_reference").unique().notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  bookingFee: decimal("booking_fee", { precision: 10, scale: 2 }).default("2.50"),
  paymentStatus: varchar("payment_status").default("pending"), // pending, completed, failed
  paymentId: varchar("payment_id"),
  qrCode: text("qr_code"),
  status: varchar("status").default("confirmed"), // confirmed, cancelled, used
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Booked seats table
export const bookedSeats = pgTable("booked_seats", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  seatId: integer("seat_id").references(() => seats.id).notNull(),
  showtimeId: integer("showtime_id").references(() => showtimes.id).notNull(),
  isHeld: boolean("is_held").default(false),
  heldUntil: timestamp("held_until"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Seat holds table (for temporary seat reservations during booking)
export const seatHolds = pgTable("seat_holds", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  showtimeId: integer("showtime_id").references(() => showtimes.id).notNull(),
  seatId: integer("seat_id").references(() => seats.id).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  seatHolds: many(seatHolds),
  watchlist: many(watchlist),
}));

export const moviesRelations = relations(movies, ({ many }) => ({
  showtimes: many(showtimes),
  watchlist: many(watchlist),
}));

export const watchlistRelations = relations(watchlist, ({ one }) => ({
  user: one(users, {
    fields: [watchlist.userId],
    references: [users.id],
  }),
  movie: one(movies, {
    fields: [watchlist.movieId],
    references: [movies.id],
  }),
}));

export const theatersRelations = relations(theaters, ({ many }) => ({
  screens: many(screens),
}));

export const screensRelations = relations(screens, ({ one, many }) => ({
  theater: one(theaters, {
    fields: [screens.theaterId],
    references: [theaters.id],
  }),
  seats: many(seats),
  showtimes: many(showtimes),
}));

export const showtimesRelations = relations(showtimes, ({ one, many }) => ({
  movie: one(movies, {
    fields: [showtimes.movieId],
    references: [movies.id],
  }),
  screen: one(screens, {
    fields: [showtimes.screenId],
    references: [screens.id],
  }),
  bookings: many(bookings),
  bookedSeats: many(bookedSeats),
  seatHolds: many(seatHolds),
}));

export const seatsRelations = relations(seats, ({ one, many }) => ({
  screen: one(screens, {
    fields: [seats.screenId],
    references: [screens.id],
  }),
  bookedSeats: many(bookedSeats),
  seatHolds: many(seatHolds),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  showtime: one(showtimes, {
    fields: [bookings.showtimeId],
    references: [showtimes.id],
  }),
  bookedSeats: many(bookedSeats),
}));

export const bookedSeatsRelations = relations(bookedSeats, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookedSeats.bookingId],
    references: [bookings.id],
  }),
  seat: one(seats, {
    fields: [bookedSeats.seatId],
    references: [seats.id],
  }),
  showtime: one(showtimes, {
    fields: [bookedSeats.showtimeId],
    references: [showtimes.id],
  }),
}));

export const seatHoldsRelations = relations(seatHolds, ({ one }) => ({
  user: one(users, {
    fields: [seatHolds.userId],
    references: [users.id],
  }),
  showtime: one(showtimes, {
    fields: [seatHolds.showtimeId],
    references: [showtimes.id],
  }),
  seat: one(seats, {
    fields: [seatHolds.seatId],
    references: [seats.id],
  }),
}));

// Insert schemas
export const insertMovieSchema = createInsertSchema(movies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTheaterSchema = createInsertSchema(theaters).omit({
  id: true,
  createdAt: true,
});

export const insertScreenSchema = createInsertSchema(screens).omit({
  id: true,
  createdAt: true,
});

export const insertShowtimeSchema = createInsertSchema(showtimes).omit({
  id: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSeatHoldSchema = createInsertSchema(seatHolds).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Movie = typeof movies.$inferSelect;
export type InsertMovie = z.infer<typeof insertMovieSchema>;
export type Theater = typeof theaters.$inferSelect;
export type InsertTheater = z.infer<typeof insertTheaterSchema>;
export type Screen = typeof screens.$inferSelect;
export type InsertScreen = z.infer<typeof insertScreenSchema>;
export type Showtime = typeof showtimes.$inferSelect;
export type InsertShowtime = z.infer<typeof insertShowtimeSchema>;
export type Seat = typeof seats.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type BookedSeat = typeof bookedSeats.$inferSelect;
export type SeatHold = typeof seatHolds.$inferSelect;
export type InsertSeatHold = z.infer<typeof insertSeatHoldSchema>;

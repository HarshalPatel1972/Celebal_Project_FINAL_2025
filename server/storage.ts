import {
  users,
  movies,
  theaters,
  screens,
  seats,
  showtimes,
  bookings,
  bookedSeats,
  seatHolds,
  type User,
  type UpsertUser,
  type Movie,
  type InsertMovie,
  type Theater,
  type InsertTheater,
  type Screen,
  type InsertScreen,
  type Showtime,
  type InsertShowtime,
  type Seat,
  type Booking,
  type InsertBooking,
  type BookedSeat,
  type SeatHold,
  type InsertSeatHold,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, asc } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Movie operations
  getMovies(): Promise<Movie[]>;
  getNowShowingMovies(): Promise<Movie[]>;
  getComingSoonMovies(): Promise<Movie[]>;
  getMovieById(id: number): Promise<Movie | undefined>;
  getMovieByTmdbId(tmdbId: number): Promise<Movie | undefined>;
  createMovie(movie: InsertMovie): Promise<Movie>;
  updateMovie(id: number, movie: Partial<InsertMovie>): Promise<Movie>;
  
  // Theater operations
  getTheaters(): Promise<Theater[]>;
  getTheaterById(id: number): Promise<Theater | undefined>;
  createTheater(theater: InsertTheater): Promise<Theater>;
  
  // Screen operations
  getScreensByTheaterId(theaterId: number): Promise<Screen[]>;
  getScreenById(id: number): Promise<Screen | undefined>;
  createScreen(screen: InsertScreen): Promise<Screen>;
  
  // Seat operations
  getSeatsByScreenId(screenId: number): Promise<Seat[]>;
  getSeatById(id: number): Promise<Seat | undefined>;
  createSeat(seat: Omit<Seat, 'id'>): Promise<Seat>;
  
  // Showtime operations
  getShowtimesByMovieId(movieId: number): Promise<Showtime[]>;
  getShowtimesByDate(date: string): Promise<Showtime[]>;
  getShowtimeById(id: number): Promise<Showtime | undefined>;
  createShowtime(showtime: InsertShowtime): Promise<Showtime>;
  
  // Booking operations
  getBookingsByUserId(userId: string): Promise<Booking[]>;
  getBookingById(id: number): Promise<Booking | undefined>;
  getBookingByReference(reference: string): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking>;
  
  // Booked seat operations
  getBookedSeatsByBookingId(bookingId: number): Promise<BookedSeat[]>;
  getBookedSeatsByShowtimeId(showtimeId: number): Promise<BookedSeat[]>;
  createBookedSeat(bookedSeat: Omit<BookedSeat, 'id' | 'createdAt'>): Promise<BookedSeat>;
  
  // Seat hold operations
  getSeatHoldsByUserId(userId: string): Promise<SeatHold[]>;
  getSeatHoldsByShowtimeId(showtimeId: number): Promise<SeatHold[]>;
  createSeatHold(seatHold: InsertSeatHold): Promise<SeatHold>;
  deleteSeatHold(id: number): Promise<void>;
  deleteExpiredSeatHolds(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Movie operations
  async getMovies(): Promise<Movie[]> {
    return await db.select().from(movies).orderBy(desc(movies.createdAt));
  }

  async getNowShowingMovies(): Promise<Movie[]> {
    return await db.select().from(movies).where(eq(movies.isNowShowing, true)).orderBy(desc(movies.releaseDate));
  }

  async getComingSoonMovies(): Promise<Movie[]> {
    return await db.select().from(movies).where(eq(movies.isComingSoon, true)).orderBy(asc(movies.releaseDate));
  }

  async getMovieById(id: number): Promise<Movie | undefined> {
    const [movie] = await db.select().from(movies).where(eq(movies.id, id));
    return movie;
  }

  async getMovieByTmdbId(tmdbId: number): Promise<Movie | undefined> {
    const [movie] = await db.select().from(movies).where(eq(movies.tmdbId, tmdbId));
    return movie;
  }

  async createMovie(movie: InsertMovie): Promise<Movie> {
    const [createdMovie] = await db.insert(movies).values(movie).returning();
    return createdMovie;
  }

  async updateMovie(id: number, movie: Partial<InsertMovie>): Promise<Movie> {
    const [updatedMovie] = await db
      .update(movies)
      .set({ ...movie, updatedAt: new Date() })
      .where(eq(movies.id, id))
      .returning();
    return updatedMovie;
  }

  // Theater operations
  async getTheaters(): Promise<Theater[]> {
    return await db.select().from(theaters);
  }

  async getTheaterById(id: number): Promise<Theater | undefined> {
    const [theater] = await db.select().from(theaters).where(eq(theaters.id, id));
    return theater;
  }

  async createTheater(theater: InsertTheater): Promise<Theater> {
    const [createdTheater] = await db.insert(theaters).values(theater).returning();
    return createdTheater;
  }

  // Screen operations
  async getScreensByTheaterId(theaterId: number): Promise<Screen[]> {
    return await db.select().from(screens).where(eq(screens.theaterId, theaterId));
  }

  async getScreenById(id: number): Promise<Screen | undefined> {
    const [screen] = await db.select().from(screens).where(eq(screens.id, id));
    return screen;
  }

  async createScreen(screen: InsertScreen): Promise<Screen> {
    const [createdScreen] = await db.insert(screens).values(screen).returning();
    return createdScreen;
  }

  // Seat operations
  async getSeatsByScreenId(screenId: number): Promise<Seat[]> {
    return await db.select().from(seats).where(eq(seats.screenId, screenId)).orderBy(asc(seats.row), asc(seats.column));
  }

  async getSeatById(id: number): Promise<Seat | undefined> {
    const [seat] = await db.select().from(seats).where(eq(seats.id, id));
    return seat;
  }

  async createSeat(seat: Omit<Seat, 'id'>): Promise<Seat> {
    const [createdSeat] = await db.insert(seats).values(seat).returning();
    return createdSeat;
  }

  // Showtime operations
  async getShowtimesByMovieId(movieId: number): Promise<Showtime[]> {
    return await db.select().from(showtimes).where(eq(showtimes.movieId, movieId)).orderBy(asc(showtimes.showDate), asc(showtimes.showTime));
  }

  async getShowtimesByDate(date: string): Promise<Showtime[]> {
    return await db.select().from(showtimes).where(eq(showtimes.showDate, date)).orderBy(asc(showtimes.showTime));
  }

  async getShowtimeById(id: number): Promise<Showtime | undefined> {
    const [showtime] = await db.select().from(showtimes).where(eq(showtimes.id, id));
    return showtime;
  }

  async createShowtime(showtime: InsertShowtime): Promise<Showtime> {
    const [createdShowtime] = await db.insert(showtimes).values(showtime).returning();
    return createdShowtime;
  }

  // Booking operations
  async getBookingsByUserId(userId: string): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.userId, userId)).orderBy(desc(bookings.createdAt));
  }

  async getBookingById(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getBookingByReference(reference: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.bookingReference, reference));
    return booking;
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [createdBooking] = await db.insert(bookings).values(booking).returning();
    return createdBooking;
  }

  async updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking> {
    const [updatedBooking] = await db
      .update(bookings)
      .set({ ...booking, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking;
  }

  // Booked seat operations
  async getBookedSeatsByBookingId(bookingId: number): Promise<BookedSeat[]> {
    return await db.select().from(bookedSeats).where(eq(bookedSeats.bookingId, bookingId));
  }

  async getBookedSeatsByShowtimeId(showtimeId: number): Promise<BookedSeat[]> {
    return await db.select().from(bookedSeats).where(eq(bookedSeats.showtimeId, showtimeId));
  }

  async createBookedSeat(bookedSeat: Omit<BookedSeat, 'id' | 'createdAt'>): Promise<BookedSeat> {
    const [createdBookedSeat] = await db.insert(bookedSeats).values(bookedSeat).returning();
    return createdBookedSeat;
  }

  // Seat hold operations
  async getSeatHoldsByUserId(userId: string): Promise<SeatHold[]> {
    return await db.select().from(seatHolds).where(eq(seatHolds.userId, userId));
  }

  async getSeatHoldsByShowtimeId(showtimeId: number): Promise<SeatHold[]> {
    return await db.select().from(seatHolds).where(eq(seatHolds.showtimeId, showtimeId));
  }

  async createSeatHold(seatHold: InsertSeatHold): Promise<SeatHold> {
    const [createdSeatHold] = await db.insert(seatHolds).values(seatHold).returning();
    return createdSeatHold;
  }

  async deleteSeatHold(id: number): Promise<void> {
    await db.delete(seatHolds).where(eq(seatHolds.id, id));
  }

  async deleteExpiredSeatHolds(): Promise<void> {
    await db.delete(seatHolds).where(lte(seatHolds.expiresAt, new Date()));
  }
}

export const storage = new DatabaseStorage();

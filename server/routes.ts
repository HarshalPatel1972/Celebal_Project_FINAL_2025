import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { tmdbService } from "./services/tmdb";
import { razorpayService } from "./services/razorpay";
import { insertMovieSchema, insertShowtimeSchema, insertBookingSchema, insertSeatHoldSchema } from "@shared/schema";
import { nanoid } from "nanoid";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Movie routes
  app.get('/api/movies', async (req, res) => {
    try {
      const movies = await storage.getMovies();
      res.json(movies);
    } catch (error) {
      console.error("Error fetching movies:", error);
      res.status(500).json({ message: "Failed to fetch movies" });
    }
  });

  app.get('/api/movies/now-showing', async (req, res) => {
    try {
      const movies = await storage.getNowShowingMovies();
      res.json(movies);
    } catch (error) {
      console.error("Error fetching now showing movies:", error);
      res.status(500).json({ message: "Failed to fetch now showing movies" });
    }
  });

  app.get('/api/movies/coming-soon', async (req, res) => {
    try {
      const movies = await storage.getComingSoonMovies();
      res.json(movies);
    } catch (error) {
      console.error("Error fetching coming soon movies:", error);
      res.status(500).json({ message: "Failed to fetch coming soon movies" });
    }
  });

  app.get('/api/movies/:id', async (req, res) => {
    try {
      const movieId = parseInt(req.params.id);
      const movie = await storage.getMovieById(movieId);
      
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }

      res.json(movie);
    } catch (error) {
      console.error("Error fetching movie:", error);
      res.status(500).json({ message: "Failed to fetch movie" });
    }
  });

  app.get('/api/movies/:id/showtimes', async (req, res) => {
    try {
      const movieId = parseInt(req.params.id);
      const showtimes = await storage.getShowtimesByMovieId(movieId);
      res.json(showtimes);
    } catch (error) {
      console.error("Error fetching showtimes:", error);
      res.status(500).json({ message: "Failed to fetch showtimes" });
    }
  });

  // Sync movies from TMDb
  app.post('/api/movies/sync', async (req, res) => {
    try {
      const [nowPlayingMovies, upcomingMovies] = await Promise.all([
        tmdbService.getNowPlayingMovies(),
        tmdbService.getUpcomingMovies()
      ]);

      const syncedMovies = [];

      // Process now playing movies
      for (const tmdbMovie of nowPlayingMovies.slice(0, 10)) {
        const existingMovie = await storage.getMovieByTmdbId(tmdbMovie.id);
        
        if (!existingMovie) {
          const movieData = tmdbService.transformMovieData(tmdbMovie);
          const trailerUrl = await tmdbService.getMovieTrailer(tmdbMovie.id);
          
          const newMovie = await storage.createMovie({
            ...movieData,
            trailerUrl,
            isNowShowing: true,
            isComingSoon: false,
          });
          
          syncedMovies.push(newMovie);
        }
      }

      // Process upcoming movies
      for (const tmdbMovie of upcomingMovies.slice(0, 10)) {
        const existingMovie = await storage.getMovieByTmdbId(tmdbMovie.id);
        
        if (!existingMovie) {
          const movieData = tmdbService.transformMovieData(tmdbMovie);
          const trailerUrl = await tmdbService.getMovieTrailer(tmdbMovie.id);
          
          const newMovie = await storage.createMovie({
            ...movieData,
            trailerUrl,
            isNowShowing: false,
            isComingSoon: true,
          });
          
          syncedMovies.push(newMovie);
        }
      }

      res.json({ 
        message: `Synced ${syncedMovies.length} movies from TMDb`,
        movies: syncedMovies
      });
    } catch (error) {
      console.error("Error syncing movies:", error);
      res.status(500).json({ message: "Failed to sync movies from TMDb" });
    }
  });

  // Theater routes
  app.get('/api/theaters', async (req, res) => {
    try {
      const theaters = await storage.getTheaters();
      res.json(theaters);
    } catch (error) {
      console.error("Error fetching theaters:", error);
      res.status(500).json({ message: "Failed to fetch theaters" });
    }
  });

  app.get('/api/theaters/:id/screens', async (req, res) => {
    try {
      const theaterId = parseInt(req.params.id);
      const screens = await storage.getScreensByTheaterId(theaterId);
      res.json(screens);
    } catch (error) {
      console.error("Error fetching screens:", error);
      res.status(500).json({ message: "Failed to fetch screens" });
    }
  });

  // Showtime routes
  app.get('/api/showtimes/:id', async (req, res) => {
    try {
      const showtimeId = parseInt(req.params.id);
      const showtime = await storage.getShowtimeById(showtimeId);
      
      if (!showtime) {
        return res.status(404).json({ message: "Showtime not found" });
      }

      res.json(showtime);
    } catch (error) {
      console.error("Error fetching showtime:", error);
      res.status(500).json({ message: "Failed to fetch showtime" });
    }
  });

  app.get('/api/showtimes/:id/seats', async (req, res) => {
    try {
      const showtimeId = parseInt(req.params.id);
      const showtime = await storage.getShowtimeById(showtimeId);
      
      if (!showtime) {
        return res.status(404).json({ message: "Showtime not found" });
      }

      const [seats, bookedSeats, heldSeats] = await Promise.all([
        storage.getSeatsByScreenId(showtime.screenId),
        storage.getBookedSeatsByShowtimeId(showtimeId),
        storage.getSeatHoldsByShowtimeId(showtimeId)
      ]);

      const seatMap = seats.map(seat => ({
        ...seat,
        isBooked: bookedSeats.some(bs => bs.seatId === seat.id),
        isHeld: heldSeats.some(hs => hs.seatId === seat.id && hs.expiresAt > new Date())
      }));

      res.json(seatMap);
    } catch (error) {
      console.error("Error fetching seats:", error);
      res.status(500).json({ message: "Failed to fetch seats" });
    }
  });

  // Seat hold routes
  app.post('/api/seats/hold', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { showtimeId, seatIds } = req.body;

      if (!showtimeId || !seatIds || !Array.isArray(seatIds)) {
        return res.status(400).json({ message: "Invalid request data" });
      }

      // Clean up expired holds first
      await storage.deleteExpiredSeatHolds();

      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minute hold

      const heldSeats = [];
      for (const seatId of seatIds) {
        const heldSeat = await storage.createSeatHold({
          userId,
          showtimeId: parseInt(showtimeId),
          seatId: parseInt(seatId),
          expiresAt,
        });
        heldSeats.push(heldSeat);
      }

      res.json({ 
        message: "Seats held successfully",
        heldSeats,
        expiresAt
      });
    } catch (error) {
      console.error("Error holding seats:", error);
      res.status(500).json({ message: "Failed to hold seats" });
    }
  });

  app.delete('/api/seats/hold/:id', isAuthenticated, async (req: any, res) => {
    try {
      const holdId = parseInt(req.params.id);
      await storage.deleteSeatHold(holdId);
      res.json({ message: "Seat hold released" });
    } catch (error) {
      console.error("Error releasing seat hold:", error);
      res.status(500).json({ message: "Failed to release seat hold" });
    }
  });

  // Booking routes
  app.get('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookings = await storage.getBookingsByUserId(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get('/api/bookings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const booking = await storage.getBookingById(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Check if user owns this booking
      const userId = req.user.claims.sub;
      if (booking.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const bookedSeats = await storage.getBookedSeatsByBookingId(bookingId);
      
      res.json({
        ...booking,
        bookedSeats
      });
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  app.post('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { showtimeId, seatIds, totalAmount } = req.body;

      if (!showtimeId || !seatIds || !Array.isArray(seatIds) || !totalAmount) {
        return res.status(400).json({ message: "Invalid booking data" });
      }

      // Generate booking reference
      const bookingReference = `SN${Date.now()}${nanoid(6)}`;

      // Create Razorpay order
      const razorpayOrder = await razorpayService.createOrder(
        totalAmount,
        'INR',
        bookingReference
      );

      // Create booking
      const booking = await storage.createBooking({
        userId,
        showtimeId: parseInt(showtimeId),
        bookingReference,
        totalAmount: totalAmount.toString(),
        paymentStatus: 'pending',
        status: 'confirmed',
      });

      res.json({
        booking,
        razorpayOrder,
        razorpayKeyId: razorpayService.getKeyId()
      });
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.post('/api/bookings/verify-payment', isAuthenticated, async (req: any, res) => {
    try {
      const { bookingId, razorpayPayment, seatIds } = req.body;

      if (!bookingId || !razorpayPayment || !seatIds) {
        return res.status(400).json({ message: "Invalid payment data" });
      }

      // Verify payment with Razorpay
      const isPaymentValid = await razorpayService.verifyPayment(razorpayPayment);
      
      if (!isPaymentValid) {
        return res.status(400).json({ message: "Payment verification failed" });
      }

      // Update booking status
      const updatedBooking = await storage.updateBooking(parseInt(bookingId), {
        paymentStatus: 'completed',
        paymentId: razorpayPayment.razorpay_payment_id,
      });

      // Create booked seats
      const bookedSeats = [];
      for (const seatId of seatIds) {
        const bookedSeat = await storage.createBookedSeat({
          bookingId: parseInt(bookingId),
          seatId: parseInt(seatId),
          showtimeId: updatedBooking.showtimeId,
          isHeld: false,
          heldUntil: null,
        });
        bookedSeats.push(bookedSeat);
      }

      // Clear seat holds for this user and showtime
      const userHolds = await storage.getSeatHoldsByUserId(req.user.claims.sub);
      for (const hold of userHolds) {
        if (hold.showtimeId === updatedBooking.showtimeId) {
          await storage.deleteSeatHold(hold.id);
        }
      }

      res.json({
        message: "Payment verified and booking confirmed",
        booking: updatedBooking,
        bookedSeats
      });
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ message: "Failed to verify payment" });
    }
  });

  // Utility routes
  app.post('/api/cleanup-expired-holds', async (req, res) => {
    try {
      await storage.deleteExpiredSeatHolds();
      res.json({ message: "Expired seat holds cleaned up" });
    } catch (error) {
      console.error("Error cleaning up expired holds:", error);
      res.status(500).json({ message: "Failed to cleanup expired holds" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import { db } from './db';
import { theaters, screens, seats, showtimes, movies } from '@shared/schema';
import { eq } from 'drizzle-orm';

interface TheaterData {
  name: string;
  location: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  tier: 'tier1' | 'tier2';
  amenities: string[];
}

const sampleTheaters: TheaterData[] = [
  {
    name: "PVR Cinemas",
    location: "Phoenix Marketcity",
    address: "Phoenix Marketcity, LBS Marg, Kurla West",
    city: "Mumbai",
    state: "Maharashtra", 
    pincode: "400070",
    latitude: 19.0760,
    longitude: 72.8777,
    tier: "tier1",
    amenities: ["IMAX", "Dolby Atmos", "Recliner Seats", "Food Court", "Parking"]
  },
  {
    name: "INOX Megaplex",
    location: "Select City Walk",
    address: "Select City Walk, Saket District Centre",
    city: "Delhi",
    state: "Delhi",
    pincode: "110017",
    latitude: 28.5244,
    longitude: 77.2066,
    tier: "tier1",
    amenities: ["IMAX", "Premium Screens", "Dolby Atmos", "Valet Parking", "Lounge"]
  },
  {
    name: "Cinepolis",
    location: "Forum Mall",
    address: "Forum Mall, Hosur Road",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560029",
    latitude: 12.9716,
    longitude: 77.5946,
    tier: "tier1",
    amenities: ["4DX", "VIP Recliners", "Dolby Atmos", "Café", "Gaming Zone"]
  },
  {
    name: "Raj Mandir Cinema",
    location: "MI Road",
    address: "Bhagwan Das Road, MI Road",
    city: "Jaipur",
    state: "Rajasthan",
    pincode: "302001",
    latitude: 26.9124,
    longitude: 75.7873,
    tier: "tier2",
    amenities: ["Heritage Theater", "AC", "Parking", "Snacks Counter"]
  },
  {
    name: "Seasons Mall PVR",
    location: "Seasons Mall",
    address: "Seasons Mall, Magarpatta Road",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411028",
    latitude: 18.5204,
    longitude: 73.8567,
    tier: "tier2",
    amenities: ["Premium Screens", "Dolby Digital", "Food Court", "Parking"]
  },
  {
    name: "Fun Republic",
    location: "SG Highway",
    address: "Anand Nagar, SG Highway",
    city: "Ahmedabad",
    state: "Gujarat",
    pincode: "380015",
    latitude: 23.0225,
    longitude: 72.5714,
    tier: "tier2",
    amenities: ["Multiplex", "AC", "Parking", "Restaurant", "Gaming"]
  }
];

export async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Create theaters
    console.log('📍 Creating theaters...');
    const theaterInserts = [];
    for (const theaterData of sampleTheaters) {
      const [theater] = await db.insert(theaters).values(theaterData).returning();
      theaterInserts.push(theater);
    }
    
    // Create screens and seats for each theater
    console.log('🎬 Creating screens and seats...');
    for (const theater of theaterInserts) {
      const screenCount = Math.floor(Math.random() * 3) + 3; // 3-5 screens per theater
      
      for (let screenNum = 1; screenNum <= screenCount; screenNum++) {
        const [screen] = await db.insert(screens).values({
          theaterId: theater.id,
          screenNumber: screenNum,
          capacity: 120,
          screenType: screenNum === 1 ? 'imax' : 'standard'
        }).returning();
        
        // Create seats for this screen
        const seatTypes = ['regular', 'premium', 'recliner'];
        const basePrices = { regular: 150, premium: 250, recliner: 400 };
        const tierMultiplier = theater.tier === 'tier1' ? 1.133 : 1; // +₹20 for tier1
        
        for (let row = 1; row <= 12; row++) {
          const rowLetter = String.fromCharCode(64 + row); // A, B, C, etc.
          const seatsPerRow = row <= 3 ? 8 : row <= 8 ? 10 : 12;
          
          for (let col = 1; col <= seatsPerRow; col++) {
            let seatType = 'regular';
            if (row <= 3) seatType = 'recliner';
            else if (row <= 8) seatType = 'premium';
            
            const basePrice = basePrices[seatType as keyof typeof basePrices];
            const finalPrice = Math.round(basePrice * tierMultiplier);
            
            await db.insert(seats).values({
              screenId: screen.id,
              seatNumber: `${rowLetter}${col}`,
              row: rowLetter,
              column: col,
              seatType,
              price: finalPrice.toString()
            });
          }
        }
      }
    }
    
    // Create showtimes for existing movies
    console.log('⏰ Creating showtimes...');
    const existingMovies = await db.select().from(movies);
    const allScreens = await db.select().from(screens);
    
    const showtimes = ['10:00', '13:15', '16:30', '19:45', '22:00'];
    const today = new Date();
    
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const showDate = new Date(today);
      showDate.setDate(today.getDate() + dayOffset);
      const dateStr = showDate.toISOString().split('T')[0];
      
      for (const movie of existingMovies) {
        // Each movie gets 2-3 random screens per day
        const movieScreens = allScreens.slice(0, Math.floor(Math.random() * 2) + 2);
        
        for (const screen of movieScreens) {
          // Each screen gets 3-4 showtimes
          const movieShowtimes = showtimes.slice(0, Math.floor(Math.random() * 2) + 3);
          
          for (const showtime of movieShowtimes) {
            const hour = parseInt(showtime.split(':')[0]);
            let basePrice = 150;
            
            // Apply time-based pricing
            if (hour < 12) basePrice *= 0.9; // Morning 10% off
            else if (hour >= 18 && hour <= 21) basePrice *= 1.1; // Evening 10% extra
            
            // Weekend pricing
            const isWeekend = showDate.getDay() === 0 || showDate.getDay() === 6;
            if (isWeekend) basePrice += 50;
            
            await db.insert(showtimes).values({
              movieId: movie.id,
              screenId: screen.id,
              showDate: dateStr,
              showTime: showtime,
              price: Math.round(basePrice).toString(),
              availableSeats: 120
            });
          }
        }
      }
    }
    
    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Created: ${theaterInserts.length} theaters, ${allScreens.length} screens, and showtimes for ${existingMovies.length} movies`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Only run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  seedDatabase().then(() => {
    console.log('🎉 Seeding complete!');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });
}
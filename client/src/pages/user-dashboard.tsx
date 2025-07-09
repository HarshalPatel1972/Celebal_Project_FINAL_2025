import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  Clock,
  MapPin,
  Star,
  Trophy,
  Ticket,
  Film,
  Share,
  RotateCcw,
  Play,
  ArrowRight,
  BookOpen
} from "lucide-react";
import { useEffect } from "react";
import type { Booking } from "@shared/schema";

export default function UserDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to view your dashboard.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 2000);
    }
  }, [isAuthenticated, toast]);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['/api/bookings'],
    enabled: isAuthenticated,
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return false;
      }
      return failureCount < 3;
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cinema-black">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Please Sign In</h1>
            <p className="text-gray-300 mb-4">You need to be signed in to view your dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cinema-black">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-cinema-dark rounded w-1/2 mb-8"></div>
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-cinema-dark rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getBookingStatus = (booking: Booking) => {
    if (booking.status === 'cancelled') return { status: 'CANCELLED', color: 'bg-red-500' };
    if (booking.status === 'used') return { status: 'WATCHED', color: 'bg-gray-500' };
    
    // Check if showtime is in the past
    const now = new Date();
    const bookingDate = new Date(booking.createdAt);
    
    if (bookingDate > now) {
      return { status: 'UPCOMING', color: 'bg-spotlight-yellow text-cinema-black' };
    }
    
    return { status: 'CONFIRMED', color: 'bg-green-500' };
  };

  const getSeatsString = (booking: any) => {
    if (booking.bookedSeats && booking.bookedSeats.length > 0) {
      return booking.bookedSeats.map((bs: any) => bs.seat?.seatNumber || 'N/A').join(', ');
    }
    return 'N/A';
  };

  const upcomingBookings = bookings.filter((booking: any) => {
    const status = getBookingStatus(booking);
    return status.status === 'UPCOMING' || status.status === 'CONFIRMED';
  });

  const pastBookings = bookings.filter((booking: any) => {
    const status = getBookingStatus(booking);
    return status.status === 'WATCHED' || status.status === 'CANCELLED';
  });

  const totalBookings = bookings.length;
  const totalSpent = bookings.reduce((sum: number, booking: Booking) => {
    return sum + parseFloat(booking.totalAmount);
  }, 0);

  return (
    <div className="min-h-screen bg-cinema-black text-white mobile-content">
      <Header />
      
      {/* Header Section */}
      <section className="py-12 bg-cinema-dark">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-spotlight-orange mb-4">
                YOUR CINEMATIC JOURNEY
              </h1>
              <p className="text-gray-300 text-lg">
                Relive your movie moments and discover new favorites
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              <Card className="bg-cinema-black border-cinema-dark">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-spotlight-gradient rounded-full flex items-center justify-center mx-auto mb-3">
                    <Ticket className="h-6 w-6 text-cinema-black" />
                  </div>
                  <div className="text-2xl font-bold text-spotlight-orange mb-1">
                    {totalBookings}
                  </div>
                  <div className="text-gray-400 text-sm">Total Bookings</div>
                </CardContent>
              </Card>

              <Card className="bg-cinema-black border-cinema-dark">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Film className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-spotlight-orange mb-1">
                    {pastBookings.filter(b => getBookingStatus(b).status === 'WATCHED').length}
                  </div>
                  <div className="text-gray-400 text-sm">Movies Watched</div>
                </CardContent>
              </Card>

              <Card className="bg-cinema-black border-cinema-dark">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-spotlight-orange mb-1">
                    ${totalSpent.toFixed(0)}
                  </div>
                  <div className="text-gray-400 text-sm">Total Spent</div>
                </CardContent>
              </Card>

              <Card className="bg-cinema-black border-cinema-dark">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-spotlight-yellow rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar className="h-6 w-6 text-cinema-black" />
                  </div>
                  <div className="text-2xl font-bold text-spotlight-orange mb-1">
                    {upcomingBookings.length}
                  </div>
                  <div className="text-gray-400 text-sm">Upcoming</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Timeline */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {bookings.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-cinema-dark rounded-full flex items-center justify-center mx-auto mb-6">
                  <Ticket className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-400 mb-4">No Bookings Yet</h3>
                <p className="text-gray-300 mb-8">Start your cinematic journey by booking your first movie!</p>
                <Button 
                  onClick={() => setLocation('/')}
                  className="bg-spotlight-gradient text-cinema-black hover:shadow-lg hover:shadow-spotlight-orange/30 transition-all duration-300"
                >
                  <Film className="mr-2 h-4 w-4" />
                  Browse Movies
                </Button>
              </div>
            ) : (
              <div className="relative">
                {/* Film strip holes */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-cinema-black border-r-2 border-spotlight-orange">
                  <div className="space-y-8 py-8">
                    {bookings.map((_, index) => (
                      <div key={index} className="w-4 h-4 bg-spotlight-orange rounded-full mx-auto"></div>
                    ))}
                  </div>
                </div>
                
                <div className="ml-12 space-y-6">
                  {bookings.map((booking: any) => {
                    const bookingStatus = getBookingStatus(booking);
                    
                    return (
                      <Card 
                        key={booking.id}
                        className="bg-cinema-black border-l-4 border-spotlight-orange hover:shadow-lg hover:shadow-spotlight-orange/20 transition-all duration-300"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                              <div className="w-16 h-24 bg-cinema-dark rounded-lg flex items-center justify-center">
                                <Film className="h-8 w-8 text-gray-400" />
                              </div>
                              <div>
                                <h3 className="text-xl font-semibold text-white mb-1">
                                  Movie Booking #{booking.bookingReference.slice(-6)}
                                </h3>
                                <p className="text-gray-400 mb-2">
                                  {formatDate(booking.createdAt)}
                                </p>
                                <div className="flex items-center space-x-2">
                                  <Badge className={`${bookingStatus.color} text-white`}>
                                    {bookingStatus.status}
                                  </Badge>
                                  <span className="text-gray-400 text-sm">
                                    Seats: {getSeatsString(booking)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold text-spotlight-orange">
                                ${parseFloat(booking.totalAmount).toFixed(2)}
                              </p>
                              <p className="text-sm text-gray-400">
                                {booking.bookingReference}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            <Button 
                              size="sm"
                              onClick={() => setLocation(`/booking-confirmation/${booking.id}`)}
                              className="bg-spotlight-orange text-cinema-black hover:bg-spotlight-yellow transition-colors"
                            >
                              View Ticket
                            </Button>
                            
                            {bookingStatus.status === 'WATCHED' && (
                              <Button 
                                size="sm"
                                variant="outline"
                                className="border-gray-600 text-gray-300 hover:bg-gray-600 transition-colors"
                              >
                                <Star className="mr-1 h-3 w-3" />
                                Rate Movie
                              </Button>
                            )}
                            
                            {bookingStatus.status === 'UPCOMING' && (
                              <Button 
                                size="sm"
                                variant="outline"
                                className="border-gray-600 text-gray-300 hover:bg-gray-600 transition-colors"
                              >
                                <Calendar className="mr-1 h-3 w-3" />
                                Add to Calendar
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Achievement Badges */}
      {bookings.length > 0 && (
        <section className="py-16 bg-cinema-dark">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-spotlight-orange mb-8">
                ACHIEVEMENTS UNLOCKED
              </h2>
              
              <div className="flex justify-center space-x-8">
                {totalBookings >= 1 && (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-spotlight-gradient rounded-full flex items-center justify-center mb-2">
                      <Trophy className="h-8 w-8 text-cinema-black" />
                    </div>
                    <p className="text-sm text-gray-300">Movie Enthusiast</p>
                    <p className="text-xs text-gray-400">First booking</p>
                  </div>
                )}
                
                {totalBookings >= 5 && (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-2">
                      <Star className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-sm text-gray-300">Regular Viewer</p>
                    <p className="text-xs text-gray-400">5+ bookings</p>
                  </div>
                )}
                
                {totalBookings >= 10 && (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-2">
                      <Film className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-sm text-gray-300">Cinema Lover</p>
                    <p className="text-xs text-gray-400">10+ bookings</p>
                  </div>
                )}
                
                {totalSpent >= 100 && (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-spotlight-yellow rounded-full flex items-center justify-center mb-2">
                      <BookOpen className="h-8 w-8 text-cinema-black" />
                    </div>
                    <p className="text-sm text-gray-300">Premium Member</p>
                    <p className="text-xs text-gray-400">$100+ spent</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Check, 
  Download, 
  Mail, 
  Share, 
  Home,
  Calendar,
  MapPin,
  Clock,
  Users,
  Film
} from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";

export default function BookingConfirmation() {
  const { bookingId } = useParams();
  const [location, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to view bookings.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 2000);
    }
  }, [isAuthenticated, toast]);

  const { data: booking, isLoading } = useQuery({
    queryKey: ['/api/bookings', bookingId],
    enabled: !!bookingId && isAuthenticated,
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

  // Fetch movie and showtime details if booking exists
  const { data: movie } = useQuery({
    queryKey: ['/api/movies', booking?.showtime?.movieId],
    enabled: !!booking?.showtime?.movieId,
  });

  const { data: showtime } = useQuery({
    queryKey: ['/api/showtimes', booking?.showtimeId],
    enabled: !!booking?.showtimeId,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cinema-black">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Please Sign In</h1>
            <p className="text-gray-300 mb-4">You need to be signed in to view bookings.</p>
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
          <div className="max-w-2xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-cinema-dark rounded w-1/2 mx-auto mb-8"></div>
              <div className="h-96 bg-cinema-dark rounded-xl mb-6"></div>
              <div className="flex gap-4">
                <div className="h-12 bg-cinema-dark rounded flex-1"></div>
                <div className="h-12 bg-cinema-dark rounded flex-1"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-cinema-black">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Booking Not Found</h1>
            <p className="text-gray-300 mb-6">The booking you're looking for doesn't exist or you don't have access to it.</p>
            <Button onClick={() => setLocation('/')}>
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getBookedSeatsString = () => {
    if (booking.bookedSeats && booking.bookedSeats.length > 0) {
      return booking.bookedSeats.map((bs: any) => bs.seat?.seatNumber || 'N/A').join(', ');
    }
    return 'N/A';
  };

  const downloadTicket = () => {
    // Create a downloadable ticket (simplified implementation)
    const ticketData = {
      bookingRef: booking.bookingReference,
      movie: movie?.title || 'Movie',
      showtime: showtime ? `${formatDate(showtime.showDate)} at ${formatTime(showtime.showTime)}` : 'N/A',
      seats: getBookedSeatsString(),
      total: `$${parseFloat(booking.totalAmount).toFixed(2)}`,
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(ticketData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `spotlight-ticket-${booking.bookingReference}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    toast({
      title: "Ticket Downloaded",
      description: "Your ticket has been downloaded successfully.",
    });
  };

  const emailTicket = () => {
    const subject = `Spotlight Now - Booking Confirmation ${booking.bookingReference}`;
    const body = `Your booking has been confirmed!\n\nBooking Reference: ${booking.bookingReference}\nMovie: ${movie?.title || 'N/A'}\nSeats: ${getBookedSeatsString()}\nTotal: $${parseFloat(booking.totalAmount).toFixed(2)}`;
    
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const shareTicket = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Spotlight Now - Movie Ticket',
          text: `I'm watching ${movie?.title || 'a movie'} at Spotlight Now!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "Booking link copied to clipboard.",
        });
      } catch (err) {
        console.log('Error copying to clipboard:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-cinema-gradient text-white mobile-content">
      <Header />
      
      {/* Success Header */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-spotlight-gradient rounded-full mx-auto mb-4 flex items-center justify-center spotlight-glow">
                <Check className="h-10 w-10 text-cinema-black" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-spotlight-orange mb-2">
                BOOKING CONFIRMED!
              </h1>
              <p className="text-gray-300 text-lg">
                Get ready for an amazing cinematic experience
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Digital Ticket */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-cinema-dark border-cinema-dark relative overflow-hidden">
              {/* Ticket perforation effect */}
              <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-b from-cinema-black via-transparent to-cinema-black opacity-50"></div>
              <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-b from-cinema-black via-transparent to-cinema-black opacity-50"></div>
              
              <CardContent className="p-8 relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-spotlight-gradient rounded-full flex items-center justify-center">
                      <Film className="text-cinema-black" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-spotlight-orange">SPOTLIGHT NOW</h2>
                      <p className="text-xs text-spotlight-yellow">DIGITAL TICKET</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Booking ID</p>
                    <p className="text-lg font-mono text-white">{booking.bookingReference}</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-400">Movie</p>
                      <p className="text-lg font-semibold text-white">
                        {movie?.title || 'Movie Title'}
                      </p>
                    </div>
                    
                    {showtime && (
                      <div>
                        <p className="text-sm text-gray-400">Date & Time</p>
                        <p className="text-lg font-semibold text-white">
                          {formatDate(showtime.showDate)}, {formatTime(showtime.showTime)}
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm text-gray-400">Seats</p>
                      <p className="text-lg font-semibold text-white">
                        {getBookedSeatsString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-400">Theater</p>
                      <p className="text-lg font-semibold text-white">
                        Spotlight Cinema - Screen {showtime?.screenId || 'N/A'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400">Total Paid</p>
                      <p className="text-lg font-semibold text-spotlight-orange">
                        ${parseFloat(booking.totalAmount).toFixed(2)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400">Payment Status</p>
                      <p className="text-lg font-semibold text-green-400 capitalize">
                        {booking.paymentStatus}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* QR Code */}
                <div className="flex justify-center mb-6">
                  <div className="bg-white p-4 rounded-lg">
                    <QRCodeSVG
                      value={`SPOTLIGHT-${booking.bookingReference}`}
                      size={128}
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                </div>
                
                <p className="text-sm text-gray-400 text-center">
                  Show this QR code at the theater entrance
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={downloadTicket}
                className="bg-spotlight-gradient text-cinema-black hover:shadow-lg hover:shadow-spotlight-orange/30 transition-all duration-300"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Ticket
              </Button>
              
              <Button 
                onClick={emailTicket}
                variant="outline"
                className="border-2 border-spotlight-orange text-spotlight-orange hover:bg-spotlight-orange hover:text-cinema-black transition-all duration-300"
              >
                <Mail className="mr-2 h-4 w-4" />
                Email Ticket
              </Button>
              
              <Button 
                onClick={shareTicket}
                variant="outline"
                className="border-2 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white transition-all duration-300"
              >
                <Share className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
            
            <div className="text-center mt-8">
              <Button 
                onClick={() => setLocation('/dashboard')}
                variant="ghost"
                className="text-spotlight-yellow hover:text-spotlight-orange transition-colors"
              >
                View All Bookings
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

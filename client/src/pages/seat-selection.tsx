import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/header";
import SeatMap from "@/components/seat-map";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  CreditCard, 
  Clock, 
  MapPin, 
  Calendar,
  Users,
  Ticket
} from "lucide-react";
import type { Showtime, Movie, Seat, SeatHold } from "@shared/schema";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function SeatSelection() {
  const { showtimeId } = useParams();
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [seatHolds, setSeatHolds] = useState<SeatHold[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to book tickets.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 2000);
    }
  }, [isAuthenticated, toast]);

  // Fetch showtime details
  const { data: showtime, isLoading: showtimeLoading } = useQuery({
    queryKey: ['/api/showtimes', showtimeId],
    enabled: !!showtimeId,
  });

  // Fetch movie details
  const { data: movie, isLoading: movieLoading } = useQuery({
    queryKey: ['/api/movies', showtime?.movieId],
    enabled: !!showtime?.movieId,
  });

  // Fetch seat map
  const { data: seats = [], isLoading: seatsLoading, refetch: refetchSeats } = useQuery({
    queryKey: ['/api/showtimes', showtimeId, 'seats'],
    enabled: !!showtimeId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Hold seats mutation
  const holdSeatsMutation = useMutation({
    mutationFn: async (seatIds: number[]) => {
      const response = await apiRequest('POST', '/api/seats/hold', {
        showtimeId: parseInt(showtimeId!),
        seatIds,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setSeatHolds(data.heldSeats);
      setTimeRemaining(600); // 10 minutes in seconds
      refetchSeats();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to hold seats. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async () => {
      const totalAmount = calculateTotal();
      const response = await apiRequest('POST', '/api/bookings', {
        showtimeId: parseInt(showtimeId!),
        seatIds: selectedSeats,
        totalAmount,
      });
      return response.json();
    },
    onSuccess: (data) => {
      initiatePayment(data);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Verify payment mutation
  const verifyPaymentMutation = useMutation({
    mutationFn: async ({ bookingId, razorpayPayment }: any) => {
      const response = await apiRequest('POST', '/api/bookings/verify-payment', {
        bookingId,
        razorpayPayment,
        seatIds: selectedSeats,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setIsProcessingPayment(false);
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      setLocation(`/booking-confirmation/${data.booking.id}`);
    },
    onError: (error) => {
      setIsProcessingPayment(false);
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Payment Failed",
        description: "Payment verification failed. Please contact support.",
        variant: "destructive",
      });
    },
  });

  // Timer effect for seat holds
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setSelectedSeats([]);
            setSeatHolds([]);
            refetchSeats();
            toast({
              title: "Seats Released",
              description: "Your seat hold has expired. Please select seats again.",
              variant: "destructive",
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining, refetchSeats, toast]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeatSelect = (seatId: number) => {
    if (selectedSeats.length >= 8) {
      toast({
        title: "Maximum seats selected",
        description: "You can select a maximum of 8 seats per booking.",
        variant: "destructive",
      });
      return;
    }

    const newSelectedSeats = [...selectedSeats, seatId];
    setSelectedSeats(newSelectedSeats);
    
    // Hold seats after selection
    holdSeatsMutation.mutate(newSelectedSeats);
  };

  const handleSeatDeselect = (seatId: number) => {
    const newSelectedSeats = selectedSeats.filter(id => id !== seatId);
    setSelectedSeats(newSelectedSeats);
    
    if (newSelectedSeats.length > 0) {
      holdSeatsMutation.mutate(newSelectedSeats);
    } else {
      setSeatHolds([]);
      setTimeRemaining(0);
    }
  };

  const calculateTotal = () => {
    const selectedSeatObjects = seats.filter((seat: any) => selectedSeats.includes(seat.id));
    const subtotal = selectedSeatObjects.reduce((total: number, seat: any) => {
      return total + (seat.seatType === 'premium' ? 15 : 12);
    }, 0);
    const bookingFee = 2.50;
    return subtotal + bookingFee;
  };

  const getSelectedSeatsInfo = () => {
    return seats.filter((seat: any) => selectedSeats.includes(seat.id));
  };

  const initiatePayment = (bookingData: any) => {
    setIsProcessingPayment(true);
    
    if (!window.Razorpay) {
      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        processPayment(bookingData);
      };
      script.onerror = () => {
        setIsProcessingPayment(false);
        toast({
          title: "Payment Error",
          description: "Failed to load payment gateway. Please try again.",
          variant: "destructive",
        });
      };
      document.body.appendChild(script);
    } else {
      processPayment(bookingData);
    }
  };

  const processPayment = (bookingData: any) => {
    const options = {
      key: bookingData.razorpayKeyId,
      amount: bookingData.razorpayOrder.amount,
      currency: bookingData.razorpayOrder.currency,
      name: 'Spotlight Now',
      description: `Movie: ${movie?.title}`,
      order_id: bookingData.razorpayOrder.id,
      handler: (response: any) => {
        verifyPaymentMutation.mutate({
          bookingId: bookingData.booking.id,
          razorpayPayment: response,
        });
      },
      prefill: {
        name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '',
        email: user?.email || '',
      },
      modal: {
        ondismiss: () => {
          setIsProcessingPayment(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const formatShowtime = (date: string, time: string) => {
    const showDate = new Date(date);
    const today = new Date();
    
    let dateStr = '';
    if (showDate.toDateString() === today.toDateString()) {
      dateStr = 'Today';
    } else {
      dateStr = showDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }

    const timeStr = new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    return `${dateStr}, ${timeStr}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cinema-black">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Please Sign In</h1>
            <p className="text-gray-300 mb-4">You need to be signed in to book tickets.</p>
          </div>
        </div>
      </div>
    );
  }

  if (showtimeLoading || movieLoading || seatsLoading) {
    return (
      <div className="min-h-screen bg-cinema-black">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-cinema-dark rounded w-1/3 mb-6"></div>
            <div className="h-96 bg-cinema-dark rounded-xl mb-6"></div>
            <div className="h-32 bg-cinema-dark rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!showtime || !movie) {
    return (
      <div className="min-h-screen bg-cinema-black">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Showtime Not Found</h1>
            <Button onClick={() => setLocation('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cinema-gradient text-white mobile-content">
      <Header />
      
      {/* Header Section */}
      <section className="py-8 bg-cinema-dark">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation(`/movie/${movie.id}`)}
              className="text-gray-300 hover:text-spotlight-orange"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-spotlight-orange">
                SELECT YOUR SEATS
              </h1>
              <p className="text-gray-300 text-lg">
                {movie.title} • {formatShowtime(showtime.showDate, showtime.showTime)} • Screen {showtime.screenId}
              </p>
            </div>
          </div>
          
          {timeRemaining > 0 && (
            <div className="bg-spotlight-orange/20 border border-spotlight-orange rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-spotlight-orange" />
                  <span className="text-white font-medium">Seats held for:</span>
                </div>
                <span className="text-2xl font-mono text-spotlight-yellow">
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Seat Selection */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <SeatMap
            seats={seats}
            selectedSeats={selectedSeats}
            onSeatSelect={handleSeatSelect}
            onSeatDeselect={handleSeatDeselect}
            disabled={holdSeatsMutation.isPending || isProcessingPayment}
          />
        </div>
      </section>

      {/* Booking Summary */}
      {selectedSeats.length > 0 && (
        <section className="py-8 bg-cinema-dark">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <Card className="bg-cinema-black border-cinema-dark">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-spotlight-orange">
                      Booking Summary
                    </h3>
                    {timeRemaining > 0 && (
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Seats held for</p>
                        <p className="text-lg font-mono text-spotlight-yellow">
                          {formatTime(timeRemaining)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Movie:</span>
                      <span className="text-white font-medium">{movie.title}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Showtime:</span>
                      <span className="text-white font-medium">
                        {formatShowtime(showtime.showDate, showtime.showTime)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Selected Seats:</span>
                      <span className="text-white font-medium">
                        {getSelectedSeatsInfo().map((seat: any) => seat.seatNumber).join(', ')}
                      </span>
                    </div>

                    <Separator className="bg-gray-600" />

                    {getSelectedSeatsInfo().map((seat: any) => (
                      <div key={seat.id} className="flex justify-between">
                        <span className="text-gray-300">
                          {seat.seatNumber} ({seat.seatType === 'premium' ? 'Premium' : 'Standard'}):
                        </span>
                        <span className="text-white font-medium">
                          ${seat.seatType === 'premium' ? '15.00' : '12.00'}
                        </span>
                      </div>
                    ))}

                    <div className="flex justify-between">
                      <span className="text-gray-300">Booking Fee:</span>
                      <span className="text-white font-medium">$2.50</span>
                    </div>

                    <Separator className="bg-gray-600" />

                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-spotlight-orange">Total:</span>
                      <span className="text-spotlight-orange">${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => createBookingMutation.mutate()}
                    disabled={selectedSeats.length === 0 || createBookingMutation.isPending || isProcessingPayment}
                    className="w-full bg-spotlight-gradient text-cinema-black hover:shadow-lg hover:shadow-spotlight-orange/30 transition-all duration-300"
                  >
                    {isProcessingPayment ? (
                      <>Processing Payment...</>
                    ) : createBookingMutation.isPending ? (
                      <>Creating Booking...</>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Continue to Payment
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

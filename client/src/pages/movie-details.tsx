import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Play, 
  Ticket, 
  Heart, 
  Star, 
  Users, 
  Calendar, 
  Clock,
  MapPin
} from "lucide-react";
import type { Movie, Showtime } from "@shared/schema";

export default function MovieDetails() {
  const { id } = useParams();
  const [location, setLocation] = useLocation();

  const { data: movie, isLoading: movieLoading } = useQuery({
    queryKey: ['/api/movies', id],
    enabled: !!id,
  });

  const { data: showtimes = [], isLoading: showtimesLoading } = useQuery({
    queryKey: ['/api/movies', id, 'showtimes'],
    enabled: !!id,
  });

  if (movieLoading) {
    return (
      <div className="min-h-screen bg-cinema-black">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-64 bg-cinema-dark rounded-xl mb-6"></div>
            <div className="h-8 bg-cinema-dark rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-cinema-dark rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-cinema-dark rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-cinema-black">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Movie Not Found</h1>
            <Button onClick={() => setLocation('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleShowtimeSelect = (showtimeId: number) => {
    setLocation(`/seat-selection/${showtimeId}`);
  };

  return (
    <div className="min-h-screen bg-cinema-black text-white mobile-content">
      <Header />
      
      {/* Hero Section */}
      <section className="relative">
        <div className="relative h-96 md:h-[500px]">
          <img 
            src={movie.backdropPath || movie.posterPath || ''} 
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cinema-black via-cinema-black/50 to-transparent"></div>
          
          <div className="absolute top-4 left-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/')}
              className="bg-black/20 backdrop-blur-sm hover:bg-black/30 text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="container mx-auto">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <img
                    src={movie.posterPath || ''}
                    alt={movie.title}
                    className="w-32 h-48 md:w-48 md:h-72 object-cover rounded-lg shadow-2xl"
                  />
                </div>
                
                <div className="flex-1">
                  <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                    {movie.title}
                  </h1>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {movie.genres?.map((genre, index) => (
                      <Badge key={index} variant="secondary" className="bg-theater-red text-white">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-6 mb-4 text-gray-300">
                    {movie.rating && (
                      <div className="flex items-center space-x-2">
                        <Star className="h-5 w-5 text-spotlight-yellow fill-current" />
                        <span className="text-lg font-semibold">
                          {parseFloat(movie.rating).toFixed(1)}
                        </span>
                      </div>
                    )}
                    
                    {movie.runtime && (
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{formatRuntime(movie.runtime)}</span>
                      </div>
                    )}
                    
                    {movie.releaseDate && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(movie.releaseDate)}</span>
                      </div>
                    )}
                    
                    {movie.voteCount && (
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>{movie.voteCount.toLocaleString()} votes</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    <Button 
                      className="bg-spotlight-gradient text-cinema-black hover:shadow-lg hover:shadow-spotlight-orange/30 transition-all duration-300"
                    >
                      <Ticket className="mr-2 h-4 w-4" />
                      Book Tickets
                    </Button>
                    
                    {movie.trailerUrl && (
                      <Button 
                        onClick={() => window.open(movie.trailerUrl!, '_blank')}
                        variant="outline"
                        className="border-2 border-spotlight-orange text-spotlight-orange hover:bg-spotlight-orange hover:text-cinema-black transition-all duration-300"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Watch Trailer
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 transition-all duration-300"
                    >
                      <Heart className="mr-2 h-4 w-4" />
                      Watchlist
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Movie Details */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card className="bg-cinema-dark border-cinema-dark mb-6">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-spotlight-orange mb-4">Synopsis</h2>
                  <p className="text-gray-300 leading-relaxed">
                    {movie.overview}
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card className="bg-cinema-dark border-cinema-dark">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-spotlight-orange mb-4">Movie Info</h3>
                  <div className="space-y-3">
                    {movie.releaseDate && (
                      <div>
                        <p className="text-sm text-gray-400">Release Date</p>
                        <p className="text-white font-medium">{formatDate(movie.releaseDate)}</p>
                      </div>
                    )}
                    
                    {movie.runtime && (
                      <div>
                        <p className="text-sm text-gray-400">Runtime</p>
                        <p className="text-white font-medium">{formatRuntime(movie.runtime)}</p>
                      </div>
                    )}
                    
                    {movie.genres && movie.genres.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-400">Genres</p>
                        <p className="text-white font-medium">{movie.genres.join(', ')}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Showtimes */}
      <section className="py-12 bg-cinema-dark">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-spotlight-orange mb-8 text-center">
            Select Showtime
          </h2>
          
          {showtimesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-20 bg-cinema-black rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : showtimes.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {showtimes.map((showtime: Showtime) => (
                <Card 
                  key={showtime.id}
                  className="bg-cinema-black border-gray-600 hover:border-spotlight-orange cursor-pointer transition-all duration-300"
                  onClick={() => handleShowtimeSelect(showtime.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-lg font-semibold text-white mb-1">
                      {formatTime(showtime.showTime)}
                    </div>
                    <div className="text-sm text-gray-400 mb-2">
                      Screen {showtime.screenId}
                    </div>
                    <div className="text-sm text-spotlight-orange font-medium">
                      ${parseFloat(showtime.price).toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No showtimes available for this movie.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

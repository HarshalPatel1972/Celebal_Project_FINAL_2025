import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Play, Ticket, Heart, Star, Users, Calendar, Clock } from "lucide-react";
import type { Movie, Showtime } from "@shared/schema";

interface MovieModalProps {
  movie: Movie;
  isOpen: boolean;
  onClose: () => void;
  onBookTickets: () => void;
}

export default function MovieModal({ movie, isOpen, onClose, onBookTickets }: MovieModalProps) {
  const { data: showtimes = [] } = useQuery({
    queryKey: ['/api/movies', movie.id, 'showtimes'],
    enabled: isOpen,
  });

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-cinema-dark border-cinema-dark">
        <div className="relative">
          {/* Movie backdrop */}
          <div className="relative h-64 md:h-80">
            <img 
              src={movie.backdropPath || movie.posterPath || ''} 
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cinema-dark to-transparent"></div>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{movie.title}</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {movie.genres?.map((genre, index) => (
                  <Badge key={index} variant="secondary" className="bg-theater-red text-white">
                    {genre}
                  </Badge>
                ))}
                {movie.runtime && (
                  <Badge variant="secondary" className="bg-cinema-black/50 text-white">
                    {formatRuntime(movie.runtime)}
                  </Badge>
                )}
                {movie.releaseDate && (
                  <Badge variant="secondary" className="bg-cinema-black/50 text-white">
                    {new Date(movie.releaseDate).getFullYear()}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="md:col-span-2">
                <p className="text-gray-300 mb-6 leading-relaxed">
                  {movie.overview}
                </p>
                
                <div className="flex items-center space-x-6 mb-6">
                  {movie.rating && (
                    <div className="flex items-center space-x-2">
                      <Star className="h-5 w-5 text-spotlight-yellow fill-current" />
                      <span className="text-lg font-semibold text-white">
                        {parseFloat(movie.rating).toFixed(1)}
                      </span>
                      <span className="text-gray-400">/10</span>
                    </div>
                  )}
                  
                  {movie.voteCount && (
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-300">{movie.voteCount.toLocaleString()} votes</span>
                    </div>
                  )}
                </div>
                
                {movie.releaseDate && (
                  <div className="mb-6">
                    <h4 className="text-xl font-semibold text-spotlight-orange mb-2">Release Information</h4>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(movie.releaseDate)}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <Button 
                  onClick={onBookTickets}
                  className="w-full bg-spotlight-gradient text-cinema-black hover:shadow-lg hover:shadow-spotlight-orange/30 transition-all duration-300"
                >
                  <Ticket className="mr-2 h-4 w-4" />
                  Book Tickets
                </Button>
                
                {movie.trailerUrl && (
                  <Button 
                    onClick={() => window.open(movie.trailerUrl!, '_blank')}
                    variant="outline"
                    className="w-full border-2 border-spotlight-orange text-spotlight-orange hover:bg-spotlight-orange hover:text-cinema-black transition-all duration-300"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Watch Trailer
                  </Button>
                )}
                
                <Button 
                  variant="outline"
                  className="w-full bg-cinema-black border-gray-600 text-white hover:bg-gray-800 transition-all duration-300"
                >
                  <Heart className="mr-2 h-4 w-4" />
                  Add to Watchlist
                </Button>
              </div>
            </div>
            
            {/* Showtimes */}
            {showtimes.length > 0 && (
              <div className="border-t border-gray-700 pt-6">
                <h4 className="text-xl font-semibold text-spotlight-orange mb-4">Showtimes Today</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {showtimes.map((showtime: Showtime) => (
                    <button
                      key={showtime.id}
                      className="bg-cinema-black border border-gray-600 px-4 py-3 rounded-lg hover:border-spotlight-orange hover:bg-spotlight-orange/10 transition-all duration-300"
                    >
                      <div className="text-center">
                        <p className="text-lg font-semibold text-white">
                          {formatTime(showtime.showTime)}
                        </p>
                        <p className="text-sm text-gray-400">Screen {showtime.screenId}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

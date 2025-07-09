import { Star, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Movie } from "@shared/schema";

interface MovieCardProps {
  movie: Movie;
  onClick: () => void;
  isComingSoon?: boolean;
}

export default function MovieCard({ movie, onClick, isComingSoon = false }: MovieCardProps) {
  const getGenreColor = (genre: string) => {
    const colors = {
      'Action': 'bg-red-600',
      'Comedy': 'bg-yellow-500 text-cinema-black',
      'Drama': 'bg-orange-500',
      'Horror': 'bg-purple-600',
      'Romance': 'bg-pink-500',
      'Thriller': 'bg-red-600',
      'Sci-Fi': 'bg-neon-blue',
      'Adventure': 'bg-green-600',
      'Fantasy': 'bg-purple-500',
      'Mystery': 'bg-indigo-600',
    };
    return colors[genre as keyof typeof colors] || 'bg-gray-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div 
      className="flex-shrink-0 w-64 group cursor-pointer"
      onClick={onClick}
    >
      <div className="relative bg-cinema-black rounded-xl overflow-hidden transform group-hover:scale-105 transition-all duration-300">
        <div className="absolute inset-0 bg-spotlight-gradient opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        
        <img 
          src={movie.posterPath || ''} 
          alt={movie.title}
          className="w-full h-80 object-cover"
        />
        
        <div className="absolute top-4 left-4">
          {movie.genres && movie.genres.length > 0 && (
            <span className={`px-2 py-1 rounded text-xs font-medium ${getGenreColor(movie.genres[0])}`}>
              {movie.genres[0]}
            </span>
          )}
        </div>
        
        {isComingSoon && movie.releaseDate && (
          <div className="absolute top-4 right-4">
            <span className="bg-spotlight-yellow text-cinema-black px-2 py-1 rounded text-xs font-medium">
              {formatDate(movie.releaseDate)}
            </span>
          </div>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cinema-black to-transparent p-4">
          <h4 className="text-lg font-semibold mb-1 text-white truncate">{movie.title}</h4>
          
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-4 text-sm text-gray-300">
              {movie.runtime && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatRuntime(movie.runtime)}</span>
                </div>
              )}
              
              {movie.releaseDate && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(movie.releaseDate).getFullYear()}</span>
                </div>
              )}
            </div>
            
            {movie.rating && (
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 text-spotlight-yellow fill-current" />
                <span className="text-sm text-white">{parseFloat(movie.rating).toFixed(1)}</span>
              </div>
            )}
          </div>
          
          {isComingSoon ? (
            <Button 
              size="sm"
              className="w-full bg-spotlight-orange text-cinema-black hover:bg-spotlight-yellow transition-colors"
            >
              Notify Me
            </Button>
          ) : (
            <Button 
              size="sm"
              className="w-full bg-spotlight-gradient text-cinema-black hover:shadow-lg hover:shadow-spotlight-orange/30 transition-all duration-300"
            >
              Book Now
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

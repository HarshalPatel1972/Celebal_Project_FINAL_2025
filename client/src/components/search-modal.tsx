import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, X, Star, Calendar, Clock } from "lucide-react";
import { useLocation } from "wouter";
import type { Movie } from "@shared/schema";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['/api/movies/search', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const response = await fetch(`/api/movies/search?q=${encodeURIComponent(searchQuery)}`);
      return response.json();
    },
    enabled: searchQuery.trim().length > 0,
  });

  const handleMovieClick = (movie: Movie) => {
    setLocation(`/movie/${movie.id}`);
    onClose();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "TBA";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-cinema-dark border-cinema-dark">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Movies
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search for movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-cinema-black border-cinema-dark text-white placeholder:text-gray-400"
            autoFocus
          />
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-spotlight-orange border-t-transparent rounded-full"></div>
            </div>
          ) : searchResults.length === 0 ? (
            searchQuery.trim() ? (
              <div className="text-center py-8 text-gray-400">
                No movies found for "{searchQuery}"
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                Start typing to search for movies
              </div>
            )
          ) : (
            <div className="space-y-3">
              {searchResults.map((movie: Movie) => (
                <Card 
                  key={movie.id} 
                  className="bg-cinema-black border-cinema-dark hover:border-spotlight-orange transition-all duration-300 cursor-pointer"
                  onClick={() => handleMovieClick(movie)}
                >
                  <CardContent className="p-4">
                    <div className="flex space-x-4">
                      <div className="w-16 h-24 bg-cinema-dark rounded-lg overflow-hidden flex-shrink-0">
                        {movie.posterPath ? (
                          <img
                            src={movie.posterPath}
                            alt={movie.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Search className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold mb-1 truncate">{movie.title}</h3>
                        <p className="text-gray-300 text-sm mb-2 line-clamp-2">{movie.overview}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span>{movie.rating || "N/A"}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(movie.releaseDate)}</span>
                          </div>
                          {movie.runtime && (
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{movie.runtime}m</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
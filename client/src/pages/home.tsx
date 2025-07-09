import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import MovieCard from "@/components/movie-card";
import MovieModal from "@/components/movie-modal";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Ticket } from "lucide-react";
import type { Movie } from "@shared/schema";

export default function Home() {
  const [location, setLocation] = useLocation();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { data: nowShowingMovies = [], isLoading: loadingNowShowing } = useQuery({
    queryKey: ['/api/movies/now-showing'],
  });

  const { data: comingSoonMovies = [], isLoading: loadingComingSoon } = useQuery({
    queryKey: ['/api/movies/coming-soon'],
  });

  const featuredMovie = nowShowingMovies[0];

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setShowModal(true);
  };

  const handleBookNow = (movieId: number) => {
    setLocation(`/movie/${movieId}`);
  };

  return (
    <div className="min-h-screen bg-cinema-black text-white mobile-content">
      <Header />
      
      {/* Hero Section */}
      {featuredMovie && (
        <section className="relative h-screen bg-theater-gradient overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <img 
              src={featuredMovie.backdropPath || featuredMovie.posterPath || ''} 
              alt={featuredMovie.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
            <div className="grid md:grid-cols-2 gap-8 items-center w-full">
              <div className="space-y-6">
                <span className="inline-block bg-theater-red px-4 py-2 rounded-full text-sm font-medium">
                  NOW SHOWING
                </span>
                <h2 className="text-5xl md:text-7xl font-bold text-spotlight-orange leading-tight">
                  {featuredMovie.title}
                </h2>
                <p className="text-xl text-gray-300 max-w-lg">
                  {featuredMovie.overview}
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {featuredMovie.genres?.map((genre, index) => (
                    <span key={index} className="bg-velvet-burgundy px-3 py-1 rounded-full text-sm">
                      {genre}
                    </span>
                  ))}
                  {featuredMovie.runtime && (
                    <span className="bg-velvet-burgundy px-3 py-1 rounded-full text-sm">
                      {Math.floor(featuredMovie.runtime / 60)}h {featuredMovie.runtime % 60}m
                    </span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={() => handleBookNow(featuredMovie.id)}
                    className="bg-spotlight-gradient text-cinema-black hover:shadow-lg hover:shadow-spotlight-orange/30 transition-all duration-300"
                  >
                    <Ticket className="mr-2 h-5 w-5" />
                    Book Tickets Now
                  </Button>
                  {featuredMovie.trailerUrl && (
                    <Button 
                      onClick={() => window.open(featuredMovie.trailerUrl!, '_blank')}
                      variant="outline"
                      className="border-2 border-spotlight-orange text-spotlight-orange hover:bg-spotlight-orange hover:text-cinema-black transition-all duration-300"
                    >
                      <Play className="mr-2 h-5 w-5" />
                      Watch Trailer
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="relative">
                <div className="relative w-full max-w-md mx-auto">
                  <div className="absolute -inset-4 bg-spotlight-gradient rounded-3xl blur opacity-75"></div>
                  <img 
                    src={featuredMovie.posterPath || ''} 
                    alt={featuredMovie.title}
                    className="relative w-full rounded-2xl shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Now Showing Section */}
      <section className="py-16 bg-cinema-dark">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-bold text-spotlight-orange">NOW SHOWING</h3>
              <Button 
                variant="ghost" 
                className="text-spotlight-yellow hover:text-spotlight-orange transition-colors"
              >
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            {loadingNowShowing ? (
              <div className="flex space-x-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-64 h-80 bg-cinema-black rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="flex space-x-6 pb-4">
                  {nowShowingMovies.map((movie: Movie) => (
                    <MovieCard 
                      key={movie.id} 
                      movie={movie} 
                      onClick={() => handleMovieClick(movie)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="py-16 bg-cinema-dark">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-bold text-spotlight-orange">COMING SOON</h3>
              <Button 
                variant="ghost" 
                className="text-spotlight-yellow hover:text-spotlight-orange transition-colors"
              >
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            {loadingComingSoon ? (
              <div className="flex space-x-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-64 h-80 bg-cinema-black rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="flex space-x-6 pb-4">
                  {comingSoonMovies.map((movie: Movie) => (
                    <MovieCard 
                      key={movie.id} 
                      movie={movie} 
                      onClick={() => handleMovieClick(movie)}
                      isComingSoon
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />

      {/* Movie Modal */}
      {selectedMovie && (
        <MovieModal 
          movie={selectedMovie}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onBookTickets={() => handleBookNow(selectedMovie.id)}
        />
      )}

      {/* Floating Book Button */}
      <Button 
        onClick={() => featuredMovie && handleBookNow(featuredMovie.id)}
        className="fixed bottom-20 right-4 md:bottom-8 bg-spotlight-gradient text-cinema-black hover:shadow-xl hover:shadow-spotlight-orange/30 transition-all duration-300 z-30 rounded-full"
      >
        <Ticket className="mr-2 h-5 w-5" />
        Book Now
      </Button>
    </div>
  );
}

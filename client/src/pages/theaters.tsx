import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Clock, Star, Search, Navigation } from "lucide-react";
import type { Theater } from "@shared/schema";

export default function Theaters() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: theaters = [], isLoading } = useQuery({
    queryKey: ['/api/theaters'],
  });

  const filteredTheaters = theaters.filter((theater: Theater) =>
    theater.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    theater.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-cinema-black text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-spotlight-orange mb-4">Find Theaters</h1>
            <p className="text-gray-300 text-lg">
              Discover premium theaters near you with state-of-the-art screens and comfortable seating.
            </p>
          </div>

          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search theaters by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-cinema-dark border-cinema-dark text-white placeholder:text-gray-400"
            />
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-cinema-dark border-cinema-dark">
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-6 bg-cinema-black rounded mb-4"></div>
                      <div className="h-4 bg-cinema-black rounded mb-2"></div>
                      <div className="h-4 bg-cinema-black rounded mb-4"></div>
                      <div className="h-10 bg-cinema-black rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredTheaters.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-cinema-dark rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No theaters found</h3>
              <p className="text-gray-400">
                {searchTerm ? "Try adjusting your search terms" : "We're working on adding theaters to your area"}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTheaters.map((theater: Theater) => (
                <Card key={theater.id} className="bg-cinema-dark border-cinema-dark hover:border-spotlight-orange transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-semibold text-white">{theater.name}</h3>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-300">4.5</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-gray-300">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{theater.location}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-300">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">Open 10:00 AM - 11:00 PM</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        className="flex-1 bg-spotlight-gradient text-cinema-black hover:shadow-lg hover:shadow-spotlight-orange/30 transition-all duration-300"
                        onClick={() => window.location.href = `/?theater=${theater.id}`}
                      >
                        View Movies
                      </Button>
                      <Button 
                        variant="outline"
                        size="icon"
                        className="border-spotlight-orange text-spotlight-orange hover:bg-spotlight-orange hover:text-cinema-black"
                      >
                        <Navigation className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
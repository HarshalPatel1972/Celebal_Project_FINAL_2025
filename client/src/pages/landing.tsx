import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Film, Play, Users, Shield, Zap, Star } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-cinema-gradient">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-cinema-black/95 backdrop-blur-sm border-b border-cinema-dark">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-spotlight-gradient rounded-full flex items-center justify-center">
                <Film className="text-cinema-black text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-spotlight-orange">SPOTLIGHT</h1>
                <p className="text-xs text-spotlight-yellow -mt-1">NOW</p>
              </div>
            </div>
            
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-spotlight-gradient text-cinema-black hover:shadow-lg hover:shadow-spotlight-orange/30 transition-all duration-300"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-gradient-to-br from-spotlight-orange/20 via-transparent to-theater-red/20"></div>
        </div>
        
        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight">
              Experience
              <span className="text-spotlight-orange"> Cinema</span>
              <br />
              Like Never Before
            </h2>
            
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Premium movie bookings with immersive theater experiences, real-time seat selection, and seamless payment integration.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => window.location.href = '/api/login'}
                size="lg"
                className="bg-spotlight-gradient text-cinema-black hover:shadow-lg hover:shadow-spotlight-orange/30 transition-all duration-300"
              >
                <Play className="mr-2 h-5 w-5" />
                Get Started
              </Button>
              
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-spotlight-orange text-spotlight-orange hover:bg-spotlight-orange hover:text-cinema-black transition-all duration-300"
              >
                <Film className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-cinema-dark">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-spotlight-orange mb-4">
              Why Choose Spotlight Now?
            </h3>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover the ultimate cinematic experience with our premium features designed for movie enthusiasts.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-cinema-black border-cinema-dark">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-spotlight-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="text-2xl text-cinema-black" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">Real-Time Booking</h4>
                <p className="text-gray-300">
                  Book your seats instantly with real-time availability and secure payment processing.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-cinema-black border-cinema-dark">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="text-2xl text-white" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">Premium Experience</h4>
                <p className="text-gray-300">
                  Enjoy luxury seating, premium screens, and immersive theater environments.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-cinema-black border-cinema-dark">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="text-2xl text-white" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">Safe & Secure</h4>
                <p className="text-gray-300">
                  Advanced security measures and contactless booking for your peace of mind.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="py-20 bg-cinema-gradient">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold text-spotlight-orange mb-4">
            Coming Soon
          </h3>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Get ready for the ultimate movie booking experience. Real-time seat selection, secure payments, and premium theater environments await.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-cinema-black">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold text-white mb-4">
            Ready to Start Your Cinematic Journey?
          </h3>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of movie enthusiasts who trust Spotlight Now for their entertainment needs.
          </p>
          
          <Button 
            onClick={() => window.location.href = '/api/login'}
            size="lg"
            className="bg-spotlight-gradient text-cinema-black hover:shadow-lg hover:shadow-spotlight-orange/30 transition-all duration-300"
          >
            <Star className="mr-2 h-5 w-5" />
            Sign In Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-cinema-dark border-t border-cinema-dark py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-spotlight-gradient rounded-full flex items-center justify-center">
                <Film className="text-cinema-black" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-spotlight-orange">SPOTLIGHT</h3>
                <p className="text-xs text-spotlight-yellow -mt-1">NOW</p>
              </div>
            </div>
            
            <div className="flex space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-spotlight-orange transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-spotlight-orange transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-spotlight-orange transition-colors">Contact</a>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Spotlight Now. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

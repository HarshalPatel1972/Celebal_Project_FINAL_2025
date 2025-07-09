import { Link } from "wouter";
import { Film, Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-cinema-black border-t border-cinema-dark py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-spotlight-gradient rounded-full flex items-center justify-center">
                <Film className="text-cinema-black" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-spotlight-orange">SPOTLIGHT</h3>
                <p className="text-xs text-spotlight-yellow -mt-1">NOW</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Experience cinema like never before with premium bookings and immersive entertainment.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-spotlight-orange transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-spotlight-orange transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-spotlight-orange transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-spotlight-orange transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Movies</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/" className="hover:text-spotlight-orange transition-colors">Now Showing</Link></li>
              <li><Link href="/" className="hover:text-spotlight-orange transition-colors">Coming Soon</Link></li>
              <li><a href="#" className="hover:text-spotlight-orange transition-colors">Top Rated</a></li>
              <li><a href="#" className="hover:text-spotlight-orange transition-colors">Genres</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Theaters</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-spotlight-orange transition-colors">Find Theaters</a></li>
              <li><a href="#" className="hover:text-spotlight-orange transition-colors">Premium Screens</a></li>
              <li><a href="#" className="hover:text-spotlight-orange transition-colors">Accessibility</a></li>
              <li><a href="#" className="hover:text-spotlight-orange transition-colors">Amenities</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-spotlight-orange transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-spotlight-orange transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-spotlight-orange transition-colors">Refund Policy</a></li>
              <li><a href="#" className="hover:text-spotlight-orange transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 Spotlight Now. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-spotlight-orange transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-spotlight-orange transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-spotlight-orange transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

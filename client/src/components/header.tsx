import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Film, Search, Bell, User, Menu, X } from "lucide-react";
import SearchModal from "@/components/search-modal";

export default function Header() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navigation = [
    { name: "Movies", href: "/", active: location === "/" },
    { name: "Theaters", href: "/theaters", active: location === "/theaters" },
    { name: "Dashboard", href: "/dashboard", active: location === "/dashboard" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-cinema-black/95 backdrop-blur-sm border-b border-cinema-dark">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-spotlight-gradient rounded-full flex items-center justify-center">
              <Film className="text-cinema-black text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-spotlight-orange">SPOTLIGHT</h1>
              <p className="text-xs text-spotlight-yellow -mt-1">NOW</p>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-gray-300 hover:text-spotlight-orange transition-colors ${
                  item.active ? "text-spotlight-orange" : ""
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-gray-300 hover:text-spotlight-orange transition-colors"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="text-gray-300 hover:text-spotlight-orange transition-colors"
            >
              <Bell className="h-5 w-5" />
            </Button>
            
            {user ? (
              <div className="flex items-center space-x-2">
                <img
                  src={user.profileImageUrl || ''}
                  alt={user.firstName || 'User'}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="w-8 h-8 bg-spotlight-gradient rounded-full flex items-center justify-center hidden">
                  <User className="text-cinema-black text-sm" />
                </div>
                <span className="text-sm text-gray-300 hidden sm:inline">
                  {user.firstName || 'User'}
                </span>
              </div>
            ) : (
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="bg-spotlight-gradient text-cinema-black hover:shadow-lg hover:shadow-spotlight-orange/30 transition-all duration-300"
              >
                Sign In
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-gray-300 hover:text-spotlight-orange transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 border-t border-cinema-dark pt-4">
            <nav className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-gray-300 hover:text-spotlight-orange transition-colors py-2 ${
                    item.active ? "text-spotlight-orange" : ""
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
      
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </header>
  );
}

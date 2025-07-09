import { Link, useLocation } from "wouter";
import { Home, Film, Ticket, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MobileNavigation() {
  const [location] = useLocation();

  const navigation = [
    { name: "Home", href: "/", icon: Home, active: location === "/" },
    { name: "Movies", href: "/", icon: Film, active: location.startsWith("/movie") },
    { name: "Tickets", href: "/dashboard", icon: Ticket, active: location === "/dashboard" },
    { name: "Profile", href: "/dashboard", icon: User, active: location === "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-cinema-black border-t border-cinema-dark md:hidden z-40">
      <div className="flex justify-around items-center py-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center py-2 transition-colors",
                item.active ? "text-spotlight-orange" : "text-gray-400"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

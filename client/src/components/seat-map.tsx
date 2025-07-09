import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Seat, SeatHold } from "@shared/schema";

interface SeatMapProps {
  seats: (Seat & { isBooked: boolean; isHeld: boolean })[];
  selectedSeats: number[];
  onSeatSelect: (seatId: number) => void;
  onSeatDeselect: (seatId: number) => void;
  disabled?: boolean;
}

export default function SeatMap({ 
  seats, 
  selectedSeats, 
  onSeatSelect, 
  onSeatDeselect, 
  disabled = false 
}: SeatMapProps) {
  const [seatMap, setSeatMap] = useState<{ [key: string]: (Seat & { isBooked: boolean; isHeld: boolean })[] }>({});

  useEffect(() => {
    // Group seats by row
    const groupedSeats = seats.reduce((acc, seat) => {
      if (!acc[seat.row]) {
        acc[seat.row] = [];
      }
      acc[seat.row].push(seat);
      return acc;
    }, {} as { [key: string]: (Seat & { isBooked: boolean; isHeld: boolean })[] });

    // Sort seats within each row by column
    Object.keys(groupedSeats).forEach(row => {
      groupedSeats[row].sort((a, b) => a.column - b.column);
    });

    setSeatMap(groupedSeats);
  }, [seats]);

  const handleSeatClick = (seat: Seat & { isBooked: boolean; isHeld: boolean }) => {
    if (disabled || seat.isBooked || seat.isHeld || !seat.isActive) return;

    if (selectedSeats.includes(seat.id)) {
      onSeatDeselect(seat.id);
    } else {
      onSeatSelect(seat.id);
    }
  };

  const getSeatClass = (seat: Seat & { isBooked: boolean; isHeld: boolean }) => {
    if (seat.isBooked) return "seat-occupied";
    if (seat.isHeld) return "seat-held";
    if (selectedSeats.includes(seat.id)) return "seat-selected";
    if (!seat.isActive) return "seat-occupied";
    return "seat-available";
  };

  const getSeatPrice = (seatType: string) => {
    return seatType === "premium" ? 15 : 12;
  };

  const rows = Object.keys(seatMap).sort();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-cinema-dark rounded-2xl p-8">
        {/* Screen indicator */}
        <div className="text-center mb-8">
          <div className="bg-spotlight-gradient h-2 rounded-full w-3/4 mx-auto mb-2"></div>
          <p className="text-gray-400 text-sm">SCREEN</p>
        </div>

        {/* Seat map */}
        <div className="space-y-4 mb-8">
          {rows.map((row) => (
            <div key={row} className="flex items-center justify-center space-x-2">
              <span className="text-gray-400 w-8 text-center font-medium">{row}</span>
              
              <div className="flex space-x-2">
                {seatMap[row].map((seat, index) => {
                  // Add aisle space after certain seats
                  const showAisle = index === Math.floor(seatMap[row].length / 2) - 1;
                  
                  return (
                    <div key={seat.id} className="flex items-center space-x-2">
                      <button
                        onClick={() => handleSeatClick(seat)}
                        disabled={disabled || seat.isBooked || seat.isHeld || !seat.isActive}
                        className={cn(
                          "w-8 h-8 rounded-t-lg transition-colors text-xs font-medium",
                          getSeatClass(seat)
                        )}
                        title={`${seat.seatNumber} - ${seat.seatType === "premium" ? "Premium" : "Standard"} $${getSeatPrice(seat.seatType)}`}
                      >
                        {seat.column}
                      </button>
                      
                      {showAisle && <div className="w-4"></div>}
                    </div>
                  );
                })}
              </div>
              
              <span className="text-gray-400 w-8 text-center font-medium">{row}</span>
            </div>
          ))}
        </div>

        {/* Seat legend */}
        <div className="flex justify-center space-x-8 mb-8">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-t"></div>
            <span className="text-sm text-gray-300">Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-spotlight-orange rounded-t"></div>
            <span className="text-sm text-gray-300">Selected</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-500 rounded-t"></div>
            <span className="text-sm text-gray-300">Occupied</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-t"></div>
            <span className="text-sm text-gray-300">Held</span>
          </div>
        </div>

        {/* Price legend */}
        <div className="flex justify-center space-x-8">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-blue-500 text-white">Premium</Badge>
            <span className="text-sm text-gray-300">$15</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-green-500 text-white">Standard</Badge>
            <span className="text-sm text-gray-300">$12</span>
          </div>
        </div>
      </div>
    </div>
  );
}

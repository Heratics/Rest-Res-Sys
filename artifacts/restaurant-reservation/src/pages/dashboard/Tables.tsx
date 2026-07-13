import { useRestaurantStore } from "@/services/restaurantStore";
import { useReservationStore } from "@/services/reservationStore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Tables() {
  const { tables } = useRestaurantStore();
  const { getReservation } = useReservationStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-medium tracking-tight mb-1">Floor Plan</h1>
        <p className="text-muted-foreground">Manage table assignments and live status.</p>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-3 h-3 rounded-full bg-primary/20 border border-primary"></div> Available
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-3 h-3 rounded-full bg-black/40 border border-white/10"></div> Reserved
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-3 h-3 rounded-full bg-white border border-white"></div> Occupied
        </div>
      </div>

      <Card className="border-white/5 bg-black/40 p-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tables.map(table => {
            const reservation = table.reservationId ? getReservation(table.reservationId) : null;
            
            let statusClasses = "border-primary/50 bg-primary/10 text-primary"; // Available
            if (table.status === 'Reserved') statusClasses = "border-white/10 bg-black/60 text-muted-foreground";
            if (table.status === 'Occupied') statusClasses = "border-white bg-white/10 text-white";

            return (
              <div 
                key={table.id}
                className={`relative aspect-square rounded-2xl border flex flex-col items-center justify-center p-4 transition-all hover:scale-105 cursor-pointer ${statusClasses}`}
              >
                <div className="absolute top-3 right-3 text-xs opacity-50 font-mono">
                  {table.capacity} pax
                </div>
                
                <h3 className="font-serif text-3xl mb-1">{table.number}</h3>
                
                <Badge variant="outline" className={`text-[10px] mt-2 border-current px-2 uppercase tracking-wider ${table.status === 'Available' ? 'bg-primary/20' : ''}`}>
                  {table.status}
                </Badge>
                
                {reservation && (
                  <div className="absolute bottom-3 left-3 right-3 text-center truncate text-xs opacity-70 border-t border-current/20 pt-2 mt-2">
                    {reservation.customer.name}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
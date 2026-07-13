import { useState } from "react";
import { useReservationStore } from "@/services/reservationStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Clock, Users, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Calendar() {
  const { reservations } = useReservationStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
    days.push(d.toISOString().split('T')[0]);
  }

  const selectedDayReservations = reservations
    .filter(r => r.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div>
        <h1 className="font-serif text-3xl font-medium tracking-tight mb-1">Calendar</h1>
        <p className="text-muted-foreground">View reservations by date.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        <Card className="lg:col-span-2 border-white/5 bg-card flex flex-col min-h-0">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
            <h2 className="font-serif text-xl font-medium">{monthName} {year}</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8 border-white/10">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8 border-white/10">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 p-4">
            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs text-muted-foreground uppercase tracking-wider">
              <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>
            <div className="grid grid-cols-7 gap-2 auto-rows-fr h-[calc(100%-2rem)]">
              {days.map((dateStr, i) => {
                if (!dateStr) return <div key={`empty-${i}`} className="bg-black/10 rounded-md border border-white/5 opacity-30" />;
                
                const isSelected = selectedDate === dateStr;
                const isToday = dateStr === new Date().toISOString().split('T')[0];
                const dayReservations = reservations.filter(r => r.date === dateStr && r.status !== 'Cancelled');
                const count = dayReservations.length;
                
                const dayNumber = new Date(dateStr).getDate();

                return (
                  <div 
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`
                      relative p-2 rounded-md border flex flex-col cursor-pointer transition-colors
                      ${isSelected ? 'bg-primary/20 border-primary' : 'bg-black/20 border-white/5 hover:border-white/20'}
                    `}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-sm ${isToday ? 'bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center font-bold' : 'text-muted-foreground'}`}>
                        {dayNumber}
                      </span>
                    </div>
                    {count > 0 && (
                      <div className="mt-auto">
                        <div className="text-xs bg-primary/20 text-primary-foreground rounded px-1.5 py-0.5 inline-block font-medium">
                          {count} res
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        <Card className="border-white/5 bg-card flex flex-col min-h-0 overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-black/20 pb-4">
            <CardTitle className="text-lg">
              {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </CardTitle>
          </CardHeader>
          <div className="flex-1 overflow-y-auto p-0">
            {selectedDayReservations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground h-full flex flex-col items-center justify-center">
                <CalendarIcon className="w-12 h-12 mb-4 opacity-20" />
                <p>No reservations for this date</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {selectedDayReservations.map(res => (
                  <div key={res.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-white truncate max-w-[150px]">{res.customer.name}</h4>
                      <Badge variant={
                        res.status === 'Confirmed' ? 'success' :
                        res.status === 'Checked In' ? 'secondary' :
                        res.status === 'Cancelled' ? 'destructive' : 'warning'
                      } className="text-[10px] px-1.5 py-0">
                        {res.status}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {res.time}</span>
                      <span className="flex items-center"><Users className="w-3 h-3 mr-1" /> {res.guests}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
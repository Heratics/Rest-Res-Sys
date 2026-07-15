import { Map } from "lucide-react";

export default function FloorPlan() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
      <div className="w-20 h-20 rounded-2xl bg-white/3 border border-white/10 flex items-center justify-center mb-6">
        <Map className="w-10 h-10 text-white/20" />
      </div>
      <h1 className="font-serif text-3xl text-white/40 mb-3">Floor Plan Coming Next</h1>
      <p className="text-muted-foreground/60 max-w-sm text-sm leading-relaxed">
        The interactive floor plan is under development. Table assignment, real-time seating status, and drag-and-drop layout management will be available here.
      </p>
    </div>
  );
}

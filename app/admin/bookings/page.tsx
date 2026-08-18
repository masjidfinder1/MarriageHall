import { BookingManager } from "@/components/admin/BookingManager";

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bookings</h1>
        <p className="text-muted-foreground">Manage customer bookings, status, and deletions.</p>
      </div>
      <BookingManager />
    </div>
  );
}

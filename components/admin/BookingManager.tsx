"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface BookingManagerProps {
  compact?: boolean;
}

export function BookingManager({ compact = false }: BookingManagerProps) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(compact ? 5 : 100);

    if (error) {
      console.error("Failed to load bookings:", error);
      toast.error("Failed to load bookings");
      setBookings([]);
    } else {
      setBookings(data ?? []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadBookings();
  }, [compact]);

  const updateBookingStatus = async (id: string, status: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("bookings")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Update booking status failed:", error);
      toast.error("Status update failed");
      return;
    }

    toast.success("Booking status updated");
    await loadBookings();
  };

  const deleteBooking = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    const supabase = createClient();
    const { error } = await supabase.from("bookings").delete().eq("id", id);

    if (error) {
      console.error("Delete booking failed:", error);
      toast.error("Failed to delete booking");
      return;
    }

    toast.success("Booking deleted");
    await loadBookings();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading bookings...
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Booking ID</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
            {!compact && <th className="text-right py-3 px-4 font-medium text-muted-foreground">Amount</th>}
            <th className="text-right py-3 px-4 font-medium text-muted-foreground">Action</th>
          </tr>
        </thead>
        <tbody>
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <tr key={booking.id} className="border-b border-border/50 hover:bg-accent/50">
                <td className="py-3 px-4 font-mono text-xs">{booking.booking_id || "-"}</td>
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium">{booking.customer_name || "-"}</p>
                    <p className="text-xs text-muted-foreground">{booking.customer_phone || booking.customer_email || "-"}</p>
                  </div>
                </td>
                <td className="py-3 px-4 text-muted-foreground">
                  {booking.event_date ? new Date(booking.event_date).toLocaleDateString("en-IN") : "-"}
                </td>
                <td className="py-3 px-4">
                  <select
                    value={booking.status || "pending"}
                    onChange={(event) => updateBookingStatus(booking.id, event.target.value)}
                    className="rounded-lg border border-input bg-background px-2 py-1 text-xs font-medium text-foreground focus:border-primary outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="rejected">Rejected</option>
                    <option value="completed">Completed</option>
                  </select>
                </td>
                {!compact && (
                  <td className="py-3 px-4 text-right font-medium">
                    ₹{Number(booking.total_amount || 0).toLocaleString("en-IN")}
                  </td>
                )}
                <td className="py-3 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => deleteBooking(booking.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-destructive/40 px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={compact ? 5 : 6} className="py-8 text-center text-muted-foreground">
                No bookings yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

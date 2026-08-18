import { createClient } from "@/lib/supabase-server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingManager } from "@/components/admin/BookingManager";
import { CalendarDays, Users, Building2, Clock } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = createClient();

  const [
    { count: totalBookings },
    { count: pendingBookings },
    { count: confirmedBookings },
    { count: totalVenues },
  ] = await Promise.all([
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "confirmed"),
    supabase.from("venues").select("*", { count: "exact", head: true }).eq("is_active", true),
  ]);

  const stats = [
    { title: "Total Bookings", value: totalBookings || 0, icon: CalendarDays, color: "text-blue-500" },
    { title: "Pending", value: pendingBookings || 0, icon: Clock, color: "text-yellow-500" },
    { title: "Confirmed", value: confirmedBookings || 0, icon: Users, color: "text-green-500" },
    { title: "Active Venues", value: totalVenues || 0, icon: Building2, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your marriage hall</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <BookingManager compact />
        </CardContent>
      </Card>
    </div>
  );
}

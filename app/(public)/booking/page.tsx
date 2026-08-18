"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Calendar, Users, Phone, Mail, User, ChevronRight, ChevronLeft, Check, Send, Tag, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";

const STORAGE_KEY = "marriage-hall-booking-state";
const steps = ["Select Date", "Select Venue", "Your Details", "Review"];

const toLocalISODate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getCalendarGrid = (monthDate: Date) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const startDay = new Date(year, month, 1 - firstDayOfMonth.getDay());
  const days: Date[] = [];

  for (let i = 0; i < 42; i += 1) {
    days.push(new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDate() + i));
  }

  return days;
};

export default function BookingPage() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [venues, setVenues] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [formData, setFormData] = useState({
    event_date: "",
    venue_id: "",
    package_id: "",
    selected_services: [] as string[],
    selected_rooms: [] as string[],
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    event_type: "Wedding",
    guest_count: 100,
    special_requirements: "",
    coupon_code: "",
  });
  const [bookingId, setBookingId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [coupon, setCoupon] = useState<any>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());
  const [calendarMonth, setCalendarMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [prices, setPrices] = useState({
    subtotal: 0,
    discount: 0,
    total: 0
  });

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({ ...prev, ...parsed }));
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    const venueParam = searchParams.get("venue") || "";
    const packageParam = searchParams.get("package") || "";
    if (venueParam) setFormData((prev) => ({ ...prev, venue_id: venueParam }));
    if (packageParam) setFormData((prev) => ({ ...prev, package_id: packageParam }));
  }, [searchParams]);

  useEffect(() => {
    const loadOptions = async () => {
      const supabase = createClient();
      const [{ data: venueData }, { data: packageData }, { data: serviceData }, { data: bookingData }] = await Promise.all([
        supabase.from("venues").select("*").eq("is_active", true).order("sort_order"),
        supabase.from("packages").select("*").eq("is_active", true).order("sort_order"),
        supabase.from("services").select("*").eq("is_active", true).order("sort_order"),
        supabase.from("bookings").select("event_date, status").not("event_date", "is", null),
      ]);

      const blockedDates = new Set<string>();
      (bookingData || []).forEach((booking) => {
        if (!booking.event_date || ["cancelled", "rejected"].includes(booking.status)) return;
        blockedDates.add(booking.event_date);
      });

      setVenues(venueData || []);
      setPackages(packageData || []);
      setServices(serviceData || []);
      setBookedDates(blockedDates);
      setLoadingOptions(false);
    };

    loadOptions();
  }, []);

  useEffect(() => {
    if (!submitted) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData, submitted]);

  const calculatePrices = useCallback(() => {
    const venue = venues.find(v => v.id === formData.venue_id);
    const pkg = packages.find(p => p.id === formData.package_id);

    let subtotal = 0;
    if (venue) subtotal += Number(venue.price_per_event || 0);
    if (pkg) {
      subtotal += Number(pkg.price || 0);
      subtotal += Number(pkg.price_per_person || 0) * Number(formData.guest_count);
    }

    let discount = 0;
    if (coupon && subtotal >= (coupon.min_amount || 0)) {
      if (coupon.discount_type === 'percentage') {
        discount = (subtotal * Number(coupon.discount_value)) / 100;
        if (coupon.max_discount && discount > coupon.max_discount) {
          discount = coupon.max_discount;
        }
      } else {
        discount = Number(coupon.discount_value);
      }
    }

    setPrices({
      subtotal,
      discount,
      total: Math.max(0, subtotal - discount)
    });
  }, [formData, venues, packages, coupon]);

  useEffect(() => {
    calculatePrices();
  }, [calculatePrices]);

  const validateCoupon = async () => {
    if (!formData.coupon_code.trim()) return;

    setValidatingCoupon(true);
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", formData.coupon_code.toUpperCase())
        .eq("is_active", true)
        .single();

      if (error || !data) {
        toast.error("Invalid coupon code");
        setCoupon(null);
      } else {
        const now = new Date();
        if (data.expiry_date && new Date(data.expiry_date) < now) {
          toast.error("Coupon has expired");
          setCoupon(null);
        } else if (data.usage_limit && data.usage_count >= data.usage_limit) {
          toast.error("Coupon usage limit reached");
          setCoupon(null);
        } else {
          setCoupon(data);
          toast.success("Coupon applied!");
        }
      }
    } catch (err) {
      toast.error("Error validating coupon");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const eventTypeOptions = [
    "Wedding",
    "Engagement",
    "Reception",
    "Birthday",
    "Corporate",
    "Other",
    ...Array.from(new Set((services || []).map((service) => service.category).filter(Boolean)))
  ].filter((value, index, array) => value && array.indexOf(value) === index);

  const isDateBooked = (dateValue: string) => bookedDates.has(dateValue);

  const canAdvance = () => {
    if (step === 0) return Boolean(formData.event_date && formData.event_type && Number(formData.guest_count) > 0);
    if (step === 1) return true;
    if (step === 2) return Boolean(formData.customer_name.trim() && formData.customer_phone.trim());
    return true;
  };

  const handleNext = () => {
    if (!canAdvance()) {
      toast.error("Please complete the required fields before continuing.");
      return;
    }

    if (step === 0 && isDateBooked(formData.event_date)) {
      toast.error("This date is already booked. Please choose another date.");
      return;
    }

    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleSubmit = async () => {
    const supabase = createClient();

    const { data: existingBookings } = await supabase
      .from("bookings")
      .select("id")
      .eq("event_date", formData.event_date)
      .in("status", ["confirmed", "pending", "completed"])
      .limit(1);

    if (existingBookings && existingBookings.length > 0) {
      toast.error("This date is already booked or has a pending booking. Please select a different date.");
      return;
    }

    const bkId = `BK${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const payload = {
      booking_id: bkId,
      ...formData,
      venue_id: formData.venue_id && formData.venue_id.trim() ? formData.venue_id : null,
      package_id: formData.package_id && formData.package_id.trim() ? formData.package_id : null,
      selected_services: Array.isArray(formData.selected_services) ? formData.selected_services : [],
      selected_rooms: Array.isArray(formData.selected_rooms) ? formData.selected_rooms : [],
      status: "pending",
      subtotal: prices.subtotal,
      discount_amount: prices.discount,
      total_amount: prices.total,
      customer_name: formData.customer_name.trim(),
      customer_phone: formData.customer_phone.trim(),
      customer_email: formData.customer_email.trim() || null,
      special_requirements: formData.special_requirements.trim() || null,
      coupon_code: coupon ? coupon.code : null,
    };

    const { error } = await supabase.from("bookings").insert(payload);

    if (error) {
      toast.error("Booking failed: " + error.message);
    } else {
      if (coupon) {
        await supabase.rpc("increment_coupon_usage", { coupon_id: coupon.id });
      }

      setBookingId(bkId);
      setSubmitted(true);
      window.localStorage.removeItem(STORAGE_KEY);
      toast.success(`Booking submitted! ID: ${bkId}`);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full mx-4 bg-card rounded-2xl border border-border p-8 text-center"
        >
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-foreground mb-4">Booking Confirmed!</h2>
          <p className="text-muted-foreground mb-6">
            Thank you for your booking request. We will contact you shortly.
          </p>
          <div className="bg-primary/5 rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground mb-1">Your Booking ID</p>
            <p className="font-mono text-xl font-bold text-primary">{bookingId}</p>
          </div>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-opacity"
          >
            Back to Home
          </a>
        </motion.div>
      </div>
    );
  }

  if (loadingOptions) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12 flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading booking options...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <p className="text-primary font-medium uppercase tracking-[0.2em] text-xs">Reservation</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mt-3">Book Your Event</h1>
        </div>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {steps.map((label, idx) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${idx === step ? "bg-primary text-primary-foreground" : "bg-accent text-foreground"}`}>
                      {idx + 1}
                    </div>
                    {idx < steps.length - 1 && <div className="w-8 h-px bg-border" />}
                  </div>
                ))}
              </div>
            </div>

            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Event Date</label>
                  <div className="rounded-2xl border border-border bg-background p-4">
                    <div className="flex items-center justify-between mb-4">
                      <button type="button" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))} className="px-2 py-1 rounded-lg border border-border">←</button>
                      <div className="font-semibold text-foreground">
                        {calendarMonth.toLocaleString("en-US", { month: "long", year: "numeric" })}
                      </div>
                      <button type="button" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))} className="px-2 py-1 rounded-lg border border-border">→</button>
                    </div>

                    <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-muted-foreground mb-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day}>{day}</div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                      {getCalendarGrid(calendarMonth).map((day) => {
                        const dateValue = toLocalISODate(day);
                        const isCurrentMonth = day.getMonth() === calendarMonth.getMonth();
                        const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
                        const isBooked = isDateBooked(dateValue);
                        const isSelected = formData.event_date === dateValue;

                        return (
                          <button
                            key={dateValue}
                            type="button"
                            disabled={!isCurrentMonth || isPast || isBooked}
                            onClick={() => setFormData({ ...formData, event_date: dateValue })}
                            className={`h-10 rounded-lg text-sm transition ${
                              !isCurrentMonth ? "text-muted-foreground/40" : "text-foreground"
                            } ${isSelected ? "bg-primary text-primary-foreground" : "bg-background hover:bg-primary/10"} ${
                              isBooked ? "bg-red-500/10 text-red-600 line-through cursor-not-allowed" : ""
                            } ${isPast && isCurrentMonth ? "opacity-40 cursor-not-allowed" : ""}`}
                            title={isBooked ? "Booked date" : "Available date"}
                          >
                            {day.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <input
                    type="date"
                    value={formData.event_date}
                    min={toLocalISODate(new Date())}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    className="mt-4 w-full px-4 py-3 rounded-xl border border-input bg-background focus:border-primary outline-none"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    {bookedDates.size > 0 ? `${bookedDates.size} booked dates are blocked.` : "No blocked dates in the current booking records."}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Event Type</label>
                  <div className="flex flex-wrap gap-2">
                    {eventTypeOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setFormData({ ...formData, event_type: option })}
                        className={`px-3 py-2 rounded-full border text-sm font-medium ${
                          formData.event_type === option
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-foreground hover:border-primary/40"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Guest Count</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.guest_count}
                    onChange={(e) => setFormData({ ...formData, guest_count: Number(e.target.value) || 0 })}
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:border-primary outline-none"
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">Select Venue</label>
                  <div className="grid md:grid-cols-2 gap-3">
                    {venues.map((venue) => (
                      <button
                        key={venue.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, venue_id: venue.id })}
                        className={`rounded-2xl border p-3 text-left ${
                          formData.venue_id === venue.id ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/40"
                        }`}
                      >
                        <p className="font-semibold text-foreground">{venue.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">{venue.short_description || venue.description}</p>
                        <p className="text-sm font-medium text-primary mt-2">₹{Number(venue.price_per_event || 0).toLocaleString("en-IN")}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">Select Package</label>
                  <div className="space-y-3">
                    {packages.map((pkg) => (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, package_id: pkg.id })}
                        className={`w-full rounded-2xl border p-4 text-left ${
                          formData.package_id === pkg.id ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/40"
                        }`}
                      >
                        <div className="flex justify-between gap-3">
                          <div>
                            <p className="font-semibold text-foreground">{pkg.name}</p>
                            <p className="text-sm text-muted-foreground mt-1">{pkg.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-primary">₹{Number(pkg.price || 0).toLocaleString("en-IN")}</p>
                            <p className="text-xs text-muted-foreground">Per person: ₹{Number(pkg.price_per_person || 0).toLocaleString("en-IN")}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                  <input
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:border-primary outline-none"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                    <input
                      value={formData.customer_phone}
                      onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.customer_email}
                      onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Special Requirements</label>
                  <textarea
                    rows={4}
                    value={formData.special_requirements}
                    onChange={(e) => setFormData({ ...formData, special_requirements: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:border-primary outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-border bg-background p-4">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Event</p>
                      <p className="font-medium text-foreground">{formData.event_type}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-medium text-foreground">{new Date(formData.event_date).toLocaleDateString("en-IN")}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Venue</p>
                      <p className="font-medium text-foreground">{venues.find((v) => v.id === formData.venue_id)?.name || "Not selected"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Package</p>
                      <p className="font-medium text-foreground">{packages.find((p) => p.id === formData.package_id)?.name || "Not selected"}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-4 h-4 text-primary" />
                    <p className="font-medium text-foreground">Coupon</p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={formData.coupon_code}
                      onChange={(e) => setFormData({ ...formData, coupon_code: e.target.value.toUpperCase() })}
                      placeholder="Enter coupon code"
                      className="flex-1 px-4 py-3 rounded-xl border border-input bg-background focus:border-primary outline-none"
                    />
                    <button
                      type="button"
                      onClick={validateCoupon}
                      disabled={validatingCoupon}
                      className="px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-60"
                    >
                      {validatingCoupon ? "Checking..." : "Apply"}
                    </button>
                  </div>
                  {coupon && <p className="mt-3 text-sm text-green-600">Coupon applied: {coupon.code}</p>}
                </div>

                <div className="rounded-2xl border border-border bg-background p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{prices.subtotal.toLocaleString("en-IN")}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span>-₹{prices.discount.toLocaleString("en-IN")}</span></div>
                    <div className="flex justify-between font-semibold text-foreground"><span>Total</span><span>₹{prices.total.toLocaleString("en-IN")}</span></div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep((prev) => Math.max(prev - 1, 0))}
                disabled={step === 0}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-border text-foreground disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              {step < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium"
                >
                  <Send className="w-4 h-4" />
                  Submit Booking
                </button>
              )}
            </div>
          </div>

          <aside className="bg-card border border-border rounded-2xl p-6 shadow-sm h-fit">
            <div className="mb-5">
              <p className="text-primary font-medium uppercase tracking-[0.2em] text-xs">Summary</p>
              <h2 className="font-serif text-2xl font-bold text-foreground mt-2">Your Event</h2>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-primary" />
                <span>{formData.event_date ? new Date(formData.event_date).toLocaleDateString("en-IN") : "Choose date"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-primary" />
                <span>{formData.guest_count} guests</span>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-primary" />
                <span>{formData.customer_name || "Add your name"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary" />
                <span>{formData.customer_phone || "Add contact"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary" />
                <span>{formData.customer_email || "Add email"}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

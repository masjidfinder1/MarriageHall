"use client";

import { motion } from "framer-motion";
import { Users, Maximize, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/public/ScrollReveal";
import type { Venue } from "@/types";

interface VenuesSectionProps {
  venues: Venue[];
}

export function VenuesSection({ venues }: VenuesSectionProps) {
  if (venues.length === 0) return null;

  return (
    <section id="venues" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-16">
          <span className="text-primary font-medium tracking-wider uppercase text-sm">
            Our Venues
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mt-3">
            Exquisite Halls for Every Occasion
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            From intimate gatherings to grand celebrations, find the perfect space for your event
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {venues.map((venue, index) => (
            <ScrollReveal key={venue.id} delay={index * 0.1}>
              <motion.div
                className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300"
                whileHover={{ y: -5 }}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  {venue.images && venue.images[0] ? (
                    <Image
                      src={venue.images[0]}
                      alt={venue.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                      <span className="text-4xl font-serif text-primary/30">{venue.name[0]}</span>
                    </div>
                  )}
                  {venue.featured && (
                    <span className="absolute top-4 left-4 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                      Featured
                    </span>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="font-serif text-xl font-bold text-foreground mb-2">
                    {venue.name}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                    {venue.short_description || venue.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      {venue.capacity} Guests
                    </span>
                    {venue.area_sqft && (
                      <span className="flex items-center gap-1.5">
                        <Maximize className="w-4 h-4" />
                        {venue.area_sqft} sqft
                      </span>
                    )}
                  </div>

                  {venue.price_per_event && (
                    <p className="font-serif text-lg font-semibold text-primary mb-4">
                      ₹{venue.price_per_event.toLocaleString("en-IN")}
                      <span className="text-sm text-muted-foreground font-normal"> /event</span>
                    </p>
                  )}

                  <Link
                    href={`/booking?venue=${venue.id}`}
                    className="inline-flex items-center gap-2 text-primary font-medium text-sm hover:gap-3 transition-all"
                  >
                    Book This Hall
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

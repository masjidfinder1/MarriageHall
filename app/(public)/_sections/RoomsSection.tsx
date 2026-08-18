"use client";

import { motion } from "framer-motion";
import { Users, Bed, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/public/ScrollReveal";
import type { Room } from "@/types";

interface RoomsSectionProps {
  rooms: Room[];
}

export function RoomsSection({ rooms }: RoomsSectionProps) {
  if (rooms.length === 0) return null;

  return (
    <section id="rooms" className="py-24 bg-accent/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-16">
          <span className="text-primary font-medium tracking-wider uppercase text-sm">
            Accommodations
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mt-3">
            Luxury Rooms for Your Guests
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Comfortable and elegant rooms for you and your guests to relax
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room, index) => (
            <ScrollReveal key={room.id} delay={index * 0.1}>
              <motion.div
                className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300"
                whileHover={{ y: -5 }}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  {room.images && room.images[0] ? (
                    <Image
                      src={room.images[0]}
                      alt={room.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                      <Bed className="w-12 h-12 text-primary/30" />
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-serif text-xl font-bold text-foreground">
                      {room.name}
                    </h3>
                    {room.featured && (
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                        Popular
                      </span>
                    )}
                  </div>

                  <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                    {room.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    {room.capacity && (
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        {room.capacity} Guests
                      </span>
                    )}
                    {room.beds && (
                      <span className="flex items-center gap-1.5">
                        <Bed className="w-4 h-4" />
                        {room.beds}
                      </span>
                    )}
                  </div>

                  {room.price_per_night && (
                    <p className="font-serif text-lg font-semibold text-primary mb-4">
                      ₹{room.price_per_night.toLocaleString("en-IN")}
                      <span className="text-sm text-muted-foreground font-normal"> /night</span>
                    </p>
                  )}

                  <Link
                    href={`/booking?room=${room.id}`}
                    className="inline-flex items-center gap-2 text-primary font-medium text-sm hover:gap-3 transition-all"
                  >
                    Reserve Room
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

"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Users, Calendar, Award, Heart } from "lucide-react";
import type { Venue } from "@/types";

interface StatsSectionProps {
  venues: Venue[];
}

function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export function StatsSection({ venues }: StatsSectionProps) {
  const totalCapacity = venues.reduce((sum, v) => sum + (v.capacity || 0), 0);

  const stats = [
    { icon: Users, value: totalCapacity || 2000, suffix: "+", label: "Guest Capacity" },
    { icon: Calendar, value: 500, suffix: "+", label: "Events Hosted" },
    { icon: Award, value: 15, suffix: "+", label: "Awards Won" },
    { icon: Heart, value: 98, suffix: "%", label: "Happy Clients" },
  ];

  return (
    <section className="py-20 bg-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <stat.icon className="w-8 h-8 mx-auto mb-4 text-primary" />
              <div className="font-serif text-4xl font-bold text-foreground mb-2">
                <Counter target={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

// Curated collection of luxury hotel, resort, villa, suite & penthouse imagery
export const HERO_HOTEL_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&auto=format&fit=crop&q=85",
    title: "Serena Grand Palace & Heritage Gardens",
    location: "Islamabad, Pakistan",
    category: "5 Star Luxury",
  },
  {
    url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&auto=format&fit=crop&q=85",
    title: "The Pearl Continental Royal Suites",
    location: "Lahore, Pakistan",
    category: "Boutique Heritage",
  },
  {
    url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&auto=format&fit=crop&q=85",
    title: "Alpine Haven Riverfront Chalets",
    location: "Naran Valley, Pakistan",
    category: "Mountain Resort",
  },
  {
    url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1600&auto=format&fit=crop&q=85",
    title: "Shangrila Oasis Lakeside Pavilions",
    location: "Skardu, Pakistan",
    category: "Eco Sanctuary",
  },
  {
    url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1600&auto=format&fit=crop&q=85",
    title: "Azure Marina Coastal Luxury Resort",
    location: "Karachi Coast, Pakistan",
    category: "Seaside Villa",
  },
  {
    url: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1600&auto=format&fit=crop&q=85",
    title: "Presidential Sky Penthouse",
    location: "Islamabad Sector F-6",
    category: "Executive Residence",
  },
  {
    url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1600&auto=format&fit=crop&q=85",
    title: "Mughal Courtyard Boutique Hotel",
    location: "Old City Lahore",
    category: "Heritage Suites",
  },
  {
    url: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1600&auto=format&fit=crop&q=85",
    title: "Margalla Vista Mountain Lodges",
    location: "Pir Sohawa, Islamabad",
    category: "Hilltop Chalet",
  },
  {
    url: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1600&auto=format&fit=crop&q=85",
    title: "Karakoram Glacial View Resort",
    location: "Hunza Valley",
    category: "Alpine Resort",
  },
  {
    url: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1600&auto=format&fit=crop&q=85",
    title: "The Regent Urban Luxury Apartments",
    location: "Gulberg, Lahore",
    category: "Modern High-Rise",
  },
];

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  useEffect(() => {
    if (!isAutoPlay) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_HOTEL_IMAGES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % HERO_HOTEL_IMAGES.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + HERO_HOTEL_IMAGES.length) % HERO_HOTEL_IMAGES.length);
  };

  const current = HERO_HOTEL_IMAGES[currentIndex];

  return (
    <div
      className="relative w-full h-[460px] sm:h-[520px] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 group"
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(true)}
    >
      {/* Background Image Carousel with Smooth Transitions */}
      {HERO_HOTEL_IMAGES.map((img, idx) => (
        <div
          key={img.url}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentIndex ? "opacity-100 scale-105 transition-transform duration-7000" : "opacity-0 scale-100"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.url}
            alt={img.title}
            className="w-full h-full object-cover"
          />
          {/* Subtle gradient scrim to ensure text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />
        </div>
      ))}

      {/* Slide Info Overlay Bottom */}
      <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div className="space-y-1.5 text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-lava-600 to-orange-500 text-white text-xs font-bold shadow-lg">
            <span>{current.category}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-heading drop-shadow-md text-white">
            {current.title}
          </h3>
          <p className="text-xs text-slate-200 flex items-center gap-1 font-medium">
            <span>📍 {current.location}</span>
          </p>
        </div>

        {/* Carousel Navigation Controls */}
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/20">
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-xl bg-white/15 hover:bg-white/30 text-white transition"
            title="Previous hotel"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 px-2">
            {HERO_HOTEL_IMAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentIndex ? "w-6 bg-gradient-to-r from-lava-500 to-orange-400" : "w-2 bg-white/40 hover:bg-white/70"
                }`}
                title={`Jump to slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="p-1.5 rounded-xl bg-white/15 hover:bg-white/30 text-white transition"
            title="Next hotel"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className="p-1.5 rounded-xl bg-white/15 hover:bg-white/30 text-white transition ml-1"
            title={isAutoPlay ? "Pause slideshow" : "Play slideshow"}
          >
            {isAutoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

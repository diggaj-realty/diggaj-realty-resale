/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { loadMapsApi } from "@/lib/googleMaps";

// On-brand marker: dark teardrop pin with a lime house glyph.
const HOME_PIN =
  `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="52" viewBox="0 0 44 52">` +
  `<path d="M22 0C9.85 0 0 9.85 0 22c0 15 22 30 22 30s22-15 22-30C44 9.85 34.15 0 22 0Z" fill="#171717"/>` +
  `<path d="M22 10.5 11.5 19.5V33H19v-7h6v7h7.5V19.5z" fill="#cdea6f"/>` +
  `</svg>`;

export default function PropertyMap({
  lat,
  lng,
  title,
  apiKey,
  className = "h-[40vh] w-full bg-cream",
}: {
  lat: number;
  lng: number;
  title: string;
  apiKey: string;
  /** Overrides the default light-page sizing/background for callers embedded
   *  in a differently themed section (e.g. a dark panel). */
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  // The Maps JS API is a few hundred KB of third-party script, and this map sits
  // near the bottom of a long property page — most visitors never reach it. Wait
  // until it's actually approaching the viewport before fetching anything.
  // rootMargin gives it a head start so the map is usually ready on arrival.
  const [shouldLoad, setShouldLoad] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      // Deferred rather than set synchronously in the effect body, which risks
      // cascading renders (same queueMicrotask pattern as AuthContext).
      queueMicrotask(() => setShouldLoad(true));
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldLoad) return;
    let cancelled = false;
    // Google calls this if the key/project isn't authorized for Maps JS API —
    // fall back to the embed instead of showing Google's error overlay.
    (window as any).gm_authFailure = () => {
      if (!cancelled) setFailed(true);
    };
    loadMapsApi(apiKey)
      .then(async () => {
        const g = (window as any).google;
        const { Map } = await g.maps.importLibrary("maps");
        await g.maps.importLibrary("marker");
        if (cancelled || !ref.current) return;
        const map = new Map(ref.current, {
          center: { lat, lng },
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });
        new g.maps.Marker({
          position: { lat, lng },
          map,
          title,
          icon: {
            url: "data:image/svg+xml," + encodeURIComponent(HOME_PIN),
            scaledSize: new g.maps.Size(44, 52),
            anchor: new g.maps.Point(22, 52),
          },
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [shouldLoad, lat, lng, title, apiKey]);

  // Fallback to the embed (red pin) only if the JS API can't load.
  if (failed) {
    return (
      <iframe
        title={`Map of ${title}`}
        loading="lazy"
        allowFullScreen
        className={`${className} border-0`}
        src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}&zoom=15`}
      />
    );
  }

  return <div ref={ref} className={className} />;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";

// On-brand marker: dark teardrop pin with a lime house glyph.
const HOME_PIN =
  `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="52" viewBox="0 0 44 52">` +
  `<path d="M22 0C9.85 0 0 9.85 0 22c0 15 22 30 22 30s22-15 22-30C44 9.85 34.15 0 22 0Z" fill="#171717"/>` +
  `<path d="M22 10.5 11.5 19.5V33H19v-7h6v7h7.5V19.5z" fill="#cdea6f"/>` +
  `</svg>`;

let loaderPromise: Promise<void> | null = null;
function loadMapsApi(key: string): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if ((window as any).google?.maps) return Promise.resolve();
  if (loaderPromise) return loaderPromise;
  loaderPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async`;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("maps script failed"));
    document.head.appendChild(s);
  });
  return loaderPromise;
}

export default function PropertyMap({
  lat,
  lng,
  title,
  apiKey,
}: {
  lat: number;
  lng: number;
  title: string;
  apiKey: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
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
  }, [lat, lng, title, apiKey]);

  // Fallback to the embed (red pin) only if the JS API can't load.
  if (failed) {
    return (
      <iframe
        title={`Map of ${title}`}
        loading="lazy"
        allowFullScreen
        className="h-[40vh] w-full border-0"
        src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}&zoom=15`}
      />
    );
  }

  return <div ref={ref} className="h-[40vh] w-full bg-cream" />;
}

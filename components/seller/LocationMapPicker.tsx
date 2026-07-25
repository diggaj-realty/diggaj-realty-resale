/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { loadMapsApi, getGoogle } from "@/lib/googleMaps";

const DEFAULT_CENTER = { lat: 12.9716, lng: 77.5946 }; // Bengaluru — sensible default, most listings are here

export default function LocationMapPicker({
  apiKey,
  lat,
  lng,
  onChange,
}: {
  apiKey?: string;
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!apiKey) return;
    let cancelled = false;
    (window as any).gm_authFailure = () => {
      if (!cancelled) setFailed(true);
    };
    loadMapsApi(apiKey)
      .then(async () => {
        const g = getGoogle();
        const { Map } = await g.maps.importLibrary("maps");
        await g.maps.importLibrary("marker");
        if (cancelled || !ref.current) return;

        const center = lat != null && lng != null ? { lat, lng } : DEFAULT_CENTER;
        const map = new Map(ref.current, {
          center,
          zoom: lat != null ? 16 : 11,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        mapRef.current = map;

        const marker = new g.maps.Marker({
          position: lat != null && lng != null ? { lat, lng } : null,
          map,
          draggable: true,
        });
        markerRef.current = marker;

        marker.addListener("dragend", () => {
          const pos = marker.getPosition();
          if (pos) onChange(pos.lat(), pos.lng());
        });
        map.addListener("click", (e: any) => {
          const pos = e.latLng;
          marker.setPosition(pos);
          onChange(pos.lat(), pos.lng());
        });

        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  if (!apiKey || failed) {
    // Graceful fallback: plain numeric inputs, no map.
    return (
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5 text-sm text-ink">
          Latitude
          <input
            type="number"
            step="any"
            value={lat ?? ""}
            onChange={(e) => onChange(Number(e.target.value), lng ?? DEFAULT_CENTER.lng)}
            placeholder="12.9716"
            className="rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none focus:border-ink/30"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-ink">
          Longitude
          <input
            type="number"
            step="any"
            value={lng ?? ""}
            onChange={(e) => onChange(lat ?? DEFAULT_CENTER.lat, Number(e.target.value))}
            placeholder="77.5946"
            className="rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none focus:border-ink/30"
          />
        </label>
      </div>
    );
  }

  return (
    <div>
      <div ref={ref} className="h-64 w-full overflow-hidden rounded-2xl bg-cream" />
      <p className="mt-2 text-xs text-body">
        {ready ? "Tap the map or drag the pin to set the exact location." : "Loading map…"}
      </p>
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

// Shared loader for the Google Maps JavaScript API — used by both the
// read-only property map and the seller's location picker so the script tag
// (and its auth-failure handling) only ever gets injected once per page.
let loaderPromise: Promise<void> | null = null;

export function loadMapsApi(key: string): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if ((window as any).google?.maps) return Promise.resolve();
  if (loaderPromise) return loaderPromise;
  loaderPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async`;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      loaderPromise = null;
      reject(new Error("maps script failed"));
    };
    document.head.appendChild(s);
  });
  return loaderPromise;
}

export function getGoogle(): any {
  return (window as any).google;
}

"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { PropertyPhoto } from "@/types/api";

export default function Gallery({
  photos,
  title,
}: {
  photos: PropertyPhoto[];
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const count = photos.length;

  const show = useCallback((i: number) => {
    setIndex(i);
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);
  const next = useCallback(
    () => setIndex((i) => (i + 1) % count),
    [count]
  );
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + count) % count),
    [count]
  );

  // keyboard nav + scroll lock while the lightbox is open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, close, next, prev]);

  if (count === 0) {
    return (
      <div className="mx-3 mt-3 flex h-[26vh] items-center justify-center rounded-[24px] bg-cream text-sm text-body">
        No photos yet
      </div>
    );
  }

  const thumbs = photos.slice(1, 5);
  const extra = count - 5; // photos beyond the 1 hero + 4 thumbs

  return (
    <>
      <div className="grid gap-2.5 px-3 pt-3 md:grid-cols-[1.7fr_1fr]">
        {/* hero */}
        <button
          type="button"
          onClick={() => show(0)}
          className="group relative h-[34vh] max-h-[460px] overflow-hidden rounded-[24px] bg-cream md:h-[46vh]"
        >
          <Image
            src={photos[0].url}
            alt={title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
          <span className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-black/55 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
            </svg>
            {count} {count === 1 ? "photo" : "photos"}
          </span>
        </button>

        {/* thumb grid */}
        {thumbs.length > 0 && (
          <div className="grid grid-cols-2 grid-rows-2 gap-2.5 h-[24vh] max-h-[460px] md:h-[46vh]">
            {thumbs.map((photo, i) => {
              const isLast = i === thumbs.length - 1 && extra > 0;
              return (
                <button
                  type="button"
                  key={photo.id}
                  onClick={() => show(i + 1)}
                  className="group relative overflow-hidden rounded-[18px] bg-cream"
                >
                  <Image
                    src={photo.url}
                    alt={`${title} — photo ${i + 2}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                  {isLast && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-lg font-medium text-white backdrop-blur-[2px]">
                      +{extra}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* lightbox */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-black/92 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} photos`}
        >
          {/* top bar */}
          <div className="flex items-center justify-between px-5 py-4 text-white">
            <span className="text-sm text-white/70">
              {index + 1} / {count}
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl leading-none transition hover:bg-white/20"
            >
              ✕
            </button>
          </div>

          {/* stage */}
          <div className="relative flex-1" onClick={close}>
            <Image
              src={photos[index].url}
              alt={`${title} — photo ${index + 1}`}
              fill
              sizes="100vw"
              className="object-contain p-4"
            />
          </div>

          {/* controls */}
          {count > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Previous photo"
                className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next photo"
                className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20"
              >
                ›
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

type CoverImageProps = {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
};

export default function CoverImage({ src, alt, className, fallback }: CoverImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!src) return;
    // Reset state when src changes
    setLoaded(false);
    setError(false);
    // Ha a kép már cache-ben van, az onLoad nem tüzel – ellenőrzük közvetlenül
    const img = imgRef.current;
    if (img && img.complete) {
      if (img.naturalWidth > 0) setLoaded(true);
      else setError(true);
    }
  }, [src]);

  if (!src || error) {
    return <>{fallback ?? null}</>;
  }

  return (
    <>
      {!loaded && (
        <span className="absolute inset-0 animate-pulse rounded-[inherit] bg-zinc-700" />
      )}
      <img
        ref={imgRef}
        className={cn(
          "h-full w-full select-none object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
        src={src}
        alt={alt}
        decoding="async"
        draggable={false}
        loading="lazy"
        onDragStart={(event) => event.preventDefault()}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </>
  );
}

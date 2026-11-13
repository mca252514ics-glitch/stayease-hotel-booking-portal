import { useState } from "react";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=72";

function optimizeImageUrl(source, width = 900) {
  if (!source) return FALLBACK_IMAGE;

  try {
    const url = new URL(source);
    if (url.hostname.includes("images.unsplash.com")) {
      url.searchParams.set("auto", "format");
      url.searchParams.set("fit", "crop");
      url.searchParams.set("w", String(width));
      url.searchParams.set("q", "72");
    }
    return url.toString();
  } catch {
    return FALLBACK_IMAGE;
  }
}

export default function OptimizedImage({
  src,
  alt,
  className = "",
  width = 900,
  priority = false,
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const imageSrc = optimizeImageUrl(failed ? FALLBACK_IMAGE : src, width);

  return (
    <div className={`image-frame ${loaded ? "is-loaded" : ""} ${className}`}>
      {!loaded && <span className="image-placeholder" aria-hidden="true" />}
      <img
        src={imageSrc}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (!failed) setFailed(true);
          else setLoaded(true);
        }}
      />
    </div>
  );
}

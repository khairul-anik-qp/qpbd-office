import { useEffect, useRef, useState, type ReactNode } from "react";
import { userInitials } from "@/shells/employee/lib/employee-request";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  photoUrl?: string | null;
  name?: string;
  className?: string;
  fallbackClassName?: string;
  fallback?: ReactNode;
  priority?: boolean;
}

export function UserAvatar({
  photoUrl,
  name = "",
  className,
  fallbackClassName,
  fallback,
  priority = false,
}: UserAvatarProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(photoUrl) && !failed;

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [photoUrl]);

  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) setLoaded(true);
  }, [photoUrl]);

  const fallbackContent = fallback ?? userInitials(name);

  return (
    <span className={cn("relative inline-flex shrink-0 overflow-hidden", className)}>
      <span
        className={cn(
          "flex size-full items-center justify-center transition-opacity",
          fallbackClassName,
          showPhoto && loaded ? "opacity-0" : "opacity-100",
        )}
        aria-hidden={showPhoto && loaded}
      >
        {fallbackContent}
      </span>
      {showPhoto ? (
        <img
          ref={imgRef}
          src={photoUrl!}
          alt=""
          referrerPolicy="no-referrer"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            "absolute inset-0 size-full object-cover transition-opacity",
            loaded ? "opacity-100" : "opacity-0",
          )}
        />
      ) : null}
    </span>
  );
}

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useCallback, useRef } from "react";
import { cn } from "@/lib/utils";

interface GoogleSignInButtonProps {
  disabled?: boolean;
  onSuccess: (credential: string) => void;
  onError?: () => void;
  className?: string;
}

/** Official four-color Google "G" mark (Sign in with Google branding). */
function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      aria-hidden
      className={cn("size-5 shrink-0", className)}
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6.01C42.44 37.83 46.98 31.03 46.98 24.55z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.28-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6.01c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

export function GoogleSignInButton({
  disabled,
  onSuccess,
  onError,
  className,
}: GoogleSignInButtonProps) {
  const googleHostRef = useRef<HTMLDivElement>(null);

  const handleCredential = useCallback(
    (res: CredentialResponse) => {
      if (res.credential) onSuccess(res.credential);
    },
    [onSuccess],
  );

  const handleClick = useCallback(() => {
    const googleBtn = googleHostRef.current?.querySelector('[role="button"]');
    if (googleBtn instanceof HTMLElement) googleBtn.click();
  }, []);

  return (
    <div className="relative w-full max-w-[380px]">
      <div
        ref={googleHostRef}
        className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
        aria-hidden
        tabIndex={-1}
      >
        <GoogleLogin
          onSuccess={handleCredential}
          onError={onError}
          text="signin_with"
          shape="pill"
          size="large"
        />
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          "inline-flex h-12 w-full max-w-[380px] items-center justify-center gap-3 rounded-full px-6",
          "border border-[#dadce0] bg-white text-[15px] font-medium leading-none text-[#3c4043]",
          "shadow-[0_1px_2px_rgba(60,64,67,0.08)] transition-[background-color,border-color,box-shadow,transform]",
          "hover:border-[#c6dafc] hover:bg-[#f8faff] hover:shadow-[0_2px_8px_rgba(66,133,244,0.18)]",
          "active:scale-[0.99] active:bg-[#eef3fd]",
          "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#4285F4]/35",
          "disabled:pointer-events-none disabled:opacity-60",
          className,
        )}
      >
        <GoogleLogo />
        Sign in with Google
      </button>
    </div>
  );
}

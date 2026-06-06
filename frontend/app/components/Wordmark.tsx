type WordmarkProps = {
  className?: string;
  /** Hide the text label, show the mark only. */
  markOnly?: boolean;
  /** Mark size in px. */
  size?: number;
};

/**
 * Backstop wordmark — a shield whose horizontal "backstop" bar catches a
 * downward action (the bad deploy / destructive call) before it lands.
 */
export default function Wordmark({
  className = "",
  markOnly = false,
  size = 30,
}: WordmarkProps) {
  return (
    <span className={`group inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-[0_0_10px_rgba(37,99,235,0.35)] transition-all duration-300 group-hover:drop-shadow-[0_0_16px_rgba(96,165,250,0.6)]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="bs-shield" x1="16" y1="2" x2="16" y2="30">
            <stop stopColor="#3b82f6" />
            <stop offset="1" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>
        {/* Shield body */}
        <path
          d="M16 2.5 27 6.4v8.1c0 7.6-4.7 12.4-11 14.9C9.7 26.9 5 22.1 5 14.5V6.4L16 2.5Z"
          fill="url(#bs-shield)"
          fillOpacity="0.16"
          stroke="#60a5fa"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        {/* The backstop bar */}
        <path
          d="M10.5 19.5h11"
          stroke="#ffffff"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* The downward action, caught on the bar */}
        <path
          d="M16 9.5v6.8m0 0-2.6-2.6M16 16.3l2.6-2.6"
          stroke="#93c5fd"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {!markOnly && (
        <span className="text-[1.3rem] font-semibold tracking-[-0.02em] text-white">
          Backstop
        </span>
      )}
    </span>
  );
}

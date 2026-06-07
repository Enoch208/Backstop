import Image from "next/image";

type WordmarkProps = {
  className?: string;
  markOnly?: boolean;
  size?: number;
};

const MARK_RATIO = 551 / 514;

export default function Wordmark({
  className = "",
  markOnly = false,
  size = 30,
}: WordmarkProps) {
  return (
    <span className={`group inline-flex items-center ${className}`}>
      <Image
        src="/logo-mark.png"
        alt="Backstop"
        width={Math.round(size * MARK_RATIO)}
        height={size}
        className="shrink-0 drop-shadow-[0_0_12px_rgba(255,255,255,0.18)] transition-all duration-300 group-hover:drop-shadow-[0_0_18px_rgba(255,255,255,0.32)]"
      />
      {!markOnly && (
        <span
          className="font-light tracking-[-0.04em] text-white"
          style={{ fontSize: `${size}px`, lineHeight: 1 }}
        >
          ackstop
        </span>
      )}
    </span>
  );
}

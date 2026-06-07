import Image from "next/image";

type WordmarkProps = {
  className?: string;
  markOnly?: boolean;
  size?: number;
};

const MARK_RATIO = 551 / 514;
const MARK_SCALE = 0.82;

export default function Wordmark({
  className = "",
  markOnly = false,
  size = 30,
}: WordmarkProps) {
  const markHeight = Math.round(size * MARK_SCALE);
  const markWidth = Math.round(markHeight * MARK_RATIO);
  const textSize = Math.round(size * 1.22);

  return (
    <span className={`group inline-flex items-center ${className}`}>
      <Image
        src="/logo-mark.png"
        alt="Backstop"
        width={markWidth}
        height={markHeight}
        className="shrink-0 translate-y-[0.07em] drop-shadow-[0_0_12px_rgba(255,255,255,0.18)] transition-all duration-300 group-hover:drop-shadow-[0_0_18px_rgba(255,255,255,0.32)]"
      />
      {!markOnly && (
        <span
          className="-ml-[0.11em] font-light text-white"
          style={{ fontSize: `${textSize}px`, lineHeight: 1, letterSpacing: 0 }}
        >
          ackstop
        </span>
      )}
    </span>
  );
}

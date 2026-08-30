type SealProps = {
  size?: number;
  className?: string;
};

/**
 * The league crest — a wax-seal monogram used as the site's one bespoke,
 * recurring mark: masthead, championship years, empty states.
 */
export default function Seal({ size = 40, className = "" }: SealProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={className}
      role="img"
      aria-label="AFFL Savant seal"
    >
      <circle cx="20" cy="20" r="18.5" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="20" cy="20" r="15.5" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.55" />
      <text
        x="20"
        y="21.5"
        textAnchor="middle"
        fill="currentColor"
        fontSize="15"
        fontWeight="800"
        fontFamily="var(--font-display), sans-serif"
      >
        A
      </text>
      <text
        x="20"
        y="29.5"
        textAnchor="middle"
        fill="currentColor"
        fontSize="3.6"
        letterSpacing="0.5"
        fontFamily="var(--font-mono), monospace"
        opacity="0.85"
      >
        EST 2014
      </text>
    </svg>
  );
}

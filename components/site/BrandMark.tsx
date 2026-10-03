/**
 * The AeroServe mark, inlined from public/logo.svg so the two planes can
 * take theme colours and be scaled up as a structural graphic rather than
 * only sitting at 28px in a header.
 *
 * Geometry: two angled planes meeting at an apex, raked -6deg. That rake is
 * the angle the rest of the site borrows for its field lines and dividers.
 */
export default function BrandMark({
  className = '',
  /** Render both planes in one colour instead of navy + sky. */
  mono = false,
}: {
  className?: string
  mono?: boolean
}) {
  return (
    <svg
      viewBox="20 24 172 172"
      className={className}
      role="img"
      aria-label="AeroServe"
      fill="none"
    >
      <g transform="rotate(-6 100 100)">
        <path
          d="M100,44 L26,168 L56,168 L100,76 Z"
          fill={mono ? 'currentColor' : 'var(--brand-navy)'}
        />
        <path
          d="M100,44 L100,76 L144,168 L174,168 Z"
          fill={mono ? 'currentColor' : 'var(--brand-sky)'}
          opacity={mono ? 0.55 : 1}
        />
      </g>
    </svg>
  )
}

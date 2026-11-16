import React, { SVGProps } from 'react'

/*
 * Ishaan UI Custom Hand-Drawn Icon Set
 * Rules: 24×24 grid · 1.4px stroke · round caps/joins · currentColor
 * One tiny characterful detail per icon (open gaps, curved shafts, lifting lids)
 */

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number
  className?: string
  active?: boolean
}

const base = (p: IconProps) => ({
  width: p.size || 20,
  height: p.size || 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...p,
})

/** Flame mark with an open ember lick at top right */
export const IconFlame = ({ active, size, className, ...p }: IconProps) => (
  <svg {...base({ size, className, ...p })}>
    <path d="M8.5 19.5c-3-1.8-4.5-4.5-4.5-7.5C4 7.5 8 3.5 12 3c0 2.5 1.5 4.5 3 5.5-1 2.5 0 5 1.5 6.5.5-2 1.5-3.5 3.5-4.5.5 2.5 0 6-2 8.5" />
    <path d="M12 14c-1.5 1-2 2.5-2 4 0 1.5 1 2.5 2 2.5s2-1 2-2.5c0-1.5-.5-3-2-4z" />
  </svg>
)

/** Compass/Purpose representing Societal Need */
export const IconCompass = ({ active, size, className, ...p }: IconProps) => (
  <svg {...base({ size, className, ...p })}>
    <circle cx="12" cy="12" r="9" />
    <polygon points="15.8 8.2 13.5 13.5 8.2 15.8 10.5 10.5 15.8 8.2" strokeWidth={1.3} />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
)

/** Gear representing Technical Feasibility */
export const IconGear = ({ active, size, className, ...p }: IconProps) => (
  <svg {...base({ size, className, ...p })}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
    <path d="M18.8 12a6.8 6.8 0 1 1-13.6 0 6.8 6.8 0 0 1 13.6 0z" strokeDasharray="3 2" />
  </svg>
)

/** Stack of coins with subtle perspective for Money Making & Viability */
export const IconCoins = ({ active, size, className, ...p }: IconProps) => (
  <svg {...base({ size, className, ...p })}>
    <ellipse cx="12" cy="6.5" rx="7.5" ry="3.2" />
    <path d="M4.5 6.5v5.5c0 1.8 3.4 3.2 7.5 3.2s7.5-1.4 7.5-3.2V6.5" />
    <path d="M4.5 12v5.5c0 1.8 3.4 3.2 7.5 3.2s7.5-1.4 7.5-3.2V12" />
  </svg>
)

/** Rising staircase vector for Scalability & Growth */
export const IconAscend = ({ active, size, className, ...p }: IconProps) => (
  <svg {...base({ size, className, ...p })}>
    <path d="M4 19.5h16" />
    <path d="M5.5 15.5l4.5-4.5 3.5 3.5 6-7" />
    <path d="M15.5 7.5H19.5v4" />
  </svg>
)

/** Official wax/seal stamp for Verdicts & Rulings */
export const IconSeal = ({ active, size, className, ...p }: IconProps) => (
  <svg {...base({ size, className, ...p })}>
    <path d="M12 3a9 9 0 0 0-9 9c0 4.2 2.8 7.7 6.8 8.7L9 22l3-1.5 3 1.5-.8-1.3c4-1 6.8-4.5 6.8-8.7a9 9 0 0 0-9-9z" />
    <circle cx="12" cy="12" r="5" strokeDasharray="2 2" />
    <path d="M10 12l1.5 1.5 3-3" strokeWidth={1.3} />
  </svg>
)

/** Arrow with a softly curved shaft and delicate head */
export const IconArrow = ({ active, size, className, ...p }: IconProps) => (
  <svg {...base({ size, className, ...p })}>
    <path d="M4.5 12.2c4.6-.4 9.5-.3 14.6 0" />
    <path d="m13.8 6.6 5.4 5.6-5.4 5.4" />
  </svg>
)

/** Circle with an open gap at one o'clock and soft tick */
export const IconCheckCircle = ({ active, size, className, ...p }: IconProps) => (
  <svg {...base({ size, className, ...p })}>
    <path d="M17.6 4.9A9 9 0 1 0 20.6 9.4" />
    <path d="m8 12.3 2.7 2.6L20.4 5" />
  </svg>
)

/** Microphone broadcast capsule */
export const IconMic = ({ active, size, className, ...p }: IconProps) => (
  <svg {...base({ size, className, ...p })}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5.5 10.5v1.5a6.5 6.5 0 0 0 13 0v-1.5" />
    <path d="M12 18.5v3M9 21.5h6" />
  </svg>
)

/** Sliders adjustment gauge */
export const IconSliders = ({ active, size, className, ...p }: IconProps) => (
  <svg {...base({ size, className, ...p })}>
    <line x1="4" y1="7" x2="20" y2="7" />
    <circle cx="8" cy="7" r="2.2" fill="white" />
    <line x1="4" y1="17" x2="20" y2="17" />
    <circle cx="16" cy="17" r="2.2" fill="white" />
  </svg>
)

/** Chevron forward */
export const IconChevronRight = ({ active, size, className, ...p }: IconProps) => (
  <svg {...base({ size, className, ...p })}>
    <path d="M9.5 6.5l5 5.5-5 5.5" />
  </svg>
)

/** Reset circular rewind */
export const IconRotate = ({ active, size, className, ...p }: IconProps) => (
  <svg {...base({ size, className, ...p })}>
    <path d="M4 12a8 8 0 1 0 2.4-5.6L3.5 9" />
    <path d="M3.5 4.5v4.5H8" />
  </svg>
)

/** Clean Send paper dart */
export const IconSend = ({ active, size, className, ...p }: IconProps) => (
  <svg {...base({ size, className, ...p })}>
    <path d="M20.5 3.5L3.5 10.5l7 2.5 2.5 7 7.5-16.5z" />
    <path d="M10.5 13L20 4" />
  </svg>
)

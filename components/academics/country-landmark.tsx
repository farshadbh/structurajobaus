import type { ReactNode } from 'react'
import type { CountryCode } from '@/lib/academics'

/*
 * One recognisable silhouette per country, drawn as inline SVG so it costs no
 * request and scales with the section. It sits behind the directory at very low
 * opacity - a watermark, not decoration competing with the names.
 */
const ART: Record<CountryCode, ReactNode> = {
  AU: (
    <g>
      <path d="M12 300 C 90 150 330 150 410 300" fill="none" stroke="currentColor" strokeWidth="9" />
      <rect x="10" y="296" width="412" height="10" />
      <rect x="88" y="186" width="16" height="122" />
      <rect x="318" y="186" width="16" height="122" />
      <path d="M104 220 L318 220 M104 250 L318 250" stroke="currentColor" strokeWidth="4" fill="none" />
      <path d="M452 318 C 460 250 496 234 516 230 C 508 264 516 296 528 318 Z" />
      <path d="M492 318 C 500 262 526 250 546 246 C 538 276 546 300 558 318 Z" />
      <rect x="446" y="314" width="118" height="9" />
    </g>
  ),
  US: (
    <g>
      <rect x="120" y="140" width="22" height="172" />
      <rect x="398" y="140" width="22" height="172" />
      <path d="M131 176 L409 176 M131 210 L409 210" stroke="currentColor" strokeWidth="6" fill="none" />
      <path d="M10 214 C 92 152 368 152 530 214" fill="none" stroke="currentColor" strokeWidth="7" />
      <path d="M131 176 L131 292 M200 168 L200 292 M262 164 L262 292 M324 168 L324 292 M409 176 L409 292" stroke="currentColor" strokeWidth="3" fill="none" />
      <rect x="0" y="290" width="560" height="12" />
    </g>
  ),
  GB: (
    <g>
      <rect x="214" y="150" width="104" height="164" />
      <path d="M214 150 L266 66 L318 150 Z" />
      <circle cx="266" cy="196" r="30" fill="none" stroke="currentColor" strokeWidth="9" />
      <path d="M266 178 L266 196 L280 204" stroke="currentColor" strokeWidth="7" fill="none" />
      <rect x="232" y="246" width="18" height="34" />
      <rect x="282" y="246" width="18" height="34" />
      <rect x="200" y="310" width="132" height="12" />
    </g>
  ),
  CA: (
    <g>
      <path d="M252 320 L260 118 L282 118 L290 320 Z" />
      <ellipse cx="271" cy="150" rx="48" ry="17" />
      <rect x="266" y="46" width="10" height="72" />
      <path d="M240 320 L262 250 M302 320 L280 250" stroke="currentColor" strokeWidth="7" fill="none" />
      <path d="M150 320 L150 262 L196 262 L196 320 Z M360 320 L360 244 L410 244 L410 320 Z" />
    </g>
  ),
  DE: (
    <g>
      <rect x="96" y="160" width="368" height="26" />
      <rect x="110" y="140" width="340" height="20" />
      <rect x="118" y="186" width="24" height="130" />
      <rect x="188" y="186" width="24" height="130" />
      <rect x="258" y="186" width="24" height="130" />
      <rect x="328" y="186" width="24" height="130" />
      <rect x="398" y="186" width="24" height="130" />
      <rect x="96" y="312" width="368" height="12" />
      <path d="M262 140 C 250 118 262 104 278 100 C 272 116 288 126 300 122 C 292 136 276 142 262 140 Z" />
    </g>
  ),
  IE: (
    <g>
      <circle cx="282" cy="168" r="44" />
      <circle cx="226" cy="214" r="44" />
      <circle cx="338" cy="214" r="44" />
      <path d="M268 232 L300 322 L286 322 L262 244 Z" />
    </g>
  ),
  JP: (
    <g>
      <path d="M96 320 C 200 250 214 176 280 138 C 346 176 360 250 464 320 Z" />
      <path d="M232 186 C 250 170 262 160 280 150 C 298 160 310 170 328 186 C 306 178 292 196 280 190 C 268 196 254 178 232 186 Z" fill="currentColor" opacity="0.5" />
      <rect x="150" y="238" width="18" height="92" />
      <rect x="392" y="238" width="18" height="92" />
      <rect x="128" y="228" width="304" height="18" />
      <rect x="146" y="262" width="268" height="12" />
    </g>
  ),
  SG: (
    <g>
      <path d="M150 320 L164 176 L186 176 L180 320 Z" />
      <path d="M262 320 L268 176 L290 176 L292 320 Z" />
      <path d="M374 320 L376 176 L398 176 L406 320 Z" />
      <path d="M112 176 C 190 142 300 138 430 168 L 432 192 C 300 164 190 168 112 200 Z" />
      <rect x="132" y="312" width="300" height="12" />
    </g>
  ),
  HK: (
    <g>
      <path d="M120 320 L120 210 L156 210 L156 320 Z" />
      <path d="M170 320 L170 176 L206 176 L206 320 Z" />
      <path d="M228 320 L228 120 L248 78 L268 120 L268 320 Z" />
      <path d="M244 160 L268 200 M248 210 L228 250 M268 250 L248 290" stroke="currentColor" strokeWidth="5" fill="none" />
      <path d="M300 320 L300 150 L336 150 L336 320 Z" />
      <path d="M352 320 L352 196 L392 196 L392 320 Z" />
      <path d="M410 320 L410 232 L446 232 L446 320 Z" />
      <rect x="100" y="312" width="370" height="12" />
    </g>
  ),
}

export function CountryLandmark({ code }: { code: CountryCode }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden text-primary">
      <svg
        viewBox="0 0 560 360"
        preserveAspectRatio="xMaxYMax meet"
        className="absolute right-0 bottom-0 h-[85%] w-auto opacity-[0.07]"
        fill="currentColor"
      >
        {ART[code]}
      </svg>
    </div>
  )
}

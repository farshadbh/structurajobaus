import Image from 'next/image'
import { COUNTRY_PHOTOS } from '@/data/country-photos'
import type { CountryCode } from '@/lib/academics'

/**
 * The country's own photograph, full width and full height behind the whole
 * explorer section. It is washed back with a vertical gradient so the heading,
 * the filter bar and the names stay readable on top of it.
 */
export function CountryLandmark({ code }: { code: CountryCode }) {
  const photo = COUNTRY_PHOTOS[code]

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <Image
        src={photo.src}
        alt=""
        fill
        unoptimized
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background/95" />
    </div>
  )
}

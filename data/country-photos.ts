import type { CountryCode } from '@/lib/academics'

/*
 * The photograph behind the supervisor finder for each country.
 *
 * Every one is a Wikimedia Commons image under CC BY or CC BY-SA, fetched
 * through Commons' Special:FilePath redirect at 1600px wide and rendered with
 * next/image. Those licences require credit, so the explorer prints the
 * photographer and licence under the directory whenever a country is selected,
 * linked back to the file page.
 */
export interface CountryPhoto {
  src: string
  alt: string
  credit: string
  license: string
  source: string
}

function commons(file: string, width = 1600) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${file}?width=${width}`
}

export const COUNTRY_PHOTOS: Record<CountryCode, CountryPhoto> = {
  AU: {
    src: commons('North_view_of_Sydney_Opera_House,_the_Rocks_and_Sydney_CBD_20230223_1.jpg'),
    alt: 'Sydney Opera House and the harbour',
    credit: 'DXR',
    license: 'CC BY-SA 4.0',
    source: 'https://commons.wikimedia.org/wiki/File:North_view_of_Sydney_Opera_House,_the_Rocks_and_Sydney_CBD_20230223_1.jpg',
  },
  US: {
    src: commons('Golden_Gate_Bridge_Yang_Ming_Line.jpg'),
    alt: 'Golden Gate Bridge, San Francisco',
    credit: 'Cary Bass',
    license: 'CC BY-SA 3.0',
    source: 'https://commons.wikimedia.org/wiki/File:Golden_Gate_Bridge_Yang_Ming_Line.jpg',
  },
  GB: {
    src: commons('Big_Ben_Elizabeth_Tower_London_2023_01.jpg'),
    alt: 'Big Ben, London',
    credit: 'Julian Herzog',
    license: 'CC BY 4.0',
    source: 'https://commons.wikimedia.org/wiki/File:Big_Ben_Elizabeth_Tower_London_2023_01.jpg',
  },
  CA: {
    src: commons('122_-_Toronto_-_Septembre_2009.jpg'),
    alt: 'Toronto skyline and the CN Tower',
    credit: 'Martin St-Amant',
    license: 'CC BY-SA 3.0',
    source: 'https://commons.wikimedia.org/wiki/File:122_-_Toronto_-_Septembre_2009.jpg',
  },
  DE: {
    src: commons('Brandenburg_Gate_-_Brandenburger_Tor_-_Berlin_-_Germany_-_01.jpg'),
    alt: 'Brandenburg Gate, Berlin',
    credit: 'Norbert Nagel',
    license: 'CC BY-SA 3.0',
    source: 'https://commons.wikimedia.org/wiki/File:Brandenburg_Gate_-_Brandenburger_Tor_-_Berlin_-_Germany_-_01.jpg',
  },
  IE: {
    src: commons('Cliffs_of_Moher,_Ireland_16.jpg'),
    alt: 'Cliffs of Moher, County Clare',
    credit: 'Holger Uwe Schmitt',
    license: 'CC BY-SA 4.0',
    source: 'https://commons.wikimedia.org/wiki/File:Cliffs_of_Moher,_Ireland_16.jpg',
  },
  JP: {
    src: commons('Lake_Kawaguchiko_Sakura_Mount_Fuji_1.JPG'),
    alt: 'Mount Fuji behind Lake Kawaguchi',
    credit: 'Midori',
    license: 'CC BY 3.0',
    source: 'https://commons.wikimedia.org/wiki/File:Lake_Kawaguchiko_Sakura_Mount_Fuji_1.JPG',
  },
  SG: {
    src: commons('ArtScience_Museum,_Marina_Bay_Sands,_Singapore.jpg'),
    alt: 'Marina Bay Sands and the ArtScience Museum, Singapore',
    credit: 'Basile Morin',
    license: 'CC BY-SA 4.0',
    source: 'https://commons.wikimedia.org/wiki/File:ArtScience_Museum,_Marina_Bay_Sands,_Singapore.jpg',
  },
  HK: {
    src: commons('Hong_Kong_Harbour_Night_2019-06-11.jpg'),
    alt: 'Victoria Harbour skyline, Hong Kong',
    credit: 'Benh LIEU SONG',
    license: 'CC BY-SA 4.0',
    source: 'https://commons.wikimedia.org/wiki/File:Hong_Kong_Harbour_Night_2019-06-11.jpg',
  },
}

export interface NavItem {
  label: string;
  href: string;
  index: string;
}

export const SITE = {
  name: 'Appuntostudio',
  legalName: 'Appuntostudio architetti associati',
  tagline: 'Architettura, interni e spazi da vivere',
  description: 'Studio di architettura e architettura degli interni a Roma. Progetti residenziali, ristrutturazioni, restauro e recupero edilizio su misura.',
  url: 'https://www.appuntostudio.it',
  phone: '349 832 8323',
  phoneHref: 'tel:+393498328323',
  address: {
    street: 'Via Apuania 3',
    postalCode: '00162',
    city: 'Roma',
    province: 'RM',
    country: 'Italia',
    full: 'Via Apuania 3, 00162 Roma RM, Italia'
  },
  serviceArea: 'Roma e provincia',
  socials: {
    houzz: 'https://www.houzz.it/pro/appunto-studio',
    facebook: 'https://www.facebook.com/appuntostudio/',
    maps: 'https://www.google.com/maps/search/?api=1&query=Via+Apuania+3+00162+Roma+RM'
  },
  rating: {
    score: '4,9',
    outOf: '5',
    count: 23,
    source: 'Houzz'
  }
};

export const NAV_LINKS: NavItem[] = [
  { label: 'Lo studio', href: '/studio', index: '01' },
  { label: 'Progetti', href: '/progetti', index: '02' },
  { label: 'Servizi', href: '/servizi', index: '03' },
  { label: 'Contatti', href: '/contatti', index: '04' }
];

export interface ServiceCategory {
  id: string;
  index: string;
  title: string;
  description: string;
  items: string[];
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'architettura',
    index: '01',
    title: 'Architettura e progettazione',
    description: 'Dalla concezione dell’opera al dialogo con il contesto territoriale, elaboriamo soluzioni costruttive rigorose e sostenibili.',
    items: [
      'Progettazione architettonica',
      'Progettazione edile',
      'Costruzione di una nuova casa',
      'Ampliamento casa',
      'Restauro facciate'
    ]
  },
  {
    id: 'ristrutturazione',
    index: '02',
    title: 'Ristrutturazione e recupero',
    description: 'Valorizzazione del patrimonio esistente attraverso interventi di riqualificazione strutturale, risanamento ed efficientamento.',
    items: [
      'Ristrutturazione edilizia',
      'Ristrutturazione appartamento',
      'Restauro casa',
      'Recupero sottotetto',
      'Ristrutturazione seminterrato'
    ]
  },
  {
    id: 'interni',
    index: '03',
    title: 'Architettura degli interni e design',
    description: 'Composizione su misura degli ambienti, studio della luce, selezione materica e disegno sartoriale degli spazi abitativi.',
    items: [
      'Design degli interni',
      'Pianificazione degli spazi',
      'Progettazione soggiorno',
      'Progettazione cucine',
      'Ristrutturazione cucine',
      'Progettazione bagno',
      'Ristrutturazione bagno'
    ]
  },
  {
    id: 'consulenza',
    index: '04',
    title: 'Consulenza e supporto tecnico',
    description: 'Assistenza preliminare e affiancamento a distanza per analisi di fattibilità, inquadramento urbanistico e scelte distributive.',
    items: [
      'Consulenza online'
    ]
  }
];

// Flat list of all 18 official services
export const ALL_SERVICES = SERVICE_CATEGORIES.flatMap(c => c.items);

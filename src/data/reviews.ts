export interface Review {
  id: string;
  author: string;
  profileUrl: string;
  rating: number; // 5 out of 5
  text: string;
  context?: string;
}

export const REVIEWS_META = {
  average: '4,9',
  maxScore: '5',
  totalCount: 23,
  platform: 'Houzz',
  url: 'https://www.houzz.it/pro/appunto-studio',
  note: 'Valutazione complessiva su Houzz basata su 23 recensioni verificate. Le testimonianze selezionate riportano la valutazione individuale di 5 stelle su 5.'
};

export const REVIEWS: Review[] = [
  {
    id: 'alessandro-longo',
    author: 'Alessandro Longo',
    profileUrl: 'https://www.houzz.it/user/alessandro-longo11',
    rating: 5,
    text: 'Lavoro impeccabile sia in termini di tempi che di qualità. Professionalità e fantasia hanno fatto si che la mia casa rispecchi totalmente me stesso. Grazie a Rosella per la pazienza',
    context: 'Committente privato — Ristrutturazione residenziale'
  },
  {
    id: 'virgilio-corgiolu',
    author: 'Virgilio Corgiolu',
    profileUrl: 'https://www.houzz.it/user/virgilio-corgiolu',
    rating: 5,
    text: 'Ho usufruito dei servizi dello studio in diverse occasioni e sono molto soddisfatto dalla grande disponibilità di tutti i Professionisti che lo compongono oltre che per la dinamicità’ è la puntualità nel rispettare i termini previsti per le consegne. Sono inoltre soddisfatto dalla perspicacia nel comprendere le richieste che di volta in volta possono mutare a seconda della tipologia di cantiere nel quale ci si trova a lavorare. Insomma lo consiglierei.',
    context: 'Committente continuativo'
  },
  {
    id: 'brunella-pastore',
    author: 'Brunella Pastore',
    profileUrl: 'https://www.houzz.it/user/brunella-pastore',
    rating: 5,
    text: 'Ho trovato precisione,professionalita\',puntualita\'.E disponibilita\' al confronto. Risultati tutti molto cortesi i collaboratori. Posso consigliarne sicuramente la consulenza',
    context: 'Consulenza e progettazione'
  },
  {
    id: 'fabiano-olivieri',
    author: 'Fabiano Olivieri',
    profileUrl: 'https://www.houzz.it/user/fabiano-olivieri',
    rating: 5,
    text: 'Professionalità e competenza, un team di professionisti attenti nell\'ascolto e al confronto, presenti in tutti i passaggi importanti, dall\'incontro con le imprese agli interventi puntuali nei momenti critici dei lavori. Essendo un fornitore di porte e finestre quotidianamente mi confronto sui vari cantieri con clienti e professionisti, ma con loro ho notato un\'entusiasmo con cui si approcciano al lavoro, mettendoci impegno e passione.',
    context: 'Partner tecnico e fornitore serramenti'
  },
  {
    id: 'arnaldo-veggi',
    author: 'Arnaldo Veggi',
    profileUrl: 'https://www.houzz.it/user/arnaldo-veggi',
    rating: 5,
    text: 'Ho avuto modo di collaborare con i professionisti di appuntostudio per delle valutazioni urbanistiche ed energetiche su immobili storici di proprietà di alcuni enti religiosi Al di là della disponibilità e della cortesia ho potuto registrare la serietà e la puntualità del team con il quale ne è scaturito anche un buon rapporto di amicizia Con il loro supporto ho potuto svolgere il mio lavoro con più professionalità',
    context: 'Collaborazione professionale su immobili storici'
  },
  {
    id: 'caterina-tumbarello',
    author: 'caterina tumbarello',
    profileUrl: 'https://www.houzz.it/user/caterina-tumbarello',
    rating: 5,
    text: 'Mi sono interfacciata con il collega per un immobile con situazione urbanistica complessa, lui consulente della proprietà ed io degli acquirenti. Estremamente preparato e professionale, preciso ed accurato, disponibile ed aperto al confronto. Assolutamente consigliato.',
    context: 'Consulenza tecnica e conformità urbanistica'
  }
];

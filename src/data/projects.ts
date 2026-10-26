export interface ProjectImage {
  src: string;
  webp: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
  orientation?: 'landscape' | 'portrait' | 'square';
  isPlan?: boolean;
}

export interface ProjectSpec {
  label: string;
  value: string;
}

export interface Project {
  slug: string;
  index: string;
  title: string;
  category: 'Ristrutturazione' | 'Nuova costruzione';
  subtitle: string;
  location: string;
  year?: string;
  coverImage: ProjectImage;
  featuredHome: boolean;
  editorialExcerpt: string;
  description: string[];
  specs: ProjectSpec[];
  gallery: ProjectImage[];
}

export const PROJECTS: Project[] = [
  {
    slug: 'casa-gracchi',
    index: '01',
    title: 'Casa Gracchi',
    category: 'Ristrutturazione',
    subtitle: 'Continuità materica e luce come elemento architettonico',
    location: 'Roma (Vaticano)',
    coverImage: {
      src: '/images/casa-gracchi-soggiorno2.jpg',
      webp: '/images/casa-gracchi-soggiorno2.webp',
      width: 2048,
      height: 1366,
      alt: 'Zona living di Casa Gracchi con grande libreria scultorea in cartongesso e luce integrata',
      orientation: 'landscape'
    },
    featuredHome: true,
    editorialExcerpt: 'Spazialità minimalista, materiali naturali che salgono dal pavimento alle pareti e una libreria scultorea a tutta altezza a ridosso del Vaticano.',
    description: [
      'Il locale oggetto dei lavori di ristrutturazione è sito a Roma a ridosso del Vaticano, e la sua ubicazione ha suggerito una destinazione d’uso di tipo ricettivo. All’interno sono state realizzate due stanze più gli spazi a servizio, ricercando una spazialità quasi minimalista attraverso un taglio essenziale e l’uso di materiali naturali, alcuni dei quali si spalmano dal pavimento alle pareti, determinando un’atmosfera calda ed accogliente.',
      'L’uso di asole sui controsoffitti per alloggiare LED strip, eliminando il più possibile la presenza di corpi illuminanti invasivi, ci ha permesso di lavorare con la luce utilizzandola come vero e proprio elemento progettuale. Il solo elemento decorativo è una grande libreria scultorea realizzata in cartongesso che si disegna come sfondo su tutta la parete della zona sociale.',
      'Uno dei due bagni si apre sulla stanza attraverso una finestra interna mettendo in comunicazione la stanza con la vasca idromassaggio, che risulta così a vista. I rivestimenti interni sono in gres porcellanato di grande formato nel colore grigio perla unificante con le pareti, il pavimento e i piani di raccordo.'
    ],
    specs: [
      { label: 'Tipologia', value: 'Ristrutturazione d’interni' },
      { label: 'Destinazione', value: 'Residenziale / Ricettivo' },
      { label: 'Ubicazione', value: 'Roma (zona Vaticano)' },
      { label: 'Materiali', value: 'Gres porcellanato grigio perla grande formato, cartongesso scultoreo' },
      { label: 'Illuminazione', value: 'Strip LED a scomparsa in asole su controsoffitto' }
    ],
    gallery: [
      {
        src: '/images/casa-gracchi-soggiorno2.jpg',
        webp: '/images/casa-gracchi-soggiorno2.webp',
        width: 2048,
        height: 1366,
        alt: 'Libreria scultorea in cartongesso a parete nella zona giorno',
        caption: 'La libreria scultorea in cartongesso che definisce il fondale della zona sociale'
      },
      {
        src: '/images/casa-gracchi-cucina.jpg',
        webp: '/images/casa-gracchi-cucina.webp',
        width: 2035,
        height: 1358,
        alt: 'Ambiente cucina con finiture in gres grigio perla uniforme',
        caption: 'Cucina con superfici continue in gres porcellanato'
      },
      {
        src: '/images/casa-gracchi-bagnoVasca.jpg',
        webp: '/images/casa-gracchi-bagnoVasca.webp',
        width: 2048,
        height: 1366,
        alt: 'Finestra interna con visuale sulla vasca idromassaggio',
        caption: 'La finestra interna che pone in dialogo visivo la camera con la vasca a vista'
      },
      {
        src: '/images/casa-gracchi-bedroomEbagno.jpg',
        webp: '/images/casa-gracchi-bedroomEbagno.webp',
        width: 2048,
        height: 1366,
        alt: 'Camera padronale con connessione visiva verso la sala da bagno',
        caption: 'Relazione di continuità spaziale tra camera e ambiente bagno'
      },
      {
        src: '/images/casa-gracchi-soggiorno4.jpg',
        webp: '/images/casa-gracchi-soggiorno4.webp',
        width: 2044,
        height: 1364,
        alt: 'Dettaglio delle asole per illuminazione LED indiretta sui controsoffitti',
        caption: 'Gole luminose a scomparsa per un’illuminazione architettonica pura'
      },
      {
        src: '/images/casa-gracchi-salaPranzo.jpg',
        webp: '/images/casa-gracchi-salaPranzo.webp',
        width: 2048,
        height: 1366,
        alt: 'Zona pranzo raccolta ed essenziale',
        caption: 'Spazio conviviale caratterizzato da calibrazione cromatica neutra'
      },
      {
        src: '/images/casa-gracchi-bagnoDoccia3.jpg',
        webp: '/images/casa-gracchi-bagnoDoccia3.webp',
        width: 2048,
        height: 1366,
        alt: 'Bagno con doccia filo pavimento e rivestimento monocromatico',
        caption: 'Superfici omogenee in gres grigio perla per pavimenti e pareti'
      },
      {
        src: '/images/casa-gracchi-piantaProgetto.jpg',
        webp: '/images/casa-gracchi-piantaProgetto.webp',
        width: 2560,
        height: 1362,
        alt: 'Planimetria di progetto di Casa Gracchi',
        caption: 'Planimetria di progetto: distribuzione delle due suite e degli spazi a servizio',
        isPlan: true
      }
    ]
  },
  {
    slug: 'casa-mg',
    index: '02',
    title: 'Casa MG',
    category: 'Ristrutturazione',
    subtitle: 'Linguaggio post-industriale, ferro nero antracite e rovere',
    location: 'Roma',
    coverImage: {
      src: '/images/appartamento-mg-soggiorno.jpg',
      webp: '/images/appartamento-mg-soggiorno.webp',
      width: 1828,
      height: 1174,
      alt: 'Living open space di Casa MG con pannelli scorrevoli in ferro antracite e parquet in rovere',
      orientation: 'landscape'
    },
    featuredHome: true,
    editorialExcerpt: 'Un appartamento di grandi dimensioni ripensato in chiave post-industriale: ferro nero antracite, intonaco bianco latte e rovere antichizzato.',
    description: [
      'Per l’appartamento in oggetto, di taglio grande, si è usato un linguaggio teso a recuperare un’atmosfera post-industriale, con una distribuzione “open” e l’uso di materiali tipici di questo specifico stile: ferro verniciato di colore nero antracite nel contrasto più naturale con l’intonaco bianco latte e i legni di rovere antichizzato.',
      'La grande parete a pannelli scorrevoli scherma la cucina dal living; per la libreria che si sviluppa su un lato dell’ambiente, accompagnando il visitatore dall’ingresso fino in profondità nel salone, si sono utilizzati quadrelli di metallo di cm 2x2 innestandoli in uno “squarcio” della parete articolata con scarti sempre ortogonali.',
      'Leggermente rialzata rispetto al living, la cucina si articola sulla presenza di un’isola attrezzata in legno e rivestita con pietra color sabbia. La grande parete a pannelli scorrevoli, elemento formale portante del lavoro in oggetto, è stata disegnata nei suoi sistemi scorrevoli lasciati volutamente a vista.',
      'In ragione della grande dimensione dell’appartamento, si è voluto creare una dicotomia fra gli ambienti sociali e quelli privati, introducendo in questi ultimi elementi decorativi di sapore classico, quali cornici e listature in gesso. Una grande vasca circolare è stata incassata in una pedana lignea lasciandola a vista nella camera padronale.'
    ],
    specs: [
      { label: 'Tipologia', value: 'Ristrutturazione residenziale di grandi dimensioni' },
      { label: 'Linguaggio', value: 'Post-industriale con distribuzione open space' },
      { label: 'Materiali chiave', value: 'Ferro antracite a vista, rovere antichizzato, intonaco bianco latte' },
      { label: 'Cucina', value: 'Isola rialzata in legno rivestita in pietra color sabbia' },
      { label: 'Zona notte', value: 'Vasca circolare su pedana lignea, cornici e modanature classiche in gesso' }
    ],
    gallery: [
      {
        src: '/images/appartamento-mg-soggiorno.jpg',
        webp: '/images/appartamento-mg-soggiorno.webp',
        width: 1828,
        height: 1174,
        alt: 'Salone open space con sistemi scorrevoli a vista in ferro nero',
        caption: 'La grande parete a pannelli scorrevoli in ferro nero antracite a vista'
      },
      {
        src: '/images/appartamento-mg-soggiorno2.jpg',
        webp: '/images/appartamento-mg-soggiorno2.webp',
        width: 1880,
        height: 1250,
        alt: 'Libreria in quadrelli metallici 2x2 integrata nella muratura',
        caption: 'La libreria metallica a quadrelli innestata nei tagli ortogonali della parete'
      },
      {
        src: '/images/appartamento-mg-cucina.jpg',
        webp: '/images/appartamento-mg-cucina.webp',
        width: 1880,
        height: 1250,
        alt: 'Isola della cucina in legno e pietra sabbia su pedana rialzata',
        caption: 'Cucina rialzata con isola centrale in legno e pietra color sabbia'
      },
      {
        src: '/images/appartamento-mg-vascaBagno.jpg',
        webp: '/images/appartamento-mg-vascaBagno.webp',
        width: 638,
        height: 960,
        alt: 'Grande vasca circolare incassata nella pedana di legno',
        caption: 'La vasca circolare incassata nella pedana lignea a vista nella camera padronale',
        orientation: 'portrait'
      },
      {
        src: '/images/appartamento-mg-salaPranzo.jpg',
        webp: '/images/appartamento-mg-salaPranzo.webp',
        width: 2560,
        height: 1702,
        alt: 'Zona pranzo in dialogo con gli elementi architettonici metallici',
        caption: 'Spazio conviviale in connessione continua con il salone'
      },
      {
        src: '/images/appartamento-mg-bedroom2.jpg',
        webp: '/images/appartamento-mg-bedroom2.webp',
        width: 1902,
        height: 1162,
        alt: 'Camera privata con modanature e cornici in gesso',
        caption: 'Dicotomia stilistica: il sapore classico con modanature in gesso negli ambienti intimi'
      },
      {
        src: '/images/appartamento-mg-piantaProgetto.jpg',
        webp: '/images/appartamento-mg-piantaProgetto.webp',
        width: 953,
        height: 620,
        alt: 'Planimetria di progetto di Casa MG',
        caption: 'Planimetria generale: articolazione fluida tra zona sociale e ambito privato',
        isPlan: true
      }
    ]
  },
  {
    slug: 'casa-jd',
    index: '03',
    title: 'Casa JD',
    category: 'Ristrutturazione',
    subtitle: 'La galleria abitata e il purismo neoclassico valaderiano',
    location: 'Roma (Nomentano)',
    coverImage: {
      src: '/images/casa-jd-ingessoEcorridoio.jpg',
      webp: '/images/casa-jd-ingessoEcorridoio.webp',
      width: 1440,
      height: 2560,
      alt: 'Galleria d’ingresso di Casa JD con cornici neoclassiche valaderiane e gres Calacatta',
      orientation: 'portrait'
    },
    featuredHome: true,
    editorialExcerpt: 'Nel prestigioso quartiere Nomentano, un grande ingresso trasformato in galleria abitata attraverso un purismo neoclassico sobrio e raffinato.',
    description: [
      'L’appartamento è sito a Roma nel prestigioso quartiere Nomentano, ha un taglio grande ed è pensato per la vita di un nucleo familiare numeroso.',
      'L’intervento più caratteristico è quello realizzato per uno spazio oggi anomalo negli appartamenti di nuova costruzione: un grande ingresso che distribuisce le camere private e conduce al salone posto diametralmente opposto rispetto ad esso. Qui diventa un “salone aggiunto”, una galleria abitata all’interno della quale stazionare e non solo passare.',
      'Per questo ambiente si è usato un linguaggio classico nelle finiture e nelle decorazioni, con impiego di cornici di gesso, modanature, battiscopa di grande formato e con il recupero delle porte originali caratterizzate da larghe cornici e zoccolature di legno.',
      'L’apparato decorativo è stato trattato omogeneamente con smalto opaco bianco, ricercando quel purismo valaderiano (da Valadier) che stempera la ridondanza della decorazione attraverso tale espediente, interpretando il Neoclassico in modo del tutto personale e raffinato.',
      'Per i pavimenti sono stati impiegati gres porcellanato a imitazione del marmo Calacatta con piastrelle di grandi dimensioni e giunti rettificati, mentre per l’illuminazione, oltre ad applique e punti luce a incasso a soffitto, si è fatto uso di strip LED inserite nelle cornici di gesso.'
    ],
    specs: [
      { label: 'Tipologia', value: 'Ristrutturazione residenziale di pregio' },
      { label: 'Ubicazione', value: 'Roma (quartiere Nomentano)' },
      { label: 'Elemento cardine', value: 'Ingresso-galleria abitata con purismo valaderiano' },
      { label: 'Pavimentazione', value: 'Gres porcellanato effetto marmo Calacatta a grande formato rettificato' },
      { label: 'Finiture e recupero', value: 'Porte d’epoca restaurate con larghe cornici e smalto opaco bianco' },
      { label: 'Illuminazione', value: 'Strip LED alloggiate nelle cornici in gesso e applique' }
    ],
    gallery: [
      {
        src: '/images/casa-jd-ingessoEcorridoio.jpg',
        webp: '/images/casa-jd-ingessoEcorridoio.webp',
        width: 1440,
        height: 2560,
        alt: 'Grande ingresso e galleria abitata con cornici a rilievo e smalto opaco bianco',
        caption: 'La galleria abitata: il grande ingresso trasformato in spazio di soggiorno e sosta'
      },
      {
        src: '/images/casa-jd-corridoio.jpg',
        webp: '/images/casa-jd-corridoio.webp',
        width: 1440,
        height: 2560,
        alt: 'Corridoio distributivo con pavimentazione in gres Calacatta e tagli di luce',
        caption: 'Prospettiva del corridoio con illuminazione integrata nelle modanature'
      },
      {
        src: '/images/casa-jd-corridoio2.jpg',
        webp: '/images/casa-jd-corridoio2.webp',
        width: 1440,
        height: 2560,
        alt: 'Porte originali restaurate con cornici di grande spessore',
        caption: 'Recupero delle porte originali d’epoca con battiscopa e modanature coordinate'
      },
      {
        src: '/images/casa-jd-anteEbalcone.jpg',
        webp: '/images/casa-jd-anteEbalcone.webp',
        width: 2560,
        height: 1440,
        alt: 'Infissi storici restaurati e apertura sul balcone nel quartiere Nomentano',
        caption: 'Dettaglio degli infissi storici e affaccio sul quartiere Nomentano'
      }
    ]
  },
  {
    slug: 'casa-fp',
    index: '04',
    title: 'Casa FP',
    category: 'Ristrutturazione',
    subtitle: 'Il vuoto dinamico, la parete monumentale e il rigore bianco-nero',
    location: 'Roma',
    coverImage: {
      src: '/images/casa-fp-lounge.jpg',
      webp: '/images/casa-fp-lounge.webp',
      width: 2560,
      height: 1706,
      alt: 'Salone di Casa FP con parete divisoria storica restaurata in legno e vetro alta 4 metri',
      orientation: 'landscape'
    },
    featuredHome: true,
    editorialExcerpt: 'Un sofisticato recupero di elementi d’epoca in uno spazio scandito da una parete curva e da una vetrata lignea alta quasi 4 metri.',
    description: [
      '«Ogni luogo ha una sua anima, ogni luogo ha una sua memoria. Ogni memoria ha in sé un bagaglio indicibile e un peso ineluttabile… Nel progettare a noi non interessa la bellezza del segno, ma l’idea. Da lì si parte, e poi si può procedere per asportazione o sottrazione. Le forme, i materiali e i colori passano dal corpo alla casa e viceversa.»',
      'Nel lavoro in oggetto abbiamo effettuato un sofisticato recupero di elementi originali e caratteristici: vecchie porte, gli scuri delle finestre e la grande parete divisoria in legno e vetro che, opportunamente bonificati, sono stati inseriti nel “nuovo” con nuove valenze e significati.',
      'La casa si struttura su un concetto di “vuoto dinamico” e di “scoperta” che si sublima nel movimento. Un primo approccio è offerto dalla parete divisoria in legno e vetro, alta quasi 4 metri, che in una nuova posizione rispetto all’originaria accoglie e scherma la cucina, invitando ad entrare in uno spazio dinamico che sembra respirare.',
      'Questo ambiente è definito da una curva dolce che lo abbraccia e conduce in profondità verso la sfera privata. È un segno che se visto in planimetria svela l’anima minimalista del progetto, ma che nella realtà vissuta invita al movimento per apprezzare l’intero spazio. Le sottili modanature orizzontali sovrapposte al muro ne amplificano il respiro, il tutto giocato su un rigoroso contrasto fra il bianco e il nero.'
    ],
    specs: [
      { label: 'Tipologia', value: 'Ristrutturazione e recupero filologico' },
      { label: 'Ubicazione', value: 'Roma' },
      { label: 'Elemento monumentale', value: 'Parete divisoria d’epoca in legno e vetro (altezza ca. 4 m)' },
      { label: 'Concept spaziale', value: 'Vuoto dinamico su parete curva di raccordo' },
      { label: 'Cromia', value: 'Contrasto rigoroso bianco e nero con modanature orizzontali a parete' },
      { label: 'Recupero', value: 'Bonifica e riuso di porte originali e scuri storici' }
    ],
    gallery: [
      {
        src: '/images/casa-fp-lounge.jpg',
        webp: '/images/casa-fp-lounge.webp',
        width: 2560,
        height: 1706,
        alt: 'Parete divisoria storica in legno e vetro alta 4 metri tra lounge e cucina',
        caption: 'La grande parete divisoria d’epoca in legno e vetro riposizionata per accogliere e schermare la cucina'
      },
      {
        src: '/images/casa-fp-lounge2.jpg',
        webp: '/images/casa-fp-lounge2.webp',
        width: 2560,
        height: 1706,
        alt: 'Parete curva e dilatazione dello spazio living',
        caption: 'La curva dolce che accompagna la circolazione verso gli ambienti privati'
      },
      {
        src: '/images/casa-fp-cucina.jpg',
        webp: '/images/casa-fp-cucina.webp',
        width: 2560,
        height: 1706,
        alt: 'Ambiente cucina lineare in bicromia bianco e nero',
        caption: 'Spazio cucina essenziale, calibrato su contrasti cromatici netti'
      },
      {
        src: '/images/casa-fp-bedroom.jpg',
        webp: '/images/casa-fp-bedroom.webp',
        width: 2560,
        height: 1706,
        alt: 'Camera con scuri storici originali recuperati e pareti chiare',
        caption: 'Camera padronale con risanamento e valorizzazione degli scuri originali'
      },
      {
        src: '/images/casa-fp-bagno2.jpg',
        webp: '/images/casa-fp-bagno2.webp',
        width: 2560,
        height: 1706,
        alt: 'Bagno contemporaneo con modanature a rilievo e rubinetterie nere',
        caption: 'Ambiente bagno: dialogo tra volumi geometrici e linee orizzontali'
      },
      {
        src: '/images/casa-fp-corridoio.jpg',
        webp: '/images/casa-fp-corridoio.webp',
        width: 2560,
        height: 1706,
        alt: 'Corridoio distributivo con porte originali laccate',
        caption: 'Percorso distributivo lineare con recupero delle porte interne d’epoca'
      },
      {
        src: '/images/casa-fp-piantaProgetto.jpg',
        webp: '/images/casa-fp-piantaProgetto.webp',
        width: 960,
        height: 536,
        alt: 'Planimetria con evidenza della parete curva e del vuoto dinamico',
        caption: 'Planimetria di progetto: il segno della curva e l’articolazione del vuoto dinamico',
        isPlan: true
      }
    ]
  },
  {
    slug: 'villa-residenziale',
    index: '05',
    title: 'Villa residenziale',
    category: 'Nuova costruzione',
    subtitle: 'Radicamento orografico, sbalzi in cemento armato e tetto giardino',
    location: 'Italia',
    year: '2017',
    coverImage: {
      src: '/images/villa-residenziale-esterno.jpg',
      webp: '/images/villa-residenziale-esterno.webp',
      width: 1500,
      height: 1000,
      alt: 'Prospetto esterno della villa residenziale su tre livelli con piastra in cemento armato fortemente aggettante',
      orientation: 'landscape'
    },
    featuredHome: true,
    editorialExcerpt: 'Un volume articolato su tre livelli innestato nel pendio naturale, coronato da una potente piastra aggettante in cemento armato con tetto giardino.',
    description: [
      'L’edificio ad uso residenziale privato si sviluppa su tre piani innestandosi sul terreno ad andamento inclinato. Si presenta come un volume articolato dal forte radicamento con il terreno e un’organizzazione spaziale tale da non consentire la visione sintetica dell’insieme.',
      'Si caratterizza per la presenza di una piastra di copertura in cemento armato fortemente aggettante sul fronte a valle, che assume la valenza di “pietra che copre”, ospitando un tetto giardino raggiungibile solo dalla suite padronale, l’unico volume estradossato rispetto al piano di copertura.',
      'L’articolazione interna comprende ampi spazi conviviali affacciati sul paesaggio, una scala scultorea elicoidale e un’area benessere privata con piscina coperta inserita nel basamento ipogeo.'
    ],
    specs: [
      { label: 'Tipologia', value: 'Nuova costruzione residenziale unifamiliare' },
      { label: 'Anno di realizzazione', value: '2017' },
      { label: 'Paese', value: 'Italia' },
      { label: 'Sviluppo', value: 'Tre livelli con innesto orografico nel pendio' },
      { label: 'Elemento formale', value: 'Piastra in cemento armato aggettante con funzione di pietra di copertura' },
      { label: 'Copertura', value: 'Tetto giardino a servizio esclusivo della suite padronale' },
      { label: 'Spazi benessere', value: 'SPA privata con piscina indoor integrata' }
    ],
    gallery: [
      {
        src: '/images/villa-residenziale-esterno.jpg',
        webp: '/images/villa-residenziale-esterno.webp',
        width: 1500,
        height: 1000,
        alt: 'Prospetto a valle con piastra a sbalzo in cemento armato',
        caption: 'La piastra di copertura in cemento armato fortemente aggettante sul fronte a valle'
      },
      {
        src: '/images/villa-residenziale-esterno2.jpg',
        webp: '/images/villa-residenziale-esterno2.webp',
        width: 1500,
        height: 1000,
        alt: 'Incastro volumetrico dell’edificio nel pendio del terreno naturale',
        caption: 'Radicamento nel terreno a declivio ed equilibrio dei volumi pieni e vuoti'
      },
      {
        src: '/images/villa-residenziale-tetto.jpg',
        webp: '/images/villa-residenziale-tetto.webp',
        width: 2560,
        height: 1920,
        alt: 'Tetto giardino panoramico sul solaio di copertura',
        caption: 'Il tetto giardino raggiungibile in via esclusiva dalla suite padronale'
      },
      {
        src: '/images/villa-residenziale-SPAprivataPiscina.jpg',
        webp: '/images/villa-residenziale-SPAprivataPiscina.webp',
        width: 1500,
        height: 1000,
        alt: 'Piscina interna dell’area benessere privata',
        caption: 'La piscina interna riscaldata nell’area benessere della residenza'
      },
      {
        src: '/images/villa-residenziale-SPAprivata.jpg',
        webp: '/images/villa-residenziale-SPAprivata.webp',
        width: 1500,
        height: 1000,
        alt: 'Area relax e percorsi benessere della SPA privata',
        caption: 'Spazio wellness integrato nel basamento della villa'
      },
      {
        src: '/images/villa-residenziale-scaleChiocciola.jpg',
        webp: '/images/villa-residenziale-scaleChiocciola.webp',
        width: 1000,
        height: 1500,
        alt: 'Scala a chiocciola scultorea di raccordo verticale',
        caption: 'La scala scultorea che collega i livelli dell’organismo architettonico',
        orientation: 'portrait'
      },
      {
        src: '/images/villa-residenziale-soggiorno.jpg',
        webp: '/images/villa-residenziale-soggiorno.webp',
        width: 1500,
        height: 1000,
        alt: 'Salone di rappresentanza con vetrate panoramiche',
        caption: 'Soggiorno con ampie aperture vetrate affacciate sul contesto naturale'
      },
      {
        src: '/images/villa-residenziale-cucina.jpg',
        webp: '/images/villa-residenziale-cucina.webp',
        width: 1500,
        height: 1000,
        alt: 'Zona cucina dal rigore geometrico contemporaneo',
        caption: 'Spazio cucina essenziale caratterizzato da superfici opache'
      },
      {
        src: '/images/villa-residenziale-piantaProgetto.jpg',
        webp: '/images/villa-residenziale-piantaProgetto.webp',
        width: 1764,
        height: 1264,
        alt: 'Tavola di progetto con piante e sezioni della villa residenziale',
        caption: 'Tavola architettonica: piante dei tre livelli e sezioni del corpo aggettante',
        isPlan: true
      }
    ]
  }
];

export function getProjectBySlug(slug: string): Project | undefined {
  return PROJECTS.find(p => p.slug === slug);
}

export function getAdjacentProjects(slug: string): { prev: Project; next: Project } {
  const index = PROJECTS.findIndex(p => p.slug === slug);
  const prevIndex = (index - 1 + PROJECTS.length) % PROJECTS.length;
  const nextIndex = (index + 1) % PROJECTS.length;
  return {
    prev: PROJECTS[prevIndex],
    next: PROJECTS[nextIndex]
  };
}

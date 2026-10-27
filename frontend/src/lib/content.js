// Tutti i testi dell'esperienza: sostituire qui per cambiare contenuti (es. versione agenzia).
export const SITE = {
  title: "EARTH THROUGH TIME",
  tagline: "Un viaggio immersivo di 4,5 miliardi di anni nella storia climatica della Terra",
  credit: "Studio Rocchetti Comunicazione",
  email: "info@studiorocchetti.com",
  marquee: ["4,5 miliardi di anni", "Sette epoche", "Un solo pianeta", "Il clima è sempre cambiato", "Oggi il ritmo lo cambiamo noi"],
  finalTitle: ["IL CLIMA È SEMPRE CAMBIATO.", "OGGI, A CAMBIARE IL RITMO,", "SIAMO NOI."],
  finalSub: "Comprendere il passato è essenziale per affrontare il futuro.",
  consulted: "27 ottobre 2026",
};

// kind: osservato | ricostruzione | schema | artistico
export const KIND_LABEL = {
  osservato: "Dato osservato",
  ricostruzione: "Ricostruzione",
  schema: "Schema concettuale",
  artistico: "Animazione artistica",
};

export const SCENES = [
  {
    id: "nascita", n: "01", accent: "#FF7138",
    era: "4,5 miliardi di anni fa", short: "Nascita",
    title: "La Terra prende forma.",
    body: "La storia del clima comincia con un pianeta in trasformazione.",
    kinds: ["ricostruzione", "artistico"],
    story: [
      "Circa 4,5 miliardi di anni fa la Terra primordiale era in gran parte fusa: un oceano di magma alimentato dal calore dell'accrescimento, dal decadimento radioattivo e dagli impatti.",
      "L'atmosfera primitiva non conteneva l'ossigeno libero che respiriamo oggi. Vapore acqueo, anidride carbonica e azoto erano tra i suoi componenti principali.",
      "La scena è un'interpretazione artistica: colori, forme e attività vulcanica non riproducono un luogo o un momento specifico.",
    ],
  },
  {
    id: "ossigeno", n: "02", accent: "#66D9EF",
    era: "2,5 miliardi di anni fa", short: "Ossigeno",
    title: "La vita cambia l'atmosfera.",
    body: "La fotosintesi ossigenica contribuisce alla Grande Ossidazione, trasformando profondamente il sistema terrestre.",
    kinds: ["ricostruzione", "artistico"],
    story: [
      "I cianobatteri, organismi capaci di fotosintesi ossigenica, rilasciano ossigeno come sottoprodotto. Le stromatoliti sono strutture stratificate costruite da comunità microbiche.",
      "La Grande Ossidazione viene collocata in genere tra circa 2,4 e 2,1 miliardi di anni fa. Non fu un evento istantaneo: l'ossigeno si accumulò in modo graduale e irregolare per centinaia di milioni di anni.",
      "Le datazioni variano a seconda dei metodi geochimici utilizzati.",
    ],
  },
  {
    id: "glaciazioni", n: "03", accent: "#F4F7FA",
    era: "Il clima in movimento", short: "Glaciazioni",
    title: "La Terra attraversa cicli naturali.",
    body: "Le variazioni orbitali, insieme alle retroazioni del sistema climatico e ai cambiamenti nella distribuzione dell'energia solare, contribuiscono ai cicli glaciali e interglaciali.",
    kinds: ["ricostruzione", "schema"],
    story: [
      "Nel corso degli ultimi milioni di anni la Terra ha alternato periodi glaciali e interglaciali, scanditi da variazioni dell'orbita e dell'inclinazione dell'asse terrestre (cicli di Milanković) amplificate da retroazioni come ghiaccio, albedo e gas serra.",
      "Il massimo dell'ultima glaciazione si verificò circa 21.000 anni fa. La transizione verso l'Olocene, il periodo interglaciale attuale, iniziò circa 11.700 anni fa.",
      "Massimo glaciale e fine della glaciazione sono due momenti distinti, separati da migliaia di anni di deglaciazione.",
    ],
  },
  {
    id: "medioevo", n: "04", accent: "#9CC3DC",
    era: "Dal Medioevo all'Ottocento", short: "Medioevo",
    title: "Anche le società umane hanno vissuto grandi variazioni climatiche.",
    body: "Durante parte del Medioevo alcune regioni europee conobbero condizioni relativamente miti. Tra circa il XIV e il XIX secolo, diverse aree sperimentarono fasi fredde associate alla Piccola Era Glaciale.",
    kinds: ["ricostruzione", "artistico"],
    story: [
      "Le ricostruzioni basate su anelli degli alberi, carote di ghiaccio e documenti storici mostrano che queste anomalie non furono uniformi né simultanee in tutto il pianeta: le condizioni variavano da regione a regione.",
      "Durante la Piccola Era Glaciale molti ghiacciai alpini avanzarono e in alcuni inverni eccezionali grandi fiumi europei gelarono, come il Tamigi a Londra durante le celebri 'frost fairs'.",
      "Il villaggio rappresentato è una ricostruzione evocativa, non un luogo storico preciso.",
    ],
  },
  {
    id: "industria", n: "05", accent: "#FF4B45",
    era: "XVIII secolo", short: "Industria",
    title: "L'umanità cambia il ritmo del pianeta.",
    body: "La combustione di carbone, petrolio e gas aumenta la concentrazione atmosferica di gas serra.",
    kinds: ["osservato", "schema"],
    story: [
      "Con la Rivoluzione industriale, a partire dalla seconda metà del XVIII secolo, l'uso di combustibili fossili cresce rapidamente: prima il carbone, poi petrolio e gas.",
      "La concentrazione di CO₂ in atmosfera, attorno a 280 ppm in epoca preindustriale, ha superato 420 ppm negli ultimi anni (NOAA, misure di Mauna Loa).",
      "I punti luminosi che compaiono nella scena sono indicatori simbolici: i gas serra non formano uno strato fisico uniforme attorno al pianeta.",
    ],
  },
  {
    id: "scienza", n: "06", accent: "#66D9EF",
    era: "Dal XIX al XX secolo", short: "Scienza",
    title: "La scienza comprende l'effetto serra.",
    body: "Dalle prime intuizioni sul bilancio termico alle misure moderne: due secoli di ricerca collegano gas serra e temperatura.",
    kinds: ["osservato", "schema"],
    milestones: [
      { year: "1824", name: "Joseph Fourier", text: "Fourier intuisce il ruolo dell'atmosfera nel bilancio termico terrestre." },
      { year: "1856", name: "Eunice Foote", text: "Eunice Foote mostra sperimentalmente che la CO₂ e il vapore acqueo si riscaldano in condizioni di irraggiamento e discute le implicazioni climatiche." },
      { year: "1896", name: "Svante Arrhenius", text: "Arrhenius calcola come le variazioni della CO₂ possano influenzare la temperatura terrestre." },
      { year: "1988", name: "James Hansen", text: "Nel 1988 James Hansen porta il riscaldamento globale antropogenico al centro del dibattito pubblico e politico statunitense." },
    ],
    story: [
      "Le barre nella scena rappresentano la concentrazione media annua di CO₂ misurata a Mauna Loa (NOAA); l'altezza è proporzionale all'eccesso rispetto al livello preindustriale di circa 280 ppm. Valori arrotondati: 1960 ≈ 317 ppm, 1970 ≈ 326, 1980 ≈ 339, 1990 ≈ 354, 2000 ≈ 370, 2010 ≈ 390, 2020 ≈ 414, 2024 ≈ 425.",
      "Le frecce luminose (energia solare in ingresso, calore emesso dal pianeta) sono uno schema concettuale, non una misura.",
    ],
  },
  {
    id: "oggi", n: "07", accent: "#FF4B45",
    era: "Oggi", short: "Oggi",
    title: "Il pianeta si sta riscaldando rapidamente.",
    body: "La temperatura media globale è aumentata di circa 1,1–1,3 °C rispetto al periodo 1850–1900, a seconda del periodo di riferimento e della metrica utilizzata. Il riscaldamento è principalmente causato dalle attività umane, soprattutto dalle emissioni di gas serra.",
    kinds: ["osservato", "artistico"],
    story: [
      "Secondo l'IPCC (AR6, 2021) la temperatura superficiale globale nel decennio 2011–2020 è stata di circa 1,1 °C superiore al periodo 1850–1900. Per il decennio 2015–2024 la stima aggiornata è di circa 1,24 °C (Forster et al., 2025).",
      "Il 2024 è stato il primo anno solare con una media stimata di circa 1,55 °C (±0,13 °C) sopra il livello preindustriale (WMO). Si tratta di un singolo anno: le soglie dell'Accordo di Parigi si riferiscono a medie su più decenni.",
      "Ritiro dei ghiacciai, ondate di calore, siccità e innalzamento del livello del mare non avvengono ovunque nello stesso momento. Non ogni singolo evento estremo è attribuibile a una sola causa.",
    ],
  },
  {
    id: "finale", n: "08", accent: "#F4F7FA",
    era: "Epilogo", short: "Epilogo",
    title: "Il clima è sempre cambiato. Oggi, a cambiare il ritmo, siamo noi.",
    body: "Comprendere il passato è essenziale per affrontare il futuro.",
    kinds: ["artistico"],
    story: [
      "Il clima della Terra è sempre cambiato. La velocità del riscaldamento attuale, e soprattutto la sua causa prevalentemente umana, rappresentano la discontinuità decisiva.",
    ],
  },
];

// Posizione sulla timeline in scala non lineare (logaritmica sugli anni fa), in %.
export const TIMELINE_POS = [2, 14, 34, 58, 72, 82, 94, 100];

export const SOURCES = [
  { label: "IPCC (2021). AR6 WG I — Climate Change 2021: The Physical Science Basis, Summary for Policymakers.", url: "https://www.ipcc.ch/report/ar6/wg1/" },
  { label: "WMO (2025). State of the Global Climate 2024.", url: "https://wmo.int/publication-series/state-of-global-climate-2024" },
  { label: "Forster P. M. et al. (2025). Indicators of Global Climate Change 2024. Earth System Science Data.", url: "https://essd.copernicus.org/articles/17/2641/2025/" },
  { label: "NOAA Global Monitoring Laboratory — Trends in Atmospheric CO₂, Mauna Loa.", url: "https://gml.noaa.gov/ccgg/trends/" },
  { label: "NASA — Global Temperature (Vital Signs of the Planet).", url: "https://science.nasa.gov/earth/explore/earth-indicators/global-temperature/" },
  { label: "NOAA NCEI — Paleoclimatology: glacial cycles and the Last Glacial Maximum.", url: "https://www.ncei.noaa.gov/products/paleoclimatology" },
  { label: "Foote E. (1856). Circumstances affecting the heat of the sun's rays. American Journal of Science.", url: "https://www.climate.gov/news-features/features/happy-200th-birthday-eunice-foote-hidden-climate-science-pioneer" },
  { label: "Arrhenius S. (1896). On the Influence of Carbonic Acid in the Air upon the Temperature of the Ground.", url: "https://www.rsc.org/images/Arrhenius1896_tcm18-173546.pdf" },
];

export const MODELS = [
  { id: "vulcano", name: "Vulcano primordiale", scene: "nascita", desc: "Cono vulcanico con colata di magma emissiva." },
  { id: "stromatolite", name: "Stromatoliti", scene: "ossigeno", desc: "Strutture stratificate costruite da comunità microbiche." },
  { id: "ghiacciaio", name: "Ghiacciaio", scene: "glaciazioni", desc: "Massa glaciale su un rilievo montuoso." },
  { id: "casa", name: "Casa medievale", scene: "medioevo", desc: "Abitazione con tetto innevato e pino." },
  { id: "fabbrica", name: "Fabbrica a vapore", scene: "industria", desc: "Edificio industriale con ciminiere." },
  { id: "molecola", name: "Molecola di CO₂", scene: "scienza", desc: "Un atomo di carbonio legato a due atomi di ossigeno (O=C=O)." },
  { id: "citta", name: "Città costiera", scene: "oggi", desc: "Edifici contemporanei sul margine del mare." },
];

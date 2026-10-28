# PROMPT TEMPLATE — "Punto di non ritorno" (esperienza 3D scrollytelling)

Copia tutto il testo qui sotto, compila i campi tra [[ ]] e incollalo in una nuova richiesta.

---

Crea un'esperienza web 3D immersiva e cinematografica, livello premio Awwwards, in lingua [[LINGUA – es. italiano]].

## >>> DA COMPILARE: TEMA DELL'ESPERIENZA 3D <<<
- TITOLO DEL PROGETTO: [[es. "Punto di non ritorno"]]
- SOTTOTITOLO / TAGLINE: [[una frase che riassume il viaggio]]
- TEMA / ARGOMENTO DA AFFRONTARE: [[descrivi il tema: cosa racconta l'esperienza, da dove parte e dove arriva]]
- ARCO TEMPORALE O PERCORSO NARRATIVO: [[es. dalle origini a oggi, oppure fase 1 → fase 8]]
- MESSAGGIO FINALE: [[3 righe brevi che chiudono la storia + una frase di sintesi]]
- 8 CAPITOLI (per ognuno: numero, nome breve, epoca/etichetta, titolo, testo breve, 3 paragrafi di approfondimento, ambientazione 3D ed elementi in scena):
  - 01 [[...]]
  - 02 [[...]]
  - 03 [[...]]
  - 04 [[...]]
  - 05 [[...]]
  - 06 [[capitolo infografica: quali dati mostrare, anni e valori, chi guarda i dati]]
  - 07 [[...]]
  - 08 Finale [[...]]
- INDICATORE LIVE (es. termometro): [[nome della grandezza, unità di misura e valore per ciascuno degli 8 capitoli, con fonte]]
- FONTI DA CITARE: [[elenco delle fonti]]
- FIRMA / CREDITI ED EMAIL DI CONTATTO: [[nome studio, email]]
## >>> FINE PARTE DA COMPILARE <<<

## Stile visivo
- Iperrealistico e cinematografico: materiali PBR (standard/physical), luce realistica con ombre morbide, nebbia atmosferica, tone mapping ACES, bloom leggero, vignettatura, grana pellicola.
- Sfondo scuro (#080B10), testo chiaro (#F4F7FA); un colore d'accento per capitolo.
- Font: Inter (titoli extra-bold, maiuscolo, interlinea stretta, a capo bilanciato) e Space Grotesk (etichette mono/uppercase).
- Titoli contenuti (mobile ~1.7rem, desktop ~3rem); ombra su tutti i testi sopra la scena 3D per la leggibilità (non sui pulsanti chiari).
- Nessuna emoji né simboli tipo ↗ nei link; icone solo lucide-react.

## Struttura della pagina
1. Preloader con avanzamento, poi Hero a tutto schermo: titolo, tagline, marquee di parole chiave, invito a scorrere.
2. Narrazione a scroll (scrollytelling) con 8 sezioni; per ogni capitolo un pannello di testo fisso (sticky) con numero, epoca, titolo, testo, etichette sul tipo di contenuto (dato osservato / ricostruzione / schema / animazione artistica) e pulsante "Approfondisci" che apre un pannello laterale con i paragrafi di approfondimento.
3. Durata: capitoli 01 e 08 = 170vh; capitoli 02–07 = 245vh, con 75vh di transizione in entrata, ~95vh di pausa con il testo fermo e uno zoom della camera avanti e poi indietro, 75vh di transizione in uscita.
4. Navigazione laterale (desktop) con salto ai capitoli; su mobile barra di 8 linee in basso, tutte bianche (piene per i capitoli raggiunti, tenui per gli altri).
5. Indicatore live (es. termometro): segue lo scroll in continuo interpolando i valori tra i capitoli; desktop tubo verticale in basso a destra, mobile pillola compatta in alto; nascosto nell'Hero.
6. Chiusura: messaggio finale, fonti, crediti, link "Galleria 3D" e "Scrivici — email".
7. Pagine extra: /galleria (visualizzatore 3D dei modelli con rotazione e zoom), /testo (versione solo testo accessibile), /admin (login amministratore e pannello analisi: visite, interazioni, errori).

## Esperienza 3D (React Three Fiber + drei + postprocessing)
- Un'unica scena 3D fissa a tutto schermo dietro i testi; il progresso dello scroll (0..7) guida tutto.
- Capitolo 01 su globo/pianeta nello spazio con stelle; capitoli 02–07 come diorami: grande mappa a isola con rilievo procedurale (terreno 26×26, bordi sfumati, acqua), ingrandita per riempire l'inquadratura; passaggio globo → diorama → globo con dissolvenza e scala.
- Camera cinematografica: una chiave per capitolo (target, azimut, elevazione, distanza), interpolazione morbida, orbita lenta automatica, trascinamento e pinch/zoom su touch, inquadrature dedicate su telefono.
- Luce dall'alba alla notte durante lo scroll; nel finale cielo notturno con luna, stelle cadenti e finestre illuminate.
- Ogni capitolo ha elementi propri e animati: persone che camminano, animali che brucano, veicoli in movimento, alberi mossi dal vento, particelle (pioggia, neve, fuoco, fumo, vapore, bolle, meteoriti) e fenomeni del tema.
- Modelli realistici ma leggeri: geometrie fuse con colori per vertice (1 draw call per oggetto), oggetti ripetuti instanziati (boschi, case, pannelli), animazioni di arti e vento nel vertex shader.
- Capitolo 06 come infografica 3D premium: palco scuro e lucido, pannello olografico con griglia e titoli, colonne di vetro luminose che crescono in sequenza con valori ed etichette, curva luminosa disegnata progressivamente con valore finale, figure realistiche (es. scienziati in camice, politici in giacca e cravatta, stampa) che guardano i dati; l'animazione riparte a ogni visita.
- Profondità di campo leggera solo su desktop e solo nei diorami (sfondo sfocato), spenta su telefono.

## Audio
- Ambiente procedurale (Web Audio API) diverso per capitolo, con dissolvenze tra le scene; pioggia morbida senza fruscio; catena con filtro anti-sibilo e limitatore; disattivato di default, pulsante audio sempre visibile.

## Prestazioni (obbligatorie)
- Scroll fluido a 60 fps: pixel ratio limitato e adattivo (PerformanceMonitor), modalità a basso consumo su mobile, ombre e postprocessing ridotti o spenti sui dispositivi deboli, precompilazione degli shader, nessun re-render React durante lo scroll (stato mutabile condiviso), particelle in GPU.
- Fallback senza WebGL e rispetto di prefers-reduced-motion.
- Tutto deve funzionare a 390 px di larghezza; testi leggibili prima di qualsiasi animazione.

## Backend
- FastAPI + MongoDB: login admin con JWT e protezione brute-force, raccolta eventi di interazione e log errori, statistiche per il pannello admin, elenco modelli della galleria.

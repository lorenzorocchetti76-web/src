# Earth Through Time — PRD

## Original problem statement
(Brief molto lungo dell'utente, in italiano.) Esperienza web 3D con scroll (Three.js + GSAP), modelli interattivi, transizioni fluide, ottimizzata per mobile, caricamento asincrono, interazioni touch, cache persistente offline, log errori in tempo reale, notifiche push, pannello analisi per admin; ogni ambiente con reveal di titolo+testo; galleria di modelli 3D (rotate/zoom/pan); audio ambientale per sezione + SFX + controlli play/pausa/volume; percorso testuale alternativo; fallback per dispositivi senza WebGL; accessibilità (tastiera, focus, label). Contenuto scelto dall'utente: "EARTH THROUGH TIME" — 7 scene sulla storia climatica (nascita della Terra, ossigenazione, glaciazioni, Medioevo/Piccola Era Glaciale, Rivoluzione industriale, scienza dell'effetto serra, oggi) + finale "IL CLIMA È SEMPRE CAMBIATO. OGGI, A CAMBIARE IL RITMO, SIAMO NOI." con fonti scientifiche. Palette #080B10 #101D30 #F4F7FA #66D9EF #FF7138 #FF4B45. Titolo/credit: Studio Rocchetti Comunicazione (info@studiorocchetti.com). L'utente potrà in seguito sostituire i testi con quelli dell'agenzia (metodo in 5 fasi).

## User choices
- Tema: Earth Through Time (clima) — testi agenzia forse in futuro
- Admin: email+password (default)
- Notifiche push: non servono per ora
- Audio: generato dal sito (Web Audio), spento di default

## Architecture
- Frontend React (CRA) + React Three Fiber/Three.js + drei + GSAP ScrollTrigger + Lenis + framer-motion
  - `src/lib/content.js` — TUTTI i testi (sostituibili)
  - `src/lib/store.js` (stato scroll/camera), `scroll.js` (scroll→progresso 0..7 deterministico), `audio.js` (engine sintetico), `api.js` (analytics + error logging)
  - `src/components/three/*` — World (Canvas, camera rig, atmosfera), Globe (shader GLSL magma/oceano/Terra moderna), Diorama (terreno isometrico instanziato che si trasforma per epoca), EraProps, Models (modelli procedurali condivisi), Particles
  - Pagine: `/` esperienza, `/testo` percorso testuale, `/galleria`, `/admin/login`, `/admin`
  - `public/sw.js` service worker network-first + cache offline
- Backend FastAPI + MongoDB: `/api/auth/login|me` (JWT Bearer 8h, bcrypt, brute-force lock), `/api/events`, `/api/logs` (pubblici), `/api/admin/stats|logs` (admin)

## Implemented (2026-10-27)
- 8 beat di scrollytelling con pannelli sticky, reveal a maschera, camera orbit/flip/dolly/pan, scroll reversibile
- Hero cinetico, preloader, marquee, rail scene, timeline non lineare, story sheet "Approfondisci" con etichette (osservato/ricostruzione/schema/artistico)
- Modalità Esplora (drag, pinch, rotella, frecce, Esc) + Reset view
- Audio ambientale per scena + SFX + volume
- Galleria 7 modelli con OrbitControls + pulsanti/tastiera
- Fallback WebGL (`?fallback=1` per test), ErrorBoundary con log
- Dashboard admin: KPI, grafici, split modalità/dispositivi/modelli, log errori live (10s), svuota log
- Fonti (IPCC AR6, WMO 2024, Forster 2025, NOAA, NASA...)

## Iterazione 2 (2026-10-27)
- Rimossi: etichette accanto ad Approfondisci, marquee nero, header superiore (restano logo e audio negli angoli), sezione fonti in home, pulsante percorso testuale, link "Fonti e riferimenti"
- Proiezione ortografica isometrica, Terra con rilievi, nuvole, oceani speculari, luci notturne; post-processing (bloom, vignette, SMAA) su desktop; luci ambientali
- Più dettagli: rocce, bagliori lavici, iceberg, aurora, mulino, uccelli, treno, pale eoliche, nuvole
- Font Space Grotesk + Inter; audio solo toni puri (niente rumore); scroll più equilibrato (sezioni 170vh, Lenis a durata)

## Iterazione 3 (2026-10-27)
- Pioggia leggera inclinata dal vento (Ossigeno, Industria, Oggi), pini che ondeggiano al vento, onde animate sull'acqua (shader vertex con normali dinamiche)

## Iterazione 4 (2026-10-27)
- Suono pioggia morbido (rumore filtrato + gocce) solo in Ossigeno/Industria/Oggi
- Cap.1 meteoriti, più stelle, ufo; cap.2 fuochi sulle terre emerse; cap.3 vapori; cap.4 persone, cavalli, cani, mucche, lago con pesci; cap.5 più luce, binari più lunghi con traversine, operai, camion di carbone; cap.6 infografica multicolore; cap.7 sole, ozono, autostrada con camion, aerei
- Alone del globo a gradiente morbido; testi bianchi; titoli Inter 800; titolo "Punto di non ritorno"; frase finale in minuscolo

## Iterazione 5 (2026-10-27)
- Ciclo giorno/notte legato allo scroll (alba cap.2 → giorno → tramonto cap.6 → notte cap.7) con finestre di case/fabbriche/città che si accendono (materiali condivisi)
- Performance: precompilazione materiali, niente point light dinamiche (sostituite da glow), shader globo più leggero, ombre 1024 PCF, bloom a mezza risoluzione, niente SMAA, dpr max 1.5, stelle statiche, PerformanceMonitor che abbassa qualità se gli fps calano

## Iterazione 6 (2026-10-27)
- Cielo notturno: luna con alone e stelle cadenti al calare della notte (cap.07 e finale); il sole sparisce al tramonto
- Titoli su smartphone ridotti ~13% (scene, hero, frase finale)
- In attesa di conferma: passaggio da stile isometrico a iperrealistico/cinematografico

## Iterazione 7 (2026-10-27)
- Stile iperrealistico/cinematografico: camera prospettica fov 35 con movimento a mano, terreno continuo (heightfield GPU con dettagli, rocce sui pendii, lava emissiva), oceano fino all'orizzonte, cielo con gradiente/alone solare/stelle notturne, nebbia atmosferica
- Modelli (case, persone, animali, fabbriche) ancora low-poly

## Iterazione 8 (2026-10-27)
- Modelli realistici e leggeri: geometrie fuse con colori per vertice (Kit.js, Buildings.js, Life.js); case con tetto a falde/comignolo/travi, persone e quadrupedi con animazione arti in vertex shader, fabbriche in mattoni, grattacieli, camion; boschi e villaggi instanziati con vento in GPU; traversine instanziate
- Profondità di campo leggera (solo desktop, solo paesaggi); audio pulito (rumore marrone filtrato, loop sfumato, limitatore)
- Fasi 02–07 durano il doppio (340vh) con pausa del testo e zoom avanti/indietro della camera (store.beat); titoli più piccoli; ombra su tutti i testi; 8 linee di avanzamento tutte bianche
- Test frontend: iteration_1.json 100%

## Iterazione 9 (2026-10-27)
- Pausa delle fasi 02–07 ridotta del 50% (sezioni 245vh: 75vh entrata, ~95vh pausa con zoom, 75vh uscita)
- Termometro live (Thermometer.jsx): temperatura media stimata per capitolo, segue lo scroll; desktop in basso a destra, mobile pillola in alto
- Mappa ingrandita (terreno 26×26, diorama ×1,15) con elementi per fase: cianobatteri e rocce a bande (02), mammut e ghiacciai (03), chiesa, covoni, pecore, case e boschi esterni (04), case operaie, carbone, fabbriche (05), osservatorio, radiotelescopi, pallone sonda (06), parco solare, turbine, incendio (07)
- Rimosso il simbolo ↗ dopo "Galleria 3D" e "Scrivici"
- Test frontend: iteration_2.json 100%

## Iterazione 10 (2026-10-27)
- Capitolo 06 rifatto (ScienceStage.jsx): palco olografico, pannello "CO2 in atmosfera 1960–2024", 8 barre di vetro luminose che crescono in sequenza (ppm Mauna Loa), curva rossa dell'anomalia di temperatura disegnata progressivamente (+1,3 °C), scienziati in camice alla console, politici in giacca e cravatta al leggio con bandiere e telecamera stampa; testi 3D con font locali /fonts
- Inquadratura dedicata su telefono (chiavi camera m/my)
- Test frontend: iteration_3.json 100%

## Backlog
- In attesa: integrazione ChatGPT (l'utente deve scegliere la funzione: guida chat, spiegazione capitolo, quiz o insight admin)
- P1: sostituzione testi con versione Studio Rocchetti (5 fasi) — solo `content.js` + eventuali modelli
- P1: notifiche push (rimandate dall'utente)
- P2: toggle camera ortografica isometrica pura; video scroll-scrubbed; qualità grafica manuale
- P2: SEO/OG image

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

## Backlog
- P1: sostituzione testi con versione Studio Rocchetti (5 fasi) — solo `content.js` + eventuali modelli
- P1: notifiche push (rimandate dall'utente)
- P2: toggle camera ortografica isometrica pura; video scroll-scrubbed; qualità grafica manuale
- P2: SEO/OG image

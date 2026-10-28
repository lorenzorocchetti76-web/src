# PROMPT STANDARD — Sito 3D scrollytelling "Punto di non ritorno" (versione riutilizzabile)

ISTRUZIONI PER CHI USA IL PROMPT
- Compila solo i punti marcati con  [[CAMPO DA COMPILARE]].
- Le caselle  [ ]  si attivano scrivendo una X:  [X].
- Se lasci un campo vuoto, l'AI deve usare il TESTO FITTIZIO DI ESEMPIO indicato accanto e mostrarlo come segnaposto visibile.
- Il prompt è scritto in testo semplice: funziona con qualsiasi AI (ChatGPT, Claude, Gemini, Emergent, Lovable, Bolt, v0, Cursor, ecc.).

=====================================================================
ISTRUZIONI PER L'AI (NON MODIFICARE)
=====================================================================
Costruisci un sito web 3D immersivo a scroll (scrollytelling), livello premio Awwwards, IDENTICO per struttura, stile, animazioni e prestazioni a quanto descritto qui sotto. Cambiano solo argomento, testi, numero di fasi e sezioni finali, che prendi dai campi compilati.
Regole:
1. Non inventare dati reali: usa solo i valori dei campi; se mancano, usa i valori fittizi di esempio e segnalali come "[DATO DI ESEMPIO]".
2. Tutti i testi stanno in un unico file di contenuti (es. content.js), così si possono cambiare senza toccare il codice.
3. Il numero di fasi è VARIABILE (minimo 3, massimo 12): struttura, navigazione, barra di avanzamento, indicatore live e camera si adattano automaticamente al numero indicato.
4. Le sezioni finali opzionali vanno create solo se la casella è [X], nell'ordine indicato.
5. Rispondi e scrivi i testi nella lingua del CAMPO 1.

=====================================================================
PARTE 1 — CAMPI DA COMPILARE
=====================================================================

CAMPO 1 — LINGUA DEL SITO
[[CAMPO DA COMPILARE: es. italiano]]

CAMPO 2 — ARGOMENTO / TEMA DELL'ESPERIENZA 3D
[[CAMPO DA COMPILARE: descrivi in 2-4 righe cosa racconta il sito, da dove parte e dove arriva]]
Esempio fittizio: "PROGETTO ALFA — Il viaggio del Valore X: come un indice immaginario passa da 0 a 100 in sei fasi, dalla nascita alla svolta finale."

CAMPO 3 — IDENTITÀ
- Titolo del sito: [[CAMPO DA COMPILARE]]   (esempio: "Punto di non ritorno")
- Sottotitolo / tagline: [[CAMPO DA COMPILARE]]   (esempio: "Un viaggio immersivo in 6 fasi dentro il Valore X")
- Parole chiave per il nastro scorrevole (4-6): [[CAMPO DA COMPILARE]]   (esempio: "6 fasi · 100 punti · Un solo percorso · Ogni numero conta")
- Nome studio / azienda per i crediti: [[CAMPO DA COMPILARE]]   (esempio: "Studio Esempio")
- Email di contatto: [[CAMPO DA COMPILARE]]   (esempio: info@esempio.it)
- Colore principale del brand (facoltativo): [[CAMPO DA COMPILARE]]   (esempio: #66D9EF)

CAMPO 4 — NUMERO DI FASI
Numero di fasi: [[CAMPO DA COMPILARE: da 3 a 12]]   (esempio: 6)
Nota: la prima fase è sempre l'apertura, l'ultima è sempre il finale; le fasi intermedie hanno la pausa con zoom.

CAMPO 5 — INDICATORE LIVE (il "termometro" che cambia con lo scroll)
- Nome della grandezza: [[CAMPO DA COMPILARE]]   (esempio: "Valore X")
- Unità di misura: [[CAMPO DA COMPILARE]]   (esempio: "punti")
- Valore minimo e massimo della scala: [[CAMPO DA COMPILARE]]   (esempio: 0 – 100)
- Forma: [ ] termometro   [ ] barra   [ ] contatore numerico   (consiglio: termometro)

CAMPO 6 — FASI (copia il blocco tante volte quante sono le fasi del CAMPO 4)

--- FASE 01 (apertura) ---
- Nome breve (per la navigazione): [[CAMPO DA COMPILARE]]   (esempio: "Origine")
- Etichetta epoca / momento: [[CAMPO DA COMPILARE]]   (esempio: "Anno 0")
- Titolo: [[CAMPO DA COMPILARE]]   (esempio: "Tutto comincia da zero.")
- Testo breve (1-2 frasi): [[CAMPO DA COMPILARE]]   (esempio: "Il Valore X nasce in un sistema ancora instabile, pronto a trasformarsi.")
- Approfondimento (3 paragrafi): [[CAMPO DA COMPILARE]]   (esempio: "Paragrafo di esempio uno… / Paragrafo di esempio due… / Paragrafo di esempio tre…")
- Valore dell'indicatore live: [[CAMPO DA COMPILARE]]   (esempio: 0)
- Ambientazione 3D: [ ] globo/pianeta nello spazio   [ ] diorama/mappa   (consiglio per la fase 01: globo)
- Elementi 3D in scena: [[CAMPO DA COMPILARE]]   (esempio: "pianeta incandescente, meteoriti, stelle")
- Colore d'accento: [[CAMPO DA COMPILARE]]   (esempio: #FF7138)

--- FASE 02 ---
- Nome breve: [[CAMPO DA COMPILARE]]   (esempio: "Crescita")
- Etichetta epoca: [[CAMPO DA COMPILARE]]   (esempio: "Anno 10")
- Titolo: [[CAMPO DA COMPILARE]]   (esempio: "I primi segnali.")
- Testo breve: [[CAMPO DA COMPILARE]]   (esempio: "Il Valore X sale a 18 punti: il cambiamento diventa visibile.")
- Approfondimento (3 paragrafi): [[CAMPO DA COMPILARE]]
- Valore indicatore: [[CAMPO DA COMPILARE]]   (esempio: 18)
- Ambientazione: diorama
- Elementi 3D in scena: [[CAMPO DA COMPILARE]]   (esempio: "mare basso, rocce stratificate, bolle che salgono, pioggia leggera")
- Colore d'accento: [[CAMPO DA COMPILARE]]   (esempio: #66D9EF)

--- FASE 03 ---
(stessi campi; esempio: "Equilibrio" · "Anno 25" · "Una pausa apparente." · valore 35 · "ghiacci, animali, neve")

--- FASE 04 ---
(stessi campi; esempio: "Comunità" · "Anno 50" · "Le persone entrano in scena." · valore 52 · "villaggio, persone che camminano, animali, mulino")

--- FASE 05 ---
(stessi campi; esempio: "Accelerazione" · "Anno 75" · "Il ritmo cambia." · valore 74 · "fabbriche, treni, camion, fumo")

--- FASE 06 (finale) ---
(stessi campi; esempio: "Svolta" · "Oggi" · "Il punto di non ritorno." · valore 100 · "città, pannelli solari, pale eoliche, notte con luna e stelle cadenti")

(Aggiungi o togli blocchi FASE secondo il numero scelto nel CAMPO 4.)

CAMPO 7 — FASE INFOGRAFICA (facoltativa)
[ ] Sì, trasforma una fase in infografica 3D premium   — Quale fase: [[CAMPO DA COMPILARE: numero]]   (consiglio: la penultima)
- Titolo del grafico: [[CAMPO DA COMPILARE]]   (esempio: "VALORE X · ANNO 0–75")
- Dati delle colonne (etichetta = valore, da 4 a 10 voci): [[CAMPO DA COMPILARE]]   (esempio: A0=0 · A10=18 · A25=35 · A40=44 · A50=52 · A60=61 · A70=69 · A75=74)
- Seconda serie per la curva luminosa (facoltativa): [[CAMPO DA COMPILARE]]   (esempio: 0.1 · 0.3 · 0.5 · 0.6 · 0.8 · 1.0 · 1.2 · 1.4)
- Personaggi che guardano i dati: [[CAMPO DA COMPILARE]]   (esempio: "analisti in camice, manager in giacca e cravatta, giornalisti con telecamera")

CAMPO 8 — CHIUSURA DEL RACCONTO
- Messaggio finale (3 righe brevi): [[CAMPO DA COMPILARE]]   (esempio: "Ogni valore ha una storia. / Oggi, a cambiarla, / siamo noi.")
- Frase di sintesi: [[CAMPO DA COMPILARE]]   (esempio: "Capire il percorso aiuta a scegliere il prossimo passo.")
- Fonti (una per riga): [[CAMPO DA COMPILARE]]   (esempio: "Fonte di esempio 1 — www.esempio.it")

=====================================================================
PARTE 2 — SEZIONI AGGIUNTIVE DOPO IL FINALE (scegli con [X])
=====================================================================
Le sezioni scelte compaiono dopo il finale, su sfondo scuro, con lo stesso stile del sito (testo con ombra, animazioni di entrata leggere, leggibili anche senza animazione, perfette a 390 px).
Indica l'ordine scrivendo un numero accanto alla casella (es. [X] 1).

[ ] ___ HERO SECONDARIO / CALL TO ACTION
    Contenuto: [[CAMPO DA COMPILARE: titolo, frase, testo del pulsante, link]]
    Consiglio: una sola azione chiara (es. "Prenota una demo"); usa un'immagine o il globo 3D in piccolo.

[ ] ___ CHI SIAMO
    Contenuto: [[CAMPO DA COMPILARE: storia in 3-5 righe, missione, 3 valori]]
    Consiglio: testo breve + 3 numeri chiave (es. "12 anni · 40 progetti · 3 sedi" — usa solo numeri veri).

[ ] ___ AZIENDA / SERVIZI
    Contenuto: [[CAMPO DA COMPILARE: da 3 a 6 servizi con nome e descrizione di una riga]]
    Consiglio: schede in griglia asimmetrica, un'icona lineare per servizio.

[ ] ___ TEAM
    Contenuto: [[CAMPO DA COMPILARE: nome, ruolo, foto per ogni persona]]
    Consiglio: massimo 8 persone; se mancano le foto usa segnaposto neutri, mai volti inventati.

[ ] ___ GALLERIA
    Contenuto: [[CAMPO DA COMPILARE: immagini o video da caricare, oppure "modelli 3D del sito"]]
    Consiglio: proporzioni fisse, scorrimento continuo senza fine, ingrandimento al tocco; su mobile una colonna.

[ ] ___ NUMERI / RISULTATI
    Contenuto: [[CAMPO DA COMPILARE: 3-4 numeri con etichetta]]
    Consiglio: contatori animati che partono quando la sezione entra nello schermo.

[ ] ___ TESTIMONIANZE
    Contenuto: [[CAMPO DA COMPILARE: citazione, nome, ruolo]]
    Consiglio: solo testimonianze reali; da 2 a 6, in carosello lento.

[ ] ___ MAPPA / DOVE SIAMO
    Contenuto: [[CAMPO DA COMPILARE: indirizzo completo, orari, telefono]]
    Consiglio: mappa in stile scuro coerente col sito; pulsante "Apri in Google Maps".

[ ] ___ FORM DI CONTATTO
    Campi: [[CAMPO DA COMPILARE: es. nome, email, telefono, messaggio, consenso privacy]]
    Dove arrivano i messaggi: [ ] salvati nel pannello admin   [ ] inviati via email a: [[CAMPO DA COMPILARE]]
    Consiglio: massimo 5 campi, conferma visibile dopo l'invio, protezione anti-spam.

[ ] ___ NEWSLETTER
    Contenuto: [[CAMPO DA COMPILARE: titolo e promessa, es. "Un aggiornamento al mese"]]
    Consiglio: un solo campo email + consenso.

[ ] ___ FAQ
    Contenuto: [[CAMPO DA COMPILARE: 4-8 domande e risposte]]
    Consiglio: a fisarmonica, una domanda aperta alla volta.

[ ] ___ PARTNER / LOGHI
    Contenuto: [[CAMPO DA COMPILARE: loghi da caricare]]
    Consiglio: loghi in bianco su nastro scorrevole lento.

[ ] ___ ALTRA SEZIONE A SCELTA
    Nome e contenuto: [[CAMPO DA COMPILARE]]

FOOTER (sempre presente): crediti del CAMPO 3, email, link "Galleria 3D" e "Scrivici" senza emoji né simboli, link alla versione solo testo.

=====================================================================
PARTE 3 — SPECIFICHE FISSE DEL TEMPLATE (NON MODIFICARE)
=====================================================================

STILE VISIVO
- Iperrealistico e cinematografico: materiali PBR (standard/physical), ombre morbide, nebbia atmosferica, tone mapping ACES, bloom leggero, vignettatura, grana pellicola.
- Sfondo #080B10, testo #F4F7FA, un colore d'accento per fase.
- Font: Inter (titoli extra-bold, maiuscolo, interlinea 0.95, a capo bilanciato) e Space Grotesk (etichette uppercase spaziate).
- Titoli contenuti: circa 1.7rem su mobile, 2.6rem tablet, 3rem desktop.
- Ombra su tutti i testi sopra la scena 3D (text-shadow 0 1px 2px rgba(0,0,0,.6), 0 2px 16px rgba(0,0,0,.45)), tolta sui pulsanti chiari.
- Niente emoji; icone lineari (es. lucide).

STRUTTURA E SCROLL
1. Preloader con percentuale, poi Hero a tutto schermo: titolo, tagline, nastro di parole chiave, invito a scorrere.
2. Una sezione per fase, con pannello di testo fisso (sticky): numero (01, 02…), etichetta epoca, titolo, testo breve, etichette del tipo di contenuto (dato osservato / ricostruzione / schema / animazione artistica), pulsante "Approfondisci" che apre un pannello laterale con i 3 paragrafi.
3. Altezze: prima e ultima fase 170vh; fasi intermedie 245vh = 75vh transizione in entrata + ~95vh pausa (testo fermo, camera che fa zoom avanti e poi indietro) + 75vh transizione in uscita.
4. Il progresso dello scroll va da 0 a (numero fasi - 1) e viene calcolato dalle posizioni reali delle sezioni.
5. Navigazione: desktop barra laterale destra con nomi delle fasi e salto diretto; mobile una linea per fase in basso, tutte bianche (piene se raggiunte, tenui se no).
6. Indicatore live (CAMPO 5): segue lo scroll in continuo interpolando tra i valori delle fasi; desktop tubo verticale in basso a destra, mobile pillola compatta in alto al centro; nascosto sull'Hero.
7. Finale con messaggio del CAMPO 8, fonti, poi le sezioni della PARTE 2 e il footer.
8. Pagine extra: /galleria (visualizzatore 3D dei modelli con rotazione e zoom), /testo (versione solo testo accessibile), /admin (login amministratore + pannello analisi: visite, interazioni, errori).

SCENA 3D (React Three Fiber + drei + postprocessing, oppure Three.js equivalente)
- Un'unica scena 3D fissa a tutto schermo dietro ai testi, guidata dal progresso dello scroll.
- Fasi "globo": pianeta nello spazio con stelle. Fasi "diorama": grande mappa a isola con rilievo procedurale (terreno 26x26 unità, bordi sfumati, acqua riflettente), scalata per riempire l'inquadratura. Passaggio globo ↔ diorama con dissolvenza e scala.
- Camera cinematografica: una chiave per fase (punto inquadrato, azimut, elevazione, distanza) con interpolazione morbida, orbita lenta automatica, trascinamento e pinch-zoom su touch, inquadrature dedicate per telefono in verticale.
- Luce che passa dall'alba alla notte lungo lo scroll; nell'ultima fase notte con luna, stelle cadenti e finestre illuminate.
- Elementi animati per fase (dal CAMPO 6): persone che camminano, animali che brucano, veicoli in movimento, alberi mossi dal vento, particelle (pioggia, neve, fuoco, fumo, vapore, bolle, meteoriti).
- Modelli realistici ma leggeri: ogni modello è una sola geometria fusa con colori per vertice (1 draw call), oggetti ripetuti instanziati (boschi, case, pannelli), animazioni di arti e vento nel vertex shader.
- Fase infografica (CAMPO 7): palco scuro lucido con anello luminoso, pannello olografico con griglia e titoli 3D, colonne di vetro luminose che crescono in sequenza con valore sopra ed etichetta sotto, curva luminosa disegnata progressivamente con punti e valore finale, personaggi realistici che guardano i dati; l'animazione riparte a ogni visita.
- Profondità di campo leggera (sfondo sfocato) solo su desktop e solo nei diorami; spenta su telefono.

AUDIO
- Ambiente sonoro procedurale (Web Audio API) diverso per fase, con dissolvenze; pioggia morbida senza fruscio; filtro anti-sibilo e limitatore in uscita; spento di default, pulsante audio sempre visibile.

PRESTAZIONI (OBBLIGATORIE)
- Scroll fluido a 60 fps: pixel ratio limitato e adattivo, modalità a basso consumo su mobile, ombre e post-processing ridotti sui dispositivi deboli, shader precompilati, nessun re-render dell'interfaccia durante lo scroll, particelle in GPU.
- Fallback senza WebGL; rispetto di "riduci movimento".
- Tutto funziona a 390 px di larghezza; ogni testo è leggibile anche senza animazioni; contrasto minimo 4.5:1.

BACKEND
- API (es. FastAPI + MongoDB): login admin con token e blocco dopo troppi tentativi, raccolta eventi di interazione e log errori, statistiche per il pannello admin, elenco modelli della galleria, e (se scelto) ricezione dei messaggi del form.
- Nessuna credenziale nel codice: tutto in variabili d'ambiente.

CONSEGNA
- Al termine elenca: campi lasciati vuoti e sostituiti da esempi, dati di esempio da verificare, sezioni opzionali create.

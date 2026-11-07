# Atlante dell'Automobile: stato

Fonte di verità: questo repo (branch main). Online: https://atlante-automobile.pages.dev (Cloudflare Pages). Backup: Dropbox /StoriaDellAutomobile (solo file nuovi delle schede).

## Pubblicate
- 001 Benz Patent-Motorwagen (1886), 29 ottobre 2026. Testi riscritti il 7 novembre 2026 (registro editoriale, fonti verificate: passo 1.450 o 1.575 mm, viaggio del 1888 attribuito a Qatar Museums)
- 002 Daimler Motorkutsche (1886), 2 novembre 2026, testi riscritti il 7 novembre 2026 (tolti o attribuiti: regalo per Emma, sedile del Reitwagen, rotaie e aeronavi; potenza 1,1 PS = 0,82 kW). Aggiunte al registro: wilhelm-maybach, accensione-tubo-incandescente, sterzo-a-ralla, motore-standuhr. Lacune dichiarate: potenza (1,1 PS o kW), velocità (18/23 km/h), raffreddamento, rapporti cinghia, data prima corsa.

## Prossime
Daimler Reitwagen (1885), Panhard & Levassor (1891), Duryea Motor Wagon (1893), Mercedes 35 PS (1901), Oldsmobile Curved Dash (1901), Ford Model T (1908), Lancia Lambda (1922), Citroën Traction Avant (1934), Volkswagen Typ 1 (1938), Austin Mini (1959).

## Procedura
Vedi il documento di progetto claude/stato-atlante.md: nuova scheda = schede/<slug>.html + schede/<slug>.js, commit su main, verifica online con fetch.

## Regole editoriali dei testi (7 novembre 2026)
- Registro da rivista di design, impersonale. Nei testi della scheda mai la prima persona singolare ("ho trovato", "non ho verificato") né l'imperativo rivolto al lettore ("Trascina"): si scrive "si ruota trascinando".
- Ogni dato porta la sua fonte, in breve tra parentesi nel testo. Dove la fonte manca va detto, con la formula adatta al caso e senza ricopiare sempre la stessa: lacuna ("non risultano fonti affidabili"), stima ("valore stimato, le fonti divergono"), divergenza ("X per A, Y per B"), tradizione ("secondo un aneddoto diffuso, non confermato dalle fonti elencate").
- In "Fonti e lacune": paragrafo "Lacune e divergenze" con i dati discordanti, le stime dei modelli 3D e l'elenco "Restano da verificare" per ciò che è conoscenza generale e non figura nelle fonti elencate.
- Ogni cifra va riletta su una fonte aperta durante la sessione (fetch), non ricordata. Un "primo" (primo veicolo, prima stazione di servizio) si attribuisce a chi lo afferma.

## Disegni tecnici 3D (6 novembre 2026)
- Modulo `assets/tecnico3d.js` (568 KB, Three.js incluso, file generato). Sorgente in `tools/src/tecnico3d.src.js`. Si rigenera solo se si tocca il sorgente: `cd tools && npm install && npm run build`.
- Resa: camera ortografica, solo spigoli e contorni, linee nascoste tratteggiate (pulsante). Niente quote, niente esploso, niente sezione (scelta di Gabri: i modelli non sono abbastanza dettagliati).
- Caricamento: nella figura un `<div id="x" class="v3d" hidden>`, e nello script inline `ATLANTE.fig3d({host, svg, cap, capHtml, def:'./<slug>.<nome>.3d.js', ready(view)})` (in assets/atlante.js). Il modulo si carica con `import()` solo quando la figura sta per entrare in vista; se WebGL o il caricamento falliscono resta il disegno SVG 2D (se c'è). `ready(view)` riceve `view.set(a)`, da chiamare al posto di ridisegnare l'SVG.
- Un file modello `schede/<slug>.<nome>.3d.js` esporta `build(T)` e restituisce `{label, parts, pose(a,H,S), a0, samples, view, buttons, views, pad}`. Helper di T: `cylinder, cone, tube, lathe, box, extrude, merge, helix, star, sphere, rod({a,b,r}), wheel({R,w,tyre,spokes,hub,sp,axis,at}), person({at})` (figura umana 1,75 m). Unità mm, Y verso l'alto. Parte: `{id, g, accent, tint, ghost, vol, nobox, hidden}`; `ghost` = solo linee grigie senza occlusione (cilindri trasparenti, figura umana, suolo). `pose` imposta `pos/rot/scl` e `alpha()` per ogni id. `buttons` sceglie le viste tra iso, pianta, fianco, fronte; `view` la vista iniziale; `samples` le pose usate per l'inquadratura.
- Quando applicarlo: veicolo intero (sagoma con persona per la scala, sempre), meccanismi con parti in movimento reale (motore, trasmissione, accensione, sterzo). Restano in 2D gli schemi di principio con flussi o circuiti (bobina, carburatore, circuito di raffreddamento) e le tavole numerate.
- Convenzioni dei veicoli: avanti = +X, suolo y = 0, asse posteriore a x = 0, ruote con asse Z. Dichiarare in didascalia e in "Fonti e lacune" cosa viene da fonte e cosa è stima.
- Presenti: 001 sagoma (Fig. 2), motore (Fig. 3), trasmissione (Fig. 7); 002 sagoma (Fig. 2), tubo incandescente (Fig. 3), sterzo (Fig. 4).

# Atlante dell'Automobile: stato

Fonte di verità: questo repo (branch main). Online: https://atlante-automobile.pages.dev (Cloudflare Pages). Backup: Dropbox /StoriaDellAutomobile (solo file nuovi delle schede).

## Pubblicate
- 001 Benz Patent-Motorwagen (1886), 29 ottobre 2026
- 002 Daimler Motorkutsche (1886), 2 novembre 2026. Aggiunte al registro: wilhelm-maybach, accensione-tubo-incandescente, sterzo-a-ralla, motore-standuhr. Lacune dichiarate: potenza (1,1 PS o kW), velocità (18/23 km/h), raffreddamento, rapporti cinghia, data prima corsa.

## Prossime
Daimler Reitwagen (1885), Panhard & Levassor (1891), Duryea Motor Wagon (1893), Mercedes 35 PS (1901), Oldsmobile Curved Dash (1901), Ford Model T (1908), Lancia Lambda (1922), Citroën Traction Avant (1934), Volkswagen Typ 1 (1938), Austin Mini (1959).

## Procedura
Vedi il documento di progetto claude/stato-atlante.md: nuova scheda = schede/<slug>.html + schede/<slug>.js, commit su main, verifica online con fetch.

## Disegni tecnici 3D (pilota, 6 novembre 2026)
- Modulo `assets/tecnico3d.js` (568 KB, Three.js incluso, file generato). Sorgente in `tools/src/tecnico3d.src.js`. Si rigenera solo se si tocca il sorgente: `cd tools && npm install && npm run build`.
- Una scheda con 3D ha `schede/<slug>.3d.js` (esporta `build(T)` che restituisce `{parts, pose, views, start}`) e un `<div id="..." class="v3d" hidden>` nella figura. Lo script inline carica il modulo con `import()` solo quando la figura sta per entrare in vista e lascia l'SVG 2D come ripiego (nessun WebGL, errore di caricamento). Esempio completo: `schede/benz-patent-motorwagen-1886.html` (Fig. 2) e il suo `.3d.js`.
- Helper del modulo: `cylinder, cone, tube, lathe, box, extrude, merge, helix, star`. Unità in mm, asse Y verso l'alto. Parte: `{id, g, explode, accent, tint, cuts, cutFixed, vol, nobox, hidden}`. `pose(a, H, S)` imposta `pos/rot/scl` e `alpha()` dei pezzi in funzione dell'angolo `a`.
- Il modulo calcola da solo spigoli, contorni, linee nascoste, sezione (piano z = 0), esploso, inquadratura e comandi (Isometrica, Pianta, Fianco, Sezione, Linee nascoste, Esploso).
- Per ora solo la scheda 001 (motore, Fig. 2) usa il 3D. Le altre schede restano in SVG; il 3D è opzionale.


#!/usr/bin/env python3
"""Tavola tecnica laterale (linea su carta) per la Fig. 1 delle schede, piu' foto di riferimento con crediti (SVG statico, scala reale in mm).

Uso:  python3 tools/blueprint.py            -> rigenera la Fig. 1 di tutte le schede elencate in SPECS
      python3 tools/blueprint.py <slug>     -> solo una scheda
      python3 tools/blueprint.py --svg <slug> out.svg   -> scrive solo l'SVG (anteprima)

Convenzioni: mm, avanti = +x (a destra), suolo y = 0, asse posteriore a x = 0, y verso l'alto.
Vista laterale, poco dettagliata: telaio, cassa, ruote, i pezzi della legenda. Le quote tratteggiate
con "≈" sono stime; quelle piene vengono da fonte (stessa fonte della scheda tecnica).
"""
import math, re, sys, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W = 560

# ---------- primitive (coordinate in mm, y su) ----------
def rect(x0, y0, x1, y1, cls='m'): return ('p', f'M{x0} {y0}H{x1}V{y1}H{x0}Z', cls)
def line(x0, y0, x1, y1, cls='m'): return ('p', f'M{x0} {y0}L{x1} {y1}', cls)
def path(d, cls='m'): return ('p', d, cls)
def circ(cx, cy, r, cls='m'): return ('c', cx, cy, r, cls)
def wheel(x, r, tyre, spokes, hub): return ('w', x, r, tyre, spokes, hub)

# ---------- specifiche ----------
def fender(cx, cy, R, a0, a1):
    p0 = (cx + R * math.cos(math.radians(a0)), cy + R * math.sin(math.radians(a0)))
    p1 = (cx + R * math.cos(math.radians(a1)), cy + R * math.sin(math.radians(a1)))
    return f'M{p0[0]:.0f} {p0[1]:.0f}A{R} {R} 0 0 1 {p1[0]:.0f} {p1[1]:.0f}'
def ell(cx, cy, rx, ry): return f'M{cx - rx} {cy}A{rx} {ry} 0 1 0 {cx + rx} {cy}A{rx} {ry} 0 1 0 {cx - rx} {cy}Z'
def hatch(x0, x1, y0, y1, st): return [line(x0, y, x1, y, 't') for y in range(y0, y1, st)]

SPECS = {}

# Mercedes 35 PS (1901). Da fonte (Wikipedia): passo 2.345, altezza 1.300, ruote 910x90 / 1.020x120. Resto ricostruito.
SPECS['mercedes-35-ps-1901'] = dict(
    title='MERCEDES 35 PS · 1901',
    elems=[
        rect(-250, 560, 2436, 690, 'f'),
        path('M-150 690V940Q-150 960 -130 960H1640V690Z', 'f'),
        path('M-110 960V1040Q-110 1050 -100 1050H470Q480 1050 480 1040V960Z', 'f'),
        path('M-150 960V1260Q-150 1290 -120 1290H-95Q-65 1290 -65 1260V960', 'f'),
        path('M800 960V1040Q800 1050 810 1050H1320Q1330 1050 1330 1040V960Z', 'f'),
        path('M740 960V1260Q740 1290 770 1290H795Q825 1290 825 1260V960', 'f'),
        path('M1640 690V1150Q1640 1170 1660 1170H1700V690Z', 'f'),
        path('M1700 690V1060L2430 1010Q2440 1008 2440 996V690Z', 'f'),
        path('M2436 580V1160Q2436 1180 2456 1180H2500Q2520 1180 2520 1160V580Z', 'f'),
        *hatch(2446, 2510, 620, 1160, 36),
        rect(600, 650, 1900, 672, 'f'),
        line(1640, 930, 1250, 1150, 'k'), line(1171, 1022, 1329, 1278, 'm'),
        line(1160, 720, 1260, 1100, 'm'), circ(1260, 1100, 22, 'm'),
        circ(650, 560, 90, 'd'), circ(0, 510, 240, 'd'), line(650, 650, 0, 750, 'd'), line(650, 470, 0, 270, 'd'),
        wheel(0, 510, 70, 12, 40), wheel(2345, 455, 60, 12, 36),
        path(fender(0, 510, 560, 12, 168), 'm'), path(fender(2345, 455, 505, 15, 170), 'm'),
    ],
    dims=[],
    xr=(-560, 2850), top=1330,
    calls=[(1, (2500, 1100), (22, -52)), (2, (2050, 1040), (0, -58)), (3, (1100, 620), (0, 56)), (4, (1450, 1040), (-10, -72)),
           (5, (1210, 900), (-56, -56)), (6, (330, 560), (0, 62)), (7, (200, 1050), (0, -72))],
    note='Profilo ricostruito',
    cap='Disegno tecnico in scala, vista laterale, anteriore a destra. Da fonte (Wikipedia): passo 2.345 mm, altezza 1.300 mm, diametri delle ruote 910 e 1.020 mm. Forma di cassa, cofano, parafanghi, sedili e piantone ricostruita, indicativa e non rilevata sull\'esemplare; stessi dati della sagoma 3D della Fig. 2.',
    gap='Il disegno della Fig. 1 usa passo, altezza e diametri delle ruote di fonte; la forma di cassa, cofano, parafanghi, sedili, piantone e cambio è una ricostruzione, senza rilievo o tavola di riferimento riletti durante la sessione. La lunghezza di 2.766 mm riportata da Wikipedia non è disegnata come quota: con passo di 2.345 mm e ruote da 910 e 1.020 mm l\'ingombro minimo supera i 3.300 mm, e la divergenza non è risolta (si può trattare di una misura del solo telaio con radiatore).',
)

# Benz Patent-Motorwagen (1886). Da fonte: passo 1.450 (o 1.575), ruote posteriori 1.260 mm. Resto stimato.
SPECS['benz-patent-motorwagen-1886'] = dict(
    title='BENZ PATENT-MOTORWAGEN · 1886',
    elems=[
        path('M-380 720H1300L1420 860', 'k'), path('M-380 650H1120L1300 720', 'm'), line(-380, 640, -380, 730, 'm'), line(300, 650, 300, 725, 'm'),
        path('M-260 780H380V850Q380 870 360 870H-240Q-260 870 -260 850Z', 'f'),
        path('M-270 860Q-310 1020 -260 1200L-215 1200Q-250 1020 -225 860', 'f'),
        rect(-300, 543, 180, 577, 'f'), rect(-450, 512, -200, 616, 'f'), rect(-200, 600, -20, 770, 'f'),
        rect(-520, 630, -330, 790, 'f'),
        circ(-60, 560, 60, 'd'), line(-60, 620, 0, 700, 'd'),
        path('M1450 360L1470 900', 'k'), path('M1470 900L1420 1130', 'k'), path('M1420 1130H1190', 'k'), circ(1180, 1130, 14, 'm'),
        wheel(0, 630, 22, 20, 30), wheel(1450, 360, 18, 16, 24),
    ],
    dims=[],
    xr=(-630, 1810), top=1240,
    calls=[(1, (-120, 560), (-34, 74)), (2, (-400, 564), (-50, 62)), (3, (-430, 790), (-30, -60)), (4, (1445, 1000), (40, -34)),
           (5, (1704, 106), (38, 34)), (6, (-445, 185), (-34, 36)), (7, (10, 600), (64, 84)), (8, (60, 870), (0, -80))],
    note='Profilo ricostruito',
    cap='Disegno tecnico in scala, vista laterale, anteriore a destra. Da fonte (Wikipedia): passo 1.450 mm (la tabella dei modelli 2 e 3 riporta 1.575 mm) e ruote posteriori da 1.260 mm. Ruota anteriore, telaio, sedile, motore e serbatoio stimati: profilo indicativo, non un rilievo.',
    gap='Il disegno della Fig. 1 usa il passo (1.450 mm, con la divergenza già indicata) e il diametro delle ruote posteriori; ruota anteriore, telaio, sedile, volano, cilindro, serbatoio e manubrio sono ricostruiti. La lunghezza di 2.700 mm riportata dalla fonte non è rispettata dal profilo disegnato.',
)

# Daimler Motorkutsche (1886). Da fonte: passo 1.300. Resto stimato.
SPECS['daimler-motorkutsche-1886'] = dict(
    title='DAIMLER MOTORKUTSCHE · 1886',
    elems=[
        rect(-750, 765, 1050, 815, 'f'),
        path('M-750 815V1060Q-750 1090 -720 1090H-320C-150 1090 -50 1000 120 1000H640C830 1000 920 1150 1050 1150V815Z', 'f'),
        path('M-710 1090V1215H-670V1090', 'f'), path('M690 1030V1215H730V1045', 'f'),
        rect(-220, 815, 60, 1005, 'd'),
        rect(-130, 1085, -30, 1385, 'f'), circ(-80, 1405, 20, 'm'),
        line(1300, 420, 1300, 765, 'm'), rect(1230, 745, 1370, 765, 'f'),
        path('M900 1010L800 1150H620', 'm'),
        wheel(0, 520, 24, 14, 30), wheel(1300, 420, 22, 12, 26),
    ],
    dims=[],
    xr=(-750, 1720), top=1425,
    calls=[(1, (-80, 1250), (-62, -30)), (2, (-80, 1425), (44, -30)), (3, (-130, 860), (-150, -6)), (4, (1300, 650), (50, -40)),
           (5, (1597, 717), (34, -30)), (6, (400, 1000), (0, -70))],
    note='Profilo ricostruito',
    cap='Disegno tecnico in scala, vista laterale, anteriore a destra. Da fonte (Wikipedia): passo 1.300 mm. Diametri delle ruote, cassa, sedili e posizione del motore stimati; il tratteggio indica le parti coperte dalla fiancata. Profilo indicativo, non un rilievo.',
    gap='Il disegno della Fig. 1 usa soltanto il passo di 1.300 mm; ruote, cassa, sedili, motore e volano sono ricostruiti. Lunghezza (2.530 mm) e larghezza (1.475 mm) di fonte non sono rispettate dal profilo disegnato.',
)

# Daimler Reitwagen (1885). Da fonte: passo 1.030, ruote 600 mm (letto come diametro), altezza 1.260.
SPECS['daimler-reitwagen-1885'] = dict(
    title='DAIMLER REITWAGEN · 1885',
    elems=[
        rect(-200, 380, 1050, 440, 'f'),
        line(1030, 300, 1030, 1258, 'k'), line(1030, 300, 1030, 760, 'm'), line(990, 1240, 1070, 1240, 'k'),
        line(180, 440, 235, 870, 'm'), path('M150 885Q300 850 450 890L440 918Q300 885 160 918Z', 'f'),
        circ(330, 440, 150, 'm'), circ(330, 440, 60, 'd'), circ(150, 470, 110, 'd'),
        line(330, 500, 150, 505, 'd'), line(330, 380, 150, 435, 'd'),
        rect(296, 555, 364, 815, 'f'), rect(292, 815, 368, 831, 'm'), rect(282, 480, 378, 570, 'f'),
        line(440, 740, 440, 570, 't'), circ(406, 780, 10, 'm'),
        wheel(0, 300, 16, 12, 23), wheel(1030, 300, 16, 12, 23), wheel(0, 95, 9, 8, 8),
    ],
    dims=[],
    xr=(-300, 1330), top=1258,
    calls=[(1, (330, 700), (-60, -60)), (2, (406, 780), (56, -50)), (3, (150, 470), (-70, 54)), (4, (700, 410), (0, 60)),
           (5, (1242, 88), (36, 40)), (6, (-67, 28), (-36, 40))],
    note='Profilo ricostruito',
    cap='Disegno tecnico in scala, vista laterale, anteriore a destra. Da fonte (motorradundreisen.de): passo 1.030 mm, ruote da 600 mm (lette come diametro), altezza 1.260 mm. Telaio, sella, motore, volani, cinghia e ruote stabilizzatrici stimati; l\'ingombro in lunghezza (2.500 mm) non è riprodotto. Profilo indicativo, non un rilievo.',
    gap='Il disegno della Fig. 1 usa passo, diametro delle ruote e altezza di fonte; telaio, sella, motore, volani, cinghia e stabilizzatori sono ricostruiti. La lunghezza di 2.500 mm della stessa scheda non è rispettata, perché il profilo disegnato è più corto.',
)

# Duryea Motor Wagon (1893). Da fonte: ruote 54 pollici (asse non indicato). Passo e resto stimati.
SPECS['duryea-motor-wagon-1893'] = dict(
    title='DURYEA MOTOR WAGON · 1893',
    elems=[
        rect(-450, 842, 2014, 878, 'f'), rect(-300, 875, 1250, 905, 'f'),
        rect(0, 708, 340, 832, 'f'), rect(370, 640, 590, 900, 'f'), circ(480, 770, 250, 't'),
        path('M-300 905V1050Q-300 1070 -280 1070H540Q560 1070 560 1050V905Z', 'f'),
        path('M-290 1070V1380Q-290 1405 -265 1405H-215Q-190 1405 -190 1380V1070', 'f'),
        path('M1250 905Q1250 1050 1100 1110', 'm'),
        path('M1700 900L1300 1250', 'k'), circ(1300, 1250, 14, 'm'),
        wheel(0, 686, 18, 16, 25), wheel(1700, 500, 18, 14, 23),
    ],
    dims=[],
    xr=(-686, 2200), top=1405,
    calls=[(1, (170, 770), (-20, -64)), (2, (20, 770), (-44, 60)), (3, (480, 700), (50, 64)), (4, (-485, 485), (-40, -20)),
           (5, (1000, 878), (0, 62)), (6, (150, 1070), (0, -70))],
    note='Profilo ricostruito',
    cap='Disegno tecnico in scala, vista laterale, anteriore a destra. Da fonte: ruote da 54 pollici (circa 1.370 mm; Wikipedia, senza dire se diametro né quale asse). Passo, ruote anteriori, telaio, pianale, sedile e motore stimati. Profilo indicativo, non un rilievo; trasmissione e sterzo non sono rappresentati.',
    gap='Il disegno della Fig. 1 usa soltanto il diametro delle ruote posteriori (54 pollici, letto come diametro); passo, ruote anteriori, telaio, pianale, sedile, motore e volano sono ricostruiti. Gli ingombri complessivi della scheda dell\'oggetto (81 × 64 × 97 pollici) non sono disegnati, perché l\'assegnazione degli assi non è indicata dalla fonte.',
)

# Panhard & Levassor (1891). Nessuna misura da fonte: tutto stimato.
SPECS['panhard-levassor-1891'] = dict(
    title='PANHARD & LEVASSOR · 1891',
    elems=[
        rect(-250, 578, 1800, 622, 'f'),
        path('M-150 700V860Q-150 880 -130 880H580Q600 880 600 860V700Z', 'f'),
        path('M-170 880V1190Q-170 1215 -145 1215H-110Q-85 1215 -85 1190V880', 'f'),
        rect(620, 600, 980, 840, 'f'), rect(1100, 600, 1560, 800, 'f'), rect(1268, 800, 1392, 1015, 'f'),
        path('M1670 630V1030Q1670 1050 1690 1050H1710Q1730 1050 1730 1030V630Z', 'f'),
        *hatch(1676, 1724, 670, 1030, 40),
        circ(620, 590, 55, 'd'), circ(0, 500, 150, 'd'), line(620, 645, 0, 650, 'd'), line(620, 535, 0, 350, 'd'),
        line(1380, 640, 1000, 1110, 'k'), line(975, 1110, 1045, 1110, 'k'),
        wheel(0, 500, 22, 14, 28), wheel(1500, 450, 22, 12, 26),
    ],
    dims=[],
    xr=(-500, 1950), top=1215,
    calls=[(1, (1330, 1015), (-10, -54)), (2, (1700, 840), (30, -64)), (3, (900, 840), (74, -28)), (4, (300, 600), (0, 66)),
           (5, (-354, 354), (-34, -24)), (6, (1190, 875), (-34, -50))],
    note='Proporzioni stimate',
    cap='Disegno tecnico in scala indicativa, vista laterale, anteriore a destra. Nessuna misura risulta nelle fonti rilette: passo, diametri delle ruote, telaio e disposizione dei gruppi stimati. Profilo indicativo, non un rilievo.',
    gap='Il disegno della Fig. 1 non poggia su misure di fonte: passo, diametri delle ruote, telaio, sedile, motore, cambio, radiatore, catena e timone sono stime, in scala solo rispetto a se stesse.',
)

BY2='https://creativecommons.org/licenses/by/2.0/'; BYSA4='https://creativecommons.org/licenses/by-sa/4.0/'; CC0='https://creativecommons.org/publicdomain/zero/1.0/'
C='https://commons.wikimedia.org/wiki/File:'
PHOTOS = {
 'benz-patent-motorwagen-1886': dict(
   src='https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/1886_Benz_Patent_Motorwagen_(29744182207).jpg/960px-1886_Benz_Patent_Motorwagen_(29744182207).jpg',
   page=C+'1886_Benz_Patent_Motorwagen_(29744182207).jpg', author='Sicnag', lic='CC BY 2.0', licurl=BY2,
   alt='Replica del Benz Patent-Motorwagen del 1886, vista di tre quarti',
   cap='Replica del Patent-Motorwagen del 1886, una delle 25 realizzate secondo la descrizione del file, fotografata al Petersen Museum di Los Angeles (2 settembre 2018). Non è l\'originale.'),
 'daimler-reitwagen-1885': dict(
   src='https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/1885_Daimler_Reitwagen_-_Riding_car_0.5hp_pic1.JPG/960px-1885_Daimler_Reitwagen_-_Riding_car_0.5hp_pic1.JPG',
   page=C+'1885_Daimler_Reitwagen_-_Riding_car_0.5hp_pic1.JPG', author='AlfvanBeem', lic='CC0 1.0', licurl=CC0,
   alt='Replica del Daimler Reitwagen del 1885 in un museo',
   cap='Replica del Reitwagen del 1885 all\'Auto & Technik Museum di Sinsheim (7 aprile 2012). L\'originale è andato distrutto nel 1903: la foto mostra una ricostruzione.'),
 'daimler-motorkutsche-1886': dict(
   src='https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Verkehrsmuseum_Dresden_-_Stra%C3%9Fenverkehr_-_Daimler_Motorkutsche_1886_-_DSC4800.jpg/960px-Verkehrsmuseum_Dresden_-_Stra%C3%9Fenverkehr_-_Daimler_Motorkutsche_1886_-_DSC4800.jpg',
   page=C+'Verkehrsmuseum_Dresden_-_Stra%C3%9Fenverkehr_-_Daimler_Motorkutsche_1886_-_DSC4800.jpg', author='Wuselig', lic='CC BY-SA 4.0', licurl=BYSA4,
   alt='Replica della Daimler Motorkutsche del 1886 al Verkehrsmuseum di Dresda',
   cap='Replica della Motorkutsche del 1886 al Verkehrsmuseum di Dresda (6 marzo 2016). Non è l\'esemplare originale.'),
 'panhard-levassor-1891': dict(
   src='https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/1891_Panhard_ET_Levassor_P2C_(2013_RACV_MotorClassica)_(10491423125).jpg/960px-1891_Panhard_ET_Levassor_P2C_(2013_RACV_MotorClassica)_(10491423125).jpg',
   page=C+'1891_Panhard_ET_Levassor_P2C_(2013_RACV_MotorClassica)_(10491423125).jpg', author='Chris Phutully', lic='CC BY 2.0', licurl=BY2,
   alt='Panhard et Levassor P2C del 1891, phaeton a due posti',
   cap='Panhard et Levassor P2C del 1891 (telaio tipo A, phaeton a due posti), al RACV MotorClassica del 2013. Secondo la descrizione del file fu modernizzata nel 1902 e riportata alla configurazione originale a metà anni Ottanta; l\'autore ha elaborato l\'immagine con Photomatix.'),
 'mercedes-35-ps-1901': dict(
   src='https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Mercedes_35hp_by_Wilhelm_Maybach.jpg/960px-Mercedes_35hp_by_Wilhelm_Maybach.jpg',
   page=C+'Mercedes_35hp_by_Wilhelm_Maybach.jpg', author='Mercedes-Benz-Werkphoto (1901)', lic='pubblico dominio', licurl='',
   alt='Fotografia di fabbrica del 1901 della Mercedes 35 hp',
   cap='Mercedes 35 hp, fotografia di fabbrica del 1901. Commons la indica come pubblico dominio e rimanda a un sito non ufficiale come fonte.'),
 'duryea-motor-wagon-1893': dict(
   src='https://upload.wikimedia.org/wikipedia/commons/b/ba/The_Frank_Duryea_first_prize_motor_wagon_(the_%27Chicago_Times-Herald_race%27,_november_28,_1895).jpg',
   page=C+"The_Frank_Duryea_first_prize_motor_wagon_(the_'Chicago_Times-Herald_race',_november_28,_1895).jpg", author='Scientific American, 7 dicembre 1895, pp. 357-358', lic='pubblico dominio', licurl='',
   alt='La Duryea vincitrice della corsa Chicago Times-Herald del 28 novembre 1895',
   cap='Non è il Motor Wagon del 1893 della scheda, ma la Duryea vincitrice della corsa Chicago Times-Herald del 28 novembre 1895: riferimento d\'insieme per l\'aspetto di una Duryea, senza valore di rilievo del modello del 1893. Non è stata trovata su Commons una foto libera dell\'esemplare del 1893.'),
}


# ---------- rendering: stesso aspetto del disegno originale (linee su carta, callout in accento) ----------
def f(v): return ('%.2f' % v).rstrip('0').rstrip('.')

def wheel_svg(w, s, ox, oy):
    _, x, r, t, n, hub = w
    cx, cy = ox + s * x, oy - s * r
    R = s * r; Ri = s * (r - t); Rh = s * hub
    out = [f'<circle class="ln" cx="{f(cx)}" cy="{f(cy)}" r="{f(R)}"/>',
           f'<circle class="ln th" cx="{f(cx)}" cy="{f(cy)}" r="{f(Ri)}"/>',
           f'<circle class="ln" cx="{f(cx)}" cy="{f(cy)}" r="{f(Rh)}"/>']
    for i in range(n):
        a = 2 * math.pi * i / n + math.pi / n
        out.append(f'<path class="ln th" d="M{f(cx + Rh * math.cos(a))} {f(cy + Rh * math.sin(a))}L{f(cx + Ri * math.cos(a))} {f(cy + Ri * math.sin(a))}"/>')
    return ''.join(out)

CLS = {'m': 'ln', 'f': 'ln fp', 'k': 'ln k', 't': 'ln th', 'd': 'ln d'}

def render(spec):
    x0, x1 = spec['xr']
    s = 440.0 / (x1 - x0)
    ox = (W - s * (x1 - x0)) / 2 - s * x0
    oy = 78 + s * spec['top']
    H = int(round(oy + 56))
    parts = [f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="Disegno tecnico in vista laterale: {spec["title"].title()}, con elementi numerati">']
    parts.append(f'<line x1="{f(ox + s * (x0 - 60))}" y1="{f(oy)}" x2="{f(ox + s * (x1 + 60))}" y2="{f(oy)}" style="stroke:var(--rule);stroke-width:2"/>')
    for e in spec['elems']:
        k = e[0]
        if k == 'w':
            parts.append(wheel_svg(e, s, ox, oy))
        elif k == 'c':
            _, cx, cy, r, cls = e
            parts.append(f'<circle class="{CLS[cls]}" cx="{f(ox + s * cx)}" cy="{f(oy - s * cy)}" r="{f(s * r)}"/>')
        else:
            _, d, cls = e
            parts.append(f'<path class="{CLS[cls]}" transform="matrix({f(s)} 0 0 {f(-s)} {f(ox)} {f(oy)})" d="{d}" vector-effect="non-scaling-stroke"/>')
    for n, (x, y), (dx, dy) in spec['calls']:
        tx, ty = ox + s * x, oy - s * y
        mx, my = tx + dx, ty + dy
        L = math.hypot(dx, dy) or 1
        ex, ey = mx - dx / L * 10, my - dy / L * 10
        parts.append(f'<g><path class="lead2" d="M{f(tx)} {f(ty)}L{f(ex)} {f(ey)}"/><circle class="co" cx="{f(mx)}" cy="{f(my)}" r="10"/><text class="cot" x="{f(mx)}" y="{f(my)}">{n}</text></g>')
    parts.append('</svg>')
    return ''.join(parts)

def photo_html(slug):
    ph = PHOTOS.get(slug)
    if not ph:
        return ''
    lic = f'<a href="{ph["licurl"]}" rel="license noopener">{ph["lic"]}</a>' if ph['licurl'] else ph['lic']
    return ('<figure class="fig photo">'
            f'<img src="{ph["src"]}" alt="{ph["alt"]}" loading="lazy" decoding="async" onerror="this.closest(\'figure\').hidden=true">'
            f'<figcaption><b>Foto</b>{ph["cap"]} Autore: {ph["author"]}; licenza: {lic}; <a href="{ph["page"]}" rel="noopener">scheda del file su Wikimedia Commons</a>.</figcaption></figure>')

def patch(slug):
    spec = SPECS[slug]
    p = os.path.join(ROOT, 'schede', slug + '.html')
    h = open(p, encoding='utf8').read()
    h = re.sub(r'<figure class="fig photo">.*?</figure>\s*', '', h, flags=re.S)
    svg = render(spec)
    h2, n = re.subn(r'(<figure class="fig">\s*)<svg.*?</svg>', lambda m: photo_html(slug) + '\n  ' + m.group(1) + svg, h, count=1, flags=re.S)
    assert n == 1, slug
    h2, n = re.subn(r'(<figure class="fig">.*?<figcaption><b>Fig\. 1</b>).*?(</figcaption>)', lambda m: m.group(1) + spec['cap'] + m.group(2), h2, count=1, flags=re.S)
    assert n == 1, slug
    h2 = h2.replace('Blueprint della Fig. 1:', 'Tavola della Fig. 1:')
    marker = 'Tavola della Fig. 1:'
    if marker not in h2:
        h2, n = re.subn(r'(<p class="note">Lacune e divergenze\..*?)( Se il 3D non si carica)', lambda m: m.group(1) + ' ' + marker + ' ' + spec['gap'].replace('La tavola della Fig. 1 ', '', 1) + m.group(2), h2, count=1, flags=re.S)
        assert n == 1, slug
    open(p, 'w', encoding='utf8').write(h2)
    print('ok', slug)

if __name__ == '__main__':
    a = sys.argv[1:]
    if a and a[0] == '--svg':
        open(a[2], 'w', encoding='utf8').write(render(SPECS[a[1]]).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ', 1)); sys.exit()
    for slug in (a or SPECS):
        patch(slug)

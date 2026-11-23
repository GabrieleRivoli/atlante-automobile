#!/usr/bin/env python3
"""Blueprint laterale per la Fig. 1 delle schede (SVG statico, scala reale in mm).

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
SPECS = {}

# Mercedes 35 PS (1901). Da fonte (Wikipedia): passo 2.345, lunghezza 2.766, altezza 1.300, ruote 910x90 / 1.020x120.
SPECS['mercedes-35-ps-1901'] = dict(
    title='MERCEDES 35 PS · 1901',
    elems=[
        wheel(0, 510, 70, 12, 40), wheel(2345, 455, 60, 12, 36),
        rect(-250, 560, 2436, 680, 'f'),
        path('M-25 680V930Q-25 940 -15 940H1615Q1625 940 1625 930V680', 'f'),
        path('M-60 940V1050Q-60 1060 -50 1060H490Q500 1060 500 1050V940Z', 'f'), path('M-140 940V1280Q-140 1300 -120 1300H-70Q-50 1300 -50 1280V940Z', 'f'),
        path('M790 940V1050Q790 1060 800 1060H1300Q1310 1060 1310 1050V940Z', 'f'), path('M725 940V1280Q725 1300 745 1300H795Q815 1300 815 1280V940Z', 'f'),
        rect(1650, 680, 1680, 1180, 'm'),
        path('M1680 680V1050Q1680 1060 1690 1060H2430Q2440 1060 2440 1050V680', 'f'),
        rect(2436, 580, 2516, 1180, 'f'),
        *[line(2446, y, 2506, y, 't') for y in range(620, 1160, 40)],
        line(1600, 920, 1260, 1140, 'k'), line(1190, 1050, 1330, 1230, 'm'),
        line(1150, 740, 1250, 1150, 'm'), circ(1250, 1150, 24, 'm'),
        circ(650, 560, 90, 'd'), circ(0, 510, 240, 'd'),
        line(650, 650, 0, 750, 'd'), line(650, 470, 0, 270, 'd'),
        line(0, 510, 0, 510, 'm'), line(2345, 455, 2345, 455, 'm'),
    ],
    dims=[('h', 0, 2345, 1, '2.345', False), ('v', -140, 1300, 'l', '1.300', False)],
    xr=(-510, 2800), top=1300,
    calls=[(1, (2516, 1120), (14, -46)), (2, (2060, 1060), (0, -54)), (3, (1000, 620), (0, 48)), (4, (1430, 1030), (-8, -64)),
           (5, (1190, 960), (-50, -60)), (6, (330, 570), (0, 56)), (7, (200, 1060), (0, -70))],
    note='Profilo ricostruito',
    cap='Blueprint in scala, vista laterale, anteriore a destra. Quote da fonte (Wikipedia): passo 2.345 mm, altezza 1.300 mm, diametri delle ruote 910 e 1.020 mm. Profilo di cassa, cofano e sedili ricostruito: indicativo, non è un rilievo dell\'esemplare. Stessi dati della sagoma 3D della Fig. 2.',
    gap='Il blueprint della Fig. 1 usa passo, altezza e diametri delle ruote di fonte; la forma di cassa, cofano, sedili, piantone e cambio è una ricostruzione, senza rilievo o tavola di riferimento riletti durante la sessione. La lunghezza di 2.766 mm riportata da Wikipedia non è quotata: con passo di 2.345 mm e ruote da 910 e 1.020 mm l\'ingombro minimo supera i 3.300 mm, e la divergenza non è risolta (si può trattare di una misura del solo telaio con radiatore).',
)

# Benz Patent-Motorwagen (1886). Da fonte: passo 1.450 (o 1.575), ruote posteriori 1.260 mm. Resto stimato.
SPECS['benz-patent-motorwagen-1886'] = dict(
    title='BENZ PATENT-MOTORWAGEN · 1886',
    elems=[
        wheel(0, 630, 22, 20, 30), wheel(1450, 360, 18, 16, 24),
        path('M-380 720H1300L1420 860', 'k'), line(-380, 700, -380, 740, 'm'), line(300, 700, 300, 740, 'm'),
        path('M-260 775H380V865H-260Z', 'f'), path('M-275 850V1230H-225V850', 'm'),
        rect(-300, 543, 180, 577, 'f'), rect(-450, 504, -120, 616, 'f'), rect(-205, 625, -15, 775, 'f'),
        rect(-630, 630, -410, 770, 'f'),
        path('M1450 360L1470 900L1420 1130H980', 'k'), circ(960, 1130, 24, 'm'),
        circ(-60, 560, 60, 'd'), line(-60, 620, 0, 700, 'd'),
    ],
    dims=[('h', 0, 1450, 1, '1.450', False)],
    xr=(-630, 1810), top=1230,
    calls=[(1, (-300, 560), (-10, 64)), (2, (-285, 560), (-6, -64)), (3, (-520, 700), (-4, -70)), (4, (1445, 1000), (30, -34)),
           (5, (1704, 106), (38, 34)), (6, (-445, 185), (-34, 36)), (7, (-60, 560), (60, 64)), (8, (60, 865), (0, -80))],
    note='Profilo ricostruito',
    cap='Blueprint in scala, vista laterale, anteriore a destra. Quote da fonte (Wikipedia): passo 1.450 mm (la tabella dei modelli 2 e 3 riporta 1.575 mm) e ruote posteriori da 1.260 mm. Ruota anteriore, telaio, sedile, motore e serbatoio sono stimati: profilo indicativo, non un rilievo.',
    gap='Il blueprint della Fig. 1 usa il passo (1.450 mm, con la divergenza già indicata) e il diametro delle ruote posteriori; ruota anteriore, telaio, sedile, volano, cilindro e serbatoio sono ricostruiti. La lunghezza di 2.700 mm riportata dalla fonte non è quotata nel disegno, perché il profilo ricostruito non la rispetta.',
)

# Daimler Motorkutsche (1886). Da fonte: passo 1.300. Resto stimato.
SPECS['daimler-motorkutsche-1886'] = dict(
    title='DAIMLER MOTORKUTSCHE · 1886',
    elems=[
        wheel(0, 520, 24, 14, 30), wheel(1300, 420, 22, 12, 26),
        rect(-750, 765, 1050, 815, 'f'), path('M-750 815V1115H1050V815', 'f'),
        path('M-710 930V850H-290V930', 'm'), path('M-710 1215V885', 'm'), path('M-670 1215V885', 'm'), line(-710, 1215, -670, 1215, 'm'),
        path('M310 930V850H730V930', 'm'), path('M690 1215V885', 'm'), path('M730 1215V885', 'm'), line(690, 1215, 730, 1215, 'm'),
        rect(-220, 815, 60, 1005, 'd'),
        rect(-130, 1115, -30, 1385, 'f'), circ(-80, 1405, 20, 'm'),
        line(1300, 420, 1300, 765, 'm'),
        path('M1080 815L940 1150H740', 'm'),
    ],
    dims=[('h', 0, 1300, 1, '1.300', False)],
    xr=(-750, 1720), top=1425,
    calls=[(1, (-80, 1300), (-60, -30)), (2, (-80, 1425), (40, -34)), (3, (-80, 900), (0, 60)), (4, (1300, 650), (46, -40)),
           (5, (1300, 840), (0, 0)), (6, (400, 1115), (0, -60))],
    note='Profilo ricostruito',
    cap='Blueprint in scala, vista laterale, anteriore a destra. Quota da fonte (Wikipedia): passo 1.300 mm. Diametri delle ruote, cassa, sedili e posizione del motore sono stimati; il tratteggio indica le parti coperte dalla fiancata. Profilo indicativo, non un rilievo.',
    gap='Il blueprint della Fig. 1 usa soltanto il passo di 1.300 mm; ruote, cassa, sedili, motore e volano sono ricostruiti. Lunghezza (2.530 mm) e larghezza (1.475 mm) di fonte non sono quotate nel disegno, perché il profilo ricostruito non le rispetta.',
)

# Daimler Reitwagen (1885). Da fonte: passo 1.030, ruote 600 mm (letto come diametro), altezza 1.260.
SPECS['daimler-reitwagen-1885'] = dict(
    title='DAIMLER REITWAGEN · 1885',
    elems=[
        wheel(0, 300, 16, 12, 23), wheel(1030, 300, 16, 12, 23), wheel(0, 95, 9, 8, 8),
        rect(-250, 365, 1250, 435, 'f'),
        line(1030, 300, 1030, 1258, 'k'), line(1030, 300, 1030, 760, 'm'),
        line(1000, 1240, 1060, 1240, 'k'),
        line(180, 435, 230, 840, 'm'), path('M160 852H440V908H160Z', 'f'),
        circ(330, 440, 150, 'm'), circ(330, 440, 60, 'd'), circ(150, 470, 110, 'd'),
        line(330, 500, 150, 505, 'd'), line(330, 380, 150, 435, 'd'),
        rect(296, 555, 364, 815, 'f'), rect(292, 815, 368, 831, 'm'), rect(282, 480, 378, 570, 'f'),
        line(440, 740, 440, 570, 't'), circ(406, 780, 10, 'm'),
    ],
    dims=[('h', 0, 1030, 1, '1.030', False), ('v', 1030, 1258, 'r', '1.260', False)],
    xr=(-250, 1330), top=1258,
    calls=[(1, (330, 700), (-60, -60)), (2, (406, 780), (56, -50)), (3, (150, 470), (-70, 54)), (4, (700, 400), (0, 60)),
           (5, (1242, 88), (36, 40)), (6, (-67, 28), (-36, 40))],
    note='Profilo ricostruito',
    cap='Blueprint in scala, vista laterale, anteriore a destra. Quote da fonte (motorradundreisen.de): passo 1.030 mm, ruote da 600 mm (lette come diametro), altezza 1.260 mm. Telaio, sella, motore, volani, cinghia e ruote stabilizzatrici sono stimati; l\'ingombro in lunghezza (2.500 mm) non è riprodotto. Profilo indicativo, non un rilievo.',
    gap='Il blueprint della Fig. 1 usa passo, diametro delle ruote e altezza di fonte; telaio, sella, motore, volani, cinghia e stabilizzatori sono ricostruiti. La lunghezza di 2.500 mm della stessa scheda non è quotata, perché il profilo disegnato è più corto.',
)

# Duryea Motor Wagon (1893). Da fonte: ruote 54 pollici (asse non indicato). Passo e resto stimati.
SPECS['duryea-motor-wagon-1893'] = dict(
    title='DURYEA MOTOR WAGON · 1893',
    elems=[
        wheel(0, 686, 18, 16, 25), wheel(1700, 500, 18, 14, 23),
        rect(-450, 842, 2014, 878, 'f'), rect(-300, 875, 1200, 905, 'f'),
        path('M-200 1045H500V1115H-200Z', 'f'), path('M-210 1075V1405H-170V1075', 'm'),
        rect(0, 708, 340, 832, 'f'), rect(370, 640, 590, 900, 'f'), circ(480, 770, 250, 'd'),
        path('M1700 900L1300 1250', 'k'), circ(1300, 1250, 14, 'm'),
    ],
    dims=[('h', 0, 1700, 1, '≈1.700', True)],
    xr=(-686, 2200), top=1405,
    calls=[(1, (170, 770), (-20, -64)), (2, (20, 770), (-44, 60)), (3, (480, 700), (50, 64)), (4, (-485, 485), (-40, -20)),
           (5, (1000, 878), (0, 62)), (6, (150, 1115), (0, -60))],
    note='Profilo ricostruito',
    cap='Blueprint in scala, vista laterale, anteriore a destra. Da fonte: ruote da 54 pollici (circa 1.370 mm; Wikipedia, senza dire se diametro né quale asse). Passo (≈1.700 mm, quota tratteggiata), ruote anteriori, telaio, pianale, sedile e motore sono stimati. Profilo indicativo, non un rilievo; trasmissione e sterzo non sono rappresentati.',
    gap='Il blueprint della Fig. 1 usa soltanto il diametro delle ruote posteriori (54 pollici, letto come diametro); passo, ruote anteriori, telaio, pianale, sedile, motore e volano sono ricostruiti. Gli ingombri complessivi della scheda dell\'oggetto (81 × 64 × 97 pollici) non sono quotati, perché l\'assegnazione degli assi non è indicata dalla fonte.',
)

# Panhard & Levassor (1891). Nessuna misura da fonte: tutto stimato.
SPECS['panhard-levassor-1891'] = dict(
    title='PANHARD & LEVASSOR · 1891',
    elems=[
        wheel(0, 500, 22, 14, 28), wheel(1500, 450, 22, 12, 26),
        rect(-250, 578, 1800, 622, 'f'),
        path('M-130 850H570V910H-130Z', 'f'), path('M-150 890V1190H-110V890', 'm'),
        rect(620, 600, 980, 840, 'f'), rect(1100, 600, 1560, 800, 'f'),
        rect(1268, 800, 1392, 1015, 'f'),
        rect(1670, 630, 1730, 1050, 'f'),
        *[line(1676, y, 1724, y, 't') for y in range(670, 1040, 40)],
        circ(620, 590, 55, 'd'), circ(0, 500, 150, 'd'), line(620, 645, 0, 650, 'd'), line(620, 535, 0, 350, 'd'),
        line(1500, 560, 450, 1100, 'k'),
    ],
    dims=[('h', 0, 1500, 1, '≈1.500', True)],
    xr=(-500, 1950), top=1190,
    calls=[(1, (1330, 1015), (-10, -54)), (2, (1730, 840), (30, -64)), (3, (900, 840), (40, -50)), (4, (300, 600), (0, 66)),
           (5, (-354, 354), (-34, -24)), (6, (700, 971), (-34, -50))],
    note='Proporzioni stimate',
    cap='Blueprint in scala indicativa, vista laterale, anteriore a destra. Nessuna misura risulta nelle fonti rilette: passo (≈1.500 mm, quota tratteggiata), diametri delle ruote, telaio e disposizione dei gruppi sono stimati. Profilo indicativo, non un rilievo.',
    gap='Il blueprint della Fig. 1 non poggia su misure di fonte: passo, diametri delle ruote, telaio, sedile, motore, cambio, radiatore e catena sono stime, in scala solo rispetto a se stesse.',
)

# ---------- rendering ----------
def f(v): return ('%.2f' % v).rstrip('0').rstrip('.')

def wheel_svg(w, s, ox, oy):
    _, x, r, t, n, hub = w
    cx, cy = ox + s * x, oy - s * r
    R = s * r; Ri = s * (r - t); Rh = s * hub
    out = [f'<circle class="bl" cx="{f(cx)}" cy="{f(cy)}" r="{f(R)}"/>',
           f'<circle class="bl th" cx="{f(cx)}" cy="{f(cy)}" r="{f(Ri)}"/>',
           f'<circle class="bl th" cx="{f(cx)}" cy="{f(cy)}" r="{f(Rh)}"/>']
    for i in range(n):
        a = 2 * math.pi * i / n + math.pi / n
        out.append(f'<path class="bl th" d="M{f(cx + Rh * math.cos(a))} {f(cy + Rh * math.sin(a))}L{f(cx + Ri * math.cos(a))} {f(cy + Ri * math.sin(a))}"/>')
    return ''.join(out)

def render(spec):
    x0, x1 = spec['xr']
    s = 430.0 / (x1 - x0)
    top = spec['top']
    ox = 62 - s * x0 if True else 0
    ox = (W - s * (x1 - x0)) / 2 - s * x0
    ytop_px = 74
    oy = ytop_px + s * top
    H = int(round(oy + 122))
    parts = [f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="Blueprint in vista laterale: {spec["title"].title()}, con elementi numerati">']
    parts.append(f'<rect class="bg" x="0" y="0" width="{W}" height="{H}" rx="10"/>')
    # griglia reale: 100 mm / 500 mm
    gx0 = math.floor((0 - ox) / s / 100) * 100
    gx1 = math.ceil((W - ox) / s / 100) * 100
    gy0 = math.floor((oy - H) / s / 100) * 100
    gy1 = math.ceil((oy - 0) / s / 100) * 100
    g = []
    for gx in range(int(gx0), int(gx1) + 1, 100):
        px = ox + s * gx
        if 0 <= px <= W:
            g.append(f'<path class="{"gj" if gx % 500 == 0 else "gn"}" d="M{f(px)} 0V{H}"/>')
    for gy in range(int(gy0), int(gy1) + 1, 100):
        py = oy - s * gy
        if 0 <= py <= H:
            g.append(f'<path class="{"gj" if gy % 500 == 0 else "gn"}" d="M0 {f(py)}H{W}"/>')
    parts.append('<g>' + ''.join(g) + '</g>')
    # suolo
    parts.append(f'<path class="bl gr" d="M{f(ox + s * (x0 - 120))} {f(oy)}H{f(ox + s * (x1 + 120))}"/>')
    # elementi
    for e in spec['elems']:
        k = e[0]
        if k == 'w':
            parts.append(wheel_svg(e, s, ox, oy))
        elif k == 'c':
            _, cx, cy, r, cls = e
            parts.append(f'<circle class="bl {cls}" cx="{f(ox + s * cx)}" cy="{f(oy - s * cy)}" r="{f(s * r)}"/>')
        else:
            _, d, cls = e
            parts.append(f'<path class="bl {cls}" transform="matrix({f(s)} 0 0 {f(-s)} {f(ox)} {f(oy)})" d="{d}"/>')
    # quote
    for d in spec['dims']:
        est = d[-1]; cl = 'dq' + (' de' if est else '')
        if d[0] == 'h':
            _, xa, xb, lev, txt, _e = d
            yy = oy + 22 + 24 * lev
            pa, pb = ox + s * xa, ox + s * xb
            parts.append(f'<path class="{cl}" d="M{f(pa)} {f(oy)}V{f(yy + 5)}M{f(pb)} {f(oy)}V{f(yy + 5)}M{f(pa)} {f(yy)}H{f(pb)}"/>')
            parts.append(f'<path class="da" d="M{f(pa)} {f(yy)}l7 -3v6zM{f(pb)} {f(yy)}l-7 -3v6z"/>')
            parts.append(f'<text class="bt" x="{f((pa + pb) / 2)}" y="{f(yy - 5)}" text-anchor="middle">{txt}</text>')
        else:
            _, xa, ytp, side, txt, _e = d
            pxa = ox + s * xa
            pxx = ox + s * x0 - 22 if side == 'l' else ox + s * x1 + 22
            ya, yb = oy, oy - s * ytp
            parts.append(f'<path class="{cl}" d="M{f(pxa)} {f(yb)}H{f(pxx + (-5 if side == "l" else 5))}M{f(pxx)} {f(ya)}V{f(yb)}"/>')
            parts.append(f'<path class="da" d="M{f(pxx)} {f(yb)}l-3 7h6zM{f(pxx)} {f(ya)}l-3 -7h6z"/>')
            anchor = 'end' if side == 'l' else 'start'
            tx = pxx - 6 if side == 'l' else pxx + 6
            parts.append(f'<text class="bt" x="{f(tx)}" y="{f((ya + yb) / 2 + 3)}" text-anchor="{anchor}">{txt}</text>')
    # callout numerati
    for n, (x, y), (dx, dy) in spec['calls']:
        tx, ty = ox + s * x, oy - s * y
        mx, my = tx + dx, ty + dy
        L = math.hypot(dx, dy) or 1
        ex, ey = mx - dx / L * 10, my - dy / L * 10
        if dx or dy:
            parts.append(f'<path class="ld" d="M{f(tx)} {f(ty)}L{f(ex)} {f(ey)}"/><circle class="ldot" cx="{f(tx)}" cy="{f(ty)}" r="2.2"/>')
        parts.append(f'<circle class="cb" cx="{f(mx)}" cy="{f(my)}" r="10"/><text class="cn" x="{f(mx)}" y="{f(my + 0.5)}" text-anchor="middle" dominant-baseline="central">{n}</text>')
    # cartiglio
    parts.append(f'<path class="gj tb" d="M16 {H - 48}H{W - 16}"/>')
    parts.append(f'<text class="bt tt" x="18" y="{H - 30}">{spec["title"]}</text>')
    parts.append(f'<text class="bt" x="{W - 18}" y="{H - 30}" text-anchor="end">VISTA LATERALE</text>')
    parts.append(f'<text class="bt" x="18" y="{H - 13}">{spec["note"].upper()}</text>')
    parts.append(f'<text class="bt" x="{W - 18}" y="{H - 13}" text-anchor="end">QUADRO = 100 MM</text>')
    parts.append('</svg>')
    return ''.join(parts)

def patch(slug):
    spec = SPECS[slug]
    p = os.path.join(ROOT, 'schede', slug + '.html')
    h = open(p, encoding='utf8').read()
    svg = render(spec)
    h2, n = re.subn(r'(<figure class="fig">\s*)<svg.*?</svg>', lambda m: m.group(1) + svg, h, count=1, flags=re.S)
    assert n == 1, slug
    h2, n = re.subn(r'(<figure class="fig">.*?<figcaption><b>Fig\. 1</b>).*?(</figcaption>)', lambda m: m.group(1) + spec['cap'] + m.group(2), h2, count=1, flags=re.S)
    assert n == 1, slug
    marker = 'Blueprint della Fig. 1:'
    if marker not in h2:
        h2, n = re.subn(r'(<p class="note">Lacune e divergenze\..*?)( Se il 3D non si carica)', lambda m: m.group(1) + ' ' + marker + ' ' + spec['gap'].replace('Il blueprint della Fig. 1 ', '', 1) + m.group(2), h2, count=1, flags=re.S)
        assert n == 1, slug
    open(p, 'w', encoding='utf8').write(h2)
    print('ok', slug)

if __name__ == '__main__':
    a = sys.argv[1:]
    if a and a[0] == '--svg':
        open(a[2], 'w', encoding='utf8').write(render(SPECS[a[1]]).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ', 1)); sys.exit()
    for slug in (a or SPECS):
        patch(slug)

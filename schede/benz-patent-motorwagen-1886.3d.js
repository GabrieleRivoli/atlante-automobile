/* Benz Patent-Motorwagen: motore monocilindrico, modello 3D semplificato (unità: mm, proporzioni indicative).
   Albero motore verticale (asse Y), volano orizzontale, cilindro orizzontale lungo X con la testata a sinistra.
   Distribuzione ricostruita in modo schematico (bilanciere, asta, camma a metà giri): disposizione reale non verificata. */
export function build(T) {
  const R = 75, L = 225;            /* raggio di manovella (corsa 150 mm) e lunghezza di biella: rapporto indicativo */
  const XH = -380;                  /* faccia interna della testata */
  const BORE = 45, WALL = 52, JACK = 64;
  const VX = -345;                  /* asse della valvola di scarico */
  const PX = -382, PY = 160;        /* perno del bilanciere */
  const CAM = [-418, -150, 0], R0 = 26, HL = 10;   /* camma: centro, raggio base, alzata */
  const rad = d => d * Math.PI / 180;
  const bump = d => Math.abs(d) >= 90 ? 0 : Math.pow(Math.cos(rad(d)), 2);   /* d in gradi di albero, semi-finestra 90° */

  /* volano: corona, mozzo, sei razze */
  const spoke = k => { const g = T.box({ w: 194, h: 12, d: 22, at: [135, 100, 0] }); g.rotateY(k * Math.PI / 3); return g; };
  const volano = T.merge([
    T.tube({ ro: 250, ri: 230, l: 34, axis: 'y', at: [0, 100, 0], seg: 72 }),
    T.cylinder({ r: 38, l: 44, axis: 'y', at: [0, 100, 0], seg: 36 })
  ].concat([0, 1, 2, 3, 4, 5].map(spoke)));
  const segno = T.box({ w: 26, h: 38, d: 14, at: [250, 100, 0] });

  /* albero motore con bracci e bottone di manovella */
  const albero = T.merge([
    T.cylinder({ r: 18, l: 260, axis: 'y', at: [0, 20, 0] }),
    T.box({ w: R + 36, h: 22, d: 40, at: [-(R + 20) / 2 + 8, 30, 0] }),
    T.box({ w: R + 36, h: 22, d: 40, at: [-(R + 20) / 2 + 8, -30, 0] }),
    T.cylinder({ r: 15, l: 82, axis: 'y', at: [-R, 0, 0] })
  ]);

  /* biella: occhio piccolo all'origine, occhio grande a +L */
  const biella = T.merge([
    T.tube({ ro: 17, ri: 9.5, l: 22, axis: 'y', at: [0, 0, 0] }),
    T.tube({ ro: 30, ri: 15.5, l: 24, axis: 'y', at: [L, 0, 0] }),
    T.extrude({ pts: [[17, -7], [L - 30, -14], [L - 30, 14], [17, 7]], depth: 14, axis: 'y' })
  ]);

  /* pistone a coppa con due cave per le fasce, e spinotto */
  const pistone = T.merge([
    T.lathe({
      axis: 'x', pts: [[0, -40], [44, -40], [44, -33], [42, -33], [42, -29], [44, -29], [44, -23], [42, -23], [42, -19], [44, -19],
        [44, 55], [38, 55], [38, -30], [0, -30], [0, -40]]
    }),
    T.cylinder({ r: 9, l: 80, axis: 'z', at: [0, 0, 0] })
  ]);

  /* cilindro con camicia d'acqua */
  const cilindro = T.merge([
    T.tube({ ro: WALL, ri: BORE + 0.5, l: 285, axis: 'x', at: [-237.5, 0, 0] }),
    T.tube({ ro: JACK, ri: WALL, l: 270, axis: 'x', at: [-240, 0, 0] })
  ]);
  const cuts = [];
  [1, -1].forEach(s => {
    cuts.push({ r: [XH, s > 0 ? BORE + 0.5 : -WALL, -95, s > 0 ? WALL : -(BORE + 0.5)], k: 1 });
    cuts.push({ r: [-375, s > 0 ? WALL : -JACK, -105, s > 0 ? JACK : -WALL], k: 0.45 });
  });

  /* testata con cupolino della valvola, sede dell'aspirazione, montante del bilanciere */
  const testata = T.merge([
    T.cylinder({ r: JACK, l: 22, axis: 'x', at: [XH - 11, 0, 0] }),
    T.cylinder({ r: 26, l: 40, axis: 'y', at: [VX, 62, 0] }),
    T.cylinder({ r: 24, l: 36, axis: 'z', at: [VX, 0, -62] }),
    T.box({ w: 14, h: 100, d: 18, at: [PX, 110, 0] })
  ]);

  /* distribuzione */
  const valvola = T.merge([
    T.cylinder({ r: 5, l: 102, axis: 'y', at: [VX, 99, 0] }),
    T.cylinder({ r: 22, l: 5, axis: 'y', at: [VX, 48, 0] }),
    T.cylinder({ r: 16, l: 5, axis: 'y', at: [VX, 141.5, 0] })
  ]);
  const molla = T.helix({ r: 13, l: 57, turns: 7, axis: 'y', at: [VX, 0, 0], seg: 20 });
  const bilanciere = T.merge([T.box({ w: 84, h: 24, d: 22, at: [0, 0, 0] }), T.cylinder({ r: 7, l: 40, axis: 'z', at: [0, 0, 0] })]);
  const asta = T.cylinder({ r: 5, l: 272, axis: 'y', at: [CAM[0], 12, 0], seg: 16 });
  const lobo = [];
  for (let f = 0; f < 360; f += 5) {
    let d = ((f - 135 + 540) % 360) - 180;
    const r = R0 + HL * (Math.abs(d) >= 45 ? 0 : Math.pow(Math.cos(rad(d * 2)), 2));
    lobo.push([r * Math.cos(rad(f)), r * Math.sin(rad(f))]);
  }
  const camma = T.merge([T.extrude({ pts: lobo, depth: 20, axis: 'z', seg: 4 }), T.cylinder({ r: 9, l: 150, axis: 'z', at: [0, 0, 0], seg: 20 })]);

  const scorrevole = T.box({ w: 56, h: 56, d: 5, at: [0, 0, 0] });
  const condotto = T.tube({ ro: 16, ri: 11, l: 42, axis: 'z', at: [VX, 0, -109], seg: 24 });
  const candela = T.merge([
    T.cylinder({ r: 6, l: 48, axis: 'x', at: [XH - 26, -26, 0], seg: 20 }),
    T.cylinder({ r: 9, l: 22, axis: 'x', at: [XH - 38, -26, 0], seg: 20 })
  ]);
  const gas = T.cylinder({ r: 44, l: 1, axis: 'x', at: [0.5, 0, 0], seg: 36 });
  const scintilla = T.star({ size: 13, at: [XH + 6, -26, 0] });

  return {
    label: 'Modello 3D del motore del Benz Patent-Motorwagen, in proiezione ortogonale',
    a0: 100,
    views: { iso: { az: -34, el: 27 } },
    start: { section: true },
    parts: [
      { id: 'volano', g: volano, explode: [0, 230, 0], cutFixed: true, cuts: [{ r: [230, 83, 250, 117], k: 1 }, { r: [-250, 83, -230, 117], k: 1 }, { r: [18, 78, 38, 122], k: 1 }, { r: [-38, 78, -18, 122], k: 1 }] },
      { id: 'segno', g: segno, accent: true, tint: 0.3, explode: [0, 230, 0], hidden: false },
      { id: 'albero', g: albero, explode: [0, -150, 0], cutFixed: true, cuts: [{ r: [-18, -110, 18, 150], k: 1 }] },
      { id: 'biella', g: biella, explode: [90, -90, 0] },
      { id: 'pistone', g: pistone, accent: true, tint: 0.10, explode: [170, 0, 0], cuts: [{ r: [-40, 38, 55, 44], k: 1 }, { r: [-40, -44, 55, -38], k: 1 }, { r: [-40, -38, -30, 38], k: 1 }] },
      { id: 'cilindro', g: cilindro, cuts: cuts },
      { id: 'testata', g: testata, explode: [-110, 0, 0], cuts: [{ r: [XH - 22, -JACK, XH, JACK], k: 1 }] },
      { id: 'candela', g: candela, explode: [-190, 0, 0] },
      { id: 'valvola', g: valvola, accent: true, tint: 0.12, explode: [0, 120, 0] },
      { id: 'molla', g: molla, explode: [0, 95, 0] },
      { id: 'bilanciere', g: bilanciere, explode: [0, 190, 0] },
      { id: 'asta', g: asta, explode: [0, -70, 0] },
      { id: 'camma', g: camma, explode: [0, -180, 0] },
      { id: 'scorrevole', g: scorrevole, accent: true, tint: 0.12, explode: [0, 0, -90] },
      { id: 'condotto', g: condotto, explode: [0, 0, -150] },
      { id: 'gas', g: gas, vol: true, nobox: true },
      { id: 'scintilla', g: scintilla, accent: true, nobox: true }
    ],
    pose(a, H, S) {
      const th = rad(a % 360), s = Math.sin(th), c = Math.cos(th);
      const xp = -(R * c + Math.sqrt(L * L - R * R * s * s));   /* spinotto del pistone */
      const px = -R * c, pz = R * s;                               /* bottone di manovella */
      H.volano.rot.y = th; H.segno.rot.y = th; H.albero.rot.y = th;
      H.pistone.pos.x = xp;
      H.biella.pos.set(xp, 0, 0); H.biella.rot.y = Math.atan2(-pz, px - xp);

      /* distribuzione: un solo ciclo ogni due giri */
      const dEx = ((a - 630 + 360) % 720 + 720) % 720 - 360;
      const liftRod = HL * bump(dEx), liftValve = liftRod * 35 / 40;
      H.camma.pos.set(CAM[0], CAM[1], CAM[2]); H.camma.rot.z = rad(a / 2);
      H.asta.pos.y = liftRod;
      H.bilanciere.pos.set(PX, PY, 0); H.bilanciere.rot.z = -liftRod / 40;
      H.valvola.pos.y = -liftValve;
      const sc = (57 - liftValve) / 57;
      H.molla.scl.y = sc; H.molla.pos.y = 82 + 28.5 * sc;
      const x = ((a % 720) + 720) % 720, xx = x > 540 ? x - 720 : x;
      const open = smooth((xx + 12) / 24) * (1 - smooth((xx - 168) / 24));
      H.scorrevole.pos.set(VX + 46 * open, 0, -86);

      /* gas, scintilla */
      const ph = Math.floor((a % 720) / 180), f = (a % 180) / 180;
      let op, role = 'accent';
      if (ph === 0) op = 0.08 + 0.14 * f; else if (ph === 1) op = 0.22 + 0.4 * f; else if (ph === 2) op = 0.8 - 0.45 * f; else { role = 'muted'; op = 0.35 - 0.2 * f; }
      const hide = S.e > 0.02;
      H.gas.pos.x = XH; H.gas.scl.x = xp + 340; H.gas.role(role); H.gas.alpha(hide ? 0 : op * 0.6);
      const sa = (a % 720) - 352;
      H.scintilla.alpha(hide ? 0 : (sa >= 0 && sa < 40 ? 1 - sa / 40 : 0));
    }
  };
  function smooth(x) { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); }
}

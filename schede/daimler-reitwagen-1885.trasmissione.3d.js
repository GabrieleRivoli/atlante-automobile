/* Daimler Reitwagen: schema 3D della trasmissione (unità: mm, avanti = +X). Posa: a = angolo dell'albero motore in gradi.
   Da fonte: ruota posteriore da 600 mm di diametro (letto così) e trasmissione a cinghia con corona sulla ruota posteriore (Wikipedia, testo); le fonti divergono sulla finale (corona, pignone, cinghia).
   Stima: diametri delle pulegge, numero di denti, posizioni, un solo rapporto per cinghia (le fonti parlano di due rapporti, 6 o 12 km/h, scelti da fermi, qui non modellati). */
export function build(T) {
  const R = 300, rad = d => d * Math.PI / 180;
  const CX = 330, CY = 440, DX = 130, DY = 543, RG = 220, RP = 50, ZB = -120, ZG = 60;
  const r1 = 60, r2 = 110;
  const rod = (a, b, r) => T.rod({ a: a, b: b, r: r, seg: 8 });
  const dente = (Rr, n, z, w) => { const l = []; for (let k = 0; k < n; k++) { const g = T.box({ w: 16, h: 18, d: w, at: [Rr + 6, 0, z] }); g.rotateZ(k * 2 * Math.PI / n); l.push(g); } return l; };
  const ruota = T.wheel({ R: R, w: 35, tyre: 16, spokes: 12, hub: 46, sp: 12, axis: 'z' });
  const corona = T.merge([T.tube({ ro: RG, ri: RG - 14, l: 18, axis: 'z', at: [0, 0, ZG], seg: 64 })].concat(dente(RG, 44, ZG, 18)));
  const pignone = T.merge([T.cylinder({ r: RP, l: 18, axis: 'z', at: [0, 0, ZG], seg: 24 })].concat(dente(RP, 10, ZG, 18)));
  const contralbero = T.merge([T.cylinder({ r: r2, l: 20, axis: 'z', at: [0, 0, ZB], seg: 40 }), T.cylinder({ r: 14, l: ZG - ZB + 40, axis: 'z', at: [0, 0, (ZG + ZB) / 2], seg: 14 })]);
  const pulegiaM = T.merge([T.cylinder({ r: r1, l: 22, axis: 'z', at: [0, 0, ZB], seg: 28 }), T.cylinder({ r: 16, l: 140, axis: 'z', at: [0, 0, ZB / 2 - 5], seg: 14 })]);
  const volani = T.merge([T.tube({ ro: 150, ri: 138, l: 16, axis: 'z', at: [0, 0, 70], seg: 40 }), T.tube({ ro: 150, ri: 138, l: 16, axis: 'z', at: [0, 0, -70], seg: 40 })].concat([0, 1, 2, 3].map(k => { const g = T.box({ w: 130, h: 10, d: 10, at: [75, 0, 70] }); g.rotateZ(k * Math.PI / 2); return g; })));
  const segnoM = T.box({ w: 22, h: 28, d: 24, at: [146, 0, 70] });
  const segnoC = T.box({ w: 20, h: 24, d: 24, at: [r2 - 12, 0, ZB] });
  const dx = DX - CX, dy = DY - CY, d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d, nx = -uy, ny = ux;
  /* tangenti esterne della cinghia (approssimate) */
  const sgn = [1, -1].map(s => { const a = [CX + s * nx * r1, CY + s * ny * r1, ZB], b = [DX + s * nx * r2, DY + s * ny * r2, ZB]; return rod(a, b, 3.5); });
  const cinghia = T.merge(sgn);
  const suolo = T.box({ w: 2400, h: 2, d: 1000, at: [500, -1, 0] });
  return {
    label: 'Schema 3D della trasmissione del Reitwagen: albero motore con volani, cinghia, contralbero con pignone, corona sulla ruota posteriore',
    a0: 0, samples: [0], view: 'fianco', buttons: ['iso', 'fianco', 'pianta'], pad: 1.1,
    views: { iso: { az: -35, el: 26 } },
    parts: [
      { id: 'suolo', g: suolo, ghost: true, nobox: true },
      { id: 'ruota', g: ruota }, { id: 'corona', g: corona, accent: true, tint: 0.12 },
      { id: 'pig', g: pignone, accent: true, tint: 0.2 }, { id: 'ctr', g: contralbero },
      { id: 'pm', g: pulegiaM }, { id: 'vol', g: volani }, { id: 'sm', g: segnoM, accent: true, tint: 0.4 },
      { id: 'sc', g: segnoC, accent: true, tint: 0.4 }, { id: 'cing', g: cinghia, accent: true }
    ],
    pose(a, H) {
      const m = rad(a), cs = m * r1 / r2, rg = -cs * RP / RG;
      H.ruota.pos.set(0, R, 0); H.ruota.rot.z = rg;
      H.corona.pos.set(0, R, 0); H.corona.rot.z = rg;
      H.pig.pos.set(DX, DY, 0); H.pig.rot.z = cs;
      H.ctr.pos.set(DX, DY, 0); H.ctr.rot.z = cs; H.sc.pos.set(DX, DY, 0); H.sc.rot.z = cs;
      H.pm.pos.set(CX, CY, 0); H.pm.rot.z = m; H.vol.pos.set(CX, CY, 0); H.vol.rot.z = m; H.sm.pos.set(CX, CY, 0); H.sm.rot.z = m;
      H.cing.pos.set(0, 0, 0);
    }
  };
}

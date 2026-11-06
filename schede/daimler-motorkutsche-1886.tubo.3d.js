/* Daimler Motorkutsche: accensione a tubo incandescente, modello 3D (unità: mm; alesaggio 70, corsa 120).
   Posa: a = avanzamento della compressione, 0..100 %. Diametro e posizione del tubo, fiamma e testa sono ricostruzioni indicative. */
export function build(T) {
  const BDC = -125, TDC = -10, TX = 150;   /* quota del cielo del pistone */
  const cilindro = T.tube({ ro: 41, ri: 35.5, l: 205, axis: 'y', at: [0, -102.5, 0], seg: 40 });
  const testa = T.cylinder({ r: 45, l: 22, axis: 'y', at: [0, 11, 0], seg: 40 });
  const tubo = T.merge([T.tube({ ro: 12, ri: 7, l: TX - 36, axis: 'x', at: [(TX + 36) / 2, -4, 0], seg: 20 }), T.cylinder({ r: 12, l: 6, axis: 'x', at: [TX + 3, -4, 0], seg: 20 })]);
  const bruciatore = T.merge([T.cylinder({ r: 6, l: 90, axis: 'y', at: [110, -95, 0], seg: 14 }), T.cylinder({ r: 11, l: 14, axis: 'y', at: [110, -47, 0], seg: 14 })]);
  const fiamma = T.star({ size: 11, at: [110, -33, 0] });
  const pistone = T.merge([
    T.lathe({ axis: 'y', pts: [[0, -30], [34.5, -30], [34.5, -20], [32.5, -20], [32.5, -15], [34.5, -15], [34.5, -9], [32.5, -9], [32.5, -4], [34.5, -4], [34.5, 30], [0, 30]] }),
    T.cylinder({ r: 8, l: 110, axis: 'y', at: [0, -85, 0], seg: 14 })
  ]);
  const gas = T.cylinder({ r: 35, l: 1, axis: 'y', at: [0, -0.5, 0], seg: 36 });
  const gas2 = T.cylinder({ r: 6.5, l: 1, axis: 'x', at: [0.5, 0, 0], seg: 16 });
  const lampo = T.star({ size: 26, at: [0, -16, 0] });
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  return {
    label: 'Modello 3D dell\'accensione a tubo incandescente: il pistone comprime la miscela e una parte entra nel tubo riscaldato dalla fiamma',
    a0: 0, samples: [0, 100], view: 'fianco', buttons: ['iso', 'fianco'], pad: 1.1,
    views: { iso: { az: -35, el: 24 } },
    parts: [
      { id: 'cil', g: cilindro, ghost: true }, { id: 'testa', g: testa },
      { id: 'tubo', g: tubo, accent: true, tint: 0.05 },
      { id: 'bru', g: bruciatore }, { id: 'fia', g: fiamma, accent: true },
      { id: 'pis', g: pistone },
      { id: 'gas', g: gas, vol: true, nobox: true }, { id: 'gas2', g: gas2, vol: true, nobox: true },
      { id: 'lampo', g: lampo, accent: true, nobox: true }
    ],
    pose(p, H) {
      const yp = BDC + (TDC - BDC) * p / 100;
      H.pis.pos.set(0, yp - 30, 0);
      H.gas.pos.set(0, 0, 0); H.gas.scl.y = Math.max(2, -yp);
      H.gas.alpha(0.1 + 0.4 * p / 100);
      const fill = clamp((p - 88) / 10, 0, 1);
      H.gas2.pos.set(36, -4, 0); H.gas2.scl.x = Math.max(0.01, (TX - 36) * fill); H.gas2.alpha(fill > 0 ? 0.5 : 0);
      H.tubo.alpha(p >= 88 ? 0.05 + 0.25 * fill : 0.05);
      H.lampo.alpha(p >= 96 ? 1 : 0);
    }
  };
}

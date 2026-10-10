/* ==========================================================================
 * CATÁLOGO DE ITEMS, ROPA Y DECORACIÓN — SIMON: TU AMIGO VIRTUAL
 * ==========================================================================
 * Archivo: items.js
 * Responsabilidad: Catálogo completo de prendas, accesorios, muebles,
 *                  plantas/semillas, cuadros, recetas de cocina e ingredientes.
 *
 * ÍNDICE DE SECCIONES:
 *  0. AYUDANTES PARA CREAR CONTENIDO (registrarRopa, registrarMueble, registrarComida)
 *  1. CATÁLOGO BASE DE ROPA Y MUEBLES (Sudaderas clásicas, accesorios iniciales)
 *  2. JARDÍN: SEMILLAS Y MACETAS (Especies alienígenas y cosechas)
 *  3. CUADROS Y OBRAS DE ARTE (Retratos, fotos de la cámara y marcos)
 *  4. JUGUETES Y PUFS (Pelotas, peluches, dados y asientos)
 *  5. DECORACIÓN TEMÁTICA (Muebles de sala, cocina, baño, estudio, entrada)
 *  6. ESTILOS DE PARED, PISO Y REFRIGERADORES (Patrones, texturas y capacidades)
 *  7. TROFEOS, CAMAS Y CLÓSET (Beneficios de descanso y atuendos guardados)
 *  8. ROPA Y ACCESORIOS AVANZADOS + PREMIUM (Más de 70 prendas exclusivas)
 *  9. OBJETOS SECRETOS (Casco espacial, gorro de chef, mini platillo, etc.)
 * 10. CLIMA Y EFECTOS VISUALES (Llama de racha, ciclos climáticos)
 * 11. COMIDAS ESPECIALES Y CONSUMIBLES (Menú de la tienda y alimentos)
 * 12. MERCADO E INGREDIENTES DE COCINA (Frutas, verduras, carnes y lácteos)
 * 13. RECETAS DE COCINA (Platillos preparables en la estufa)
 * ========================================================================== */

// ==========================================================================
// AYUDANTES PARA CREAR CONTENIDO FÁCILMENTE
// ==========================================================================
function registrarRopa({ id, nombre, slot, precio = 0, nivel = 1, crop = null, regalo = false, mercader = false, prem = null, secreto = false, comentario = null }) {
  const item = { tipo: 'ropa', slot, n: nombre, p: precio, nv: nivel };
  if (crop) item.crop = crop;
  else if (typeof CR !== 'undefined' && CR[slot]) item.crop = CR[slot];
  if (regalo) item.regalo = regalo;
  if (mercader) item.mercader = true;
  if (prem) item.prem = prem;
  if (secreto) item.secreto = true;
  ITEMS[id] = item;
  if (typeof ORDEN !== 'undefined' && ORDEN.ropa && !ORDEN.ropa.includes(id)) {
    ORDEN.ropa.push(id);
  }
  if (comentario && typeof ROPA_COM !== 'undefined') {
    ROPA_COM[id] = comentario;
  }
  return item;
}

function registrarMueble({ id, nombre, slot = 'deco', precio = 0, nivel = 1, tema = 'todas', grid = null, luz = false, tap = null, exclusivo = false, cama = null }) {
  const item = { tipo: 'cuarto', slot, n: nombre, p: precio, nv: nivel, tema };
  if (grid) item.grid = grid;
  if (luz) item.luz = true;
  if (tap) item.tap = tap;
  if (exclusivo) item.exclusivo = true;
  if (cama) item.cama = cama;
  ITEMS[id] = item;
  if (typeof ORDEN !== 'undefined' && ORDEN.cuarto && !ORDEN.cuarto.includes(id)) {
    ORDEN.cuarto.push(id);
  }
  return item;
}

function registrarComida({ id, nombre, precio = 15, nivel = 1, hambre = 10, energia = 0, feliz = 5, texto = '¡Rico!', rand = false, fx = null }) {
  const item = { n: nombre, p: precio, nv: nivel, h: hambre, e: energia, f: feliz, t: texto };
  if (rand) item.rand = true;
  if (fx) item.fx = fx;
  COMIDAS[id] = item;
  if (typeof ORDEN !== 'undefined' && ORDEN.comida && !ORDEN.comida.includes(id)) {
    ORDEN.comida.push(id);
  }
  return item;
}

  /* ===================== CATÁLOGO: ROPA Y MUEBLES ===================== */
  R.dorado = ['#fff6b0', '#ffd84a', '#d8a020', '#8a5a10'];
  R.amarillo = ['#fff7a0', '#ffd84a', '#e8a820', '#a86a10'];
  const SUDS = {
    sud_azul:  [R.azul, TINTA_AZUL, '#1d1470'],
    sud_roja:  [R.rojo, '#4a0a14', '#6e1020'],
    sud_verde: [R.verde, '#12432a', '#1d6a38'],
    sud_dorada: [R.dorado, '#6a4a08', '#8a5a10'],
    sud_negra: [['#6a647c', '#3a3548', '#221f30', '#100e18'], '#08060c', '#150f20'],
    sud_morada: [['#d8b0ff', '#9a5ae8', '#6a30b0', '#401880'], '#2a0a5a', '#401880'],
    sud_naranja: [['#ffd8a0', '#ff9a40', '#d86a18', '#8a3a08'], '#4a2008', '#8a3a08'],
    sud_rosa: [['#ffc0e0', '#ff7ab8', '#d04888', '#802858'], '#4a1030', '#802858'],
    sud_celeste: [['#d0f0ff', '#6ac0f0', '#3a88c8', '#1e5088'], '#0e2a50', '#1e5088'],
    sud_calabaza: [['#ffc060', '#ff8a20', '#c85a10', '#6a2a08'], '#3a1a04', '#6a2a08'],
    sud_arcoiris: [['#fefefe', '#dedede', '#b0b0b1', '#808081'], '#2a1a4a', '#2a1a4a'],
    sud_navidad: [['#6adf8a', '#1f9a4a', '#136a30', '#0a4020'], '#06280e', '#136a30']
  };
  function accGafas(g, k) {
    if (ACC2[k]) return ACC2[k](g);
    if (k === 'nariz_payaso') {
      capa(g, '#4a0a14', L => sombrear(L, elipse(28, 40, 3.8, 3.8), 28, 40, 3.8, 3.8, R.rojo));
      g.set(26, 38, '#ffd0d8'); g.set(27, 38, '#ffd0d8'); g.set(26, 39, '#ffd0d8');
      return;
    }
    if (k === 'gafas_corazon') {
      [15, 41].forEach(cx => g.art(cx - 4, 30, CORAZON, { O: '#8a1020', h: '#ffc0cc', r: '#ff4a6a' }));
      g.rect(24, 32, 8, 1, '#8a1020'); g.rect(3, 32, 5, 1, '#8a1020'); g.rect(48, 32, 5, 1, '#8a1020');
      return;
    }
    if (k === 'monoculo') {
      const cx = 41, cy = 34;
      for (let y = cy - 12; y <= cy + 12; y++) for (let x = cx - 12; x <= cx + 12; x++) { const d = Math.hypot(x + .5 - cx, y + .5 - cy); if (d >= 9.2 && d <= 10.6) g.set(x, y, (x < cx && y < cy) ? '#fff6b0' : '#d8a020'); }
      for (let i = 0; i < 14; i++) g.set(48 + Math.round(i * .15), 42 + i, i % 2 ? '#d8a020' : '#fff6b0');
      return;
    }
    [15, 41].forEach(cx => capa(g, '#0a0a18', L => {
      for (let y = 27; y <= 41; y++) for (let x = cx - 10; x <= cx + 9; x++) {
        if ((y === 27 || y === 41) && (x === cx - 10 || x === cx + 9)) continue;
        L.set(x, y, y < 33 ? '#2b2b5a' : y < 38 ? '#1c1c3c' : '#14142a');
      }
    }));
    [15, 41].forEach(cx => [[-7, 29], [-6, 29], [-7, 30], [-3, 29]].forEach(([dx, dy]) => g.set(cx + dx, dy, '#8a8ae0')));
    g.rect(24, 31, 8, 2, '#0a0a18'); g.rect(3, 31, 5, 2, '#0a0a18'); g.rect(48, 31, 5, 2, '#0a0a18');
  }
  function accCuello(g, k) {
    if (ACC2[k]) return ACC2[k](g);
    if (k === 'panuelo') {
      capa(g, '#1a2a6a', L => {
        for (let y = 48; y <= 61; y++) {
          const half = Math.round(12 * (1 - (y - 48) / 14)) + 1;
          for (let x = 28 - half; x <= 27 + half; x++) L.set(x, y, (x * 3 + y * 5) % 7 === 0 ? '#ffffff' : (y < 51 ? '#6a8aff' : '#3a5ae0'));
        }
      });
      return;
    }
    if (k === 'corbata') {
      capa(g, '#4a0a14', L => {
        L.rect(26, 50, 4, 3, R.rojo[1]);
        sombrear(L, (x, y) => y >= 53 && y <= 68 && Math.abs(x + .5 - 28) <= 1.6 + (y - 53) * .22 * (y < 62 ? 1 : -.5) + (y >= 62 ? 3.3 : 0), 28, 60, 5, 9, R.rojo);
      });
      return;
    }
    if (k === 'collar') {
      for (let x = 17; x <= 39; x++) g.set(x, 56 - Math.round(((x - 28) / 11) ** 2 * 6), (x % 2) ? '#ffd84a' : '#d8a020');
      g.rect(27, 57, 3, 3, '#ff4a5a'); g.set(27, 57, '#ffc0cc'); g.set(28, 60, '#8a1020');
      return;
    }
    if (k === 'mono' || k === 'monodorado') {
      const rp = k === 'mono' ? R.rojo : R.dorado, out = k === 'mono' ? '#4a0a14' : '#6a4a08';
      capa(g, out, L => {
        const ala = (x, y) => (x >= 19 && x <= 25 && Math.abs(y - 53) <= (26 - x) * .55 + 1.4) || (x >= 30 && x <= 36 && Math.abs(y - 53) <= (x - 29) * .55 + 1.4);
        sombrear(L, ala, 28, 53, 10, 5, rp);
        L.rect(26, 51, 4, 5, rp[1]); L.rect(26, 51, 4, 1, rp[0]); L.rect(26, 55, 4, 1, rp[2]);
      });
    } else {
      const dor = k === 'bufanda_dorada', c1 = dor ? '#ffd84a' : '#e8353f', c2 = dor ? '#fff6b0' : '#f4eed8';
      capa(g, dor ? '#6a4a08' : '#4a0a14', L => {
        for (let y = 48; y <= 56; y++) for (let x = 11; x <= 45; x++) {
          const dx = (x + .5 - 28) / 17, dy = (y + .5 - 52) / 4.6;
          if (dx * dx + dy * dy <= 1) L.set(x, y, Math.floor((x + y) / 3) % 2 ? c1 : c2);
        }
        for (let y = 54; y <= 68; y++) for (let x = 37; x <= 42; x++) L.set(x, y, Math.floor(y / 3) % 2 ? c1 : c2);
        [37, 39, 41].forEach(x => { L.set(x, 69, c1); L.set(x, 70, c1); });
      });
    }
  }
  function accCapa(g, k) {
    if (ACC2[k]) return ACC2[k](g);
    const [ra, oa] = k === 'capa_azul' ? [R.azul, TINTA_AZUL] : [R.rojo, '#4a0a14'];
    capa(g, oa, L => {
      sombrear(L, (x, y) => y >= 50 && y <= 76 && Math.abs(x + .5 - 28) <= 15 + (y - 50) * .85, 28, 64, 28, 14, ra);
      for (let x = 0; x < SW; x++) if (L.has(x, 75)) L.set(x, 75, '#ffd84a');
    });
  }
  function accOrejas(g, k) {
    if (ACC2[k]) return ACC2[k](g);
    if (k === 'orejas_gato') {
      [11, 45].forEach(cx => capa(g, '#150f20', L => {
        sombrear(L, (x, y) => y >= 6 && y <= 18 && Math.abs(x + .5 - cx) <= (y - 5) * .55, cx, 14, 6, 8, R.pelo);
        for (let y = 10; y <= 16; y++) for (let x = cx - 2; x <= cx + 2; x++) if (L.has(x, y) && Math.abs(x + .5 - cx) <= (y - 9) * .3) L.set(x, y, '#ffa0b6');
      }));
      return;
    }
    capa(g, '#150f20', L => {
      for (let y = 0; y <= 34; y++) for (let x = 0; x < SW; x++) {
        const d = ((x + .5 - 28) / 25) ** 2 + ((y + .5 - 32) / 20) ** 2;
        if (d > 1.0 && d <= 1.17) L.set(x, y, '#3a3a52');
      }
    });
    [3.5, 52.5].forEach(cx => capa(g, '#4a0a14', L => sombrear(L, elipse(cx, 37, 3.6, 8), cx, 37, 3.6, 8, R.rojo)));
  }
  function accAura(g, k, fr) {
    if (ACC2[k]) return ACC2[k](g, fr || 0);
  }
  function chispa(g, cx, cy, c1, c2) {   // una chispita de 5x5 en forma de cruz/diamante
    g.art(cx - 2, cy - 2, ['..c..', '.ccc.', 'cCCCc', '.ccc.', '..c..'], { c: c1, C: c2 });
  }
  function estrella4(g, cx, cy, r, c1, c2) {   // estrellita de 4 picos
    for (let d = 1; d <= r; d++) { g.set(cx - d, cy, d === r ? c1 : c2); g.set(cx + d, cy, d === r ? c1 : c2); g.set(cx, cy - d, d === r ? c1 : c2); g.set(cx, cy + d, d === r ? c1 : c2); }
    g.set(cx, cy, '#ffffff');
  }

  function plantaGrid() {
    const g = Grid(22, 44);
    capa(g, '#12432a', L => { [[11, 16, 3, 10], [6, 22, 4, 6], [16, 22, 4, 6], [11, 8, 3, 6], [7, 13, 3, 5], [15, 13, 3, 5]].forEach(([cx, cy, rx, ry]) => sombrear(L, elipse(cx, cy, rx, ry), cx, cy, rx, ry, R.verde)); });
    capa(g, '#5a2810', L => { sombrear(L, (x, y) => y >= 30 && y <= 43 && Math.abs(x + .5 - 11) <= 8 - (y - 30) * .3, 11, 37, 9, 8, R.barro); L.rect(2, 29, 18, 3, R.barro[0]); });
    return g;
  }
  function guitarraGrid() {
    const g = Grid(18, 44);
    capa(g, '#3a1a08', L => {
      L.rect(8, 4, 3, 22, '#6e4422'); L.rect(7, 0, 5, 6, '#a06a38');
      const cuerpo = union(elipse(9, 35, 8, 7), elipse(9, 25, 5.5, 5));
      sombrear(L, cuerpo, 9, 32, 8, 10, R.madera);
    });
    capa(g, null, L => sombrear(L, elipse(9, 32, 2.6, 2.6), 9, 32, 2.6, 2.6, ['#3a2010', '#2a1408', '#1a0c04', '#100802']));
    g.rect(9, 6, 1, 25, '#f4eed8'); g.rect(6, 40, 6, 1, '#3a1a08'); g.set(8, 1, '#ffd84a'); g.set(10, 3, '#ffd84a');
    return g;
  }
  function neonGrid(fr) {   // fr: fotograma de la animación (respiración + parpadeo real de neón)
    fr = fr || 0;
    const apagado = fr === 15, destello = fr === 7, haloA = (fr >> 1) % 2;   // cada 16 cuadros el tubo "tartamudea" un instante
    const borde = apagado ? '#a02a5e' : '#ff4a9a';
    const haloInt = apagado ? '#2a1040' : haloA ? '#ffc0de' : '#ff9ac8';
    const haloExt = apagado ? '#180a30' : haloA ? '#e04a86' : '#c01c6a';
    const letraC = apagado ? '#6a4a68' : destello ? '#ffffff' : '#fff6fa';
    const estrellaC = apagado ? '#8a6a1a' : destello ? '#fffbd0' : '#ffe45a';
    const g = Grid(28, 26), S = ['###', '#..', '###', '..#', '###'], I = ['###', '.#.', '.#.', '.#.', '###'];
    capa(g, apagado ? '#3a0a28' : '#5a0a3a', L => { L.rect(1, 1, 26, 21, '#1a1040'); L.rect(2, 2, 24, 1, '#2a1a66'); });
    g.rect(1, 1, 26, 1, borde); g.rect(1, 21, 26, 1, borde); g.rect(1, 1, 1, 21, borde); g.rect(26, 1, 1, 21, borde);
    g.rect(2, 2, 24, 1, haloInt); g.rect(2, 20, 24, 1, haloExt);
    const letra = (m, x0, y0, c) => m.forEach((r, j) => [...r].forEach((ch, i) => { if (ch === '#') g.rect(x0 + i * 2, y0 + j * 2, 2, 2, c); }));
    letra(S, 6, 7, letraC); letra(I, 16, 7, letraC); g.rect(18, 4, 2, 2, estrellaC);
    [4, 20].forEach(x => g.rect(x, 22, 2, 4, '#5a4a8a'));
    return g;
  }

  function sofaGrid() { const g = Grid(36, 20); capa(g, '#4a0a14', L => { caja(L, 3, 1, 30, 10, R.rojo); caja(L, 0, 5, 7, 13, R.rojo); caja(L, 29, 5, 7, 13, R.rojo); caja(L, 5, 9, 26, 9, R.rojo); }); g.rect(18, 10, 1, 8, R.rojo[3]); g.rect(4, 18, 3, 2, '#3a2410'); g.rect(29, 18, 3, 2, '#3a2410'); return g; }
  function mesitaGrid() { const g = Grid(22, 24); capa(g, '#3a2410', L => { caja(L, 1, 13, 20, 4, R.madera); L.rect(3, 17, 3, 7, R.madera[2]); L.rect(16, 17, 3, 7, R.madera[2]); });
    capa(g, '#241b8c', L => sombrear(L, elipse(11, 10, 3.4, 3.8), 11, 10, 3.4, 3.8, R.azul)); g.rect(11, 3, 1, 4, '#2f9a4a'); g.rect(9, 1, 5, 3, '#ff7ab8'); g.rect(11, 2, 1, 1, '#ffd84a'); return g; }
  function libreroGrid() { const g = Grid(20, 34), C = ['#e8353f', '#4f49ea', '#5ccf5a', '#ffd84a', '#ff7ab8', '#ff9a40'];
    capa(g, '#3a2410', L => caja(L, 0, 0, 20, 34, R.madera)); g.rect(2, 2, 16, 30, '#3a2410');
    [1, 12, 23].forEach((y, r) => { let x = 3; for (let i = 0; i < 6 && x < 17; i++) { const w = 2 + ((i + r) % 2), h = 6 + ((i * 3 + r) % 4); g.rect(x, y + 9 - h + 1, w, h, C[(i + r * 2) % 6]); x += w; } g.rect(2, y + 10, 16, 2, R.madera[1]); });
    return g; }
  function cactusGrid() { const g = Grid(16, 22); capa(g, '#5a2810', L => caja(L, 3, 15, 10, 7, R.barro)); capa(g, '#12432a', L => { [[8, 9, 3, 7.5], [3.5, 10, 1.8, 3.5], [12.5, 8, 1.8, 4]].forEach(([cx, cy, rx, ry]) => sombrear(L, elipse(cx, cy, rx, ry), cx, cy, rx, ry, R.verde)); }); g.rect(7, 0, 3, 2, '#ff7ab8'); g.set(8, 0, '#ffd84a'); return g; }
  function teleGrid() { const g = Grid(24, 22), B = ['#ffe45a', '#6ae0f0', '#6adf6a', '#ff7ae0', '#ff5a5a', '#5a7aff'];
    capa(g, '#0e0e18', L => caja(L, 0, 2, 24, 16, ['#6a6a82', '#3a3a4e', '#242434', '#14141e'])); g.rect(2, 4, 20, 12, '#0c1a3a'); B.forEach((c, i) => g.rect(2 + i * 3 + (i > 4 ? 2 : 0), 4, 3, 8, c)); g.rect(2, 12, 20, 4, '#1a2a5a'); g.rect(19, 13, 2, 1, '#ffffff');
    g.rect(5, 18, 3, 3, '#14141e'); g.rect(16, 18, 3, 3, '#14141e'); g.rect(9, 1, 1, 1, '#9a9ab0'); g.rect(8, 0, 1, 1, '#9a9ab0'); g.rect(14, 1, 1, 1, '#9a9ab0'); g.rect(15, 0, 1, 1, '#9a9ab0'); return g; }
  function acuarioGrid() { const g = Grid(26, 20); g.rect(0, 0, 26, 16, '#9ad8ff'); g.rect(1, 1, 24, 14, '#3a9ae8'); g.rect(1, 1, 24, 2, '#7ac4ff'); g.rect(1, 12, 24, 3, '#e8d098');
    [[6, 8, '#ff9a40'], [17, 5, '#ffe45a']].forEach(([x, y, c]) => { g.rect(x, y, 4, 2, c); g.rect(x - 2, y - 1, 2, 4, c); g.set(x + 3, y, '#1a1a2a'); }); [[20, 6], [20, 9], [4, 12], [11, 9]].forEach(([x, y]) => g.rect(x, y, 1, 4 + (x % 3), '#2f9a4a')); [[14, 3], [15, 5]].forEach(([x, y]) => g.set(x, y, '#e8f6ff'));
    g.rect(0, 16, 26, 4, '#3a3a4e'); g.rect(0, 16, 26, 1, '#6a6a82'); return g; }
  function baulGrid() { const g = Grid(22, 16); capa(g, '#3a2410', L => { caja(L, 0, 6, 22, 10, R.madera); sombrear(L, (x, y) => y <= 7 && elipse(11, 7, 11, 7)(x, y), 11, 7, 11, 7, R.madera); }); g.rect(0, 8, 22, 1, '#d8a020'); g.rect(0, 13, 22, 1, '#d8a020'); g.rect(10, 7, 3, 5, '#ffd84a'); g.rect(11, 9, 1, 2, '#6a4408'); return g; }
  function globoGrid() { const g = Grid(16, 22); capa(g, '#12186a', L => sombrear(L, elipse(8, 8, 7, 7), 8, 8, 7, 7, R.azul)); [[5, 5, 3, 3], [9, 8, 3, 4], [4, 9, 2, 2]].forEach(([x, y, w, h]) => g.rect(x, y, w, h, '#5ccf5a')); g.rect(7, 15, 2, 3, '#a06a38'); g.rect(4, 18, 8, 2, '#6e4422'); g.rect(4, 18, 8, 1, '#a06a38'); g.rect(1, 3, 1, 10, '#d8a020'); return g; }
  function telescopioGrid() { const g = Grid(22, 28); [[11, 14, 4, 27], [11, 14, 18, 27], [11, 14, 11, 27]].forEach(([x0, y0, x1, y1]) => { for (let t = 0; t <= 13; t++) g.set(Math.round(x0 + (x1 - x0) * t / 13), Math.round(y0 + (y1 - y0) * t / 13), '#6e4422'); });
    capa(g, '#232b63', L => { for (let t = 0; t < 15; t++) { const x = 2 + t, y = 12 - Math.floor(t * .6); L.rect(x, y, 3, 4, t < 4 ? '#d8a020' : t < 11 ? R.azul[1] : R.azul[2]); } }); g.rect(2, 9, 3, 7, '#ffd84a'); g.rect(10, 12, 3, 3, '#9ea8cf'); return g; }
  function macetaFlorGrid() { const g = Grid(18, 18); capa(g, '#5a2810', L => caja(L, 4, 11, 10, 7, R.barro)); [[4, 6], [9, 3], [14, 7]].forEach(([x, y], i) => { g.rect(x, y + 3, 1, 8, '#2f9a4a'); const c = ['#ff7ab8', '#ffd84a', '#ff5a5a'][i]; g.rect(x - 1, y - 1, 3, 3, c); g.rect(x, y, 1, 1, i === 1 ? '#ff9a40' : '#ffe45a'); }); g.rect(5, 12, 2, 1, '#5ccf5a'); return g; }
  function relojGrid() { const g = Grid(18, 18); capa(g, '#3a2410', L => sombrear(L, elipse(9, 9, 8.5, 8.5), 9, 9, 8.5, 8.5, R.madera)); capa(g, '#9ea8cf', L => sombrear(L, elipse(9, 9, 6.6, 6.6), 9, 9, 6.6, 6.6, R.piel)); [[9, 4], [14, 9], [9, 14], [4, 9]].forEach(([x, y]) => g.rect(x, y, 1, 1, '#241b8c')); g.rect(9, 6, 1, 4, '#1a1a2a'); g.rect(10, 9, 3, 1, '#1a1a2a'); g.set(9, 9, '#e8353f'); return g; }
  function cuadroKekeGrid() { const g = Grid(20, 24); capa(g, '#6a4408', L => caja(L, 0, 0, 20, 24, R.dorado || R.madera)); g.rect(2, 2, 16, 20, '#fff2d0'); g.paste(pizzaGrid(), 3, 6); g.rect(4, 17, 12, 1, '#c88a40'); g.rect(6, 4, 8, 1, '#c88a40'); return g; }
  function guirnaldaGrid() { const g = Grid(40, 12); for (let x = 0; x < 40; x++) g.set(x, 2 + Math.round(2.2 * Math.sin(x / 40 * Math.PI)), '#6a4408');
    [[4, '#ffe45a'], [12, '#ff7ab8'], [20, '#6ae0f0'], [28, '#ffe45a'], [36, '#ff7ab8']].forEach(([x, c]) => { const y = 5 + Math.round(2.2 * Math.sin(x / 40 * Math.PI)); g.rect(x - 1, y, 3, 3, c); g.rect(x, y - 1, 1, 5, c); g.rect(x - 2, y + 1, 5, 1, c); g.set(x, y + 1, '#ffffff'); }); return g; }
  function estanteGrid() { const g = Grid(30, 16); capa(g, '#3a2410', L => caja(L, 0, 12, 30, 4, R.madera)); g.rect(3, 15, 2, 1, '#3a2410');
    capa(g, '#5a2810', L => caja(L, 3, 7, 6, 5, R.barro)); g.rect(5, 2, 2, 5, '#2f9a4a'); g.rect(4, 3, 1, 2, '#5ccf5a'); g.rect(7, 4, 1, 2, '#5ccf5a');
    g.rect(13, 6, 8, 2, '#e8353f'); g.rect(14, 8, 7, 2, '#4f49ea'); g.rect(13, 10, 8, 2, '#ffd84a'); capa(g, '#6a4408', L => sombrear(L, elipse(26, 9, 2.5, 2.5), 26, 9, 2.5, 2.5, R.dorado || R.amarillo)); g.rect(25, 3, 3, 1, '#ffd84a'); g.rect(26, 4, 1, 3, '#ffd84a'); return g; }
  function neonCorazonGrid() { const g = Grid(18, 17); g.rect(0, 0, 18, 17, '#ff4a9a'); g.rect(1, 1, 16, 15, '#1a1040'); g.art(2, 3, ["..OOO...OOO..", ".OhhhO.OhhhO.", "OhhrrrOrrrrrO", "OhrrrrrrrrrrO", "OrrrrrrrrrrrO", ".OrrrrrrrrrO.", "..OrrrrrrrO..", "...OrrrrrO...", "....OrrrO....", ".....OrO....."], { O: '#ff4a9a', h: '#ffffff', r: '#ff9ac8' }); return g; }
  function espejoGrid() { const g = Grid(14, 24); capa(g, '#6a4408', L => sombrear(L, elipse(7, 12, 6.8, 11.8), 7, 12, 6.8, 11.8, R.dorado || R.amarillo)); capa(g, '#7a9ac8', L => sombrear(L, elipse(7, 12, 5, 10), 7, 12, 5, 10, ['#f4faff', '#cfe6ff', '#a8caf0', '#7aa0d0'])); g.rect(4, 5, 1, 4, '#ffffff'); g.rect(5, 4, 1, 2, '#ffffff'); g.rect(9, 15, 1, 3, '#ffffff'); return g; }
  function lamparaGrid() {
    const g = Grid(20, 52);
    capa(g, '#5a4410', L => { L.rect(9, 16, 2, 32, '#d8a020'); L.rect(9, 16, 1, 32, '#ffd84a'); L.rect(5, 47, 10, 3, '#8a6a30'); L.rect(5, 47, 10, 1, '#b8903a'); });
    capa(g, '#7a5a10', L => sombrear(L, (x, y) => y >= 1 && y <= 16 && Math.abs(x + .5 - 10) <= 4 + (y - 1) * .38, 10, 9, 9, 8, R.amarillo));
    return g;
  }
  function patoGrid() {
    const g = Grid(26, 26);
    capa(g, '#7a4a10', L => {
      sombrear(L, union(elipse(11, 17, 10, 7), elipse(18, 8, 5.5, 5.5)), 13, 13, 12, 13, R.amarillo);
      L.rect(22, 9, 4, 2, '#ee7a20'); L.rect(22, 9, 4, 1, '#ffa040');
    });
    g.set(19, 7, '#1a1a2a'); g.set(19, 6, '#1a1a2a');
    g.rect(5, 15, 7, 1, '#e8a820'); g.rect(6, 16, 5, 1, '#e8a820');
    return g;
  }
  function swatchPared(c) {
    const g = Grid(44, 30);
    for (let y = 0; y < 30; y++) for (let x = 0; x < 44; x++) g.set(x, y, y < 18 ? (x % 12 < 6 ? c[0] : c[1]) : c[2]);
    g.rect(0, 16, 44, 1, '#fffbe8'); g.rect(0, 17, 44, 2, '#f0e6c8'); g.rect(0, 19, 44, 1, c[6]);
    for (let px = 3; px < 44; px += 14) { g.rect(px, 22, 10, 7, c[3]); g.rect(px, 22, 10, 1, c[4]); g.rect(px, 28, 10, 1, c[5]); }
    return g;
  }
  function swatchAlf(c) {
    const g = Grid(44, 30);
    for (let y = 0; y < 30; y++) for (let x = 0; x < 44; x++) g.set(x, y, Math.floor(y / 8) % 2 ? '#c58750' : '#cc8f56');
    [[20, 13, c[0]], [18, 11, c[1]], [14, 8, c[2]], [12, 6, c[3]]].forEach(([rx, ry, col]) => { const t = elipse(22, 15, rx, ry); for (let y = 0; y < 30; y++) for (let x = 0; x < 44; x++) if (t(x, y)) g.set(x, y, col); });
    return g;
  }
  function cajaGrid() {
    const g = Grid(26, 26);
    capa(g, TINTA, L => {
      sombrear(L, (x, y) => x >= 3 && x <= 22 && y >= 12 && y <= 24, 12, 18, 11, 8, R.rojo);
      sombrear(L, (x, y) => x >= 1 && x <= 24 && y >= 7 && y <= 12, 12, 9, 13, 5, R.rojo);
      L.rect(11, 7, 4, 18, '#ffd84a'); L.rect(11, 7, 1, 18, '#fff6b0');
      sombrear(L, elipse(8, 5, 5, 3.5), 8, 5, 5, 3.5, R.dorado); sombrear(L, elipse(17, 5, 5, 3.5), 17, 5, 5, 3.5, R.dorado);
    });
    g.rect(11, 3, 4, 5, '#d8a020');
    return g;
  }
  function calabazaGrid() {
    const NA = ['#ffc060', '#ff8a20', '#c85a10', '#6a2a08'];
    const g = Grid(22, 20);
    capa(g, '#6a2a08', L => { sombrear(L, elipse(11, 12, 10, 7.5), 11, 12, 10, 7.5, NA); [6, 11, 16].forEach(x => { for (let y = 6; y <= 18; y++) if (L.has(x, y)) L.set(x, y, NA[2]); }); });
    g.rect(10, 3, 3, 4, '#2f9a4a'); g.rect(10, 3, 1, 4, '#5ccf5a'); g.rect(13, 4, 2, 1, '#2f9a4a');
    [[6, 9], [14, 9]].forEach(([x, y]) => { g.rect(x, y, 3, 3, '#ffe45a'); g.set(x + 1, y, '#ffe45a'); });
    [[7, 14], [9, 15], [11, 14], [13, 15], [15, 14]].forEach(([x, y]) => g.rect(x, y, 2, 2, '#ffe45a'));
    return g;
  }
  function arbolGrid() {
    const g = Grid(26, 46);
    g.rect(11, 38, 4, 7, '#6e4422'); g.rect(11, 38, 1, 7, '#a06a38');
    [[12, 14, 8, 16], [14, 22, 10, 12], [18, 32, 12, 10]].forEach(([cy, y0, w, h]) => capa(g, '#06280e', L => sombrear(L, (x, y) => y >= y0 && y <= y0 + h && Math.abs(x + .5 - 13) <= w * (y - y0 + 1) / (h + 1) + 1, 13, y0 + h / 2, w + 2, h / 2 + 2, R.verde)));
    [[10, 22, '#ff4a5a'], [16, 20, '#ffd84a'], [8, 31, '#62b8ff'], [15, 30, '#ff4a5a'], [19, 35, '#ffd84a'], [7, 38, '#ffd84a'], [13, 27, '#62b8ff']].forEach(([x, y, c]) => g.rect(x, y, 2, 2, c));
    g.art(10, 1, ["..y..", "yyyyy", ".yyy.", "yy.yy"], { y: '#ffe45a' });
    return g;
  }
  function dinoGrid() {
    const g = Grid(26, 22);
    capa(g, '#7a3a10', L => [[6, 5], [10, 3], [14, 4], [17, 6]].forEach(([x, y]) => { L.rect(x, y, 3, 5, '#ff8a3a'); L.rect(x, y, 3, 1, '#ffc070'); }));
    capa(g, '#12432a', L => { sombrear(L, union(elipse(11, 14, 10, 6.5), elipse(20, 9, 4.8, 4.2)), 13, 12, 13, 9, R.verde); L.rect(5, 19, 4, 3, R.verde[2]); L.rect(14, 19, 4, 3, R.verde[2]); });
    g.set(21, 8, '#1a1a2a'); g.set(22, 8, '#1a1a2a'); g.rect(20, 11, 4, 1, '#ffffff'); g.rect(6, 15, 8, 1, R.verde[0]);
    return g;
  }
  function coheteGrid() {
    const g = Grid(18, 46);
    capa(g, '#4a0a14', L => { [[0, 5], [13, 5]].forEach(([x]) => { for (let y = 30; y <= 43; y++) for (let k = 0; k < 5; k++) { const lado = x === 0 ? 4 - k : k; if (lado <= (y - 28) * .6) L.set(x + k, y, R.rojo[y > 38 ? 2 : 1]); } }); });
    capa(g, '#2a2c4a', L => sombrear(L, elipse(9, 24, 6.8, 18), 9, 24, 6.8, 18, R.piel));
    capa(g, '#4a0a14', L => sombrear(L, (x, y) => y <= 14 && elipse(9, 24, 6.8, 18)(x, y), 9, 12, 7, 10, R.rojo));
    capa(g, '#1a2a5a', L => sombrear(L, elipse(9, 24, 3.2, 3.2), 9, 24, 3.2, 3.2, ['#d4f0ff', '#62b8ff', '#3a78d8', '#1e4a98']));
    g.rect(5, 36, 9, 2, '#e8353f'); g.rect(8, 42, 3, 3, '#ffb030'); g.rect(9, 44, 1, 2, '#ffe45a');
    return g;
  }
  function recorte(g, x, y, w, h) {
    const o = Grid(w, h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const a = ((y + j) * g.w + x + i) * 4;
      if (g.d[a + 3]) o.set(i, j, [g.d[a], g.d[a + 1], g.d[a + 2], 255]);
    }
    return o;
  }
  function gridCanvas(g) {
    const c = document.createElement('canvas'); c.width = g.w; c.height = g.h;
    const x = c.getContext('2d'), im = x.createImageData(g.w, g.h); im.data.set(g.d); x.putImageData(im, 0, 0);
    return c;
  }
  const PARED_AZUL  = ['#b9c4f6', '#b0bcf0', '#8f9bdc', '#a3aeee', '#c8d0ff', '#6f7bc4', '#7d89cf', '#9aa6e2'];
  const PARED_ROSA  = ['#f6c4dc', '#f0bcd4', '#dc9ab8', '#eeaecb', '#ffd0e4', '#c4789c', '#cf86a8', '#e0a0bc'];
  const PARED_VERDE = ['#c0eec4', '#b6e8bb', '#8fcf98', '#a3dcaa', '#c8f6cc', '#6cae78', '#7cbe88', '#a4d8aa'];
  const PARED_NOCHE = ['#4a50a8', '#434aa0', '#2c3278', '#383f90', '#5a62c0', '#1e2258', '#262c6c', '#2a3070'];
  const ITEMS = {
    sud_azul:  { tipo: 'ropa', slot: 'sudadera', n: 'SUDADERA AZUL',  p: 0,   nv: 1, crop: [0, 44, 56, 34] },
    sud_roja:  { tipo: 'ropa', slot: 'sudadera', n: 'SUDADERA ROJA',  p: 80,  nv: 2, crop: [0, 44, 56, 34] },
    sud_verde: { tipo: 'ropa', slot: 'sudadera', n: 'SUDADERA VERDE', p: 80,  nv: 3, crop: [0, 44, 56, 34] },
    gafas:     { tipo: 'ropa', slot: 'cara',     n: 'GAFAS DE SOL',   p: 40,  nv: 1, crop: [4, 22, 48, 22] },
    mono:      { tipo: 'ropa', slot: 'cuello',   n: 'MOÑO ROJO',      p: 30,  nv: 1, crop: [8, 38, 40, 28] },
    bufanda:   { tipo: 'ropa', slot: 'cuello',   n: 'BUFANDA',        p: 60,  nv: 2, crop: [8, 42, 44, 36] },
    audifonos: { tipo: 'ropa', slot: 'orejas',   n: 'AUDIFONOS',      p: 90,  nv: 4, crop: [0, 6, 56, 40] },
    monodorado:{ tipo: 'ropa', slot: 'cuello',   n: 'MOÑO DORADO',    p: 0,   nv: 1, crop: [8, 38, 40, 28], regalo: true },
    pared_azul:  { tipo: 'cuarto', slot: 'pared', n: 'PARED AZUL',  p: 0,  nv: 1, col: PARED_AZUL,  estilo: 'pared', tema: 'sala' },
    pared_rosa:  { tipo: 'cuarto', slot: 'pared', n: 'PARED ROSA',  p: 70, nv: 2, col: PARED_ROSA,  estilo: 'pared', tema: 'sala' },
    pared_verde: { tipo: 'cuarto', slot: 'pared', n: 'PARED VERDE', p: 70, nv: 3, col: PARED_VERDE, estilo: 'pared', tema: 'sala' },
    alf_roja:  { tipo: 'cuarto', slot: 'alfombra', n: 'ALFOMBRA ROJA',  p: 0,  nv: 1, col: ['#f4e9c8', '#c23a48', '#a82c3a', '#c23a48'] },
    alf_azul:  { tipo: 'cuarto', slot: 'alfombra', n: 'ALFOMBRA AZUL',  p: 50, nv: 2, col: ['#f4e9c8', '#4b6ae8', '#2a3c9a', '#4b6ae8'] },
    alf_verde: { tipo: 'cuarto', slot: 'alfombra', n: 'ALFOMBRA VERDE', p: 50, nv: 3, col: ['#f4e9c8', '#4cae5a', '#2a7a3e', '#4cae5a'] },
    planta:    { tipo: 'cuarto', slot: 'izq', n: 'PLANTA',        p: 60,  nv: 2, grid: plantaGrid },
    guitarra:  { tipo: 'cuarto', slot: 'izq', n: 'GUITARRA',      p: 100, nv: 3, grid: guitarraGrid },
    lampara:   { tipo: 'cuarto', slot: 'der', n: 'LAMPARA',       p: 90,  nv: 2, grid: lamparaGrid },
    pato:      { tipo: 'cuarto', slot: 'der', n: 'PATO GIGANTE',  p: 150, nv: 5, grid: patoGrid },
    // exclusivos de Cortex comerciante
    sud_dorada:   { tipo: 'ropa', slot: 'sudadera', n: 'SUDADERA DORADA', p: 220, nv: 1, crop: [0, 44, 56, 34], mercader: true },
    sud_negra:    { tipo: 'ropa', slot: 'sudadera', n: 'SUDADERA NEGRA',  p: 140, nv: 1, crop: [0, 44, 56, 34], mercader: true },
    sud_morada:   { tipo: 'ropa', slot: 'sudadera', n: 'SUDADERA MORADA', p: 140, nv: 1, crop: [0, 44, 56, 34], mercader: true },
    monoculo:     { tipo: 'ropa', slot: 'cara',     n: 'MONOCULO',        p: 120, nv: 1, crop: [4, 22, 48, 36], mercader: true },
    bufanda_dorada: { tipo: 'ropa', slot: 'cuello', n: 'BUFANDA DORADA',  p: 130, nv: 1, crop: [8, 42, 44, 36], mercader: true },
    sud_naranja: { tipo: 'ropa', slot: 'sudadera', n: 'SUDADERA NARANJA', p: 90, nv: 2, crop: [0, 44, 56, 34] },
    sud_rosa:    { tipo: 'ropa', slot: 'sudadera', n: 'SUDADERA ROSA',    p: 90, nv: 3, crop: [0, 44, 56, 34] },
    sud_celeste: { tipo: 'ropa', slot: 'sudadera', n: 'SUDADERA CELESTE', p: 90, nv: 4, crop: [0, 44, 56, 34] },
    gafas_corazon: { tipo: 'ropa', slot: 'cara', n: 'GAFAS CORAZON', p: 60, nv: 3, crop: [4, 24, 48, 22] },
    orejas_gato: { tipo: 'ropa', slot: 'orejas', n: 'OREJAS DE GATO', p: 100, nv: 5, crop: [0, 2, 56, 38] },
    corbata:     { tipo: 'ropa', slot: 'cuello', n: 'CORBATA', p: 40, nv: 2, crop: [8, 42, 40, 34] },
    collar:      { tipo: 'ropa', slot: 'cuello', n: 'COLLAR DE ORO', p: 120, nv: 6, crop: [8, 42, 40, 26] },
    capa_roja:   { tipo: 'ropa', slot: 'espalda', n: 'CAPA ROJA', p: 130, nv: 4, crop: [0, 40, 56, 38] },
    capa_azul:   { tipo: 'ropa', slot: 'espalda', n: 'CAPA AZUL', p: 130, nv: 5, crop: [0, 40, 56, 38] },
    // de temporada (solo con Cortex comerciante)
    sud_calabaza: { tipo: 'ropa', slot: 'sudadera', n: 'SUDADERA CALABAZA', p: 150, nv: 1, crop: [0, 44, 56, 34], mercader: true, temp: 'hal' },
    pared_halloween: { tipo: 'cuarto', slot: 'pared', n: 'PARED HALLOWEEN', p: 180, nv: 1, col: ['#7a5aa8', '#7050a0', '#4a3078', '#5a3c8a', '#8a6cb8', '#2e1a58', '#3a2268', '#34205e'], mercader: true, temp: 'hal', estilo: 'pared', tema: 'sala' },
    calabaza:     { tipo: 'cuarto', slot: 'izq', n: 'CALABAZA TALLADA', p: 160, nv: 1, grid: calabazaGrid, mercader: true, temp: 'hal' },
    sud_navidad:  { tipo: 'ropa', slot: 'sudadera', n: 'SUDADERA NAVIDEÑA', p: 150, nv: 1, crop: [0, 44, 56, 34], mercader: true, temp: 'nav' },
    arbol:        { tipo: 'cuarto', slot: 'der', n: 'ARBOL DE NAVIDAD', p: 220, nv: 1, grid: arbolGrid, mercader: true, temp: 'nav' },
    pared_noche:  { tipo: 'cuarto', slot: 'pared',  n: 'PARED NOCTURNA',  p: 200, nv: 1, col: PARED_NOCHE, mercader: true, estilo: 'pared', tema: 'sala' },
    alf_dorada:   { tipo: 'cuarto', slot: 'alfombra', n: 'ALFOMBRA DORADA', p: 180, nv: 1, col: ['#fff6b0', '#d8a020', '#a87810', '#d8a020'], mercader: true },
    dino:         { tipo: 'cuarto', slot: 'izq', n: 'DINO DE PELUCHE',  p: 250, nv: 1, grid: dinoGrid, mercader: true },
    cohete:       { tipo: 'cuarto', slot: 'der', n: 'COHETE',           p: 300, nv: 1, grid: coheteGrid, mercader: true },
    sofa:         { tipo: 'cuarto', slot: 'deco', n: 'SOFÁ',            p: 180, nv: 2, grid: sofaGrid },
    mesita:       { tipo: 'cuarto', slot: 'deco', n: 'MESITA',          p: 60,  nv: 1, grid: mesitaGrid },
    librero:      { tipo: 'cuarto', slot: 'deco', n: 'LIBRERO',         p: 120, nv: 2, grid: libreroGrid },
    cactus:       { tipo: 'cuarto', slot: 'deco', n: 'CACTUS',          p: 40,  nv: 1, grid: cactusGrid },
    tele:         { tipo: 'cuarto', slot: 'deco', n: 'TELE',            p: 200, nv: 3, grid: teleGrid, luz: true },
    acuario:      { tipo: 'cuarto', slot: 'deco', n: 'ACUARIO',         p: 220, nv: 4, grid: acuarioGrid },
    baul:         { tipo: 'cuarto', slot: 'deco', n: 'BAÚL DEL TESORO', p: 90,  nv: 2, grid: baulGrid },
    globo:        { tipo: 'cuarto', slot: 'deco', n: 'GLOBO TERRÁQUEO', p: 110, nv: 3, grid: globoGrid },
    telescopio:   { tipo: 'cuarto', slot: 'deco', n: 'TELESCOPIO',      p: 160, nv: 4, grid: telescopioGrid },
    maceta:       { tipo: 'cuarto', slot: 'deco', n: 'MACETA FLORIDA',  p: 50,  nv: 1, grid: macetaFlorGrid },
    reloj:        { tipo: 'cuarto', slot: 'decoP', n: 'RELOJ',          p: 50,  nv: 1, grid: relojGrid },
    cuadro_keke:  { tipo: 'cuarto', slot: 'decoP', n: 'CUADRO DE KEKE', p: 70,  nv: 1, grid: cuadroKekeGrid },
    guirnalda:    { tipo: 'cuarto', slot: 'decoP', n: 'GUIRNALDA',      p: 80,  nv: 2, grid: guirnaldaGrid },
    estante:      { tipo: 'cuarto', slot: 'decoP', n: 'ESTANTE',        p: 90,  nv: 2, grid: estanteGrid },
    neon_corazon: { tipo: 'cuarto', slot: 'decoP', n: 'NEÓN CORAZÓN',   p: 130, nv: 3, grid: neonCorazonGrid, luz: true },
    espejo:       { tipo: 'cuarto', slot: 'decoP', n: 'ESPEJO',         p: 100, nv: 3, grid: espejoGrid },
    sud_arcoiris: { tipo: 'ropa', slot: 'sudadera', n: 'SUDADERA ARCOÍRIS', p: 0, nv: 1, crop: [0, 44, 56, 34], codigo: true },
    neon_si:      { tipo: 'cuarto', slot: 'der', n: 'NEÓN SIMON',        p: 0, nv: 1, grid: neonGrid, codigo: true, luz: true }
  };
  /* ===================== JARDÍN: SEMILLAS Y MACETAS COSECHADAS ===================== */
  // semillas alienígenas de un planeta que Simon no recuerda conscientemente, pero que le hacen cosquillas en la memoria
  const SEMILLAS = {
    brote: { n: 'Flor Espectro', rareza: 'Común', diasCrecer: 2, diasVida: 5, efecto: 'Mientras esté viva (en cualquier cuarto), la felicidad baja más lento.', precio: 40, col: '#caa6e0', planta: plantaEspectro },
    raiz: { n: 'Anémona Calma', rareza: 'Poco común', diasCrecer: 4, diasVida: 7, efecto: 'Mientras esté viva (en cualquier cuarto), la energía se recupera más rápido al dormir.', precio: 90, col: '#6ad0ff', planta: plantaCalma },
    eco: { n: 'Flor de Eco', rareza: 'Rara', diasCrecer: 3, diasVida: 6, efecto: 'Mientras esté viva, comer y jugar con Simon rinden un 10% más.', precio: 150, col: '#9adde4', planta: plantaEco },
    dorada: { n: 'Espora Dorada', rareza: 'Muy rara', diasCrecer: 5, diasVida: 8, efecto: 'Mientras esté viva, suelta monedas poco a poco.', precio: 220, col: '#ffd84a', planta: plantaDorada },
    eterna: { n: 'Flor Eterna', rareza: 'Legendaria', diasCrecer: 7, diasVida: 999999, efecto: 'Nunca se marchita. Al cosecharla te da el Aura Eterna. Con esa aura puesta y la maceta colocada, Simon levita.', precio: 2500, col: '#ffe68a', planta: plantaEterna, exclusivo: true }
  };
  function semillaGrid(id) {   // sobrecito de semillas para la tienda/inventario
    const g = Grid(14, 16), c = SEMILLAS[id].col;
    g.rect(1, 3, 12, 12, '#e8d8a8'); g.rect(1, 3, 12, 1, '#fff2d0'); g.rect(1, 3, 1, 12, '#fff2d0'); g.rect(11, 3, 2, 12, '#b89860'); g.rect(1, 14, 12, 1, '#b89860');
    g.rect(2, 0, 10, 5, '#8a6a3a'); g.rect(3, 1, 8, 3, '#6a4a22');
    g.set(5, 8, c); g.set(8, 9, c); g.set(6, 11, c); g.set(5, 9, mixC(c, -.3)); g.set(8, 10, mixC(c, -.3));
    return g;
  }
  function semillaEternaGrid() {   // sobrecito dorado y oscuro: la semilla que vende Cortex, aparte del catálogo normal de SEMILLAS
    const g = Grid(14, 16), c = '#ffd84a';
    g.rect(1, 3, 12, 12, '#2a1830'); g.rect(1, 3, 12, 1, '#4a2a5a'); g.rect(1, 3, 1, 12, '#4a2a5a'); g.rect(11, 3, 2, 12, '#120a18'); g.rect(1, 14, 12, 1, '#120a18');
    g.rect(2, 0, 10, 5, '#8a6a1a'); g.rect(3, 1, 8, 3, '#5a4210');
    g.set(5, 8, c); g.set(8, 9, c); g.set(6, 11, c); g.set(5, 9, mixC(c, -.3)); g.set(8, 10, mixC(c, -.3));
    return g;
  }
  function macetaPlantaGrid(especie, marchita, fr) {   // maceta cosechada: la MISMA floración adulta grande que se ve creciendo en el jardín (no una versión chiquita), y sigue pulsando una vez colocada
    const g = Grid(32, 40), cx = 16, dy = 29;
    capa(g, '#5a2810', L => caja(L, cx - 5, dy, 10, 8, R.barro));
    if (marchita) {
      g.rect(cx, dy - 10, 1, 10, '#6a6458');
      [[-4, -4], [4, -2], [0, -8]].forEach(([dx, dyf]) => g.set(cx + dx, dy - 10 + dyf, '#9a9488'));
      return g;
    }
    const S0 = SEMILLAS[especie]; (S0 && S0.planta || plantaEspectro)(g, cx, dy, 'listo', fr || 0);
    return g;
  }
  const macetaViva = k => { const v = e.macetaVida[k]; return !!v && v.dias > 0; };
  function registrarMaceta(key, especie) {   // (re)crea el ITEMS[key] de una maceta cosechada: necesario también al cargar la partida, porque ITEMS se arma de nuevo en cada carga de página y estas claves son dinámicas
    const S = SEMILLAS[especie]; if (!S) return;
    ITEMS[key] = { tipo: 'cuarto', slot: 'deco', n: S.n.toUpperCase() + ' (MACETA)', p: 0, nv: 1, grid: () => macetaPlantaGrid(especie, !macetaViva(key)), semilla: especie, tap: 'planta' };
  }
  function cosecharPlanta(id) {   // registra la maceta cosechada como un ítem único (igual que aura_legend / aura_trueno: fuera de la tienda)
    const key = 'maceta_' + id + '_' + Date.now();
    registrarMaceta(key, id);
    e.tiene[key] = 1; e.macetaVida[key] = { dias: SEMILLAS[id].diasVida, diaUlt: null };
    return key;
  }
  /* ===================== CUADROS: OBRAS Y FOTOS ===================== */
  const ORO = ['#6e4422', '#e8c04a', '#fff0a0', '#b08a20'], MFOTO = ['#2a2a3a', '#f0eee6', '#ffffff', '#b8b4a8']; // (ALBUM_MAX definido en config.js)
  const disco = (g, cx, cy, r, c) => { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * .4) g.set(cx + x, cy + y, c); };
  function arteCorona() { const g = Grid(28, 20); g.rect(0, 0, 28, 20, '#f4eed8'); g.paste(coronaGrid(), 3, 4); return g; }
  function arteKeke() { const g = Grid(28, 20); g.rect(0, 0, 28, 20, '#ffe6b8'); g.rect(0, 16, 28, 4, '#e8b078'); g.rect(0, 16, 28, 1, '#c88a40'); g.paste(pizzaGrid(), 7, 2); [[3, 3], [23, 5], [5, 11], [24, 12]].forEach(([x, y]) => { g.set(x, y, '#ffffff'); g.set(x - 1, y, '#ffd84a'); g.set(x + 1, y, '#ffd84a'); g.set(x, y - 1, '#ffd84a'); g.set(x, y + 1, '#ffd84a'); }); return g; }
  function arteCortex() {
    const g = Grid(28, 20); g.rect(0, 0, 28, 20, '#5a1a2a'); for (let y = 0; y < 20; y += 4) g.rect(0, y, 28, 1, '#6a2234');
    const cx = 14, cy = 11.5;
    for (let y = 3; y < 20; y++) for (let x = 4; x < 25; x++) {
      const dx = (x + .5 - cx) / 8.6, dy = (y + .5 - cy) / 8; if (dx * dx + dy * dy > 1) continue;
      g.set(x, y, dx > .55 || dy > .65 ? '#b8c0e8' : '#f0f2fb');
      const h = (x + .5 - cx) / 9.4, v = (y + .5 - cy) / 8.8;
      if (h * h + v * v <= 1 && (y <= 8 || (y <= 11 && (x < 8 || x > 20)))) g.set(x, y, '#0c0a12');
    }
    [[11, 5], [12, 6], [19, 5], [8, 7], [20, 8]].forEach(([x, y]) => g.set(x, y, '#e03040'));
    [10, 17].forEach(x => { g.rect(x, 10, 3, 4, '#d02030'); g.rect(x + 1, 11, 1, 3, '#1a0a10'); g.set(x, 10, '#ffffff'); });
    g.rect(7, 14, 2, 1, '#ffa0b6'); g.rect(20, 14, 2, 1, '#ffa0b6'); g.rect(12, 15, 5, 1, '#4a1020'); g.rect(13, 16, 3, 1, '#4a1020');
    g.rect(9, 2, 10, 1, '#e03040'); g.rect(9, 1, 10, 1, '#2a2636'); [9, 13, 18].forEach(x => { g.set(x, 0, '#2a2636'); });
    return g;
  }
  function arteBoom() {
    const g = Grid(28, 20); g.rect(0, 0, 28, 20, '#2a2636');
    for (let a = 0; a < 10; a++) for (let t = 0; t < 10; t++) g.set(Math.round(14 + Math.cos(a * .628) * t * 1.3), Math.round(10 + Math.sin(a * .628) * t * .95), t > 6 ? '#ff6a28' : '#ffa030');
    disco(g, 14, 10, 6, '#ff6a28'); disco(g, 14, 10, 4, '#ffd84a'); disco(g, 14, 10, 2, '#ffffff');
    [[2, 2], [25, 3], [3, 17], [24, 17], [8, 1], [20, 18]].forEach(([x, y]) => g.rect(x, y, 2, 1, '#6a6676'));
    return g;
  }
  function arteEstrellas() {
    const g = Grid(28, 20), B = ['#0e0e3a', '#161a52', '#232b63', '#2e3a7a'];
    for (let y = 0; y < 20; y++) g.rect(0, y, 28, 1, B[Math.min(3, Math.floor(y / 5))]);
    [[3, 3], [8, 7], [12, 2], [6, 14], [14, 11], [18, 15], [24, 11], [2, 9], [10, 17], [22, 17], [16, 6]].forEach(([x, y], i) => { g.set(x, y, '#ffffff'); if (i % 3 === 0) { g.set(x - 1, y, '#aab4ff'); g.set(x + 1, y, '#aab4ff'); g.set(x, y - 1, '#aab4ff'); g.set(x, y + 1, '#aab4ff'); } });
    disco(g, 21, 6, 4, '#fff2b0'); disco(g, 23, 5, 3, '#161a52');
    for (let t = 0; t < 7; t++) g.set(7 + t, 3 + Math.floor(t * .6), t > 4 ? '#ffd84a' : '#fff6c0');
    return g;
  }
  function arteFotoVacia() { const g = Grid(28, 20); g.rect(0, 0, 28, 20, '#8a90b8'); g.rect(8, 7, 12, 9, '#232b63'); g.rect(11, 5, 6, 2, '#232b63'); g.rect(12, 9, 4, 4, '#ffffff'); g.rect(13, 10, 2, 2, '#232b63'); g.set(18, 9, '#ffd84a'); return g; }
  function fotoGrid(id) {
    const f = e.album.find(a => a.id === id); if (!f) return arteFotoVacia();
    const pal = f.p.match(/.{3}/g).map(h => '#' + [...h].map(c => c + c).join('')), g = Grid(28, 20);
    for (let i = 0; i < 560; i++) { const c = pal[parseInt(f.i[i], 16)]; if (c) g.set(i % 28, Math.floor(i / 28), c); }
    return g;
  }
  const fotoActual = () => e.album.find(a => a.id === e.cuadroFoto) || e.album[0] || null;
  function arteDe(k) { if (k === 'marco_foto') { const f = fotoActual(); return f ? fotoGrid(f.id) : arteFotoVacia(); } return (ITEMS[k] || ITEMS.marco_corona).arte(); }
  const cuadroArte = () => arteDe(e.cuarto.cuadro);
  const cuadroMc = () => e.cuarto.cuadro === 'marco_foto' ? MFOTO : (ITEMS[e.cuarto.cuadro] || ITEMS.marco_corona).mc;
  function marcoGrid(k) { const g = Grid(38, 30); marcoDib(g, 0, 0, arteDe(k), k === 'marco_foto' ? MFOTO : ITEMS[k].mc); return g; }
  // foto -> pixel art de 28x20 con paleta de hasta 16 colores, se cuelga sola en el cuadro
  function pixelarFoto() {
    try {
      const w = LW, h = Math.round(LW * 20 / 28), sy = Math.max(0, Math.min(LH - h, SY - 4));
      const t = document.createElement('canvas'); t.width = 28; t.height = 20; const x = t.getContext('2d'); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; x.drawImage(cv, 0, sy, w, h, 0, 0, 28, 20);
      const d = x.getImageData(0, 0, 28, 20).data, cuenta = {}, cols = [];
      for (let i = 0; i < 560; i++) { const k = ((d[i * 4] >> 4) << 8) | ((d[i * 4 + 1] >> 4) << 4) | (d[i * 4 + 2] >> 4); cols.push(k); cuenta[k] = (cuenta[k] || 0) + 1; }
      const dist = (a, b) => { const r = (a >> 8) - (b >> 8), g = ((a >> 4) & 15) - ((b >> 4) & 15), bl = (a & 15) - (b & 15); return r * r + g * g + bl * bl; };
      const orden = Object.keys(cuenta).map(Number).sort((a, b) => cuenta[b] - cuenta[a]), pal = [];
      for (const c of orden) { if (pal.length >= 16) break; if (pal.every(p => dist(c, p) >= 10)) pal.push(c); }
      for (const c of orden) { if (pal.length >= 16) break; if (!pal.includes(c)) pal.push(c); }
      let idx = ''; cols.forEach(k => { let m = 0, bd = 1e9; pal.forEach((p, j) => { const q = dist(k, p); if (q < bd) { bd = q; m = j; } }); idx += m.toString(16); });
      const f = { id: Date.now().toString(36), f: hoy(), p: pal.map(k => k.toString(16).padStart(3, '0')).join(''), i: idx };
      e.album.unshift(f);
      while (e.album.length > ALBUM_MAX) { let j = e.album.length - 1; while (j > 0 && e.album[j].id === e.cuadroFoto) j--; e.album.splice(j, 1); }
      e.cuadroFoto = f.id; e.cuarto.cuadro = 'marco_foto';
      toast('Foto colgada en tu cuadro');
    } catch (_) {}
  }
  function renderCuadro() {
    $('m-titulo').textContent = 'TU CUADRO';
    const act = e.cuarto.cuadro, obras = Object.keys(ITEMS).filter(k => ITEMS[k].slot === 'cuadro' && e.tiene[k]);
    const fecha = f => f.split('-').slice(1).reverse().join('/');
    let h = `<div class="centro" style="font-size:8px;color:#ffd84a;margin-bottom:8px">MIS FOTOS ${e.album.length}/${ALBUM_MAX}</div>`;
    if (!e.album.length) h += `<div class="centro" style="font-size:7px;line-height:1.9;color:#aab4ff">Tus fotos quedan aquí. La última se cuelga sola.</div>`;
    else h += `<div class="galeria rej">` + e.album.map(f => `<button class="foto ${act === 'marco_foto' && fotoActual() && fotoActual().id === f.id ? 'on' : ''}" data-a="q_foto" data-k="${f.id}"><canvas data-prev="fo_${f.id}"></canvas><span>${fecha(f.f)}</span></button>`).join('') + `</div>`;
    h += `<div class="centro" style="font-size:8px;color:#ffd84a;margin:14px 0 8px">MIS OBRAS ${obras.length}</div><div class="galeria rej">` +
      obras.map(k => `<button class="foto ${act === k ? 'on' : ''}" data-a="q_obra" data-k="${k}"><canvas data-prev="${k}"></canvas><span>${ITEMS[k].n.replace('OBRA: ', '')}</span></button>`).join('') + `</div>` +
      `<div class="centro" style="font-size:7px;line-height:1.9;color:#aab4ff;margin-top:12px">Más obras: tienda, logros y códigos.</div><button class="bgrande" data-a="cerrar">OK</button>`;
    return h;
  }
  function qClick(a, k) {
    if (a === 'q_foto') { if (!e.album.some(f => f.id === k)) return; e.cuadroFoto = k; e.cuarto.cuadro = 'marco_foto'; }
    else if (a === 'q_obra') { if (!e.tiene[k] || !ITEMS[k] || ITEMS[k].slot !== 'cuadro') return; e.cuarto.cuadro = k; }
    sfx.click(); pintar(); guardar(); render();
  }
  Object.assign(ITEMS, {
    marco_corona:   { tipo: 'cuarto', slot: 'cuadro', n: 'OBRA: CORONA',    p: 0,   nv: 1, grid: () => marcoGrid('marco_corona'),   arte: arteCorona,   mc: ORO },
    marco_keke:     { tipo: 'cuarto', slot: 'cuadro', n: 'OBRA: KEKE',      p: 60,  nv: 1, grid: () => marcoGrid('marco_keke'),     arte: arteKeke,     mc: ['#4a2a10', '#a86a30', '#d8a060', '#6a3a14'] },
    marco_cortex:   { tipo: 'cuarto', slot: 'cuadro', n: 'OBRA: CORTEX',    p: 120, nv: 3, grid: () => marcoGrid('marco_cortex'),   arte: arteCortex,   mc: ['#08060c', '#3a3548', '#6a647c', '#150f20'] },
    marco_planeta:  { tipo: 'cuarto', slot: 'cuadro', n: 'OBRA: SU PLANETA', p: 150, nv: 1, grid: () => marcoGrid('marco_planeta'), arte: artePlaneta,  mc: ['#3a3a5a', '#c8c8e0', '#f0f0ff', '#8a8aa8'], mercader: true },
    marco_boom:     { tipo: 'cuarto', slot: 'cuadro', n: 'OBRA: BOOM',      p: 0,   nv: 1, grid: () => marcoGrid('marco_boom'),     arte: arteBoom,     mc: ['#4a0a14', '#d02838', '#ff6a78', '#8a1424'], regalo: 'logro' },
    marco_estrellas: { tipo: 'cuarto', slot: 'cuadro', n: 'OBRA: ESTRELLAS', p: 0,  nv: 1, grid: () => marcoGrid('marco_estrellas'), arte: arteEstrellas, mc: ['#0e0e3a', '#3a47a8', '#7a88e8', '#232b63'], codigo: true }
  });
  function artePlaneta() {
    const g = Grid(28, 20), C = ['#2a1a5a', '#4a2a7a', '#8a3a98', '#c05ab8'];
    for (let y = 0; y < 14; y++) g.rect(0, y, 28, 1, C[Math.min(3, Math.floor(y / 3.6))]);
    disco(g, 20, 5, 3, '#f0e8ff'); disco(g, 8, 8, 2, '#ffd0f0'); g.set(19, 4, '#ffffff');
    [[3, 2], [13, 3], [25, 9], [16, 9], [1, 6]].forEach(([x, y]) => g.set(x, y, '#ffffff'));
    [[4, 5, '#ffd84a'], [11, 6, '#4ac8ff'], [15, 4, '#ff6a8a'], [23, 8, '#ffd84a'], [6, 10, '#ff6a8a'], [18, 11, '#4ac8ff'], [26, 3, '#ff6a8a'], [10, 11, '#ffd84a']].forEach(([x, y, c]) => g.set(x, y, c));
    for (let x = 0; x < 28; x++) { const h = 14 + Math.round(Math.sin(x / 4) * 1.4); g.rect(x, h, 1, 20 - h, '#2f9a8a'); g.rect(x, h + 3, 1, 20, '#1e6a62'); }
    [[5, 11], [6, 9], [7, 11]].forEach(([x, y]) => g.rect(x, y, 1, 14 - y, '#8affd8'));
    return g;
  }
  /* ===================== JUGUETES Y PUFS ===================== */
  const arteMapa = (rows, map, w, h) => { const g = Grid(w, h); g.art(0, 0, rows.map(r => r.padEnd(w, '.').slice(0, w)), map); return g; };
  const juguetes = {
    pelota() { const g = Grid(12, 12); capa(g, '#4a0a14', L => sombrear(L, elipse(6, 6, 6, 6), 6, 6, 6, 6, R.rojo)); g.rect(0, 5, 12, 2, '#ffffff'); return g; },
    azul() { const g = Grid(12, 12); capa(g, '#150f55', L => sombrear(L, elipse(6, 6, 6, 6), 6, 6, 6, 6, R.azul)); g.rect(0, 5, 12, 2, '#8c88ff'); return g; },
    playa() {
      const g = Grid(12, 12), C = ['#ff4a5a', '#ffffff', '#ffd84a', '#ffffff', '#3a9aff', '#ffffff'];
      capa(g, '#3a2a4a', L => { for (let y = 0; y < 12; y++) for (let x = 0; x < 12; x++) if (elipse(6, 6, 6, 6)(x, y)) L.set(x, y, C[Math.floor(((Math.atan2(y + .5 - 6, x + .5 - 6) + Math.PI) / (2 * Math.PI)) * 6) % 6]); });
      g.set(3, 3, '#ffffff'); g.set(4, 2, '#ffffff'); return g;
    },
    patito() { const g = arteMapa(['....yyy.....', '...yyyyy....', '...ykyyy....', '...yyyyoo...', '....yyy.....', '..yyyyyy....', '.yyyyyyyyy.y', 'yyyyyyyyyyyy', 'yhyyyyyyyyy.', '.yyyyyyyyyy.', '..yyyyyyyy..'], { y: '#ffd84a', k: '#1a1020', o: '#ff8a20', h: '#fff6b0' }, 12, 11); g.contour('#8a5a08'); return g; },
    osito() { const g = arteMapa(['.bb......bb.', 'bbbb....bbbb', '.bbbbbbbbbb.', '.bbbbbbbbbb.', '.bkbbbbbbkb.', '.bbbbssbbbb.', '..bbsnnsbb..', '...bbbbbb...', '..bbbbbbbb..', '.bbbbbbbbbb.', '.bbb.bb.bbb.'], { b: '#c8884a', k: '#1a1020', s: '#f0c088', n: '#4a2a10' }, 12, 11); g.contour('#4a2a10'); return g; },
    disco() { const g = Grid(12, 6); capa(g, '#1e5088', L => sombrear(L, elipse(6, 3, 6, 3), 6, 3, 6, 3, ['#d0f0ff', '#6ac0f0', '#3a88c8', '#1e5088'])); g.rect(3, 2, 6, 2, '#3a88c8'); g.rect(4, 2, 4, 1, '#d0f0ff'); return g; },
    dado() { const g = Grid(10, 10); g.rect(0, 0, 10, 10, '#2a2636'); g.rect(1, 1, 8, 8, '#ffffff'); g.rect(1, 8, 8, 1, '#b8c0e8'); g.rect(8, 1, 1, 8, '#b8c0e8'); [[2, 2], [6, 2], [4, 4], [2, 6], [6, 6]].forEach(([x, y]) => g.rect(x, y, 2, 2, '#e8353f')); return g; },
    keke() { const g = pizzaGrid(); return g; }
  };
  const PUF = {
    puf_azul:   [R.azul, '#150f55', '#8c88ff'],
    puf_rojo:   [R.rojo, '#4a0a14', '#ff8a96'],
    puf_verde:  [R.verde, '#12432a', '#8affc0'],
    puf_rosa:   [['#ffc0e0', '#ff7ab8', '#d04888', '#802858'], '#4a1030', '#ffe0f0'],
    puf_morado: [['#d8b0ff', '#9a5ae8', '#6a30b0', '#401880'], '#2a0a5a', '#ecd8ff'],
    puf_dorado: [R.dorado, '#6a4a08', '#fff6b0']
  };
  function pufGrid(k) { const [ra, ol, hi] = PUF[k], g = Grid(24, 17); capa(g, ol, L => sombrear(L, elipse(12, 9, 11, 8), 12, 9, 11, 8, ra)); g.rect(7, 3, 10, 1, hi); return g; }
  const Jt = (k, n, p, nv, extra) => Object.assign({ tipo: 'cuarto', slot: 'juguete', luz: true, n, p, nv, grid: juguetes[k] }, extra);
  const Pf = (k, n, p, nv) => ({ tipo: 'cuarto', slot: 'deco', n, p, nv, grid: () => pufGrid(k) });
  Object.assign(ITEMS, {
    juguete_pelota: Jt('pelota', 'PELOTA ROJA', 0, 1),
    juguete_azul:   Jt('azul', 'PELOTA AZUL', 30, 1),
    juguete_dado:   Jt('dado', 'DADO GIGANTE', 50, 1),
    juguete_playa:  Jt('playa', 'PELOTA DE PLAYA', 60, 2),
    juguete_disco:  Jt('disco', 'DISCO VOLADOR', 70, 2),
    juguete_patito: Jt('patito', 'PATITO DE GOMA', 80, 2),
    juguete_osito:  Jt('osito', 'OSITO', 90, 3),
    juguete_keke:   Jt('keke', 'KEKE DE PELUCHE', 120, 3),
    puf_azul:   Pf('puf_azul', 'PUF AZUL', 0, 1),
    puf_rojo:   Pf('puf_rojo', 'PUF ROJO', 40, 1),
    puf_verde:  Pf('puf_verde', 'PUF VERDE', 40, 1),
    puf_rosa:   Pf('puf_rosa', 'PUF ROSA', 50, 2),
    puf_morado: Pf('puf_morado', 'PUF MORADO', 60, 2),
    puf_dorado: Pf('puf_dorado', 'PUF DORADO', 140, 4)
  });

  /* ===================== MÁS DECORACIÓN, POR TEMA ===================== */
  const MAD = R.madera, MET = ['#f4f6fa', '#c8d0dc', '#9aa4b8', '#5a6478'], NEG = ['#6a647c', '#3a3548', '#221f30', '#100e18'];
  function sillonGrid() { const g = Grid(26, 20); capa(g, '#241b8c', L => { caja(L, 3, 1, 20, 10, R.azul); caja(L, 0, 5, 6, 13, R.azul); caja(L, 20, 5, 6, 13, R.azul); caja(L, 4, 9, 18, 9, R.azul); }); g.rect(3, 18, 3, 2, '#3a2410'); g.rect(20, 18, 3, 2, '#3a2410'); return g; }
  function chimeneaGrid() {
    const g = Grid(34, 34); capa(g, '#3a1a10', L => caja(L, 0, 0, 34, 34, ['#e08a70', '#b85a48', '#8a3a30', '#5a2018']));
    for (let r = 0, y = 4; y < 34; y += 4, r++) { g.rect(1, y, 32, 1, '#5a2018'); for (let x = r % 2 ? 3 : 7; x < 33; x += 8) g.rect(x, y + 1, 1, 3, '#5a2018'); }
    g.rect(0, 0, 34, 4, MAD[1]); g.rect(0, 0, 34, 1, MAD[0]); g.rect(0, 3, 34, 1, MAD[3]);
    g.rect(7, 13, 20, 21, '#150a06'); g.rect(8, 14, 18, 20, '#2a1208'); g.rect(10, 31, 14, 3, '#6e4422'); g.rect(10, 31, 14, 1, '#a06a38');
    g.art(11, 20, ['....o...o.....', '...ooo.ooo.o..', '..oooyoooyoo..', '.oooyyyoyyyoo.', '.ooyyyyyyyyoo.', '.oyyyWWyyyyyo.', '..oyyWWWyyyo..'], { o: '#ff6a28', y: '#ffd84a', W: '#fff6c0' });
    return g;
  }
  function pianoGrid() {
    const g = Grid(32, 28); capa(g, '#08060c', L => { caja(L, 0, 0, 32, 22, NEG); L.rect(2, 22, 3, 6, NEG[2]); L.rect(27, 22, 3, 6, NEG[2]); });
    g.rect(3, 3, 26, 5, '#100e18'); g.rect(5, 4, 4, 3, '#f4eed8'); g.rect(11, 4, 4, 3, '#f4eed8'); g.rect(17, 4, 4, 3, '#f4eed8');
    g.rect(2, 13, 28, 7, '#f4eed8'); g.rect(2, 13, 28, 1, '#ffffff'); for (let x = 5; x < 29; x += 3) g.rect(x, 13, 1, 7, '#9ea8cf'); [4, 7, 13, 16, 19, 25].forEach(x => g.rect(x, 13, 2, 4, '#100e18'));
    return g;
  }
  function tocadiscosGrid() {
    const g = Grid(22, 20); capa(g, '#3a2410', L => { caja(L, 0, 9, 22, 6, MAD); L.rect(2, 15, 3, 5, MAD[2]); L.rect(17, 15, 3, 5, MAD[2]); });
    capa(g, '#08060c', L => caja(L, 2, 2, 18, 8, NEG)); g.rect(4, 3, 10, 5, '#08060c'); g.rect(8, 5, 2, 1, '#e8353f'); g.rect(15, 3, 1, 5, '#c0c8d8'); g.rect(14, 3, 3, 1, '#c0c8d8'); g.set(18, 4, '#6ae0f0');
    return g;
  }
  function consolaGrid() {
    const g = Grid(22, 14); capa(g, '#08060c', L => caja(L, 2, 1, 18, 6, NEG)); g.rect(4, 3, 8, 1, '#4b6ae8'); g.set(16, 3, '#5ccf5a');
    capa(g, '#232b63', L => { caja(L, 0, 8, 9, 5, R.azul); caja(L, 12, 8, 9, 5, R.rojo); }); g.rect(2, 10, 3, 1, '#ffffff'); g.set(16, 10, '#ffd84a'); g.set(18, 10, '#ffffff'); return g;
  }
  function plantaGrandeGrid() {
    const g = Grid(24, 36); capa(g, '#5a2810', L => caja(L, 6, 26, 12, 10, R.barro));
    capa(g, '#12432a', L => { [[12, 12, 4, 12], [5, 14, 4.5, 8], [19, 14, 4.5, 8], [8, 6, 4, 6], [16, 6, 4, 6], [12, 20, 8, 5]].forEach(([cx, cy, rx, ry]) => sombrear(L, elipse(cx, cy, rx, ry), cx, cy, rx, ry, R.verde)); });
    g.rect(11, 8, 1, 18, '#1d6a38'); g.rect(8, 27, 8, 1, '#f0a070'); return g;
  }
  function cuadroLunaGrid() { const g = Grid(20, 24); capa(g, '#6a4408', L => caja(L, 0, 0, 20, 24, R.dorado)); g.rect(2, 2, 16, 20, '#161a52'); disco(g, 9, 11, 5, '#fff2b0'); disco(g, 11, 10, 4, '#161a52'); [[4, 5], [14, 6], [5, 17], [15, 16], [16, 12]].forEach(([x, y]) => g.set(x, y, '#ffffff')); return g; }
  function mesaGrid() { const g = Grid(34, 26); capa(g, '#3a2410', L => { caja(L, 0, 13, 34, 4, MAD); L.rect(3, 17, 3, 9, MAD[2]); L.rect(28, 17, 3, 9, MAD[2]); }); g.rect(9, 12, 16, 2, '#f4eed8'); g.paste(pizzaGrid(), 10, 0); g.rect(2, 13, 30, 1, MAD[0]); return g; }
  function sillaGrid() { const g = Grid(14, 26); capa(g, '#3a2410', L => { caja(L, 1, 0, 12, 12, MAD); L.rect(1, 12, 12, 4, MAD[1]); L.rect(1, 16, 2, 10, MAD[2]); L.rect(11, 16, 2, 10, MAD[2]); }); g.rect(3, 2, 8, 7, MAD[2]); g.rect(1, 12, 12, 1, MAD[0]); return g; }
  function canastaGrid() { const g = Grid(20, 16); capa(g, '#3a2410', L => { sombrear(L, (x, y) => y >= 8 && elipse(10, 8, 9, 7)(x, y), 10, 11, 9, 7, MAD); });
    [[5, 6, '#e8353f'], [10, 4, '#ffd84a'], [14, 6, '#5ccf5a'], [8, 7, '#ff9a40']].forEach(([x, y, c]) => { capa(g, '#3a1410', L => sombrear(L, elipse(x, y, 3.2, 3.2), x, y, 3.2, 3.2, [c, c, c, '#5a2a10'])); g.set(x - 1, y - 1, '#ffffff'); });
    for (let x = 2; x < 18; x += 3) g.rect(x, 10, 1, 4, MAD[3]); g.rect(1, 12, 18, 1, MAD[3]); return g; }
  function tostadoraGrid() { const g = Grid(18, 12); capa(g, '#3a4458', L => caja(L, 0, 2, 18, 9, MET)); g.rect(3, 3, 5, 1, '#232b63'); g.rect(10, 3, 5, 1, '#232b63'); g.rect(16, 5, 2, 1, '#e8353f'); g.rect(2, 11, 3, 1, '#232b63'); g.rect(13, 11, 3, 1, '#232b63'); g.rect(6, 6, 6, 2, '#ffd84a'); return g; }
  function cafeteraGrid() { const g = Grid(16, 20); capa(g, '#4a0a14', L => { caja(L, 0, 0, 16, 5, R.rojo); caja(L, 12, 5, 4, 14, R.rojo); caja(L, 0, 17, 16, 3, R.rojo); }); g.rect(2, 6, 9, 10, '#cfe8f0'); g.rect(2, 11, 9, 5, '#4a2a10'); g.rect(3, 7, 2, 4, '#ffffff'); g.rect(13, 8, 2, 2, '#ffd84a'); return g; }
  function ollaGrid() { const g = Grid(20, 20); [[6, 1], [10, 0], [14, 2]].forEach(([x, y]) => { g.rect(x, y, 2, 3, '#e8ecff'); g.rect(x + 1, y + 3, 2, 2, '#c8d0e8'); });
    capa(g, '#2a3040', L => { caja(L, 2, 8, 16, 10, MET); L.rect(0, 9, 3, 2, '#9aa4b8'); L.rect(17, 9, 3, 2, '#9aa4b8'); }); g.rect(2, 7, 16, 2, '#5a6478'); g.rect(5, 11, 2, 5, '#ffffff'); return g; }
  function especiasGrid() { const g = Grid(30, 18); g.rect(0, 15, 30, 3, MAD[2]); g.rect(0, 15, 30, 1, MAD[0]); [['#ff6a8a', 2], ['#ffd84a', 9], ['#5ccf5a', 16], ['#6ac0f0', 23]].forEach(([c, x]) => { g.rect(x, 5, 5, 10, c); g.rect(x, 5, 5, 1, '#ffffff'); g.rect(x + 1, 3, 3, 2, '#8a5630'); g.rect(x + 1, 8, 3, 3, '#f4eed8'); }); return g; }
  function sartenesGrid() { const g = Grid(26, 24); g.rect(0, 0, 26, 2, MAD[2]); g.rect(0, 0, 26, 1, MAD[0]);
    [[7, 2], [19, 2]].forEach(([x, y]) => { g.rect(x, y, 1, 4, '#9aa4b8'); capa(g, '#14141e', L => sombrear(L, elipse(x, y + 9, 6, 6), x, y + 9, 6, 6, NEG)); g.rect(x - 2, y + 7, 2, 1, '#9a96a8'); });
    g.rect(13, 2, 1, 12, '#9aa4b8'); capa(g, '#2a3040', L => sombrear(L, elipse(13, 16, 3, 3), 13, 16, 3, 3, MET)); return g; }
  function hornoGrid() { const g = Grid(30, 28); capa(g, '#3a4458', L => caja(L, 0, 0, 30, 28, MET)); g.rect(2, 2, 26, 5, '#5a6478'); [6, 12, 18, 24].forEach(x => g.rect(x, 4, 2, 2, '#ffd84a')); g.rect(3, 9, 24, 16, '#2a3040'); g.rect(5, 11, 20, 12, '#150a06'); g.rect(6, 12, 18, 10, '#ff9a40'); g.paste(pizzaGrid(), 8, 11); g.rect(3, 9, 24, 1, '#9aa4b8'); return g; }
  function delantalGrid() { const g = Grid(16, 22); g.rect(7, 0, 2, 1, '#ffd84a'); capa(g, '#4a0a14', L => { L.rect(4, 2, 8, 4, R.rojo[1]); caja(L, 2, 6, 12, 15, R.rojo); }); g.rect(4, 12, 8, 5, R.rojo[2]); g.rect(4, 12, 8, 1, R.rojo[0]); g.rect(2, 20, 12, 1, '#ffffff'); return g; }
  function zapateroGrid() { const g = Grid(26, 20); capa(g, '#3a2410', L => { caja(L, 0, 0, 26, 20, MAD); }); g.rect(2, 2, 22, 7, '#3a2410'); g.rect(2, 11, 22, 7, '#3a2410'); g.rect(1, 9, 24, 2, MAD[1]);
    [[4, 3, '#e8353f'], [12, 3, '#4b6ae8'], [19, 3, '#ffd84a'], [4, 12, '#5ccf5a'], [14, 12, '#ff7ab8']].forEach(([x, y, c]) => { g.rect(x, y + 3, 6, 3, c); g.rect(x, y, 3, 3, c); g.rect(x, y + 6, 6, 1, '#f4eed8'); }); return g; }
  function paraguasGrid() { const g = Grid(16, 30); capa(g, '#2a3040', L => caja(L, 2, 18, 12, 12, MET)); g.rect(3, 20, 10, 2, '#5a6478');
    capa(g, '#4a0a14', L => { L.rect(5, 2, 3, 17, R.rojo[1]); L.rect(8, 0, 3, 19, '#4b6ae8'); }); g.set(6, 1, '#ffffff'); g.rect(5, 2, 1, 5, R.rojo[0]); return g; }
  function bancaEntradaGrid() { const g = Grid(32, 20); capa(g, '#3a2410', L => { caja(L, 0, 6, 32, 5, MAD); L.rect(2, 11, 3, 9, MAD[2]); L.rect(27, 11, 3, 9, MAD[2]); L.rect(0, 0, 2, 7, MAD[1]); L.rect(30, 0, 2, 7, MAD[1]); }); capa(g, '#241b8c', L => caja(L, 3, 3, 26, 5, R.azul)); g.rect(3, 4, 26, 1, R.azul[0]); return g; }
  function buzonGrid() { const g = Grid(18, 30); g.rect(7, 12, 4, 18, MAD[2]); g.rect(7, 12, 1, 18, MAD[1]); capa(g, '#4a0a14', L => { caja(L, 1, 2, 16, 10, R.rojo); }); g.rect(3, 6, 12, 2, '#150a06'); g.rect(15, 0, 3, 5, '#ffd84a'); g.rect(15, 0, 1, 5, '#8a5a10'); g.rect(4, 3, 4, 1, R.rojo[0]); return g; }
  function espejoPieGrid() { const g = Grid(18, 36); capa(g, '#6a4408', L => sombrear(L, elipse(9, 15, 8.4, 14.4), 9, 15, 8.4, 14.4, R.dorado)); g.rect(3, 4, 12, 24, '#bfe4ff'); g.rect(3, 4, 12, 8, '#e0f4ff'); g.rect(5, 6, 2, 8, '#ffffff'); g.rect(8, 29, 2, 7, MAD[2]); g.rect(3, 34, 12, 2, MAD[3]); return g; }
  function plantaAltaGrid() { const g = Grid(16, 38); capa(g, '#5a2810', L => caja(L, 3, 30, 10, 8, R.barro)); g.rect(7, 12, 2, 19, '#6a4020');
    capa(g, '#12432a', L => { [[8, 6, 7, 5], [3, 12, 4, 3], [13, 12, 4, 3], [8, 17, 6, 2.5], [4, 22, 3.5, 2.5], [12, 22, 3.5, 2.5]].forEach(([cx, cy, rx, ry]) => sombrear(L, elipse(cx, cy, rx, ry), cx, cy, rx, ry, R.verde)); }); return g; }
  function tapeteBienvenidaGrid() { const g = Grid(32, 9); g.rect(0, 0, 32, 9, '#4a2a10'); g.rect(1, 1, 30, 7, '#c8884a'); g.rect(3, 2, 26, 5, '#8a1c28'); g.rect(4, 3, 24, 3, '#c23a48'); g.art(13, 3, ['.rr.rr.', 'rrrrrrr', '.rrrrr.', '..rrr..'].map(r => r), { r: '#ffd0d8' }); for (let x = 1; x < 31; x += 3) g.set(x, 0, '#f4eed8'); return g; }
  function perchaPared() { const g = Grid(28, 18); g.rect(0, 10, 28, 4, MAD[1]); g.rect(0, 10, 28, 1, MAD[0]); g.rect(0, 13, 28, 1, MAD[3]); [5, 13, 21].forEach(x => { g.rect(x, 14, 2, 3, '#ffd84a'); g.rect(x, 8, 2, 2, '#ffd84a'); });
    g.art(1, 2, ['..rrrr..', '.rrrrrr.', 'rrrrrrrr', 'wwwwwwww'], { r: '#e8353f', w: '#f4eed8' }); g.rect(14, 10, 4, 7, '#3a47a8'); g.rect(14, 10, 1, 7, '#6a78d8'); g.rect(21, 14, 4, 4, '#5ccf5a'); return g; }
  function letreroGrid() { const g = Grid(24, 20); g.rect(5, 0, 1, 5, '#9aa4b8'); g.rect(18, 0, 1, 5, '#9aa4b8'); capa(g, '#3a2410', L => caja(L, 1, 5, 22, 14, MAD)); g.rect(3, 7, 18, 10, MAD[0]); g.art(8, 9, ['.rr.rr.', 'rrrrrrr', 'rrrrrrr', '.rrrrr.', '..rrr..', '...r...'], { r: '#e8353f' }); return g; }
  function farolGrid() { const g = Grid(14, 28); g.rect(6, 12, 2, 16, '#3a3548'); g.rect(3, 26, 8, 2, '#3a3548'); g.rect(4, 1, 6, 2, '#3a3548'); g.rect(5, 0, 4, 1, '#3a3548'); capa(g, '#3a3548', L => L.rect(3, 3, 8, 9, '#ffe9a0')); g.rect(4, 4, 6, 7, '#ffd84a'); g.rect(6, 5, 2, 5, '#fff6c0'); g.rect(3, 12, 8, 1, '#3a3548'); return g; }
  function floreroGrid() { const g = Grid(16, 24); capa(g, '#3a1a6a', L => sombrear(L, (x, y) => y >= 12 && elipse(8, 16, 5.5, 8)(x, y), 8, 16, 5.5, 8, ['#d8b0ff', '#9a5ae8', '#6a30b0', '#401880'])); g.rect(6, 11, 4, 2, '#6a30b0');
    [[8, 3, '#ff6a8a'], [4, 6, '#ffd84a'], [12, 6, '#ffffff'], [8, 8, '#ff9a40']].forEach(([x, y, c]) => { g.rect(x - 1, y - 1, 3, 3, c); g.set(x, y, '#ffe45a'); g.rect(x, y + 2, 1, 9 - y + 2, '#2f9a4a'); }); return g; }
  function solSonrienteGrid() {
    const g = Grid(22, 22), cx = 11, cy = 11;
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4, x1 = cx + Math.cos(a) * 10, y1 = cy + Math.sin(a) * 10;
      const pa = a + .2, pb = a - .2, x0a = cx + Math.cos(pa) * 6.4, y0a = cy + Math.sin(pa) * 6.4, x0b = cx + Math.cos(pb) * 6.4, y0b = cy + Math.sin(pb) * 6.4;
      linea(g, Math.round(x0a), Math.round(y0a), Math.round(x1), Math.round(y1), '#ffd84a');
      linea(g, Math.round(x0b), Math.round(y0b), Math.round(x1), Math.round(y1), '#ffd84a');
    }
    capa(g, '#b86a10', L => sombrear(L, elipse(cx, cy, 6, 6), cx, cy, 6, 6, ['#fff6b0', '#ffd84a', '#ffa820', '#e07a10']));
    g.rect(cx - 3, cy - 2, 1, 2, '#5a3008'); g.rect(cx + 2, cy - 2, 1, 2, '#5a3008');
    for (let x = cx - 2; x <= cx + 2; x++) g.set(x, cy + 2, '#5a3008');
    g.set(cx - 3, cy + 1, '#5a3008'); g.set(cx + 3, cy + 1, '#5a3008');
    return g;
  }
  const nuevosItems = {
    sillon: ['SILLÓN', 120, 2, 'deco', sillonGrid, 'sala'], chimenea: ['CHIMENEA', 240, 3, 'deco', chimeneaGrid, 'sala', 1], piano: ['PIANO', 300, 5, 'deco', pianoGrid, 'sala'],
    tocadiscos: ['TOCADISCOS', 130, 3, 'deco', tocadiscosGrid, 'sala'], consola: ['VIDEOJUEGOS', 90, 2, 'deco', consolaGrid, 'sala'], planta_grande: ['PLANTA GRANDE', 90, 2, 'deco', plantaGrandeGrid, 'sala'], cuadro_luna: ['CUADRO DE LUNA', 70, 1, 'decoP', cuadroLunaGrid, 'sala'],
    mesa: ['MESA', 110, 3, 'deco', mesaGrid, 'cocina'], silla: ['SILLA', 40, 1, 'deco', sillaGrid, 'cocina'], canasta: ['CANASTA DE FRUTAS', 45, 1, 'deco', canastaGrid, 'cocina'], tostadora: ['TOSTADORA', 35, 1, 'deco', tostadoraGrid, 'cocina'],
    cafetera: ['CAFETERA', 55, 2, 'deco', cafeteraGrid, 'cocina'], olla: ['OLLA', 50, 1, 'deco', ollaGrid, 'cocina'], especias: ['ESPECIAS', 60, 2, 'decoP', especiasGrid, 'cocina'], sartenes: ['SARTENES', 60, 2, 'decoP', sartenesGrid, 'cocina'],
    horno: ['HORNO DE KEKE', 180, 4, 'deco', hornoGrid, 'cocina', 1], delantal: ['DELANTAL', 40, 1, 'decoP', delantalGrid, 'cocina'],
    zapatero: ['ZAPATERO', 70, 2, 'deco', zapateroGrid, 'entrada'], paraguas: ['PARAGÜERO', 45, 1, 'deco', paraguasGrid, 'entrada'], banca_entrada: ['BANCA', 90, 3, 'deco', bancaEntradaGrid, 'entrada'], buzon: ['BUZÓN', 60, 2, 'deco', buzonGrid, 'entrada'],
    espejo_pie: ['ESPEJO DE PIE', 110, 3, 'deco', espejoPieGrid, 'entrada'], planta_alta: ['PALMERA', 70, 2, 'deco', plantaAltaGrid, 'entrada'], tapete: ['TAPETE BIENVENIDA', 40, 1, 'deco', tapeteBienvenidaGrid, 'entrada'],
    percha: ['PERCHA', 50, 1, 'decoP', perchaPared, 'entrada'], letrero: ['LETRERO DE CASA', 45, 1, 'decoP', letreroGrid, 'entrada'], farol: ['FAROL', 60, 2, 'deco', farolGrid, 'entrada', 1],
    florero: ['FLORERO', 40, 1, 'deco', floreroGrid, 'todas'], neon_estrella: ['SOL SONRIENTE', 120, 3, 'decoP', solSonrienteGrid, 'todas', 1]
  };

  /* ===================== ESTUDIO: cuarto, escritorio y muebles ===================== */
  const EST_T = {
    E: { sky: ['#6ab4f0', '#8ccaf6', '#b0e0fa', '#dcf2ff', '#fff4d8'], wall: '#d9a272', wall2: '#d19a6a', desk: ['#c88850', '#8a5a30', '#e8aa70'], glow: '255,236,170', ga: .05, cup: '#ff8a70', vig: .2, sun: 1, hills: ['#8ac870', '#6ab058'], trees: ['#4a9a50', '#3a8044', '#6ab868'], grass: ['#7ac060', '#5aa048'], fr: '#8a5a34' },
    B: { sky: ['#6a5aa8', '#c8708a', '#f09a6a', '#ffc070', '#ffe4a0'], wall: '#c48860', wall2: '#bc805a', desk: ['#b87848', '#7a4a2a', '#d89a68'], glow: '255,200,120', ga: .12, cup: '#ffd84a', vig: .26, sun: 2, hills: ['#c89a50', '#a07040'], trees: ['#7a7a40', '#5a6038', '#9a9a50'], grass: ['#a8a848', '#808838'], fr: '#7a4a2a' },
    N: { sky: ['#141a48', '#242c68', '#3a3a88', '#7a5090', '#d88a6a'], wall: '#5a3a4c', wall2: '#533446', desk: ['#7a4a38', '#4a2a28', '#9a6a50'], glow: '255,214,140', ga: .2, cup: '#ff8ab0', vig: .34, moon: 1, hills: ['#2a4a58', '#1e3a48'], trees: ['#1a3a48', '#122c3a', '#2a5a60'], grass: ['#2a5a4a', '#1e4a3c'], fr: '#4a2a1e' }
  };
  function estTema() {
    const h = new Date(ahora()).getHours();
    return { k: h >= 20 || h < 6 ? 'N' : h >= 17 ? 'B' : 'E' };
  }
  const EST_K = 2;
  const estDY = () => Math.round(LH * .58) - 24;
  function estudioGrid(W, H, OX, DY, P) {
    const g = Grid(W, H), wx = OX + 5, wt = 5, wb = DY - 3, x0 = wx + 3, x1 = wx + 107, y0 = wt + 3, y1 = wb - 3, sh = (y1 - y0) / 5;
    const ov = (cx, cy, rx, ry, col) => { for (let yy = -ry; yy <= ry; yy++) { const w = Math.round(rx * Math.sqrt(1 - (yy / ry) * (yy / ry))); g.rect(cx - w, cy + yy, w * 2, 1, col); } };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) g.set(x, y, x % 12 < 6 ? P.wall : P.wall2);
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const f = (y - y0) / sh, b = Math.min(4, Math.floor(f)), fr = f - b; g.set(x, y, P.sky[Math.min(4, b + (fr > .8 && (x + y) % 2 ? 1 : 0))]); }
    const hy = y1 - 30;
    if (P.sun) { const sx = wx + 34, sy = P.sun === 1 ? y0 + 20 : hy - 4; ov(sx, sy, 17, 17, P.sun === 1 ? '#fff0b8' : '#ffd890'); for (let y = -17; y <= 17; y++) for (let x = -17; x <= 17; x++) if (x * x + y * y <= 289 && (x + y) % 2) g.set(sx + x, sy + y, P.sky[P.sun === 1 ? 3 : 2]); ov(sx, sy, 11, 11, P.sun === 1 ? '#fff6c8' : '#ffe0a0'); ov(sx, sy, 8, 8, P.sun === 1 ? '#fffbe8' : '#fff0c0'); }
    if (P.moon) { ov(wx + 84, y0 + 16, 8, 8, '#f8f2d0'); ov(wx + 87, y0 + 14, 7, 7, P.sky[1]); for (let i = 0; i < 22; i++) g.set(x0 + 4 + (i * 41) % 98, y0 + 3 + (i * 29) % 34, '#fff6d8'); }
    for (let x = x0; x < x1; x++) { const h = hy - 6 - Math.round(5 * Math.sin(x / 9 + 1) + 3 * Math.sin(x / 4)); g.rect(x, h, 1, y1 - h, P.hills[0]); const h2 = hy + 3 - Math.round(4 * Math.sin(x / 7 + 3)); g.rect(x, h2, 1, y1 - h2, P.hills[1]); }
    [[wx + 14, hy + 2, 9, 11], [wx + 30, hy + 6, 7, 8], [wx + 92, hy, 15, 18]].forEach(([cx, by, rx, ry]) => { g.rect(cx - 1, by - 2, 3, 12, '#5a3a26'); ov(cx, by - ry + 2, rx, ry, P.trees[0]); ov(cx - 2, by - ry - 1, Math.round(rx * .7), Math.round(ry * .7), P.trees[2]); for (let i = 0; i < 6; i++) g.rect(cx - rx + 3 + (i * 7) % (rx * 2 - 5), by - ry + (i * 5) % ry, 2, 2, P.trees[1]); });
    g.rect(x0, y1 - 15, x1 - x0, 15, P.grass[0]); for (let x = x0; x < x1; x++) if (x % 3 === 0) g.set(x, y1 - 15, P.grass[1]);
    for (let x = x0 + 2; x < x1 - 3; x += 6) { g.rect(x, y1 - 21, 3, 13, '#f6eedc'); g.set(x + 1, y1 - 22, '#f6eedc'); g.rect(x, y1 - 21, 1, 13, '#fffaf0'); }
    g.rect(x0, y1 - 18, x1 - x0, 2, '#e8dcc4'); g.rect(x0, y1 - 11, x1 - x0, 2, '#e8dcc4');
    for (let i = 0; i < 9; i++) ov(x0 + 6 + i * 12, y1 - 6, 8, 5, i % 2 ? P.trees[0] : P.trees[1]);
    const FC = ['#ff7a9a', '#ffd84a', '#ffffff', '#ff9a40', '#c08aff', '#ff5a6a'];
    for (let i = 0; i < 30; i++) { const fx = x0 + 3 + (i * 17) % 100, fy = y1 - 9 + (i * 7) % 8; g.rect(fx, fy, 2, 2, FC[i % 6]); g.set(fx, fy, '#fff8c0'); }
    g.rect(x0, y1 - 1, x1 - x0, 1, P.grass[1]);
    const F = P.fr;
    g.rect(wx, wt, 110, 3, F); g.rect(wx, wt, 3, wb - wt + 2, F); g.rect(wx + 107, wt, 3, wb - wt + 2, F); g.rect(wx + 53, wt, 3, wb - wt, F); g.rect(wx, wt, 110, 1, P.desk[2]);
    g.rect(wx - 2, wb - 1, 114, 5, P.desk[2]); g.rect(wx - 2, wb - 1, 114, 1, '#ffffff'); g.rect(wx - 2, wb + 3, 114, 1, P.desk[1]);
    for (let i = 0; i < W; i++) g.set(i, 1 + Math.round(4 * Math.sin(i / W * Math.PI * 4) + 4), '#3a2418');
    { const sy = estShelfY(DY); g.rect(x0, sy, x1 - x0, 3, P.desk[2]); g.rect(x0, sy + 3, x1 - x0, 1, P.desk[1]); g.rect(x0, sy, x1 - x0, 1, '#ffffff'); g.rect(x0 + 8, sy + 4, 2, 6, P.desk[1]); g.rect(x1 - 10, sy + 4, 2, 6, P.desk[1]); }
    // escritorio (superficie profunda y cosas al doble de tamaño, como Simon)
    g.rect(0, DY, W, 22, P.desk[0]); g.rect(0, DY, W, 2, P.desk[2]); g.rect(0, DY + 9, W, 1, P.desk[1]); g.rect(0, DY + 16, W, 1, P.desk[1]); g.rect(0, DY + 22, W, 5, P.desk[1]); g.rect(0, DY + 27, W, H, P.wall);
    g.rect(OX + 4, DY - 4, 14, 4, '#2a2030'); g.rect(OX + 10, DY - 28, 3, 24, '#2a2030'); g.rect(OX, DY - 40, 22, 14, '#2a2030'); g.rect(OX + 1, DY - 39, 20, 12, '#ffd890'); g.rect(OX + 2, DY - 38, 18, 4, '#fff0c0'); g.rect(OX + 1, DY - 28, 20, 1, '#c89a50');
    g.rect(OX + 22, DY - 14, 14, 14, '#c0603a'); g.rect(OX + 21, DY - 16, 16, 3, '#d8744a'); g.rect(OX + 22, DY - 13, 14, 1, '#e08a5a'); g.rect(OX + 28, DY - 44, 3, 30, '#2f9a4a');
    g.rect(OX + 18, DY - 42, 10, 5, '#4ac07a'); g.rect(OX + 31, DY - 48, 12, 5, '#4ac07a'); g.rect(OX + 20, DY - 30, 8, 4, '#2f9a4a'); g.rect(OX + 31, DY - 34, 10, 4, '#4ac07a'); g.rect(OX + 25, DY - 52, 7, 6, '#4ac07a');
    g.rect(OX + 98, DY - 8, 22, 8, '#8a5ae8'); g.rect(OX + 98, DY - 8, 22, 2, '#b08aff'); g.rect(OX + 100, DY - 16, 20, 8, '#e8556a'); g.rect(OX + 100, DY - 16, 20, 2, '#ff8a9a'); g.rect(OX + 102, DY - 23, 18, 7, '#ffd84a'); g.rect(OX + 102, DY - 23, 18, 2, '#fff0a0');
    g.rect(OX + 104, DY - 37, 12, 14, P.cup); g.rect(OX + 116, DY - 33, 4, 7, P.cup); g.rect(OX + 106, DY - 36, 8, 3, '#4a2a1a');
    // respaldo de la silla (detrás de Simon)
    const cx0 = SX + 28 - 62, ct = SY + 62; g.rect(cx0, ct, 124, H, '#5a3020'); g.rect(cx0 + 2, ct + 2, 120, H, '#8a5238'); g.rect(cx0 + 4, ct + 4, 116, 2, '#b07a58');
    return g;
  }

  function dibujarEstDeco(DY, zona) {
    const sel = edit && edit.sel != null ? e.deco[edit.sel] : null;
    if (sel && sel.h === 'estudio' && ITEMS[sel.k] && ITEMS[sel.k].zona === zona && (tk >> 3) % 2) {   // marcas de los lugares libres mientras arrastras
      ctx.fillStyle = 'rgba(255,255,255,.55)'; estSlotsX(zona).forEach(x => { if (zona === 'col') ctx.fillRect(OX + x - 2, 9, 4, 2); else ctx.fillRect(OX + x - 6, estShelfY(DY) - 2, 12, 2); });
    }
    e.deco.forEach((d, i) => {
      if (d.h !== 'estudio' || !ITEMS[d.k] || ITEMS[d.k].zona !== zona) return;
      const r = estPos(d), sp = sprite('mu_' + d.k, ITEMS[d.k].grid, e.dormido ? .55 : 0), ox = zona === 'col' ? Math.round(Math.sin(tk / 18 + i * 1.7) * 1.4) : 0;
      if (zona === 'est') { ctx.fillStyle = 'rgba(30,12,40,.25)'; ctx.fillRect(r.x + 1, r.base, r.w - 2, 1); }
      if (d.f) { ctx.save(); ctx.translate(r.x + r.w + ox, r.y); ctx.scale(-1, 1); ctx.drawImage(sp, 0, 0); ctx.restore(); } else ctx.drawImage(sp, r.x + ox, r.y);
      if (edit && edit.sel === i) { ctx.fillStyle = (tk >> 2) % 2 ? '#ffe45a' : '#ffffff'; ctx.fillRect(r.x - 2, r.y - 2, r.w + 4, 1); ctx.fillRect(r.x - 2, r.y + r.h + 1, r.w + 4, 1); ctx.fillRect(r.x - 2, r.y - 2, 1, r.h + 4); ctx.fillRect(r.x + r.w + 1, r.y - 2, 1, r.h + 4); }
    });
  }
  function estudioFondo(n) {
    const T = estTema(), P = EST_T[T.k], DY = estDY(), wx = OX + 5, wb = DY - 3, x0 = wx + 3, x1 = wx + 107, y0 = 8, y1 = wb - 3;
    ctx.drawImage(sprite('estudio' + LW + 'x' + LH + '|' + SY + T.k, () => estudioGrid(LW, LH, OX, DY, P), n ? .55 : 0), 0, 0);
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip();
    const AM = estAmbActivo(), IW = x1 - x0, IH = y1 - y0;
    if (T.k !== 'N' && !AM) {
      ctx.fillStyle = T.k === 'E' ? '#ffffff' : '#ffe0c0';
      for (let i = 0; i < 3; i++) { const cx = x0 - 24 + ((tk * .12 + i * 52) % (x1 - x0 + 48)), cy = y0 + 6 + i * 11; ctx.fillRect(cx, cy, 18, 4); ctx.fillRect(cx + 3, cy - 2, 9, 2); ctx.fillRect(cx - 3, cy + 2, 24, 3); }
      for (let i = 0; i < 2; i++) { const bx = Math.round(x0 + 40 + i * 28 + Math.sin(tk / 22 + i * 2) * 26), by = Math.round(y1 - 24 + Math.cos(tk / 13 + i) * 7), a = (tk >> 1) % 2; ctx.fillStyle = i ? '#ffd84a' : '#ff8ad8'; ctx.fillRect(bx - 2, by - (a ? 1 : 0), 2, a ? 3 : 2); ctx.fillRect(bx + 1, by - (a ? 1 : 0), 2, a ? 3 : 2); ctx.fillStyle = '#4a3040'; ctx.fillRect(bx, by, 1, 2); }
    } else if (!AM) {
      for (let i = 0; i < 9; i++) { if (((tk >> 3) + i) % 5 < 3) { const fx = x0 + 6 + (i * 29) % 96, fy = Math.round(y1 - 32 + (i * 13) % 26 + Math.sin(tk / 15 + i) * 2); ctx.fillStyle = 'rgba(255,246,160,.3)'; ctx.fillRect(fx - 1, fy - 1, 4, 4); ctx.fillStyle = '#fff6a0'; ctx.fillRect(fx, fy, 2, 2); } }
      if ((tk >> 3) % 2) { ctx.fillStyle = '#ffffff'; const q = (tk >> 4) % 22; ctx.fillRect(x0 + 3 + (q * 41) % 98, y0 + 3 + (q * 29) % 34, 3, 1); }
    }
    if (AM) {
      const TT = AM === 'tormenta';
      ctx.fillStyle = TT ? 'rgba(40,50,80,.55)' : 'rgba(80,95,130,.4)'; ctx.fillRect(x0, y0, IW, IH);
      const gota = (i, vel, len, col) => { const y = (i * 53 + tk * vel) % (IH + 8) - 4, x = ((i * 37) % IW - Math.floor(y / 5) + IW * 3) % IW; ctx.fillStyle = col; for (let k = 0; k < len; k++) ctx.fillRect(x0 + (x - (k >> 1) + IW) % IW, y0 + y + k, 1, 1); };
      for (let i = 0; i < (TT ? 56 : 38); i++) gota(i, TT ? 4 : 3, 3, 'rgba(205,222,255,.38)');
      for (let i = 0; i < (TT ? 38 : 24); i++) gota(i + 97, TT ? 7 : 5, 6, 'rgba(235,244,255,.7)');
      for (let i = 0; i < 7; i++) { const bx = x0 + 9 + i * 14 + (i * 5) % 7, by = y0 + ((tk * (.12 + (i % 3) * .07)) + i * 31) % IH; ctx.fillStyle = 'rgba(235,245,255,.25)'; ctx.fillRect(bx, by - 9, 1, 8); ctx.fillStyle = 'rgba(245,250,255,.9)'; ctx.fillRect(bx, by, 2, 2); }
      for (let i = 0; i < 8; i++) { const ph = (tk + i * 7) % 20; if (ph < 6) { const sx = x0 + 6 + (i * 41) % (IW - 10), sy = y1 - 2 - (i % 3) * 3; ctx.fillStyle = 'rgba(235,245,255,.7)'; if (ph < 2) ctx.fillRect(sx, sy, 1, 1); else { ctx.fillRect(sx - (ph >> 1), sy, (ph >> 1) * 2 + 1, 1); } } }
    }
    if (estRayo > 0) { ctx.fillStyle = estRayo > 2 ? 'rgba(255,255,255,.7)' : 'rgba(255,255,255,.3)'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0); estRayo--; }
    ctx.restore();
    if (T.k !== 'N' && !AM) { ctx.fillStyle = T.k === 'E' ? 'rgba(255,244,190,.09)' : 'rgba(255,190,110,.11)'; for (let k = 0; k < 3; k++) for (let y = wb + 3; y < DY + 22; y++) { const dx = (y - wb) * .55; ctx.fillRect(Math.round(wx + 14 + dx + k * 36), y, 14, 1); } }
    ctx.fillStyle = 'rgba(' + P.glow + ',' + P.ga + ')'; for (let j = 0; j < 40; j++) ctx.fillRect(OX + 10 - j, Math.min(DY + 20, DY - 26 + j), 20 + j * 2, 1);
    dibujarEstDeco(DY, 'est'); dibujarLibros(DY); dibujarEstDeco(DY, 'col');
    const cols = ['#ff8ab0', '#ffd84a', '#7ae8e0', '#ff9a40', '#c08aff'];
    for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) { const xx = 6 + j * 23 + i * 4; if (xx >= LW - 2) continue; const yy = 2 + Math.round(4 * Math.sin(xx / LW * Math.PI * 4) + 4), on = ((tk >> 3) + i + j) % 4 !== 0; ctx.fillStyle = on ? cols[(i + j) % 5] : '#6a4a3a'; ctx.fillRect(xx, yy + 1, 2, 3); if (on) { ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(xx - 1, yy, 4, 5); } }
    ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(OX + 108 + ((tk >> 3) % 2) * 2, DY - 42 - ((tk >> 2) % 4), 2, 5); ctx.fillRect(OX + 112 - ((tk >> 3) % 2) * 2, DY - 47 - ((tk >> 2) % 4), 2, 4);
  }
  const ESTAUD = () => { const g = Grid(SW, 30); const P = '#ff8ab0'; for (let a = 0; a < 40; a++) { const t = Math.PI + a / 39 * Math.PI, bx = Math.round(28 + 26.5 * Math.cos(t)), by = Math.round(22 + 21.5 * Math.sin(t)); if (a < 10 || a > 29) { g.rect(bx, by, 2, 2, '#1a1030'); } }
    [[3, 22], [53, 22]].forEach(([cx, cy]) => { for (let yy = -9; yy <= 9; yy++) { const w = Math.round(5 * Math.sqrt(1 - (yy / 9) * (yy / 9))); g.rect(cx - w, cy + yy, w * 2, 1, '#1a1030'); } for (let yy = -7; yy <= 7; yy++) { const w = Math.round(3.5 * Math.sqrt(1 - (yy / 7) * (yy / 7))); g.rect(cx - w, cy + yy, w * 2, 1, P); } g.rect(cx - 2, cy - 4, 2, 2, '#ffd0e0'); }); return g; };
  function estudioFrente(n, oy, gx, esx) {
    ctx.save(); ctx.translate(SX + 28 + gx, SY + 32 + oy); ctx.scale(EST_K * esx, EST_K);
    ctx.drawImage(sprite('estaud', ESTAUD, n ? .22 : 0), -28, -22);
    const P = EST_T[estTema().k];
    ctx.fillStyle = 'rgba(' + P.glow + ',.16)'; for (let yy = -16; yy <= 16; yy++) { const w = Math.round(5 * Math.sqrt(1 - (yy / 17) * (yy / 17))); ctx.fillRect(25 - w + 2, yy, w, 1); }
    ctx.restore();
  }
  function estudioViñeta() {
    for (let i = 0; i < 24; i++) { ctx.fillStyle = 'rgba(30,10,0,' + (EST_T[estTema().k].vig * (1 - i / 24)).toFixed(2) + ')'; ctx.fillRect(0, i, LW, 1); ctx.fillRect(0, LH - 1 - i, LW, 1); ctx.fillRect(i, 0, 1, LH); ctx.fillRect(LW - 1 - i, 0, 1, LH); }
  }
  function escritorioGrid() {
    const g = Grid(92, 34);
    g.rect(0, 0, 92, 5, '#e0b070'); g.rect(0, 0, 92, 1, '#fff0c8'); g.rect(0, 4, 92, 1, '#8a5630');
    g.rect(2, 5, 88, 24, '#b87a44'); g.rect(2, 5, 88, 2, '#8a5630');
    g.rect(6, 10, 38, 17, '#c98a52'); g.rect(48, 10, 38, 17, '#c98a52'); g.rect(6, 10, 38, 1, '#e8b078'); g.rect(48, 10, 38, 1, '#e8b078');
    g.rect(22, 17, 6, 2, '#ffd84a'); g.rect(64, 17, 6, 2, '#ffd84a');
    g.rect(2, 29, 88, 1, '#6a4222'); g.rect(2, 29, 7, 5, '#8a5630'); g.rect(83, 29, 7, 5, '#8a5630');
    return g;
  }
  /* ---- objetos EXCLUSIVOS del estudio: estante (deco) y colgantes (decoP) ---- */
  function ovalG(g, cx, cy, rx, ry, c) { for (let y = -ry; y <= ry; y++) { const w = Math.round(rx * Math.sqrt(1 - (y / ry) * (y / ry))); g.rect(cx - w, cy + y, w * 2, 1, c); } }
  function peluSimonGrid() { const g = Grid(18, 22); ovalG(g, 9, 17, 6, 5, '#4a8ae8'); g.rect(3, 14, 2, 5, '#4a8ae8'); g.rect(13, 14, 2, 5, '#4a8ae8'); ovalG(g, 9, 10, 8, 7, '#f4f6ff'); ovalG(g, 9, 12, 8, 5, '#e4e8fa'); g.rect(4, 8, 3, 4, '#1a1030'); g.rect(11, 8, 3, 4, '#1a1030'); g.set(4, 8, '#8a8ab8'); g.set(11, 8, '#8a8ab8'); g.rect(2, 12, 2, 1, '#ffa0b6'); g.rect(14, 12, 2, 1, '#ffa0b6'); g.rect(8, 13, 2, 1, '#1a1030'); g.rect(5, 3, 8, 2, '#e8556a'); g.rect(6, 1, 2, 3, '#e8556a'); g.rect(8, 0, 2, 4, '#e8556a'); g.rect(10, 1, 2, 3, '#e8556a'); g.contour('#1a1030'); return g; }
  function globoEstGrid() { const g = Grid(16, 22); ovalG(g, 8, 8, 7, 7, '#4a8ae8'); g.rect(4, 4, 4, 3, '#4ac07a'); g.rect(9, 8, 4, 4, '#4ac07a'); g.rect(5, 10, 2, 2, '#4ac07a'); g.rect(3, 5, 1, 3, '#8ac8ff'); g.rect(7, 15, 2, 3, '#8a5630'); g.rect(4, 18, 8, 2, '#8a5630'); g.contour('#2a1a10'); return g; }
  function relojArenaGrid() { const g = Grid(12, 20); for (let y = 0; y < 8; y++) { const w = Math.max(2, Math.floor(10 - y * 1.3)); g.rect(6 - (w >> 1), 2 + y, w, 1, '#cfe8ff'); g.rect(6 - (w >> 1), 17 - y, w, 1, '#cfe8ff'); } g.rect(3, 5, 6, 3, '#ffd84a'); g.rect(5, 9, 2, 2, '#ffd84a'); g.rect(3, 15, 6, 2, '#ffd84a'); g.rect(1, 0, 10, 2, '#8a5630'); g.rect(1, 18, 10, 2, '#8a5630'); g.contour('#2a1a10'); return g; }
  function cactusEstGrid() { const g = Grid(12, 16); g.rect(2, 10, 8, 6, '#c0603a'); g.rect(2, 10, 8, 1, '#e08a5a'); g.rect(4, 2, 4, 9, '#3a9a50'); g.rect(1, 5, 3, 2, '#3a9a50'); g.rect(1, 3, 2, 3, '#3a9a50'); g.rect(8, 6, 3, 2, '#3a9a50'); g.rect(10, 4, 2, 3, '#3a9a50'); g.rect(5, 3, 1, 7, '#5ac870'); g.set(5, 1, '#ff7a9a'); g.contour('#1a4a2a'); return g; }
  function marcoEstGrid() { const g = Grid(16, 18); g.rect(0, 0, 16, 15, '#c98a52'); g.rect(2, 2, 12, 11, '#bfe6ff'); g.rect(9, 3, 3, 3, '#ffe45a'); g.rect(2, 10, 12, 3, '#6cc462'); g.rect(3, 8, 4, 2, '#4ac07a'); g.rect(0, 0, 16, 1, '#e8b078'); g.rect(6, 15, 4, 3, '#8a5630'); g.contour('#2a1a10'); return g; }
  function trofeoEstGrid() { const g = Grid(14, 20); g.rect(3, 1, 8, 7, '#ffd84a'); g.rect(4, 8, 6, 2, '#ffd84a'); g.rect(6, 10, 2, 4, '#e8b020'); g.rect(3, 14, 8, 2, '#8a5630'); g.rect(4, 16, 6, 3, '#c98a52'); g.rect(0, 2, 3, 1, '#ffd84a'); g.rect(0, 2, 1, 4, '#ffd84a'); g.rect(1, 5, 2, 1, '#ffd84a'); g.rect(11, 2, 3, 1, '#ffd84a'); g.rect(13, 2, 1, 4, '#ffd84a'); g.rect(11, 5, 2, 1, '#ffd84a'); g.rect(4, 2, 1, 5, '#fff6a0'); g.set(7, 4, '#e8b020'); g.contour('#2a1a10'); return g; }
  function radioEstGrid() { const g = Grid(20, 16); g.rect(0, 3, 20, 13, '#c0603a'); g.rect(0, 3, 20, 2, '#e08a5a'); g.rect(2, 6, 9, 8, '#6a2a1a'); for (let y = 7; y < 14; y += 2) g.rect(2, y, 9, 1, '#a04a30'); ovalG(g, 15, 9, 3, 3, '#f4ecd8'); g.set(15, 9, '#c0603a'); g.rect(13, 13, 2, 2, '#2a1a10'); g.rect(17, 13, 2, 2, '#2a1a10'); g.rect(16, 0, 1, 3, '#cfcfe0'); g.rect(14, 0, 3, 1, '#cfcfe0'); g.contour('#2a1a10'); return g; }
  function ovniEstGrid() { const g = Grid(20, 14); ovalG(g, 10, 5, 5, 5, '#a8e8ff'); g.rect(9, 4, 3, 3, '#7ae87a'); g.set(9, 5, '#1a1030'); g.set(11, 5, '#1a1030'); g.rect(7, 2, 2, 2, '#e8faff'); ovalG(g, 10, 9, 9, 3, '#b0b8d0'); ovalG(g, 10, 10, 9, 2, '#8890b0'); g.rect(4, 9, 2, 1, '#ffd84a'); g.rect(9, 10, 2, 1, '#ff7ab0'); g.rect(14, 9, 2, 1, '#7ae8e0'); g.contour('#1a1030'); return g; }
  function kekeEstGrid() { const g = Grid(16, 14); g.rect(0, 11, 16, 3, '#f4f6ff'); g.rect(2, 5, 12, 6, '#ffd0a0'); g.rect(2, 4, 12, 2, '#ffffff'); g.rect(2, 8, 12, 1, '#ff9ac0'); g.rect(7, 1, 3, 3, '#e8353f'); g.set(8, 0, '#2f9a4a'); g.contour('#5a3a2a'); return g; }
  function coheteEstGrid() { const g = Grid(10, 22); g.rect(2, 5, 6, 12, '#f4f6ff'); g.rect(3, 2, 4, 3, '#e8556a'); g.rect(4, 0, 2, 2, '#e8556a'); ovalG(g, 5, 9, 2, 2, '#4a8ae8'); g.rect(0, 13, 2, 5, '#e8556a'); g.rect(8, 13, 2, 5, '#e8556a'); g.rect(3, 17, 4, 2, '#ffd84a'); g.rect(4, 19, 2, 2, '#ff9a40'); g.contour('#1a1030'); return g; }
  function atrapaGrid() { const g = Grid(16, 26); g.rect(8, 0, 1, 3, '#f4ecd8'); for (let a = 0; a < 48; a++) { const t = a / 48 * Math.PI * 2; g.set(8 + Math.round(6 * Math.cos(t)), 9 + Math.round(6 * Math.sin(t)), '#c98a52'); } g.rect(3, 9, 11, 1, '#f4ecd8'); g.rect(8, 4, 1, 11, '#f4ecd8'); g.set(8, 9, '#ff7a9a'); g.rect(4, 15, 1, 4, '#f4ecd8'); g.rect(3, 19, 3, 6, '#8ae8e0'); g.rect(8, 15, 1, 6, '#f4ecd8'); g.rect(7, 21, 3, 5, '#ff9ac0'); g.rect(12, 15, 1, 4, '#f4ecd8'); g.rect(11, 19, 3, 6, '#ffd84a'); return g; }
  function estrellasPapelGrid() { const g = Grid(16, 26), S = ['..y..', '.yyy.', 'yyyyy', '.yyy.', '.y.y.']; [[3, 6, '#ffe45a'], [8, 15, '#ff9ac0'], [13, 9, '#8ae8e0']].forEach(([x, l, c]) => { g.rect(x, 0, 1, l, '#f4ecd8'); g.art(x - 2, l, S, { y: c }); }); return g; }
  function grullasGrid() { const g = Grid(18, 26), S = ['..c..', '.ccc.', 'ccccc', '.ccc.', '..c..']; [[3, 5, '#ff7a9a'], [9, 12, '#7ac8ff'], [15, 18, '#ffd84a']].forEach(([x, l, c]) => { g.rect(x, 0, 1, l, '#f4ecd8'); g.art(x - 2, l, S, { c }); g.set(x, l + 2, '#ffffff'); }); return g; }
  function campanasGrid() { const g = Grid(14, 26); g.rect(2, 0, 10, 2, '#c98a52'); [[3, 12], [6, 16], [9, 10], [12, 14]].forEach(([x, l]) => { g.rect(x, 2, 1, 3, '#f4ecd8'); g.rect(x - 1, 5, 2, l - 3, '#cfe0f0'); g.rect(x - 1, 5, 1, l - 3, '#ffffff'); }); g.rect(7, 19, 1, 3, '#f4ecd8'); g.rect(5, 22, 5, 3, '#ff9ac0'); return g; }
  function plantaColGrid() { const g = Grid(16, 26); g.rect(8, 0, 1, 4, '#f4ecd8'); g.rect(4, 4, 8, 6, '#c0603a'); g.rect(4, 4, 8, 1, '#e08a5a'); [[4, 10], [6, 15], [9, 8], [11, 13]].forEach(([x, l]) => { g.rect(x, 10, 1, l, '#3a9a50'); for (let y = 12; y < 10 + l; y += 3) g.set(x + (y % 2 ? 1 : -1), y, '#5ac870'); }); g.rect(3, 3, 10, 1, '#8a5630'); return g; }
  function farolPapelGrid() { const g = Grid(12, 26); g.rect(6, 0, 1, 4, '#f4ecd8'); g.rect(3, 4, 6, 2, '#8a2a1a'); ovalG(g, 6, 12, 5, 6, '#e8353f'); g.rect(6, 6, 1, 12, '#a82030'); g.rect(3, 12, 6, 1, '#ff7a6a'); g.rect(5, 11, 3, 3, '#ffd84a'); g.rect(3, 18, 6, 2, '#8a2a1a'); g.rect(6, 20, 1, 3, '#ffd84a'); g.rect(5, 23, 3, 2, '#ffd84a'); return g; }
  function lunaColGrid() { const g = Grid(14, 28); g.rect(7, 0, 1, 8, '#f4ecd8'); for (let y = 0; y < 16; y++) for (let x = 0; x < 14; x++) { const a = (x - 7) * (x - 7) + (y - 16 + 8) * (y - 16 + 8), b = (x - 10) * (x - 10) + (y - 14 + 8) * (y - 14 + 8); if (a <= 42 && b > 30) g.set(x, y + 8, (x + y) % 5 ? '#ffe45a' : '#fff6a0'); } g.set(11, 12, '#ffffff'); g.set(2, 9, '#ffffff'); return g; }
  Object.assign(nuevosItems, {
    cactus_est: ['CACTUS', 35, 1, 'deco', cactusEstGrid, 'estudio'], marco_est: ['PORTARRETRATO', 45, 1, 'deco', marcoEstGrid, 'estudio'], peluche_simon: ['MINI SIMON DE PELUCHE', 120, 2, 'deco', peluSimonGrid, 'estudio'],
    keke_est: ['REBANADA DE KEKE', 60, 2, 'deco', kekeEstGrid, 'estudio'], reloj_arena: ['RELOJ DE ARENA', 80, 3, 'deco', relojArenaGrid, 'estudio'], globo_est: ['GLOBO TERRÁQUEO', 90, 3, 'deco', globoEstGrid, 'estudio'],
    radio_est: ['RADIO RETRO', 110, 4, 'deco', radioEstGrid, 'estudio'], cohete_est: ['COHETE DE JUGUETE', 70, 4, 'deco', coheteEstGrid, 'estudio'], ovni_est: ['OVNI DE JUGUETE', 140, 5, 'deco', ovniEstGrid, 'estudio'], trofeo_est: ['TROFEO DE ESTUDIO', 100, 6, 'deco', trofeoEstGrid, 'estudio'],
    estrellas_papel: ['ESTRELLAS DE PAPEL', 40, 1, 'decoP', estrellasPapelGrid, 'estudio'], luna_col: ['LUNA COLGANTE', 70, 2, 'decoP', lunaColGrid, 'estudio'], grullas: ['GRULLAS DE PAPEL', 60, 2, 'decoP', grullasGrid, 'estudio'],
    planta_col: ['PLANTA COLGANTE', 55, 3, 'decoP', plantaColGrid, 'estudio'], farol_papel: ['FAROL DE PAPEL', 65, 3, 'decoP', farolPapelGrid, 'estudio'], atrapasuenos: ['ATRAPASUEÑOS', 90, 4, 'decoP', atrapaGrid, 'estudio'], campanillas: ['CAMPANILLAS', 80, 5, 'decoP', campanasGrid, 'estudio']
  });
  function patitoBGrid() { const g = Grid(20, 20); ovalG(g, 9, 14, 8, 5, '#ffd84a'); ovalG(g, 13, 7, 5, 5, '#ffd84a'); g.rect(17, 7, 3, 2, '#ff9a40'); g.set(13, 6, '#1a1030'); g.rect(3, 11, 5, 3, '#f0b820'); g.rect(8, 16, 6, 1, '#f0b820'); g.set(11, 5, '#fff6a0'); g.set(4, 12, '#fff6a0'); g.contour('#7a4a10'); return g; }
  function bancoBGrid() { const g = Grid(18, 22); g.rect(1, 8, 16, 3, '#c98a52'); g.rect(1, 8, 16, 1, '#e8b078'); g.rect(2, 11, 2, 10, '#8a5630'); g.rect(14, 11, 2, 10, '#8a5630'); g.rect(3, 4, 12, 5, '#f4f2ee'); g.rect(3, 4, 12, 1, '#ffffff'); g.rect(3, 6, 12, 1, '#7ac8d8'); g.rect(3, 8, 12, 1, '#d8d4cc'); g.contour('#2a1a10'); return g; }
  function basculaGrid() { const g = Grid(20, 10); g.rect(1, 2, 18, 7, '#e8eef2'); g.rect(1, 2, 18, 1, '#ffffff'); g.rect(1, 8, 18, 1, '#a8b2bc'); g.rect(7, 3, 6, 3, '#2a3a40'); g.rect(8, 4, 1, 1, '#7affb0'); g.rect(10, 4, 2, 1, '#7affb0'); g.rect(3, 4, 2, 3, '#c8d2da'); g.rect(15, 4, 2, 3, '#c8d2da'); g.contour('#3a4a52'); return g; }
  function canastoGrid() { const g = Grid(18, 26); g.rect(2, 6, 14, 18, '#c8a070'); for (let y = 8; y < 24; y += 3) g.rect(2, y, 14, 1, '#a88050'); for (let x = 4; x < 16; x += 4) g.rect(x, 6, 1, 18, '#e0b888'); g.rect(1, 5, 16, 2, '#8a5630'); g.rect(4, 1, 5, 5, '#7ac8d8'); g.rect(9, 2, 5, 4, '#ff9ac0'); g.rect(5, 2, 2, 2, '#ffffff'); g.contour('#3a2410'); return g; }
  function boteBGrid() { const g = Grid(12, 18); g.rect(1, 4, 10, 13, '#cfd8e0'); g.rect(1, 4, 3, 13, '#eef4f8'); g.rect(8, 4, 3, 13, '#a8b4be'); g.rect(0, 2, 12, 3, '#8a96a2'); g.rect(0, 2, 12, 1, '#b4bec8'); g.rect(4, 0, 4, 2, '#8a96a2'); g.rect(5, 9, 2, 5, '#7a8a96'); g.contour('#3a4650'); return g; }
  function helechoGrid() { const g = Grid(20, 28); g.rect(5, 18, 10, 9, '#4a8ab8'); g.rect(5, 18, 10, 1, '#7ac0e8'); g.rect(4, 17, 12, 2, '#3a6a90'); g.rect(6, 22, 8, 1, '#7ac0e8'); [[10, 17, 10, 2], [10, 17, 3, 5], [10, 17, 17, 6], [10, 17, 6, 12], [10, 17, 14, 12]].forEach(([x, y, tx, ty]) => { const n = 16; for (let i = 0; i <= n; i++) { const t = i / n, px = Math.round(x + (tx - x) * t), py = Math.round(y + (ty - y) * t - Math.sin(t * 3.14) * 3); g.set(px, py, '#3a9a50'); g.set(px + 1, py, '#5ac870'); if (i % 3 === 1) { g.set(px - 1, py - 1, '#5ac870'); g.set(px + 2, py + 1, '#3a9a50'); } } }); g.contour('#1a4a2a'); return g; }
  function tinaGrid() { const g = Grid(40, 24); ovalG(g, 20, 17, 19, 6, '#f4f8fa'); g.rect(1, 9, 38, 9, '#f4f8fa'); ovalG(g, 20, 9, 19, 3, '#e8f0f4'); ovalG(g, 20, 10, 17, 2, '#8ad4ee'); g.rect(3, 12, 34, 5, '#e8f0f4'); g.rect(3, 17, 34, 1, '#b4c4cc'); g.rect(5, 21, 3, 3, '#c8a070'); g.rect(32, 21, 3, 3, '#c8a070'); for (let i = 0; i < 6; i++) { circG(g, 8 + i * 6 + (i % 2) * 2, 6 + (i % 3), 2, '#ffffff'); } ovalG(g, 28, 8, 3, 3, '#ffd84a'); g.rect(30, 7, 3, 1, '#ff9a40'); g.contour('#4a6a78'); return g; }
  function cuadroPezGrid() { const g = Grid(18, 16); g.rect(0, 0, 18, 16, '#f4f2ee'); g.rect(1, 1, 16, 14, '#6ac0e8'); g.rect(1, 10, 16, 5, '#3a98c8'); ovalG(g, 8, 7, 4, 3, '#ff9a40'); g.rect(11, 5, 3, 5, '#ff9a40'); g.set(6, 6, '#1a1030'); g.rect(5, 8, 2, 1, '#ffd0a0'); g.set(13, 3, '#ffffff'); g.set(3, 4, '#ffffff'); g.rect(3, 12, 1, 3, '#4ac07a'); g.rect(14, 11, 1, 4, '#4ac07a'); g.contour('#7a5a30'); return g; }
  function toalleroGrid() { const g = Grid(22, 22); g.rect(1, 2, 20, 2, '#8a96a2'); g.rect(1, 2, 20, 1, '#c8d2da'); g.rect(1, 1, 2, 4, '#4a5560'); g.rect(19, 1, 2, 4, '#4a5560'); g.rect(4, 4, 14, 15, '#7ac8d8'); g.rect(4, 4, 14, 1, '#a8e0ea'); g.rect(4, 11, 14, 2, '#ffffff'); g.rect(4, 18, 14, 1, '#4a98a8'); for (let x = 5; x < 18; x += 2) g.set(x, 19, '#4a98a8'); g.contour('#2a4a58'); return g; }
  function relojConchaGrid() { const g = Grid(18, 18); for (let y = 0; y < 18; y++) { const w = Math.round(8 * Math.sqrt(1 - ((y - 9) / 9) * ((y - 9) / 9))); g.rect(9 - w, y, w * 2, 1, '#ffc8d8'); } ovalG(g, 9, 10, 6, 6, '#fffbe8'); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; g.set(9 + Math.round(5 * Math.sin(a)), 10 - Math.round(5 * Math.cos(a)), '#3a2a3a'); } g.rect(9, 6, 1, 4, '#3a2a3a'); g.rect(9, 10, 3, 1, '#3a2a3a'); for (let i = 0; i < 7; i++) g.set(2 + i * 2, 2 + (i % 2), '#ff8aa8'); g.contour('#7a3a58'); return g; }
  function repisaJabonGrid() { const g = Grid(26, 18); g.rect(0, 13, 26, 3, '#c98a52'); g.rect(0, 13, 26, 1, '#e8b078'); g.rect(3, 16, 2, 2, '#8a5630'); g.rect(21, 16, 2, 2, '#8a5630'); g.rect(2, 7, 5, 6, '#ff9ac0'); g.rect(2, 7, 5, 1, '#ffc8dc'); g.rect(9, 5, 4, 8, '#7ae8c8'); g.rect(10, 3, 2, 2, '#4a8a78'); g.rect(15, 8, 5, 5, '#ffe45a'); g.rect(15, 8, 5, 1, '#fff6a0'); circG(g, 23, 10, 2, '#cfeef7'); g.set(22, 9, '#ffffff'); g.contour('#5a3a2a'); return g; }
  Object.assign(nuevosItems, {
    patito_b: ['PATO DE HULE GIGANTE', 70, 1, 'deco', patitoBGrid, 'bano'], banco_b: ['BANQUITO CON TOALLA', 45, 1, 'deco', bancoBGrid, 'bano'], bote_b: ['BOTE DE BASURA', 35, 1, 'deco', boteBGrid, 'bano'],
    bascula_b: ['BÁSCULA', 55, 2, 'deco', basculaGrid, 'bano'], canasto_b: ['CANASTO DE ROPA', 65, 2, 'deco', canastoGrid, 'bano'], helecho_b: ['HELECHO', 50, 3, 'deco', helechoGrid, 'bano'], tina_b: ['TINA DE PATITOS', 220, 5, 'deco', tinaGrid, 'bano'],
    cuadro_pez: ['CUADRO DEL PEZ', 50, 1, 'decoP', cuadroPezGrid, 'bano'], toallero_b: ['TOALLERO', 60, 2, 'decoP', toalleroGrid, 'bano'], reloj_concha: ['RELOJ DE CONCHA', 70, 3, 'decoP', relojConchaGrid, 'bano'], repisa_jabon: ['REPISA DE JABONES', 80, 4, 'decoP', repisaJabonGrid, 'bano']
  });
  Object.keys(nuevosItems).forEach(k => { const [n, p, nv, slot, grid, tema, luz] = nuevosItems[k]; ITEMS[k] = { tipo: 'cuarto', slot, n, p, nv, grid, tema }; if (luz) ITEMS[k].luz = true; if (tema === 'estudio') ITEMS[k].zona = slot === 'decoP' ? 'col' : 'est'; });
  Object.assign(ITEMS.sofa, { tema: 'sala' }); ['mesita', 'librero', 'tele', 'acuario', 'baul', 'globo', 'telescopio', 'estante'].forEach(k => { ITEMS[k].tema = 'sala'; });
  ITEMS.cuadro_keke.tema = 'cocina'; ITEMS.espejo.tema = 'entrada';
  const temaDe = k => (ITEMS[k] && ITEMS[k].tema) || 'todas';
  const iconoHabDe = k => { const t = temaDe(k); return (t === 'estudio' || t === 'bano' || t === 'jardin' || (ITEMS[k] && ITEMS[k].exclusivo)) ? (HAB_ICO[t] || '') : ''; };   // estudio, baño y los ítems exclusivos de una habitación (camas, clóset, etc.) restringen dónde se puede colocar (ver colocar())
  const MERC_POOL = ['sud_dorada', 'sud_negra', 'sud_morada', 'monoculo', 'bufanda_dorada', 'pared_noche', 'alf_dorada', 'dino', 'cohete', 'marco_planeta'];
  const ORDEN = {
    ropa: ['sud_azul', 'sud_roja', 'sud_verde', 'sud_naranja', 'sud_rosa', 'sud_celeste', 'gafas', 'gafas_corazon', 'mono', 'corbata', 'bufanda', 'collar', 'audifonos', 'orejas_gato', 'capa_roja', 'capa_azul', 'monodorado', 'sud_calabaza', 'sud_navidad', 'sud_dorada', 'sud_negra', 'sud_morada', 'monoculo', 'bufanda_dorada', 'sud_arcoiris'],
    comida: [],
    cuarto: ['pared_azul', 'pared_rosa', 'pared_verde', 'alf_roja', 'alf_azul', 'alf_verde', 'planta', 'guitarra', 'lampara', 'pato', 'pared_noche', 'alf_dorada', 'dino', 'cohete', 'pared_halloween', 'calabaza', 'arbol', 'neon_si', 'mesita', 'maceta', 'cactus', 'baul', 'sofa', 'librero', 'tele', 'globo', 'acuario', 'telescopio', 'reloj', 'cuadro_keke', 'guirnalda', 'estante', 'neon_corazon', 'espejo']
  };
  ORDEN.cuarto.push('marco_keke', 'marco_cortex', 'marco_planeta', 'marco_boom', 'marco_estrellas');
  const PORDEFECTO = { sudadera: 1, pared: 1, alfombra: 1, cuadro: 1, juguete: 1 };   // estos huecos siempre llevan algo puesto

  /* ===================== ESTILOS DE PARED, PISO Y REFRI ===================== */
  function mixC(c, k) { const n = parseInt(c.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k))); return '#' + ((1 << 24) | (f(n >> 16) << 16) | (f((n >> 8) & 255) << 8) | f(n & 255)).toString(16).slice(1); }
  var PAT_P = {   // pared: (x, y, colores) -> color
    liso: (x, y, c) => c[0],
    rayas: (x, y, c) => (x % 12 < 6 ? c[0] : c[1]),
    puntos: (x, y, c) => ((x % 10) < 2 && (y % 10) < 2) ? c[2] : (x % 20 < 10 ? c[0] : c[1]),
    estrellas: (x, y, c) => { const h = (x * 7 + y * 13) % 97; return h === 3 ? c[2] : (h === 41 && x % 2 === 0) ? mixC(c[2], -.45) : (x % 12 < 6 ? c[0] : c[1]); },
    madera: (x, y, c) => (x % 6 === 0 ? mixC(c[1], -.35) : (((y / 10) | 0) + ((x / 6) | 0)) % 3 ? c[0] : c[1]),
    ladrillo: (x, y, c) => { const r = (y / 4) | 0; if (y % 4 === 0 || (x + (r % 2) * 5) % 10 === 0) return c[2]; return (x * 3 + y * 5) % 11 === 0 ? c[1] : c[0]; },
    azulejo: (x, y, c) => (x % 8 === 0 || y % 8 === 0) ? c[2] : (x % 8 === 1 && y % 8 === 1) ? mixC(c[0], .5) : c[0],
    hojas: (x, y, c) => { const cx = x % 10, cy = y % 10; return (Math.abs(cx - 4) + Math.abs(cy - 4) <= 1) ? c[2] : (x % 20 < 10 ? c[0] : c[1]); }
  };
  var PAT_F = {   // piso: (x, y desde el piso, colores) -> color
    tablones: (x, y, c) => { const f = (y / 8) | 0; if (y % 8 === 0 || (x + (f * 13 + 7) % 26) % 26 === 0) return c[2]; return f % 2 ? c[1] : c[0]; },
    parquet: (x, y, c) => { if (x % 11 === 0 || y % 11 === 0) return c[2]; return (((x / 11) | 0) + ((y / 11) | 0)) % 2 ? c[1] : c[0]; },
    mosaico: (x, y, c) => { if (x % 10 === 0 || y % 10 === 0) return c[2]; return (((x / 10) | 0) + ((y / 10) | 0)) % 2 ? c[1] : c[0]; },
    losa: (x, y, c) => { const r = (y / 16) | 0; if (y % 16 === 0 || (x + (r % 2) * 8) % 16 === 0) return c[2]; return (x * 5 + y * 3) % 17 === 0 ? c[1] : c[0]; }
  };
  var EST_DEF = [   // [clave, nombre, precio, nv, habitación, 'pared'|'piso', patrón, colores, franja baja]
    ['p_estrellas', 'CIELO ESTRELLADO', 80, 3, 'sala', 'pared', 'estrellas', ['#222a68', '#283276', '#fff0a0'], ['#181e54', '#1e2662']],
    ['p_ladrillo', 'LADRILLO ROJO', 120, 5, 'sala', 'pared', 'ladrillo', ['#b0583c', '#9c4a32', '#d8c8b0'], ['#7a3a28', '#6a2e20', '#b8a890']],
    ['p_cabana', 'CABAÑA CÁLIDA', 150, 6, 'sala', 'pared', 'madera', ['#b8804e', '#ac764a'], ['#80522e', '#744a28']],
    ['p_bosque', 'TAPIZ BOSQUE', 220, 9, 'sala', 'pared', 'hojas', ['#68b074', '#60a66c', '#86c88a'], ['#3e7c54', '#468660']],
    ['f_oscuro', 'MADERA OSCURA', 70, 3, 'sala', 'piso', 'tablones', ['#68422f', '#5a3a2c', '#34221e']],
    ['f_gris', 'CONCRETO PULIDO', 100, 4, 'sala', 'piso', 'losa', ['#9aa0ae', '#8c92a0', '#6e7482']],
    ['f_parquet', 'PARQUET CLARO', 130, 6, 'sala', 'piso', 'parquet', ['#ecd096', '#e2c48a', '#c4a068']],
    ['f_mosaico', 'MOSAICO CREMA', 190, 9, 'sala', 'piso', 'mosaico', ['#eeeade', '#cecabe', '#aaa698']],
    ['p_circuitos', 'CIRCUITOS', 60, 2, 'juegos', 'pared', 'puntos', ['#10234a', '#0e1e40', '#4ae8ff'], ['#0a1632', '#0e1e44']],
    ['p_galaxia', 'GALAXIA', 110, 4, 'juegos', 'pared', 'estrellas', ['#14123a', '#1a1646', '#ffffff'], ['#0e0c2a', '#14123a']],
    ['p_arcade', 'LADRILLO ARCADE', 150, 6, 'juegos', 'pared', 'ladrillo', ['#4a2a6e', '#3e2260', '#241040'], ['#321a50', '#2a1442', '#180a30']],
    ['p_pixel', 'ARCOÍRIS PIXEL', 200, 8, 'juegos', 'pared', 'rayas', ['#e84aa8', '#4a9ae8'], ['#a8307a', '#3070b0']],
    ['f_damero', 'DAMERO CLÁSICO', 60, 2, 'juegos', 'piso', 'mosaico', ['#f0f0f8', '#2a2a3a', '#8a8a98']],
    ['f_neon', 'TABLERO NEÓN', 100, 4, 'juegos', 'piso', 'mosaico', ['#1a1236', '#2a2058', '#ff5ac8']],
    ['f_arcmad', 'MADERA ARCADE', 130, 6, 'juegos', 'piso', 'tablones', ['#7a4a2a', '#6a3e22', '#3a2010']],
    ['f_violeta', 'LOSA VIOLETA', 170, 8, 'juegos', 'piso', 'losa', ['#5a3a9a', '#4e3088', '#2e1a58']],
    ['p_menta', 'MENTA SUAVE', 70, 4, 'cocina', 'pared', 'rayas', ['#cdeed8', '#c2e6cf'], ['#eef8f2', '#fff', '#b8d8c4']],
    ['p_cerezo', 'RAYAS CEREZA', 110, 6, 'cocina', 'pared', 'rayas', ['#fff0e8', '#f8d8cc'], ['#ffe4e0', '#fff', '#e8b0a8']],
    ['p_ladcafe', 'LADRILLO CAFÉ', 150, 8, 'cocina', 'pared', 'ladrillo', ['#a8643c', '#945632', '#e0d0b8'], ['#f4ead8', '#fff', '#c0b090']],
    ['p_marino', 'AZUL MARINO', 190, 10, 'cocina', 'pared', 'puntos', ['#2a4a7a', '#264472', '#c8dcf8'], ['#d8e8f8', '#fff', '#8aa8d0']],
    ['f_damnegro', 'DAMERO NEGRO', 80, 5, 'cocina', 'piso', 'mosaico', ['#f0f0f0', '#2a2a34', '#8a8a98']],
    ['f_cmad', 'MADERA CLARA', 110, 6, 'cocina', 'piso', 'tablones', ['#d8aa72', '#cc9c64', '#8a5c34']],
    ['f_terracota', 'LOSA TERRACOTA', 150, 8, 'cocina', 'piso', 'losa', ['#c4704a', '#b86442', '#8a4630']],
    ['f_cverde', 'MOSAICO VERDE', 190, 10, 'cocina', 'piso', 'mosaico', ['#cfe8d4', '#8cc4a0', '#6a9a7e']],
    ['p_beige', 'BEIGE ELEGANTE', 100, 7, 'entrada', 'pared', 'rayas', ['#efe4cc', '#e6d8bc'], ['#c8b48c', '#d8c8a0']],
    ['p_puerto', 'AZUL PUERTO', 140, 8, 'entrada', 'pared', 'rayas', ['#a8c0e0', '#9cb4d8'], ['#6a88b8', '#7a98c8']],
    ['p_rustica', 'MADERA RÚSTICA', 180, 10, 'entrada', 'pared', 'madera', ['#a87a50', '#9c7048'], ['#6a4a2c', '#5e4026']],
    ['p_ladent', 'LADRILLO BLANCO', 220, 12, 'entrada', 'pared', 'ladrillo', ['#e8e4dc', '#dcd8d0', '#a8a49c'], ['#c8c4bc', '#bcb8b0', '#908c84']],
    ['f_roble', 'MADERA ROBLE', 100, 7, 'entrada', 'piso', 'tablones', ['#b88a58', '#ac7e4e', '#6a4a2a']],
    ['f_piedra', 'PIEDRA OSCURA', 150, 9, 'entrada', 'piso', 'losa', ['#6a6670', '#5e5a64', '#403c46']],
    ['f_marmol', 'MÁRMOL', 230, 12, 'entrada', 'piso', 'mosaico', ['#f0eef0', '#d8d4dc', '#b0aab4']],
    ['p_b_menta', 'AZULEJO MENTA', 60, 1, 'bano', 'pared', 'azulejo', ['#cdeede', '#c0e6d2', '#8cc0a6'], ['#a0d4bc', '#ffffff', '#6aa890']],
    ['p_b_rosa', 'ALGODÓN ROSA', 80, 2, 'bano', 'pared', 'rayas', ['#ffe6ee', '#fad4e0'], ['#f4b8cc', '#ffffff', '#d890a8']],
    ['p_b_oceano', 'OCÉANO', 110, 4, 'bano', 'pared', 'puntos', ['#3a78b4', '#3470a8', '#bfe6ff'], ['#26588c', '#ffffff', '#7ab0d8']],
    ['p_b_madera', 'SPA DE MADERA', 140, 5, 'bano', 'pared', 'madera', ['#c89868', '#bc8c5e'], ['#8a6038', '#7e5630']],
    ['p_b_negro', 'MÁRMOL NEGRO', 160, 6, 'bano', 'pared', 'azulejo', ['#30323a', '#2a2c34', '#52566a'], ['#1c1e24', '#ffffff', '#3c404c']],
    ['f_b_blanco', 'MOSAICO BLANCO', 60, 1, 'bano', 'piso', 'mosaico', ['#f2f6f8', '#dce6ea', '#b4c4cc']],
    ['f_b_arena', 'LOSA ARENA', 90, 2, 'bano', 'piso', 'losa', ['#d8c8a8', '#ccbc9c', '#a89874']],
    ['f_b_rio', 'PIEDRA DE RÍO', 130, 4, 'bano', 'piso', 'losa', ['#8a9aa0', '#7a8a90', '#56666c']],
    ['f_b_tarima', 'TARIMA SPA', 150, 5, 'bano', 'piso', 'tablones', ['#c49a68', '#b88e5e', '#7a5a34']],
    ['f_b_turquesa', 'MOSAICO TURQUESA', 170, 6, 'bano', 'piso', 'mosaico', ['#7fd0d8', '#46b0c0', '#2f8fa6']]
  ];
  EST_DEF.forEach(([k, n, p, nv, hab, tipo, pat, col, wain]) => {
    ITEMS[k] = { tipo: 'cuarto', slot: (tipo === 'pared' ? 'pared' : 'piso') + (hab === 'sala' ? '' : '_' + hab), n, p, nv, pat, col, wain, tema: hab, estilo: tipo };
    ORDEN.cuarto.push(k);
  });
  // pared/piso elegidos para una habitación (null = el diseño original)
  function estSty(hab) { const ps = hab === 'sala' ? 'pared' : 'pared_' + hab, fs = hab === 'sala' ? 'piso' : 'piso_' + hab, p = ITEMS[e.cuarto[ps]], f = ITEMS[e.cuarto[fs]]; return { p: p && p.pat ? p : null, f: f && f.pat ? f : null, k: (p && p.pat ? e.cuarto[ps] : '') + '|' + (f && f.pat ? e.cuarto[fs] : '') }; }
  function estPal(it) { const c = it.col, w = it.wain; return [c[0], c[1], w[0], w[1], mixC(w[1], .3), mixC(w[1], -.35), mixC(w[0], -.2), mixC(c[0], -.35)]; }
  function swatchEst(it) {
    const g = Grid(44, 30);
    if (it.estilo === 'piso') { for (let y = 0; y < 30; y++) for (let x = 0; x < 44; x++) g.set(x, y, PAT_F[it.pat](x, y, it.col)); return g; }
    for (let y = 0; y < 30; y++) for (let x = 0; x < 44; x++) g.set(x, y, y < 18 ? PAT_P[it.pat](x, y, it.col) : it.wain.length > 2 ? PAT_P[it.pat](x, y, it.wain) : it.wain[0]);
    g.rect(0, 16, 44, 1, '#fffbe8'); g.rect(0, 17, 44, 2, '#f0e6c8');
    if (it.wain.length < 3) for (let px = 3; px < 44; px += 14) { g.rect(px, 22, 10, 7, it.wain[1]); g.rect(px, 22, 10, 1, mixC(it.wain[1], .3)); }
    return g;
  }
  // ---- refrigeradores ----
  var REFRIS = {
    refri_menta:  { n: 'REFRI MENTA', p: 90, nv: 4, o: { cuerpo: '#a8e6cf', borde: '#3a6a58', luz: '#d8fff0', sombra: '#6aa890', mango: '#e8f4f0', deco: 'corazon' }, snack: ['manzana', 'galleta'] },
    refri_retro:  { n: 'REFRI RETRO ROSA', p: 150, nv: 5, o: { cuerpo: '#ff9ac0', borde: '#6a2a4a', luz: '#ffd0e4', sombra: '#c8648e', mango: '#f0f0f8', retro: 1, deco: 'badge' }, snack: ['manzana', 'galleta'] },
    refri_keke:   { n: 'REFRI KEKE', p: 170, nv: 6, o: { cuerpo: '#fff2d0', borde: '#8a5630', luz: '#ffffff', sombra: '#d8c090', mango: '#e8353f', deco: 'keke' }, snack: ['dona', 'taco'] },
    refri_acero:  { n: 'REFRI DE ACERO', p: 220, nv: 7, o: { cuerpo: '#b8c0cc', borde: '#3a4250', luz: '#e8eef6', sombra: '#8890a0', mango: '#4a5260', deco: 'panel' }, snack: ['galleta', 'dona'] },
    refri_negro:  { n: 'REFRI NEGRO MATE', p: 280, nv: 8, o: { cuerpo: '#2e2e3a', borde: '#12121a', luz: '#52526a', sombra: '#1a1a24', mango: '#c0c8d8', deco: 'led' }, snack: ['dona', 'helado'] },
    refri_doble:  { n: 'REFRI DOBLE PUERTA', p: 380, nv: 10, o: { cuerpo: '#c8d0dc', borde: '#3a4250', luz: '#f0f4fa', sombra: '#8890a0', mango: '#4a5260', deco: 'panel', ancho: 6, alto: 6, doble: 1 }, snack: ['helado', 'taco'] },
    refri_dorado: { n: 'REFRI DORADO', p: 520, nv: 1, mercader: true, o: { cuerpo: '#e8c048', borde: '#7a5010', luz: '#fff0a0', sombra: '#b08828', mango: '#7a5010', deco: 'gema' }, snack: ['hamburguesa', 'batido'] }
  };
  Object.keys(REFRIS).forEach(k => { const d = REFRIS[k]; ITEMS[k] = { tipo: 'cuarto', slot: 'refri', n: d.n, p: d.p, nv: d.nv, refri: d.o, snack: d.snack, tema: 'cocina', estilo: 'refri' }; if (d.mercader) ITEMS[k].mercader = true; ORDEN.cuarto.push(k); });
  MERC_POOL.push('refri_dorado');
  function refriDibuja(g, fx, RY, FY, k) {
    const o = ITEMS[k].refri, top = RY - 26 - (o.alto || 0), w = 24 + (o.ancho || 0), x0 = fx - (o.ancho || 0), h = FY - top, sep = RY + 6;
    g.rect(x0, top, w, h, o.borde); g.rect(x0 + 1, top + 1, w - 2, h - 2, o.cuerpo); g.rect(x0 + 1, top + 1, w - 2, 1, o.luz); g.rect(x0 + 1, top + 1, 1, h - 2, o.luz); g.rect(x0 + w - 2, top + 1, 1, h - 2, o.sombra);
    if (o.retro) { g.clear(x0, top, 2, 1); g.clear(x0, top + 1, 1, 1); g.clear(x0 + w - 2, top, 2, 1); g.clear(x0 + w - 1, top + 1, 1, 1); g.rect(x0 + 2, top + 1, w - 4, 1, o.luz); }
    g.rect(x0 + 1, sep, w - 2, 1, o.sombra);
    if (o.doble) { g.rect(x0 + (w >> 1), top + 1, 1, h - 2, o.borde); g.rect(x0 + (w >> 1) - 4, top + 10, 2, 14, o.mango); g.rect(x0 + (w >> 1) + 2, top + 10, 2, 14, o.mango); }
    else { g.rect(x0 + w - 6, top + 6, 2, 12, o.mango); g.rect(x0 + w - 6, sep + 4, 2, 14, o.mango); }
    const cx = x0 + 4, cy = RY - 14;
    if (o.deco === 'corazon') g.art(cx + 1, cy, ['.rr.rr.', 'rrrrrrr', 'rrrrrrr', '.rrrrr.', '..rrr..', '...r...'], { r: '#ff4a5c' });
    else if (o.deco === 'badge') { g.rect(cx + 2, cy + 2, 8, 4, '#e8e8f0'); g.rect(cx + 3, cy + 3, 6, 2, o.sombra); }
    else if (o.deco === 'keke') g.paste(pizzaGrid(), cx - 1, cy - 2);
    else if (o.deco === 'panel') { g.rect(cx, cy, 7, 10, '#232b3a'); g.rect(cx + 1, cy + 1, 5, 3, '#6ae0f0'); g.rect(cx + 2, cy + 6, 3, 3, '#9aa4b8'); }
    else if (o.deco === 'led') { g.rect(cx, cy, 8, 5, '#0a0a12'); g.rect(cx + 1, cy + 1, 6, 1, '#4af0ff'); g.rect(cx + 1, cy + 3, 3, 1, '#4af0ff'); }
    else if (o.deco === 'gema') { g.rect(cx + 2, cy + 1, 6, 6, '#7a5010'); g.rect(cx + 3, cy + 2, 4, 4, '#ff4a8a'); g.rect(cx + 3, cy + 2, 2, 1, '#ffb0d0'); }
    g.rect(x0 + 4, RY + 14, 8, 6, '#ffd84a'); g.rect(x0 + 4, RY + 14, 8, 1, '#fff6b0');
  }
  function refriTap() { abrir('refri'); }
  function refriPrev(k) { const g = Grid(36, 70); refriDibuja(g, 6, 32, 67, k); return g; }
  const paleta = () => { const pi = ITEMS[e.cuarto.pared] || ITEMS.pared_azul, st = estSty('sala'); return { pared: pi.pat ? estPal(pi) : pi.col, sty: pi.pat ? pi : null, fl: st.f, alf: (ITEMS[e.cuarto.alfombra] || ITEMS.alf_roja).col, arte: cuadroArte(), mc: cuadroMc() }; };
  const cuadroClave = () => e.cuarto.cuadro + (e.cuarto.cuadro === 'marco_foto' ? ':' + e.cuadroFoto + e.album.length : '');

  /* ===================== TROFEOS, CAMAS Y CLÓSET ===================== */
  var TROFEOS = [
    { id: 'keke', n: 'ATRAPA EL KEKE', v: () => e.mj.rec, t: [20, 45, 80], u: 'PUNTOS' },
    { id: 'run', n: 'CORRE, SIMON', v: () => e.run.rec, t: [40, 100, 200], u: 'PUNTOS' },
    { id: 'mem', n: 'MEMORIA CON CORTEX', v: () => e.mem.rec, t: [60, 150, 300], u: 'PUNTOS' },
    { id: 'rt', n: 'BAILA CON SIMON', v: () => e.rt.rec, t: [60, 130, 200], u: 'PUNTOS' },
    { id: 'jug', n: 'AMIGO DEL JUEGO', v: () => (e.st.mj || 0) + (e.st.run || 0) + (e.st.rt || 0) + (e.st.mem || 0), t: [10, 50, 150], u: 'PARTIDAS' },
    { id: 'cons', n: 'CONSTANCIA', v: () => e.mejorRacha || 0, t: [3, 7, 30], u: 'DÍAS SEGUIDOS CON REGALO' }
  ];
  var TROF_PREMIO = [20, 50, 120], TROF_NOM = ['SIN TROFEO', 'BRONCE', 'PLATA', 'ORO'];
  function trofNivel(t) { const v = t.v() || 0; return v >= t.t[2] ? 3 : v >= t.t[1] ? 2 : v >= t.t[0] ? 1 : 0; }
  function trofPend() { let n = 0; TROFEOS.forEach(t => { const nv = trofNivel(t), r = (e.trof || {})[t.id] || 0; for (let i = r; i < nv; i++) n += TROF_PREMIO[i]; }); return n; }
  function trofeosVivo() {
    const pend = (tk >> 3) % 2;
    TROFEOS.forEach((t, i) => {
      const nv = trofNivel(t), x = OX + [82, 94, 106][i % 3], base = i < 3 ? RY - 26 : RY - 7, y = base - 10;
      const C = nv === 3 ? ['#ffd84a', '#e0a820', '#8a5a1a'] : nv === 2 ? ['#e0e8f8', '#9aa4c0', '#5a6480'] : nv === 1 ? ['#e0985e', '#a8602e', '#6a3a18'] : ['#3e3e56', '#2e2e44', '#22222e'];
      ctx.fillStyle = C[0]; ctx.fillRect(x, y, 8, 5); ctx.fillRect(x - 1, y + 1, 1, 2); ctx.fillRect(x + 8, y + 1, 1, 2);
      ctx.fillStyle = C[1]; ctx.fillRect(x + 1, y + 5, 6, 2); ctx.fillRect(x + 3, y + 7, 2, 2);
      ctx.fillStyle = C[2]; ctx.fillRect(x + 1, y + 9, 6, 1);
      if (nv) { ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(x + 1, y + 1, 1, 3); }
      if (nv > ((e.trof || {})[t.id] || 0) && pend) { ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 9, y - 2, 1, 3); ctx.fillRect(x + 8, y - 1, 3, 1); }
    });
  }
  function renderTrof() {
    $('m-titulo').textContent = 'SALÓN DE TROFEOS';
    const p = trofPend();
    let h = `<div class="centro" style="font-size:7px;line-height:1.9;color:#aab4ff;margin-bottom:10px">Cada trofeo sube de bronce a plata y oro.</div>`;
    TROFEOS.forEach(t => {
      const nv = trofNivel(t), v = t.v() || 0, sig = nv < 3 ? `SIGUIENTE (${TROF_NOM[nv + 1]}): ${t.t[nv]}` : '¡TROFEO DE ORO!';
      h += `<div class="saldo"><span>${t.n}</span><span style="color:${['#6a6a88', '#e0985e', '#e0e8f8', '#ffd84a'][nv]}">${TROF_NOM[nv]}</span></div><div style="font-size:6px;color:#aab4ff;line-height:1.8;margin:2px 0 10px">${t.u}: ${v} · ${sig}</div>`;
    });
    h += p ? `<button class="bgrande" data-a="tr_rec">RECLAMAR +${p} MONEDAS</button>` : `<div class="centro" style="font-size:7px;line-height:1.9;color:#8a96ff;margin-top:6px">Nada por reclamar.</div>`;
    return h;
  }
  function trofReclamar() {
    const p = trofPend(); if (!p) return;
    e.trof = e.trof || {}; TROFEOS.forEach(t => { e.trof[t.id] = trofNivel(t); });
    e.monedas += p; e.total = (e.total || 0) + p; sfx.compra(); estrellas(8); pintar(); guardar(); render();
  }
  // ---- camas: dormir más rápido y despertar de mejor humor ----
  function camaGrid(t) {
    const P = [
      { m: '#8a5a38', m2: '#5a3a24', s: '#e8ecff', c: '#4b6ae8', c2: '#8aa0ff' },
      { m: '#d8ecff', m2: '#9ac0e8', s: '#ffffff', c: '#a8d0ff', c2: '#ffffff' },
      { m: '#e8353f', m2: '#9a1c28', s: '#f4f4ff', c: '#232b63', c2: '#ffd84a' },
      { m: '#ffd84a', m2: '#a87810', s: '#fff6ea', c: '#7a3ab8', c2: '#ffd84a' }][t - 1];
    const g = Grid(40, 26), R = (x, y, w, h, c) => g.rect(x + 1, y + 3, w, h, c);
    R(0, 8, 38, 4, P.m); R(0, 2, 4, 18, P.m); R(0, 2, 4, 1, mixC(P.m, .4)); R(34, 6, 4, 14, P.m); R(0, 17, 38, 3, P.m2); R(1, 20, 3, 2, P.m2); R(34, 20, 3, 2, P.m2);
    R(4, 6, 30, 9, P.s); R(5, 6, 9, 5, '#ffffff'); R(5, 6, 9, 1, '#d8dcf0'); R(14, 9, 20, 6, P.c); R(14, 9, 20, 1, P.c2);
    if (t === 2) { [[18, 11], [24, 12], [29, 10]].forEach(([x, y]) => { R(x, y, 4, 2, '#ffffff'); R(x + 1, y - 1, 2, 1, '#ffffff'); }); }
    if (t === 3) { [[17, 10], [22, 12], [27, 10], [31, 13]].forEach(([x, y]) => R(x, y, 1, 1, '#ffd84a')); R(1, -1, 2, 3, '#f4f4ff'); R(1, 0, 2, 1, '#e8353f'); }
    if (t === 4) { R(0, 0, 4, 2, '#ff4a8a'); R(1, -1, 2, 1, '#ffd84a'); [[16, 11], [21, 12], [26, 10], [30, 12]].forEach(([x, y]) => R(x, y, 1, 1, '#fff6b0')); R(34, 4, 4, 2, '#ffd84a'); }
    g.contour('#241a30'); return g;
  }
  [['cama1', 'CAMA SENCILLA', 90, 2], ['cama2', 'CAMA DE NUBES', 180, 5], ['cama3', 'CAMA COHETE', 320, 8], ['cama4', 'CAMA REAL', 600, 12]].forEach(([k, n, p, nv], i) => {
    ITEMS[k] = { tipo: 'cuarto', slot: 'izq', n, p, nv, grid: () => camaGrid(i + 1), tema: 'sala', exclusivo: true, cama: i + 1 }; ORDEN.cuarto.push(k);
  });
  function camaDe(deco) { let t = 0; (deco || []).forEach(d => { const it = ITEMS[d.k]; if (it && it.cama && (d.h || 'sala') === 'sala') t = Math.max(t, it.cama); }); return t; }
  const macetaEnHab = (hab, especie) => (e.deco || []).some(d => (d.h || 'sala') === hab && ITEMS[d.k] && ITEMS[d.k].semilla === especie && macetaViva(d.k));
  const macetaGlobal = especie => (e.deco || []).some(d => ITEMS[d.k] && ITEMS[d.k].semilla === especie && macetaViva(d.k));   // efecto de la planta: ya no importa en qué cuarto esté colocada, solo que esté viva
  const ecoMul = () => macetaGlobal('eco') ? 1.1 : 1;   // Flor de Eco: comer y jugar rinden un 10% más
  const simonLevita = () => !!e.ropa.aura && macetaGlobal('eterna');   // Semilla Eterna + cualquier aura puesta: Simon levita (puramente visual)
  function rDormir(deco, ojo) { return 50 * (1 + .2 * camaDe(deco || e.deco)) * ((ojo === undefined ? (e.sangFase === 2 && e.ojoOn !== 0) : ojo) ? 1.1 : 1) * (macetaGlobal('raiz') ? 1.15 : 1); }   // el ojo mascota: duerme 10% más rápido; la ANÉMONA CALMA viva (en cualquier cuarto): 15% más rápido
  // ---- clóset: guarda 3 atuendos ----
  function closetGrid() {
    const g = Grid(20, 36), R = (x, y, w, h, c) => g.rect(x + 1, y + 1, w, h, c);
    R(0, 0, 18, 32, '#5a3820'); R(1, 1, 16, 30, '#a8683c'); R(8, 1, 2, 30, '#5a3820'); R(2, 2, 6, 28, '#b87a48'); R(11, 2, 5, 28, '#b87a48'); R(2, 2, 6, 1, '#d8a070'); R(11, 2, 5, 1, '#d8a070');
    R(6, 14, 1, 3, '#ffd84a'); R(11, 14, 1, 3, '#ffd84a'); R(0, 32, 3, 2, '#3a2412'); R(15, 32, 3, 2, '#3a2412'); R(2, 0, 14, 1, '#d8a070');
    g.contour('#241810'); return g;
  }
  ITEMS.closet = { tipo: 'cuarto', slot: 'der', n: 'CLÓSET', p: 150, nv: 3, grid: closetGrid, tema: 'sala', exclusivo: true, tap: 'closet' }; ORDEN.cuarto.push('closet');
  ITEMS.buzon.tap = 'notis';
  function renderCloset() {
    $('m-titulo').textContent = 'CLÓSET';
    if (!e.closet) e.closet = [null, null, null];
    let h = `<div class="centro" style="font-size:7px;line-height:1.9;color:#aab4ff;margin-bottom:10px">Guarda tu atuendo actual.</div><div class="cuadricula">`;
    for (let i = 0; i < 3; i++) { const c = e.closet[i]; h += `<div class="card"><div class="pv">${c ? `<canvas data-prev="cl_${i}"></canvas>` : '<div style="font-size:7px;color:#4a5090;padding:10px 0">VACÍO</div>'}</div><div class="cn">ATUENDO ${i + 1}</div>${c ? `<button class="bt ok" data-a="cl_pon" data-k="${i}">PONER</button>` : ''}<button class="bt" data-a="cl_guarda" data-k="${i}">GUARDAR AQUÍ</button></div>`; }
    return h + '</div>';
  }
  function closetClick(a, k) {
    if (!e.closet) e.closet = [null, null, null]; k = +k;
    if (a === 'cl_guarda') { e.closet[k] = Object.assign({}, e.ropa); toast('Atuendo ' + (k + 1) + ' guardado'); sfx.compra(); }
    else if (a === 'cl_pon') { const c = e.closet[k]; if (!c) return; const B = BASE().ropa; Object.keys(e.ropa).forEach(sl => { const v = c[sl]; e.ropa[sl] = (v && e.tiene[v]) ? v : (B[sl] === undefined ? null : B[sl]); }); sfx.click(); gesto('salto'); pintar(); }
    guardar(); render();
  }
  function tapDeco(k) { const t = ITEMS[k].tap; if (t === 'racha') { rachaModo = (rachaModo + 1) % 3; } else if (t === 'notis') { const f = $('b-noti').onclick; if (f) f(); } else if (t === 'peluche') pelucheTap(); else if (t === 'planta') mostrarInfoPlanta(k); else abrir(t); }
  let plantaInfoT = null;
  function mostrarInfoPlanta(k) {   // muestra, justo debajo de la maceta, cuántos días de vida le quedan antes de marchitarse
    const d = e.deco.find(x => x.k === k && (x.h || 'sala') === e.hab); const el = $('planta-info'); if (!d || !el) return;
    const r = posReal(d), sc = cv.getBoundingClientRect(); if (!sc.width) return;
    const kf = sc.width / LW, v = e.macetaVida[k], S = SEMILLAS[ITEMS[k].semilla];
    const txt = !v ? '' : v.dias <= 0 ? 'SE MARCHITÓ' : (S && S.diasVida >= 999999) ? 'NUNCA SE MARCHITA' : (v.dias === 1 ? 'QUEDA 1 DÍA DE VIDA' : 'QUEDAN ' + v.dias + ' DÍAS DE VIDA');
    if (!txt) return;
    el.textContent = txt;
    el.style.left = Math.round(sc.left + (r.x + r.w / 2) * kf) + 'px'; el.style.top = Math.round(sc.top + r.y * kf + r.h * kf + 4) + 'px';
    el.classList.add('on'); clearTimeout(plantaInfoT); plantaInfoT = setTimeout(() => el.classList.remove('on'), 2600);
  }
  /* ===================== ROPA Y ACCESORIOS 2 (más de 70 prendas + PREMIUM) ===================== */
  var ACC2 = {}, SUDP = {};
  const pal4 = b => [mixC(b, .55), b, mixC(b, -.28), mixC(b, -.55)];
  const circ = (L, cx, cy, r, c) => { for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) if ((x + .5 - cx) ** 2 + (y + .5 - cy) ** 2 <= r * r) L.set(x, y, c); };
  const estr4 = (L, cx, cy, r, c) => { for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const a = Math.abs(dx), b = Math.abs(dy); if (a + b <= r && (Math.min(a, b) <= 1 || a + b <= r * .55)) L.set(cx + dx, cy + dy, c); } };
  const polyT = pts => (x, y) => { let d = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > y + .5) !== (yj > y + .5) && (x + .5) < (xj - xi) * (y + .5 - yi) / (yj - yi) + xi) d = !d; } return d; };
  const espejoX = pts => pts.map(([x, y]) => [SW - x, y]);
  // ---------- sudaderas lisas y estampadas ----------
  [['sud_gris', 'SUDADERA GRIS', '#9aa0b4', 50, 2], ['sud_amarilla', 'SUDADERA AMARILLA', '#ffd23a', 60, 2], ['sud_cafe', 'SUDADERA CAFE', '#9a6a40', 70, 3], ['sud_turquesa', 'SUDADERA TURQUESA', '#2cc8c0', 80, 3],
   ['sud_lila', 'SUDADERA LILA', '#b48cff', 80, 3], ['sud_blanca', 'SUDADERA BLANCA', '#f4f4ff', 90, 4], ['sud_coral', 'SUDADERA CORAL', '#ff7a6a', 90, 4], ['sud_menta', 'SUDADERA MENTA', '#7fe0b0', 90, 5],
   ['sud_oliva', 'SUDADERA OLIVA', '#7a8a3a', 90, 5], ['sud_guinda', 'SUDADERA GUINDA', '#a02050', 100, 5], ['sud_marino', 'SUDADERA MARINO', '#2a3a8a', 110, 6], ['sud_lima', 'SUDADERA LIMA', '#b6e83a', 100, 6]
  ].forEach(([k, n, c, p, nv]) => { SUDS[k] = [pal4(c), mixC(c, -.8), mixC(c, -.5)]; ITEMS[k] = { tipo: 'ropa', slot: 'sudadera', n, p, nv, crop: [0, 44, 56, 34] }; });
  [['sud_keke', 'SUDADERA DE KEKE', 90, 3, ['#f6e2b0', '#ff7ab8', '#7a4a28'], (x, y) => y <= 53 ? 1 : (((x * 7 + y * 13) % 17) === 0 ? 2 : 0)],
   ['sud_lunares', 'SUDADERA DE LUNARES', 110, 4, ['#ffc0d8', '#e8353f'], (x, y) => { const a = ((x + ((y / 6 | 0) % 2) * 4) % 8) - 3.5, b = (y % 6) - 2.5; return a * a + b * b <= 3 ? 1 : 0; }],
   ['sud_marinero', 'SUDADERA MARINERA', 100, 5, ['#f4f4ff', '#2a3a8a'], (x, y) => ((y / 3) | 0) % 2],
   ['sud_lenador', 'SUDADERA DE CUADROS', 120, 6, ['#d8333f', '#2a2a34'], (x, y) => (((x / 5) | 0) + ((y / 5) | 0)) % 2],
   ['sud_bicolor', 'SUDADERA BICOLOR', 130, 7, ['#4f49ea', '#e8353f'], x => x < 28 ? 0 : 1],
   ['sud_camuflaje', 'SUDADERA CAMUFLAJE', 140, 7, ['#6a7a3a', '#3a4a24', '#9a8a5a'], (x, y) => { const v = Math.sin(x * .55) + Math.cos(y * .7) + Math.sin((x + y) * .35); return v > .7 ? 0 : v > -.5 ? 1 : 2; }],
   ['sud_atardecer', 'SUDADERA ATARDECER', 180, 8, ['#ffb040', '#ff6a8a', '#8a4ac8'], (x, y) => y < 52 ? 0 : y < 60 ? 1 : 2],
   ['sud_tiedye', 'SUDADERA TIE-DYE', 200, 9, ['#ff7ab8', '#6ac0f0', '#ffe030', '#b48cff'], (x, y) => ((Math.hypot(x - 28, (y - 56) * 1.3) / 4) | 0) % 4],
   // premium
   ['sud_galaxia', 'SUDADERA GALAXIA', 0, 1, ['#2a1a6a', '#5a2aa8', '#150a40'], (x, y) => { const v = Math.sin(x * .22 + y * .31) + Math.cos(y * .27 - x * .12); return v > .5 ? 1 : v < -.6 ? 2 : 0; }, 23],
   ['sud_realeza', 'SUDADERA REALEZA', 0, 1, ['#6a30b0', '#ffd84a'], (x, y) => (y % 9 < 2 || (x % 14 === 0 && y % 9 < 5)) ? 1 : 0],
   ['sud_holo', 'SUDADERA HOLOGRAFICA', 600, 10, ['#ffb0e0', '#a0f0ff', '#fff6a0', '#d0b0ff'], (x, y) => (((x + y) / 4) | 0) % 4]
  ].forEach(([k, n, p, nv, cs, f, est]) => { const pals = cs.map(pal4); SUDS[k] = [pals[0], mixC(cs[cs.length > 2 ? 2 : 1], -.8), mixC(cs[0], -.5)]; SUDP[k] = { pals: pals.map(P => P.map(c => col(c))), f, est }; ITEMS[k] = { tipo: 'ropa', slot: 'sudadera', n, p, nv, crop: [0, 44, 56, 34] }; });

  // ---------- CARA ----------
  const anillo = (g, cx, cy, rx, ry, c1, c2) => { for (let y = cy - 12; y <= cy + 12; y++) for (let x = cx - 12; x <= cx + 12; x++) { const d = Math.hypot((x + .5 - cx) / rx, (y + .5 - cy) / ry); if (d >= .86 && d <= 1) g.set(x, y, (x < cx && y < cy) ? c2 : c1); } };
  const tinte = (g, cx, x0, x1, y0, y1, fn) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if ((x + y) % 2 === 0) g.set(x, y, fn(x, y)); };
  ACC2.rubor = g => { [[11, 42], [45, 42]].forEach(([cx, cy]) => { for (let y = cy - 2; y <= cy + 2; y++) for (let x = cx - 4; x <= cx + 3; x++) { const d = ((x + .5 - cx) / 4) ** 2 + ((y + .5 - cy) / 2.3) ** 2; if (d <= 1 && (d < .55 || (x + y) % 2 === 0)) g.set(x, y, d < .55 ? '#ff8aa6' : '#ffb0c4'); } }); };
  ACC2.pecas = g => { [[9, 40], [12, 41], [10, 43], [14, 43], [47, 40], [44, 41], [46, 43], [42, 43]].forEach(([x, y]) => g.set(x, y, '#b88a6a')); };
  ACC2.bigote = g => { capa(g, '#14080a', L => { sombrear(L, union(elipse(22.5, 41, 5.5, 2.4), elipse(33.5, 41, 5.5, 2.4), elipse(28, 40.5, 3.2, 2.2)), 28, 41, 12, 3, ['#6a4a2c', '#3a2410', '#24160a', '#140c06']); [[17, 40], [16, 39], [39, 40], [40, 39]].forEach(([x, y]) => L.set(x, y, '#3a2410')); }); };
  ACC2.gafas_redondas = g => { [15, 41].forEach(cx => anillo(g, cx, 34, 10.5, 10.5, '#d8a020', '#fff6b0')); g.rect(24, 33, 8, 1, '#d8a020'); g.rect(3, 33, 4, 1, '#d8a020'); g.rect(49, 33, 4, 1, '#d8a020'); };
  ACC2.gafas_nerd = g => { [15, 41].forEach(cx => { for (let y = 27; y <= 41; y++) for (let x = cx - 10; x <= cx + 9; x++) { if ((y === 27 || y === 41) && (x === cx - 10 || x === cx + 9)) continue; if (x >= cx - 8 && x <= cx + 7 && y >= 29 && y <= 39) continue; g.set(x, y, (y === 27 || (x === cx - 10)) ? '#3a3a5a' : '#14142a'); } g.set(cx - 6, 30, '#ffffff'); g.set(cx - 5, 30, '#ffffff'); }); g.rect(24, 31, 8, 2, '#14142a'); g.rect(27, 31, 2, 2, '#f4eed8'); g.rect(3, 31, 5, 2, '#14142a'); g.rect(48, 31, 5, 2, '#14142a'); };
  ACC2.antifaz = g => { for (let y = 25; y <= 43; y++) for (let x = 3; x <= 52; x++) { const e1 = Math.hypot(x + .5 - 15, y + .5 - 34), e2 = Math.hypot(x + .5 - 41, y + .5 - 34); const d = Math.min(e1, e2); if (d < 9.2) continue; if ((y === 25 || y === 43) && (x < 6 || x > 49)) continue; g.set(x, y, d < 10.4 ? '#5a0a14' : y < 30 ? '#ff6a78' : y < 38 ? '#e8353f' : '#b02030'); } };
  ACC2.gafas_3d = g => { [[15, '#e8353f'], [41, '#2ac8e8']].forEach(([cx, c]) => { for (let y = 27; y <= 41; y++) for (let x = cx - 10; x <= cx + 9; x++) { if ((y === 27 || y === 41) && (x === cx - 10 || x === cx + 9)) continue; const borde = y === 27 || y === 41 || x === cx - 10 || x === cx + 9 || y === 28 || y === 40 || x === cx - 9 || x === cx + 8; if (borde) g.set(x, y, '#f4f4ff'); else if ((x + y) % 2 === 0) g.set(x, y, c); } }); g.rect(24, 31, 8, 2, '#f4f4ff'); g.rect(3, 31, 5, 2, '#f4f4ff'); g.rect(48, 31, 5, 2, '#f4f4ff'); };
  ACC2.bigotes_gato = g => { g.rect(27, 40, 3, 2, '#ff8aa6'); g.set(27, 40, '#ffd0dc'); [[9, 44, 0, 41], [9, 46, 0, 46], [9, 48, 1, 51]].forEach(([x0, y0, x1, y1]) => { linea(g, x0, y0, x1, y1, '#262244'); linea(g, SW - 1 - x0, y0, SW - 1 - x1, y1, '#262244'); }); };
  ACC2.parche = g => { capa(g, '#0a0a14', L => sombrear(L, elipse(41, 34, 9.2, 9.2), 41, 34, 9.2, 9.2, ['#5a5a7a', '#2a2a40', '#161626', '#0a0a14'])); linea(g, 4, 24, 32, 28, '#161626'); linea(g, 4, 25, 32, 29, '#161626'); linea(g, 50, 28, 53, 25, '#161626'); };
  ACC2.gafas_estrella = g => { [15, 41].forEach(cx => { const t = (dx, dy) => { const a = Math.abs(dx), b = Math.abs(dy); return a + b <= 12 && (Math.min(a, b) <= 3 || a + b <= 7); }; for (let dy = -12; dy <= 12; dy++) for (let dx = -12; dx <= 12; dx++) { if (!t(dx, dy)) continue; const borde = !t(dx - 1, dy) || !t(dx + 1, dy) || !t(dx, dy - 1) || !t(dx, dy + 1); const x = cx + dx, y = 34 + dy; if (borde) g.set(x, y, dx < 0 && dy < 0 ? '#fff6b0' : '#e8a820'); else if ((x + y) % 2 === 0) g.set(x, y, '#ffe45a'); } }); g.rect(24, 32, 8, 1, '#e8a820'); };
  ACC2.aviador = g => { [15, 41].forEach(cx => { for (let y = 27; y <= 44; y++) for (let x = cx - 10; x <= cx + 10; x++) { const d = Math.hypot((x + .5 - cx) / 10.4, (y + .5 - 34.5) / (y > 34 ? 9.8 : 8.2)); if (d > 1) continue; if (d >= .86) g.set(x, y, (x < cx && y < 34) ? '#fff6b0' : '#d8a020'); else if ((x + y) % 2 === 0) g.set(x, y, y < 34 ? '#58c878' : '#2a8a58'); } }); g.rect(24, 28, 8, 1, '#d8a020'); g.rect(26, 31, 4, 1, '#d8a020'); g.rect(3, 29, 4, 1, '#d8a020'); g.rect(49, 29, 4, 1, '#d8a020'); };
  ACC2.visor_neon = g => { for (let y = 29; y <= 39; y++) for (let x = 3; x <= 52; x++) { if ((y === 29 || y === 39) && (x < 6 || x > 49)) continue; const borde = y === 29 || y === 39 || x === 3 || x === 52; g.set(x, y, borde ? '#7af0ff' : y < 33 ? ((x + y) % 2 ? '#2a5a8a' : '#1a3a6a') : ((x + y) % 2 ? '#1a3a6a' : '#0e2248')); } for (let x = 6; x <= 49; x += 6) g.set(x, 32, '#ffffff'); g.rect(10, 31, 8, 1, '#7af0ff'); g.rect(38, 36, 8, 1, '#ff5ac8'); };
  ACC2.gafas_arcoiris = g => { const RC = ['#ff4a4a', '#ff9a30', '#ffe030', '#58d048', '#48a8f0', '#b060f0']; [15, 41].forEach(cx => { for (let y = 27; y <= 41; y++) for (let x = cx - 10; x <= cx + 9; x++) { if ((y === 27 || y === 41) && (x === cx - 10 || x === cx + 9)) continue; const borde = y === 27 || y === 41 || x === cx - 10 || x === cx + 9; if (borde) g.set(x, y, y < 33 ? '#fff6b0' : '#d8a020'); else if ((x + y) % 2 === 0) g.set(x, y, RC[Math.min(5, ((y - 28) / 2.3) | 0)]); } }); g.rect(24, 30, 8, 2, '#d8a020'); g.rect(3, 31, 5, 2, '#d8a020'); g.rect(48, 31, 5, 2, '#d8a020'); [[8, 28], [46, 29], [24, 27]].forEach(([x, y]) => { g.set(x, y, '#ffffff'); g.set(x, y - 1, '#ffffff'); }); };

  // ---------- CUELLO ----------
  const accMono = (g, rp, out) => capa(g, out, L => {
    const ala = (x, y) => (x >= 19 && x <= 25 && Math.abs(y - 53) <= (26 - x) * .55 + 1.4) || (x >= 30 && x <= 36 && Math.abs(y - 53) <= (x - 29) * .55 + 1.4);
    sombrear(L, ala, 28, 53, 10, 5, rp); L.rect(26, 51, 4, 5, rp[1]); L.rect(26, 51, 4, 1, rp[0]); L.rect(26, 55, 4, 1, rp[2]);
  });
  const accBuf = (g, colorFn, out) => capa(g, out, L => {
    for (let y = 48; y <= 56; y++) for (let x = 11; x <= 45; x++) { const dx = (x + .5 - 28) / 17, dy = (y + .5 - 52) / 4.6; if (dx * dx + dy * dy <= 1) L.set(x, y, colorFn(x, y, Math.floor((x + y) / 3) % 2)); }
    for (let y = 54; y <= 68; y++) for (let x = 37; x <= 42; x++) L.set(x, y, colorFn(x, y, Math.floor(y / 3) % 2));
    [37, 39, 41].forEach(x => { L.set(x, 69, colorFn(x, 69, 0)); L.set(x, 70, colorFn(x, 70, 0)); });
  });
  const accBand = (g, c1, c2, out) => capa(g, out, L => { for (let y = 48; y <= 61; y++) { const half = Math.round(12 * (1 - (y - 48) / 14)) + 1; for (let x = 28 - half; x <= 27 + half; x++) L.set(x, y, (x * 3 + y * 5) % 7 === 0 ? c2 : (y < 51 ? mixC(c1, .25) : c1)); } });
  const arcoCuello = (x, base, k) => base - Math.round(((x - 28) / 12) ** 2 * k);
  ACC2.mono_rosa = g => accMono(g, pal4('#ff7ab8'), '#4a1030');
  ACC2.mono_azul = g => accMono(g, R.azul, TINTA_AZUL);
  ACC2.pajarita = g => capa(g, '#0a0a14', L => { [[20, 26, -1], [30, 36, 1]].forEach(([a, b]) => { for (let x = a; x <= b; x++) { const h = 1 + Math.abs(x - (a + b) / 2 - ((a + b) / 2 > 28 ? -3 : 3)) * .0 + (x < 28 ? (26 - x) * .5 : (x - 29) * .5); for (let y = Math.round(53 - h); y <= Math.round(53 + h); y++) L.set(x, y, (x + y) % 5 === 0 ? '#ffffff' : '#262244'); } }); L.rect(26, 51, 4, 4, '#262244'); L.rect(27, 52, 1, 1, '#6a6a9a'); });
  ACC2.bufanda_verde = g => accBuf(g, (x, y, k) => k ? '#2f9a4a' : '#f4eed8', '#12432a');
  ACC2.bufanda_azul = g => accBuf(g, (x, y, k) => k ? '#4f49ea' : '#d0f0ff', TINTA_AZUL);
  ACC2.bufanda_rosa = g => accBuf(g, (x, y, k) => k ? '#ff7ab8' : '#fff0f6', '#4a1030');
  ACC2.bufanda_arcoiris = g => { const RC = ['#ff4a4a', '#ff9a30', '#ffe030', '#58d048', '#48a8f0', '#b060f0']; accBuf(g, (x, y) => RC[(Math.floor((x + y) / 2.5)) % 6], '#2a1a4a'); };
  ACC2.bandana_roja = g => accBand(g, '#d8333f', '#ffffff', '#4a0a14');
  ACC2.bandana_negra = g => { accBand(g, '#3a3a52', '#e8e8ff', '#0a0a14'); g.rect(26, 53, 4, 3, '#e8e8ff'); g.set(26, 54, '#262244'); g.set(29, 54, '#262244'); g.rect(27, 56, 2, 1, '#e8e8ff'); };
  ACC2.perlas = g => { for (let x = 16; x <= 40; x += 3) { const y = arcoCuello(x, 56, 6); g.rect(x, y, 2, 2, '#ffffff'); g.set(x + 1, y + 1, '#c8d0ea'); } g.rect(27, 58, 3, 3, '#ffffff'); g.set(28, 60, '#c8d0ea'); };
  ACC2.medalla = g => { for (let i = 0; i <= 10; i++) { const c = i % 4 < 2 ? '#e8353f' : '#4b6ae8'; g.set(21 + i, 50 + Math.round(i * .9), c); g.set(22 + i, 50 + Math.round(i * .9), c); g.set(35 - i, 50 + Math.round(i * .9), c); g.set(34 - i, 50 + Math.round(i * .9), c); } capa(g, '#6a4a08', L => sombrear(L, elipse(28, 63, 5, 5), 28, 63, 5, 5, R.dorado)); estr4(g, 28, 63, 3, '#fff6b0'); };
  ACC2.cadena = g => { for (let x = 16; x <= 40; x += 2) { const y = arcoCuello(x, 56, 6); g.rect(x, y, 2, 2, (x / 2) % 2 ? '#ffd84a' : '#d8a020'); g.set(x, y, '#fff6b0'); } capa(g, '#6a4a08', L => { L.rect(24, 60, 8, 7, '#ffd84a'); L.rect(25, 61, 6, 5, '#d8a020'); L.rect(26, 62, 4, 3, '#8a5a10'); L.set(24, 60, '#fff6b0'); }); g.set(28, 63, '#ffe45a'); };
  ACC2.lei = g => { const C = ['#ff4a6a', '#ffd84a', '#ff9a40', '#ff7ab8', '#ffffff']; for (let x = 15; x <= 41; x += 2) { const y = arcoCuello(x, 55, 6); g.rect(x, y + 1, 2, 2, '#2f9a4a'); } for (let i = 0, x = 15; x <= 41; x += 4, i++) { const y = arcoCuello(x, 55, 6), c = C[i % 5]; g.rect(x - 1, y, 3, 3, c); g.set(x, y + 1, '#ffd84a'); g.set(x - 1, y, mixC(c, .4)); } };
  ACC2.campana = g => { for (let x = 15; x <= 41; x++) { const y = arcoCuello(x, 53, 5); g.set(x, y, '#e8353f'); g.set(x, y + 1, '#b02030'); } capa(g, '#6a4a08', L => sombrear(L, elipse(28, 59, 3, 3), 28, 59, 3, 3, R.dorado)); g.rect(27, 60, 3, 1, '#6a4a08'); g.set(28, 62, '#6a4a08'); };
  ACC2.collar_diamante = g => { for (let x = 16; x <= 40; x += 2) { const y = arcoCuello(x, 56, 6); g.rect(x, y, 2, 1, (x / 2) % 2 ? '#e8f4ff' : '#aab4d0'); if (x % 8 === 0) { g.set(x, y + 1, '#7af0ff'); g.set(x + 1, y + 1, '#ffffff'); } } capa(g, '#1a5a8a', L => { for (let y = 58; y <= 67; y++) { const h = y <= 62 ? (y - 57) * 1.1 : (68 - y) * 1.1; for (let x = 28 - Math.round(h); x <= 27 + Math.round(h); x++) L.set(x, y, y < 61 ? (x < 28 ? '#ffffff' : '#bff6ff') : (x < 28 ? '#7af0ff' : '#2aa8d8')); } }); g.set(27, 59, '#ffffff'); g.set(26, 60, '#ffffff'); };

  // ---------- CABEZA (ranura de orejas) ----------
  const audi = (g, banda, copa, out, brillo) => {
    capa(g, '#150f20', L => { for (let y = 0; y <= 34; y++) for (let x = 0; x < SW; x++) { const d = ((x + .5 - 28) / 25) ** 2 + ((y + .5 - 32) / 20) ** 2; if (d > 1.0 && d <= 1.17) L.set(x, y, banda); } });
    [3.5, 52.5].forEach(cx => { capa(g, out, L => sombrear(L, elipse(cx, 37, 3.6, 8), cx, 37, 3.6, 8, copa)); if (brillo) { g.rect(Math.round(cx) - 1, 34, 2, 6, brillo); } });
  };
  const orejaTri = (g, pal, int, tope) => [11, 45].forEach(cx => capa(g, '#150f20', L => {
    sombrear(L, (x, y) => y >= 6 && y <= 18 && Math.abs(x + .5 - cx) <= (y - 5) * .55, cx, 14, 6, 8, pal);
    for (let y = 10; y <= 16; y++) for (let x = cx - 2; x <= cx + 2; x++) if (L.has(x, y) && Math.abs(x + .5 - cx) <= (y - 9) * .3) L.set(x, y, int);
    if (tope) for (let y = 6; y <= 8; y++) for (let x = cx - 3; x <= cx + 3; x++) if (L.has(x, y)) L.set(x, y, tope);
  }));
  const alitas = (g, pal, out, pico) => alasG(g, ALA_P, pal, out, pico ? '#d0a0ff' : '#9ea8cf');
  const cuernoG = (g, pal, out, alto, grosor) => [11, 45].forEach(cx => { const d = cx < 28 ? -1 : 1; capa(g, out, L => sombrear(L, (x, y) => { if (y < 17 - alto || y > 17) return false; const ccx = cx + d * (17 - y) * .3; return Math.abs(x + .5 - ccx) <= grosor * (y - (17 - alto) + 1) / (alto + 1); }, cx, 12, 5, alto / 2 + 1, pal)); });
  ACC2.lazo_cabeza = g => capa(g, '#4a1030', L => { [[41, 15], [50, 15]].forEach(([cx, cy]) => sombrear(L, elipse(cx, cy, 4, 3.4), cx, cy, 4, 3.4, pal4('#ff7ab8'))); L.rect(44, 13, 4, 5, '#d04888'); L.rect(44, 13, 4, 1, '#ffc0e0'); L.rect(42, 18, 2, 3, '#ff7ab8'); L.rect(49, 18, 2, 3, '#ff7ab8'); });
  ACC2.gorro_fiesta = g => capa(g, '#4a1030', L => { for (let y = 2; y <= 19; y++) { const cx = 10 - (19 - y) * .1, hw = Math.min(7, (y - 1) * .42); for (let x = Math.round(cx - hw); x <= Math.round(cx + hw); x++) L.set(x, y, ((x + y) >> 2) % 2 ? '#ffd84a' : (x < cx ? '#ff9ad0' : '#ff5ab0')); } circ(L, 9, 2, 2, '#ffffff'); });
  ACC2.flores = g => { const C = [['#ff7ab8', '#ffe0f0'], ['#ffffff', '#e0e0ff'], ['#b48cff', '#e8d8ff']]; [[6, 25], [8, 19], [12, 15], [50, 25], [48, 19], [43, 15]].forEach(([cx, cy], i) => { const [a, b] = C[i % 3]; g.rect(cx - 1, cy + 3, 3, 1, '#2f9a4a'); [[0, -2], [-2, 0], [2, 0], [0, 2]].forEach(([dx, dy]) => { g.rect(cx + dx - 1, cy + dy - 1, 2, 2, a); g.set(cx + dx - 1, cy + dy - 1, b); }); g.rect(cx - 1, cy - 1, 2, 2, '#ffd84a'); }); };
  ACC2.orejas_perro = g => [8, 48].forEach((cx, i) => capa(g, '#2a1408', L => { sombrear(L, elipse(cx, 24, 4.6, 10), cx, 22, 4.6, 10, pal4('#9a6a40')); for (let y = 20; y <= 30; y++) for (let x = cx - 1; x <= cx + 1; x++) if (L.has(x, y)) L.set(x, y, '#5a3a20'); }));
  ACC2.antenas = g => [[13, 15, 9, 3], [43, 15, 47, 3]].forEach(([x0, y0, x1, y1]) => { linea(g, x0, y0, x1, y1, '#262244'); linea(g, x0 + 1, y0, x1 + 1, y1, '#262244'); capa(g, '#12432a', L => sombrear(L, elipse(x1 + .5, y1, 3, 3), x1 + .5, y1, 3, 3, R.verde)); });
  ACC2.orejas_oso = g => [10, 46].forEach(cx => capa(g, '#3a1a08', L => { sombrear(L, elipse(cx, 16, 5.4, 5.4), cx, 16, 5.4, 5.4, pal4('#a0703c')); circ(L, cx, 17, 2.4, '#f0b090'); }));
  ACC2.cuernitos = g => cuernoG(g, R.rojo, '#4a0a14', 11, 5);
  ACC2.audifonos_rosa = g => audi(g, '#ff9ad0', pal4('#ff5ab0'), '#4a1030', null);
  ACC2.audifonos_gamer = g => audi(g, '#2a2a3a', pal4('#3a3a52'), '#0a0a14', '#7af0ff');
  ACC2.orejas_conejo = g => [12, 44].forEach(cx => capa(g, '#4a3a58', L => { sombrear(L, elipse(cx, 11, 3.6, 8.6), cx, 11, 3.6, 8.6, R.piel); sombrear(L, elipse(cx, 12, 1.7, 5.8), cx, 12, 1.7, 5.8, pal4('#ffa0b6')); }));
  ACC2.estrellas_flot = g => [[5, 8, 4], [51, 6, 4], [3, 20, 3], [53, 19, 3], [11, 3, 3]].forEach(([x, y, r]) => capa(g, '#a86a10', L => { estr4(L, x, y, r, '#ffe45a'); L.set(x, y, '#ffffff'); }));
  ACC2.orejas_zorro = g => orejaTri(g, pal4('#ff8a2a'), '#3a1a08', '#ffffff');
  ACC2.halo = g => { for (let y = 0; y <= 6; y++) for (let x = 10; x <= 46; x++) { const d = ((x + .5 - 28) / 16) ** 2 + ((y + .5 - 3) / 3.4) ** 2; if (d >= .3 && d <= 1) g.set(x, y, y < 2 ? '#ffffff' : y < 4 ? '#e8ecff' : '#aab4d0'); } };
  ACC2.halo_dorado = g => { for (let y = 0; y <= 6; y++) for (let x = 8; x <= 48; x++) { const d = ((x + .5 - 28) / 18) ** 2 + ((y + .5 - 3) / 3.4) ** 2; if (d >= .3 && d <= 1) g.set(x, y, y < 2 ? '#fff6b0' : y < 4 ? '#ffd84a' : '#d8a020'); } [[8, 3], [48, 3], [28, 0], [3, 8], [53, 8]].forEach(([x, y]) => { g.set(x, y, '#ffffff'); g.set(x - 1, y, '#ffe45a'); g.set(x + 1, y, '#ffe45a'); g.set(x, y - 1, '#ffe45a'); g.set(x, y + 1, '#ffe45a'); }); };
  ACC2.alitas_angel = g => alitas(g, R.piel, '#7a86b8', false);
  ACC2.alitas_demonio = g => alitas(g, pal4('#8a3ab8'), '#1a0a28', true);
  ACC2.cuernos_dragon = g => cuernoG(g, R.dorado, '#6a2a08', 16, 6);

  // ---------- ESPALDA ----------
  const accCapaX = (g, ra, oa, borde, ermi) => capa(g, oa, L => {
    sombrear(L, (x, y) => y >= 50 && y <= 76 && Math.abs(x + .5 - 28) <= 15 + (y - 50) * .85, 28, 64, 28, 14, ra);
    for (let x = 0; x < SW; x++) if (L.has(x, 75)) L.set(x, 75, borde);
    if (ermi) for (let y = 50; y <= 55; y++) for (let x = 0; x < SW; x++) if (L.has(x, y)) L.set(x, y, ((x * 5 + y * 3) % 9 === 0) ? '#262244' : '#f4f4ff');
  });
  const alasG = (g, P, pal, out, costilla, tipos) => [0, 1].forEach(s => {
    const pts = s ? espejoX(P) : P, T = polyT(pts), bx = s ? SW - P[0][0] : P[0][0], by = P[0][1];
    capa(g, out, L => {
      sombrear(L, T, s ? SW - 6 : 6, 24, 12, 24, pal);
      P.slice(2, P.length - 1).forEach(([x, y]) => linea(L, bx, by - 2, s ? SW - x : x, y + 2, costilla, T));
      if (tipos === 'mari') for (let i = 0; i < 6; i++) { const x = s ? SW - 3 : 3, y = 8 + i * 5; if (T(x, y)) { L.set(x, y, '#ffffff'); L.set(x + (s ? -1 : 1), y, '#ffffff'); } }
    });
  });
  const ALA_G = [[15, 42], [4, 41], [0, 33], [0, 22], [0, 11], [3, 3], [6, 2], [7, 11], [9, 20], [13, 29]];
  const ALA_P = [[11, 26], [6, 34], [1, 31], [0, 25], [1, 18], [5, 12], [8, 13], [10, 20]];
  ACC2.capa_verde = g => accCapaX(g, R.verde, '#12432a', '#ffd84a');
  ACC2.capa_rosa = g => accCapaX(g, pal4('#ff7ab8'), '#4a1030', '#ffffff');
  ACC2.capa_negra = g => accCapaX(g, pal4('#3a3548'), '#08060c', '#e8353f');
  ACC2.capa_morada = g => accCapaX(g, pal4('#9a5ae8'), '#2a0a5a', '#ffd84a');
  ACC2.capa_real = g => accCapaX(g, [R.rojo[0], '#b0182c', '#780c1c', '#480410'], '#2a0408', '#ffd84a', true);
  ACC2.alas_angel = g => alasG(g, ALA_G, R.piel, '#7a86b8', '#9ea8cf');
  ACC2.alas_murcielago = g => alasG(g, ALA_G, pal4('#6a3aa0'), '#150a28', '#b48cff');
  ACC2.alas_mariposa = g => alasG(g, ALA_G, pal4('#ff7ab8'), '#3a1040', '#6ac0f0', 'mari');
  ACC2.alas_dragon = g => alasG(g, ALA_G, R.rojo, '#2a0408', '#ffd84a');

  // ---------- auras (fr: 0-39, un ciclo completo y sin saltos) ----------
  ACC2.aura_chispa = (g, fr) => {   // nv15, la más sencilla: chispitas doradas que titilan y flotan
    const a = (fr || 0) / 40 * Math.PI * 2;
    [[7, 5], [48, 5], [6, 73], [49, 73]].forEach(([x, y], i) => {
      const t = a + i * 1.6, dy = Math.round(Math.sin(t) * 1.4), br = Math.sin(t * 2) > 0;
      chispa(g, x, y + dy, br ? '#ffd84a' : '#ffb020', br ? '#fff6b0' : '#ffe45a');
    });
  };
  ACC2.aura_viento = (g, fr) => {   // nv20: chispas celestes flotando en varios puntos
    const a = (fr || 0) / 40 * Math.PI * 2;
    [[7, 5], [48, 5], [6, 66], [49, 66]].forEach(([x, y], i) => { const t = a + i * 1.3, dy = Math.round(Math.sin(t) * 1.6), dx = Math.round(Math.cos(t * .7) * 1.2); chispa(g, x + dx, y + dy, '#5ad0e8', '#eafcff'); });
    [[11, 3], [44, 3], [3, 68], [52, 68]].forEach(([x, y], i) => { const t = a + i * 2.1 + 3, dy = Math.round(Math.sin(t) * 1.8); chispa(g, x, y + dy, '#2a9ab8', '#aef0ff'); });
  };
  ACC2.aura_estelar = (g, fr) => {   // nv30: estrellas que titilan de tamaño + chispas moradas flotando
    const a = (fr || 0) / 40 * Math.PI * 2;
    [[7, 5], [48, 5], [6, 66], [49, 66]].forEach(([x, y], i) => { const t = a + i * 1.9, r = 3 + Math.round(Math.sin(t * 2)); estrella4(g, x, y, Math.max(2, r), '#ffd84a', '#ffa820'); });
    [[12, 2], [43, 2], [2, 69], [53, 69]].forEach(([x, y], i) => { const t = a + i * 1.4 + 2, dy = Math.round(Math.sin(t) * 1.5); chispa(g, x, y + dy, '#c898f0', '#f0e0ff'); });
  };
  ACC2.aura_mistica = (g, fr) => {   // premium: arcoiris girando y flotando, la más viva de todas
    const a = (fr || 0) / 40 * Math.PI * 2, RC = ['#ff6a78', '#ffb04a', '#ffe45a', '#6ae87a', '#5ad0e8', '#b088ff'], ci = Math.floor((fr || 0) / 7);
    [[7, 5], [48, 5], [6, 66], [49, 66]].forEach(([x, y], i) => { const t = a + i * 1.1, dx = Math.round(Math.cos(t) * 1.3), dy = Math.round(Math.sin(t) * 1.6), r = 4 + Math.round(Math.sin(t * 2)); estrella4(g, x + dx, y + dy, Math.max(3, r), RC[(i + ci) % 6], '#ffffff'); });
    [[12, 2], [43, 2], [2, 69], [53, 69]].forEach(([x, y], i) => { const t = a + i * 1.6 + 2, dy = Math.round(Math.sin(t) * 1.4); estrella4(g, x, y + dy, 2, RC[(i + 3 + ci) % 6], '#ffffff'); });
    [[2, 15], [53, 15]].forEach(([x, y], i) => { const t = a + i * 2 + 4, dy = Math.round(Math.sin(t) * 1.3); chispa(g, x, y + dy, RC[(i + 2 + ci) % 6], '#ffffff'); });
  };
  ACC2.aura_cortex = (g, fr) => {   // la vende Cortex: partículas de luz orbitando a Simon con halo pulsante
    const f = fr || 0, a = f / 40 * Math.PI * 2;
    // halo izquierdo y derecho que respira
    const hb = .55 + Math.sin(a * 2) * .45;
    const HCOLS = ['#b0e8ff', '#d0f4ff', '#e8fcff'];
    const hpts = [[3, 20], [3, 40], [52, 20], [52, 40], [14, 8], [41, 8], [14, 60], [41, 60]];
    hpts.forEach(([x, y], i) => { if (Math.sin(a + i * .9) > 1 - hb) { g.set(x, y, HCOLS[i % 3]); } });
    // 5 partículas orbitando en elipse alrededor de Simon
    const PCOLS = ['#ffffff', '#b0e8ff', '#ffd0f8', '#d0ffee', '#ffe8b0'];
    for (let i = 0; i < 5; i++) {
      const t = a + i * (Math.PI * 2 / 5), wobble = Math.sin(t * 3) * 1.5;
      const px = Math.round(28 + Math.cos(t) * (22 + wobble)), py = Math.round(34 + Math.sin(t) * (30 + wobble));
      const col = PCOLS[i], pulse = Math.sin(a * 2 + i) > 0;
      g.set(px, py, col);
      if (pulse) { g.set(px - 1, py, col); g.set(px + 1, py, col); g.set(px, py - 1, col); }
    }
    // 3 chispitas extra que flotan arriba y abajo de Simon
    [[28, 2], [10, 14], [45, 14], [10, 54], [45, 54], [28, 68]].forEach(([x, y], i) => {
      const t = a + i * 1.1, dy = Math.round(Math.sin(t * 1.7) * 2);
      if (Math.sin(t * 2.3) > .2) chispa(g, x, y + dy, '#c8f0ff', '#ffffff');
    });
  };
  ACC2.aura_trueno = (g, fr) => {   // easter egg de la tormenta: rayitos que salen y desaparecen alrededor de Simon
    const f = fr || 0;
    [[6, 4], [49, 4], [5, 66], [50, 66], [27, 1], [27, 70]].forEach(([x, y], i) => {
      const ph = (f + i * 7) % 40;
      if (ph < 12) g.paste(FX.rayo(), x - 2, y - 4);
    });
  };
  ACC2.aura_eterna = (g, fr) => {   // la más legendaria: la da la Semilla Eterna — estrellitas doradas orbitando en calma
    const a = (fr || 0) / 40 * Math.PI * 2;
    [[7, 5], [48, 5], [6, 66], [49, 66]].forEach(([x, y], i) => { const t = a + i * 1.6, dx = Math.round(Math.cos(t) * 1.4), dy = Math.round(Math.sin(t) * 1.4), r = 3 + Math.round(Math.sin(t * 2)); estrella4(g, x + dx, y + dy, Math.max(2, r), '#ffd84a', '#fff6d0'); });
    [[12, 2], [43, 2]].forEach(([x, y], i) => { const t = a + i * 2 + 1, dy = Math.round(Math.sin(t) * 1.3); chispa(g, x, y + dy, '#ffe68a', '#ffffff'); });
  };
  // el aura legendaria se dibuja en su propio lienzo, más grande que el cuerpo (56x78), para que las llamas
  // y el anillo de poder salgan de verdad del contorno de Simon en vez de recortarse contra su sprite
  const AURA_W = 96, AURA_H = 116, AURA_OX = 20, AURA_OY = 18;
  function auraLegendGrid(fr) {   // easter egg de la luna azul: corona de energía envolvente + anillo de poder en el piso
    const g = Grid(AURA_W, AURA_H);
    const ph = (fr || 0) / 40 * Math.PI * 2;
    const cx = AURA_OX + 28, cy = AURA_OY + 39, rx = 33, ry = 46, N = 18;
    for (let i = 0; i < N; i++) {
      const a = i / N * Math.PI * 2;
      const dx = Math.cos(a), dy = Math.sin(a) * 1.05, px = -dy, py = dx;
      const wob = Math.sin(ph * 2.2 + a * 5) * 2.2;
      const len = 8 + Math.sin(ph * 1.5 + a * 3) * 3 + (i % 3 === 0 ? 3 : 0);
      const bx = cx + dx * rx, by = cy + dy * ry;
      for (let s = 0; s < len; s++) {
        const t = s / len;
        const ox = Math.round(bx + dx * s + px * wob * t), oy = Math.round(by + dy * s + py * wob * t);
        g.set(ox, oy, s < 2 ? '#ffffff' : s < 5 ? '#bfe8ff' : s < 8 ? '#4fa8ff' : '#1a5ad0');
        if (t > .3) g.set(ox + (px > 0 ? 1 : -1), oy, s < 4 ? '#bfe8ff' : '#2a68d0');
      }
    }
    for (let i = 0; i < 6; i++) { const a = ph * 1.2 + i * (Math.PI * 2 / 6); chispa(g, Math.round(cx + Math.cos(a) * (rx + 16)), Math.round(cy + Math.sin(a) * (ry + 12) * .95), '#bfe8ff', '#ffffff'); }
    const pulso = .5 + Math.sin(ph * 2) * .5, ery = 7 + pulso * 3;   // anillo de poder en el piso, pulsando
    for (let y = -ery; y <= ery; y++) for (let x = -34; x <= 34; x++) {
      const d = (x * x) / (34 * 34) + (y * y) / (ery * ery);
      if (d <= 1 && d > .55) g.set(Math.round(cx + x), Math.round(AURA_OY + 82 + y), d > .85 ? '#1a5ad0' : '#4fa8ff');
    }
    return g;
  }

  // ---------- catálogo ----------
  const CR = { cara: [4, 22, 48, 24], cuello: [8, 42, 44, 36], orejas: [0, 0, 56, 42], espalda: [0, 40, 56, 38], aura: [0, 0, 56, 78] };
  [['cara', [['rubor', 'RUBOR', 20, 1], ['pecas', 'PECAS', 25, 2], ['gafas_redondas', 'LENTES REDONDOS', 55, 2], ['bigote', 'BIGOTE', 40, 3], ['gafas_nerd', 'GAFAS DE NERD', 60, 3], ['antifaz', 'ANTIFAZ', 70, 3], ['gafas_3d', 'GAFAS 3D', 65, 4], ['bigotes_gato', 'BIGOTES DE GATO', 45, 4], ['parche', 'PARCHE PIRATA', 70, 5], ['gafas_estrella', 'GAFAS DE ESTRELLA', 90, 6], ['aviador', 'AVIADORES', 150, 7], ['visor_neon', 'VISOR NEON', 220, 9]]],
   ['cuello', [['campana', 'CASCABEL', 45, 2], ['mono_rosa', 'MOÑO ROSA', 30, 2], ['mono_azul', 'MOÑO AZUL', 30, 3], ['pajarita', 'PAJARITA', 45, 3], ['bufanda_verde', 'BUFANDA VERDE', 65, 3], ['bufanda_azul', 'BUFANDA AZUL', 65, 4], ['bandana_roja', 'BANDANA ROJA', 50, 4], ['lei', 'COLLAR DE FLORES', 80, 4], ['bufanda_rosa', 'BUFANDA ROSA', 70, 5], ['perlas', 'PERLAS', 110, 5], ['medalla', 'MEDALLA', 130, 6], ['bandana_negra', 'BANDANA NEGRA', 55, 6], ['cadena', 'CADENA DE ORO', 200, 8]]],
   ['orejas', [['lazo_cabeza', 'LAZO', 40, 2], ['gorro_fiesta', 'GORRO DE FIESTA', 50, 3], ['flores', 'DIADEMA DE FLORES', 70, 3], ['orejas_perro', 'OREJAS DE PERRO', 80, 3], ['antenas', 'ANTENAS ALIEN', 80, 4], ['orejas_oso', 'OREJAS DE OSO', 80, 4], ['cuernitos', 'CUERNITOS', 90, 5], ['audifonos_rosa', 'AUDIFONOS ROSA', 110, 5], ['orejas_conejo', 'OREJAS DE CONEJO', 120, 6], ['estrellas_flot', 'ESTRELLAS', 130, 7], ['orejas_zorro', 'OREJAS DE ZORRO', 130, 7], ['halo', 'HALO', 160, 8], ['audifonos_gamer', 'AUDIFONOS GAMER', 180, 8], ['alitas_angel', 'ALITAS DE ANGEL', 200, 9], ['alitas_demonio', 'ALITAS DE DEMONIO', 200, 9]]],
   ['espalda', [['capa_rosa', 'CAPA ROSA', 130, 5], ['capa_verde', 'CAPA VERDE', 130, 6], ['capa_negra', 'CAPA NEGRA', 160, 7], ['capa_morada', 'CAPA MORADA', 160, 8], ['alas_angel', 'ALAS DE ANGEL', 250, 10], ['alas_murcielago', 'ALAS DE MURCIELAGO', 250, 10], ['alas_mariposa', 'ALAS DE MARIPOSA', 300, 12]]],
   ['aura', [['aura_chispa', 'AURA CHISPA', 1000, 15], ['aura_viento', 'AURA DE VIENTO', 1500, 20], ['aura_estelar', 'AURA ESTELAR', 2500, 30]]]
  ].forEach(([slot, ls]) => ls.forEach(([k, n, p, nv]) => { ITEMS[k] = { tipo: 'ropa', slot, n, p, nv, crop: k.startsWith('alas_') ? [0, 0, 56, 48] : CR[slot] }; }));
  // PREMIUM: no se compran con monedas; se consiguen con logros, colecciones completas o con Cortex comerciante
  [['gafas_arcoiris', 'cara', 'GAFAS ARCOIRIS', 'ALBUM COMPLETO'], ['bufanda_arcoiris', 'cuello', 'BUFANDA ARCOIRIS', '50 MISIONES'], ['collar_diamante', 'cuello', 'COLLAR DIAMANTE', 'TODOS SUS SECRETOS'],
   ['halo_dorado', 'orejas', 'HALO DORADO', 'SET ANGEL'], ['cuernos_dragon', 'orejas', 'CUERNOS DE DRAGON', 'SET DRAGON'], ['capa_real', 'espalda', 'CAPA REAL', 'CARIÑO NV25'], ['alas_dragon', 'espalda', 'ALAS DE DRAGON', '30 REGALOS DIARIOS'],
   ['aura_mistica', 'aura', 'AURA MISTICA', 'CARIÑO NV50']
  ].forEach(([k, slot, n, prem]) => { ITEMS[k] = { tipo: 'ropa', slot, n, p: 0, nv: 1, crop: k.startsWith('alas_') ? [0, 0, 56, 48] : CR[slot], regalo: 'logro', prem }; });
  Object.assign(ITEMS.sud_galaxia, { regalo: 'logro', prem: 'CARIÑO NV20' }); Object.assign(ITEMS.sud_realeza, { regalo: 'logro', prem: 'SET REALEZA' });
  Object.assign(ITEMS.sud_holo, { mercader: true, prem: 'SOLO CORTEX' });
  MERC_POOL.push('sud_holo');
  ITEMS.aura_cortex = { tipo: 'ropa', slot: 'aura', n: 'AURA TENUE', p: 333, nv: 1, crop: CR.aura, mercader: true, prem: 'SOLO CORTEX' };
  MERC_POOL.push('aura_cortex');
  // SEMILLA ETERNA: solo la trae Cortex Mercader, muy rara (5% de probabilidad por día) y carísima; una vez comprada, nunca más vuelve a aparecer en su bolsa
  ITEMS.semilla_eterna = { tipo: 'cuarto', n: 'SEMILLA ETERNA', p: 2500, nv: 1, grid: semillaEternaGrid, mercader: true, raro5: true, semillaMerc: 'eterna', prem: 'SOLO CORTEX · MUY RARA' };
  MERC_POOL.push('semilla_eterna');
  const PREM_SETS = [
    { id: 'realeza', n: 'REALEZA', items: ['sud_dorada', 'monodorado', 'bufanda_dorada', 'monoculo', 'collar'], premio: 'sud_realeza' },
    { id: 'angel', n: 'ANGEL', items: ['sud_blanca', 'alitas_angel', 'halo', 'alas_angel'], premio: 'halo_dorado' },
    { id: 'dragon', n: 'DRAGON', items: ['sud_roja', 'cuernitos', 'alas_murcielago', 'capa_negra'], premio: 'cuernos_dragon' }
  ];
  const ROPA_SLOTS = [['todo', 'TODO'], ['sudadera', 'SUDADERAS'], ['cara', 'CARA'], ['cuello', 'CUELLO'], ['orejas', 'CABEZA'], ['espalda', 'ESPALDA'], ['aura', 'AURA'], ['mascota', 'MASCOTAS'], ['prem', 'PREMIUM']];
  // mascotas: se gestionan por separado (e.pets[]), no por slot de ropa, pero se listan como ropa para el UI
  ITEMS.pet_sif = { tipo: 'ropa', slot: 'mascota', n: 'SIF', p: 0, nv: 1, crop: [0, 0, 30, 26], mascota: true, prem: 'ADOPTAR A SIF' };
  ITEMS.ojo_pet = { tipo: 'ropa', slot: 'mascota', n: 'OJO DE CTHULHU', p: 0, nv: 1, crop: [0, 0, 28, 28], mascota: true, prem: 'EVENTO LUNA DE SANGRE' };
  ORDEN.ropa.push(...Object.keys(ITEMS).filter(k => ITEMS[k].tipo === 'ropa' && !ORDEN.ropa.includes(k)));
  /* ===================== SECRETOS (huevos de pascua): objetos que no están en la tienda ===================== */
  // casco espacial: domo de cristal alrededor de la cabeza + aro metálico en el cuello
  ACC2.casco_espacial = g => {
    const cx = 28, cy = 31, rx = 26, ry = 27;
    for (let y = 1; y <= 57; y++) for (let x = 0; x <= 55; x++) {
      const d = ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2;
      if (d <= 1 && d >= .88) g.set(x, y, y < 28 ? '#f4fcff' : '#bfe6ff');
      else if (d < .88 && d > .6 && x < cx - 8 && y < cy - 4 && (x + y) % 4 === 0) g.set(x, y, '#e6f6ff');
    }
    [[9, 17], [10, 15], [12, 13], [15, 11], [19, 9]].forEach(([x, y]) => g.rect(x, y, 3, 2, '#ffffff'));
    g.rect(8, 52, 40, 5, '#8a94b4'); g.rect(8, 52, 40, 1, '#e4ecff'); g.rect(8, 56, 40, 1, '#4a5478'); g.rect(7, 53, 1, 3, '#4a5478'); g.rect(48, 53, 1, 3, '#4a5478');
    [[13, '#ff5a5a'], [21, '#ffd84a'], [29, '#6adf6a'], [37, '#5ab4ff']].forEach(([x, c]) => { g.rect(x, 53, 3, 3, c); g.rect(x, 53, 3, 1, '#ffffff'); });
  };
  // gorro de chef ladeado, con un keke en la cinta
  ACC2.gorro_chef = g => capa(g, '#5a5a78', L => {
    [[12, 9, 6], [20, 7, 6], [7, 12, 5], [17, 12, 6]].forEach(([cx, cy, r]) => sombrear(L, elipse(cx, cy, r, r), cx, cy - 1, r, r, ['#ffffff', '#f4f6ff', '#d8def0', '#aab4d0']));
    L.rect(6, 15, 17, 5, '#f4f6ff'); L.rect(6, 15, 17, 1, '#ffffff'); L.rect(6, 19, 17, 1, '#aab4d0');
    L.rect(13, 16, 4, 3, '#ffd84a'); L.rect(13, 16, 4, 1, '#fff6b0'); L.rect(14, 15, 2, 1, '#ff5a8a');
  });
  ITEMS.casco_espacial = { tipo: 'ropa', slot: 'orejas', n: 'CASCO ESPACIAL', p: 0, nv: 1, crop: [0, 0, 56, 60], codigo: true, secreto: true };
  ITEMS.gorro_chef = { tipo: 'ropa', slot: 'orejas', n: 'GORRO DE CHEF KEKE', p: 0, nv: 1, crop: CR.orejas, codigo: true, secreto: true };
  function platilloGrid() {
    const g = Grid(22, 15);
    capa(g, '#2a4a6a', L => sombrear(L, elipse(11, 5.5, 5, 5), 11, 4, 5, 5, ['#e8fbff', '#b8f0ff', '#7ad0f0', '#4a98c8']));
    capa(g, '#2a2a40', L => sombrear(L, elipse(11, 10, 10.5, 3.6), 11, 8.5, 10.5, 3.6, ['#e4e8f8', '#b4bcd4', '#7a84a4', '#4a5272']));
    g.rect(8, 3, 6, 4, '#5ae06a'); g.rect(8, 3, 6, 1, '#a8f4b0'); g.rect(9, 4, 1, 2, '#12301a'); g.rect(12, 4, 1, 2, '#12301a');
    [[4, '#ff5a5a'], [9, '#ffd84a'], [14, '#6adf6a'], [18, '#5ab4ff']].forEach(([x, c]) => { g.rect(x, 10, 2, 2, c); g.set(x, 10, '#ffffff'); });
    g.rect(5, 13, 2, 2, '#4a5272'); g.rect(15, 13, 2, 2, '#4a5272'); g.rect(10, 13, 2, 1, '#4a5272');
    return g;
  }
  function pelucheGrid() {   // mini Cortex: cabezón blanco, pelo negro con mechas rojas, ojos rojos, alas de fuego, chaqueta naranja
    const g = Grid(22, 27);
    capa(g, '#e8353f', L => { [[5, 10, 0, 4], [5, 13, 0, 11], [5, 16, 1, 18], [16, 10, 21, 4], [16, 13, 21, 11], [16, 16, 20, 18]].forEach(([x0, y0, x1, y1]) => { linea(L, x0, y0, x1, y1, '#1c1824'); linea(L, x0, y0 + 1, x1, y1 + 1, '#1c1824'); }); });
    capa(g, '#3a3e66', L => sombrear(L, elipse(11, 12, 8.6, 7.6), 11, 10, 8.6, 7.6, ['#ffffff', '#eef0ff', '#c8cce8', '#9ea4c8']));
    capa(g, '#0a0810', L => { L.rect(5, 4, 12, 3, '#1c1824'); L.rect(4, 6, 14, 2, '#1c1824'); L.rect(3, 7, 3, 4, '#1c1824'); L.rect(17, 7, 3, 3, '#1c1824'); L.rect(6, 8, 7, 1, '#1c1824'); L.rect(6, 9, 3, 1, '#1c1824'); [[7, 3], [10, 2], [14, 3], [16, 4]].forEach(([x, y]) => L.set(x, y, '#1c1824')); });
    g.rect(8, 5, 1, 3, '#e8353f'); g.rect(13, 6, 1, 3, '#e8353f'); g.rect(10, 8, 1, 1, '#e8353f');
    g.rect(8, 0, 1, 2, '#e8353f'); g.rect(10, 0, 1, 3, '#e8353f'); g.rect(12, 0, 1, 2, '#e8353f'); g.rect(8, 2, 5, 1, '#e8353f');
    g.rect(6, 11, 3, 4, '#d0202e'); g.rect(13, 11, 3, 4, '#d0202e'); g.set(6, 11, '#ffffff'); g.set(7, 11, '#ffffff'); g.set(13, 11, '#ffffff'); g.set(14, 11, '#ffffff'); g.set(7, 14, '#6a0a14'); g.set(14, 14, '#6a0a14');
    g.rect(4, 15, 2, 1, '#ff9ab0'); g.rect(16, 15, 2, 1, '#ff9ab0'); g.rect(9, 16, 4, 2, '#3a0a14'); g.rect(10, 17, 2, 1, '#ff6a8a');
    capa(g, '#3a2a10', L => { L.rect(6, 20, 10, 5, '#ff9a20'); L.rect(6, 20, 10, 1, '#ffc060'); L.rect(9, 20, 4, 5, '#1c1824'); L.rect(2, 21, 3, 4, '#f4f6ff'); L.rect(17, 21, 3, 4, '#f4f6ff'); });
    g.rect(10, 22, 2, 2, '#ff8a20'); g.rect(6, 25, 4, 2, '#c82a36'); g.rect(12, 25, 4, 2, '#c82a36'); g.rect(6, 25, 4, 1, '#ff6a78'); g.rect(12, 25, 4, 1, '#ff6a78');
    return g;
  }
  function arteCortexBebe() {
    const g = Grid(28, 20); g.rect(0, 0, 28, 20, '#ffe6ee'); [[3, 4], [24, 3], [5, 15], [23, 16]].forEach(([x, y]) => { g.set(x, y, '#ffb8d0'); g.set(x + 1, y, '#ffb8d0'); g.set(x, y + 1, '#ffb8d0'); });
    g.rect(0, 17, 28, 3, '#c8d8ff');
    disco(g, 14, 12, 7, '#f4d2c0'); disco(g, 14, 12, 6, '#ffe6d6');
    g.rect(13, 2, 3, 3, '#1c1824'); g.rect(11, 3, 2, 2, '#1c1824'); g.rect(16, 3, 2, 2, '#1c1824'); g.rect(15, 1, 1, 3, '#e8353f'); g.rect(10, 5, 9, 1, '#1c1824');
    g.rect(10, 11, 2, 3, '#e8353f'); g.rect(17, 11, 2, 3, '#e8353f'); g.set(10, 11, '#ffffff'); g.set(17, 11, '#ffffff');
    g.rect(9, 14, 2, 1, '#ff9ab0'); g.rect(18, 14, 2, 1, '#ff9ab0'); g.rect(13, 15, 3, 1, '#c8707a');
    g.rect(8, 17, 12, 3, '#e8353f'); g.rect(13, 16, 3, 1, '#f4d2c0');
    g.rect(21, 4, 4, 2, '#ffd84a'); g.rect(21, 3, 1, 1, '#ffd84a'); g.rect(23, 3, 1, 1, '#ffd84a');
    return g;
  }
  ITEMS.platillo_mini = { tipo: 'cuarto', slot: 'deco', n: 'MINI PLATILLO', p: 0, nv: 1, grid: platilloGrid, codigo: true, secreto: true };
  ITEMS.peluche_cortex = { tipo: 'cuarto', slot: 'deco', n: 'MINI CORTEX', p: 0, nv: 1, grid: pelucheGrid, codigo: true, secreto: true, tap: 'peluche' };
  ITEMS.marco_cortex_bebe = { tipo: 'cuarto', slot: 'cuadro', n: 'OBRA: CORTEX BEBÉ', p: 0, nv: 1, grid: () => marcoGrid('marco_cortex_bebe'), arte: arteCortexBebe, mc: ORO, codigo: true, secreto: true };
  ITEMS.aura_legend = { tipo: 'ropa', slot: 'aura', n: 'AURA LEGENDARIA', p: 0, nv: 1, crop: CR.aura, codigo: true, secreto: true };
  ITEMS.aura_trueno = { tipo: 'ropa', slot: 'aura', n: 'AURA DE TRUENO', p: 0, nv: 1, crop: CR.aura, secreto: true };
  ITEMS.aura_eterna = { tipo: 'ropa', slot: 'aura', n: 'AURA ETERNA', p: 0, nv: 1, crop: CR.aura, codigo: true, secreto: true };   // premio único de cosechar la Semilla Eterna
  const ropaSig = () => [e.ropa.cara, e.ropa.cuello, e.ropa.orejas, e.ropa.espalda, e.ropa.aura, e.ropa.sudadera].join(',') + (sinCorona ? 'N' : '');
  var MINI = (typeof MINI !== 'undefined' && MINI) || {
    keke: ['...r...', '.wwwww.', 'ppppppp', 'yyyyyyy', 'ppppppp', 'yyyyyyy', '.bbbbb.'],
    luna: ['..yyy..', '.yyy...', 'yyy....', 'yyy....', 'yyy....', '.yyy...', '..yyyy.'],
    rayo: ['....w..', '...yw..', '..yyw..', '.yyyyy.', '...yw..', '..yw...', '.y.....'],
    normal: ['.yyyyy.', 'yyyyyyy', 'yykykyy', 'yyyyyyy', 'yyyyyyy', 'yykkkyy', '.yyyyy.'],
    gota: ['.c...c.', 'ww.c...', 'wwwqqqq', 'wwwpppd', 'wwwpppd', 'wwppppd', 'ddddddd']
  };
  const PREV = {};
  function prevGrid(k) {
    if (PREV[k]) return PREV[k];
    const it = ITEMS[k]; let g;
    if (k === 'marco_foto') return marcoGrid(k);
    if (k.startsWith('cl_')) return simonGrid('a', 's', (e.closet || [])[+k.slice(3)] || e.ropa);
    if (k === 'si_card') { const ojos = e.dormido ? 'c' : 'a'; return simonGrid(ojos, 'n', e.ropa, estFisico(), false, e.ropa.aura ? tk % 40 : 0); }
    if (k === 'pet_sif') return sifGrid({ boca: 'b', cola: 1 });
    if (k === 'ic_fuego') return llamaGrid(0, !racha());
    if (k === 'ic_mon') return FX.moneda();
    if (k.startsWith('ic_')) { const COL = { a: '#4ab8ff', r: '#ff4a6a', w: '#ffffff', p: '#ff9ab0', y: '#ffd84a', b: '#a8601c', k: '#232b63', d: '#d8607e', c: '#9ad8ff', q: '#ffd0dc' }; g = Grid(7, 7); g.art(0, 0, { ham: MINI.keke, ene: MINI.rayo, fel: MINI.normal, lim: MINI.gota }[k.slice(3)], COL); return g; }
    if (k.startsWith('fo_')) return fotoGrid(k.slice(3));
    if (k.startsWith('lg_')) return lugarMini(k.slice(3));
    if (k.startsWith('hb_')) return habMini(k.slice(3));
    if (k.startsWith('pen_')) { g = OBJ.find(o => 'pen_' + o.id === k).g(); return g; }
    if (k === 'ojo_pet') return ojoGrid(8, 1, 0, 0, 0);
    if (k.startsWith('ig_')) return IGRID[k.slice(3)]();
    if (k.startsWith('sm_')) return semillaGrid(k.slice(3));
    if (k.startsWith('fd_')) { g = FGRID[k.slice(3)](); return g; }
    if (k.startsWith('mj_')) {   // iconos de los minijuegos
      g = Grid(18, 14); const M = { w: '#f4f4ff', k: '#1a1a2e', r: '#e8353f', b: '#4b6ae8', y: '#ffd84a', g: '#aab4c8', G: '#6a7490', p: '#ff5ac8', c: '#7af0ff', n: '#3a4ac0', N: '#14163a', s: '#ffffff' };
      if (k === 'mj_run') {
        g.rect(0, 13, 18, 1, '#8a6ac0');
        g.art(1, 6, ['.rrrrr.', 'wwwwwww', 'wkkwkkw', 'wkkwkkw', 'wwwwwww', '.wbbbw.', '.b...b.'], M);
        g.art(12, 7, ['.gggg.', 'gggggg', 'gGgGgg', 'gGgGgg', 'gGgGgg', 'gGgGgg'], M); g.rect(12, 6, 6, 1, '#d0d8e8');
        g.art(9, 2, ['.rr.', 'rrrr', '.rr.'], { r: '#ffd84a' }); g.set(0, 8, '#aab4c8'); g.set(1, 8, '#aab4c8'); g.set(0, 10, '#aab4c8');
      } else if (k === 'mj_mem') {
        g.rect(0, 0, 8, 13, M.N); g.rect(1, 1, 6, 11, M.n); g.art(2, 3, ['.yyy.', 'y...y', '...y.', '..y..', '.....', '..y..'], M);
        g.rect(10, 1, 8, 13, M.N); g.rect(11, 2, 6, 11, M.w); g.art(12, 4, ['r.r', 'rrr', '.r.'], M); g.art(12, 8, ['.y.', 'yyy', '.y.'], M);
      } else {
        g.rect(1, 12, 4, 2, M.p); g.rect(7, 12, 4, 2, M.c); g.rect(13, 12, 4, 2, M.y);
        g.rect(5, 1, 1, 8, M.s); g.rect(12, 1, 1, 8, M.s); g.rect(5, 1, 8, 2, M.s); g.rect(2, 7, 4, 3, M.y); g.rect(9, 7, 4, 3, M.y); g.rect(3, 6, 2, 1, M.y); g.rect(10, 6, 2, 1, M.y);
        g.set(15, 3, M.c); g.set(14, 4, M.c); g.set(16, 4, M.c); g.set(15, 5, M.c); g.set(1, 3, M.p); g.set(0, 4, M.p); g.set(2, 4, M.p); g.set(1, 5, M.p);
      }
      return g;
    }
    if (k.startsWith('dib_')) g = dibujoGrid(k.slice(4));
    else if (k === 'caja') g = cajaGrid();
    else if (it.tipo === 'ropa') {
      if (k === 'aura_legend') {
        // componer aura legendaria (96x116) + Simon encima en AURA_OX,AURA_OY
        const aG = auraLegendGrid(20), sG = simonGrid('a', 's', {});
        aG.paste(sG, AURA_OX, AURA_OY);
        g = aG;
      } else {
        g = recorte(simonGrid('a', 's', { [it.slot]: k }), ...it.crop);
      }
    }
    else if (it.pat) g = swatchEst(it);
    else if (it.refri) g = refriPrev(k);
    else if (it.slot === 'pared') g = swatchPared(it.col);
    else if (it.slot === 'alfombra') g = swatchAlf(it.col);
    else g = it.grid();
    return (PREV[k] = g);
  }

  const LLAMA = [
    ["....o....", "...oro...", "...orro..", "..orrro.o", ".orryrroo", ".orryyrro", "orryyyyro", "orryywyro", "orryyyyro", ".orryyyro", "..ooooo.."],
    ["....o....", "....oro..", "...orro..", "o.orrro..", "oorrryro.", "orryyrro.", "orryyyyro", "orryywyro", "orryyyyro", ".orryyyro", "..ooooo.."]
  ];
  function llamaGrid(f, apagada) {
    const g = Grid(9, 11);
    g.art(0, 0, LLAMA[f], apagada ? { o: '#3a3e5c', r: '#6a6f94', y: '#8a90b8', w: '#b0b6d8' } : { o: '#8a2008', r: '#ff4a1c', y: '#ffb020', w: '#fff2a0' });
    return g;
  }
  const DIG = ['111101101101111', '010110010010111', '111001111100111', '111001111001111', '101101111001001', '111100111001111', '111100111101111', '111001001001001', '111101111101111', '111101111001111'];
  const LLAMITA = [['...o...', '..oro..', '.orrro.', '.orryro', 'orryyro', 'orrywro', 'orryyro', '.orrro.', '..ooo..'], ['....o..', '..oro..', '.orrro.', '.orryro', 'orryyro', 'orrywro', 'orryyro', '.orrro.', '..ooo..'],
    ['..o....', '..oro..', '.orrro.', '.orryro', 'orryyro', 'orrywro', 'orryyro', '.orrro.', '..ooo..'], ['.......', '...o...', '..oro..', '.orrro.', 'orryyro', 'orrywro', 'orryyro', '.orrro.', '..ooo..']];
  const LLAMA_SEC = [0, 1, 0, 2, 3, 2];
  let rachaModo = 0;   // 0 = racha, 1 = hora, 2 = clima (un toque cambia; al abrir el juego vuelve a la racha)
  const rachaF = () => racha() ? LLAMA_SEC[(tk >> 1) % 6] : 0;
  const horaRacha = () => { const d = new Date(ahora()); return String(d.getHours()).padStart(2, '0') + String(d.getMinutes()).padStart(2, '0'); };
  function rachaGrid(r, f, modo, hhmm) {
    const g = Grid(23, 13), c = r ? '#ffd84a' : '#8a90b8';
    g.rect(0, 0, 23, 13, '#3a2410'); g.rect(1, 1, 21, 11, '#e8c04a'); g.rect(2, 2, 19, 9, '#1a1f4a');
    if (modo === 2) {   // clima actual con una animación sencilla
      const w = hhmm.w, noche = hhmm.n, F = f & 3, R = (x0, y0, w0, h0, c) => g.rect(x0, y0, w0, h0, c);
      const nube = (cc, c2) => { R(6, 6, 11, 3, cc); R(8, 4, 5, 2, cc); R(12, 5, 4, 1, cc); R(6, 8, 11, 1, c2); };
      if (w === 'sol') {
        if (noche) { R(9, 4, 4, 5, '#f8f2d0'); R(8, 5, 1, 3, '#f8f2d0'); R(11, 3, 2, 7, '#1a1f4a'); R(12, 4, 3, 5, '#1a1f4a'); [[16, 3], [4, 5], [15, 8], [5, 9]].forEach(([x, y], i) => { if ((F + i) % 3) g.set(x, y, '#fff6d8'); }); }
        else { circG(g, 11, 6, 2, '#ffd84a'); R(10, 5, 2, 2, '#fff2a0'); const ry = '#ffb020'; if (F % 2) { [[11, 2], [11, 10], [6, 6], [16, 6]].forEach(([x, y]) => g.set(x, y, ry)); [[8, 3], [14, 3], [8, 9], [14, 9]].forEach(([x, y]) => g.set(x, y, '#ffe27a')); } else { [[11, 3], [11, 9], [7, 6], [15, 6]].forEach(([x, y]) => g.set(x, y, ry)); [[8, 4], [14, 4], [8, 8], [14, 8]].forEach(([x, y]) => g.set(x, y, '#ffe27a')); } }
      } else if (w === 'arcoiris') {
        [['#e8353f', 8], ['#ffb020', 7], ['#5ac870', 6], ['#4ab8ff', 5]].forEach(([c, rx]) => { for (let x = -rx; x <= rx; x++) { const y = Math.round(Math.sqrt(Math.max(0, 1 - (x / rx) * (x / rx))) * (rx * .62)); g.set(11 + x, 9 - y, c); } });
        R(3, 9, 2, 1, '#f4f4ff'); R(17, 9, 3, 1, '#f4f4ff');
      } else {
        const dark = w === 'tormenta', nv = dark ? '#6a6f94' : w === 'nieve' ? '#e6ecf6' : w === 'lluvia' ? '#9aa6c8' : '#c8d0e4';
        nube(nv, dark ? '#4a4e74' : '#8a90b0');
        if (w === 'lluvia') { [8, 11, 14].forEach((x, i) => g.set(x, 9 + ((F + i) % 2), '#4ab8ff')); }
        else if (w === 'tormenta') { if (F % 2 === 0) { g.set(11, 9, '#ffe45a'); g.set(10, 10, '#ffe45a'); g.set(11, 10, '#ffe45a'); } else { g.set(12, 9, '#ffe45a'); g.set(11, 10, '#ffe45a'); } }
        else if (w === 'nieve') { [8, 11, 14].forEach((x, i) => g.set(x + ((F + i) % 2), 9 + ((F + i) % 2), '#ffffff')); }
        else if (noche) { g.set(16, 3, '#fff6d8'); g.set(4, 4, '#fff6d8'); }
      }
      return g;
    }
    if (modo) {
      const hc = '#7ee8ff', put = (ch, x0) => { const m = DIG[+ch]; for (let k = 0; k < 15; k++) if (m[k] === '1') g.set(x0 + (k % 3), 4 + Math.floor(k / 3), hc); };
      put(hhmm[0], 3); put(hhmm[1], 7); put(hhmm[2], 13); put(hhmm[3], 17);
      g.set(11, 5, hc); g.set(11, 7, hc);
      return g;
    }
    g.art(2, 2, LLAMITA[f || 0], r ? { o: '#8a2008', r: '#ff4a1c', y: '#ffb020', w: '#fff2a0' } : { o: '#3a3e5c', r: '#6a6f94', y: '#8a90b8', w: '#b0b6d8' });
    const t = String(Math.min(999, r)), w = t.length * 4 - 1, x0 = 11 + Math.floor((11 - w) / 2);
    [...t].forEach((ch, i) => { const m = DIG[+ch]; for (let k = 0; k < 15; k++) if (m[k] === '1') g.set(x0 + i * 4 + (k % 3), 4 + Math.floor(k / 3), c); });
    return g;
  }
  function racha() { return e.racha > 0 ? e.racha : 0; }
  function dibujarLlama() {
    const r = racha(), c = $('ic-fue').getContext('2d');
    c.clearRect(0, 0, 9, 11);
    c.drawImage(sprite('llama' + (r ? (tk >> 2) % 2 : 0) + (r ? 'a' : 'x'), () => llamaGrid(r ? (tk >> 2) % 2 : 0, !r), 0), 0, 0);
    if (modal === 'simonInfo') { const mc = document.querySelector('#m-cuerpo canvas[data-prev="ic_fuego"]'); if (mc) { const ctx2 = mc.getContext('2d'); ctx2.clearRect(0, 0, 9, 11); ctx2.drawImage(sprite('llama' + (r ? (tk >> 2) % 2 : 0) + (r ? 'a' : 'x'), () => llamaGrid(r ? (tk >> 2) % 2 : 0, !r), 0), 0, 0); } }
  }


  /* ===================== CLIMA (cosas que solo pasan algunos días) ===================== */
  // El día trae un tipo de clima (sol, lluvia, tormenta, nieve...), pero lluvia, tormenta, nieve y arcoíris
  // solo ocurren en 1 a 3 "ratos" del día, de 10 a 30 minutos cada uno. El resto del día está nublado o con sol.
  function climaDia(h) {
    const r = hashStr('clima' + h) % 100, mes = +h.split('-')[1];
    if ((mes === 12 || mes <= 2) && r < 32) return 'nieve';
    if (r < 46) return 'sol'; if (r < 62) return 'nublado'; if (r < 80) return 'lluvia'; if (r < 87) return 'tormenta'; if (r < 94) return 'arcoiris';
    return 'sol';
  }
  function episodioActivo(h, min) {
    const n = 1 + hashStr('epn' + h) % 3, slot = 1440 / n;
    for (let i = 0; i < n; i++) {
      const dur = 10 + hashStr('epd' + h + i) % 21, ini = Math.floor(i * slot + hashStr('eps' + h + i) % Math.max(1, Math.floor(slot - dur - 5)));
      if (min >= ini && min < ini + dur) return true;
    }
    return false;
  }
  let _cl = { k: '', v: 'sol' };
  function clima() {
    if (admin && admClima) return admClima;
    const h = hoy(), d = new Date(ahora()), min = d.getHours() * 60 + d.getMinutes(), k = h + '|' + min;
    if (_cl.k === k) return _cl.v;
    const base = climaDia(h); let v = base;
    if (base === 'lluvia' || base === 'tormenta' || base === 'nieve' || base === 'arcoiris') v = episodioActivo(h, min) ? base : (base === 'arcoiris' ? 'sol' : 'nublado');
    _cl = { k, v }; return v;
  }
  function cieloClima(noche, cl) {
    const g = Grid(60, 64), X0 = 12, Y0 = 16, X1 = 46, Y1 = 54;
    const fuerte = cl === 'tormenta' || cl === 'lluvia';
    const c = noche ? (fuerte ? ['#080b22', '#0c1130', '#121842', '#1a2258'] : ['#0a0e2a', '#10163c', '#161e50', '#1e2864'])
      : fuerte ? (cl === 'tormenta' ? ['#4a5468', '#5a6680', '#6c7a96', '#8090aa'] : ['#6c7a90', '#7e8ca4', '#92a0b8', '#a8b4c8']) : ['#a8b6cc', '#b8c4d8', '#c8d2e2', '#d8e0ec'];
    for (let y = Y0; y < Y1; y++) for (let x = X0; x < X1; x++) {
      const t = (y - Y0) / (Y1 - Y0) * 3 + (BAY[y & 3][x & 3] / 16 - .5) * .8;
      g.set(x, y, c[Math.max(0, Math.min(3, Math.floor(t + .3)))]);
    }
    const nb = noche ? ['#1a2250', '#10163c'] : fuerte ? (cl === 'tormenta' ? ['#5c667c', '#444e64'] : ['#8a98ae', '#6c7a90']) : ['#f4f7fc', '#d4dcea'];
    [[17, 22, 9, 4], [33, 20, 10, 4], [26, 28, 11, 4], [40, 30, 7, 3], [15, 34, 7, 3], [30, 38, 8, 3]].forEach(([cx, cy, rx, ry]) => {
      const nube = elipse(cx, cy, rx, ry);
      for (let y = cy - ry - 1; y <= cy + ry + 1; y++) for (let x = cx - rx - 1; x <= cx + rx + 1; x++) if (x >= X0 && x < X1 && y >= Y0 && y < Y1 && nube(x, y)) g.set(x, y, y > cy ? nb[1] : nb[0]);
    });
    const suelo = cl === 'nieve' ? (noche ? ['#8a96c0', '#a4b0d8'] : ['#e6eeff', '#ffffff']) : noche ? ['#0a1636', '#10204a'] : ['#3f8a44', '#58a55a'];
    for (let y = 44; y < Y1; y++) for (let x = X0; x < X1; x++) { const h = 47 + Math.round(2.5 * Math.sin(x / 5 + 1)); if (y >= h) g.set(x, y, y > h + 2 ? suelo[0] : suelo[1]); }
    return g;
  }
  function cieloArcoiris() {
    const g = cieloGrid(false), C = ['#ff5a5a', '#ffa040', '#ffe45a', '#6adf6a', '#5ab4ff', '#9a6aff'];
    C.forEach((col, i) => { const r = 19 - i * 1.6; for (let a = 0; a <= 180; a += 1.5) { const x = Math.round(29 + Math.cos(a * Math.PI / 180) * r * 1.0), y = Math.round(50 - Math.sin(a * Math.PI / 180) * r); if (x >= 12 && x < 46 && y >= 16 && y < 50) { g.set(x, y, col); g.set(x, y + 1, col); } } });
    return g;
  }
  function cieloDe(n, cl) {
    if (cl === 'sol' || (cl === 'arcoiris' && n)) return sprite('cielo' + n, () => cieloGrid(!!n), 0);
    if (cl === 'arcoiris') return sprite('cielo_arco', cieloArcoiris, 0);
    return sprite('cielo_' + cl + n, () => cieloClima(!!n, cl), 0);
  }
  let rayo = 0;
  function climaFX(cl, n, dy) {
    if (cl !== 'tormenta') { truenoT = 0; if (!tr) boltV = 0; }
    if (cl !== 'lluvia' && cl !== 'tormenta' && cl !== 'nieve') return;
    const X = OX + 12, Y = dy + 16, W = 34, H = 31;      // dentro del vidrio (sin la colina)
    if (cl === 'nieve') {
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 22; i++) { const x = (i * 29 + Math.round(2 * Math.sin((tk + i * 7) / 9))) % W, y = (i * 47 + (tk >> 1)) % H; ctx.fillRect(X + x, Y + y, 1, 1); if (i % 4 === 0) ctx.fillRect(X + x + 1, Y + y, 1, 1); }
      return;
    }
    const N = cl === 'tormenta' ? 40 : 26, v = cl === 'tormenta' ? 5 : 4;
    ctx.fillStyle = n ? '#8fb0ff' : '#d8ecff';
    for (let i = 0; i < N; i++) { const x = (i * 37) % W, y = (i * 53 + tk * v) % (H - 3); ctx.fillRect(X + x, Y + y, 1, 3); }
    if (cl === 'tormenta') {
      const c = tk % 100;
      if (c === 0 && Math.random() < .55) {
        rayo = 4; setTimeout(truenoSusto, 500 + Math.random() * 600);
        if (!boltV && truenoDisponible()) { boltV = 16; boltX = X + 6 + Math.random() * (W - 12); boltY = Y + 5 + Math.random() * (H - 14); }
      }
      if (rayo > 0) { ctx.fillStyle = rayo > 2 ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.4)'; ctx.fillRect(X, Y, W, H); rayo--; }
      if (boltV > 0 && !tr) { ctx.drawImage(sprite('fx_rayo', FX.rayo, 0), Math.round(boltX) - 2, Math.round(boltY) - 4); boltV--; }
      if (tr && tr.f === 'entra' && centellaXY) ctx.drawImage(sprite('fx_rayo', FX.rayo, 0), Math.round(centellaXY.x) - 2, Math.round(centellaXY.y) - 4);
    }
  }
  // (TXT_CLIMA y frasesVentana definidos en dialogos.js)


  /* ===================== EFECTOS ===================== */
  const CORAZON = [".OO...OO.", "OhhOOOrrO", "OhrrrrrrO", "OrrrrrrrO", ".OrrrrrO.", "..OrrrO..", "...OrO...", "....O...."];
  function pizzaGrid() { return kekeGen({ r: '#e8333f', h: '#ff8a92', w: '#fff6ea', W: '#ffc8d8', y: '#ffd770', Y: '#e8a840', p: '#ff7aa8', o: '#c88a40' }, '#6a3a18'); }   // trozo de keke
  const KEKE_FILAS = ["......rr......", ".....rhrr.....", "..wwwwwwwwww..", ".wwWwwwwwwWww.", ".wwwwwwwwwwww.", ".yyyyyyyyyyyy.", ".yYyyyyyyyyYy.", ".pppppppppppp.", ".yyyyyyyyyyyy.", ".yYyyyyyyyyYy.", ".yyyyyyyyyyyy.", "..oooooooooo..", ".............."];
  function kekeGen(m, borde) { const g = Grid(14, 13); g.art(0, 0, KEKE_FILAS, m); g.contour(borde); return g; }
  const ROSA = ['#ffc0e0', '#ff7ab8', '#d04888', '#802858'];
  const caja = (L, x, y, w, h, r) => sombrear(L, (X, Y) => X >= x && X < x + w && Y >= y && Y < y + h, x + w / 2, y + h / 2, w * .75, h * .75, r);
  const FGRID = {
    bomba() { const g = Grid(13, 14); capa(g, '#08080e', L => sombrear(L, elipse(6, 8.5, 5.6, 5.1), 6, 8.5, 5.6, 5.1, ['#6a6a86', '#3c3c52', '#22222f', '#12121a'])); g.rect(3, 6, 2, 2, '#c8c8e0'); g.set(3, 8, '#9a9ab8'); g.rect(4, 2, 5, 2, '#08080e'); g.rect(5, 2, 3, 1, '#9a9aae'); g.set(7, 1, '#c8884a'); g.set(8, 0, '#c8884a'); g.set(9, 0, '#ffe45a'); g.set(9, 1, '#ff8a20'); g.set(10, 0, '#ff8a20'); return g; },
    manzana() { const g = Grid(13, 14); capa(g, '#5a0a14', L => sombrear(L, elipse(6.5, 8.5, 5.8, 5.4), 6.5, 8.5, 5.8, 5.4, R.rojo)); g.rect(6, 1, 1, 4, '#5a3a1a'); g.rect(7, 2, 3, 2, '#5ccf5a'); g.rect(7, 2, 1, 1, '#b2f088'); return g; },
    galleta() { const g = Grid(13, 13); capa(g, '#5a3410', L => sombrear(L, elipse(6.5, 6.5, 5.8, 5.6), 6.5, 6.5, 5.8, 5.6, ['#f0cf90', '#d9a85a', '#b27a34', '#7a4a18'])); [[4, 4], [8, 5], [5, 8], [8, 9], [7, 3]].forEach(([x, y]) => g.rect(x, y, 2, 1, '#4a2410')); return g; },
    dona() { const g = Grid(15, 13); capa(g, '#5a3410', L => sombrear(L, elipse(7.5, 6.5, 7, 5.8), 7.5, 6.5, 7, 5.8, ['#f0cf90', '#d9a85a', '#b27a34', '#7a4a18'])); capa(g, '#802858', L => sombrear(L, elipse(7.5, 5.5, 6.4, 4.6), 7.5, 5.5, 6.4, 4.6, ROSA)); g.clear(6, 4, 3, 3);
      [[3, 4, '#ffffff'], [10, 3, '#ffe45a'], [11, 6, '#6ac0f0'], [4, 7, '#5ccf5a'], [8, 8, '#ffffff']].forEach(([x, y, c]) => g.rect(x, y, 2, 1, c)); return g; },
    helado() { const g = Grid(12, 20); for (let y = 10; y < 20; y++) { const hw = 5.2 - (y - 10) * .5; for (let x = 0; x < 12; x++) if (Math.abs(x + .5 - 6) <= hw) g.set(x, y, (x + y) % 3 === 0 ? '#b27a34' : '#e0b468'); }
      g.contour('#6a4010'); capa(g, '#802858', L => sombrear(L, elipse(6, 8, 5.2, 4), 6, 8, 5.2, 4, ROSA)); capa(g, '#a89060', L => sombrear(L, elipse(6, 4.5, 4, 3.4), 6, 4.5, 4, 3.4, ['#ffffff', '#fff2d0', '#e8d4a0', '#b8a070'])); g.rect(6, 0, 2, 2, '#e8353f'); g.set(6, 0, '#ff9aa2'); return g; },
    hamburguesa() { const g = Grid(18, 15); capa(g, '#5a2810', L => { sombrear(L, (x, y) => y <= 6 && elipse(9, 6.5, 8.5, 6.5)(x, y), 9, 6.5, 8.5, 6.5, R.barro); sombrear(L, (x, y) => y >= 12 && elipse(9, 11, 8.5, 3.5)(x, y), 9, 11, 8.5, 3.5, R.barro); L.rect(1, 9, 16, 3, '#6a3a18'); L.rect(1, 9, 16, 1, '#8a5a30'); });
      for (let x = 0; x < 18; x++) g.set(x, 7 + (x % 3 === 0 ? 1 : 0), '#5ccf5a'); g.rect(1, 8, 16, 1, '#ffd84a'); [[5, 2], [9, 1], [12, 3], [7, 4]].forEach(([x, y]) => g.rect(x, y, 2, 1, '#fff2d0')); return g; },
    taco() { const g = Grid(18, 13); capa(g, '#7a4a10', L => sombrear(L, (x, y) => y >= 3 && elipse(9, 3, 8.5, 9)(x, y), 9, 6, 8.5, 8, R.amarillo)); capa(g, '#1d6a38', L => sombrear(L, elipse(9, 3, 6.5, 2.6), 9, 3, 6.5, 2.6, R.verde)); [[5, 2], [9, 1], [12, 3]].forEach(([x, y]) => g.rect(x, y, 2, 2, '#e8353f')); g.rect(7, 4, 3, 1, '#8a5a30'); return g; },
    cafe() { const g = Grid(15, 15); [[4, 0], [5, 1], [4, 2], [8, 0], [9, 1], [8, 2]].forEach(([x, y]) => g.set(x, y, '#e8ecff')); capa(g, '#232b63', L => sombrear(L, (x, y) => y >= 5 && y <= 13 && Math.abs(x + .5 - 6.5) <= 5.8 - (y - 5) * .15, 6.5, 9, 6, 5, R.piel)); g.rect(2, 5, 9, 2, '#6a3a18'); g.rect(3, 5, 4, 1, '#8a5a30');
      g.rect(12, 7, 2, 1, '#9ea8cf'); g.rect(13, 8, 1, 3, '#9ea8cf'); g.rect(12, 11, 2, 1, '#9ea8cf'); g.rect(1, 14, 12, 1, '#9ea8cf'); g.rect(6, 9, 1, 3, '#ffd84a'); g.rect(5, 10, 3, 1, '#ffd84a'); return g; },
    sopa() { const g = Grid(18, 13); capa(g, '#241b8c', L => sombrear(L, (x, y) => y >= 5 && y <= 12 && elipse(9, 5, 8.5, 8)(x, y), 9, 6, 8.5, 7, R.azul)); g.rect(1, 5, 16, 1, '#8c88ff');
      capa(g, '#9ea8cf', L => { [[6, 4, 3.5, 3], [10, 3, 3.5, 3], [13, 4.5, 3, 2.5]].forEach(([cx, cy, rx, ry]) => sombrear(L, elipse(cx, cy, rx, ry), cx, cy, rx, ry, R.piel)); }); [[4, 0], [5, 1]].forEach(([x, y]) => g.set(x, y, '#e8ecff')); return g; },
    batido() { const g = Grid(11, 18), C = ['#ff5a5a', '#ffa040', '#ffe45a', '#6adf6a', '#5ab4ff', '#9a6aff']; for (let y = 4; y < 17; y++) { const hw = 4.6 - (y - 4) * .1; for (let x = 0; x < 11; x++) if (Math.abs(x + .5 - 5.5) <= hw) g.set(x, y, C[Math.min(5, Math.floor((y - 4) / 2.2))]); }
      g.contour('#4a5a8a'); g.rect(1, 3, 9, 1, '#ffffff'); g.rect(7, 0, 1, 5, '#ffffff'); g.rect(7, 1, 1, 1, '#e8353f'); g.rect(7, 3, 1, 1, '#e8353f'); g.rect(2, 1, 3, 3, '#e8353f'); g.set(2, 1, '#ff9aa2'); g.rect(2, 16, 7, 1, '#4a5a8a'); return g; },
    chile() { const g = Grid(16, 14); capa(g, '#5a0a14', L => sombrear(L, union(elipse(12, 5, 3.2, 2.6), elipse(9, 7, 3.6, 2.8), elipse(6, 9, 3.4, 2.4), elipse(3.5, 10.5, 2.4, 1.7)), 8, 8, 8, 6, R.rojo)); g.rect(12, 1, 3, 2, '#2f9a4a'); g.rect(13, 0, 2, 1, '#5ccf5a'); g.rect(14, 3, 1, 1, '#2f9a4a'); [[12, 1], [10, 0]].forEach(([x, y]) => g.set(x, y, '#ffb040')); return g; },
    cometa() { const g = Grid(18, 16); capa(g, '#8a5a08', L => sombrear(L, (x, y) => { const dx = x + .5 - 11, dy = y + .5 - 8, r = Math.hypot(dx, dy), a = Math.atan2(dy, dx); return r <= 3.2 + 4.6 * Math.pow(Math.abs(Math.cos(2.5 * (a + Math.PI / 2))), 1.6); }, 11, 8, 8, 8, R.amarillo));
      [[1, 3], [3, 5], [5, 7], [0, 8], [2, 10], [4, 12]].forEach(([x, y]) => { g.set(x, y, '#ffffff'); g.set(x + 1, y, '#aee0ff'); }); return g; },
    kekeoro() { const g = kekeGen({ r: '#e8353f', h: '#ff8a92', w: '#fff2a0', W: '#ffffff', y: '#ffd84a', Y: '#e8a010', p: '#ffb02a', o: '#b87a10' }, '#6a4408'); [[0, 2], [13, 4], [1, 10], [12, 11]].forEach(([x, y]) => { g.set(x, y, '#ffffff'); g.set(x, y - 1, '#fff2a0'); g.set(x, y + 1, '#fff2a0'); g.set(x - 1, y, '#fff2a0'); g.set(x + 1, y, '#fff2a0'); }); return g; },
    misteriosa() { const g = Grid(14, 14); capa(g, '#2a0a5a', L => caja(L, 1, 2, 12, 11, ['#d8b0ff', '#9a5ae8', '#6a30b0', '#401880'])); g.rect(1, 5, 12, 1, '#ffd84a'); g.rect(6, 2, 2, 11, '#ffd84a');
      g.art(4, 6, [".www.", "w...w", "...w.", "..w..", "..w.."], { w: '#ffffff' }); g.set(6, 11, '#ffffff'); g.rect(6, 0, 2, 2, '#ffd84a'); return g; }
  };
  const COMIDAS = {
    kekeoro:     { n: 'KEKE DORADO',        p: 450, nv: 21, h: 50, e: 80,  f: 25, t: '¡EL KEKE LEGENDARIO!', fx: 'gran' },
    cometa:      { n: 'FRUTA COMETA',       p: 240, nv: 16, h: 35, e: 65,  f: 15, t: 'Sabe a mi planeta...' },
    bebida:      { n: 'BEBIDA ENERGÉTICA',  p: 180, nv: 14, h: 0,  e: 100, f: 8,  t: '¡Sí! ¡Siento que puedo con todo!', fx: 'salto' },
    batido:      { n: 'BATIDO ARCOÍRIS',    p: 140, nv: 12, h: 0,  e: 55,  f: 12, t: '¡Estoy sintiendo colores!' },
    chile:       { n: 'CHILE SUPERPICANTE', p: 110, nv: 9,  h: 25, e: 40,  f: 6,  t: '¡PICA, PICA, PICA!', fx: 'baile' },
    misteriosa:  { n: 'CAJA MISTERIOSA',    p: 75,  nv: 8,  rand: true },
    hamburguesa: { n: 'HAMBURGUESA',        p: 85,  nv: 7,  h: 65, e: 0,   f: 8,  t: '¡Qué gigante!' },
    sopa:        { n: 'SOPA DE NUBE',       p: 60,  nv: 6,  h: 45, e: 0,   f: 8,  t: 'Se siente como flotar.' },
    cafe:        { n: 'CAFÉ ESTELAR',       p: 50,  nv: 5,  h: 0,  e: 30,  f: 5,  t: '¡Ya estoy despierto!' },
    taco:        { n: 'TACO',               p: 38,  nv: 4,  h: 32, e: 0,   f: 5,  t: '¡Ándale!' },
    helado:      { n: 'HELADO',             p: 28,  nv: 3,  h: 18, e: 0,   f: 15, t: '¡Qué frío! ¡Qué rico!' },
    dona:        { n: 'DONA',               p: 20,  nv: 2,  h: 20, e: 0,   f: 8,  t: '¡Con chispitas!' },
    manzana:     { n: 'MANZANA',            p: 14,  nv: 1,  h: 14, e: 0,   f: 3,  t: '¡Crujiente!' },
    galleta:     { n: 'GALLETA',            p: 10,  nv: 1,  h: 8,  e: 0,   f: 5,  t: 'Dulce y con chispas.' }
  };
  const SORPRESAS = [{ w: 3, e: 15, t: 'Sabe a... ¿calcetín?' }, { w: 3, e: 30, h: 8, t: '¡Sabe a lluvia!' }, { w: 2, e: 55, t: '¡Ahora puedo ver los sonidos!' }, { w: 1, e: 85, h: 25, f: 25, t: '¡Sabe a mil kekes!', fx: 'gran' }, { w: 2, e: 8, h: 30, f: 15, t: 'Hip... ¡hip!', fx: 'baile' }];
  function zGrid() {
    const g = Grid(6, 6);
    g.art(0, 0, ["wwwwww", "....ww", "...ww.", "..ww..", ".ww...", "wwwwww"], { w: '#ffffff' });
    return conBorde(g, '#2a3a8a');
  }
  const FX = {
    corazon:  () => { const g = Grid(9, 8); g.art(0, 0, CORAZON, { O: '#7a1020', r: '#ff4a5c', h: '#ffb6c0' }); return g; },
    estrella: () => { const g = Grid(5, 5); g.art(0, 0, ["..y..", "..y..", "yyWyy", "..y..", "..y.."], { y: '#ffe45a', W: '#ffffff' }); return g; },
    pizza: pizzaGrid,
    z: zGrid,
    moneda: () => { const g = Grid(6, 6); g.art(0, 0, [".OOOO.", "OyhyyO", "OyyyyO", "OyyyyO", "OyyyyO", ".OOOO."], { O: '#8a5a08', y: '#ffd84a', h: '#fff6b0' }); return g; },
    espora: () => { const g = Grid(5, 5); g.art(0, 0, ["..y..", "..y..", "yyWyy", "..y..", "..y.."], { y: '#e8a8d8', W: '#fff0ff' }); return g; },   // brillito lila: flota alrededor de una Flor Espectro ya colocada
    cristal: () => { const g = Grid(5, 5); g.art(0, 0, ["..y..", "..y..", "yyWyy", "..y..", "..y.."], { y: '#6ad0ff', W: '#eaffff' }); return g; }   // brillito celeste: flota alrededor de una Anémona Calma ya colocada
  };
  ['#ff4a5c', '#ffe45a', '#58d048', '#4ab8ff', '#ff7ab8', '#ffffff'].forEach((c, i) => { FX['cf' + i] = () => { const g = Grid(3, 3); g.rect(0, 0, 3, 3, c); return g; }; });
  FX.crema = () => { const g = Grid(4, 4); g.art(0, 0, ['.ww.', 'wwww', 'wwpw', '.ww.'], { w: '#fff6ea', p: '#ffc8d8' }); return g; };
  FX.gota = () => { const g = Grid(3, 4); g.art(0, 0, ['.y.', 'yyy', 'ywy', '.y.'], { y: '#4ab8ff', w: '#dff3ff' }); return g; };
  FX.rayo = () => { const g = Grid(5, 8); ['..y..', '.yy..', 'yy...', '.y...', '.yy..', '..yy.', '...y.', '..y..'].forEach((row, j) => [...row].forEach((ch, i) => { if (ch === 'y') g.set(i, j, '#ffe45a'); })); g.set(2, 0, '#fff6b0'); g.set(2, 7, '#fff6b0'); return g; };
  FX.humo = () => { const g = Grid(8, 7); g.art(0, 0, ['..oooo..', '.oGGGGo.', 'oGGgGGGo', 'oGGGGgGo', '.oGGGGo.', '..oooo..'], { o: '#3a3644', G: '#6a6676', g: '#9a96a8' }); return g; };
  FGRID.jarabe = function () {
    const g = Grid(11, 15), col = { k: '#3a1220', g: '#b8d8f0', w: '#ffffff', r: '#e8353f', d: '#a01a2a', l: '#ff8a96', c: '#c89050', C: '#8a5a28', y: '#fff4b0' };
    ['....CCC....', '....ccC....', '...kkkkk...', '...kgggk...', '..kkgggkk..', '.kgggggggk.', '.kwwwwwwwk.', '.kwwrrrwwk.', '.kwrrrrrwk.', '.kwwwrwwwk.', '.kwwrrrwwk.', '.kwwwwwwwk.', '.kgrlrrrdk.', '.kgrrrrrdk.', '..kkkkkkk..']
      .forEach((f, y) => [...f].forEach((ch, x) => { if (col[ch]) g.set(x, y, col[ch]); }));
    return g;
  };
  FGRID.bebida = function () { const g = Grid(10, 15); capa(g, '#0a1a3a', L => { sombrear(L, (x, y) => x >= 1 && x <= 8 && y >= 2 && y <= 13, 4.5, 8, 5, 6, ['#8ad0ff', '#2a90e8', '#1a5ab0', '#0e3478']); L.rect(1, 1, 8, 2, '#c8d0e0'); L.rect(2, 13, 6, 1, '#c8d0e0'); }); g.art(3, 4, ['...yy', '..yy.', '.yyy.', 'yyyyy', '..yy.', '.yy..', 'yy...'], { y: '#ffe45a' }); g.rect(2, 2, 6, 1, '#ffffff'); return g; };
  FGRID.keke = pizzaGrid; Object.keys(FGRID).forEach(k => { FX['c_' + k] = FGRID[k]; });
  function termometroGrid() {
    const g = Grid(8, 18);
    const O = "#232b63", w = "#ffffff", g1 = "#d8e4f8", r = "#ff3a50", rd = "#c0182c", rl = "#ffa0b0", m = "#8a96c0";
    g.rect(2, 0, 4, 1, O);
    for (let y = 1; y <= 12; y++) { g.set(1, y, O); g.set(6, y, O); }
    g.set(0, 13, O); g.set(7, 13, O);
    g.set(0, 14, O); g.set(7, 14, O);
    g.set(0, 15, O); g.set(7, 15, O);
    g.set(1, 16, O); g.set(6, 16, O);
    g.rect(2, 17, 4, 1, O);
    for (let y = 1; y <= 12; y++) {
      g.set(2, y, w);
      g.set(3, y, r);
      g.set(4, y, rd);
      g.set(5, y, (y % 3 === 0) ? m : g1);
    }
    g.set(3, 1, rl);
    g.rect(1, 13, 6, 3, r);
    g.rect(2, 16, 4, 1, r);
    g.set(2, 13, w); g.set(3, 13, rl);
    g.set(5, 14, rd); g.set(5, 15, rd);
    return g;
  }
  function termometroFlotanteGrid(f) {
    const g = Grid(11, 12);
    const O = "#232b63", w = "#ffffff", r = "#ff3a50", rd = "#c0182c", rl = "#ffa0b0", y = "#ffd84a", c = "#4ab8ff", cl = "#dff3ff";
    g.art(0, 0, [
      "..OOOOOOO..",
      ".OwwwwwwwO.",
      "OwwwwwwwwwO",
      "OwwwwwwwwwO",
      "OwwwwwwwwwO",
      "OwwwwwwwwwO",
      "OwwwwwwwwwO",
      "OwwwwwwwwwO",
      ".OwwwwwwwO.",
      "..OwwwwwO..",
      "...OwwO....",
      "....OO....."
    ], { O, w });
    if (f % 2 === 0) {
      g.rect(4, 6, 3, 2, r); g.set(4, 6, rl); g.set(6, 7, rd);
      g.rect(5, 2, 1, 4, r);
      if (f === 2) { g.set(5, 2, y); g.set(3, 2, rl); g.set(7, 2, rl); }
      g.set(3, 3, "#8a96d8"); g.set(3, 5, "#8a96d8");
    } else {
      g.set(5, 2, c);
      g.rect(4, 3, 3, 4, c);
      g.rect(4, 7, 3, 1, c);
      g.set(4, 4, cl); g.set(4, 5, cl);
      g.set(6, 6, "#1e5088");
    }
    return g;
  }

  /* ===================== MERCADO E INGREDIENTES ===================== */
  const ING = {
    jitomate: { n: 'JITOMATE', p: 6, nv: 1 }, lechuga: { n: 'LECHUGA', p: 6, nv: 1 }, huevo: { n: 'HUEVO', p: 8, nv: 1 }, harina: { n: 'HARINA', p: 8, nv: 1 },
    leche: { n: 'LECHE', p: 10, nv: 1 }, pan: { n: 'PAN', p: 8, nv: 1 }, azucar: { n: 'AZUCAR', p: 9, nv: 1 }, queso: { n: 'QUESO', p: 14, nv: 2 },
    tortilla: { n: 'TORTILLA', p: 10, nv: 2 }, naranja: { n: 'NARANJA', p: 12, nv: 2 }, carne: { n: 'CARNE', p: 20, nv: 3 }, chocolate: { n: 'CHOCOLATE', p: 18, nv: 4 }
  };
  const ING_ORD = Object.keys(ING);
  const CAP_REFRI = { refri_menta: 8, refri_retro: 8, refri_keke: 10, refri_acero: 12, refri_negro: 14, refri_doble: 20, refri_dorado: 20 };
  const ingCap = () => CAP_REFRI[e.cuarto.refri] || 5;
  const REF_CAD = ['refri_menta', 'refri_retro', 'refri_keke', 'refri_acero', 'refri_negro', 'refri_doble'];
  const refriNv = k => !k ? 1 : k === 'refri_dorado' ? 7 : REF_CAD.indexOf(k) + 2;
  const refReq = k => { const i = REF_CAD.indexOf(k); return i > 0 && !e.tiene[REF_CAD[i - 1]] ? REF_CAD[i - 1] : null; };
  function ingL(k) { e.ing = e.ing || {}; const v = e.ing[k]; if (typeof v === 'number') e.ing[k] = Array.from({ length: v }, () => Date.now()); else if (!Array.isArray(v)) e.ing[k] = []; return e.ing[k]; }
  const ingN = k => ingL(k).length;   // total guardados: no caducan, se quedan para siempre hasta que se usan
  const ingF = k => ingN(k);   // todo lo guardado cuenta como disponible
  const ingP = () => 0;   // ya no hay ingredientes "pasados"
  const IGRID = {
    jitomate() { const g = Grid(14, 14); ovalG(g, 7, 8, 6, 5, '#e8353f'); ovalG(g, 7, 7, 5, 3, '#ff6a60'); g.rect(4, 3, 6, 2, '#3a9a50'); g.rect(6, 1, 2, 3, '#2a7a3a'); g.rect(3, 4, 2, 1, '#5ac870'); g.rect(9, 4, 2, 1, '#5ac870'); g.set(4, 6, '#ffffff'); g.contour('#7a1018'); return g; },
    lechuga() { const g = Grid(14, 14); ovalG(g, 7, 8, 6, 5, '#4ab860'); ovalG(g, 7, 7, 4, 3, '#8ae08a'); g.rect(6, 4, 1, 8, '#2a8a40'); g.rect(3, 7, 3, 1, '#2a8a40'); g.rect(9, 8, 3, 1, '#2a8a40'); g.rect(5, 5, 2, 1, '#c8f4b0'); g.contour('#1a5a2a'); return g; },
    huevo() { const g = Grid(14, 14); ovalG(g, 7, 8, 4, 5, '#f4e8d0'); ovalG(g, 7, 7, 3, 3, '#fff8ea'); g.rect(5, 5, 1, 2, '#ffffff'); g.rect(5, 11, 5, 1, '#d8c8a8'); g.contour('#8a6a3a'); return g; },
    harina() { const g = Grid(14, 14); g.rect(3, 3, 8, 10, '#f4f2ee'); g.rect(3, 3, 8, 2, '#d8d4cc'); g.rect(4, 7, 6, 3, '#e8b050'); g.rect(5, 8, 4, 1, '#fff'); g.rect(3, 12, 8, 1, '#c8c4bc'); g.set(2, 4, '#f4f2ee'); g.contour('#5a5a62'); return g; },
    leche() { const g = Grid(14, 14); g.rect(4, 4, 6, 9, '#ffffff'); g.rect(4, 2, 6, 3, '#4ab8ff'); g.rect(5, 1, 4, 1, '#4ab8ff'); g.rect(5, 7, 4, 3, '#8ad0ff'); g.rect(4, 4, 1, 9, '#e8f0f8'); g.rect(9, 5, 1, 8, '#c8d4e0'); g.contour('#2a5a8a'); return g; },
    pan() { const g = Grid(14, 14); ovalG(g, 7, 8, 6, 4, '#c8803a'); ovalG(g, 7, 7, 5, 3, '#e0a050'); g.rect(4, 6, 1, 3, '#f0c078'); g.rect(7, 5, 1, 3, '#f0c078'); g.rect(10, 6, 1, 3, '#f0c078'); g.rect(3, 11, 8, 1, '#8a5020'); g.contour('#5a3010'); return g; },
    azucar() { const g = Grid(14, 14); g.rect(3, 5, 8, 8, '#fafaff'); g.rect(3, 3, 8, 3, '#c8d4f0'); g.rect(4, 8, 6, 3, '#ff9ac0'); g.rect(5, 9, 4, 1, '#fff'); g.set(1, 3, '#fff'); g.set(12, 6, '#fff'); g.set(2, 10, '#ffd84a'); g.contour('#5a6090'); return g; },
    queso() { const g = Grid(14, 14); g.art(1, 3, ['.......yyyyy', '....yyyyyyyy', '.yyyyyyyyyyy', 'yyyyyyyyyyyy', 'YYYYYYYYYYYY', 'YYYYYYYYYYYY'], { y: '#ffd84a', Y: '#e8a820' }); g.set(4, 6, '#e8a820'); g.set(8, 5, '#e8a820'); g.set(9, 7, '#c88810'); g.rect(6, 9, 2, 1, '#f4c030'); g.contour('#7a5010'); return g; },
    tortilla() { const g = Grid(14, 14); ovalG(g, 7, 7, 6, 6, '#e8c888'); ovalG(g, 7, 7, 5, 5, '#f4dca0'); [[4, 5], [8, 4], [9, 8], [5, 9], [7, 7]].forEach(([x, y]) => g.set(x, y, '#c89850')); g.contour('#8a6030'); return g; },
    naranja() { const g = Grid(14, 14); ovalG(g, 7, 8, 5, 5, '#ff9a30'); ovalG(g, 7, 7, 4, 3, '#ffb858'); g.rect(6, 2, 2, 2, '#5a3a1a'); g.rect(8, 2, 3, 2, '#3a9a50'); g.set(5, 6, '#ffe0a0'); g.contour('#8a4010'); return g; },
    carne() { const g = Grid(14, 14); ovalG(g, 7, 8, 6, 4, '#d84a5a'); ovalG(g, 7, 7, 5, 3, '#f06a78'); g.rect(4, 6, 6, 1, '#fff0f0'); g.rect(6, 9, 4, 1, '#fff0f0'); g.rect(10, 3, 3, 2, '#f4eed8'); g.rect(12, 2, 2, 2, '#f4eed8'); g.contour('#6a1020'); return g; },
    chocolate() { const g = Grid(14, 14); g.rect(2, 3, 10, 9, '#6a3a1c'); for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) { g.rect(3 + x * 3, 4 + y * 3, 2, 2, '#8a5028'); g.set(3 + x * 3, 4 + y * 3, '#a86a3c'); } g.rect(2, 12, 10, 1, '#3a1c0a'); g.rect(1, 2, 4, 3, '#ffd84a'); g.contour('#2a1208'); return g; }
  };
  function comprarIng(k) {
    const F = ING[k]; if (!F) return;
    if (nivel() < F.nv) { toast('Necesitas cariño nivel ' + F.nv); sfx.no(); return; }
    if (ingN(k) >= ingCap()) { toast('Tu refri ya no tiene lugar para más ' + F.n.toLowerCase() + (CAP_REFRI[e.cuarto.refri] ? '' : '. Un refri más grande guarda más')); sfx.no(); return; }
    if (e.monedas < F.p) { faltanMon(F.p - e.monedas); sfx.no(); return; }
    e.monedas -= F.p; if (typeof animarMonedas === 'function') animarMonedas(F.p, true); ingL(k).push(Date.now()); e.st.compras++; sfx.compra(); toast('¡COMPRASTE: ' + F.n + '! (' + ingN(k) + '/' + ingCap() + ')'); pintar(); guardar(); render();
  }
  function renderMkt(h) {
    const cap = ingCap();
    h += `<div class="th-nota">Ingredientes para cocinar. Se guardan en el REFRI (caben ${cap} de cada uno) y no se echan a perder.</div><div class="th-g3">${ING_ORD.map(k => {
      const F = ING[k], bloq = nivel() < F.nv, n = ingN(k), nf = ingF(k);
      return `<button class="th-c ${bloq ? 'lock' : ''} ${tsel === k ? 'sel' : ''}" data-a="tv_sel" data-k="${k}">${n > 0 ? `<span class="th-cant">x${nf}</span>` : ''}<div class="th-pv"><canvas data-prev="ig_${k}"></canvas></div><div class="th-nm">${F.n}</div>${bloq ? `<span class="pr no">🔒 NV${F.nv}</span>` : `<span class="pr ${e.monedas >= F.p && n < cap ? '' : 'no'}">$ ${F.p}</span>`}</button>`;
    }).join('')}</div>`;
    if (tsel && ING[tsel]) {
      const F = ING[tsel], n = ingN(tsel);
      tSheetH = `<div class="th-big"><canvas data-prev="ig_${tsel}"></canvas></div><div class="th-n">${F.n}</div><div class="th-i">INGREDIENTE: NO SE COME,<br>SE USA PARA COCINAR<br>EN EL REFRI: ${n}/${cap}<br>NO SE ECHA A PERDER</div>` +
        (nivel() < F.nv ? `<div class="est bloq">CARIÑO NV${F.nv}</div>` : n >= cap ? '<div class="est">REFRI LLENO</div>' : `<button class="bt ${e.monedas >= F.p ? 'ok' : 'no'} gran" data-a="ig_comprar" data-k="${tsel}">COMPRAR · $ ${F.p}</button>`);
    } else tsel = null;
    return h;
  }
  function comprarSemilla(id) {
    const S = SEMILLAS[id]; if (!S || S.exclusivo) return;
    const hb = habBloq0('jardin'); if (hb) { toast(hb.n + ' se desbloquea en cariño NV' + hb.nv); sfx.no(); return; }
    if (e.monedas < S.precio) { faltanMon(S.precio - e.monedas); sfx.no(); return; }
    if ((e.semillas[id] || 0) >= 99) { toast('Ya tienes demasiadas'); return; }
    e.monedas -= S.precio; if (typeof animarMonedas === 'function') animarMonedas(S.precio, true); e.semillas[id] = (e.semillas[id] || 0) + 1; e.st.compras++; sfx.compra(); toast('¡COMPRASTE: ' + S.n.toUpperCase() + '!'); pintar(); guardar(); render();
  }
  function renderSemillas(h) {
    h += `<div class="th-nota">Semillas que Simon trajo sin saber de dónde. Se siembran en el JARDÍN (cariño NV10).</div><div class="th-g3">${Object.keys(SEMILLAS).filter(k => !SEMILLAS[k].exclusivo).map(k => {
      const S = SEMILLAS[k], n = e.semillas[k] || 0;
      return `<button class="th-c ${tsel === k ? 'sel' : ''}" data-a="tv_sel" data-k="${k}">${n > 0 ? `<span class="th-cant">x${n}</span>` : ''}<div class="th-pv"><canvas data-prev="sm_${k}"></canvas></div><div class="th-nm">${S.n}</div><span class="pr ${e.monedas >= S.precio ? '' : 'no'}">$ ${S.precio}</span></button>`;
    }).join('')}</div>`;
    if (tsel && SEMILLAS[tsel]) {
      const S = SEMILLAS[tsel];
      tSheetH = `<div class="th-big"><canvas data-prev="sm_${tsel}"></canvas></div><div class="th-n">${S.n}</div><div class="th-i">${S.rareza.toUpperCase()}<br>${S.efecto}<br>TARDA ${S.diasCrecer} ${S.diasCrecer === 1 ? 'DÍA' : 'DÍAS'} EN CRECER<br>DURA ${S.diasVida} DÍAS EN SU MACETA<br>TIENES: ${e.semillas[tsel] || 0}</div>` +
        `<button class="bt ${e.monedas >= S.precio ? 'ok' : 'no'} gran" data-a="j_comprar" data-k="${tsel}">COMPRAR · $ ${S.precio}</button>`;
    } else tsel = null;
    return h;
  }
  function renderJardinElegir() {
    $('m-titulo').textContent = 'SEMBRAR';
    const ids = Object.keys(SEMILLAS).filter(k => (e.semillas[k] || 0) > 0);
    if (!ids.length) return `<div class="centro" style="font-size:8px;line-height:1.9">No tienes semillas todavía.<br>Cómpralas en la TIENDA, pestaña SEMILLAS.</div><div class="centro"><button class="bgrande ok" data-a="j_ir_tienda">IR A LA TIENDA</button></div>`;
    return `<div class="centro" style="font-size:8px;line-height:1.9;color:#aab4ff;margin-bottom:8px">¿Qué semilla siembras?</div><div class="cuadricula">` +
      ids.map(k => { const S = SEMILLAS[k]; return `<div class="card"><div class="pv"><canvas data-prev="sm_${k}"></canvas></div><div class="cn">${S.n}</div><div style="font-size:6px;color:#4a5090">x${e.semillas[k]}</div><button class="bt ok" data-a="j_plantar" data-k="${k}">SEMBRAR</button></div>`; }).join('') +
      `</div>`;
  }
  // ---- lógica de día: crecimiento de las parcelas y envejecimiento (pausado/activo) de las macetas cosechadas ----
  function jardinDia() {
    const h = hoy(), plots = jardinSync();
    plots.forEach(p => {
      if (!p.k || p.diaUlt === h) return;
      if (p.regadoHoy) p.dias++;
      p.regadoHoy = false; p.diaUlt = h;
      const S = SEMILLAS[p.k];
      if (S && p.dias >= S.diasCrecer) p.etapa = 'listo'; else if (p.dias > 0) p.etapa = 'brote';
    });
    // de todas las macetas colocadas de una misma especie (sin importar la habitación), solo la primera puesta (más antigua) envejece;
    // las demás de esa especie quedan en pausa hasta que esa muera, entonces le toca a la siguiente, y así sucesivamente
    const grupos = {};
    Object.keys(e.macetaVida).forEach(key => {
      const v = e.macetaVida[key]; if (!v || v.diaUlt === h) return;
      if (!e.deco.some(d => d.k === key)) { v.diaUlt = h; return; }   // no está colocada: se pausa en el inventario
      const it = ITEMS[key], esp = (it && it.semilla) || key;
      (grupos[esp] = grupos[esp] || []).push(key);
    });
    const ordenCreacion = k => parseInt((/_(\d+)$/.exec(k) || [0, 0])[1], 10);
    Object.keys(grupos).forEach(esp => {
      const vivas = grupos[esp].filter(k => e.macetaVida[k].dias > 0).sort((a, b) => ordenCreacion(a) - ordenCreacion(b));
      const activa = vivas[0];
      grupos[esp].forEach(k => { const v = e.macetaVida[k]; if (k === activa) v.dias = Math.max(0, v.dias - 1); v.diaUlt = h; });
    });
  }
  function jardinPlantar(id) {
    const plots = jardinSync(), p = jSel != null ? plots[jSel] : null;
    if (!p || p.k || !(e.semillas[id] > 0)) { cerrar(); return; }
    e.semillas[id]--; Object.assign(p, { k: id, etapa: 'semilla', dias: 0, diaUlt: hoy(), regadoHoy: false });
    sfx.click(); jardinFX(jSel, '#8a5630'); cerrar(); toast('Sembraste: ' + SEMILLAS[id].n); jSel = null; guardar(); pintar();
  }
  function jardinFX(i, col) {   // ráfaga de chispitas de tierra/agua sobre la parcela tocada
    const plots = jardinSync(), r = jardinPlotRect(i, plots.length, LW, LH), cx = r.x + r.w / 2, cy = r.y + 4;
    for (let j = 0; j < 5; j++) lanzar(col === '#4ab8ff' ? 'gota' : 'estrella', cx - 4 + Math.random() * 8, cy, (Math.random() - .5) * .6, -1 - Math.random(), 10 + j * 2);
  }

  let regandera = null;   // animación de regadera al regar: { cx, cy, t, dur, gotas[] }
  function reganderaSprite() {
    return sprite('regandera_v2', () => {
      const g = Grid(32, 24);
      // cuerpo trapezoidal: más ancho abajo, más angosto arriba
      g.rect(4, 7, 12, 1, '#7acfff');   // borde superior claro
      g.rect(3, 8, 14, 7, '#3a9ae8');   // cuerpo principal
      g.rect(3, 8, 1, 7, '#6abcf0');    // borde izq claro
      g.rect(3, 14, 14, 1, '#1a68b0');  // borde inferior oscuro
      g.rect(16, 8, 1, 7, '#1a68b0');   // borde der oscuro
      g.rect(4, 9, 4, 5, '#5ab0f0');    // reflejo
      // tapa superior
      g.rect(5, 6, 9, 2, '#2a78c8'); g.rect(6, 5, 7, 1, '#3a8fd8');
      // asa curva arriba (arco de 3 segmentos)
      g.rect(6, 2, 6, 2, '#1a58a8');
      g.set(5, 3, '#1a58a8'); g.set(12, 3, '#1a58a8');
      g.set(4, 4, '#1a58a8'); g.set(13, 4, '#1a58a8');
      g.set(4, 5, '#1a58a8'); g.set(13, 5, '#1a58a8');
      // pitorro largo: sale del frente (derecha), baja en diagonal
      g.rect(17, 9, 3, 2, '#2a78c8');
      g.rect(19, 10, 3, 2, '#2a78c8');
      g.rect(21, 11, 3, 2, '#2a78c8');
      g.rect(23, 12, 3, 2, '#1a68b0');
      // alcachofa: cabeza ovalada al final del pitorro
      g.rect(25, 10, 5, 6, '#1a58a8');
      g.rect(26, 9, 3, 1, '#3a88d8');   // borde superior
      g.rect(25, 15, 5, 1, '#0a3880');  // borde inferior
      g.set(25, 10, '#3a88d8'); g.set(29, 10, '#3a88d8');
      // agujeritos de la alcachofa
      g.set(26, 11, '#5aacf0'); g.set(28, 11, '#5aacf0');
      g.set(27, 13, '#5aacf0'); g.set(26, 14, '#5aacf0'); g.set(28, 14, '#5aacf0');
      return g;
    }, 0);
  }
  function reganderaDibujar() {
    if (!regandera) return;
    regandera.t++;
    const { cx, cy, t, dur, gotas } = regandera;
    if (t > dur) { regandera = null; return; }
    // regadera aparece arriba-derecha de la maceta, inclinada hacia ella
    const rx = cx - 34, ry = cy - 28;
    ctx.drawImage(reganderaSprite(), rx, ry);
    // gotas salen de la alcachofa (esquina inferior-izquierda del sprite) hacia la planta
    const gx = rx + 25, gy = ry + 16;
    if (t < dur - 6 && t % 2 === 0) {
      gotas.push({ x: gx + (Math.random() - .5) * 3, y: gy, vx: -0.3 + (Math.random() - .5) * .3, vy: 0.5 + Math.random() * .4, life: 0, maxLife: 12 + Math.floor(Math.random() * 6) });
    }
    regandera.gotas = gotas.filter(g => g.life < g.maxLife);
    regandera.gotas.forEach(g => {
      g.x += g.vx; g.y += g.vy; g.vy += .12; g.life++;
      ctx.globalAlpha = Math.max(0, 1 - g.life / g.maxLife);
      ctx.fillStyle = '#7ad4ff'; ctx.fillRect(Math.round(g.x), Math.round(g.y), 2, 3);
      ctx.fillStyle = '#c8eeff'; ctx.fillRect(Math.round(g.x), Math.round(g.y), 1, 1);
      ctx.globalAlpha = 1;
    });
  }
  function jardinRegar(i) {
    const plots = jardinSync(), p = plots[i]; if (!p || !p.k || p.etapa === 'listo') return;
    if (p.regadoHoy) { toast('Ya la regué hoy'); return; }
    p.regadoHoy = true; sfx.click(); jardinFX(i, '#4ab8ff'); toast('¡Regada!'); guardar(); pintar();
    sonidoAgua(1.8);   // chorro de agua inmediato al tocar
    // calcular posición de la regadera sobre la maceta
    const r = jardinPlotRect(i, plots.length, LW, LH);
    regandera = { cx: r.x + r.w / 2 + 4, cy: r.y + 4, t: 0, dur: 60, gotas: [] };
  }
  function jardinCosechar(i) {
    const plots = jardinSync(), p = plots[i]; if (!p || p.etapa !== 'listo') return;
    const S = SEMILLAS[p.k], id = p.k, key = cosecharPlanta(id);
    Object.assign(p, { k: null, etapa: null, dias: 0, diaUlt: hoy(), regadoHoy: false });
    sfx.compra(); corazones(3); estrellas(6); toast('¡Cosechaste ' + S.n + '!'); guardar(); pintar(); render();
    if (id === 'eterna' && !e.tiene.aura_eterna) {
      e.tiene.aura_eterna = 1; e.ropa.aura = 'aura_eterna'; guardar();
      sonidoUnico();
      setTimeout(() => fanfare({ g: () => prevGrid('aura_eterna'), t: 'AURA ETERNA', d: 'LA SEMILLA ETERNA FLORECIÓ. EL AURA ES TUYA PARA SIEMPRE.', mudo: true }), 900);
    }
  }
  function jardinToca(x, y) {
    const plots = jardinSync(), n = plots.length;
    for (let i = 0; i < n; i++) {
      const r = jardinPlotRect(i, n, LW, LH);
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) {
        const p = plots[i];
        if (!p.k) { sfx.click(); jSel = i; abrir('jardin'); } else if (p.etapa === 'listo') jardinCosechar(i); else jardinRegar(i);
        return true;
      }
    }
    return false;
  }
  function renderRefri() {
    const k = e.cuarto.refri, nom = k && ITEMS[k] ? ITEMS[k].n : 'REFRI BASICO', cap = ingCap();
    $('m-titulo').textContent = 'REFRI';
    let h = `<div class="th-top"><span>NV ${refriNv(k)} · ${nom}</span><span>CABEN ${cap} DE CADA UNO</span></div>`;
    h += `<div class="th-g3">${ING_ORD.map(i => {
      const F = ING[i], n = ingN(i), bloq = nivel() < F.nv, lleno = n >= cap, puede = !bloq && !lleno && e.monedas >= F.p;
      return `<div class="th-c ${n ? '' : 'lock'}" style="cursor:default">${n ? `<span class="th-cant">x${n}</span>` : ''}<div class="th-pv"><canvas data-prev="ig_${i}"></canvas></div><div class="th-nm">${F.n}</div><div style="display:flex;align-items:center;justify-content:center;gap:4px;width:100%"><span class="pr ${lleno ? 'ok' : 'no'}" style="padding:2px 4px;font-size:7px;line-height:1">${n}/${cap}</span><button class="bt ${puede ? 'ok' : 'no'}" style="padding:2px 5px;font-size:7px;line-height:1;margin:0;white-space:nowrap" data-a="ig_comprar" data-k="${i}">+$${F.p}</button></div></div>`;
    }).join('')}</div>`;
    h += `<div style="display:flex;gap:8px;margin-top:14px"><button class="bt gran" style="flex:1;padding:12px 0" data-a="rf_mejorar">Mejorar Refri</button><button class="bt ok gran" style="flex:1;padding:12px 0" data-a="ck_abrir">COCINAR</button></div>`;
    return h;
  }
  ORDEN.comida = Object.keys(COMIDAS); ORDEN.extras = ['bomba', 'jarabe']; ORDEN.juguetes = Object.keys(ITEMS).filter(k => ITEMS[k].slot === 'juguete'); ORDEN.cuarto.push(...Object.keys(nuevosItems), 'puf_azul', 'puf_rojo', 'puf_verde', 'puf_rosa', 'puf_morado', 'puf_dorado');

  /* ===================== COSAS BARATAS PARA EMPEZAR ===================== */
  function ositoGrid() {
    const g = Grid(14, 14);
    g.art(0, 0, ["..oo......oo..", ".oBBo....oBBo.", ".oBBBoooooBBBo", "..oBBBBBBBBBo.", "..oBeBBBBeBBo.", "..oBBBllBBBBo.", "..oBBlllnlBBo.", "...oBBrrrrBBo.", "..oBBBBBBBBBBo", ".oBBBllllBBBo.", ".oBBBllllBBBo.", ".oBBBBBBBBBBo.", ".oBBoBBBBoBBo.", "..oo.oooo.oo.."],
      { o: '#4a2a10', B: '#b87a44', l: '#e8c090', e: '#1a1020', n: '#3a2010', r: '#e8353f' });
    return g;
  }
  function banderinGrid() {
    const g = Grid(20, 12);
    g.rect(0, 0, 2, 12, '#8a5a30'); g.rect(0, 0, 1, 12, '#c98a52');
    for (let x = 2; x < 20; x++) {
      const h = Math.round(5 * (1 - (x - 2) / 18));
      for (let y = 5 - h; y <= 6 + h; y++) g.set(x, y, y === 5 - h ? '#6aa8ff' : y === 6 + h ? '#0a2a8a' : '#2a62e0');
    }
    g.art(5, 4, ['y.y.y', 'yyyyy', '.yyy.'], { y: '#d4202e' });
    g.set(7, 4, '#ff4a5a');
    return g;
  }
  ITEMS.nariz_payaso = { tipo: 'ropa', slot: 'cara', n: 'NARIZ DE PAYASO', p: 25, nv: 1, crop: [16, 32, 24, 16] };
  ITEMS.panuelo = { tipo: 'ropa', slot: 'cuello', n: 'PAÑUELO AZUL', p: 35, nv: 1, crop: [8, 44, 40, 22] };
  ITEMS.osito = { tipo: 'cuarto', slot: 'deco', n: 'OSITO DE PELUCHE', p: 35, nv: 1, grid: ositoGrid, tema: 'todas' };
  ITEMS.racha = { tipo: 'cuarto', slot: 'decoP', n: 'CUADRO DE RACHA', p: 0, nv: 1, grid: () => rachaGrid(racha(), 0, 0), fija: true, tema: 'todas', tap: 'racha', luz: true };
  ITEMS.banderin = { tipo: 'cuarto', slot: 'decoP', n: 'BANDERIN', p: 30, nv: 1, grid: banderinGrid, tema: 'todas' };
  ORDEN.ropa.push('nariz_payaso', 'panuelo'); ORDEN.cuarto.push('osito', 'banderin');
  // Precios y niveles definitivos (balance): [nv, precio]
  const ECON = {"juguete_azul":[1,30],"mono":[1,30],"tostadora":[4,50],"cactus":[1,40],"delantal":[4,55],"florero":[1,40],"gafas":[1,40],"puf_rojo":[2,45],"puf_verde":[2,45],"silla":[4,55],"tapete":[7,75],"canasta":[4,65],"letrero":[7,80],"paraguas":[7,80],"juguete_dado":[3,65],"maceta":[3,65],"olla":[4,70],"percha":[7,90],"reloj":[4,70],"marco_keke":[4,85],"mesita":[4,85],"cuadro_keke":[5,110],"cuadro_luna":[5,110],"corbata":[5,60],"alf_azul":[5,80],"puf_rosa":[6,85],"cafetera":[6,95],"bufanda":[6,100],"buzon":[7,110],"especias":[7,110],"farol":[7,110],"juguete_playa":[7,110],"planta":[8,120],"puf_morado":[8,120],"sartenes":[8,120],"juguete_disco":[8,140],"pared_rosa":[9,150],"planta_alta":[9,150],"zapatero":[9,150],"guirnalda":[10,180],"juguete_patito":[10,180],"sud_roja":[10,180],"baul":[10,200],"consola":[11,215],"estante":[11,215],"lampara":[11,215],"planta_grande":[12,230],"sud_naranja":[12,230],"librero":[12,305],"sillon":[13,320],"sofa":[13,480],"alf_verde":[13,135],"gafas_corazon":[14,170],"pared_verde":[14,195],"sud_verde":[14,225],"banca_entrada":[14,255],"juguete_osito":[15,265],"sud_rosa":[15,265],"espejo":[15,295],"guitarra":[16,310],"espejo_pie":[16,340],"globo":[16,340],"mesa":[17,355],"juguete_keke":[17,390],"marco_cortex":[17,390],"neon_estrella":[18,405],"neon_corazon":[18,440],"tocadiscos":[18,440],"tele":[19,700],"chimenea":[19,840],"audifonos":[19,315],"sud_celeste":[20,330],"capa_roja":[20,475],"puf_dorado":[20,510],"telescopio":[21,605],"horno":[21,680],"acuario":[21,835],"orejas_gato":[22,395],"capa_azul":[22,510],"pato":[22,590],"piano":[23,1220],"collar":[23,490],"monoculo":[3,310],"bufanda_dorada":[4,340],"sud_morada":[5,365],"sud_negra":[7,365],"marco_planeta":[8,390],"sud_calabaza":[1,390],"sud_navidad":[1,390],"calabaza":[1,415],"alf_dorada":[10,470],"pared_halloween":[1,470],"pared_noche":[11,520],"arbol":[1,570],"sud_dorada":[13,570],"dino":[14,650],"cohete":[16,780],
    "sud_gris":[1,35],"sud_amarilla":[2,45],"sud_cafe":[3,55],"sud_turquesa":[4,65],"sud_lila":[6,85],"sud_blanca":[7,95],"sud_coral":[9,115],"sud_menta":[11,135],"sud_oliva":[13,155],"sud_guinda":[15,175],"sud_marino":[17,195],"sud_lima":[19,215],
    "sud_keke":[5,110],"sud_lunares":[8,150],"sud_marinero":[11,195],"sud_lenador":[14,235],"sud_bicolor":[16,260],"sud_camuflaje":[18,290],"sud_atardecer":[21,335],"sud_tiedye":[24,375],
    "rubor":[1,25],"pecas":[2,35],"gafas_redondas":[3,40],"bigote":[4,50],"gafas_nerd":[6,65],"antifaz":[7,75],"gafas_3d":[9,90],"bigotes_gato":[11,105],"parche":[13,120],"gafas_estrella":[15,135],"aviador":[17,150],"visor_neon":[20,170],
    "campana":[1,30],"mono_rosa":[2,35],"mono_azul":[3,45],"pajarita":[4,50],"bufanda_verde":[5,60],"bufanda_azul":[7,75],"bandana_roja":[8,85],"lei":[10,95],"bufanda_rosa":[12,110],"perlas":[14,125],"medalla":[16,140],"bandana_negra":[19,160],"cadena":[22,180],
    "lazo_cabeza":[1,30],"gorro_fiesta":[2,35],"flores":[3,45],"orejas_perro":[4,50],"antenas":[5,60],"orejas_oso":[6,65],"cuernitos":[8,80],"audifonos_rosa":[9,85],"orejas_conejo":[11,100],"estrellas_flot":[13,115],"orejas_zorro":[15,130],"halo":[17,145],"audifonos_gamer":[19,160],"alitas_angel":[21,175],"alitas_demonio":[24,200],
    "capa_rosa":[5,160],"capa_verde":[9,235],"capa_negra":[13,310],"capa_morada":[17,385],"alas_angel":[21,500],"alas_murcielago":[22,520],"alas_mariposa":[25,580]
  };
  const ECON_COM = {"kekeoro":[21,450],"cometa":[16,240],"bebida":[14,180],"batido":[12,140],"chile":[9,110],"misteriosa":[8,75],"hamburguesa":[7,85],"sopa":[6,60],"cafe":[5,50],"taco":[4,38],"helado":[3,28],"dona":[2,20],"manzana":[1,14],"galleta":[1,10]};
  Object.keys(ECON).forEach(k => { if (ITEMS[k]) { ITEMS[k].nv = ECON[k][0]; ITEMS[k].p = ECON[k][1]; } });
  Object.keys(ECON_COM).forEach(k => { if (COMIDAS[k]) { COMIDAS[k].nv = ECON_COM[k][0]; COMIDAS[k].p = ECON_COM[k][1]; } });
  // Todos los precios x1.5: los topes diarios subieron ~1.6x (se juega más al día), así el ritmo de compra por día se mantiene
  const P15 = p => Math.round(p * 1.5 / 5) * 5;
  Object.keys(ITEMS).forEach(k => { if (ITEMS[k].p > 0) ITEMS[k].p = P15(ITEMS[k].p); });
  Object.keys(COMIDAS).forEach(k => { if (COMIDAS[k].p > 0) COMIDAS[k].p = P15(COMIDAS[k].p); });
  // Regalo gratis al subir de nivel: cada nivel entrega un objeto (los de NV20 y NV25 son los premium de siempre)
  const LVGIFT = { 2: 'sud_amarilla', 3: 'p_estrellas', 4: 'sud_blanca', 5: 'cuadro_keke', 6: 'orejas_conejo', 7: 'buzon', 8: 'audifonos_gamer', 9: 'p_bosque', 10: 'sud_roja', 11: 'consola', 12: 'sud_naranja', 13: 'sillon', 14: 'sud_verde', 15: 'espejo', 16: 'espejo_pie', 17: 'juguete_keke', 18: 'neon_corazon', 19: 'chimenea', 20: 'sud_galaxia', 21: 'horno', 22: 'capa_azul', 23: 'piano', 24: 'collar', 25: 'capa_real' };
  Object.keys(LVGIFT).forEach(n => { const it = ITEMS[LVGIFT[n]]; if (!it) return; it.gnv = +n; if (!it.prem) it.regalo = 'nivel'; });
  ['ropa', 'cuarto', 'juguetes'].forEach(t => ORDEN[t].sort((a, b) => ((ITEMS[a].nv || 1) - (ITEMS[b].nv || 1)) || ((ITEMS[a].p || 0) - (ITEMS[b].p || 0))));
  ORDEN.ropa.sort((a, b) => (!!ITEMS[a].prem) - (!!ITEMS[b].prem));
  ORDEN.comida.sort((a, b) => (COMIDAS[b].nv - COMIDAS[a].nv) || (COMIDAS[b].p - COMIDAS[a].p) || (((COMIDAS[b].e || 0) + (COMIDAS[b].h || 0)) - ((COMIDAS[a].e || 0) + (COMIDAS[a].h || 0))));
  /* ---- platos que cocina Simon: se comen desde ALIMENTAR, pero no se venden ---- */
  const RECETAS = [
    { id: 'ensalada', n: 'ENSALADA FRESCA', ing: { lechuga: 1, jitomate: 1 }, pasos: ['cortar', 'armar'], nv: 1, h: 22, e: 10, f: 6, t: 'Fresca y crujiente.' },
    { id: 'hotcakes', n: 'HOT CAKES', ing: { harina: 1, huevo: 1, leche: 1 }, pasos: ['cocinar', 'armar'], nv: 1, h: 30, e: 18, f: 10, t: 'Esponjosos. Muy esponjosos.' },
    { id: 'tostada', n: 'TOSTADA DE QUESO', ing: { pan: 1, queso: 1 }, pasos: ['cocinar', 'armar'], nv: 2, h: 26, e: 12, f: 8, t: '¡Queso derretido!' },
    { id: 'licuado', n: 'LICUADO DE NARANJA', ing: { naranja: 2, leche: 1 }, pasos: ['cortar', 'armar'], nv: 2, h: 14, e: 26, f: 8, t: 'Naranja con nube.' },
    { id: 'tacocasero', n: 'TACOS CASEROS', ing: { tortilla: 1, carne: 1, jitomate: 1 }, pasos: ['cortar', 'cocinar', 'armar'], nv: 3, h: 36, e: 20, f: 10, t: '¡Ándale! Hechos por mí.' },
    { id: 'kekeperro', n: 'KEKE PARA PERRO', ing: { harina: 1, huevo: 1, carne: 1 }, pasos: ['cortar', 'cocinar', 'armar'], nv: 1, perro: 1, h: 0, e: 0, f: 0, t: 'Para un amigo peludo.' },
    { id: 'kekecasero', n: 'KEKE CASERO', ing: { harina: 1, huevo: 1, azucar: 1, chocolate: 1 }, pasos: ['cortar', 'cocinar', 'armar'], nv: 4, h: 46, e: 34, f: 24, t: 'El mejor keke del universo.' }
  ];
  const PL_GRID = {
    ensalada() { const g = Grid(15, 13); ovalG(g, 7, 6, 6, 4, '#4ab860'); ovalG(g, 7, 5, 4, 2, '#8ae08a'); g.rect(4, 4, 2, 2, '#e8353f'); g.rect(9, 5, 2, 2, '#e8353f'); g.rect(7, 3, 2, 1, '#ffd84a'); g.rect(2, 8, 11, 3, '#f4f2ee'); g.rect(3, 11, 9, 1, '#c8c4bc'); g.rect(2, 8, 11, 1, '#ffffff'); g.contour('#3a4a3a'); return g; },
    hotcakes() { const g = Grid(15, 13); [[9, 11], [6, 9], [3, 7]].forEach(([y, w]) => { ovalG(g, 7, y - 1, 6, 2, '#e0a050'); g.rect(2, y - 1, 11, 1, '#f0c078'); }); g.rect(5, 1, 5, 2, '#ffe45a'); g.rect(4, 3, 7, 2, '#b86a20'); g.set(3, 6, '#b86a20'); g.set(11, 8, '#b86a20'); g.contour('#5a3010'); return g; },
    tostada() { const g = Grid(15, 13); g.rect(2, 3, 11, 8, '#e0a050'); g.rect(1, 4, 13, 6, '#e0a050'); g.rect(3, 4, 9, 6, '#ffd84a'); g.rect(3, 4, 9, 1, '#fff0a0'); g.rect(4, 8, 2, 3, '#e8a820'); g.rect(9, 8, 3, 2, '#e8a820'); g.set(6, 6, '#e8a820'); g.set(10, 5, '#c88810'); g.contour('#6a3a10'); return g; },
    licuado() { const g = Grid(13, 15); g.rect(3, 4, 7, 10, '#ffb040'); g.rect(3, 4, 7, 3, '#fff0d0'); g.rect(4, 8, 5, 2, '#ff9a20'); g.rect(3, 4, 1, 10, '#ffd890'); g.rect(8, 1, 1, 5, '#e8353f'); g.rect(8, 1, 3, 1, '#e8353f'); g.rect(2, 3, 9, 1, '#ffffff'); g.contour('#7a4a10'); return g; },
    tacocasero() { const g = Grid(15, 13); ovalG(g, 7, 8, 7, 5, '#e8c888'); g.rect(0, 8, 15, 5, '#00000000'); g.clear(0, 9, 15, 4); g.rect(3, 4, 3, 2, '#4ab860'); g.rect(6, 3, 3, 2, '#e8353f'); g.rect(9, 4, 3, 2, '#d84a5a'); g.rect(4, 6, 7, 2, '#a8402a'); g.rect(2, 7, 11, 1, '#f4dca0'); g.contour('#7a5020'); return g; },
    kekeperro() { const g = Grid(15, 13); g.rect(1, 5, 13, 7, '#b8804a'); g.rect(1, 5, 13, 1, '#d8a468'); g.rect(1, 10, 13, 2, '#8a5a2c'); g.rect(4, 6, 7, 3, '#f6f1ea'); g.rect(3, 5, 2, 2, '#f6f1ea'); g.rect(3, 8, 2, 2, '#f6f1ea'); g.rect(10, 5, 2, 2, '#f6f1ea'); g.rect(10, 8, 2, 2, '#f6f1ea'); g.contour('#4a2a10'); return g; },
    kekecasero() { const g = Grid(15, 13); g.rect(1, 5, 13, 7, '#6a3a1c'); g.rect(1, 5, 13, 1, '#8a5028'); g.rect(1, 8, 13, 1, '#f4eed8'); g.rect(1, 4, 13, 2, '#f4eed8'); g.rect(2, 3, 11, 2, '#ffffff'); g.rect(6, 0, 3, 3, '#e8353f'); g.set(7, 0, '#3a9a50'); g.rect(1, 11, 13, 1, '#3a1c0a'); g.contour('#2a1208'); return g; }
  };
  ITEMS.sarten2 = { tipo: 'cuarto', slot: 'sarten2', n: 'SEGUNDA SARTÉN', p: 260, nv: 5, tema: 'cocina', util: 1, grid: () => { const g = Grid(20, 12); circG(g, 6, 6, 5, '#14141a'); circG(g, 6, 6, 4, '#c8d2dc'); circG(g, 6, 6, 3, '#4a5664'); g.rect(11, 5, 8, 2, '#e8503a'); g.rect(11, 5, 8, 1, '#ff9a7a'); return g; } };
  PORDEFECTO.sarten2 = 1; ORDEN.cuarto.push('sarten2');
  RECETAS.forEach(r => { const id = 'pl_' + r.id; if (r.perro) { FGRID[id] = PL_GRID[r.id]; FX['c_' + id] = PL_GRID[r.id]; return; } COMIDAS[id] = { n: r.n, p: 0, nv: r.nv, h: r.h, e: r.e, f: r.f, t: r.t, cocina: 1 }; FGRID[id] = PL_GRID[r.id]; FX['c_' + id] = PL_GRID[r.id]; });


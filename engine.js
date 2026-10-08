/* ==========================================================================
 * MOTOR GRÁFICO Y PERSISTENCIA — SIMON: TU AMIGO VIRTUAL
 * ==========================================================================
 * Archivo: engine.js
 * Responsabilidad: Motor de Pixel Art, renderizado de cuartos/escenarios,
 *                  pantalla responsive, cálculo de dimensiones y guardado.
 *
 * ÍNDICE DE SECCIONES:
 *  1. PANTALLA Y VIEWPORT (Ajuste dinámico de altura móvil)
 *  2. PERSISTENCIA Y GUARDADO (LocalStorage, IndexedDB, sanitización)
 *  3. MOTOR DE PIXEL ART (Grid, capas, sombreado Bayer, trazado, paletas)
 *  4. SPRITE BASE DE SIMON (Corona, estados físicos, cuerpo y ojos)
 *  5. FONDOS DE LA RECÁMARA (Cielo, ventana, cuadro, piso de madera)
 *  6. HABITACIONES Y NAVEGACIÓN (Sala de juegos, cocina, entrada, jardín, parque)
 * ========================================================================== */

function hashStr(t) { let h = 2166136261; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  // altura real visible: en algunos celulares 100vh/100dvh incluye la barra del navegador y los botones de abajo quedaban fuera de pantalla
  const fijaAlto = () => { const h = Math.round((window.visualViewport && window.visualViewport.height) || window.innerHeight); if (h > 200) document.documentElement.style.setProperty('--app-h', h + 'px'); };
  fijaAlto(); window.addEventListener('resize', fijaAlto); window.addEventListener('orientationchange', () => setTimeout(fijaAlto, 250));
  if (window.visualViewport) window.visualViewport.addEventListener('resize', fijaAlto);
  const CLAVE = 'simon-v1';
  const CLAVE_BK = 'simon-v1-bk';
  const ESQUEMA = 1;
  let guardaCount = 0;
  const VERSION_JUEGO = 'Beta v,500';

  /* === IndexedDB helper (respaldo silencioso) === */
  const IDB_NAME = 'simon-idb', IDB_STORE = 'save';
  function idbOpen() {
    return new Promise((ok, no) => {
      try {
        const r = indexedDB.open(IDB_NAME, 1);
        r.onupgradeneeded = () => { const db = r.result; if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE); };
        r.onsuccess = () => ok(r.result);
        r.onerror = () => no(r.error);
      } catch (_) { no(_); }
    });
  }
  function idbSet(val) {
    idbOpen().then(db => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(val, CLAVE);
      tx.oncomplete = () => db.close();
      tx.onerror = () => db.close();
    }).catch(() => {});
  }
  function idbGet() {
    return idbOpen().then(db => new Promise((ok, no) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const r = tx.objectStore(IDB_STORE).get(CLAVE);
      r.onsuccess = () => { db.close(); ok(r.result || null); };
      r.onerror = () => { db.close(); no(r.error); };
    })).catch(() => null);
  }
  function idbClear() {
    idbOpen().then(db => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).delete(CLAVE);
      tx.oncomplete = () => db.close();
    }).catch(() => {});
  }

  /* === Sanitización post-carga === */
  function sanitizar(d) {
    const b = BASE();
    // Stats numéricos: clamp 0-100
    ['hambre', 'energia', 'feliz', 'limp'].forEach(k => {
      if (typeof d[k] !== 'number' || isNaN(d[k])) d[k] = b[k];
      else d[k] = clamp(d[k]);
    });
    // Numéricos sin rango
    ['monedas', 'xp', 'total', 'racha', 'mejorRacha', 'rachaComer', 'mejorComer', 'bombas', 'enf', 'enfAb', 'malS', 'meds', 'fuente', 'nHam', 'nFel'].forEach(k => {
      if (typeof d[k] !== 'number' || isNaN(d[k])) d[k] = b[k] != null ? b[k] : 0;
    });
    // Booleanos
    ['dormido', 'mudo', 'intro', 'traductor', 'musica', 'avisoMerc'].forEach(k => {
      d[k] = !!d[k];
    });
    // Strings
    ['nombre', 'ultComer', 'ultimoRegalo', 'hab'].forEach(k => {
      if (typeof d[k] !== 'string') d[k] = b[k] || '';
    });
    // Arrays
    ['album', 'notis', 'memPend', 'deco'].forEach(k => {
      if (!Array.isArray(d[k])) d[k] = b[k] || [];
    });
    // Objetos
    ['ropa', 'cuarto', 'tiene', 'st', 'ing', 'sec', 'pens', 'cod', 'comida', 'probo', 'logros', 'dibujos', 'adv', 'mimos', 'mimosDia', 'rt', 'mj', 'mem', 'run', 'eco'].forEach(k => {
      if (!d[k] || typeof d[k] !== 'object' || Array.isArray(d[k])) d[k] = b[k] || {};
    });
    // Hab válido
    if (!['sala', 'bano', 'juegos', 'estudio', 'cocina', 'entrada', 'jardin'].includes(d.hab)) d.hab = 'sala';
    if (!d.jardin || typeof d.jardin !== 'object' || !Array.isArray(d.jardin.plots)) d.jardin = { plots: [] };
    if (!d.semillas || typeof d.semillas !== 'object' || Array.isArray(d.semillas)) d.semillas = {};
    if (!d.macetaVida || typeof d.macetaVida !== 'object' || Array.isArray(d.macetaVida)) d.macetaVida = {};
    return d;
  }
  // (MAX definido en config.js)
  let LW = 120, LH = 184;                 // resolución "real" de la pantalla: se adapta al espacio disponible
  const SW = 56, SH = 78;                 // tamaño del sprite de Simon
  let PISO = 9999;   // hasta dónde puede llegar el piso de los muebles: justo encima del dock de botones
  let SX = 32, SY = 84, SYn = 84, RY = 59, OX = 0;          // dónde está Simon y la altura del riel de la pared (se recalculan)
  // (BAJA definido en config.js)
  // (DICE definido en dialogos.js)

  const $ = id => document.getElementById(id);
  const clamp = v => Math.max(0, Math.min(MAX, v));
  let e;

  /* ===================== ESTADO Y GUARDADO ===================== */
  let despertoOffline = false, ausenciaH = 0;
  let admin = false, admTemp = null, admMerc = 0, admClima = null, edit = null, fHab = 'todo', fRopa = 'todo', hollin = false, desc = null, bm = null, sustoHasta = 0, sustoCd = 0, lugar = null, llegada = null, cambiando = false;   // modo admin: nada se guarda
  const BASE = () => ({
    hambre: (typeof STATS_INI !== 'undefined' ? STATS_INI.hambre : 0), energia: (typeof STATS_INI !== 'undefined' ? STATS_INI.energia : 0), feliz: (typeof STATS_INI !== 'undefined' ? STATS_INI.feliz : 0), limp: (typeof STATS_INI !== 'undefined' ? STATS_INI.limp : 0), dormido: false, mudo: false, t: Date.now(),
    monedas: 20, xp: 0, total: 0, nombre: '',
    racha: 0, mejorRacha: 0, ultimoRegalo: '',
    ultComer: '', rachaComer: 0, mejorComer: 0, ultDice: 0, eIni: 0,
    ropa: { cara: null, cuello: null, orejas: null, espalda: null, aura: null, sudadera: 'sud_azul' },
    fuente: 1, ing: {}, musica: true, ultResp: 0, avisoResp: '', sec: {}, pens: {}, preg: null, mis: null, adv: { f: '', n: 0 }, cod: {}, deco: [{ k: 'puf_azul', x: -45, y: 90, f: 0, h: 'sala' }, { k: 'juguete_pelota', x: 43, y: 92, f: 0, h: 'sala' }], mig2: 1, comida: {}, probo: {}, mimos: { n: 0, t: 0, harto: false }, mimosDia: { f: '', xp: 0, coins: 0, av: 0 }, bombas: 0, memPend: [], notis: [], nHam: 0, nFel: 0, nRegalo: '', nClima: '', enf: 0, enfAb: 0, malS: 0, meds: 0, rt: { rec: 0, dia: '', monHoy: 0 }, proxSiesta: 0, ultBomba: -1, ultBombaT: 0,
    cuarto: { pared: 'pared_azul', alfombra: 'alf_roja', izq: null, der: null, cuadro: 'marco_corona' }, album: [], cuadroFoto: '', hab: 'sala',
    tiene: { sud_azul: 1, pared_azul: 1, alf_roja: 1, marco_corona: 1, puf_azul: 1, juguete_pelota: 1 },
    st: { si: 0, comer: 0, jugar: 0, dice: 0, toques: 0, dormir: 0, compras: 0, pizzas: 0, plantas: 0, visitas: 0, tratos: 0, fotos: 0, adiv: 0, misiones: 0, bombas: 0, parque: 0, mj: 0, rt: 0, mem: 0, run: 0 }, run: { rec: 0, dia: '', monHoy: 0 }, mj: { rec: 0, dia: '', monHoy: 0, rompio: 0 }, mem: { rec: 0, dia: '', monHoy: 0 }, eco: { f: '', c: 0, x: 0, fr: 0, av: 0 },
    intro: false, traductor: false, proxVisita: 0, ultTip: -1, logros: {}, merc: null, avisoMerc: false, planta: null, hallazgo: null, proxHallazgo: Date.now() + 180000, dibujos: {},
    jardin: { plots: [] }, semillas: {}, macetaVida: {}
  });
  function _leerLS(clave) { try { const d = JSON.parse(localStorage.getItem(clave)); return d && typeof d.hambre === 'number' ? d : null; } catch (_) { return null; } }
  function _aplicarSave(d) {
    try {
      const horas = (typeof d.t === 'number' && !isNaN(d.t) && d.t > 0 && d.t <= Date.now()) ? Math.min(87600, (Date.now() - d.t) / 3600000) : 0, b = BASE();
      let sigue = false;
      try { sigue = d.dormido && clamp((d.energia || 0) + (typeof rDormir === 'function' ? rDormir(d.deco, d.sangFase === 2 && d.ojoOn !== 0) : 50) * horas) < 100; } catch (_) { sigue = false; }
      despertoOffline = !!d.dormido && !sigue; ausenciaH = horas;
      e = Object.assign(b, d, {
        hambre: clamp((typeof d.hambre === 'number' && !isNaN(d.hambre) ? d.hambre : 0) - BAJA.hambre * horas),
        energia: clamp(d.dormido ? (d.energia || 0) + (typeof rDormir === 'function' ? rDormir(d.deco, d.sangFase === 2 && d.ojoOn !== 0) : 50) * horas : (d.energia || 80) - BAJA.energia * horas),
        feliz: clamp((typeof d.feliz === 'number' && !isNaN(d.feliz) ? d.feliz : 0) - BAJA.feliz * horas),
        limp: clamp((typeof d.limp === 'number' && !isNaN(d.limp) ? d.limp : 0) - 4 * horas),
        dormido: !!sigue, mudo: !!d.mudo, t: Date.now()
      });
      e.ropa = Object.assign(BASE().ropa, d.ropa || {});
      e.cuarto = Object.assign(BASE().cuarto, d.cuarto || {});
      e.tiene = Object.assign(BASE().tiene, d.tiene || {});
      e.st = Object.assign(BASE().st, d.st || {}); e.album = Array.isArray(d.album) ? d.album.filter(f => f && f.p && f.i) : [];
      e.mj = Object.assign(BASE().mj, d.mj || {}); e.rt = Object.assign(BASE().rt, d.rt || {}); e.mem = Object.assign(BASE().mem, d.mem || {}); e.run = Object.assign(BASE().run, d.run || {}); e.notis = Array.isArray(d.notis) ? d.notis.slice(0, 40) : []; e.dia = d.dia && d.dia.f ? d.dia : null; e.eco = Object.assign(BASE().eco, d.eco || {});
      e.sec = Object.assign({}, d.sec || {}); e.pens = Object.assign({}, d.pens || {}); e.cod = Object.assign({}, d.cod || {});
      e.deco = Array.isArray(d.deco) ? d.deco.filter(o => o && typeof o === 'object').map(o => Object.assign({}, o)) : []; e.comida = Object.assign({}, d.comida || {}); e.probo = Object.assign({}, d.probo || {}); e.mimos = Object.assign(BASE().mimos, d.mimos || {}); e.mimosDia = Object.assign(BASE().mimosDia, d.mimosDia || {});
      e.adv = Object.assign(BASE().adv, d.adv || {}); e.logros = Object.assign({}, d.logros || {}); e.dibujos = Object.assign({}, d.dibujos || {});
      ['izq', 'der'].forEach(l => { const k = e.cuarto[l]; if (k) { if (!e.deco.some(o => o.k === k)) e.deco.push({ k, x: l === 'izq' ? -50 : 50, y: 55, f: 0 }); e.cuarto[l] = null; } });   // muebles antiguos -> colocación libre
      if (!d.mig2) {   // el puf y el juguete antes eran fijos: ahora son objetos del cuarto
        const pk = d.cuarto && d.cuarto.puf !== undefined ? d.cuarto.puf : 'puf_azul', jk = (d.cuarto && d.cuarto.juguete) || 'juguete_pelota';
        if (pk && ITEMS[pk] && !e.deco.some(x => x.k === pk)) e.deco.push({ k: pk, x: -45, y: 90, f: 0 });
        if (!e.deco.some(x => ITEMS[x.k] && ITEMS[x.k].slot === 'juguete')) e.deco.push({ k: ITEMS[jk] ? jk : 'juguete_pelota', x: 43, y: 92, f: 0 });
        e.mig2 = 1;
      }
      if (!e.deco.some(x => ITEMS[x.k] && ITEMS[x.k].slot === 'juguete')) e.deco.push({ k: 'juguete_pelota', x: 43, y: 92, f: 0 });
      if (!['sala', 'bano', 'juegos', 'estudio', 'cocina', 'entrada', 'jardin'].includes(e.hab)) e.hab = 'sala';
      e.jardin = (d.jardin && Array.isArray(d.jardin.plots)) ? { plots: d.jardin.plots.map(p => Object.assign({ k: null, etapa: null, dias: 0, diaUlt: null, regadoHoy: false }, p)) } : { plots: [] };
      e.semillas = Object.assign({}, d.semillas || {}); e.macetaVida = Object.assign({}, d.macetaVida || {});
      Object.keys(e.macetaVida).forEach(key => { const m = /^maceta_([a-z]+)_/.exec(key); if (m) registrarMaceta(key, m[1]); });
      e.deco.forEach(x => { if (!x.h) x.h = 'sala'; });
      e.deco = e.deco.filter(x => ITEMS[x.k] || (x.h !== 'estudio' && x.h !== 'jardin')); e.deco.forEach(x => { const it = ITEMS[x.k]; if (!it) return; if (it.tema === 'estudio') { x.h = 'estudio'; if (x.s === undefined) x.s = Math.max(0, typeof estSlotLibre === 'function' ? estSlotLibre(it.zona) : 0); } else if (x.h === 'estudio') x.h = 'sala'; if (it.tema === 'jardin') { x.h = 'jardin'; } else if (x.h === 'jardin') x.h = 'sala'; });
      if (!e.proxHallazgo) e.proxHallazgo = Date.now() + 180000;
      sanitizar(e);
    } catch (err) {
      console.warn('[Simon] Error al aplicar datos guardados:', err);
      e = BASE();
      sanitizar(e);
    }
  }
  let _idbPend = null;   // save recuperado de IndexedDB (async)
  function cargar() {
    despertoOffline = false; ausenciaH = 0;
    try {
      // Intento 1: CLAVE principal
      let d = _leerLS(CLAVE);
      // Intento 2: backup rotativo
      if (!d) { d = _leerLS(CLAVE_BK); if (d) console.log('[Simon] Recuperado desde backup localStorage'); }
      // Intento 3: IndexedDB (si ya se cargó el dato async)
      if (!d && _idbPend) { try { const p = JSON.parse(_idbPend); if (p && typeof p.hambre === 'number') { d = p; console.log('[Simon] Recuperado desde IndexedDB'); } } catch (_) {} }
      if (d) { _aplicarSave(d); return; }
    } catch (err) {
      console.warn('[Simon] Error durante cargar():', err);
    }
    e = BASE();
    sanitizar(e);
  }
  // Guardado automático: se llama en cada acción
  let reseteando = false, resetPend = false;
  function guardar() {
    if (admin || reseteando) return;
    e.t = Date.now();
    const prueba = vSnap ? e.ropa : null; if (prueba) e.ropa = vSnap;   // mientras se prueba ropa, lo guardado sigue siendo el atuendo de antes
    const json = JSON.stringify(e);
    try { localStorage.setItem(CLAVE, json); } catch (_) {}
    // Backup rotativo cada 10 guardados
    if (++guardaCount >= 10) { guardaCount = 0; try { localStorage.setItem(CLAVE_BK, json); } catch (_) {} idbSet(json); }
    if (prueba) e.ropa = prueba;
  }
  var vSnap = null, vF = 'todo';

  /* ===================== MOTOR DE PIXEL ART ===================== */
  const COL = new Map();
  function col(c) {
    if (typeof c !== 'string') return c;
    let p = COL.get(c);
    if (!p) { p = [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16), 255]; COL.set(c, p); }
    return p;
  }
  // Una rejilla de pixeles a todo color (RGBA)
  function Grid(w, h) {
    const d = new Uint8ClampedArray(w * h * 4);
    const g = {
      w, h, d,
      set(x, y, c) {
        x = Math.floor(x); y = Math.floor(y);
        if (x < 0 || y < 0 || x >= w || y >= h) return;
        const p = col(c), i = (y * w + x) * 4;
        d[i] = p[0]; d[i + 1] = p[1]; d[i + 2] = p[2]; d[i + 3] = p[3];
      },
      has(x, y) { return x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 0; },
      clear(x, y, rw, rh) { for (let j = 0; j < rh; j++) for (let i = 0; i < rw; i++) { const X = x + i, Y = y + j; if (X >= 0 && Y >= 0 && X < w && Y < h) d[(Y * w + X) * 4 + 3] = 0; } },
      rect(x, y, rw, rh, c) { for (let j = 0; j < rh; j++) for (let i = 0; i < rw; i++) g.set(x + i, y + j, c); },
      art(x, y, rows, map) { rows.forEach((r, j) => [...r].forEach((ch, i) => { if (map[ch]) g.set(x + i, y + j, map[ch]); })); },
      paste(o, ox = 0, oy = 0) {
        for (let y = 0; y < o.h; y++) for (let x = 0; x < o.w; x++) {
          const a = (y * o.w + x) * 4;
          if (o.d[a + 3] > 0) g.set(x + ox, y + oy, [o.d[a], o.d[a + 1], o.d[a + 2], 255]);
        }
      },
      // pinta de un color los pixeles del borde de lo dibujado (contorno)
      contour(c) {
        const b = [];
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++)
          if (g.has(x, y) && (!g.has(x - 1, y) || !g.has(x + 1, y) || !g.has(x, y - 1) || !g.has(x, y + 1))) b.push([x, y]);
        b.forEach(([x, y]) => g.set(x, y, c));
      }
    };
    return g;
  }
  // Agrega un contorno por fuera (la imagen crece 1 pixel por lado)
  function conBorde(g, c) {
    const o = Grid(g.w + 2, g.h + 2); o.paste(g, 1, 1);
    const b = [];
    for (let y = 0; y < o.h; y++) for (let x = 0; x < o.w; x++)
      if (!o.has(x, y) && (o.has(x - 1, y) || o.has(x + 1, y) || o.has(x, y - 1) || o.has(x, y + 1))) b.push([x, y]);
    b.forEach(([x, y]) => o.set(x, y, c));
    return o;
  }
  // Una "capa": se dibuja aparte, se le pone contorno y luego se pega encima
  function capa(g, contorno, dibujar) {
    const L = Grid(g.w, g.h);
    dibujar(L);
    if (contorno) L.contour(contorno);
    g.paste(L);
  }

  // Sombreado con luz desde arriba-izquierda y tramado (dithering) como en los juegos de GBA
  const BAY = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
  function sombrear(L, test, cx, cy, rx, ry, rampa) {
    for (let y = 0; y < L.h; y++) for (let x = 0; x < L.w; x++) {
      if (!test(x, y)) continue;
      let nx = (x + .5 - cx) / rx, ny = (y + .5 - cy) / ry, r2 = nx * nx + ny * ny;
      if (r2 > 1) { const n = Math.sqrt(r2); nx /= n; ny /= n; r2 = 1; }
      const nz = Math.sqrt(1 - r2);
      const d = -.5 * nx - .55 * ny + .67 * nz + (BAY[y & 3][x & 3] / 16 - .47) * .24;
      L.set(x, y, rampa[d > .78 ? 0 : d > .3 ? 1 : d > -.1 ? 2 : 3]);
    }
  }
  const elipse = (cx, cy, rx, ry) => (x, y) => { const dx = (x + .5 - cx) / rx, dy = (y + .5 - cy) / ry; return dx * dx + dy * dy <= 1; };
  const union = (...f) => (x, y) => f.some(fn => fn(x, y));
  function linea(L, x0, y0, x1, y1, c, test) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let i = 0; i <= n; i++) {
      const x = Math.round(x0 + (x1 - x0) * i / n), y = Math.round(y0 + (y1 - y0) * i / n);
      if (!test || test(x, y)) L.set(x, y, c);
    }
  }
  function lerpTest(pts, x) {
    for (let i = 0; i < pts.length - 1; i++)
      if (x <= pts[i + 1][0]) { const [a, b] = pts[i], [c, d] = pts[i + 1]; return b + (d - b) * (x - a) / (c - a || 1); }
    return pts[pts.length - 1][1];
  }

  // Rampas de color: [luz, base, sombra, sombra profunda]
  const R = {
    piel:   ['#ffffff', '#f0f2fb', '#ccd3ea', '#9ea8cf'],
    azul:   ['#8c88ff', '#4f49ea', '#352bc4', '#241b8c'],
    rojo:   ['#ff9aa2', '#e8353f', '#b02030', '#6e1020'],
    pelo:   ['#5d5776', '#37324d', '#221f32', '#131222'],
    corona: ['#4d4d60', '#2b2b38', '#191922', '#0d0d13'],
    ojo:    ['#3b3b58', '#1a1a2a', '#0e0e18', '#08080e'],
    verde:  ['#b2f088', '#5ccf5a', '#2f9a4a', '#1d6a38'],
    barro:  ['#f0a070', '#d8743c', '#b05428', '#7a3818'],
    madera: ['#e8b078', '#c98a52', '#a06a38', '#6e4422']
  };
  const TINTA = '#262244', TINTA_AZUL = '#150f55', ROJO_CORONA = '#d4202e', GEMA = '#ff4a5a';

  /* ===================== SIMON ===================== */
  function dibujarCorona(g) {
    capa(g, ROJO_CORONA, L => {
      const pico = (cx, ap, hw) => (x, y) => y >= ap && y <= 8 && Math.abs(x + .5 - cx) <= hw * (y - ap + 1) / (8 - ap + 1);
      const t = (x, y) => x >= 17 && x <= 38 && ((y >= 8 && y <= 11) || pico(20, 3, 4.5)(x, y) || pico(28, 0, 6.5)(x, y) || pico(36, 3, 4.5)(x, y));
      sombrear(L, t, 28, 6, 11, 8, R.corona);
      // puntas rojas y joyas
      [[27, 0], [28, 0], [27, 1], [28, 1], [19, 3], [20, 3], [19, 4], [20, 4], [35, 3], [36, 3], [35, 4], [36, 4]].forEach(([x, y]) => L.set(x, y, GEMA));
      [[27, 0], [19, 3], [35, 3]].forEach(([x, y]) => L.set(x, y, '#ffb4bc'));
      [19, 23, 27, 31, 35].forEach(x => { L.set(x, 10, GEMA); L.set(x + 1, 10, '#c0222f'); });
    });
  }
  function estFisico() {   // el estado físico real de Simon ahora mismo: ojeras, flacura, tristeza, enfermo, abandono (lo mismo que se usa al dibujarlo en pantalla)
    const est = { oj: !e.dormido && e.energia < 30 ? 1 : 0, fl: e.hambre < 12 ? 2 : e.hambre < 30 ? 1 : 0, tri: e.feliz < 12 ? 2 : e.feliz < 30 ? 1 : 0, en: e.enf ? 1 : 0, l: (tk >> 2) % 3, ab: nivelAbandono() };
    if ((!est.tri || est.tri < 2) && !est.en && !est.ab) est.l = 0;
    if (est.ab === 2) { est.tri = 2; est.oj = 1; est.fl = Math.max(est.fl, 1); }
    else if (est.ab === 1) { est.tri = Math.max(est.tri, 1); est.oj = 1; }
    return est;
  }
  function simonGrid(ojos, boca, ropa, est, atras, auraFr) {
    ropa = ropa || {}; est = est || {};
    const [ra, oa, oa2] = SUDS[ropa.sudadera] || SUDS.sud_azul;
    const g = Grid(SW, SH);
    if (ropa.aura && ropa.aura !== 'aura_legend') accAura(g, ropa.aura, auraFr || 0);   // la legendaria se dibuja aparte, en su propio lienzo más grande (ver auraLegendGrid)
    if (ropa.espalda && !atras) accCapa(g, ropa.espalda);
    // ---- piernas (shorts blancos con corazones) ----
    if (!atras) [[19, 'a'], [37, 'b']].forEach(([cx, k]) => capa(g, TINTA, L => {
      const t = elipse(cx, 70, 8.5, 7.5);
      sombrear(L, t, cx, 70, 8.5, 7.5, R.piel);
      const corazon = [".r.r.", "rrrrr", ".rrr.", "..r.."];
      [[cx - 6, 71], [cx + 1, 73]].forEach(([hx, hy]) => corazon.forEach((row, j) => [...row].forEach((ch, i) => {
        if (ch === 'r' && t(hx + i, hy + j)) L.set(hx + i, hy + j, j === 0 && i === 1 ? '#ff8a96' : '#e8353f');
      })));
    }));
    // ---- sudadera ----
    capa(g, oa, L => {
      const hw = y => 15 + (y - 50) * .12;
      const t = (x, y) => y >= 50 && y <= (atras ? 77 : 69) && Math.abs(x + .5 - 28) <= hw(y);
      sombrear(L, t, 28, 58, 19, 15, ra);
      for (let y = atras ? 75 : 67; y <= (atras ? 77 : 69); y++) for (let x = 0; x < SW; x++) if (t(x, y)) L.set(x, y, x % 2 ? ra[2] : ra[3]);   // resorte
    });
    if (!atras) capa(g, oa2, L => {                                         // bolsillo
      L.rect(19, 60, 18, 7, ra[2]); L.rect(20, 61, 16, 1, ra[1]); L.rect(19, 66, 18, 1, ra[3]);
    });
    if (!atras) [[25, 53, 60], [30, 53, 60]].forEach(([x, y0, y1]) => { for (let y = y0; y <= y1; y++) g.set(x, y, '#e8ecff'); g.set(x, y1 + 1, '#a9b2ff'); });   // cordones
    // ---- brazos ----
    [8, 48].forEach(cx => capa(g, oa, L => {
      sombrear(L, elipse(cx, 58, 5.5, 11), cx, 58, 5.5, 11, ra);
      for (let y = 66; y <= 68; y++) for (let x = cx - 6; x <= cx + 6; x++) if (L.has(x, y)) L.set(x, y, ra[3]);
    }));
    // ---- capucha ----
    capa(g, oa, L => sombrear(L, elipse(28, 52, 17, 6), 28, 52, 17, 6, ra));
    if (atras) { for (let y = 54; y <= 74; y++) g.set(28, y, ra[3]); capa(g, oa, L => sombrear(L, elipse(28, 49, 11, 6), 28, 49, 11, 6, ra)); }
    if (ropa.sudadera === 'sud_arcoiris') {                       // franjas de arcoíris sobre la sudadera
      const RB = [['#ffb0b0', '#ff4a4a', '#c01c2c', '#780c1c'], ['#ffd0a0', '#ff9a30', '#d06a10', '#7a3a08'], ['#fff6a0', '#ffe030', '#d0a810', '#806008'], ['#b8f0a8', '#58d048', '#2a9a30', '#126020'], ['#b0e0ff', '#48a8f0', '#2468c8', '#123888'], ['#d8b8ff', '#9858e8', '#6a30b0', '#401880']];
      const cl = (r, gg, b) => [r, gg, b], base = ra.map(c => col(c));
      for (let y = 44; y <= 69; y++) for (let x = 0; x < SW; x++) {
        const i = (y * SW + x) * 4;
        if (g.d[i + 3] === 0) continue;
        const k = base.findIndex(b => b[0] === g.d[i] && b[1] === g.d[i + 1] && b[2] === g.d[i + 2]); if (k < 0) continue;
        const nc = col(RB[Math.min(5, Math.floor((y - 46) / 4))][k]); g.d[i] = nc[0]; g.d[i + 1] = nc[1]; g.d[i + 2] = nc[2];
      }
    }
    if (SUDP[ropa.sudadera]) {                                      // sudaderas estampadas
      const P = SUDP[ropa.sudadera], base = ra.map(c => col(c));
      for (let y = 44; y <= 69; y++) for (let x = 0; x < SW; x++) {
        const i = (y * SW + x) * 4;
        if (g.d[i + 3] === 0) continue;
        const k = base.findIndex(b => b[0] === g.d[i] && b[1] === g.d[i + 1] && b[2] === g.d[i + 2]); if (k < 0) continue;
        let nc = P.pals[P.f(x, y) % P.pals.length][k];
        if (P.est && (x * 31 + y * 17) % P.est === 0) nc = [255, 255, 255, 255];
        g.d[i] = nc[0]; g.d[i + 1] = nc[1]; g.d[i + 2] = nc[2];
      }
    }
    // ---- cabeza ----
    capa(g, TINTA, L => sombrear(L, elipse(28, 32, 25, 20), 28, 32, 25, 20, R.piel));
    if (!atras && (boca === 's' || boca === 't') && !est.tri) [[13, 44], [38, 44]].forEach(([x, y]) => { for (let j = 0; j < 2; j++) for (let i = 0; i < 5; i++) if (!(j === 1 && (i === 0 || i === 4))) g.set(x + i, y + j, '#ffa0b6'); });   // rubor
    // ---- ojos ----
    if (!atras) [15, 41].forEach(cx => {
      if (ojos === 'a') {
        capa(g, null, L => sombrear(L, elipse(cx, 34, 8.5, 8.5), cx, 34, 8.5, 8.5, R.ojo));
        [[-5, -5], [-4, -5], [-5, -4]].forEach(([dx, dy]) => g.set(cx + dx, 34 + dy, '#8a8ab8'));   // brillito
      } else {
        for (let x = cx - 8; x <= cx + 8; x++) {
          const y = 32 + Math.round(3 * (1 - Math.pow((x - cx) / 8, 2)));
          g.set(x, y, '#0e0e18'); g.set(x, y + 1, '#0e0e18');
        }
      }
    });
    if (est.oj && ojos === 'a') [15, 41].forEach(cx => {          // ojeras: bolsitas moradas pegadas al borde inferior del ojo
      for (let x = cx - 8; x <= cx + 8; x++) {
        const y = Math.round(34 + Math.sqrt(Math.max(0, 10.2 * 10.2 - (x - cx) * (x - cx))));
        if (y >= 40) { g.set(x, y, '#5a3a86'); g.set(x, y + 1, '#8a62b4'); if (Math.abs(x - cx) < 6) g.set(x, y + 2, '#b898d8'); }
      }
    });
    if (est.tri && ojos === 'a') [15, 41].forEach(cx => { g.set(cx - 3, 32, '#ffffff'); g.set(cx - 3, 31, '#ffffff'); g.set(cx - 4, 31, '#c8d0ff'); });   // ojos brillantes de pena
    if (est.tri === 2 && ojos === 'a') [15, 41].forEach(cx => {       // lágrimas que caen por las mejillas
      const f = est.l || 0, d = cx < 28 ? -1 : 1, tx = cx + d * 6;
      for (let y = 42; y <= 52; y++) { g.set(tx + d * (y > 47 ? 1 : 0), y, '#7ac8ff'); if (y % 3 === f) g.set(tx + d * (y > 47 ? 1 : 0), y, '#e0f6ff'); }
      g.set(tx + d * 2, 53 + f, '#7ac8ff'); g.set(tx + d * 2, 54 + f, '#e0f6ff');
      g.set(tx - d, 42, '#7ac8ff'); g.set(tx - 2 * d, 42, '#7ac8ff');
    });
    if (est.fl) {                                                      // mejillas hundidas
      [[9, 1], [47, -1]].forEach(([x0, d]) => { for (let i = 0; i < 8; i++) { g.set(x0 + d * (i >> 1), 38 + i, '#6a6e9c'); g.set(x0 + d * ((i >> 1) + 1), 38 + i, '#9a9ec8'); } });
      g.rect(22, 50, 12, 1, '#9a9ec8');
    }
    // ---- boca ----
    if (!atras) {
    if (boca === 'n' && est.tri) {
      if (est.tri === 2) { g.rect(24, 44, 8, 5, TINTA); g.rect(25, 45, 6, 3, '#1a1630'); g.rect(26, 47, 4, 1, '#e0607a'); }
      else [[23, 47], [24, 46], [25, 45], [26, 45], [27, 45], [28, 45], [29, 45], [30, 45], [31, 46], [32, 47]].forEach(([x, y]) => g.set(x, y, TINTA));
    }
    else if (boca === 'n') g.rect(25, 45, 6, 2, TINTA);
    else if (boca === 't') { capa(g, null, L => { L.rect(24, 43, 8, 6, '#1a1630'); }); g.rect(25, 47, 6, 2, '#e0607a'); g.set(24, 43, TINTA); g.set(31, 43, TINTA); g.set(24, 48, TINTA); g.set(31, 48, TINTA); }
    else [[23, 44], [24, 45], [25, 46], [26, 46], [27, 46], [28, 46], [29, 46], [30, 46], [31, 45], [32, 44]].forEach(([x, y]) => g.set(x, y, TINTA));
    }
    if (est.en) {
      g.rect(27, 39, 3, 2, '#ff6a78'); g.set(27, 39, '#ffc0c8'); const f = est.l || 0; g.rect(28, 41, 1, 1 + f, '#bfe8ff'); g.set(28, 42 + f, '#e8f8ff');
      if (!atras) [[12, 42], [44, 42]].forEach(([cx, cy]) => { for (let dy = -1; dy <= 1; dy++) for (let dx = -2; dx <= 2; dx++) if ((dx + dy) % 2 === 0) g.set(cx + dx, cy + dy, '#ff8aa6'); });
    }
    if (ropa.orejas) accOrejas(g, ropa.orejas);
    if (ropa.cuello) accCuello(g, ropa.cuello);
    if (ropa.cara && !atras) accGafas(g, ropa.cara);
    if (est.en && !atras && ropa.cara && ropa.cara !== 'nariz_payaso' && ropa.cara !== 'casco_espacial') {
      g.rect(27, 39, 3, 2, '#ff6a78'); g.set(27, 39, '#ffc0c8'); const f = est.l || 0; g.rect(28, 41, 1, 1 + f, '#bfe8ff'); g.set(28, 42 + f, '#e8f8ff');
    }
    if (est.fl) {                                                      // hambre: el cuerpo se ve flaquito
      const k0 = est.fl === 2 ? .66 : .8, src = g.d.slice();
      for (let y = 44; y < SH; y++) {
        const k = 1 - (1 - k0) * Math.min(1, (y - 44) / 1);
        for (let x = 0; x < SW; x++) {
          const sx = Math.round(28 + (x - 28) / k), i = (y * SW + x) * 4;
          if (sx >= 0 && sx < SW) { const j = (y * SW + sx) * 4; g.d[i] = src[j]; g.d[i + 1] = src[j + 1]; g.d[i + 2] = src[j + 2]; g.d[i + 3] = src[j + 3]; }
          else g.d[i + 3] = 0;
        }
      }
    }
    // ---- estados de abandono ----
    if (est.ab >= 1 && !atras) {
      // ab1+: manchas de suciedad y desaturación leve
      const manchas = [[10,35],[14,52],[38,48],[44,36],[22,62],[34,60],[8,60],[48,61]];
      manchas.forEach(([mx,my]) => { g.set(mx,my,'#5a5068'); g.set(mx+1,my,'#4a4058'); g.set(mx,my+1,'#6a5878'); });
      // desaturación parcial (todo el sprite un 40% hacia gris)
      for (let i = 0; i < g.d.length; i += 4) {
        if (g.d[i+3] === 0) continue;
        const gr = g.d[i]*0.299 + g.d[i+1]*0.587 + g.d[i+2]*0.114;
        g.d[i]   = Math.round(g.d[i]   * 0.6 + gr * 0.4);
        g.d[i+1] = Math.round(g.d[i+1] * 0.6 + gr * 0.4);
        g.d[i+2] = Math.round(g.d[i+2] * 0.6 + gr * 0.4);
      }
    }
    if (est.ab >= 2 && !atras) {
      // ab2: hollines más grandes, desaturación adicional fuerte, ojeras muy oscuras
      const hollin = [[6,30,'#2a2230'],[48,30,'#2a2230'],[18,25,'#1a1828'],[38,25,'#1a1828'],[12,55,'#2a2230'],[42,55,'#2a2230'],[25,65,'#1a1828'],[20,38,'#2a2230'],[36,38,'#2a2230']];
      hollin.forEach(([hx,hy,hc]) => { for (let dy=0;dy<3;dy++) for (let dx=0;dx<3;dx++) { if(g.d[((hy+dy)*SW+(hx+dx))*4+3]>0) g.set(hx+dx,hy+dy,hc); } });
      // desaturación fuerte adicional (60% más gris)
      for (let i = 0; i < g.d.length; i += 4) {
        if (g.d[i+3] === 0) continue;
        const gr = g.d[i]*0.299 + g.d[i+1]*0.587 + g.d[i+2]*0.114;
        g.d[i]   = Math.round(g.d[i]   * 0.4 + gr * 0.6);
        g.d[i+1] = Math.round(g.d[i+1] * 0.4 + gr * 0.6);
        g.d[i+2] = Math.round(g.d[i+2] * 0.4 + gr * 0.6);
      }
    }
    // ---- corona (la insignia), apoyada sobre la cabeza pelona ----
    if (!sinCorona) { const cg = Grid(SW, SH); dibujarCorona(cg); g.paste(cg, 0, 5); }
    if (atras && ropa.espalda) accCapa(g, ropa.espalda);
    return g;
  }
  function coronaGrid() { const g = Grid(SW, 12); dibujarCorona(g); const o = Grid(22, 12); for (let y = 0; y < 12; y++) for (let x = 0; x < 22; x++) { const a = (y * SW + x + 17) * 4; if (g.d[a + 3]) o.set(x, y, [g.d[a], g.d[a + 1], g.d[a + 2], 255]); } return o; }

  /* ===================== EL CUARTO ===================== */
  const ESTRELLAS = [[16, 22], [24, 34], [38, 20], [20, 46], [42, 44], [33, 30], [15, 38], [41, 29]];

  function cieloGrid(noche) {
    const g = Grid(60, 64);
    const X0 = 12, Y0 = 16, X1 = 46, Y1 = 54;
    const c = noche ? ['#0c1038', '#141a50', '#1e2770', '#2a3490'] : ['#62b8ff', '#86cdff', '#aee0ff', '#d4f0ff'];
    for (let y = Y0; y < Y1; y++) for (let x = X0; x < X1; x++) {
      const t = (y - Y0) / (Y1 - Y0) * 3 + (BAY[y & 3][x & 3] / 16 - .5) * .8;
      g.set(x, y, c[Math.max(0, Math.min(3, Math.floor(t + .3)))]);
    }
    if (noche) {
      capa(g, null, L => { L.rect(0, 0, 0, 0, '#000'); });
      const luna = elipse(36, 26, 5.5, 5.5), hueco = elipse(38.5, 24, 5, 5);
      for (let y = 18; y < 36; y++) for (let x = 28; x < 46; x++) if (luna(x, y) && !hueco(x, y)) g.set(x, y, BAY[y & 3][x & 3] > 9 ? '#fff7cc' : '#ffefa0');
      ESTRELLAS.forEach(([x, y]) => g.set(x, y, '#a9b4ff'));
      for (let y = 46; y < Y1; y++) for (let x = X0; x < X1; x++) { const h = 49 + Math.round(2 * Math.sin(x / 4)); if (y >= h) g.set(x, y, y > h + 1 ? '#0a1636' : '#10204a'); }
    } else {
      const sol = elipse(21, 26, 5.5, 5.5), halo = elipse(21, 26, 8.5, 8.5);
      for (let y = 16; y < 38; y++) for (let x = 12; x < 32; x++) {
        if (sol(x, y)) g.set(x, y, '#fff8b8');
        else if (halo(x, y) && (x + y) % 2 === 0) g.set(x, y, '#fff2a0');
      }
      [[36, 24, 7, 3], [32, 27, 6, 2], [18, 42, 6, 2], [21, 40, 5, 2]].forEach(([cx, cy, rx, ry]) => {
        const nube = elipse(cx, cy, rx, ry);
        for (let y = cy - ry - 1; y <= cy + ry + 1; y++) for (let x = cx - rx - 1; x <= cx + rx + 1; x++) if (nube(x, y)) g.set(x, y, y > cy ? '#dbe9ff' : '#ffffff');
      });
      for (let y = 44; y < Y1; y++) for (let x = X0; x < X1; x++) { const h = 47 + Math.round(2.5 * Math.sin(x / 5 + 1)); if (y >= h) g.set(x, y, y > h + 2 ? '#4aa04c' : '#6cc462'); }
    }
    return g;
  }

  // marco, cortinas y repisa de la ventana (el vidrio queda transparente para ver el cielo)
  function ventanaGrid() {
    const g = Grid(60, 64);
    g.rect(8, 12, 42, 46, '#5a3418'); g.rect(9, 13, 40, 44, '#c98a52'); g.rect(9, 13, 40, 1, '#e8b078'); g.rect(9, 13, 1, 44, '#e8b078');
    g.rect(28, 16, 2, 38, '#c98a52'); g.rect(12, 34, 34, 2, '#c98a52');
    g.rect(28, 16, 1, 38, '#e8b078'); g.rect(12, 34, 34, 1, '#e8b078');
    g.rect(6, 58, 46, 4, '#e8b078'); g.rect(6, 61, 46, 1, '#a06a38'); g.rect(6, 58, 46, 1, '#fff0d0');   // repisa de la ventana
    // cortinas rojas
    [[3, 10], [45, 10]].forEach(([x0]) => {
      capa(g, '#5a1420', L => {
        for (let y = 11; y <= 57; y++) for (let x = x0; x < x0 + 10; x++) L.set(x, y, ['#e8556a', '#c23a48', '#a82c3a', '#c23a48', '#e8556a'][(x - x0) % 5]);
        L.rect(x0, 39, 10, 3, '#e8c04a');
      });
    });
    g.rect(2, 8, 54, 3, '#5a3418'); g.rect(2, 8, 54, 1, '#c98a52'); g.rect(1, 7, 3, 5, '#e8c04a'); g.rect(55, 7, 3, 5, '#e8c04a');   // barra
    return g;
  }
  // cuadro de la corona, repisa con planta y libros
  function marcoDib(g, ox, oy, arte, mc) {
    g.rect(ox, oy, 38, 30, mc[0]); g.rect(ox + 1, oy + 1, 36, 28, mc[1]); g.rect(ox + 1, oy + 1, 36, 1, mc[2]); g.rect(ox + 1, oy + 1, 1, 28, mc[2]); g.rect(ox + 1, oy + 28, 36, 1, mc[3]); g.rect(ox + 36, oy + 1, 1, 28, mc[3]);
    g.rect(ox + 4, oy + 4, 30, 22, '#f4eed8'); g.rect(ox + 4, oy + 4, 30, 1, '#cfc8a8'); g.rect(ox + 4, oy + 4, 1, 22, '#cfc8a8');
    g.paste(arte, ox + 5, oy + 5);
  }
  function derechaGrid(arte, mc) {
    const g = Grid(120, 96);
    marcoDib(g, 66, 15, arte, mc);
    linea(g, 85, 14, 78, 8, '#7a5a30'); linea(g, 85, 14, 92, 8, '#7a5a30'); g.rect(84, 7, 3, 2, '#c8c8d8');
    return g;
  }
  function banderines(g, W, y0) {
    capa(g, '#3a2030', L => {
      const cols = ['#e8353f', '#e8c04a', '#4b6ae8', '#f4eed8'];
      for (let x = 0; x < W; x++) L.set(x, y0 + Math.round(5 * Math.sin(Math.PI * x / W)), '#6e4422');
      for (let k = 0, x = 4; x < W - 6; x += 9, k++) {
        const base = y0 + Math.round(5 * Math.sin(Math.PI * (x + 3) / W)) + 1;
        for (let j = 0; j < 7; j++) for (let i = 0; i < 7; i++) if (Math.abs(i - 3) <= 3.4 * (1 - j / 7.5)) L.set(x + i, base + j, j === 0 ? '#ffffff' : cols[k % 4]);
      }
    });
  }
  function cuartoGrid(W, H, RY, rugCy, OX, P) {
    const g = Grid(W, H);
    const dy = RY - 59, FY = RY + 35;
    // ---- pared con rayas ----
    for (let y = 0; y < RY + 5; y++) for (let x = 0; x < W; x++) g.set(x, y, P.sty ? PAT_P[P.sty.pat](x, y, P.sty.col) : x % 12 < 6 ? P.pared[0] : P.pared[1]);
    for (let y = 0; y < 7; y++) for (let x = 0; x < W; x++) if (BAY[y & 3][x & 3] < (7 - y) * 2.4) g.set(x, y, P.pared[7]);   // sombra del techo
    g.rect(0, 0, W, 3, '#f0e6c8'); g.rect(0, 3, W, 1, '#b8a878');                // moldura
    // ---- riel y lambrín ----
    g.rect(0, RY, W, 1, '#fffbe8'); g.rect(0, RY + 1, W, 3, '#f0e6c8'); g.rect(0, RY + 4, W, 1, P.pared[6]);
    g.rect(0, RY + 5, W, 24, P.pared[2]);
    const wp = P.sty && P.sty.wain.length > 2; if (wp) for (let y = RY + 5; y < RY + 29; y++) for (let x = 0; x < W; x++) g.set(x, y, PAT_P[P.sty.pat](x, y, P.sty.wain));
    for (let px = 4; !wp && px < W; px += 29) {
      g.rect(px, RY + 9, 25, 16, P.pared[3]); g.rect(px, RY + 9, 25, 1, P.pared[4]); g.rect(px, RY + 9, 1, 16, P.pared[4]);
      g.rect(px, RY + 24, 25, 1, P.pared[5]); g.rect(px + 24, RY + 9, 1, 16, P.pared[5]);
    }
    // ---- zócalo ----
    g.rect(0, RY + 29, W, 6, '#f0e6c8'); g.rect(0, RY + 29, W, 1, '#fffbe8'); g.rect(0, RY + 33, W, 2, '#b8a878');
    // ---- piso de madera ----
    if (P.fl) { for (let y = FY; y < H; y++) for (let x = 0; x < W; x++) g.set(x, y, PAT_F[P.fl.pat](x, y - FY, P.fl.col)); } else {
    for (let y = FY; y < H; y++) { const fila = ((y - FY) / 8) | 0; for (let x = 0; x < W; x++) g.set(x, y, fila % 2 ? '#c58750' : '#cc8f56'); }
    let semilla = 7; const rnd = () => (semilla = (semilla * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    for (let fila = 0; fila * 8 + FY < H; fila++) {
      const y = FY + fila * 8;
      g.rect(0, y, W, 1, '#8a5630'); g.rect(0, y + 1, W, 1, '#dfa66e');
      for (let x = (fila * 13 + 7) % 26; x < W; x += 26) g.rect(x, y + 1, 1, 7, '#8a5630');
      for (let i = 0; i < 9; i++) g.set(Math.floor(rnd() * W), y + 2 + Math.floor(rnd() * 5), rnd() > .5 ? '#b87a46' : '#d9995f');
    }
    }
    // ---- alfombra roja con borde crema ----
    const cx0 = Math.round(W / 2);
    const rugY = rugCy + 4;
    [[54, 17, P.alf[0]], [51, 15, P.alf[1]], [45, 12, P.alf[2]], [42, 10, P.alf[3]]].forEach(([rx, ry, c]) => {
      const t = elipse(cx0, rugY, rx, ry);
      for (let y = rugY - ry; y <= rugY + ry; y++) for (let x = cx0 - rx; x <= cx0 + rx; x++) if (t(x, y)) g.set(x, y, c);
    });
    for (let x = cx0 - 36; x <= cx0 + 36; x += 6) { g.set(x, rugY, '#f4e9c8'); g.set(x + 1, rugY - 1, '#f4e9c8'); g.set(x + 1, rugY + 1, '#f4e9c8'); g.set(x + 2, rugY, '#f4e9c8'); }
    // ---- ventana (izquierda) y cuadro + repisa (derecha) ----
    g.paste(ventanaGrid(), OX, dy);
    g.clear(12 + OX, 16 + dy, 34, 38);
    g.paste(derechaGrid(P.arte, P.mc), OX, dy);
    return g;
  }

  /* ===================== HABITACIONES Y LUGARES ===================== */
  const HABS = [{ id: 'estudio', n: 'ESTUDIO', nv: 2 }, { id: 'juegos', n: 'SALA DE JUEGOS', nv: 2 }, { id: 'sala', n: 'RECÁMARA', nv: 1 }, { id: 'bano', n: 'BAÑO', nv: 1 }, { id: 'cocina', n: 'COCINA', nv: 4 }, { id: 'entrada', n: 'ENTRADA', nv: 7 }, { id: 'jardin', n: 'JARDÍN', nv: 10 }];
  const LUGARES = [{ id: 'parque', n: 'PARQUE', nv: 10 }];
  let calle = false, sinCorona = false;
  const escenaId = () => calle ? 'calle' : (lugar || vistaBloq || e.hab);
  /* ---- SALA DE JUEGOS: máquina arcade (acceso a los minijuegos). Va a la izquierda: Cortex llega por la derecha y no la tapa ---- */
  const arcPos = () => ({ x: OX + 2, y: RY + 35 - 72, w: 32, h: 72 });
  function juegosGrid(W, H, RY, OX, S) {
    S = S || {}; const g = Grid(W, H), FY = RY + 35;
    for (let y = 0; y < FY; y++) for (let x = 0; x < W; x++) g.set(x, y, S.p ? PAT_P[S.p.pat](x, y, S.p.col) : (x % 14 < 7) ? '#3a2a6e' : '#34265f');
    if (!S.p) for (let y = 0; y < FY; y += 12) g.rect(0, y, W, 1, '#2a1e52');
    g.rect(0, 0, W, 3, '#1e1640'); g.rect(0, 3, W, 1, '#6a4ad8');
    [[44, 20], [66, 11], [74, 40], [118, 14], [58, 70], [100, 30], [44, 60]].forEach(([x, y]) => { g.set(OX + x, y, '#8a7ae8'); g.set(OX + x - 1, y, '#5a4aa8'); g.set(OX + x + 1, y, '#5a4aa8'); g.set(OX + x, y - 1, '#5a4aa8'); g.set(OX + x, y + 1, '#5a4aa8'); });
    // repisa con trofeos (derecha)
    g.rect(OX + 78, RY - 6, 40, 2, '#6a4a2a'); g.rect(OX + 78, RY - 6, 40, 1, '#8a6a3a');
    g.rect(OX + 78, RY - 25, 40, 2, '#6a4a2a'); g.rect(OX + 78, RY - 25, 40, 1, '#8a6a3a');
    // piso
    for (let y = FY; y < H; y++) for (let x = 0; x < W; x++) g.set(x, y, S.f ? PAT_F[S.f.pat](x, y - FY, S.f.col) : (((x / 8) | 0) + ((y - FY) / 8 | 0)) % 2 ? '#2a2058' : '#3a2c78');
    g.rect(0, FY, W, 2, '#ff5ac8'); g.rect(0, FY + 2, W, 1, '#7a2a78');
    // puf rosa (derecha)
    g.rect(OX + 92, FY + 5, 22, 4, '#a82a78'); g.rect(OX + 90, FY - 2, 26, 8, '#e84aa8'); g.rect(OX + 92, FY - 4, 22, 3, '#ff7ac8'); g.rect(OX + 96, FY - 3, 8, 1, '#ffb0e0');
    // máquina arcade grande
    const a = arcPos(), x = a.x, y = a.y, K = '#14163a';
    g.rect(x, y, 32, 72, K); g.rect(x + 1, y + 1, 30, 70, '#3a3ac0'); g.rect(x + 1, y + 1, 3, 70, '#5a5ae8'); g.rect(x + 28, y + 1, 3, 70, '#2a2a8a');
    g.rect(x + 3, y + 2, 26, 9, '#ff3a8a'); g.rect(x + 3, y + 2, 26, 1, '#ff8ac0'); g.rect(x + 3, y + 10, 26, 1, '#a0185a');
    for (let i = 0; i < 7; i++) g.rect(x + 5 + i * 3 + (i % 2), y + 5, 2, 2, '#ffe45a');
    g.rect(x + 3, y + 13, 26, 34, '#6a6ad8'); g.rect(x + 4, y + 14, 24, 32, '#04041a');
    g.rect(x + 3, y + 49, 26, 10, '#2a2a70'); g.rect(x + 3, y + 49, 26, 1, '#4a4aa8'); g.rect(x + 3, y + 58, 26, 1, '#14143c');
    g.rect(x + 8, y + 53, 2, 5, '#9aa4b8'); g.rect(x + 6, y + 50, 6, 4, '#ff3a3a'); g.rect(x + 7, y + 50, 2, 1, '#ff9a9a');
    g.rect(x + 17, y + 52, 4, 4, '#ffd84a'); g.rect(x + 23, y + 52, 4, 4, '#4adfff');
    g.rect(x + 3, y + 61, 26, 9, '#2c2c9c'); g.rect(x + 11, y + 63, 10, 6, '#14143c'); g.rect(x + 15, y + 64, 2, 4, '#ffd84a');
    g.rect(x + 2, y + 70, 28, 2, K);
    return g;
  }
  function arcadeVivo() {   // pantalla animada y flechita parpadeante
    const a = arcPos(), t = tk >> 2, ax = a.x + 4, ay = a.y + 14;
    ctx.fillStyle = '#04041a'; ctx.fillRect(ax, ay, 24, 32);
    ctx.fillStyle = '#ffffff'; [[3, 4], [18, 9], [10, 20], [20, 27], [5, 15]].forEach(([x, y], i) => { if ((t + i) % 3) ctx.fillRect(ax + x, ay + y, 1, 1); });
    const nx = Math.round(8 + Math.sin(t / 2) * 8), inv = (t >> 1) % 2;
    ctx.fillStyle = '#5aff7a'; [[1, 0], [5, 0], [2, 1], [4, 1], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [0, 3], [1, 3], [3, 3], [5, 3], [6, 3], [1, 4 + inv], [5, 4 + inv]].forEach(([dx, dy]) => ctx.fillRect(ax + nx + dx, ay + 4 + dy, 1, 1));
    ctx.fillStyle = '#ff9a3a'; const nx2 = Math.round(8 + Math.sin(t / 2 + 2) * 8); [[1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [3, 1], [0, 2], [3, 2]].forEach(([dx, dy]) => ctx.fillRect(ax + nx2 + dx, ay + 14 + dy, 1, 1));
    ctx.fillStyle = '#ffe45a'; const nave = Math.round(10 + Math.sin(t / 3 + 1) * 8); ctx.fillRect(ax + nave + 2, ay + 28, 3, 1); ctx.fillRect(ax + nave + 3, ay + 27, 1, 1);
    if (t % 5 < 3) { ctx.fillStyle = '#ff5a5a'; ctx.fillRect(ax + nave + 3, ay + 23 - (t % 5) * 3, 1, 2); }
    if ((tk >> 3) % 2 && !dlg && !modal) { ctx.fillStyle = '#ffe45a'; ctx.fillRect(a.x + 11, a.y - 7, 10, 1); ctx.fillRect(a.x + 12, a.y - 6, 8, 1); ctx.fillRect(a.x + 13, a.y - 5, 6, 1); ctx.fillRect(a.x + 14, a.y - 4, 4, 1); ctx.fillRect(a.x + 15, a.y - 3, 2, 1); }
  }
  const repisasCoc = (OX, RY, W) => {   // x0, x1, base, alto máximo: solo las dos repisas inferiores para dejar la pared libre
    return [[OX + 52, OX + 82, RY - 40, RY - 46], [OX + 88, OX + 118, RY - 40, RY - 46]];
  };
  function cocinaGrid(W, H, RY, OX, S) {   // cocina moderna: azulejo metro blanco, muebles blancos con cubierta de madera, campana y ventana de madera
    S = S || {}; const g = Grid(W, H), dy = RY - 59, FY = RY + 35, M = '#c8a070';
    for (let y = 0; y < RY + 5; y++) for (let x = 0; x < W; x++) g.set(x, y, S.p ? PAT_P[S.p.pat](x, y, S.p.col) : '#f2f0ea');
    if (!S.p) for (let y = 22; y < RY + 4; y++) for (let x = 0; x < W; x++) { const r = ((y - 22) / 6) | 0, xo = (x + (r % 2) * 6) % 12; g.set(x, y, (y - 22) % 6 === 5 || xo === 11 ? '#d8d4ca' : (xo === 0 || (y - 22) % 6 === 0) ? '#ffffff' : '#fbfaf6'); }
    g.rect(0, 0, W, 3, '#e0dcd0'); g.rect(0, 3, W, 1, '#b8b2a2');
    if (S.p) for (let y = RY - 4; y < FY; y++) for (let x = 0; x < W; x++) g.set(x, y, PAT_P.azulejo(x, y, S.p.wain));
    // piso de tarima clara
    for (let y = FY; y < H; y++) for (let x = 0; x < W; x++) g.set(x, y, S.f ? PAT_F[S.f.pat](x, y - FY, S.f.col) : PAT_F.tablones(x, y - FY, ['#e8d0a8', '#e0c898', '#c8a878']));
    g.rect(0, FY, W, 3, '#f4f2ec'); g.rect(0, FY + 3, W, 1, '#b8b2a2');
    // mueble bajo blanco con cubierta de madera
    g.rect(0, RY + 3, W, 4, M); g.rect(0, RY + 3, W, 1, '#e8c898'); g.rect(0, RY + 6, W, 1, '#8a6a44');
    g.rect(0, RY + 7, W, FY - RY - 7, '#e8e6e0');
    for (let x = 0; x < W; x += 30) { g.rect(x + 1, RY + 9, 28, FY - RY - 12, '#fafaf8'); g.rect(x + 1, RY + 9, 28, 1, '#ffffff'); g.rect(x + 1, RY + FY - RY - 4, 28, 1, '#d0ccc2'); g.rect(x + 12, RY + 11, 6, 1, '#8a8478'); }
    g.rect(0, FY - 3, W, 3, '#b8b4aa');
    // ventana con marco de madera (el cielo se dibuja detrás)
    g.rect(OX + 9, dy + 13, 40, 44, '#6a5440'); g.rect(OX + 9, dy + 13, 40, 1, '#8a6e56'); g.clear(12 + OX, 16 + dy, 34, 38);
    g.rect(OX + 28, dy + 16, 2, 38, '#6a5440'); g.rect(OX + 12, dy + 34, 34, 2, '#6a5440');
    g.rect(OX + 6, dy + 57, 46, 3, '#f4f0e6'); g.rect(OX + 6, dy + 57, 46, 1, '#ffffff'); g.rect(OX + 6, dy + 59, 46, 1, '#c8c2b4');
    // lavabo de acero con grifo alto (junto a la estufa)
    const lx = OX + 36;
    g.rect(lx, RY + 2, 17, 2, '#8a98a4'); g.rect(lx, RY + 1, 17, 1, '#c8d4dc'); g.rect(lx + 7, RY - 9, 2, 9, '#a8b4c0'); g.rect(lx + 7, RY - 10, 7, 2, '#a8b4c0'); g.rect(lx + 13, RY - 8, 1, 2, '#7ac8ff');
    // bomba de kekes (dispensador de keke)
    { const bx = OX + 62, by = RY - 16;
      g.rect(bx + 1, by, 6, 1, '#e8333f');       // tapa
      g.rect(bx, by + 1, 8, 10, '#ff7a8a');       // cuerpo rosado
      g.rect(bx, by + 1, 8, 1, '#ffaaaa');        // brillo
      g.rect(bx + 1, by + 11, 6, 2, '#c84a5a');   // base más oscura
      g.rect(bx + 2, by + 3, 4, 6, '#fff6ea');    // etiqueta blanca
      // keke mini en la etiqueta
      g.set(bx + 3, by + 4, '#e8333f'); g.set(bx + 4, by + 4, '#e8333f');
      g.set(bx + 2, by + 5, '#ffd084'); g.set(bx + 3, by + 5, '#ffd084'); g.set(bx + 4, by + 5, '#ffd084'); g.set(bx + 5, by + 5, '#ffd084');
      g.set(bx + 2, by + 6, '#c88a40'); g.set(bx + 3, by + 6, '#c88a40'); g.set(bx + 4, by + 6, '#c88a40'); g.set(bx + 5, by + 6, '#c88a40');
      g.rect(bx + 3, by - 2, 2, 2, '#c84a5a');    // pitón del dispensador
    }
    // ESTUFA de cocina: tablero con perillas, hornillas, sartén y horno con ventana
    const sx = OX + 1, FYc = RY + 35;
    g.rect(sx, RY - 7, 29, 5, '#5a626c'); g.rect(sx + 1, RY - 6, 27, 3, '#9aa4ae'); g.rect(sx + 1, RY - 6, 27, 1, '#d8e0e6');
    [4, 10, 16, 22].forEach(d => { g.rect(sx + d, RY - 5, 3, 2, '#2a2a30'); g.set(sx + d + 1, RY - 5, '#ffffff'); });
    g.rect(sx - 1, RY - 2, 31, 4, '#2a2c34'); g.rect(sx - 1, RY - 2, 31, 1, '#4a4e5a');
    [[3, '#ff6a40'], [17, '#ffb040']].forEach(([d, c2]) => { g.rect(sx + d, RY, 9, 2, '#14141a'); g.rect(sx + d + 1, RY, 7, 1, c2); });
    g.rect(sx + 3, RY - 7 + 0, 0, 0, '#000'); g.rect(sx + 2, RY - 4, 11, 3, '#1a1a20'); g.rect(sx + 3, RY - 4, 9, 1, '#4a4a56'); g.rect(sx + 13, RY - 3, 7, 1, '#2a2a30');
    g.rect(sx - 1, RY + 2, 31, FYc - RY - 5, '#8a949e'); g.rect(sx, RY + 3, 29, FYc - RY - 7, '#b8c2cc'); g.rect(sx, RY + 3, 29, 1, '#e8eef2');
    g.rect(sx + 3, RY + 8, 23, 15, '#4a525c'); g.rect(sx + 4, RY + 9, 21, 13, '#1c2028'); g.rect(sx + 5, RY + 10, 8, 2, '#3a4250'); g.rect(sx + 5, RY + 13, 3, 6, '#2a3040');
    g.rect(sx + 4, RY + 5, 21, 2, '#6a727c'); g.rect(sx + 4, RY + 5, 21, 1, '#d0d8de');
    g.rect(sx + 4, RY + 26, 21, 1, '#8a949e'); g.rect(sx + 2, FYc - 4, 25, 2, '#6a727c');
    // refri
    const fx = OX + 91;
    if (e.cuarto.refri && ITEMS[e.cuarto.refri]) refriDibuja(g, fx, RY, FY, e.cuarto.refri); else {
    g.rect(fx, RY - 26, 24, FY - RY + 25, '#5a6672'); g.rect(fx + 1, RY - 25, 22, FY - RY + 23, '#c8d0d8'); g.rect(fx + 1, RY - 25, 22, 1, '#eef4f8'); g.rect(fx + 1, RY - 25, 2, FY - RY + 23, '#e0e8f0'); g.rect(fx + 22, RY - 25, 1, FY - RY + 23, '#9aa6b2');
    g.rect(fx + 1, RY + 6, 22, 2, '#8a96a2'); g.rect(fx + 19, RY - 20, 2, 12, '#6a7682'); g.rect(fx + 19, RY + 10, 2, 14, '#6a7682'); g.rect(fx + 5, RY - 19, 8, 3, '#4ab8ff');
    g.art(fx + 5, RY - 10, ['.rr.rr.', 'rrrrrrr', 'rrrrrrr', '.rrrrr.', '..rrr..', '...r...'], { r: '#ff4a5c' });
    g.rect(fx + 4, RY + 14, 8, 6, '#ffd84a'); g.rect(fx + 4, RY + 14, 8, 1, '#fff6b0');
    }
    // repisas de madera vacías: ahí se colocan los objetos que el jugador quiera
    repisasCoc(OX, RY, W).forEach(([x0, x1, by]) => { const w = x1 - x0; g.rect(x0, by, w, 2, M); g.rect(x0, by, w, 1, '#e8c898'); g.rect(x0, by + 2, w, 1, '#8a6a44'); g.rect(x0 + 3, by + 3, 2, 4, '#8a6a44'); g.rect(x1 - 5, by + 3, 2, 4, '#8a6a44'); });
    return g;
  }
  function entradaGrid(W, H, RY, OX, S) {
    S = S || {}; const g = Grid(W, H), FY = RY + 35;
    for (let y = 0; y < RY + 5; y++) for (let x = 0; x < W; x++) g.set(x, y, S.p ? PAT_P[S.p.pat](x, y, S.p.col) : x % 12 < 6 ? '#a8d0a8' : '#9cc49c');
    g.rect(0, 0, W, 3, '#f0e6c8'); g.rect(0, 3, W, 1, '#b8a878');
    banderines(g, W, 6);
    g.rect(0, RY, W, 1, '#fffbe8'); g.rect(0, RY + 1, W, 3, '#f0e6c8'); g.rect(0, RY + 4, W, 1, '#6a9a74'); g.rect(0, RY + 5, W, 24, S.p ? S.p.wain[0] : '#7aaa84');
    if (S.p && S.p.wain.length > 2) { for (let y = RY + 5; y < RY + 29; y++) for (let x = 0; x < W; x++) g.set(x, y, PAT_P[S.p.pat](x, y, S.p.wain)); }
    else for (let px = 4; px < W; px += 29) { g.rect(px, RY + 9, 25, 16, S.p ? S.p.wain[1] : '#8cba94'); g.rect(px, RY + 9, 25, 1, S.p ? mixC(S.p.wain[1], .3) : '#a8d0b0'); g.rect(px, RY + 24, 25, 1, S.p ? mixC(S.p.wain[1], -.35) : '#5a8a64'); }
    g.rect(0, RY + 29, W, 6, '#f0e6c8'); g.rect(0, RY + 29, W, 1, '#fffbe8'); g.rect(0, RY + 33, W, 2, '#b8a878');
    for (let y = FY; y < H; y++) for (let x = 0; x < W; x++) g.set(x, y, S.f ? PAT_F[S.f.pat](x, y - FY, S.f.col) : (((x / 12) | 0) + ((y - FY) / 6 | 0)) % 2 ? '#a89a88' : '#b8aa98');
    if (!S.f) for (let y = FY; y < H; y += 6) g.rect(0, y, W, 1, '#7a6e60');
    // puerta
    const dx = OX + 8, dt = RY - 40, dh = FY - dt - 1;
    g.rect(dx, dt, 38, dh + 1, '#4a2a10'); g.rect(dx + 2, dt + 2, 34, dh - 1, '#6e4422');
    g.rect(dx + 4, dt + 4, 30, dh - 5, '#a86a3c'); g.rect(dx + 4, dt + 4, 30, 1, '#d8a060'); g.rect(dx + 4, dt + 4, 1, dh - 5, '#d8a060'); g.rect(dx + 33, dt + 4, 1, dh - 5, '#7a4a24');
    [[8, 8], [21, 8]].forEach(([ox, oy]) => { g.rect(dx + ox, dt + oy, 13, 22, '#5a3a1c'); g.rect(dx + ox + 1, dt + oy + 1, 11, 20, '#bfe4ff'); g.rect(dx + ox + 1, dt + oy + 1, 11, 6, '#e0f4ff'); g.rect(dx + ox + 6, dt + oy + 1, 1, 20, '#5a3a1c'); g.rect(dx + ox + 1, dt + oy + 10, 11, 1, '#5a3a1c'); });
    [[8, 34], [21, 34]].forEach(([ox, oy]) => { g.rect(dx + ox, dt + oy, 13, dh - oy - 10, '#8a5430'); g.rect(dx + ox, dt + oy, 13, 1, '#6a3a1c'); g.rect(dx + ox + 12, dt + oy, 1, dh - oy - 10, '#d8a060'); g.rect(dx + ox, dt + dh - 11, 13, 1, '#d8a060'); });
    g.rect(dx + 29, dt + 38, 3, 3, '#ffd84a'); g.set(dx + 29, dt + 38, '#fff6b0');
    // tapete
    g.rect(OX + 6, FY + 6, 40, 9, '#8a1c28'); g.rect(OX + 7, FY + 7, 38, 7, '#c23a48'); g.rect(OX + 10, FY + 10, 32, 1, '#f4eed8');
    // perchero, sombrero y bufanda
    const px = OX + 100;
    g.rect(px, RY - 22, 2, FY - RY + 20, '#6e4422'); g.rect(px - 5, FY - 3, 12, 3, '#4a2a10'); g.rect(px - 4, RY - 24, 10, 2, '#6e4422');
    g.rect(px - 7, RY - 18, 6, 2, '#8a5630'); g.rect(px + 3, RY - 14, 7, 2, '#8a5630');
    g.art(px - 10, RY - 16, ['..rrrr..', '.rrrrrr.', 'rrrrrrrr', 'wwwwwwww'], { r: '#e8353f', w: '#f4eed8' });
    g.rect(px + 5, RY - 12, 4, 14, '#3a47a8'); g.rect(px + 5, RY - 12, 1, 14, '#6a78d8'); g.rect(px + 4, RY + 1, 6, 3, '#ffd84a');
    g.rect(px - 7, RY + 22, 11, 14, '#5a3a1c'); g.rect(px - 6, RY + 23, 9, 12, '#7a5a30'); g.rect(px + 1, RY + 10, 2, 13, '#232b63');
    // cuadrito con la corona
    g.rect(OX + 84, RY - 44, 28, 18, '#6e4422'); g.rect(OX + 85, RY - 43, 26, 16, '#e8c04a'); g.rect(OX + 87, RY - 41, 22, 12, '#f4eed8'); g.paste(coronaGrid(), OX + 87, RY - 41);
    return g;
  }
  function parqueGrid(W, H, RY, cl) {
    const g = Grid(W, H), HY = RY + 8, nieve = cl === 'nieve', fuerte = cl === 'lluvia' || cl === 'tormenta';
    const V = nieve ? ['#cfdaf2', '#e6eeff', '#f4f8ff'] : fuerte ? ['#3f7a52', '#34683f', '#2a5634'] : ['#6cc070', '#52aa58', '#3f9248'];
    const GR = nieve ? ['#f4f8ff', '#e2eaf8'] : fuerte ? ['#3a7a44', '#32683c'] : ['#58b45c', '#4ca452'];
    for (let x = 0; x < W; x++) {
      const h1 = HY - 15 + Math.round(5 * Math.sin(x / 11 + 1) + 3 * Math.sin(x / 5)), h2 = HY - 7 + Math.round(4 * Math.sin(x / 8 + 3));
      for (let y = h1; y < HY + 4; y++) g.set(x, y, V[0]);
      for (let y = h2; y < HY + 4; y++) g.set(x, y, V[1]);
    }
    for (let y = HY + 4; y < H; y++) for (let x = 0; x < W; x++) g.set(x, y, ((y - HY) >> 3) % 2 ? GR[0] : GR[1]);
    // camino
    for (let y = HY + 6; y < H; y++) { const hw = 6 + (y - HY) * .42; for (let x = 0; x < W; x++) { const d = Math.abs(x + .5 - W / 2); if (d <= hw) g.set(x, y, d > hw - 1.5 ? '#c8a870' : (x + y) % 7 === 0 ? '#d4b87c' : '#e0c48c'); } }
    // arboles
    const arbol = (cx, base, rx, ry, tr) => {
      g.rect(cx - tr, base - ry, tr * 2, ry + 2, '#6a4020'); g.rect(cx - tr, base - ry, 1, ry + 2, '#8a5830');
      const ramp = nieve ? ['#ffffff', '#e6eeff', '#c0d0ec', '#8aa0c8'] : R.verde, cy = base - ry - rx * .6;
      capa(g, nieve ? '#5a6a90' : '#12432a', L => sombrear(L, union(elipse(cx, cy, rx, rx * .95), elipse(cx - rx * .5, cy + rx * .3, rx * .7, rx * .6), elipse(cx + rx * .5, cy + rx * .3, rx * .7, rx * .6)), cx, cy, rx, rx, ramp));
    };
    arbol(Math.round(W * .3), HY - 1, 9, 10, 2); arbol(Math.round(W * .74), HY - 1, 8, 9, 2);
    arbol(8, HY + 12, 15, 24, 4); arbol(W - 9, HY + 14, 16, 26, 4);
    // cerca
    for (let x = 26; x < W - 26; x += 8) { g.rect(x, HY + 3, 2, 8, '#8a5630'); g.rect(x, HY + 3, 2, 1, '#d8a060'); }
    g.rect(26, HY + 5, W - 52, 1, '#a86a3c'); g.rect(26, HY + 8, W - 52, 1, '#a86a3c');
    // banca
    const bx = W - 46, by = HY + 20;
    g.rect(bx, by, 26, 3, '#a86a3c'); g.rect(bx, by, 26, 1, '#d8a060'); g.rect(bx, by - 8, 26, 2, '#a86a3c'); g.rect(bx, by - 8, 26, 1, '#d8a060'); g.rect(bx + 2, by - 8, 2, 8, '#6e4422'); g.rect(bx + 22, by - 8, 2, 8, '#6e4422'); g.rect(bx + 2, by + 3, 2, 6, '#4a2a10'); g.rect(bx + 22, by + 3, 2, 6, '#4a2a10');
    // flores y pasto
    let sem = 11; const rnd = () => (sem = (sem * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    for (let i = 0; i < 46; i++) {
      const x = Math.floor(rnd() * W), y = HY + 12 + Math.floor(rnd() * (H - HY - 14)), d = Math.abs(x + .5 - W / 2), hw = 6 + (y - HY) * .42;
      if (d <= hw + 2 || (x > bx - 2 && x < bx + 28 && y > by - 10 && y < by + 10)) continue;
      if (nieve) { g.set(x, y, '#c0cce8'); continue; }
      if (i % 3 === 0) { const c = ['#ff6a8a', '#ffd84a', '#ffffff', '#b890ff'][i % 4]; g.set(x, y, c); g.set(x, y - 1, '#2f8038'); }
      else { g.set(x, y, fuerte ? '#2a5634' : '#3f8a44'); g.set(x + 1, y - 1, fuerte ? '#2a5634' : '#3f8a44'); }
    }
    return g;
  }
  /* ---- JARDÍN: macetas lindas en primer plano (piso + colgando de una viga), cielo despejado y pasto; Simon se ve de espaldas, chiquito, abajo ---- */
  // (JARDIN_MAXP, JARDIN_POTW, JARDIN_POTH definidos en config.js)
  function plotsDesbloqueados() { const n = nivel(); return n >= 30 ? 6 : n >= 25 ? 5 : n >= 20 ? 4 : n >= 15 ? 3 : n >= 10 ? 2 : 0; }
  function jardinSync() {   // agrega casillas vacías conforme se desbloquean más (nunca quita las ya existentes)
    e.jardin = e.jardin || { plots: [] }; if (!Array.isArray(e.jardin.plots)) e.jardin.plots = [];
    const n = plotsDesbloqueados();
    while (e.jardin.plots.length < n) e.jardin.plots.push({ k: null, etapa: null, dias: 0, diaUlt: null, regadoHoy: false });
    return e.jardin.plots;
  }
  // primeras 3 macetas: a nivel de piso, sobre el pasto. de la 4a a la 6a: cuelgan de una viga (se arma sola al desbloquear la primera)
  function jardinSlot(i, n, W) {
    const piso = i < 3, cntP = Math.min(n, 3), cntC = Math.max(0, n - 3);
    if (piso) { const esp = 28, total = (cntP - 1) * esp; return { piso: true, cx: Math.round(W / 2 - total / 2 + i * esp), base: RY + 41 }; }
    const j = i - 3, esp = 26, total = (cntC - 1) * esp; return { piso: false, cx: Math.round(W / 2 - total / 2 + j * esp), base: RY - 3 };
  }
  function jardinPlotRect(i, n, W, H) {
    const s = jardinSlot(i, n, W);
    if (s.piso) {
      return { x: s.cx - 20, y: s.base - 48, w: 40, h: 64 };
    } else {
      return { x: s.cx - 20, y: RY - 44, w: 40, h: (s.base - (RY - 44)) + 18 };
    }
  }
  const JARDIN_POTS = [['#e3a86a', '#c47a46', '#f3cf9a'], ['#d98a52', '#b86a3a', '#f0c08a'], ['#cf7a46', '#a85c30', '#e8b888']];
  function florP(g, x, y, petal, centro, grande) {   // florecita de pixeles: chica (4) o grande (8 pétalos)
    (grande ? [[-1, -1], [1, -1], [-1, 1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]] : [[-1, 0], [1, 0], [0, -1], [0, 1]]).forEach(([dx, dy]) => g.set(x + dx, y + dy, petal));
    g.set(x, y, centro);
  }
  function gotaAviso(g, x, y) {   // gota de agua clara (pico arriba, panza redonda abajo, con brillito): avisa que a esta planta ya le toca riego
    [0, 1, 2, 3, 3, 2, 1].forEach((r, j) => { for (let i = -r; i <= r; i++) g.set(x + i, y + j, (j === 4 && i === 0) ? '#eaf9ff' : Math.abs(i) === r ? '#1372b8' : '#4ab8ff'); });
  }
  function bola(L, cx, cy, r, c) { for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (dx * dx + dy * dy <= r * r + 1) L.set(cx + dx, cy + dy, c); }   // circulito sólido (núcleos, yemas, hojas)
  // FLOR ESPECTRO (semilla "brote"): planta alienígena bioluminiscente — tronco retorcido violeta con ramas que terminan en yemas de color, hojas menta de contraste, y una floración grande en anillos concéntricos con núcleo que pulsa
  function plantaEspectro(g, cx, dy, etapa, fr) {
    if (etapa === 'semilla') { capa(g, '#1a0f28', L => { L.rect(cx - 1, dy - 4, 2, 4, '#caa6e0'); L.set(cx, dy - 5, '#ffffff'); }); return; }
    if (etapa === 'brote') {
      capa(g, '#1a0f28', L => {
        for (let t = 0; t < 9; t++) { const ox = Math.round(Math.sin(t * .4) * 1.5); L.set(cx + ox, dy - 1 - t, '#5a3a7a'); }
        const tx = cx + Math.round(Math.sin(8 * .4) * 1.5), ty = dy - 9;
        bola(L, tx, ty - 1, 2, '#e8a8d8'); L.set(tx, ty - 3, '#ffffff');
      });
      return;
    }
    capa(g, '#1a0f28', L => {   // ===== LISTO: tronco retorcido + ramas con yemas + hojas + flor grande bioluminiscente =====
      const alto = 16, pts = [];
      for (let t = 0; t < alto; t++) { const ox = Math.round(Math.sin(t * .35) * 2.5); pts.push([cx + ox, dy - 1 - t]); L.set(cx + ox, dy - 1 - t, '#3a2050'); L.set(cx + ox + 1, dy - 1 - t, '#4a2a62'); }
      const [topx, topy] = pts[alto - 1], [midx, midy] = pts[Math.floor(alto / 2)];
      linea(L, midx, midy, midx - 7, midy - 5, '#4a2a62'); linea(L, midx - 7, midy - 5, midx - 9, midy - 3, '#4a2a62'); bola(L, midx - 9, midy - 3, 1, '#ff9ad0');
      linea(L, midx + 1, midy - 2, midx + 8, midy - 6, '#4a2a62'); bola(L, midx + 8, midy - 6, 1, '#ffe45a');
      const [l1x, l1y] = pts[4]; linea(L, l1x, l1y, l1x - 6, l1y - 2, '#3a2050'); bola(L, l1x - 8, l1y - 2, 2, '#8ef0b8'); L.set(l1x - 9, l1y - 3, '#c8ffe0');
      const [l2x, l2y] = pts[7]; linea(L, l2x, l2y, l2x + 7, l2y - 1, '#3a2050'); bola(L, l2x + 9, l2y - 1, 2, '#8ef0b8'); L.set(l2x + 10, l2y - 2, '#c8ffe0');
      const fx = topx, fy = topy - 3;
      bola(L, fx, fy, 6, '#e8a8d8'); bola(L, fx, fy, 4, '#9a5ac0'); bola(L, fx, fy, (fr || 0) < 12 ? 2 : 3, '#eaff8a'); L.set(fx, fy, '#ffffff');
      for (let ang = 0; ang < 360; ang += 60) { const a = ang * Math.PI / 180; L.set(fx + Math.round(Math.cos(a) * 5), fy + Math.round(Math.sin(a) * 5), '#c070b0'); }
    });
  }
  // ANÉMONA CALMA (semilla "raiz"): planta alienígena cristalina — tronco azul con ramas que terminan en cristalitos celestes, y un núcleo facetado en anillos concéntricos que pulsa como un corazón de hielo
  function plantaCalma(g, cx, dy, etapa, fr) {
    if (etapa === 'semilla') { capa(g, '#0a1824', L => { bola(L, cx, dy - 4, 2, '#3aa0d8'); L.set(cx, dy - 5, '#eaffff'); }); return; }
    if (etapa === 'brote') {
      capa(g, '#0a1824', L => {
        for (let t = 0; t < 8; t++) L.set(cx, dy - 1 - t, '#2a5a80');
        const ty = dy - 8; bola(L, cx, ty - 1, 2, '#6ad0ff'); L.set(cx, ty - 3, '#eaffff');
      });
      return;
    }
    capa(g, '#0a1824', L => {   // ===== LISTO: tronco cristalino + ramas con cristalitos + núcleo facetado bioluminiscente =====
      const alto = 14, pts = [];
      for (let t = 0; t < alto; t++) { pts.push([cx, dy - 1 - t]); L.set(cx, dy - 1 - t, '#1a3a56'); L.set(cx + 1, dy - 1 - t, '#234a68'); }
      const [topx, topy] = pts[alto - 1], [midx, midy] = pts[Math.floor(alto / 2)];
      linea(L, midx, midy, midx - 6, midy - 4, '#234a68'); bola(L, midx - 7, midy - 5, 1, '#aef2ff');
      linea(L, midx + 1, midy - 2, midx + 7, midy - 5, '#234a68'); bola(L, midx + 8, midy - 6, 1, '#aef2ff');
      const [l1x, l1y] = pts[3]; linea(L, l1x, l1y, l1x - 6, l1y - 1, '#1a3a56'); bola(L, l1x - 8, l1y - 1, 2, '#bfeaff'); L.set(l1x - 9, l1y - 2, '#eaffff');
      const [l2x, l2y] = pts[6]; linea(L, l2x, l2y, l2x + 6, l2y - 1, '#1a3a56'); bola(L, l2x + 8, l2y - 1, 2, '#bfeaff'); L.set(l2x + 9, l2y - 2, '#eaffff');
      const fx = topx, fy = topy - 2;
      bola(L, fx, fy, 6, '#2a7aa8'); bola(L, fx, fy, 4, '#6ad0ff'); bola(L, fx, fy, (fr || 0) < 12 ? 2 : 3, '#eaffff'); L.set(fx, fy, '#ffffff');
      for (let ang = 0; ang < 360; ang += 60) { const a = ang * Math.PI / 180; L.set(fx + Math.round(Math.cos(a) * 5), fy + Math.round(Math.sin(a) * 5), '#8ae0ff'); }
    });
  }
  // ESPORA DORADA: planta alienígena hongo-joya, toda en tonos de oro/ámbar — racimo de esporas doradas orbitando un núcleo cálido
  function plantaDorada(g, cx, dy, etapa, fr) {
    if (etapa === 'semilla') { capa(g, '#2a1808', L => { L.rect(cx - 1, dy - 4, 2, 4, '#c8882a'); L.set(cx, dy - 5, '#ffe45a'); }); return; }
    if (etapa === 'brote') {
      capa(g, '#2a1808', L => {
        for (let t = 0; t < 9; t++) L.set(cx, dy - 1 - t, '#8a5a1a');
        const ty = dy - 9; bola(L, cx, ty - 1, 2, '#ffd84a'); L.set(cx, ty - 3, '#fff6b0');
      });
      return;
    }
    capa(g, '#2a1808', L => {   // ===== LISTO: tronco + ramas con yemas + racimo de esporas doradas orbitando un núcleo cálido =====
      const alto = 15, pts = [];
      for (let t = 0; t < alto; t++) { pts.push([cx, dy - 1 - t]); L.set(cx, dy - 1 - t, t < 5 ? '#5a3a10' : t < 10 ? '#8a5a1a' : '#c8882a'); if (t > 9) L.set(cx + 1, dy - 1 - t, '#ffd84a'); }
      const [topx, topy] = pts[alto - 1], [midx, midy] = pts[Math.floor(alto / 2)];
      linea(L, midx, midy, midx - 8, midy - 6, '#8a5a1a'); bola(L, midx - 9, midy - 7, 2, '#d89a28');
      linea(L, midx + 1, midy - 2, midx + 7, midy - 7, '#8a5a1a'); bola(L, midx + 8, midy - 8, 2, '#ffe68a');
      const [l1x, l1y] = pts[4]; linea(L, l1x, l1y, l1x - 6, l1y - 2, '#5a3a10'); bola(L, l1x - 8, l1y - 2, 1, '#b8841e');
      const [l2x, l2y] = pts[7]; linea(L, l2x, l2y, l2x + 6, l2y - 1, '#5a3a10'); bola(L, l2x + 8, l2y - 1, 1, '#ffe68a');
      const fx = topx, fy = topy - 4;
      const orbit = [[0, -10, '#ffe68a'], [7, -6, '#d89a28'], [-7, -6, '#ffd84a'], [9, 3, '#b8841e'], [-9, 3, '#ffe68a'], [0, 8, '#d89a28'], [5, -1, '#ffd84a'], [-5, -1, '#b8841e']];
      const off = Math.floor((fr || 0) / 8) % 2;
      orbit.forEach(([dx, dyf, col], i) => { bola(L, fx + dx, fy + dyf, 2, (i + off) % 2 === 0 ? col : mixC(col, -.18)); L.set(fx + dx, fy + dyf, '#fff6d0'); });
      const core = (fr || 0) % 20 < 10 ? 3 : 4;
      bola(L, fx, fy, core, '#fff0b0'); bola(L, fx, fy, Math.max(1, core - 2), '#ffffff');
    });
  }
  // FLOR DE ECO: planta alienígena de ondas sonoras, toda en tonos teal/turquesa — anillos de eco expandiéndose en vez de pétalos
  function plantaEco(g, cx, dy, etapa, fr) {
    if (etapa === 'semilla') { capa(g, '#0a1c20', L => { L.rect(cx - 1, dy - 4, 2, 4, '#5a98a0'); L.set(cx, dy - 5, '#eafcff'); }); return; }
    if (etapa === 'brote') {
      capa(g, '#0a1c20', L => {
        for (let t = 0; t < 9; t++) L.set(cx, dy - 1 - t, '#3a6a70');
        const ty = dy - 9; bola(L, cx, ty - 1, 2, '#7ad0d8'); L.set(cx, ty - 3, '#eafcff');
      });
      return;
    }
    capa(g, '#0a1c20', L => {   // ===== LISTO: tronco + ramas con yemas + anillos de eco concéntricos pulsando =====
      const alto = 15, pts = [];
      for (let t = 0; t < alto; t++) { pts.push([cx, dy - 1 - t]); L.set(cx, dy - 1 - t, t < 5 ? '#2a4a50' : t < 10 ? '#3a6a70' : '#6ab0b8'); if (t > 9) L.set(cx + 1, dy - 1 - t, '#bdeef2'); }
      const [topx, topy] = pts[alto - 1], [midx, midy] = pts[Math.floor(alto / 2)];
      linea(L, midx, midy, midx - 7, midy - 4, '#3a6a70'); bola(L, midx - 8, midy - 5, 1, '#aee8ee');
      linea(L, midx + 1, midy - 2, midx + 8, midy - 5, '#3a6a70'); bola(L, midx + 9, midy - 6, 1, '#4ab8c0');
      const [l1x, l1y] = pts[4]; linea(L, l1x, l1y, l1x - 6, l1y - 2, '#2a4a50'); bola(L, l1x - 8, l1y - 2, 2, '#bdeef2');
      const [l2x, l2y] = pts[7]; linea(L, l2x, l2y, l2x + 6, l2y - 1, '#2a4a50'); bola(L, l2x + 8, l2y - 1, 2, '#4ab8c0');
      const fx = topx, fy = topy - 3;
      const pulso = ((fr || 0) % 24) / 24, ringCols = ['#eafcff', '#9adde4', '#4ab8c0', '#2a7a82'];
      for (let ring = 0; ring < 4; ring++) {
        const rad = 2 + ring * 3 + pulso * 3, col = ringCols[ring % ringCols.length];
        for (let ang = 0; ang < 360; ang += 24) { const a = (ang + ring * 15) * Math.PI / 180; L.set(fx + Math.round(Math.cos(a) * rad), fy + Math.round(Math.sin(a) * rad * .7), col); }
      }
      bola(L, fx, fy, 3, '#eafcff'); bola(L, fx, fy, 2, '#ffffff');
      L.set(fx + 9, fy - 2, '#ff9a7a');   // único toque cálido: el "eco" que acaba de salir
    });
  }
  // SEMILLA ETERNA: la más legendaria — tronco con ramas igual que las demás, pero coronada por un pequeño sol con halo completo, toda en tonos dorados
  function plantaEterna(g, cx, dy, etapa, fr) {
    if (etapa === 'semilla') { capa(g, '#1a1404', L => { bola(L, cx, dy - 4, 2, '#e8c868'); L.set(cx, dy - 4, '#ffffff'); }); return; }
    if (etapa === 'brote') {
      capa(g, '#1a1404', L => {
        for (let t = 0; t < 11; t++) L.set(cx, dy - 1 - t, '#c8a040');
        const ty = dy - 11; bola(L, cx, ty - 2, 3, '#ffe88a'); L.set(cx, ty - 2, '#ffffff');
      });
      return;
    }
    capa(g, '#1a1404', L => {   // ===== LISTO: tronco con ramas + un pequeño sol con halo y gemas orbitando =====
      const alto = 12;
      for (let t = 0; t < alto; t++) L.rect(cx - 1, dy - 1 - t, 3, 1, t < 4 ? '#6a5018' : t < 9 ? '#a8822c' : '#e8c868');
      const topy = dy - alto, midy = dy - 1 - Math.floor(alto / 2);
      linea(L, cx, midy, cx - 9, midy - 5, '#a8822c'); bola(L, cx - 10, midy - 6, 2, '#d89a28');
      linea(L, cx + 1, midy - 2, cx + 10, midy - 6, '#a8822c'); bola(L, cx + 11, midy - 7, 2, '#ffe68a');
      const low1y = dy - 1 - 4; linea(L, cx, low1y, cx - 7, low1y - 2, '#6a5018'); bola(L, cx - 9, low1y - 2, 1, '#ffe88a');
      const low2y = dy - 1 - 7; linea(L, cx, low2y, cx + 7, low2y - 1, '#6a5018'); bola(L, cx + 9, low2y - 1, 1, '#b8841e');
      const fx = cx, fy = topy - 9;
      for (let ang = 0; ang < 360; ang += 15) {
        const a = ang * Math.PI / 180;
        linea(L, fx + Math.cos(a) * 7, fy + Math.sin(a) * 7 * .8, fx + Math.cos(a) * 10, fy + Math.sin(a) * 10 * .8, '#ffd84a');
      }
      const core = (fr || 0) % 20 < 10 ? 5 : 6;
      bola(L, fx, fy, core, '#ffe88a'); bola(L, fx, fy, core - 2, '#fff6d0'); bola(L, fx, fy, Math.max(1, core - 4), '#ffffff');
      const haloR = 14, haloCol = (fr || 0) % 40 < 20 ? '#e8c868' : '#ffe68a';
      for (let ang = 0; ang < 360; ang += 8) {
        const a = ang * Math.PI / 180;
        L.set(fx + Math.round(Math.cos(a) * haloR), fy + Math.round(Math.sin(a) * haloR * .55), haloCol);
        L.set(fx + Math.round(Math.cos(a) * (haloR - 1)), fy + Math.round(Math.sin(a) * (haloR - 1) * .55), mixC(haloCol, .25));
      }
      [0, 90, 180, 270].forEach(ang => {
        const a = (ang + ((fr || 0) % 72) * 1.2) * Math.PI / 180;
        bola(L, fx + Math.round(Math.cos(a) * haloR), fy + Math.round(Math.sin(a) * haloR * .55), 1, '#ffffff');
      });
    });
  }
  function jardinMaceta(g, cx, base, p, colgando, pal, fr) {
    const w = JARDIN_POTW, h = JARDIN_POTH, [body, bodyD, rim] = pal;
    if (colgando) { const r0 = RY - 40, r1 = base - h; for (let y = r0; y < r1; y++) g.set(cx, y, '#6e4422'); g.set(cx + 1, r0 + 4, '#5ccf5a'); g.set(cx - 1, r0 + 8, '#5ccf5a'); }
    // cuerpo redondeado: más ancho a la mitad, angosto arriba y abajo (curva con seno)
    for (let yy = 0; yy < h; yy++) {
      const t = yy / (h - 1), bulge = Math.sin(t * Math.PI), ww = Math.round(w * .54 + w * .3 * bulge + w * .1 * (1 - t)), x0 = cx - Math.round(ww / 2);
      g.rect(x0, base - h + yy, ww, 1, t > .72 ? bodyD : body);
      g.set(x0 + 1, base - h + yy, mixC(body, .35));   // brillito vertical del lado izquierdo
    }
    const rimw = Math.round(w * .62);
    g.rect(cx - rimw / 2 - 1, base - h - 2, rimw + 2, 3, rim); g.rect(cx - rimw / 2 - 1, base - h - 2, rimw + 2, 1, mixC(rim, .4));
    const saucerw = Math.round(w * .68);
    g.rect(cx - saucerw / 2, base, saucerw, 2, mixC(rim, -.2));
    const dw = Math.round(w * .46);
    g.rect(cx - dw / 2, base - h + 1, dw, 2, p.regadoHoy ? '#3a2410' : '#5a3818');
    if (!p.k) return;
    const S0 = SEMILLAS[p.k]; (S0 && S0.planta || plantaEspectro)(g, cx, base - h, p.etapa, fr);
    if (p.etapa !== 'listo' && !p.regadoHoy) gotaAviso(g, cx + Math.round(w * .62), base - h - 15);   // gotota clara: avisa que ya le toca agua de nuevo
  }
  function jardinGrid(W, H, RY, cl, plots, fr, noche) {
    const g = Grid(W, H), HY = RY + 8, nieve = cl === 'nieve', fuerte = cl === 'lluvia' || cl === 'tormenta';
    // ---- cielo de primavera en franjas suaves (reactivo al clima); de noche se deja transparente para que se vea el cielo con la luna ----
    if (!noche) {
      const SKY = nieve ? ['#b8c4d8', '#c8d2e4', '#d8e0ee', '#e6ecf6'] : fuerte ? ['#6c7a90', '#7e8ca4', '#92a0b8', '#a8b4c8'] : ['#bfe3ff', '#cdeeff', '#e6f6ff', '#f6fbe8'];
      for (let i = 0; i < 4; i++) { const y0 = Math.floor(HY * i / 4), y1 = Math.floor(HY * (i + 1) / 4); g.rect(0, y0, W, y1 - y0 + 1, SKY[i]); }
    }
    // ---- pasto base con textura de rayas y una loma lejana para dar profundidad ----
    const GR = nieve ? ['#f4f8ff', '#e2eaf8'] : fuerte ? ['#3a7a44', '#32683c'] : ['#8fd96a', '#6fc458'];
    for (let y = HY; y < H; y++) for (let x = 0; x < W; x++) g.set(x, y, ((y - HY) >> 2) % 2 ? GR[0] : GR[1]);
    const lomaC = mixC(GR[0], -.25);
    for (let x = 0; x < W; x++) { const bump = Math.round(3 * Math.sin(x / 9) + 2 * Math.sin(x / 4 + 1)); g.rect(x, HY - 2 + bump, 1, 4 - bump, lomaC); }
    // ---- arbustos floridos a los lados: que se sienta frondoso, como un patio de verdad ----
    const nramp = nieve ? ['#ffffff', '#e6eeff', '#c0d0ec', '#8aa0c8'] : ['#b2f088', '#5ccf5a', '#2f9a4a', '#1d6a38'];
    let sem = 7; const rnd = () => (sem = (sem * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    const mata = (cx, baseY, rx, ry, flores) => {
      const cy = baseY - ry * .7;
      capa(g, nieve ? '#5a6a90' : '#12432a', L => sombrear(L, union(elipse(cx, cy, rx, rx * .9), elipse(cx - rx * .5, cy + rx * .25, rx * .65, rx * .55), elipse(cx + rx * .5, cy + rx * .25, rx * .65, rx * .55)), cx, cy, rx, rx, nramp));
      g.rect(cx - 1, baseY - 2, 2, 4, '#6a4020');
      if (flores) for (let i = 0; i < 6; i++) florP(g, cx - rx + Math.floor(rnd() * rx * 2), cy - ry * .6 + Math.floor(rnd() * ry), flores[i % flores.length], '#fff2a0', false);
    };
    const FLORES_MATA = fuerte || nieve ? null : ['#ff9ec4', '#ffe566', '#ffffff'];
    mata(9, HY + 16, 10, 13, FLORES_MATA); mata(W - 9, HY + 18, 11, 14, FLORES_MATA);
    // ---- valla de madera baja en el horizonte, como la del patio de la casa ----
    for (let x = 4; x < W - 4; x += 8) { g.rect(x, HY + 3, 2, 8, '#8a5630'); g.rect(x, HY + 3, 2, 1, '#d8a060'); }
    g.rect(4, HY + 5, W - 8, 1, '#a86a3c'); g.rect(4, HY + 8, W - 8, 1, '#a86a3c');
    // ---- flores silvestres salpicadas por el pasto, y un mechón denso de pasto alto pegado al borde inferior ----
    if (!fuerte && !nieve) { const FP = [['#ff9ec4', '#fff2a0'], ['#ffd27a', '#c0582a'], ['#b79cff', '#fff2a0'], ['#ffffff', '#ffd84a']]; for (let i = 0; i < 20; i++) { const x = Math.floor(rnd() * W), y = HY + 14 + Math.floor(rnd() * (H - HY - 26)), c = FP[i % FP.length]; florP(g, x, y, c[0], c[1], false); } }
    const bladeC = fuerte ? ['#2a5634', '#32683c', '#1d4a2a'] : nieve ? ['#e2eaf8', '#d0dcf0', '#c0ceec'] : ['#4fb85c', '#5ccf5a', '#3a9a4a'];
    for (let x = -1; x < W; x += 2) { const h = 3 + Math.floor(rnd() * 4), lean = rnd() > .5 ? 1 : -1; for (let j = 0; j < h; j++) { const xx = x + Math.round(lean * j * .4); g.set(xx, H - 1 - j, bladeC[j % bladeC.length]); } }
    const n = plots.length, cntC = Math.max(0, n - 3);
    if (cntC > 0) {   // pérgola de madera real: postes clavados en el pasto que sostienen la viga, con tirantes en las esquinas
      const xs = []; for (let i = 3; i < n; i++) xs.push(jardinSlot(i, n, W).cx);
      const x0 = Math.min(...xs) - 14, x1 = Math.max(...xs) + 14, beamY = RY - 43, postBase = HY + 14;
      [x0 - 2, x1].forEach(px => { g.rect(px, beamY, 3, postBase - beamY, '#6e4422'); g.rect(px, beamY, 1, postBase - beamY, '#8a5830'); g.rect(px - 2, postBase - 3, 7, 2, '#5a3a1c'); });
      g.rect(x0 - 4, beamY, (x1 - x0) + 8, 3, '#7a5228'); g.rect(x0 - 4, beamY, (x1 - x0) + 8, 1, '#a9743f');
      for (let k = 0; k < 6; k++) { g.set(x0 - 2 + k, beamY + 3 + k, '#5a3a1c'); g.set(x1 + 2 - k, beamY + 3 + k, '#5a3a1c'); }   // tirantes diagonales
    }
    for (let i = 0; i < n; i++) { const s = jardinSlot(i, n, W), p = plots[i] || {}; jardinMaceta(g, s.cx, s.base, p, !s.piso, JARDIN_POTS[i % JARDIN_POTS.length], fr); }
    return g;
  }
  function habMini(id) {
    const g = Grid(48, 32);
    const pared = { estudio: '#5a7ac0', juegos: '#3a2a6e', cocina: '#e8d8a8', entrada: '#c8a878', sala: '#d89870' }[id] || '#8a7ac0';
    g.rect(0, 0, 48, 32, pared); g.rect(0, 22, 48, 10, mixC(pared, .6)); g.rect(0, 21, 48, 1, mixC(pared, .4));
    if (id === 'estudio') {
      g.rect(8, 16, 24, 3, '#a06a34'); g.rect(9, 19, 2, 8, '#7a4a20'); g.rect(29, 19, 2, 8, '#7a4a20');
      g.rect(11, 12, 4, 4, '#ff6a8a'); g.rect(15, 11, 3, 5, '#6ad0ff'); g.rect(18, 13, 3, 3, '#ffd84a');
      g.rect(25, 9, 5, 7, '#2a2a44'); g.rect(26, 10, 3, 4, '#8ce8ff'); g.rect(26, 16, 3, 1, '#2a2a44');
      g.rect(36, 18, 5, 3, '#c04a4a'); g.rect(38, 8, 1, 10, '#6a6a7a'); g.rect(35, 6, 7, 3, '#ffe45a');
      g.rect(5, 4, 8, 6, '#ffe8a8'); g.rect(6, 5, 6, 4, '#8ccfff');
    } else if (id === 'juegos') {
      g.rect(16, 4, 16, 26, '#d03a5a'); g.rect(18, 6, 12, 9, '#101830'); g.rect(19, 7, 10, 7, '#3ae0a0'); g.rect(22, 9, 2, 2, '#fff'); g.rect(26, 11, 2, 2, '#ffd84a');
      g.rect(18, 18, 12, 4, '#7a1a34'); g.rect(20, 19, 2, 2, '#ffd84a'); g.rect(25, 19, 2, 2, '#6ad0ff'); g.rect(28, 19, 1, 2, '#6aff8a');
      g.rect(16, 4, 16, 1, '#ff7a94'); g.rect(6, 6, 2, 2, '#ffd84a'); g.rect(40, 10, 2, 2, '#6ad0ff'); g.rect(10, 14, 2, 2, '#ff6a8a');
    } else if (id === 'cocina') {
      g.rect(6, 4, 14, 26, '#e8f0f4'); g.rect(6, 15, 14, 1, '#8a9aa4'); g.rect(17, 7, 1, 5, '#8a9aa4'); g.rect(17, 18, 1, 6, '#8a9aa4');
      g.rect(24, 17, 20, 13, '#a07a4a'); g.rect(24, 15, 20, 3, '#d8d8e0'); g.rect(30, 8, 8, 6, '#ffffff'); g.rect(31, 9, 6, 4, '#ffd84a');
      g.rect(26, 22, 7, 5, '#7a5a30'); g.rect(35, 22, 7, 5, '#7a5a30');
    } else if (id === 'entrada') {
      g.rect(16, 3, 16, 27, '#7a4a2a'); g.rect(18, 5, 12, 11, '#9a6a3a'); g.rect(18, 18, 12, 10, '#9a6a3a'); g.rect(28, 17, 2, 2, '#ffd84a');
      g.rect(14, 26, 20, 4, '#c04a4a'); g.rect(15, 27, 18, 2, '#e07a7a'); g.rect(4, 8, 6, 8, '#6ad0ff'); g.rect(38, 14, 5, 8, '#6cc070');
    } else {
      g.rect(8, 14, 26, 8, '#6a4aa0'); g.rect(8, 10, 26, 5, '#8a6ac0'); g.rect(36, 6, 8, 12, '#ffe8a8');
    }
    return g;
  }
  function lugarMini(id) {
    const g = Grid(48, 32);
    g.rect(0, 0, 48, 32, '#8ccfff'); g.rect(0, 0, 48, 8, '#6ec0ff');
    disco(g, 38, 7, 4, '#ffe45a');
    for (let x = 0; x < 48; x++) { const h = 15 + Math.round(3 * Math.sin(x / 6)); g.rect(x, h, 1, 32 - h, '#6cc070'); g.rect(x, h + 7, 1, 25, '#52aa58'); }
    g.rect(10, 12, 2, 8, '#6a4020'); capa(g, '#12432a', L => sombrear(L, elipse(11, 9, 6, 6), 11, 9, 6, 6, R.verde));
    for (let y = 20; y < 32; y++) { const hw = 3 + (y - 20) * .5; for (let x = 0; x < 48; x++) if (Math.abs(x + .5 - 30) <= hw) g.set(x, y, '#e0c48c'); }
    [[4, 26, '#ff6a8a'], [40, 24, '#ffd84a'], [16, 28, '#ffffff'], [44, 29, '#b890ff']].forEach(([x, y, c]) => g.set(x, y, c));
    return g;
  }
  function cieloParque(cl, noche) {
    const HY = RY + 12, fuerte = cl === 'lluvia' || cl === 'tormenta';
    const C = cl === 'nieve' ? ['#b8c4d8', '#c8d2e4', '#d8e0ee', '#e6ecf6'] : fuerte ? (cl === 'tormenta' ? ['#4a5468', '#5a6680', '#6c7a96', '#8090aa'] : ['#6c7a90', '#7e8ca4', '#92a0b8', '#a8b4c8']) : cl === 'nublado' ? ['#9aa8bc', '#aab6c8', '#bcc6d6', '#ccd4e0'] : ['#5ab4ff', '#76c4ff', '#9ad4ff', '#bde6ff'];
    for (let i = 0; i < 4; i++) { ctx.fillStyle = C[i]; const y0 = Math.floor(HY * i / 4), y1 = Math.floor(HY * (i + 1) / 4); ctx.fillRect(0, y0, LW, y1 - y0 + 1); }
    if (noche) {
      ctx.fillStyle = 'rgba(8,12,48,.82)'; ctx.fillRect(0, 0, LW, HY + 1);
      if (!fuerte && cl !== 'nublado' && cl !== 'nieve') {
        for (let i = 0; i < 26; i++) { const sx = (i * 41 + 7) % LW, sy = (i * 23 + 5) % (HY - 6); if ((i + (tk >> 3)) % 5) { ctx.fillStyle = '#a9b4ff'; ctx.fillRect(sx, sy, 1, 1); } }
        const lx0 = LW - 24, ly0 = 20, oroP = lunaOroT(), sgP = !oroP && lunaSangreT(), azP = !oroP && !sgP && lunaAzulT();
        if (oroP || sgP) { ctx.fillStyle = oroP ? '#ffd84a' : '#e83a4a'; for (let j = -7; j <= 7; j++) { const w = Math.round(Math.sqrt(49 - j * j)); ctx.fillRect(lx0 - w, ly0 + j, w * 2, 1); } ctx.fillStyle = oroP ? '#ffc02a' : '#8a1226'; ctx.fillRect(lx0 - 3, ly0 - 2, 2, 2); ctx.fillRect(lx0 + 2, ly0 + 2, 3, 2); if ((tk >> 3) % 2) { ctx.fillStyle = oroP ? '#fff6b0' : '#ff8a96'; ctx.fillRect(lx0 - 1, ly0 - 11, 2, 3); ctx.fillRect(lx0 - 1, ly0 + 9, 2, 3); } }
        else if (azP) { ctx.fillStyle = '#7ac0ff'; for (let j = -7; j <= 7; j++) { const w = Math.round(Math.sqrt(49 - j * j)); ctx.fillRect(lx0 - w, ly0 + j, w * 2, 1); } ctx.fillStyle = '#3a78d0'; ctx.fillRect(lx0 - 3, ly0 - 2, 2, 2); ctx.fillRect(lx0 + 2, ly0 + 2, 3, 2); if ((tk >> 3) % 2) { ctx.fillStyle = '#eaf6ff'; ctx.fillRect(lx0 - 1, ly0 - 11, 2, 3); ctx.fillRect(lx0 - 1, ly0 + 9, 2, 3); } }
        else { const lx = lx0, ly = ly0; ctx.fillStyle = '#fff7cc'; for (let j = -7; j <= 7; j++) { const w = Math.round(Math.sqrt(49 - j * j)), w2 = Math.round(Math.sqrt(36 - (j + 2) * (j + 2))); ctx.fillRect(lx - w, ly + j, Math.max(0, w - Math.max(0, w2 - 3)), 1); } }
      }
    }
    if (!noche && (cl === 'sol' || cl === 'arcoiris')) {
      const x = LW - 24, y = 20; ctx.fillStyle = '#fff2a0'; for (let j = -8; j <= 8; j++) { const w = Math.round(Math.sqrt(64 - j * j)); ctx.fillRect(x - w, y + j, w * 2, 1); }
      ctx.fillStyle = '#ffe45a'; for (let j = -6; j <= 6; j++) { const w = Math.round(Math.sqrt(36 - j * j)); ctx.fillRect(x - w, y + j, w * 2, 1); }
      if ((tk >> 3) % 2) { ctx.fillStyle = '#fff2a0'; ctx.fillRect(x - 1, y - 12, 2, 3); ctx.fillRect(x - 1, y + 10, 2, 3); ctx.fillRect(x - 12, y - 1, 3, 2); ctx.fillRect(x + 10, y - 1, 3, 2); }
    }
    if (!noche && cl === 'arcoiris') ['#ff5a5a', '#ffa040', '#ffe45a', '#6adf6a', '#5ab4ff', '#9a6aff'].forEach((col, i) => { ctx.fillStyle = col; const r = 46 - i * 2.4; for (let a = 0; a <= 180; a += 2) ctx.fillRect(Math.round(LW * .36 + Math.cos(a * Math.PI / 180) * r * 1.3), Math.round(HY - 4 - Math.sin(a * Math.PI / 180) * r), 2, 2); });
    const tono = cl === 'nublado' || fuerte ? 1 : 0, N = tono ? 5 : 3, nube = sprite('nubeP' + tono, () => nubeGrid(tono), noche ? .55 : 0);
    for (let i = 0; i < N; i++) ctx.drawImage(nube, Math.round(((tk / 7 + i * (LW + 30) / N) % (LW + 40)) - 34), 8 + (i * 17) % 38);
  }
  function nubeGrid(tono) {
    const g = Grid(30, 11), c = tono ? ['#e4eaf4', '#a8b4c8'] : ['#ffffff', '#d8e4f4'];
    [[9, 6, 8, 4], [18, 5, 9, 5], [24, 7, 6, 3], [14, 8, 11, 3]].forEach(([cx, cy, rx, ry]) => { const f = elipse(cx, cy, rx, ry); for (let y = 0; y < 11; y++) for (let x = 0; x < 30; x++) if (f(x, y)) g.set(x, y, y > cy + 1 ? c[1] : c[0]); });
    return g;
  }
  function parqueFX(cl) {
    // mariposas
    const col = [['#ff8ad8', '#ffe0f4'], ['#ffd84a', '#fff6b0']];
    if (!esNoche() && (cl === 'sol' || cl === 'arcoiris' || cl === 'nublado')) for (let i = 0; i < 2; i++) {
      const x = Math.round(LW / 2 + Math.sin(tk / 17 + i * 2.6) * LW * .36), y = Math.round(SY + 8 + i * 22 + Math.cos(tk / 11 + i) * 14), a = (tk >> 1) % 2;
      ctx.fillStyle = col[i][0]; ctx.fillRect(x - 3, y - (a ? 2 : 0), 3, a ? 3 : 2); ctx.fillRect(x + 1, y - (a ? 2 : 0), 3, a ? 3 : 2); ctx.fillStyle = '#3a2a4a'; ctx.fillRect(x, y, 1, 3);
    }
    if (cl === 'nieve') { ctx.fillStyle = '#ffffff'; for (let i = 0; i < 40; i++) { const x = (i * 29 + Math.round(3 * Math.sin((tk + i * 7) / 9))) % LW, y = (i * 47 + (tk >> 1)) % LH; ctx.fillRect(x, y, 1, 1); if (i % 4 === 0) ctx.fillRect(x + 1, y, 1, 1); } return; }
    if (cl !== 'lluvia' && cl !== 'tormenta') return;
    const N = cl === 'tormenta' ? 70 : 46, v = cl === 'tormenta' ? 5 : 4; ctx.fillStyle = '#d8ecff';
    for (let i = 0; i < N; i++) { const x = (i * 37) % LW, y = (i * 53 + tk * v) % (LH - 3); ctx.fillRect(x, y, 1, 3); }
    if (cl === 'tormenta') {
      if (tk % 100 === 0 && Math.random() < .55) { rayo = 4; setTimeout(truenoSusto, 500 + Math.random() * 600); }
      if (rayo > 0) { ctx.fillStyle = rayo > 2 ? 'rgba(255,255,255,.8)' : 'rgba(255,255,255,.35)'; ctx.fillRect(0, 0, LW, LH); rayo--; }
    }
  }
  function fondoEscena(esc, n, dy) {
    const cl = ((esc === 'sala' && (lunaDorada() || sangreCielo() || lunaAzulT())) || (esc === 'cocina' && (lunaOroT() || lunaSangreT() || lunaAzulT()))) ? (sangreCielo() && ((bl && ['entra', 'lanza', 'habla'].includes(bl.f)) || (!bl && e.sangFase === 1)) ? 'nublado' : 'sol') : clima();
    if (esc === 'sala' || esc === 'cocina') { ctx.drawImage(cieloDe(n, cl), OX, dy); climaFX(cl, n, dy); }
    if (esc === 'sala') { ovCielo(dy); sangreCieloDib(dy); azulVentana(dy); }
    else if (esc === 'cocina') lunasSolo(dy);
    if (esc === 'sala') ctx.drawImage(sprite('cuarto' + LW + 'x' + LH + e.cuarto.pared + e.cuarto.alfombra + (e.cuarto.piso || '') + cuadroClave(), () => cuartoGrid(LW, LH, RY, SY + SH - 11, OX, paleta()), n ? .55 : 0), 0, 0);
    else if (esc === 'juegos') { ctx.drawImage(sprite('juegos' + LW + 'x' + LH + estSty('juegos').k, () => juegosGrid(LW, LH, RY, OX, estSty('juegos')), n ? .55 : 0), 0, 0); arcadeVivo(); trofeosVivo(); }
    else if (esc === 'estudio') estudioFondo(n);
    else if (esc === 'cocina') { ctx.drawImage(sprite('cocina' + LW + 'x' + LH + estSty('cocina').k + (e.cuarto.refri || ''), () => cocinaGrid(LW, LH, RY, OX, estSty('cocina')), n ? .55 : 0), 0, 0); if (!dlg && !modal && !cg && (tk >> 3) % 2) { ctx.fillStyle = '#ffe45a'; for (let j = 0; j < 4; j++) { ctx.fillRect(OX + 12 + j, RY - 20 + j, 8 - j * 2, 1); ctx.fillRect(OX + 100 + j, RY - 38 + j, 8 - j * 2, 1); } } }
    else if (esc === 'bano') { if (ban && !ban.pov && ban.i >= 3) ctx.drawImage(sprite('ducha' + LW + 'x' + LH + estSty('bano').k, () => duchaGrid(LW, LH, RY, OX, estSty('bano')), 0), 0, 0); else { ctx.drawImage(sprite('bano' + LW + 'x' + LH + estSty('bano').k, () => banoGrid(LW, LH, RY, OX, estSty('bano')), n ? .55 : 0), 0, 0); if (!dlg && !modal && !ban && (tk >> 3) % 2) { ctx.fillStyle = '#ffe45a'; for (let j = 0; j < 4; j++) ctx.fillRect(OX + 109 + j, RY - 52 + j, 8 - j * 2, 1); } } }
    else if (esc === 'entrada') {
      ctx.drawImage(sprite('entrada' + LW + 'x' + LH + estSty('entrada').k, () => entradaGrid(LW, LH, RY, OX, estSty('entrada')), n ? .55 : 0), 0, 0);
      if (!dlg && !modal && (tk >> 3) % 2) { ctx.fillStyle = '#ffe45a'; for (let j = 0; j < 4; j++) ctx.fillRect(OX + 25 + j, RY - 49 + j, 8 - j * 2, 1); }
    } else if (esc === 'calle') calleFondo();
    else if (esc === 'jardin') {
      const pn = esNoche(); cieloParque(cl, pn); jardinDia();
      const plots = jardinSync(), hayListo = plots.some(p => p.etapa === 'listo'), fr = hayListo ? tk % 24 : 0;
      const pk = plots.map(p => p.k + '_' + p.etapa + '_' + (p.regadoHoy ? 1 : 0)).join('|') + (hayListo ? '_f' + fr : '') + (pn ? '_n' : '');
      ctx.drawImage(sprite('jardin' + LW + 'x' + LH + cl + '|' + pk, () => jardinGrid(LW, LH, RY, cl, plots, fr, pn), pn ? .55 : 0), 0, 0);
      if (pn) {   // las plantas ya florecidas (listas) son bioluminiscentes: iluminan de noche, las que aún crecen no
        const np = plots.length;
        ctx.save(); ctx.globalCompositeOperation = 'lighter';   // aditivo: devuelve el brillo real de la flor bajo el oscurecido nocturno, no solo un halo encima
        plots.forEach((p, i) => {
          if (!p.k || p.etapa !== 'listo') return;
          const S = SEMILLAS[p.k]; if (!S) return;
          const s = jardinSlot(i, np, LW), cc = col(S.col), fx = s.cx, fy = s.base - JARDIN_POTH - 19;
          ctx.fillStyle = 'rgba(' + cc[0] + ',' + cc[1] + ',' + cc[2] + ',.4)';
          for (let j = -11; j <= 11; j++) { const w = Math.round(12 * Math.sqrt(1 - (j / 11) * (j / 11))); ctx.fillRect(Math.round(fx - w), Math.round(fy + j), w * 2, 1); }
        });
        ctx.restore();
      }
    }
    else {
      const pn = esNoche(); cieloParque(cl, pn);
      ctx.drawImage(sprite('parque' + LW + 'x' + LH + cl, () => parqueGrid(LW, LH, RY, cl), pn ? .55 : 0), 0, 0);
      if (!act || act.tipo !== 'pelota') { const jk = juguetePuesto(), tj = sprite('tj_' + jk, () => ITEMS[jk].grid(), 0); ctx.drawImage(tj, SX + SW + 6, SY + SH - 4 - tj.height); }
    }
  }
  // navegación: flechas laterales, fundido y mapa
  const flechaGrid = dir => { const g = Grid(8, 11); for (let y = 0; y < 11; y++) { const a = y <= 5 ? y : 10 - y; for (let x = 0; x <= a + 1; x++) g.set(dir < 0 ? 7 - x : x, y, '#ffffff'); } g.contour('#232b63'); return g; };
  const HAB_ICO = { estudio: '📖', juegos: '🎮', sala: '🛏️', bano: '🛁', cocina: '🍳', entrada: '🚪', jardin: '🌷' };
  function pintarNav() {
    const bVes = $('b-vestir');
    if (bVes) {
      const fuera = !!(lugar || calle || vistaBloq);
      bVes.classList.toggle('bloq', fuera);
      bVes.setAttribute('aria-disabled', fuera ? 'true' : 'false');
      bVes.title = fuera ? 'Aquí no puedes usar esto' : 'Vestir a Simon';
    }
    const bEd = $('b-editar');
    if (bEd) {
      const fuera = !!(lugar || calle || vistaBloq);
      bEd.classList.toggle('bloq', fuera);
      bEd.setAttribute('aria-disabled', fuera ? 'true' : 'false');
      bEd.title = fuera ? 'Aquí no puedes usar esto' : 'Mover muebles';
    }
    const tag = $('lugar-tag'), tagT = $('lugar-tag-t'), icT = $('ic-lugartag'), l = $('fl-izq'), r = $('fl-der'), idx = habIdxActual();
    tagT.textContent = lugar ? LUGARES.find(x => x.id === lugar).n : HABS[idx].n;
    icT.textContent = lugar ? '' : (HAB_ICO[HABS[idx].id] || '');
    const flecha = (b, d, txt, bloq) => { b.classList.remove('oculto'); b.classList.toggle('bloq', !!bloq); $('tx-' + b.id).textContent = txt || ''; dibIcono($('ic-' + b.id), 'ic_' + b.id, () => flechaGrid(d)); };
    if (lugar) { flecha(l, -1, 'CASA', false); r.classList.add('oculto'); return; }
    if (idx > 0) flecha(l, -1, '', nivel() < HABS[idx - 1].nv); else l.classList.add('oculto');
    if (idx < HABS.length - 1) flecha(r, 1, '', nivel() < HABS[idx + 1].nv); else r.classList.add('oculto');
  }
  function puedeMoverse() {
    if (sifP && sifP.casa) return false;
    if (dlg || ban || (modal && modal !== 'editar') || cambiando) return false;
    if ((cortex.p && !mercPres && !desc) || cortex.dir || mercBusy || bm) { toast('Cortex está de visita'); return false; }
    return true;
  }
  function irA(fn) {
    cambiando = true; const f = $('fundido'); f.classList.add('on');
    setTimeout(() => { fn(); act = null; proxAct = tk + 70; presencia(); if (edit) { edit.sel = null; edit.drag = null; pintarEdicion(); } dibujar(); pintarNav(); lluviaCheck(); f.classList.remove('on'); setTimeout(() => { cambiando = false; evProcesar(); }, 200); }, 200);
  }
  let vistaBloq = null;   // id de la habitación bloqueada que se está mirando (Simon no está ahí; es solo vista "en obra")
  function mostrarHabLetrero(h) { $('hab-prev-nom').textContent = h.n; $('hab-prev-msg').textContent = 'SE DESBLOQUEA EN CARIÑO NV' + h.nv; $('hab-prev').classList.add('on'); }
  function ocultarHabLetrero() { $('hab-prev').classList.remove('on'); }
  function salirVistaBloq() { if (vistaBloq) { vistaBloq = null; ocultarHabLetrero(); } }
  const habIdxActual = () => HABS.findIndex(h => h.id === (vistaBloq || e.hab));
  function obraGrid(W, H, frame) {
    const g = Grid(W, H);
    // ---- velo de polvo sobre toda la habitación ----
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) g.set(x, y, [24, 18, 10, 150]);
    // ---- cinta de precaución (franjas diagonales) arriba y abajo ----
    const cinta = (y0, h) => { for (let x = -h; x < W + h; x++) { const f = Math.floor((x + y0) / 7); g.set(x, y0, f % 2 === 0 ? '#ffd84a' : '#19141f'); for (let j = 1; j < h; j++) g.set(x + j, y0 + j, f % 2 === 0 ? '#ffd84a' : '#19141f'); } };
    cinta(3, 7); cinta(H - 10, 7);
    // ---- torres de andamio metálico con 4 postes y tablones ----
    const px = [8, Math.round(W * .33), Math.round(W * .67), W - 11];
    const topY = 18, botY = H - 16;
    px.forEach(x => { g.rect(x, topY, 3, botY - topY, '#b8bcc8'); g.rect(x, topY, 1, botY - topY, '#e8ecf4'); g.rect(x + 2, topY, 1, botY - topY, '#767a8c'); });
    const bays = [[px[0], px[1]], [px[1], px[2]], [px[2], px[3]]];
    const franjas = [[topY + 4, Math.round((botY - topY) / 2) + topY - 4], [Math.round((botY - topY) / 2) + topY + 4, botY - 6]];
    franjas.forEach(([y0, y1]) => bays.forEach(([xa, xb]) => { linea(g, xa + 2, y0, xb, y1, '#767a8c'); linea(g, xb, y0, xa + 2, y1, '#767a8c'); }));
    // tablones horizontales (plataformas) a dos alturas
    [topY + 2, Math.round((botY - topY) / 2) + topY].forEach(py => { g.rect(px[0] - 2, py, px[3] - px[0] + 7, 4, '#a9702c'); g.rect(px[0] - 2, py, px[3] - px[0] + 7, 1, '#d89a50'); g.rect(px[0] - 2, py + 3, px[3] - px[0] + 7, 1, '#6a4418'); });
    // foco colgante desde el tablón de arriba, oscilando un poco
    { const bx = Math.round(W / 2) + (frame % 20 < 10 ? 0 : 1), by0 = topY + 6;
      g.rect(bx, by0, 1, 7, '#2a2a34'); const glow = (frame >> 2) % 3 === 0;
      g.set(bx - 1, by0 + 7, glow ? '#fff3b0' : '#ffe45a'); g.set(bx, by0 + 7, glow ? '#fff8d0' : '#ffd84a'); g.set(bx + 1, by0 + 7, glow ? '#fff3b0' : '#ffe45a'); g.set(bx, by0 + 8, glow ? '#ffe45a' : '#c89a2a');
    }
    // ---- escalera recargada en la esquina izquierda ----
    { const lx = 12, ly0 = botY, ly1 = botY - 46;
      linea(g, lx, ly0, lx + 10, ly1, '#c88a40'); linea(g, lx + 7, ly0, lx + 17, ly1, '#c88a40');
      for (let s = 1; s < 8; s++) { const t = s / 8, xa = lx + 10 * t, xb = lx + 7 + 10 * t, y = ly0 + (ly1 - ly0) * t; linea(g, xa, y, xb, y, '#8a5a28'); }
    }
    // ---- carretilla con tierra, abajo a la derecha ----
    { const wx = W - 34, wy = botY - 2;
      g.rect(wx + 3, wy - 10, 16, 7, '#d8862a'); g.rect(wx + 3, wy - 10, 16, 1, '#f0a850');
      g.rect(wx, wy - 3, 7, 3, '#6a4418'); g.rect(wx + 19, wy - 3, 7, 3, '#6a4418');
      for (let i = 0; i < 9; i++) g.set(wx + 5 + (i % 5) * 2, wy - 11 - (i % 3), i % 2 ? '#5a3c1e' : '#3a2810');
      const ecx = wx + 1, ecy = wy + 1; for (let yy = -3; yy <= 3; yy++) for (let xx = -3; xx <= 3; xx++) if (xx * xx + yy * yy <= 9) g.set(ecx + xx, ecy + yy, '#2a2a34');
      g.set(ecx - 1, ecy - 1, '#5a5a6c');
    }
    // ---- pila de ladrillos y bote de pintura, abajo a la izquierda ----
    { const bx = 20, by = botY - 1;
      [[0, 0], [5, 0], [10, 0], [2, -4], [7, -4], [0, -8], [5, -8]].forEach(([dx, dy]) => g.rect(bx + dx, by + dy - 3, 5, 4, (dx + dy) % 3 === 0 ? '#b8482e' : '#9e3c26'));
    }
    { const pxx = W / 2 - 24, py = botY - 9;
      g.rect(pxx, py, 9, 9, '#3a5aa8'); g.rect(pxx, py, 9, 1, '#6a8ad8'); g.rect(pxx, py - 3, 9, 3, '#dfe6f4'); g.rect(pxx + 3, py - 5, 3, 2, '#8a92a0');
    }
    // ---- caballete de madera con tabla, centro-derecha abajo ----
    { const sx = W / 2 + 14, sy = botY - 2;
      linea(g, sx - 6, sy, sx - 1, sy - 9, '#8a5a28'); linea(g, sx + 6, sy, sx + 1, sy - 9, '#8a5a28');
      linea(g, sx - 14, sy, sx - 9, sy - 9, '#8a5a28'); linea(g, sx + 14, sy, sx + 9, sy - 9, '#8a5a28');
      g.rect(sx - 16, sy - 11, 32, 3, '#c9975a'); g.rect(sx - 16, sy - 11, 32, 1, '#e8c088');
    }
    // ---- letrero de madera con triángulo de advertencia, arriba ----
    { const tx = Math.round(W / 2 - 9), ty = topY - 14;
      for (let r = 0; r < 14; r++) { const w = Math.round(r * 14 / 13); g.rect(tx + 9 - w, ty + r, w * 2, 1, '#ffd84a'); }
      for (let r = 3; r < 12; r++) { const w = Math.max(1, Math.round((r - 2) * 9 / 9)); g.rect(tx + 9 - w + 1, ty + r, Math.max(1, w * 2 - 2), 1, '#19141f'); }
      g.rect(tx + 8, ty + 5, 2, 5, '#ffd84a'); g.rect(tx + 8, ty + 12, 2, 2, '#ffd84a');
    }
    // ---- motas de polvo flotando ----
    const motas = [[20, 60], [40, 100], [78, 45], [95, 90], [55, 130], [100, 60], [30, 150], [66, 70]];
    motas.forEach(([x, y], i) => { const tw = (frame + i * 5) % 40; if (tw < 26) g.set(x, y - (tw >> 3), tw < 6 || tw > 20 ? '#8a8270' : '#d8cfb0'); });
    return g;
  }
  function dibujarConstruccion() {
    const frame = tk % 40;
    ctx.drawImage(sprite('obra' + LW + 'x' + LH + '_' + frame, () => obraGrid(LW, LH, frame), 0), 0, 0);
  }
  function irHab(i) {
    if (typeof guiaBloq === "function" && guiaBloq("nav")) return;
    if (modal && modal !== 'editar' && !['run', 'mem', 'rt'].includes(modal)) cerrar();
    if (!puedeMoverse()) return;
    const h = HABS[i]; if (!h) return;
    if (nivel() < h.nv) { sfx.no(); irA(() => { vistaBloq = h.id; mostrarHabLetrero(h); }); return; }
    sfx.click(); irA(() => { vistaBloq = null; ocultarHabLetrero(); e.hab = h.id; guardar(); }); if (h.id === 'cocina' && !e.cocVisto) { e.cocVisto = 1; setTimeout(introCocina, 1100); } if (h.id === 'estudio' && !e.estVisto) { e.estVisto = 1; introPend = Date.now() + 60000; setTimeout(introEstudio, 1100); } if (h.id === 'juegos' && !e.arcVisto) { e.arcVisto = 1; setTimeout(() => toast('Toca la máquina arcade para jugar'), 900); } if (h.id === 'jardin' && !e.jardinVisto) { e.jardinVisto = 1; setTimeout(() => toast('Toca una parcela vacía para sembrar una semilla'), 900); }
  }
  function irLugar(id) {
    const l = LUGARES.find(x => x.id === id); if (!l || nivel() < l.nv) return;
    if (e.dormido) { toast('SIMON ESTÁ DURMIENDO'); sfx.no(); return; }
    if (id === 'parque' && nivelAbandono() >= 2) { toast('SIMON ESTÁ MUY DÉBIL...'); sfx.no(); return; }
    cerrar(); cambiando = true;
    setTimeout(() => { cambiando = false; irA(() => { lugar = id; llegada = { t: 0 }; if (typeof navPush === 'function') navPush(); }); }, 60);
  }
  function volverACasa() { if (!puedeMoverse()) return; sfx.click(); irA(() => { lugar = null; llegada = null; if (typeof navPop === 'function') navPop(); }); setTimeout(() => { decir('Sí.', e.traductor ? 'Qué rico el parque. Ahora a casa.' : null, 2800); hablar(); }, 700); }
  $('fl-izq').onclick = () => { if (lugar) volverACasa(); else irHab(habIdxActual() - 1); };
  $('fl-der').onclick = () => irHab(habIdxActual() + 1);
  function renderMapa() {
    $('m-titulo').textContent = 'MAPA';
    return `<div class="centro" style="font-size:8px;line-height:1.9;color:#aab4ff;margin-bottom:10px">¿A dónde vamos hoy?</div><div class="cuadricula">` +
      LUGARES.map(l => `<div class="card"><div class="pv"><canvas data-prev="lg_${l.id}"></canvas></div><div class="cn">${l.n}</div>` + (nivel() >= l.nv ? `<button class="bt ok" data-a="m_ir" data-k="${l.id}">IR</button>` : `<div class="est bloq">CARIÑO NV${l.nv}</div>`) + `</div>`).join('') +
      `</div><div class="centro" style="font-size:7px;line-height:1.9;color:#aab4ff;margin-top:12px">Más lugares pronto.</div>`;
  }


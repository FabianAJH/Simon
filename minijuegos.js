/* ==========================================================================
 * MINIJUEGOS — SIMON: TU AMIGO VIRTUAL
 * ==========================================================================
 * Archivo: minijuegos.js
 * Responsabilidad: Los 5 minijuegos interactivos de Simon:
 *  1. COCINA (Estufa cenital, corte de ingredientes, cocción y emplatado)
 *  2. BAÑO (Limpieza táctil en 5 etapas: piojos, shampoo, enjuagues y jabón)
 *  3. ATRAPA EL KEKE (Minijuego del arcade: atrapar comida y esquivar bombas)
 *  4. BAILA CON SIMON (Minijuego de ritmo con 3 carriles y música sincronizada)
 *  5. CORRE, SIMON (Minijuego de saltos y obstáculos en scroll infinito)
 *  6. MEMORIA CON CORTEX (Juego de parejas de cartas con Cortex)
 * ========================================================================== */

/* ===================== COCINAR: escena vista desde arriba ===================== */
  let ck = null;
  const CK_PASO = { cortar: 'CORTAR', cocinar: 'COCINAR', armar: 'EMPLATAR' };
  const CG_MODO = { ensalada: { lechuga: 'c', jitomate: 'c' }, hotcakes: { harina: 'f', huevo: 'f', leche: 'f' }, tostada: { pan: 'f', queso: 'cf' }, licuado: { naranja: 'c', leche: 'f' }, tacocasero: { tortilla: 'f', carne: 'cf', jitomate: 'c' }, kekecasero: { harina: 'f', huevo: 'f', azucar: 'f', chocolate: 'c' }, kekeperro: { harina: 'f', huevo: 'f', carne: 'cf' } };
  function ckFaltan(r) { return Object.keys(r.ing).filter(k => ingF(k) < r.ing[k]); }
  function ckGasta(r, extra) {   // usa primero los ingredientes más viejos
    Object.keys(r.ing).forEach(k => { const L = ingL(k).slice().sort((a, b) => a - b), n = r.ing[k] + ((extra && extra[k]) || 0); e.ing[k] = L.slice(n); });
  }
  function renderCocinar() {
    $('m-titulo').textContent = 'COCINAR';
    if (!ck) {
      let h = `<div class="th-nota">Elige qué cocinar. Verás la estufa desde arriba: corta, mueve la sartén y no dejes que se queme.</div>`;
      h += RECETAS.map(r => {
        const falt = ckFaltan(r), bloq = nivel() < r.nv, ok = !falt.length && !bloq;
        return `<div class="ck-r ${ok ? '' : 'no'}"><div class="ck-pv"><canvas data-prev="fd_pl_${r.id}"></canvas></div><div class="ck-tx"><b>${r.n}${r.perro ? ' (' + (e.sifK || 0) + ')' : ''}</b><div class="ck-ing">${Object.keys(r.ing).map(k => `<span class="${ingF(k) >= r.ing[k] ? 'ok' : 'x'}"><canvas data-prev="ig_${k}"></canvas>${r.ing[k] > 1 ? 'x' + r.ing[k] : ''}</span>`).join('')}</div></div>` +
          (bloq ? `<div class="est bloq" style="flex:none">NV${r.nv}</div>` : `<button class="bt ${ok ? 'ok' : 'no'}" style="flex:none;padding:10px 8px" data-a="ck_ir" data-k="${r.id}">${ok ? 'COCINAR' : 'FALTAN'}</button>`) + `</div>`;
      }).join('');
      return h + `<button class="bt gran" style="margin-top:10px;padding:12px 0" data-a="rf_abrir">VER EL REFRI</button>`;
    }
    const r = ck.r, q = ck.quemado || ck.tiempo ? 0 : ck.est;
    return `<div class="ck-res"><div class="ck-big"><canvas data-prev="fd_pl_${r.id}"></canvas></div><div class="th-n">${q ? r.n : ck.tiempo ? '¡SE ACABÓ EL TIEMPO!' : '¡SE QUEMÓ!'}</div>` +
      (q ? `<div class="ck-st">${'★'.repeat(q)}<span>${'★'.repeat(3 - q)}</span></div><div class="th-i">${ck.porc > 1 ? '¡SALIÓ TAN BIEN QUE SOBRÓ UN PLATO!<br>' : ''}${r.perro ? 'GUARDADO PARA EL PERRITO' : 'SE GUARDÓ EN ALIMENTAR'} (x${ck.porc})</div>` : (ck.tiempo ? `<div class="th-i">NO SE PERDIÓ NINGÚN INGREDIENTE.<br>INTÉNTALO DE NUEVO MÁS RÁPIDO.</div>` : `<div class="th-i">SE PERDIERON LOS INGREDIENTES.<br>LA PRÓXIMA ESTARÁ MEJOR.</div>`)) +
      `<button class="bt ok gran" style="padding:12px 0" data-a="ck_fin">OTRA VEZ</button></div>`;
  }
  function ckIr(id) {
    const r = RECETAS.find(x => x.id === id); if (!r) return;
    if (ckFaltan(r).length) { toast('Faltan ingredientes: ' + ckFaltan(r).map(k => ING[k].n.toLowerCase()).join(', ')); sfx.no(); return; }
    sfx.click(); ck = null; modal = null; $('modal').classList.remove('on', 'sheet'); $('escena').classList.remove('alto'); cgIni(r);
  }
  function cgTutorial() {
    const r = RECETAS.find(x => x.id === 'tostada'), n = Date.now(); e.ing = e.ing || {};
    ['pan', 'queso'].forEach(k => { const L = ingL(k); while (L.length < 2) L.push(n); e.ing[k] = L; });
    introPend = 0; ck = null; modal = null; $('modal').classList.remove('on', 'sheet'); $('escena').classList.remove('alto'); cgIni(r, true);
  }
// (cocTutFin removido para quitar dialogos de Cortex del tutorial)
  function introCocina() {
    introPend = 0;
    evQuitar('introC');
    if (typeof toast === 'function') toast('Toca la estufa para cocinar');
  }
  function ckClick(a, k) { if (a === 'ck_ir') ckIr(k); else if (a === 'ck_fin') { ck = null; sfx.click(); render(); } }

  /* ---- la escena: tabla de cortar a la izquierda, estufa a la derecha, plato abajo ---- */
  const CGW = 132, CGH = 168;
  const CG_BOARD = { x: 3, y: 36, w: 55, h: 60 }, CG_STOVE = { x: 62, y: 36, w: 67, h: 84 };
  const CG_BURN = [{ x: 80, y: 56, h: 1.35 }, { x: 111, y: 56, h: 1.35 }, { x: 80, y: 98, h: 1.35 }, { x: 111, y: 98, h: .75 }];
  const cgBurnActivo = i => i === 0 || (i === 2 && !!(typeof e !== 'undefined' && e && e.tiene && e.tiene.sarten2));
  const cgBurnActivos = () => (typeof e !== 'undefined' && e && e.tiene && e.tiene.sarten2) ? [CG_BURN[0], CG_BURN[2]] : [CG_BURN[0]];
  const CG_PLATE = { x: 66, y: 146, rx: 34, ry: 15 };
  const CG_SWEET = [.5, .72];
  let introPend = 0; const ipf = () => introPend > Date.now();   // Cortex está por llegar a explicar algo: nada de menús ni toques a objetos
  let cg = null, cgRaf = 0; const cgSprC = {};
  function cgSpr(k) {
    if (cgSprC[k]) return cgSprC[k];
    const g = (IGRID[k] || IGRID.jitomate)(), c = document.createElement('canvas'); c.width = g.w; c.height = g.h;
    const x = c.getContext('2d'), im = x.createImageData(g.w, g.h); im.data.set(g.d); x.putImageData(im, 0, 0); return (cgSprC[k] = c);
  }
  const cgTmp = document.createElement('canvas'); cgTmp.width = 16; cgTmp.height = 16;
  function cgTint(c) { return c < .3 ? null : c < .5 ? `rgba(240,200,90,${(c - .3) * 1.2})` : c < .75 ? `rgba(225,160,50,${.24 + (c - .5) * .6})` : c < 1 ? `rgba(120,60,20,${.4 + (c - .75) * 1.2})` : 'rgba(20,14,12,.88)'; }
  function cgPieza(ctx, p, x, y, esc, c) {   // dibuja un ingrediente (opcionalmente en tajadas y teñido por cocción)
    const s = cgSpr(p.k), t = cgTmp.getContext('2d'); t.globalCompositeOperation = 'source-over'; t.clearRect(0, 0, 16, 16); t.drawImage(s, 0, 0);
    const col = cgTint(c || 0); if (col) { t.globalCompositeOperation = 'source-atop'; t.fillStyle = col; t.fillRect(0, 0, 16, 16); }
    const W = s.width, H = s.height;
    if (p.corte && esc === 1) { const S = [0, 4, 7, 11, W]; for (let i = 0; i < 4; i++) ctx.drawImage(cgTmp, S[i], 0, S[i + 1] - S[i], H, Math.round(x - W / 2 + S[i] + (i - 1.5)), Math.round(y - H / 2), S[i + 1] - S[i], H); }
    else ctx.drawImage(cgTmp, 0, 0, W, H, Math.round(x - W * esc / 2), Math.round(y - H * esc / 2), W * esc, H * esc);
  }
  function cgFlecha(c, x, y) {   // flechita verde: ya está listo para el plato
    const o = Math.round(Math.sin(cg.t * 8) * 1.6), R = (a, b, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(a), Math.round(b + o), w, h); };
    R(x - 4, y - 1, 9, 10, '#0a4a22'); R(x - 2, y, 5, 4, '#3adc6a'); R(x - 3, y + 4, 7, 1, '#3adc6a'); R(x - 2, y + 5, 5, 1, '#3adc6a'); R(x - 1, y + 6, 3, 1, '#3adc6a'); R(x, y + 7, 1, 1, '#3adc6a'); R(x - 2, y, 1, 4, '#9affb4');
  }
  const cgColC = {};
  function cgCol(k) { if (cgColC[k]) return cgColC[k]; const s = cgSpr(k), d = s.getContext('2d').getImageData(Math.floor(s.width / 2), Math.floor(s.height / 2) + 1, 1, 1).data; return (cgColC[k] = 'rgb(' + d[0] + ',' + d[1] + ',' + d[2] + ')'); }
  function cgCortada(c, p, x, y) {   // la pieza en la tabla: se parte en tajadas que se separan con cada corte
    const s = cgSpr(p.k), W = s.width, H = s.height, W2 = W * 2, H2 = H * 2, cuts = p.cuts.slice().sort((a, b) => a - b).map(v => Math.max(-W2 / 2 + 2, Math.min(W2 / 2 - 2, v)));
    const age = p.cutT && p.cutT.length ? cg.t - p.cutT[p.cutT.length - 1] : 9, spread = Math.max(0, 1 - age / .45) * 3.5, sq = age < .14 ? 1 - .14 * (1 - age / .14) : 1, ed = [-W2 / 2, ...cuts, W2 / 2], n = ed.length - 1;
    const jx = age < .1 ? (Math.random() - .5) * 1.4 : 0;
    for (let i = 0; i < n; i++) { const a = ed[i], b = ed[i + 1], sx = Math.max(0, Math.round((a + W2 / 2) / 2)), sw = Math.max(1, Math.min(W - sx, Math.round((b - a) / 2))), off = (i - (n - 1) / 2) * (cuts.length ? .8 + spread : 0); c.drawImage(s, sx, 0, sw, H, Math.round(x + a + off + jx), Math.round(y - H2 / 2 * sq + (1 - sq) * H2 / 2), sw * 2, Math.round(H2 * sq)); }
  }
  function cgIni(r, tut) {
    const mod = CG_MODO[r.id] || {}, piezas = []; let n = 0;
    Object.keys(r.ing).sort((a, b) => tut ? (mod[b] || 'c').length - (mod[a] || 'c').length : 0).forEach(k => { for (let i = 0; i < r.ing[k]; i++) piezas.push(cgNueva(k, mod[k] || 'c', n++)); });
    const veces = e.st.ckN || 0; e.st.ckN = veces + 1; guardar();
    cg = { r, mod, piezas, extra: {}, id: n, pans: e.tiene.sarten2 ? [{ id: 0, x: 96, y: 62, wig: 0, hop: 0 }, { id: 1, x: 96, y: 96, wig: 0, hop: 0 }] : [{ id: 0, x: 96, y: 77, wig: 0, hop: 0 }], ptr: null, drag: null, knife: null, t: 0, ult: performance.now(), msgs: [], part: [], hist: [], flipT: 0, fin: 0, board: null, listoCortar: 0, tut: !!tut, tutI: 2, ayuda: !!tut || veces < 5, volt: 0, limite: tut ? 0 : Math.round((40 + 22 * piezas.length) * (veces < 5 ? 1.3 : 1)), cxT: '', lastTxt: '', lastPanTap: 0 };
    cg.left = cg.limite; $('cg-h').classList.toggle('on', !!cg.limite); $('cg-hb').style.width = '100%'; $('cg-hb').style.background = '#5ac870';
    document.body.classList.add('cocinando'); $('cg').classList.add('on'); $('cg-t').textContent = r.n; cgLayout();
    sfx.click(); cancelAnimationFrame(cgRaf); cgRaf = requestAnimationFrame(cgLoop);
  }

  /* ---- tutorial: solo ayuda visual (sin diálogos de Cortex) ---- */
  function cgCxPon() {}
  function cgCx(t, cb) {}
  function cgTutTxt() {}
  function cgNueva(k, modo, id) { return { id, k, modo, loc: 'cesta', corte: false, cuts: [], cq: [], cook: [0, 0], lado: 0, quemada: false, x: 0, y: 0, salto: 0, ok1: false, ok2: false }; }
  function cgAyuda() { cg.idle = 0; }
  function cgLayout() {
    const cv = $('cgc'), a = $('cg'), w = a.clientWidth;
    const h = a.clientHeight - 44, s = Math.max(1, Math.floor(Math.min(w / CGW, h / CGH) * 4) / 4);
    cv.width = CGW; cv.height = CGH; cv.style.width = Math.floor(CGW * s) + 'px'; cv.style.height = Math.floor(CGH * s) + 'px';
  }
  function cgCerrar() { $('cg-cx').classList.remove('on'); cancelAnimationFrame(cgRaf); cgRaf = 0; cg = null; document.body.classList.remove('cocinando'); $('cg').classList.remove('on'); }
  function cgSalir() { sfx.click(); introPend = 0; cgCerrar(); setTimeout(saludar, 300); }
  function cgMsg(t, x, y, c) { cg.msgs.push({ t, x, y, c: c || '#ffffff', v: 0 }); }
  function cgPart(x, y, c, n, vy) { for (let i = 0; i < n; i++) cg.part.push({ x: x + (Math.random() - .5) * 8, y, vx: (Math.random() - .5) * .3, vy: vy || -.5 - Math.random() * .4, c, v: 0 }); }
  function cgPos(ev) { const r = $('cgc').getBoundingClientRect(); return { x: (ev.clientX - r.left) / r.width * CGW, y: (ev.clientY - r.top) / r.height * CGH }; }
  const cgDist = (a, b, c, d) => Math.hypot(a - c, b - d);
  const cgPanDe = p => cg.pans.find(q => q.id === (p.pn || 0)) || cg.pans[0];
  const cgEnFuego = pn => { let m = 0; CG_BURN.forEach((b, i) => { if (cgBurnActivo(i) && cgDist(pn.x, pn.y, b.x, b.y) <= 9.5) m = b.h; }); return m; };
  function cgSlot(p) {   // posición de las piezas que no están en mano
    if (p.loc === 'cesta') { const L = cg.piezas.filter(q => q.loc === 'cesta'), i = L.indexOf(p), n = Math.max(L.length, 1); return { x: CGW / 2 + (i - (n - 1) / 2) * 20, y: 10 }; }
    if (p.loc === 'sarten') { const pn = cgPanDe(p), L = cg.piezas.filter(q => q.loc === 'sarten' && cgPanDe(q) === pn), i = L.indexOf(p); return { x: pn.x + pn.wig + (L.length > 1 ? (i ? 7 : -7) : 0), y: pn.y - p.salto - pn.hop }; }
    if (p.loc === 'plato') { const L = cg.piezas.filter(q => q.loc === 'plato'), i = L.indexOf(p), n = L.length; return { x: CG_PLATE.x + (i - (n - 1) / 2) * Math.min(16, 56 / Math.max(n, 1)), y: CG_PLATE.y - 1 + (i % 2) * 2 }; }
    if (p.loc === 'tabla') return { x: cg.tx, y: CG_BOARD.y + 30 };
    if (p.loc === 'tablaL') return { x: CG_BOARD.x + CG_BOARD.w / 2, y: CG_BOARD.y + CG_BOARD.h - 12 };
    return { x: p.x, y: p.y };
  }
  function cgListaPlato(p) {
    if (p.quemada) return '¡QUEMADO! TÍRALO';
    if (p.modo.includes('c') && !p.corte) return '¡FALTA CORTAR! 🔪';
    if (p.modo.includes('f') && (p.cook[0] < .25 || p.cook[1] < .25)) return '¡FALTA COCINAR! 🔥';
    return null;
  }
  function cgDown(ev) {
    if (!cg || cg.fin || cg.ptr != null) return; ev.preventDefault();
    const m = cgPos(ev); cg.idle = 0; cg.ptr = ev.pointerId; try { $('cgc').setPointerCapture(ev.pointerId); } catch (_) {}
    const P = cg.piezas;
    // 1) piezas
    let hit = null, bd = 99;
    P.forEach(p => { if (p.loc === 'plato') return; const s = p.loc === 'tabla' ? { x: 0, y: 0 } : cgSlot(p); if (p.loc === 'tabla') return; const d = cgDist(m.x, m.y, s.x, s.y); if (d < (p.loc === 'sarten' ? 7 : 9) && d < bd) { hit = p; bd = d; } });
    if (hit) {
      if (hit.quemada) { cgTirar(hit); cg.ptr = null; return; }
      cg.drag = { p: hit, de: hit.loc, ox: 0, oy: 0, sx: m.x, sy: m.y, mov: false }; hit.loc = 'mano'; hit.x = m.x; hit.y = m.y - 4; cg.hist = []; sfx.click(); return;
    }
    // 2) la sartén (aro o mango)
    for (let i = cg.pans.length - 1; i >= 0; i--) { const pn = cg.pans[i];
      if (cgDist(m.x, m.y, pn.x, pn.y) <= 16 || (m.x > pn.x + 12 && m.x < pn.x + 38 && Math.abs(m.y - pn.y) < 7)) {
        cg.drag = { pan: true, pi: i, ox: pn.x - m.x, oy: pn.y - m.y, sx: m.x, sy: m.y, t0: performance.now(), mov: false };
        cg.hist = [{ x: m.x, y: m.y, t: performance.now() }];
        return;
      }
    }
    // 3) el corte sobre la tabla (permite iniciar el trazo sobre toda el área de corte)
    const tb = cg.piezas.find(p => p.loc === 'tabla' && !p.corte);
    if (tb && m.x >= CG_BOARD.x - 4 && m.x <= CG_BOARD.x + CG_BOARD.w + 6 && m.y >= CG_BOARD.y - 4 && m.y <= CG_BOARD.y + CG_BOARD.h + 6) {
      cg.knife = { x0: m.x, y0: m.y, x: m.x, y: m.y, t0: performance.now(), tr: [[m.x, m.y]] };
      return;
    }
    cg.ptr = null;
  }
  function cgMove(ev) {
    if (!cg || ev.pointerId !== cg.ptr) return; const m = cgPos(ev);
    if (cg.knife) {
      cg.knife.x = m.x; cg.knife.y = m.y; cg.knife.tr.push([m.x, m.y]);
      if (cg.knife.tr.length > 24) cg.knife.tr.shift();
      return;
    }
    const d = cg.drag; if (!d) return;
    if (d.pan) {
      const pn = cg.pans[d.pi];
      pn.x = Math.max(78, Math.min(114, m.x + d.ox));
      pn.y = Math.max(54, Math.min(102, m.y + d.oy));
      if (Math.hypot(m.x - d.sx, m.y - d.sy) > 3) d.mov = true;
      const h = cg.hist, now = performance.now();
      h.push({ x: m.x, y: m.y, t: now });
      while (h.length && now - h[0].t > 700) h.shift();
      // sacudida / agite: 2+ cambios de dirección en X o Y, o vaivén rápido
      let revX = 0, dirX = 0, refX = h.length ? h[0].x : 0;
      let revY = 0, dirY = 0, refY = h.length ? h[0].y : 0;
      for (let i = 1; i < h.length; i++) {
        const dx = h[i].x - refX;
        if (Math.abs(dx) >= 2.5) { const nd = dx > 0 ? 1 : -1; if (dirX && nd !== dirX) revX++; dirX = nd; refX = h[i].x; }
        const dy = h[i].y - refY;
        if (Math.abs(dy) >= 2.5) { const nd = dy > 0 ? 1 : -1; if (dirY && nd !== dirY) revY++; dirY = nd; refY = h[i].y; }
      }
      const distStart = Math.hypot(m.x - (h.length ? h[0].x : m.x), m.y - (h.length ? h[0].y : m.y));
      const flick = h.length >= 3 && distStart > 10 && (now - h[0].t < 350);
      if ((revX >= 2 || revY >= 2 || (revX >= 1 && revY >= 1) || (flick && (revX >= 1 || revY >= 1 || distStart > 14))) && now - cg.flipT > 600) {
        cgVoltear(pn);
        cg.hist = [];
        cg.flipT = now;
      }
      return;
    }
    const p = d.p; p.x = m.x; p.y = m.y - 4; if (Math.hypot(m.x - d.sx, m.y - d.sy) > 2) d.mov = true;
  }
  function cgUp(ev) {
    if (!cg || ev.pointerId !== cg.ptr) return; const m = cgPos(ev); cg.ptr = null; cg.idle = 0;
    if (cg.knife) { const k = cg.knife; cg.knife = null; cgCorte(k); return; }
    const d = cg.drag; cg.drag = null; if (!d) return;
    if (d.pan) {
      const pn = cg.pans[d.pi];
      // 1. Snap magnético a la parrilla activa más cercana al soltar (a distancia <= 15px)
      let bestB = null, minD = 99;
      cgBurnActivos().forEach(b => {
        const dist = cgDist(pn.x, pn.y, b.x, b.y);
        if (dist <= 15 && dist < minD) { minD = dist; bestB = b; }
      });
      if (bestB) {
        pn.x = bestB.x; pn.y = bestB.y;
        seq([660, 880], .025, 'sine', .05);
        cgPart(pn.x, pn.y, '#ff9a4a', 4, -.4);
      }
      // 2. Alternativa accesible: toque o doble toque rápido para voltear si toca agitar
      const ahora = performance.now();
      const distMov = Math.hypot(m.x - (d.sx || m.x), m.y - (d.sy || m.y));
      const sug = cgSug();
      if (sug && sug.t === 'agitar' && sug.pi === pn.id) {
        if (distMov < 6 && (ahora - (cg.lastPanTap || 0) < 450 || ahora - d.t0 < 220)) {
          cgVoltear(pn);
          cg.hist = [];
          cg.flipT = ahora;
        }
      }
      cg.lastPanTap = ahora;
      return;
    }
    const p = d.p; let err = null;
    let panD = null, pdm = 99; cg.pans.forEach(q => { const d2 = cgDist(m.x, m.y - 4, q.x, q.y); if (d2 <= 17 && d2 < pdm) { pdm = d2; panD = q; } }); const enSarten = !!panD, enTabla = m.x >= CG_BOARD.x && m.x <= CG_BOARD.x + CG_BOARD.w && m.y >= CG_BOARD.y && m.y <= CG_BOARD.y + CG_BOARD.h;
    const enPlato = ((m.x - CG_PLATE.x) / (CG_PLATE.rx + 4)) ** 2 + ((m.y - CG_PLATE.y) / (CG_PLATE.ry + 6)) ** 2 <= 1;
    if (enPlato) { err = cgListaPlato(p); if (!err) { p.loc = 'plato'; sfx.click(); seq([660, 880], .05, 'triangle', .06); cgPart(p.x, p.y, '#ffe45a', 3, -.4); cgCheck(); cgAyuda(); return; } }
    else if (enSarten) {
      if (!p.modo.includes('f')) err = '¡NO VA A LA SARTÉN!';
      else if (p.modo.includes('c') && !p.corte) err = '¡CÓRTALO PRIMERO! 🔪';
      else if (p.quemada) err = '¡QUEMADO! TÍRALO';
      else if (cg.piezas.filter(q => q.loc === 'sarten' && cgPanDe(q) === panD).length >= 2 && !(d.de === 'sarten' && cgPanDe(p) === panD)) err = 'SARTÉN LLENA';
      else { p.loc = 'sarten'; p.pn = panD.id; sfx.click(); cgAyuda(); return; }
    } else if (enTabla) {
      const otra = cg.piezas.find(q => q.loc === 'tabla' || q.loc === 'tablaL');
      if (d.de === 'sarten') err = 'YA EN COCCIÓN';
      else if (!p.modo.includes('c')) err = '¡NO SE CORTA! AL FUEGO 🔥';
      else if (p.corte && d.de !== 'tabla' && d.de !== 'tablaL') err = 'YA ESTÁ CORTADO';
      else if (otra && otra !== p) err = 'TABLA OCUPADA';
      else { cgATabla(p); sfx.click(); cgAyuda(); return; }
    }
    if (err) { cgMsg(err, Math.max(24, Math.min(CGW - 24, m.x)), m.y - 8, '#ffb0b8'); sfx.no(); }
    // vuelve a donde estaba
    p.loc = d.de === 'mano' ? 'cesta' : d.de; cgAyuda();
  }
  function cgATabla(p) { if (p.corte) { p.loc = 'tablaL'; return; } p.loc = 'tabla'; p.cuts = []; p.cq = []; p.fase = Math.random() * 6; cg.tx = CG_BOARD.x + CG_BOARD.w / 2; }
  const CG_GUIA = [-8, 0, 8];
  function cgCorte(k) {
    const p = cg.piezas.find(q => q.loc === 'tabla' && !q.corte); if (!p) return;
    const cy = CG_BOARD.y + 30;
    const i = p.cuts.length, obj = CG_GUIA[Math.min(2, i)];
    const targetX = cg.tx + obj;

    // 1) Buscamos el punto de corte real en el trazo cruzando la línea horizontal central del alimento (cy)
    let xm = null, minDiff = 999;
    if (k.tr && k.tr.length >= 2) {
      for (let j = 0; j < k.tr.length - 1; j++) {
        const p1 = k.tr[j], p2 = k.tr[j + 1];
        const yMin = Math.min(p1[1], p2[1]), yMax = Math.max(p1[1], p2[1]);
        if (yMin <= cy + 3 && yMax >= cy - 3) {
          const dy = p2[1] - p1[1];
          const t = Math.abs(dy) > 0.001 ? Math.max(0, Math.min(1, (cy - p1[1]) / dy)) : 0.5;
          const crossX = p1[0] + (p2[0] - p1[0]) * t;
          const diff = Math.abs(crossX - targetX);
          if (diff < minDiff) { minDiff = diff; xm = crossX; }
        }
      }
    }
    if (xm == null) xm = (k.x0 + k.x) / 2;

    // 2) Verificamos que haya sido un trazo vertical con suficiente recorrido sobre el alimento
    const allY = (k.tr && k.tr.length) ? k.tr.map(pt => pt[1]) : [k.y0, k.y];
    const topY = Math.min(...allY), botY = Math.max(...allY);
    const recorridoY = botY - topY;

    if (recorridoY < 13 || topY > cy - 2 || botY < cy + 2) {
      cgMsg('X', k.x, k.y, '#ffb0b8'); sfx.no(); return;
    }

    const rel = xm - cg.tx, err = Math.abs(rel - obj);
    if (err > 6.5) {
      cgMsg('TORCIDO', xm, cy - 20, '#ff9aa4');
      sfx.no(); return;
    }

    const q = err <= 2.2 ? 1 : err <= 4.2 ? .7 : .35;
    p.cuts.push(rel); p.cq.push(q); (p.cutT = p.cutT || []).push(cg.t); cg.chop = { x: xm, t: cg.t };
    { const col = cgCol(p.k); for (let j = 0; j < 9; j++) cg.part.push({ x: xm + (Math.random() - .5) * 4, y: cy - 2, vx: (Math.random() - .5) * 1.6, vy: -.4 - Math.random() * .9, g: .07, c: j % 3 ? col : '#ffffff', v: 0 }); }
    seq([220, 110], .025, 'square', .08);
    cgMsg(q === 1 ? '¡PERFECTO!' : q > .5 ? '¡BIEN!' : 'TORCIDO', xm, cy - 20, q === 1 ? '#8aff9a' : q > .5 ? '#ffe45a' : '#ff9aa4');
    seq(q === 1 ? [988, 1319] : q > .5 ? [784, 988] : [300], .04, 'square', .06); cgPart(xm, cy, '#ffffff', 3, -.2);
    if (p.cuts.length >= 3) { p.corte = true; p.loc = 'tablaL'; cgAyuda(); }
  }
  function cgVoltear(pn) {
    const L = cg.piezas.filter(q => q.loc === 'sarten' && cgPanDe(q) === pn); if (!L.length) return;
    cg.volt++; L.forEach(p => { p.lado ^= 1; p.salto = 7; p.ok1 = false; }); sfx.click(); seq([520, 780, 1040], .035, 'triangle', .05); 
  }
  function cgTirar(p) {
    cg.piezas.splice(cg.piezas.indexOf(p), 1); cgPart(p.x || cgPanDe(p).x, cgPanDe(p).y, '#555', 5, -.3);
    const sp = ingF(p.k) - cg.r.ing[p.k] - (cg.extra[p.k] || 0);
    if (sp > 0) { cg.extra[p.k] = (cg.extra[p.k] || 0) + 1; const n = cgNueva(p.k, p.modo, cg.id++); cg.piezas.push(n); sfx.click(); cgAyuda(); }
    else { sfx.no(); cg.fin = 1; setTimeout(() => cgFin(true), 700); }
  }
  function cgCheck() { if (cg.piezas.every(p => p.loc === 'plato')) { cg.fin = 1; setTimeout(() => cgFin(false), cg.tut ? 700 : 800); } }
  function cgFin(quemado, tiempo) {
    if (!cg) return; const r = cg.r, extra = cg.extra, P = cg.piezas; let est = 1, porc = 1;
    if (tiempo) { sfx.no(); seq([300, 220, 160], .12, 'sawtooth', .05); const rr = cg.r; cgCerrar(); ck = { r: rr, fase: 'fin', tiempo: true }; abrir('cocinar'); return; }
    if (cg.tut && !quemado) e.cocTut = 1;
    if (!quemado) {
      const qs = P.map(p => { const a = []; if (p.modo.includes('c')) a.push(p.cq.reduce((s, v) => s + v, 0) / Math.max(1, p.cq.length)); if (p.modo.includes('f')) a.push((1 - Math.min(1, Math.abs(p.cook[0] - .6) / .45) + 1 - Math.min(1, Math.abs(p.cook[1] - .6) / .45)) / 2); return a.reduce((s, v) => s + v, 0) / Math.max(1, a.length); });
      const avg = qs.reduce((s, v) => s + v, 0) / Math.max(1, qs.length); est = avg >= .8 ? 3 : avg >= .55 ? 2 : 1; porc = est === 3 ? 2 : 1;
    }
    ckGasta(r, extra);
    if (quemado) { sfx.no(); seq([220, 165, 110], .12, 'sawtooth', .05); }
    else if (r.perro) { e.sifK = Math.min(99, (e.sifK || 0) + porc); e.st.cocinados = (e.st.cocinados || 0) + 1; ganar(1, 2 + est); sfx.logro(); estrellas(4 + est * 2); }
    else { const id = 'pl_' + r.id; e.comida[id] = Math.min(99, (e.comida[id] || 0) + porc); e.st.cocinados = (e.st.cocinados || 0) + 1; ganar(1, 2 + est); sfx.logro(); estrellas(4 + est * 2); }
    if (cg.tut && !quemado) { toast('¡Tostada lista! Se guardó en ALIMENTAR'); }
    introPend = 0; cgCerrar(); ck = { r, fase: 'fin', est, porc, quemado: !!quemado }; pintar(); guardar(); abrir('cocinar');
  }
  function cgUpdate(dt) {
    cg.t += dt; cg.idle = (cg.idle || 0) + dt; { const sg = cg.ayuda && !cg.drag && !cg.knife && cgSug(); cg.pans.forEach(pn => { const ag = sg && sg.t === 'agitar' && sg.pi === pn.id; pn.wig = ag ? Math.sin(cg.t * 15) * 3 : 0; pn.hop = ag ? Math.abs(Math.sin(cg.t * 7.5)) * 5 : 0; }); }
    // pieza en la tabla: se desliza de lado a lado para que cortar cueste
    const tb = cg.piezas.find(p => p.loc === 'tabla' && !p.corte);
    if (tb) { const sp = 1.7 + .35 * Math.min(4, cg.piezas.filter(q => q.corte || q.loc === 'plato').length); tb.fase += dt * sp; cg.tx = CG_BOARD.x + CG_BOARD.w / 2 + Math.sin(tb.fase) * 11; }
    if (cg.limite && !cg.fin) { const ant = Math.ceil(cg.left); cg.left -= dt; const f = Math.max(0, cg.left / cg.limite); $('cg-hb').style.width = (f * 100) + '%'; $('cg-hb').style.background = f > .5 ? '#5ac870' : f > .25 ? '#ffd84a' : '#ff5a4a'; if (cg.left <= 10 && Math.ceil(cg.left) !== ant && cg.left > 0) seq([880], .04, 'square', .04); if (cg.left <= 0) { cg.fin = 1; cgFin(false, true); return; } }
    // calor
    cg.piezas.forEach(p => {
      if (p.salto > 0) p.salto = Math.max(0, p.salto - dt * 26);
      if (p.loc !== 'sarten' || p.quemada) return; const mult = cgEnFuego(cgPanDe(p));
      if (mult) { const c0 = p.cook[p.lado]; p.cook[p.lado] += dt / 12.5 * mult * (cg.tut ? .6 : 1); const c = p.cook[p.lado];
        if (c0 < .5 && c >= .5) { sfx.click(); seq([880, 1175], .04, 'sine', .05); cgPart(cgSlot(p).x, cgSlot(p).y - 4, '#8aff9a', 4, -.5); }
        if (c0 < .86 && c >= .86) { seq([440, 440], .07, 'square', .06);  }
        if (c > .8 && Math.random() < dt * 6) cgPart(cgSlot(p).x, cgSlot(p).y - 4, '#aaa', 1);
        if (c >= 1) { p.quemada = true; seq([196, 147], .12, 'sawtooth', .06); cgAyuda(); } }
    });
    cg.pans.forEach(pn => { if (cgEnFuego(pn) && Math.random() < dt * 5 && cg.piezas.some(p => p.loc === 'sarten' && cgPanDe(p) === pn)) cgPart(pn.x, pn.y - 6, '#fff', 1, -.35); });
    cg.msgs.forEach(m => m.v += dt); cg.msgs = cg.msgs.filter(m => m.v < 1.3);
    cg.part.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += (p.g || 0); p.v += dt; }); cg.part = cg.part.filter(p => p.v < 1);
  }
  function cgLoop(now) {
    if (!cg) return; const dt = Math.min(.05, (now - cg.ult) / 1000); cg.ult = now; cgUpdate(dt); if (cg) cgDibuja($('cgc').getContext('2d')); cgRaf = requestAnimationFrame(cgLoop);
  }
  function cgSug() {
    const P = cg.piezas, en = P.filter(p => p.loc === 'sarten'), PN = cg.pans, n = q => P.filter(z => z.loc === 'sarten' && cgPanDe(z) === q).length;
    let p = P.find(q => q.quemada); if (p) return { t: 'tirar', p };
    p = P.find(q => q.loc === 'tabla' && !q.corte); if (p) return { t: 'corte', p };
    p = en.find(q => !q.quemada && q.cook[0] >= .45 && q.cook[1] >= .45); if (p) return { t: 'mover', p, a: 'plato' };
    for (const pn of PN) if (en.some(q => cgPanDe(q) === pn && q.cook[q.lado] >= .5 && q.cook[1 - q.lado] < .3)) return { t: 'agitar', pi: pn.id };
    for (const pn of PN) if (n(pn) && !cgEnFuego(pn)) {
      const activos = cgBurnActivos();
      const ocupados = PN.filter(q => q !== pn && cgEnFuego(q)).map(q => activos.find(b => cgDist(q.x, q.y, b.x, b.y) <= 9.5));
      const libres = activos.filter(b => !ocupados.includes(b));
      let b = libres[0] || activos[0];
      libres.forEach(q => { if (cgDist(pn.x, pn.y, q.x, q.y) < cgDist(pn.x, pn.y, b.x, b.y)) b = q; });
      return { t: 'fuego', b, pi: pn.id };
    }
    const libre = PN.filter(q => n(q) < 2).sort((x, y) => (!!cgEnFuego(y) - !!cgEnFuego(x)) || n(y) - n(x))[0];
    p = P.find(q => q.loc === 'tablaL' && q.modo.includes('f')); if (p && libre) return { t: 'mover', p, a: 'sarten', pi: libre.id };
    p = P.find(q => q.loc === 'tablaL' && !q.modo.includes('f')); if (p) return { t: 'mover', p, a: 'plato' };
    p = P.find(q => q.loc === 'cesta'); if (!p) return null;
    if (p.modo.includes('c') && !p.corte) return P.some(q => q.loc === 'tablaL') ? null : { t: 'mover', p, a: 'tabla' };
    if (p.modo.includes('f')) return libre ? { t: 'mover', p, a: 'sarten', pi: libre.id } : null;
    return { t: 'mover', p, a: 'plato' };
  }
  function cgDibuja(c) {
    const R = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
    const circ = (x, y, r, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); };
    c.imageSmoothingEnabled = false;
    // encimera de azulejo visto desde arriba
    for (let y = 0; y < CGH; y += 8) for (let x = 0; x < CGW; x += 8) R(x, y, 8, 8, ((x + y) >> 3) % 2 ? '#d9d2c0' : '#e2dccb');
    // cesta de ingredientes
    R(2, 2, CGW - 4, 32, '#8a5a30'); R(3, 3, CGW - 6, 30, '#c89458'); for (let x = 4; x < CGW - 4; x += 4) R(x, 3, 1, 30, '#b78248'); R(3, 3, CGW - 6, 1, '#e0b078'); R(2, 34, CGW - 4, 1, '#5a3a1a');
    // tabla de cortar
    const B = CG_BOARD; R(B.x - 1, B.y - 1, B.w + 2, B.h + 2, '#5a3a1a'); R(B.x, B.y, B.w, B.h, '#d9a566'); R(B.x, B.y, B.w, 1, '#efc088'); for (let y = B.y + 4; y < B.y + B.h; y += 6) R(B.x + 2, y, B.w - 4, 1, '#c98f50');
    R(B.x + 2, B.y + B.h - 8, 6, 2, '#a8723a'); R(B.x + B.w / 2 - 5, B.y + B.h + 1, 10, 3, '#8a5a30'); c.fillStyle = '#c89458'; circ(B.x + B.w / 2, B.y + B.h + 2, 2, '#8a5a30');
    // estufa
    const S = CG_STOVE; R(S.x - 1, S.y - 1, S.w + 2, S.h + 2, '#3a424c'); R(S.x, S.y, S.w, S.h, '#aab4be'); R(S.x, S.y, S.w, 1, '#e0e8ee'); R(S.x + 3, S.y + 3, S.w - 6, S.h - 6, '#23252d'); R(S.x + 3, S.y + 3, S.w - 6, 1, '#3a3d48');
    const fl = cg ? Math.sin(cg.t * 9) : 0;
    CG_BURN.forEach((b, idx) => {
      const enc = cgBurnActivo(idx);
      circ(b.x, b.y, 11, '#14141a');
      if (enc) {
        // Parrilla encendida (con fuego y chispas activas)
        circ(b.x, b.y, 9, b.h > 1 ? '#7a2a22' : '#6a4a22');
        circ(b.x, b.y, 6, '#23252d');
        c.strokeStyle = b.h > 1 ? '#ff6a40' : '#ffb040'; c.lineWidth = 1;
        c.beginPath(); c.arc(b.x, b.y, 8, 0, 7); c.stroke();
        circ(b.x, b.y, 2, '#3a3d48');
        const n = b.h > 1 ? 12 : 8, bajo = cg.pans.some(q => cgDist(q.x, q.y, b.x, b.y) <= 9.5);
        for (let i = 0; i < n; i++) {
          const a = i / n * 6.283 + cg.t * .6, h = (bajo ? 3.2 : 1.6) * (b.h > 1 ? 1.2 : .8) + Math.sin(cg.t * 11 + i * 2) * .8;
          R(b.x + Math.cos(a) * 9 - 1, b.y + Math.sin(a) * 9 - 1, 2, 2, i % 2 ? '#ffd84a' : '#ff7a2a');
          if (bajo) { circ(b.x + Math.cos(a) * (9 + h * .3), b.y + Math.sin(a) * (9 + h * .3), .9, '#fff2a0'); }
        }
      } else {
        // Parrilla apagada (rejilla de hierro fría sin fuego)
        circ(b.x, b.y, 9, '#262832');
        circ(b.x, b.y, 6, '#181a22');
        c.strokeStyle = '#3a3e4c'; c.lineWidth = 1;
        c.beginPath(); c.arc(b.x, b.y, 8, 0, 7); c.stroke();
        circ(b.x, b.y, 2.5, '#2a2d38');
        R(b.x - 7, b.y, 14, 1, '#323642');
        R(b.x, b.y - 7, 1, 14, '#323642');
      }
    });
    [0, 1, 2, 3].forEach(i => {
      const act = cgBurnActivo(i);
      circ(S.x + 11 + i * 15, S.y + S.h - 1, 2.5, act ? '#5a6270' : '#353a42');
      R(S.x + 11 + i * 15, S.y + S.h - 4, 1, 2, act ? '#ff9a4a' : '#7a828e');
    });
    // plato
    const Pl = CG_PLATE; c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(Pl.x + 2, Pl.y + 3, Pl.rx, Pl.ry, 0, 0, 7); c.fill();
    c.fillStyle = '#c8c4bc'; c.beginPath(); c.ellipse(Pl.x, Pl.y, Pl.rx, Pl.ry, 0, 0, 7); c.fill(); c.fillStyle = '#f6f4f0'; c.beginPath(); c.ellipse(Pl.x, Pl.y - .5, Pl.rx - 1, Pl.ry - 1, 0, 0, 7); c.fill(); c.fillStyle = '#e4e0d8'; c.beginPath(); c.ellipse(Pl.x, Pl.y, Pl.rx - 7, Pl.ry - 4, 0, 0, 7); c.fill();
    // pieza en la tabla (a doble tamaño) con guías de corte
    const tb = cg.piezas.find(p => p.loc === 'tabla' && !p.corte), cy = B.y + 30;
    if (tb) {
      const sp = cgSpr(tb.k), w = sp.width * 2, h = sp.height * 2;
      c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(cg.tx, cy + h / 2 - 1, w / 2 - 1, 3, 0, 0, 7); c.fill();
      cgCortada(c, tb, cg.tx, cy);
      const i = tb.cuts.length;
      CG_GUIA.forEach((g, j) => { if (j < i) return; for (let y = cy - h / 2 - 5; y < cy + h / 2 + 5; y += 3) R(cg.tx + g, y, 1, 2, j === i ? '#ffffff' : 'rgba(255,255,255,.3)'); });
      R(cg.tx + CG_GUIA[Math.min(i, 2)] - 1, cy - h / 2 - 8, 3, 2, '#ffffff');
    }
    if (cg.chop && cg.t - cg.chop.t < .34) { const a = cg.t - cg.chop.t, kx = Math.round(cg.chop.x + (cg.chop.dx || 0)), u = a < .09 ? a / .09 : a < .16 ? 1 : 1 - (a - .16) / .18, ky = Math.round(cy - 30 + u * 40);
      if (a < .1) R(kx, cy - 17, 1, 34, '#ffffff');
      R(kx - 1, ky - 14, 3, 6, '#5a3a1a'); R(kx - 1, ky - 8, 3, 14, '#e8eef4'); R(kx - 1, ky - 8, 1, 14, '#ffffff'); R(kx + 1, ky + 6, 1, 1, '#9aa4b0'); }
    const tl = cg.piezas.find(p => p.loc === 'tablaL'); if (tl) { const s = cgSlot(tl); cgPieza(c, tl, s.x, s.y, 1, 0); if (!tl.modo.includes('f')) cgFlecha(c, s.x, s.y - 14); }
    // sartenes
    cg.pans.forEach(pn => { const enc = cgEnFuego(pn), px = pn.x + pn.wig;
      R(px + 13, pn.y - 3, 25, 6, '#14141a'); R(px + 14, pn.y - 2, 23, 4, '#e8503a'); R(px + 14, pn.y - 2, 23, 1, '#ff9a7a'); R(px + 14, pn.y + 1, 23, 1, '#a82a1a');
      circ(px + 1, pn.y + 3, 16, 'rgba(0,0,0,.35)'); circ(px, pn.y, 16, '#14141a'); circ(px, pn.y, 14.5, '#c8d2dc'); circ(px, pn.y, 12, '#8a98a8'); circ(px, pn.y, 10.5, '#4a5664');
      c.strokeStyle = '#ffffff'; c.lineWidth = 1; c.beginPath(); c.arc(px, pn.y, 13.5, 3.5, 4.8); c.stroke();
      if (enc) { c.strokeStyle = 'rgba(255,120,60,.7)'; c.beginPath(); c.arc(px, pn.y, 17.5, 0, 7); c.stroke(); } });
    let pn = cg.pans[0];
    // piezas
    cg.piezas.forEach(p => {
      if (p.loc === 'tabla' || p.loc === 'tablaL') return; const s = p.loc === 'mano' ? { x: p.x, y: p.y } : cgSlot(p);
      const enSar = p.loc === 'sarten', top = enSar ? p.cook[1 - p.lado] : (p.cook[0] + p.cook[1]) / 2;
      if (p.loc === 'mano') { c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(s.x + 2, s.y + 8, 6, 2, 0, 0, 7); c.fill(); }
      cgPieza(c, p, s.x, s.y, 1, enSar || p.loc === 'plato' || p.loc === 'mano' ? top : 0);
      if (!p.quemada && ((p.loc === 'sarten' && p.cook[0] >= .45 && p.cook[1] >= .45) || (p.loc === 'tablaL' && !p.modo.includes('f')))) cgFlecha(c, s.x, s.y - (enSar ? 23 : 14));
      if (p.quemada) { R(s.x - 1, s.y - 11, 3, 6, '#d02030'); R(s.x - 1, s.y - 4, 3, 2, '#d02030'); }
      if (enSar && !p.quemada) {   // barras de cocción de las dos caras; la de abajo se marca
        [0, 1].forEach(j => { const bx = s.x - 6, by = s.y - 15 + j * 3, v = Math.min(1, p.cook[j]); R(bx - 1, by - 1, 14, 3, '#000'); R(bx, by, 12, 1, '#55505a'); R(bx + 12 * CG_SWEET[0], by, 12 * (CG_SWEET[1] - CG_SWEET[0]), 1, '#3a8a4a'); R(bx, by, Math.round(12 * v), 1, v > CG_SWEET[1] ? '#ff5a4a' : v >= CG_SWEET[0] ? '#8aff9a' : '#ffd84a'); if (j === p.lado) R(bx - 3, by, 1, 1, '#ffffff'); });
      }
    });
    // el cuchillo / rastro de corte
    const kn = cg.knife;
    if (kn) {
      kn.tr.forEach((t, i) => { c.fillStyle = `rgba(255,255,255,${i / kn.tr.length * .6})`; c.fillRect(Math.round(t[0]), Math.round(t[1]), 1.5, 1.5); });
      R(kn.x - 1, kn.y - 7, 3, 10, '#e8eef4');
      R(kn.x - 1, kn.y - 7, 1, 10, '#ffffff');
      R(kn.x - 1, kn.y + 3, 3, 4, '#5a3a1a');
    } else {
      // Solo dibuja cuchillo en la tabla si NO hay alimento esperando corte en la tabla
      if (!cg.piezas.some(p => p.loc === 'tabla')) {
        R(B.x + B.w - 9, B.y + B.h - 24, 2, 11, '#e8eef4');
        R(B.x + B.w - 9, B.y + B.h - 13, 2, 5, '#5a3a1a');
      }
    }

    // ---- guía visual: insignias enmarcadas, líneas de corte y destinos interactivos ----
    const pul = .5 + .5 * Math.sin(cg.t * 5);
    const sug = cg.ayuda ? cgSug() : (cg.piezas.find(q => q.quemada) ? { t: 'tirar', p: cg.piezas.find(q => q.quemada) } : null);
    const badge = (p, x, y) => {
      const needsC = p.modo.includes('c') && !p.corte;
      const needsF = p.modo.includes('f');
      if (!needsC && !needsF) return;
      const w = (needsC && needsF) ? 22 : 13, h = 9;
      const bx = Math.round(x - w / 2), by = Math.round(y);
      // Placa tipo tag con fondo oscuro y borde nítido
      R(bx, by, w, h, 'rgba(16, 18, 28, 0.95)');
      c.strokeStyle = needsC ? (needsF ? '#ffd84a' : '#8aff9a') : '#ff7a2a';
      c.lineWidth = 1;
      c.strokeRect(bx - 0.5, by - 0.5, w + 1, h + 1);

      if (needsC && needsF) {
        // Cuchillo (Paso 1 prioritario)
        const kx = bx + 2;
        R(kx, by + 1, 2, 4, '#e8eef4'); R(kx, by + 1, 1, 4, '#ffffff');
        R(kx, by + 5, 2, 2, '#5a3a1a');
        // Indicador '1º'
        R(kx - 1, by + 1, 1, 4, '#8aff9a');
        // Flecha '>'
        R(bx + 8, by + 3, 3, 1, '#a0b0c4');
        R(bx + 10, by + 2, 1, 3, '#a0b0c4');
        // Fuego (Paso 2)
        const fx = bx + 14;
        R(fx + 1, by + 1, 2, 2, '#ffd84a');
        R(fx, by + 2, 4, 3, '#ff8a2a');
        R(fx + 1, by + 3, 2, 2, '#ffe45a');
        R(fx, by + 5, 4, 2, '#ff4a2a');
      } else if (needsC) {
        const kx = bx + 5;
        R(kx, by + 1, 2, 4, '#e8eef4'); R(kx, by + 1, 1, 4, '#ffffff');
        R(kx, by + 5, 2, 2, '#5a3a1a');
      } else {
        const fx = bx + 4;
        R(fx + 1, by + 1, 2, 2, '#ffd84a');
        R(fx, by + 2, 4, 3, '#ff8a2a');
        R(fx + 1, by + 3, 2, 2, '#ffe45a');
        R(fx, by + 5, 4, 2, '#ff4a2a');
      }
    };

    if (cg.ayuda) {
      cg.piezas.forEach(p => {
        if (p.loc === 'cesta') {
          const s = cgSlot(p);
          // Línea punteada de corte sobre el propio sprite del alimento para que salte a la vista
          if (p.modo.includes('c') && !p.corte) {
            for (let dy = -5; dy <= 5; dy += 3) {
              R(s.x, s.y + dy, 1, 2, '#ffffff');
              R(s.x, s.y + dy + 1, 1, 1, '#14141a');
            }
          }
          // Badge tag enmarcado justo bajo el alimento
          badge(p, s.x, 20);

          // Flecha animada '▼' rebotando sobre el ingrediente que toca mover ahora
          if (sug && sug.p === p && !cg.drag) {
            const bo = Math.round(Math.sin(cg.t * 8) * 1.5);
            R(s.x - 2, s.y - 12 + bo, 5, 2, '#ffd84a');
            R(s.x - 1, s.y - 10 + bo, 3, 2, '#ffd84a');
            R(s.x, s.y - 8 + bo, 1, 2, '#ffd84a');
            c.strokeStyle = 'rgba(255,216,74,' + (.5 + .5 * pul) + ')';
            c.lineWidth = 1; c.beginPath(); c.arc(s.x, s.y, 9.5, 0, 7); c.stroke();
          }
        } else if (p.loc === 'tablaL' && p.modo.includes('f')) {
          const s = cgSlot(p);
          // Badge de fuego para pieza ya cortada en la tabla
          R(s.x - 6, s.y + 7, 12, 8, 'rgba(16, 18, 28, 0.95)');
          c.strokeStyle = '#ff7a2a'; c.lineWidth = 1; c.strokeRect(s.x - 6.5, s.y + 6.5, 13, 9);
          const fx = s.x - 2, by = s.y + 8;
          R(fx + 1, by + 1, 2, 2, '#ffd84a'); R(fx, by + 2, 4, 3, '#ff8a2a'); R(fx + 1, by + 3, 2, 2, '#ffe45a'); R(fx, by + 5, 4, 2, '#ff4a2a');
        }
      });
    }

    // Actualiza texto de ayuda en el encabezado superior (solo durante los primeros 5 cocinados)
    if (cg.ayuda && sug) {
      let sugTxt = '';
      if (sug.t === 'fuego') sugTxt = 'Mueve la sartén al fuego 🔥';
      else if (sug.t === 'agitar') sugTxt = '¡Sacude la sartén para voltear! 🔄';
      else if (sug.t === 'corte') sugTxt = 'Desliza tu dedo hacia abajo para cortar 👆';
      else if (sug.t === 'tirar') sugTxt = 'Se quemó, tócalo para tirarlo';
      else if (sug.t === 'mover') {
        sugTxt = sug.a === 'tabla' ? 'Lleva el ingrediente a la tabla' : (sug.a === 'sarten' ? 'Ponlo en la sartén' : '¡Listo! Llévalo al plato');
      }
      const fullT = cg.r.n + (sugTxt ? ' • ' + sugTxt : '');
      if (cg.lastTxt !== fullT) { cg.lastTxt = fullT; const el = $('cg-t'); if (el) el.textContent = fullT; }
    } else if (!cg.ayuda) {
      if (cg.lastTxt !== cg.r.n) { cg.lastTxt = cg.r.n; const el = $('cg-t'); if (el) el.textContent = cg.r.n; }
    }

    const ring = (kind, col) => { c.strokeStyle = col; c.lineWidth = 1; c.globalAlpha = .35 + .5 * pul;
      if (kind === 'tabla') c.strokeRect(B.x - 2.5, B.y - 2.5, B.w + 5, B.h + 5); else if (kind === 'plato') { c.beginPath(); c.ellipse(Pl.x, Pl.y, Pl.rx + 3, Pl.ry + 3, 0, 0, 7); c.stroke(); } else if (kind === 'sarten') { c.beginPath(); c.arc(pn.x, pn.y, 17.5, 0, 7); c.stroke(); } else { c.beginPath(); c.arc(kind.x, kind.y, 12.5, 0, 7); c.stroke(); } c.globalAlpha = 1; };
    const mano = (x0, y0, x1, y1, col) => {
      for (let i = 1; i < 8; i++) R(x0 + (x1 - x0) * i / 8, y0 + (y1 - y0) * i / 8, 1, 1, 'rgba(255,255,255,.55)');
      const T = (cg.t * .8) % 1.5, u = Math.min(1, T / 1.1), e2 = u * u * (3 - 2 * u), hx = x0 + (x1 - x0) * e2, hy = y0 + (y1 - y0) * e2;
      circ(hx + 1, hy + 2, 4.5, 'rgba(0,0,0,.3)'); circ(hx, hy, 4.5, '#ffffff'); circ(hx, hy, 3, col || '#ffd84a'); if (u < .08 || u >= 1) { c.strokeStyle = '#fff'; c.beginPath(); c.arc(hx, hy, 6 + (T % .2) * 20, 0, 7); c.stroke(); } };

    // Si el jugador está arrastrando una pieza, ilumina el destino correspondiente si la ayuda está activa
    if (cg.ayuda && cg.drag && cg.drag.p) {
      const dp = cg.drag.p;
      if (dp.modo.includes('c') && !dp.corte) {
        // Va a la tabla de cortar
        c.strokeStyle = '#8aff9a'; c.lineWidth = 2; c.strokeRect(B.x - 2, B.y - 2, B.w + 4, B.h + 4);
        c.fillStyle = 'rgba(16, 20, 32, 0.92)'; c.fillRect(B.x + 5, B.y + B.h / 2 - 6, B.w - 10, 12);
        c.strokeStyle = '#8aff9a'; c.lineWidth = 1; c.strokeRect(B.x + 5, B.y + B.h / 2 - 6, B.w - 10, 12);
        c.fillStyle = '#8aff9a'; c.font = '6px monospace'; c.textAlign = 'center';
        c.fillText('¡A LA TABLA! 🔪', B.x + B.w / 2, B.y + B.h / 2 + 2);
      } else if (dp.modo.includes('f') && (!dp.modo.includes('c') || dp.corte)) {
        // Va a la sartén
        const ptarget = cgPanDe(dp) || cg.pans[0];
        c.strokeStyle = '#ff9a4a'; c.lineWidth = 2; c.beginPath(); c.arc(ptarget.x, ptarget.y, 19, 0, 7); c.stroke();
        c.fillStyle = 'rgba(16, 20, 32, 0.92)'; c.fillRect(ptarget.x - 26, ptarget.y - 6, 52, 12);
        c.strokeStyle = '#ff9a4a'; c.lineWidth = 1; c.strokeRect(ptarget.x - 26, ptarget.y - 6, 52, 12);
        c.fillStyle = '#ffd84a'; c.font = '6px monospace'; c.textAlign = 'center';
        c.fillText('¡A LA SARTÉN! 🔥', ptarget.x, ptarget.y + 2);
      } else if (cgListaPlato(dp) === null) {
        // Va al plato
        c.strokeStyle = '#8aff9a'; c.lineWidth = 2; c.beginPath(); c.ellipse(Pl.x, Pl.y, Pl.rx + 4, Pl.ry + 4, 0, 0, 7); c.stroke();
        c.fillStyle = 'rgba(16, 20, 32, 0.92)'; c.fillRect(Pl.x - 24, Pl.y - 6, 48, 12);
        c.strokeStyle = '#8aff9a'; c.lineWidth = 1; c.strokeRect(Pl.x - 24, Pl.y - 6, 48, 12);
        c.fillStyle = '#8aff9a'; c.font = '6px monospace'; c.textAlign = 'center';
        c.fillText('¡AL PLATO! 🍽️', Pl.x, Pl.y + 2);
      }
    }

    if (sug && !cg.drag && !cg.knife) {
      pn = cg.pans.find(q => q.id === sug.pi) || cg.pans[0];
      if (sug.t === 'tirar') {
        const s = cgSlot(sug.p); c.globalAlpha = .5 + .5 * pul; R(s.x - 6, s.y - 6, 12, 12, 'rgba(255,40,50,.35)'); c.globalAlpha = 1; mano(s.x + 6, s.y + 8, s.x, s.y, '#ff5a6a');
      }
      else if (sug.t === 'corte') {
        const g = CG_GUIA[Math.min(2, sug.p.cuts.length)], gx = cg.tx + g;
        ring('tabla', '#ffffff');
        // Línea guía vertical punteada con contraste
        for (let y = cy - 20; y <= cy + 20; y += 4) {
          R(gx, y, 1, 2, (y % 8 === 0) ? '#ffffff' : '#ffd84a');
        }
        // Flechitas indicando sentido hacia abajo
        [-11, 0, 11].forEach(dy => {
          const arrY = cy + dy + Math.round(Math.sin(cg.t * 8) * 1.5);
          R(gx - 1, arrY, 3, 1, '#ffd84a');
          R(gx, arrY + 1, 1, 1, '#ffd84a');
        });
        // Dedo animado deslizando de arriba hacia abajo
        const T = (cg.t * 1.25) % 1.5, u = Math.min(1, T / 1.05);
        const e2 = u * u * (3 - 2 * u), fy = cy - 22 + e2 * 44;
        if (fy > cy - 22) {
          c.fillStyle = 'rgba(255,255,255,.45)';
          c.fillRect(gx, cy - 22, 1, Math.round(fy - (cy - 22)));
        }
        circ(gx + 1, fy + 2, 4.5, 'rgba(0,0,0,.35)');
        circ(gx, fy, 4.5, '#ffffff');
        circ(gx, fy, 3, '#ffd84a');
        if (u < .1 || u >= 1) {
          c.strokeStyle = '#fff'; c.beginPath(); c.arc(gx, cy - 22, 3 + (T % .2) * 15, 0, 7); c.stroke();
        }
        // Badge visual explicativo bajo la tabla
        c.fillStyle = 'rgba(20,20,26,.88)'; c.fillRect(4, 98, 53, 10);
        c.strokeStyle = '#ffffff'; c.lineWidth = 1; c.strokeRect(4, 98, 53, 10);
        c.fillStyle = '#ffd84a'; c.font = '6px monospace'; c.textAlign = 'center';
        c.fillText('👆 DESLIZA', 30, 105);
      }
      else if (sug.t === 'agitar') {
        const hx = pn.x + 24, hy = pn.y;
        const shkX = Math.sin(cg.t * 16) * 5, shkY = Math.cos(cg.t * 12) * 3;
        // Icono animado de voltear sobre la comida
        const ang = cg.t * 6;
        c.strokeStyle = '#ffffff'; c.lineWidth = 1.5; c.beginPath(); c.arc(pn.x, pn.y, 7.5, ang, ang + 4.2); c.stroke();
        const tipX = pn.x + Math.cos(ang + 4.2) * 7.5, tipY = pn.y + Math.sin(ang + 4.2) * 7.5;
        c.fillStyle = '#8aff9a'; c.beginPath(); c.arc(tipX, tipY, 2, 0, 7); c.fill();
        // Aro pulsante azul en la sartén
        c.strokeStyle = 'rgba(154,216,255,' + (.5 + .5 * pul) + ')'; c.lineWidth = 1.5;
        c.beginPath(); c.arc(pn.x, pn.y, 18 + pul * 2, 0, 7); c.stroke();
        // Flechas de vaivén en el mango
        R(hx - 8 + shkX, hy - 7, 16, 1, '#8ad8ff');
        R(hx - 8 + shkX, hy - 9, 2, 5, '#8ad8ff');
        R(hx + 6 + shkX, hy - 9, 2, 5, '#8ad8ff');
        R(hx + 11, hy - 6 + shkY, 1, 12, '#8ad8ff');
        R(hx + 9, hy - 6 + shkY, 5, 2, '#8ad8ff');
        R(hx + 9, hy + 4 + shkY, 5, 2, '#8ad8ff');
        // Mano sacudiendo el mango
        const mx = hx + shkX, my = hy + shkY;
        circ(mx + 1, my + 2, 5, 'rgba(0,0,0,.35)');
        circ(mx, my, 5, '#ffffff');
        circ(mx, my, 3.5, '#9ad8ff');
        // Badge visual explicativo
        c.fillStyle = 'rgba(20,20,26,.88)'; c.fillRect(64, 122, 65, 10);
        c.strokeStyle = '#8ad8ff'; c.lineWidth = 1; c.strokeRect(64, 122, 65, 10);
        c.fillStyle = '#ffffff'; c.font = '6px monospace'; c.textAlign = 'center';
        c.fillText('🔄 ¡SACUDE!', 96, 129);
      }
      else if (sug.t === 'fuego') {
        const b = sug.b;
        // Quemador destino brillando con aros de fuego y partículas
        c.strokeStyle = '#ff5a2a'; c.lineWidth = 1.5; c.beginPath(); c.arc(b.x, b.y, 12 + pul * 3, 0, 7); c.stroke();
        c.strokeStyle = '#ffd84a'; c.lineWidth = 1; c.beginPath(); c.arc(b.x, b.y, 8 + pul * 1.5, 0, 7); c.stroke();
        c.fillStyle = 'rgba(255,120,40,.22)'; c.beginPath(); c.arc(b.x, b.y, 11, 0, 7); c.fill();
        for (let i = 0; i < 3; i++) {
          const fa = i * 2.1 + cg.t * 3;
          R(b.x + Math.cos(fa) * 6, b.y + Math.sin(fa) * 6 - ((cg.t * 14 + i * 4) % 7), 1.5, 1.5, i % 2 ? '#ffd84a' : '#ff7a2a');
        }
        // Sartén brillando en naranja
        c.strokeStyle = '#ff9a4a'; c.lineWidth = 1.5; c.beginPath(); c.arc(pn.x, pn.y, 17.5 + pul * 2, 0, 7); c.stroke();
        // Trayectoria animada de la sartén al quemador
        const pasos = 6;
        for (let i = 1; i < pasos; i++) {
          const u = i / pasos, px = pn.x + (b.x - pn.x) * u, py = pn.y + (b.y - pn.y) * u;
          R(px, py, 1.5, 1.5, 'rgba(255,216,74,.6)');
        }
        const arrU = (cg.t * 1.4) % 1, ax = pn.x + (b.x - pn.x) * arrU, ay = pn.y + (b.y - pn.y) * arrU;
        c.fillStyle = '#ff7a2a'; c.beginPath(); c.arc(ax, ay, 2, 0, 7); c.fill();
        // Mano animada arrastrando la sartén por el mango hacia el fuego
        mano(pn.x + 22, pn.y, b.x + 22, b.y, '#ff9a4a');
        // Badge explicativo
        c.fillStyle = 'rgba(20,20,26,.88)'; c.fillRect(66, 122, 62, 10);
        c.strokeStyle = '#ff7a2a'; c.lineWidth = 1; c.strokeRect(66, 122, 62, 10);
        c.fillStyle = '#ffd84a'; c.font = '6px monospace'; c.textAlign = 'center';
        c.fillText('🔥 AL FUEGO', 97, 129);
      }
      else if (sug.t === 'mover') {
        const s = cgSlot(sug.p), T = sug.a;
        if (sug.p.loc === 'sarten') pn = cgPanDe(sug.p);
        ring(T, T === 'plato' ? '#8aff9a' : '#ffffff');
        const dst = T === 'tabla' ? { x: B.x + B.w / 2, y: B.y + 30 } : T === 'plato' ? { x: Pl.x, y: Pl.y } : { x: pn.x, y: pn.y };
        if (sug.p.loc === 'sarten') { c.globalAlpha = .4 + .5 * pul; c.strokeStyle = '#8aff9a'; c.beginPath(); c.arc(s.x, s.y, 8, 0, 7); c.stroke(); c.globalAlpha = 1; }
        mano(s.x, s.y, dst.x, dst.y, T === 'plato' ? '#8aff9a' : '#ffd84a');
      }
    }
    // partículas y mensajes
    cg.part.forEach(p => { c.globalAlpha = 1 - p.v; R(p.x, p.y, 2, 2, p.c); c.globalAlpha = 1; });
    c.font = '6px monospace'; c.textAlign = 'center';
    cg.msgs.forEach(m => { c.globalAlpha = Math.min(1, 1.3 - m.v); const y = m.y - m.v * 10; c.fillStyle = '#000'; c.fillText(m.t, m.x + 1, y + 1); c.fillStyle = m.c; c.fillText(m.t, m.x, y); c.globalAlpha = 1; });
    // progreso en el plato
    const tot = cg.piezas.length, ok = cg.piezas.filter(p => p.loc === 'plato').length; c.fillStyle = '#fff'; c.fillText(ok + '/' + tot, CG_PLATE.x, CGH - 2);
  }

  
{ const c = $('cgc'); c.addEventListener('pointerdown', cgDown); c.addEventListener('pointermove', cgMove); c.addEventListener('pointerup', cgUp); c.addEventListener('pointercancel', cgUp); $('cg-x').onclick = cgSalir; window.addEventListener('resize', () => { if (cg) cgLayout(); }); }

/* ===================== BAÑO: LIMPIEZA Y MINIJUEGO DE BAÑAR A SIMON ===================== */
  let ban = null;
  const limpTasa = () => lugar === 'parque' ? 6 : (e.hab === 'sala' || e.hab === 'bano') ? 4 : 4;   // puntos de limpieza que baja por hora
  const cabeza = () => ({ cx: SX + 28, cy: SY + 27, rx: 21, ry: 17 });
  const POV_CROP = [4, 6, 48, 46];   // primer plano de frente: la cabeza real de Simon ampliada
  const povK = () => (LW - 8) / POV_CROP[2];
  const povPos = () => ({ x: Math.round((LW - POV_CROP[2] * povK()) / 2), y: Math.round((LH - 26 - POV_CROP[3] * povK()) / 2) });
  const povCab = () => { const P = povPos(), K = povK(); return { cx: P.x + 24 * K, cy: P.y + 28 * K, rx: 22.5 * K, ry: 17 * K }; };
  function circG(g, cx, cy, r, c) { for (let y = -r; y <= r; y++) { const w = Math.round(Math.sqrt(r * r - y * y)); g.rect(cx - w, cy + y, w * 2 + 1, 1, c); } }
  function banoGrid(W, H, RY, OX, S) {   // baño moderno: piedra clara, madera, vidrio y detalles negros mate
    S = S || {}; const g = Grid(W, H), FY = RY + 35;
    for (let y = 0; y < RY + 5; y++) for (let x = 0; x < W; x++) g.set(x, y, S.p ? PAT_P[S.p.pat](x, y, S.p.col) : (x + OX) % 22 === 0 ? '#d8d0c4' : '#e8e2d8');
    g.rect(0, 0, W, 2, '#f6f2ec'); g.rect(0, 2, W, 1, '#c8bfb0');
    g.rect(0, RY, W, 1, '#fbf8f2'); g.rect(0, RY + 1, W, 3, '#f1ece3'); g.rect(0, RY + 4, W, 1, '#9aa6a0');
    for (let y = RY + 5; y < RY + 29; y++) for (let x = 0; x < W; x++) g.set(x, y, S.p ? PAT_P[S.p.pat](x, y, S.p.wain) : ((x + OX) % 16 === 0 || (y - RY) % 12 === 5) ? '#8e9c96' : (((x + OX) / 16 | 0) % 2 ? '#b2c0ba' : '#a8b6b0'));
    g.rect(0, RY + 29, W, 6, '#b8c4be'); g.rect(0, RY + 29, W, 1, '#d8e2dc'); g.rect(0, RY + 33, W, 2, '#6c7a74');
    for (let y = FY; y < H; y++) for (let x = 0; x < W; x++) g.set(x, y, S.f ? PAT_F[S.f.pat](x, y - FY, S.f.col) : ((x + OX) % 20 === 0 || (y - FY) % 14 === 0) ? '#3c4850' : ((((x + OX) / 20 | 0) + ((y - FY) / 14 | 0)) % 2 ? '#5a6872' : '#52606a'));
    // espejo redondo con luz LED
    const mx = OX + 26, my = RY - 28;
    circG(g, mx, my, 17, '#fff0c8'); circG(g, mx, my, 16, '#f6e2a8'); circG(g, mx, my, 14, '#2a2a32'); circG(g, mx, my, 13, '#cfe4ee');
    for (let i = 0; i < 7; i++) { g.set(mx - 7 + i * 2, my - 8 + i * 2, '#ffffff'); g.set(mx - 6 + i * 2, my - 8 + i * 2, '#ffffff'); }
    g.rect(mx - 9, my - 11, 6, 1, '#eaf6fa');
    // mueble flotante de madera con lavabo
    g.rect(OX + 3, RY + 3, 46, 4, '#f8f6f2'); g.rect(OX + 3, RY + 3, 46, 1, '#ffffff'); g.rect(OX + 3, RY + 6, 46, 1, '#c8c4bc');
    g.rect(OX + 4, RY + 7, 44, 14, '#b88a58'); g.rect(OX + 4, RY + 7, 44, 1, '#d8aa78'); g.rect(OX + 4, RY + 20, 44, 1, '#7a5430');
    g.rect(OX + 26, RY + 7, 1, 14, '#7a5430'); g.rect(OX + 10, RY + 12, 10, 1, '#2a2a32'); g.rect(OX + 32, RY + 12, 10, 1, '#2a2a32');
    for (let i = 0; i < 40; i += 2) g.set(OX + 6 + i, RY + 22, '#4a5a62');
    capa(g, '#b8bcc8', L => sombrear(L, elipse(OX + 18, RY - 1, 9, 4), OX + 18, RY - 1, 9, 4, ['#ffffff', '#f2f4f8', '#d4d8e4', '#a8aec0']));
    g.rect(OX + 17, RY - 14, 2, 12, '#2a2a32'); g.rect(OX + 17, RY - 14, 7, 2, '#2a2a32'); g.rect(OX + 23, RY - 12, 1, 3, '#2a2a32');
    g.art(OX + 36, RY - 8, ['..g.g..', '.ggggg.', '.gGgGg.', '..ggg..', '..bbb..', '..bbb..'], { g: '#4aa860', G: '#7ad08a', b: '#8a5a3a' });   // plantita
    g.rect(OX + 41, RY - 3, 4, 6, '#2a2a32'); g.rect(OX + 42, RY - 5, 2, 2, '#2a2a32');   // dispensador de jabón
    // repisas flotantes con toallas y vela
    [[OX + 56, RY - 26], [OX + 56, RY - 10]].forEach(([x, y], i) => { g.rect(x, y, 26, 2, '#b88a58'); g.rect(x, y, 26, 1, '#d8aa78'); });
    g.rect(OX + 58, RY - 36, 10, 10, '#f4f2ee'); g.rect(OX + 58, RY - 36, 10, 2, '#d8d4cc'); g.rect(OX + 58, RY - 31, 10, 1, '#d8d4cc'); g.rect(OX + 69, RY - 33, 9, 7, '#8a96a2'); g.rect(OX + 69, RY - 33, 9, 1, '#a8b2bc');
    g.rect(OX + 60, RY - 17, 6, 7, '#f4eadc'); g.rect(OX + 62, RY - 20, 2, 3, '#ffe28a'); g.set(OX + 62, RY - 21, '#ff9a40'); g.rect(OX + 70, RY - 16, 8, 6, '#e8eef2'); g.rect(OX + 70, RY - 16, 8, 1, '#ffffff');
    // ducha a ras de piso con mampara de vidrio
    const sx0 = OX + 90, sx1 = OX + 126;
    for (let y = RY - 50; y < FY; y++) for (let x = sx0; x < sx1; x++) g.set(x, y, ((x + y) % 11 === 0 || (x + y) % 11 === 1) ? '#ffffff' : (y < RY + 5 ? '#c8e0e8' : '#bcd6de'));
    g.rect(sx0, RY - 50, 2, FY - RY + 50, '#2a2a32'); g.rect(sx0, RY - 51, sx1 - sx0, 2, '#2a2a32'); g.rect(sx1 - 2, RY - 50, 2, FY - RY + 50, '#2a2a32'); g.rect(sx0, FY - 2, sx1 - sx0, 2, '#2a2a32');
    g.rect(sx0 + 14, RY - 50, 1, FY - RY + 50, '#4a4a54');
    g.rect(sx0 - 5, RY - 20, 3, 14, '#2a2a32'); g.rect(sx0 - 4, RY - 19, 1, 12, '#6a6a76');   // manija
    circG(g, sx0 + 22, RY - 42, 6, '#2a2a32'); circG(g, sx0 + 22, RY - 42, 5, '#4a4a54'); for (let i = -3; i <= 3; i += 2) g.set(sx0 + 22 + i, RY - 42, '#9aa0aa'), g.set(sx0 + 22, RY - 42 + i, '#9aa0aa');   // regadera tipo lluvia
    g.rect(sx0 + 22, RY - 50, 1, 8, '#2a2a32');
    // tapete de listones de madera
    g.rect(OX + 28, FY + 6, 64, 10, '#8a6038'); for (let i = 0; i < 64; i += 4) g.rect(OX + 29 + i, FY + 7, 3, 8, i % 8 ? '#c8a070' : '#d8b080');
    return g;
  }
  function povHead(ojos) {   // cabeza de Simon vista desde arriba y de frente: la frente se estira y la cara se aplasta
    const src = simonGrid(ojos, 'n', e.ropa, {}), W = POV_CROP[2], H = POV_CROP[3], g = Grid(W, H);
    const sy = oy => oy < 24 ? 13 + oy * 14 / 24 : oy < 44 ? 27 + (oy - 24) * 25 / 20 : 52 + (oy - 44);
    for (let oy = 0; oy < H; oy++) { const Y = Math.min(src.h - 1, Math.round(sy(oy))); for (let ox = 0; ox < W; ox++) { const a = (Y * src.w + POV_CROP[0] + ox) * 4; if (src.d[a + 3]) g.set(ox, oy, [src.d[a], src.d[a + 1], src.d[a + 2], 255]); } }
    const sut = (x, y) => { const a = (y * g.w + x) * 4; if (x >= 0 && x < W && y >= 0 && y < H && g.d[a + 3] && g.d[a] > 190) g.set(x, y, '#b4bade'); };
    for (let y = 2; y < 22; y++) sut(24, y);
    for (let x = 9; x < 40; x++) sut(x, 9 + Math.round(Math.pow((x - 24) / 15, 2) * 4));
    return g;
  }
  const mixc = (c, w, t) => { const p = i => parseInt(c.substr(1 + i * 2, 2), 16), q = i => parseInt(t.substr(1 + i * 2, 2), 16); return '#' + [0, 1, 2].map(i => Math.max(0, Math.min(255, Math.round(p(i) + (q(i) - p(i)) * w))).toString(16).padStart(2, '0')).join(''); };
  function azulejoPared(g, W, FY, OX, lx, ly) {   // pared de azulejo biselado con luz suave, cenefa de mosaico y gotitas
    const T = 16, TONOS = ['#e8f4f3', '#dff0f0', '#d6eaec', '#e3f1f0'];
    for (let y = 0; y < FY; y++) for (let x = 0; x < W; x++) {
      const X = x + OX, tx = Math.floor(X / T), ty = Math.floor(y / T), lx0 = X - tx * T, ly0 = y - ty * T;
      let c = TONOS[((tx * 7 + ty * 13 + (tx * ty)) % 4 + 4) % 4];
      if (lx0 === 0 || ly0 === 0) c = '#a9c6cb';
      else if (lx0 === 1 || ly0 === 1) c = '#fafefe';
      else if (lx0 === T - 1 || ly0 === T - 1) c = '#c3d9dd';
      const d = Math.hypot(x - lx, (y - ly) * 1.1) / W;   // luz que cae desde la regadera
      c = mixc(c, Math.max(0, .34 - d * .5), '#ffffff'); c = mixc(c, Math.min(.2, y / FY * .16 + d * .12), '#7fb4c2');
      g.set(x, y, c);
    }
    const my = Math.round(FY * .42) - 4;   // cenefa de mosaico turquesa
    for (let x = 0; x < W; x++) for (let k = 0; k < 6; k++) { const X = x + OX, cx = Math.floor(X / 6), ccol = ['#2f8fa6', '#46b0c0', '#7fd0d8', '#3aa0b4'][(cx * 3 + (k >> 1)) % 4]; g.set(x, my + k, (X % 6 === 0 || k === 0 || k === 5) ? '#1f6f84' : ccol); }
    g.rect(0, my - 1, W, 1, '#fafefe'); g.rect(0, my + 6, W, 1, '#a9c6cb');
    for (let i = 0; i < 18; i++) { const x = (i * 29 + 7) % (W - 8) + 4, y = (i * 47 + 11) % (FY - 14) + 6; if (y > my - 3 && y < my + 8) continue; g.set(x, y, '#ffffff'); g.set(x, y + 1, '#bfe3ee'); g.set(x, y + 2, '#dff3fa'); }
  }
  function duchaGrid(W, H, RY, OX, S) {   // el interior de la regadera: azulejo biselado, vidrio, lluvia y repisita con shampoo
    S = S || {}; const g = Grid(W, H), FY = RY + 35, cx = Math.round(W / 2);
    azulejoPared(g, W, FY, OX, cx, 6);
    for (let y = FY; y < H; y++) for (let x = 0; x < W; x++) {   // piso de pizarra con juntas y reflejo mojado
      const X = x + OX, ty = Math.floor((y - FY) / 14), tx = Math.floor((X + (ty % 2) * 10) / 20), lx0 = (X + (ty % 2) * 10) - tx * 20, ly0 = (y - FY) % 14;
      if (S.f) { g.set(x, y, mixc(PAT_F[S.f.pat](x, y - FY, S.f.col), Math.max(0, .24 - Math.hypot(x - cx, (y - FY) * 2.2) / W * .6), '#bfe6f2')); continue; }
      let c = ((tx * 5 + ty * 3) % 3) === 0 ? '#5e6e78' : ((tx + ty) % 2 ? '#566670' : '#4e5e68');
      if (lx0 === 0 || ly0 === 0) c = '#364048'; else if (ly0 === 1) c = mixc(c, .22, '#ffffff');
      c = mixc(c, Math.max(0, .26 - Math.hypot(x - cx, (y - FY) * 2.2) / W * .7), '#bfe6f2'); g.set(x, y, c);
    }
    g.rect(0, FY - 3, W, 1, '#fafefe'); g.rect(0, FY - 2, W, 3, '#2a2a32');
    const dx0 = Math.round(W * .18); g.rect(dx0, FY + 14, 26, 6, '#2a2f36'); for (let i = 0; i < 6; i++) g.rect(dx0 + 2 + i * 4, FY + 15, 2, 4, '#8a949c');   // coladera
    g.rect(0, 0, 4, FY, '#2a2a32'); g.rect(1, 0, 1, FY, '#7a828c'); g.rect(W - 4, 0, 4, FY, '#2a2a32'); g.rect(W - 3, 0, 1, FY, '#7a828c');   // marco del vidrio
    for (let k = 0; k < 3; k++) { const x = W - 12 - k * 5; for (let y = 8 + k * 6; y < FY - 6; y++) if (((y + k * 4) >> 3) % 2 === 0) g.set(x - (y >> 3), y, '#f4fcff'); }   // brillos del vidrio
    circG(g, cx, 8, 14, '#2a2a32'); circG(g, cx, 8, 12, '#5a5a66'); circG(g, cx - 3, 5, 5, '#6e7280'); for (let j = -9; j <= 9; j += 3) for (let i = -9; i <= 9; i += 3) if (i * i + j * j < 90) g.set(cx + i, 8 + j, '#b4bac4');
    g.rect(cx, 0, 1, 2, '#2a2a32'); g.rect(cx - 2, 20, 5, 1, '#e8f6fc');
    for (let i = 0; i < 36; i++) { const x = cx - 28 + ((i * 37) % 57), y0 = 22 + ((i * 53) % 70); g.rect(x, y0, 1, 8, '#d8f0fa'); g.rect(x, y0 + 8, 1, 3, '#9fd4ec'); }
    g.rect(9, RY - 41, 30, 28, '#8aa6ae'); g.rect(10, RY - 40, 28, 26, '#d6e6ea'); g.rect(12, RY - 38, 24, 22, '#a6bec6'); g.rect(12, RY - 26, 24, 2, '#f2fafc'); g.rect(10, RY - 14, 28, 2, '#6f8a94');   // nicho
    g.rect(15, RY - 36, 6, 10, '#ff9a40'); g.rect(16, RY - 39, 4, 3, '#4b6ae8'); g.rect(26, RY - 38, 6, 12, '#4ab8ff'); g.rect(27, RY - 41, 4, 3, '#ffffff');
    g.rect(W - 23, RY - 41, 16, 24, '#1e1e26'); g.rect(W - 22, RY - 40, 14, 22, '#2e2e38'); circG(g, W - 15, RY - 32, 4, '#aab0ba'); circG(g, W - 15, RY - 32, 2, '#2a2a32'); g.rect(W - 19, RY - 24, 8, 2, '#ff6a58'); g.rect(W - 19, RY - 21, 8, 2, '#4ab8ff');
    return g;
  }
  function povGrid(W, H) {   // pared de la regadera detrás del primer plano, con luz y burbujitas
    const g = Grid(W, H); azulejoPared(g, W, H, 0, Math.round(W / 2), -6);
    for (let i = 0; i < 14; i++) { const x = (i * 41 + 9) % (W - 12) + 6, y = (i * 67 + 13) % (H - 20) + 8, r = 2 + i % 3; circG(g, x, y, r, '#cfeef7'); circG(g, x, y, r - 1, '#f2fbfe'); g.set(x - 1, y - 1, '#ffffff'); }
    return g;
  }
  const BAN_FASES = [
    { f: 'piojos', pov: 1, t: 'PIOJOS', h: 'TOCA CADA PIOJO' }, { f: 'shampoo', pov: 1, t: 'SHAMPOO', h: 'FROTA LA CABEZA' }, { f: 'enjuague', pov: 1, t: 'ENJUAGUE', h: 'PASA EL AGUA POR SU CABEZA' },
    { f: 'jabon', pov: 0, t: 'JABÓN', h: 'TALLA A SIMON' }, { f: 'enjuague', pov: 0, t: 'ENJUAGUE', h: 'QUITA TODA LA ESPUMA' }];
  function banCeldas(f) {
    const L = [];
    if (f === 'shampoo') { const P = povCab(); for (let j = 0; j < 12; j++) for (let i = 0; i < 14; i++) { const x = P.cx - P.rx + 6 + i * (2 * P.rx - 12) / 13, y = P.cy - P.ry + 6 + j * (2 * P.ry - 12) / 11, dx = (x - P.cx) / P.rx, dy = (y - P.cy) / P.ry; if (dx * dx + dy * dy <= .95) L.push({ x, y, ok: 0 }); } }
    else for (let j = 0; j < 5; j++) for (let i = 0; i < 8; i++) L.push({ x: SX + 6 + i * 6.1, y: SY + 45 + j * 5.6, ok: 0 });
    return L;
  }
  function banPov(on) {   // cambio de escena con fundido
    if (ban.pov === on) return; ban.lock = true; const f = $('fundido'); f.classList.add('on');
    setTimeout(() => { if (!ban) return; ban.pov = on; f.classList.remove('on'); setTimeout(() => { if (ban) ban.lock = false; }, 200); }, 220);
  }
  function banStart() {
    if (ban || dlg || modal || introActiva) return;
    if (e.dormido) { decir('Zzz...'); sfx.no(); return; }
    if (e.enf) { decir('Sí... ¡achú!', e.traductor ? 'Resfriado no me baño.' : null, 3000); sfx.no(); return; }
    if (e.limp >= 92) { decir('Sí.', e.traductor ? 'Ya estoy limpio. Brillo de limpio.' : null, 3000); hablar(); sfx.no(); return; }
    act = null; proxAct = tk + 99999;
    const P = povCab(), n = 3 + Math.floor((100 - e.limp) / 20), lice = [];
    for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, r = Math.sqrt(Math.random()) * .7; lice.push({ x: P.cx + Math.cos(a) * P.rx * r, y: P.cy + Math.sin(a) * P.ry * r, vivo: true, a: Math.random() * 6.28 }); }
    ban = { sc0: sinCorona, f: 'piojos', i: 0, t: 0, lice, cel: [], foam: [], ptr: null, down: false, l0: e.limp, muertos: 0, snd: 0, pov: false, lock: false, total: 0 };
    vSnap = e.ropa; e.ropa = Object.assign({}, vSnap, { cara: null, orejas: null }); sinCorona = true;   // sin gorros, lentes ni corona mientras se baña (lo guardado no cambia)
    document.body.classList.add('banando'); $('ban').classList.add('on'); banHud(); sfx.click(); chapoteo(.07, .25); banPov(true);
  }
  function banHud() {
    const F = BAN_FASES[ban.i]; let p = 0;
    if (ban.f === 'piojos') p = ban.muertos / ban.lice.length;
    else if (ban.f === 'enjuague') p = 1 - ban.foam.length / Math.max(1, ban.total);
    else if (ban.cel.length) p = ban.cel.filter(c => c.ok).length / ban.cel.length;
    $('ban-t').textContent = (ban.i + 1) + '/' + BAN_FASES.length + ' ' + F.t; $('ban-h').textContent = F.h; $('ban-p').style.width = Math.round(Math.min(1, p) * 100) + '%';
  }
  function banAvanza() {
    sfx.logro(); ban.i++; ban.t = 0; ban.snd = 0; ban.down = false;
    if (ban.i >= BAN_FASES.length) { banFin(); return; }
    const F = BAN_FASES[ban.i]; ban.f = F.f;
    if (ban.f === 'shampoo' || ban.f === 'jabon') ban.cel = banCeldas(ban.f);
    if (ban.f === 'enjuague') { ban.cel = []; ban.total = ban.foam.length; }
    if (!!F.pov !== ban.pov) banPov(!!F.pov);
    banHud();
  }
  function banFin() {
    ban.f = 'fin'; ban.t = 0; $('ban').classList.remove('on');
    const falta = 100 - ban.l0; e.limp = 100; e.feliz = clamp(e.feliz + 8 + Math.round(falta / 8)); e.st.banos = (e.st.banos || 0) + 1;
    ganar(Math.max(2, Math.round(falta / 10)), 2 + Math.round(falta / 25));
    seq([784, 988, 1175, 1568], .09, 'triangle', .06); estrellas(8); corazones(3); guardar(); pintar();
  }
  function banSalir() {
    if (!ban) return; const completo = ban.f === 'fin'; if (vSnap) { e.ropa = vSnap; vSnap = null; } sinCorona = ban.sc0; ban = null; $('fundido').classList.remove('on'); document.body.classList.remove('banando'); $('ban').classList.remove('on'); proxAct = tk + 60; pintar(); guardar();
    if (completo) { decir('Sí.', e.traductor ? '¡Qué rico baño! Huelo a nube.' : null, 3500); hablar(); gesto('salto'); }
  }
  $('ban-x').onclick = () => { sfx.click(); banSalir(); };
  function banPos(ev) { const r = cv.getBoundingClientRect(); return { x: (ev.clientX - r.left) / r.width * LW, y: (ev.clientY - r.top) / r.height * LH }; }
  function banDown(ev) {
    if (ban.lock) return;
    const p = banPos(ev); ban.down = true; ban.ptr = p;
    try { cv.setPointerCapture(ev.pointerId); } catch (_) {}
    if (ban.f === 'piojos') {
      let mj = -1, md = 10; ban.lice.forEach((l, i) => { const d = Math.hypot(l.x - p.x, l.y - p.y); if (l.vivo && d < md) { md = d; mj = i; } });
      if (mj >= 0) { const l = ban.lice[mj]; l.vivo = false; ban.muertos++; seq([1000, 520], .035, 'square', .05); for (let i = 0; i < 4; i++) lanzar('estrella', l.x, l.y, (Math.random() - .5) * 1.6, -.6, 6); banHud(); if (ban.muertos >= ban.lice.length) setTimeout(() => { if (ban && ban.f === 'piojos') banAvanza(); }, 400); }
      else sfx.click();
    } else banAplica();
  }
  function banMove(ev) { if (!ban || !ban.down || ban.lock) return; ban.ptr = banPos(ev); banAplica(); }
  function banUp() { if (ban) { ban.down = false; } }
  function banAplica() {
    const p = ban.ptr; if (!p) return;
    if (ban.f === 'shampoo' || ban.f === 'jabon') {
      const pov = ban.f === 'shampoo'; let nuevo = 0;
      ban.cel.forEach(c => { if (!c.ok && Math.hypot(c.x - p.x, c.y - p.y) < (pov ? 10 : 7)) { c.ok = 1; nuevo++; ban.foam.push({ x: c.x + (Math.random() - .5) * 2, y: c.y + (Math.random() - .5) * 2, r: pov ? 7 + Math.floor(Math.random() * 4) : 3 + Math.floor(Math.random() * 3), hp: 12 }); } });
      if (tk - ban.snd > 2) { ban.snd = tk; if (ban.f === 'jabon') chirrido(1400 + Math.random() * 500, 2000, .05, .025); else chapoteo(.05, .08); }
      if (nuevo) banHud();
      if (ban.cel.filter(c => c.ok).length >= ban.cel.length * .92) { ban.cel.forEach(c => c.ok = 1); banAvanza(); }
    } else if (ban.f === 'enjuague') {
      const antes = ban.foam.length, rad = ban.pov ? 17 : 11; ban.foam.forEach(b => { if (Math.hypot(b.x - p.x, b.y - p.y) < rad) b.hp--; }); ban.foam = ban.foam.filter(b => b.hp > 0);
      if (tk - ban.snd > 2) { ban.snd = tk; chapoteo(.04, .1); }
      if (ban.foam.length !== antes) banHud();
      if (ban.foam.length <= ban.total * .04) { ban.foam = []; banAvanza(); }
    }
  }
  function sonidoAgua(dur) {   // gotitas de agua cayendo una por una
    if (e.mudo || !audio()) return;
    const sr = ac.sampleRate, total = Math.floor(sr * dur);
    // genera una gotita: tono suave que cae en pitch rápidamente (plop)
    function gota(retardo) {
      const gl = Math.floor(sr * .055), gb = ac.createBuffer(1, gl, sr), gx = gb.getChannelData(0);
      const freq0 = 900 + Math.random() * 400, freq1 = 300 + Math.random() * 200;
      for (let i = 0; i < gl; i++) {
        const t = i / sr, env = Math.exp(-t * 38);
        const freq = freq0 + (freq1 - freq0) * (i / gl);
        gx[i] = Math.sin(2 * Math.PI * freq * t) * env * .28
               + (Math.random() * 2 - 1) * env * .06;  // leve click inicial
      }
      const gs = ac.createBufferSource(), gg = ac.createGain();
      gg.gain.value = .7 + Math.random() * .3;
      gs.buffer = gb; gs.connect(gg); gg.connect(ac.destination);
      gs.start(ac.currentTime + retardo);
    }
    // lanzar gotitas a intervalos irregulares durante `dur` segundos
    let t = 0;
    while (t < dur - .06) {
      gota(t);
      t += .08 + Math.random() * .09;
    }
  }
  function chapoteo(vol, dur) {   // ruido de agua / burbujas
    if (e.mudo || !audio()) return;
    const n = Math.floor(ac.sampleRate * dur), b = ac.createBuffer(1, n, ac.sampleRate), x = b.getChannelData(0); for (let i = 0; i < n; i++) x[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = b; f.type = 'bandpass'; f.frequency.value = 1500 + Math.random() * 1500; f.Q.value = .8; g.gain.value = vol;
    s.connect(f); f.connect(g); g.connect(ac.destination); s.start();
  }
  function banTick() {
    if (!ban) return;
    if (escenaId() !== 'bano') { banSalir(); return; }
    ban.t++;
    if (ban.f === 'piojos' && ban.pov) { const P = povCab(); ban.lice.forEach(l => { if (!l.vivo) return; l.a += (Math.random() - .5) * .9; l.x += Math.cos(l.a) * 1.6; l.y += Math.sin(l.a) * 1.6; const dx = (l.x - P.cx) / (P.rx * .88), dy = (l.y - P.cy) / (P.ry * .88); if (dx * dx + dy * dy > 1) { l.a = Math.atan2(P.cy - l.y, P.cx - l.x) + (Math.random() - .5) * .8; l.x += Math.cos(l.a) * 2; l.y += Math.sin(l.a) * 2; } }); }
    if (ban.f === 'fin' && ban.t >= 18) banSalir();
  }
  const sprBotella = () => sprite('ban_bot', () => { const g = Grid(8, 13); g.rect(2, 0, 4, 2, '#4b6ae8'); g.rect(1, 2, 6, 10, '#ff9a40'); g.rect(1, 2, 1, 10, '#ffc080'); g.rect(2, 5, 4, 4, '#ffffff'); g.rect(3, 6, 2, 2, '#4ab8ff'); g.rect(1, 12, 6, 1, '#a85a10'); return g; }, 0);
  const sprJabon = () => sprite('ban_jab', () => { const g = Grid(11, 7); g.rect(1, 1, 9, 5, '#ff9ac0'); g.rect(1, 1, 9, 1, '#ffd0e4'); g.rect(1, 5, 9, 1, '#d0608c'); g.rect(0, 2, 1, 3, '#ff9ac0'); g.rect(10, 2, 1, 3, '#d0608c'); g.set(3, 3, '#ffffff'); g.set(4, 3, '#ffffff'); return g; }, 0);
  function disco2(x, y, r, c) { ctx.fillStyle = c; for (let j = -r; j <= r; j++) { const w = Math.round(Math.sqrt(r * r - j * j)); ctx.fillRect(Math.round(x - w), Math.round(y + j), w * 2 + 1, 1); } }
  function banDibujar() {
    const esc = escenaId(); if (esc === 'estudio' || esc === 'calle' || introActiva) return;
    if (!ban) {   // suciedad: piojitos y olor cuando la limpieza está baja
      if (e.limp < 45 && !e.dormido) {
        const H = cabeza(), n = e.limp < 25 ? 3 : 1;
        for (let i = 0; i < n; i++) { const a = tk * .05 * (i % 2 ? 1 : -1) + i * 2.3, x = H.cx + Math.cos(a) * H.rx * .6, y = H.cy - 6 + Math.sin(a * 1.3) * H.ry * .5; ctx.fillStyle = '#2a1a10'; ctx.fillRect(Math.round(x), Math.round(y), 2, 2); if ((tk >> 2) % 2) { ctx.fillRect(Math.round(x) - 1, Math.round(y) + 2, 1, 1); ctx.fillRect(Math.round(x) + 2, Math.round(y) + 2, 1, 1); } }
      }
      if (e.limp < 30 && !e.dormido) { ctx.fillStyle = '#8ab04a'; for (let i = 0; i < 3; i++) { const x = SX + 8 + i * 20, ph = (tk >> 2) + i; for (let k = 0; k < 6; k++) ctx.fillRect(x + Math.round(Math.sin((ph + k) * 1.2) * 1.5), SY - 2 - k * 2, 1, 2); } }
      return;
    }
    if (ban.pov) {
      ctx.drawImage(sprite('pov' + LW + 'x' + LH, () => povGrid(LW, LH), 0), 0, 0);
      ctx.fillStyle = 'rgba(20,40,50,.18)'; for (let i = 0; i < 5; i++) { ctx.fillRect(0, 0, 5 - i, LH); ctx.fillRect(LW - 5 + i, 0, 5 - i, LH); }
      const ojos = ban.f === 'piojos' ? 'a' : 'c', P = povPos();
      ctx.drawImage(sprite('povc|' + ojos + '|' + ropaSig(), () => recorte(simonGrid(ojos, 'n', e.ropa, {}), POV_CROP[0], POV_CROP[1], POV_CROP[2], POV_CROP[3]), 0), P.x, P.y, Math.round(POV_CROP[2] * povK()), Math.round(POV_CROP[3] * povK()));
    }
    ban.foam.forEach(b => { disco2(b.x, b.y, b.r, '#cfe8ff'); disco2(b.x - .5, b.y - .5, b.r - 1, '#ffffff'); ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(b.x - b.r / 2), Math.round(b.y - b.r / 2), 1, 1); });
    if (ban.f === 'piojos' && ban.pov) ban.lice.forEach(l => {
      if (!l.vivo) return; const x = Math.round(l.x), y = Math.round(l.y), w = (tk >> 1) % 2, c = Math.cos(l.a) >= 0 ? 1 : -1;
      ctx.fillStyle = '#2a1a10'; ctx.fillRect(x - 3, y - 1, 7, 4); ctx.fillStyle = '#5a3a20'; ctx.fillRect(x - 2, y - 1, 5, 1); ctx.fillStyle = '#2a1a10'; ctx.fillRect(x + 4 * c - (c < 0 ? 1 : 0), y, 2, 2);
      for (let k = 0; k < 3; k++) { ctx.fillRect(x - 2 + k * 2, y - 2 + (w && k % 2 ? 1 : 0), 1, 1); ctx.fillRect(x - 2 + k * 2, y + 3 - (w && k % 2 ? 1 : 0), 1, 1); }
      ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 4 * c - (c < 0 ? 1 : 0), y, 1, 1);
    });
    const p = ban.ptr;
    if (p && ban.down && !ban.lock) {
      if (ban.f === 'shampoo') { ctx.drawImage(sprBotella(), Math.round(p.x + 4), Math.round(p.y - 16)); ctx.fillStyle = '#ffe0a0'; ctx.fillRect(Math.round(p.x + 5), Math.round(p.y - 3 + ((tk >> 1) % 3)), 1, 2); }
      else if (ban.f === 'jabon') ctx.drawImage(sprJabon(), Math.round(p.x - 5 + Math.sin(tk) * 1), Math.round(p.y - 3));
      else if (ban.f === 'enjuague') {
        {
          const hx = Math.round(p.x), top = ban.pov ? 2 : SY - 14; ctx.fillStyle = '#d0d4e0'; ctx.fillRect(hx - 5, top - 4, 11, 4); ctx.fillStyle = '#8a90a0'; ctx.fillRect(hx - 5, top, 11, 1);
          for (let i = -4; i <= 4; i += 2) for (let y = top + 1 + ((tk + i) % 4); y < p.y + 8; y += 4) { ctx.fillStyle = '#6ac0ff'; ctx.fillRect(hx + i, y, 1, 2); }
        }
      }
    }
    if (ban.f === 'fin') { for (let i = 0; i < 6; i++) { const x = SX + 6 + i * 9, y = SY + 4 + Math.round(Math.sin(tk / 2 + i) * 6) - ban.t; ctx.fillStyle = '#ffffff'; ctx.fillRect(x, y, 2, 2); ctx.fillStyle = '#8ad0ff'; ctx.fillRect(x + 1, y + 1, 1, 1); } }
  }
  function banoToca(x, y) {   // regadera del baño (lavabo sin interacción, solo escenario)
    if (ban || dlg || modal || introActiva || escenaId() !== 'bano' || edit) return false;
    const FY = RY + 35;
    if (x >= OX + 90 && y >= RY - 52 && y <= FY + 6) { sfx.click(); banStart(); return true; }
    return false;
  }
  function lineasBomba() {
    const n = e.st.bombas, tipo = (bm && bm.tipo) || 'clasica'; let i = 0, fr;
    if (FR_TIPO[tipo]) fr = elige(FR_TIPO[tipo]);
    else { do { i = Math.floor(Math.random() * FRASES_BOMBA.length); } while (i === e.ultBomba); e.ultBomba = i; fr = FRASES_BOMBA[i]; }
    e.ultBombaT = ahora();
    const sies = desc && desc.siesta && desc.dormiaAlBoom;
    const l = [];
    if (sies) l.push(C('¡¡AAAAH!! ¡¡Estaba durmiendo!!'));
    l.push(C(fr), S(), T(elige(TR_TIPO[tipo] || TRAD_BOMBA)));
    if (HITOS_BOMBA[n]) l.push(C(HITOS_BOMBA[n]));
    else if (Math.random() < .3) l.push(C('Van ' + n + ' veces que me explotas. Llevo la cuenta, ¿eh?'));
    l.push(C('...Ay, Simon. Ven acá, cabezón.'),
      { q: 'CORTEX', t: '*le acaricia la cabeza con cariño*', fn: () => { corazones(4); gesto('besos'); sfx.regalo(); } },
      C('Nos vemos pronto. Guarda las bombas un ratito, ¿sí?'));
    if (n >= 3 && !e.tiene.peluche_cortex) l.splice(l.length - 1, 0, C('Espera, Simon. No te vayas todavía.'), C('Tres veces me has explotado y sigues queriéndome igual.'), C('Toma. Hice algo para ti.'),
      { q: 'CORTEX', t: '.', fn: () => { e.tiene.peluche_cortex = 1; equipar('peluche_cortex'); guardar(); }, fan: { g: () => pelucheGrid(), t: 'MINI CORTEX DE PELUCHE', d: 'LO PUEDES COLOCAR EN TU CASA' } },
      C('Es un mini yo de peluche. Cuídalo mucho, ¿sí?'));
    return l;
  }
  function descansoIniciar() { desc = { fin: ahora() + BOMBA_DESC }; bm = null; bombaTick(); }
  function finDesc() { hollin = false; desc = null; bm = null; pintar(); guardar(); bombaTick(); }
  function bombaTick() {
    const bt = $('t-bomba'), ch = $('t-cortex');
    if (!desc) { bt.classList.add('oculto'); return; }
    const aqui = cortex.p >= 1 && !cortex.dir;
    if (aqui && !bm) {
      ch.classList.remove('oculto', 'gris', 'lista'); $('v-cortex').textContent = (desc.siesta ? 'SIESTA ' : 'DESCANSA ') + mmss(desc.fin - ahora());
      dibIcono($('ic-cortex'), 'ic_zz', FX.z);
    }
    const ver = aqui && !bm && !dlg && !modal && !mercPres;
    bt.classList.toggle('oculto', !ver);
    if (ver) { $('v-bomba').textContent = 'BOMBA x' + (e.bombas || 0); bt.classList.toggle('gris', !(e.bombas > 0)); dibIcono($('ic-bomba'), 'ic_bomba', FGRID.bomba); }
    if (aqui && !bm && !dlg && !modal && ahora() >= desc.fin) {
      bm = { fase: 'adios', t: 0 };
      if (desc.siesta && desc.zzz) dialogo([{ q: 'CORTEX', t: '¡Mmh! ...¿Me quedé dormido? ¿Cuánto tiempo pasó?', pre: () => { desc.zzz = false; } }, S(), T('Roncabas muy bonito.'), C('Jaja. Gracias por dejarme dormir, Simon. Hasta pronto.')], () => cortexSale(finDesc));
      else dialogo([C('Ya descansé. ¡Gracias por la compañía!'), C('Bueno, ya me voy, Simon.')], () => cortexSale(finDesc));
    }
  }
  function lanzarBomba() {
    if (!desc || bm || dlg || modal || cortex.p < 1 || cortex.dir) return;
    sfx.click();
    if (e.dormido) { decir('Zzz...'); sfx.no(); return; }
    if (!(e.bombas > 0)) { toast('NO TIENES BOMBAS: TIENDA > EXTRAS'); sfx.no(); return; }
    e.bombas--; act = null; bm = { fase: 'vuelo', t: 0, tipo: elegirBomba() };
    decir('Sí.', e.traductor ? '¡Esto va a ser divertido!' : null, 2600); hablar(); gesto('salto'); guardar(); bombaTick();
  }
  const BOMBAS_T = [['clasica', 38, 'CLÁSICA'], ['confeti', 18, 'CONFETI'], ['fuegos', 16, 'FUEGOS ARTIFICIALES'], ['pastel', 14, 'PASTEL'], ['monedas', 8, 'MONEDAS'], ['gigante', 6, 'GIGANTE']];
  function elegirBomba() {
    const tira = () => { let r = Math.random() * 100; for (const [id, w] of BOMBAS_T) { if ((r -= w) < 0) return id; } return 'clasica'; };
    let t = tira(); if (t === e.ultBombaTipo) t = tira();
    e.ultBombaTipo = t; return t;
  }
  function chispas(x, y, n, vel, g, vida, tipos) { for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, v = vel * (.4 + Math.random() * .6); fx.push({ tipo: tipos ? tipos[Math.floor(Math.random() * tipos.length)] : 'cf' + Math.floor(Math.random() * 6), x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - .5, vida: vida + Math.floor(Math.random() * 8), t: 0, g }); } }
  function explotar() {
    const tipo = bm.tipo || 'clasica';
    bm.fase = 'boom'; bm.t = 0; bm.dur = tipo === 'fuegos' ? 32 : tipo === 'gigante' ? 20 : 16; hollin = (tipo === 'clasica' || tipo === 'gigante') ? true : tipo === 'pastel' ? 'crema' : false;
    if (!e.bombasVistas) e.bombasVistas = {};
    if (!e.bombasVistas[tipo]) { e.bombasVistas[tipo] = 1; if (tipo !== 'clasica') notificar('¡Nuevo tipo de bomba: ' + BOMBAS_T.find(b => b[0] === tipo)[2] + '! Ya has visto ' + Object.keys(e.bombasVistas).length + ' de ' + BOMBAS_T.length + '.'); } if (desc) { desc.dormiaAlBoom = !!desc.zzz; desc.zzz = false; }
    $('flash').classList.remove('on'); void $('flash').offsetWidth; $('flash').classList.add('on');
    const es = $('escena'); es.classList.remove('sacude'); void es.offsetWidth; es.classList.add('sacude'); setTimeout(() => es.classList.remove('sacude'), 700);
    const tx = cxb() + 30, ty = SY + SH - 34;
    if (tipo === 'clasica' || tipo === 'gigante') {
      const gg = tipo === 'gigante'; gg ? sfx.gigante() : sfx.boom();
      for (let i = 0; i < (gg ? 26 : 9); i++) { const a = Math.random() * 6.28, v = (gg ? 1.6 : 1) + Math.random() * (gg ? 3.4 : 2.2); lanzar(i % 3 ? 'estrella' : 'humo', tx + Math.cos(a) * 6, ty + Math.sin(a) * 6, Math.cos(a) * v, Math.sin(a) * v - .6, 12 + (i % 4) * 3); }
      if (gg) { es.classList.remove('sacude'); void es.offsetWidth; es.classList.add('sacude'); setTimeout(() => es.classList.remove('sacude'), 1100); }
    } else if (tipo === 'confeti') { sfx.pop(); chispas(tx, ty - 8, 44, 3.2, .09, 34); }
    else if (tipo === 'fuegos') { sfx.cohete(); chispas(tx, ty - 30, 16, 2.4, .05, 24); }
    else if (tipo === 'pastel') { sfx.splat(); chispas(tx, ty - 6, 22, 2.6, .12, 26, ['crema']); }
    else if (tipo === 'monedas') { sfx.moneda(); setTimeout(() => sfx.moneda(), 140); setTimeout(() => sfx.moneda(), 300); chispas(tx, ty - 24, 14, 1.8, .16, 40, ['moneda']); }
    e.st.bombas++; ganar(8 + ({ monedas: 15, gigante: 12, fuegos: 4, confeti: 4 }[tipo] || 0), 4, true); gesto('baile'); hablar(); decir('Sí.', e.traductor ? ({ confeti: '¡¡FIESTA!!', fuegos: '¡Qué bonito!', pastel: '¡¡SPLAT!!', monedas: '¡¡Dinero!!', gigante: '¡¡BOOOOOM!!' }[tipo] || '¡¡BOOM!!') : null, 3000); pintar(); guardar();
  }
  function bombaAvanza() {
    if (desc && !bm && !dlg && cortex.p >= 1 && tk % 16 === 0) lanzar('z', cxb() + 34, SY + SH - 70, .4, -1, 16);
    if (hollin === true && cortex.p > 0 && tk % 9 === 0) lanzar('humo', cxb() + 26 + Math.random() * 8, SY + SH - 62, .1, -.9, 14);
    if (!bm || bm.fase === 'adios') return;
    bm.t++;
    if (bm.fase === 'vuelo') { if (bm.t % 2 === 0) sfx.tic(); if (bm.t >= VUELO) explotar(); }
    if (bm.fase === 'boom' && bm.tipo === 'fuegos' && [3, 8, 13, 18, 23, 27].includes(bm.t)) { sfx.cohete(); const tx = cxb() + 30, ty = SY + SH - 34; chispas(tx + (Math.random() * 70 - 35), ty - 52 - Math.random() * 34, 18, 2.6, .05, 24, ['cf' + (bm.t % 6), 'cf' + ((bm.t + 2) % 6), 'cf5']); }
    if (bm.fase === 'boom' && bm.t >= (bm.dur || 16)) {
      bm.fase = 'habla';
      dialogo(lineasBomba(), () => cortexSale(finDesc));
    }
  }
  function dibujarBomba(cx, cy) {
    if (!bm) return;
    const tx = cx + 30, ty = cy + 40;
    if (bm.fase === 'vuelo') {
      const q = bm.t / VUELO, x = SX - 24 + 46 + (tx - (SX - 24 + 46)) * q, y = SY + 22 + (ty - (SY + 22)) * q - Math.sin(Math.PI * q) * 36;
      ctx.drawImage(sprite('bomba_v', FGRID.bomba, 0), Math.round(x - 6), Math.round(y - 7));
      ctx.fillStyle = tk % 2 ? '#ffe45a' : '#ff5a28'; ctx.fillRect(Math.round(x) + 3, Math.round(y) - 8, 2, 2);
    } else if (bm.fase === 'boom' && bm.t <= (bm.tipo === 'gigante' ? 16 : 12) && !['confeti', 'fuegos'].includes(bm.tipo)) {
      const gg = bm.tipo === 'gigante', cr = bm.tipo === 'pastel', mo = bm.tipo === 'monedas', M = gg ? 1.8 : cr || mo ? .7 : 1;
      const r = (bm.t < 5 ? 6 + bm.t * 5 : Math.max(2, 31 - (bm.t - 5) * 4)) * M;
      (cr ? [['#ffc8d8', 1], ['#fff6ea', .68], ['#ffffff', .34]] : mo ? [['#e8a820', 1], ['#ffd84a', .68], ['#fff6b0', .34]] : [['#ff6a28', 1], ['#ffd84a', .68], ['#ffffff', .34]]).forEach(([c, k]) => {
        ctx.fillStyle = c; const R2 = Math.round(r * k);
        for (let yy = -R2; yy <= R2; yy++) { const w = Math.round(Math.sqrt(R2 * R2 - yy * yy)); ctx.fillRect(tx - w, ty + yy, w * 2, 1); }
      });
    }
  }
  function cardBomba() {
    const n = e.bombas || 0;
    return `<div class="card"><div class="pv"><canvas data-prev="fd_bomba"></canvas></div><div class="cn">BOMBA</div><div style="font-size:6px;color:#4a5090;line-height:1.5">¡BOOM!</div><button class="bt ${e.monedas >= BOMBA_PRECIO ? 'ok' : 'no'}" data-a="b_comprar">$ ${BOMBA_PRECIO}</button><div style="font-size:6px;color:#4a5090">TIENES: ${n}</div></div>`;
  }
  function comprarBomba() {
    if (e.monedas < BOMBA_PRECIO) { faltanMon(BOMBA_PRECIO - e.monedas); sfx.no(); return; }
    if ((e.bombas || 0) >= BOMBA_MAX) { toast('Ya tienes demasiadas'); return; }
    e.monedas -= BOMBA_PRECIO; if (typeof animarMonedas === 'function') animarMonedas(BOMBA_PRECIO, true); e.bombas = (e.bombas || 0) + 1; e.st.compras++; sfx.compra(); toast('¡COMPRASTE: BOMBA!'); pintar(); guardar(); render();
  }
  $('t-bomba').onclick = lanzarBomba;

  

/* ===================== MINIJUEGO: ATRAPA EL KEKE ===================== */
  // (MJ_COSTO, MJ_NV, MJH, MJ_MON definidos en config.js)
  function iconoMj() {
    const g = Grid(11, 11), m = ['...........', '..kkkkkkk..', '.kwwwwwwwk.', 'kwwkwwwrwwk', 'kwkkkwwwrwk', 'kwwkwwgwwwk', 'kwwwwwwwwwk', '.kwwwwwwwk.', '..kk...kk..', '...........', '...........'];
    m.forEach((f, y) => [...f].forEach((ch, x) => { if (ch === 'w') g.set(x, y, '#e8ecff'); else if (ch === 'k') g.set(x, y, '#232b63'); else if (ch === 'r') g.set(x, y, '#ff4a5c'); else if (ch === 'g') g.set(x, y, '#58d048'); }));
    return g;
  }
  function renderMj() {
    $('m-titulo').textContent = 'MINIJUEGOS';
    return `<div class="centro" style="font-size:8px;line-height:1.9;color:#aab4ff;margin-bottom:10px">¡Elige un juego!</div><div class="cuadricula">` +
      `<div class="card"><div class="pv"><canvas data-prev="fd_keke"></canvas></div><div class="cn">ATRAPA EL KEKE</div>${nivel() >= MJ_NV ? `<div style="font-size:6px;color:#4a5090;line-height:1.6">RÉCORD: ${e.mj.rec}</div><button class="bt ok" data-a="mj_jugar">JUGAR</button>` : `<div class="est bloq">CARIÑO NV${MJ_NV}</div>`}</div>` +
      `<div class="card"><div class="pv"><canvas data-prev="mj_mem"></canvas></div><div class="cn">MEMORIA CON CORTEX</div>${nivel() >= MEM_NV ? `<div style="font-size:6px;color:#4a5090;line-height:1.6">RÉCORD: ${e.mem.rec}</div><button class="bt ok" data-a="mem_jugar">JUGAR</button>` : `<div class="est bloq">CARIÑO NV${MEM_NV}</div>`}</div>` +
      `<div class="card"><div class="pv"><canvas data-prev="mj_run"></canvas></div><div class="cn">CORRE, SIMON</div>${nivel() >= RUN_NV ? `<div style="font-size:6px;color:#4a5090;line-height:1.6">RÉCORD: ${e.run.rec}</div><button class="bt ok" data-a="run_jugar">JUGAR</button>` : `<div class="est bloq">CARIÑO NV${RUN_NV}</div>`}</div>` +
      `<div class="card"><div class="pv"><canvas data-prev="mj_rt"></canvas></div><div class="cn">BAILA CON SIMON</div>${nivel() >= RT_NV ? `<div style="font-size:6px;color:#4a5090;line-height:1.6">RÉCORD: ${e.rt.rec}</div><button class="bt ok" data-a="rt_jugar">JUGAR</button>` : `<div class="est bloq">CARIÑO NV${RT_NV}</div>`}</div></div>` +
      `<div class="centro" style="font-size:7px;line-height:1.9;color:#aab4ff;margin-top:12px">Cada juego gasta ${MJ_COSTO} de energía.</div>`;
  }
  let mj = null;
  const mjCv = $('mj-cv'), mjX = mjCv.getContext('2d'); mjCv.height = MJH;
  mjX.imageSmoothingEnabled = false;
  function mjIniciar() {
    if (e.dormido) { cerrar(); decir('Zzz...'); sfx.no(); return; }
    if (nivel() < MJ_NV) { toast('Se desbloquea en cariño NV' + MJ_NV); sfx.no(); return; }
    if (e.energia < MJ_COSTO) { cerrar(); decir('Sí...', e.traductor ? 'Estoy muy cansado.' : null); hablar(); sfx.no(); avisoSueno(); return; }
    if (e.enf) { cerrar(); decir('Sí... ¡achú!', e.traductor ? 'Resfriado no puedo jugar.' : null, 3000); sfx.no(); return; }
    cerrar(false);
    e.energia = clamp(e.energia - sifE(MJ_COSTO)); pintar();
    mj = { x: 48, objetivo: 48, vidas: 3, pts: 0, monedas: 0, t: 0, sp: .5, items: [], fx: [], inv: 0, tiembla: 0, ult: performance.now(), raf: 0, fin: false, boca: 0 };
    $('mj-fin').classList.remove('on'); $('mj').classList.add('on'); mjHud();
    mj.raf = requestAnimationFrame(mjLoop);
  }
  function mjHud() { $('mj-pts').textContent = mj.pts; $('mj-mon').textContent = '$' + (mj.monedas * MJ_MON); $('mj-vid').textContent = '♥'.repeat(Math.max(0, mj.vidas)) + '·'.repeat(3 - Math.max(0, mj.vidas)); }
  function mjLoop(now) {
    if (!mj) return;
    const dt = Math.min(.05, (now - mj.ult) / 1000); mj.ult = now;
    if (!mj.fin && !document.hidden) mjUpdate(dt);
    mjDibuja();
    mj.raf = requestAnimationFrame(mjLoop);
  }
  function mjUpdate(dt) {
    mj.t += dt;
    mj.x += (mj.objetivo - mj.x) * Math.min(1, dt * 14);
    if (mj.inv > 0) mj.inv -= dt; if (mj.tiembla > 0) mj.tiembla -= dt; if (mj.boca > 0) mj.boca -= dt;
    mj.sp0 = (mj.sp0 === undefined ? .6 : mj.sp0) - dt;
    if (mj.sp0 <= 0) {                                               // aparece algo nuevo
      mj.sp0 = Math.max(.32, .85 - mj.t * .007);
      const pB = Math.min(.42, .16 + mj.t * .004), r = Math.random(), tipo = r < pB ? 'bomba' : r < pB + .07 ? 'moneda' : 'keke';
      mj.items.push({ tipo, x: 8 + Math.random() * 80, y: -10, v: Math.min(100, 36 + mj.t * .9) * (.85 + Math.random() * .3) });
    }
    const topY = MJH - 14 - 50, boca = { x0: mj.x - 15, x1: mj.x + 15, y0: topY + 6, y1: topY + 34 };
    mj.items = mj.items.filter(it => {
      it.y += it.v * dt;
      const w = it.tipo === 'moneda' ? 12 : 14;
      if (it.x > boca.x0 - w / 2 && it.x < boca.x1 + w / 2 && it.y + w / 2 > boca.y0 && it.y < boca.y1) {
        if (it.tipo === 'bomba') {
          if (mj.inv <= 0) { mj.vidas--; mj.inv = 1; mj.tiembla = .35; sfx.boom ? sfx.boom() : sfx.no(); mjHud(); mj.fx.push({ k: 'boom', x: it.x, y: it.y, t: 0 }); if (mj.vidas <= 0) mjFin(); return false; }
          return true;
        }
        mj.pts += it.tipo === 'moneda' ? 3 : 1; if (it.tipo === 'moneda') mj.monedas++; mj.boca = .25; sfx.moneda(); mjHud();
        mj.fx.push({ k: 'estrella', x: it.x, y: it.y, t: 0 }); return false;
      }
      if (it.y > MJH - 14) { if (it.tipo === 'bomba') { mj.fx.push({ k: 'boom', x: it.x, y: MJH - 16, t: 0 }); } return false; }
      return true;
    });
    mj.fx.forEach(f => f.t += dt); mj.fx = mj.fx.filter(f => f.t < .45);
  }
  function mjDibuja() {
    const c = mjX, W = 96, H = MJH;
    const tx = mj.tiembla > 0 ? Math.round(Math.sin(mj.t * 90) * 2) : 0;
    c.save(); c.translate(tx, 0);
    const bandas = ['#6cc0ff', '#7ccaff', '#8ad0ff', '#9ad8ff', '#aae0ff', '#bfe8ff'];
    bandas.forEach((col, i) => { c.fillStyle = col; c.fillRect(-4, Math.round(i * MJH / 6), W + 8, Math.ceil(MJH / 6) + 1); });
    c.fillStyle = '#ffe45a'; c.fillRect(76, 12, 10, 10); c.fillStyle = '#fff6b0'; c.fillRect(78, 14, 6, 6);
    [[10, 30, 22], [52, 54, 26], [20, 84, 18]].forEach(([x, y, w], i) => { const dx = Math.round((mj.t * (3 + i)) % (W + 40)) - 20; c.fillStyle = '#ffffff'; c.fillRect((x + dx) % (W + 30) - 20, y, w, 5); c.fillRect((x + dx) % (W + 30) - 16, y - 3, w - 8, 3); });
    c.fillStyle = '#58b848'; c.fillRect(-4, H - 14, W + 8, 14); c.fillStyle = '#48a038'; for (let x = -4; x < W + 4; x += 8) c.fillRect(x + ((x >> 3) % 2) * 4, H - 8, 4, 8); c.fillStyle = '#7ad868'; c.fillRect(-4, H - 14, W + 8, 2);
    mj.items.forEach(it => {
      if (it.tipo === 'bomba') { const sp = sprite('bomba_v', FGRID.bomba, 0); c.drawImage(sp, Math.round(it.x - sp.width / 2), Math.round(it.y - sp.height / 2)); c.fillStyle = (mj.t * 12 | 0) % 2 ? '#ffe45a' : '#ff5a28'; c.fillRect(Math.round(it.x) + 2, Math.round(it.y - sp.height / 2) - 2, 2, 2); }
      else if (it.tipo === 'moneda') { const sp = sprite('fx_moneda', FX.moneda, 0); c.drawImage(sp, Math.round(it.x - 6), Math.round(it.y - 6), 12, 12); }
      else { const sp = sprite('fx_pizza', FX.pizza, 0); c.drawImage(sp, Math.round(it.x - sp.width / 2), Math.round(it.y - sp.height / 2)); }
    });
    const ojos = 'a', boca = mj.boca > 0 ? 's' : mj.vidas <= 1 ? 'n' : 's';
    const sp = sprite('simon_' + ojos + boca + '|' + ropaSig() + '|0000', () => simonGrid(ojos, boca, e.ropa, {}), 0);
    if (!(mj.inv > 0 && (mj.t * 14 | 0) % 2)) c.drawImage(sp, 0, 0, 56, 78, Math.round(mj.x - 18), MJH - 14 - 50, 36, 50);
    mj.fx.forEach(f => {
      if (f.k === 'boom') { const r = Math.round(4 + f.t * 40); [['#ff6a28', 1], ['#ffd84a', .66], ['#ffffff', .33]].forEach(([col, k]) => { c.fillStyle = col; const R2 = Math.round(r * k); for (let yy = -R2; yy <= R2; yy++) { const w = Math.round(Math.sqrt(R2 * R2 - yy * yy)); c.fillRect(Math.round(f.x) - w, Math.round(f.y) + yy, w * 2, 1); } }); }
      else { const sp2 = sprite('fx_estrella', FX.estrella, 0); c.drawImage(sp2, Math.round(f.x - 2), Math.round(f.y - 8 * f.t * 4)); }
    });
    c.restore();
  }
  function mjFin() {
    if (mj.fin) return; mj.fin = true;
    const pts = mj.pts, antes = e.mj.rec;
    const bonoNv = mj.monedas > 0 ? bonoNivelJuego() : 0, gana = mj.monedas * MJ_MON + bonoNv;
    e.st.mj++;
    e.feliz = clamp(e.feliz + Math.min(30, 8 + Math.floor(pts / 2))); e.hambre = clamp(e.hambre - 3);
    let nuevo = false;
    if (pts > antes) { if (antes > 0) e.mj.rompio = 1; e.mj.rec = pts; nuevo = antes > 0; }
    if (gana) ganar(gana, 0, true); ganar(0, 3 + Math.min(8, Math.floor(pts / 6)));
    mision('jugar'); revisar(); pintar(); guardar();
    $('mj-res').innerHTML = `MONEDAS ATRAPADAS: ${mj.monedas}<br>RÉCORD: ${e.mj.rec}${nuevo ? '<br><span style="color:#ffd84a">¡NUEVO RÉCORD!</span>' : ''}<br>+${gana} MONEDAS`;
    $('mj-otra').style.opacity = e.energia >= MJ_COSTO ? 1 : .4;
    $('mj-fin').classList.add('on'); if (nuevo && (!celQ || !celQ.length)) sfx.nivel();
  }
  function mjSalir() { if (!mj) return; if (!mj.fin) mjFin(); cancelAnimationFrame(mj.raf); mj = null; $('mj').classList.remove('on'); $('mj-fin').classList.remove('on'); pintar(); hablar(); corazones(2); if (typeof celebraCheck === 'function' && celQ && celQ.length) celebraCheck(); if (typeof navPop === 'function') navPop(); }
  function mjMueve(ev) { if (!mj || mj.fin) return; const r = mjCv.getBoundingClientRect(); if (!r || !r.width) return; mj.objetivo = Math.max(14, Math.min(82, (ev.clientX - r.left) / r.width * 96)); }
  mjCv.addEventListener('pointerdown', ev => { mjMueve(ev); try { mjCv.setPointerCapture(ev.pointerId); } catch (_) {} });
  mjCv.addEventListener('pointermove', mjMueve);
  document.addEventListener('keydown', ev => { if (!mj || mj.fin) return; if (ev.key === 'ArrowLeft') mj.objetivo = Math.max(14, mj.objetivo - 10); if (ev.key === 'ArrowRight') mj.objetivo = Math.min(82, mj.objetivo + 10); });

  /* ===================== MINIJUEGO DE RITMO: BAILA CON SIMON ===================== */
  // (RT_COSTO, RT_NV, RT_DIV definidos en config.js)
  var hz = typeof hz !== 'undefined' ? hz : (n => 440 * Math.pow(2, (n - 69) / 12));
  const RT_STEP = .25, RT_PASOS = 144, RT_LEAD = 1.2, RT_V = 100, RT_Y = 150, RT_FIN = RT_LEAD + RT_PASOS * RT_STEP + .8;
  const RT_ROOTS = [48, 45, 41, 43], RT_COL = ['#ff4a5c', '#ffd84a', '#4ac8ff'], RT_X = [16, 48, 80];
  let rt = null;
  const rtCv = $('rt-cv'), rtX = rtCv.getContext('2d'); rtCv.height = 176; rtX.imageSmoothingEnabled = false;
  function rtNotas() {
    let sd = hashStr('rt' + hoy()); const rnd = () => { sd = (Math.imul(sd, 1664525) + 1013904223) >>> 0; return sd / 4294967296; };
    const out = []; let lane = 1, prev = -9;
    for (let i = 8; i < RT_PASOS - 4; i++) {
      const dens = .3 + .3 * (i / RT_PASOS), fuerte = i % 4 === 0;
      if (rnd() < (fuerte ? dens + .35 : dens * .7)) {
        const r = rnd(); let l = r < .4 ? lane : r < .72 ? (lane + 1) % 3 : (lane + 2) % 3;
        if (i - prev === 1 && l === lane) l = (l + 1) % 3;
        lane = l; prev = i; out.push({ s: i, tn: RT_LEAD + i * RT_STEP, l, ok: 0 });
      }
    }
    return out;
  }
  const rtReloj = () => (rt && rt.aud ? ac.currentTime : performance.now() / 1000);
  function rtIniciar() {
    if (e.dormido) { cerrar(); decir('Zzz...'); sfx.no(); return; }
    if (nivel() < RT_NV) { toast('Se desbloquea en cariño NV' + RT_NV); sfx.no(); return; }
    if (e.enf) { cerrar(); decir('Sí... ¡achú!', e.traductor ? 'Resfriado no puedo bailar.' : null, 3000); sfx.no(); return; }
    if (e.energia < RT_COSTO) { cerrar(); decir('Sí...', e.traductor ? 'Estoy muy cansado.' : null); hablar(); sfx.no(); avisoSueno(); return; }
    cerrar(false); e.energia = clamp(e.energia - sifE(RT_COSTO)); pintar(); musicaOff(); lluviaOff();
    const a = !e.mudo && audio();
    rt = { notas: rtNotas(), pts: 0, combo: 0, mejor: 0, per: 0, bien: 0, fall: 0, t: 0, t0: 0, fin: false, raf: 0, aud: !!a, sig: 0, timer: 0, pad: [0, 0, 0], lado: 1, bail: 0, boca: 0 };
    rt.t0 = rtReloj() + .1;
    $('rt-fin').classList.remove('on'); $('rt').classList.add('on'); rtHud(); $('rt-juez').className = '';
    if (rt.aud) { rt.timer = setInterval(rtAgenda, 80); rtAgenda(); }
    rt.raf = requestAnimationFrame(rtLoop);
  }
  function rtHud() { $('rt-pts').textContent = rt.pts; $('rt-combo').textContent = rt.combo >= 2 ? 'x' + rt.combo : ''; }
  function rtJuez(t, col) { const j = $('rt-juez'); j.textContent = t; j.style.color = col; j.className = ''; void j.offsetWidth; j.className = 'on'; }
  function ruidoR(t, dur, vol) {
    try {
      const n = Math.floor(ac.sampleRate * dur), b = ac.createBuffer(1, n, ac.sampleRate), x = b.getChannelData(0);
      for (let i = 0; i < n; i++) x[i] = (Math.random() * 2 - 1) * (1 - i / n);
      const sr = ac.createBufferSource(), g = ac.createGain(); sr.buffer = b; g.gain.value = vol; sr.connect(g); g.connect(ac.destination);
      sr.start(Math.max(ac.currentTime, t));
    } catch (_) {}
  }
  function rtPaso(st, t) {
    try {
      const r = RT_ROOTS[Math.floor(st / 16) % 4];
      if (st % 4 === 0) nota(hz(r), RT_STEP * 3.2, t, 'triangle', .09);
      if (st % 8 === 0) nota(80, .14, t, 'sine', .14);
      if (st % 2 === 0) nota(hz(r + 24 + [0, 4, 7, 12][(st >> 1) % 4]), RT_STEP * 1.6, t, 'square', .012);
      if (st % 4 === 2) ruidoR(t, .03, .05);
    } catch (_) {}
  }
  function rtAgenda() {
    if (!rt || !rt.aud || rt.fin) return;
    const lim = ac.currentTime + .45;
    while (rt.sig < RT_PASOS + 6) {
      const t = rt.t0 + RT_LEAD + rt.sig * RT_STEP; if (t > lim) break;
      if (t >= ac.currentTime - .05) rtPaso(rt.sig, t);
      rt.sig++;
    }
  }
  function rtTap(l) {
    if (!rt || rt.fin) return;
    const now = rt.t; rt.pad[l] = .12;
    let mejor = null, dm = 9;
    rt.notas.forEach(n => { if (n.l === l && !n.ok) { const d = Math.abs(n.tn - now); if (d < dm) { dm = d; mejor = n; } } });
    if (mejor && dm <= .17) {
      mejor.ok = 1; const per = dm <= .08;
      if (per) rt.per++; else rt.bien++;
      rt.combo++; rt.mejor = Math.max(rt.mejor, rt.combo); rt.pts += per ? 3 : 2; if (rt.combo % 10 === 0) { rt.pts += 5; }
      rt.lado = l; rt.bail = .25; rt.boca = .3;
      const st = Math.round((mejor.tn - RT_LEAD) / RT_STEP), rr = RT_ROOTS[Math.floor(st / 16) % 4];
      seq([hz(rr + 24 + [0, 4, 7][l] + (per ? 12 : 0))], .2, 'square', .05);
      rtJuez(per ? '¡PERFECTO!' : '¡BIEN!', per ? '#ffd84a' : '#9bf0a8');
      if (rt.combo % 10 === 0) { estrellas(0); }
    } else {
      rt.combo = 0; rt.pts = Math.max(0, rt.pts - 1); seq([110], .12, 'square', .03);
    }
    rtHud();
  }
  function rtLoop() {
    if (!rt) return;
    rt.t = rtReloj() - rt.t0;
    if (!rt.fin) {
      rt.notas.forEach(n => { if (!n.ok && rt.t > n.tn + .17) { n.ok = -1; rt.fall++; if (rt.combo >= 3) rtJuez('FALLÓ', '#ff6a78'); rt.combo = 0; rtHud(); } });
      for (let i = 0; i < 3; i++) if (rt.pad[i] > 0) rt.pad[i] -= .016;
      if (rt.bail > 0) rt.bail -= .016; if (rt.boca > 0) rt.boca -= .016;
      if (rt.t >= RT_FIN) rtFin();
    }
    rtDibuja();
    rt.raf = requestAnimationFrame(rtLoop);
  }
  function rtDibuja() {
    const c = rtX, W = 96, H = 176, t = rt.t, beat = Math.max(0, (t - RT_LEAD) / (RT_STEP * 4)), fb = beat - Math.floor(beat);
    c.fillStyle = '#2a1850'; c.fillRect(0, 0, W, H);
    [['#321c62', 0], ['#3a2272', 60]].forEach(([col, y]) => { c.fillStyle = col; c.fillRect(0, y, W, 60); });
    // luces del escenario
    const lc = ['#ff4a5c', '#ffd84a', '#4ac8ff'];
    for (let i = 0; i < 3; i++) { c.globalAlpha = (Math.floor(beat) % 3 === i ? .35 : .1) * (1 - fb * .6); c.fillStyle = lc[i]; c.fillRect(RT_X[i] - 15, 0, 30, RT_Y + 4); }
    c.globalAlpha = 1;
    // pista
    for (let y = 0; y < 4; y++) for (let x = 0; x < 6; x++) { c.fillStyle = (x + y + Math.floor(beat)) % 2 ? '#4a2a88' : '#5a34a0'; c.fillRect(x * 16, RT_Y + 12 + y * 4, 16, 4); }
    // Simon bailando
    const b = Math.abs(Math.sin(Math.max(0, t - RT_LEAD) / (RT_STEP * 4) * Math.PI)) * 3, esp = rt.bail > 0 ? (rt.lado - 1) * 5 : 0;
    const sp = sprite('simon_a' + (rt.boca > 0 ? 's' : 'n') + '|' + ropaSig() + '|0000', () => simonGrid('a', rt.boca > 0 ? 's' : 'n', e.ropa, {}), 0);
    const sw = 28, sh = 39, sx = 48 + esp - sw / 2, sy = 10 - b - (rt.bail > 0 ? 3 : 0);
    c.save(); if (rt.bail > 0 && rt.lado === 2) { c.translate(sx * 2 + sw, 0); c.scale(-1, 1); } c.drawImage(sp, 0, 0, 56, 78, Math.round(sx), Math.round(sy), sw, sh); c.restore();
    // carriles y pads
    for (let i = 0; i < 3; i++) {
      c.fillStyle = 'rgba(255,255,255,.07)'; c.fillRect(RT_X[i] - 14, 0, 28, RT_Y);
      c.fillStyle = RT_COL[i]; c.globalAlpha = rt.pad[i] > 0 ? 1 : .55; c.fillRect(RT_X[i] - 13, RT_Y, 26, 6); c.globalAlpha = 1;
      c.fillStyle = '#ffffff'; c.fillRect(RT_X[i] - 13, RT_Y, 26, 1);
    }
    rt.notas.forEach(n => {
      if (n.ok) return; const y = RT_Y - (n.tn - t) * RT_V; if (y < -10 || y > RT_Y + 12) return;
      c.fillStyle = '#1a0f33'; c.fillRect(RT_X[n.l] - 12, Math.round(y) - 6, 24, 10);
      c.fillStyle = RT_COL[n.l]; c.fillRect(RT_X[n.l] - 11, Math.round(y) - 5, 22, 8);
      c.fillStyle = 'rgba(255,255,255,.6)'; c.fillRect(RT_X[n.l] - 11, Math.round(y) - 5, 22, 2);
    });
    $('rt-prog').style.width = Math.max(0, Math.min(1, t / RT_FIN)) * 88 + 'px';
    if (t < RT_LEAD - .1) { c.fillStyle = '#fff'; c.font = '10px PS2P, monospace'; c.fillText(t < .3 ? '¡LISTO!' : '¡A BAILAR!', 14, 96); }
  }
  function rtFin() {
    if (!rt || rt.fin) return; rt.fin = true; clearInterval(rt.timer);
    const tot = rt.notas.length || 1, acc = Math.round((rt.per + rt.bien) / tot * 100);
    const base = Math.floor(rt.pts / RT_DIV), bonoNv = base > 0 ? bonoNivelJuego() : 0, gana = base + bonoNv;
    e.st.rt++;
    e.feliz = clamp(e.feliz + Math.min(30, 10 + Math.floor(acc / 5))); e.hambre = clamp(e.hambre - 3);
    const antes = e.rt.rec; let nuevo = false; if (rt.pts > antes) { e.rt.rec = rt.pts; nuevo = antes > 0; }
    if (gana) ganar(gana, 0, true); ganar(0, 3 + Math.min(8, Math.floor(acc / 12)));
    mision('jugar'); revisar(); pintar(); guardar();
    const nota_ = acc >= 90 ? 'S' : acc >= 75 ? 'A' : acc >= 55 ? 'B' : 'C';
    $('rt-res').innerHTML = `NOTA: ${nota_} (${acc}%)<br>PUNTOS: ${rt.pts}<br>MEJOR COMBO: ${rt.mejor}<br>RÉCORD: ${e.rt.rec}${nuevo ? '<br><span style="color:#ffd84a">¡NUEVO RÉCORD!</span>' : ''}<br>+${gana} MONEDAS`;
    $('rt-otra').style.opacity = e.energia >= RT_COSTO ? 1 : .4;
    $('rt-fin').classList.add('on'); if ((acc >= 75 || nuevo) && (!celQ || !celQ.length)) sfx.nivel(); gesto('baile');
  }
  function rtSalir() { if (!rt) return; if (!rt.fin) rtFin(); cancelAnimationFrame(rt.raf); clearInterval(rt.timer); rt = null; $('rt').classList.remove('on'); $('rt-fin').classList.remove('on'); musicaOn(); pintar(); hablar(); corazones(2); if (typeof celebraCheck === 'function' && celQ && celQ.length) celebraCheck(); if (typeof navPop === 'function') navPop(); }
  rtCv.addEventListener('pointerdown', ev => { if (!rt) return; ev.preventDefault(); const r = rtCv.getBoundingClientRect(); if (!r || !r.width) return; rtTap(Math.max(0, Math.min(2, Math.floor((ev.clientX - r.left) / r.width * 3)))); });
  document.addEventListener('keydown', ev => { if (!rt || rt.fin) return; const m = { ArrowLeft: 0, a: 0, j: 0, ArrowDown: 1, s: 1, k: 1, ArrowRight: 2, d: 2, l: 2 }[ev.key]; if (m !== undefined) rtTap(m); });
  $('rt-x').onclick = () => { sfx.click(); rtSalir(); };
  $('rt-sal').onclick = () => { sfx.click(); rtSalir(); };
  $('rt-otra').onclick = () => { if (e.energia < RT_COSTO || e.enf) { sfx.no(); return; } sfx.click(); const ya = rt; cancelAnimationFrame(ya.raf); clearInterval(ya.timer); rt = null; $('rt').classList.remove('on'); rtIniciar(); };
  $('mj-x').onclick = () => { sfx.click(); mjSalir(); };
  $('mj-sal').onclick = () => { sfx.click(); mjSalir(); };
  $('mj-otra').onclick = () => { if (e.energia < MJ_COSTO) { sfx.no(); return; } sfx.click(); const ya = mj; cancelAnimationFrame(ya.raf); mj = null; $('mj').classList.remove('on'); mjIniciar(); };


  /* ===================== MINIJUEGO: CORRE, SIMON (estilo dinosaurio de Chrome) ===================== */
  // (RUN_COSTO, RUN_NV, RUN_MON definidos en config.js)
  const RUN_GY = 132, RUN_GRAV = 520, RUN_SALTO = 190, RUN_SX = 22;
  let run = null;
  const runCv = $('run-cv'), runX = runCv.getContext('2d'); runX.imageSmoothingEnabled = false;
  function runPts() { return Math.floor(run.dist / 20) + 5 * run.kekes; }
  function runIniciar() {
    if (e.dormido) { cerrar(); decir('Zzz...'); sfx.no(); return; }
    if (nivel() < RUN_NV) { toast('Se desbloquea en cariño NV' + RUN_NV); sfx.no(); return; }
    if (e.enf) { cerrar(); decir('Sí... ¡achú!', e.traductor ? 'Resfriado no puedo jugar.' : null, 3000); sfx.no(); return; }
    if (e.energia < RUN_COSTO) { cerrar(); decir('Sí...', e.traductor ? 'Estoy muy cansado.' : null); hablar(); sfx.no(); avisoSueno(); return; }
    cerrar(false); modal = 'run'; e.energia = clamp(e.energia - sifE(RUN_COSTO)); pintar();
    run = { t: 0, dist: 0, kekes: 0, monedas: 0, y: 0, vy: 0, suelo: true, obs: [], items: [], sig: 70, fx: [], fin: false, muerto: 0, ult: performance.now(), raf: 0, saltos: 0 };
    $('run-fin').classList.remove('on'); $('run-tip').style.display = ''; $('run').classList.add('on'); runHud();
    run.raf = requestAnimationFrame(runLoop);
  }
  function runHud() { const p = runPts(); $('run-pts').textContent = p; $('run-mon').textContent = '$' + (run.monedas * RUN_MON); }
  function runSalto() { if (!run || run.fin || run.muerto) return; $('run-tip').style.display = 'none'; if (!run.suelo) return; run.vy = RUN_SALTO; run.suelo = false; run.saltos++; sfx.click(); }
  function runLoop(now) {
    if (!run) return;
    const dt = Math.min(.04, (now - run.ult) / 1000); run.ult = now;
    if (!document.hidden) runUpdate(dt);
    runDibuja();
    run.raf = requestAnimationFrame(runLoop);
  }
  function runUpdate(dt) {
    if (run.fin) return;
    if (run.muerto) { run.muerto += dt; run.fx.forEach(f => f.t += dt); run.fx = run.fx.filter(f => f.t < .5); if (run.muerto > .9) runFin(); return; }
    run.t += dt; const v = Math.min(105, 58 + run.t * 1.6); run.v = v; run.dist += v * dt;
    if (!run.suelo) { run.y += run.vy * dt; run.vy -= RUN_GRAV * dt; if (run.y <= 0) { run.y = 0; run.vy = 0; run.suelo = true; } }
    run.sig -= v * dt;
    if (run.sig <= 0) {
      const r = Math.random(), tipo = r < .4 ? 'bote' : r < .65 ? 'caja' : r < .85 ? 'pila' : 'bomba', dim = { bote: [10, 15], caja: [14, 11], pila: [22, 15], bomba: [12, 12] }[tipo];
      const o = { tipo, x: 100, w: dim[0], h: dim[1] }; run.obs.push(o);
      if (Math.random() < .6) run.items.push({ tipo: Math.random() < .25 ? 'moneda' : 'keke', x: o.x + o.w / 2 - 5, y: 46 + Math.random() * 8, tomado: false });
      run.sig = v * .78 + 34 + Math.random() * 56;
      if (Math.random() < .2) run.items.push({ tipo: Math.random() < .25 ? 'moneda' : 'keke', x: 100 + run.sig / 2, y: 22, tomado: false });
    }
    const hx0 = RUN_SX - 6, hx1 = RUN_SX + 6, hy0 = run.y, hy1 = run.y + 30;   // caja de choque de Simon (altura sobre el suelo)
    run.obs.forEach(o => { o.x -= v * dt; });
    run.obs = run.obs.filter(o => o.x + o.w > -4);
    for (const o of run.obs) { if (hx1 > o.x + 1 && hx0 < o.x + o.w - 1 && hy0 < o.h - 1) { runChoca(o); return; } }
    run.items.forEach(it => { it.x -= v * dt; if (!it.tomado && it.x + 10 > hx0 && it.x < hx1 && it.y + 10 > hy0 && it.y < hy1) { it.tomado = true; if (it.tipo === 'moneda') run.monedas++; else run.kekes++; sfx.moneda(); runHud(); run.fx.push({ k: 'est', x: it.x, y: RUN_GY - it.y - 10, t: 0 }); } });
    run.items = run.items.filter(it => !it.tomado && it.x > -12);
    run.fx.forEach(f => f.t += dt); run.fx = run.fx.filter(f => f.t < .45);
    if (((run.dist / 20) | 0) !== run.pp) { run.pp = (run.dist / 20) | 0; runHud(); }
  }
  function runChoca(o) { run.muerto = .001; run.fx.push({ k: 'boom', x: RUN_SX, y: RUN_GY - run.y - 14, t: 0 }); sfx.boom ? sfx.boom() : sfx.no(); }
  function runDibuja() {
    const c = runX, W = 96, H = 176, t = run.t, sh = run.muerto && run.muerto < .35 ? Math.round(Math.sin(run.muerto * 90) * 2) : 0;
    c.save(); c.translate(sh, 0);
    ['#1e1448', '#2a1a62', '#3c2078', '#582a88', '#7a3a90', '#a04a90'].forEach((col, i) => { c.fillStyle = col; c.fillRect(-4, Math.round(i * RUN_GY / 6), W + 8, Math.ceil(RUN_GY / 6) + 1); });
    c.fillStyle = '#ffffff'; [[8, 10], [30, 30], [58, 14], [82, 40], [18, 62], [70, 74], [44, 52]].forEach(([x, y], i) => { if (((t * 2 + i) | 0) % 4) c.fillRect(x, y, 1, 1); });
    c.fillStyle = '#ffd1f0'; c.fillRect(70, 14, 12, 12); c.fillStyle = '#f4a8e0'; c.fillRect(72, 16, 3, 3); c.fillRect(77, 21, 3, 2);   // luna
    c.fillStyle = '#4a2a78'; const d1 = (run.dist * .12) % 140; for (let k = -1; k < 2; k++) { const bx = Math.round(k * 70 - d1 + 70); c.fillRect(bx, RUN_GY - 20, 22, 20); c.fillRect(bx + 4, RUN_GY - 28, 8, 8); c.fillRect(bx + 14, RUN_GY - 24, 6, 4); }   // montones de basura al fondo
    c.fillStyle = '#6a4aa0'; c.fillRect(-4, RUN_GY, W + 8, H - RUN_GY); c.fillStyle = '#8a6ac0'; c.fillRect(-4, RUN_GY, W + 8, 2);
    c.fillStyle = '#54388a'; const d2 = Math.round(run.dist % 16); for (let x = -16; x < W + 16; x += 16) { c.fillRect(x - d2, RUN_GY + 8, 6, 2); c.fillRect(x - d2 + 8, RUN_GY + 18, 3, 2); }
    run.obs.forEach(o => {
      const ox = Math.round(o.x), oy = RUN_GY - o.h;
      if (o.tipo === 'bomba') { const sp = sprite('bomba_v', FGRID.bomba, 0); c.drawImage(sp, ox + o.w / 2 - sp.width / 2, RUN_GY - sp.height); c.fillStyle = (t * 12 | 0) % 2 ? '#ffe45a' : '#ff5a28'; c.fillRect(ox + o.w / 2 + 2, RUN_GY - sp.height - 2, 2, 2); }
      else if (o.tipo === 'caja') { c.fillStyle = '#8a5a30'; c.fillRect(ox, oy, o.w, o.h); c.fillStyle = '#c08a50'; c.fillRect(ox, oy, o.w, 2); c.fillStyle = '#5a3a1a'; c.fillRect(ox + o.w / 2 - 1, oy, 2, o.h); }
      else { const n = o.tipo === 'pila' ? 2 : 1; for (let k = 0; k < n; k++) { const bx = ox + k * 12; c.fillStyle = '#aab4c8'; c.fillRect(bx, oy + 3, 10, 12); c.fillStyle = '#6a7490'; c.fillRect(bx + 2, oy + 5, 1, 8); c.fillRect(bx + 5, oy + 5, 1, 8); c.fillRect(bx + 8, oy + 5, 1, 8); c.fillStyle = '#d0d8e8'; c.fillRect(bx - 1, oy + 1, 12, 3); c.fillRect(bx + 3, oy, 4, 2); } }
    });
    run.items.forEach(it => { const sp = it.tipo === 'moneda' ? sprite('fx_moneda', FX.moneda, 0) : sprite('fx_pizza', FX.pizza, 0); c.drawImage(sp, Math.round(it.x), Math.round(RUN_GY - it.y - 10), 10, 10); });
    const boca = run.muerto ? 'n' : 's', sp = sprite('simon_a' + boca + '|' + ropaSig() + '|0000', () => simonGrid('a', boca, e.ropa, {}), 0);
    const rebote = run.suelo && !run.muerto ? ((t * 9 | 0) % 2) : 0, sy = RUN_GY - 38 + 1 - Math.round(run.y) + (rebote ? -1 : 0);
    if (!(run.muerto && (run.muerto * 14 | 0) % 2)) c.drawImage(sp, 0, 0, 56, 78, RUN_SX - 14, sy, 28, 39);
    run.fx.forEach(f => {
      if (f.k === 'boom') { const r = Math.round(4 + f.t * 36); [['#ff6a28', 1], ['#ffd84a', .66], ['#ffffff', .33]].forEach(([col, k]) => { c.fillStyle = col; const R2 = Math.round(r * k); for (let yy = -R2; yy <= R2; yy++) { const w = Math.round(Math.sqrt(R2 * R2 - yy * yy)); c.fillRect(Math.round(f.x) - w, Math.round(f.y) + yy, w * 2, 1); } }); }
      else { const sp2 = sprite('fx_estrella', FX.estrella, 0); c.drawImage(sp2, Math.round(f.x), Math.round(f.y - 8 * f.t * 4)); }
    });
    c.restore();
  }
  function runFin() {
    if (!run || run.fin) return; run.fin = true;
    const pts = runPts(), antes = e.run.rec;
    const bonoNv = run.monedas > 0 ? bonoNivelJuego() : 0, gana = run.monedas * RUN_MON + bonoNv;
    e.st.run++;
    e.feliz = clamp(e.feliz + Math.min(25, 6 + Math.floor(pts / 8))); e.hambre = clamp(e.hambre - 3);
    let nuevo = false; if (pts > antes) { e.run.rec = pts; nuevo = antes > 0; }
    if (gana) ganar(gana, 0, true); ganar(0, 3 + Math.min(8, Math.floor(pts / 30)));
    mision('jugar'); revisar(); pintar(); guardar();
    $('run-res').innerHTML = `PUNTOS: ${pts}<br>KEKES: ${run.kekes}<br>MONEDAS ATRAPADAS: ${run.monedas}<br>RÉCORD: ${e.run.rec}${nuevo ? '<br><span style="color:#ffd84a">¡NUEVO RÉCORD!</span>' : ''}<br>+${gana} MONEDAS`;
    $('run-otra').style.opacity = e.energia >= RUN_COSTO ? 1 : .4;
    $('run-fin').classList.add('on'); if (nuevo && (!celQ || !celQ.length)) sfx.nivel();
  }
  function runSalir() { if (!run) return; if (!run.fin && (run.muerto || run.t > 1)) runFin(); cancelAnimationFrame(run.raf); run = null; $('run').classList.remove('on'); $('run-fin').classList.remove('on'); modal = null; pintar(); hablar(); corazones(2); if (typeof celebraCheck === 'function' && celQ && celQ.length) celebraCheck(); if (typeof navPop === 'function') navPop(); }
  runCv.addEventListener('pointerdown', ev => { ev.preventDefault(); runSalto(); });
  document.addEventListener('keydown', ev => { if (!run || run.fin) return; if (ev.key === ' ' || ev.key === 'ArrowUp') { ev.preventDefault(); runSalto(); } });
  $('run-x').onclick = () => { sfx.click(); runSalir(); };
  $('run-sal').onclick = () => { sfx.click(); runSalir(); };
  $('run-otra').onclick = () => { if (e.energia < RUN_COSTO || e.enf) { sfx.no(); return; } sfx.click(); cancelAnimationFrame(run.raf); run = null; $('run').classList.remove('on'); $('run-fin').classList.remove('on'); modal = null; runIniciar(); };

  /* ===================== MINIJUEGO: MEMORIA CON CORTEX ===================== */
  // (MEM_COSTO, MEM_NV, MEM_DIV definidos en config.js)
  const MEM_RONDAS = [{ p: 6, c: 3, prev: 2600, par: 28, max: 5 }, { p: 8, c: 4, prev: 2400, par: 42, max: 7 }, { p: 10, c: 4, prev: 2200, par: 60, max: 9 }];
  let mem = null;
  function memDi(t, cls) { $('mem-cx').textContent = t; }
  function memRetrato() {
    const c = $('mem-p'), px = c.getContext('2d'); px.imageSmoothingEnabled = false; px.clearRect(0, 0, 76, 80);
    const kc = 'cortex'; sprite(kc, () => cortexGrid(false, null, false, false), 0); px.drawImage(gridCanvas(recorte(gridCache[kc], 7, 0, 46, 49)), 0, 0, 76, 80);
  }
  function memT(fn, ms) { const id = setTimeout(() => { if (mem) fn(); }, ms); mem.to.push(id); }
  function memIniciar() {
    if (e.dormido) { cerrar(); decir('Zzz...'); sfx.no(); return; }
    if (nivel() < MEM_NV) { toast('Se desbloquea en cariño NV' + MEM_NV); sfx.no(); return; }
    if (e.enf) { cerrar(); decir('Sí... ¡achú!', e.traductor ? 'Resfriado no puedo jugar.' : null, 3000); sfx.no(); return; }
    if (e.energia < MEM_COSTO) { cerrar(); decir('Sí...', e.traductor ? 'Estoy muy cansado.' : null); hablar(); sfx.no(); avisoSueno(); return; }
    cerrar(false); modal = 'mem'; e.energia = clamp(e.energia - sifE(MEM_COSTO)); pintar();
    mem = { ronda: 0, pts: 0, fallos: 0, combo: 0, mejorCombo: 0, rondasOk: 0, fin: false, to: [], cartas: [], a: null, lock: true, consec: 0, rf: 0, pistas: 0, t0: 0, perdio: false };
    $('mem-fin').classList.remove('on'); $('mem').classList.add('on'); memRetrato(); memRonda(); if (typeof navPush === 'function') navPush();
  }
  function memHud() { $('mem-r').textContent = 'RONDA ' + (mem.ronda + 1) + '/' + MEM_RONDAS.length; $('mem-pts').textContent = 'PTS ' + mem.pts; $('mem-f').textContent = 'FALLOS ' + mem.rf + '/' + MEM_RONDAS[mem.ronda].max; }
  function memRonda() {
    const R = MEM_RONDAS[mem.ronda], objs = mezclar(OBJ.slice(), Math.random).slice(0, R.p);
    mem.cartas = mezclar(objs.concat(objs), Math.random).map(o => ({ o, ok: false })); mem.a = null; mem.lock = true; mem.consec = 0; mem.rf = 0; mem.pistas = 0;
    const g = $('mem-grid'); g.innerHTML = ''; g.style.setProperty('--c', R.c);
    mem.cartas.forEach((c, i) => { const b = document.createElement('button'); b.className = 'mc up'; b.dataset.i = i; b.innerHTML = '<span class="q">?</span>'; b.appendChild(lienzoObj(c.o, false, 48)); g.appendChild(b); });
    memHud(); memDi(mem.ronda === 0 ? '¡Memoriza las cartas, Simon! Después se voltean.' : '¡Más cartas! Memoriza bien.');
    memT(() => { g.querySelectorAll('.mc').forEach(b => b.classList.remove('up')); mem.lock = false; mem.t0 = Date.now(); memDi('¡Ahora tú! Busca las parejas.'); sfx.click(); }, R.prev);
  }
  function memCarta(i) { return $('mem-grid').children[i]; }
  function memClick(i) {
    if (!mem || mem.lock || mem.fin) return; const c = mem.cartas[i]; if (!c || c.ok || mem.a === i) return;
    memCarta(i).classList.add('up'); sfx.click();
    if (mem.a == null) { mem.a = i; return; }
    const j = mem.a; mem.a = null; mem.lock = true;
    if (mem.cartas[j].o.id === c.o.id) {
      mem.cartas[j].ok = c.ok = true; mem.combo++; mem.mejorCombo = Math.max(mem.mejorCombo, mem.combo); mem.consec = 0;
      mem.pts += 10 + Math.min(10, (mem.combo - 1) * 2);
      [i, j].forEach(k => { memCarta(k).classList.remove('up'); memCarta(k).classList.add('up', 'ok'); }); sfx.moneda(); memHud();
      memDi(mem.combo >= 3 ? '¡Racha de ' + mem.combo + '! ¡Increíble!' : elige(['¡Esa es!', '¡Pareja!', '¡Qué memoria, Simon!', '¡Bien hecho!']));
      if (mem.cartas.every(x => x.ok)) memT(memRondaFin, 700); else memT(() => { mem.lock = false; }, 250);
    } else {
      mem.fallos++; mem.rf++; mem.combo = 0; mem.consec++; sfx.no(); memHud(); const resta = MEM_RONDAS[mem.ronda].max - mem.rf; memDi(resta <= 0 ? '¡Ay no! Ya no quedan intentos...' : resta === 1 ? '¡Cuidado! Te queda 1 intento.' : elige(['Uy, casi.', 'Esa no era.', 'Mmm... concéntrate.', 'Casi, casi. Otra vez.']));
      memT(() => {
        memCarta(i).classList.remove('up'); memCarta(j).classList.remove('up');
        if (mem.rf >= MEM_RONDAS[mem.ronda].max) { mem.perdio = true; memT(memFin, 600); return; }
        if (mem.consec >= 3 && mem.pistas < 1) {   // Cortex ayuda: enseña una pareja un momento
          const libres = mem.cartas.map((x, k) => k).filter(k => !mem.cartas[k].ok), k1 = libres[Math.floor(Math.random() * libres.length)];
          mem.pistas++; mem.consec = 0; memDi('Mmm... creo que vi algo ahí.'); memCarta(k1).classList.add('up');   // pista sutil: solo destella UNA carta
          memT(() => { memCarta(k1).classList.remove('up'); mem.lock = false; }, 650);
        } else mem.lock = false;
      }, 800);
    }
  }
  function memRondaFin() {
    const R = MEM_RONDAS[mem.ronda], t = (Date.now() - mem.t0) / 1000, bono = Math.max(0, 20 - mem.rf * 3) + Math.min(15, Math.max(0, Math.floor(R.par - t)));
    mem.pts += bono; mem.rondasOk++; memHud(); sfx.nivel();
    if (mem.ronda < MEM_RONDAS.length - 1) { memDi('¡Ronda superada! +' + bono + ' de bono. Vamos con más cartas.'); mem.ronda++; memT(memRonda, 1800); }
    else { memDi('¡Las superaste todas! +' + bono + ' de bono. ¡Eres un crack, Simon!'); memT(memFin, 1500); }
  }
  function memFin() {
    if (!mem || mem.fin) return; if (mem.perdio) memDi('Casi lo logras, Simon. ¡Otra vez!'); mem.fin = true; mem.to.forEach(clearTimeout); mem.lock = true;
    const base = Math.floor(mem.pts / MEM_DIV), bonoNv = base > 0 ? bonoNivelJuego() : 0, gana = base + bonoNv;
    e.st.mem++;
    e.feliz = clamp(e.feliz + Math.min(25, 8 + Math.floor(mem.pts / 20))); e.hambre = clamp(e.hambre - 3);
    const antes = e.mem.rec; let nuevo = false; if (mem.pts > antes) { e.mem.rec = mem.pts; nuevo = antes > 0; }
    if (gana) ganar(gana, 0, true); ganar(0, 3 + Math.min(6, Math.floor(mem.pts / 40)));
    mision('jugar'); revisar(); pintar(); guardar();
    $('mem-res').innerHTML = `${mem.perdio ? '<span style="color:#ff8a8a">SIN INTENTOS</span><br>' : ''}RONDAS: ${mem.rondasOk}/${MEM_RONDAS.length}<br>PUNTOS: ${mem.pts}<br>FALLOS: ${mem.fallos}<br>MEJOR RACHA: ${mem.mejorCombo}<br>RÉCORD: ${e.mem.rec}${nuevo ? '<br><span style="color:#ffd84a">¡NUEVO RÉCORD!</span>' : ''}<br>+${gana} MONEDAS`;
    $('mem-otra').style.opacity = e.energia >= MEM_COSTO ? 1 : .4;
    $('mem-fin').classList.add('on'); if ((mem.rondasOk >= 2 || nuevo) && (!celQ || !celQ.length)) sfx.nivel();
  }
  function memSalir() {
    if (!mem) return; if (!mem.fin && mem.pts > 0) memFin(); mem.to.forEach(clearTimeout); mem = null;
    $('mem').classList.remove('on'); $('mem-fin').classList.remove('on'); modal = null; pintar(); hablar(); corazones(2); setTimeout(saludar, 500); if (typeof navPop === 'function') navPop(); if (typeof celebraCheck === 'function' && celQ && celQ.length) celebraCheck();
  }
  $('mem-grid').addEventListener('pointerdown', ev => { const b = ev.target.closest('.mc'); if (!b || !mem) return; ev.preventDefault(); memClick(+b.dataset.i); });
  $('mem-x').onclick = () => { sfx.click(); memSalir(); };
  $('mem-sal').onclick = () => { sfx.click(); memSalir(); };
  $('mem-otra').onclick = () => { if (e.energia < MEM_COSTO || e.enf) { sfx.no(); return; } sfx.click(); mem.to.forEach(clearTimeout); mem = null; $('mem').classList.remove('on'); $('mem-fin').classList.remove('on'); modal = null; memIniciar(); };

  
/* ==========================================================================
 * LÓGICA PRINCIPAL Y SISTEMAS — SIMON: TU AMIGO VIRTUAL
 * ==========================================================================
 * Archivo: game.js
 * Responsabilidad: Bucle principal, minijuegos, sistema de sonido procedural,
 *                  eventos narrativos, Cortex, perro Sif, Pomodoro y UI.
 *
 * ÍNDICE DE SECCIONES:
 *  1. MINIJUEGO DE COCINA (Estufa cenital, cortes, cocción y emplatado)
 *  2. BUCLE DE JUEGO Y ANIMACIÓN (Canvas #sc, tick, dibujo de capas)
 *  3. MASCOTA SIF (El perro rescatado, caricias, ladridos y juego)
 *  4. AUDIO Y MÚSICA PROCEDURAL (Web Audio API, chiptune, lofi y ambientes)
 *  5. INTERFAZ Y SISTEMA DE DIÁLOGOS (HUD, barras, globos de texto RPG)
 *  6. SISTEMA CENTRAL DE EVENTOS (Colas y condiciones de ejecución)
 *  7. ECONOMÍA Y PROGRESIÓN (Niveles, cariño, logros y celebraciones)
 *  8. RUTINAS DIARIAS DE SIMON (Descubrimientos, dibujos, saludos)
 *  9. PERSONAJE CORTEX (Visitas regulares, siesta, bromas y bombas)
 * 10. HISTORIA DE INTRODUCCIÓN (Callejón, adopción, entrega de corona y traductor)
 * 11. EVENTOS SECRETOS (OVNI alienígena, Luna de Sangre, Luna Azul, Truenos)
 * 12. MINIJUEGO DEL BAÑO (Limpieza táctil en 5 etapas)
 * 13. MINIJUEGOS DEL ARCADE (Atrapa el keke, Ritmo, Corre Simon, Memoria)
 * 14. MENÚS Y VENTANAS (Tienda, inventario, vestidor, misiones, respaldo, admin)
 * 15. ESTUDIO POMODORO (Sesiones de estudio con música y lluvia)
 * 16. INICIALIZACIÓN (Arranque del juego y registro en window.__simon)
 * ========================================================================== */

  // (Sección de COCINA movida a minijuegos.js)

/* ===================== PINTADO Y CACHÉ ===================== */
  const NOCHE = [22, 28, 78];
  const gridCache = {}, canvasCache = {};
  function sprite(clave, construir, noche) {
    const k = clave + '|' + noche;
    if (canvasCache[k]) return canvasCache[k];
    const g = gridCache[clave] || (gridCache[clave] = construir());
    const cv = document.createElement('canvas');
    cv.width = g.w; cv.height = g.h;
    const cx = cv.getContext('2d'), im = cx.createImageData(g.w, g.h), d = g.d, o = im.data;
    for (let i = 0; i < d.length; i += 4) {
      const a = d[i + 3];
      if (!a) continue;
      o[i] = d[i] + (NOCHE[0] - d[i]) * noche; o[i + 1] = d[i + 1] + (NOCHE[1] - d[i + 1]) * noche; o[i + 2] = d[i + 2] + (NOCHE[2] - d[i + 2]) * noche; o[i + 3] = a;
    }
    cx.putImageData(im, 0, 0);
    return (canvasCache[k] = cv);
  }

  /* ===================== ANIMACIÓN ===================== */
  const cv = $('sc'), ctx = cv.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const SALTO = [-6, -12, -16, -12, -6, 0];
  let acar = null, acarT = 0;   // caricias: dedo moviéndose sobre Simon
  let tk = 0, saltoT = -1, bocaT = 0, parpadeoT = 0, gT = -1, gTipo = '';
  let act = null, proxAct = 60;
  const cortex = { p: 0, dir: 0, cb: null };
  const cxb = () => SX + 26;   // borde izquierdo de Cortex: siempre pegado a Simon, sea cual sea el ancho de la pantalla
  let dlg = null, introActiva = false;
  let avEn = false;
  function avisoSueno() { toast('SIMON ESTÁ CANSADO: DÉJALO DORMIR O DALE ALGO DE COMER'); }
  function noEst(msg) {
    const esc0 = escenaId();
    if (esc0 === 'estudio') { decir('Sí... (' + (msg || 'estoy en el estudio') + ')'); sfx.no(); return true; }
    if (esc0 === 'jardin') { toast('EN EL JARDÍN SOLO SE CUIDAN LAS PLANTAS'); sfx.no(); return true; }
    return false;
  }
  const GLEN = { baile: 14, giro: 10, robot: 16, twist: 12 };
  const GESTOS = [
    { nv: 1, id: 'salto', n: 'SALTITO' }, { nv: 3, id: 'baile', n: 'BAILE' }, { nv: 5, id: 'giro', n: 'GIRO' },
    { nv: 8, id: 'besos', n: 'BESOS' }, { nv: 12, id: 'gran', n: 'GRAN SHOW' }, { nv: 16, id: 'robot', n: 'ROBOT' }, { nv: 20, id: 'twist', n: 'TWIST' }
  ];
  function gesto(id) {
    if (!id) { const ok = GESTOS.filter(g => g.nv <= nivel()); id = ok[Math.floor(Math.random() * ok.length)].id; }
    gT = -1; gTipo = '';
    if (id === 'baile') { gTipo = 'baile'; gT = 0; saltoT = -1; }
    else if (id === 'giro') { gTipo = 'giro'; gT = 0; saltoT = 0; }
    else if (id === 'robot') { gTipo = 'robot'; gT = 0; saltoT = -1; }
    else if (id === 'twist') { gTipo = 'twist'; gT = 0; saltoT = -1; }
    else if (id === 'besos') { saltoT = 0; corazones(5); }
    else if (id === 'gran') { gTipo = 'giro'; gT = 0; saltoT = 0; corazones(4); estrellas(8); }
    else saltoT = 0;
  }
  const lim = (v, a, b) => Math.max(a, Math.min(b, v));
  const esMueble = k => { const it = ITEMS[k]; return !!it && it.tipo === 'cuarto' && ['izq', 'der', 'deco', 'decoP', 'juguete'].includes(it.slot); };
  const esFondo = k => { const it = ITEMS[k]; return !!it && (it.estilo === 'pared' || it.estilo === 'piso'); };   // papel tapiz / piso: se equipan directo, no se arrastran
  const DEF_FONDO = { pared: 'pared_azul' };   // al quitar un papel/piso, vuelve a esto (o a null = diseño original de la habitación)
  const usableAqui = k => { const it = ITEMS[k], t = it.tema; if (esFondo(k)) return !t || t === e.hab; if (it.exclusivo) return t === e.hab; if (e.hab === 'jardin') return t === 'jardin'; if (t === 'jardin') return e.hab === 'jardin'; if (e.hab === 'estudio') return t === 'estudio'; return (t !== 'estudio' && t !== 'bano') || t === e.hab; };   // ¿se puede usar/colocar en la habitación actual?
  const esPared = k => ITEMS[k].slot === 'decoP';
  // (DECO_MAX definido en config.js)
  const juguetePuesto = () => { const d = e.deco.find(x => ITEMS[x.k] && ITEMS[x.k].slot === 'juguete'); return d ? d.k : 'juguete_pelota'; };
  function estSlotsX(z) { return z === 'col' ? [14, 30, 46, 74, 90, 106] : [16, 36, 60, 84, 104]; }
  function estShelfY(DY) { return DY - 30; }
  function estPos(d) {
    const it = ITEMS[d.k], sp = sprite('mu_' + d.k, it.grid, 0), w = sp.width, h = sp.height, xs = estSlotsX(it.zona), cx = OX + xs[Math.max(0, Math.min(xs.length - 1, d.s | 0))];
    if (it.zona === 'col') { const y = 11; return { x: Math.round(cx - w / 2), y, w, h, cx, cy: y + h / 2, base: y + h }; }
    const base = estShelfY(estDY()); return { x: Math.round(cx - w / 2), y: base - h, w, h, cx, cy: base - h / 2, base };
  }
  function estSlotLibre(z) {
    const usados = e.deco.filter(d => d.h === 'estudio' && ITEMS[d.k] && ITEMS[d.k].zona === z).map(d => d.s), orden = z === 'col' ? [1, 4, 2, 3, 0, 5] : [2, 1, 3, 0, 4];
    return orden.find(i => !usados.includes(i)) ?? -1;
  }
  function estSnap(d, p) {
    const z = ITEMS[d.k].zona, xs = estSlotsX(z); let mejor = 0, md = 1e9;
    xs.forEach((x, i) => { const dd = Math.abs(p.x - (OX + x)); if (dd < md) { md = dd; mejor = i; } });
    if (mejor === d.s) return;
    const otro = e.deco.find(o => o !== d && o.h === 'estudio' && ITEMS[o.k] && ITEMS[o.k].zona === z && o.s === mejor); if (otro) otro.s = d.s;
    d.s = mejor; sfx.click();
  }
  const habNombre = t => (HABS.find(h => h.id === t) || {}).n || String(t).toUpperCase();
  function colocar(k) {
    if (ITEMS[k].exclusivo && ITEMS[k].tema && ITEMS[k].tema !== e.hab) { toast('Este objeto solo va en: ' + habNombre(ITEMS[k].tema)); sfx.no(); return false; }
    if (ITEMS[k].tema === 'bano' && e.hab !== 'bano') { toast('Este objeto solo va en el BAÑO'); sfx.no(); return false; }
    const esE = ITEMS[k].tema === 'estudio';
    if (esE !== (e.hab === 'estudio')) { toast(esE ? 'Este objeto solo va en el ESTUDIO' : 'El ESTUDIO solo admite objetos de estudio'); sfx.no(); return false; }
    const esJ = ITEMS[k].tema === 'jardin';
    if (esJ !== (e.hab === 'jardin')) { toast(esJ ? 'Este objeto solo va en el JARDÍN' : 'El JARDÍN solo admite objetos de jardín'); sfx.no(); return false; }
    if (esE) {
      const prev = e.deco.find(d => d.k === k); if (prev) { if (prev.h === 'estudio') return false; prev.h = 'estudio'; return true; }
      const sl = estSlotLibre(ITEMS[k].zona); if (sl < 0) { toast(ITEMS[k].zona === 'col' ? 'No hay lugar para colgar más: quita algo' : 'El estante está lleno: quita algo'); sfx.no(); return false; }
      e.deco.push({ k, x: 0, y: 0, f: 0, h: 'estudio', s: sl }); return true;
    }
    if (ITEMS[k].slot === 'juguete') {   // solo hay un juguete a la vez: el nuevo ocupa el lugar del anterior
      const ant = e.deco.find(x => ITEMS[x.k] && ITEMS[x.k].slot === 'juguete');
      if (ant && ant.k === k) { if ((ant.h || 'sala') === 'sala') return false; ant.h = 'sala'; return true; }
      if (ant) { ant.k = k; ant.h = 'sala'; } else e.deco.push({ k, x: 43, y: 92, f: 0, h: 'sala' });
      return true;
    }
    const aqui = e.deco.filter(d => (d.h || 'sala') === e.hab), previo = e.deco.find(d => d.k === k);
    if (previo && (previo.h || 'sala') === e.hab) return false;
    if (aqui.length >= DECO_MAX) { toast('La habitación está llena'); return false; }
    if (previo) { previo.h = e.hab; return true; }   // ya lo tenías en otra habitación: se viene para acá
    const n = aqui.length, lados = e.hab === 'bano' ? [-8, 20, -28, 38, -46, 0] : [-50, 50, -30, 30, -66, 66];
    const enBarra = e.hab === 'cocina' && ['tostadora', 'cafetera', 'olla', 'canasta', 'especias', 'florero'].includes(k);
    e.deco.push(esPared(k) ? { k, x: -36 + (n % 3) * 36, y: -34, f: 0, h: e.hab } : { k, x: enBarra ? [-14, 8, 30, -34, 52][n % 5] : lados[n % 6], y: enBarra ? 5 : 56, f: 0, h: e.hab });
    return true;
  }
  const salaParC = {};
  function salaPared(cx, cy, w, h) {   // nada puede tapar la ventana ni el marco de fotos de la sala
    const dy = RY - 59;
    // ventana (izquierda) + marco de fotos/cuadro (derecha, offset 66,15 dentro de derechaGrid pegado en OX,dy; tamaño 38x30)
    const R = [[OX - 1, dy + 6, OX + 61, dy + 65], [OX + 65, dy + 14, OX + 105, dy + 46]];
    const x0 = w / 2 + 2, x1 = LW - w / 2 - 2, y0 = Math.min(RY - 59 + 3, 12) + h / 2, y1 = RY + 16 - h / 2;
    const ok = (x, y) => !R.some(r => x - w / 2 < r[2] && x + w / 2 > r[0] && y - h / 2 < r[3] && y + h / 2 > r[1]);
    cx = lim(cx, x0, x1); cy = lim(cy, y0, y1); if (ok(cx, cy)) return [cx, cy];
    const key = [w, h, Math.round(cx), Math.round(cy), LW, RY].join('|'); if (salaParC[key]) return salaParC[key];
    let best = null, bd = 1e9; for (let y = y0; y <= y1; y += 2) for (let x = x0; x <= x1; x += 2) { const dd = (x - cx) * (x - cx) + (y - cy) * (y - cy); if (dd < bd && ok(x, y)) { bd = dd; best = [x, y]; } }
    return (salaParC[key] = best || [cx, cy]);
  }
  const juegosParC = {};
  function juegosPared(cx, cy, w, h) {   // nada puede tapar el arcade ni los trofeos de la sala de juegos
    const R = [[OX - 2, RY - 44, OX + 40, RY + 40], [OX + 76, RY - 40, OX + 120, RY]];
    const x0 = w / 2 + 2, x1 = LW - w / 2 - 2, y0 = Math.min(RY - 59 + 3, 12) + h / 2, y1 = RY + 16 - h / 2;
    const ok = (x, y) => !R.some(r => x - w / 2 < r[2] && x + w / 2 > r[0] && y - h / 2 < r[3] && y + h / 2 > r[1]);
    cx = lim(cx, x0, x1); cy = lim(cy, y0, y1); if (ok(cx, cy)) return [cx, cy];
    const key = [w, h, Math.round(cx), Math.round(cy), LW, RY].join('|'); if (juegosParC[key]) return juegosParC[key];
    let best = null, bd = 1e9; for (let y = y0; y <= y1; y += 2) for (let x = x0; x <= x1; x += 2) { const dd = (x - cx) * (x - cx) + (y - cy) * (y - cy); if (dd < bd && ok(x, y)) { bd = dd; best = [x, y]; } }
    return (juegosParC[key] = best || [cx, cy]);
  }
  const cocParC = {};
  function cocPared(cx, cy, w, h) {   // lo colgado en la cocina no puede tapar repisas, refri, ventana, estufa ni lo que está en las repisas
    const R = repisasCoc(OX, RY, LW).map(q => [q[0] - 1, q[2] - 1, q[1] + 1, q[2] + 8]), rf = (e.cuarto.refri && ITEMS[e.cuarto.refri] && ITEMS[e.cuarto.refri].refri) || {};
    R.push([OX + 90 - (rf.ancho || 0), RY - 31 - (rf.alto || 0), OX + 116 - 6, RY + 60], [OX + 9 + 6, RY - 47, OX + 51, RY + 1], [0, RY - 2, LW, RY + 70]);   // junto a la ventana y al refri se deja pasar un poco para aprovechar la pared de los lados
    e.deco.forEach(o => { if ((o.h || 'sala') !== 'cocina' || !ITEMS[o.k] || esPared(o.k) || ITEMS[o.k].slot === 'juguete') return; const r = posReal(o); if (r.base < RY - 10) R.push([r.x - 1, r.y - 1, r.x + r.w + 1, r.y + r.h + 1]); });
    const x0 = w / 2 + 2, x1 = LW - w / 2 - 2, y0 = Math.min(RY - 59 + 3, 12) + h / 2, y1 = RY - 2 - h / 2, ok = (x, y) => !R.some(r => x - w / 2 < r[2] && x + w / 2 > r[0] && y - h / 2 < r[3] && y + h / 2 > r[1]);
    cx = lim(cx, x0, x1); cy = lim(cy, y0, y1); if (ok(cx, cy)) return [cx, cy];
    const key = [w, h, Math.round(cx), Math.round(cy), LW, RY, R.map(r => r.join()).join(';')].join('|'); if (cocParC[key]) return cocParC[key];
    let best = null, bd = 1e9; for (let y = y0; y <= y1; y += 2) for (let x = x0; x <= x1; x += 2) { const dd = (x - cx) * (x - cx) + (y - cy) * (y - cy); if (dd < bd && ok(x, y)) { bd = dd; best = [x, y]; } }
    return (cocParC[key] = best || [cx, cy]);
  }
  function juegosLibre(cx, w, base, h) {   // aparta los muebles de piso de la zona del arcade y de los trofeos en la SALA DE JUEGOS
    const top = base - h, ARC_BASE = RY + 35;   // línea de piso donde "está parado" el arcade
    const zonas = [[OX - 2, OX + 40, RY - 44, ARC_BASE], [OX + 76, OX + 120, RY - 40, RY]];   // arcade, trofeos
    const choca = zonas.some((z, i) => {
      if (i === 0 && base > ARC_BASE) return false;   // parado más adelante que el arcade: se dibuja encima, sin choque real; se deja colocar
      return top < z[3] && base > z[2] && cx + w / 2 > z[0] && cx - w / 2 < z[1];
    });
    if (!choca) return cx;
    const bandas = [[2, OX - 2], [OX + 40, OX + 76], [OX + 120, LW - 2]].filter(b => b[1] - b[0] >= w);
    if (!bandas.length) return cx;
    let best = cx, bd = 1e9;
    bandas.forEach(b => { const c = lim(cx, b[0] + w / 2, b[1] - w / 2); const dd = Math.abs(c - cx); if (dd < bd) { bd = dd; best = c; } });
    return best;
  }
  function posReal(d) {
    if ((d.h || 'sala') === 'estudio' && ITEMS[d.k] && ITEMS[d.k].zona) return estPos(d);
    const sp = sprite('mu_' + d.k, ITEMS[d.k].grid, 0), w = sp.width, h = sp.height, pared = esPared(d.k);
    let cx = lim(LW / 2 + d.x, w / 2 + 2, LW - w / 2 - 2);
    if (pared) { const minCy = Math.min(RY - 59 + 3, 12) + h / 2; let cy = lim(RY + d.y, minCy, RY + 16 - h / 2); if ((d.h || 'sala') === 'cocina') { const q = cocPared(cx, cy, w, h); cx = q[0]; cy = q[1]; } else if ((d.h || 'sala') === 'sala') { const q = salaPared(cx, cy, w, h); cx = q[0]; cy = q[1]; } else if ((d.h || 'sala') === 'juegos') { const q = juegosPared(cx, cy, w, h); cx = q[0]; cy = q[1]; } return { x: Math.round(cx - w / 2), y: Math.round(cy - h / 2), w, h, cx, cy, base: cy + h / 2 }; }
    let base;
    if ((d.h || 'sala') === 'cocina') {   // en la cocina: en una repisa, sobre la barra (entre la estufa y el refri) o en el piso
      const y0 = RY + d.y;
      const sh = y0 < RY - 14 ? repisasCoc(OX, RY, LW).filter(q => w <= q[1] - q[0] && h <= q[3]).map(q => [q, Math.abs(y0 - q[2]) + .6 * Math.max(0, Math.max(q[0] - cx, cx - q[1]))]).sort((u, v) => u[1] - v[1])[0] : null;
      if (sh) { cx = lim(cx, sh[0][0] + w / 2, sh[0][1] - w / 2); base = sh[0][2]; }
      else if (y0 < RY + 18) { const I = [[2, OX - 2], [OX + 34, OX + 89], [OX + 117, LW - 2]].filter(q => q[1] - q[0] >= w), q = I.length ? I.reduce((u, v) => Math.min(Math.abs(cx - u[0]), Math.abs(cx - u[1])) * (cx >= u[0] && cx <= u[1] ? 0 : 1) <= Math.min(Math.abs(cx - v[0]), Math.abs(cx - v[1])) * (cx >= v[0] && cx <= v[1] ? 0 : 1) ? u : v) : [OX + 34, OX + 89]; cx = q[1] - q[0] >= w ? lim(cx, q[0] + w / 2, q[1] - w / 2) : (q[0] + q[1]) / 2; base = RY + 5; }
      else base = lim(y0, RY + 30, Math.min(LH - 3, PISO));
    }
    else { base = lim(RY + d.y, RY + 30, Math.min(LH - 3, PISO)); if ((d.h || 'sala') === 'juegos') cx = juegosLibre(cx, w, base, h); }
    return { x: Math.round(cx - w / 2), y: Math.round(base - h), w, h, cx, cy: base - h / 2, base };
  }
  function dibujarMuebles(n, capa) {
    if (escenaId() === 'estudio' || (ban && escenaId() === 'bano')) return;
    e.deco.map((d, i) => [d, i]).sort((a, b) => (ITEMS[a[0].k] && esPared(a[0].k) ? 0 : 1) - (ITEMS[b[0].k] && esPared(b[0].k) ? 0 : 1)).forEach(([d, i]) => {   // lo colgado en la pared siempre queda detrás
      if (!ITEMS[d.k] || (d.h || 'sala') !== escenaId()) return;
      if (act && act.tipo === 'pelota' && ITEMS[d.k].slot === 'juguete') return;
      if (sifJ && sifJ.ph !== 'ir' && ITEMS[d.k].slot === 'juguete') return;
      const r = posReal(d), pared = esPared(d.k), delante = !pared && r.base > SY + SH - 12 && !(cortex.p > 0);
      if ((capa === 'frente') !== delante) return;
      const hop = d.k === 'peluche_cortex' && pelHop > 0 ? Math.round(Math.abs(Math.sin((10 - pelHop) / 10 * Math.PI * 2)) * 6) : 0;
      const luz = ITEMS[d.k].luz, dim = (n && !luz) ? .55 : 0, sp = d.k === 'racha' ? (rachaModo === 2 ? (cw => sprite('mu_rachaW' + cw + (esNoche() ? 'n' : 'd') + ((tk >> 2) & 3), () => rachaGrid(racha(), tk >> 2, 2, { w: cw, n: esNoche() }), dim))(clima()) : rachaModo ? (hh => sprite('mu_rachaH' + hh, () => rachaGrid(racha(), 0, 1, hh), dim))(horaRacha()) : sprite('mu_racha' + racha() + '_' + rachaF(), () => rachaGrid(racha(), rachaF(), 0), dim)) : d.k === 'neon_si' ? (nf => sprite('mu_neon_si_' + nf, () => neonGrid(nf), 0))((tk >> 3) % 16) : ITEMS[d.k].semilla ? (w => { const fr = w ? 0 : tk % 24; return sprite('mu_' + d.k + '_' + w + (w ? '' : '_f' + fr), () => macetaPlantaGrid(ITEMS[d.k].semilla, !!w, fr), (n && w) ? .55 : 0); })(macetaViva(d.k) ? 0 : 1) : sprite('mu_' + d.k, ITEMS[d.k].grid, (n && !luz) ? .55 : 0);
      if (!pared) {
        ctx.fillStyle = 'rgba(30,12,40,.30)';
        for (let j = -2; j <= 2; j++) { const w = Math.round(r.w / 2 * Math.sqrt(1 - (j / 2.8) * (j / 2.8))); ctx.fillRect(Math.round(r.cx - w), Math.round(r.base) + j, w * 2, 1); }
      }
      if (d.k === 'lampara' && n) {
        ctx.fillStyle = 'rgba(255,226,120,.17)';
        const cx = r.cx, cy = r.y + 9;
        for (let j = -28; j <= 28; j++) { const w = Math.round(32 * Math.sqrt(1 - (j / 28) * (j / 28))); ctx.fillRect(Math.round(cx - w), Math.round(cy + j), w * 2, 1); }
      }
      if (ITEMS[d.k].semilla && n && macetaViva(d.k)) {   // flor bioluminiscente: el núcleo que brilla ilumina a su alrededor de noche
        const S = SEMILLAS[ITEMS[d.k].semilla], cc = col((S && S.col) || '#ffe68a'), cx = r.cx, cy = r.y + Math.round(r.h * .28);
        ctx.fillStyle = 'rgba(' + cc[0] + ',' + cc[1] + ',' + cc[2] + ',.16)';
        for (let j = -13; j <= 13; j++) { const w = Math.round(14 * Math.sqrt(1 - (j / 13) * (j / 13))); ctx.fillRect(Math.round(cx - w), Math.round(cy + j), w * 2, 1); }
      }
      if (d.k === 'racha' && n && racha() > 0) {   // el cuadro de racha ilumina la pared de noche: resplandor plano, no de vela
        const hw = r.w / 2, hh = r.h / 2, cx = r.cx, cy = r.cy;
        [[9, .05], [6, .07], [3, .09], [1, .12]].forEach(([pad, a]) => {
          ctx.fillStyle = 'rgba(255,180,60,' + a + ')';
          ctx.fillRect(Math.round(cx - hw - pad), Math.round(cy - hh - pad), Math.round(r.w + pad * 2), Math.round(r.h + pad * 2));
        });
      }
      if (d.f) { ctx.save(); ctx.translate(r.x + r.w, r.y - hop); ctx.scale(-1, 1); ctx.drawImage(sp, 0, 0); ctx.restore(); }
      else ctx.drawImage(sp, r.x, r.y - hop);
      if (edit && edit.sel === i) {
        ctx.fillStyle = (tk >> 2) % 2 ? '#ffe45a' : '#ffffff';
        ctx.fillRect(r.x - 2, r.y - 2, r.w + 4, 1); ctx.fillRect(r.x - 2, r.y + r.h + 1, r.w + 4, 1); ctx.fillRect(r.x - 2, r.y - 2, 1, r.h + 4); ctx.fillRect(r.x + r.w + 1, r.y - 2, 1, r.h + 4);
      }
    });
  }
  const fx = [];
  function lanzar(tipo, x, y, vx, vy, vida) { fx.push({ tipo, x, y, vx, vy, vida, t: 0 }); }


  /* ===================== SIF: EL PERRITO DEL PARQUE ===================== */
  const SF = () => (e.sif = e.sif || { f: 0, v: 0 });
  const tienePet = k => {
    if (k === 'pet_sif') return !!((e.sif && e.sif.f) || (e.tiene && e.tiene.pet_sif) || (e.pets && e.pets.includes('pet_sif')) || (e.mascotas && e.mascotas.includes('pet_sif')));
    if (k === 'ojo_pet') return !!(e.sangFase === 2 || (e.tiene && e.tiene.ojo_pet) || (e.pets && e.pets.includes('ojo_pet')) || (e.mascotas && e.mascotas.includes('ojo_pet')));
    return !!((e.tiene && e.tiene[k]) || (e.pets && e.pets.includes(k)) || (e.mascotas && e.mascotas.includes(k)));
  };
  const petsActivas = () => {
    if (!e.pets) {
      e.pets = [];
      if (tienePet('pet_sif')) e.pets.push('pet_sif');
      if (tienePet('ojo_pet') && e.ojoOn !== 0) e.pets.push('ojo_pet');
    }
    return e.pets;
  };
  const petActiva = k => petsActivas().includes(k);
  const togglePet = k => { const arr = petsActivas(); const i = arr.indexOf(k); if (i >= 0) arr.splice(i, 1); else if (arr.length < 3) arr.push(k); guardar(); pintar(); render(); };
  const sifE = c => (petActiva('pet_sif') ? c * .9 : c);   // con Sif de mascota, jugar cansa un 10% menos
  let sifP = null, sifProx = 0, sifAni = 0, sifJ = null, sifJT = 0;
  const sifToy = () => e.deco.find(d => ITEMS[d.k] && ITEMS[d.k].slot === 'juguete' && (d.h || 'sala') === 'sala');
  let sifW = null, sifCar = 0, sifAm = false;
  const sifW0 = () => sifW || (sifW = { x: SX + SW - 4, y: 4, tx: 0, ty: 0, mov: 0, pausa: 0 });
  const sifPos = esc => sifP ? { x: sifP.x, y: 0 } : { x: sifW0().x, y: Math.max(sifW0().y, cortex.p > 0 ? 16 : 0) };
  function sifElige(W) {   // destino al azar en el piso (sin atravesar a Simon)
    const y = Math.random() * 26; let x;
    if (y < 12) { const L = SX - 26, R0 = SX + SW - 8, R1 = LW - 30; const izq = L > 6, der = R1 > R0; if (izq && (!der || Math.random() < .5)) x = 4 + Math.random() * (L - 4); else if (der) x = R0 + Math.random() * (R1 - R0); else x = 4 + Math.random() * (LW - 34); }
    else x = 4 + Math.random() * (LW - 34);
    W.tx = x; W.ty = y; W.mov = 1;
  }
  function sifPaso(W, tx, ty, v) { const dx = tx - W.x, dy = ty - W.y, d = Math.hypot(dx, dy); if (d < 1.5) return true; W.x += dx / d * v; W.y += dy / d * v * .7; return false; }
  function sifJuegoTick() {
    if (!petActiva('pet_sif')) return;
    const esc = escenaId(), W = sifW0();
    W.x = Math.max(2, Math.min(LW - 30, W.x)); W.y = Math.max(0, Math.min(26, W.y));
    const libre = !sifP && !dlg && !modal && !e.dormido && !cortex.p && !cortex.dir && !ban && !cg && !mercPres && !introActiva && !cambiando && esc !== 'estudio' && esc !== 'calle' && (!lugar || lugar === 'parque');
    const dj = libre && esc === 'sala' && !(act && act.tipo === 'pelota') && sifToy();
    if (!libre || (sifJ && !dj)) { sifJ = null; W.mov = 0; return; }
    if (tk < sifCar) { W.mov = 0; return; }
    if (sifJ) {
      const J = sifJ;
      if (J.ph === 'ir') { W.mov = 1; if (sifPaso(W, J.tx, J.ty, 1.6)) { J.ph = 'juega'; J.t = 0; J.cx = W.x; guau(1); } }
      else { W.mov = 1; J.t++; W.x = Math.max(2, Math.min(LW - 30, J.cx + Math.sin(J.t / 6) * 22)); if (J.t > 130) { sifJ = null; sifJT = tk + 300 + Math.random() * 500; W.mov = 0; W.pausa = tk + 40; } }
      return;
    }
    if (dj) { if (!sifJT) sifJT = tk + 150 + Math.random() * 250; if (tk >= sifJT) { const rr = posReal(dj); sifJ = { ph: 'ir', tx: Math.max(2, Math.min(LW - 30, Math.round(rr.x + rr.w / 2 - 14))), ty: Math.max(0, Math.min(26, Math.round(rr.base - (SY + SH)))), t: 0, cx: 0 }; return; } }
    if (W.mov) { if (sifPaso(W, W.tx, W.ty, 1)) { W.mov = 0; W.pausa = tk + 40 + Math.random() * 130; } }
    else if (tk >= W.pausa) { if (Math.random() < .35) W.pausa = tk + 60 + Math.random() * 120; else sifElige(W); }
  }
  function sifGrid(o) {
    o = o || {}; const g = Grid(28, 27), K = '#6a4234', K2 = '#8a5a44', W = '#f6f1ea', Tn = '#dba96c', Nz = '#8c525c', D = '#1c100c';
    ovalG(g, 14, 21, 8, 6, K); ovalG(g, 14, 22, 4, 5, W);
    g.rect(8, 24, 4, 3, W); g.rect(16, 24, 4, 3, W);
    if (o.cola) { g.rect(22, 14, 3, 8, K); g.rect(22, 14, 3, 2, W); } else g.rect(22, 20, 4, 4, K);
    g.rect(4, 1, 5, 7, K); g.rect(5, 2, 3, 4, '#c98a8a'); g.rect(19, 1, 5, 7, K); g.rect(20, 2, 3, 4, '#c98a8a');
    ovalG(g, 14, 10, 9, 7, K);
    g.rect(8, 6, 4, 2, Tn); g.rect(17, 6, 4, 2, Tn); g.rect(6, 10, 3, 3, Tn); g.rect(20, 10, 3, 3, Tn);
    g.rect(13, 3, 3, 9, W); ovalG(g, 14, 14, 5, 3, W);
    if (o.ojos === 'c') { g.rect(9, 9, 3, 1, D); g.rect(18, 9, 3, 1, D); }
    else { g.rect(9, 8, 3, 3, D); g.set(10, 8, '#ffffff'); g.rect(18, 8, 3, 3, '#6cc0ff'); g.set(19, 9, D); g.set(18, 8, '#ffffff'); }
    g.rect(12, 12, 4, 2, Nz); g.set(13, 12, '#c88a94');
    if (o.boca === 'b') { g.rect(12, 15, 4, 3, '#6a2a34'); g.rect(13, 16, 2, 2, '#f07a92'); }
    else { g.set(11, 15, D); g.set(16, 15, D); g.rect(12, 16, 4, 1, D); }
    g.contour(D); return g;
  }
  function sifRuido(dur) { const n = Math.floor(ac.sampleRate * dur), b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; return b; }
  function guau(n, grave) {   // ladrido: zumbido de garganta + soplido, pasado por dos formantes (boca de perro)
    if (e.mudo || !audio()) return;
    for (let i = 0; i < (n || 1); i++) setTimeout(() => {
      const t = ac.currentTime + .02, dur = .2, m = ac.createGain();
      m.gain.setValueAtTime(.0001, t); m.gain.exponentialRampToValueAtTime(.2, t + .012); m.gain.setValueAtTime(.2, t + .06); m.gain.exponentialRampToValueAtTime(.0001, t + dur); m.connect(ac.destination);
      const o = ac.createOscillator(); o.type = 'sawtooth'; const f0 = grave ? 300 : 420 + Math.random() * 50;
      o.frequency.setValueAtTime(f0 * .8, t); o.frequency.exponentialRampToValueAtTime(f0 * 1.25, t + .03); o.frequency.exponentialRampToValueAtTime(f0 * .5, t + dur);
      const nz = ac.createBufferSource(); nz.buffer = sifRuido(dur); const ng = ac.createGain(); ng.gain.value = .55; nz.connect(ng);
      [[700, 3], [1500, 4], [2600, 5]].forEach(([fq, q], k) => { const b = ac.createBiquadFilter(); b.type = 'bandpass'; b.frequency.setValueAtTime(fq * 1.15, t); b.frequency.exponentialRampToValueAtTime(fq * .8, t + dur); b.Q.value = q; const g = ac.createGain(); g.gain.value = k === 0 ? 1 : k === 1 ? .7 : .25; o.connect(b); ng.connect(b); b.connect(g); g.connect(m); });
      o.start(t); nz.start(t); o.stop(t + dur + .02); nz.stop(t + dur + .02);
    }, i * 260);
    sifAni = tk + 24;
  }
  function sifGime() {   // gemidito feliz al acariciarlo: voz aguda que sube y baja con temblor, y un resoplido suave
    if (e.mudo || !audio()) return;
    const t = ac.currentTime + .02, dur = .55, m = ac.createGain();
    m.gain.setValueAtTime(.0001, t); m.gain.exponentialRampToValueAtTime(.09, t + .06); m.gain.setValueAtTime(.09, t + .3); m.gain.exponentialRampToValueAtTime(.0001, t + dur); m.connect(ac.destination);
    const o = ac.createOscillator(); o.type = 'triangle';
    o.frequency.setValueAtTime(560, t); o.frequency.exponentialRampToValueAtTime(1000, t + .2); o.frequency.exponentialRampToValueAtTime(700, t + dur);
    const lf = ac.createOscillator(), lg = ac.createGain(); lf.frequency.value = 13; lg.gain.value = 28; lf.connect(lg); lg.connect(o.frequency);
    const fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 2400; o.connect(fl); fl.connect(m);
    o.start(t); lf.start(t); o.stop(t + dur + .02); lf.stop(t + dur + .02);
    const nz = ac.createBufferSource(); nz.buffer = sifRuido(.25); const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 3200; bp.Q.value = .8; const ng = ac.createGain(); const t2 = t + dur - .05;
    ng.gain.setValueAtTime(.0001, t2); ng.gain.exponentialRampToValueAtTime(.05, t2 + .04); ng.gain.exponentialRampToValueAtTime(.0001, t2 + .22);
    nz.connect(bp); bp.connect(ng); ng.connect(ac.destination); nz.start(t2); nz.stop(t2 + .25);
  }
  function sifJingle() {   // melodía de logro grande: arpegio, ladrido y acorde final
    seq([523, 659, 784, 1047, 784, 1047, 1319, 1568], .085, 'square', .06);
    seq([262, 330, 392, 523, 392, 523, 659, 784], .085, 'triangle', .07);
    setTimeout(() => guau(2), 800);
    seq([1047, 1319, 1568, 2093, 1568, 2093], .11, 'square', .05, .95);
    seq([523, 659, 784, 1047], .5, 'triangle', .08, 1.7);
    setTimeout(() => { if (typeof sfx.regalo === 'function') sfx.regalo(); }, 1900);
  }
  const sifVisible = esc => petActiva('pet_sif') && !sifP && esc !== 'estudio' && esc !== 'bano' && esc !== 'calle' && (!lugar || lugar === 'parque') && !ban && !cg && !introActiva && !(e.dormido && esc !== 'sala');
  function sifDibuja(esc, n) {
    let x, y = 0, est = 'rest';
    if (sifP && (sifP.casa ? (!lugar && esc === 'sala') : esc === 'parque')) { x = sifP.x; est = sifP.estado; }
    else if (sifVisible(esc)) { const P = sifPos(esc); x = P.x; y = P.y; }
    else return;
    const W = sifW0(), J = (!sifP && sifJ && esc === 'sala') ? sifJ : null, car = sifP ? tk < (sifP.petT || 0) : tk < sifCar;
    const mov = est === 'viene' || est === 'va' || (sifP && sifP.wmov && !car) || (!sifP && W.mov && !car && !(J && J.ph === 'juega')), jug = J && J.ph === 'juega';
    const feliz = est === 'quieto' || est === 'come' || est === 'llego' || (est === 'rest' && (tk < sifAni || jug || car || mov));
    const ojos = car ? 'c' : ((e.dormido && est === 'rest') || (tk % 90 < 3) ? 'c' : 'a'), boca = (tk < sifAni || est === 'come') ? 'b' : 'n', cola = (feliz && ((tk >> (car ? 1 : 2)) & 1)) ? 1 : 0;
    const spr = sprite('sif|' + ojos + boca + cola, () => sifGrid({ ojos, boca, cola }), n ? .22 : 0);
    const by = SY + SH + Math.round(y);
    ctx.fillStyle = 'rgba(30,12,40,.30)'; for (let k = -2; k <= 2; k++) { const w = Math.round(12 * Math.sqrt(1 - (k / 2.6) * (k / 2.6))); ctx.fillRect(Math.round(x + 14 - w), by - 2 + k, w * 2, 1); }
    const hop = jug ? Math.round(Math.abs(Math.sin(J.t / 3)) * 3) : car ? Math.round(Math.abs(Math.sin(tk / 2)) * 2) : 0;
    ctx.drawImage(spr, Math.round(x), by - 27 + (mov && (tk >> 1) % 2 ? -1 : 0) - hop);
    if (J && J.ph === 'juega') { const jk = sifToy().k, tj = sprite('tj_' + jk, () => ITEMS[jk].grid(), 0); ctx.drawImage(tj, Math.round(x + 14 - tj.width / 2), by - 3 - tj.height - hop); }
  }
  function sifTick() {
    const S_ = SF(); sifJuegoTick();
    if (sifP) {
      const p = sifP, par = lugar === 'parque';
      if (!p.casa && !par) { sifP = null; return; }
      if (p.estado === 'viene') { p.x -= 1.6; if (p.x <= p.tx) { p.x = p.tx; p.t0 = Date.now(); if (p.casa) { p.estado = 'llego'; sifAmistad(); } else { p.estado = 'quieto'; sifAviso(); } } }
      else if (p.estado === 'quieto') {
        if (Date.now() - p.t0 > 50000 && !dlg && !modal) { p.estado = 'va'; return; }
        if (!dlg && !modal) {
          if (p.wmov) {
            const dx = p.wtx - p.x;
            if (Math.abs(dx) < 1.5) { p.wmov = 0; p.wpausa = tk + 50 + Math.random() * 90; }
            else p.x += Math.sign(dx) * .7;
          }
          else if (tk >= (p.wpausa || 0)) { p.wtx = 4 + Math.random() * (LW - 32); p.wmov = 1; }
        }
      }
      else if (p.estado === 'va') { p.x += 1.8; if (p.x > LW + 4) { sifP = null; sifProx = Date.now() + (20 + Math.random() * 40) * 1000; } }
      return;
    }
    if (lugar !== 'parque') { sifProx = 0; return; }
    if (S_.f || llegada || dlg || modal || ban || cambiando || cortex.p || cortex.dir || mercPres || introActiva || desc) return;
    if (!sifProx) sifProx = Date.now() + (admin ? 2500 : S_.v ? 6000 + Math.random() * 20000 : 7000);
    if (Date.now() >= sifProx) { sifP = { x: LW + 4, tx: SX + SW + 4, estado: 'viene', t0: 0 }; sifProx = 0; }
  }
  function sifAviso() {
    const S_ = SF(); S_.v++; guardar(); guau(1);
    if (S_.v === 1) { notificar('Un perrito apareció en el parque.'); toast('UN PERRITO... PARECE TENER HAMBRE'); }
  }
  function sifDar() {
    const p = sifP; if (!p || dlg) return; p.t0 = Date.now() + 120000;
    dialogo([{ q: 'TRADUCTOR', t: '¿Dar keke para perros?', op: ['SÍ', 'NO'], res: [[
      { q: 'SIMON', t: 'Sí.', fn: () => { bocaT = 15; gesto(); hablar(); e.sifK--; guardar(); p.estado = 'come'; } }, T('Toma, esto es para ti.'),
      { q: 'PERRO', t: '*mastica el keke y mueve la cola*', fn: () => { sfx.comer(); corazones(5); } },
      { q: 'PERRO', t: '*te mira con ojos de distinto color*' }, S(), T('¿Vienes a casa conmigo?')], []] }],
      () => { if (sifP && sifP.estado === 'come') sifSigue(); else if (sifP) sifP.t0 = Date.now(); });
  }
  function sifSigue() {
    introPend = Date.now() + 20000; sifAm = true;
    irA(() => { lugar = null; llegada = null; e.hab = 'sala'; pintarNav(); sifP = { x: LW + 4, tx: SX + SW - 4, estado: 'viene', casa: true, t0: 0 }; });
  }
  function sifAmistad() {
    const S_ = SF();
    setTimeout(() => dialogo([S(), T('Oye... ¿quieres ser mi amigo?'),
      { q: 'PERRO', t: '¡GUAU!', fn: () => guau(1) },
      { q: 'SIMON', t: '¡Sí!', fn: () => { bocaT = 15; gesto('salto'); hablar(); } }, T('¡Entonces te llamaré Sif!'),
      { q: 'SIF', t: '¡GUAU, GUAU!', fn: () => { guau(2); corazones(6); } },
      { q: 'SIF', t: '', fan: { mudo: true, g: () => sifGrid({ boca: 'b', cola: 1 }), t: 'SIF', d: 'NUEVA MASCOTA. EFECTO: JUGAR TE QUITA 10% MENOS DE ENERGÍA.' }, fn: () => { S_.f = 1; petsActivas().push('pet_sif'); sifP = null; e.st.sifAmigo = 1; guardar(); sifJingle(); } },
      S(), T('Ahora tengo un perro. ¡Qué felicidad!'), T('Con Sif cerca, jugar me cansa un 10% menos.')], () => { introPend = 0; sifAm = false; pintar(); guardar(); }), 700);
  }
  function sifTap(x, y) {
    if (dlg || modal || edit || ban || cg) return false;
    const esc = escenaId(), S_ = SF(); let px, py = 0, tr = false;
    if (sifP && !sifP.casa && sifP.estado === 'quieto' && esc === 'parque') { px = sifP.x; tr = true; }
    else if (!sifP && sifVisible(esc)) { const P = sifPos(esc); px = P.x; py = P.y; } else return false;
    const base = SY + SH + py;
    if (x < px || x > px + 28 || y < base - 29 || y > base + 2) return false;
    sfx.click();
    if (tr) {
      if (e.sifK > 0) { sifDar(); return true; }
      guau(1); sifP.petT = tk + 40; sifP.wmov = 0; sifP.wpausa = tk + 70;   // sin keke: ladra como si lo acariciaran
      for (let i = 0; i < 3; i++) lanzar('corazon', px + 6 + i * 7, base - 30 - i * 3, 0, -1.6, 14 + i * 3);
      sifGime();
      return true;
    }
    if (e.dormido) { toast('SIF TAMBIÉN DUERME'); return true; }
    sifCar = tk + 40; sifW0().mov = 0; sifJ = null; sifW0().pausa = tk + 70;   // caricia: cierra los ojos, mueve la cola y salta contento
    for (let i = 0; i < 3; i++) lanzar('corazon', px + 6 + i * 7, base - 30 - i * 3, 0, -1.6, 14 + i * 3);
    sifGime();
    return true;
  }
  function sifComer() {
    if (!petActiva('pet_sif')) return; if (!(e.sifK > 0)) { toast('NO TIENES KEKES PARA PERRO: COCÍNALOS'); sfx.no(); return; }
    e.sifK--; sifAni = tk + 40; sifCar = tk + 40; cerrar(); guau(1); sfx.comer(); corazones(4); toast('SIF COMIÓ SU KEKE'); guardar(); pintar();
  }

  function dibujar() {
    const n = (e.dormido || ov || bl || az || esNoche()) ? 1 : 0;
    ctx.clearRect(0, 0, LW, LH); ojoXY = null;
    const dy = RY - 59;
    const esc = escenaId(); ajustaSY(); fondoEscena(esc, n, dy);
    if (vistaBloq) { dibujarConstruccion(); return; }
    dibujarMuebles(n, 'atras');
    if (n && (esc === 'sala' || esc === 'cocina') && (clima() === 'sol' || ((esc === 'sala' && (lunaDorada() || sangreCielo() || lunaAzulT())) || (esc === 'cocina' && (lunaOroT() || lunaSangreT() || lunaAzulT()))))) { const s = ESTRELLAS[(tk >> 2) % ESTRELLAS.length], sy = s[1] + dy, sx = s[0] + OX; ctx.fillStyle = '#ffffff'; ctx.fillRect(sx, sy, 1, 1); ctx.fillRect(sx - 1, sy, 3, 1); ctx.fillRect(sx, sy - 1, 1, 3); }
    const ojos = (e.dormido || parpadeoT > 0 || acarT > 0) ? 'c' : 'a';
    const boca = e.dormido ? 'n' : bocaT > 10 ? 't' : (bocaT > 0 || acarT > 0) ? 's' : 'n';
    let oy = (saltoT >= 0 ? SALTO[saltoT] : 0) + (!e.dormido && saltoT < 0 && gT < 0 && (tk >> 2) % 2 ? 1 : 0);
    if (!e.dormido && simonLevita()) oy -= 5 + Math.round(Math.sin(tk / 11) * 2);   // SEMILLA ETERNA + aura puesta: Simon flota con un balanceo suave
    if (esc === 'estudio' && estEstudiando() && !e.dormido && saltoT < 0 && (tk >> 4) % 7 === 6) oy += 1;
    let gx = 0, esx = 1;
    gx += Math.round(-24 * cortex.p);
    if (acarT > 0 && acar) { gx += Math.max(-3, Math.min(3, Math.round((acar.x - (SX + SW / 2)) / 8))); if ((tk >> 1) % 2) oy -= 0; }
    if (tk < sustoHasta) gx += (tk & 1) ? 2 : -2;
    else if (e.enf && !e.dormido) {
      const shiv = tk % 70;
      if (shiv < 18) {
        gx += (tk & 1) ? 1 : -1;
        if (shiv === 8) {
          lanzar('gota', SX + (Math.random() < 0.5 ? 18 : 38), SY + 18, 0, 0.4, 12);
        }
      }
    }
    if (llegada) { gx -= Math.round((1 - Math.min(1, llegada.t / 16)) * 110); oy -= Math.abs(Math.round(Math.sin(llegada.t * .9) * 4)); }
    if (act && act.tipo === 'ventana') { const p = Math.max(0, Math.min(1, act.t / 10, (act.len - act.t) / 10)); gx = Math.round(-14 * p); if (p > 0 && p < 1 && (tk >> 1) % 2) oy -= 2; }
    if (gT >= 0) {
      if (gTipo === 'baile') { gx += Math.round(Math.sin(gT * .9) * 4); oy -= Math.abs(Math.round(Math.sin(gT * .9) * 3)); }
      else if (gTipo === 'robot') { gx += (((gT / 3) | 0) % 2 ? 5 : -5); oy -= gT % 6 < 2 ? 2 : 0; }
      else if (gTipo === 'twist') { esx = Math.cos(gT * 1.1); if (Math.abs(esx) < .12) esx = .12; oy -= Math.abs(Math.round(Math.sin(gT * .8) * 3)); }
      else { esx = Math.cos(gT / GLEN.giro * Math.PI * 2); if (Math.abs(esx) < .12) esx = .12; }
    }
    const simVis = !(e.dormido && esc !== 'sala');
    if (simVis) ojoAtras();
    // sombra en el piso (se achica cuando salta)
    const rx = Math.max(12, 24 + Math.round(oy / 2));
    ctx.fillStyle = 'rgba(30,12,40,.34)';
    if (simVis && esc !== 'estudio') for (let y = -3; y <= 3; y++) { const w = Math.round(rx * Math.sqrt(1 - (y / 3.6) * (y / 3.6))); ctx.fillRect(SX + 28 + gx - w, SY + SH - 2 + y, w * 2, 1); }
    const est = estFisico();
    const auraFr = e.ropa.aura ? tk % 40 : 0;
    const nSim = (ban && !ban.pov && ban.i >= 3) ? 0 : n;   // dentro de la ducha Simon se ve con luz propia aunque sea de noche
    const spr = (esc === 'estudio' || esc === 'jardin') ? sprite('simon_atras|' + ropaSig() + '|af' + auraFr, () => simonGrid('c', 'n', e.ropa, {}, true, auraFr), nSim ? .22 : 0) : sprite('simon_' + ojos + boca + '|' + ropaSig() + '|' + est.oj + est.fl + est.tri + est.en + est.l + est.ab + '|af' + auraFr, () => simonGrid(ojos, boca, e.ropa, est, false, auraFr), nSim ? .22 : 0);
    const auraLSpr = (e.ropa.aura === 'aura_legend' && simVis && esc !== 'estudio') ? sprite('aura_legend|af' + auraFr, () => auraLegendGrid(auraFr), nSim ? .22 : 0) : null;
    if (!simVis) { /* Simon duerme en la recámara */ }
    else if (esc === 'estudio') { ctx.save(); ctx.translate(SX + 28 + gx, SY + 32 + oy); ctx.scale(EST_K * esx, EST_K); ctx.drawImage(spr, -28, -32); ctx.restore(); }
    else if (esc === 'calle') { if (auraLSpr) ctx.drawImage(auraLSpr, SX + gx - AURA_OX, SY + 6 + oy - AURA_OY); ctx.drawImage(spr, 0, 0, SW, 66, SX + gx, SY + 6 + oy, SW, 66); ctx.drawImage(spr, 0, 66, SW, SH - 66, SX + gx, SY + 72 + oy, SW, SH - 66); }
    else if (esx !== 1) { ctx.save(); ctx.translate(SX + 28 + gx, 0); ctx.scale(esx, 1); if (auraLSpr) ctx.drawImage(auraLSpr, -28 - AURA_OX, SY + oy - AURA_OY); ctx.drawImage(spr, -28, SY + oy); ctx.restore(); }
    else { if (auraLSpr) ctx.drawImage(auraLSpr, SX + gx - AURA_OX, SY + oy - AURA_OY); ctx.drawImage(spr, SX + gx, SY + oy); }
    if (simVis && esc === 'estudio') estudioFrente(n, oy, gx, esx);
    dibujarMuebles(n, 'frente');
    if (simVis) dibujarExtras(oy, gx);
    if (cortex.p > 0) {
      const cx = cxb() + Math.round((1 - cortex.p) * 76) + (bm && bm.fase === 'vuelo' && bm.t > VUELO - 6 ? ((tk & 1) ? 1 : -1) : 0), cy = SY + SH - 76 + ((tk >> 3) % 2);
      ctx.fillStyle = 'rgba(30,12,40,.34)';
      for (let y = -3; y <= 3; y++) { const w = Math.round(17 * Math.sqrt(1 - (y / 3.6) * (y / 3.6))); ctx.fillRect(cx + 30 - w, SY + SH - 2 + y, w * 2, 1); }
      const csp = sprite(cortexClave(), () => cortexG(), n ? .22 : 0);
      if (desc && !bm && !dlg && !mercPres && cortex.p >= 1 && !cortex.dir) { ctx.drawImage(csp, 0, 0, csp.width, 64, cx, cy + 6, csp.width, 64); ctx.drawImage(csp, 0, 70, csp.width, csp.height - 70, cx, cy + 70, csp.width, csp.height - 70); }   // sentado descansando
      else ctx.drawImage(csp, cx, cy);
      if (mercPres && !dlg && cortex.p >= 1) ctx.drawImage(sprite('fx_moneda', FX.moneda, 0), cx + 27, cy - 9 + ((tk >> 2) % 2) * 2);
      dibujarBomba(cx, cy);
    }
    ovFrente(); if (simVis) ojoFrente(); azulFrente(); truenoFrente(); banDibujar();
    sifDibuja(esc, n);
    if (esc === 'parque' || esc === 'jardin') parqueFX(clima());
    if (esc === 'jardin') reganderaDibujar();
    if (esc === 'calle') calleLluvia();
    if (esc === 'estudio') estudioViñeta();
    cajaDibuja();
    fx.forEach(f => {
      const ox = f.tipo === 'corazon' && (f.t >> 1) % 2 ? 1 : 0;
      ctx.drawImage(sprite('fx_' + f.tipo, FX[f.tipo], 0), Math.round(f.x) + ox, Math.round(f.y));
    });
    azulLuz(); truenoLuz();
  }
  let proxEstornudo = 150 + Math.floor(Math.random() * 100);
  function enfTick() {
    if (!e || !e.enf) return;
    if (e.dormido || dlg || modal || introActiva || escenaId() === 'calle') return;
    if (tk >= proxEstornudo) {
      proxEstornudo = tk + 150 + Math.floor(Math.random() * 100);
      sustoHasta = tk + 5;
      bocaT = 12;
      decir('¡Achú!', e.traductor ? (Math.random() < 0.5 ? '¡Achú! Qué frío...' : '¡Achú! Mi nariz...') : null, 2400);
      for (let i = 0; i < 5; i++) {
        const vx = (Math.random() - 0.5) * 2.2;
        const vy = -1.2 - Math.random() * 1.5;
        lanzar('gota', SX + 28, SY + 36, vx, vy, 12 + Math.floor(Math.random() * 8));
      }
    }
  }
  function tick() {
    tk++;
    ovTick(); blTick(); azulTick(); truenoTick(); banTick(); sifTick(); enfTick();
    if (tk % 4 === 0) dibujarLlama();
    if (tk % 10 === 0) { guiaTick(); actualizarTareas(); mercTick(); bombaTick(); if (modal === 'misiones' && misEspera() > 0) render(); }
    if (cortex.dir) {
      cortex.p = Math.max(0, Math.min(1, cortex.p + cortex.dir * (cortex.v || .1)));
      if (cortex.dir > 0 && tk % 2 === 0 && !cortex.suave) lanzar('estrella', LW - 58 + Math.random() * 54, SY + 6 + Math.random() * 56, 0, -.5, 7);
      if ((cortex.dir > 0 && cortex.p >= 1) || (cortex.dir < 0 && cortex.p <= 0)) { cortex.dir = 0; const f = cortex.cb; cortex.cb = null; if (f) f(); }
    }
    if (dlg) {
      const L = dlg.l[dlg.i];
      if (dlg.pos < L.t.length) {
        dlg.pos = Math.min(L.t.length, dlg.pos + 3); $('dlg-t').textContent = L.t.slice(0, dlg.pos); if (dlg.pos >= L.t.length && L.op) dlgOps(L);
        if (tk % 2 === 0) sfx.blip(L.q === 'CORTEX' ? 620 : L.q === 'SIMON' ? 880 : 1040);
      }
    }
    if (act) {
      act.t++;
      if (act.t >= act.len) act = null;
      else if (act.tipo === 'bailar') { if (act.t % 12 === 1) { gesto('baile'); estrellas(1); } bocaT = Math.max(bocaT, 3); }
      else if (act.tipo === 'pelota' && act.t % 14 === 1) saltoT = 0;
    } else if (tk >= proxAct && !modal && !dlg && !cortex.p && !introActiva && !e.dormido && saltoT < 0 && gT < 0 && bocaT === 0) iniciarAct();
    if (saltoT >= 0 && ++saltoT >= SALTO.length) saltoT = -1;
    if (gT >= 0 && ++gT >= GLEN[gTipo]) { gT = -1; gTipo = ''; }
    if (bocaT > 0) bocaT--; if (acarT > 0) acarT--;
    if (parpadeoT > 0) parpadeoT--; else if (!e.dormido && Math.random() < .03) parpadeoT = 2;
    if (e.dormido && escenaId() === 'sala' && tk % 14 === 0) lanzar('z', SX + 46, SY + 14, .7, -1.2, 18);
    if (tk % 26 === 0) {   // brillitos flotando alrededor de las macetas alienígenas ya colocadas (mientras vivan), del color de su especie
      const esc0 = escenaId();
      e.deco.forEach(d => { const it = ITEMS[d.k]; if (!it || !it.semilla || (d.h || 'sala') !== esc0 || !macetaViva(d.k)) return;
        const r = posReal(d); lanzar(it.semilla === 'raiz' ? 'cristal' : 'espora', r.cx + (Math.random() - .5) * (r.w * .7), r.y + r.h * .3 + Math.random() * 4, (Math.random() - .5) * .3, -.5 - Math.random() * .3, 22 + Math.random() * 10);
      });
    }
    for (let i = fx.length - 1; i >= 0; i--) {
      const f = fx[i];
      f.t++; f.x += f.vx; f.y += f.vy; if (f.g) f.vy += f.g;
      if (f.t >= f.vida) fx.splice(i, 1);
    }
    if (llegada && ++llegada.t >= 18) { llegada = null; decir('Sí.', e.traductor ? '¡Qué lindo parque!' : null, 3000); hablar(); gesto('salto'); corazones(2); }
    bombaAvanza();
    dibujar();
  }
  function disponer() {
    SX = Math.floor((LW - SW) / 2);                 // Simon centrado a lo ancho
    SYn = Math.round((LH - SH) / 2) + 4; SY = SYn;   // ...y a lo alto
    RY = Math.max(94, Math.round(LH * .55)) - 35;   // la pared ocupa un poco más de la mitad
    OX = Math.round((LW - 120) / 2);                // la decoración queda centrada
  }
  function ajustaSY() { const esc0 = escenaId(); SY = esc0 === 'estudio' ? Math.round(LH * .58) - 32 : esc0 === 'jardin' ? RY + 39 : SYn; }
  function calcPiso() {
    const dk = document.querySelector('.botones'), r = cv.getBoundingClientRect();
    if (!dk || !r.height) return;
    const y = (dk.getBoundingClientRect().top - r.top) / r.height * LH;
    PISO = Math.max(RY + 34, Math.floor(y - 2));
  }
  function ajustar() {
    const esc = $('escena');
    const cw = esc.clientWidth, ch = esc.clientHeight;
    if (!cw || !ch) return;
    const dpr = window.devicePixelRatio || 1;
    const ideal = Math.min(cw / 120, ch / 184);
    let k = Math.floor(ideal * dpr) / dpr;      // escala que cae exacta en pixeles del dispositivo
    if (k < 1) k = Math.max(.5, ideal);
    const W = Math.ceil(cw / k), H = Math.max(184, Math.ceil(ch / k));
    if (W !== LW || H !== LH) { LW = W; LH = H; cv.width = W; cv.height = H; ctx.imageSmoothingEnabled = false; disponer(); }
    cv.style.width = (W * k) + 'px';
    cv.style.height = (H * k) + 'px';
    calcPiso();
    dibujar();
  }
  function dibujarLogo() {
    const l = $('logo'), c = l.getContext('2d');
    c.clearRect(0, 0, 22, 12);
    c.drawImage(sprite('logo', coronaGrid, 0), 0, 0);
  }

  /* ===================== SONIDO CHIPTUNE ===================== */
  let ac = null;
  function audio() {
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) { return null; } }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }
  function nota(f, dur, t, tipo, vol) {
    if (e.mudo || !audio()) return;
    try {
      const o = ac.createOscillator(), g = ac.createGain();
      const a = Math.max(ac.currentTime, t || ac.currentTime);
      o.type = tipo || 'square'; o.frequency.setValueAtTime(f, a);
      g.gain.setValueAtTime(vol || .08, a); g.gain.setValueAtTime(vol || .08, a + dur * .55);
      g.gain.linearRampToValueAtTime(0.0001, a + dur);
      o.connect(g); g.connect(ac.destination);
      o.start(a); o.stop(a + dur + .02);
    } catch (_) {}
  }
  function seq(fs, paso, tipo = 'square', vol = .06, desde = 0) {
    if (e.mudo || !audio()) return;
    const t0 = ac.currentTime + .01 + desde;
    fs.forEach((f, i) => { if (f) nota(f, paso * .95, t0 + i * paso, tipo, vol); });
  }
  function crunch() {
    if (e.mudo || !audio()) return;
    const t0 = ac.currentTime + .01;
    [0, .12, .24].forEach(d => {
      const n = Math.floor(ac.sampleRate * .06), b = ac.createBuffer(1, n, ac.sampleRate), x = b.getChannelData(0);
      for (let i = 0; i < n; i++) x[i] = Math.round((Math.random() * 2 - 1) * (1 - i / n) * 4) / 4;
      const s = ac.createBufferSource(), g = ac.createGain();
      s.buffer = b; g.gain.value = .14; s.connect(g); g.connect(ac.destination); s.start(t0 + d);
    });
  }
  function estornudo() {   // "ah... ah... ¡CHÚ!": dos inhalaciones que suben y un soplido final
    if (e.mudo || !audio()) return;
    const t0 = ac.currentTime + .01;
    [[0, 520, 900], [.26, 600, 1150]].forEach(([d, a, b]) => {
      const o = ac.createOscillator(), g = ac.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(a, t0 + d); o.frequency.linearRampToValueAtTime(b, t0 + d + .2);
      g.gain.setValueAtTime(.001, t0 + d); g.gain.linearRampToValueAtTime(.09, t0 + d + .12); g.gain.linearRampToValueAtTime(.001, t0 + d + .22); o.connect(g); g.connect(ac.destination); o.start(t0 + d); o.stop(t0 + d + .24);
    });
    const tc = t0 + .62, n = Math.floor(ac.sampleRate * .22), buf = ac.createBuffer(1, n, ac.sampleRate), x = buf.getChannelData(0);
    for (let i = 0; i < n; i++) x[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 1.6);
    const ns = ac.createBufferSource(), ng = ac.createGain(), fl = ac.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.value = 2600; fl.Q.value = .6;
    ns.buffer = buf; ng.gain.value = .5; ns.connect(fl); fl.connect(ng); ng.connect(ac.destination); ns.start(tc);
    const o2 = ac.createOscillator(), g2 = ac.createGain(); o2.type = 'sawtooth'; o2.frequency.setValueAtTime(700, tc); o2.frequency.exponentialRampToValueAtTime(180, tc + .2);
    g2.gain.setValueAtTime(.08, tc); g2.gain.linearRampToValueAtTime(.001, tc + .22); o2.connect(g2); g2.connect(ac.destination); o2.start(tc); o2.stop(tc + .24);
  }
  const sfx = {
    click:     () => seq([1500], .03, 'square', .04),
    comer:     () => { crunch(); seq([523, 659, 784, 1047], .07, 'square', .05, .36); },
    jugar:     () => seq([392, 523, 659, 784, 659, 784, 1047], .06),
    dormir:    () => seq([784, 659, 523, 392, 330], .13, 'triangle', .12),
    despertar: () => seq([330, 392, 523, 659, 784], .07),
    toque:     () => seq([988, 1319], .05, 'square', .05),
    ronr:      () => seq([330, 392], .07, 'sine', .04),
    trueno:    () => seq([90, 70, 55, 45], .22, 'sawtooth', .09),
    pregunta:  () => seq([1319, 988, 1319, 1568], .07, 'square', .05),
    respuesta: () => seq([523, 523, 523, 659, 784, 1047], .08),
    no:        () => seq([196, 147], .1, 'square', .06),
    blip:      f => seq([f], .035, 'square', .03),
    moneda:    () => seq([988, 1319], .05, 'square', .05),
    compra:    () => seq([1319, 1568, 2093], .06, 'square', .05),
    nivel:     () => seq([523, 659, 784, 1047, 1319, 1047, 1319, 1568], .09),
    logro:     () => { seq([523, 523, 523, 659, 784, 1047], .1, 'square', .06); seq([262, 330, 392, 523], .2, 'triangle', .1); seq([784, 988, 1175, 1568, 1319, 1568, 2093], .09, 'square', .05, .62); },
    regalo:    () => seq([523, 659, 784, 659, 784, 1047, 1319, 1568], .08),
    tic:       () => seq([2200], .02, 'square', .03),
    boom:      () => { crunch(); setTimeout(crunch, 90); seq([160, 120, 90, 62, 45], .1, 'sawtooth', .12); },
    pop:       () => seq([784, 1047, 1319, 1568, 2093], .05, 'square', .05),
    splat:     () => seq([260, 190, 140, 100], .06, 'sawtooth', .07),
    cohete:    () => { seq([500, 700, 900, 1200, 1500], .05, 'sine', .04); setTimeout(() => seq([1800, 1300, 2200, 900], .03, 'square', .03), 280); },
    gigante:   () => { crunch(); setTimeout(crunch, 90); setTimeout(crunch, 200); seq([120, 90, 70, 50, 38, 30], .14, 'sawtooth', .16); }
  };

  /* ===================== INTERFAZ ===================== */

  var MINI = {
    keke: ['...r...', '.wwwww.', 'ppppppp', 'yyyyyyy', 'ppppppp', 'yyyyyyy', '.bbbbb.'],
    luna: ['..yyy..', '.yyy...', 'yyy....', 'yyy....', 'yyy....', '.yyy...', '..yyyy.'],
    rayo: ['....w..', '...yw..', '..yyw..', '.yyyyy.', '...yw..', '..yw...', '.y.....'],
    feliz: ['.yyyyy.', 'yyyyyyy', 'yykykyy', 'yyyyyyy', 'ykyyyky', 'yykkkyy', '.yyyyy.'],
    normal: ['.yyyyy.', 'yyyyyyy', 'yykykyy', 'yyyyyyy', 'yyyyyyy', 'yykkkyy', '.yyyyy.'],
    triste: ['.yyyyy.', 'yyyyyyy', 'yykykyy', 'yyyyyyy', 'yykkkyy', 'ykyyyky', '.yyyyy.'],
    gota: ['.c...c.', 'ww.c...', 'wwwqqqq', 'wwwpppd', 'wwwpppd', 'wwppppd', 'ddddddd'],   // barra de jabón rosa con espuma y burbujitas
    llora: ['.yyyyy.', 'yyyyyyy', 'yykykyy', 'yybybyy', 'yybybyy', 'yykkkyy', '.ykyyky']
  };
  function dibMini(id, m) {
    const c = $(id).getContext('2d'), col = { a: '#4ab8ff', r: '#ff4a6a', w: '#ffffff', p: '#ff9ab0', y: '#ffd84a', b: '#a8601c', k: '#232b63', d: '#d8607e', c: '#9ad8ff', q: '#ffd0dc' };
    if (id === 'si-h') col.y = '#ffd070';
    if (id === 'si-f') col.b = '#4ab8ff';
    c.clearRect(0, 0, 7, 7);
    m.forEach((f, y) => [...f].forEach((ch, x) => { if (col[ch]) { c.fillStyle = col[ch]; c.fillRect(x, y, 1, 1); } }));
  }
  function pintarCara() {
    const st = e.feliz > 70 ? 'feliz' : e.feliz > 45 ? 'normal' : e.feliz > 20 ? 'triste' : 'llora';
    if (pintarCara.s !== st) { pintarCara.s = st; dibMini('si-f', MINI[st]); }
  }
  function asegurarRacha() {
    if (!e || !Array.isArray(e.deco)) return;
    e.deco.forEach(d => { if (ITEMS[d.k] && ITEMS[d.k].slot === 'juguete') d.h = 'sala'; });
    const r = e.deco.find(d => d.k === 'racha');
    if (!r) e.deco.push({ k: 'racha', x: -31, y: -61, f: 0, h: 'sala' });
    else if ((r.x === -60 && r.y === -52) || (r.x === 70 && r.y === -48) || (r.x === 21 && r.y === -5) || (r.x === 23 && r.y === -5) || (r.x === 23 && r.y === -8) || (r.x === -30 && r.y === -53)) { r.x = -31; r.y = -61; }
    const tj = e.deco.find(d => ITEMS[d.k] && ITEMS[d.k].slot === 'juguete');
    if (!tj) e.deco.push({ k: 'juguete_pelota', x: 43, y: 92, f: 0, h: 'sala' });
  }
  function pintar() {
    document.documentElement.style.setProperty('--ft', [1, 1.2, 1.4][e.fuente == null ? 1 : e.fuente] || 1.2);
    asegurarRacha(); revisar(); pintarNav(); pintarCara();
    ['hambre', 'energia', 'feliz', 'limp'].forEach(k => {
      const s = $('s-' + k);
      if (!s) return;
      s.style.width = Math.max(4, e[k]) + '%';
      s.className = 'hpf ' + (e[k] > 50 ? 'ok' : e[k] > 25 ? 'medio' : 'bajo');
      const box = s.closest ? s.closest('.stat') : (s.parentElement && s.parentElement.parentElement);
      if (box && box.classList) box.classList.toggle('critico', e[k] <= 15);
    });
    $('l-dormir').textContent = e.dormido ? 'Despertar' : 'Dormir'; if (e.dormido !== pintarIconosBtn.d) { pintarIconosBtn(); }
    const n = nivel();
    $('v-mon').textContent = e.monedas;
    $('v-niv').textContent = 'NV' + n;
    checkTareas();
    const chEnf = $('chip-enf'); if (chEnf) chEnf.classList.toggle('oculto', !e.enf);
    $('v-fue').textContent = racha(); $('chip-fue').classList.toggle('apagada', !racha());
    { const cn = $('chip-niv'), mx = nivel() >= NMAX; cn.style.setProperty('--p', Math.round(progreso() * 100) + '%'); cn.classList.toggle('max', mx);
      if (cn._n && nivel() > cn._n) { cn.classList.remove('sube'); void cn.offsetWidth; cn.classList.add('sube'); } cn._n = nivel(); }
    pintarMis();
  }
  let tBurbuja;
  // coloca el globo justo encima de la cabeza de Simon y apunta la colita hacia ella
  function posBurbuja() {
    const b = $('burbuja'); if (!b.classList.contains('on')) return;
    const es = $('escena').getBoundingClientRect(), sc = $('sc').getBoundingClientRect(); if (!sc.width) return;
    const k = sc.width / LW, hx = sc.left - es.left + (SX + SW / 2) * k, hy = sc.top - es.top + (SY + 3) * k, bw = b.offsetWidth, bh = b.offsetHeight;
    const L = Math.max(bw / 2 + 8, Math.min(es.width - bw / 2 - 8, hx)), T = Math.max(8, hy - bh - 14);
    b.style.left = Math.round(L) + 'px'; b.style.top = Math.round(T) + 'px';
    b.style.setProperty('--tx', Math.round(Math.max(16, Math.min(bw - 16, hx - (L - bw / 2)))) + 'px');
  }
  setInterval(() => { posBurbuja(); if (modal === 'editar') posEdOverlay(); }, 60);
  function decir(txt, tr, dur) {
    if (escenaId() === 'jardin') return;   // en el jardín Simon no habla: es momento de estar con las plantas
    if (e && e.dormido && escenaId() !== 'sala') { if (/zzz/i.test(txt)) toast('SIMON ESTÁ DURMIENDO'); return; }
    const b = $('burbuja');
    if (!tr && e && e.traductor) { const m = /^(.*?)\s*\(([^)]+)\)\s*$/.exec(txt); if (m) { txt = m[1]; tr = m[2].charAt(0).toUpperCase() + m[2].slice(1) + (/[.!?…]$/.test(m[2]) ? '' : '.'); } }
    if (!(e && e.traductor)) {   // sin traductor Simon solo dice "Sí" (o ronca): nada de frases ni explicaciones entre paréntesis
      tr = null; txt = String(txt).replace(/\s*\([^)]*\)\s*$/, '');
      if (!/^[¡¿]?(s[ií]|zzz)(?![a-záéíóúñ])/i.test(txt)) txt = 'Sí.';
    }
    b.textContent = txt; if (/ach[úu]/i.test(txt)) estornudo();
    if (tr) { const sp = document.createElement('div'); sp.className = 'tr'; const ic = document.createElement('canvas'); ic.width = 12; ic.height = 13; ic.getContext('2d').drawImage(sprite('ic_trad', iconoTrad, 0), 0, 0); const bd = document.createElement('div'); bd.className = 'ti'; bd.appendChild(ic); const cu = document.createElement('div'); cu.className = 'tt'; const lb = document.createElement('small'); lb.textContent = 'TRADUCTOR'; const tx = document.createElement('span'); tx.textContent = '«' + tr + '»'; cu.appendChild(lb); cu.appendChild(tx); sp.appendChild(bd); sp.appendChild(cu); b.appendChild(sp); }
    b.classList.add('on'); posBurbuja();
    clearTimeout(tBurbuja);
    tBurbuja = setTimeout(() => b.classList.remove('on'), dur || (tr ? 3600 : 2400));
  }
  // Voz de Simon: siempre el mismo "sí"
  const vozSi = new Audio('si.mp3');
  vozSi.preload = 'auto';
  function hablar() {
    if (escenaId() === 'jardin') return;   // en el jardín Simon no habla
    bocaT = 15;
    if (e.mudo || document.hidden) return;
    try {
      vozSi.currentTime = 0;
      const p = vozSi.play();
      if (p && p.catch) p.catch(() => {});
    } catch (_) {}
  }
  function corazones(n) { for (let i = 0; i < n; i++) lanzar('corazon', SX + 14 + i * 12 + Math.random() * 3, SY + 8 - i * 4, 0, -2, 12 + i * 2); }
  function estrellas(n) { for (let i = 0; i < n; i++) lanzar('estrella', SX - 2 + Math.random() * 56, SY + 4 + Math.random() * 40, 0, -.5, 8 + i * 2); }
  function responder(extra, causa) {
    decir('Sí.', e.traductor ? (extra ? extra.replace(/[()]/g, '') : traducir(causa || 'otro')) : null);
    e.st.si++; gesto(); hablar();
  }
  /* ===================== SISTEMA CENTRAL DE EVENTOS ===================== */
  // Comprueba si el juego está libre para un evento según las condiciones requeridas (o = objeto con flags)
  function eventoLibre(o) {
    if (o.ban && ban) return false;
    if (o.cg && cg) return false;
    if (o.ipf && (typeof ipf === 'function' ? ipf() : false)) return false;
    if (o.camb && cambiando) return false;
    if (o.needI && !e.intro) return false;
    if (o.iA && introActiva) return false;
    if (o.dlg && dlg) return false;
    if (o.mod && modal) return false;
    if (o.celMod && modal && (modal === 'celebra' || modal === 'resp' || modal === 'editar')) return false;
    if (o.dorm && e.dormido) return false;
    if (o.cxP && cortex.p) return false;
    if (o.cxD && cortex.dir) return false;
    if (o.mP && mercPres) return false;
    if (o.mB && mercBusy) return false;
    if (o.desc && desc) return false;
    if (o.bm && bm) return false;
    if (o.mj && mj) return false;
    if (o.ed && edit) return false;
    if (o.sal && saludoPend) return false;
    if (o.cel && celCur) return false;
    if (o.mAq && !admVisita && mercInfo().est === 'aqui') return false;
    if (o.rt && rt) return false;
    if (o.run && run) return false;
    if (o.mem && mem) return false;
    if (o.sala && (escenaId() !== 'sala' || lugar)) return false;
    if (o.noE && escenaId() === 'estudio') return false;
    if (o.noL && lugar) return false;
    if (o.noC && (calle || escenaId() === 'calle')) return false;
    if (o.eE && estEstudiando()) return false;
    return true;
  }
  // Condiciones de bloqueo para cada tipo de evento (reproducen EXACTAMENTE las comprobaciones originales)
  const EV_TUT   = { ban:1, cg:1, ipf:1, camb:1, needI:1, iA:1, dlg:1, mod:1, dorm:1, cxP:1, cxD:1, mP:1, mB:1, desc:1, bm:1, mj:1, ed:1, sal:1, mAq:1, sala:1 };
  const EV_VIS   = { ban:1, cg:1, ipf:1, camb:1, needI:1, iA:1, dlg:1, mod:1, dorm:1, cxP:1, cxD:1, mP:1, mB:1, desc:1, bm:1, sal:1, mAq:1 };
  const EV_SIE   = { needI:1, iA:1, camb:1, dlg:1, mod:1, dorm:1, cxP:1, cxD:1, mP:1, mB:1, desc:1, bm:1, mj:1, ed:1, sal:1, mAq:1, sala:1 };
  const EV_INTD  = { iA:1, dlg:1, mod:1, cxP:1, cxD:1, mP:1, mB:1, cel:1, ed:1, desc:1, bm:1, mj:1 };
  const EV_INTE  = { dlg:1, mod:1, cxP:1, cxD:1, mP:1, mB:1, iA:1, cel:1 };
  const EV_MEMR  = { iA:1, dlg:1, mod:1, cxP:1, cxD:1, mP:1, mj:1, dorm:1, ed:1, sal:1, noE:1 };
  const EV_KEKE  = { iA:1, dlg:1, mod:1, dorm:1, cxP:1, cxD:1, mP:1, noE:1 };
  const EV_ROPA  = { iA:1, dlg:1, mod:1, dorm:1, cxP:1, cxD:1, mP:1, mj:1 };
  const EV_RPND  = { iA:1, dlg:1, mod:1, dorm:1, cxP:1, cxD:1, mj:1, noE:1 };
  const EV_CEL   = { iA:1, dlg:1, celMod:1, mj:1, rt:1, run:1, mem:1, ed:1, mB:1 };
  const EV_NOCHE = { needI:1, iA:1, ban:1, cg:1, ipf:1, camb:1, dlg:1, mod:1, dorm:1, cxP:1, cxD:1, mP:1, mB:1, desc:1, bm:1, mj:1, ed:1, rt:1, run:1, mem:1, noE:1, noC:1, noL:1, eE:1 };

  // Cola de eventos pendientes: reemplaza los bucles de setTimeout/retry
  let evPend = [];
  function evAgregar(id, pri, check, run) {
    if (evPend.some(p => p.id === id)) return false;
    evPend.push({ id, pri, check, run });
    evPend.sort((a, b) => a.pri - b.pri);
    return true;
  }
  function evQuitar(id) { evPend = evPend.filter(p => p.id !== id); }
  function evTiene(id) { return evPend.some(p => p.id === id); }
  function evProcesar() {
    for (let i = 0; i < evPend.length; i++) {
      if (evPend[i].check()) { const p = evPend.splice(i, 1)[0]; p.run(); return; }
    }
  }

  let proxKeke = Date.now() + 70000;
  function quiereKeke() { decir('¡Quiero keke!', null, 3200); hablar(); gesto('salto'); sfx.pregunta(); }
  function checkKeke() {
    if (Date.now() < proxKeke || !eventoLibre(EV_KEKE)) return;
    const hambre = e.hambre < 55;
    if (hambre || Math.random() < .5) quiereKeke();
    proxKeke = Date.now() + (hambre ? 150 + Math.random() * 200 : 480 + Math.random() * 600) * 1000;
  }
  function accion(fn) {
    act = null;
    if (e.dormido && fn.name !== 'dormir') { decir('Zzz...'); sfx.no(); return; }
    fn(); pintar(); guardar();
  }

  /* ===================== MONEDAS, CARIÑO Y LOGROS ===================== */
  const hoy = () => window.__fecha || (d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'))(new Date(ahora()));
  const difDias = (a, b) => { const A = a.split('-').map(Number), B = b.split('-').map(Number); return Math.round((Date.UTC(B[0], B[1] - 1, B[2]) - Date.UTC(A[0], A[1] - 1, A[2])) / 86400000); };
  /* ===================== ECONOMÍA Y PROGRESIÓN (todo el balance vive aquí) =====================
     Meta: nivel máximo 100 (la historia y el contenido nuevo irán llenando los niveles 26+; hoy hay objetos hasta NV25). Llegar a NV100 toma ~9 meses a tope y ~1 año a ritmo regular.
     Tiempo de juego diario para llegar a TODOS los topes: ~20-25 min al inicio, ~35 min hacia NV25, ~60 min hacia NV50 y ~90 min en NV100 (tras NV25 los topes crecen a 40%).
     Días por nivel (jugador dedicado): NV2 en minutos · NV5 en la primera partida (día 1) · NV10 día 4 · NV25 día ~23 · NV50 día ~83 · NV75 día ~164 · NV100 día ~263. Un jugador regular (60%) tarda ~35% más.
     Ingreso diario (todo incluido): NV1 ~150 monedas · NV10 ~265 · NV25 ~410 · NV100 ~700. Cada nivel da monedas (bono) y, hasta NV25, un REGALO GRATIS (LVGIFT); los múltiplos de 5 dan doble bono y los de 25 triple.
     El catálogo actual (~55 mil monedas) se compra hacia el día ~100: los niveles 26+ necesitan contenido nuevo. Los topes diarios evitan "granjear" en una tarde.
     Para agregar contenido nuevo: ponle nv (nivel de cariño) y precio con ECON_P(nv) como guía (el precio crece ~1.6x respecto al ingreso por nivel). */
  // (NMAX definido en config.js)
  // (nEf, XP_F, xpDe0, TOPE_XP, XPT, xpDe, ECO definidos en config.js)

  function nivel() { let n = 1; while (n < NMAX && e.xp >= xpDe(n + 1)) n++; return n; }
  const bonoNivelJuego = () => { const n = nivel(); return n >= 90 ? 3 : n >= 60 ? 2 : n >= 30 ? 1 : 0; };
  function progreso() { const n = nivel(); return n >= NMAX ? 1 : (e.xp - xpDe(n)) / (xpDe(n + 1) - xpDe(n)); }
  const toastQ = []; let toastOn = false;
  function toast(t) {
    if (toastOn) { if (!toastQ.includes(t)) { toastQ.push(t); while (toastQ.length > 2) toastQ.shift(); } return; }
    toastOn = true; toastMuestra(t);
  }
  let tipMon = 0;
  function faltanMon(n) {   // no alcanzan las monedas: avisa cuántas faltan y cómo conseguirlas
    const T = ['Cumple las misiones del día para ganar monedas', 'Juega en el arcade: cada partida da monedas', 'Reclama tus trofeos y logros: dan monedas', 'Entra cada día por tu regalo diario', 'Subir de nivel también te da monedas'];
    toast('Te faltan ' + n + ' monedas'); toast(T[tipMon++ % T.length]);
  }
  function toastMuestra(t) {
    const d = document.createElement('div'); d.className = 'toast'; d.textContent = t;
    const c = $('toasts'); c.appendChild(d);
    // si hay un diálogo abierto, los avisos van justo encima de su cuadro
    const bx = $('dlg').classList.contains('on') ? $('dlg-box').getBoundingClientRect() : null, pr = c.parentElement.getBoundingClientRect();
    c.style.bottom = bx && bx.height ? Math.max(132, Math.round(pr.bottom - bx.top + 6)) + 'px' : '';
    while (c.children.length > 1) c.firstChild.remove();
    setTimeout(() => d.remove(), 2400);
    setTimeout(() => { if (toastQ.length) toastMuestra(toastQ.shift()); else toastOn = false; }, 2500);
  }
  function darXp(x) {
    const antes = nivel(); e.xp += x;
    // Durante el tutorial, no subir de nivel 1 — NV2 llega con el regalo diario
    if (introActiva) { const tope = xpDe(2) - 1; if (e.xp > tope) e.xp = tope; }
    const ahora = nivel();
    for (let n = antes + 1; n <= ahora; n++) subirNivel(n);
  }
  var celQ = [], celCur = null;
  function subirNivel(n) {
    const bono = Math.round(ECO.bono(n)); e.monedas += bono; e.total += bono;
    const gk = LVGIFT[n]; let gift = null, gcomp = 0;
    if (gk && ITEMS[gk]) { if (e.tiene[gk]) { gcomp = Math.round((ITEMS[gk].p || 200) * .5); e.monedas += gcomp; e.total += gcomp; } else { e.tiene[gk] = 1; gift = gk; } }
    const g = GESTOS.find(g => g.nv === n), zonas = HABS.filter(h => h.nv === n && n > 1), lg = LUGARES.find(l => l.nv === n);
    const nuevos = Object.keys(ITEMS).filter(k => ITEMS[k].nv === n && !ITEMS[k].regalo && !ITEMS[k].mercader && ITEMS[k].p > 0 && !habBloq(k));
    zonas.forEach(z => Object.keys(ITEMS).forEach(k => { if (ITEMS[k].tema === z.id && ITEMS[k].nv < n && !ITEMS[k].regalo && !ITEMS[k].mercader && ITEMS[k].p > 0 && !nuevos.includes(k)) nuevos.push(k); }));
    const ropa = nuevos.some(k => ITEMS[k].tipo === 'ropa'), deco = nuevos.some(k => ITEMS[k].tipo === 'cuarto'), comida = Object.keys(COMIDAS).some(k => COMIDAS[k].nv === n && COMIDAS[k].p > 0);
    { const pt = []; if (g) pt.push('gesto ' + g.n); zonas.forEach(z => pt.push(z.id === 'entrada' ? 'zona ENTRADA' : 'habitación ' + z.n)); if (lg) pt.push('lugar ' + lg.n); if (ropa) pt.push('ropa nueva'); if (deco) pt.push('decoración nueva'); if (comida) pt.push('comida nueva'); if (gift) pt.push('regalo ' + ITEMS[gift].n); notificar('¡Cariño NV' + n + '!' + (pt.length ? ' Nuevo: ' + pt.join(' · ') + '.' : '') + ' +' + bono + ' monedas.'); }
    if (n >= 2 && e.intro) e.memPend.push(n);
    celQ.push({ n, bono, gift, gcomp, g, zonas, lg, ropa, deco, comida, items: nuevos.slice(), foods: Object.keys(COMIDAS).filter(k => COMIDAS[k].nv === n && COMIDAS[k].p > 0) });
    celebraCheck();
  }
  function celebraCheck() {
    if (!celQ.length || !eventoLibre(EV_CEL)) return;
    celCur = celQ.shift(); abrir('celebra'); sfx.logro();
    if (celCur.zonas.length || celCur.lg) setTimeout(() => estrellas(12), 450);
    estrellas(14); corazones(5); gesto(celCur.g ? celCur.g.id : 'baile');
    [300, 700, 1100].forEach(t => setTimeout(() => { if (modal === 'celebra') estrellas(8); }, t));
  }
  function renderCel() {
    const c = celCur; if (!c) return '';
    $('m-titulo').textContent = '¡FELICIDADES!';
    let d = 0; const dl = () => `style="animation-delay:${(d += .25).toFixed(2)}s"`;
    const conf = Array.from({ length: 18 }, (_, i) => `<i style="left:${(i * 37 + 7) % 100}%;background:${['#ff5a7a', '#ffd84a', '#6ad0ff', '#7aff9a', '#c89aff'][i % 5]};animation-delay:${((i * 0.23) % 2.2).toFixed(2)}s;animation-duration:${(2.4 + (i % 4) * .5).toFixed(1)}s"></i>`).join('');
    let h = `<div class="cel-wrap"><div class="cel-rayos"></div><div class="cel-conf">${conf}</div>`;
    h += `<div class="cel-medalla"><div class="cel-med-t">CARIÑO</div><div class="cel-med-n">${c.n}</div></div><div class="cel-sube">¡SUBISTE DE NIVEL!</div><div class="cel-chip">+${c.bono} MONEDAS</div></div>`;
    if (c.gift) h += `<div class="cel-zona cel-gift" ${dl()}><div class="cel-t">★ REGALO DE NIVEL ★</div><canvas class="cel-prev cel-gp" data-prev="${c.gift}"></canvas><div class="cel-n" style="margin-bottom:2px">${ITEMS[c.gift].n}</div></div>`;
    else if (c.gcomp) h += `<div class="cel-gesto" ${dl()}>YA TENIAS TU REGALO: +${c.gcomp} MONEDAS</div>`;
    c.zonas.forEach(z => { h += `<div class="cel-zona" ${dl()}><div class="cel-t">★ ${z.id === 'entrada' ? 'NUEVA ZONA' : 'NUEVA HABITACION'} ★</div><canvas class="cel-prev" data-prev="hb_${z.id}"></canvas><div class="cel-n" style="margin-bottom:2px">${z.n}</div></div>`; });
    if (c.lg) h += `<div class="cel-zona" ${dl()}><div class="cel-t">★ NUEVO LUGAR EN EL MAPA ★</div><canvas class="cel-prev" data-prev="lg_${c.lg.id}"></canvas><div class="cel-n" style="margin-bottom:2px">${c.lg.n}</div></div>`;
    const its = c.items.filter(k => k !== undefined), fds = c.foods;
    if (its.length || fds.length) {
      const tot = its.length + fds.length, vis = [...fds.map(k => 'fd_' + k), ...its].slice(0, 8);
      h += `<div class="cel-tienda" ${dl()}><div class="cel-t">NUEVO EN LA TIENDA</div><div class="cel-its">${vis.map(k => `<div class="cel-it"><canvas data-prev="${k}"></canvas></div>`).join('')}${tot > 8 ? `<div class="cel-it mas">+${tot - 8}</div>` : ''}</div></div>`;
    }
    if (c.g) h += `<div class="cel-gesto" ${dl()}>★ NUEVO GESTO: ${c.g.n} ★</div>`;
    h += `<button class="bt gran" style="padding:12px 0;margin-top:12px" data-a="cel_ok">¡GENIAL!</button>`;
    return h;
  }
  function celClick(a, k) {
    if (a === 'cel_ok') { cerrar(); celCur = null; setTimeout(celebraCheck, 400); return; }
    if (a === 'cel_ir') { cerrar(); celCur = null; sfx.click(); if (k === 'mapa') { abrir('mapa'); return; } setTimeout(() => irHab(HABS.findIndex(h => h.id === k)), 300); setTimeout(celebraCheck, 1500); return; }
    if (a === 'cel_tienda') { celCur = null; tab = k; fHab = 'todo'; tv = 'cat'; tvPre = true; sfx.click(); abrir('tienda'); }
  }
  function ecoDia() { const E = e.eco; if (E.f !== hoy()) { E.f = hoy(); E.c = 0; E.x = 0; E.fr = 0; E.av = 0; } return E; }
  function animarMonedas(cant, esGasto) {
    if (!cant || cant <= 0) return;
    const chip = $('chip-mon');
    if (!chip) return;
    chip.classList.remove('pulso', 'pulso-rojo');
    void chip.offsetWidth;
    chip.classList.add(esGasto ? 'pulso-rojo' : 'pulso');
    if (typeof document !== 'undefined' && document.createElement) {
      try {
        const span = document.createElement('span');
        span.className = 'flotante-mon' + (esGasto ? ' gasto' : '');
        span.textContent = (esGasto ? '-' : '+') + cant;
        chip.appendChild(span);
        setTimeout(() => { try { span.remove(); } catch (_) {} }, 950);
      } catch (_) {}
    }
  }
  if (typeof window !== 'undefined') window.animarMonedas = animarMonedas;

  function animarXp(cant) {
    if (!cant || cant <= 0) return;
    const chip = $('chip-niv');
    if (!chip) return;
    if (typeof document !== 'undefined' && document.createElement) {
      try {
        const span = document.createElement('span');
        span.className = 'flotante-xp';
        span.textContent = '+' + cant + ' XP';
        chip.appendChild(span);
        setTimeout(() => { try { span.remove(); } catch (_) {} }, 950);
      } catch (_) {}
    }
  }
  if (typeof window !== 'undefined') window.animarXp = animarXp;

  // libre = true: recompensas fijas del día (misiones, planta, regalos, hallazgos...) que no cuentan para el tope diario
  function ganar(m, x, libre) {
    if (!libre) {
      const E = ecoDia(), n = nivel();
      if (m) { const tope = Math.floor(ECO.topeMon(n)); m = Math.max(0, Math.min(m, tope - E.c)); E.c += m; }
      if (x) {
        const hueco = Math.max(0, ECO.topeXp(n) - E.x), pleno = Math.min(x, hueco), resto = x - pleno; E.x += x;
        E.fr += resto * .25; const ex = Math.floor(E.fr); E.fr -= ex; x = pleno + ex;
        if (E.x >= ECO.topeXp(n) && !E.av) { E.av = 1; toast('CORTEX: Simon ya tuvo mucho cariño hoy. ¡Mañana habrá más!'); }
      }
    }
    const nAntes = nivel();
    if (x) {
      animarXp(x);
      darXp(x);
    }
    if (m) {
      e.monedas += m; e.total += m;
      if (nivel() === nAntes) sfx.moneda();
      lanzar('moneda', SX + 24 + Math.random() * 8, SY + 10, 0, -2.5, 10);
      animarMonedas(m, false);
    }
  }
  const LOGROS = [
    { id: 'rt10', n: 'Baila 10 veces', d: 'Minijuego de ritmo', meta: 10, r: 40, val: () => e.st.rt },
    { id: 'si100',  n: 'Dile sí 100 veces',          d: 'Simon te responde "sí"',  meta: 100, r: 30,  val: () => e.st.si },
    { id: 'si500',  n: 'Dile sí 500 veces',          d: 'Sí, sí y más sí',         meta: 500, r: 80,  val: () => e.st.si },
    { id: 'comer7', n: 'Alimentarlo 7 días seguidos', d: 'Un día sin comer reinicia', meta: 7, r: 60,  val: () => e.mejorComer },
    { id: 'comer50',n: 'Dale de comer 50 veces',     d: 'Keke para todos',        meta: 50,  r: 40,  val: () => e.st.comer },
    { id: 'jugar30',n: 'Juega 30 veces con él',      d: 'Diversión sin fin',       meta: 30,  r: 40,  val: () => e.st.jugar },
    { id: 'dice20', n: 'Escucha 20 "Simon dice"',    d: 'Sus ideas locas',         meta: 20,  r: 40,  val: () => e.st.dice },
    { id: 'toca100',n: 'Acaricialo 100 veces',       d: 'Toca a Simon',            meta: 100, r: 50,  val: () => e.st.toques },
    { id: 'dormir10',n:'Duérmelo 10 veces',          d: 'Duerme bien, Simon',      meta: 10,  r: 30,  val: () => e.st.dormir },
    { id: 'racha7', n: 'Reclama 7 regalos diarios', d: 'Un regalo por día',     meta: 7,   r: 100, val: () => e.mejorRacha },
    { id: 'nivel5', n: 'Llega al cariño nivel 5',    d: 'Simon te quiere mucho',   meta: 5,   r: 40, val: () => nivel() },
    { id: 'nivel10', n: 'Llega al cariño nivel 10', d: 'Ya son mejores amigos',   meta: 10,  r: 100, val: () => nivel() },
    { id: 'nivel15', n: 'Llega al cariño nivel 15', d: 'Familia de otro planeta', meta: 15,  r: 150, val: () => nivel() },
    { id: 'nivel20', n: 'Llega al cariño nivel 20', d: 'Inseparables',            meta: 20,  r: 250, item: 'sud_galaxia', val: () => nivel() },
    { id: 'nivel25', n: 'Llega al cariño nivel 25', d: 'Cariño legendario',       meta: 25,  r: 400, item: 'capa_real', val: () => nivel() },
    { id: 'nivel50', n: 'Llega al cariño nivel 50', d: 'Media vida juntos',       meta: 50,  r: 800, item: 'aura_mistica', val: () => nivel() },
    { id: 'nivel75', n: 'Llega al cariño nivel 75', d: 'Amigos para siempre',     meta: 75,  r: 1200, val: () => nivel() },
    { id: 'nivel100', n: 'Llega al cariño nivel 100', d: 'Cariño infinito',       meta: 100, r: 2000, val: () => nivel() },
    { id: 'compra5',n: 'Compra 5 cosas',             d: 'Ropa y muebles',          meta: 5,   r: 50,  val: () => e.st.compras },
    { id: 'ricos',  n: 'Gana 500 monedas en total',  d: 'Simon es rico',           meta: 500, r: 50,  val: () => e.total },
    { id: 'foto1', n: 'Toma tu primera foto', d: 'Usa el botón de cámara', meta: 1, r: 20, val: () => e.st.fotos },
    { id: 'foto5', n: 'Toma 5 fotos', d: 'Compártelas con tus amigos', meta: 5, r: 40, val: () => e.st.fotos },
    { id: 'chef8', n: 'Prueba 8 comidas distintas', d: 'Comida especial de la tienda', meta: 8, r: 60, val: () => Object.keys(e.probo).length },
    { id: 'deco6', n: 'Pon 6 cosas en tu habitación', d: 'Muebles y decoración', meta: 6, r: 60, val: () => e.deco.filter(d => d.k !== 'puf_azul' && d.k !== 'racha' && !String(d.k).startsWith('juguete_')).length },
    { id: 'sec12', n: 'Descubre 12 secretos de Simon', d: 'Pregúntale cosas', meta: 12, r: 80, val: () => Object.keys(e.sec).length },
    { id: 'sec24', n: 'Descubre todos sus secretos', d: 'Diario completo', meta: 24, r: 200, item: 'collar_diamante', val: () => Object.keys(e.sec).length },
    { id: 'racha30', n: 'Reclama 30 regalos diarios', d: 'Constancia de campeón', meta: 30, r: 200, item: 'alas_dragon', val: () => e.mejorRacha },
    { id: 'mis50', n: 'Completa 50 misiones de Cortex', d: 'Su mejor ayudante', meta: 50, r: 150, item: 'bufanda_arcoiris', val: () => e.st.misiones },
    { id: 'compra25', n: 'Compra 25 cosas', d: 'Ropa y muebles', meta: 25, r: 100, val: () => e.st.compras },
    { id: 'adiv10', n: 'Adivina 10 veces en qué piensa Simon', d: 'Ve sus pensamientos', meta: 10, r: 50, val: () => e.st.adiv },
    { id: 'album18', n: 'Completa el álbum de Simon', d: 'Todo lo que imagina', meta: 18, r: 150, item: 'gafas_arcoiris', val: () => Object.keys(e.pens).length },
    { id: 'mis10', n: 'Completa 10 misiones de Cortex', d: 'Tres nuevas cada día', meta: 10, r: 60, val: () => e.st.misiones },
    { id: 'bomba10', n: 'Explota a Cortex 10 veces', d: 'A Simon le encanta', meta: 10, r: 80, item: 'marco_boom', val: () => e.st.bombas },
    { id: 'parque5', n: 'Juega 5 veces en el parque', d: 'Sal por la puerta de la entrada', meta: 5, r: 60, val: () => e.st.parque },
    { id: 'merc3', n: 'Comercia con Cortex 3 veces', d: 'Viene una vez al día',  meta: 3,   r: 60,  val: () => e.st.tratos },
    { id: 'bano3', n: 'Báñalo 3 veces', d: 'Toca la regadera del baño', meta: 3, r: 40, val: () => e.st.banos || 0 },
    { id: 'visitas3', n: 'Recibe 3 visitas de Cortex', d: 'Viene de vez en cuando', meta: 3, r: 60, val: () => e.st.visitas },
    { id: 'mjrec', n: 'Supera tu récord en Atrapa el keke', d: 'Juega en MINIJUEGOS', meta: 1, r: 50, val: () => e.mj.rompio },
    { id: 'mj25', n: 'Consigue 25 puntos atrapando keke', d: 'Esquiva las bombas', meta: 25, r: 60, val: () => e.mj.rec },
    { id: 'dibu5',  n: 'Junta los 5 dibujos de Simon', d: 'Los encuentra solo',    meta: 5,   r: 80,  val: () => Object.keys(e.dibujos).length }
  ];
  LOGROS.forEach(l => { if (!['nivel50', 'nivel75', 'nivel100'].includes(l.id)) l.r = Math.round(l.r * 1.5 / 5) * 5; });
  function revisar() {
    PREM_SETS.forEach(s => { if (!e.tiene[s.premio] && s.items.every(k => e.tiene[k])) { e.tiene[s.premio] = 1; toast('¡SET ' + s.n + ' COMPLETO! ' + ITEMS[s.premio].n); sfx.logro(); setTimeout(() => { sfx.regalo(); estrellas(12); }, 400); notificar('Set ' + s.n + ' completo: ' + ITEMS[s.premio].n); } });
    LOGROS.forEach(l => {
      if (e.logros[l.id] || l.val() < l.meta) return;
      e.logros[l.id] = 1; e.monedas += l.r; e.total += l.r;
      toast('¡LOGRO! ' + l.n + ' +' + l.r); if (!l.id.startsWith('nivel')) sfx.logro(); notificar('Logro: ' + l.n + ' (+' + l.r + ' monedas)');
      if (l.item && !e.tiene[l.item]) { e.tiene[l.item] = 1; if (ITEMS[l.item].tipo === 'ropa') { toast('¡PRENDA PREMIUM: ' + ITEMS[l.item].n + '!'); setTimeout(() => { sfx.regalo(); estrellas(10); }, 400); } else toast('¡Nueva obra para tu cuadro: ' + ITEMS[l.item].n.replace('OBRA: ', '') + '!'); }
    });
  }

  /* ===================== VIDA PROPIA, TAREAS Y HALLAZGOS ===================== */
  const ahora = () => window.__ahora || Date.now();
  const DIBUJOS = ['sol', 'casa', 'flor', 'luna', 'corazon'];
  // (NOMBRE_DIB definido en dialogos.js)
  function libroGrid(f) {
    const g = Grid(22, 12);
    capa(g, '#150f55', L => {
      L.rect(0, 2, 22, 10, '#2a3c9a'); L.rect(1, 1, 10, 9, '#ffffff'); L.rect(11, 1, 10, 9, '#f0f2fb'); L.rect(10, 1, 2, 9, '#c8c8d8');
      [3, 5, 7].forEach((y, i) => { L.rect(2, y, f ? 5 + (i % 2) * 2 : 7, 1, '#9aa6c8'); L.rect(13, y, f ? 7 : 5 + (i % 2) * 2, 1, '#9aa6c8'); });
    });
    return g;
  }
  function pelotaGrid() {
    const g = Grid(9, 9);
    capa(g, '#4a0a14', L => sombrear(L, elipse(4.5, 4.5, 4.5, 4.5), 4.5, 4.5, 4.5, 4.5, R.rojo));
    g.rect(1, 4, 7, 1, '#ffffff');
    return g;
  }
  function hallGrid(tipo) {
    const g = Grid(11, 11);
    if (tipo === 'moneda') {
      capa(g, '#8a5a08', L => sombrear(L, elipse(5.5, 5.5, 4.8, 4.8), 5.5, 5.5, 4.8, 4.8, R.dorado));
      g.rect(5, 3, 1, 5, '#8a5a08');
    } else {
      capa(g, '#7a6a40', L => { L.rect(1, 1, 9, 9, '#f4eed8'); L.rect(1, 4, 9, 2, '#ff6a8a'); });
      g.rect(1, 5, 9, 1, '#e8353f');
    }
    return g;
  }
  function dibujoGrid(id) {
    const g = Grid(16, 16);
    g.rect(0, 0, 16, 16, '#c8b888'); g.rect(1, 1, 14, 14, '#f4eed8');
    const rell = (t, c) => { for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if (t(x, y)) g.set(x, y, c); };
    if (id === 'sol') {
      rell(elipse(8, 8, 3.4, 3.4), '#ffd020');
      [[8, 2], [8, 3], [8, 13], [8, 12], [2, 8], [3, 8], [13, 8], [12, 8], [4, 4], [12, 4], [4, 12], [12, 12]].forEach(([x, y]) => g.set(x, y, '#ff8a20'));
    } else if (id === 'casa') {
      g.rect(3, 8, 10, 6, '#e8353f');
      for (let y = 3; y <= 7; y++) { const h = y - 2; g.rect(8 - h, y, h * 2, 1, '#6e4422'); }
      g.rect(7, 11, 3, 3, '#6e4422'); g.rect(4, 10, 2, 2, '#62b8ff'); g.rect(11, 10, 2, 2, '#62b8ff');
    } else if (id === 'flor') {
      g.rect(8, 8, 1, 6, '#2f9a4a'); g.rect(6, 11, 2, 1, '#2f9a4a'); g.rect(9, 12, 2, 1, '#2f9a4a');
      [[8, 3.5], [8, 8.5], [5.5, 6], [10.5, 6]].forEach(([cx, cy]) => rell(elipse(cx, cy, 2, 2), '#ff6a8a'));
      rell(elipse(8, 6, 1.7, 1.7), '#ffd020');
    } else if (id === 'luna') {
      g.rect(2, 2, 12, 12, '#232b63');
      const m = elipse(8, 8, 4, 4), h = elipse(10, 7, 3.4, 3.4);
      rell((x, y) => m(x, y) && !h(x, y), '#ffe45a');
      [[4, 4], [12, 12], [12, 4], [4, 12]].forEach(([x, y]) => g.set(x, y, '#ffffff'));
    } else g.art(3, 4, CORAZON, { O: '#7a1020', r: '#ff4a5c', h: '#ffb6c0' });
    return g;
  }
  function macetaGrid(etapa) {
    const g = Grid(14, 13);
    capa(g, '#5a2810', L => { L.rect(3, 9, 8, 4, R.barro[1]); L.rect(2, 8, 10, 2, R.barro[0]); L.rect(3, 12, 8, 1, R.barro[2]); });
    const v = '#2f9a4a', v2 = '#5ccf5a';
    if (etapa >= 1) { g.rect(7, etapa === 1 ? 6 : 3, 1, etapa === 1 ? 2 : 5, v); }
    if (etapa === 1) { g.set(6, 6, v2); g.set(5, 5, v2); g.set(8, 6, v2); g.set(9, 5, v2); }
    if (etapa === 2) { g.rect(4, 5, 3, 1, v2); g.rect(8, 4, 3, 1, v2); g.set(4, 4, v2); g.set(10, 3, v2); g.set(6, 3, v2); g.set(8, 2, v2); }
    if (etapa === 3) {
      g.rect(7, 4, 1, 4, v); g.rect(4, 6, 3, 1, v2); g.rect(8, 5, 3, 1, v2);
      [[7, 0], [7, 4], [5, 2], [9, 2]].forEach(([x, y]) => { g.rect(x - 1, y - 1 < 0 ? 0 : y - 1, 3, 2, '#ff4a6a'); });
      g.rect(6, 1, 3, 3, '#ffd020');
    }
    return g;
  }
  const fmt = ms => { ms = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(ms / 3600) + ':' + String(Math.floor(ms % 3600 / 60)).padStart(2, '0') + ':' + String(ms % 60).padStart(2, '0'); };
  const resta = (t, dur) => Math.min(dur, t.ini + dur - ahora());
  const estadoTarea = (t, dur) => !t ? 0 : resta(t, dur) <= 0 ? 2 : 1;
  const dibIcono = (cv, clave, fn) => { const c = cv.getContext('2d'); c.clearRect(0, 0, 14, 13); c.drawImage(sprite(clave, fn, 0), 0, 0); };
  function actualizarTareas() {}
  function checkTareas() {}

  // Simon hace cosas solo
  function iniciarAct() {
    if (escenaId() === 'estudio' || escenaId() === 'jardin') { proxAct = tk + 600; return; }
    const sc = escenaId(), op = sc === 'parque' ? ['pelota', 'pelota', 'mariposa'] : sc === 'sala' ? ['leer', 'ventana', 'pelota'] : sc === 'cocina' ? ['ventana', 'pelota'] : sc === 'estudio' ? ['ventana', 'leer'] : ['pelota'];
    if ((sc === 'sala' || sc === 'cocina' || sc === 'estudio') && clima() !== 'sol') op.push('ventana', 'ventana'); if (e.ropa.orejas) op.push('bailar', 'bailar');
    const t = op[Math.floor(Math.random() * op.length)];
    const len = { leer: 50, ventana: 60, pelota: 42, bailar: 38, mariposa: 50 }[t];
    act = { tipo: t, t: 0, len };
    if (t === 'ventana') { const l = frasesVentana(); setTimeout(() => { if (act && act.tipo === 'ventana') decir(l[Math.floor(Math.random() * l.length)]); }, 1000); }
    if (t === 'mariposa') setTimeout(() => { if (act && act.tipo === 'mariposa') decir('Sí. (una mariposa)'); }, 900);
    proxAct = tk + len + 90 + Math.random() * 120;
  }
  function dibujarExtras(oy, gx) {
    if (e.enf && !e.dormido) {
      const by = Math.round(SY + oy - 7 + Math.sin(tk / 4) * 2);
      const bx = SX + 38 + gx;
      const f = (tk >> 4) % 2;
      ctx.drawImage(sprite('enf_burbuja' + f, () => termometroFlotanteGrid(f), 0), bx, by);
    }
    if (escenaId() === 'jardin') { if (e.hallazgo) ctx.drawImage(sprite('hall_' + e.hallazgo.tipo, () => hallGrid(e.hallazgo.tipo), 0), SX + SW - 2, SY + 24 + Math.round(Math.sin(tk / 3) * 2)); return; }
    if (act && act.tipo === 'leer') { const f = (act.t >> 3) % 2; ctx.drawImage(sprite('libro' + f, () => libroGrid(f), 0), SX + gx + 17, SY + oy + 53); }
    else if (act && act.tipo === 'mariposa') {
      const bx = Math.round(SX + 24 + Math.sin(act.t / 6) * 44), by = Math.round(SY - 4 + Math.cos(act.t / 4) * 10), a = (act.t >> 1) % 2;
      ctx.fillStyle = '#ff8ad8'; ctx.fillRect(bx - 5, by - (a ? 3 : 0), 5, a ? 5 : 3); ctx.fillRect(bx + 1, by - (a ? 3 : 0), 5, a ? 5 : 3);
      ctx.fillStyle = '#ffe0f4'; ctx.fillRect(bx - 4, by - (a ? 2 : 0), 2, 2); ctx.fillRect(bx + 3, by - (a ? 2 : 0), 2, 2); ctx.fillStyle = '#3a2a4a'; ctx.fillRect(bx, by - 1, 1, 5);
    }
    else if (act && act.tipo === 'pelota') {
      const p = act.t / act.len * 2, q = p <= 1 ? p : 2 - p;
      const jk = juguetePuesto(), spj = sprite('tj_' + jk, () => ITEMS[jk].grid(), 0);
      ctx.drawImage(spj, Math.round(SX - 14 + (SW + 22) * q) + 4 - (spj.width >> 1), Math.round(SY + SH - 5 - spj.height - Math.abs(Math.sin(p * Math.PI * 3)) * 24));
    }
    if (e.hallazgo) ctx.drawImage(sprite('hall_' + e.hallazgo.tipo, () => hallGrid(e.hallazgo.tipo), 0), SX + SW - 2, SY + 24 + Math.round(Math.sin(tk / 3) * 2));
  }
  function checkHallazgo() {
    if (e.hallazgo || ahora() < e.proxHallazgo) return;
    const faltan = DIBUJOS.filter(d => !e.dibujos[d]), pool = faltan.length ? faltan : DIBUJOS;
    e.hallazgo = { tipo: Math.random() < .7 ? 'moneda' : 'dibujo', id: pool[Math.floor(Math.random() * pool.length)] };
    if (!e.dormido && !modal) { decir('Sí. (encontré algo)'); sfx.toque(); }
    notificar('Simon encontró algo. ¡Tócalo para recogerlo!');
    guardar();
  }
  function recogerHallazgo() {
    const h = e.hallazgo; if (!h) return;
    e.hallazgo = null; e.proxHallazgo = ahora() + (150 + Math.random() * 180) * 60000;
    if (h.tipo === 'moneda') { const m = 3 + Math.floor(Math.random() * 3); ganar(m, 1, true); decir('Sí. (¡lo encontré para ti!)'); gesto('besos'); hablar(); }
    else { e.dibujos[h.id] = 1; ganar(10, 3, true); dibujoId = h.id; sfx.regalo(); hablar(); abrir('dibujo'); }
  }
  let dibujoId = 'sol';
  // saludo según la hora o la ausencia
  let saludoPend = null;
  // Nivel de abandono: 0=normal, 1=descuidado (3+ días todo en 0), 2=abandono total (7+ días)
  function nivelAbandono() {
    if (e.hambre > 0 || e.feliz > 0 || e.energia > 0 || e.limp > 0) { e.abandonoDesde = null; return 0; }
    if (!e.abandonoDesde) e.abandonoDesde = Date.now();
    const dias = (Date.now() - e.abandonoDesde) / 86400000;
    return dias >= 7 ? 2 : dias >= 3 ? 1 : 0;
  }
  function prepararSaludo() {
    const h = new Date().getHours();
    saludoPend = nivelAbandono() >= 2 ? '...s-sí...' : ausenciaH >= 72 ? 'Sí... (te extrañé mucho)' : ausenciaH >= 24 ? 'Sí... (te extrañé)'
      : h < 6 ? 'Sí... (¿no deberías dormir?)' : h < 12 ? 'Sí. (buenos días)' : h < 19 ? 'Sí. (buenas tardes)' : 'Sí. (buenas noches)';
  }
  function saludar() {
    if (!saludoPend || modal) return;
    if (e.dormido) { saludoPend = null; return; }
    decir(saludoPend); gesto(ausenciaH >= 24 ? 'besos' : null); hablar(); saludoPend = null; proxAct = tk + 60;
  }

  /* ===================== CORTEX, TRADUCTOR Y VISITAS ===================== */
  // Cortex: mismo estilo que Simon (cabezón, sombreado, contorno), con tu look: pelo negro con mechas rojas, chaleco rojo, alas y la corona de siempre
  const temporada = () => { if (admin && admTemp) return admTemp === 'none' ? null : admTemp; const d = new Date(ahora()), m = d.getMonth() + 1, dd = d.getDate(); return (m === 10 || (m === 11 && dd <= 2)) ? 'hal' : (m === 12 || (m === 1 && dd <= 6)) ? 'nav' : (m === 2 && dd >= 7 && dd <= 14) ? 'val' : null; };
  function cortexGrid(merc, temp, hol, dor) {
    const g = Grid(52, 76), al = Grid(60, 76);
    const BRONCE = ['#f0c088', '#c8884a', '#8a5424', '#4a2a10'], NARANJA = ['#ffc060', '#ff8a20', '#c85a10', '#6a2a08'], ROSA = ['#ffc0e0', '#ff7ab8', '#d04888', '#802858'];
    const NEGRO = ['#4a4458', '#2a2636', '#171420', '#0c0a12'], ROJOP = ['#ff6a78', '#d02838', '#8a1424', '#4a0a14'], OJO = ['#ff7080', '#d02030', '#8a1020', '#4a0810'];
    // alas: negras con borde rojo
    capa(al, '#e03040', L => [-1, 1].forEach(sg => [[28, 8, 11], [29, 24, 11], [27, 40, 9], [22, 54, 7]].forEach(([dx, ty, w]) => {
      const bx = 30 + sg * 12, by = 52, tx = 30 + sg * dx, n = Math.max(Math.abs(tx - bx), Math.abs(ty - by));
      for (let i = 0; i <= n; i++) {
        const t = i / n, x = bx + (tx - bx) * t, y = by + (ty - by) * t, r = (1 - t) * w / 2 + .6;
        for (let yy = -Math.ceil(r); yy <= Math.ceil(r); yy++) for (let xx = -Math.ceil(r); xx <= Math.ceil(r); xx++) if (xx * xx + yy * yy <= r * r) L.set(Math.round(x + xx), Math.round(y + yy), NEGRO[2]);
      }
    })));
    if (merc) {   // comerciante: mochila y manta enrollada
      capa(g, '#2a1408', L => sombrear(L, elipse(26, 47, 23, 9), 26, 47, 23, 9, BRONCE));
      capa(g, '#4a2a10', L => { L.rect(2, 36, 48, 5, '#e0cc98'); [6, 12, 18, 24, 30, 36, 42, 47].forEach(x => L.rect(x, 36, 1, 5, '#a88858')); L.rect(2, 36, 48, 1, '#f4e8c0'); });
    }
    // piernas: pantalón rojo ancho con franjas negras
    [[10, 24], [28, 42]].forEach(([x0, x1]) => capa(g, '#2a0610', L => {
      sombrear(L, (x, y) => y >= 59 && y <= 73 && x >= x0 - (y - 59) * .1 && x <= x1 + (y - 59) * .1, (x0 + x1 + 1) / 2, 66, 8, 9, ROJOP);
      [64, 69].forEach(y => L.rect(x0 - 1, y, x1 - x0 + 3, 1, NEGRO[2]));
    }));
    // tenis blancos con raya roja
    [17.5, 34.5].forEach(cx => { capa(g, '#2a2636', L => sombrear(L, elipse(cx, 73.5, 9, 3), cx, 73.5, 9, 3, R.piel)); g.rect(Math.round(cx) - 6, 73, 12, 1, '#e8353f'); });
    // camisa blanca con un detalle chico
    capa(g, '#aab0c8', L => { L.rect(17, 45, 18, 16, '#f4f6fb'); L.rect(17, 45, 18, 2, '#e4e8f4'); });
    // emblema: un rombo rojo chico en el pecho (o el de temporada)
    if (!merc && temp === 'hal') g.art(21, 50, [".....g.....", ".ooooooooo.", "oookooookoo", "ooooooooooo", "ookokokokoo", ".ooooooooo."], { o: '#ff8a20', k: '#1a1020', g: '#2f9a4a' });
    else if (!merc && temp === 'nav') { g.art(21, 50, [".....y.....", "....ggg....", "...ggrgg...", "..gggggyg..", ".ggygggggg.", ".....b....."], { y: '#ffe45a', g: '#2fb85a', r: '#ff4a5a', b: '#8a5424' }); }
    else if (!merc && temp === 'val') { g.art(21, 50, [".rrr...rrr.", "rrrrrrrrrrr", "rrrrrrrrrrr", ".rrrrrrrrr.", "..rrrrrrr..", ".....r....."], { r: '#ff5a8a' }); g.set(22, 51, '#ffc0d8'); }
    else { g.set(25, 51, '#ff6a78'); g.set(26, 51, '#ff6a78'); [[25, 50], [26, 50], [24, 51], [27, 51], [25, 52], [26, 52]].forEach(([x, y]) => g.set(x, y, '#d02838')); }
    g.rect(17, 58, 18, 1, '#c8ccdc');
    // chaleco rojo acolchado
    const VEST = merc ? BRONCE : temp === 'hal' ? NARANJA : temp === 'val' ? ROSA : ROJOP;
    [[8, 16], [36, 44]].forEach(([a, b]) => capa(g, merc ? '#2a1408' : temp === 'hal' ? '#3a1a04' : temp === 'val' ? '#4a1030' : '#3a0610', L => {
      sombrear(L, (x, y) => x >= a && x <= b && y >= 44 && y <= 62, (a + b + 1) / 2, 53, 5, 12, VEST);
      [49, 54, 59].forEach(y => L.rect(a, y, b - a + 1, 1, VEST[3]));
      if (!merc && temp === 'nav') L.rect(a, 60, b - a + 1, 2, '#ffffff');
    }));
    if (merc) {
      [[12, 14], [38, 40]].forEach(([a]) => { g.rect(a, 44, 3, 15, '#6a3a14'); g.rect(a, 44, 1, 15, '#8a5424'); g.rect(a, 50, 3, 3, '#ffd84a'); g.set(a + 1, 51, '#8a5a10'); });
      capa(g, '#2a1408', L => sombrear(L, elipse(37.5, 62, 4, 3.6), 37.5, 62, 4, 3.6, BRONCE));
      g.rect(36, 57, 3, 2, '#d8a020'); g.set(37, 62, '#ffd84a'); g.set(38, 62, '#ffd84a'); g.set(37, 61, '#fff6b0');
    }
    // mangas blancas con tribales y manos
    [[1, 7], [45, 51]].forEach(([a, b]) => {
      capa(g, '#2a2636', L => {
        L.rect(a, 46, b - a + 1, 16, '#ececf2');
        for (let y = 47; y < 62; y += 2) for (let x = a; x <= b; x++) if ((x + y / 2) % 3 === 0) L.set(x, y, '#16121e');
      });
      capa(g, TINTA, L => L.rect(a + 1, 62, b - a - 1, 3, R.piel[1]));
    });
    // cuello de pelo
    if (merc) { g.rect(19, 45, 14, 3, '#ffd84a'); g.rect(19, 46, 14, 1, '#d8a020'); [20, 24, 28, 32].forEach(x => g.set(x, 48, '#ffd84a')); }
    else if (temp === 'hal') { g.rect(19, 45, 14, 3, '#7a3ac8'); g.rect(19, 46, 14, 1, '#4a1a88'); [20, 24, 28, 32].forEach(x => g.set(x, 48, '#7a3ac8')); }
    else if (temp === 'nav') { g.rect(18, 45, 16, 3, '#ffffff'); g.rect(18, 47, 16, 1, '#d8dcec'); [19, 22, 25, 28, 31].forEach(x => g.set(x, 48, '#ffffff')); }
    else if (temp === 'val') { g.rect(19, 45, 14, 3, '#ff7ab8'); g.rect(19, 46, 14, 1, '#d04888'); }
    else { g.rect(19, 45, 14, 2, '#f0f2fb'); g.rect(19, 46, 14, 1, '#b8c0e8'); g.rect(24, 47, 4, 1, '#b8c0e8'); }
    // cabeza grande y pálida
    capa(g, TINTA, L => sombrear(L, elipse(26, 30, 21, 16), 26, 30, 21, 16, R.piel));
    // pelo negro corto y despeinado, flequillo ladeado que deja ver la frente, con un toque de mechas rojas
    capa(g, '#08060c', L => {
      const dom = elipse(26, 22, 22, 12), sal = [0, 2, 1, 3, 0, 2, 1, 3];
      const borde = x => 19 + Math.max(0, Math.min(4, Math.round((x - 12) / 28 * 4))) + sal[x % 8] * (x > 14 ? .6 : .3);
      sombrear(L, (x, y) => dom(x, y) && (y <= 19 || (x >= 8 && x <= 44 && y <= borde(x))), 26, 20, 22, 12, NEGRO);
      L.rect(6, 20, 3, 6, NEGRO[1]); L.rect(43, 20, 3, 6, NEGRO[1]);
      [[11, 11], [15, 9], [20, 8], [32, 8], [37, 9], [41, 11]].forEach(([x, y]) => L.rect(x, y, 4, 3, NEGRO[1]));
      [[30, 11], [31, 12], [31, 13], [36, 14], [37, 15], [21, 19], [21, 20], [34, 20], [35, 21], [39, 21], [15, 14], [16, 15]]
        .forEach(([x, y]) => { if (L.has(x, y)) { L.set(x, y, '#e03040'); L.set(x, y + 1, '#e03040'); } });
    });
    // ojos grandes y amables, sonrisa abierta y mejillas rosadas
    [17, 35].forEach(cx => {
      if (dor) { g.rect(cx - 4, 33, 2, 1, '#2a1018'); g.rect(cx - 2, 34, 5, 1, '#2a1018'); g.rect(cx + 3, 33, 2, 1, '#2a1018'); g.rect(cx - 4, 35, 1, 1, '#2a1018'); g.rect(cx + 4, 35, 1, 1, '#2a1018'); return; }
      capa(g, null, L => sombrear(L, elipse(cx, 33, 4.4, 4.8), cx, 33, 4.4, 4.8, OJO));
      g.rect(cx - 1, 32, 3, 4, '#1a0a10');
      g.rect(cx - 3, 29, 2, 2, '#ffffff'); g.set(cx + 1, 36, '#ffd0d6');
    });
    for (let y = 40; y <= 43; y++) for (let x = 22 + (y - 40); x <= 30 - (y - 40); x++) g.set(x, y, y === 40 ? TINTA : '#4a1020');
    g.rect(25, 42, 3, 1, '#e0607a'); g.rect(25, 43, 3, 1, TINTA);
    g.rect(10, 38, 5, 3, '#ffa0b6'); g.rect(37, 38, 5, 3, '#ffa0b6');
    // la corona, igual que la de Simon
    const cg = Grid(SW, SH); dibujarCorona(cg);
    for (let y = 0; y < 12; y++) for (let x = 17; x < 39; x++) { const a = (y * SW + x) * 4; if (cg.d[a + 3]) g.set(x - 2, y + 2, [cg.d[a], cg.d[a + 1], cg.d[a + 2], 255]); }
    const out = Grid(60, 76); out.paste(al); out.paste(g, 4, 0);
    if (hol === 'crema') cremar(out); else if (hol) hollinar(out);
    return out;
  }
  // crema: manchones de betún sobre Cortex (bomba pastel)
  function cremar(o) {
    [[18, 26, 4], [38, 22, 5], [30, 13, 3], [24, 40, 4], [44, 35, 3], [30, 52, 5], [14, 47, 3], [48, 49, 4], [10, 31, 3], [34, 30, 3]].forEach(([cx, cy, r]) => {
      for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) {
        if (x < 0 || y < 0 || x >= o.w || y >= o.h) continue; const i = (y * o.w + x) * 4; if (!o.d[i + 3]) continue;
        const d2 = (x - cx) ** 2 + (y - cy) ** 2; if (d2 <= r * r) o.set(x, y, d2 > (r - 1) * (r - 1) ? '#ffc8d8' : '#fff6ea');
      }
      for (let k = 0; k < r + 2; k++) { const i = ((cy + r + k) * o.w + cx) * 4; if (cy + r + k < o.h && o.d[i + 3]) o.set(cx, cy + r + k, '#fff6ea'); }
    });
  }
  // hollín: cara y ropa ennegrecidas (los ojos quedan blancos) y pelo parado
  function hollinar(o) {
    for (let y = 0; y < o.h; y++) for (let x = 0; x < o.w; x++) {
      const i = (y * o.w + x) * 4; if (!o.d[i + 3]) continue;
      const r = o.d[i], gg = o.d[i + 1], b = o.d[i + 2], blanco = r > 235 && gg > 235 && b > 235;
      const cara = ((x - 30) / 22) ** 2 + ((y - 30) / 17) ** 2 <= 1;
      if (cara) { if (blanco) continue; if (r > 140 && gg > 100 && b > 80) { const v = Math.round(40 + (r + gg + b) / 3 * .2); o.d[i] = v; o.d[i + 1] = v - 2; o.d[i + 2] = v + 6; } }
      else { o.d[i] = Math.round(r * .62); o.d[i + 1] = Math.round(gg * .62); o.d[i + 2] = Math.round(b * .66); }
    }
    const pico = (bx, by, dx, len) => { for (let k = 0; k < len; k++) { const cx = bx + dx * k / len, w = k < len * .4 ? 3 : k < len * .75 ? 2 : 1, px = Math.round(cx - w / 2); o.rect(px, by - k, w, 1, '#0c0a12'); o.set(px, by - k, '#3a3446'); } };
    [[12, 17, -4, 10], [17, 12, -3, 11], [8, 22, -5, 8], [43, 12, 3, 11], [48, 17, 4, 10], [52, 22, 5, 8], [21, 9, -1, 6], [39, 9, 1, 6]].forEach(a => pico(...a));
  }
  // (CHARLAS definido en dialogos.js)
  // (TIPS definido en dialogos.js)
  // (TRAD definido en dialogos.js)
  function traducir(c) {
    const n = [];
    if (e.hambre < 30) n.push('¡Quiero keke!');
    if (e.energia < 25) n.push('Tengo sueño...');
    if (e.feliz < 30) n.push('Estoy triste. ¿Jugamos?');
    if (n.length && c !== 'comer' && c !== 'jugar' && c !== 'dice') return n[0];
    const l = TRAD[c] || TRAD.otro; return l[Math.floor(Math.random() * l.length)].replace('{n}', e.nombre || 'amigo');
  }
  // cuadro de diálogo estilo RPG
  function iconoTrad() {
    const g = Grid(12, 13), col = { k: '#232b63', w: '#cfd6ff', g: '#4cd964', d: '#1d7236', r: '#e8353f', y: '#ffd84a', b: '#5b6cf0' };
    ['.........y..', '.........k..', '.kkkkkkkkkk.', 'kwwwwwwwwwwk', 'kwkkkkkkkkwk', 'kwkggggggkwk', 'kwkgdgdgdkwk', 'kwkggggggkwk', 'kwkkkkkkkkwk', 'kwwwwwwwwwwk', 'kwrwwyywwbwk', 'kwwwwwwwwwwk', '.kkkkkkkkkk.']
      .forEach((f, y) => [...f].forEach((ch, x) => { if (col[ch]) g.set(x, y, col[ch]); }));
    return g;
  }
  const estAhora = () => ({ oj: !e.dormido && e.energia < 30 ? 1 : 0, fl: e.hambre < 12 ? 2 : e.hambre < 30 ? 1 : 0, tri: e.feliz < 12 ? 2 : e.feliz < 30 ? 1 : 0, en: e.enf ? 1 : 0, l: 0 });
  function dialogo(lineas, fin) {
    dlg = { l: lineas, i: 0, pos: 0, fin }; $('dlg').classList.add('on'); lineaDlg();
  }
  function lineaDlg() {
    const L = dlg.l[dlg.i]; dlg.pos = 0; dlg.opOn = false; $('dlg-op').style.display = 'none'; $('dlg-f').style.display = ''; if (L.pre) L.pre();
    if (L.t && L.t.includes('{n}')) L.t = L.t.replace(/\{n\}/g, nombreJ());
    if (L.fan) { $('dlg').classList.remove('on'); if (L.fn) L.fn(); fanfare(L.fan, () => { if (!dlg) return; $('dlg').classList.add('on'); sigDlg(); }); return; }
    $('dlg-n').textContent = L.q === 'TU' ? quitaAc(nombreJ()).toUpperCase() : L.q; $('dlg-n').className = L.q; $('dlg-t').textContent = '';
    const pc = $('dlg-p'), px = pc.getContext('2d'); px.imageSmoothingEnabled = false; px.clearRect(0, 0, 76, 80);
    let con = false;
    if (L.q === 'CORTEX') { const kc = cortexClave(); sprite(kc, () => cortexG(), 0); px.drawImage(gridCanvas(recorte(gridCache[kc], 7, 0, 46, 49)), 0, 0, 76, 80); con = true; }
    else if (L.q === 'SIMON') { const es = estAhora(); px.drawImage(gridCanvas(recorte(simonGrid('a', (es.tri && !/^[¡]/.test(L.t)) ? 'n' : 's', e.ropa, es, false, e.ropa.aura ? tk % 40 : 0), 3, 0, 50, 53)), 0, 0, 76, 80); con = true; }
    else if (L.q === 'SIF' || L.q === 'PERRO') { px.drawImage(gridCanvas(sifGrid({ boca: 'b', cola: 0 })), 0, 0, 76, 80); con = true; }
    else if (L.q === 'TRADUCTOR') { px.drawImage(sprite('ic_trad', iconoTrad, 0), 16, 15, 44, 48); con = true; }
    pc.style.background = L.q === 'TRADUCTOR' ? '#1d5a34' : '';
    $('dlg-t').className = L.q === 'TRADUCTOR' ? 'trd' : '';
    $('dlg-box').classList.toggle('conp', con);
    if (L.fn) L.fn();
  }
  function dlgOps(L) {
    if (dlg.opOn) return; dlg.opOn = true; const c = $('dlg-op'); c.innerHTML = ''; c.style.display = 'flex'; $('dlg-f').style.display = 'none';
    L.op.forEach((t, k) => {
      const b = document.createElement('button'); b.className = 'bt ok'; b.textContent = t;
      b.addEventListener('pointerdown', ev => { ev.stopPropagation(); ev.preventDefault(); if (!dlg || !dlg.opOn) return; audio(); sfx.click(); const r = (L.res && L.res[k]) || []; dlg.l.splice(dlg.i + 1, 0, ...r); L.op = null; dlg.opOn = false; c.style.display = 'none'; avanzarDlg(); });
      c.appendChild(b);
    });
  }
  function avanzarDlg() {
    if (!dlg) return;
    const L = dlg.l[dlg.i];
    if (dlg.pos < L.t.length) { dlg.pos = L.t.length; $('dlg-t').textContent = L.t; if (L.op) dlgOps(L); return; }
    if (L.op) { if (!dlg.opOn) dlgOps(L); return; }
    sfx.click();
    sigDlg();
  }
  function sigDlg() { if (++dlg.i >= dlg.l.length) { const f = dlg.fin; dlg = null; $('dlg').classList.remove('on'); if (f) f(); if (celQ.length) celebraCheck(); } else lineaDlg(); }
  const nombreJ = () => e.nombre || 'amigo';
  const quitaAc = t => String(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  var fanOn = false;
  function fanfare(o, cb) {
    if (fanOn) return; fanOn = true;
    const F = $('fanfare'), src = o.c ? o.c() : gridCanvas(o.g()), cv = $('fan-c'); cv.width = src.width; cv.height = src.height; const x = cv.getContext('2d'); x.imageSmoothingEnabled = false; x.clearRect(0, 0, cv.width, cv.height); x.drawImage(src, 0, 0);
    $('fan-t').textContent = ''; $('fan-d').textContent = ''; $('fan-ok').classList.remove('on');
    F.classList.remove('on'); void F.offsetWidth; F.classList.add('on');
    let listo = false; const tm = [];
    if (!o.mudo) tm.push(setTimeout(() => sfx.regalo(), 250));
    tm.push(setTimeout(() => { estrellas(16); }, 1150));
    tm.push(setTimeout(() => { let i = 0; const t = o.t; const iv = setInterval(() => { $('fan-t').textContent = t.slice(0, ++i); if (i >= t.length) { clearInterval(iv); $('fan-d').textContent = o.d || ''; tm.push(setTimeout(() => { listo = true; $('fan-ok').classList.add('on'); }, 600)); } }, 45); tm.push(iv); }, 1700));
    const cierra = ev => { if (ev) { ev.preventDefault(); ev.stopPropagation(); } if (!listo) return; F.removeEventListener('pointerdown', cierra); F.classList.remove('on'); fanOn = false; audio(); sfx.click(); tm.forEach(t => { clearTimeout(t); clearInterval(t); }); if (cb) cb(); };
    F.addEventListener('pointerdown', cierra);
  }
  function pedirNombre(cb, edicion) {
    const N = $('nombre'), I = $('nom-i'), S2 = $('nom-s'); N.classList.add('on'); I.value = edicion ? (e.nombre || '') : ''; S2.textContent = 'HASTA 10 LETRAS'; S2.classList.remove('mal');
    $('nom-t').textContent = edicion ? 'CAMBIA TU NOMBRE' : '¿COMO TE LLAMAS?'; $('nom-x').style.display = edicion ? '' : 'none';
    setTimeout(() => I.focus(), 200);
    const fin = () => { N.classList.remove('on'); $('nom-ok').onclick = null; $('nom-x').onclick = null; I.onkeydown = null; I.blur(); };
    const ok = () => { const v = I.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñÜü0-9 ]/g, '').trim().replace(/\s+/g, ' ');
      if (!v) { sfx.no(); S2.textContent = 'ESCRIBE UN NOMBRE'; S2.classList.add('mal'); return; }
      e.nombre = v.charAt(0).toUpperCase() + v.slice(1); guardar(); audio(); sfx.regalo(); fin(); if (cb) cb(); };
    $('nom-ok').onclick = ok; $('nom-x').onclick = () => { sfx.click(); fin(); if (cb) cb(); }; I.onkeydown = ev => { if (ev.key === 'Enter') ok(); };
  }
  $('dlg').addEventListener('pointerdown', ev => { ev.preventDefault(); audio(); avanzarDlg(); });
// (C definido en dialogos.js)
// (S definido en dialogos.js)
// (T definido en dialogos.js)
  function cortexEntra(cb) {
    cortex.suave = false; cortex.v = 0; cortex.dir = 1;
    cortex.cb = () => {
      if (modal) cerrar();
      const S_ = SF();
      if (S_.f && !S_.cx && !sifP) { S_.cx = 1; guardar(); dialogo([C('Oye, Simon... ¿y ese perrito?'), C('Se parece muchísimo a un mejor amigo que tuve.'), C('Fue quien me salvó de la tristeza cuando más lo necesitaba.'), S(), T('Qué bonito, Cortex.'), C('Cuídalo mucho. Los amigos así no se encuentran todos los días.')], () => { if (cb) cb(); }); return; }
      if (cb) cb();
    };
    sfx.nivel();
  }
  function cortexSale(cb, v) { cortex.v = v || 0; cortex.dir = -1; cortex.cb = cb; }

  /* ===================== HISTORIA: EL INICIO DE SIMON ===================== */
  function calleGrid(W, H, RY) {
    const g = Grid(W, H), HY = RY + 8, WT = HY - 34;
    const SK = ['#4a4a82', '#5a5a92', '#6e68a0', '#8478a8', '#a088b0', '#b898b4'], bh = Math.max(6, (WT + 4) / 6);
    for (let y = 0; y < HY; y++) for (let x = 0; x < W; x++) g.set(x, y, SK[Math.min(5, Math.floor(y / bh))]);
    [[0, 16, 20], [16, 12, 12], [28, 18, 26], [46, 14, 14], [60, 20, 22], [80, 12, 10], [92, 18, 28], [110, 20, 16]].forEach(([x, w, h], i) => {
      g.rect(x, WT - h, w, h + 2, '#3a3868');
      for (let wy = WT - h + 3; wy < WT - 2; wy += 5) for (let wx = x + 2; wx < x + w - 2; wx += 5) g.rect(wx, wy, 2, 3, ((wx * 7 + wy * 3 + i) % 5 < 2) ? '#ffd878' : '#2a2850');
    });
    // muro de ladrillos
    for (let y = WT; y < HY + 2; y++) for (let x = 0; x < W; x++) { const r = ((y - WT) / 4) | 0, mort = (y - WT) % 4 === 0 || (x + (r % 2) * 5) % 10 === 0; g.set(x, y, mort ? '#5a3848' : ((x * 7 + y * 13) % 11 === 0 ? '#8a6070' : '#7a5060')); }
    g.rect(0, WT, W, 2, '#9a7080'); g.rect(0, WT + 2, W, 1, '#b08a98');
    g.rect(78, HY - 28, 20, 15, '#4a3040'); g.rect(80, HY - 26, 16, 11, '#1e1a34'); for (let x = 82; x < 96; x += 4) g.rect(x, HY - 26, 1, 11, '#4a3040'); g.rect(80, HY - 26, 16, 2, '#2a2646');
    g.rect(38, HY - 26, 12, 14, '#e8d8a0'); g.rect(38, HY - 26, 12, 1, '#c8b880'); for (let y = HY - 23; y < HY - 14; y += 3) g.rect(40, y, 8, 1, '#8a7a5a');
    g.rect(104, WT + 2, 5, HY - WT, '#5a5a74'); g.rect(104, WT + 2, 1, HY - WT, '#7a7a98'); g.rect(103, HY - 12, 7, 2, '#4a4a64');
    g.rect(0, HY, W, 2, '#4a3040');
    // acera
    for (let y = HY + 2; y < H; y++) for (let x = 0; x < W; x++) {
      const dy = y - HY - 2; let c = dy < 3 ? '#b0aec8' : dy < 4 ? '#9a98b4' : '#8e8caa';
      if (dy >= 4 && ((dy - 4) % 16 === 0 || (x + ((((dy - 4) / 16) | 0) % 2) * 20) % 40 === 0)) c = '#7a7898';
      if (dy >= 4 && (x * 5 + y * 11) % 23 === 0) c = '#9c9ab8';
      g.set(x, y, c);
    }
    [[30, 34, 11, 2], [92, 60, 14, 2]].forEach(([cx, dy, rx, ry]) => { for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) if ((x / rx) ** 2 + (y / ry) ** 2 <= 1) g.set(cx + x, HY + dy + y, y === -ry + 0 && x % 3 === 0 ? '#d0e4ff' : '#a8c4e8'); });
    // farol
    g.rect(16, HY - 50, 2, 54, '#26263c'); g.rect(12, HY - 54, 10, 5, '#26263c'); g.rect(13, HY - 49, 8, 2, '#ffe9a0'); g.rect(12, HY - 56, 10, 2, '#3a3a58'); g.rect(14, HY + 2, 6, 3, '#26263c');
    return g;
  }
  function boteGrid() {
    const g = Grid(22, 30), AC = ['#d0d8e8', '#8a94ac', '#5a6480', '#363e58'];
    capa(g, '#14141f', L => sombrear(L, (x, y) => y >= 5 && y <= 29 && Math.abs(x + .5 - 11) <= 9.6 - (y - 5) * .06, 11, 18, 10, 14, AC));
    for (let y = 8; y <= 28; y++) [5, 11, 17].forEach(x => g.set(x, y, '#363e58'));
    capa(g, '#14141f', L => { L.rect(1, 2, 20, 4, AC[1]); L.rect(1, 2, 20, 1, AC[0]); L.rect(1, 5, 20, 1, AC[3]); L.rect(8, 0, 6, 2, AC[2]); L.rect(8, 0, 6, 1, AC[0]); });
    g.rect(3, 1, 4, 1, '#e8e8d0'); g.rect(15, 1, 3, 1, '#ffd84a'); g.set(16, 0, '#ffd84a'); g.rect(18, 2, 2, 1, '#d04a4a');
    return g;
  }
  function bolsasGrid() {
    const g = Grid(30, 22), N = ['#6a6a88', '#3a3a52', '#22222f', '#12121c'], V = ['#6aaa7a', '#2f6a42', '#1f4a2e', '#10281a'];
    capa(g, '#0a0a12', L => sombrear(L, elipse(9, 15, 9, 6.6), 9, 15, 9, 6.6, N));
    capa(g, '#06140c', L => sombrear(L, elipse(21, 16, 8, 5.8), 21, 16, 8, 5.8, V));
    capa(g, '#0a0a12', L => sombrear(L, elipse(14, 8, 6.4, 5.2), 14, 8, 6.4, 5.2, N));
    [[8, 8], [20, 10], [14, 2]].forEach(([x, y]) => { g.rect(x, y, 3, 2, '#12121c'); g.set(x + 1, y - 1, '#12121c'); });
    g.rect(2, 18, 4, 3, '#e8e8d0'); g.set(2, 18, '#fff'); g.rect(25, 19, 3, 2, '#d04a4a'); g.rect(11, 20, 5, 1, '#ffd84a');
    return g;
  }
  function calleFondo() {
    ctx.drawImage(sprite('calle' + LW + 'x' + LH, () => calleGrid(LW, LH, RY), 0), 0, 0);
    const ly = RY + 8 - 49, fl = ((tk >> 3) % 17 === 0) ? .5 : 1;
    for (let k = 0; k < 3; k++) { const r = 16 + k * 9; ctx.fillStyle = 'rgba(255,224,140,' + (.07 * fl).toFixed(3) + ')'; for (let y = -r; y <= r; y++) { const w = Math.round(Math.sqrt(r * r - y * y)); ctx.fillRect(17 - w, ly + y, w * 2, 1); } }
    const bs = sprite('calle_bote', boteGrid, 0), bo = sprite('calle_bolsas', bolsasGrid, 0), base = SY + SH - 3;
    ctx.fillStyle = 'rgba(30,12,40,.34)';
    [[SX + 73, 11], [SX - 15, 13]].forEach(([cx, w]) => { for (let y = -2; y <= 2; y++) { const ww = Math.round(w * Math.sqrt(1 - (y / 2.8) ** 2)); ctx.fillRect(cx - ww, base + y, ww * 2, 1); } });
    ctx.drawImage(bo, SX - 30, base - bo.height + 1); ctx.drawImage(bs, SX + 62, base - bs.height + 1);
  }
  function calleLluvia() {
    ctx.fillStyle = 'rgba(200,214,255,.6)';
    for (let i = 0; i < 40; i++) { const x = (i * 37 + tk * 2) % (LW + 12) - 6, y = (i * 53 + tk * 6) % (LH + 8) - 4; ctx.fillRect(x, y, 1, 3); if (i % 3 === 0) ctx.fillRect(x + 1, y + 3, 1, 1); }
  }
  // ---------- guía interactiva del comienzo ----------
  var guia = null;
  // (GUIA definido en dialogos.js)
  function guiaBloq(tipo) {   // durante el tutorial guiado (comer/jugar/dormir) solo deja usar el botón del paso indicado
    if (!guia || !guia.paso) return false;
    const p = guia.paso;
    if ((p === 'comer' || p === 'bebida') && tipo === 'comida') return false;
    if (p === 'jugar' && tipo === 'jugar') return false;
    if (p === 'cansado' && tipo === 'dormir') return false;
    toast('PRIMERO: ' + GUIA[p][1]);
    sfx.no();
    return true;
  }
  if (typeof window !== 'undefined') window.guiaBloq = guiaBloq;

  function tutMenuBloq(tipo) {
    if (dlg) return true;
    if ((calle && !e.intro) || !e.nombre) { sfx.no(); return true; }
    return false;
  }
  if (typeof window !== 'undefined') window.tutMenuBloq = tutMenuBloq;

  function menuAbrir(tipo, fnAbrir) {
    if (dlg) return;
    if (tutMenuBloq(tipo)) return;
    if (guiaBloq(tipo)) return;
    if (modal) {
      if (modal === 'editar' || ['run', 'mem', 'rt'].includes(modal)) return;
      if (modal === tipo) { cerrar(); return; }
      cerrar();
    }
    sfx.click();
    if (fnAbrir) fnAbrir();
    else abrir(tipo);
  }
  function guiaPintar() {
    const b = $('guia');
    if (!guia || !guia.paso) { b.classList.remove('on'); tutRes(null); return; }
    const t = GUIA[guia.paso]; b.innerHTML = '<i>' + t[0] + '</i><b>' + t[1] + '</b><small>' + t[2] + '</small>';
    b.classList.add('on'); b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
  }
  function guiaIr(p) {
    e.hist = { comer: 2, jugar: 3, cansado: 4, bebida: 5 }[p]; guardar();
    guia = { paso: p, t0: Date.now(), base: p === 'comer' ? e.st.comer : p === 'jugar' ? e.st.jugar : 0, cx: false };
    if (p === 'jugar' && e.energia < 8) e.energia = 12;
    sfx.click(); guiaPintar(); guiaMarca();
    if (p === 'cansado') decir('Sí...', null, 3500);
  }
  function guiaMarca() {
    if (!guia) { tutRes(null); return; }
    if (guia.paso === 'cansado') { if (!guia.cx) tutRes('#btn-dormir'); else tutRes(null); return; }
    const p = guia.paso, sel = p === 'jugar' ? '#btn-jugar' : (modal === 'comida' ? '[data-a="f_dar"][data-k="' + (p === 'bebida' ? 'bebida' : 'keke') + '"]' : '#btn-comer');
    const el = document.querySelector(sel); if (el && el.classList.contains('resalta') && document.querySelectorAll('.resalta').length === 1) return;
    tutRes(sel);
  }
  function guiaTick() {
    if (!guia) return;
    $('guia').style.visibility = dlg || (modal && modal !== 'comida') ? 'hidden' : 'visible';
    guiaMarca();
    if (dlg || cortex.p || cortex.dir) return;
    const p = guia.paso;
    if (p === 'comer') { const sm = $('guia').querySelector('small'); if (sm) sm.textContent = 'DALE KEKES HASTA LLENAR SU BARRA: ' + Math.round(e.hambre) + '%'; if (e.st.comer > guia.base && e.hambre >= 92) { if (modal) cerrar(); guiaIr('jugar'); } }
    else if (p === 'jugar') { if (e.energia < 5) e.energia = 12; if (e.st.jugar > guia.base) { if (modal) cerrar(); guiaIr('cansado'); } }
    else if (p === 'cansado' && Date.now() - guia.t0 > 4500 && !modal && !act && !guia.cx) { guia.cx = true; histBebida(); }
    else if (p === 'bebida' && (e.comida.bebida || 0) < 3) { if (modal) cerrar(); guia = null; guiaPintar(); histFinal(); }
  }
  function cortexCamina(cb, v) { cortex.suave = true; cortex.v = v || .06; cortex.dir = 1; cortex.cb = () => { cortex.v = 0; if (cb) cb(); }; }
// (SS definido en dialogos.js)
  function histCalle() {
    calle = true; sinCorona = true; document.body.classList.add('calle'); lluviaCheck(); e.hab = 'sala'; lugar = null;
    e.hambre = 0; e.energia = 0; e.feliz = 0; e.limp = 0; e.t = Date.now(); pintarNav(); pintar(); dibujar();
    setTimeout(() => { decir('Sí...', null, 3600); }, 1800);
    setTimeout(() => cortexCamina(() => dialogo([
      C('¿Hay alguien junto a ese bote de basura?'),
      C('¡Oye! ¿Estás bien? Te ves flaquito y con sueño.'),
      SS(),
      C('Solo dices "sí"... pero se nota que estás triste.'),
      C('No puedo dejarte aquí. Yo te saco de esta calle.'),
      C('Ven conmigo y seremos mejores amigos. ¿Qué dices?'),
      { q: 'SIMON', t: '¡Sí!', fn: () => { e.feliz = Math.max(e.feliz, 30); bocaT = 15; gesto('salto'); corazones(4); sfx.regalo(); pintar(); } },
      C('Jaja, otra vez "sí". En mi tierra, "Simon" significa "sí".'),
      C('Ese será tu nombre: Simon. ¡Trato hecho!')
    ], histLlegada), .035), 5400);
  }
  function histLlegada() {
    const f = $('fundido'); f.classList.add('on'); cortex.dir = 0;
    setTimeout(() => { calle = false; cortex.suave = false; cortex.p = 0; document.body.classList.remove('calle'); e.hist = 1; guardar(); pintarNav(); dibujar(); lluviaCheck(); f.classList.remove('on'); setTimeout(histCasa, 800); }, 500);
  }
  function introMueble(k) {   // primera compra de un mueble: solo muestra la flecha al botón de editar casa
    tutRes('#b-editar');
  }
  function introEstudio() {
    if (escenaId() !== 'estudio') { e.estVisto = 0; introPend = 0; evQuitar('introE'); return; }
    if (modal) cerrar();
    if (!eventoLibre(EV_INTE)) { evAgregar('introE', 25, () => escenaId() === 'estudio' && eventoLibre(EV_INTE), introEstudio); return; }
    introPend = Date.now() + 600000;
    let tienda = false;
    cortexCamina(() => dialogo([
      C('Este es el ESTUDIO. Aquí Simon te acompaña mientras estudias.'),
      C('Toca el escritorio para empezar una sesión.'),
      { q: 'CORTEX', t: 'Y puedes personalizarlo con muebles de la tienda.', op: ['Ver la tienda', 'Más tarde'],
        res: [[{ q: 'TU', t: 'Ver la tienda', fn: () => { tienda = true; } }], [{ q: 'TU', t: 'Más tarde' }]] }
    ], () => cortexSale(() => { introPend = 0; if (tienda) { tab = 'cuarto'; fHab = 'estudio'; tv = 'cat'; tvPre = true; abrir('tienda'); } })), .07);
  }
  function histCasa() {
    cortexCamina(() => dialogo([
      C('Bienvenido a tu nueva casa, Simon.'),
      SS(),
      { q: 'SIMON', t: '¡Sí!', fn: () => { bocaT = 15; hablar(); } },
      { q: 'CORTEX', t: 'Toma una corona: símbolo de nuestra amistad.', fn: () => { sinCorona = false; sfx.regalo(); estrellas(12); corazones(5); gesto('salto'); pintar(); } },
      { q: 'SIMON', t: '¡Sí!', fn: () => { bocaT = 15; hablar(); } },
      C('La casa no está terminada. Al subir de nivel, abriré zonas nuevas.'),
      C('Yo no puedo cuidarlo todo el día. Él necesita a alguien como tú.'),
      C('Dime, ¿cómo te llamas?')
    ], () => pedirNombre(() => dialogo([
      C('Mucho gusto, {n}.'),
      S(),
      { q: 'CORTEX', t: '¿Puedes encargarte de Simon, {n}?', op: ['¡Claro!', 'Mmm... ¿yo?'],
        res: [[{ q: 'TU', t: '¡Claro!' }, C('¡Sabía que dirías eso!')],
              [{ q: 'TU', t: 'Mmm... ¿yo?' }, C('Sí, tú. Yo te ayudo.')]] },
      C('Míralo: hambriento, cansado y triste. Atiéndelo, ¡ya vuelvo!')
    ], () => cortexSale(() => guiaIr('comer'))))), .06);
  }
  function histBebida() {
    cortexCamina(() => dialogo([
      C('Uy, Simon está agotado. Dormir para recuperar energía toma su tiempo...'),
      C('Para que no tengas que esperar tanto ahorita, te dejo esto.'),
      { q: 'CORTEX', t: '', fan: { g: () => FGRID.bebida(), t: '¡3 BEBIDAS ENERGETICAS!', d: 'Le devuelven toda la energia.' }, fn: () => { e.comida.bebida = 3; guardar(); } },
      C('Le devuelve la energía al instante, pero no siempre vas a tener bebidas a la mano.'),
      C('Lo normal es dejarlo dormir para que recupere energía. Dale una ahora.')
    ], () => cortexSale(() => guiaIr('bebida'))), .07);
  }
  function histFinal() {
    e.hist = 6; guardar();
    cortexCamina(() => dialogo([
      C('¡Mira, como nuevo!'),
      { q: 'SIMON', t: '¡Sí!', fn: () => { bocaT = 15; gesto('salto'); hablar(); corazones(3); } },
      C('Yo entiendo a Simon sin traductor. Nos conectamos desde el primer momento.'),
      C('Pero los demás no pueden. Por eso construí esto para ti, {n}.'),
      { q: 'CORTEX', t: '', fan: { c: () => sprite('ic_trad', iconoTrad, 0), t: '¡CONSEGUISTE EL TRADUCTOR!', d: 'Ahora entenderas lo que dice Simon.' }, fn: () => { e.traductor = true; guardar(); } },
      C('Pruébalo. Simon, ¿qué piensas de {n}?'),
      S(), T('Te quiero mucho, {n}.'),
      { q: 'SIMON', t: '¡Quiero keke!', fn: () => { bocaT = 15; gesto('salto'); hablar(); } },
      C('Jaja. El keke es su comida favorita.'),
      CT('Aquí ves su hambre, energía, felicidad y limpieza.', '.stats'),
      CT('Este círculo es su cariño. Al llenarlo, subes de nivel.', '.med'),
      CT('Vendré a visitarlos. Y una vez al día, como comerciante.'),
      C('Cuídalo mucho. ¡Y que no pierda la corona!')
    ], () => { tutRes(null); cortexSale(histListo); }), .07);
  }
  function histListo() {
    e.intro = true; e.hist = 7; e.tutUI = 1; introActiva = false; guia = null; guiaPintar();
    e.proxVisita = ahora() + 45 * 60000; e.cajaT = e.caja ? 0 : ahora() + 120000; e.proxSiesta = Math.max(e.proxSiesta || 0, ahora() + 2 * 3600000);
    proxAct = tk + 100; guardar(); pintar();
    setTimeout(() => { if (infoRegalo()) abrir('regalo'); }, 600);
  }
  function iniciarIntro() {
    introActiva = true; act = null; proxAct = tk + 99999;
    const h = e.hist || 0;
    if (h <= 0) { histCalle(); return; }
    calle = false; sinCorona = h <= 1;
    setTimeout(() => { if (h === 1) histCasa(); else if (h === 2) guiaIr('comer'); else if (h === 3) guiaIr('jugar'); else if (h === 4) guiaIr('cansado'); else if (h === 5) guiaIr('bebida'); else histFinal(); }, 900);
  }
  function escenaVisita() {
    const sc = [];
    if (ausenciaH >= 24) return { l: [C('¡Por fin volviste! Simon preguntaba por ti todo el día.'), S(), T('Te extrañé mucho.'),
      { q: 'CORTEX', t: 'Toma, una compensación por la espera: 30 monedas.', fn: () => ganar(30, 3, true) }] };
    const rx = reaccionCortex(); if (rx) return rx;
    const peso = ['saludo', 'charla', 'charla', 'regalo', 'consejo'];
    const k = peso[Math.floor(Math.random() * peso.length)];
    if (k === 'regalo') return { l: [{ q: 'CORTEX', t: 'Te traje algo que encontré en mis viajes.', fn: () => ganar(18 + Math.floor(Math.random() * 20), 3, true) }, S(), T('Gracias, Cortex.'), C('De nada.')] };
    if (k === 'consejo') { let i; do { i = Math.floor(Math.random() * TIPS.length); } while (i === e.ultTip && TIPS.length > 1); e.ultTip = i; return { l: [C('Un consejo de amigo:'), C(TIPS[i]), S(), T('Eso ya lo sabía.')] }; }
    if (k === 'charla') return { l: [C(saludoHora()), S(), C(CHARLAS[Math.floor(Math.random() * CHARLAS.length)])] };
    return { l: [C(saludoHora()), C('¿Cómo está Simon?'), S(), { q: 'TRADUCTOR', t: '«' + traducir('visita') + '»', fn: () => {} }, C('Cuídalo mucho.')] };
  }
  const elige = a => a[Math.floor(Math.random() * a.length)];
  function saludoHora() {
    const h = new Date(ahora()).getHours();
    if (h < 5) return elige(['¿Qué hacen despiertos a esta hora? Yo tampoco podía dormir.', 'Es de madrugada... y aquí estamos, los noctámbulos.']);
    if (h < 12) return elige(['¡Buenos días! Traigo energía y buen humor.', '¡Buen día! ¿Ya desayunó Simon?', 'Buenos días... ¿hay keke para el desayuno?']);
    if (h < 19) return elige(['¡Buenas tardes! Pasaba por aquí.', '¡Hola! Qué buena hora para visitar.', 'Buenas tardes. ¿Hay keke para la merienda?']);
    return elige(['¡Buenas noches! Vengo rapidito.', 'Ya casi es hora de dormir, ¿verdad, Simon?', 'La noche está linda. Perfecta para visitar.']);
  }
  // (ROPA_CORTEX definido en dialogos.js)
  function reaccionCortex() {
    if (e.enf) return { l: [C('¡Achú! Simon, ¿estás resfriado?'), S(), T('Tengo frío y la nariz tapada.'), { q: 'CORTEX', t: 'Toma, jarabe de mi abuela.', fn: () => curar('jarabe') }, C('Abrígalo más, ¿sí?')] };
    if (e.feliz < 15) return { l: [C('¡Simon! ¿Estás llorando?'), S(), T('Necesito un abrazo.'), { q: 'CORTEX', t: '*lo abraza fuerte*', fn: () => { e.feliz = clamp(e.feliz + 30); corazones(5); gesto('besos'); sfx.regalo(); } }, C('Ya, ya. Aquí estoy.')] };
    if (e.hambre < 30) return { l: [C('Se oye su estómago desde la puerta...'), S(), T('¡Quiero keke!'), { q: 'CORTEX', t: 'Traje keke de emergencia.', fn: () => { e.hambre = clamp(e.hambre + 35); gesto('salto'); sfx.regalo(); } }, C('¡Aliméntalo mejor, ¿sí?')] };
    if (e.energia < 25) return { l: [C('Simon, esas ojeras llegan al suelo.'), S(), T('Tengo muchísimo sueño.'), C('Déjalo dormir en su recámara.')] };
    const w = Object.values(e.ropa).filter(k => k && ROPA_CORTEX[k]);
    if (w.length && Math.random() < .45) return { l: [C(ROPA_CORTEX[elige(w)]), S(), T('Gracias. Me siento muy guapo.')] };
    if (e.st.bombas > 0 && ahora() - e.ultBombaT < 48 * 3600000 && Math.random() < .35) return { l: [C(elige(['Todavía me huele la ropa a pólvora...', 'Aún tengo hollín en las orejas de la última vez.', 'Cada vez que entro, reviso el techo por si cae una bomba.'])), S(), T(elige(['Eso fue hace poquito.', 'Qué buenos tiempos.', '¿Quieres que lo repita?'])), C('No. No quiero. ...Bueno, no hoy.')] };
    return null;
  }
  function iniciarVisita() {
    const esc = escenaVisita(); act = null; visPend = false; admVisita = false;
    esc.l.push(C('Me siento a descansar un ratito, ¿sí?'));
    cortexEntra(() => dialogo(esc.l, () => {
      e.proxSiesta = Math.max(e.proxSiesta || 0, ahora() + 2 * 3600000); e.st.visitas++; e.proxVisita = ahora() + (8 + Math.random() * 6) * 3600000; ausenciaH = 0; pintar(); guardar();
      descansoIniciar();
    }));
  }
  let admVisita = false;
  function visitaAdm() {
    if (desc || mercPres || cortex.p || cortex.dir) { toast('CORTEX YA ESTÁ AQUÍ'); return; }
    if (dlg) { admVisita = true; e.proxVisita = 0; toast('CORTEX LLEGA AL TERMINAR EL DIÁLOGO'); return; }
    if (escenaId() === 'sala' && !lugar && !cambiando) { notificar('Cortex vino de visita.'); iniciarVisita(); }
    else { admVisita = true; visPend = true; notificar('Cortex vino de visita. Te espera en la recámara.'); }
  }
  function checkVisita() {
    if (!eventoLibre(EV_VIS) || ahora() < e.proxVisita) return;
    if (!(escenaId() === 'sala' && !lugar)) { if (!visPend) { visPend = true; notificar('Cortex vino de visita. Te espera en la recámara.'); } return; }
    notificar('Cortex vino de visita.'); iniciarVisita();
  }

  /* ===================== DESCANSO DE CORTEX Y BOMBA ===================== */
  // (BOMBA_PRECIO, BOMBA_DESC, BOMBA_MAX, VUELO definidos en config.js)
  // (FRASES_BOMBA definido en dialogos.js)
  // (TRAD_BOMBA definido en dialogos.js)
  // (HITOS_BOMBA definido en dialogos.js)
  // (FR_TIPO definido en dialogos.js)
  // (TR_TIPO definido en dialogos.js)
  /* ===================== EVENTOS SECRETOS: luna dorada, estrella fugaz, peluche ===================== */
  let ov = null, fz = null, lunaFlash = 0, pelT = 0, pelN = 0, pelHop = 0, admFz = false, admHora = null, admLuna = false;
  const horaR = () => admHora != null ? admHora : new Date(ahora()).getHours();
  const esNoche = () => { const h = horaR(); return h >= 19 || h < 6; };      // ciclo día/noche con la hora real
  function lunaVentana() {   // la luna dorada sale los domingos de 00:00 a 03:00, desde un minuto al azar (fijo para ese domingo) hasta las 3am
    if (admLuna) return true;
    const d = new Date(ahora()); if (d.getDay() !== 0 || d.getDate() === 15) return false;   // el día 15 es siempre de la luna azul
    const min = d.getHours() * 60 + d.getMinutes(); if (min >= 180) return false;
    const k = 'luna|' + hoy(); let h = 7; for (let i = 0; i < k.length; i++) h = Math.imul(h ^ k.charCodeAt(i), 2654435761) >>> 0;
    return min >= h % 180;
  }
  const ventNoche = () => escenaId() === 'sala' && (!!ov || (esNoche() && clima() === 'sol'));   // la ventana muestra la luna
  const lunaOroT = () => lunaVentana();   // la luna dorada es visible (solo se puede tocar en la recámara)
  const lunaDorada = () => escenaId() === 'sala' && (!!ov || lunaOroT());   // visible siempre; solo es tocable si Simon aún no tiene el casco
  const ovBase = () => RY - 59 + 49;                  // suelo de la colina, visto desde la ventana
  function lunaOroGrid(v) {
    const g = Grid(60, 64), luna = elipse(36, 26, 5.5, 5.5), hueco = elipse(38.5, 24, 5, 5), halo = elipse(36, 26, 9, 9);
    for (let y = 14; y < 40; y++) for (let x = 24; x < 46; x++) {
      if (luna(x, y) && !hueco(x, y)) g.set(x, y, BAY[y & 3][x & 3] > 9 ? '#ffe066' : '#ffc02a');
      else if (v && halo(x, y) && !hueco(x, y) && (x + y) % 2 === 0) g.set(x, y, '#ffd84a');
    }
    return g;
  }
  function cohGrid() {
    const g = Grid(12, 15);
    g.art(0, 0, ['....rr......', '...rrrr.....', '..wwwwww....', '..wwbbww....', '..wbbbbw....', '..wwbbww....', '..wwwwww....', '..wwwwww....', '.rwwwwwwr...', 'rrwwwwwwrr..', 'rr.gggg.rr..', '...gggg.....'].map(r => r.slice(0, 10)), { r: '#e8353f', w: '#f4f6ff', b: '#5ab4ff', g: '#8a94b4' });
    g.rect(2, 2, 1, 6, '#c8d0e8'); g.rect(7, 2, 1, 6, '#aab4d0');
    return g;
  }
  function alienGrid(arriba) {
    const g = Grid(18, 34);
    capa(g, '#14301c', L => {
      sombrear(L, elipse(9, 12, 6.5, 7.5), 9, 10, 6.5, 7.5, ['#b8f8c0', '#6ae878', '#3ab850', '#1e8036']);
      linea(L, 6, 5, 4, 1, '#3ab850'); linea(L, 12, 5, 14, 1, '#3ab850');
    });
    g.rect(3, 0, 2, 2, '#ffe45a'); g.rect(13, 0, 2, 2, '#ffe45a');
    g.rect(5, 10, 3, 5, '#0e1a12'); g.rect(11, 10, 3, 5, '#0e1a12'); g.set(6, 11, '#ffffff'); g.set(12, 11, '#ffffff'); g.rect(8, 17, 2, 1, '#14301c');
    capa(g, '#2a2e48', L => {
      L.rect(5, 20, 8, 8, '#e8ecff'); L.rect(5, 20, 3, 8, '#c8d0f0'); L.rect(5, 25, 8, 1, '#ff5a5a');
      L.rect(6, 28, 3, 4, '#8a94b4'); L.rect(10, 28, 3, 4, '#8a94b4');
      if (arriba) { L.rect(2, 12, 2, 9, '#e8ecff'); L.rect(14, 12, 2, 9, '#e8ecff'); }
      else { L.rect(3, 21, 2, 6, '#e8ecff'); L.rect(13, 21, 2, 6, '#e8ecff'); }
    });
    if (arriba) { g.rect(2, 9, 2, 3, '#5ae06a'); g.rect(14, 9, 2, 3, '#5ae06a'); } else { g.rect(3, 27, 2, 2, '#5ae06a'); g.rect(13, 27, 2, 2, '#5ae06a'); }
    g.rect(5, 32, 4, 2, '#3a4062'); g.rect(10, 32, 4, 2, '#3a4062');
    return g;
  }
  function cascoAlGrid() {
    const g = Grid(20, 18), cx = 10, cy = 9, rx = 9.5, ry = 8.5;
    for (let y = 0; y < 18; y++) for (let x = 0; x < 20; x++) { const d = ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2; if (d <= 1 && d >= .78 && y < 15) g.set(x, y, y < 8 ? '#f4fcff' : '#bfe6ff'); }
    g.rect(2, 4, 3, 1, '#ffffff'); g.rect(2, 5, 1, 2, '#ffffff'); g.rect(1, 14, 18, 3, '#8a94b4'); g.rect(1, 14, 18, 1, '#e4ecff'); g.rect(1, 16, 18, 1, '#4a5478');
    return g;
  }
  function ovStart() {
    if (ov) return;
    lugar = null; llegada = null; if (e.hab !== 'sala') { e.hab = 'sala'; pintarNav(); }
    ov = { f: 'luz', t: 0 }; e.ovniPend = 1; guardar();
  }
  let lunaInactT = 0;
  function lunaTap() {
    lunaInactT = 0;
    e.lunaT = (e.lunaT || 0) + 1; lunaFlash = 8; const dy0 = RY - 59;
    seq([1175, 1568, 2093].slice(0, 1 + (e.lunaT % 3)), .07, 'triangle', .07);
    for (let i = 0; i < 5; i++) lanzar('estrella', OX + 31 + Math.random() * 12, dy0 + 20 + Math.random() * 12, (Math.random() - .5) * 1.2, -.4, 8 + i);
    if (e.lunaT >= 3) ovStart(); else guardar();
  }
  const fzPos = () => { const u = fz.t / fz.len; return { x: OX + 43 + (16 - 43) * u, y: RY - 59 + 19 + (38 - 19) * u }; };
  function fzAtrapa() {
    const q = fzPos(); fz = null; const h = hoy(); e.fugazD = e.fugazD || [];
    for (let i = 0; i < 8; i++) lanzar('estrella', q.x - 3 + Math.random() * 6, q.y - 3 + Math.random() * 6, (Math.random() - .5) * 2, (Math.random() - .5) * 2, 8 + i);
    seq([1568, 2093, 2637], .06, 'triangle', .07);
    if (e.fugazD.includes(h)) { toast('Otra estrella... ya pediste tu deseo de esta noche'); return; }
    e.fugazD.push(h);
    if (e.fugazD.length >= 3 && !e.tiene.platillo_mini) {
      e.tiene.platillo_mini = 1; colocar('platillo_mini'); guardar();
      setTimeout(() => fanfare({ g: () => platilloGrid(), t: 'MINI PLATILLO VOLADOR', d: '¡CAYÓ DEL CIELO TRAS TRES DESEOS!' }), 500);
    } else { toast('¡Una estrella fugaz! Pides un deseo...'); guardar(); }
  }
  function sonidoAlien() {   // trino de ovni: tono con vibrato muy rápido que sube y baja, más un bip
    if (e.mudo || !audio()) return;
    const t = ac.currentTime + .02, o = ac.createOscillator(), g = ac.createGain(), l = ac.createOscillator(), lg = ac.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(500, t); o.frequency.exponentialRampToValueAtTime(1500, t + .35); o.frequency.exponentialRampToValueAtTime(380, t + .8);
    l.frequency.value = 22; lg.gain.value = 90; l.connect(lg); lg.connect(o.frequency);
    g.gain.setValueAtTime(.001, t); g.gain.linearRampToValueAtTime(.09, t + .08); g.gain.linearRampToValueAtTime(.001, t + .85);
    o.connect(g); g.connect(ac.destination); o.start(t); l.start(t); o.stop(t + .9); l.stop(t + .9);
    seq([1320, 990, 1480], .09, 'square', .03, .9);
  }
  function chirrido(a, b, dur, vol) {   // chillido de juguete: sube rápido y baja
    if (e.mudo || !audio()) return;
    const t = ac.currentTime + .01, o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine';
    o.frequency.setValueAtTime(a, t); o.frequency.exponentialRampToValueAtTime(b, t + dur * .55); o.frequency.exponentialRampToValueAtTime(a * 1.15, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.linearRampToValueAtTime(.001, t + dur); o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur + .02);
  }
  function pelucheTap() {
    const ahoraT = Date.now(); pelN = ahoraT - pelT < 1600 ? pelN + 1 : 1; pelT = ahoraT;
    pelHop = 10; chirrido(520 + pelN * 45, 1500 + pelN * 70, .14, .09); setTimeout(() => chirrido(900 + pelN * 40, 620 + pelN * 30, .09, .06), 110);
    if (pelN % 3 === 0) lanzar('corazon', SX + 20, SY + 10, 0, -2, 10);
    if (pelN >= 10) {
      pelN = 0;
      if (!e.tiene.marco_cortex_bebe) { e.tiene.marco_cortex_bebe = 1; guardar(); estrellas(8); setTimeout(() => fanfare({ g: () => ITEMS.marco_cortex_bebe.grid(), t: 'RETRATO DE CORTEX BEBÉ', d: '¡EL PELUCHE GUARDABA UN SECRETO!' }), 600); }
    }
  }
  function chefPremio() {
    if (e.tiene.gorro_chef) return; cerrar(); e.tiene.gorro_chef = 1; guardar();
    fanfare({ g: () => prevGrid('gorro_chef'), t: 'GORRO DE CHEF KEKE', d: '¡1000 KEKES! PÓNSELO EN VESTIR A SIMON' }, () => decir('Sí.', e.traductor ? '¡Mil kekes! ¡Ya soy chef de verdad!' : null, 4000));
  }
  function ovTick() {
    if (!ov && !fz && ventNoche() && !e.tiene.platillo_mini && tk % 15 === 0 && Math.random() < (admFz ? .45 : .09)) fz = { t: 0, len: 16 };
    if (fz && ++fz.t > fz.len) fz = null;
    if (lunaFlash > 0) lunaFlash--;
    if (pelHop > 0) pelHop--;
    if (!ov) {
      if (e.lunaT > 0 && e.lunaT < 3) {
        if (++lunaInactT > 300) { e.lunaT = 0; lunaInactT = 0; guardar(); }
      }
      return;
    }
    if (ov.f === 'espera') {
      ov.t++;
      if (ov.t >= 600) {
        ov.f = 'seVa'; ov.t = 0; e.lunaT = 0; e.ovniPend = 0; guardar();
        toast('El cohete esperó demasiado y despegó...');
      }
      return;
    }
    if (ov.f === 'seVa') {
      ov.t++;
      if (ov.t === 1) seq([262, 330, 392, 523, 660, 880, 1175, 1568], .07, 'sawtooth', .04);
      if (ov.t >= 48) { ov = null; proxAct = tk + 60; guardar(); pintar(); }
      return;
    }
    if (ov.f === 'habla' || ov.f === 'premio') return;
    if (escenaId() !== 'sala') return;                       // si se va de la sala, el evento espera
    ov.t++;
    if (ov.f === 'luz') {
      if (ov.t === 1) { if (e.dormido) { e.dormido = false; sfx.despertar(); } act = null; proxAct = tk + 99999; }
      if (ov.t >= 24) { ov.f = 'baja'; ov.t = 0; seq([1047, 880, 740, 622, 523, 440, 370, 311], .1, 'sawtooth', .035); }
    } else if (ov.f === 'baja') {
      if (ov.t >= 55) { ov.f = 'espera'; ov.t = 0; sfx.click(); for (let i = 0; i < 5; i++) lanzar('estrella', OX + 22 + Math.random() * 16, ovBase() - 4, (Math.random() - .5) * 2, -.3, 6); }
    } else if (ov.f === 'despega') {
      if (ov.t === 12) seq([262, 330, 392, 523, 660, 880, 1175, 1568], .07, 'sawtooth', .04);
      if (ov.t >= 48) {
        ov.f = 'habla';
        dialogo([S(), ...(e.traductor ? [T('Yo llegué en algo así... hace mucho tiempo.'), T('Antes de conocer a Cortex.')] : [])], () => { ov.f = 'entra'; ov.t = 0; });
      }
    } else if (ov.f === 'entra') { if (ov.t === 1) sonidoAlien(); if (ov.t >= 36) { ov.f = 'camina'; ov.t = 0; } }
    else if (ov.f === 'camina') { if (ov.t >= 24) { ov.f = 'casco'; ov.t = 0; seq([784, 988, 1175], .09, 'triangle', .06); } }
    else if (ov.f === 'casco') { if (ov.t >= 30) { ov.f = 'da'; ov.t = 0; } }
    else if (ov.f === 'da') {
      if (ov.t >= 36) {
        ov.f = 'premio'; sfx.logro(); gesto('salto'); corazones(4); estrellas(8);
        e.tiene.casco_espacial = 1; e.ovniPend = 0; guardar();
        setTimeout(() => fanfare({ g: () => prevGrid('casco_espacial'), t: 'CASCO ESPACIAL', d: 'REGALO DEL AMIGO VERDE. PÓNSELO EN VESTIR A SIMON', mudo: true }, () => { if (ov) { ov.f = 'sale'; ov.t = 0; } }), 500);
      }
    } else if (ov.f === 'sale') {
      if (ov.t >= 52) { ov = null; proxAct = tk + 60; guardar(); pintar(); }
    }
  }
  function ovCielo(dy) {   // dentro del cristal de la ventana (se dibuja detrás del marco)
    if (lunaDorada()) {
      const fuerte = lunaFlash > 0 || (ov && ov.f === 'luz');
      ctx.drawImage(sprite('luna_oro' + (fuerte || (tk >> 3) % 2 ? 1 : 0), () => lunaOroGrid(fuerte || (tk >> 3) % 2 ? 1 : 0), 0), OX, dy);
      if ((tk >> 2) % 3 === 0) { const q = [[31, 20], [41, 22], [37, 32], [32, 28]][(tk >> 3) % 4]; ctx.fillStyle = '#fff6b0'; ctx.fillRect(OX + q[0], dy + q[1], 1, 3); ctx.fillRect(OX + q[0] - 1, dy + q[1] + 1, 3, 1); }
    }
    if (fz) {
      const q = fzPos(), C = ['#ffffff', '#fff6a8', '#ffe066', '#c8b050', '#8a7a40', '#5a5030'];
      for (let i = 5; i >= 0; i--) { const u = Math.max(0, fz.t - i * .9) / fz.len, x = OX + 43 + (16 - 43) * u, y = dy + 19 + (38 - 19) * u; ctx.fillStyle = C[i]; ctx.fillRect(Math.round(x), Math.round(y), i < 2 ? 2 : 1, i < 2 ? 2 : 1); }
    }
    if (ov && (ov.f === 'baja' || ov.f === 'espera' || ov.f === 'despega' || ov.f === 'seVa')) {
      const base = ovBase(); let y = base - 15, x = OX + 29 - 5, fl = 0;
      if (ov.f === 'baja') { const u = 1 - Math.pow(1 - ov.t / 55, 2); y = Math.round((dy + 8 - 15) + (base - 15 - (dy + 8 - 15)) * u); x += Math.round(Math.sin(ov.t / 4) * (1 - u) * 3); fl = 1 + ((tk >> 1) % 2); }
      else if (ov.f === 'despega' || ov.f === 'seVa') { if (ov.f === 'despega' && ov.t < 14) { x += (tk & 1) ? 1 : -1; fl = 1 + ((tk >> 1) % 2); } else { const w = ov.f === 'seVa' ? ov.t : (ov.t - 14); y = Math.round(base - 15 - w * w * .16); fl = 3; } }
      else if ((tk >> 3) % 2) { ctx.fillStyle = '#ffe45a'; ctx.fillRect(x + 4, y + 6, 2, 2); }
      ctx.drawImage(sprite('ov_coh', cohGrid, 0), x, y);
      if (fl) { ctx.fillStyle = '#ffa030'; ctx.fillRect(x + 3, y + 12, 4, 2 + fl); ctx.fillStyle = '#ffe45a'; ctx.fillRect(x + 4, y + 12, 2, 1 + fl); }
    }
  }
  function ovFrente() {   // el alien verde, delante de todo
    if (!ov || !['entra', 'camina', 'casco', 'da', 'premio', 'sale'].includes(ov.f)) return;
    const dy = RY - 59, pie = SY + SH - 4, ayS = pie - 34, ax0 = SX - 32, ax1 = SX - 20, wx = OX + 29 - 9, wy = dy + 34;
    let ax, ay, arr = 0, cx = 0, cy = 0, ver = true, casco = 1;   // casco: 1 puesto, 0 no, 2 volando
    if (ov.f === 'entra') { const u = ov.t / 36; ax = Math.round(wx + (ax0 - wx) * u); ay = Math.round(wy + (ayS - wy) * u - Math.abs(Math.sin(u * Math.PI * 3)) * 7 * (1 - u * .4)); }
    else if (ov.f === 'camina') { const u = ov.t / 24; ax = Math.round(ax0 + (ax1 - ax0) * u); ay = ayS - (ov.t % 8 < 4 ? 1 : 0); }
    else if (ov.f === 'casco') { ax = ax1; ay = ayS; arr = 1; const u = ov.t / 30; cx = 0; cy = -Math.round(u * 9); casco = u < .15 ? 1 : 2; }
    else if (ov.f === 'da') { ax = ax1; ay = ayS; arr = 1; const u = ov.t / 36; casco = 2; const hx = SX + 28 - 10, hy = SY + 6; const sx = ax1 - 1, sy = ayS + 3 - 9; cx = Math.round(sx + (hx - sx) * u) - (ax1 - 1); cy = Math.round(sy + (hy - sy) * u - Math.sin(u * Math.PI) * 10) - (ayS + 3); if (u > .85) casco = 0; }
    else if (ov.f === 'premio') { ax = ax1; ay = ayS; casco = 0; }
    else { const w = 12; if (ov.t < w) { ax = ax1; ay = ayS - ((ov.t >> 1) % 2 ? 2 : 0); arr = (ov.t >> 1) % 2; casco = 0; } else { const u = (ov.t - w) / (52 - w); ax = Math.round(ax1 + (wx - ax1) * u); ay = Math.round(ayS + (wy - ayS) * u - Math.abs(Math.sin(u * Math.PI * 3)) * 7); casco = 0; if (u > .92) ver = false; } }
    if (!ver) return;
    ctx.fillStyle = 'rgba(30,12,40,.3)'; ctx.fillRect(ax + 3, pie + 1, 12, 2);
    ctx.drawImage(sprite('ov_al' + arr, () => alienGrid(arr), 0), ax, ay);
    const cs = sprite('ov_cas', cascoAlGrid, 0);
    if (casco === 1) ctx.drawImage(cs, ax - 1, ay + 3);
    else if (casco === 2) { ctx.drawImage(cs, ax - 1 + cx, ay + 3 + cy); if ((tk >> 1) % 2) { ctx.fillStyle = '#fff6b0'; ctx.fillRect(ax + 8 + cx, ay + cy - 1, 1, 3); ctx.fillRect(ax + 7 + cx, ay + cy, 3, 1); } }
  }
  /* ===================== LUNA DE SANGRE Y EL OJO DE CTHULHU ===================== */
  let bl = null, admSangre = false, ojoHap = 0, ojoKeke = null, ojoXY = null, sangFlash = 0;
  function lunaSangreT() {   // cada noche (21:00-06:00) hay 1/10 de probabilidad; si toca, sale a una hora al azar y dura 3 horas. Nunca el sábado en la noche (choca con la dorada) ni el día 15 de 00:00 a 01:00 (choca con la azul)
    if (lunaOroT()) return false;
    if (admSangre) return true;
    const real = new Date(ahora()); if (real.getDate() === 15 && real.getHours() === 0) return false;
    const h = horaR(); if (!(h >= 21 || h < 6)) return false;
    const d = new Date(ahora()); if (h < 6) d.setDate(d.getDate() - 1);   // la madrugada pertenece a la noche que empezó el día anterior
    if (d.getDay() === 6) return false;
    const t = (h >= 21 ? h - 21 : h + 3) * 60 + new Date(ahora()).getMinutes();
    const k = 'sangre|' + d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate(); let x = 11; for (let i = 0; i < k.length; i++) x = Math.imul(x ^ k.charCodeAt(i), 2654435761) >>> 0;
    if (x % 10 !== 0) return false;
    const ini = (x >>> 4) % 361;   // minuto (desde las 21:00) en que sale; termina 180 minutos después, antes de las 6am
    return t >= ini && t < ini + 180;
  }
  const lunaSangre = () => escenaId() === 'sala' && (e.sangFase || 0) === 0 && !ov && lunaSangreT();   // tocable solo si Simon aún no tiene al ojo
  const sangreCielo = () => escenaId() === 'sala' && !ov && (!!bl || e.sangFase === 1 || lunaSangreT());
  function sangreGrid(v) {
    const g = Grid(60, 64), luna = elipse(36, 26, 6, 6), halo = elipse(36, 26, 10, 10), c1 = elipse(34, 24, 1.7, 1.7), c2 = elipse(39, 29, 1.3, 1.3), c3 = elipse(38, 22, 1, 1);
    for (let y = 14; y < 40; y++) for (let x = 24; x < 49; x++) {
      if (luna(x, y)) g.set(x, y, c1(x, y) || c2(x, y) || c3(x, y) ? '#7a0c1c' : BAY[y & 3][x & 3] > 9 ? '#e83a4a' : '#c01c30');
      else if (v && halo(x, y) && (x + y) % 2 === 0) g.set(x, y, '#8a1226');
    }
    return g;
  }
  function ojoGrid(r, ab, ph, mood, lx) {   // ojo con tentáculos; ab = apertura 0..1, mood 1 = corazón en el iris
    const tl = Math.max(3, Math.round(r * .75)), W = 2 * r + 5, H = 2 * r + 5 + tl, cx = W / 2, cy = r + 2.5, ry = r * .9;
    const g = Grid(W, H), sc = elipse(cx, cy, r, ry), bo = elipse(cx, cy, r + 1, ry + 1), ix = cx + lx * r * .22;
    const ir = elipse(ix, cy, r * .56, r * .56), ir2 = elipse(ix, cy, r * .4, r * .4), pu = elipse(ix, cy, Math.max(.6, r * .1), r * .42);
    [-1, 0, 1].forEach(i => { const x0 = Math.round(cx + i * r * .55); for (let k = 0; k < tl; k++) { const x = x0 + Math.round(Math.sin(ph + k * .9 + i * 2) * 1.3), y = Math.floor(cy + ry) + k - 1; g.set(x, y, k > tl - 2 ? '#1f5442' : '#2e8a68'); if (r >= 7) g.set(x + 1, y, '#2e8a68'); } });
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (bo(x, y) && !sc(x, y)) { g.set(x, y, '#4a0a18'); continue; }
      if (!sc(x, y)) continue;
      let c = (x + y) % 7 === 0 && Math.hypot(x - cx, y - cy) > r * .55 ? '#d84050' : '#f6ecec';
      if (y > cy + ry * .55 && c === '#f6ecec') c = '#ddc8cc';
      if (ir(x, y)) c = '#7a0c20'; if (ir2(x, y)) c = '#d02038'; if (pu(x, y)) c = '#12050a';
      if (ab < 1 && y < cy - ry + 2 * ry * (1 - ab)) c = '#5a1424';
      g.set(x, y, c);
    }
    if (mood && r >= 4 && ab > .5) g.art(Math.round(ix) - 2, Math.round(cy) - 2, ['.x.x.', 'xxxxx', '.xxx.', '..x..'], { x: '#ff7090' });
    if (ab > .5) g.set(Math.round(cx - r * .3), Math.round(cy - r * .35), '#ffffff');
    return g;
  }
  function dibOjo(X, Y, r, ab, mood, lx) {
    const ph = (tk >> 2) % 6, a = Math.round(ab * 5) / 5, sp = sprite('ojo|' + [r, a, ph, mood, lx].join('|'), () => ojoGrid(r, a, ph * 1.05, mood, lx), 0);
    ctx.drawImage(sp, Math.round(X - sp.width / 2), Math.round(Y - (r + 2.5)));
  }
  function ojoSnd() {   // el sonido propio del ojo: un "blup" húmedo y un "wuuu" tembloroso
    if (e.mudo || !audio()) return;
    const t = ac.currentTime + .02;
    const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(260, t); o.frequency.exponentialRampToValueAtTime(820, t + .09);
    g.gain.setValueAtTime(.001, t); g.gain.linearRampToValueAtTime(.07, t + .02); g.gain.exponentialRampToValueAtTime(.001, t + .14); o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + .16);
    const o2 = ac.createOscillator(), g2 = ac.createGain(), l = ac.createOscillator(), lg = ac.createGain(); o2.type = 'triangle'; o2.frequency.setValueAtTime(540, t + .16); o2.frequency.exponentialRampToValueAtTime(250, t + .55);
    l.frequency.value = 16; lg.gain.value = 40; l.connect(lg); lg.connect(o2.frequency);
    g2.gain.setValueAtTime(.001, t + .16); g2.gain.linearRampToValueAtTime(.05, t + .22); g2.gain.exponentialRampToValueAtTime(.001, t + .6); o2.connect(g2); g2.connect(ac.destination); o2.start(t + .16); l.start(t + .16); o2.stop(t + .62); l.stop(t + .62);
  }
  function retumbo() {
    if (e.mudo || !audio()) return; const t = ac.currentTime + .02, o = ac.createOscillator(), g = ac.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(80, t); o.frequency.exponentialRampToValueAtTime(38, t + 1.2);
    g.gain.setValueAtTime(.001, t); g.gain.linearRampToValueAtTime(.09, t + .2); g.gain.exponentialRampToValueAtTime(.001, t + 1.3); o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + 1.35);
  }
  const ojoAct = () => ((e.sangFase === 2 || (e.tiene && e.tiene.ojo_pet)) && petActiva('ojo_pet')) || (e.sangFase === 2 && e.ojoOn !== 0);   // la mascota está con Simon (no guardada)
  const OJO_H = () => ({ x: SX - 9 + Math.round(Math.cos(tk / 13) * 6), y: SY + 20 + Math.round(Math.sin(tk / 13) * 4) });   // a la izquierda de Simon, orbitando suave
  function lanzaKeke() { ojoKeke = { t: 0, len: 14 }; gesto('salto'); }
  let sangInactT = 0;
  function sangreTap() {
    sangInactT = 0;
    e.sangT = (e.sangT || 0) + 1; sangFlash = 8; const dy0 = RY - 59;
    seq([233, 196, 175].slice(0, 1 + (e.sangT % 3)), .09, 'sawtooth', .05);
    for (let i = 0; i < 4; i++) lanzar('corazon', OX + 31 + Math.random() * 12, dy0 + 20 + Math.random() * 12, (Math.random() - .5) * 1.2, -.4, 8 + i);
    if (e.sangT >= 3) sangreStart(); else guardar();
  }
  function sangreStart() {
    if (bl) return; lugar = null; llegada = null; if (e.hab !== 'sala') { e.hab = 'sala'; pintarNav(); }
    if (e.dormido) { e.dormido = false; sfx.despertar(); } act = null; proxAct = tk + 99999;
    bl = { f: 'cambia', t: 0 }; sangInactT = 0; guardar();
  }
  function ojoToca() {
    if (ojoKeke || dlg) return;
    sangInactT = 0;
    if (e.sangFase === 2) { if (!ojoAct()) return; ojoSnd(); ojoHap = 20; if (ojoXY) lanzar('corazon', ojoXY.x, ojoXY.y - 6, 0, -1.5, 10); return; }
    e.ojoN = (e.ojoN || 0) + 1; lanzaKeke(); guardar();
  }
  function sonidoUnico() {   // el sonido de haber conseguido algo único: estruendo grave, arpegio brillante, el "wuuu" del ojo y un acorde final
    if (e.mudo || !audio()) return;
    retumbo(); seq([523, 659, 784, 1047, 1319, 1568, 2093], .085, 'triangle', .07, .25);
    setTimeout(ojoSnd, 950); seq([1047, 1319, 1568, 2093], .5, 'sine', .05, 1.35); seq([262, 392], .9, 'sawtooth', .025, 1.35); seq([2093, 2637, 3136, 4186], .07, 'square', .02, 1.9);
  }
  function ojoFin() {
    e.sangFase = 2; guardar();
    decir('Sí.', null, 2600); hablar(); setTimeout(() => { sonidoUnico(); fanfare({ g: () => ojoGrid(9, 1, 0, 1, 1), t: 'OJO DE CTHULHU', d: 'MASCOTA EXCLUSIVA, ÚNICA EN SU CLASE. SIMON DUERME 10% MÁS RÁPIDO', mudo: true }, () => { corazones(6); estrellas(8); }); }, 900);
  }
  let ojoFuga = null;
  function ojoSeVa() { ojoFuga = null; e.sangFase = 0; e.ojoN = 0; e.sangT = 0; ojoKeke = null; sangInactT = 0; guardar(); }   // amaneció y Simon no lo convenció: el ojo se va; la luna de sangre podrá volver
  function blTick() {
    if (sangFlash > 0) sangFlash--; if (ojoHap > 0) ojoHap--;
    if (!bl && e.sangT > 0 && e.sangT < 3) {
      if (++sangInactT > 300) { e.sangT = 0; sangInactT = 0; guardar(); }
    }
    if (ojoKeke) {
      ojoKeke.t++;
      if (ojoKeke.t === ojoKeke.len) {
        const q = bl || e.sangFase === 1 ? OJO_H() : { x: SX - 9, y: SY + 20 }; ojoHap = 30; sfx.compra(); ojoSnd();
        for (let i = 0; i < 3 + (e.ojoN || 0); i++) lanzar('corazon', q.x - 6 + Math.random() * 12, q.y - 6, (Math.random() - .5), -1.6, 10 + i);
        if (!bl && e.sangFase === 1) { if (e.ojoN >= 5) setTimeout(ojoFin, 700); }
      }
      if (ojoKeke.t > ojoKeke.len + 4) ojoKeke = null;
    }
    if (!bl && e.sangFase === 1) {
      if (!ojoFuga && !esNoche()) { if (escenaId() === 'sala') ojoFuga = { t: 0 }; else ojoSeVa(); }
      else if (!ojoFuga && ++sangInactT >= 600) {   // 60s sin interacción con el ojo: se marcha
        if (escenaId() === 'sala') ojoFuga = { t: 0 }; else ojoSeVa();
        toast('El ojo se cansó de esperar y se fue...');
      }
    }
    if (ojoFuga && ++ojoFuga.t > 30) ojoSeVa();
    if (!bl) { if ((e.sangFase === 1 || ojoAct()) && !e.dormido && !modal && !dlg && !mj && !rt && tk % 10 === 0 && Math.random() < .05) ojoSnd(); return; }
    if (escenaId() !== 'sala' || bl.f === 'habla') return;
    bl.t++;
    if (bl.f === 'cambia') { if (bl.t === 1) retumbo(); if (bl.t === 16) ojoSnd(); if (bl.t >= 40) { bl.f = 'acerca'; bl.t = 0; } }
    else if (bl.f === 'acerca') { if (bl.t === 30) retumbo(); if (bl.t >= 90) { bl.f = 'entra'; bl.t = 0; seq([300, 420, 560, 760], .07, 'sine', .05); } }
    else if (bl.f === 'entra') { if (bl.t >= 50) { bl.f = 'lanza'; bl.t = 0; lanzaKeke(); } }
    else if (bl.f === 'lanza') {
      if (bl.t >= 40) {
        bl.f = 'habla';
        dialogo([S(), T('Le encantó el keke... Entonces no puede ser malo.')], () => { bl = null; e.sangFase = 1; e.ojoN = 0; proxAct = tk + 60; guardar(); pintar(); });
      }
    }
  }
  function sangreCieloDib(dy) {   // dentro del cristal de la ventana
    if (!sangreCielo()) return;
    ctx.fillStyle = 'rgba(110,0,24,.30)'; ctx.fillRect(OX, dy, 60, 64);
    const WX = OX + 29, WY = dy + 30;
    if ((!bl && e.sangFase !== 1) || (bl && bl.t < 10 && bl.f === 'cambia')) {
      const fu = sangFlash > 0 || (tk >> 3) % 2; ctx.drawImage(sprite('luna_sg' + (fu ? 1 : 0), () => sangreGrid(fu ? 1 : 0), 0), OX, dy);
    }
    if (bl && bl.f === 'cambia' && bl.t >= 10) { dibOjo(OX + 36, dy + 26, 6, Math.min(1, (bl.t - 10) / 24), 0, 0); }
    if (bl && bl.f === 'acerca') { const u = bl.t / 90, ue = u * u * (3 - 2 * u); dibOjo(OX + 36 + (WX - OX - 36) * ue, dy + 26 + (WY - dy - 26) * ue, Math.round(6 + ue * 4), 1, 0, (tk >> 4) % 2 ? 1 : -1); }
  }
  function lunasSolo(dy) {   // otras ventanas: la luna dorada, roja o azul solo se ve, no se puede tocar
    if (lunaOroT()) { const f = (tk >> 3) % 2; ctx.drawImage(sprite('luna_oro' + f, () => lunaOroGrid(f), 0), OX, dy); }
    else if (lunaSangreT()) { ctx.fillStyle = 'rgba(110,0,24,.30)'; ctx.fillRect(OX, dy, 60, 64); const f = (tk >> 3) % 2; ctx.drawImage(sprite('luna_sg' + f, () => sangreGrid(f), 0), OX, dy); }
    else if (lunaAzulT() && !az) { const f = (tk >> 3) % 2; ctx.drawImage(sprite('luna_az' + f, () => lunaAzulGrid(f), 0), OX, dy); }
  }
  function ojoAtras() {   // mascota orbitando: mitad de atrás (detrás de Simon)
    ojoOrbita(false);
  }
  function ojoOrbita(fr) {
    if (!ojoAct() || bl) return; const esc = escenaId(); if (esc === 'estudio' || esc === 'bano' || esc === 'calle' || introActiva) return;
    const a = tk * (e.dormido ? .02 : .06), s = Math.sin(a), front = s > 0; if (front !== fr) return;
    const x = SX - 9 + Math.cos(a) * 8, y = SY + 22 + s * 6 + Math.sin(tk / 7) * 1.5;
    ojoXY = ojoXY || { x, y }; if (fr) ojoXY = { x, y };
    dibOjo(x, y, front ? 4 : 3, e.dormido ? .2 : (tk % 70 < 3 ? .2 : 1), ojoHap > 0 ? 1 : 0, 1);
  }
  function ojoFrente() {   // el ojo visitante (antes de ser mascota), el keke y la entrada por la ventana
    const esc = escenaId(); if (esc !== 'sala' || introActiva) { ojoOrbita(true); return; }
    const H = OJO_H(), mood = ojoHap > 0 ? 1 : 0, ab = tk % 70 < 3 ? .2 : 1;
    if (bl && bl.f === 'entra') { const dy = RY - 59, WX = OX + 29, WY = dy + 30, u = bl.t / 50, ue = u * u * (3 - 2 * u); dibOjo(WX + (H.x - WX) * ue, WY + (H.y - WY) * ue + Math.sin(u * 9) * 3, Math.max(7, 10 - Math.round(u * 3)), 1, 0, 1); }
    else if (!bl && e.sangFase === 1 && ojoFuga) { const u = ojoFuga.t / 30, dy = RY - 59; dibOjo(H.x + (OX + 29 - H.x) * u, H.y + (dy + 30 - H.y) * u - Math.sin(u * Math.PI) * 8, Math.max(4, 7 - Math.round(u * 3)), 1, 0, 1); }
    else if ((bl && (bl.f === 'lanza' || bl.f === 'habla')) || (!bl && e.sangFase === 1)) { ojoXY = { x: H.x, y: H.y }; dibOjo(H.x, H.y, 7, ab, mood, 1); }
    else ojoOrbita(true);
    if (ojoKeke && ojoKeke.t < ojoKeke.len) {
      const u = ojoKeke.t / ojoKeke.len, k0 = { x: SX + 8, y: SY + 34 }, q = bl || e.sangFase === 1 ? H : { x: SX - 9, y: SY + 20 };
      ctx.drawImage(sprite('fd_keke', FGRID.keke, 0), Math.round(k0.x + (q.x - k0.x) * u - 4), Math.round(k0.y + (q.y - k0.y) * u - Math.sin(u * Math.PI) * 14 - 4));
    }
  }
  /* ===================== LUNA AZUL: EL AURA LEGENDARIA (easter egg mensual) ===================== */
  let az = null, admAzul = false, azulFlash = 0, esferaXY = null;
  function lunaAzulT() {   // solo el día 15 de cada mes, de 00:00 a 00:59 en punto. Nunca choca con la dorada (domingo) ni la de sangre
    if (admAzul) return true;
    const d = new Date(ahora());
    return d.getDate() === 15 && d.getHours() === 0;
  }
  const lunaAzul = () => escenaId() === 'sala' && !ov && !bl && !az && !e.tiene.aura_legend && lunaAzulT();   // tocable solo si Simon aún no tiene el aura
  function lunaAzulGrid(v) {
    const g = Grid(60, 64), luna = elipse(36, 26, 6, 6), halo = elipse(36, 26, 10, 10);
    for (let y = 14; y < 40; y++) for (let x = 24; x < 49; x++) {
      if (luna(x, y)) g.set(x, y, BAY[y & 3][x & 3] > 9 ? '#eaf6ff' : '#7ac0ff');
      else if (v && halo(x, y) && (x + y) % 2 === 0) g.set(x, y, '#bfe0ff');
    }
    return g;
  }
  function esferaGrid(v) {
    const g = Grid(14, 14), cx = 6.5, cy = 6.5;
    capa(g, '#0a2a6a', L => sombrear(L, elipse(cx, cy, 5.3, 5.3), cx, cy, 5.3, 5.3, ['#eaf6ff', '#6ab0ff', '#2a68e0', '#0a2a8a']));
    if (v) [[0, -7], [5, -5], [7, 0], [5, 5], [0, 7], [-5, 5], [-7, 0], [-5, -5]].forEach(([dx, dy]) => g.set(Math.round(cx + dx), Math.round(cy + dy), '#bfe0ff'));
    g.set(Math.round(cx - 2), Math.round(cy - 2), '#ffffff');
    return g;
  }
  let azulInactT = 0;
  function azulTap() {
    azulInactT = 0;
    if (e.azulD !== hoy()) { e.azulT = 0; e.azulD = hoy(); }   // nueva aparición: reinicia el conteo de toques
    e.azulT = (e.azulT || 0) + 1; azulFlash = 10; const dy0 = RY - 59;
    seq([659, 880, 1047, 1319, 1568].slice(0, Math.min(5, e.azulT)), .07, 'triangle', .08);
    for (let i = 0; i < 5; i++) lanzar('estrella', OX + 31 + Math.random() * 12, dy0 + 20 + Math.random() * 12, (Math.random() - .5) * 1.2, -.4, 8 + i);
    if (e.azulT >= 5) { az = { f: 'explota', t: 0 }; lugar = null; llegada = null; if (e.hab !== 'sala') { e.hab = 'sala'; pintarNav(); } if (e.dormido) { e.dormido = false; sfx.despertar(); } act = null; proxAct = tk + 99999; }
    guardar();
  }
  function azulBrillo() {   // 0..1: qué tan iluminada está la recámara por la luna
    if (e.tiene.aura_legend) return 0;   // ya se obtuvo el aura: el filtro no se queda pegado el resto de la hora
    if (az && az.f === 'explota') return Math.min(1, .8 + az.t / 16 * .2);
    if (az) return 0;
    if (!lunaAzulT()) return 0;
    return Math.min(.8, (e.azulT || 0) * .2);
  }
  function esferaH() { return { x: SX + 44, y: SY + 18 }; }   // dónde se queda flotando la esfera, visible y despejada
  function azulTick() {
    if (azulFlash > 0) azulFlash--;
    if (!az) {
      if (e.azulT > 0 && e.azulT < 5) {
        if (++azulInactT > 300) { e.azulT = 0; azulInactT = 0; guardar(); }
      }
      return;
    }
    if (az.f === 'espera') {
      az.t++;
      if (az.t >= 600) {   // 60s sin tocar: la esfera se desvanece
        if (escenaId() === 'sala') {
          for (let i = 0; i < 8; i++) lanzar('estrella', esferaH().x, esferaH().y, (Math.random() - .5) * 2, (Math.random() - .5) * 2, 8 + i);
        }
        az = null; esferaXY = null; e.azulT = 0; guardar();
        toast('La esfera azul se desvaneció...');
        return;
      }
      return;
    }
    if (escenaId() !== 'sala') return;   // si se va de la sala durante la cinemática, espera
    az.t++;
    if (az.f === 'explota') {
      if (az.t === 1) retumbo();
      if (az.t === 10) seq([1760, 2217, 2793, 3520], .06, 'square', .08);
      if (az.t >= 16) { az.f = 'blanco'; az.t = 0; }
    } else if (az.f === 'blanco') {
      if (az.t >= 9) { az.f = 'cae'; az.t = 0; sfx.click(); }
    } else if (az.f === 'cae') {
      if (az.t >= 28) { az.f = 'espera'; az.t = 0; for (let i = 0; i < 6; i++) lanzar('estrella', esferaH().x, esferaH().y, (Math.random() - .5) * 1.4, -.4, 8 + i); }
    }
  }
  function esferaToca() {
    if (!az || az.f !== 'espera') return;
    az = null; esferaXY = null; e.tiene.aura_legend = 1; e.ropa.aura = 'aura_legend'; e.azulHecho = hoy(); guardar();
    sonidoUnico(); corazones(6); estrellas(10);
    setTimeout(() => fanfare({ g: () => prevGrid('aura_legend'), t: 'AURA LEGENDARIA', d: 'CAYÓ DEL CIELO EN LA LUNA AZUL. SOLO PASA UNA VEZ AL MES', mudo: true }), 500);
  }
  function azulVentana(dy) {   // dentro del cristal: la luna y la esfera mientras cae (detrás de los muebles y de Simon)
    if (!az && lunaAzulT() && !e.tiene.aura_legend) {
      const fu = azulFlash > 0 || (tk >> 3) % 2;
      ctx.drawImage(sprite('luna_az' + (fu ? 1 : 0), () => lunaAzulGrid(fu ? 1 : 0), 0), OX, dy);
    }
    if (az && az.f === 'cae') {
      const wx = OX + 29, wy = dy + 30, H = esferaH(), u = Math.min(1, az.t / 28), ue = u * u;
      const x = Math.round(wx + (H.x - wx) * ue), y = Math.round(wy + (H.y - wy) * ue);
      esferaXY = { x, y };
      const f = (tk >> 2) % 2;
      ctx.drawImage(sprite('esfera_az' + f, () => esferaGrid(f), 0), x - 7, y - 7);
    }
  }
  function azulFrente() {   // la esfera ya posada en la recámara, lista para tocarse
    if (!az || az.f !== 'espera') { if (!az) esferaXY = null; return; }
    const H = esferaH(), y = H.y + Math.round(Math.sin(tk / 9) * 2);
    esferaXY = { x: H.x, y };
    const f = (tk >> 2) % 2;
    ctx.drawImage(sprite('esfera_az' + f, () => esferaGrid(f), 0), H.x - 7, y - 7);
  }
  function azulLuz() {   // la luz azul que va llenando toda la recámara, y el destello blanco de la explosión
    if (escenaId() !== 'sala') return;
    const b = azulBrillo();
    if (b > 0) { ctx.fillStyle = 'rgba(90,170,255,' + (b * .4).toFixed(2) + ')'; ctx.fillRect(0, 0, LW, LH); }
    if (az && az.f === 'blanco') { const u = Math.min(1, az.t / 4); ctx.fillStyle = 'rgba(255,255,255,' + u.toFixed(2) + ')'; ctx.fillRect(0, 0, LW, LH); }
  }
  /* ===================== EASTER EGG: AURA DE TRUENO (tormenta) ===================== */
  // Durante una tormenta caen rayos tocables en la ventana. Al tocar 3, una centella entra volando,
  // da una vuelta alrededor de Simon y explota en varios rayos: así se desbloquea el AURA DE TRUENO.
  let tr = null, truenoT = 0, boltV = 0, boltX = 0, boltY = 0, centellaXY = null;
  function truenoDisponible() {   // puede aparecer/tocarse un rayo ahora mismo
    return escenaId() === 'sala' && !lugar && !calle && !dlg && !modal && !introActiva && !tr && !ov && !az && !bl && !e.tiene.aura_trueno;
  }
  let truenoInactT = 0;
  function truenoTap() {
    truenoInactT = 0;
    boltV = 0; truenoT++; sfx.click();
    seq([880, 1175, 1480].slice(0, Math.min(3, truenoT)), .06, 'square', .08);
    for (let i = 0; i < 5; i++) lanzar('estrella', boltX, boltY, (Math.random() - .5) * 1.4, -.5, 8 + i);
    if (truenoT >= 3) {
      tr = { f: 'entra', t: 0 }; centellaXY = { x: boltX, y: boltY };
      lugar = null; llegada = null; if (e.hab !== 'sala') { e.hab = 'sala'; pintarNav(); }
      if (e.dormido) { e.dormido = false; sfx.despertar(); }
      act = null; proxAct = tk + 99999;
    }
    guardar();
  }
  function truenoTick() {
    if (!tr) {
      if (truenoT > 0) {
        if (++truenoInactT > 450 || clima() !== 'tormenta') { truenoT = 0; truenoInactT = 0; guardar(); }
      }
      return;
    }
    if (escenaId() !== 'sala') return;   // si se va de la sala, el evento espera
    tr.t++;
    const dy0 = RY - 59, wx = OX + 29, wy = dy0 + 26, Hx = SX + 28, Hy = SY + 26;
    if (tr.f === 'entra') {
      const u = Math.min(1, tr.t / 12), ue = u * u;
      centellaXY = { x: Math.round(wx + (Hx - wx) * ue), y: Math.round(wy + (Hy - wy) * ue) };
      if (tr.t >= 12) { tr.f = 'vuelta'; tr.t = 0; }
    } else if (tr.f === 'vuelta') {
      const dur = 22, ang = (tr.t / dur) * Math.PI * 2 * 1.4;
      centellaXY = { x: Math.round(Hx + Math.cos(ang) * 17), y: Math.round(Hy + Math.sin(ang) * 11) };
      if (tr.t % 3 === 0) lanzar('rayo', centellaXY.x, centellaXY.y, 0, 0, 5);
      if (tr.t >= dur) { tr.f = 'explota'; tr.t = 0; }
    } else if (tr.f === 'explota') {
      if (tr.t === 1) { retumbo(); for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; lanzar('rayo', Hx, Hy, Math.cos(a) * (1.4 + Math.random()), Math.sin(a) * (1.4 + Math.random()) - .5, 10 + Math.floor(Math.random() * 6)); } }
      if (tr.t === 2) seq([1760, 2217, 2793, 3520], .06, 'square', .08);
      if (tr.t >= 16) truenoDesbloquear();
    }
  }
  function truenoFrente() {   // la centella dando vueltas alrededor de Simon, ya dentro del cuarto
    if (!tr || tr.f !== 'vuelta' || !centellaXY) return;
    ctx.drawImage(sprite('fx_rayo', FX.rayo, 0), Math.round(centellaXY.x) - 2, Math.round(centellaXY.y) - 4);
  }
  function truenoLuz() {   // destello blanco de la explosión
    if (escenaId() !== 'sala' || !tr || tr.f !== 'explota') return;
    const u = tr.t <= 3 ? tr.t / 3 : Math.max(0, 1 - (tr.t - 3) / 10);
    if (u > 0) { ctx.fillStyle = 'rgba(255,255,255,' + Math.min(1, u).toFixed(2) + ')'; ctx.fillRect(0, 0, LW, LH); }
  }
  function truenoDesbloquear() {
    tr = null; centellaXY = null; truenoT = 0; boltV = 0;
    e.tiene.aura_trueno = 1; e.ropa.aura = 'aura_trueno'; e.truenoHecho = hoy(); guardar();
    sonidoUnico(); corazones(6); estrellas(10);
    setTimeout(() => fanfare({ g: () => prevGrid('aura_trueno'), t: 'AURA DE TRUENO', d: 'LA CENTELLA ENTRÓ POR LA VENTANA EN MEDIO DE LA TORMENTA', mudo: true }), 500);
  }
  // (Sección de BAÑO movida a minijuegos.js)

/* ===================== TUTORIAL DE LA PANTALLA (Cortex explica los botones) ===================== */
  let tfT = 0;
  function tutFlechas() {   // flecha roja junto a cada elemento resaltado
    document.querySelectorAll('.tflecha').forEach(x => x.remove());
    document.querySelectorAll('.resalta').forEach(el => {
      const r = el.getBoundingClientRect(); if (!r.width) return;
      const abajoLibre = r.bottom + 34 < innerHeight && r.top < innerHeight * .45, f = document.createElement('div');
      f.className = 'tflecha' + (abajoLibre ? ' arr' : ''); f.innerHTML = '<i></i>';
      f.style.left = Math.round(r.left + r.width / 2 - 11) + 'px'; f.style.top = Math.round(abajoLibre ? r.bottom + 4 : r.top - 30) + 'px';
      document.body.appendChild(f);
    });
  }
  function tutRes(sel) {
    document.querySelectorAll('.resalta').forEach(x => x.classList.remove('resalta')); if (sel) document.querySelectorAll(sel).forEach(x => x.classList.add('resalta'));
    clearInterval(tfT); tutFlechas(); if (sel) tfT = setInterval(tutFlechas, 400);
  }
// (CT definido en dialogos.js)
  function libreParaTutorial() { return eventoLibre(EV_TUT); }
  function iniciarTutorial() {
    act = null; document.body.classList.add('tut');
    cortexEntra(() => dialogo([
      CT('Te explico rapidito qué es cada cosa.'),
      CT('Este círculo es el cariño: al llenarlo, subes de nivel.', '.med'),
      CT('Estas barras son su hambre, energía, felicidad y limpieza.', '.stats'),
      CT('Tus monedas, la campana de avisos y los ajustes. Ahí también están tus logros.', '.der2'),
      CT('Este botón abre tu Inventario.', '#b-inv'),
      CT('La cámara toma fotos y la casita mueve los muebles.', '#b-foto, #b-editar'),
      CT('Aquí están mis misiones.', '#t-mis'),
      CT('Abajo siguen las acciones de siempre: alimentar, dormir, jugar, la tienda y Simon dice. Los minijuegos están en la máquina arcade de la sala de juegos.', '.botones'),
      CT('¡Eso es todo! Puedes repetirlo en Ajustes.')
    ], () => { tutRes(null); document.body.classList.remove('tut'); e.cajaT = e.caja ? 0 : ahora() + 120000; e.proxVisita = Math.max(e.proxVisita || 0, ahora() + 30 * 60000); e.proxSiesta = Math.max(e.proxSiesta || 0, ahora() + 2 * 3600000); guardar(); cortexSale(() => { pintar(); saludar && setTimeout(saludar, 600); }); }));
  }
  /* ===== MINI-EVENTO DE LA PRIMERA SESIÓN: la caja misteriosa de Cortex ===== */
  var cajaA = null;
  function cajaIni(f, extra) { cajaA = Object.assign({ f, t0: Date.now() }, extra || {}); }
  function cajaDibuja() {
    const a = cajaA; if (!a) return;
    const t = (Date.now() - a.t0) / 1000, bx = cxb() + 4, base = SY + SH - 4;
    let dx = 0, dy = 0, lid = 0;
    if (a.f === 'trae') dy = t < .5 ? -Math.round(Math.pow(1 - t / .5, 2) * 34) : (t < .8 ? -Math.round(Math.sin((t - .5) / .3 * Math.PI) * 3) : 0);
    else if (t < 1) { const w = Math.sin(t * 38); dx = Math.round(w * (1 + t * 2)); dy = t > .5 && w > 0 ? -1 : 0; }
    else lid = Math.min(16, Math.round((t - 1) * 70));
    ctx.fillStyle = 'rgba(30,12,40,.34)';
    for (let y = -2; y <= 2; y++) { const w = Math.round(10 * Math.sqrt(1 - (y / 2.6) * (y / 2.6))); ctx.fillRect(bx - w, base + y, w * 2, 1); }
    const x = bx + dx - 9, y = base + dy;
    ctx.fillStyle = '#2a0a5a'; ctx.fillRect(x, y - 14, 18, 14);
    ctx.fillStyle = '#7a3ad0'; ctx.fillRect(x + 1, y - 13, 16, 12); ctx.fillStyle = '#9a5ae8'; ctx.fillRect(x + 1, y - 13, 3, 12); ctx.fillStyle = '#5a28a0'; ctx.fillRect(x + 14, y - 13, 3, 12);
    ctx.fillStyle = '#ffd84a'; ctx.fillRect(x + 8, y - 13, 2, 12);
    if (lid > 0) { ctx.fillStyle = '#12062a'; ctx.fillRect(x + 1, y - 14, 16, 2); }
    const ly = y - 18 - lid, lx = x - 1 + Math.round(lid / 3);
    ctx.fillStyle = '#2a0a5a'; ctx.fillRect(lx, ly, 20, 5); ctx.fillStyle = '#b070f0'; ctx.fillRect(lx + 1, ly + 1, 18, 3); ctx.fillStyle = '#d8aaff'; ctx.fillRect(lx + 1, ly + 1, 18, 1);
    ctx.fillStyle = '#ffd84a'; ctx.fillRect(lx + 9, ly, 2, 5);
    if (!lid) { ctx.fillRect(lx + 5, ly - 3, 4, 3); ctx.fillRect(lx + 11, ly - 3, 4, 3); ctx.fillRect(lx + 9, ly - 2, 2, 2); }
    if (a.f === 'trae' && t > .6 && ((t * 5) | 0) % 2) { ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 17, y - 22, 1, 3); ctx.fillRect(x + 16, y - 21, 3, 1); }
    if (a.f === 'abre' && t >= 1) {
      const u = t - 1, cy = y - 14;
      if (u < 1.1) { const f = u < .6 ? 1 : 1 - (u - .6) / .5; for (let k = 0; k < 9; k++) { const ang = -Math.PI * (.05 + k * .112), len = Math.min(34, u * 70) * f; ctx.fillStyle = k % 2 ? '#ffffff' : '#ffe45a'; for (let r = 6; r < len; r += 2) ctx.fillRect(Math.round(bx + Math.cos(ang) * r), Math.round(cy + Math.sin(ang) * r * .8), 2, 1); } }
      if (u < .18) { ctx.fillStyle = 'rgba(255,255,255,' + (.5 * (1 - u / .18)).toFixed(2) + ')'; ctx.fillRect(0, 0, LW, LH); }
      if (u > .25) {
        const p = Math.min(1, (u - .25) / .7), ry = y - 16 - Math.round(p * 11) + (p >= 1 ? Math.round(Math.sin(t * 5) * 1) : 0);
        const cmx = a.gafas ? bx - 9 : bx - 3;
        ctx.drawImage(sprite('fx_moneda', FX.moneda, 0), cmx, ry);
        if (a.gafas) { const gx0 = bx + 1, gy = ry + 1; ctx.fillStyle = '#ffe45a'; ctx.fillRect(gx0 - 1, gy - 1, 12, 5); ctx.fillStyle = '#0a0a18'; ctx.fillRect(gx0, gy, 4, 3); ctx.fillRect(gx0 + 6, gy, 4, 3); ctx.fillRect(gx0 + 4, gy, 2, 1); ctx.fillStyle = '#8a8ae0'; ctx.fillRect(gx0, gy, 1, 1); ctx.fillRect(gx0 + 6, gy, 1, 1); }
        if (p >= 1 && (tk >> 2) % 2) { ctx.fillStyle = '#ffffff'; ctx.fillRect(bx, ry - 5, 1, 3); ctx.fillRect(bx - 1, ry - 4, 3, 1); }
      }
    }
  }
  function cajaFin() { cajaA = null; e.caja = 1; guardar(); cortexSale(() => { pintar(); setTimeout(saludar, 600); if (celQ.length) celebraCheck(); }); }
  function iniciarCaja() {
    e.caja = 1; act = null; guardar(); if (modal) cerrar();
    const trae = !e.tiene.gafas;
    cortexEntra(() => dialogo([
      { q: 'CORTEX', t: '¡Simon! Mira lo que encontré donde te encontré a ti.', pre: () => { cajaIni('trae'); sfx.click(); } },
      S(), T('¿Una caja? ¿Para mí?'),
      C('Es tuya. Ábrela.'),
      { q: 'CORTEX', t: '*Simon sacude la caja, la abre...*', fn: () => { cajaIni('abre', { gafas: trae }); gesto('salto'); setTimeout(() => { sfx.regalo(); estrellas(14); corazones(4); }, 1000); } },
      { q: 'CORTEX', t: trae ? '¡Gafas de sol y 25 monedas!' : '¡25 monedas!', fn: () => { if (trae) { e.tiene.gafas = 1; toast('¡Conseguiste las GAFAS DE SOL!'); } ganar(25, 12, true); } },
      S(), T('¡Me encanta! No explotó... todavía.'),
      C('Jaja. Nos vemos pronto.')
    ], cajaFin));
  }
  function checkCaja() {
    if (e.caja || !e.cajaT || escenaId() !== 'sala' || !libreParaTutorial() || ahora() < e.cajaT) return;
    iniciarCaja();
  }

  function checkTutorial() {
    if (e.tutUI || !libreParaTutorial()) return;
    if (!e.tutT) { e.tutT = ahora() + 8000; return; }
    if (ahora() < e.tutT) return;
    e.tutUI = 1; guardar(); iniciarTutorial();
  }

  /* ===================== SIESTA DE CORTEX ===================== */
  function checkSiesta() {
    if (!eventoLibre(EV_SIE)) return;
    if (!e.proxSiesta) { e.proxSiesta = ahora() + (1 + Math.random() * 2) * 3600000; return; }
    const h = new Date(ahora()).getHours();
    if (ahora() < e.proxSiesta || h < 10 || h >= 22 || Math.random() > .25) return;
    iniciarSiesta();
  }
  function iniciarSiesta() {
    e.proxSiesta = ahora() + (3 + Math.random() * 3) * 3600000; act = null; dx('siesta'); notificar('Cortex se quedó dormido en tu recámara.'); guardar();
    cortexEntra(() => dialogo([C('Uf... qué día. Voy a sentarme un ratito aquí.'),
      { q: 'CORTEX', t: '...solo cierro los ojos un segundito...', pre: () => { desc = { fin: ahora() + 150000, siesta: true, zzz: true, toques: 0 }; bm = null; } },
      C('Zzz... zzz...')], () => { pintar(); bombaTick(); decir('Sí.', e.traductor ? 'Shhh... Cortex se durmió.' : null, 3200); hablar(); }));
  }
  function siestaToque() {
    const n = desc.toques++;
    if (n === 0) dialogo([C('Mmm... no, yo no me comí el keke... zzz'), S(), T('Sí se lo comió. ¿Y si lo explotamos?')], bombaTick);
    else if (n === 1) dialogo([C('¡Mamá! ...cinco minutitos más... zzz'), S(), T('Cortex dice cosas raras cuando duerme.')], bombaTick);
    else if (n === 2) dialogo([{ q: 'CORTEX', t: '*abraza a Simon creyendo que es una almohada*', fn: () => { corazones(3); sfx.regalo(); gesto('besos'); } }, S(), T('Me aprieta mucho. Pero está bien.'), C('Qué suave... zzz')], bombaTick);
    else {
      dialogo([{ q: 'CORTEX', t: '¡¿Quién me toca?! ...Ah. Eran ustedes.', pre: () => { desc.zzz = false; bm = { fase: 'adios', t: 0 }; bombaTick(); } }, C('Me quedé dormido... ¿tenía baba en la mejilla?'), S(), T('Un poquito.'), C('Jaja. Gracias por dejarme dormir. Hasta pronto.')], () => cortexSale(finDesc));
    }
  }
  // (LV_MEM definido en dialogos.js)

  // (LV_RESP definido en dialogos.js)
  function checkMem() {
    if (!e.memPend.length || !eventoLibre(EV_MEMR)) return;
    const n = e.memPend.shift(); guardar();
    dialogo([C('¡Me llegó la noticia: Simon subió al nivel ' + n + '!'), C(LV_MEM[n] || 'Cada día que pasa, lo quiero más.'), S(), T(elige(LV_RESP))]);
  }

  /* ===================== CORTEX COMERCIANTE ===================== */
  // (MERC_VENT, MERC_AVISO definidos en config.js)
  let mercPres = false, mercBusy = false, visPend = false;
  const dormCx = () => !!(desc && !mercPres && (desc.zzz || (!bm && !dlg)));
  const tempCx = () => introActiva ? null : temporada();
  const cortexClave = () => mercPres ? 'cortexM' : 'cortex' + (tempCx() || '') + (hollin ? (hollin === 'crema' ? 'C' : 'H') : '') + (dormCx() ? 'Z' : '');
  const cortexG = () => cortexGrid(mercPres, mercPres ? null : tempCx(), hollin, dormCx());
  const mmss = ms => { ms = Math.max(0, Math.ceil(ms / 1000)); return String(Math.floor(ms / 60)).padStart(2, '0') + ':' + String(ms % 60).padStart(2, '0'); };
// (hashStr definido en engine.js)
  // una vez al día, a una hora distinta (entre las 10:00 y las 21:30)
  function mercInfo() {
    const h = hoy();
    if (!e.merc || e.merc.dia !== h) e.merc = { dia: h, compras: {}, aviso: false, adios: false };
    if (admin && admMerc) { const t = ahora(); return { est: t >= admMerc + MERC_VENT ? 'fin' : 'aqui', llega: admMerc, fin: admMerc + MERC_VENT, t }; }
    const [Y, M, D] = h.split('-').map(Number);
    const llega = new Date(Y, M - 1, D, 10, 0, 0).getTime() + (hashStr('cortex' + h) % 691) * 60000, t = ahora();
    const est = t >= llega + MERC_VENT ? 'fin' : t >= llega ? 'aqui' : t >= llega - MERC_AVISO ? 'aviso' : 'espera';
    return { est, llega, fin: llega + MERC_VENT, t };
  }
  function ofertasHoy() {
    const h = hoy();
    const t = temporada(), ok = k => !e.tiene[k] || e.merc.compras[k], ord = (a, b) => hashStr(h + a) - hashStr(h + b);
    const de = Object.keys(ITEMS).filter(k => ITEMS[k].temp && ITEMS[k].temp === t).sort(ord).filter(ok);
    const elegible = k => ok(k) && nivel() >= (ITEMS[k].nv || 1);
    const raro = MERC_POOL.filter(k => ITEMS[k].raro5 && elegible(k) && (hashStr('r5_' + h + k) % 100) < 5);   // objetos rarísimos: 5% de probabilidad cada día, aparte pero sin saltarse el cupo normal
    const reg = raro.concat(MERC_POOL.filter(k => !ITEMS[k].raro5).sort(ord).filter(elegible));
    return de.slice(0, 1).concat(reg).slice(0, 3);
  }
  function bolsaGrid(est) {
    const g = Grid(14, 13);
    capa(g, '#2a1408', L => sombrear(L, elipse(7, 8, 5.5, 4.5), 7, 8, 5.5, 4.5, ['#f0c088', '#c8884a', '#8a5424', '#4a2a10']));
    g.rect(5, 2, 4, 2, '#d8a020'); g.rect(4, 1, 2, 2, '#8a5424'); g.rect(8, 1, 2, 2, '#8a5424');
    g.set(6, 8, '#ffd84a'); g.set(7, 8, '#ffd84a'); g.set(6, 7, '#fff6b0');
    if (est === 'fin') for (let y = 0; y < 13; y++) for (let x = 0; x < 14; x++) if (g.has(x, y)) { const i = (y * 14 + x) * 4, v = Math.round((g.d[i] + g.d[i + 1] + g.d[i + 2]) / 3); g.d[i] = g.d[i + 1] = v; g.d[i + 2] = v + 10; }
    return g;
  }
  function presencia() {
    if (!(mercPres || desc) || mercBusy || dlg || cortex.dir || bm) return;
    const sala = escenaId() === 'sala' && !lugar;
    if (!sala) { if (cortex.p) { cortex.p = 0; bombaTick(); } if (desc && ahora() >= desc.fin) finDesc(); }
    else if (!cortex.p && !modal) { cortex.p = 1; bombaTick(); }
  }
  function mercTick() {
    const ch = $('t-cortex');
    if (!e.intro || introActiva) { ch.classList.add('oculto'); return; }
    const I = mercInfo();
    presencia();
    if (desc && !mercPres) {
      ch.classList.remove('oculto', 'gris', 'lista'); $('v-cortex').textContent = (desc.siesta ? 'SIESTA ' : 'DESCANSA ') + mmss(desc.fin - ahora());
      dibIcono($('ic-cortex'), 'ic_zz', FX.z); return;
    }
    ch.classList.toggle('oculto', (I.est === 'espera' || I.est === 'fin') && !mercPres);
    ch.classList.toggle('gris', I.est === 'fin' && !mercPres);
    ch.classList.toggle('lista', I.est === 'aqui');
    $('v-cortex').textContent = I.est === 'aviso' ? 'CORTEX ' + fmt(I.llega - I.t) : I.est === 'aqui' ? '¡AQUÍ! ' + mmss(I.fin - I.t) : '';
    dibIcono($('ic-cortex'), 'bolsa' + (I.est === 'fin' ? 'x' : 'o'), () => bolsaGrid(I.est));
    const el = $('mc-t'); if (el) el.textContent = 'QUEDAN ' + mmss(I.fin - I.t);
    if (I.est === 'aviso' && !e.merc.aviso) {
      e.merc.aviso = true; guardar(); sfx.nivel();
      toast('¡Cortex vendrá a comerciar en ' + Math.max(1, Math.round((I.llega - I.t) / 60000)) + ' min!');
    }
    if (I.est === 'aqui' && escenaId() === 'sala' && !cambiando && !lugar && !mercPres && !mercBusy && !dlg && !cortex.dir && !cortex.p && !modal) {
      mercBusy = true; act = null; mercPres = true; notificar('Cortex llegó de comerciante. Se queda 15 minutos.');
      const resto = Math.max(1, Math.round((I.fin - I.t) / 60000)), fresco = I.t - I.llega < 90000;
      cortexEntra(() => { mercBusy = false; dialogo(fresco ? DIALOGOS.comerciante.llegadaFresca() : DIALOGOS.comerciante.llegadaTarde(resto), () => abrir('comercio')); });
    }
    presencia();
    if (I.est === 'aqui' && !mercPres && !e.merc.notif && !(escenaId() === 'sala' && !lugar)) { e.merc.notif = true; notificar('Cortex llegó de comerciante. Te espera en la recámara.'); }
    if (I.est !== 'aqui' && mercPres && !mercBusy && !dlg && !(escenaId() === 'sala' && !lugar)) {
      mercPres = false; cortex.p = 0; cortex.dir = 0; e.merc.adios = true; guardar();
    }
    if (I.est !== 'aqui' && mercPres && !mercBusy && !dlg) {
      mercBusy = true; if (modal) cerrar();
      dialogo(DIALOGOS.comerciante.despedida(), () => cortexSale(() => { mercPres = false; mercBusy = false; e.merc.adios = true; guardar(); }));
    }
  }
  function comprarMerc(k) {
    const I = mercInfo(), it = ITEMS[k];
    if (I.est !== 'aqui' || e.merc.compras[k] || e.tiene[k] || !ofertasHoy().includes(k)) return;
    if (e.monedas < it.p) { faltanMon(it.p - e.monedas); sfx.no(); return; }
    if (!Object.keys(e.merc.compras).length) e.st.tratos++;
    e.monedas -= it.p; animarMonedas(it.p, true); e.tiene[k] = 1; e.merc.compras[k] = 1; e.st.compras++; equipar(k);
    toast('CORTEX: ¡Buena elección!'); sfx.compra(); gesto('besos'); hablar(); pintar(); guardar(); render();
  }
  $('t-cortex').onclick = () => {
    const I = mercInfo(); sfx.click();
    if (desc && !mercPres) { toast(escenaId() === 'sala' && !lugar ? 'Cortex está descansando' : 'Cortex descansa en la recámara'); return; }
    if (I.est === 'aqui' && mercPres && !dlg) { if (escenaId() === 'sala' && !lugar) abrir('comercio'); else toast('Cortex te espera en la recámara'); }
    else if (I.est === 'aviso') toast('Cortex llega en ' + fmt(I.llega - I.t));
    else if (I.est === 'fin') toast('Cortex volverá mañana, a otra hora.');
  };

  /* ===================== MÚSICA Y CÁMARA ===================== */
  const PASO = .27;
  const MUS_ACORDES = [
    [48, [76, 0, 79, 0, 76, 74, 72, 0]], [45, [72, 0, 76, 0, 81, 0, 79, 76]], [41, [77, 0, 81, 0, 77, 76, 74, 0]], [43, [74, 0, 79, 0, 83, 0, 79, 74]],
    [45, [81, 0, 79, 76, 72, 0, 76, 0]], [41, [77, 0, 74, 77, 81, 0, 77, 0]], [48, [79, 0, 76, 72, 76, 0, 79, 0]], [43, [83, 0, 79, 74, 79, 0, 74, 0]]
  ];
  let mus = null;
  var hz = typeof hz !== 'undefined' ? hz : (n => 440 * Math.pow(2, (n - 69) / 12));
  function notaM(f, dur, t, tipo, vol) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = tipo; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(vol, t); g.gain.setValueAtTime(vol, t + dur * .5); g.gain.linearRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(mus.g); o.start(t); o.stop(t + dur + .02);
  }
  const TEMAS_MUS = {
    lofi: { lofi: true, ac: MUS_ACORDES, paso: .36, lead: 'sine', vl: .03 },
    dia: { ac: MUS_ACORDES, paso: .27, lead: 'square', vl: .018 },
    parque: { ac: MUS_ACORDES, paso: .21, lead: 'square', vl: .02 },
    noche: { ac: [[48, [72, 0, 0, 0, 76, 0, 0, 0]], [45, [69, 0, 0, 0, 72, 0, 0, 0]], [41, [65, 0, 0, 0, 69, 0, 72, 0]], [43, [67, 0, 0, 0, 71, 0, 74, 0]]], paso: .4, lead: 'triangle', vl: .05 },
    bano: { ac: [[48, [88, 0, 0, 86, 0, 84, 0, 79]], [45, [85, 0, 0, 88, 0, 91, 0, 0]], [50, [86, 0, 0, 84, 0, 81, 0, 77]], [43, [83, 0, 0, 86, 0, 89, 0, 86]], [48, [84, 0, 0, 88, 0, 91, 0, 88]], [45, [88, 0, 85, 0, 81, 0, 85, 0]], [50, [89, 0, 0, 86, 0, 84, 0, 81]], [43, [83, 0, 86, 0, 83, 0, 0, 0]]], paso: .2, lead: 'triangle', vl: .05 },
    cocina: { ac: [[43, [79, 81, 83, 0, 79, 0, 76, 0]], [48, [76, 0, 79, 0, 84, 0, 79, 0]], [50, [78, 0, 81, 78, 86, 0, 81, 0]], [43, [83, 0, 79, 83, 86, 0, 83, 0]]], paso: .2, lead: 'square', vl: .016 },
    chef: { ac: [[48, [79, 0, 76, 79, 84, 0, 79, 76]], [41, [81, 0, 77, 81, 84, 0, 81, 77]], [43, [83, 0, 79, 83, 86, 0, 83, 79]], [48, [84, 0, 79, 76, 72, 0, 76, 79]], [45, [81, 0, 76, 81, 84, 0, 81, 76]], [50, [77, 0, 74, 77, 81, 0, 77, 74]], [43, [79, 0, 83, 86, 83, 0, 79, 74]], [48, [72, 0, 76, 79, 84, 0, 0, 0]]], paso: .15, lead: 'sawtooth', vl: .013 },
    sif: { ac: [[48, [76, 0, 79, 76, 84, 0, 79, 0]], [43, [79, 0, 83, 79, 86, 0, 83, 0]], [45, [81, 0, 84, 81, 88, 0, 84, 0]], [41, [77, 79, 81, 0, 84, 0, 81, 77]], [48, [84, 0, 79, 84, 88, 0, 84, 0]], [43, [83, 86, 0, 83, 91, 0, 86, 0]], [41, [84, 0, 81, 84, 89, 0, 84, 81]], [43, [79, 83, 86, 0, 91, 0, 0, 0]]], paso: .16, lead: 'square', vl: .022 },
    estudio: { lofi: true, ac: MUS_ACORDES, paso: .46, lead: 'sine', vl: .02 },
    juegos: { arcade: true, ac: [[45, [88, 0, 84, 0, 81, 0, 84, 88]], [41, [84, 0, 81, 0, 77, 0, 81, 84]], [48, [91, 0, 88, 0, 84, 0, 88, 91]], [43, [86, 0, 83, 0, 79, 0, 83, 86]]], paso: .13, lead: 'square', vl: .02 },
    entrada: { ac: [[45, [81, 0, 84, 81, 88, 0, 84, 0]], [41, [77, 0, 81, 77, 84, 0, 81, 0]], [48, [79, 0, 84, 79, 88, 0, 84, 79]], [43, [83, 0, 79, 74, 79, 0, 74, 0]]], paso: .24, lead: 'sawtooth', vl: .01 },
    dormir: { ac: [[48, [76, 0, 79, 0, 81, 0, 79, 0]], [41, [77, 0, 81, 0, 84, 0, 81, 0]], [43, [79, 0, 83, 0, 86, 0, 83, 0]], [48, [84, 0, 81, 0, 79, 0, 76, 0]], [45, [81, 0, 84, 0, 81, 0, 79, 0]], [41, [77, 0, 0, 0, 81, 0, 77, 0]], [43, [79, 0, 77, 0, 76, 0, 74, 0]], [48, [72, 0, 0, 0, 0, 0, 0, 0]]], paso: .5, lead: 'sine', vl: .07 },
    calle: { ac: [[45, [76, 0, 74, 0, 72, 0, 69, 0]], [41, [77, 0, 76, 0, 72, 0, 69, 0]], [48, [76, 0, 72, 0, 67, 0, 64, 0]], [40, [71, 0, 68, 0, 64, 0, 0, 0]]], paso: .52, lead: 'triangle', vl: .055 },
    feliz: { ac: [[48, [72, 76, 79, 76, 84, 79, 76, 72]], [43, [71, 74, 79, 74, 83, 79, 74, 71]], [45, [69, 72, 76, 72, 81, 76, 72, 69]], [41, [77, 81, 84, 81, 77, 72, 77, 81]]], paso: .17, lead: 'square', vl: .022 },
    luna: { ac: [[48, [84, 0, 0, 88, 0, 0, 91, 0]], [45, [88, 0, 0, 91, 0, 0, 95, 0]], [41, [84, 0, 0, 89, 0, 0, 93, 0]], [43, [86, 0, 0, 91, 0, 0, 94, 0]]], paso: .42, lead: 'sine', vl: .045 },
    sangre: { ac: [[40, [64, 0, 0, 0, 67, 0, 0, 0]], [41, [65, 0, 0, 0, 68, 0, 0, 0]], [38, [62, 0, 0, 0, 65, 0, 0, 59]], [40, [64, 0, 0, 0, 63, 0, 0, 0]]], paso: .55, lead: 'triangle', vl: .05 },
    alien: { ac: [[46, [82, 0, 84, 0, 86, 0, 88, 0]], [46, [88, 0, 86, 84, 0, 82, 0, 0]], [47, [83, 0, 85, 0, 87, 0, 89, 0]], [47, [89, 0, 87, 0, 85, 83, 0, 0]]], paso: .2, lead: 'sawtooth', vl: .014 },
    tormenta: { ac: [[45, [69, 0, 0, 72, 0, 0, 76, 0]], [41, [65, 0, 0, 69, 0, 0, 72, 0]], [43, [67, 0, 0, 71, 0, 0, 74, 0]], [40, [64, 0, 0, 67, 0, 0, 71, 0]]], paso: .46, lead: 'triangle', vl: .05 }
  };
  function temaMus() {
    if (calle) return 'calle'; if (introActiva) return 'feliz'; if (cg) return 'chef'; if (sifP || sifAm) return 'sif';
    if (bl) return 'sangre';
    if (ov) return ['entra', 'camina', 'casco', 'da', 'premio', 'sale'].includes(ov.f) ? 'alien' : 'luna';
    if (e.dormido) return 'dormir';
    if (e.sangFase === 1 && escenaId() === 'sala') return 'sangre';
    if (lunaDorada()) return 'luna';
    if (escenaId() === 'sala' && !ov && lunaSangreT()) return 'sangre';
    if (clima() === 'tormenta') return 'tormenta';
    const sc = escenaId(); if (sc === 'bano') return 'bano'; if (sc === 'cocina') return 'cocina'; if (sc === 'estudio') return 'estudio'; if (sc === 'juegos') return 'juegos'; if (sc === 'entrada') return 'entrada'; if (sc === 'parque') return 'parque';
    return esNoche() ? 'noche' : 'lofi';
  }
  /* --- lofi: acordes con séptima, piano suave, bajo, bombo flojito, platillo y crujido de vinilo --- */
  const LOFI = [{ r: 48, n: [0, 4, 7, 11] }, { r: 45, n: [0, 3, 7, 10] }, { r: 50, n: [0, 3, 7, 10] }, { r: 43, n: [0, 4, 7, 10] }, { r: 41, n: [0, 4, 7, 11] }, { r: 40, n: [0, 3, 7, 10] }, { r: 50, n: [0, 3, 7, 10] }, { r: 43, n: [0, 4, 7, 10] }];
  let ruidoL = null;
  function notaL(f, dur, t, tipo, vol, atk) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = tipo; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + (atk || .02)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(mus.g); o.start(t); o.stop(t + dur + .05);
  }
  function percL(tipo, t, vol, dur) {
    if (!ruidoL) { ruidoL = ac.createBuffer(1, ac.sampleRate, ac.sampleRate); const x = ruidoL.getChannelData(0); for (let i = 0; i < x.length; i++) x[i] = Math.random() * 2 - 1; }
    const sr = ac.createBufferSource(); sr.buffer = ruidoL; const fl = ac.createBiquadFilter(), g = ac.createGain();
    fl.type = tipo === 'hat' ? 'highpass' : 'bandpass'; fl.frequency.value = tipo === 'hat' ? 7500 : tipo === 'clap' ? 1700 : 4000; fl.Q.value = .7;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    sr.connect(fl); fl.connect(g); g.connect(mus.g); sr.start(t, Math.random() * .5); sr.stop(t + dur + .02);
  }
  function kickL(t, vol) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(42, t + .12);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + .2);
    o.connect(g); g.connect(mus.g); o.start(t); o.stop(t + .25);
  }
  function pasoLofi(p, t0, PS) {
    const i = p % 8, C = LOFI[Math.floor(p / 8) % LOFI.length], t = t0 + (i % 2 ? PS * .2 : 0);   // swing
    if (i === 0) C.n.forEach((n, k) => notaL(hz(C.r + 12 + n), PS * 7, t + k * .012, 'sine', .02, .09));
    if (i === 5) C.n.slice(1).forEach((n, k) => notaL(hz(C.r + 12 + n), PS * 2.5, t + k * .01, 'triangle', .008, .03));
    if (i === 0) notaL(hz(C.r), PS * 3.2, t, 'sine', .1, .02);
    if (i === 5 && (p >> 3) % 2 === 0) notaL(hz(C.r + 7), PS * 2, t, 'sine', .06, .02);
    if ([2, 3, 6, 7].includes(i) && Math.random() < .42) { const n = C.n[Math.floor(Math.random() * 4)] + (Math.random() < .35 ? 12 : 0); notaL(hz(C.r + 24 + n), PS * 2.4, t, 'triangle', .022, .015); }
    if (i === 0 || i === 5) kickL(t, i === 0 ? .2 : .12);
    if (i === 4) percL('clap', t, .05, .14);
    percL('hat', t, (i % 2 ? .012 : .02), .035);
    if (Math.random() < .1) percL('crujido', t + Math.random() * PS, .01, .012);
  }
  function planearMusica() {
    if (!mus) return;
    mus.g.gain.value = e.dormido ? .4 : mus.tn === 'estudio' ? .95 * Math.pow((e.estMus === undefined ? 50 : e.estMus) / 50, 1.4) : .6;
    while (mus.t < ac.currentTime + .5) {
      { const nt = temaMus(); if (nt !== mus.tn) { mus.tn = nt; mus.paso = 0; mus.f.frequency.value = (TEMAS_MUS[nt] || {}).lofi ? 2600 : 18000; } }
      const T = TEMAS_MUS[mus.tn] || TEMAS_MUS.dia, p = mus.paso, ac8 = T.ac[Math.floor(p / 8) % T.ac.length], i = p % 8, t = mus.t, PS = T.paso;
      if (T.lofi) { pasoLofi(p, t, PS); mus.t += PS; mus.paso++; continue; }
      const lead = ac8[1][i], r = ac8[0];
      if (lead) notaM(hz(lead), PS * 1.7, t, T.lead, T.vl);
      const bajo = [r, 0, r + 7, 0, r + 12, 0, r + 7, 0][i];
      if (bajo) notaM(hz(bajo), PS * 1.5, t, 'triangle', .07);
      if (T.arcade) {   // arcade: bajo saltarín, arpegio, bombo, palmada y hi-hat
        if (i % 2) notaM(hz(r + 12), PS * .7, t, 'square', .012);
        const tercera = ac8[0] === 45 ? 3 : 4; if (i % 2) notaM(hz(r + 24 + [0, tercera, 7, 12][(i >> 1) % 4]), PS * .6, t, 'square', .009);
        if (i === 0 || i === 4 || (i === 6 && (p >> 3) % 2)) kickL(t, .09);
        if (i === 2 || i === 6) percL('clap', t, .05, .08);
        percL('hat', t, i % 2 ? .014 : .024, .035);
      }
      if (mus.tn === 'dormir' && i === 0) notaM(hz(r + 36), PS * 3, t, 'sine', .012);   // campanita suave
      if (mus.tn !== 'luna' && mus.tn !== 'sangre' && mus.tn !== 'alien' && mus.tn !== 'noche' && mus.tn !== 'tormenta' && mus.tn !== 'dormir' && mus.tn !== 'calle' && (i === 0 || i === 4)) notaM(hz(r + 24), PS * .6, t, 'square', .006);
      mus.t += PS; mus.paso++;
    }
  }
  /* ===================== SONIDO DE LLUVIA, TORMENTA Y NIEVE ===================== */
  let llu = null, ruidoBuf = null;
  function lluviaOff() {
    if (!llu) return; const L = llu; llu = null;
    try { L.g.gain.cancelScheduledValues(ac.currentTime); L.g.gain.setValueAtTime(L.g.gain.value, ac.currentTime); L.g.gain.linearRampToValueAtTime(0, ac.currentTime + .5); } catch (_) {}
    setTimeout(() => { L.nodes.forEach(n => { try { n.stop(); } catch (_) {} }); try { L.g.disconnect(); } catch (_) {} }, 700);
  }
  const hayVentana = () => calle || lugar === 'parque' || ['sala', 'cocina', 'estudio'].includes(e.hab);   // el clima solo se oye afuera o en cuartos con ventana
  function lluviaCheck() {
    estSndCheck(); if (es) { lluviaOff(); return; }
    const c = calle ? 'lluvia' : clima(), quiere = !e.mudo && !document.hidden && !rt && hayVentana() && ['lluvia', 'tormenta', 'nieve', 'cafe'].includes(c) && audio();
    if (!quiere) { lluviaOff(); return; }
    const vol = (c === 'cafe' ? .035 : c === 'lluvia' ? .03 : c === 'tormenta' ? .05 : .012) * (e.dormido ? .6 : 1);
    if (llu && llu.modo === c) { try { llu.g.gain.setTargetAtTime(vol, ac.currentTime, .5); } catch (_) {} return; }
    lluviaOff();
    if (!ruidoBuf) { const n = ac.sampleRate * 2; ruidoBuf = ac.createBuffer(1, n, ac.sampleRate); const x = ruidoBuf.getChannelData(0); for (let i = 0; i < n; i++) x[i] = Math.random() * 2 - 1; }
    const g = ac.createGain(); g.gain.value = 0; g.connect(ac.destination); const nodes = [];
    const mk = (tipo, f, q, vol) => { const sr = ac.createBufferSource(); sr.buffer = ruidoBuf; sr.loop = true; sr.loopStart = Math.random(); const fl = ac.createBiquadFilter(); fl.type = tipo; fl.frequency.value = f; fl.Q.value = q; const gg = ac.createGain(); gg.gain.value = vol; sr.connect(fl); fl.connect(gg); gg.connect(g); sr.start(); nodes.push(sr); return gg; };
    if (c === 'lluvia' || c === 'tormenta') { mk('bandpass', 2600, .6, 1); mk('highpass', 5200, .5, .35); }
    if (c === 'cafe') { mk('bandpass', 620, .5, 1.3); mk('lowpass', 1500, .4, .6); }
    if (c === 'tormenta' || c === 'nieve') {   // viento que sube y baja despacio
      const w = mk('lowpass', c === 'nieve' ? 520 : 420, .7, .6), lfo = ac.createOscillator(), lg = ac.createGain();
      lfo.frequency.value = .12; lg.gain.value = .5; lfo.connect(lg); lg.connect(w.gain); lfo.start(); nodes.push(lfo);
    }
    g.gain.linearRampToValueAtTime(vol, ac.currentTime + 1.5);
    llu = { g, nodes, modo: c };
  }
  /* ===================== AMBIENTE DEL ESTUDIO: lluvia, tormenta y café ===================== */
  let es = null, estRayo = 0;
  function estSndOff() {
    if (!es) return; const E = es; es = null; clearInterval(E.timer); clearTimeout(E.tt);
    try { E.g.gain.cancelScheduledValues(ac.currentTime); E.g.gain.setValueAtTime(E.g.gain.value, ac.currentTime); E.g.gain.linearRampToValueAtTime(0, ac.currentTime + .6); } catch (_) {}
    setTimeout(() => { E.nodes.forEach(n => { try { n.stop(); } catch (_) {} }); try { E.g.disconnect(); } catch (_) {} }, 800);
  }
  let estBufs = null;
  function estBuffers() {
    if (estBufs) return estBufs; const sr = ac.sampleRate, n = sr * 5;
    const mk = (kind) => { const b = ac.createBuffer(2, n, sr); for (let c = 0; c < 2; c++) { const x = b.getChannelData(c); let b0 = 0, b1 = 0, b2 = 0, br = 0; for (let i = 0; i < n; i++) { const w = Math.random() * 2 - 1; if (kind === 'pink') { b0 = .99765 * b0 + w * .099046; b1 = .963 * b1 + w * .2965164; b2 = .57 * b2 + w * 1.0526913; x[i] = (b0 + b1 + b2 + w * .1848) * .22; } else if (kind === 'brown') { br = (br + .02 * w) / 1.02; x[i] = br * 3.2; } else x[i] = w; } } return b; };
    const drop = ac.createBuffer(1, Math.floor(sr * .08), sr); const d = drop.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    estBufs = { pink: mk('pink'), brown: mk('brown'), white: mk('white'), drop }; return estBufs;
  }
  function estAmbActivo() { if (escenaId() !== 'estudio' || !e.estAmb) return ''; return e.est || modal === 'estudio' ? e.estAmb : ''; }
  function estFactor() { const v = e.estVol === undefined ? 50 : e.estVol; return Math.pow(v / 50, 1.6); }
  function estSndApply() { if (!es) return; try { es.g.gain.setTargetAtTime(es.base * estFactor(), ac.currentTime, .1); es.th.gain.value = estFactor(); } catch (_) {} }
  function estSndCheck() {
    if (e.estAmb === 'cafe') e.estAmb = '';
    const tipo = estAmbActivo();
    if (!tipo || e.mudo || document.hidden || rt || !audio()) { estSndOff(); return; }
    if (es && es.tipo === tipo) return;
    estSndOff();
    const B = estBuffers(), nodes = [], g = ac.createGain(); g.gain.value = 0; g.connect(ac.destination);
    const mod = ac.createGain(); mod.gain.value = 1; mod.connect(g);
    const capa = (buf, tipoF, f, q, vol) => { const sr = ac.createBufferSource(); sr.buffer = buf; sr.loop = true; sr.loopStart = Math.random() * 2; const fl = ac.createBiquadFilter(); fl.type = tipoF; fl.frequency.value = f; fl.Q.value = q; const gg = ac.createGain(); gg.gain.value = vol; sr.connect(fl); fl.connect(gg); gg.connect(mod); sr.start(0, Math.random() * 2); nodes.push(sr); return gg; };
    const lfo = (f, prof) => { const o = ac.createOscillator(), lg = ac.createGain(); o.frequency.value = f; lg.gain.value = prof; o.connect(lg); lg.connect(mod.gain); o.start(); nodes.push(o); };
    const th = ac.createGain(); th.connect(ac.destination);
    const E = { tipo, g, th, nodes, timer: 0, tt: 0 }; let vol;
    const gota = (v, grave) => {   // una gotita suelta: golpecito corto de ruido filtrado con posición aleatoria
      const t = ac.currentTime + Math.random() * .08, sr = ac.createBufferSource(); sr.buffer = B.drop; const fl = ac.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.value = (grave ? 900 : 1800) + Math.random() * (grave ? 2200 : 4800); fl.Q.value = 2 + Math.random() * 6;
      const gg = ac.createGain(); gg.gain.setValueAtTime(v * (.25 + Math.random() * .75), t); gg.gain.exponentialRampToValueAtTime(.0001, t + .025 + Math.random() * .05);
      sr.connect(fl); fl.connect(gg); let sal = gg; if (ac.createStereoPanner) { const pn = ac.createStereoPanner(); pn.pan.value = Math.random() * 1.6 - .8; gg.connect(pn); sal = pn; } sal.connect(g); sr.start(t, Math.random() * .02); sr.stop(t + .1);
      if (Math.random() < .08) { const o = ac.createOscillator(), og = ac.createGain(); o.type = 'sine'; o.frequency.value = 2400 + Math.random() * 2400; og.gain.setValueAtTime(v * .12, t); og.gain.exponentialRampToValueAtTime(.0001, t + .05); o.connect(og); og.connect(g); o.start(t); o.stop(t + .08); }
    };
    if (tipo === 'lluvia' || tipo === 'tormenta') {
      const T = tipo === 'tormenta'; vol = T ? .32 : .34;
      capa(B.pink, 'bandpass', T ? 1500 : 1900, .45, 1);
      capa(B.white, 'highpass', 6200, .4, T ? .1 : .07);
      capa(B.brown, 'lowpass', 320, .6, T ? 1.1 : .55);
      lfo(.07, T ? .18 : .1); lfo(.19, .05);
      E.timer = setInterval(() => { const n = Math.random() < (T ? .8 : .55) ? 1 + (Math.random() < (T ? .6 : .3) ? 1 : 0) : 0; for (let i = 0; i < n; i++) gota(T ? .1 : .085, T); }, 70);
      if (T) {
        if (!ac.__v) ac.__v = 1;
        const trueno = () => {
          if (!es || es !== E) return;
          const t0 = ac.currentTime, crack = Math.random() < .6, dl = crack ? .05 + Math.random() * .5 : 0, dur = 3.2 + Math.random() * 3.2;
          if (crack) { const sr = ac.createBufferSource(); sr.buffer = B.white; const fl = ac.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.value = 1400; fl.Q.value = .5; const gg = ac.createGain(); gg.gain.setValueAtTime(.0001, t0); gg.gain.exponentialRampToValueAtTime(.3, t0 + .008); gg.gain.exponentialRampToValueAtTime(.0001, t0 + .35); sr.connect(fl); fl.connect(gg); gg.connect(th); sr.start(t0); sr.stop(t0 + .5); estRayo = 5; setTimeout(() => { estRayo = 3; }, 140); setTimeout(() => { estRayo = 4; }, 260); }
          const sr = ac.createBufferSource(); sr.buffer = B.brown; sr.loop = true; const fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.Q.value = .8; fl.frequency.setValueAtTime(380, t0 + dl); fl.frequency.exponentialRampToValueAtTime(70, t0 + dl + dur);
          const gg = ac.createGain(); gg.gain.setValueAtTime(.0001, t0 + dl); gg.gain.linearRampToValueAtTime(.7, t0 + dl + .35); gg.gain.setTargetAtTime(.0001, t0 + dl + .6, dur / 4);
          const tr = ac.createOscillator(), tg = ac.createGain(); tr.frequency.value = 5 + Math.random() * 4; tg.gain.value = .25; tr.connect(tg); tg.connect(gg.gain);
          sr.connect(fl); fl.connect(gg); gg.connect(th); sr.start(t0 + dl, Math.random() * 3); tr.start(t0 + dl); sr.stop(t0 + dl + dur + 1); tr.stop(t0 + dl + dur + 1);
          E.tt = setTimeout(trueno, 9000 + Math.random() * 18000);
        };
        E.tt = setTimeout(trueno, 3500 + Math.random() * 4000);
      }
    }
    E.base = vol; E.th.gain.value = estFactor(); g.gain.linearRampToValueAtTime(vol * estFactor(), ac.currentTime + 2); es = E;
  }
  /* ===================== SONIDOS AMBIENTE (por lugar y hora) ===================== */
  let ambProx = Date.now() + 15000;
  function ambiente() {
    if (e.mudo || document.hidden || modal || mj || rt || !e.intro || Date.now() < ambProx) return;
    if (Math.random() > .5) { ambProx = Date.now() + 8000; return; }
    ambProx = Date.now() + 22000 + Math.random() * 20000;
    const h = new Date(ahora()).getHours(), sc = escenaId(), cl = clima(), noche = h >= 19 || h < 6;
    if (sc === 'cocina') { Math.random() < .5 ? seq([1760, 2349], .09, 'triangle', .035) : seq([220, 262, 247, 330, 294], .08, 'sine', .03); return; }
    if (cl === 'lluvia' || cl === 'tormenta' || cl === 'nieve') return;
    if (noche) { if ((sc === 'entrada' || sc === 'parque') && Math.random() < .6) seq([392, 0, 330, 0, 0, 330], .3, 'sine', .03); return; }   // de noche solo un búho lejano, sin pitidos
    seq([2600, 3100, 2800], .09, 'sine', .014);
  }
  function musicaOff() { if (!mus) return; clearInterval(mus.timer); try { mus.g.disconnect(); mus.f.disconnect(); } catch (_) {} mus = null; }
  function musicaOn() {
    if (!e.musica || document.hidden) { musicaOff(); return; }
    if (mus || !audio()) return;
    mus = { g: ac.createGain(), f: ac.createBiquadFilter(), paso: 0, t: ac.currentTime + .15, timer: 0, tn: '' };
    mus.f.type = 'lowpass'; mus.f.frequency.value = 18000; mus.g.connect(mus.f); mus.f.connect(ac.destination);
    planearMusica(); mus.timer = setInterval(planearMusica, 150);
  }
  function iconoMus() {
    const g = Grid(11, 11);
    g.rect(5, 1, 1, 8, '#e8ecff'); g.rect(5, 1, 4, 2, '#e8ecff'); g.rect(8, 3, 1, 2, '#e8ecff');
    capa(g, null, L => sombrear(L, elipse(3.5, 8.5, 2.6, 2.2), 3.5, 8.5, 2.6, 2.2, ['#ffffff', '#e8ecff', '#b8c0e8', '#8a94d8']));
    if (!e.musica) for (let i = 0; i <= 10; i++) { g.set(i, i, '#ff4a5a'); g.set(i + 1, i, '#ff4a5a'); }
    return g;
  }
  function iconoCam() {
    const g = Grid(13, 11);
    g.rect(0, 3, 13, 8, '#e8ecff'); g.rect(0, 3, 13, 1, '#ffffff'); g.rect(4, 1, 5, 2, '#e8ecff'); g.rect(0, 10, 13, 1, '#8a94d8');
    capa(g, null, L => sombrear(L, elipse(6.5, 7, 3.2, 3.2), 6.5, 7, 3.2, 3.2, ['#8a94d8', '#3a47a8', '#232b63', '#0f1230']));
    g.set(5, 6, '#e8ecff'); g.rect(10, 4, 2, 1, '#ff4a5a');
    return g;
  }
  const ICB = {
    comer: ['....rr......','...rhr......','.wwwwwwwwww.','wwWwwwwwWwww','wwwwwwwwwwww','yyyyyyyyyyyy','yYyyyyyyyyYy','pppppppppppp','yyyyyyyyyyyy','yYyyyyyyyyYy','oooooooooooo','............'],
    luna: ['....yyyy....','..yyYYyy....','.yyY........','.yY.........','yyY.....z...','yyY.........','yyY.........','yyYY........','.yyYY....z..','.yyyYYYYY...','..yyyyyyy...','....yyyy....'],
    jugar: ['....kkkk....','..kkrrrrkk..','.krrwwrrrrk.','.krwrrrrrrk.','kkkkkkkkkkkk','kwwwwwwwwwwk','kwwwwwwwwwwk','kkkkkkkkkkkk','.krrrrrrrrk.','.krrrrrrrrk.','..kkrrrrkk..','....kkkk....'],
    tienda: ['....ddd.....','...dyyyd....','....ddd.....','..dyyyyyd...','.dyyYyyyyd..','dyyyYYyyyyd.','dyyyyYyyyyd.','dyyyYYyyyyd.','dyyyyYyyyyd.','.dyyyyyyyd..','..ddddddd...','............'],
    dice: ['....r..r....','...rrrrrr...','..kkkkkkkk..','.kwwwwwwwwk.','kwqwqwwqwqwk','kwqqqwwqqqwk','kwqqqwwqqqwk','kpwwkwwkwwpk','.kwwwkkwwwk.','..kwwwwwwk..','...kkkkkk...','............'],
    logros: ['yyyyyyyyyyyy','yYyyyyyyyyYy','yYyyyyyyyyYy','.yYyyyyyyYy.','..yYyyyyYy..','...yyyyyy...','....yYYy....','.....yy.....','.....yy.....','....yyyy....','...yYYYYy...','...yyyyyy...'],
    inv: ['............','...kkkkk....','..kwwwwwk...','..kwkkkwk...','.kwwwwwwwk..','kwwwkkkwwwk.','kwwkyyykwwk.','kwwwwwwwwwk.','kwwwkkkwwwk.','kwwwwwwwwwk.','.kwwwwwwwk..','..kkkkkkk...']
  };
  const ICPAL = { p:'#ff7aa8', o:'#c88a40', W:'#ffd0dc', h:'#ff8a92', r:'#e8333f', R:'#ff8a92', w:'#ffffff', g:'#3fb55a', D:'#8a1620', y:'#ffd23a', Y:'#c98a10', z:'#fff6b0', k:'#1b1f4a', d:'#6a3a10', q:'#0e0e18' };
  function iconoBtn(k, dormido) {
    const m = ICB[k], g = Grid(12, 12);
    m.forEach((fila, y) => [...fila].forEach((ch, x) => { if (ch !== '.') g.set(x, y, ICPAL[ch]); }));
    if (k === 'jugar') { g.rect(3, 5, 1, 1, '#e8333f'); g.rect(8, 5, 1, 1, '#ffd23a'); g.rect(9, 6, 1, 1, '#3fb55a'); }
    return g;
  }
  function pintarIconosBtn() {
    pintarIconosBtn.d = e.dormido;
    [['comer', 'ib-comer', 'comer'], ['dormir', 'ib-dormir', 'luna'], ['jugar', 'ib-jugar', 'jugar'], ['tienda', 'ib-tienda', 'tienda'], ['dice', 'ib-dice', 'dice'], ['inv', 'ib-inv', 'inv']].forEach(([n, id, k]) => {
      const el = $(id); if (!el) return; const c = el.getContext('2d'); c.clearRect(0, 0, 12, 12); c.drawImage(sprite('ib_' + k, () => iconoBtn(k), 0), 0, 0);
    });
  }
  function pintarIconos() {
    pintarIconosBtn();
    [['ic-not', 'notic', iconoNot, 11, 11], ['ic-cam', 'cam', iconoCam, 13, 11], ['ic-aju', 'aju', iconoAju, 11, 11], ['ic-edi', 'edi', iconoEdi, 11, 11], ['ic-ves', 'ves', iconoVes, 11, 11]].forEach(([id, k, fn, w, h]) => {
      const c = $(id).getContext('2d'); c.clearRect(0, 0, w, h); delete gridCache[k]; delete canvasCache[k + '|0']; c.drawImage(sprite(k, fn, 0), 0, 0);
    });
  }
  function alternaMusica() { e.musica = !e.musica; if (e.musica) { audio(); musicaOn(); sfx.click(); } else musicaOff(); guardar(); }
  let fotoURL = null, fotoBlob = null;
  function tomarFoto() {
    dibujar();
    const S = 4, pad = 12, pie = 52, W2 = LW * S + pad * 2, H2 = LH * S + pad + pie;
    const c = document.createElement('canvas'); c.width = W2; c.height = H2;
    const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
    x.fillStyle = '#f6f2e6'; x.fillRect(0, 0, W2, H2);
    x.drawImage(cv, pad, pad, LW * S, LH * S);
    x.strokeStyle = '#1a1f4a'; x.lineWidth = 3; x.strokeRect(pad - 1.5, pad - 1.5, LW * S + 3, LH * S + 3);
    x.drawImage(gridCanvas(coronaGrid()), pad + 4, LH * S + pad + 14, 66, 36);
    x.fillStyle = '#1a1f4a'; x.textBaseline = 'middle';
    const nom = (e.nombre || '').trim();
    const txtFoto = nom ? ('SIMON DE ' + nom.toUpperCase()) : 'SIMON';
    let fSize = 18;
    x.font = fSize + 'px PS2P, monospace';
    const maxW = W2 - (pad + 78) - 135;
    while (x.measureText && x.measureText(txtFoto).width > maxW && fSize > 9) {
      fSize--;
      x.font = fSize + 'px PS2P, monospace';
    }
    x.fillText(txtFoto, pad + 78, LH * S + pad + 30);
    x.textAlign = 'right'; x.font = '10px PS2P, monospace'; x.fillText(hoy().split('-').reverse().join('/'), W2 - pad - 6, LH * S + pad + 26);
    x.font = '8px PS2P, monospace'; x.fillText('CARIÑO NV' + nivel(), W2 - pad - 6, LH * S + pad + 42);
    $('flash').classList.remove('on'); void $('flash').offsetWidth; $('flash').classList.add('on');
    seq([2400, 1200], .03, 'square', .05);
    e.st.fotos++; mision('foto'); pixelarFoto(); if (clima() === 'arcoiris' && e.fotoArco !== hoy()) { e.fotoArco = hoy(); ganar(8, 2, true); toast('¡FOTO CON ARCOÍRIS! +8'); } guardar();
    c.toBlob(b => { fotoBlob = b; if (fotoURL) URL.revokeObjectURL(fotoURL); fotoURL = URL.createObjectURL(b); setTimeout(() => abrir('foto'), 250); }, 'image/png');
  }
  function guardarFoto() {
    if (!fotoURL) return;
    const nom = (e.nombre || '').trim(), pref = nom ? ('simon-de-' + nom.toLowerCase().replace(/\s+/g, '-')) : 'simon';
    const a = document.createElement('a'); a.href = fotoURL; a.download = pref + '-' + hoy() + '.png'; document.body.appendChild(a); a.click(); a.remove();
    toast('Foto guardada');
  }
  async function compartirFoto() {
    if (!fotoBlob) return;
    const nom = (e.nombre || '').trim(), tit = nom ? ('Simon de ' + nom) : 'Simon';
    const f = new File([fotoBlob], 'simon.png', { type: 'image/png' });
    try { if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: tit, text: '¡Mira a ' + tit + '!' }); return; } } catch (_) { return; }
    guardarFoto(); toast('Tu navegador no comparte directo: se guardó la foto');
  }
  $('b-foto').onclick = () => {
    if (dlg || tutMenuBloq('foto') || guiaBloq('foto')) return;
    if (modal) {
      if (modal === 'editar' || ['run', 'mem', 'rt'].includes(modal)) return;
      cerrar();
    }
    tomarFoto();
  };

  /* ===================== REGALO DIARIO ===================== */
  // (PREMIOS definido en config.js)
  function infoRegalo() {
    const h = hoy();
    if (e.ultimoRegalo === h) return null;
    let nr = 1, perdida = false;
    if (e.ultimoRegalo) {
      const d = difDias(e.ultimoRegalo, h);
      if (d < 0) return null;
      nr = e.racha + 1;   // la racha nunca se reinicia: si faltas, sigues con el regalo que te toca
    }
    return { nr, dia: ((nr - 1) % 7) + 1, perdida };
  }
  let ultimoPremio = null;
  function abrirRegalo() {
    const info = infoRegalo(); if (!info || ultimoPremio) return;
    e.racha = info.nr; e.mejorRacha = Math.max(e.mejorRacha || 0, e.racha); e.ultimoRegalo = hoy();
    let m = PREMIOS[info.dia - 1], item = null;
    if (info.dia === 7) { if (!e.tiene.monodorado) { e.tiene.monodorado = 1; item = 'monodorado'; } else m += 30; }
    e.monedas += m; e.total += m;
    ultimoPremio = { m, item, dia: info.dia, racha: e.racha };
    const nAntes = nivel();
    darXp(5 + info.dia);
    if (nivel() === nAntes) sfx.regalo();
    gesto('gran'); hablar(); estrellas(6);
    pintar(); guardar(); render();
  }

  /* ===================== TIENDA ===================== */
  function equipar(k) { const it = ITEMS[k]; if (esMueble(k)) { if (colocar(k)) toast('Colocado. Muévelo con el botón de la casita'); return; } (it.tipo === 'ropa' ? e.ropa : e.cuarto)[it.slot] = k; if (it.tipo === 'ropa' && ROPA_COM[k]) ropaPend = k; }
  function puesto(k) { const it = ITEMS[k]; if (!it) return false; if (esMueble(k)) return e.deco.some(d => d.k === k); return (it.tipo === 'ropa' ? e.ropa : e.cuarto)[it.slot] === k; }
  const habBloq0 = id => { const h = HABS.find(x => x.id === id); return h && nivel() < h.nv ? h : null; };
  const habBloq = k => { const t = ITEMS[k] && ITEMS[k].tema, h = HABS.find(x => x.id === t); return h && nivel() < h.nv ? h : null; };
  function comprar(k) {
    const it = ITEMS[k]; if (e.tiene[k] || it.regalo) return;
    const hb = habBloq(k); if (hb) { toast(hb.n + ' se desbloquea en cariño NV' + hb.nv); sfx.no(); return; }
    if (nivel() < it.nv) { toast('Necesitas cariño nivel ' + it.nv); sfx.no(); return; }
    const rq = refReq(k); if (rq) { toast('Primero necesitas el ' + ITEMS[rq].n); sfx.no(); return; }
    if (e.monedas < it.p) { faltanMon(it.p - e.monedas); sfx.no(); return; }
    e.monedas -= it.p; animarMonedas(it.p, true); e.tiene[k] = 1; e.st.compras++;
    if (it.semillaMerc) { e.semillas[it.semillaMerc] = (e.semillas[it.semillaMerc] || 0) + 1; sfx.compra(); toast('¡CONSEGUISTE: ' + it.n.toUpperCase() + '!'); gesto('besos'); hablar(); pintar(); guardar(); render(); return; }
    if (!esMueble(k)) equipar(k);
    sfx.compra(); toast('¡COMPRASTE: ' + it.n.toUpperCase() + '!'); if (esMueble(k) && !e.muebleVisto) { e.muebleVisto = 1; guardar(); tutRes('#b-editar'); } gesto('besos'); hablar(); pintar(); guardar(); render();
  }
  function poner(k) {
    if (!e.tiene[k]) return;
    if (esMueble(k) && (lugar || calle || vistaBloq)) { toast('Aquí no puedes usar esto'); sfx.no(); return; }
    if (ITEMS[k].slot === 'juguete') { colocar(k); sfx.click(); gesto('salto'); if (e.hab !== 'sala') toast('El juguete se coloca en la RECÁMARA'); pintar(); guardar(); render(); return; }
    if (esMueble(k)) {
      if (modal === 'tienda') {
        const it = ITEMS[k], th = it.tema && it.tema !== 'todas' ? it.tema : e.hab;
        if (th && th !== e.hab && HABS.some(h => h.id === th)) { e.hab = th; guardar(); pintarNav(); }
        const ok = colocar(k);
        if (ok) { sfx.click(); toast('Colocado. Muévelo con la casita cuando quieras'); pintar(); guardar(); render(); }
        return;
      }
      if (ITEMS[k].tema === 'bano' && e.hab !== 'bano') { lugar = null; llegada = null; e.hab = 'bano'; guardar(); pintarNav(); toast('Se coloca en el BAÑO'); }
      else if (ITEMS[k].tema === 'sala' && e.hab !== 'sala') { lugar = null; llegada = null; e.hab = 'sala'; guardar(); pintarNav(); toast('Se coloca en la RECÁMARA'); }
      const te = ITEMS[k].tema === 'estudio';
      if (te && e.hab !== 'estudio') { lugar = null; llegada = null; e.hab = 'estudio'; guardar(); pintarNav(); toast('Se coloca en el ESTUDIO'); }
      else if (!te && e.hab === 'estudio') { toast('El ESTUDIO solo admite objetos de estudio'); sfx.no(); return; }
      const tj = ITEMS[k].tema === 'jardin';
      if (tj && e.hab !== 'jardin') { lugar = null; llegada = null; e.hab = 'jardin'; guardar(); pintarNav(); toast('Se coloca en el JARDÍN'); }
      else if (!tj && e.hab === 'jardin') { toast('El JARDÍN solo admite objetos de jardín'); sfx.no(); return; }
      entrarEdicion(k);
      return;
    }
    equipar(k); mision('ropa'); sfx.click(); gesto('salto'); pintar(); guardar(); render();
  }
  function quitar(k) { const it = ITEMS[k]; if (it.slot === 'juguete' || it.fija) return; if (esMueble(k)) { e.deco = e.deco.filter(d => d.k !== k); sfx.click(); pintar(); guardar(); render(); return; } if (PORDEFECTO[it.slot]) return; (it.tipo === 'ropa' ? e.ropa : e.cuarto)[it.slot] = null; sfx.click(); pintar(); guardar(); render(); }


  /* ===================== CHARLA, ADIVINAR, MISIONES Y RESPALDO ===================== */
  function sem(t) { let h = 7; for (let i = 0; i < t.length; i++) h = Math.imul(h ^ t.charCodeAt(i), 2654435761) >>> 0; return () => { h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0; h ^= h >>> 13; return (h >>> 0) / 4294967296; }; }
  function mezclar(a, r) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  // (SEC definido en dialogos.js)
  let dv = 'menu', dres = null, ronda = null, rachaAdiv = 0, rsConf = false;
  /* misiones diarias de Cortex */
  // (MIS definido en dialogos.js)
  // (MIS_ESPERA definido en config.js)
  function misionesNuevas(previo) {
    let ids = MIS.map((m, i) => i).filter(i => !previo || !previo.includes(i)); if (ids.length < 3) ids = MIS.map((m, i) => i);
    e.mis = { ids: mezclar(ids, Math.random).slice(0, 3), p: {}, ok: {}, bono: 0, fin: 0 };
  }
  function misionesHoy() {   // las misiones no caducan: se terminan cuando se pueda; al acabarlas hay 24 h de espera
    if (!e.mis || !Array.isArray(e.mis.ids)) misionesNuevas();
    const M = e.mis;
    if (M.bono && !M.fin) M.fin = ahora();
    if (M.bono && ahora() >= M.fin + MIS_ESPERA) { misionesNuevas(M.ids); e.misAviso = 1; }
    return e.mis;
  }
  const misEspera = () => { const M = misionesHoy(); return M.bono ? Math.max(0, M.fin + MIS_ESPERA - ahora()) : 0; };
  function mision(k, n) {
    const M = misionesHoy(); let cambio = false;
    M.ids.forEach(i => {
      const m = MIS[i]; if (m.k !== k || M.ok[i]) return;
      M.p[i] = (M.p[i] || 0) + (n || 1); cambio = true;
      if (M.p[i] >= m.n) { M.ok[i] = 1; e.st.misiones++; const nAntes = nivel(); ganar(m.r, 4, true); toast('MISIÓN LISTA: ' + m.t + ' +' + m.r); if (nivel() === nAntes) sfx.logro(); }
    });
    if (cambio && !M.bono && M.ids.every(i => M.ok[i])) { M.bono = 1; M.fin = ahora(); ganar(22, 10, true); toast('CORTEX: ¡Misiones completas! +22'); notificar('Completaste las misiones de Cortex. Te dará nuevas dentro de 24 horas.'); }
  }
  /* preguntas del día */
  function preguntasHoy() {
    if (!e.preg || e.preg.f !== hoy()) {
      const r = sem('preg' + hoy()), ids = SEC.map((q, i) => i).filter(i => SEC[i][2] <= nivel());
      const nuevas = mezclar(ids.filter(i => !e.sec[i]), r), viejas = mezclar(ids.filter(i => e.sec[i]), r);
      e.preg = { f: hoy(), k: nuevas.concat(viejas).slice(0, 3), h: [] };
    }
    return e.preg;
  }
  function preguntar(i) {
    const P = preguntasHoy(); if (P.h.includes(i)) return;
    P.h.push(i); const nuevo = !e.sec[i]; e.sec[i] = 1; e.st.dice++;
    e.feliz = clamp(e.feliz + 4); if (nuevo) ganar(4, 3, true); mision('preg');
    dres = { i, nuevo }; dv = 'res'; sfx.pregunta(); decir('Sí.', SEC[i][1], 7000); gesto(nuevo ? 'baile' : 'salto'); setTimeout(() => { sfx.respuesta(); hablar(); corazones(nuevo ? 3 : 1); }, 450); pintar(); guardar(); render();
  }
  /* ¿en qué piensa Simon? Adivina la silueta */
  const OBJ = [
    { id: 'pizza', n: 'KEKE', g: () => FX.pizza() }, { id: 'moneda', n: 'MONEDA', g: () => FX.moneda() }, { id: 'corazon', n: 'CORAZÓN', g: () => FX.corazon() },
    { id: 'pelota', n: 'PELOTA', g: () => pelotaGrid() }, { id: 'libro', n: 'LIBRO', g: () => libroGrid(0) }, { id: 'regalo', n: 'REGALO', g: () => prevGrid('caja') },
    { id: 'planta', n: 'PLANTA', g: () => prevGrid('planta') }, { id: 'guitarra', n: 'GUITARRA', g: () => prevGrid('guitarra') }, { id: 'lampara', n: 'LÁMPARA', g: () => prevGrid('lampara') },
    { id: 'pato', n: 'PATO', g: () => prevGrid('pato') }, { id: 'dino', n: 'DINOSAURIO', g: () => prevGrid('dino') }, { id: 'cohete', n: 'COHETE', g: () => prevGrid('cohete') },
    { id: 'sol', n: 'SOL', g: () => prevGrid('dib_sol') }, { id: 'casa', n: 'CASA', g: () => prevGrid('dib_casa') }, { id: 'flor', n: 'FLOR', g: () => prevGrid('dib_flor') },
    { id: 'luna', n: 'LUNA', g: () => prevGrid('dib_luna') }, { id: 'sombrero', n: 'CORONA', g: () => { const g = Grid(22, 12); g.rect(0, 4, 22, 8, '#e8333f'); g.rect(0, 0, 3, 5, '#e8333f'); g.rect(9, 0, 4, 5, '#e8333f'); g.rect(19, 0, 3, 5, '#e8333f'); g.rect(2, 6, 18, 4, '#1b1f4a'); return g; } },
    { id: 'nube', n: 'NUBE', g: () => { const g = Grid(24, 12); [[6, 7, 6], [12, 5, 7], [18, 7, 6], [12, 8, 9]].forEach(([x, y, r]) => capa(g, null, L => sombrear(L, elipse(x, y, r, r * .8), x, y, r, r * .8, ['#ffffff', '#e8ecff', '#c4cdf0', '#9aa6d8']))); return g; } }
  ];
  let tRonda = null;
  function limpiaT() { if (tRonda) { clearInterval(tRonda); tRonda = null; } }
  function lienzoObj(o, sil, max) {
    const g = o.g(), z = Math.max(2, Math.floor(max / Math.max(g.w, g.h))), c = document.createElement('canvas');
    c.width = g.w * z; c.height = g.h * z; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(gridCanvas(g), 0, 0, c.width, c.height);
    if (sil) { x.globalCompositeOperation = 'source-in'; x.fillStyle = '#1b1f4a'; x.fillRect(0, 0, c.width, c.height); }
    return c;
  }
  function pensar(c, txt, dur) {
    const b = $('burbuja'); b.textContent = ''; if (c) b.appendChild(c); if (txt) b.appendChild(document.createTextNode(txt));
    b.classList.add('on'); clearTimeout(tBurbuja); tBurbuja = setTimeout(() => b.classList.remove('on'), dur || 3000);
  }
  function nivelRonda() { return rachaAdiv < 3 ? { n: 3, seg: 0 } : rachaAdiv < 6 ? { n: 4, seg: 10 } : { n: 6, seg: 7 }; }
  function nuevaRonda() {
    limpiaT();
    const L = nivelRonda(), ult = ronda && ronda.o, cand = OBJ.filter(o => o !== ult), o = cand[Math.floor(Math.random() * cand.length)];
    const otros = mezclar(OBJ.filter(x => x !== o), Math.random).slice(0, L.n - 1);
    ronda = { o, ops: mezclar([o].concat(otros), Math.random), res: null, seg: L.seg, t0: Date.now() };
    dv = 'adiv'; hablar(); sfx.pregunta(); pensar(lienzoObj(o, true, 48), '¿?', 600000); gesto('salto');
    render();
    if (L.seg) tRonda = setInterval(() => {
      const f = 1 - (Date.now() - ronda.t0) / (L.seg * 1000), bar = $('tm-b');
      if (bar) bar.style.width = Math.max(0, f * 100) + '%';
      if (f <= 0) adivinar(null);
    }, 100);
  }
  function adivinar(id) {
    if (!ronda || ronda.res) return; limpiaT();
    if (e.adv.f !== hoy()) e.adv = { f: hoy(), n: 0 };
    const o = ronda.o, ok = id === o.id; let premio = 0, nuevo = false;
    if (ok) {
      rachaAdiv++; e.st.adiv++; e.st.adivMejor = Math.max(e.st.adivMejor || 0, rachaAdiv); mision('adiv');
      if (e.adv.n < 10) { e.adv.n++; premio = 1 + Math.min(rachaAdiv, 3); ganar(premio, 2); }
      if (!e.pens[o.id]) { e.pens[o.id] = 1; nuevo = true; ganar(4, 3, true); }
      sfx.respuesta(); corazones(nuevo ? 4 : 2); gesto(nuevo ? 'baile' : 'salto');
    } else { rachaAdiv = 0; sfx.no(); }
    pensar(lienzoObj(o, false, 48), o.n, 5000); hablar();
    ronda.res = { ok, premio, nuevo, id }; pintar(); guardar(); render();
  }
  function iconoMis() {
    const g = Grid(12, 12), m = ['.kkkkkkkkk..', 'kwwwwwwwwwk.', 'kwyywwwwwwk.', 'kwyyywwwwwk.', 'kwwwwwwwwwk.', 'kwkkkkkkwwk.', 'kwwwwwwwwwk.', 'kwkkkkkwwwk.', 'kwwwwwwwwwk.', 'kwwwwwwwwwk.', '.kkkkkkkkk..', '............'];
    m.forEach((f, y) => [...f].forEach((ch, x) => { if (ch === 'k') g.set(x, y, '#232b63'); else if (ch === 'w') g.set(x, y, '#fff2d0'); else if (ch === 'y') g.set(x, y, '#e8353f'); }));
    return g;
  }
  function pintarMis() {
    const ch = $('t-mis'); if (!e.intro || introActiva) { ch.classList.add('oculto'); return; }
    const M = misionesHoy(), ok = M.ids.filter(i => M.ok[i]).length;
    ch.classList.remove('oculto'); ch.classList.toggle('gris', ok === 3);
    $('v-mis').textContent = ok === 3 ? 'MISIÓN OK' : 'MISIÓN ' + ok + '/3';
    ch.querySelectorAll('.pts b').forEach((b, i) => b.classList.toggle('on', i < ok));
    dibIcono($('ic-mis'), 'ic_mis', iconoMis);
  }
  function renderMis() {
    $('m-titulo').textContent = 'MISIONES DE CORTEX';
    const M = misionesHoy();
    return `<div class="centro" style="font-size:8px;line-height:1.9;margin-bottom:10px;color:#aab4ff">Cortex te pide tres cosas. Sin prisa: tu avance no se pierde, puedes terminarlas cuando quieras. ¡Las tres juntas dan +15 de bono!</div>` +
      M.ids.map(i => {
        const m = MIS[i], pr = Math.min(M.p[i] || 0, m.n), ok = !!M.ok[i];
        return `<div class="mi ${ok ? 'ok' : ''}"><span>${m.t}</span><b>${ok ? 'LISTA' : pr + '/' + m.n + ' +' + m.r}</b><i style="width:${pr / m.n * 100}%"></i></div>`;
      }).join('') +
      `<div class="centro" style="font-size:7px;color:#aab4ff;line-height:1.8;margin-top:8px">${M.bono ? 'Cortex te dará misiones nuevas en ' + fmt(misEspera()) + '.' : 'Nuevas misiones en 24 horas.'}</div>` +
      `<button class="bgrande" style="width:100%" data-a="cerrar">OK</button>`;
  }
  function renderDice() {
    const nv = nivel(), tit = { menu: 'SIMON DICE', preg: 'PREGÚNTALE', res: 'SIMON RESPONDE', adiv: '¿EN QUÉ PIENSA?', diario: 'DIARIO DE SIMON' };
    $('m-titulo').textContent = tit[dv] || 'SIMON DICE';
    const atras = `<button class="bt gran" style="margin-top:6px" data-a="d_menu">ATRÁS</button>`;
    const nsec = Object.keys(e.sec).length;
    if (dv === 'menu') {
      const P = preguntasHoy(), M = misionesHoy();
      return `<div class="saldo"><span>CARIÑO NV${nv}</span><span>SECRETOS ${nsec}/${SEC.length}</span></div>` +
        `<button class="bt ok gran" data-a="d_preg">PREGÚNTALE A SIMON (${P.h.length}/3)</button>` +
        `<button class="bt ok gran" data-a="d_adiv">¿EN QUÉ PIENSA SIMON?</button>` +
        `<button class="bt gran" data-a="d_diario">DIARIO DE SECRETOS</button>`;
    }
    if (dv === 'preg') {
      const P = preguntasHoy();
      return `<div class="centro" style="font-size:8px;margin-bottom:10px;line-height:1.8">Hoy puedes preguntarle tres cosas. Cada secreto nuevo da premio.</div>` +
        P.k.map(i => { const h = P.h.includes(i); return `<button class="bt ${h ? 'no' : 'ok'} gran" ${h ? '' : `data-a="d_ask" data-k="${i}"`} style="line-height:1.6;padding:12px 6px">${h ? '✓ ' : ''}${SEC[i][0]}${!h && !e.sec[i] ? ' ★' : ''}</button>`; }).join('') + atras;
    }
    if (dv === 'res' && dres) {
      return `<div class="centro" style="line-height:1.9"><div style="color:#aab4ff;font-size:8px">${SEC[dres.i][0]}</div><div style="height:8px"></div>` +
        `<div style="font-size:9px;line-height:2">«${SEC[dres.i][1]}»</div>` +
        (dres.nuevo ? `<div class="grande" style="margin-top:12px">¡SECRETO NUEVO! +5</div>` : `<div style="margin-top:12px;color:#aab4ff;font-size:8px">Ya lo sabías, pero se alegra de contarlo.</div>`) + `</div>` +
        `<button class="bt ok gran" style="margin-top:10px" data-a="d_preg">OTRA PREGUNTA</button>` + atras;
    }
    if (dv === 'adiv' && ronda) {
      const r = ronda.res, o = ronda.o, cols = ronda.ops.length > 4 ? 3 : 2;
      const btns = ronda.ops.map(x => `<button class="bt ${r ? (x === o ? 'ok' : 'no') : 'ok'} gran" ${r ? '' : `data-a="d_guess" data-k="${x.id}"`} style="padding:11px 0;margin-bottom:6px;font-size:${cols === 3 ? 7 : 8}px">${x.n}</button>`).join('');
      const lv = nivelRonda();
      return `<div class="saldo"><span>RACHA: ${rachaAdiv}</span><span>PREMIOS HOY: ${Math.min(e.adv.f === hoy() ? e.adv.n : 0, 10)}/10</span></div>` +
        (r ? '' : `<div class="centro" style="font-size:8px;line-height:1.8;margin-bottom:8px;color:#aab4ff">Simon está pensando en algo. ¿En qué?${lv.seg ? '<div class="barra" style="margin-top:6px"><div id="tm-b" style="width:100%"></div></div>' : ''}</div>`) +
        `<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:0 6px">` + btns + `</div>` +
        (r ? `<div class="centro" style="margin:2px 0 8px;line-height:1.9"><div class="grande">${r.ok ? '¡SÍ ERA ESO!' + (r.premio ? ' +' + r.premio : '') : r.id ? 'NO ERA ESO' : '¡SE ACABÓ EL TIEMPO!'}</div>${r.nuevo ? '<div style="font-size:8px;color:#ffd84a;margin-top:4px">¡NUEVO EN SU ÁLBUM! +5</div>' : ''}</div><button class="bt ok gran" data-a="d_sig">SIGUIENTE</button>` : '') + atras;
    }
    if (dv === 'diario') {
      const np = Object.keys(e.pens).length;
      return `<div class="saldo"><span>${nsec}/${SEC.length} SECRETOS</span><span>CARIÑO NV${nv}</span></div>` +
        `<div class="centro" style="font-size:8px;color:#ffd84a;margin-bottom:6px">LO QUE IMAGINA SIMON ${np}/${OBJ.length}</div><div class="galeria" style="margin-bottom:12px;flex-wrap:wrap;align-items:center">` + OBJ.map(o => `<canvas data-prev="pen_${o.id}" style="${e.pens[o.id] ? '' : 'filter:brightness(0) opacity(.35)'}"></canvas>`).join('') + `</div>` +
        SEC.map((q, i) => e.sec[i] ? `<div class="logro hecho"><div class="ln">${q[0]}</div><div class="ld">«${q[1]}»</div></div>` : `<div class="logro"><div class="ln">???</div><div class="ld">${q[2] > nv ? 'Cariño NV' + q[2] : 'Pregúntaselo a Simon'}</div></div>`).join('') + atras;
    }
    return '';
  }
  function subeEscena() {
    const es = $('escena'), tenia = es.classList.contains('alto'); es.classList.remove('alto');
    const sc = $('sc').getBoundingClientRect(), ap = $('modal').parentElement.getBoundingClientRect(), z = sc.height / LH;
    const pie = sc.top + (SY + SH) * z, limite = ap.top + ap.height * 0.54 - 8;   // el panel ocupa el 46% de abajo
    es.style.setProperty('--sube', Math.max(0, Math.round(pie - limite)) + 'px');
    if (tenia) es.classList.add('alto');
  }
  function dClick(a, k) {
    sfx.click(); if (a !== 'd_sig' && a !== 'd_guess') { limpiaT(); if (dv === 'adiv') $('burbuja').classList.remove('on'); }
    if (a === 'd_menu') dv = 'menu'; else if (a === 'd_preg') dv = 'preg'; else if (a === 'd_diario') dv = 'diario';
    else if (a === 'd_ask') { preguntar(+k); return; }
    else if (a === 'd_adiv' || a === 'd_sig') { nuevaRonda(); return; }
    else if (a === 'd_guess') { adivinar(k); return; }
    render();
    $('m-cuerpo').scrollTop = 0;
  }
  /* respaldo de progreso */
  const b64e = t => btoa(unescape(encodeURIComponent(t))), b64d = t => decodeURIComponent(escape(atob(t)));
  function suma(t) { let h = 2166136261; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16); }
  function crearCodigo() { e.ultResp = Date.now(); guardar(); const j = JSON.stringify(e); return 'SIMON2.' + ESQUEMA + '.' + b64e(j) + '.' + suma(j); }
  function leerCodigo(t) {
    t = (t || '').replace(/\s+/g, '');
    // Formato SIMON2.{esquema}.{b64}.{checksum}
    let m = /^SIMON2\.(\d+)\.([A-Za-z0-9+/=]+)\.([0-9a-f]+)$/.exec(t);
    if (m) { try { const j = b64d(m[2]); if (suma(j) !== m[3]) return null; const d = JSON.parse(j); return d && typeof d.hambre === 'number' && d.ropa && d.cuarto ? sanitizar(d) : null; } catch (_) { return null; } }
    // Retrocompatible: SIMON1.{b64}.{checksum}
    m = /^SIMON1\.([A-Za-z0-9+/=]+)\.([0-9a-f]+)$/.exec(t);
    if (m) { try { const j = b64d(m[1]); if (suma(j) !== m[2]) return null; const d = JSON.parse(j); return d && typeof d.hambre === 'number' && d.ropa && d.cuarto ? sanitizar(d) : null; } catch (_) { return null; } }
    return null;
  }
  let codigoAct = '';
  function renderResp() {
    $('m-titulo').textContent = 'RESPALDO';
    codigoAct = crearCodigo();
    return `<div class="centro" style="font-size:8px;line-height:1.8;margin-bottom:10px">Tu progreso se guarda de forma local. Si borras el juego tu partida se borrará, por eso debes guardar este código para recuperarla.</div>` +
      `<textarea class="cod" id="rs-out" readonly>${codigoAct}</textarea>` +
      `<div style="display:flex;gap:8px"><button class="bt ok" style="flex:1;padding:12px 0" data-a="r_copiar">COPIAR</button><button class="bt" style="flex:1;padding:12px 0" data-a="r_archivo">ARCHIVO</button></div>` +
      `<div class="centro" style="margin:18px 0 8px;font-size:8px;color:#ffd84a">RESTAURAR</div>` +
      `<textarea class="cod" id="rs-in" placeholder="Pega aquí tu código SIMON1 o SIMON2..."></textarea>` +
      `<button class="bt gran" data-a="r_restaurar">RESTAURAR PROGRESO</button>` +
      (() => {
        const dias = e.ultResp ? Math.floor((Date.now() - e.ultResp) / 86400000) : -1;
        const col = dias < 0 ? '#aab4ff' : dias <= 3 ? '#7fff7f' : dias <= 7 ? '#ffd84a' : '#ff6b6b';
        const txt = dias < 0 ? 'Nunca' : dias === 0 ? 'Hoy' : dias === 1 ? 'Ayer' : `Hace ${dias} días`;
        return `<div class="centro" style="font-size:7px;color:#aab4ff;line-height:1.9">Restaurar reemplaza tu progreso actual.<br><span style="color:${col}">Último respaldo: ${txt}</span></div>`;
      })();
  }
  function rClick(a, b) {
    if (a === 'r_snd') { alternaSonido(); render(); return; }
    if (a === 'r_mus') { alternaMusica(); render(); return; }
    if (a === 'r_tab') { ajTab = b.dataset.k; cdMsg = null; sfx.click(); render(); return; }
    if (a === 'r_copiar') {
      const t = $('rs-out'); t.select(); t.setSelectionRange(0, 1e9);
      const bien = () => toast('CÓDIGO COPIADO'), plan = () => { let ok = false; try { ok = document.execCommand('copy'); } catch (_) {} toast(ok ? 'CÓDIGO COPIADO' : 'SELECCIÓNALO Y COPIA'); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t.value).then(bien, plan); else plan();
      sfx.click();
    } else if (a === 'r_archivo') {
      const blob = new Blob([$('rs-out').value], { type: 'text/plain' }), u = URL.createObjectURL(blob), l = document.createElement('a');
      l.href = u; l.download = 'simon-respaldo.txt'; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(u), 3000); sfx.click(); toast('ARCHIVO GUARDADO');
    } else if (a === 'r_restaurar') {
      if (admin) { toast('NO DISPONIBLE EN ADMIN'); return; }
      const d = leerCodigo($('rs-in').value);
      if (!d) { toast('CÓDIGO NO VÁLIDO'); sfx.no(); rsConf = false; b.textContent = 'RESTAURAR PROGRESO'; return; }
      if (!rsConf) { rsConf = true; b.textContent = 'TOCA OTRA VEZ PARA CONFIRMAR'; sfx.pregunta(); return; }
      rsConf = false; d.t = Date.now();
      const rj = JSON.stringify(d);
      try { localStorage.setItem(CLAVE, rj); } catch (_) {}
      try { localStorage.setItem(CLAVE_BK, rj); } catch (_) {}
      idbSet(rj);
      cargar(); e.ultResp = Date.now(); guardar(); pintar(); actualizarTareas(); pintarIconos(); cerrar(); sfx.logro(); toast('PROGRESO RESTAURADO');
    }
  }
  function iconoAju() {
    const g = Grid(11, 11);
    // sliders de ajuste: 3 líneas con perilla amarilla en distinta posición
    // línea 1 (fila 1-2): perilla en x=3
    // línea 2 (fila 4-5): perilla en x=7
    // línea 3 (fila 7-8): perilla en x=5
    for (let x = 0; x < 11; x++) {
      if (x < 2 || x > 4) g.set(x, 1, '#e8ecff');
      if (x < 2 || x > 4) g.set(x, 2, '#e8ecff');
      if (x < 6 || x > 8) g.set(x, 4, '#e8ecff');
      if (x < 6 || x > 8) g.set(x, 5, '#e8ecff');
      if (x < 4 || x > 6) g.set(x, 7, '#e8ecff');
      if (x < 4 || x > 6) g.set(x, 8, '#e8ecff');
    }
    // perillas amarillas
    [[2,1],[3,1],[4,1],[2,2],[3,2],[4,2]].forEach(([x,y]) => g.set(x, y, '#ffd84a'));
    [[6,4],[7,4],[8,4],[6,5],[7,5],[8,5]].forEach(([x,y]) => g.set(x, y, '#ffd84a'));
    [[4,7],[5,7],[6,7],[4,8],[5,8],[6,8]].forEach(([x,y]) => g.set(x, y, '#ffd84a'));
    return g;
  }
  $('b-ajustes').onclick = () => menuAbrir('resp', () => { if (!admin) ajTab = 'cfg'; abrir('resp'); });


  /* ===================== CÓDIGOS Y MODO ADMIN ===================== */
  const normCod = t => (t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const hCod = t => suma('simon|' + normCod(t));
  const H_ADMIN = '4f418ff5', H_TIEMPO = '36d5fe3b';
  const H_RESET = 'e8ab2e8b351306dc74e35df5021f3e444b318e2b36ba6b3144165eb2466e8534';
  async function esReset(v) {
    try { if (!window.crypto || !crypto.subtle) return false; const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('simon-reset|' + normCod(v))); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('') === H_RESET; } catch (_) { return false; }
  }
  function reiniciarTodo() {
    reseteando = true;
    try { localStorage.removeItem(CLAVE); } catch (_) {}
    try { localStorage.removeItem(CLAVE_BK); } catch (_) {}
    idbClear();
    try { if (window.caches) caches.keys().then(ks => ks.forEach(k => { if (!k.startsWith('simon-')) caches.delete(k); })); } catch (_) {}
    setTimeout(() => location.reload(), 150);
  }
  const CODIGOS = {
    '37a2e8ad': { n: 'prenda', f: () => { e.tiene.sud_arcoiris = 1; e.ropa.sudadera = 'sud_arcoiris'; return '¡SUDADERA ARCOÍRIS! Es única y ya la tienes puesta.'; } },
    '4daf631f': { n: 'deco', f: () => { e.tiene.neon_si = 1; colocar('neon_si'); return '¡NEÓN SIMON! Ya brilla en tu habitación.'; } },
    'af175e58': { n: 'obra', f: () => { e.tiene.marco_estrellas = 1; e.cuarto.cuadro = 'marco_estrellas'; return '¡OBRA ESTRELLAS! Ya cuelga de tu pared.'; } },
    'bdb61f7d': { n: 'monedas', f: () => { e.monedas += 100; e.total += 100; return '¡+100 MONEDAS!'; } }
  };
  let ajTab = 'cfg', cdMsg = null;
  function ponTag() { $('adm-tag').classList.toggle('on', admin); }
  function activarAdmin() {
    guardar();                                              // lo real queda guardado ANTES de entrar
    admin = true; ajTab = 'ab';
    Object.keys(ITEMS).forEach(k => { if (!ITEMS[k].secreto) e.tiene[k] = 1; }); Object.keys(COMIDAS).forEach(k => { e.comida[k] = 5; }); e.bombas = Math.max(e.bombas || 0, 10);
    e.intro = true; e.traductor = true; e.xp = Math.max(e.xp, xpDe(NMAX)); e.monedas = Math.max(e.monedas, 9999);
    pintar(); ponTag(); sfx.nivel();
  }
  function salirAdmin() {
    admin = false; admMerc = 0; admTemp = null; admClima = null; admHora = null; admLuna = false; admFz = false; admSangre = false; admAzul = false; bl = null; ojoKeke = null; ov = null; az = null; esferaXY = null; tr = null; centellaXY = null; truenoT = 0; boltV = 0; ajTab = 'cfg'; mercPres = false; mercBusy = false;
    cargar(); pintar(); actualizarTareas(); pintarIconos(); ponTag(); cerrar(); toast('MODO ADMIN APAGADO. TODO VOLVIÓ A COMO ESTABA');
  }
  function renderAjAdm() {
    const aud = `<div style="display:flex;gap:8px;margin-bottom:10px"><button class="bt ${e.mudo ? '' : 'ok'}" style="flex:1;padding:12px 0" data-a="r_snd">SONIDO ${e.mudo ? 'OFF' : 'ON'}</button><button class="bt ${e.musica ? 'ok' : ''}" style="flex:1;padding:12px 0" data-a="r_mus">MÚSICA ${e.musica ? 'ON' : 'OFF'}</button></div>`;
    const ntb = `<button class="bt ${e.notifOn ? 'ok' : ''} gran" style="padding:12px 0;margin-bottom:10px" data-a="nt_tog">AVISOS AL TELÉFONO: ${e.notifOn ? 'SÍ' : 'NO'}</button>`;
    const fsb = `<div class="centro" style="font-size:7px;color:#aab4ff;margin:4px 0 6px">TAMAÑO DEL TEXTO</div><div style="display:flex;gap:6px;margin-bottom:10px">${['CHICA', 'NORMAL', 'GRANDE'].map((t, i) => `<button class="bt ${(e.fuente == null ? 1 : e.fuente) === i ? 'ok' : ''}" style="flex:1;padding:12px 0" data-a="fs_set" data-k="${i}">${t}</button>`).join('')}</div>`;
    const nmb = admin ? '' : `<button class="bt gran" style="padding:12px 0;margin-bottom:10px" data-a="nom_ed">TU NOMBRE: ${quitaAc(e.nombre || '---').toUpperCase()}</button>`;
    return aud + fsb + nmb + (admin ? '' : ntb) + renderAj0() + `<button class="bt gran" style="padding:10px 0;margin-top:10px" data-a="tut_ver">VER TUTORIAL DE LA PANTALLA</button><div class="centro" style="font-size:7px;color:#aab4ff;margin-top:14px">SIMON: TU AMIGO VIRTUAL · VERSIÓN ${VERSION_JUEGO}</div>`;
  }
  const IC_PAT = {
    snd: ['...x.....', '..xx..x..', 'xxxx...x.', 'xxxx.x.x.', 'xxxx.x.x.', 'xxxx.x.x.', 'xxxx...x.', '..xx..x..', '...x.....'],
    mus: ['...xxxxxx', '...xxxxxx', '...x....x', '...x....x', '...x....x', '.xxx..xxx', 'xxxx.xxxx', 'xxxx.xxxx', '.xx...xx.'],
    usr: ['...xxx...', '..xxxxx..', '..xxxxx..', '...xxx...', '.........', '.xxxxxxx.', 'xxxxxxxxx', 'xxxxxxxxx', 'xxxxxxxxx'],
    bel: ['....x....', '...xxx...', '..xxxxx..', '..xxxxx..', '..xxxxx..', '.xxxxxxx.', 'xxxxxxxxx', '.........', '....x....'],
    txt: ['...xxx...', '..xx.xx..', '..xx.xx..', '.xx...xx.', '.xxxxxxx.', '.xx...xx.', 'xx.....xx', 'xx.....xx', '.........'],
    ayu: ['..xxxxx..', '.xx...xx.', '.xx...xx.', '.....xx..', '....xx...', '....xx...', '.........', '....xx...', '....xx...'],
    dis: ['xxxxxxxx.', 'x.xxxx.xx', 'x.xxxx.xx', 'x......xx', 'x.xxxxx.x', 'x.x...x.x', 'x.xxxxx.x', 'x.......x', 'xxxxxxxxx'],
    key: ['..xxx....', '.x...x...', '.x...x...', '..xxx....', '...x.....', '...xxx...', '...x.....', '...xx....', '...x.....'],
    gea: ['....x....', '.x.xxx.x.', '..xxxxx..', '.xxx.xxx.', 'xxx...xxx', '.xxx.xxx.', '..xxxxx..', '.x.xxx.x.', '....x....'],
    tro: ['.xxxxx...', 'x.....x..', 'x.....x..', '.xxxxx...', '...x.....', '...x.....', '..xxx....', '..xxx....', '.xxxxx...']
  };
  const IC_CACHE = {};
  function icU(k, col) {   // icono pixel de 9x9 como imagen
    const id = k + (col || ''); if (IC_CACHE[id]) return IC_CACHE[id];
    const c = document.createElement('canvas'); c.width = c.height = 9; const x = c.getContext('2d'); x.fillStyle = col || '#ffd84a';
    IC_PAT[k].forEach((f, y) => [...f].forEach((ch, i) => { if (ch === 'x') x.fillRect(i, y, 1, 1); }));
    return IC_CACHE[id] = c.toDataURL();
  }
  function renderCfg() {
    const sw = on => `<span class="cfg-sw ${on ? 'on' : ''}"></span>`, mus = e.musica;
    const fila = (ic, t, sub, acc, extra) => `<button class="cfg-row" data-a="${acc}"><img src="${icU(ic)}"><span class="cfg-tx"><b>${t}</b>${sub ? `<i>${sub}</i>` : ''}</span>${extra}</button>`;
    const sec = (ic, t, cuerpo) => `<div class="cfg-sec"><div class="cfg-h"><img src="${icU(ic)}">${t}</div>${cuerpo}</div>`;
    const fu = e.fuente == null ? 1 : e.fuente, tam = [5, 7, 10];
    let h = sec('usr', 'PERFIL', fila('usr', 'TU NOMBRE', 'Así te llama Simon', 'nom_ed', `<span class="cfg-val">${quitaAc(e.nombre || '---').toUpperCase()}</span>`));
    h += sec('snd', 'AUDIO', fila('snd', 'SONIDO', 'Efectos del juego', 'r_snd', sw(!e.mudo)) + fila('mus', 'MÚSICA', 'Melodía de fondo de cada lugar', 'r_mus', sw(mus)));
    h += sec('txt', 'PANTALLA', `<div class="cfg-tx" style="padding:10px 10px 0;font-size:8px">TAMAÑO DEL TEXTO</div><div class="cfg-seg">${['CHICA', 'NORMAL', 'GRANDE'].map((t, i) => `<button class="${fu === i ? 'on' : ''}" style="font-size:${tam[i]}px" data-a="fs_set" data-k="${i}">${t === 'CHICA' ? 'A' : t === 'NORMAL' ? 'AA' : 'AAA'}</button>`).join('')}</div>`);
    h += sec('bel', 'AVISOS', fila('bel', 'AVISOS AL TELÉFONO', 'Te avisa cuando Simon te necesite', 'nt_tog', sw(e.notifOn)));
    h += sec('ayu', 'AYUDA', fila('ayu', 'VER TUTORIAL', 'Repasa los botones de la pantalla', 'tut_ver', '<span class="cfg-val">›</span>'));
    return h + `<div class="cfg-pie">SIMON: TU AMIGO VIRTUAL<br>VERSIÓN ${VERSION_JUEGO}</div>`;
  }
  function renderLogros() {
    const hechos = LOGROS.filter(l => e.logros[l.id]).length;
    return `<div class="saldo"><span>${hechos}/${LOGROS.length} LISTOS</span><span>CARIÑO NV${nivel()}</span></div>` +
      LOGROS.map(l => {
        const v = Math.min(l.val(), l.meta), ok = !!e.logros[l.id];
        return `<div class="logro ${ok ? 'hecho' : ''}"><div class="ln">${l.n}</div><div class="ld">${l.d}</div><div class="barra"><div style="width:${v / l.meta * 100}%"></div></div><div class="lp">${ok ? 'LISTO' : v + '/' + l.meta} · +${l.r} monedas${l.item ? ' + OBRA' : ''}</div></div>`;
      }).join('');
  }
  function renderAj() {
    if (admin) return renderAjAdm();
    if (!['cfg', 'logros', 'resp', 'cod'].includes(ajTab)) ajTab = 'cfg';
    $('m-titulo').textContent = 'AJUSTES';
    const tabs = `<div class="cfg-tabs">${[['cfg', 'AJUSTES', 'gea'], ['logros', 'LOGROS', 'tro'], ['resp', 'RESPALDO', 'dis'], ['cod', 'CÓDIGOS', 'key']].map(([k, n, ic]) => `<button class="${ajTab === k ? 'on' : ''}" data-a="r_tab" data-k="${k}"><img src="${icU(ic, ajTab === k ? '#ffffff' : '#aab4ff')}">${n}</button>`).join('')}</div>`;
    const cuerpo = ajTab === 'cfg' ? renderCfg() : ajTab === 'logros' ? renderLogros() : ajTab === 'resp' ? renderResp() : renderCod(false);
    $('m-titulo').textContent = 'AJUSTES';
    return tabs + cuerpo;
  }
  function renderAj0() {
    $('m-titulo').textContent = 'AJUSTES';
    const tabs = `<div class="tabs"><button class="tab ${ajTab === 'cod' ? 'on' : ''}" data-a="r_tab" data-k="cod">CÓDIGOS</button><button class="tab ${ajTab === 'resp' ? 'on' : ''}" data-a="r_tab" data-k="resp">RESPALDO</button></div>`;
    if (ajTab === 'resp') return tabs + (admin ? `<div class="centro" style="font-size:8px;line-height:1.9">No se puede respaldar ni restaurar en modo admin.</div>` : renderResp());
    if (admin) return renderAdm();
    return tabs + renderCod(false);
  }
  function renderAdm() {   // menú del modo admin: pestañas con botones en cuadrícula
    const T = { null: 'AUTO', hal: 'HALLOWEEN', nav: 'NAVIDAD', val: 'SAN VALENTÍN', none: 'NINGUNA' }[admTemp];
    if (!['ab', 'as', 'am', 'cod'].includes(ajTab)) ajTab = 'ab';
    const tabs = `<div class="tabs">${[['ab', 'BARRAS'], ['as', 'SECRETOS'], ['am', 'MUNDO'], ['cod', 'CÓDIGOS']].map(([k, n]) => `<button class="tab ${ajTab === k ? 'on' : ''}" data-a="r_tab" data-k="${k}">${n}</button>`).join('')}</div>`;
    const g = (a, t, c, k) => `<button class="bt ${c || ''}" data-a="${a}" ${k ? `data-k="${k}"` : ''}>${t}</button>`;
    const fila = (id, n) => `<div class="adm-bar"><span>${n} ${Math.round(e[id])}</span>${[0, 25, 50, 100].map(v => g('x_set', v, '', id + ':' + v)).join('')}</div>`;
    let h = `<div class="adm-top"><span>MODO ADMIN · NADA SE GUARDA</span><button class="bt" style="background:#ff7b84" data-a="x_salir">SALIR</button></div>` + tabs;
    if (ajTab === 'ab') {
      h += `<div class="adm-t">BARRAS DE SIMON</div>` + fila('hambre', 'HAMBRE') + fila('energia', 'ENERGÍA') + fila('feliz', 'FELIZ') + fila('limp', 'LIMPIEZA') +
        `<div class="adm-g">${g('x_barras', 'TODAS AL 100%', 'ok')}${g('x_barras0', 'TODAS AL 0')}</div>` +
        `<div class="adm-t">RECURSOS</div><div class="adm-g">${g('x_mon', '+1000 MONEDAS', 'ok')}${g('x_niv', 'CARIÑO AL MÁXIMO', 'ok')}${g('x_bomba', '+10 BOMBAS', 'ok')}${g('x_sucio', 'SIMON SUCIO (15)')}</div>` +
        `<div class="adm-t">JARDÍN</div><div class="adm-g">${g('x_jardin_full', 'DESBLOQUEAR Y CRECER TODO', 'ok')}${g('x_jardin_semillas', '+20 DE CADA SEMILLA', 'ok')}${g('x_jardin_fase', '+1 FASE DE CRECIMIENTO', 'ok')}</div>` +
        `<div class="adm-t">SALUD</div><div class="adm-g">${g('x_enf', 'DAR RESFRIADO')}${g('x_cura', 'CURAR RESFRIADO', 'ok')}</div>` +
        `<div class="adm-t">ABANDONO (NIVEL ${nivelAbandono()})</div><div class="adm-g">${g('x_ab0', 'SIN ABANDONO', 'ok')}${g('x_ab1', 'DESCUIDADO<br>(3 DÍAS)')}${g('x_ab2', 'ABANDONO TOTAL<br>(7 DÍAS)')}</div>`;
    } else if (ajTab === 'as') {
      h += `<div class="adm-t">EVENTOS SECRETOS</div><div class="adm-g">${g('x_luna', 'LUNA DORADA<br>(CASCO)', 'ok')}${g('x_ovni', 'SALTAR AL COHETE<br>(CASCO)', 'ok')}${g('x_sangre', 'LUNA DE SANGRE<br>(OJO)', 'ok')}${g('x_azul', 'LUNA AZUL<br>(AURA)', 'ok')}${g('x_trueno', 'TORMENTA CON RAYOS<br>(AURA TRUENO)', 'ok')}${g('x_fugaz', 'ESTRELLA FUGAZ<br>(PLATILLO)', 'ok')}${g('x_pel', 'BOMBA 3<br>(PELUCHE)', 'ok')}${g('x_ret', 'PELUCHE 10 TOQUES<br>(RETRATO)', 'ok')}${g('x_chef', '1000 KEKES<br>(GORRO)', 'ok')}${g('x_sif', 'IR AL PARQUE<br>(PERRITO SIF)', 'ok')}${g('x_nosif', 'REINICIAR<br>(SIF)')}</div>`;
    } else if (ajTab === 'am') {
      h += `<div class="adm-t">AMBIENTE</div><div class="adm-g">${g('x_hora', 'HORA: ' + (admHora == null ? 'AUTO' : admHora >= 19 || admHora < 6 ? 'NOCHE' : 'DÍA'))}${g('x_clima', 'CLIMA: ' + String(admClima || 'AUTO').toUpperCase())}${g('x_temp', 'ÉPOCA: ' + T)}</div>` +
        `<div class="adm-t">CORTEX</div><div class="adm-g">${g('x_merc', 'COMERCIANTE YA', 'ok')}${g('x_nomerc', 'QUITAR COMERCIANTE')}${g('x_visita', 'VISITA DE CORTEX', 'ok')}</div>` +
        `<div class="adm-t">REINICIOS</div><div class="adm-g">${g('x_mis', 'MISIONES Y PREGUNTAS')}${g('x_regalo', 'REGALO DIARIO')}</div>`;
    } else h += renderCod(true);
    return h;
  }
  function renderCod(soloEntrada) {
    if (resetPend) return `<div class="centro" style="font-size:9px;line-height:2;margin:10px 0;color:#ff8a92">¡ADVERTENCIA!<br><br>Vas a BORRAR TODO tu progreso: monedas, cariño, ropa, muebles, logros y diario.<br><br>Simon empezará desde cero y NO se puede deshacer.</div>` +
      `<button class="bt gran" style="background:#ff7b84" data-a="c_reset_ok">SÍ, BORRAR TODO</button><button class="bt ok gran" data-a="c_reset_no">CANCELAR</button>`;
    return `<div class="centro" style="font-size:8px;line-height:1.9;margin:${soloEntrada ? 14 : 4}px 0 10px">${soloEntrada ? 'CÓDIGOS NORMALES' : 'Escribe un código y gana premios.'}</div>` +
      `<input class="cod" id="cd-in" maxlength="40" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ESCRIBE TU CÓDIGO">` +
      `<button class="bt ok gran" data-a="c_canjear">CANJEAR</button>` +
      (cdMsg ? `<div class="centro" style="font-size:8px;line-height:1.9;margin-top:6px;color:${cdMsg.ok ? '#bff0c8' : '#ff8a92'}">${cdMsg.t}</div>` : '');
  }
  function canjear() {
    const v = $('cd-in').value, h = hCod(v);
    if (!normCod(v)) { cdMsg = { ok: false, t: 'ESCRIBE UN CÓDIGO' }; sfx.no(); render(); return; }
    if (normCod(v).length >= 20) { esReset(v).then(ok => { if (ok) { resetPend = true; sfx.no(); render(); } else canjearNormal(v, h); }); return; }
    canjearNormal(v, h);
  }
  function canjearNormal(v, h) {
    if (h === H_ADMIN) {
      if (admin) cdMsg = { ok: true, t: 'YA ESTÁS EN MODO ADMIN' };
      else { activarAdmin(); cdMsg = null; }
      render(); return;
    }
    if (h === H_TIEMPO) { const m = Math.floor((e.tJ || 0) / 60); cdMsg = { ok: true, t: 'TIEMPO JUGADO: ' + Math.floor(m / 60) + ' H ' + (m % 60) + ' MIN' }; sfx.logro(); render(); return; }
    const c = CODIGOS[h];
    if (!c) { cdMsg = { ok: false, t: 'CÓDIGO NO VÁLIDO' }; sfx.no(); render(); return; }
    if (e.cod[h]) { cdMsg = { ok: false, t: 'YA USASTE ESTE CÓDIGO' }; sfx.no(); render(); return; }
    e.cod[h] = 1; cdMsg = { ok: true, t: c.f() }; sfx.logro(); estrellas(6); pintar(); guardar(); render();
  }
  function xClick(a, k) {
    sfx.click();
    if (a === 'x_mon') { e.monedas += 1000; pintar(); }
    else if (a === 'x_set') { const [kk, v] = String(k).split(':'); e[kk] = +v; pintar(); }
    else if (a === 'x_hora') { admHora = admHora == null ? 13 : admHora === 13 ? 23 : null; toast('HORA: ' + (admHora == null ? 'AUTO' : admHora === 13 ? 'DÍA' : 'NOCHE')); }
    else if (a === 'x_luna') { cerrar(); lugar = null; llegada = null; e.hab = 'sala'; pintarNav(); admHora = 1; admLuna = true; admClima = 'sol'; e.tiene.casco_espacial = 0; e.lunaT = 0; ov = null; pintar(); return; }
    else if (a === 'x_sucio') { e.limp = 15; cerrar(); pintar(); }
    else if (a === 'x_sangre') { cerrar(); lugar = null; llegada = null; e.hab = 'sala'; pintarNav(); admHora = 23; admSangre = true; admClima = 'sol'; e.sangFase = 0; e.sangT = 0; e.ojoN = 0; bl = null; ojoKeke = null; pintar(); return; }
    else if (a === 'x_azul') { cerrar(); lugar = null; llegada = null; e.hab = 'sala'; pintarNav(); admHora = 0; admAzul = true; admClima = 'sol'; e.tiene.aura_legend = 0; if (e.ropa.aura === 'aura_legend') e.ropa.aura = null; e.azulT = 0; e.azulD = ''; az = null; esferaXY = null; pintar(); toast('TOCA LA LUNA AZUL 5 VECES'); return; }
    else if (a === 'x_trueno') { cerrar(); lugar = null; llegada = null; e.hab = 'sala'; pintarNav(); admClima = 'tormenta'; e.tiene.aura_trueno = 0; if (e.ropa.aura === 'aura_trueno') e.ropa.aura = null; truenoT = 0; boltV = 0; tr = null; centellaXY = null; pintar(); toast('TOCA 3 RAYOS EN LA VENTANA DURANTE LA TORMENTA'); return; }
    else if (a === 'x_ovni') { cerrar(); e.tiene.casco_espacial = 0; e.lunaT = 2; ov = null; setTimeout(() => { ovStart(); }, 400); return; }
    else if (a === 'x_fugaz') { cerrar(); lugar = null; llegada = null; e.hab = 'sala'; pintarNav(); admClima = 'sol'; admHora = 23; e.tiene.platillo_mini = 0; e.fugazD = ['2000-01-01', '2000-01-02']; admFz = true; toast('ATRAPA UNA ESTRELLA FUGAZ EN LA VENTANA'); pintar(); return; }
    else if (a === 'x_pel') { e.tiene.peluche_cortex = 0; e.st.bombas = 2; e.bombas = Math.max(e.bombas || 0, 5); cerrar(); toast('LANZA UNA BOMBA A CORTEX EN SU VISITA'); e.proxVisita = 0; setTimeout(visitaAdm, 700); return; }
    else if (a === 'x_ret') { e.tiene.marco_cortex_bebe = 0; e.tiene.peluche_cortex = 1; cerrar(); lugar = null; llegada = null; e.hab = 'sala'; pintarNav(); colocar('peluche_cortex'); pintar(); toast('TOCA EL PELUCHE 10 VECES SEGUIDAS'); return; }
    else if (a === 'x_chef') { e.tiene.gorro_chef = 0; e.kkTot = 999; e.kk = { f: hoy(), n: 0 }; cerrar(); toast('DALE UN KEKE A SIMON'); return; }
    else if (a === 'x_bomba') { e.bombas = (e.bombas || 0) + 10; toast('+10 BOMBAS'); }
    else if (a === 'x_enf') { if (e.enf) toast('YA ESTÁ RESFRIADO'); else enfermar(); pintar(); }
    else if (a === 'x_cura') { if (e.enf) curar('jarabe'); else toast('NO ESTÁ RESFRIADO'); pintar(); }
    else if (a === 'x_ab0') { e.hambre = e.energia = e.feliz = e.limp = 100; e.abandonoDesde = null; pintar(); toast('SIN ABANDONO'); }
    else if (a === 'x_ab1') { e.hambre = e.energia = e.feliz = e.limp = 0; e.abandonoDesde = Date.now() - 4 * 86400000; pintar(); toast('DESCUIDADO (4 DÍAS)'); }
    else if (a === 'x_ab2') { e.hambre = e.energia = e.feliz = e.limp = 0; e.abandonoDesde = Date.now() - 8 * 86400000; pintar(); toast('ABANDONO TOTAL (8 DÍAS)'); }
    else if (a === 'x_niv') { e.xp = xpDe(NMAX); pintar(); toast('CARIÑO AL MÁXIMO'); }
    else if (a === 'x_jardin_semillas') { Object.keys(SEMILLAS).forEach(sk => { e.semillas[sk] = (e.semillas[sk] || 0) + 20; }); pintar(); toast('+20 DE CADA SEMILLA'); }
    else if (a === 'x_jardin_fase') {
      const plots = jardinSync(); let n = 0;
      plots.forEach(p => {
        if (!p.k || p.etapa === 'listo') return;
        const S = SEMILLAS[p.k]; if (!S) return;
        p.dias++; p.regadoHoy = false; p.diaUlt = hoy();
        p.etapa = p.dias >= S.diasCrecer ? 'listo' : 'brote';
        n++;
      });
      pintar();
      toast(n ? 'CRECIMIENTO +1 FASE EN ' + n + (n === 1 ? ' MACETA' : ' MACETAS') : 'NO HAY SEMILLAS CRECIENDO');
      return;
    }
    else if (a === 'x_jardin_full') {
      e.xp = xpDe(NMAX);   // asegura las 6 macetas desbloqueadas
      const plots = jardinSync(), ids = Object.keys(SEMILLAS);
      plots.forEach((p, i) => { const sk = ids[i % ids.length], S = SEMILLAS[sk]; Object.assign(p, { k: sk, etapa: 'listo', dias: S.diasCrecer, diaUlt: hoy(), regadoHoy: true }); });
      cerrar(); lugar = null; llegada = null; e.hab = 'jardin'; pintarNav(); pintar(); toast('JARDÍN: TODO CRECIDO Y LISTO PARA COSECHAR');
      return;
    }
    else if (a === 'x_barras') { e.hambre = e.energia = e.feliz = e.limp = 100; pintar(); }
    else if (a === 'x_barras0') { e.hambre = e.energia = e.feliz = e.limp = 0; pintar(); }
    else if (a === 'x_h0') { e.hambre = 0; pintar(); } else if (a === 'x_e0') { e.energia = 0; pintar(); } else if (a === 'x_f0') { e.feliz = 0; pintar(); }
    else if (a === 'x_merc') { admMerc = ahora(); e.merc = { dia: hoy(), compras: {}, aviso: true, adios: false }; cerrar(); toast('CORTEX COMERCIANTE LLEGANDO...'); return; }
    else if (a === 'x_nomerc') { admMerc = 0; toast('COMERCIANTE QUITADO'); }
    else if (a === 'x_sif') { const S_ = SF(); S_.f = 0; S_.v = Math.max(S_.v, 1); e.sifK = Math.max(e.sifK || 0, 3); sifP = null; sifProx = Date.now() + 500; cerrar(); if (lugar !== 'parque') irLugar('parque'); toast('TOCA AL PERRITO CON UN KEKE (TIENES 3)'); return; }
    else if (a === 'x_nosif') { e.sif = { f: 0, v: 0 }; e.sifK = 0; sifP = null; sifProx = 0; toast('SIF REINICIADO'); }
    else if (a === 'x_visita') { cerrar(); e.proxVisita = 0; setTimeout(visitaAdm, 700); return; }
    else if (a === 'x_temp') { const o = [null, 'hal', 'nav', 'val', 'none']; admTemp = o[(o.indexOf(admTemp) + 1) % o.length]; }
    else if (a === 'x_clima') { const o = [null, 'sol', 'nublado', 'lluvia', 'tormenta', 'nieve', 'arcoiris']; admClima = o[(o.indexOf(admClima) + 1) % o.length]; }
    else if (a === 'x_mis') { e.mis = null; e.preg = null; e.adv = { f: '', n: 0 }; toast('MISIONES REINICIADAS'); }
    else if (a === 'x_regalo') { e.ultimoRegalo = ''; toast('REGALO DIARIO REINICIADO'); }
    else if (a === 'x_salir') { salirAdmin(); return; }
    render();
  }

  /* ===================== COMIDA ESPECIAL ===================== */
  function cardComida(k) {
    const F = COMIDAS[k], n = e.comida[k] || 0; let b;
    if (nivel() < F.nv) b = `<div class="est bloq">CARIÑO NV${F.nv}</div>`;
    else b = `<button class="bt ${e.monedas >= F.p ? 'ok' : 'no'}" data-a="f_comprar" data-k="${k}">$ ${F.p}</button>`;
    return `<div class="card"><div class="pv"><canvas data-prev="fd_${k}"></canvas></div><div class="cn">${F.n}</div><div style="font-size:6px;color:#4a5090;line-height:1.5">${F.rand ? '¡SORPRESA!' : 'ENERGÍA +' + F.e}</div>${b}<div style="font-size:6px;color:#4a5090">TIENES: ${n}</div></div>`;
  }
  function comprarComida(k) {
    const F = COMIDAS[k];
    if (nivel() < F.nv) { toast('Necesitas cariño nivel ' + F.nv); sfx.no(); return; }
    if (e.monedas < F.p) { faltanMon(F.p - e.monedas); sfx.no(); return; }
    if ((e.comida[k] || 0) >= 99) { toast('Ya tienes demasiadas'); return; }
    e.monedas -= F.p; animarMonedas(F.p, true); e.comida[k] = (e.comida[k] || 0) + 1; e.st.compras++; sfx.compra(); toast('¡COMPRASTE: ' + F.n.toUpperCase() + '!'); pintar(); guardar(); render();
  }
  function elegirSorpresa() { let t = SORPRESAS.reduce((a, o) => a + o.w, 0) * Math.random(); for (const o of SORPRESAS) { t -= o.w; if (t <= 0) return o; } return SORPRESAS[0]; }
  function darComida(id) {
    if (e.dormido) { decir('Zzz...'); sfx.no(); return; }
    if (id === 'keke') {
      if (!introActiva) {
        if (!e.kk || e.kk.f !== hoy()) e.kk = { f: hoy(), n: 0 };
        if (kekesQuedan() > 0) e.kk.n++;   // gratis: cuenta siempre, aunque Simon ya esté lleno
        else if (e.monedas >= KEKE_P) {
          e.monedas -= KEKE_P;
          animarMonedas(KEKE_P, true);
          sfx.compra();
          pintar();
        }
        else { decir('Sí... (ya no queda keke por hoy)'); sfx.no(); toast('SIN MONEDAS SUFICIENTES (' + KEKE_P + ' MONEDAS)'); return; }
      }
      e.kkTot = (e.kkTot == null ? (e.st.comer || 0) : e.kkTot) + (introActiva ? 0 : 1);
      accion(comer); render();
      if ((e.kkTot || 0) >= 1000 && !e.tiene.gorro_chef) setTimeout(chefPremio, 900);
      return;
    }
    const F = COMIDAS[id]; if (!F || !(e.comida[id] > 0)) return;
    if (e.hambre > 95 && e.energia > 95 && e.feliz > 95) { decir('Sí. (estoy lleno de todo)'); hablar(); sfx.no(); return; }
    act = null; const o = F.rand ? elegirSorpresa() : F, antes = e.energia, antesH = e.hambre;
    e.comida[id]--; if (!e.comida[id]) delete e.comida[id];
    lanzar('c_' + id, SX + 20, SY - 22, 0, 6, 11); sfx.comer();
    e.hambre = clamp(e.hambre + (o.h || 0)); e.energia = clamp(e.energia + (o.e || 0)); e.feliz = clamp(e.feliz + (o.f || 0));
    const h = hoy(); if (e.ultComer !== h) { const dd = e.ultComer ? difDias(e.ultComer, h) : null; e.rachaComer = dd === 1 ? e.rachaComer + 1 : 1; e.ultComer = h; e.mejorComer = Math.max(e.mejorComer || 0, e.rachaComer); }
    e.st.comer++; e.probo[id] = 1; ganar(1, 3); mision('comer'); responder(o.t); corazones(2);
    if (o.fx) gesto(o.fx);
    const ganadoE = Math.round(e.energia - antes);
    const ganadoH = Math.round(e.hambre - antesH);
    if (ganadoE > 0 && ganadoH > 0) toast('COMIDA +' + ganadoH + ' · ENERGÍA +' + ganadoE);
    else if (ganadoE > 0) toast('ENERGÍA +' + ganadoE);
    else if (ganadoH > 0) toast('COMIDA +' + ganadoH);
    if ((o.e || 0) >= 60 && !celQ.length && modal !== 'celebra') { sfx.nivel(); estrellas(5); }
    pintar(); guardar(); render();
  }
  // (KEKE_DIA, KEKE_P definidos en config.js)
  function kekesQuedan() { const k = e.kk && e.kk.f === hoy() ? e.kk.n : 0; return Math.max(0, KEKE_DIA - k); }
  function renderComida() {
    $('m-titulo').textContent = 'ALIMENTAR';
    const ids = Object.keys(COMIDAS).filter(k => e.comida[k] > 0).sort((a, b) => {
      const ca = COMIDAS[a], cb = COMIDAS[b];
      return (cb.nv - ca.nv) || (cb.p - ca.p) || (((cb.e || 0) + (cb.h || 0)) - ((ca.e || 0) + (ca.h || 0)));
    });
    const card = (k, nombre, extra, sub) => `<div class="card"><div class="pv"><canvas data-prev="fd_${k}"></canvas></div><div class="cn">${nombre}</div><div style="font-size:6px;color:#4a5090;line-height:1.4">${sub}</div><button class="bt ok" data-a="f_dar" data-k="${k}">DAR</button></div>`;
    return `<div class="saldo" style="align-items:center;margin-bottom:8px"><div style="display:flex;align-items:center;gap:10px"><span style="display:flex;align-items:center;gap:4px"><canvas data-prev="ic_ham"></canvas>${Math.round(e.hambre)}</span><span style="display:flex;align-items:center;gap:4px"><canvas data-prev="ic_ene"></canvas>${Math.round(e.energia)}</span></div><button class="bt ok" style="padding:4px 8px;font-size:6px;margin:0;line-height:1" data-a="f_ir_tienda">COMPRAR</button></div><div class="cuadricula mini" style="grid-template-columns:repeat(3,1fr);gap:8px 6px">` +
      (() => {
        const kPagando = !introActiva && kekesQuedan() === 0;
        const kPuede = introActiva || kekesQuedan() > 0 || e.monedas >= KEKE_P;
        const kClase = !kPuede ? 'no' : (kPagando ? 'pago' : 'ok');
        const kTxt = !kPagando ? 'DAR' : (e.monedas >= KEKE_P ? '🪙 COMPRAR · ' + KEKE_P : '🪙 SIN MONEDAS');
        return `<div class="card"><div class="pv"><canvas data-prev="fd_keke"></canvas><span class="pv-cant${kPagando ? ' agot' : ''}">x${introActiva ? '∞' : kekesQuedan()}</span></div><div class="cn">KEKE</div><div style="font-size:6px;color:#4a5090;line-height:1.4;display:flex;align-items:center;justify-content:center;gap:3px"><span style="display:inline-flex;align-items:center;gap:1px"><canvas class="ic-sub" data-prev="ic_ham"></canvas>+25</span> · <span style="color:#a04800">⚡+1</span></div><button class="bt ${kClase}" data-a="f_dar" data-k="keke">${kTxt}</button></div>`;
      })() +
      ((e.meds || 0) > 0 ? `<div class="card"><div class="pv"><canvas data-prev="fd_jarabe"></canvas><span class="pv-cant">x${e.meds}</span></div><div class="cn">JARABE</div><div style="font-size:6px;color:#4a5090;line-height:1.4">${e.enf ? 'CURA RESFRIADO' : 'SOLO SI ESTÁ RESFRIADO'}</div><button class="bt ${e.enf ? 'ok' : 'no'}" data-a="med_usar">USAR</button></div>` : '') +
      ids.map(k => {
        const c = COMIDAS[k];
        let statText = '';
        if (c.rand) statText = '¡SORPRESA!';
        else {
          const p = [];
          if (c.h > 0) p.push(`<span style="display:inline-flex;align-items:center;gap:1px"><canvas class="ic-sub" data-prev="ic_ham"></canvas>+${c.h}</span>`);
          if (c.e > 0) p.push(`<span style="color:#a04800">⚡+${c.e}</span>`);
          statText = p.join(' · ');
        }
        return `<div class="card"><div class="pv"><canvas data-prev="fd_${k}"></canvas><span class="pv-cant">x${e.comida[k]}</span></div><div class="cn">${c.n}</div><div style="font-size:6px;color:#4a5090;line-height:1.4;display:flex;align-items:center;justify-content:center;gap:3px">${statText}</div><button class="bt ok" data-a="f_dar" data-k="${k}">DAR</button></div>`;
      }).join('') +
      (petActiva('pet_sif') ? `<div class="card"><div class="pv"><canvas data-prev="fd_pl_kekeperro"></canvas><span class="pv-cant">x${e.sifK || 0}</span></div><div class="cn">KEKE PARA PERRO</div><div style="font-size:6px;color:#4a5090;line-height:1.4">COMIDA SIF</div><button class="bt ${e.sifK > 0 ? 'ok' : 'no'}" data-a="f_sif">DAR</button></div>` : '') + `</div>` +
      ((ids.length || (e.meds || 0) > 0) ? '' : `<div class="centro" style="font-size:7px;color:#aab4ff;margin-top:12px;line-height:1.9">Toca COMPRAR para conseguir más comida.</div>`);
  }

  /* ===================== DECORAR EL CUARTO ===================== */
  const ptoLog = ev => { const r = cv.getBoundingClientRect(); return { x: (ev.clientX - r.left) / r.width * LW, y: (ev.clientY - r.top) / r.height * LH }; };
  function edTap(el, fn) {   // actúa solo si fue un toque real; si el dedo se movió (deslizando la lista para hacer scroll), no hace nada
    let sx = 0, sy = 0, pid = null, mov = false;
    el.addEventListener('pointerdown', ev => { pid = ev.pointerId; sx = ev.clientX; sy = ev.clientY; mov = false; });
    el.addEventListener('pointermove', ev => { if (ev.pointerId !== pid) return; if (Math.hypot(ev.clientX - sx, ev.clientY - sy) > 9) mov = true; });
    const fin = ev => { if (ev.pointerId !== pid) return; pid = null; if (!mov) { ev.preventDefault(); fn(ev); } };
    el.addEventListener('pointerup', fin); el.addEventListener('pointercancel', () => { pid = null; mov = false; });
  }
  const filtroCat = k => { const it = ITEMS[k]; return it.semilla ? 'flores' : (it.slot === 'decoP' || it.estilo === 'pared') ? 'pared' : 'piso'; };
  const FILTRO_NOM = { disp: 'COLOCAR', pared: 'PARED', piso: 'PISO', flores: 'FLORES' };
  function pintarEdLista() {
    const bd = $('ed-bd'); bd.innerHTML = '';
    let lista = (edit._todos || []).slice();
    if (edit.filtro && edit.filtro !== 'todo') lista = lista.filter(k => edit.filtro === 'disp' ? usableAqui(k) : (filtroCat(k) === edit.filtro && usableAqui(k)));
    if (edit.buscar) { const q = quitaAc(edit.buscar).toUpperCase(); lista = lista.filter(k => quitaAc(ITEMS[k].n).toUpperCase().includes(q)); }
    const edRango = k => {   // paredes primero, luego pisos, luego el resto de items (según la sección que se esté viendo)
      const it = ITEMS[k];
      if (edit.filtro === 'pared') return it.estilo === 'pared' ? 0 : 1;
      if (edit.filtro === 'piso') return it.estilo === 'piso' ? 0 : 1;
      return it.estilo === 'pared' ? 0 : it.estilo === 'piso' ? 1 : 2;
    };
    lista.sort((a, b) => { const ra = edRango(a), rb = edRango(b); return ra !== rb ? ra - rb : ITEMS[a].n.localeCompare(ITEMS[b].n); });
    lista.forEach(k => {
      const g = prevGrid(k), b = document.createElement('button'), c = document.createElement('canvas'), z = Math.max(1, Math.floor(34 / Math.max(g.w, g.h))), nm = document.createElement('div');
      c.width = g.w; c.height = g.h; c.getContext('2d').drawImage(gridCanvas(g), 0, 0); c.style.width = g.w * z + 'px'; c.style.height = g.h * z + 'px';
      nm.textContent = ITEMS[k].n;
      if (esFondo(k)) {
        const slot = ITEMS[k].slot, activo = e.cuarto[slot] === k, t = temaDe(k), aqui = t === 'todas' || t === e.hab;
        const dot = document.createElement('span'); dot.className = 'mue-dot' + (activo ? ' on' : ''); b.appendChild(dot);
        const ih = t !== 'todas' ? (HAB_ICO[t] || '') : ''; if (ih) { const hs = document.createElement('span'); hs.className = 'mue-hab'; hs.textContent = ih; b.appendChild(hs); }
        b.appendChild(c); b.appendChild(nm);
        if (activo) b.classList.add('sel');
        b.onclick = () => {
          if (!aqui) { toast('Esto solo se puede usar en ' + (HABS.find(h => h.id === t) || {}).n); sfx.no(); return; }
          e.cuarto[slot] = activo ? (DEF_FONDO[slot] || null) : k; sfx.click(); guardar(); pintar(); pintarEdLista();
        };
        bd.appendChild(b);
        return;
      }
      const iAqui = e.deco.findIndex(d => d.k === k && (d.h || 'sala') === e.hab), colocado = e.deco.some(d => d.k === k);
      const dot = document.createElement('span'); dot.className = 'mue-dot' + (colocado ? ' on' : ''); b.appendChild(dot);
      const ih = iconoHabDe(k); if (ih) { const hs = document.createElement('span'); hs.className = 'mue-hab'; hs.textContent = ih; b.appendChild(hs); }
      b.appendChild(c); b.appendChild(nm);
      if (iAqui >= 0 && edit.sel === iAqui) b.classList.add('sel');
      if (iAqui >= 0) {
        if (muProtegido(k)) edTap(b, () => { edit.sel = iAqui; sfx.click(); pintarEdicion(); });
        else edTap(b, () => { e.deco.splice(iAqui, 1); edit.sel = null; sfx.click(); guardar(); pintarEdicion(); });   // tocar un item ya colocado aquí lo quita; mover/voltear se hace tocándolo en la escena
      } else {
        const colocarEnPunto = ptEv => {
          if (!colocar(k)) return;
          const j = e.deco.findIndex(d => d.k === k), d = e.deco[j];
          if (ptEv && !(d.h === 'estudio' && ITEMS[k].zona)) {
            const p = ptoLog(ptEv); d.x = Math.round(p.x - LW / 2); d.y = Math.round(p.y - RY);
            const r = posReal(d); d.x = Math.round(r.cx - LW / 2); d.y = Math.round((esPared(k) ? r.cy : r.base) - RY);
          }
          edit.sel = j; sfx.compra(); guardar(); pintarEdicion();
        };
        edTap(b, () => colocarEnPunto(null));
      }
      bd.appendChild(b);
    });
    if (!bd.children.length) {
      const t = document.createElement('div'); t.style.cssText = 'font-size:7px;color:#aab4ff;line-height:1.8';
      t.textContent = (edit.buscar || (edit.filtro && edit.filtro !== 'todo')) ? 'No hay nada que coincida con eso.' : 'Aún no tienes muebles. ¡Visita la TIENDA!';
      bd.appendChild(t);
    }
  }
  function pintarEdicion() {
    { const I = capaInfo(); $('ed-capa-ctrl').classList.toggle('off', !I); $('ed-ci').textContent = I ? I.pos + '/' + I.mis.length : '-'; }
    const todos = Object.keys(ITEMS).filter(k => e.tiene[k] && (esFondo(k) || (esMueble(k) && ITEMS[k].slot !== 'juguete')));   // los exclusivos de otra habitación igual se listan (con su icono); al tocarlos, avisa si no van aquí
    edit._todos = todos;
    const fi = $('ed-filtros');
    const cats = [['todo', 'TODO', todos.length]];
    Object.keys(FILTRO_NOM).forEach(id => { const c = todos.filter(k => id === 'disp' ? usableAqui(k) : (filtroCat(k) === id && usableAqui(k))).length; if (c) cats.push([id, FILTRO_NOM[id], c]); });
    if (!cats.some(c => c[0] === edit.filtro)) edit.filtro = 'todo';
    fi.innerHTML = cats.map(([id, n, c]) => `<button class="${edit.filtro === id ? 'on' : ''}" data-fi="${id}">${n} (${c})</button>`).join('');
    fi.querySelectorAll('button').forEach(b => b.onclick = () => { edit.filtro = b.dataset.fi; sfx.click(); fi.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); pintarEdLista(); });
    pintarEdLista();
    posEdOverlay();
  }
  const muProtegido = k => !ITEMS[k] || ITEMS[k].fija || ITEMS[k].slot === 'juguete';
  function posEdOverlay() {
    const bf = $('ed-ov-f'), bx = $('ed-ov-x');
    const d = modal === 'editar' && edit && edit.sel != null ? e.deco[edit.sel] : null;
    if (!d || (d.h || 'sala') !== e.hab || !ITEMS[d.k] || muProtegido(d.k)) { bf.classList.remove('on'); bx.classList.remove('on'); return; }
    const sc = cv.getBoundingClientRect(); if (!sc.width) { bf.classList.remove('on'); bx.classList.remove('on'); return; }
    const r = posReal(d), k = sc.width / LW;
    const left = sc.left + r.x * k, top = sc.top + r.y * k, w = r.w * k, h = r.h * k;
    bf.style.left = Math.round(left - 8) + 'px'; bf.style.top = Math.round(top - 8) + 'px';
    bx.style.left = Math.round(left + w - 9) + 'px'; bx.style.top = Math.round(top - 8) + 'px';
    bf.classList.add('on'); bx.classList.add('on');
  }
  $('ed-ov-f').onclick = () => { if (!edit || edit.sel == null) return; const d = e.deco[edit.sel]; if (!d || muProtegido(d.k)) return; d.f = d.f ? 0 : 1; sfx.click(); guardar(); };
  $('ed-ov-x').onclick = () => { if (!edit || edit.sel == null) return; const d = e.deco[edit.sel]; if (!d || muProtegido(d.k)) return; e.deco.splice(edit.sel, 1); edit.sel = null; sfx.click(); guardar(); pintarEdicion(); };
  function entrarEdicion(k) {
    tutRes(null);
    if (lugar || calle || vistaBloq) { toast('Aquí no puedes usar esto'); sfx.no(); return; }
    lugar = null; llegada = null; pintarNav();
    modal = null; { const vs = $('t-sheet'); if (vs) vs.remove(); } $('modal').classList.remove('on', 'sheet'); $('escena').classList.remove('alto'); act = null;
    $('edicion').classList.remove('min'); pintarOjo(); calcPiso();
    const edInp = $('ed-buscar'), edBx = $('ed-buscar-x');
    if (edInp) edInp.value = '';
    if (edBx) edBx.style.display = 'none';
    edit = { sel: null, drag: null, filtro: 'todo', buscar: '' }; modal = 'editar'; document.body.classList.add('editando'); $('edicion').classList.add('on');
    if (k && colocar(k)) edit.sel = e.deco.findIndex(d => d.k === k);
    pintarEdicion(); sfx.click(); navPush();
  }
  const OJO = { a: ['....wwwww....', '..ww.....ww..', '.w...kkk...w.', 'w....kkk....w', '.w...kkk...w.', '..ww.....ww..', '....wwwww....'], c: ['.............', 'w...........w', '.ww.......ww.', '...wwwwwww...', '.w..w.w.w..w.', '.............', '.............'] };
  function pintarOjo2() {
    const m = OJO[$('foco-fv').classList.contains('min') ? 'c' : 'a'], g = Grid(13, 7);
    m.forEach((f, y) => [...f].forEach((ch, x) => { if (ch === 'w') g.set(x, y, '#e8ecff'); else if (ch === 'k') g.set(x, y, '#ffd84a'); }));
    const c = $('ic-eye2').getContext('2d'); c.clearRect(0, 0, 13, 7); c.drawImage(gridCanvas(g), 0, 0);
  }
  function pintarOjo() {
    const cerrado = $('edicion').classList.contains('min'), m = OJO[cerrado ? 'c' : 'a'], g = Grid(13, 7);
    m.forEach((f, y) => [...f].forEach((ch, x) => { if (ch === 'w') g.set(x, y, '#e8ecff'); else if (ch === 'k') g.set(x, y, '#ffd84a'); }));
    const c = $('ic-eye').getContext('2d'); c.clearRect(0, 0, 13, 7); c.drawImage(gridCanvas(g), 0, 0);
  }
  $('foco-e').onclick = () => { $('foco-fv').classList.toggle('min'); sfx.click(); pintarOjo2(); };
  pintarOjo2();
  $('ed-eye').onclick = () => { $('edicion').classList.toggle('min'); sfx.click(); pintarOjo(); };
  $('ed-trash').onclick = () => { sfx.click(); $('ed-confirm').classList.add('on'); };
  $('ed-conf-no').onclick = () => { sfx.click(); $('ed-confirm').classList.remove('on'); };
  $('ed-conf-si').onclick = () => {
    $('ed-confirm').classList.remove('on');
    e.deco = e.deco.filter(d => (d.h || 'sala') !== e.hab || muProtegido(d.k));
    const ps = e.hab === 'sala' ? 'pared' : 'pared_' + e.hab, fs = e.hab === 'sala' ? 'piso' : 'piso_' + e.hab;
    e.cuarto[ps] = DEF_FONDO[ps] || null; e.cuarto[fs] = DEF_FONDO[fs] || null;
    if (edit) edit.sel = null;
    sfx.click(); guardar(); pintar(); pintarEdicion(); toast('Habitación reiniciada');
  };
  const edBx = $('ed-buscar-x');
  $('ed-buscar').oninput = () => {
    if (!edit) return;
    edit.buscar = $('ed-buscar').value;
    if (edBx) edBx.style.display = edit.buscar ? 'flex' : 'none';
    pintarEdLista();
  };
  if (edBx) {
    edBx.onclick = () => {
      if (!edit) return;
      edit.buscar = '';
      $('ed-buscar').value = '';
      edBx.style.display = 'none';
      $('ed-buscar').focus();
      sfx.click();
      pintarEdLista();
    };
  }
  (function () {
    const grip = $('ed-grip'), bd = $('ed-bd'); let gArr = false, gY = 0, gH = 0;
    const MIN_H = 70, maxH = () => Math.max(MIN_H + 40, Math.round(window.innerHeight * .56));
    grip.addEventListener('pointerdown', ev => { gArr = true; gY = ev.clientY; gH = bd.getBoundingClientRect().height; try { grip.setPointerCapture(ev.pointerId); } catch (_) {} ev.preventDefault(); });
    grip.addEventListener('pointermove', ev => { if (!gArr) return; const h = Math.max(MIN_H, Math.min(maxH(), Math.round(gH + (gY - ev.clientY)))); bd.style.height = h + 'px'; bd.style.maxHeight = h + 'px'; });
    const gSuelta = () => { gArr = false; }; grip.addEventListener('pointerup', gSuelta); grip.addEventListener('pointercancel', gSuelta);
  })();
  (function () {
    const grip = $('vs-grip'), vc = $('m-cuerpo'); let gArr = false, gY = 0, gH = 0;
    const MIN_H = 90, maxH = () => Math.max(MIN_H + 60, Math.round(window.innerHeight * .62));
    grip.addEventListener('pointerdown', ev => { gArr = true; gY = ev.clientY; gH = vc.getBoundingClientRect().height; try { grip.setPointerCapture(ev.pointerId); } catch (_) {} ev.preventDefault(); });
    grip.addEventListener('pointermove', ev => {
      if (!gArr) return;
      const h = Math.max(MIN_H, Math.min(maxH(), Math.round(gH + (gY - ev.clientY))));
      vc.style.height = h + 'px'; vc.style.maxHeight = h + 'px';
      const vt = grip.closest('.ventana'); if (vt) vt.style.maxHeight = 'none';
    });
    const gSuelta = () => { gArr = false; }; grip.addEventListener('pointerup', gSuelta); grip.addEventListener('pointercancel', gSuelta);
  })();
  function salirEdicion(hPop = true) { $('edicion').classList.remove('min'); edit = null; modal = null; document.body.classList.remove('editando'); $('edicion').classList.remove('on'); $('ed-ov-f').classList.remove('on'); $('ed-ov-x').classList.remove('on'); pintar(); guardar(); toast('Habitación guardada'); sfx.compra(); setTimeout(saludar, 800); if (celQ.length) setTimeout(celebraCheck, 50); if (hPop) navPop(); }
  function editDown(ev) {
    const p = ptoLog(ev); let hit = -1, mejor = -1e9;
    e.deco.forEach((d, i) => { if (!ITEMS[d.k] || (d.h || 'sala') !== e.hab) return; const r = posReal(d); if (p.x >= r.x - 2 && p.x <= r.x + r.w + 2 && p.y >= r.y - 2 && p.y <= r.y + r.h + 2) { const pr = (esPared(d.k) || r.base <= SY + SH - 12 ? 0 : 100000) + i; if (pr > mejor) { mejor = pr; hit = i; } } });
    if (hit < 0) { edit.sel = null; edit.drag = null; }
    else { edit.sel = hit; const d = e.deco[hit], r = posReal(d); edit.drag = { ox: p.x - r.cx, oy: p.y - (esPared(d.k) ? r.cy : r.base) }; sfx.click(); try { cv.setPointerCapture(ev.pointerId); } catch (_) {} }
    pintarEdicion();
  }
  function editMove(ev) {
    if (!edit || !edit.drag || edit.sel == null) return;
    const pn = $('edicion'); { const bajo = ev.clientY >= pn.getBoundingClientRect().top - 24; pn.classList.toggle('suelto', bajo); document.body.classList.toggle('sueltoUI', bajo); }   // el menú se vuelve invisible al arrastrar hacia su zona
    const p = ptoLog(ev), d = e.deco[edit.sel]; if (d.h === 'estudio' && ITEMS[d.k].zona) { estSnap(d, p); dibujar(); posEdOverlay(); return; } d.x = Math.round(p.x - edit.drag.ox - LW / 2); d.y = Math.round(p.y - edit.drag.oy - RY);
    const r = posReal(d); d.x = Math.round(r.cx - LW / 2); d.y = Math.round((esPared(d.k) ? r.cy : r.base) - RY);
    dibujar(); posEdOverlay();
  }
  const dDelante = d => { const r = posReal(d); return !esPared(d.k) && r.base > SY + SH - 12; };
  function capaInfo() {
    if (!edit || edit.sel == null) return null; const d = e.deco[edit.sel]; if (!d || (d.h || 'sala') === 'estudio') return null;
    const mis = e.deco.map((x, i) => i).filter(i => ITEMS[e.deco[i].k] && (e.deco[i].h || 'sala') === (d.h || 'sala') && dDelante(e.deco[i]) === dDelante(d));
    return { d, mis, pos: mis.indexOf(edit.sel) + 1 };
  }
  function mover(dir) {
    const I = capaInfo(); if (!I) { sfx.no(); return; }
    const i = edit.sel, ri = posReal(I.d), sol = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
    const cand = I.mis.filter(j => dir > 0 ? j > i : j < i).filter(j => sol(ri, posReal(e.deco[j])));
    if (!cand.length) { sfx.no(); toast(dir > 0 ? 'Nada lo tapa: ya está al frente' : 'Nada lo cubre: ya está al fondo'); return; }
    const j = dir > 0 ? cand[0] : cand[cand.length - 1], [it] = e.deco.splice(i, 1); e.deco.splice(j, 0, it); edit.sel = j;
    sfx.click(); guardar(); pintarEdicion();
  }
  $('ed-adel').onclick = () => mover(1); $('ed-atras').onclick = () => mover(-1);
  function editUp() { $('edicion').classList.remove('suelto'); document.body.classList.remove('sueltoUI'); if (edit && edit.drag) { edit.drag = null; guardar(); } posEdOverlay(); }
  cv.addEventListener('pointermove', ev => { if (ban) banMove(ev); }); cv.addEventListener('pointerup', banUp); cv.addEventListener('pointercancel', banUp);
  cv.addEventListener('pointermove', editMove); cv.addEventListener('pointerup', editUp); cv.addEventListener('pointercancel', editUp);
  $('ed-x').onclick = salirEdicion;
  $('t-mis').onclick = () => { if (dlg || tutMenuBloq('misiones') || guiaBloq('misiones') || modal) return; sfx.click(); abrir('misiones'); };
  $('b-vestir').onclick = () => {
    if (lugar || calle || vistaBloq) { toast('Aquí no puedes usar esto'); sfx.no(); return; }
    menuAbrir('vestir');
  };
  function iconoVes() {
    const g = Grid(11, 11), m = [
      '....ww.....',
      '...w..w....',
      '......w....',
      '.....w.....',
      '.....w.....',
      '....www....',
      '...w...w...',
      '..w.....w..',
      '.w.......w.',
      'wwwwwwwwwww',
      '...........'
    ];
    m.forEach((f, y) => [...f].forEach((ch, x) => {
      if (ch === 'w') g.set(x, y, '#e8ecff');
    }));
    return g;
  }
  $('b-editar').onclick = () => {
    tutRes(null);
    if (dlg || tutMenuBloq()) return;
    if (lugar || calle || vistaBloq) { toast('Aquí no puedes usar esto'); sfx.no(); return; }
    if (guiaBloq()) return;
    if (modal && modal !== 'editar') {
      if (['run', 'mem', 'rt'].includes(modal)) return;
      cerrar();
    }
    entrarEdicion();
  };
  function iconoEdi() {
    const g = Grid(11, 11), m = ['.....w.....', '....www....', '...wwwww...', '..wwwwwww..', '.wwwwwwwww.', 'wwwwwwwwwww', '.wwwwwwwww.', '.wwwkkkwww.', '.wwwkkkwww.', '.wwwkkkwww.', '...........'];
    m.forEach((f, y) => [...f].forEach((ch, x) => { if (ch === 'w') g.set(x, y, '#e8ecff'); else if (ch === 'k') g.set(x, y, '#232b63'); }));
    return g;
  }

  // (Sección de MINIJUEGOS ARCADE movida a minijuegos.js)

/* ===================== INVENTARIO ===================== */
  let invTab = 'ropa';
  function iconoInv() {
    const g = Grid(11, 11), m = ['...kkkkk...', '..kwwwwwk..', '..kwkkkwk..', '.kwwwwwwwk.', 'kwwwkkkwwwk', 'kwwkyyykwwk', 'kwwwwwwwwwk', 'kwwwkkkwwwk', 'kwwwwwwwwwk', '.kwwwwwwwk.', '..kkkkkkk..'];
    m.forEach((f, y) => [...f].forEach((ch, x) => { if (ch === 'w') g.set(x, y, '#e8ecff'); else if (ch === 'k') g.set(x, y, '#232b63'); else if (ch === 'y') g.set(x, y, '#ffd84a'); }));
    return g;
  }
  /* ===================== VESTIR A SIMON (probar ropa y guardar) ===================== */
  const vsCambios = () => !!vSnap && Object.keys(e.ropa).some(sl => (e.ropa[sl] || null) !== (vSnap[sl] || null));
  function vsCancel() {
    if (!vSnap) return; const hubo = vsCambios();
    Object.keys(vSnap).forEach(sl => { e.ropa[sl] = vSnap[sl]; }); Object.keys(e.ropa).forEach(sl => { if (!(sl in vSnap)) e.ropa[sl] = null; });
    vSnap = null; pintar(); if (hubo) toast('SIN CAMBIOS: SIMON VUELVE A SU ATUENDO');
  }
  function vsGuardar() {
    const ant = vSnap, nuevos = Object.keys(e.ropa).filter(sl => e.ropa[sl] && e.ropa[sl] !== (ant[sl] || null)).map(sl => e.ropa[sl]);
    vSnap = null;
    if (nuevos.length) { mision('ropa'); const k = nuevos.find(x => ROPA_COM[x]); if (k) ropaPend = k; sfx.regalo(); gesto('besos'); corazones(3); toast('¡LISTO! SIMON SE VE GENIAL'); } else sfx.click();
    pintar(); guardar(); cerrar();
  }
  function renderSimonInfo() {
    $('m-titulo').textContent = 'SIMON';
    const n = nivel(), xpA = xpDe(n), xpB = n >= NMAX ? xpA + 1 : xpDe(n + 1);
    const barra = (v, c) => `<div class="barra" style="margin-top:3px"><div style="width:${Math.max(0, Math.min(100, v))}%;background:${c}"></div></div>`;
    const hp = v => `<div class="hp"><div class="hpf ${v > 50 ? 'ok' : v > 25 ? 'medio' : 'bajo'}" style="width:${Math.max(4, v)}%"></div></div>`;
    const tarjeta = `<div class="card si-card">` +
      `<div class="si-pv"><canvas data-prev="si_card"></canvas></div>` +
      `<div class="cn">SIMON</div>` +
      `<div style="font-size:6px;color:#4a5090;margin-top:-4px">NV ${n}${n >= NMAX ? ' MAX' : ''}</div>` +
      `</div>`;
    const mascotas = [];
    if (petActiva('pet_sif')) mascotas.push(['pet_sif', 'SIF']);
    if (ojoAct()) mascotas.push(['ojo_pet', 'OJO']);
    const pets = mascotas.length ? `<div class="mini-pet-row">` + mascotas.map(([k, nm]) => `<div class="mini-pet" title="${nm}"><canvas data-prev="${k}"></canvas></div>`).join('') + `</div>` : '';
    const izq = `<div style="display:flex;flex-direction:column;gap:6px">${tarjeta}${pets}</div>`;
    let info = `<div style="color:#aab4ff;font-size:7px">NIVEL ${n}${n >= NMAX ? ' · MÁXIMO' : ''}</div>` +
      (n < NMAX ? barra((e.xp - xpA) / (xpB - xpA) * 100, '#ffd84a') : '') +
      `<div class="saldo" style="margin-top:8px"><span style="display:flex;align-items:center;gap:4px"><canvas data-prev="ic_mon"></canvas>${e.monedas}</span><span style="display:flex;align-items:center;gap:4px"><canvas data-prev="ic_fuego"></canvas>${racha()}</span></div>`;
    info += [
      ['ic_ham', 'HAMBRE', e.hambre], ['ic_ene', 'ENERGÍA', e.energia], ['ic_fel', 'FELICIDAD', e.feliz], ['ic_lim', 'LIMPIEZA', e.limp]
    ].map(([ic, nm, v]) => `<div class="si-stat"><canvas data-prev="${ic}"></canvas>${hp(v)}<span class="sl">${Math.round(v)}%</span></div>`).join('');
    let h = `<div style="display:flex;align-items:flex-start;gap:10px">${izq}<div style="flex:1;min-width:0">${info}</div></div>`;
    const buffs = [];
    if (e.enf) buffs.push(['fd_jarabe', 'RESFRIADO', 'Simon tiene fiebre y frío. Dale jarabe o abrígalo con bufanda/capa.']);
    Object.keys(SEMILLAS).forEach(k => { if (macetaGlobal(k)) buffs.push(['sm_' + k, SEMILLAS[k].n, SEMILLAS[k].efecto]); });
    if (petActiva('pet_sif')) buffs.push(['pet_sif', 'SIF', 'Jugar con Simon le quita 10% menos de energía.']);
    if (ojoAct()) buffs.push(['ojo_pet', 'OJO', 'Simon duerme 10% más rápido.']);
    if (simonLevita()) buffs.push(['aura_eterna', 'LEVITANDO', 'Aura puesta + Semilla Eterna viva: Simon flota.']);
    h += `<div style="margin-top:14px;font-size:7px;color:#aab4ff">VENTAJAS ACTIVAS</div>`;
    h += buffs.length ? buffs.map(([ic, bn, bd]) => `<div class="buff-row"><div class="buff-ic"><canvas data-prev="${ic}"></canvas></div><div class="buff-tx"><b>${bn}</b><span>${bd}</span></div></div>`).join('') :
      `<div class="centro" style="font-size:7px;color:#aab4ff;margin:8px 0">Ninguna por ahora. Las plantas y mascotas de Simon dan ventajas.</div>`;
    const M = misionesHoy(), ok = M.ids.filter(i => M.ok[i]).length;
    h += `<div style="margin-top:12px;font-size:7px;color:#aab4ff">MISIONES DE HOY: ${ok}/${M.ids.length}</div>`;
    h += `<div style="margin-top:14px"><button class="bt ok" style="width:100%" data-a="vs_open">VESTIR A SIMON</button></div>`;
    return h;
  }
  function renderVest() {
    $('m-titulo').textContent = '';
    const ropa = Object.keys(ITEMS).filter(k => ITEMS[k].tipo === 'ropa' && (ITEMS[k].mascota ? tienePet(k) : e.tiene[k])).sort((a, b) => (ITEMS[a].nv || 1) - (ITEMS[b].nv || 1) || (ITEMS[a].p || 0) - (ITEMS[b].p || 0));
    const ks = vF === 'todo' ? ropa.filter(k => !ITEMS[k].mascota) : vF === 'mascota' ? ropa.filter(k => ITEMS[k].slot === 'mascota') : ropa.filter(k => ITEMS[k].slot === vF && !ITEMS[k].mascota);
    const cam = vsCambios();
    let h = `<div class="th-chips" style="margin:-6px 0 8px">${ROPA_SLOTS.filter(([f]) => f !== 'prem').map(([f, t]) => `<button class="${vF === f ? 'on' : ''}" data-a="vs_f" data-k="${f}">${t}</button>`).join('')}</div>`;
    if (vF === 'mascota') {
      const activas = petsActivas();
      const hay = ropa.filter(k => ITEMS[k].slot === 'mascota');
      h += `<div style="font-size:7px;color:#aab4ff;text-align:center;margin-bottom:8px">ACTIVAS: ${activas.length}/3 — toca para poner o quitar</div>`;
      h += hay.length ? `<div class="vs-g">${hay.map(k => `<button class="vs-t ${petActiva(k) ? 'on' : ''}" data-a="vs_pet" data-k="${k}"><div class="vs-pv"><canvas data-prev="${k}"></canvas></div><span>${ITEMS[k].n}</span>${petActiva(k) ? '<span style="font-size:5px;color:#6adf6a">ACTIVA</span>' : (activas.length >= 3 ? '<span style="font-size:5px;color:#ff7a7a">LLENO</span>' : '')}</button>`).join('')}</div>` : `<div class="centro" style="font-size:7px;color:#aab4ff;margin:18px 0">Aún no tienes mascotas.</div>`;
    } else {
      h += ks.length ? `<div class="vs-g">${ks.map(k => `<button class="vs-t ${e.ropa[ITEMS[k].slot] === k ? 'on' : ''}" data-a="vs_t" data-k="${k}"><div class="vs-pv"><canvas data-prev="${k}"></canvas></div><span>${ITEMS[k].n}</span></button>`).join('')}</div>` : `<div class="centro" style="font-size:7px;color:#aab4ff;margin:18px 0">No tienes nada de esto todavía.</div>`;
    }
    return h;
  }
  var iv = 'hub', ivCat = 'ropa', ivF = 'todo', isel = null, iSheetH = '';
  var jSel = null;   // índice de la parcela del jardín que se está por sembrar (modal 'jardin')
  const IV_CATS = [['ropa', 'ROPA', 'sud_roja'], ['mue', 'MUEBLES', 'cactus'], ['jug', 'JUGUETES', 'juguete_azul'], ['fon', 'PAREDES Y OBRAS', 'pared_azul'], ['ext', 'EXTRAS', 'fd_bomba'], ['mas', 'MASCOTAS', 'ojo_pet']];
  const habN = id => { const h = HABS.find(x => x.id === id); return h ? h.n : id.toUpperCase(); };
  function invListas() {
    const tiene = k => ITEMS[k] && e.tiene[k];
    const todos = Object.keys(ITEMS).filter(tiene);
    const L = {
      ropa: todos.filter(k => ITEMS[k].tipo === 'ropa'),
      mue: todos.filter(k => esMueble(k) && ITEMS[k].slot !== 'juguete'),
      jug: todos.filter(k => ITEMS[k].slot === 'juguete'),
      fon: todos.filter(k => ITEMS[k].tipo === 'cuarto' && !esMueble(k)),
      com: Object.keys(COMIDAS).filter(k => e.comida[k] > 0),
      ext: [...((e.bombas || 0) > 0 ? ['bomba'] : []), ...((e.meds || 0) > 0 ? ['jarabe'] : [])],
      mas: [...(tienePet('ojo_pet') ? ['ojo_pet'] : []), ...(tienePet('pet_sif') ? ['pet_sif'] : [])]
    };
    const ord = (a, b) => (puesto(b) ? 1 : 0) - (puesto(a) ? 1 : 0) || (ITEMS[a].nv || 1) - (ITEMS[b].nv || 1) || (ITEMS[a].p || 0) - (ITEMS[b].p || 0);
    ['ropa', 'mue', 'jug', 'fon'].forEach(c => L[c].sort(ord));
    return L;
  }
  const ivPrev = k => k === 'ojo_pet' ? 'ojo_pet' : k === 'pet_sif' ? 'pet_sif' : COMIDAS[k] ? 'fd_' + k : k === 'bomba' ? 'fd_bomba' : k === 'jarabe' ? 'fd_jarabe' : k;
  const ivNom = k => k === 'ojo_pet' ? 'OJO DE CTHULHU' : k === 'pet_sif' ? 'SIF' : COMIDAS[k] ? COMIDAS[k].n : k === 'bomba' ? 'BOMBA' : k === 'jarabe' ? 'JARABE' : ITEMS[k].n;
  function ivEstado(k) {   // etiqueta de la esquina: dónde está o si está en uso
    if (COMIDAS[k]) return ['n', 'x' + e.comida[k]];
    if (k === 'bomba') return ['n', 'x' + (e.bombas || 0)];
    if (k === 'jarabe') return ['n', 'x' + (e.meds || 0)];
    if (k === 'ojo_pet') return e.ojoOn !== 0 ? ['ok', 'CON SIMON'] : ['n', 'GUARDADO'];
    if (k === 'pet_sif') return petActiva(k) ? ['ok', 'ACTIVA'] : ['n', 'INACTIVA'];
    if (esMueble(k)) {
      if (ITEMS[k].slot === 'juguete') return puesto(k) ? ['ok', 'EN USO'] : null;
      const d = e.deco.find(x => x.k === k); return d ? ['ok', habN(d.h || 'sala')] : ['no', 'SIN COLOCAR'];
    }
    return puesto(k) ? ['ok', PORDEFECTO[ITEMS[k].slot] ? 'PUESTO' : 'PUESTO'] : null;
  }
  function hojaInv(k) {
    const it = ITEMS[k]; let info = '', bt = '';
    if (COMIDAS[k]) {
      const F = COMIDAS[k];
      let stats = [];
      if (F.rand) stats.push('¡EFECTO SORPRESA!');
      else {
        if (F.h > 0) stats.push('COMIDA +' + F.h);
        if (F.e > 0) stats.push('ENERGÍA +' + F.e);
      }
      info = stats.join('<br>') + '<br>TIENES: ' + e.comida[k];
      bt = `<button class="bt ok gran" data-a="f_dar" data-k="${k}">DARLE A SIMON</button>`;
    }
    else if (k === 'bomba') { info = 'TIENES: ' + (e.bombas || 0) + '<br>SE LANZA CON EL BOTÓN DE LA ESCENA'; bt = ''; }
    else if (k === 'ojo_pet') { info = (e.ojoOn !== 0 ? 'SIMON DUERME 10% MÁS RÁPIDO' : 'GUARDADO: NO AYUDA A DORMIR'); bt = `<button class="bt ${e.ojoOn !== 0 ? '' : 'ok'} gran" data-a="ojo_tog">${e.ojoOn !== 0 ? 'QUITAR' : 'SACAR'}</button>`; }
    else if (k === 'pet_sif') { const act = petActiva(k); info = 'MASCOTA · EFECTO: JUGAR CANSA 10% MENOS<br>' + (act ? 'ACTIVA ✓' : 'INACTIVA · ACTIVAS: ' + petsActivas().length + '/3'); bt = `<button class="bt ${act || petsActivas().length < 3 ? 'ok' : 'no'} gran" data-a="vs_pet" data-k="${k}">${act ? 'QUITAR' : 'PONER'}</button>`; }
    else if (k === 'jarabe') { info = 'CURA EL RESFRIADO<br>TIENES: ' + (e.meds || 0); bt = `<button class="bt ${e.enf ? 'ok' : 'no'} gran" ${e.enf ? 'data-a="med_usar"' : ''}>${e.enf ? 'USAR' : 'SOLO SI ESTÁ RESFRIADO'}</button>`; }
    else if (esMueble(k)) {
      const d = e.deco.find(x => x.k === k);
      if (it.slot === 'juguete') { info = 'EL QUE USA AL JUGAR'; bt = puesto(k) ? '<div class="est">EN USO</div>' : `<button class="bt ok gran" data-a="poner" data-k="${k}">USAR</button>`; }
      else if (d) { info = 'EN: ' + habN(d.h || 'sala'); bt = `<button class="bt gran" data-a="quitar" data-k="${k}">QUITAR</button>`; }
      else { info = 'SIN COLOCAR'; bt = `<button class="bt ok gran" data-a="poner" data-k="${k}">COLOCAR</button>`; }
    } else {
      if (puesto(k)) { info = 'PUESTO'; bt = PORDEFECTO[it.slot] ? '<div class="est">PUESTO</div>' : `<button class="bt gran" data-a="quitar" data-k="${k}">QUITAR</button>`; }
      else { info = 'EN EL ARMARIO'; bt = `<button class="bt ok gran" data-a="poner" data-k="${k}">PONER</button>`; }
    }
    return `<div class="th-big"><canvas data-prev="${ivPrev(k)}"></canvas></div><div class="th-n">${ivNom(k)}</div><div class="th-i">${info}</div>${bt}`;
  }
  function renderInv() {
    iSheetH = '';
    const L = invListas(), total = L.ropa.length + L.mue.length + L.jug.length + L.fon.length, nada = e.tiene;
    if (iv === 'hub') {
      $('m-titulo').textContent = 'INVENTARIO';
      const uso = [...L.ropa.filter(k => puesto(k) && !PORDEFECTO[ITEMS[k].slot]), ...L.fon.filter(k => puesto(k) && !PORDEFECTO[ITEMS[k].slot]), ...L.jug.filter(puesto)].slice(0, 8);
      const sinCol = L.mue.filter(k => !e.deco.some(d => d.k === k)).length;
      let h = `<div class="th-top"><span>TIENES ${total} COSAS</span><span class="th-mon">${uso.length} EN USO</span></div>`;
      h += `<div class="th-g2">${IV_CATS.filter(([c]) => c !== 'mas' || L.mas.length).map(([c, n, pv]) => {
        const cant = L[c === 'ropa' ? 'ropa' : c].length, pill = c === 'mue' && sinCol ? `<span class="th-pill">${sinCol} SIN COLOCAR</span>` : '';
        return `<button class="th-t ${cant ? '' : 'lock'}" data-a="iv_cat" data-k="${c}">${pill}<div class="th-pv"><canvas data-prev="${pv}"></canvas></div><b>${n}</b><i>${cant} ${cant === 1 ? 'COSA' : 'COSAS'}</i></button>`;
      }).join('')}</div>`;
      return h;
    }
    const ks0 = L[ivCat], nm = (IV_CATS.find(c => c[0] === ivCat) || IV_CATS[0])[1];
    $('m-titulo').textContent = nm;
    let h = `<div class="th-top"><button class="th-back" data-a="iv_back">&lt; VOLVER</button><span class="th-mon">${ks0.length} ${ks0.length === 1 ? 'COSA' : 'COSAS'}</span></div>`;
    let ks = ks0;
    if (ivCat === 'ropa') {
      h += `<div class="th-chips">${ROPA_SLOTS.filter(([f]) => f !== 'prem').map(([f, t]) => `<button class="${ivF === f ? 'on' : ''}" data-a="iv_f" data-k="${f}">${t}</button>`).join('')}</div>`;
      if (ivF !== 'todo') ks = ks0.filter(k => ITEMS[k].slot === ivF);
    } else if (ivCat === 'mue') {
      const fl = [['todo', 'TODO'], ['sin', 'SIN COLOCAR'], ...HABS.filter(hb => nivel() >= hb.nv).map(hb => [hb.id, hb.n])];
      h += `<div class="th-chips">${fl.map(([f, t]) => `<button class="${ivF === f ? 'on' : ''}" data-a="iv_f" data-k="${f}">${t}</button>`).join('')}</div>`;
      if (ivF === 'sin') ks = ks0.filter(k => !e.deco.some(d => d.k === k));
      else if (ivF !== 'todo') ks = ks0.filter(k => e.deco.some(d => d.k === k && (d.h || 'sala') === ivF));
      h += `<div class="th-nota">Se acomodan con la casita.</div>`;
    } else if (ivCat === 'jug') h += `<div class="th-nota">Solo uno a la vez: el que usa al JUGAR.</div>`;
    if (ivCat === 'ropa') { const vestido = e.ropa.cara || e.ropa.cuello || e.ropa.orejas || e.ropa.espalda || e.ropa.aura || e.ropa.sudadera !== 'sud_azul'; h += `<div style="display:flex;gap:8px;margin:0 0 10px"><button class="bt ok" style="flex:1;padding:10px 0" data-a="iv_vestir">VESTIR A SIMON</button>${vestido ? `<button class="bt" style="flex:1;padding:10px 0" data-a="it_nada">QUITAR TODA LA ROPA</button>` : ''}</div>`; }
    h += ks.length ? `<div class="th-g3">${ks.map(k => { const st = ivEstado(k);
      const dot = ivCat === 'mue' ? `<span class="mue-dot ${(ITEMS[k].slot === 'juguete' ? puesto(k) : e.deco.some(d => d.k === k)) ? 'on' : ''}"></span>` : '';
      return `<button class="th-c ${st && st[0] === 'no' ? 'lock' : ''} ${isel === k ? 'sel' : ''}" data-a="iv_sel" data-k="${k}">${dot}${st ? `<span class="${st[0] === 'n' ? 'th-cant' : 'iv-b ' + st[0]}">${st[1]}</span>` : ''}<div class="th-pv"><canvas data-prev="${ivPrev(k)}"></canvas></div><div class="th-nm">${ivNom(k)}</div></button>`; }).join('')}</div>`
      : `<div class="centro" style="font-size:7px;color:#aab4ff;line-height:1.9;margin:24px 0">${ks0.length ? 'No hay nada aquí.' : ivCat === 'com' || ivCat === 'ext' ? 'No tienes nada de esto.<br>Compra en la TIENDA.' : 'Todavía no tienes nada.<br>Mira la TIENDA.'}</div>`;
    if (isel && ks.includes(isel)) iSheetH = hojaInv(isel); else isel = null;
    return h;
  }
  $('b-inv').onclick = () => menuAbrir('inventario');

  /* ===================== NOTIFICACIONES ===================== */
  // (Lógica, configuración y textos movidos a notificaciones.js para fácil edición)

  /* ===================== RESFRIADO (suave) ===================== */
  const ABRIGOS = ['bufanda', 'bufanda_dorada', 'capa_roja', 'capa_azul', 'sud_navidad']; // (MED_PRECIO definido en config.js)
  const abrigado = () => Object.values(e.ropa).some(k => k && ABRIGOS.includes(k));
  let enfProx = Date.now() + 20000;
  function enfermar() {
    e.enf = ahora(); e.enfAb = 0; e.malS = 0; dx('enf'); notificar('Simon se resfrió. Dale jarabe o abrígalo.');
    toast('Simon se resfrió: dale JARABE (tienda) o ponle bufanda o capa'); sfx.no();
    decir('Sí... ¡achú!', e.traductor ? 'Me siento raro... tengo frío.' : null, 3600); sustoHasta = tk + 6; guardar();
    if (!e.enfVisto) { e.enfVisto = 1; guardar(); setTimeout(introEnf, 4500); }
  }
  function introEnf() {   // primera vez que se resfría: Cortex explica qué pasa y cómo curarlo
    if (!e.enf) { evQuitar('introEnf'); return; }
    if (!eventoLibre(EV_INTD)) { evAgregar('introEnf', 30, () => e.enf && eventoLibre(EV_INTD), introEnf); return; }
    let tienda = false;
    document.body.classList.add('tut');
    cortexCamina(() => dialogo([
      C('Oí estornudar a Simon... ¿se resfrió?'),
      C('Pasa cuando se le descuida mucho: con hambre, sueño o tristeza al mismo tiempo.'),
      S(),
      T('Achú... tengo frío.'),
      CT('Hay varias formas de curarlo. La más rápida es el JARABE, que se compra en la tienda.', '#btn-tienda'),
      C('También puedes abrigarlo con una bufanda o una capa, y se le pasará en un ratito.'),
      C('O dejarlo dormir: al despertar ya estará mejor. Y si no haces nada, se cura solo en unas horas.'),
      C('Mientras esté resfriado no podrá jugar. ¡Cuídalo mucho!'),
      { q: 'CORTEX', t: '¿Quieres ir por el jarabe ahora?', op: ['Ver la tienda', 'Más tarde'],
        res: [[{ q: 'TU', t: 'Ver la tienda', fn: () => { tienda = true; } }], [{ q: 'TU', t: 'Más tarde' }]] }
    ], () => { tutRes(null); document.body.classList.remove('tut'); cortexSale(() => { guardar(); if (tienda) { tab = 'extras'; tv = 'cat'; tvPre = true; abrir('tienda'); } }); }), .07);
  }
  function curar(modo) {
    if (!e.enf) return;
    e.enf = 0; e.enfAb = 0; e.malS = 0; dx('curo'); notificar('Simon se curó del resfriado.'); sfx.regalo(); corazones(3); estrellas(4); gesto('salto'); hablar();
    toast(modo === 'jarabe' ? '¡El jarabe funcionó! Simon se curó' : modo === 'abrigo' ? '¡Abrigadito! Simon se curó' : modo === 'sueno' ? 'Con el sueño se le pasó el resfriado' : 'Simon ya se siente mejor');
    decir('Sí.', e.traductor ? '¡Ya me siento mejor! Gracias.' : null, 3200); guardar();
  }
  function checkEnf() {
    if (!e.intro || introActiva || nivel() < 3) return;
    if (e.enf) {
      if (abrigado()) e.enfAb += e.dormido ? 15 : 5;
      if (e.enfAb >= 600) return curar('abrigo');
      if (ahora() - e.enf > 3 * 3600000) return curar('tiempo');
      if (Date.now() > enfProx && !modal && !dlg && !e.dormido && !mj && !rt) {
        enfProx = Date.now() + (25 + Math.random() * 25) * 1000; sustoHasta = tk + 5;
        decir('Sí... ¡achú!', e.traductor ? elige(['Achú. Perdón.', 'Tengo la nariz tapada.', 'Quiero una bufanda...', 'Achú. Necesito jarabe.']) : null, 3000);
      }
      return;
    }
    const mal = (e.hambre < 15 ? 1 : 0) + (e.energia < 15 ? 1 : 0) + (e.feliz < 15 ? 1 : 0);
    if (mal >= 2 || e.hambre < 6 || e.feliz < 6) e.malS += 5; else e.malS = Math.max(0, e.malS - 10);
    if (e.malS >= 1200) { if (Math.random() < .4) enfermar(); else e.malS = 900; }   // cumplir las condiciones no basta: solo a veces se resfría (si no, vuelve a tirar en ~5 min)
  }
  function cardMed() {
    const n = e.meds || 0;
    return `<div class="card"><div class="pv" style="display:flex;align-items:center;justify-content:center;font-size:22px;color:#ff6a78">+</div><div class="cn">JARABE</div><div style="font-size:6px;color:#4a5090;line-height:1.5">CURA EL RESFRIADO</div><button class="bt ${e.monedas >= MED_PRECIO ? 'ok' : 'no'}" data-a="med_comprar">$ ${MED_PRECIO}</button>${n > 0 ? `<button class="bt ${e.enf ? 'ok' : 'no'}" data-a="med_usar">USAR (${n})</button>` : '<div style="font-size:6px;color:#4a5090">TIENES: 0</div>'}</div>`;
  }
  function medClick(a) {
    if (a === 'med_comprar') {
      if (e.monedas < MED_PRECIO) { faltanMon(MED_PRECIO - e.monedas); sfx.no(); return; }
      if ((e.meds || 0) >= 9) { toast('Ya tienes suficientes'); return; }
      e.monedas -= MED_PRECIO; animarMonedas(MED_PRECIO, true); e.meds = (e.meds || 0) + 1; e.st.compras++; sfx.compra(); toast('¡COMPRASTE: JARABE!'); pintar(); guardar(); render();
    } else if (a === 'med_usar') {
      if (!e.enf) { toast('Simon no está resfriado'); sfx.no(); return; }
      if (!(e.meds > 0)) return;
      e.meds--; curar('jarabe'); pintar(); render();
    }
  }
  /* ===================== REACCIONES DE SIMON: ropa y tormenta ===================== */
  // (ROPA_COM definido en dialogos.js)
  let ropaPend = null, ropaProx = Date.now() + 8 * 60000;
  function comentaRopa(k) { const t = ROPA_COM[k]; if (!t) return; decir('Sí.', e.traductor ? t : null, 3600); hablar(); gesto('salto'); corazones(1); }
  function checkRopa() {
    if (ropaPend) {
      if (!eventoLibre(EV_RPND)) return;
      const k = ropaPend; ropaPend = null; comentaRopa(k); ropaProx = Date.now() + (10 + Math.random() * 10) * 60000; return;
    }
    if (Date.now() < ropaProx || !eventoLibre(EV_ROPA)) return;
    ropaProx = Date.now() + (12 + Math.random() * 18) * 60000;
    const w = Object.values(e.ropa).filter(k => k && ROPA_COM[k]); if (!w.length) return;
    comentaRopa(w[Math.floor(Math.random() * w.length)]);
  }
  // el trueno suena y asusta a Simon solo de vez en cuando (los relámpagos se ven igual)
  let truenoCd = 0;
  function truenoSusto() {
    if (Date.now() < truenoCd || document.hidden) return;
    truenoCd = Date.now() + (150 + Math.random() * 150) * 1000;
    if (!e.mudo) sfx.trueno();
    simonAsusta();
  }
  // (MIEDO definido en dialogos.js)
  function simonAsusta() {
    if (e.dormido || introActiva || Date.now() < sustoCd) return;
    sustoCd = Date.now() + 120000; sustoHasta = tk + 7; dx('susto');
    if (modal || dlg || mj) return;
    gesto('salto'); hablar(); decir('Sí.', e.traductor ? MIEDO[Math.floor(Math.random() * MIEDO.length)] : null, 3000);
  }
  function dx() {}
  /* ===================== MIMOS: Simon se cansa y luego vuelve a querer ===================== */
  // (MIMO_MAX, MIMO_VUELVE, MIMO_SEG, MIMO_XP_DIA, MIMO_MON_DIA definidos en config.js)
  // (HARTO definido en dialogos.js)
  function mimosAl() { const m = e.mimos, t = Date.now(); m.n = Math.max(0, m.n - (t - (m.t || t)) / (MIMO_SEG * 1000)); m.t = t; return m; }
  function checkMimos() {
    const m = mimosAl();
    if (m.harto && m.n < MIMO_VUELVE) { m.harto = false; if (!modal && !dlg && !e.dormido && !cortex.p) { decir('Sí.', e.traductor ? '¡Ya quiero mimos otra vez!' : null, 3500); hablar(); gesto('salto'); } }
  }
  function mimar(suave) {
    const resp = (txt, causa) => { if (!suave) { responder(txt, causa); return; } decir('Sí.', e.traductor ? (txt ? txt.replace(/[()]/g, '') : traducir(causa || 'otro')) : null); e.st.si++; hablar(); };
    const m = mimosAl();
    if (m.harto && m.n >= MIMO_VUELVE) {
      decir('Sí.', e.traductor ? HARTO[Math.floor(Math.random() * HARTO.length)] : null, 2800); sfx.no(); bocaT = 6; if (suave) acar = null; return;
    }
    m.harto = false; m.n += 1;
    const D = e.mimosDia; if (D.f !== hoy()) { D.f = hoy(); D.xp = 0; D.coins = 0; D.av = 0; }
    const hab = e.feliz < 100; e.feliz = clamp(e.feliz + 2); e.st.toques++; mision('tocar');
    const nAntesAcar = nivel();
    if (D.xp < MIMO_XP_DIA) {
      if (hab) { darXp(1); D.xp++; }
      if (clima() === 'tormenta' && e.st.toques % 3 === 0 && D.xp < MIMO_XP_DIA) { darXp(1); D.xp++; corazones(2); }
    }
    if (e.st.toques % 10 === 0 && D.coins < MIMO_MON_DIA) { ganar(1, 0); D.coins++; }
    if (!suave && nivel() === nAntesAcar) sfx.toque(); corazones(1);
    if (m.n >= MIMO_MAX - .3) { m.harto = true; if (suave) acar = null; responder('(¡ya fueron muchos mimos! Déjame descansar un ratito)'); gesto('salto'); }
    else if (Math.round(m.n) === 6 && m.n < 7) resp('(mmm... me estás dando muchos mimos)');
    else if (D.xp >= MIMO_XP_DIA && !D.av) { D.av = 1; resp('(hoy ya me llenaste de mimos. ¡Gracias!)'); }
    else if (clima() === 'tormenta' && Date.now() < sustoCd - 110000) { resp('(¡Gracias por abrazarme! Ya no tengo tanto miedo)'); corazones(2); }
    else if (nivelAbandono() >= 2) resp('(...s-sí...)');
    else if (e.enf) resp('(achú... tengo frío, ponme una bufanda o dame jarabe)');
    else resp(null, 'tocar');
  }
  /* ===================== NAVEGACIÓN ATRÁS / ESCAPE ===================== */
  let navEnHistory = false, navCerrandoPop = false;

  function navPush() {
    if (navEnHistory) return;
    navEnHistory = true;
    try {
      if (typeof history !== 'undefined' && history.pushState) {
        history.pushState({ simonOverlay: true }, '');
      }
    } catch (_) {}
  }
  if (typeof window !== 'undefined') window.navPush = navPush;

  function navPop() {
    if (!navEnHistory || navCerrandoPop) {
      navEnHistory = false;
      return;
    }
    navEnHistory = false;
    try {
      if (typeof history !== 'undefined' && history.back) {
        history.back();
      }
    } catch (_) {}
  }
  if (typeof window !== 'undefined') window.navPop = navPop;

  function retroceder() {
    // 1. Si hay un diálogo de nombre cancelable
    const nomBx = $('nombre');
    if (nomBx && nomBx.classList && nomBx.classList.contains('on') && $('nom-x') && $('nom-x').style.display !== 'none') {
      if ($('nom-x').onclick) $('nom-x').onclick();
      else nomBx.classList.remove('on');
      return true;
    }
    // 2. Si hay un modal abierto (incluyendo modo edición)
    if (typeof modal !== 'undefined' && modal) {
      if (modal === 'editar') {
        salirEdicion(false);
        return true;
      }
      cerrar(false);
      return true;
    }
    // 3. Si está en modo bañar a Simón
    if (typeof ban !== 'undefined' && ban) {
      if (typeof banSalir === 'function') banSalir();
      return true;
    }
    // 4. Si está en minijuego de cocina
    if (typeof cg !== 'undefined' && cg) {
      if (typeof cgSalir === 'function') cgSalir();
      return true;
    }
    // 5. Si está en minijuegos arcade
    if (typeof mj !== 'undefined' && mj) {
      if (typeof mjSalir === 'function') mjSalir();
      return true;
    }
    if (typeof run !== 'undefined' && run) {
      if (typeof runSalir === 'function') runSalir();
      return true;
    }
    if (typeof rt !== 'undefined' && rt) {
      if (typeof rtSalir === 'function') rtSalir();
      return true;
    }
    if (typeof mem !== 'undefined' && mem) {
      if (typeof memSalir === 'function') memSalir();
      return true;
    }
    // 6. Si está en un lugar exterior (ej: parque), volver a casa
    if (typeof lugar !== 'undefined' && lugar) {
      if (typeof volverACasa === 'function') volverACasa();
      return true;
    }
    return false;
  }
  if (typeof window !== 'undefined') window.retroceder = retroceder;

  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('popstate', ev => {
      navEnHistory = false;
      navCerrandoPop = true;
      try {
        retroceder();
      } finally {
        setTimeout(() => { navCerrandoPop = false; }, 60);
      }
    });

    window.addEventListener('keydown', ev => {
      if (ev.key === 'Escape' || ev.keyCode === 27) {
        if (retroceder()) {
          ev.preventDefault();
          ev.stopPropagation();
        }
      }
    });
  }

  /* ===================== VENTANAS ===================== */
  let modal = null, tab = 'ropa';
  function abrir(t) { if (ipf()) return; if (tutMenuBloq(t) && !admin) return; if (guiaBloq(t) && !admin) return; if (vistaBloq) { salirVistaBloq(); pintarNav(); } modal = t; if (t === 'tienda') { if (!tvPre) tv = 'hub'; tvPre = false; tsel = null; tBuscar = ''; } if (t === 'inventario') { iv = 'hub'; isel = null; } if (t === 'vestir') { vSnap = Object.assign({}, e.ropa); vF = 'todo'; } if (t === 'resp') cdMsg = null; const hoja = t === 'dice' || t === 'comida' || t === 'misiones' || t === 'vestir'; $('modal').classList.toggle('sheet', hoja); if (hoja) subeEscena(); $('escena').classList.toggle('alto', hoja); if (t === 'dice') { dv = 'menu'; ronda = null; } rsConf = false; if (t === 'regalo') ultimoPremio = null; $('modal').classList.add('on'); render(); navPush(); }
  // (Listeners cgc movidos a minijuegos.js)

  function cerrar(hPop = true) { if (modal === 'celebra') celCur = null; if (modal === 'jardin') jSel = null; if (modal === 'cocinar') ck = null; if (modal === 'vestir' && vSnap) vsCancel(); try { setTimeout(estSndCheck, 0); } catch (_) {} resetPend = false; limpiaT(); if (modal === 'dice') $('burbuja').classList.remove('on'); tBuscar = ''; modal = null; $('modal').classList.remove('on', 'sheet'); $('escena').classList.remove('alto'); setTimeout(saludar, 500); setTimeout(checkVisita, 3500); if (celQ.length) setTimeout(celebraCheck, 50); if (hPop) navPop(); }
  function render() {
    if (!modal) return;
    const cu = $('m-cuerpo'), sc = cu.scrollTop;
    let h = '';
    $('m-x').style.display = (modal === 'regalo' && !ultimoPremio) ? 'none' : '';
    if (modal === 'regalo') {
      $('m-titulo').textContent = 'REGALO DIARIO';
      if (ultimoPremio) {
        const u = ultimoPremio;
        h = `<div class="centro"><div class="grande">+${u.m} MONEDAS</div>` +
          (u.item ? `<div class="grande">¡${ITEMS[u.item].n}!</div><div>Regalo especial del día 7. Ya está en tu tienda.</div>` : '') +
          `<div style="margin-top:10px">Racha: ${u.racha} ${u.racha === 1 ? 'día' : 'días'}</div>` +
          `<div style="margin-top:8px;color:#aab4ff">Vuelve mañana: el premio mejora cada día.</div>` +
          `<button class="bgrande" data-a="cerrar">¡GRACIAS!</button></div>`;
      } else {
        const i = infoRegalo();
        h = `<div class="centro">` +
          (i.nr > 1 ? `<div>CORTEX: ¡Llevas ${i.nr - 1} ${i.nr - 1 === 1 ? 'regalo' : 'regalos'} de racha!</div>` : `<div>CORTEX: ¡Simon te manda un regalo!</div>`) +
          `<div class="dias">` + PREMIOS.map((p, j) => `<div class="dia ${j + 1 < i.dia ? 'hecho' : j + 1 === i.dia ? 'hoy' : ''} ${j === 6 ? 'esp' : ''}"><b>${j + 1}</b>${j + 1 < i.dia ? 'OK' : '+' + p}</div>`).join('') + `</div>` +
          `<canvas class="caja" data-prev="caja"></canvas>` +
          `<div style="margin-top:8px">${i.dia === 7 ? 'Día 7: ¡regalo ESPECIAL!' : 'Día ' + i.dia + ' de 7'}</div>` +
          `<button class="bgrande" data-a="abrirreg">ABRIR REGALO</button>` +
          `<div style="margin-top:12px;color:#aab4ff;font-size:7px">Si faltas un día, no pasa nada.</div></div>`;
      }
    } else if (modal === 'dibujo') {
      $('m-titulo').textContent = 'SIMON TE DIBUJÓ ALGO';
      h = `<div class="centro"><canvas data-prev="dib_${dibujoId}"></canvas><div style="margin-top:10px">Simon te dibujó ${NOMBRE_DIB[dibujoId]}.</div><div class="grande">+15 MONEDAS</div>` +
        `<div class="galeria">` + DIBUJOS.map(d => `<canvas data-prev="dib_${d}" style="opacity:${e.dibujos[d] ? 1 : .22}"></canvas>`).join('') + `</div>` +
        `<div style="margin-top:8px;color:#aab4ff">Dibujos: ${Object.keys(e.dibujos).length}/5</div><button class="bgrande" data-a="cerrar">¡SÍ!</button></div>`;
    } else if (modal === 'foto') {
      $('m-titulo').textContent = 'TU FOTO';
      h = `<div class="centro"><img src="${fotoURL}" alt="foto de Simon" style="max-width:100%;max-height:50vh;border:3px solid var(--linea);image-rendering:pixelated"><div style="display:flex;gap:8px;margin-top:14px"><button class="bt ok" style="flex:1" data-a="compartir">COMPARTIR</button><button class="bt" style="flex:1" data-a="guardar">GUARDAR</button></div></div>`;
    } else if (modal === 'comercio') {
      const I = mercInfo(), of = ofertasHoy();
      $('m-titulo').textContent = 'CORTEX COMERCIANTE';
      if (I.est !== 'aqui') h = `<div class="centro">Cortex ya se fue.<br><br>Vuelve mañana.</div><div class="centro"><button class="bgrande" data-a="cerrar">OK</button></div>`;
      else h = `<div class="saldo"><span>MONEDAS: ${e.monedas}</span><span id="mc-t">QUEDAN ${mmss(I.fin - I.t)}</span></div>` +
        `<div class="centro" style="margin-bottom:10px;color:#aab4ff;font-size:7px">Cosas de mis viajes. ¡Solo hoy!</div>` +
        (of.length ? `<div class="cuadricula merc">` + of.map(k => {
          const it = ITEMS[k], hecho = e.merc.compras[k];
          const b = hecho ? '<div class="est">COMPRADO</div>' : `<button class="bt ${e.monedas >= it.p ? 'ok' : 'no'}" data-a="mcomprar" data-k="${k}">$ ${it.p}</button>`;
          return `<div class="card card-merc ${hecho ? 'eq' : ''}"><div class="pv pv-merc"><canvas data-prev="${k}"></canvas></div><div class="cn">${it.n}</div>${b}</div>`;
        }).join('') + `</div>` : `<div class="centro">${MERC_POOL.every(k => e.tiene[k]) ? 'Ya tienes todo lo que traje. ¡Eres mi mejor cliente!' : 'Todavía no tengo nada para ti. ¡Quiere más a Simon y volveré con cosas nuevas!'}</div>`);
    } else if (modal === 'tienda') { h = renderTienda();
    } else if (modal === 'inventario') { h = renderInv();
    } else if (modal === 'notis') { h = renderNotis();
    } else if (modal === 'estudio') { h = renderEst();
    } else if (modal === 'celebra') { h = renderCel();
    } else if (modal === 'trofeos') { h = renderTrof();
    } else if (modal === 'simonInfo') { h = renderSimonInfo();
    } else if (modal === 'vestir') { h = renderVest();
    } else if (modal === 'closet') { h = renderCloset();
    } else if (modal === 'minijuegos') { h = renderMj();
    } else if (modal === 'mapa') { h = renderMapa();
    } else if (modal === 'cuadro') { h = renderCuadro();
    } else if (modal === 'misiones') { h = renderMis();
    } else if (modal === 'cocinar') { h = renderCocinar();
    } else if (modal === 'refri') { h = renderRefri();
    } else if (modal === 'jardin') { h = renderJardinElegir();
    } else if (modal === 'comida') { h = renderComida();
    } else if (modal === 'dice') { h = renderDice();
    } else if (modal === 'resp') { h = renderAj();
    }
    cu.innerHTML = h;
    { const s1 = $('vt-s1'), s2 = $('vt-s2'); s1.innerHTML = ''; s2.innerHTML = ''; const primero = cu.firstElementChild; if (primero && primero.classList.contains('th-top')) { const hijos = [...primero.children]; hijos.forEach((hj, i) => (i < hijos.length - 1 ? s1 : s2).appendChild(hj)); primero.remove(); } }
    { const ven = document.querySelector('#modal .ventana'); if (ven) ven.classList.toggle('sinbarra', modal === 'vestir'); }
    { const mx = $('m-x'); mx.classList.toggle('ok', modal === 'vestir'); mx.textContent = modal === 'vestir' ? '✓' : 'X'; mx.setAttribute('aria-label', modal === 'vestir' ? 'Guardar' : 'Cerrar'); mx.onclick = modal === 'vestir' ? vsGuardar : cerrar; }
    $('vs-trash').onclick = () => { sfx.click(); Object.assign(e.ropa, BASE().ropa); pintar(); render(); };
    if (modal === 'vestir') { $('vs-grip').style.display = 'flex'; }
    else { $('vs-grip').style.display = 'none'; cu.style.height = ''; cu.style.maxHeight = ''; const vt = document.querySelector('#modal .ventana'); if (vt) vt.style.maxHeight = ''; }
    { const vs = $('t-sheet'); if (vs) vs.remove(); const sh = modal === 'tienda' ? tSheetH : modal === 'inventario' ? iSheetH : ''; if (sh) { const d = document.createElement('div'); d.id = 't-sheet'; d.innerHTML = sh; cu.parentElement.appendChild(d); d.addEventListener('click', mClick); } }
    dibujarPrevCanvases(cu);
    if ($('t-sheet')) dibujarPrevCanvases($('t-sheet'));
    cu.scrollTop = sc;
    if (guia && modal === 'comida') requestAnimationFrame(guiaMarca);   // actualizar flecha tutorial al instante
  }
  const restriccionHab = k => {   // ¿a qué habitación está realmente restringido este item? null = se puede colocar en cualquier lado
    const it = ITEMS[k]; if (!it) return null; const t = it.tema;
    if (!t || t === 'todas') return null;
    if (!esMueble(k)) return t;   // papel tapiz, pisos, refris y similares (se equipan, no se arrastran) siempre son exclusivos de su habitación
    if (t === 'bano' || t === 'estudio' || t === 'jardin') return t;
    return it.exclusivo ? t : null;
  };
  const baseTienda = k => (tab !== 'cuarto' || !habBloq(k)) && (tab !== 'ropa' || fRopa === 'todo' || (fRopa === 'prem' ? (ITEMS[k].prem && !ITEMS[k].mascota) : ITEMS[k].slot === fRopa)) && (tab !== 'cuarto' || fHab === 'todo' || ((esMueble(k) || ITEMS[k].pat || ITEMS[k].refri || ITEMS[k].util) && (fHab === 'general' ? !restriccionHab(k) : restriccionHab(k) === fHab))) && (tab === 'comida' || k === 'bomba' || k === 'jarabe' || !(ITEMS[k].mercader || ITEMS[k].codigo) || e.tiene[k] || ITEMS[k].prem);
  var tv = 'hub', tvPre = false, tsel = null, tSheetH = '';
  var tBuscar = '';
  const CATS = [['ropa', 'ROPA', 'sud_azul'], ['cuarto', 'MUEBLES', 'silla'], ['comida', 'COMIDA', 'fd_dona'], ['mkt', 'MERCADO', 'ig_jitomate'], ['juguetes', 'JUGUETES', 'juguete_azul'], ['semillas', 'SEMILLAS', 'sm_brote'], ['extras', 'EXTRAS', 'fd_bomba'], ['prem', 'PREMIUM', 'alas_angel']];
  const catDe = k => ['ropa', 'cuarto', 'juguetes'].find(t => ORDEN[t].includes(k));
  const compraOk = k => { const it = ITEMS[k]; return it && !e.tiene[k] && !it.prem && !it.regalo && it.p > 0 && nivel() >= it.nv && !habBloq(k) && !(it.mercader || it.codigo); };
  // orden de la tienda por categoría: primero lo que se parece (todos los refris juntos, todos los pisos juntos...), luego por cuarto, nivel y precio
  const SLOT_R = ['pared', 'piso', 'alfombra', 'refri', 'sarten2', 'cuadro', 'decoP', 'izq', 'der', 'deco'], ROPA_R = ['sudadera', 'cuello', 'cara', 'orejas', 'espalda', 'aura'];
  function ordenT(k) {
    const it = ITEMS[k], sl = it.slot || '', r = tab === 'ropa' ? ROPA_R.indexOf(sl) : SLOT_R.indexOf(sl.replace(/_.*/, '')), ti = tab === 'cuarto' ? HABS.findIndex(h => h.id === it.tema) : 0;
    // lo aún no desbloqueado (por nivel o por habitación) se manda hasta el fondo, pero conserva el mismo orden entre sí
    const bloqueado = !it.prem && !it.regalo && !e.tiene[k] && (nivel() < (it.nv || 1) || !!habBloq(k));
    return [bloqueado ? 1 : 0, r === -1 ? 99 : r, ti === -1 ? 99 : ti, (it.nv || 1), (it.p || 0)];
  }
  function itemsTiendaBase(t) {
    let base = ORDEN[t].filter(baseTienda);
    if ((t === 'ropa' || t === 'cuarto') && tBuscar) {
      const q = quitaAc(tBuscar).trim().toUpperCase();
      if (q) base = base.filter(k => quitaAc(ITEMS[k].n).toUpperCase().includes(q));
    }
    return base.map((k, i) => [k, grupoT(k), i]).sort(['cuarto', 'ropa', 'juguetes'].includes(t) ? (x, y) => { const A = ordenT(x[0]), B = ordenT(y[0]); for (let j = 0; j < A.length; j++) if (A[j] !== B[j]) return A[j] - B[j]; return x[2] - y[2]; } : (x, y) => x[1] - y[1] || x[2] - y[2]).map(x => x[0]);
  }
  function renderTiendaCards(base, ct) {
    if (!base.length) return '<div class="centro" style="grid-column:1/-1;font-size:7px;color:#aab4ff;padding:16px 0;line-height:1.8">No hay nada que coincida con eso.</div>';
    const vis = (e.tn || {})[ct] || 1;
    return base.map(k => {
      const pv = tab === 'comida' ? 'fd_' + k : k === 'bomba' ? 'fd_bomba' : k === 'jarabe' ? 'fd_jarabe' : k, nw = tab !== 'comida' && tab !== 'extras' && compraOk(k) && ITEMS[k].nv > vis && ITEMS[k].nv > 1, g = grupoT(k);
      const nCant = tab === 'comida' ? (e.comida[k] || 0) : k === 'bomba' ? (e.bombas || 0) : k === 'jarabe' ? (e.meds || 0) : 0;
      const cant = nCant > 0 ? `<span class="th-cant">x${nCant}</span>` : '';
      const ih = tab === 'cuarto' ? (esFondo(k) ? (temaDe(k) !== 'todas' ? (HAB_ICO[temaDe(k)] || '') : '') : iconoHabDe(k)) : '', hico = ih ? `<span class="mue-hab">${ih}</span>` : '';
      let statTag = '';
      if (tab === 'comida') {
        const F = COMIDAS[k];
        if (F.rand) {
          statTag = `<div style="font-size:5px;color:#ffd84a;margin-top:1px">¡SORPRESA!</div>`;
        } else {
          const partes = [];
          if (F.h > 0) partes.push(`<span style="color:#aab4ff;display:inline-flex;align-items:center;gap:1px"><canvas class="ic-sub" data-prev="ic_ham"></canvas>+${F.h}</span>`);
          if (F.e > 0) partes.push(`<span style="color:#ffe45a">⚡+${F.e}</span>`);
          statTag = `<div style="font-size:5px;margin-top:1px;line-height:1.2">${partes.join(' ')}</div>`;
        }
      }
      return `<button class="th-c ${puesto(k) ? 'puesto' : ''} ${g === 1 ? 'lock' : ''} ${tsel === k ? 'sel' : ''}" data-a="tv_sel" data-k="${k}">${nw ? '<span class="th-nw">NUEVO</span>' : ''}${cant}${hico}<div class="th-pv"><canvas data-prev="${pv}"></canvas></div><div class="th-nm">${tab === 'comida' ? COMIDAS[k].n : k === 'bomba' ? 'BOMBA' : k === 'jarabe' ? 'JARABE' : ITEMS[k].n}</div>${statTag}${pillT(k)}</button>`;
    }).join('');
  }
  function dibujarPrevCanvases(el) {
    if (!el) return;
    el.querySelectorAll('canvas[data-prev]').forEach(c => {
      const g = prevGrid(c.dataset.prev);
      c.width = g.w; c.height = g.h; c.getContext('2d').drawImage(gridCanvas(g), 0, 0);
      const isMerc = !!c.closest('.pv-merc') || !!c.closest('.cuadricula.merc');
      const z = isMerc ? Math.max(1, Math.min(Math.floor(116 / g.w), Math.floor(82 / g.h))) :
                (c.dataset.prev.startsWith('lg_') || c.dataset.prev.startsWith('hb_')) ? 3 :
                c.dataset.prev.startsWith('juguete_') ? 4 :
                c.dataset.prev.startsWith('fo_') ? 3 :
                c.dataset.prev.startsWith('marco_') ? 2 :
                (c.dataset.prev.startsWith('fd_') || c.dataset.prev.startsWith('mj_')) ? Math.max(2, Math.floor((c.closest('.mini') ? 32 : 54) / Math.max(g.w, g.h))) :
                c.dataset.prev.startsWith('pen_') ? Math.max(1, Math.floor(30 / Math.max(g.w, g.h))) :
                c.dataset.prev === 'caja' ? 4 :
                c.dataset.prev.startsWith('dib_') ? (c.parentElement.classList.contains('galeria') ? 3 : 8) : 2;
      c.style.width = g.w * z + 'px'; c.style.height = g.h * z + 'px';
    });
  }
  function grupoT(k) {
    if (tab === 'comida') return nivel() >= COMIDAS[k].nv ? 0 : 1;
    if (tab === 'extras') return 0;
    const it = ITEMS[k]; if (e.tiene[k]) return 2; if (it.prem || it.regalo) return 3; return compraOk(k) ? 0 : 1;
  }
  function nuevosCat(c) {
    const vis = (e.tn || {})[c] || 1;
    if (c === 'comida') return Object.keys(COMIDAS).filter(k => COMIDAS[k].p > 0 && COMIDAS[k].nv > vis && COMIDAS[k].nv <= nivel()).length;
    if (c === 'extras' || c === 'mkt' || c === 'semillas') return 0;
    const lista = c === 'prem' ? ORDEN.ropa.filter(k => ITEMS[k].prem) : ORDEN[c].filter(k => !ITEMS[k].prem);
    return lista.filter(k => compraOk(k) && ITEMS[k].nv > vis).length;
  }
  function pillT(k) {
    if (tab === 'comida') { const F = COMIDAS[k]; if (nivel() < F.nv) return `<span class="pr no">🔒 NV${F.nv}</span>`; return `<span class="pr ${e.monedas >= F.p ? '' : 'no'}">$ ${F.p}</span>`; }
    if (tab === 'extras') return `<span class="pr ${e.monedas >= (k === 'bomba' ? BOMBA_PRECIO : MED_PRECIO) ? '' : 'no'}">$ ${k === 'bomba' ? BOMBA_PRECIO : MED_PRECIO}</span>`;
    const it = ITEMS[k];
    if (puesto(k)) return '<span class="pr puesto">PUESTO</span>';
    if (e.tiene[k]) return '<span class="pr ok">PONER</span>';
    if (it.prem) return '<span class="pr pm">PREMIUM</span>';
    if (it.regalo === 'nivel') return `<span class="pr no">GRATIS NV${it.gnv}</span>`;
    if (it.regalo) return '<span class="pr no">LOGRO</span>';
    if (habBloq(k)) return `<span class="pr no">🔒 NV${habBloq(k).nv}</span>`;
    if (nivel() < it.nv) return `<span class="pr no">🔒 NV${it.nv}</span>`;
    return `<span class="pr ${e.monedas >= it.p ? '' : 'no'}">$ ${it.p}</span>`;
  }
  function premInfo(k) {   // cómo se consigue una prenda premium + cuánto lleva el jugador
    const it = ITEMS[k], lg = LOGROS.find(l => l.item === k), st = PREM_SETS.find(x => x.premio === k);
    if (lg) { const v = Math.min(lg.val(), lg.meta); return `<span style="color:#ffd84a">CÓMO CONSEGUIRLA</span><br>COMPLETA EL LOGRO:<br>«${lg.n.toUpperCase()}»<br>LLEVAS: ${v}/${lg.meta}`; }
    if (st) { const falta = st.items.filter(x => !e.tiene[x]).map(x => ITEMS[x].n); return `<span style="color:#ffd84a">CÓMO CONSEGUIRLA</span><br>JUNTA TODO EL SET ${st.n} (${st.items.length - falta.length}/${st.items.length})<br>${falta.length ? 'TE FALTA: ' + falta.join(', ') : '¡LO TIENES TODO!'}<br>EL PREMIO LLEGA SOLO`; }
    if (it.mercader) return `<span style="color:#ffd84a">CÓMO CONSEGUIRLA</span><br>LA VENDE CORTEX CUANDO VISITA LA CASA<br>PRECIO: $ ${it.p}`;
    return it.prem;
  }
  function hojaTienda(k) {
    let pv, nom, info = '', bt = '';
    if (tab === 'comida') {
      const F = COMIDAS[k]; pv = 'fd_' + k; nom = F.n;
      let stats = [];
      if (F.rand) stats.push('¡EFECTO SORPRESA!');
      else {
        if (F.h > 0) stats.push('COMIDA +' + F.h);
        if (F.e > 0) stats.push('ENERGÍA +' + F.e);
      }
      info = stats.join('<br>') + '<br>TIENES: ' + (e.comida[k] || 0);
      bt = nivel() < F.nv ? `<div class="est bloq">CARIÑO NV${F.nv}</div>` : `<button class="bt ${e.monedas >= F.p ? 'ok' : 'no'} gran" data-a="f_comprar" data-k="${k}">COMPRAR · $ ${F.p}</button>`;
    } else if (k === 'bomba') {
      pv = 'fd_bomba'; nom = 'BOMBA'; info = '¡BOOM!<br>TIENES: ' + (e.bombas || 0); bt = `<button class="bt ${e.monedas >= BOMBA_PRECIO ? 'ok' : 'no'} gran" data-a="b_comprar">COMPRAR · $ ${BOMBA_PRECIO}</button>`;
    } else if (k === 'jarabe') {
      pv = 'fd_jarabe'; nom = 'JARABE'; info = 'CURA EL RESFRIADO<br>TIENES: ' + (e.meds || 0);
      bt = `<button class="bt ${e.monedas >= MED_PRECIO ? 'ok' : 'no'} gran" data-a="med_comprar">COMPRAR · $ ${MED_PRECIO}</button>` + ((e.meds || 0) > 0 ? `<button class="bt ${e.enf ? 'ok' : 'no'} gran" style="margin-top:6px" data-a="med_usar">USAR (${e.meds})</button>` : '');
    } else {
      const it = ITEMS[k]; pv = k; nom = it.n;
      info = it.refri ? 'REFRI NV ' + refriNv(k) + '<br>CABEN ' + (CAP_REFRI[k] || 5) + ' DE CADA INGREDIENTE' : it.util ? 'UNA SARTÉN EXTRA EN LA ESTUFA<br>COCINA DOS COSAS A LA VEZ' : esMueble(k) && it.slot !== 'juguete' && it.tema && it.tema !== 'todas' ? 'IDEAL: ' + (HABS.find(h => h.id === it.tema) || { n: it.tema.toUpperCase() }).n : '';
      if (puesto(k)) bt = PORDEFECTO[it.slot] ? '<div class="est">PUESTO</div>' : `<button class="bt gran" data-a="quitar" data-k="${k}">QUITAR</button>`;
      else if (e.tiene[k]) bt = `<button class="bt ok gran" data-a="poner" data-k="${k}">PONER</button>`;
      else if (it.prem) { info = premInfo(k); bt = ''; }
      else if (it.regalo) bt = '<div class="est">' + (it.regalo === 'nivel' ? 'REGALO AL LLEGAR A CARIÑO NV' + it.gnv : it.regalo === 'logro' ? 'SE GANA CON UN LOGRO' : 'REGALO DIA 7') + '</div>';
      else if (habBloq(k)) bt = `<div class="est bloq">${habBloq(k).n} NV${habBloq(k).nv}</div>`;
      else if (nivel() < it.nv) bt = `<div class="est bloq">CARIÑO NV${it.nv}</div>`;
      else if (refReq(k)) bt = `<div class="est bloq">PRIMERO: ${ITEMS[refReq(k)].n}</div>`;
      else bt = `<button class="bt ${e.monedas >= it.p ? 'ok' : 'no'} gran" data-a="comprar" data-k="${k}">COMPRAR · $ ${it.p}</button>`;
    }
    return `<div class="th-big">${pv ? `<canvas data-prev="${pv}"></canvas>` : '<span style="font-size:30px;color:#ff6a78">+</span>'}</div><div class="th-n">${nom}</div><div class="th-i">${info}</div>${bt}`;
  }
  function renderTienda() {
    tSheetH = '';
    const mon = `<div class="th-mon">$ ${e.monedas}</div>`;
    if (tv === 'hub') {
      $('m-titulo').textContent = 'TIENDA';
      const nv = nivel(), top = Object.keys(ITEMS).filter(k => compraOk(k) && ITEMS[k].nv > 1 && ITEMS[k].nv <= nv && catDe(k)).sort((a, b) => ITEMS[b].nv - ITEMS[a].nv).slice(0, 4);
      let h = `<div class="th-top"><span>CARIÑO NV${nv}</span>${mon}</div>`;
      h += `<div class="th-g2">${CATS.filter(([c]) => (c !== 'mkt' || !habBloq0('cocina')) && (c !== 'semillas' || !habBloq0('jardin'))).map(([c, n, pv]) => { const nw = nuevosCat(c); let sub = '';
        if (c === 'ropa') sub = ORDEN.ropa.filter(k => !(ITEMS[k].prem && !ITEMS[k].mascota) && e.tiene[k]).length + '/' + ORDEN.ropa.filter(k => !(ITEMS[k].prem && !ITEMS[k].mascota)).length;
        else if (c === 'prem') sub = ORDEN.ropa.filter(k => ITEMS[k].prem && !ITEMS[k].mascota && e.tiene[k]).length + '/' + ORDEN.ropa.filter(k => ITEMS[k].prem && !ITEMS[k].mascota).length;
        else if (c === 'cuarto' || c === 'juguetes') sub = ORDEN[c].filter(k => e.tiene[k]).length + '/' + ORDEN[c].length;
        return `<button class="th-t ${c === 'prem' ? 'prem' : ''}" data-a="tv_cat" data-k="${c}">${nw ? `<span class="th-pill">${nw} NUEVO${nw > 1 ? 'S' : ''}</span>` : ''}<div class="th-pv"><canvas data-prev="${pv}"></canvas></div><b>${n}</b>${sub ? `<i>${sub} TUYOS</i>` : ''}</button>`; }).join('')}</div>`;
      if (top.length) h += `<div class="th-ban" style="margin:14px 0 0"><small>★ LO ULTIMO DESBLOQUEADO ★</small><div class="th-r">${top.map(k => `<button data-a="tv_item" data-k="${k}"><canvas data-prev="${k}"></canvas></button>`).join('')}</div></div>`;
      return h;
    }
    const ct = tab === 'ropa' && fRopa === 'prem' ? 'prem' : tab;
    $('m-titulo').textContent = (CATS.find(c => c[0] === ct) || CATS[0])[1];
    let h = `<div class="th-top"><button class="th-back" data-a="tv_back">&lt; VOLVER</button>${mon}</div>`;
    if (tab === 'mkt') return renderMkt(h);
    if (tab === 'semillas') return renderSemillas(h);
    if (tab === 'ropa') h += `<div class="th-chips">${ROPA_SLOTS.map(([f, t]) => `<button class="${fRopa === f ? 'on' : ''}${f === 'prem' ? ' prem' : ''}" data-a="fr" data-k="${f}">${t}</button>`).join('')}</div>`;
    if (tab === 'cuarto') h += `<div class="th-chips">${[['todo', 'TODO'], ['general', 'GENERAL'], ['estudio', 'ESTUDIO'], ['juegos', 'JUEGOS'], ['sala', 'RECAMARA'], ['bano', 'BAÑO'], ['cocina', 'COCINA'], ['entrada', 'ENTRADA'], ['jardin', 'JARDÍN']].filter(([f]) => f === 'todo' || f === 'general' || !habBloq0(f)).map(([f, t]) => `<button class="${fHab === f ? 'on' : ''}" data-a="fh" data-k="${f}">${t}</button>`).join('')}</div>`;
    if (tab === 'ropa' || tab === 'cuarto') {
      const ph = tab === 'ropa' ? 'BUSCAR ROPA...' : 'BUSCAR MUEBLE...';
      const val = (tBuscar || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
      h += `<div class="buscar-wrap"><input id="th-buscar" class="th-buscar" type="text" placeholder="${ph}" value="${val}" autocomplete="off"><button id="th-buscar-x" class="buscar-x" data-a="th_buscar_x" aria-label="Borrar búsqueda" style="${val ? 'display:flex' : 'display:none'}">✕</button></div>`;
    }
    const base = itemsTiendaBase(tab);
    h += `<div class="th-nota">${tab === 'juguetes' ? 'Solo uno a la vez: el que usa al JUGAR.' : tab === 'cuarto' ? 'Se colocan con la casita.' : tab === 'comida' ? 'Comida para el hambre y bebidas o platillos especiales para la energía.' : tab === 'ropa' && fRopa === 'prem' ? 'No se compran: se ganan. Toca una para ver cómo.' : ''}</div>`;
    h += `<div class="th-g3" id="th-grid">${renderTiendaCards(base, ct)}</div>`;
    if (tab === 'ropa' && fRopa === 'prem') h += `<div class="centro" style="font-size:8px;color:#ffd84a;margin:14px 0 8px">COLECCIONES</div>` + PREM_SETS.map(s => { const n = s.items.filter(k => e.tiene[k]).length; return `<div class="card" style="margin-bottom:8px;text-align:left;padding:8px"><div class="cn" style="text-align:left">SET ${s.n}: ${n}/${s.items.length}${e.tiene[s.premio] ? ' ✔' : ''}</div><div class="etq" style="margin:4px 0">${s.items.map(k => (e.tiene[k] ? '✔ ' : '· ') + ITEMS[k].n).join('<br>')}</div><div class="etq pm">PREMIO: ${ITEMS[s.premio].n}</div></div>`; }).join('');
    if (tsel && base.includes(tsel)) tSheetH = hojaTienda(tsel); else tsel = null;
    return h;
  }
  function mClick(ev) {
    const b = ev.target.closest('[data-a]'); if (!b) return;
    let a = b.dataset.a; const k = b.dataset.k;
    if (a === 'tv_sel') { const pr = ev.target.closest('.pr'); if (pr && pr.textContent.trim().startsWith('$')) a = k === 'bomba' ? 'b_comprar' : k === 'jarabe' ? 'med_comprar' : tab === 'comida' ? 'f_comprar' : tab === 'mkt' ? 'ig_comprar' : tab === 'semillas' ? 'j_comprar' : 'comprar'; else if (pr && pr.textContent.trim() === 'PONER') a = 'poner'; else if (pr && pr.textContent.trim() === 'QUITAR') a = 'quitar'; else if (pr && pr.textContent.trim() === 'PUESTO') { const it = ITEMS[k]; if (it && !PORDEFECTO[it.slot]) a = 'quitar'; } }   // tocar el precio = comprar, tocar PONER/QUITAR = equipar/quitar
    if (a === 'tv_cat') { sfx.click(); if (k === 'prem') { tab = 'ropa'; fRopa = 'prem'; } else { tab = k; if (k === 'ropa' && fRopa === 'prem') fRopa = 'todo'; } tv = 'cat'; tsel = null; tBuscar = ''; e.tn = e.tn || {}; e.tn[k] = nivel(); guardar(); render(); $('m-cuerpo').scrollTop = 0; return; } else if (a === 'tv_back') { sfx.click(); tv = 'hub'; tsel = null; tBuscar = ''; render(); return; } else if (a === 'tv_sel') { sfx.click(); tsel = tsel === k ? null : k; render(); return; } else if (a === 'tv_item') { sfx.click(); tab = catDe(k); fRopa = 'todo'; fHab = 'todo'; tv = 'cat'; tsel = k; tBuscar = ''; render(); return; } else if (a === 'fr') { fRopa = k; tsel = null; sfx.click(); render(); } else if (a === 'fh') { fHab = k; tsel = null; sfx.click(); render(); } else if (a === 'th_buscar_x') {
      tBuscar = '';
      const inp = $('th-buscar');
      if (inp) { inp.value = ''; inp.focus(); }
      b.style.display = 'none';
      sfx.click();
      const gr = $('th-grid');
      if (gr && modal === 'tienda') {
        const ct = tab === 'ropa' && fRopa === 'prem' ? 'prem' : tab;
        const base = itemsTiendaBase(tab);
        gr.innerHTML = renderTiendaCards(base, ct);
        dibujarPrevCanvases(gr);
      }
      return;
    } else if (a === 'comprar') comprar(k); else if (a === 'poner') poner(k);
    else if (a === 'ojo_tog') {
      e.ojoOn = e.ojoOn === 0 ? 1 : 0;
      const arr = petsActivas();
      if (e.ojoOn) {
        if (!arr.includes('ojo_pet') && arr.length < 3) arr.push('ojo_pet');
        if (typeof ojoSnd === 'function') ojoSnd();
      } else {
        const idx = arr.indexOf('ojo_pet');
        if (idx >= 0) arr.splice(idx, 1);
      }
      sfx.click(); guardar(); render();
    }
    else if (a.startsWith('ck_') && a !== 'ck_abrir') ckClick(a, k); else if (a === 'ck_abrir') { ck = null; sfx.click(); abrir('cocinar'); } else if (a === 'rf_abrir') { sfx.click(); abrir('refri'); } else if (a === 'rf_mejorar') { sfx.click(); tab = 'cuarto'; fHab = 'cocina'; tv = 'cat'; tvPre = true; abrir('tienda'); }
    else if (a === 'ig_comprar') comprarIng(k); else if (a === 'rf_ir') { tab = 'mkt'; tv = 'cat'; tvPre = true; tsel = null; sfx.click(); abrir('tienda'); }
    else if (a === 'j_ir_tienda') { jSel = null; tab = 'semillas'; tv = 'cat'; tvPre = true; tsel = null; sfx.click(); abrir('tienda'); }
    else if (a === 'f_ir_tienda') { tab = 'comida'; tv = 'cat'; tvPre = true; tsel = null; sfx.click(); abrir('tienda'); }
    else if (a === 'quitar') quitar(k); else if (a === 'mcomprar') comprarMerc(k); else if (a === 'compartir') compartirFoto(); else if (a === 'guardar') guardarFoto(); else if (a === 'abrirreg') abrirRegalo(); else if (a === 'cerrar') cerrar();
    else if (a.startsWith('q_')) qClick(a, k); else if (a === 'm_ir') irLugar(k); else if (['mj_jugar', 'run_jugar', 'rt_jugar', 'mem_jugar'].includes(a) && noEst('ahora toca estudiar, no jugar')) { return; } else if (a === 'nt_tog') { notifToggle(); return; } else if (a === 'fs_set') { e.fuente = +k; sfx.click(); guardar(); pintar(); render(); return; } else if (a === 'nom_ed') { sfx.click(); pedirNombre(() => render(), true); return; } else if (a === 'tr_rec') { trofReclamar(); return; } else if (a.startsWith('cel_')) { celClick(a, k); return; } else if (a.startsWith('cl_')) { closetClick(a, k); return; } else if (a === 'mj_jugar') mjIniciar(); else if (a === 'run_jugar') runIniciar(); else if (a === 'rt_jugar') rtIniciar(); else if (a === 'mem_jugar') memIniciar(); else if (a.startsWith('est_')) estClick(a, k); else if (a.startsWith('dia_')) diaClick(a); else if (a.startsWith('med_')) medClick(a); else if (a === 'not_borrar') { e.notis = []; notiNuevas = 0; sfx.click(); pintarNotis(); guardar(); render(); } else if (a === 'vs_open') { sfx.click(); abrir('vestir'); } else if (a === 'vs_f') { sfx.click(); vF = k; render(); } else if (a === 'vs_pet') {
      const arr = petsActivas();
      if (arr.includes(k)) {
        arr.splice(arr.indexOf(k), 1);
        if (k === 'ojo_pet') e.ojoOn = 0;
        sfx.click();
      } else if (arr.length < 3) {
        arr.push(k);
        if (k === 'ojo_pet') { e.ojoOn = 1; if (typeof ojoSnd === 'function') ojoSnd(); }
        sfx.click();
      } else {
        toast('MÁXIMO 3 MASCOTAS ACTIVAS');
        sfx.no();
        return;
      }
      guardar(); pintar(); render();
    } else if (a === 'vs_t') { const it = ITEMS[k], sl = it.slot; if (e.ropa[sl] === k) { if (PORDEFECTO[sl]) { sfx.no(); return; } e.ropa[sl] = null; } else e.ropa[sl] = k; sfx.click(); pintar(); render(); } else if (a === 'vs_nada') { sfx.click(); Object.assign(e.ropa, BASE().ropa); pintar(); render(); } else if (a === 'vs_x') { sfx.click(); cerrar(); } else if (a === 'vs_ok') { vsGuardar(); } else if (a === 'iv_cat') { sfx.click(); ivCat = k; ivF = 'todo'; iv = 'cat'; isel = null; render(); $('m-cuerpo').scrollTop = 0; } else if (a === 'iv_back') { sfx.click(); iv = 'hub'; isel = null; render(); } else if (a === 'iv_f') { sfx.click(); ivF = k; isel = null; render(); } else if (a === 'iv_sel') { sfx.click(); isel = isel === k ? null : k; render(); } else if (a === 'iv_item') { sfx.click(); const c = ['ropa', 'mue', 'jug', 'fon'].find(c => invListas()[c].includes(k)); if (c) { ivCat = c; ivF = 'todo'; iv = 'cat'; isel = k; render(); } } else if (a === 'it_nada') { e.ropa = Object.assign(e.ropa, BASE().ropa); sfx.click(); gesto('salto'); pintar(); guardar(); render(); } else if (a === 'iv_vestir') { sfx.click(); abrir('vestir'); } else if (a.startsWith('d_')) dClick(a, k); else if (a.startsWith('r_')) rClick(a, b); else if (a === 'tut_ver') { cerrar(); setTimeout(() => { if (libreParaTutorial()) iniciarTutorial(); else toast('Inténtalo cuando Simon esté despierto y sin visitas'); }, 600); } else if (a === 'c_canjear') canjear(); else if (a === 'c_reset_no') { resetPend = false; cdMsg = null; sfx.click(); render(); } else if (a === 'c_reset_ok') reiniciarTodo(); else if (a === 'f_dar') darComida(k); else if (a === 'f_sif') sifComer(); else if (a === 'f_comprar') comprarComida(k); else if (a === 'j_comprar') comprarSemilla(k); else if (a === 'j_plantar') jardinPlantar(k); else if (a === 'b_comprar') comprarBomba(); else if (a.startsWith('x_')) xClick(a, k);
  }
  $('m-cuerpo').addEventListener('click', mClick);
  $('m-cuerpo').addEventListener('input', ev => {
    if (ev.target && ev.target.id === 'th-buscar') {
      tBuscar = ev.target.value;
      const bx = $('th-buscar-x');
      if (bx) bx.style.display = tBuscar ? 'flex' : 'none';
      const gr = $('th-grid');
      if (gr && modal === 'tienda') {
        const ct = tab === 'ropa' && fRopa === 'prem' ? 'prem' : tab;
        const base = itemsTiendaBase(tab);
        gr.innerHTML = renderTiendaCards(base, ct);
        dibujarPrevCanvases(gr);
        const sh = $('t-sheet');
        if (sh && tsel && !base.includes(tsel)) { sh.remove(); tsel = null; }
      }
    }
  });
  $('m-cuerpo').addEventListener('keydown', ev => {
    if (ev.target && ev.target.id === 'th-buscar' && ev.key === 'Enter') ev.target.blur();
  });
  $('vt-s1').addEventListener('click', mClick); $('vt-s2').addEventListener('click', mClick);
  $('m-x').onclick = cerrar;
  $('modal').addEventListener('pointerdown', ev => {
    if (ev.target === $('modal')) {
      if (modal === 'regalo' && !ultimoPremio) return;
      if (modal === 'celebra') return;
      cerrar();
    }
  });
  $('btn-tienda').onclick = () => menuAbrir('tienda');
  $('chip-mon').onclick = () => menuAbrir('tienda');
  $('chip-fue').onclick = () => { const r = racha(); toast(r ? 'RACHA: ' + r + (r === 1 ? ' DÍA' : ' DÍAS') + '. ¡VUELVE MAÑANA!' : 'SIN RACHA. ¡ABRE TU REGALO PARA EMPEZAR!'); };
  $('chip-niv').onclick = () => { const n = nivel(); toast(n >= NMAX ? 'CARIÑO AL MÁXIMO' : 'CARIÑO ' + (e.xp - xpDe(n)) + '/' + (xpDe(n + 1) - xpDe(n)) + ' PARA NV' + (n + 1)); };

  function despertarPremio() { const ct = camaDe(e.deco); if (ct) { e.feliz = clamp(e.feliz + 4 * ct); toast('Despertó de mejor humor gracias a su cama'); } e.st.dormir++; mision('dormir'); ganar(2, 2); if (e.enf) curar('sueno'); }
  function comer() {
    lanzar('pizza', SX + 21, SY - 22, 0, 6, 11); sfx.comer();
    const h = hoy();
    if (e.ultComer !== h) {
      const d = e.ultComer ? difDias(e.ultComer, h) : null;
      e.rachaComer = d === 1 ? e.rachaComer + 1 : 1; e.ultComer = h; e.mejorComer = Math.max(e.mejorComer || 0, e.rachaComer);
    }
    e.energia = clamp(e.energia + 1);
    if (e.hambre > 95) { responder('(ya comí, pero siempre hay lugar para keke)'); e.feliz = clamp(e.feliz + 2 * ecoMul()); return; }
    e.hambre = clamp(e.hambre + 25 * ecoMul()); e.feliz = clamp(e.feliz + 4 * ecoMul()); e.st.comer++; ganar(1, 3); mision('comer'); responder(null, 'comer');
  }
  function jugar() {
    const enParque = lugar === 'parque';
    if (e.energia < 3) { decir('Sí...', e.traductor ? 'Estoy muy cansado.' : null); hablar(); sfx.no(); avisoSueno(); return; }
    if (e.enf) { decir('Sí... ¡achú!', e.traductor ? 'No me siento bien para jugar.' : null, 3000); sfx.no(); return; }
    e.feliz = clamp(e.feliz + 20 * ecoMul()); e.energia = clamp(e.energia - sifE(3)); e.hambre = clamp(e.hambre - 5);
    e.st.jugar++; const nAntes = nivel(); ganar(3, 4); mision('jugar'); if (enParque) { e.feliz = clamp(e.feliz + 10 * ecoMul()); e.st.parque++; ganar(2, 2); } if (nivel() === nAntes) sfx.jugar(); corazones(3); responder(null, 'jugar');
    act = { tipo: 'pelota', t: 0, len: 42 }; proxAct = tk + 42 + 90;
  }
  // Si se hizo de madrugada (3 a 8 am) y Simon tiene menos de la mitad de energía, se duerme solo (una vez por noche)
  function checkSuenoNoche() {
    const h = horaR();
    if (h < 3 || h >= 8 || e.energia >= 50 || e.sNoche === hoy()) return;
    if (!eventoLibre(EV_NOCHE)) return;
    e.sNoche = hoy(); e.dormido = true; e.eIni = e.energia; act = null;
    if (esc === 'sala') { decir('Sí... zzz'); hablar(); }
    sfx.dormir(); notificar('Simon estaba muy cansado y se durmió solo.'); guardar(); pintar();
  }
  function dormir() {
    e.dormido = !e.dormido;
    if (e.dormido) { e.eIni = e.energia; decir('Sí... zzz'); hablar(); sfx.dormir(); }
    else { sfx.despertar(); if (e.energia - (e.eIni || e.energia) >= 8) despertarPremio(); responder(); }
  }
  function dice() {
    const frase = DICE[Math.floor(Math.random() * DICE.length)];
    decir('Simon dice: ' + frase); sfx.pregunta();
    setTimeout(() => {
      if (e.dormido) return;
      e.feliz = clamp(e.feliz + 8);
      if (Date.now() - (e.ultDice || 0) > 30000) { e.ultDice = Date.now(); e.st.dice++; ganar(1, 2); }
      sfx.respuesta(); corazones(2); estrellas(4); responder(null, 'dice'); pintar(); guardar();
    }, 2300);
  }

  $('btn-comer').onclick = () => {
    if (guiaBloq('comida')) return;
    if (noEst('ahora toca estudiar, no comer')) return;
    if (e.dormido) { decir('Zzz...'); sfx.no(); return; }
    menuAbrir('comida');
  };
  $('btn-jugar').onclick = () => { if (guiaBloq('jugar')) return; if (noEst('ahora toca estudiar, no jugar')) return; accion(jugar); };
  $('btn-dormir').onclick = () => {
    if (guia && guia.paso === 'cansado') { if (!guia.cx && !modal && !act) { guia.cx = true; histBebida(); } else sfx.no(); return; }   // en el tutorial, dormir NO lo duerme: dispara la llegada de Cortex con la bebida
    if (guiaBloq('dormir')) return; if (noEst('yo duermo en mi recámara')) return; if (lugar) { decir('Sí. (mejor dormimos en casa)'); sfx.no(); return; } if (!e.dormido && e.hab !== 'sala') { decir('Sí... (yo duermo en mi recámara)'); sfx.no(); return; }
 if (e.dormido && e.hab !== 'sala') { toast('SIMON ESTÁ DURMIENDO EN LA RECÁMARA'); sfx.no(); return; } accion(dormir); };
  $('btn-dice').onclick = () => {
    if (dlg || tutMenuBloq('foto') || guiaBloq('foto')) return;
    if (noEst('ahora toca estudiar, no jugar')) return;
    if (e.dormido) { decir('Zzz...'); sfx.no(); return; }
    menuAbrir('dice');
  };
  function alternaSonido() { e.mudo = !e.mudo; if (!e.mudo) { audio(); sfx.click(); } lluviaCheck(); pintar(); guardar(); }
  cv.addEventListener('pointerdown', ev => {
    ajustaSY();
    if (modal && modal !== 'editar' && !['run', 'mem', 'rt'].includes(modal)) {
      cerrar();
      return;
    }
    if (edit) { editDown(ev); return; }
    if (ban) { banDown(ev); return; }
    if (vistaBloq) return;   // viendo una habitación bloqueada ("en obra"): no se puede interactuar con nada ahí, Simon no está presente
    const r = cv.getBoundingClientRect();
    let x = (ev.clientX - r.left) / r.width * LW, y = (ev.clientY - r.top) / r.height * LH;
    if (escenaId() === 'estudio') { x = SX + 28 + (x - SX - 28) / EST_K; y = SY + 32 + (y - SY - 32) / EST_K; }
    const esc = escenaId();
    if (esc === 'sala' && !lugar && !calle && !dlg && !modal && !introActiva && !edit) {   // secretos de la ventana y eventos mágicos (prioridad absoluta sobre Cortex)
      const dy0 = RY - 59;
      if (az && az.f === 'espera' && esferaXY && Math.hypot(x - esferaXY.x, y - esferaXY.y) <= 15) { esferaToca(); return; }
      if (!ov && !bl && !az && ojoXY && (e.sangFase || 0) >= 1 && Math.hypot(x - ojoXY.x, y - ojoXY.y) <= 15) { ojoToca(); return; }
      if (ov && ov.f === 'espera') { const bx = OX + 29, by = dy0 + 49; if (Math.abs(x - bx) <= 16 && y >= by - 24 && y <= by + 8) { ov.f = 'despega'; ov.t = 0; sfx.click(); return; } }
      if (fz) { const q = fzPos(); if (Math.hypot(x - q.x, y - q.y) <= 12) { fzAtrapa(); return; } }
      if (!ov && !az && !e.tiene.casco_espacial && lunaDorada() && Math.hypot(x - (OX + 36), y - (dy0 + 26)) <= 14) { lunaTap(); return; }
      if (!ov && !bl && !az && lunaSangre() && Math.hypot(x - (OX + 36), y - (dy0 + 26)) <= 14) { sangreTap(); return; }
      if (lunaAzul() && Math.hypot(x - (OX + 36), y - (dy0 + 26)) <= 14) { azulTap(); return; }
      if (!ov && !az && !bl && !tr && boltV > 0 && Math.hypot(x - boltX, y - boltY) <= 14) { truenoTap(); return; }
    }
    if (desc && !bm && !dlg && cortex.p >= 1 && x >= cxb() && x <= cxb() + 62 && y >= SY + SH - 76 && y <= SY + SH) { sfx.click(); if (desc.siesta && desc.zzz) siestaToque(); else toast('CORTEX: Shhh... descansando'); return; }
    if (sifTap(x, y)) return;
    if (esc === 'bano' && banoToca(x, y)) return;
    if (esc === 'entrada' && !(x >= SX && x <= SX + SW && y >= SY) && x >= OX + 6 && x <= OX + 48 && y >= RY - 44 && y <= RY + 40) { sfx.click(); abrir('mapa'); return; }
    if (esc === 'estudio' && !dlg && !modal && !estEstudiando() && y >= estDY() - 24 && y <= estDY() + 14 && !(x >= SX && x <= SX + SW && y >= SY)) { if (e.dormido) { decir('Zzz...'); sfx.no(); return; } sfx.click(); abrir('estudio'); return; }
    if (esc === 'juegos' && !dlg && !modal && x >= OX && x <= OX + 38 && y >= RY - 42 && y <= RY + 38 && !(x >= SX + 6 && y >= SY)) { if (e.dormido) { decir('Zzz...'); sfx.no(); return; } sfx.click(); abrir('minijuegos'); return; }
    if (esc === 'juegos' && !dlg && !modal && x >= OX + 78 && x <= OX + 118 && y >= RY - 38 && y <= RY - 2 && !(x >= SX + 6 && y >= SY)) { sfx.click(); abrir('trofeos'); return; }
    if (esc === 'jardin' && !ipf() && !dlg && !modal) { if (jardinToca(x, y)) return; }
    if (!lugar && !dlg && !modal && esc !== 'estudio' && !(x >= SX && x <= SX + SW && y >= SY)) { const hd = e.deco.find(d => ITEMS[d.k] && ITEMS[d.k].tap && (d.h || 'sala') === e.hab && (r => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h)(posReal(d))); if (hd) { if (e.dormido && hd.k !== 'racha') { decir('Zzz...'); return; } sfx.click(); tapDeco(hd.k); return; } }
    if (!dlg && !modal && !introActiva && esc !== 'estudio' && esc !== 'jardin' && !calle && !(act && act.tipo === 'pelota')) {   // tocar el juguete = jugar con Simon (no en el jardín)
      let rj = null;
      if (lugar === 'parque') { const jk = juguetePuesto(), tj = sprite('tj_' + jk, () => ITEMS[jk].grid(), 0); rj = { x: SX + SW + 6, y: SY + SH - 4 - tj.height, w: tj.width, h: tj.height }; }
      else if (!lugar) { const dj = e.deco.find(d => ITEMS[d.k] && ITEMS[d.k].slot === 'juguete' && (d.h || 'sala') === e.hab); if (dj) rj = posReal(dj); }
      if (rj && x >= rj.x - 4 && x <= rj.x + rj.w + 4 && y >= rj.y - 4 && y <= rj.y + rj.h + 4) { sfx.click(); accion(jugar); return; }
    }
    if (esc === 'cocina' && !ipf() && !dlg && !modal && x >= OX && x <= OX + 31 && y >= RY - 10 && y <= RY + 34 && !(x >= SX && x <= SX + SW && y >= SY)) { if (e.dormido) { decir('Zzz...'); return; } sfx.click(); ck = null; if (!e.cocTut) cgTutorial(); else abrir('cocinar'); return; }
    if (esc === 'cocina' && !ipf() && x >= OX + 80 && x <= OX + 118 && y >= RY - 34 && y <= RY + 36) { sfx.click(); refriTap(); return; }
    if (mercPres && !dlg && cortex.p >= 1 && x >= cxb() && x <= cxb() + 62 && y >= SY + SH - 76 && y <= SY + SH) { sfx.click(); abrir('comercio'); return; }
    if (esc === 'sala' && x >= OX + 66 && x <= OX + 104 && y >= RY - 59 + 15 && y <= RY - 59 + 45 && !(x >= SX && x <= SX + SW && y >= SY)) { sfx.click(); abrir('cuadro'); return; }
    if (e.hallazgo && x >= SX + SW - 8 && x <= SX + SW + 14 && y >= SY + 14 && y <= SY + 44) { accion(function recoger() { recogerHallazgo(); }); return; }
    if (x >= SX && x <= SX + SW && y >= SY && y <= SY + SH) {   // acariciar: mover el dedo sobre Simon
      if (introActiva || calle || dlg || ov || bl) return;
      if (e.dormido) { decir('Zzz...'); sfx.no(); return; }
      acar = { x, y, tot: 0, acc: 0, cor: 0, ronr: 0, id: ev.pointerId };
      try { cv.setPointerCapture(ev.pointerId); } catch (_) {}
    }
  });
  function acarMueve(ev) {
    if (!acar || ev.pointerId !== acar.id) return;
    const r = cv.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width * LW, y = (ev.clientY - r.top) / r.height * LH;
    const d = Math.hypot(x - acar.x, y - acar.y); acar.x = x; acar.y = y;
    if (x < SX - 4 || x > SX + SW + 4 || y < SY - 4 || y > SY + SH + 4 || d > 40) return;   // solo cuenta mientras el dedo pasa por Simon
    acar.tot += d; acar.acc += d; acar.cor += d; if (acar.tot < 5) return;
    act = null; acarT = 8;
    if (tk - acar.ronr > 3) { acar.ronr = tk; sfx.ronr(); }
    if (acar.cor >= 26) { acar.cor = 0; corazones(1); }
    if (acar.acc >= 90) { acar.acc = 0; e.carOk = 1; mimar(true); pintar(); guardar(); }
  }
  function acarSuelta(ev) {
    if (!acar || (ev && ev.pointerId !== acar.id)) return;
    const toque = acar.tot < 5; acar = null;
    if (toque && escenaId() !== 'estudio') { sfx.click(); abrir('simonInfo'); }
  }
  cv.addEventListener('pointermove', acarMueve); cv.addEventListener('pointerup', acarSuelta); cv.addEventListener('pointercancel', acarSuelta);
  // deslizar con el dedo (fuera de Simon) para cambiar de habitación
  let deslz = null;
  cv.addEventListener('pointerdown', ev => {
    deslz = null;
    if (edit || ban || calle || introActiva || dlg || modal || cambiando) return;
    const r = cv.getBoundingClientRect(); let x = (ev.clientX - r.left) / r.width * LW, y = (ev.clientY - r.top) / r.height * LH;
    if (escenaId() === 'estudio') { x = SX + 28 + (x - SX - 28) / EST_K; y = SY + 32 + (y - SY - 32) / EST_K; }
    if (!vistaBloq && x >= SX - 6 && x <= SX + SW + 6 && y >= SY - 6) return;   // sobre Simon es una caricia (no aplica viendo una habitación bloqueada: Simon no está ahí)
    deslz = { id: ev.pointerId, x: ev.clientX, y: ev.clientY, t: Date.now(), w: r.width };
  });
  cv.addEventListener('pointerup', ev => {
    const d = deslz; deslz = null; if (!d || ev.pointerId !== d.id || edit || ban || calle || introActiva || dlg || modal || cambiando || acar) return;
    const dx = ev.clientX - d.x, dy = ev.clientY - d.y;
    if (Math.abs(dx) < d.w * .10 || Math.abs(dy) > Math.abs(dx) * .9 || Date.now() - d.t > 1200) return;
    if (dx > 0) { if (lugar) volverACasa(); else irHab(habIdxActual() - 1); }   // deslizar a la derecha = habitación de la izquierda
    else if (!lugar) irHab(habIdxActual() + 1);
  });
  cv.addEventListener('pointercancel', () => { deslz = null; });
  // El navegador no deja sonar nada hasta que el jugador toca la pantalla. Escuchamos varios tipos de gesto
  // (en el celular 'pointerdown' no cuenta, 'touchend' y 'click' sí) hasta que el audio de verdad esté activo.
  const GESTOS_AUDIO = ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'];
  function destrabarAudio() {
    const a = audio(); if (!a) return;
    const listo = () => {
      if (a.state === 'running') { GESTOS_AUDIO.forEach(g => document.removeEventListener(g, destrabarAudio, true)); musicaOn(); lluviaCheck(); }
      pintarAudioHint();
    };
    if (a.state === 'running') listo(); else { try { a.resume().then(listo, listo); } catch (_) { listo(); } }
  }
  function armarAudio() { GESTOS_AUDIO.forEach(g => document.addEventListener(g, destrabarAudio, true)); }
  function pintarAudioHint() {}
  armarAudio();

  // mientras la app está abierta, las barras bajan despacio y se guardan
  let tjUlt = Date.now();
  setInterval(() => {
    { const ahoraT = Date.now(), dtj = Math.min(15000, Math.max(0, ahoraT - tjUlt)); tjUlt = ahoraT; if (!document.hidden && e) e.tJ = (e.tJ || 0) + dtj / 1000; }   // tiempo jugado (solo con la app a la vista)
    const h = 5 / 3600;
    jardinDia();
    e.hambre = clamp(e.hambre - BAJA.hambre * h);
    e.feliz = clamp(e.feliz - BAJA.feliz * h * (macetaGlobal('brote') ? .9 : 1) - (e.limp < 30 ? 2 * h : 0));
    e.limp = clamp(e.limp - limpTasa() * h);
    if (macetaGlobal('dorada')) { e._doradaAcc = (e._doradaAcc || 0) + h; if (e._doradaAcc >= 2) { const nd = Math.floor(e._doradaAcc / 2); e.monedas += nd; e._doradaAcc -= nd * 2; } }
    e.energia = clamp(e.dormido ? e.energia + rDormir() * h : e.energia - BAJA.energia * h);
    if (e.dormido && e.energia >= 100) { e.dormido = false; sfx.despertar(); despertarPremio(); responder(); }
    if (e.energia < 20 && !e.dormido && !avEn && e.intro && !introActiva) { avEn = true; if (!modal && !dlg) avisoSueno(); } if (e.energia >= 40) avEn = false;
    celebraCheck(); notifSync(); checkSuenoNoche(); checkHallazgo(); evProcesar(); checkVisita(); checkKeke(); checkMimos(); checkRopa(); checkSiesta(); checkTutorial(); checkCaja(); checkMem(); checkEnf(); ambiente(); checkNotis(); lluviaCheck(); if ((!e.mudo || e.musica) && (!ac || ac.state !== 'running')) armarAudio(); pintarAudioHint(); pintar(); guardar();
  }, 5000);

  function volver() {
    if (admin) { pintar(); return; }
    cargar(); pintar();
    if (despertoOffline) { despertoOffline = false; despertarPremio(); pintar(); guardar(); }
    if (ausenciaH >= 24) e.proxVisita = 0;
    if (e.intro && !introActiva && !dlg && !modal && infoRegalo()) setTimeout(() => { if (!modal && !dlg && infoRegalo()) abrir('regalo'); }, 500);
    if (ausenciaH >= 1) { resumenAusencia(); prepararSaludo(); setTimeout(saludar, 900); }
    checkHallazgo(); actualizarTareas(); setTimeout(checkVisita, 3000);
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) { notifSync(true); guardar(); musicaOff(); lluviaOff(); estSndOff(); } else { volver(); armarAudio(); musicaOn(); lluviaCheck(); } });
  window.addEventListener('resize', ajustar);

  // Pre-carga IndexedDB (async) para fallback si localStorage está vacío
  idbGet().then(v => { if (v) { _idbPend = v; if (!e || !e.intro) { try { cargar(); pintar(); guardar(); } catch (_) {} } } });
  try {
    cargar(); pintar(); guardar();
  } catch (err) {
    console.error('[Simon] Error al iniciar estado:', err);
    try { e = BASE(); sanitizar(e); pintar(); guardar(); } catch (_) {}
  }
  try { destrabarAudio(); } catch (_) {}
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { try { ajustar(); } catch (_) {} });
  try { disponer(); } catch (_) {}
  try { dibujarLogo(); } catch (_) {}
  try { ajustar(); } catch (err) { console.error('[Simon] Error en ajustar():', err); }
  if (window.ResizeObserver) new ResizeObserver(() => { try { ajustar(); } catch (_) {} }).observe($('escena'));
  setInterval(tick, 100);

  /* ===================== ESTUDIO: POMODORO CON SIMON (sin premios) ===================== */
    function estEstudiando() { return !!(e && e.est && e.est.fase === 'estudio'); }
  function estLluvia() { return false; }
  function estFmt(ms) { const t = Math.max(0, Math.ceil(ms / 1000)), m = Math.floor(t / 60), s = t % 60; return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0'); }
  function dibujarEscritorio(n) {
    const dx = SX - 18, dY = SY + 50, est = estEstudiando(), br = e.est && e.est.fase !== 'estudio';
    ctx.drawImage(sprite('escr' + (n ? 1 : 0), escritorioGrid, n ? .55 : 0), dx, dY);
    // cuaderno abierto
    const nx = SX + 14, ny = dY - 3, f = est ? (tk >> 5) % 2 : 0;
    ctx.fillStyle = '#232b63'; ctx.fillRect(nx - 1, ny - 1, 30, 5);
    ctx.fillStyle = '#f4f6ff'; ctx.fillRect(nx, ny, 14, 3); ctx.fillStyle = f ? '#e0e4f8' : '#f4f6ff'; ctx.fillRect(nx + 14, ny, 14, 3);
    ctx.fillStyle = '#9aa4d8'; for (let i = 0; i < 3; i++) { ctx.fillRect(nx + 2, ny + (i & 1), 10, 1); ctx.fillRect(nx + 16, ny + 1 - (i & 1), 10, 1); }
    if (est) { const px = nx + 17 + ((tk >> 1) % 8), py = ny - 2 - ((tk >> 2) % 2); ctx.fillStyle = '#ffd84a'; ctx.fillRect(px, py, 1, 4); ctx.fillStyle = '#ff6a8a'; ctx.fillRect(px, py - 1, 1, 1); }
    // taza con vapor
    const tx = dx + 72, ty = dY - 6; ctx.fillStyle = '#232b63'; ctx.fillRect(tx - 1, ty - 1, 9, 8); ctx.fillStyle = '#ff6a8a'; ctx.fillRect(tx, ty, 6, 6); ctx.fillStyle = '#ffd0dc'; ctx.fillRect(tx, ty, 6, 1); ctx.fillStyle = '#6a3a1a'; ctx.fillRect(tx + 1, ty, 4, 1);
    ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(tx + 2 + ((tk >> 3) % 2), ty - 3 - ((tk >> 2) % 3), 1, 2);
    // lámpara de escritorio
    const lx = dx + 6, ly = dY - 14; ctx.fillStyle = '#232b63'; ctx.fillRect(lx, ly + 11, 9, 3); ctx.fillRect(lx + 3, ly + 3, 2, 9); ctx.fillRect(lx + 1, ly, 10, 5);
    ctx.fillStyle = '#ffd84a'; ctx.fillRect(lx + 2, ly + 1, 8, 3); ctx.fillStyle = '#7a8aa8'; ctx.fillRect(lx + 4, ly + 4, 1, 8); ctx.fillRect(lx + 1, ly + 12, 7, 1);
    const hr = new Date(ahora()).getHours(), enc = n || hr >= 19 || hr < 6 || clima() !== 'sol' || est;
    if (enc) { ctx.fillStyle = 'rgba(255,226,120,.16)'; for (let j = 0; j < 14; j++) ctx.fillRect(lx + 2 - j, ly + 5 + j, 8 + j * 2, 1); }
  }
  const ESTIC = () => { const g = Grid(12, 12); g.rect(1, 2, 10, 8, '#232b63'); g.rect(2, 3, 4, 6, '#ffffff'); g.rect(6, 3, 4, 6, '#e8ecff'); g.rect(5, 3, 2, 6, '#8a96ff'); g.rect(3, 4, 2, 1, '#9aa4d8'); g.rect(7, 4, 2, 1, '#9aa4d8'); g.rect(3, 6, 2, 1, '#9aa4d8'); g.rect(7, 6, 2, 1, '#9aa4d8'); return g; };
  try { $('ic-est').getContext('2d').drawImage(gridCanvas(ESTIC()), 0, 0); } catch (_) {}
  const estCfg = () => Object.assign({ min: (typeof CONFIG !== 'undefined' && CONFIG.estudioPomodoro) ? CONFIG.estudioPomodoro.minutosEstudio : 25, br: (typeof CONFIG !== 'undefined' && CONFIG.estudioPomodoro) ? CONFIG.estudioPomodoro.minutosDescanso : 5, ses: (typeof CONFIG !== 'undefined' && CONFIG.estudioPomodoro) ? CONFIG.estudioPomodoro.sesionesTotales : 4 }, e.estCfg);
  function renderEst() {
    $('m-titulo').textContent = 'ESTUDIAR CON SIMON';
    const s = e.est, c = estCfg();
    if (s && s.fase !== 'estudio') {
      return `<div class="centro" style="line-height:2"><div style="font-size:8px;color:#aab4ff">DESCANSO · SESIÓN ${e.estN || 0} ${s.tot > 0 ? 'DE ' + s.tot : ''}</div><div style="font-size:26px;margin:12px 0" id="est-rest">${estFmt(s.fin - Date.now())}</div>` +
        `<div style="font-size:7px;color:#aab4ff">Estírate y toma agua. La siguiente sesión empieza sola.</div><button class="bgrande" data-a="est_salta">SALTAR DESCANSO</button><button class="bt" style="width:100%;padding:12px 0;margin-top:8px" data-a="est_fin">TERMINAR</button></div>`;
    }
    const fila = (t, v, k) => `<div class="saldo"><span>${t}</span><span></span></div><div class="tabs fh"><button class="tab" data-a="est_st" data-k="${k}-">−</button><button class="tab on" style="flex:2" disabled>${v}</button><button class="tab" data-a="est_st" data-k="${k}+">+</button></div>`;
    return `<div class="centro" style="font-size:7px;line-height:2;color:#aab4ff;margin-bottom:8px">Simon estudia contigo. Sin premios: solo compañía.</div>` +
      `<div class="centro" style="font-size:7px;line-height:1.9;color:#8a96ff;margin-bottom:8px">TOTAL ESTUDIADO: ${Math.floor((e.estMin || 0) / 60)} H ${(e.estMin || 0) % 60} MIN · ${e.estNT || 0} SESIONES</div>` +
      fila('ESTUDIO', c.min + ' MIN', 'min') + fila('DESCANSO', c.br + ' MIN', 'br') + fila('SESIONES', c.ses ? c.ses : 'INFINITAS', 'ses') +
      `<div class="saldo"><span>MÚSICA LO-FI</span><span id="est-mv">${e.estMus === undefined ? 50 : e.estMus}%</span></div><input type="range" min="0" max="100" step="1" value="${e.estMus === undefined ? 50 : e.estMus}" data-a="est_mus" style="width:100%;height:28px;accent-color:#ff5a6a">` +
      `<div class="saldo"><span>AMBIENTE</span><span></span></div><div class="tabs fh">${[['', 'NINGUNO'], ['lluvia', 'LLUVIA'], ['tormenta', 'TORMENTA']].map(([v, t]) => `<button class="tab ${(e.estAmb || '') === v ? 'on' : ''}" data-a="est_amb" data-k="${v}">${t}</button>`).join('')}</div>` + (e.estAmb ? `<div class="saldo"><span>VOLUMEN</span><span id="est-vv">${e.estVol === undefined ? 50 : e.estVol}%</span></div><input type="range" min="0" max="100" step="1" value="${e.estVol === undefined ? 50 : e.estVol}" data-a="est_vol" style="width:100%;height:28px;accent-color:#ff5a6a">` : '') +
      `<div class="centro" style="font-size:6px;line-height:2;color:#7a84c8;margin:8px 0">${c.ses ? c.ses + ' × ' + c.min + ' min con ' + c.br + ' min de descanso.' : 'Sesiones sin fin: seguirán hasta que tú toques TERMINAR.'} El tiempo sigue corriendo aunque salgas de la app.</div>` +
      `<div class="saldo"><span>LIBROS EN EL ESCRITORIO</span><span>${Math.min(EST_CAP, e.estLib || 0)}/${EST_CAP}</span></div>` + (e.estLib ? `<button class="bt" style="width:100%;padding:10px 0;margin-bottom:6px" data-a="est_libros">${estConfL ? '¿SEGURO? TIRAR LIBROS' : 'TIRAR LIBROS'}</button>` : '') +
      `<button class="bgrande" data-a="est_go">EMPEZAR</button>`;
  }
  let estConfL = 0;
  function estClick(a, k) {
    if (a === 'est_libros') { if (!estConfL) { estConfL = 1; sfx.click(); render(); return; } estConfL = 0; e.estLib = 0; estLibAnim = 0; guardar(); toast('Libros tirados: escritorio limpio'); render(); estPintar(); return; }
    if (a === 'est_st') {
      const c = estCfg(), w = k.slice(0, -1), d = k.slice(-1) === '+' ? 1 : -1;
      if (w === 'min') c.min = Math.max(5, Math.min(120, c.min + 5 * d));
      else if (w === 'br') { const L = [1, 2, 3, 5, 10, 15, 20, 30]; let x = L.findIndex(v => v >= c.br); if (x < 0) x = L.length - 1; c.br = L[Math.max(0, Math.min(L.length - 1, x + d))]; }
      else { let v = c.ses + d; if (v < 0) v = 12; if (v > 12) v = 0; c.ses = v; }
      e.estCfg = c; sfx.click(); guardar(); render();
    }
    else if (a === 'est_amb') { e.estAmb = k; sfx.click(); guardar(); render(); lluviaCheck(); }
    else if (a === 'est_go') estIniciar();
    else if (a === 'est_salta') { const s = e.est; e.est = Object.assign({}, s, { fase: 'estudio', fin: Date.now() + s.min * 60000 }); guardar(); cerrar(); estPintar(); }
    else if (a === 'est_fin') { e.est = null; guardar(); cerrar(); estPintar(); lluviaCheck(); }
  }

  var EST_CAP = 42, EST_ORD = [0, 5, 1, 4, 2, 3], EST_LC = ['#e8556a', '#4a8ae8', '#ffd84a', '#4ac07a', '#b06ae8', '#ff9a40', '#ff7ab0', '#3ac0c8'];
  var estLibAnim = 0;
  function dibujarLibros(DY) {
    const n = Math.min(EST_CAP, e.estLib || 0);
    for (let i = 0; i < n; i++) {
      const col = EST_ORD[i % 6], capa = Math.floor(i / 6), w = 14 + (i * 7) % 7, cx = OX + 10 + col * 20 + ((i * 5) % 5) - 2, x = cx - (w >> 1);
      let y = DY + 6 - (capa + 1) * 8;
      const nuevo = i === n - 1 && estLibAnim && Date.now() - estLibAnim < 700; if (nuevo) y -= Math.round((1 - (Date.now() - estLibAnim) / 700) * 40); else if (i === n - 1 && estLibAnim && Date.now() - estLibAnim < 1200 && (tk >> 1) % 2) { ctx.fillStyle = '#fff6a0'; ctx.fillRect(x + w - 2, y - 4, 1, 3); ctx.fillRect(x + 2, y - 3, 1, 2); }
      const c = EST_LC[(i * 3 + capa) % 8];
      ctx.fillStyle = '#2a1a30'; ctx.fillRect(x - 1, y - 1, w + 2, 10);
      ctx.fillStyle = c; ctx.fillRect(x, y, w, 8); ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillRect(x, y, w, 1); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(x, y + 7, w, 1);
      ctx.fillStyle = '#f4ecd8'; ctx.fillRect(x + w - 3, y + 1, 3, 6); ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(x + 2, y + 3, 5, 1); ctx.fillRect(x + 2, y + 5, 3, 1);
    }
  }
  function estLlena() { return (e.estLib || 0) >= EST_CAP; }
  var basSure = 0;
  function estBasura() {
    if (!basSure) { basSure = 1; ['v-basura'].forEach(id => { $(id).textContent = '¿SEGURO? OTRA VEZ'; }); setTimeout(() => { basSure = 0; estPintar(); }, 3000); sfx.click(); return; }
    basSure = 0; e.estLib = 0; estLibAnim = 0; guardar(); sfx.crunch ? sfx.crunch() : sfx.click(); toast('Libros tirados: escritorio limpio'); estPintar();
  }
  try { const g = Grid(12, 12); g.rect(2, 3, 8, 1, '#ffffff'); g.rect(4, 1, 4, 2, '#ffffff'); g.rect(3, 4, 6, 8, '#ffffff'); g.rect(4, 5, 1, 6, '#8a2a3a'); g.rect(7, 5, 1, 6, '#8a2a3a'); const cv0 = gridCanvas(g); $('ic-bas').getContext('2d').drawImage(cv0, 0, 0); $('ic-bas2').getContext('2d').drawImage(cv0, 0, 0); } catch (_) {}
  $('t-basura').onclick = estBasura; $('foco-b').onclick = estBasura;
  let wl = null;
  function estWake(on) { try { if (on && navigator.wakeLock && !wl) navigator.wakeLock.request('screen').then(l => { wl = l; l.addEventListener('release', () => { wl = null; }); }).catch(() => {}); else if (!on && wl) { wl.release(); wl = null; } } catch (_) {} }
  function estIniciar() {
    if (e.dormido) { cerrar(); decir('Zzz...'); sfx.no(); return; }
    const c = estCfg(); e.estN = 0;
    e.est = { fase: 'estudio', ini: Date.now(), fin: Date.now() + c.min * 60000, min: c.min, br: c.br, tot: c.ses };
    try { if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission(); } catch (_) {}
    cerrar(); guardar(); sfx.respuesta(); decir('Sí. (a estudiar)', e.traductor ? 'Vamos a concentrarnos.' : null);
    estPintar(); estTick();
  }
  // (estAviso definido en notificaciones.js)
  function estFin() {
    let s = e.est; const now = Date.now(); if (!s) return;
    while (s && now >= s.fin) {
      if (s.fase === 'estudio') {
        e.estN = (e.estN || 0) + 1; e.estNT = (e.estNT || 0) + 1; e.estMin = (e.estMin || 0) + (s.min || 0); e.estUlt = s.fin; if ((e.estLib || 0) < EST_CAP) { e.estLib = (e.estLib || 0) + 1; if (!document.hidden) estLibAnim = Date.now(); }
        if (s.tot > 0 && e.estN >= s.tot) { s = null; break; }
        s = Object.assign({}, s, { fase: 'descanso', fin: s.fin + (s.br || 5) * 60000 });
      } else s = Object.assign({}, s, { fase: 'estudio', fin: s.fin + s.min * 60000 });
    }
    e.est = s;
    if (modal === 'enfoque') modal = null;
    if (!s) { estAviso('¡Terminaste todas tus sesiones de estudio!'); if (!document.hidden) { gesto('baile'); estrellas(14); corazones(4); decir('¡Sí! (¡terminamos todo!)', e.traductor ? 'Lo logramos. Buen trabajo.' : null); } else toast('Terminaste tus sesiones de estudio'); }
    else if (s.fase === 'descanso') { estAviso('¡Sesión terminada! Toca descansar ' + (s.br || 5) + ' min.'); if (!document.hidden) { gesto('baile'); estrellas(8); corazones(3); decir('¡Sí! (descanso)', e.traductor ? 'Buen trabajo. A descansar.' : null); } }
    else { if (modal === 'estudio') cerrar(); estAviso('Se acabó el descanso: a estudiar.'); if (!document.hidden) { toast('Descanso terminado: ¡a estudiar!'); gesto('salto'); } }
    guardar(); estPintar(); lluviaCheck(); try { musicaOn(); } catch (_) {}
  }
  let estC = 0, estSure = 0;
  function estPintar() {
    const on = estEstudiando(), b = $('t-estudio');
    document.body.classList.toggle('enfoque', on);
    if (!on) { estWake(false); if (modal === 'enfoque') modal = null; }
    const aqui = escenaId() === 'estudio' && !e.dormido && !on && !edit;
    b.classList.toggle('oculto', !aqui);
    $('t-basura').classList.toggle('oculto', !(aqui && (e.estLib || 0) > 0)); $('foco-b').classList.toggle('oculto', !(on && (e.estLib || 0) > 0)); $('foco-a').classList.toggle('oculto', !(on && admin)); if (!basSure) $('v-basura').textContent = 'TIRAR LIBROS';
    if (aqui) $('v-estudio').textContent = e.est ? 'SALTAR' : 'ESTUDIAR';
    const dsc = !!e.est && e.est.fase !== 'estudio' && escenaId() === 'estudio' && !e.dormido && !edit; $('est-top').classList.toggle('on', dsc); if (dsc) $('est-top-t').textContent = estFmt(e.est.fin - Date.now());
    if (on) {
      const s = e.est, nn = e.estN || 0;
      $('foco-t').textContent = estFmt(s.fin - Date.now()); $('foco-l').textContent = 'ESTUDIANDO CON SIMON';
      $('foco-p').textContent = s.tot > 0 && s.tot <= 8 ? Array.from({ length: s.tot }, (_, i) => i < nn ? '●' : i === nn ? '◐' : '○').join(' ') : 'SESIÓN ' + (nn + 1) + (s.tot > 0 ? ' DE ' + s.tot : ' · ∞');
      document.querySelectorAll('#foco input').forEach(i => { if (document.activeElement !== i) i.value = i.dataset.a === 'est_vol' ? (e.estVol === undefined ? 50 : e.estVol) : (e.estMus === undefined ? 50 : e.estMus); }); $('fv-amb').style.display = e.estAmb ? '' : 'none';
      if (!estSure) { $('foco-x').textContent = 'TERMINAR'; $('foco-x').classList.remove('sure'); }
    }
  }
  function estTick() {
    estC++;
    if (!e || !e.intro) return;
    try { estSndCheck(); } catch (_) {}
    if (e.est && Date.now() >= e.est.fin) { estFin(); return; }
    if (estEstudiando()) {
      if (!modal && !dlg) modal = 'enfoque';
      if (escenaId() !== 'estudio' && nivel() >= 2) { lugar = null; llegada = null; e.hab = 'estudio'; pintarNav(); }
      if (!document.hidden) estWake(true);
      if (estC % 10 === 0) lluviaCheck();
    } else if (e.est && !document.hidden && !dlg && !modal && !e.dormido && escenaId() === 'estudio' && estC % 24 === 0) gesto('salto');
    if (estC % 2 === 0) estPintar();
    if (modal === 'estudio' && e.est && $('est-rest')) $('est-rest').textContent = estFmt(e.est.fin - Date.now());
  }
  function estSlider(ev) {
    const t = ev.target, a = t && t.dataset && t.dataset.a; if (a !== 'est_vol' && a !== 'est_mus') return;
    if (a === 'est_vol') { e.estVol = +t.value; const v = $('est-vv'); if (v) v.textContent = t.value + '%'; estSndApply(); }
    else { e.estMus = +t.value; const v = $('est-mv'); if (v) v.textContent = t.value + '%'; }
    document.querySelectorAll('#foco [data-a="' + a + '"]').forEach(i => { if (i !== t) i.value = t.value; }); guardar();
  }
  $('m-cuerpo').addEventListener('input', estSlider); $('foco').addEventListener('input', estSlider);
  $('t-estudio').onclick = () => { if (e.dormido) { decir('Zzz...'); sfx.no(); return; } sfx.click(); abrir('estudio'); };
  $('foco-a').onclick = () => { if (admin && e.est) { e.est.fin = Date.now(); estFin(); } };
  $('foco-x').onclick = () => {
    if (!estSure) { estSure = 1; $('foco-x').textContent = '¿SEGURO? TOCA OTRA VEZ'; $('foco-x').classList.add('sure'); setTimeout(() => { estSure = 0; estPintar(); }, 3000); return; }
    estSure = 0; e.est = null; if (modal === 'enfoque') modal = null; guardar(); estPintar(); lluviaCheck(); sfx.click(); decir('Sí. (otro día)', e.traductor ? 'Está bien, descansemos.' : null);
  };
  setInterval(estTick, 500);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) setTimeout(estTick, 50); });
  function pintarTermometro() {
    const c = $('ic-term');
    if (!c) return;
    try {
      const ctx0 = c.getContext('2d');
      ctx0.clearRect(0, 0, c.width, c.height);
      ctx0.drawImage(gridCanvas(termometroGrid()), 0, 0);
    } catch (_) {}
  }
  const ceBtn = $('chip-enf');
  if (ceBtn) {
    ceBtn.onclick = () => {
      sfx.click();
      if (!e.enf) return;
      if ((e.meds || 0) > 0) {
        e.meds--;
        curar('jarabe');
        toast('¡Le diste jarabe! Simon se curó');
        pintar();
      } else {
        toast('Simon tiene resfriado: dale JARABE (tienda) o abrígalo');
        decir('Sí... ¡achú!', e.traductor ? 'Tengo fiebre y frío... necesito jarabe o abrigo.' : null, 3000);
        hablar();
      }
    };
  }
  try {
    pintarTermometro();
    const ic1 = $('ic-mon').getContext('2d'); ic1.drawImage(sprite('fx_moneda', FX.moneda, 0), 0, 0);
    dibMini('si-h', MINI.keke); dibMini('si-e', MINI.rayo); dibMini('si-l', MINI.gota); pintarCara();
    const ic2 = $('ic-cor').getContext('2d'); ic2.drawImage(sprite('fx_corazon', FX.corazon, 0), 0, 0);
  } catch (err) { console.warn('[Simon] Iconos HUD:', err); }
  if (despertoOffline) { despertoOffline = false; try { despertarPremio(); } catch (_) {} pintar(); guardar(); }
  if (ausenciaH >= 24) e.proxVisita = 0;
  if (!e.intro) iniciarIntro();
  else {
    setTimeout(() => { if (!modal && infoRegalo()) abrir('regalo'); }, 900);
    try { resumenAusencia(); prepararSaludo(); setTimeout(saludar, 1600); setTimeout(checkVisita, 4500); } catch (_) {}
    if (!e.avisoMerc) { e.avisoMerc = true; guardar(); setTimeout(() => notificar('Cortex vendrá a venderte cosas una vez al día y te avisará antes de llegar.'), 3000); }
  }
  if (!admin && nivel() < HABS[0].nv) { if (e.hab === 'estudio') e.hab = 'sala'; e.est = null; }
  try { checkHallazgo(); } catch (_) {}
  try { actualizarTareas(); } catch (_) {}
  try { pintarIconos(); } catch (err) { console.warn('[Simon] pintarIconos:', err); }
  if (e.intro) {
    if (!e.ultResp) { e.ultResp = Date.now(); guardar(); }
    else if (e.intro && nivel() >= 3 && Date.now() - e.ultResp > 10 * 86400000 && Date.now() - (e.recT || 0) > 10 * 86400000) {   // máximo un recordatorio cada 10 días, solo en la campana (un aviso emergente la primera vez)
      e.recT = Date.now(); const primera = !e.recToast; e.recToast = 1; guardar();
      notificar('Hace tiempo que no guardas un respaldo. Hazlo en Ajustes (engranaje) > Respaldo, así no pierdes a Simon si cambias de celular.');
      if (primera) setTimeout(() => toast('Mira la campana: hay un consejo para guardar tu progreso'), 6500);
    }
    setTimeout(() => { const cl = clima(); if (cl !== 'sol' && e.avisoClima !== hoy()) { e.avisoClima = hoy(); guardar(); toast(TXT_CLIMA[cl]); } }, 7500);
    setTimeout(() => { if (!e.avisoDice) { e.avisoDice = 1; guardar(); notificar('SIMON DICE tiene preguntas y misiones.'); } }, 4500);
  }
  window.__simon = { mjIniciar, get mj() { return (typeof window !== "undefined" && window.mj) || (typeof mj !== "undefined" ? mj : null); }, runIniciar, runSalto, get run() { return (typeof window !== "undefined" && window.run) || (typeof run !== "undefined" ? run : null); }, memIniciar, memClick, get mem() { return mem; }, get e() { return e; }, mimar, COMIDAS, darComida, entrarEdicion, colocar, get edit() { return edit; }, quiereKeke, clima, FX, mision, preguntar, nuevaRonda, adivinar, crearCodigo, leerCodigo, sanitizar, ESQUEMA, MIS, SEC, get ronda() { return ronda; }, accion, comer, jugar, dormir, dice, ganar, darXp, nivel, abrir, cerrar, infoRegalo, comprar, ITEMS, LOGROS, gesto, sprite, simonGrid, pintar, guardar, get act() { return act; }, get es() { return es; }, estSndCheck, estIniciar, estTick, estFin, get est() { return e.est; }, mercInfo, mercTick, ofertasHoy, get mercPres() { return mercPres; }, iniciarIntro, iniciarVisita, checkVisita, get dlg() { return dlg; }, iniciarAct, checkHallazgo, recogerHallazgo, actualizarTareas, simonAsusta, comentaRopa, equipar, poner, iniciarSiesta, siestaToque, checkMem, checkSiesta, lanzarBomba, reaccionCortex, get desc() { return desc; }, get bm() { return bm; }, get cortexP() { return cortex.p; }, enfermar, curar, checkEnf, rtIniciar, rtTap, get rt() { return rt; }, temaMus, ambiente, mus: () => mus, dx, eventoLibre, EV_TUT, EV_VIS, EV_SIE, EV_INTD, EV_INTE, EV_MEMR, EV_KEKE, EV_ROPA, EV_RPND, EV_CEL, EV_NOCHE, evAgregar, evQuitar, evTiene, evProcesar, get evPend() { return evPend; }, libreParaTutorial, introMueble, introEnf, irLugar, irHab, cgIni, RECETAS, get lugar() { return lugar; }, get cambiando() { return cambiando; }, get cg() { return cg; }, HABS, get calle() { return calle; }, get vistaBloq() { return vistaBloq; }, pintarNav, get VERSION_JUEGO() { return VERSION_JUEGO; } };   // ayuda para pruebas
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});

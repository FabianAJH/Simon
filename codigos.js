/* ==========================================================================
 * SISTEMA Y DEFINICIÓN DE CÓDIGOS (COMPILADO / ENCRIPTADO) — SIMON
 * ==========================================================================
 * Archivo generado automáticamente por compilar_codigos.js.
 * ¡NO EDITES DIRECTAMENTE ESTE ARCHIVO!
 *
 * Para editar o agregar códigos:
 *  1. Modifica 'codigos_privados.js' (donde están en texto plano).
 *  2. Ejecuta 'node compilar_codigos.js' (o usa compilar_codigos.html).
 * ========================================================================== */

function suma(t) {
  let h = 2166136261;
  for (let i = 0; i < t.length; i++) {
    h ^= t.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}

const normCod = t => (t || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toUpperCase()
  .replace(/[^A-Z0-9]/g, '');

const hCod = t => suma('simon|' + normCod(t));

async function esReset(v) {
  try {
    const c = buscarCodigo(normCod(v), hCod(v));
    return !!(c && c.tipo === 'reinicio');
  } catch (_) {
    return false;
  }
}

function reiniciarTodo() {
  if (typeof reseteando !== 'undefined') reseteando = true;
  try { localStorage.removeItem(typeof CLAVE !== 'undefined' ? CLAVE : 'simon-v1'); } catch (_) {}
  try { localStorage.removeItem(typeof CLAVE_BK !== 'undefined' ? CLAVE_BK : 'simon-v1-bk'); } catch (_) {}
  if (typeof idbClear === 'function') idbClear();
  try {
    if (typeof window !== 'undefined' && window.caches) {
      caches.keys().then(ks => ks.forEach(k => {
        if (!k.startsWith('simon-')) caches.delete(k);
      }));
    }
  } catch (_) {}
  setTimeout(() => location.reload(), 150);
}

const LISTA_CODIGOS = [

  {
    hash: '37a2e8ad',
    aliasHashes: ["8bc441b8","6aefe63e"],
    tipo: 'prenda',
    unSoloUso: true,
    accion: (e) => {
      e.tiene.sud_arcoiris = 1;
      e.ropa.sudadera = 'sud_arcoiris';
      return '¡SUDADERA ARCOÍRIS! Es única y ya la tienes puesta.';
    }
  },

  {
    hash: '4daf631f',
    aliasHashes: ["8f3476c7","76c20572"],
    tipo: 'deco',
    unSoloUso: true,
    accion: (e) => {
      e.tiene.neon_si = 1;
      if (typeof colocar === 'function') colocar('neon_si');
      return '¡NEÓN SIMON! Ya brilla en tu habitación.';
    }
  },

  {
    hash: 'af175e58',
    aliasHashes: ["787a5a68","50a5c1a"],
    tipo: 'obra',
    unSoloUso: true,
    accion: (e) => {
      e.tiene.marco_estrellas = 1;
      if (e.cuarto) e.cuarto.cuadro = 'marco_estrellas';
      return '¡OBRA ESTRELLAS! Ya cuelga de tu pared.';
    }
  },

  {
    hash: 'bdb61f7d',
    aliasHashes: ["1a4184e","8c263a75","ff418a65"],
    tipo: 'monedas',
    unSoloUso: true,
    accion: (e) => {
      e.monedas = (e.monedas || 0) + 100;
      e.total = (e.total || 0) + 100;
      return '¡+100 MONEDAS!';
    }
  },

  {
    hash: '36d5fe3b',
    aliasHashes: ["bdbd1703","f4c21dc8","92afdbdb"],
    tipo: 'info',
    unSoloUso: false,
    accion: (e) => {
      const m = Math.floor(((e && e.tJ) || 0) / 60);
      return 'TIEMPO JUGADO: ' + Math.floor(m / 60) + ' H ' + (m % 60) + ' MIN';
    }
  },

  {
    hash: '4f418ff5',
    aliasHashes: ["d9c53502","14323999","fe642485","1cbfc55b"],
    tipo: 'admin',
    unSoloUso: false,
    accion: (e) => {
      if (typeof admin !== 'undefined' && admin) {
        return { ok: true, t: 'YA ESTÁS EN MODO ADMIN' };
      }
      if (typeof activarAdmin === 'function') activarAdmin();
      return { ok: true, t: null };
    }
  },

  {
    hash: 'f16f0331',
    aliasHashes: [],
    tipo: 'reinicio',
    unSoloUso: false,
    accion: (e) => {
      if (typeof resetPend !== 'undefined') resetPend = true;
      if (typeof window !== 'undefined') window.resetPend = true;
      return { ok: true, t: null, tipo: 'reinicio' };
    }
  }
];

const CODIGOS = {};
function sincronizarDiccionarioCodigos() {
  LISTA_CODIGOS.forEach(c => {
    const wrap = { n: c.tipo, f: () => c.accion(e), def: c };
    if (c.hash) CODIGOS[c.hash] = wrap;
    if (c.aliasHashes) c.aliasHashes.forEach(h => { CODIGOS[h] = wrap; });
    if (c.codigo) CODIGOS[normCod(c.codigo)] = wrap;
  });
}
sincronizarDiccionarioCodigos();

var cdMsg = null;
if (typeof resetPend === 'undefined') {
  window.resetPend = false;
}

function buscarCodigo(limpio, h) {
  for (const c of LISTA_CODIGOS) {
    if (c.hash && (c.hash === h || c.hash === limpio.toLowerCase())) return c;
    if (c.aliasHashes && c.aliasHashes.includes(h)) return c;
    if (c.codigo && (normCod(c.codigo) === limpio || hCod(c.codigo) === h)) return c;
  }
  return null;
}

function canjearCodigo(v) {
  const limpio = normCod(v);
  const h = hCod(v);

  if (!limpio) return { ok: false, t: 'ESCRIBE UN CÓDIGO' };

  // 1. Buscar en la lista compilada (¡ÚNICA fuente de la verdad!)
  const c = buscarCodigo(limpio, h);
  if (!c) return { ok: false, t: 'CÓDIGO NO VÁLIDO' };

  // 2. Si es código de administrador
  if (c.tipo === 'admin') {
    if (typeof admin !== 'undefined' && admin) {
      return { ok: true, t: 'YA ESTÁS EN MODO ADMIN', tipo: 'admin' };
    }
    if (typeof activarAdmin === 'function') activarAdmin();
    return { ok: true, t: null, tipo: 'admin' };
  }

  // 3. Si es código de reinicio total
  if (c.tipo === 'reinicio') {
    return { ok: true, t: null, tipo: 'reinicio' };
  }

  // 4. Si es código de información (tiempo jugado, etc.)
  if (c.tipo === 'info') {
    const resInfo = typeof c.accion === 'function' ? c.accion(e) : 'INFO';
    return { ok: true, t: typeof resInfo === 'string' ? resInfo : (resInfo && resInfo.t ? resInfo.t : 'INFO'), tipo: 'info' };
  }

  // 5. Códigos de un solo uso
  if (c.unSoloUso !== false && e && e.cod) {
    if ((c.hash && e.cod[c.hash]) || e.cod[h] || (c.codigo && e.cod[c.codigo])) {
      return { ok: false, t: 'YA USASTE ESTE CÓDIGO' };
    }
  }

  if (c.unSoloUso !== false && e) {
    if (!e.cod) e.cod = {};
    if (c.hash) e.cod[c.hash] = 1;
    if (c.codigo) e.cod[c.codigo] = 1;
    e.cod[h] = 1;
  }

  const res = typeof c.accion === 'function' ? c.accion(e) : (typeof c.f === 'function' ? c.f() : '¡CÓDIGO CANJEADO!');
  let msg = '¡CÓDIGO CANJEADO!';
  if (typeof res === 'string') msg = res;
  else if (res && typeof res.t === 'string') msg = res.t;

  if (typeof guardar === 'function') guardar();
  if (typeof pintar === 'function') pintar();

  return { ok: true, t: msg, tipo: c.tipo, hash: c.hash || h };
}

function canjear() {
  const inp = (typeof $ === 'function') ? $('cd-in') : (typeof document !== 'undefined' ? document.getElementById('cd-in') : null);
  const v = inp ? inp.value : '';
  const limpio = normCod(v);
  const h = hCod(v);

  const fnRender = (typeof window !== 'undefined' && typeof window.render === 'function') ? window.render : (typeof render === 'function' ? render : null);
  const fnSfx = (typeof window !== 'undefined' && window.sfx) ? window.sfx : (typeof sfx !== 'undefined' ? sfx : null);

  if (!limpio) {
    cdMsg = { ok: false, t: 'ESCRIBE UN CÓDIGO' };
    if (fnSfx && fnSfx.no) fnSfx.no();
    if (fnRender) fnRender();
    return;
  }

  const c = buscarCodigo(limpio, h);
  if (!c) {
    cdMsg = { ok: false, t: 'CÓDIGO NO VÁLIDO' };
    if (fnSfx && fnSfx.no) fnSfx.no();
    if (fnRender) fnRender();
    return;
  }

  if (c.tipo === 'reinicio') {
    if (typeof resetPend !== 'undefined') resetPend = true;
    if (typeof window !== 'undefined') window.resetPend = true;
    if (fnSfx && fnSfx.no) fnSfx.no();
    if (fnRender) fnRender();
    return;
  }

  ejecutarCanjeNormal(v, h);
}

function ejecutarCanjeNormal(v, h) {
  const res = canjearCodigo(v);
  const fnRender = (typeof window !== 'undefined' && typeof window.render === 'function') ? window.render : (typeof render === 'function' ? render : null);
  const fnSfx = (typeof window !== 'undefined' && window.sfx) ? window.sfx : (typeof sfx !== 'undefined' ? sfx : null);
  const fnEstrellas = (typeof window !== 'undefined' && typeof window.estrellas === 'function') ? window.estrellas : (typeof estrellas === 'function' ? estrellas : null);

  if (res.ok) {
    if (res.tipo === 'reinicio') {
      if (typeof resetPend !== 'undefined') resetPend = true;
      if (typeof window !== 'undefined') window.resetPend = true;
      if (fnSfx && fnSfx.no) fnSfx.no();
      if (fnRender) fnRender();
      return;
    }
    cdMsg = res.t ? { ok: true, t: res.t } : null;
    if (res.tipo !== 'admin') {
      if (fnSfx && fnSfx.logro) fnSfx.logro();
      if (fnEstrellas) fnEstrellas(6);
    }
  } else {
    cdMsg = { ok: false, t: res.t };
    if (fnSfx && fnSfx.no) fnSfx.no();
  }
  if (fnRender) fnRender();
}

function renderCod(soloEntrada) {
  if (typeof resetPend !== 'undefined' && resetPend) {
    return '<div class="centro" style="font-size:9px;line-height:2;margin:10px 0;color:#ff8a92">¡ADVERTENCIA!<br><br>Vas a BORRAR TODO tu progreso: monedas, cariño, ropa, muebles, logros y diario.<br><br>Simon empezará desde cero y NO se puede deshacer.</div>' +
      '<button class="bt gran" style="background:#ff7b84" data-a="c_reset_ok">SÍ, BORRAR TODO</button><button class="bt ok gran" data-a="c_reset_no">CANCELAR</button>';
  }
  var pad = soloEntrada ? 14 : 4;
  var subtit = soloEntrada ? 'CÓDIGOS NORMALES' : 'Escribe un código y gana premios.';
  var msgHtml = (typeof cdMsg !== 'undefined' && cdMsg)
    ? '<div class="centro" style="font-size:8px;line-height:1.9;margin-top:6px;color:' + (cdMsg.ok ? '#bff0c8' : '#ff8a92') + '">' + cdMsg.t + '</div>'
    : '';
  return '<div class="centro" style="font-size:8px;line-height:1.9;margin:' + pad + 'px 0 10px">' + subtit + '</div>' +
    '<input class="cod" id="cd-in" maxlength="40" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ESCRIBE TU CÓDIGO">' +
    '<button class="bt ok gran" data-a="c_canjear">CANJEAR</button>' +
    msgHtml;
}

if (typeof window !== 'undefined') {
  window.suma = suma;
  window.normCod = normCod;
  window.hCod = hCod;
  window.esReset = esReset;
  window.reiniciarTodo = reiniciarTodo;
  window.LISTA_CODIGOS = LISTA_CODIGOS;
  window.CODIGOS = CODIGOS;
  window.sincronizarDiccionarioCodigos = sincronizarDiccionarioCodigos;
  window.cdMsg = cdMsg;
  window.resetPend = resetPend;
  window.buscarCodigo = buscarCodigo;
  window.canjearCodigo = canjearCodigo;
  window.canjear = canjear;
  window.renderCod = renderCod;
}

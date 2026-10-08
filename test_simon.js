/**
 * test_simon.js — Suite de pruebas automáticas para Simon: Tu Amigo Virtual
 *
 * Uso:   node test_simon.js
 * Requisitos: playwright instalado, chromium en /opt/pw-browsers/
 *
 * Cada test recarga la página limpia (sin localStorage) para no arrastrar estado.
 * Solo usa funciones expuestas en window.__simon — no hace click en canvas.
 * Tiempo total: ~10-15 segundos.
 */

const pw = require('playwright');

const CHROME = (() => {
  const fs = require('fs');
  const paths = [
    '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    '/opt/pw-browsers/chromium/chrome-linux/chrome',
    '/opt/pw-browsers/chromium/chrome'
  ];
  for (const p of paths) { if (fs.existsSync(p)) return p; }
  return 'chromium';
})();

const PORT = 8177;
let server, browser;

// ── Helpers ──────────────────────────────────────────────────────────
async function startServer() {
  const { spawn } = require('child_process');
  server = spawn('python3', ['-m', 'http.server', String(PORT), '--directory', __dirname], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 600));
}

async function freshPage() {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'load' });
  // Limpiar localStorage para empezar de cero
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'load' });
  // Esperar a que __simon esté listo
  await page.waitForFunction(() => window.__simon && window.__simon.e, { timeout: 8000 });
  return { page, errors };
}

function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }

// ── Tests ────────────────────────────────────────────────────────────
const TESTS = [];
function test(name, fn) { TESTS.push({ name, fn }); }

// T1: Arranca sin errores JS
test('T1 — Arranca sin errores', async () => {
  const { page, errors } = await freshPage();
  await page.waitForTimeout(1500);
  assert(errors.length === 0, 'Errores JS: ' + errors.join('; '));
  const ok = await page.evaluate(() => {
    const s = window.__simon;
    return s && s.e && typeof s.e.hambre === 'number';
  });
  assert(ok, '__simon.e no existe o hambre no es número');
  await page.close();
});

// T2: Stats iniciales válidos
test('T2 — Stats iniciales correctos', async () => {
  const { page } = await freshPage();
  const r = await page.evaluate(() => {
    const e = window.__simon.e;
    return {
      hambre: e.hambre, energia: e.energia, feliz: e.feliz, limp: e.limp,
      intro: e.intro, dormido: e.dormido, monedas: e.monedas, hab: e.hab
    };
  });
  assert(r.hambre >= 0 && r.hambre <= 100, `hambre=${r.hambre}`);
  assert(r.energia >= 0 && r.energia <= 100, `energia=${r.energia}`);
  assert(r.feliz >= 0 && r.feliz <= 100, `feliz=${r.feliz}`);
  assert(r.limp >= 0 && r.limp <= 100, `limp=${r.limp}`);
  assert(r.intro === false, 'intro debería ser false en partida nueva');
  assert(r.dormido === false, 'no debería estar dormido');
  assert(typeof r.monedas === 'number' && r.monedas >= 0, 'monedas inválidas');
  assert(r.hab === 'sala', `hab debería ser sala, es ${r.hab}`);
  await page.close();
});

// T3: Cocinar (requiere nv4 — damos XP)
test('T3 — Cocinar sin crash', async () => {
  const { page, errors } = await freshPage();
  const ok = await page.evaluate(() => {
    const s = window.__simon;
    // Dar nivel suficiente para cocina (nv4) y desbloquear intro
    s.e.intro = true;
    s.e.xp = 5000;
    s.e.hab = 'cocina';
    // Dar ingredientes para tostada (receta básica)
    const r = s.RECETAS.find(x => x.id === 'tostada');
    if (!r) return 'no-receta';
    Object.keys(r.ing).forEach(k => { s.e.ing[k] = (s.e.ing[k] || 0) + r.ing[k]; });
    s.guardar();
    try { s.cgIni(r, false); } catch (e) { return 'error:' + e.message; }
    return s.cg ? 'cocinando' : 'no-cg';
  });
  assert(ok === 'cocinando', `Resultado: ${ok}`);
  assert(errors.length === 0, 'Errores: ' + errors.join('; '));
  await page.close();
});

// T4: Parque (requiere nv10)
test('T4 — Ir al parque sin crash', async () => {
  const { page, errors } = await freshPage();
  const result = await page.evaluate(() => {
    const s = window.__simon;
    s.e.intro = true;
    s.e.xp = 50000; // nivel alto para parque (nv10)
    s.guardar();
    s.irLugar('parque');
    return 'ok';
  });
  assert(result === 'ok', `irLugar falló: ${result}`);
  // Esperar transición
  await page.waitForTimeout(500);
  const lugar = await page.evaluate(() => window.__simon.lugar);
  assert(lugar === 'parque', `lugar debería ser parque, es ${lugar}`);
  assert(errors.length === 0, 'Errores: ' + errors.join('; '));
  await page.close();
});

// T5: Dormir y despertar
test('T5 — Dormir y despertar', async () => {
  const { page } = await freshPage();
  // Dormir
  await page.evaluate(() => { window.__simon.dormir(); });
  let dormido = await page.evaluate(() => window.__simon.e.dormido);
  assert(dormido === true, 'debería estar dormido');
  // Subir energía y despertar
  await page.evaluate(() => {
    const s = window.__simon;
    s.e.energia = 100;
    s.dormir(); // toggle off
  });
  dormido = await page.evaluate(() => window.__simon.e.dormido);
  assert(dormido === false, 'debería estar despierto');
  await page.close();
});

// T6: Cortex visita no crashea
test('T6 — checkVisita sin crash', async () => {
  const { page, errors } = await freshPage();
  await page.evaluate(() => {
    const s = window.__simon;
    s.e.intro = true;
    s.e.xp = 5000;
    s.e.proxVisita = 0;
    try { s.checkVisita(); } catch (_) { return 'error'; }
    return 'ok';
  });
  await page.waitForTimeout(500);
  assert(errors.length === 0, 'Errores: ' + errors.join('; '));
  await page.close();
});

// T7: Guardar y cargar mantiene datos
test('T7 — Guardar/cargar ciclo', async () => {
  const { page } = await freshPage();
  const monedas = await page.evaluate(() => {
    const s = window.__simon;
    s.e.intro = true;
    s.e.monedas = 12345;
    s.e.nombre = 'TestBot';
    s.e.feliz = 77;
    s.guardar();
    // Simular recarga: cargar desde localStorage
    s.e.monedas = 0;
    s.e.nombre = '';
    // Reload manually
    return new Promise(resolve => {
      setTimeout(() => {
        const raw = localStorage.getItem('simon-v1');
        const d = JSON.parse(raw);
        resolve({ monedas: d.monedas, nombre: d.nombre, feliz: d.feliz });
      }, 100);
    });
  });
  assert(monedas.monedas === 12345, `monedas=${monedas.monedas}`);
  assert(monedas.nombre === 'TestBot', `nombre=${monedas.nombre}`);
  assert(Math.abs(monedas.feliz - 77) < 2, `feliz=${monedas.feliz}`);
  await page.close();
});

// T8: Export/Import SIMON2 ida y vuelta
test('T8 — Export/Import SIMON2', async () => {
  const { page } = await freshPage();
  const r = await page.evaluate(() => {
    const s = window.__simon;
    s.e.monedas = 9876;
    s.e.nombre = 'Cadas';
    s.guardar();
    const code = s.crearCodigo();
    const ok1 = code.startsWith('SIMON2.');
    const d = s.leerCodigo(code);
    return { ok1, hasDato: !!d, monedas: d ? d.monedas : -1, nombre: d ? d.nombre : '', code_len: code.length };
  });
  assert(r.ok1, 'código no empieza con SIMON2.');
  assert(r.hasDato, 'leerCodigo devolvió null');
  assert(r.monedas === 9876, `monedas=${r.monedas}`);
  assert(r.nombre === 'Cadas', `nombre=${r.nombre}`);
  await page.close();
});

// T9: SIMON1 retrocompatible
test('T9 — Import SIMON1 retrocompatible', async () => {
  const { page } = await freshPage();
  const ok = await page.evaluate(() => {
    const s = window.__simon;
    // Crear código SIMON1 manualmente
    const b64e = t => btoa(unescape(encodeURIComponent(t)));
    function suma(t) { let h = 2166136261; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16); }
    s.e.monedas = 555;
    const j = JSON.stringify(s.e);
    const code = 'SIMON1.' + b64e(j) + '.' + suma(j);
    const d = s.leerCodigo(code);
    return d && d.monedas === 555;
  });
  assert(ok, 'SIMON1 no se pudo importar');
  await page.close();
});

// T10: Sanitización corrige datos malos
test('T10 — Sanitización', async () => {
  const { page } = await freshPage();
  const r = await page.evaluate(() => {
    const s = window.__simon;
    const d = {
      hambre: NaN, energia: -20, feliz: 999, limp: 'hola',
      monedas: undefined, nombre: 42, dormido: 'yes', hab: 'invalid',
      album: 'not-array', ropa: null, cuarto: 123, tiene: false,
      st: [], ing: 0, sec: 0, pens: 0, cod: 0, comida: 0, probo: 0,
      logros: 0, dibujos: 0, adv: 0, mimos: 0, mimosDia: 0, xp: NaN,
      rt: 0, mj: 0, mem: 0, run: 0, eco: 0, deco: 'bad'
    };
    const r = s.sanitizar(d);
    return {
      hambre: r.hambre, energia: r.energia, feliz: r.feliz, limp: r.limp,
      monedas: r.monedas, nombre: typeof r.nombre, dormido: r.dormido,
      hab: r.hab, albumArr: Array.isArray(r.album), ropaObj: typeof r.ropa === 'object' && !Array.isArray(r.ropa),
      decoArr: Array.isArray(r.deco)
    };
  });
  assert(r.hambre >= 0 && r.hambre <= 100, `hambre=${r.hambre}`);
  assert(r.energia === 0, `energia=${r.energia}`);
  assert(r.feliz === 100, `feliz=${r.feliz}`);
  assert(r.limp >= 0 && r.limp <= 100, `limp=${r.limp}`);
  assert(typeof r.monedas === 'number' && !isNaN(r.monedas), `monedas roto`);
  assert(r.nombre === 'string', `nombre no es string`);
  assert(r.dormido === true, `dormido no es bool`);
  assert(r.hab === 'sala', `hab=${r.hab}`);
  assert(r.albumArr, 'album no es array');
  assert(r.ropaObj, 'ropa no es objeto');
  assert(r.decoArr, 'deco no es array');
  await page.close();
});

// T11: Cambiar de habitación
test('T11 — Cambiar de habitación', async () => {
  const { page, errors } = await freshPage();
  const r = await page.evaluate(() => {
    const s = window.__simon;
    s.e.intro = true;
    s.e.xp = 5000; // desbloquear habitaciones
    const antes = s.e.hab;
    s.irHab(1); // ir a la segunda hab
    return { antes, despues: s.e.hab };
  });
  await page.waitForTimeout(300);
  assert(errors.length === 0, 'Errores: ' + errors.join('; '));
  await page.close();
});

// T12: Backup rotativo escribe CLAVE_BK
test('T12 — Backup rotativo', async () => {
  const { page } = await freshPage();
  const ok = await page.evaluate(() => {
    const s = window.__simon;
    s.e.monedas = 4321;
    // Forzar guardaCount alto para trigger backup
    for (let i = 0; i < 11; i++) s.guardar();
    const bk = localStorage.getItem('simon-v1-bk');
    if (!bk) return 'no-bk';
    const d = JSON.parse(bk);
    return d.monedas === 4321 ? 'ok' : `monedas=${d.monedas}`;
  });
  assert(ok === 'ok', `Backup: ${ok}`);
  await page.close();
});

// T13: Sistema de eventos funciona
test('T13 — eventoLibre funciona', async () => {
  const { page } = await freshPage();
  const r = await page.evaluate(() => {
    const s = window.__simon;
    s.e.intro = true;
    const libre = s.eventoLibre(s.EV_TUT);
    // Con modal activo debería bloquear
    return { libre: typeof libre === 'boolean', tieneEV: !!s.EV_TUT && !!s.EV_VIS };
  });
  assert(r.libre, 'eventoLibre no devuelve boolean');
  assert(r.tieneEV, 'faltan constantes EV_');
  await page.close();
});

// ── Runner ───────────────────────────────────────────────────────────
(async () => {
  await startServer();
  browser = await pw.chromium.launch({
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-gpu']
  });

  let passed = 0, failed = 0;
  console.log(`\n  Simon — ${TESTS.length} tests\n`);

  for (const t of TESTS) {
    try {
      await t.fn();
      passed++;
      console.log(`  \x1b[32m✓\x1b[0m ${t.name}`);
    } catch (e) {
      failed++;
      console.log(`  \x1b[31m✗\x1b[0m ${t.name} — ${e.message}`);
    }
  }

  console.log(`\n  ${passed} pasaron, ${failed} fallaron\n`);

  await browser.close();
  server.kill();
  process.exit(failed > 0 ? 1 : 0);
})();

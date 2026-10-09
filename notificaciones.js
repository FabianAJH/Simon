/* ==========================================================================
 * SISTEMA Y CONFIGURACIÓN DE NOTIFICACIONES — SIMON: TU AMIGO VIRTUAL
 * ==========================================================================
 * Archivo: notificaciones.js
 *
 * AQUÍ PUEDES EDITAR FÁCILMENTE:
 *  1. Los textos de cada notificación (qué dice cada aviso).
 *  2. Cuándo se mandan (umbrales de hambre, felicidad, energía, etc.).
 *  3. La configuración para App Móvil (Capacitor/Google Play/iOS) y Web/PWA.
 * ========================================================================== */

// ==========================================================================
// 1. CONFIGURACIÓN EDITABLE DE TEXTOS Y TIEMPOS DE NOTIFICACIÓN
// ==========================================================================
const CONFIG_NOTIS = {
  // ------------------------------------------------------------------------
  // AVISOS AL TELÉFONO / DISPOSITIVO (Notificaciones fuera del juego)
  // ------------------------------------------------------------------------
  sistema: {
    // Cuando Simon se duerme y termina de recuperar toda su energía
    despertar: {
      titulo: 'Simon',
      texto: 'Simon despertó. ¡Ya descansó!'
    },

    // Cuando el hambre baja del umbral indicado (en %)
    hambre: {
      umbral: 25, // Se avisa si el hambre baja de este valor
      titulo: 'Simon',
      texto: 'Simon tiene hambre. ¿Un keke?'
    },

    // Cuando la felicidad baja del umbral indicado (en %)
    tristeza: {
      umbral: 25, // Se avisa si la felicidad baja de este valor
      titulo: 'Simon',
      texto: 'Simon está triste. Necesita mimos o jugar.'
    },

    // Cuando la energía estando despierto baja del umbral indicado (en %)
    energiaBaja: {
      umbral: 20, // Se avisa si la energía baja de este valor
      titulo: 'Simon',
      texto: 'Simon tiene poca energía. Déjalo dormir o dale algo de comer.'
    },

    // Aviso de llegada de Cortex comerciante a la recámara
    comerciante: {
      titulo: 'Simon',
      texto: 'Cortex llegó de comerciante. Se queda 15 minutos.'
    },

    // Recordatorio de regalo diario listo
    regaloDiario: {
      horaAviso: 10, // Hora del día siguiente para notificar (10:00 AM)
      titulo: 'Simon',
      texto: 'Tienes un regalo diario por reclamar.'
    },

    // Avisos durante las sesiones de estudio / Pomodoro
    estudio: {
      titulo: 'Simon',
      finSesion: '¡Sesión terminada! Toca descansar.',
      finDescanso: 'Se acabó el descanso: a estudiar.'
    }
  },

  // ------------------------------------------------------------------------
  // NOTIFICACIONES INTERNAS (Buzón / Campana dentro del juego)
  // ------------------------------------------------------------------------
  internas: {
    regaloListo: 'Tienes un regalo diario por reclamar.',
    hambreCritica: 'Simon tiene mucha hambre.',
    tristezaCritica: 'Simon está triste. Necesita mimos o jugar.',
    misionesNuevas: 'Cortex tiene misiones nuevas para ti.',
    misionesCompletas: 'Completaste las misiones de Cortex. Te dará nuevas dentro de 24 horas.',
    cortexVisita: 'Cortex vino de visita.',
    cortexEsperaRecamara: 'Cortex vino de visita. Te espera en la recámara.',
    cortexSiesta: 'Cortex se quedó dormido en tu recámara.',
    cortexComercianteLlego: 'Cortex llegó de comerciante. Se queda 15 minutos.',
    cortexComercianteEspera: 'Cortex llegó de comerciante. Te espera en la recámara.',
    cortexExtrano: 'Cortex pasó a preguntar por ti. ¡Te extrañó!',
    despertoSolo: 'Simon durmió mientras no estabas y ya despertó.',
    sigueDurmiendo: 'Simon sigue durmiendo.',
    seDurmioCansado: 'Simon estaba muy cansado y se durmió solo.',
    hallazgo: 'Simon encontró algo. ¡Tócalo para recogerlo!',
    hallazgoAusencia: 'Simon encontró algo mientras no estabas. ¡Tócalo para recogerlo!',
    resfriado: 'Simon se resfrió. Dale jarabe o abrígalo.',
    curado: 'Simon se curó del resfriado.',
    perritoParque: 'Un perrito apareció en el parque.',
    avisoMercader: 'Cortex vendrá a venderte cosas una vez al día y te avisará antes de llegar.',
    avisoDice: 'SIMON DICE tiene preguntas y misiones.',
    avisoRespaldo: 'Hace tiempo que no guardas un respaldo. Hazlo en Ajustes (engranaje) > Respaldo, así no pierdes a Simon si cambias de celular.',
    clima: {
      lluvia: 'Empezó a llover.',
      finLluvia: 'Dejó de llover.',
      tormenta: 'Empezó una tormenta. Simon tendrá miedo.',
      finTormenta: 'Pasó la tormenta.',
      nieve: '¡Empezó a nevar!',
      finNieve: 'Dejó de nevar.',
      arcoiris: 'Salió un arcoíris.',
      finArcoiris: 'Se fue el arcoíris.'
    }
  }
};

// ==========================================================================
// 2. MOTOR DE NOTIFICACIONES INTERNAS (HISTORIAL Y CAMPANA DEL HUD)
// ==========================================================================
let notiNuevas = 0;

function pintarNotis() {
  if (typeof $ !== 'function') return;
  const n = (e && e.notis ? e.notis : []).filter(x => !x.l).length;
  const b = $('nb-noti');
  if (b) {
    b.textContent = n > 9 ? '9+' : n;
    b.classList.toggle('oculto', !n);
  }
}

function notificar(t) {
  if (!e) return;
  if (!e.notis) e.notis = [];
  const u = e.notis[0];
  if (u && u.t === t && ahora() - u.ts < 60000) return;
  e.notis.unshift({ t, ts: ahora(), l: 0 });
  e.notis = e.notis.slice(0, 40);
  pintarNotis();
  if (typeof guardar === 'function') guardar();
}

const hace = ts => {
  const m = Math.max(0, Math.round((ahora() - ts) / 60000));
  return m < 1 ? 'AHORA' : m < 60 ? 'HACE ' + m + ' MIN' : m < 1440 ? 'HACE ' + Math.round(m / 60) + ' H' : 'HACE ' + Math.round(m / 1440) + ' D';
};

function renderNotis() {
  if (typeof $ === 'function' && $('m-titulo')) $('m-titulo').textContent = 'NOTIFICACIONES';
  const L = (e && e.notis) ? e.notis : [];
  if (!L.length) return '<div class="centro" style="font-size:8px;line-height:2;color:#aab4ff;padding:16px 0">Todo tranquilo por aquí.<br>Aquí verás lo nuevo que pase.</div>';
  return L.map((n, i) => `<div class="noti ${i < notiNuevas ? 'nueva' : ''}">${n.t}<div class="nh">${hace(n.ts)}</div></div>`).join('') +
    '<button class="bt" style="width:100%;padding:12px 0;margin-top:6px" data-a="not_borrar">BORRAR TODO</button>';
}

function resumenAusencia() {
  if (!e || !e.intro || (typeof ausenciaH !== 'undefined' && ausenciaH < 1)) return;
  const h = ausenciaH, tx = h >= 48 ? Math.round(h / 24) + ' días' : Math.round(h) + (Math.round(h) === 1 ? ' hora' : ' horas');
  const p = [];
  if (e.hambre < 30) p.push('tenía mucha hambre');
  if (e.feliz < 30) p.push('estaba triste');
  if (e.energia < 25) p.push('quedó con sueño');
  notificar('Estuviste fuera ' + tx + '. ' + (p.length ? 'Simon ' + p.join(', ') + '.' : 'Simon se portó bien.'));
  if (typeof despertoOffline !== 'undefined' && despertoOffline) notificar(CONFIG_NOTIS.internas.despertoSolo);
  else if (e.dormido) notificar(CONFIG_NOTIS.internas.sigueDurmiendo);
  if (e.hallazgo) notificar(CONFIG_NOTIS.internas.hallazgoAusencia);
  if (h >= 24) notificar(CONFIG_NOTIS.internas.cortexExtrano);
}

function checkNotis() {
  if (!e || !e.intro) return;
  const t = ahora();
  const I = CONFIG_NOTIS.internas;
  const S = CONFIG_NOTIS.sistema;
  if (typeof misionesHoy === 'function') misionesHoy();
  if (e.misAviso) { e.misAviso = 0; notificar(I.misionesNuevas); if (typeof pintar === 'function') pintar(); }
  if (typeof infoRegalo === 'function' && infoRegalo() && e.nRegalo !== hoy()) { e.nRegalo = hoy(); notificar(I.regaloListo); }
  if (e.hambre < S.hambre.umbral && t - (e.nHam || 0) > 6 * 3600000) { e.nHam = t; notificar(I.hambreCritica); }
  if (e.feliz < S.tristeza.umbral && t - (e.nFel || 0) > 6 * 3600000) { e.nFel = t; notificar(I.tristezaCritica); }
  if (typeof clima === 'function') {
    const c = clima(), mojado = ['lluvia', 'tormenta', 'nieve', 'arcoiris'];
    if (c !== e.nClima) {
      const antes = e.nClima;
      e.nClima = c;
      if (c === 'lluvia') notificar(I.clima.lluvia);
      else if (c === 'tormenta') notificar(I.clima.tormenta);
      else if (c === 'nieve') notificar(I.clima.nieve);
      else if (c === 'arcoiris') notificar(I.clima.arcoiris);
      else if (mojado.includes(antes)) {
        notificar(antes === 'lluvia' ? I.clima.finLluvia : antes === 'tormenta' ? I.clima.finTormenta : antes === 'nieve' ? I.clima.finNieve : I.clima.finArcoiris);
      }
    }
  }
  pintarNotis();
}

// ==========================================================================
// 3. AVISOS DEL SISTEMA: APP MÓVIL (CAPACITOR) Y NAVEGADOR (PWA / WEB)
// ==========================================================================

// Detección de Capacitor (para Google Play y App Store)
const ntNativo = () => {
  try {
    return (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) || null;
  } catch (_) {
    return null;
  }
};

let ntTimers = [], ntSig = '';

// Canal de notificaciones nativo en Android (importancia alta, vibración y sonido)
function asegurarCanalNativo() {
  const LN = ntNativo();
  if (LN && LN.createChannel) {
    try {
      LN.createChannel({
        id: 'simon_canal',
        name: 'Alertas de Simon',
        description: 'Avisos de hambre, sueño y visitas en Simon',
        importance: 5,
        visibility: 1,
        vibration: true
      }).catch(() => {});
    } catch (_) {}
  }
}

// Cálculo de fechas y horas futuras de notificación
function ntPendientes() {
  if (!e) return [];
  const L = [], now = Date.now(), H = 3600000;
  const add = (id, ms, body, tag) => {
    if (ms > now + 20000) L.push({ id, ts: Math.round(ms), body, tag: tag || 'simon-' + id });
  };
  const S = CONFIG_NOTIS.sistema;

  if (e.dormido) {
    const tDesp = now + Math.max(0, (100 - e.energia) / (typeof rDormir === 'function' ? rDormir() : 50)) * H;
    add(1, tDesp, S.despertar.texto, 'simon-despertar');
  } else {
    const ritmoHambre = (typeof BAJA !== 'undefined' && BAJA.hambre) ? BAJA.hambre : 5;
    const ritmoFeliz = (typeof BAJA !== 'undefined' && BAJA.feliz) ? BAJA.feliz : 4;
    const ritmoEnergia = (typeof BAJA !== 'undefined' && BAJA.energia) ? BAJA.energia : 4;

    if (e.hambre > S.hambre.umbral) {
      add(2, now + (e.hambre - S.hambre.umbral) / ritmoHambre * H, S.hambre.texto, 'simon-hambre');
    }
    if (e.feliz > S.tristeza.umbral) {
      add(3, now + (e.feliz - S.tristeza.umbral) / ritmoFeliz * H, S.tristeza.texto, 'simon-feliz');
    }
    if (e.energia > S.energiaBaja.umbral) {
      add(4, now + (e.energia - S.energiaBaja.umbral) / ritmoEnergia * H, S.energiaBaja.texto, 'simon-energia');
    }
  }

  try {
    const I = typeof mercInfo === 'function' ? mercInfo() : null;
    if (I && (I.est === 'espera' || I.est === 'aviso')) {
      add(5, now + (I.llega - ahora()), S.comerciante.texto, 'simon-comerciante');
    }
  } catch (_) {}

  try {
    if (typeof infoRegalo === 'function' && !infoRegalo()) {
      const d = new Date(ahora());
      d.setDate(d.getDate() + 1);
      d.setHours(S.regaloDiario.horaAviso || 10, 0, 0, 0);
      add(6, now + (d.getTime() - ahora()), S.regaloDiario.texto, 'simon-regalo');
    }
  } catch (_) {}

  if (e.est) {
    add(7, now + (e.est.fin - Date.now()), e.est.fase === 'estudio' ? S.estudio.finSesion : S.estudio.finDescanso, 'simon-est');
  }

  return L;
}

// Mostrar notificación en navegador (PWA / Web)
function ntMostrar(n) {
  try {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      const o = {
        body: n.body,
        icon: 'icon-192.png',
        badge: 'icon-192.png',
        tag: n.tag,
        vibrate: [200, 100, 200]
      };
      if (typeof navigator !== 'undefined' && navigator.serviceWorker && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready
          .then(r => r.showNotification('Simon', o))
          .catch(() => { new Notification('Simon', o); });
      } else {
        new Notification('Simon', o);
      }
    }
  } catch (_) {}
}

// Sincronizar recordatorios futuros (en app nativa o temporizadores locales)
function notifSync(forzar) {
  if (typeof admin !== 'undefined' && admin) return;
  if (typeof reseteando !== 'undefined' && reseteando) return;
  if (!e) return;

  const L = e.notifOn ? ntPendientes() : [];
  const sig = L.map(n => n.id + ':' + Math.round(n.ts / 60000)).join('|');
  if (!forzar && sig === ntSig) return;
  ntSig = sig;

  // 1. Camino App Móvil (Google Play / iOS vía Capacitor)
  const LN = ntNativo();
  if (LN) {
    try {
      asegurarCanalNativo();
      LN.getPending().then(p => {
        if (p && p.notifications && p.notifications.length) {
          return LN.cancel({ notifications: p.notifications.map(x => ({ id: x.id })) });
        }
      }).catch(() => {}).then(() => {
        if (L.length) {
          LN.schedule({
            notifications: L.map(n => ({
              id: n.id,
              title: 'Simon',
              body: n.body,
              channelId: 'simon_canal',
              smallIcon: 'ic_stat_simon',
              schedule: { at: new Date(n.ts), allowWhileIdle: true }
            }))
          }).catch(() => {});
        }
      });
    } catch (_) {}
    return;
  }

  // 2. Camino Navegador Web (PC / Móvil)
  ntTimers.forEach(clearTimeout);
  ntTimers = [];
  L.forEach(n => {
    const espera = n.ts - Date.now();
    if (espera > 0 && espera < 2147000000) {
      ntTimers.push(setTimeout(() => ntMostrar(n), espera));
    }
  });
}

// Interruptor de avisos en Ajustes
function notifToggle() {
  if (!e) return;
  if (e.notifOn) {
    e.notifOn = 0;
    notifSync(true);
    if (typeof guardar === 'function') guardar();
    if (typeof sfx !== 'undefined' && sfx.click) sfx.click();
    if (typeof toast === 'function') toast('Avisos al teléfono apagados');
    if (typeof render === 'function') render();
    return;
  }

  const ok = () => {
    e.notifOn = 1;
    notifSync(true);
    if (typeof guardar === 'function') guardar();
    if (typeof sfx !== 'undefined' && sfx.compra) sfx.compra();
    if (typeof toast === 'function') toast('¡Avisos al teléfono activados!');
    if (typeof render === 'function') render();
  };

  const no = () => {
    if (typeof sfx !== 'undefined' && sfx.no) sfx.no();
    if (typeof toast === 'function') toast('Sin permiso: actívalo en los ajustes del ' + (ntNativo() ? 'teléfono' : 'navegador'));
  };

  const LN = ntNativo();
  if (LN) {
    try {
      LN.requestPermissions().then(r => (r && r.display === 'granted') ? ok() : no()).catch(no);
    } catch (_) { no(); }
    return;
  }

  if (typeof Notification === 'undefined') {
    if (typeof sfx !== 'undefined' && sfx.no) sfx.no();
    if (typeof toast === 'function') toast('Este navegador no permite avisos');
    return;
  }

  if (Notification.permission === 'granted') { ok(); return; }
  if (Notification.permission === 'denied') { no(); return; }

  try {
    Notification.requestPermission().then(p => p === 'granted' ? ok() : no()).catch(no);
  } catch (_) { no(); }
}

// Aviso de fin de sesión o descanso en modo Estudio (Pomodoro)
function estAviso(t) {
  try {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      const o = { body: t, icon: 'icon-192.png', tag: 'simon-est', vibrate: [250, 120, 250] };
      if (typeof navigator !== 'undefined' && navigator.serviceWorker && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready.then(r => r.showNotification('Simon', o)).catch(() => { new Notification('Simon', o); });
      } else {
        new Notification('Simon', o);
      }
    }
  } catch (_) {}
  try { if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([250, 120, 250]); } catch (_) {}
  if (typeof seq === 'function') seq([784, 988, 1175, 1568], .13, 'sine', .07);
}

// Icono en pixel art para la campana de notificaciones (11x11)
function iconoNot() {
  if (typeof Grid !== 'function') return null;
  const g = Grid(11, 11), m = [
    '.....k.....',
    '...kkwkk...',
    '..kwwwwwk..',
    '..kwwwwwk..',
    '..kwwwwwk..',
    '.kwwwwwwwk.',
    '.kwwwwwwwk.',
    'kkkkkkkkkkk',
    '....kyk....',
    '.....k.....',
    '...........'
  ];
  m.forEach((f, y) => [...f].forEach((ch, x) => {
    if (ch === 'w') g.set(x, y, '#e8ecff');
    else if (ch === 'k') g.set(x, y, '#232b63');
    else if (ch === 'y') g.set(x, y, '#ffd84a');
  }));
  return g;
}

// Enlace de interacción del botón de la campana
function bindBotonNotis() {
  if (typeof $ !== 'function') return;
  const b = $('b-noti');
  if (b) {
    b.onclick = () => {
      const fnAbrir = () => {
        notiNuevas = (e && e.notis ? e.notis : []).filter(x => !x.l).length;
        (e && e.notis ? e.notis : []).forEach(x => x.l = 1);
        pintarNotis();
        if (typeof guardar === 'function') guardar();
        if (typeof abrir === 'function') abrir('notis');
      };
      if (typeof menuAbrir === 'function') menuAbrir('notis', fnAbrir);
      else fnAbrir();
    };
  }
}

// Exportación global para entorno navegador y sandbox
if (typeof window !== 'undefined') {
  window.CONFIG_NOTIS = CONFIG_NOTIS;
  window.notificar = notificar;
  window.pintarNotis = pintarNotis;
  window.renderNotis = renderNotis;
  window.resumenAusencia = resumenAusencia;
  window.checkNotis = checkNotis;
  window.ntPendientes = ntPendientes;
  window.ntMostrar = ntMostrar;
  window.notifSync = notifSync;
  window.notifToggle = notifToggle;
  window.estAviso = estAviso;
  window.iconoNot = iconoNot;
  window.bindBotonNotis = bindBotonNotis;
}

// Ejecutar binding inicial del botón si el DOM ya está listo
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindBotonNotis);
  } else {
    bindBotonNotis();
  }
}

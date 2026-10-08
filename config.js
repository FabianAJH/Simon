/* ==========================================================================
 * CONFIGURACION Y BALANCE — SIMON: TU AMIGO VIRTUAL
 * ==========================================================================
 * Este archivo centraliza TODOS los parámetros numéricos de juego y balance.
 * Puedes ajustar la velocidad de las necesidades, precios, recompensas y
 * límites sin tener que buscar en miles de líneas de código.
 *
 * ÍNDICE DE SECCIONES:
 *  1. ESTADÍSTICAS Y DECAIMIENTO (Hambre, energía, felicidad, limpieza)
 *  2. LÍMITES GENERALES (Nivel máximo, capacidad de cuartos, etc.)
 *  3. ECONOMÍA Y PROGRESIÓN (Curvas de cariño, topes diarios, bonos de nivel)
 *  4. PRECIOS Y CONSUMIBLES (Kekes, jarabe, bombas)
 *  5. TIEMPOS Y VISITAS DE CORTEX (Comerciante, siesta, descanso)
 *  6. MINIJUEGOS (Costos de energía, niveles de desbloqueo, recompensas)
 *  7. JARDÍN Y CULTIVOS (Capacidad de parcelas, dimensiones de macetas)
 *  8. ESTUDIO POMODORO (Valores por defecto de estudio y descanso)
 * ========================================================================== */

const CONFIG = {
  // 1. ESTADÍSTICAS Y DECAIMIENTO
  // Valores con los que inicia Simon en una partida nueva (al mínimo)
  statsIniciales: {
    hambre:  0,
    energia: 0,
    feliz:   0,
    limp:    0
  },
  // Cuántos puntos pierde Simon por hora en cada necesidad
  ritmoDecaimiento: {
    hambre:  10,  // Puntos que baja el hambre por hora
    energia: 6,   // Puntos que baja la energía por hora
    feliz:   10,  // Puntos que baja la felicidad por hora
    limp:    4,   // Puntos de limpieza que baja por hora en casa
    limpParque: 6 // Puntos de limpieza que baja por hora en el parque
  },
  statsMax: 100,  // Valor máximo para hambre, energía, felicidad y limpieza

  // 2. LÍMITES GENERALES
  limites: {
    nivelMax:           100, // Nivel máximo de cariño
    mueblesPorCuarto:   18,  // Máximo de muebles colocados por habitación (DECO_MAX)
    fotosAlbum:         8,   // Máximo de fotos guardadas en el álbum (ALBUM_MAX)
    bombasInventario:   99,  // Máximo de bombas que se pueden guardar (BOMBA_MAX)
    jarabesInventario:  9,   // Máximo de jarabes en inventario
    comidasInventario:  99,  // Máximo por cada tipo de comida especial
    semillasInventario: 99   // Máximo por tipo de semilla
  },

  // 3. ECONOMÍA Y PROGRESIÓN
  // Curvas de cariño, límites diarios y premios
  economia: {
    // Monedas máximas que se pueden ganar por día con acciones normales (comer, jugar, etc.)
    topeMonedasDiario: n => 35 + 2.4 * (n <= 25 ? n : 25 + (n - 25) * 0.4),
    // Cariño (XP) diario que rinde al 100%; el exceso rinde solo 25%
    topeXpDiario:      n => 90 + 4.8 * (n <= 25 ? n : 25 + (n - 25) * 0.4),
    // Monedas ganadas al subir de nivel (doble cada 5 niveles, triple cada 25)
    bonoSubirNivel:    n => (25 + 5 * (n <= 25 ? n : 25 + (n - 25) * 0.4)) * (n % 25 === 0 ? 3 : n % 5 === 0 ? 2 : 1),
    // Monedas que da el regalo diario en los días 1 al 7
    premiosRegaloDiario: [9, 12, 15, 18, 22, 30, 75]
  },

  // 4. PRECIOS Y CONSUMIBLES
  precios: {
    bomba:         60, // Precio de una bomba en la tienda
    jarabe:        40, // Precio del jarabe para el resfriado
    kekeExtra:     10, // Costo de un keke cuando ya no quedan gratis hoy
    kekesGratisDia: 5  // Kekes gratis que Simon recibe al día
  },

  // 5. TIEMPOS Y VISITAS DE CORTEX
  cortex: {
    duracionComerciante: 15 * 60000, // 15 minutos en milisegundos (MERC_VENT)
    avisoComerciante:    60 * 60000, // Avisa 60 minutos antes de llegar (MERC_AVISO)
    duracionDescansoBomba: 120000,   // Tiempo que descansa Cortex tras una bomba (2 min)
    duracionSiesta:        150000    // Duración de la siesta de Cortex (2.5 min)
  },

  // 6. CARICIAS Y MIMOS
  mimos: {
    maximo:        8,   // Número de mimos seguidos antes de pedir espacio
    vuelveAQuerer: 3,   // Nivel de mimos al que vuelve a querer caricias
    segundosBaja:  15,  // Segundos que tarda en bajar 1 nivel de mimos
    xpMaximaDia:   20,  // Cariño máximo diario ganado solo por caricias
    monedasMaxDia: 5    // Monedas máximas diarias ganadas por caricias
  },

  // 7. MINIJUEGOS
  minijuegos: {
    atrapaElKeke: { costoEnergia: 2, nivelDesbloqueo: 2,  multiplicadorMonedas: 2 },
    memoria:      { costoEnergia: 2, nivelDesbloqueo: 5,  divisorPuntos: 20 },
    correSimon:   { costoEnergia: 2, nivelDesbloqueo: 8,  multiplicadorMonedas: 3 },
    bailaSimon:   { costoEnergia: 5, nivelDesbloqueo: 12, divisorPuntos: 18 }
  },

  // 8. JARDÍN Y CULTIVOS
  jardin: {
    maxParcelas:   6,  // Máximo de parcelas desbloqueables (JARDIN_MAXP)
    anchoMaceta:   16, // Ancho visual en pixeles (JARDIN_POTW)
    altoMaceta:    13  // Alto visual en pixeles (JARDIN_POTH)
  },

  // 9. MISIONES DIARIAS
  misiones: {
    esperaNuevas: 24 * 3600000 // Tiempo de espera tras completar las 3 misiones (24 h)
  },

  // 10. ESTUDIO POMODORO (Valores predeterminados)
  estudioPomodoro: {
    minutosEstudio:  25, // Minutos por sesión de concentración
    minutosDescanso: 5,  // Minutos de descanso
    sesionesTotales: 4   // Sesiones predeterminadas (0 = infinitas)
  }
};

// --------------------------------------------------------------------------
// ALIAS GLOBALES PARA COMPATIBILIDAD DIRECTA CON EL RESTO DEL CÓDIGO
// --------------------------------------------------------------------------
// Esto permite que el motor y la lógica sigan usando los identificadores
// clásicos (BAJA, NMAX, ECO, etc.) sin necesidad de reescribir algoritmos.
const MAX          = CONFIG.statsMax;
const NMAX         = CONFIG.limites.nivelMax;
const BAJA         = CONFIG.ritmoDecaimiento;
const DECO_MAX     = CONFIG.limites.mueblesPorCuarto;
const ALBUM_MAX    = CONFIG.limites.fotosAlbum;
const BOMBA_MAX    = CONFIG.limites.bombasInventario;
const BOMBA_PRECIO = CONFIG.precios.bomba;
const BOMBA_DESC   = CONFIG.cortex.duracionDescansoBomba;
const VUELO        = 14;
const MED_PRECIO   = CONFIG.precios.jarabe;
const KEKE_P       = CONFIG.precios.kekeExtra;
const KEKE_DIA     = CONFIG.precios.kekesGratisDia;
const MERC_VENT    = CONFIG.cortex.duracionComerciante;
const MERC_AVISO   = CONFIG.cortex.avisoComerciante;
const MIMO_MAX     = CONFIG.mimos.maximo;
const MIMO_VUELVE  = CONFIG.mimos.vuelveAQuerer;
const MIMO_SEG     = CONFIG.mimos.segundosBaja;
const MIMO_XP_DIA  = CONFIG.mimos.xpMaximaDia;
const MIMO_MON_DIA = CONFIG.mimos.monedasMaxDia;
const JARDIN_MAXP  = CONFIG.jardin.maxParcelas;
const JARDIN_POTW  = CONFIG.jardin.anchoMaceta;
const JARDIN_POTH  = CONFIG.jardin.altoMaceta;
const MIS_ESPERA   = CONFIG.misiones.esperaNuevas;

const MJ_COSTO     = CONFIG.minijuegos.atrapaElKeke.costoEnergia;
const MJ_NV        = CONFIG.minijuegos.atrapaElKeke.nivelDesbloqueo;
const MJ_MON       = CONFIG.minijuegos.atrapaElKeke.multiplicadorMonedas;
const MJH          = 176;

const RUN_COSTO    = CONFIG.minijuegos.correSimon.costoEnergia;
const RUN_NV       = CONFIG.minijuegos.correSimon.nivelDesbloqueo;
const RUN_MON      = CONFIG.minijuegos.correSimon.multiplicadorMonedas;

const MEM_COSTO    = CONFIG.minijuegos.memoria.costoEnergia;
const MEM_NV       = CONFIG.minijuegos.memoria.nivelDesbloqueo;
const MEM_DIV      = CONFIG.minijuegos.memoria.divisorPuntos;

const RT_COSTO     = CONFIG.minijuegos.bailaSimon.costoEnergia;
const RT_NV        = CONFIG.minijuegos.bailaSimon.nivelDesbloqueo;
const RT_DIV       = CONFIG.minijuegos.bailaSimon.divisorPuntos;

// Curvas de economía clásicas
const nEf = n => n <= 25 ? n : 25 + (n - 25) * 0.4;
const XP_F = [0, 0, 0.5, 0.36, 0.4, 0.45, 0.5, 0.6, 0.7, 0.8, 0.9];
const xpDe0 = n => Math.round(40 * Math.pow(n - 1, 1.95) * (XP_F[n] === undefined ? 1 : XP_F[n]));
const TOPE_XP = CONFIG.economia.topeXpDiario;
const XPT = (() => {
  const t = [0, 0];
  const DT = { 1: 0, 2: 0.1, 3: 0.25, 4: 0.45, 5: 0.75, 6: 1.3, 7: 1.9, 8: 2.6, 9: 3.4, 10: 4.3 };
  for (let n = 2; n <= NMAX; n++) {
    const dias = n <= 10 ? DT[n] - DT[n - 1] : (n <= 25 ? 0.85 : 1) * 0.27 * Math.pow(n, 0.6);
    t[n] = t[n - 1] + Math.round(dias * 1.15 * TOPE_XP(n - 1));
  }
  return t;
})();
const xpDe = n => n <= 1 ? 0 : XPT[Math.min(n, NMAX + 1)] !== undefined ? XPT[n] : XPT[NMAX] + (n - NMAX) * 1e9;

const STATS_INI = CONFIG.statsIniciales;

const ECO = {
  topeMon: CONFIG.economia.topeMonedasDiario,
  topeXp:  CONFIG.economia.topeXpDiario,
  bono:    CONFIG.economia.bonoSubirNivel,
  premios: CONFIG.economia.premiosRegaloDiario
};
const PREMIOS = ECO.premios;

if (typeof window !== 'undefined') window.CONFIG = CONFIG;

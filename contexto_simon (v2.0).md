# SIMON: TU AMIGO VIRTUAL — Documento de Contexto Completo

> **Versión del juego:** 2.0  
> **Archivos:** `index_v387.html` (juego completo) + `sw_v387.js` (service worker)  
> **Suite de pruebas:** `test_simon.js` → `node test_simon.js` → debe arrojar **"13 pasaron, 0 fallaron"**

---

## 1. ¿Qué es el juego?

**Simon: Tu Amigo Virtual** es una PWA (Progressive Web App) de tipo *virtual pet* de estilo GBA/pixel art, diseñada para móvil y escritorio. Toda la lógica, gráficos, sonido y UI están en **un solo archivo HTML** autocontenido de ~7 400 líneas. No hay servidor ni backend; el estado se guarda localmente.

La premisa narrativa: Cortex (personaje con alas negras, chaleco rojo y corona dorada) encontró a Simon abandonado en la calle, lo adoptó y ahora el jugador lo cuida. Simon solo dice "Sí." pero el jugador puede comprar un *Traductor* para entenderlo.

---

## 2. Arquitectura técnica

### 2.1 Stack
- HTML/CSS/JS puro, sin frameworks ni bundlers
- `<canvas id="cv">` como pantalla del juego (renderizado pixel)
- Web Audio API para toda la música y efectos
- IndexedDB + localStorage para guardado dual con rotación de backups
- Service Worker (`sw_v387.js`) con cache completo para uso offline

### 2.2 Motor de gráficos pixel art
```javascript
// Grid: lienzo de píxeles en memoria
function Grid(w, h) {
  // Devuelve { w, h, d: Uint8ClampedArray }
  // Métodos: set(x,y,color), has(x,y), rect(x,y,rw,rh,c),
  //          art(x,y,rows,map), paste(o,ox,oy), contour(c)
}
function capa(g, contorno, dibujarFn) { /* dibuja capa con contorno opcional */ }
function sombrear(L, test, cx, cy, rx, ry, rampa) {
  // Sombreado por dithering con matriz Bayer 4×4
  // rampa = array de 4 colores de más claro a más oscuro
}
const BAY = [[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]]; // Bayer 4×4
function sprite(clave, fn, dim) { /* cache de sprites por clave */ }
function elipse(cx, cy, rx, ry) { /* devuelve función test(x,y) */ }
```

### 2.3 Dimensiones y layout
- Canvas lógico: `LW × LH` píxeles (calculado para llenar la pantalla)
- Escena de Simon: `SX, SY` (posición) con sprite de `SW=56, SH=78` px
- `RY` = línea del suelo; `OX` = posición horizontal de la ventana

### 2.4 Game loop
```javascript
requestAnimationFrame(tick);
function tick() {
  tk++;  // contador de frames
  // actualiza todos los sistemas → dibuja
  requestAnimationFrame(tick);
}
```

---

## 3. Estado del juego — Objeto `e`

Todo el estado persiste en el objeto `e`, devuelto por `BASE()`:

```javascript
// Stats de Simon (0–100, decaen con el tiempo):
e.hambre    // vacío = hambriento (BAJA: 10 pts/hora)
e.energia   // vacío = cansado   (BAJA: 6 pts/hora)
e.feliz     // vacío = triste    (BAJA: 10 pts/hora)
e.limp      // vacío = sucio     (BAJA: 4 pts/hora normal, 6 en parque)

// Economía:
e.monedas   // moneda del juego
e.xp        // experiencia diaria (cap por nivel)
e.total     // monedas totales ganadas
e.racha     // días consecutivos de regalo
e.mejorRacha

// Progresión:
e.hist      // 0-7: etapa de la historia de introducción
e.intro     // true si ya terminó la intro completa
e.nombre    // nombre del jugador (guardado en e.nombre)
e.traductor // true si Simon tiene el Traductor desbloqueado
e.nivel     // nivel de cariño (calculado por xp total)

// Apariencia de Simon:
e.ropa = { cara, cuello, orejas, espalda, aura, sudadera }
e.cuarto = { pared, alfombra, izq, der, cuadro }

// Inventario:
e.tiene = { /* clave: 1 si se tiene */ }
e.deco = []  // muebles colocados: [{k, x, y, f(flip), h(hab)}]

// Comida en despensa:
e.comida = { keke: n, ensalada: n, bebida: n, ... }

// Estadísticas (para logros y misiones):
e.st = {
  si,      // veces que se tocó a Simon
  comer,   // veces que se le dio comida
  jugar,   // veces que se jugó
  dice,    // veces Simon Dice
  toques,  // toques totales
  dormir,  // veces que durmió
  compras, // compras en tienda
  pizzas,  // pizzas pedidas (Cocina)
  plantas, // plantas cosechadas
  visitas, // visitas de Cortex
  tratos,  // compras a Cortex comerciante
  fotos,   // fotos tomadas
  adiv,    // adivinanzas resueltas
  misiones,// misiones completadas
  bombas,  // bombas explotadas sobre Cortex
  parque,  // visitas al parque
  mj,      // partidas de minijuego
  rt,      // partidas de retruco
  mem,     // partidas de memory
  run      // partidas de endless run
}

// Jardin:
e.jardin = { plots: [] }  // parcelas de cultivo
e.semillas = {}           // semillas en inventario
e.macetaVida = {}         // vida de macetas de interior

// Eventos especiales:
e.dormido        // true si Simon está durmiendo
e.enf            // true si está enfermo
e.abandonoDesde  // timestamp de cuando empezó el abandono
e.sangFase       // 0-2: fase de la luna de sangre / ojo de Cthulhu
e.ovniPend       // 1 si hay evento OVNI pendiente
e.fugazD         // días en que se atrapó estrella fugaz
e.lunaT          // toques a la luna dorada
e.azulT          // toques a la luna azul
e.hallazgo       // objeto encontrado por Simon esperando recogerse

// Próximas visitas (timestamps):
e.proxVisita     // próxima visita de Cortex
e.proxSiesta     // próxima siesta de Cortex
e.proxHallazgo   // próximo hallazgo de Simon
e.proxSiesta
e.cajaT          // cuando aparece la caja misteriosa
```

---

## 4. Sistema de guardado y carga

```javascript
const CLAVE    = 'simon-v1';      // localStorage
const CLAVE_BK = 'simon-v1-bk';  // backup localStorage
const ESQUEMA  = 1;

// guardar(): localStorage + backup cada 10 guardados + IndexedDB
// cargar(): localStorage → backup → IndexedDB
// sanitizar(d): valida y clampea todos los campos al cargar
```

---

## 5. Progresión y economía

### 5.1 Niveles
```javascript
const NMAX = 100;  // nivel máximo
// XP → nivel: calculado con darXp() y nivel()
```

### 5.2 Sistema económico
```javascript
const ECO = {
  topeMon: n => 35 + 2.4 * nEf(n),   // tope diario de monedas (por nivel)
  topeXp:  n => 90 + 4.8 * nEf(n),   // tope diario de XP
  bono:    n => (25 + 5 * nEf(n)) * (n%25===0 ? 3 : n%5===0 ? 2 : 1),
  premios: [9, 12, 15, 18, 22, 30, 75]  // regalos diarios días 1-7
};
function ganar(monedas, xp, libre) { /* gana con caps diarios */ }
```

### 5.3 Regalo diario
- Cada día el jugador reclama un regalo (7 premios rotativos, el día 7 da 75 monedas + el moño dorado si no lo tiene)
- La racha NUNCA se reinicia: si faltas días, continúas donde ibas

---

## 6. Habitaciones y navegación

```javascript
const HABS = [
  { id: 'sala',    n: 'RECÁMARA',       nv: 1  },  // habitación principal con Simon
  { id: 'bano',    n: 'BAÑO',           nv: 1  },
  { id: 'cocina',  n: 'COCINA',         nv: 4  },  // desbloquea en nv 4
  { id: 'juegos',  n: 'SALA DE JUEGOS', nv: 2  },  // nv 2
  { id: 'estudio', n: 'ESTUDIO',        nv: 2  },  // nv 2
  { id: 'entrada', n: 'ENTRADA',        nv: 7  },  // nv 7
  { id: 'jardin',  n: 'JARDÍN',         nv: 10 }   // nv 10
];
const LUGARES = [{ id: 'parque', n: 'PARQUE', nv: 10 }];
// Cada habitación tiene su fondo renderizado con su función XxxGrid()
// La navegación se hace con flechas o tabs laterales
```

---

## 7. El sprite de Simon

```javascript
const SW = 56, SH = 78;  // dimensiones del sprite

function simonGrid(ojos, boca, ropa, est, atras, auraFr) {
  // ojos: 'a'=abiertos, 'c'=cerrados, 'd'=ojeras, etc.
  // boca: 's'=sonrisa, 'n'=normal, 'o'=abierta
  // ropa: objeto con slots cara/cuello/orejas/espalda/aura/sudadera
  // est:  { oj:ojeras, fl:flaco, tri:triste, en:enfermo, ab:abandonado }
}

function estFisico() {
  // Devuelve estado visual según stats:
  // oj=1 si energia<30 (ojeras)
  // fl=2 si hambre<12, fl=1 si hambre<30 (delgado)
  // tri=2 si feliz<12, tri=1 si feliz<30 (triste)
  // en=1 si enfermo
  // ab=1 si abandonado
}
```

Simon tiene variantes de expresión visualmente animadas:
- Gestos especiales: `salto`, `baile`, `besos`, `gran`
- `bocaT` controla cuánto tiempo tiene la boca abierta (animación de habla)
- `gesto(tipo)` activa el gesto; `hablar()` activa la animación de habla

---

## 8. Sistema de acciones principales

### 8.1 Botones de la interfaz
- **COMER** (`#btn-comer`): Abre modal con alimentos disponibles. Cada alimento sube `hambre` X puntos. El keke es el favorito (+25 hambre).
- **DORMIR** (`#btn-dormir`): Simon se duerme y recupera `energia` con el tiempo. La bebida energética lo salta al instante.
- **JUGAR** (`#btn-jugar`): Sube `feliz` y `xp`. Gasta algo de energía.
- **TIENDA** (`#btn-tienda`): Abre la tienda con pestañas (ropa, cuarto, comida, extras, bombas).
- **SIMON DICE** (`#btn-dice`): Interacción aleatoria; Simon responde con un "Sí." y el Traductor lo contextualiza.
- **INV** (`#b-inv`): Inventario de objetos comprados, para equiparlos o colocarlos.

### 8.2 Tocar a Simon
- Tocar el sprite de Simon: sube `feliz` ligeramente, activa gestos, el Traductor dice algo.
- Si Simon tiene el hallazgo flotando (moneda/dibujo), tocarlo lo recoge.

---

## 9. Sistema de Cortex (personaje secundario)

Cortex es el amigo de Simon, narrado como su rescatador. Aparece como personaje en pantalla de izquierda a derecha, con su propio sprite pixel art (alas negras con borde rojo, chaleco acolchado rojo, pelo negro con mechas rojas, corona dorada).

### 9.1 Visitas regulares
```javascript
// e.proxVisita: cada 8-14 horas
// Solo ocurre en la RECÁMARA (sala), sin otro modal activo
function checkVisita() { ... }
function iniciarVisita() {
  // Contenido aleatorio: saludo, regalo (+18-38 monedas), consejo,
  //                     reacción a la ropa de Simon, reacción a enfermedades
  // Después de cada visita: Cortex descansa 2h (se pueden tirar bombas)
}
```

### 9.2 Cortex comerciante
```javascript
// Aparece UNA VEZ AL DÍA a hora variable (10:00-21:30)
// Permanece 15 minutos
// Ofrece 3 ítems exclusivos (no vendidos en tienda normal)
const MERC_VENT  = 15 * 60000;   // 15 minutos
const MERC_AVISO = 60 * 60000;   // aviso 1 hora antes
function ofertasHoy() { ... }    // 3 artículos del día, determinados por hash(fecha)
```

### 9.3 Siesta de Cortex
- A veces (entre 10:00-22:00), Cortex llega y se queda a dormir ~2.5 horas
- Se puede tocar 4 veces para ver diálogos de sueño graciosos
- La 4ª vez lo despierta y se va

### 9.4 Sistema de bombas
```javascript
const BOMBA_PRECIO = 60;   // cuesta 60 monedas en tienda
const BOMBA_MAX    = 99;   // máximo en inventario
const BOMBA_DESC   = 120000; // Cortex descansa 2 min tras la explosión

// Tipos de bomba (probabilidades):
// clasica(38%), confeti(18%), fuegos(16%), pastel(14%), monedas(8%), gigante(6%)
// Cada tipo tiene frases únicas de Cortex y efectos visuales distintos
// Hitos: en explosiones 1, 5, 10, 25, 50, 100, 200 hay frases especiales
// En la 3ª bomba Cortex regala el PELUCHE DE MINI CORTEX
```

### 9.5 Cortex y la memoria de niveles
- Al subir de nivel, Cortex llega con un recuerdo especial de la historia de Simon
- Hay frases personalizadas para los niveles 2 al 25

---

## 10. Historia de introducción (intro)

La intro se controla con `e.hist` (0–7):

```
0: Calle abandonada → Simon está triste junto a la basura bajo la lluvia
1: Cortex llega → le da nombre y corona → fundido → llegan a casa
2: Tutorial: ALIMENTAR (llena hambre al 92%)
3: Tutorial: JUGAR
4: Tutorial: DORMIR (Simon está agotado)
5: Tutorial: BEBIDA ENERGÉTICA
6: Cortex entrega el Traductor → explica la UI
7: e.intro = true → juego libre comienza
```

Funciones clave de la historia:
- `histCalle()` — escena de la calle (lluvia, fondo urbano con farol)
- `histCasa()` — llegada a casa, nombre del jugador, corona
- `histBebida()` — Cortex dona 3 bebidas energéticas
- `histFinal()` — entrega del Traductor, tutorial de UI con `CT()` (flechas resaltadas)
- `pedirNombre(cb, edicion)` — modal de nombre (máx 10 letras)
- `guiaIr(paso)` — avanza el tutorial guiado (bloquea otros botones con `guiaBloq()`)

---

## 11. Sistema de diálogos

```javascript
// Estructura de una línea de diálogo:
{ q: 'CORTEX'|'SIMON'|'SIF'|'TRADUCTOR'|'TU', t: 'texto' }
// Ayudantes:
const C  = t => ({ q: 'CORTEX', t });
const S  = () => ({ q: 'SIMON', t: 'Sí.', fn: () => { bocaT=15; gesto(); hablar(); } });
const T  = t => ({ q: 'TRADUCTOR', t: '«' + t + '»' });
const CT = (t, sel) => ({ q: 'CORTEX', t, pre: () => tutRes(sel) }); // con resaltado

// Iniciar diálogo:
dialogo(arrayDeLineas, callbackFin);

// Opciones de respuesta (bifurcación):
{ q: 'CORTEX', t: 'texto', op: ['Opción A', 'Opción B'],
  res: [[/* líneas si elige A */], [/* líneas si elige B */]] }

// Fanfare (pantalla de premio):
{ q: 'CORTEX', t: '', fan: { g: () => Grid(), t: 'TÍTULO', d: 'descripción' } }
```

---

## 12. Sistema de clima y ciclo día/noche

```javascript
const esNoche = () => { const h = horaR(); return h >= 19 || h < 6; };
function clima() {
  // Climas posibles: 'sol', 'nublado', 'lluvia', 'tormenta', 'nieve', 'arcoiris', 'cafe'
  // Se basa en la hora y en un hash de la fecha
}
// El clima afecta: música, efectos visuales en ventana, limpieza (parque ensucia más),
//                  sonido ambiente, tasa de limpieza
```

---

## 13. Música procedural

Todo el audio es sintetizado en tiempo real con Web Audio API (no hay archivos MP3, excepto `si.mp3`).

```javascript
// Temas por contexto:
// 'lofi'     — sala de día (piano lofi suave)
// 'noche'    — sala de noche (triangle oscuro)
// 'bano'     — baño (arpegios altos, triangle)
// 'cocina'   — cocina (ritmo square animado)
// 'chef'     — cocinando (sawtooth con tempo)
// 'estudio'  — estudio (lofi suave)
// 'juegos'   — arcade (square rítmico)
// 'parque'   — parque (square alegre)
// 'dormir'   — Simon duerme (sine suave)
// 'calle'    — intro calle (triangle triste)
// 'feliz'    — intro casa (square alegre)
// 'luna'     — luna dorada (sine etéreo)
// 'sangre'   — luna de sangre (triangle oscuro, lento)
// 'alien'    — OVNI (sawtooth extraño)
// 'tormenta' — tormenta (triangle siniestro)
// 'sif'      — con Sif la perra (square animado)

function temaMus() { /* decide qué tema usar en cada momento */ }
// El lofi incluye: bajo, acorde de 7ª, melodía, bombo, platillo, crujido de vinilo
// Cambio de tema: suave con filtro lowpass que sube/baja frecuencia de corte
```

---

## 14. Minijuego: Baño (5 fases)

Accesible desde el baño. Minijuego táctil de 5 pasos:

```
1. PIOJOS     — Toca cada piojo en primer plano (pov de la cabeza)
2. SHAMPOO    — Frota 92% del área de la cabeza con el dedo
3. ENJUAGUE   — Pasa agua para quitar toda la espuma
4. JABÓN      — Talla el cuerpo de Simon (vista normal)
5. ENJUAGUE   — Quita toda la espuma del cuerpo
```

Al completar:
- `e.limp = 100`
- `e.feliz` sube +8 a +20 según cuán sucio estaba
- Recompensa: monedas y XP según la suciedad inicial

Señales visuales si Simon está sucio:
- `limp < 45`: piojitos animados orbitando la cabeza
- `limp < 30`: líneas de olor verde subiendo

---

## 15. Minijuego: Cocina (7 recetas)

```javascript
const RECETAS = [
  'ensalada', 'hotcakes', 'tostada', 'licuado',
  'tacocasero', 'kekeperro', 'kekecasero'
];
// cgIni(receta, tutorial) — inicia el minijuego
// cgFin(quemado, tiempo)  — termina y guarda resultado en e.comida
// Tiene tutorial superpuesto (cg.tutI < 2 bloquea la interacción inicial)
// #cg-cx = overlay del tutorial (full-screen)
```

---

## 16. Minijuego: Jardin

```javascript
const JARDIN_MAXP = 6;
function plotsDesbloqueados() {
  // 0 plots (< nv 10), 2 (nv 10), 3 (nv 14), 4 (nv 18), 5 (nv 22), 6 (nv 26)
}
// Tipos de planta: plantaEspectro, plantaCalma, plantaDorada, plantaEco, plantaEterna
// Etapas: 'semilla' → 'brote' → 'listo'
// jardinRegar(i)    — riega la parcela i, activa animación de regadera 60 frames
// jardinCosechar(i) — cosecha si está 'listo', da semillas/monedas/XP
```

Macetas de interior: se pueden colocar en habitaciones; tienen vida propia (`macetaVida`).

---

## 17. Easter eggs: Lunas especiales

### Luna Dorada (domingos 00:00–03:00)
```javascript
function lunaVentana() {
  // Solo domingos (excepto día 15), primer cuarto de la madrugada
  // A una hora al azar (hash del día)
}
// Tocar 3 veces → ovStart() → evento del OVNI
```

### OVNI y el alien verde
Fases: `luz → baja → espera → despega → entra → camina → casco → da → premio → sale`

Al completar: Simon recibe el **Casco Espacial** (accesorio único).

### Luna de Sangre (noches probabilísticas)
```javascript
function lunaSangreT() {
  // 1 de cada 10 noches (21:00–06:00), nunca sábado ni día 15
  // Duración: 3 horas, a hora aleatoria del día
}
// Tocar 3 veces → Ojo de Cthulhu entra por la ventana
// Darle 5 kekes → Simon convence al ojo de quedarse
// Resultado: OJO DE CTHULHU (mascota única, orbita a Simon, Simon duerme 10% más rápido)
```

### Luna Azul (día 15 de cada mes, 00:00–00:59)
```javascript
function lunaAzulT() {
  return d.getDate() === 15 && d.getHours() === 0;
}
// Tocar 5 veces → Esfera azul cae del cielo
// Tocar la esfera → AURA LEGENDARIA (accesorio, brilla con animación azul)
```

### Aura de Trueno (durante tormenta)
```javascript
// Durante tormenta aparecen rayos tocables en la ventana
// Tocar 3 rayos → Centella da una vuelta alrededor de Simon → explota
// Resultado: AURA DE TRUENO (accesorio eléctrico)
```

---

## 18. Sistema de eventos y colas

```javascript
let evPend = [];
function eventoLibre(o) { /* verifica que no haya bloqueos activos */ }
function evAgregar(id, prioridad, check, run) { /* agrega a la cola */ }

// Grupos de bloqueo (EV_*):
// EV_TUT  — tutorial en curso
// EV_VIS  — visita de Cortex pendiente
// EV_SIE  — siesta de Cortex
// EV_INTD — intro de muebles
// EV_INTE — intro del estudio
// EV_MEMR — recuerdos de nivel (Cortex)
// EV_KEKE — evento del keke
// EV_ROPA — evento de ropa nueva
// EV_CEL  — notificaciones del celular (Simon)
// EV_NOCHE — eventos nocturnos
```

---

## 19. Sistema de logros

```javascript
const LOGROS = [ /* ~35 logros */ ];
// Cada logro: { id, n(nombre), d(descripción), meta, r(reward monedas), val(), item? }
// val() devuelve el valor actual del contador correspondiente
// revisar() se llama cada pintar() para desbloquear logros
// Al desbloquear: fanfare() + ganar(r)
// Si tiene item: se regala el ítem
```

---

## 20. Sistema de misiones (Cortex)

Cortex da misiones con objetivos específicos (tomar fotos, cocinar X recetas, etc.).
Se acceden por `#t-mis`. `mision(tipo)` notifica progreso.

---

## 21. El perro Sif

Sif es un personaje desbloqueado a través de la historia (Cortex lo menciona como "mejor amigo que tuve"):

```javascript
// SF() — devuelve el estado de Sif
// sifGrid({ boca, cola }) — sprite del perro
// sifP — true si Sif está presente en la escena
// Tiene su propia música ('sif') y puede aparecer en la sala
```

---

## 22. Modo estudio

Accesible en el ESTUDIO (nv 2). Simon acompaña al usuario mientras estudia:
- Sesiones cronometradas
- Música de fondo (lofi o ambient seleccionable)
- Sonidos ambiente: lluvia, tormenta, café (con sonido de barista y gotas)
- Slider de volumen para el ambiente (`e.estVol`)
- `e.estAmb`: tipo de ambiente ('lluvia', 'tormenta', 'cafe', '')

---

## 23. Cámara y fotos

```javascript
function tomarFoto() {
  // Renderiza el canvas × 4, añade marco polaroid con logo de corona,
  // nombre "SIMON", fecha y nivel de cariño
  // Genera PNG descargable y compartible (Web Share API)
  // Si hay arcoíris: +8 monedas extra (1 vez por día)
}
// e.st.fotos incrementa; hay misión y logro de fotos
```

---

## 24. Modo admin (depuración)

Accesible desde ajustes (código secreto). Permite:
- Cambiar hora (simular día/noche)
- Forzar clima
- Forzar visita de Cortex
- Forzar luna dorada/de sangre/azul
- Forzar mercader
- Ajustar stats de Simon

---

## 25. Service worker y PWA

```javascript
// sw_v387.js
const CACHE = 'simon-v388';  // actualizar al hacer cambios
const ARCHIVOS = ['./', './index.html', './manifest.json', './icon.svg',
                  './si.mp3', './PressStart2P.woff2', './icon-192.png',
                  './icon-512.png', './icon-maskable-512.png'];

// Estrategia: cache-first, con soporte de Range para el audio si.mp3
// Al activar: elimina cachés anteriores
// Al instalar: skipWaiting() para actualización inmediata
```

---

## 26. Workflow de desarrollo (CRÍTICO)

Después de **cualquier cambio al código**, seguir SIEMPRE este proceso:

1. **Correr las pruebas:**
   ```bash
   node /tmp/claude-0/-home-claude/.../verify342/test_simon.js
   # Resultado esperado: "13 pasaron, 0 fallaron"
   ```

2. **Incrementar la versión del caché en `sw_v387.js`:**
   ```javascript
   const CACHE = 'simon-v388';  // → 'simon-v389', etc.
   ```

3. **Entregar ambos archivos** al usuario para subir a GitHub:
   - `index_v387.html` (el juego)
   - `sw_v387.js` (el service worker)

4. **Recordar** al usuario que reemplace los archivos en su repositorio

---

## 27. Constantes y configuración clave

```javascript
const VERSION_JUEGO = '2.0';  // mostrada en ajustes

// Decaimiento de stats (por hora):
const BAJA = { hambre: 10, energia: 6, feliz: 10 };
// (limp baja ~4/hora en casa, ~6/hora en parque)

// Economía:
const ECO = {
  topeMon: n => 35 + 2.4 * nEf(n),
  topeXp:  n => 90 + 4.8 * nEf(n),
  premios: [9, 12, 15, 18, 22, 30, 75]
};

// Bombas:
const BOMBA_PRECIO = 60;
const BOMBA_MAX    = 99;
const BOMBA_DESC   = 120000;  // 2 minutos de descanso de Cortex

// Jardin:
const JARDIN_MAXP = 6;

// Nivel de abandono:
// 3+ días con todo en 0 → nivelAbandono() = 1 (descuidado)
// 7+ días → nivelAbandono() = 2 (abandono total, Simon dice '...s-sí...')
```

---

## 28. Snippets de código críticos

### Función `guardar()`
```javascript
// Serializa `e` a JSON, guarda en localStorage
// Cada 10 guardados: copia en CLAVE_BK (backup) y en IndexedDB
```

### Función `sanitizar(d)`
```javascript
// Clampea todos los stats a 0-100
// Restaura campos faltantes con valores de BASE()
// Garantiza compatibilidad entre versiones
```

### Función `ganar(m, x, libre)`
```javascript
// m = monedas a ganar
// x = XP a ganar
// libre = true → ignora caps diarios
// Aplica topeMon y topeXp según nivel actual
// Actualiza e.monedas, e.xp, e.total
```

### Sistema de fanfare (pantallas de premio)
```javascript
fanfare({ g: () => Grid(), t: 'TÍTULO', d: 'descripción', mudo: false }, callback);
// Muestra pantalla de celebración pixel art
// Animación de texto tecleado + estrellas + botón OK
// Al cerrar: ejecuta callback
```

---

## 29. Archivos de testing

El archivo `test_simon.js` contiene 13 pruebas que verifican:
- Constantes (BAJA, ECO, VERSION_JUEGO='2.0')
- Decaimiento de stats
- Caps de economía por nivel
- Sistema de premios diarios
- Comportamiento de abandono
- Sistema de logros (estructura básica)
- Serialización/deserialización de guardado

**Siempre debe reportar "13 pasaron, 0 fallaron"** antes de entregar cualquier cambio.

---

## 30. Tareas futuras pendientes (del backlog del usuario)

1. **Resina Petrificadora** — ítem consumible que petrifica plantas decorativas (sin efectos de stats), las hace permanentes. No aplica a la flor eterna.
2. **Código de visita entre amigos** — snapshot del estado de Simon que se puede compartir y "visitar" en otro dispositivo.
3. **Micro-tareas cuando los stats están al máximo** — algo que hacer cuando hambre/energía/feliz/limp están al 100.

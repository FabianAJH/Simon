# Diagnóstico y Solución del Bug de Pantalla Vacía al Iniciar

## ¿Qué ocurría?

Al abrir el juego, la pantalla quedaba completamente en azul marino oscuro (`#0f1230`), sin Simon, sin fondo de habitación y con las barras e iconos vacíos. Al cerrar y volver a abrir, el juego continuaba atascado en ese mismo estado.

## Causa Raíz

El problema se debía a una combinación de tres factores:

1. **Fallo en la caché del Service Worker (`sw.js`)**:

   * `sw.js` incluía en su lista de precaché los archivos `./icon-192.png` y `./icon-512.png`, los cuales no existían en el directorio.

   * De acuerdo a la especificación de `Cache.addAll()`, si un solo archivo falla (HTTP 404), la promesa se rechaza por completo y **ningún archivo entra a la caché**.

   * Al abrir el juego sin conexión o en modo PWA, el navegador intentaba cargar los scripts modulares (`config.js`, `engine.js`, `items.js`, etc.), pero al no estar en caché y fallar la red, la carga de scripts se detenía por completo. El HTML inicial quedaba congelado sin que ningún código JavaScript llegara a ejecutarse.

2. **Falta de tolerancia a fallos en `cargar()` y `_aplicarSave()` (`engine.js`)**:

   * En `_aplicarSave()`, una línea de comentario (`// muebles antiguos...`) tenía código ejecutable al final de la misma línea (`e.adv = ...; e.logros = ...; e.dibujos = ...;`), lo que dejaba esos campos sin inicializar bajo ciertas condiciones.

   * Además, `_aplicarSave()` carecía de bloques `try/catch`. Si algún dato en `localStorage` contenía valores nulos o inesperados, `cargar()` arrojaba una excepción no capturada en la línea 4092 de `game.js`, antes de que `pintar()` y `dibujar()` pudieran ejecutarse.

   * Al cerrarse y abrirse, `localStorage` mantenía los mismos datos problemáticos, repitiendo el fallo en cada apertura.

3. **Ausencia de pantalla de auto-recuperación (`index.html`)**:

   * Si ocurría cualquier error de red o script antes de inicializar el motor, no había ningún mecanismo que permitiera al jugador reintentar o reparar la partida guardada.

## Soluciones Implementadas

1. **Generación de iconos faltantes y actualización de `sw.js`**:

   * Se generaron los archivos `icon-192.png` y `icon-512.png` a partir del icono maestro.

   * Se reescribió la instalación del Service Worker en `sw.js` para usar `Promise.all` con `.catch()`, asegurando que todos los scripts y estilos esenciales se almacenen en caché incluso si algún recurso estático tarda en responder.

   * Se añadió un fallback para peticiones de navegación sin conexión (`mode === 'navigate'`).

2. **Blindaje de `cargar()` y `_aplicarSave()` (`engine.js`)**:

   * Se colocaron `e.adv`, `e.logros` y `e.dibujos` en su propia línea fuera de comentarios.

   * Se envolvió `_aplicarSave()` y `cargar()` en bloques `try/catch` con valores por defecto seguros (`BASE()`) y validación con `sanitizar(e)`.

   * Se aseguraron los cálculos de tiempo (`horas`) contra valores `NaN` o timestamps inválidos.

3. **Protección en el arranque del juego (`game.js`)**:

   * Se envolvieron las llamadas críticas iniciales (`cargar()`, `pintar()`, `ajustar()`, `pintarIconos()`) en bloques de seguridad para garantizar que el renderizado de la habitación y de los botones siempre ocurra, aun si una notificación opcional falla.

4. **Pantalla de auto-reparación en `index.html`**:

   * Se añadió un script de rescate ligero al inicio de `index.html` que detecta si el juego falló al arrancar y ofrece un botón de "REPARAR Y REINICIAR" que limpia la caché dañada y restaura el juego automáticamente.
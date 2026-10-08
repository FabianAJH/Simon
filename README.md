# Botón de Vestir a Simón Directo en el HUD

Este paquete incluye la implementación del botón directo para vestir a Simón en la barra lateral de acciones del juego.

## Ubicación y Disposición

En la esquina inferior derecha (`.lateral`), los tres botones están distribuidos horizontalmente en el siguiente orden de izquierda a derecha:

1. **Botón Cámara (`#b-foto`)**: Icono de cámara para capturar y compartir fotos de Simón.
2. **Botón Vestir (`#b-vestir`)**: Icono en pixel art de una percha/gancho de ropa (`#ic-ves`). Permite abrir y alternar directamente el probador/guardarropa (`vestir`). Se encuentra posicionado en medio de los tres botones.
3. **Botón Editar Habitación (`#b-editar`)**: Icono de casita para entrar al modo de edición y distribución de muebles.

De esta manera, el botón de vestir a Simón queda ubicado exactamente en medio de los tres iconos.

---

## Archivos Modificados

1. **`index.html`**:
   - Elemento `#b-vestir` con `<canvas id="ic-ves" width="11" height="11">` ubicado en medio de `#b-foto` y `#b-editar` dentro de `.lateral`.

2. **`game.js`**:
   - **`iconoVes()`**: Genera el icono en pixel art (11×11) de una percha/gancho de ropa con gancho superior curvo y barra horizontal en `#e8ecff`, claramente distinguible.
   - **`pintarIconos()`**: Dibuja el icono de la percha sobre el canvas `#ic-ves`.
   - **`#b-vestir.onclick`**: Conecta el botón directamente con `menuAbrir('vestir')`, permitiendo abrir el probador, alternar su cierre si ya está abierto, o cambiar limpiamente desde otro menú activo, respetando los bloqueos en diálogos y tutoriales.

3. **`engine.js`**:
   - **`pintarNav()`**: Mantiene la validación para atenuar y bloquear visualmente `#b-vestir` con la clase `.bloq` cuando el jugador se encuentra fuera de la casa (en la calle o vistas bloqueadas), en paridad con `#b-editar`.

4. **`sw.js`**:
   - Versión de caché actualizada a `simon-v443`.
"""
Base de datos y reglas de las rachas.

Reglas:
- Un "día de stream" es la fecha (hora de México) en que EMPEZÓ el stream.
  Si el stream pasa de medianoche, sigue contando como el mismo día.
- Cada usuario puede activar su racha una sola vez por día de stream,
  aunque ese día haya dos streams.
- La racha cuenta días de stream seguidos. Los días en que no hubo stream
  no rompen la racha.
- Si alguien falta a un día de stream, se usa sola su protección del mes
  (una por mes). Si ya la gastó, su racha vuelve a 0.
"""

import sqlite3
from contextlib import contextmanager
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

# El archivo de la base de datos se crea solo, junto a este archivo
ARCHIVO_BD = Path(__file__).parent / "rachas.db"

ZONA = ZoneInfo("America/Mexico_City")

# Parámetros que se pueden cambiar desde el panel. Estos son los valores
# con los que empieza una base de datos nueva.
CONFIG_INICIAL = {
    "top": "10",                    # cuántos se muestran primero, por racha
    "segundos_por_usuario": "5",    # cuánto dura cada usuario en el banner
    "mensaje_activacion": "🔥 {nombre} activó su racha del día y lleva {racha}",
    "mensaje_repetida": "{nombre}, ya activaste tu racha hoy (llevas {racha})",
    "mensaje_comando": "{nombre}: racha de {racha} 🔥 · mejor racha {maxima} · {streams} streams en total",
    # Recompensa de puntos de canal que activa la racha
    "recompensa_titulo": "Activar racha 🔥",
    "recompensa_costo": "100",
    "recompensa_descripcion": "Canjéala una vez por stream para mantener tu racha.",
    "recompensa_id": "",            # lo llena el servidor cuando crea la recompensa en Kick
    # Recompensa para que cada quien consulte su racha en el chat
    "recompensa2_titulo": "Ver mi racha",
    "recompensa2_costo": "1",
    "recompensa2_descripcion": "El bot te dice en el chat cuánto llevas de racha.",
    "recompensa2_id": "",
    # Simón
    "simon_imagen": "",             # archivo de la carpeta media con el dibujo de Simón
    "simon_meta": "10",             # canjes para que explote la bomba gigante
    "simon_cuenta": "0",            # canjes que lleva la bomba gigante
    "simon_mensaje_explosion": "💥 ¡La bomba gigante explotó! Toca reto. Sí.",
}


@contextmanager
def conectar():
    """Abre la base de datos, guarda los cambios al terminar y la cierra."""
    conexion = sqlite3.connect(ARCHIVO_BD)
    conexion.row_factory = sqlite3.Row  # permite usar fila["columna"]
    try:
        yield conexion
        conexion.commit()
    except Exception:
        conexion.rollback()
        raise
    finally:
        conexion.close()


def crear_tablas() -> None:
    """Crea las tablas si todavía no existen. Se llama al arrancar el servidor."""
    with conectar() as bd:
        bd.executescript(
            """
            CREATE TABLE IF NOT EXISTS usuarios (
                id              INTEGER PRIMARY KEY,
                nombre          TEXT NOT NULL UNIQUE COLLATE NOCASE,
                kick_id         INTEGER UNIQUE,         -- se llenará al conectar Kick
                racha           INTEGER NOT NULL DEFAULT 0,
                racha_maxima    INTEGER NOT NULL DEFAULT 0,
                streams_totales INTEGER NOT NULL DEFAULT 0,
                ultimo_dia      TEXT,                   -- último día activado o protegido
                mes_proteccion  TEXT                    -- mes (AAAA-MM) en que gastó su protección
            );

            CREATE TABLE IF NOT EXISTS streams (
                id      INTEGER PRIMARY KEY,
                dia     TEXT NOT NULL,                  -- día de stream (AAAA-MM-DD)
                inicio  TEXT NOT NULL,
                fin     TEXT                            -- vacío mientras sigue en vivo
            );

            CREATE TABLE IF NOT EXISTS activaciones (
                id         INTEGER PRIMARY KEY,
                usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
                stream_id  INTEGER NOT NULL REFERENCES streams(id),
                dia        TEXT NOT NULL,
                creado     TEXT NOT NULL,
                UNIQUE (usuario_id, dia)                -- una activación por día de stream
            );

            CREATE TABLE IF NOT EXISTS config (
                clave TEXT PRIMARY KEY,
                valor TEXT NOT NULL
            );
            """
        )
        # Guarda los parámetros iniciales solo si todavía no existen
        for clave, valor in CONFIG_INICIAL.items():
            bd.execute(
                "INSERT OR IGNORE INTO config (clave, valor) VALUES (?, ?)",
                (clave, valor),
            )


def ahora() -> datetime:
    return datetime.now(ZONA)


def stream_en_vivo(bd) -> sqlite3.Row | None:
    """Devuelve el stream que está abierto, o None si no hay ninguno."""
    return bd.execute(
        "SELECT * FROM streams WHERE fin IS NULL ORDER BY id DESC LIMIT 1"
    ).fetchone()


def iniciar_stream(dia: str | None = None) -> dict:
    """
    Abre un stream. Si es el primero de un día nuevo, revisa quién faltó al
    día de stream anterior: usa su protección o le reinicia la racha.

    `dia` solo se usa para hacer pruebas; normalmente es la fecha de hoy.
    """
    with conectar() as bd:
        abierto = stream_en_vivo(bd)
        if abierto:
            return {"ok": False, "motivo": "ya_en_vivo", "dia": abierto["dia"]}

        dia = dia or ahora().date().isoformat()
        protegidos: list[str] = []
        perdieron: list[str] = []

        ya_hubo_stream_hoy = bd.execute(
            "SELECT 1 FROM streams WHERE dia = ?", (dia,)
        ).fetchone()

        dia_anterior = bd.execute(
            "SELECT MAX(dia) AS dia FROM streams WHERE dia < ?", (dia,)
        ).fetchone()["dia"]

        if not ya_hubo_stream_hoy and dia_anterior:
            mes = dia_anterior[:7]  # "2026-10-03" -> "2026-10"

            # Usuarios con racha que no activaron el día de stream anterior
            faltaron = bd.execute(
                """
                SELECT * FROM usuarios
                WHERE racha > 0 AND (ultimo_dia IS NULL OR ultimo_dia < ?)
                """,
                (dia_anterior,),
            ).fetchall()

            for usuario in faltaron:
                if usuario["mes_proteccion"] != mes:
                    # Todavía tenía la protección de ese mes: se gasta sola
                    bd.execute(
                        "UPDATE usuarios SET mes_proteccion = ?, ultimo_dia = ? WHERE id = ?",
                        (mes, dia_anterior, usuario["id"]),
                    )
                    protegidos.append(usuario["nombre"])
                else:
                    bd.execute(
                        "UPDATE usuarios SET racha = 0 WHERE id = ?", (usuario["id"],)
                    )
                    perdieron.append(usuario["nombre"])

        bd.execute(
            "INSERT INTO streams (dia, inicio) VALUES (?, ?)",
            (dia, ahora().isoformat(timespec="seconds")),
        )

        return {
            "ok": True,
            "dia": dia,
            "protecciones_usadas": protegidos,
            "rachas_perdidas": perdieron,
        }


def terminar_stream() -> dict:
    """Cierra el stream que esté abierto."""
    with conectar() as bd:
        abierto = stream_en_vivo(bd)
        if not abierto:
            return {"ok": False, "motivo": "sin_stream"}
        bd.execute(
            "UPDATE streams SET fin = ? WHERE id = ?",
            (ahora().isoformat(timespec="seconds"), abierto["id"]),
        )
        return {"ok": True, "dia": abierto["dia"]}


def _buscar_usuario(bd, nombre: str, kick_id: int | None) -> sqlite3.Row | None:
    """
    Busca primero por el id de Kick (no cambia aunque la persona se cambie
    el nombre) y, si no aparece, por el nombre.
    """
    usuario = None
    if kick_id is not None:
        usuario = bd.execute(
            "SELECT * FROM usuarios WHERE kick_id = ?", (kick_id,)
        ).fetchone()
    if usuario is None:
        usuario = bd.execute(
            "SELECT * FROM usuarios WHERE nombre = ?", (nombre,)
        ).fetchone()
    return usuario


def activar_racha(nombre: str, kick_id: int | None = None) -> dict:
    """
    Activa la racha de un usuario en el stream actual.
    Devuelve "ok": False si no hay stream o si ya la activó en este día.
    """
    with conectar() as bd:
        stream = stream_en_vivo(bd)
        if not stream:
            return {"ok": False, "motivo": "sin_stream"}

        # Busca al usuario; si es la primera vez que aparece, lo crea
        usuario = _buscar_usuario(bd, nombre, kick_id)
        if usuario is None:
            bd.execute(
                "INSERT INTO usuarios (nombre, kick_id) VALUES (?, ?)", (nombre, kick_id)
            )
        elif kick_id is not None and (
            usuario["kick_id"] != kick_id or usuario["nombre"] != nombre
        ):
            # Guarda su id de Kick y, si se cambió el nombre, el nombre nuevo
            try:
                bd.execute(
                    "UPDATE usuarios SET kick_id = ?, nombre = ? WHERE id = ?",
                    (kick_id, nombre, usuario["id"]),
                )
            except sqlite3.IntegrityError:
                pass  # el nombre nuevo ya lo tiene otro registro: se deja como está
        usuario = _buscar_usuario(bd, nombre, kick_id)

        ya_activo = bd.execute(
            "SELECT 1 FROM activaciones WHERE usuario_id = ? AND dia = ?",
            (usuario["id"], stream["dia"]),
        ).fetchone()
        if ya_activo:
            return {
                "ok": False,
                "motivo": "ya_activada",
                "nombre": usuario["nombre"],
                "racha": usuario["racha"],
            }

        racha = usuario["racha"] + 1
        bd.execute(
            """
            UPDATE usuarios
            SET racha = ?, racha_maxima = MAX(racha_maxima, ?),
                streams_totales = streams_totales + 1, ultimo_dia = ?
            WHERE id = ?
            """,
            (racha, racha, stream["dia"], usuario["id"]),
        )
        bd.execute(
            "INSERT INTO activaciones (usuario_id, stream_id, dia, creado) VALUES (?, ?, ?, ?)",
            (usuario["id"], stream["id"], stream["dia"], ahora().isoformat(timespec="seconds")),
        )

        return {"ok": True, "nombre": usuario["nombre"], "racha": racha}


def usuarios_con_racha() -> list[dict]:
    """Todos los usuarios con racha viva, de mayor a menor."""
    with conectar() as bd:
        filas = bd.execute(
            "SELECT nombre, racha FROM usuarios WHERE racha > 0 ORDER BY racha DESC, nombre"
        ).fetchall()
        return [dict(fila) for fila in filas]


def datos_usuario(nombre: str, kick_id: int | None = None) -> dict | None:
    """Lo que muestra el comando !racha."""
    with conectar() as bd:
        usuario = _buscar_usuario(bd, nombre, kick_id)
        if usuario is None:
            return None

        stream = stream_en_vivo(bd)
        activo_hoy = bool(
            stream
            and bd.execute(
                "SELECT 1 FROM activaciones WHERE usuario_id = ? AND dia = ?",
                (usuario["id"], stream["dia"]),
            ).fetchone()
        )
        mes_actual = (stream["dia"] if stream else ahora().date().isoformat())[:7]

        return {
            "nombre": usuario["nombre"],
            "racha": usuario["racha"],
            "racha_maxima": usuario["racha_maxima"],
            "streams_totales": usuario["streams_totales"],
            "activo_hoy": activo_hoy,
            "proteccion_disponible": usuario["mes_proteccion"] != mes_actual,
        }


# ---------------------------------------------------------------------------
# Funciones que usa el panel de administración
# ---------------------------------------------------------------------------
def leer_config() -> dict:
    """Devuelve los parámetros guardados."""
    with conectar() as bd:
        config = dict(CONFIG_INICIAL)
        for fila in bd.execute("SELECT clave, valor FROM config"):
            config[fila["clave"]] = fila["valor"]
    config["top"] = int(config["top"])
    config["segundos_por_usuario"] = int(config["segundos_por_usuario"])
    config["recompensa_costo"] = int(config["recompensa_costo"])
    config["recompensa2_costo"] = int(config["recompensa2_costo"])
    config["simon_meta"] = int(config["simon_meta"])
    config["simon_cuenta"] = int(config["simon_cuenta"])
    return config


def guardar_config(nuevos: dict) -> dict:
    """Guarda los parámetros que lleguen (solo los que existen en CONFIG_INICIAL)."""
    with conectar() as bd:
        for clave, valor in nuevos.items():
            if clave in CONFIG_INICIAL:
                bd.execute(
                    "INSERT OR REPLACE INTO config (clave, valor) VALUES (?, ?)",
                    (clave, str(valor)),
                )
    return leer_config()


def estado() -> dict:
    """Dice si hay un stream abierto y de qué día es."""
    with conectar() as bd:
        stream = stream_en_vivo(bd)
        if not stream:
            return {"en_vivo": False, "dia": None, "inicio": None}
        return {"en_vivo": True, "dia": stream["dia"], "inicio": stream["inicio"]}


def listar_usuarios() -> list[dict]:
    """Todos los usuarios (también los que tienen racha 0), para la tabla del panel."""
    with conectar() as bd:
        stream = stream_en_vivo(bd)
        dia = stream["dia"] if stream else None
        mes_actual = (dia or ahora().date().isoformat())[:7]

        activaron_hoy = set()
        if dia:
            activaron_hoy = {
                fila["usuario_id"]
                for fila in bd.execute(
                    "SELECT usuario_id FROM activaciones WHERE dia = ?", (dia,)
                )
            }

        filas = bd.execute(
            "SELECT * FROM usuarios ORDER BY racha DESC, nombre"
        ).fetchall()
        return [
            {
                "id": u["id"],
                "nombre": u["nombre"],
                "racha": u["racha"],
                "racha_maxima": u["racha_maxima"],
                "streams_totales": u["streams_totales"],
                "ultimo_dia": u["ultimo_dia"],
                "activo_hoy": u["id"] in activaron_hoy,
                "proteccion_disponible": u["mes_proteccion"] != mes_actual,
            }
            for u in filas
        ]


def _ultimo_dia_de_stream(bd) -> str | None:
    return bd.execute("SELECT MAX(dia) AS dia FROM streams").fetchone()["dia"]


def crear_usuario(nombre: str, racha: int = 0) -> dict:
    """Agrega un usuario a mano. Lanza ValueError si el nombre ya existe."""
    with conectar() as bd:
        try:
            # ultimo_dia = último día de stream, para que una racha puesta a
            # mano no se pierda en la siguiente revisión como si hubiera faltado
            bd.execute(
                """
                INSERT INTO usuarios (nombre, racha, racha_maxima, ultimo_dia)
                VALUES (?, ?, ?, ?)
                """,
                (nombre, racha, racha, _ultimo_dia_de_stream(bd) if racha > 0 else None),
            )
        except sqlite3.IntegrityError:
            raise ValueError("Ya existe un usuario con ese nombre")
    return {"ok": True}


def actualizar_usuario(
    usuario_id: int,
    nombre: str,
    racha: int,
    racha_maxima: int,
    streams_totales: int,
    proteccion_disponible: bool,
) -> dict:
    """Corrige a mano los datos de un usuario."""
    with conectar() as bd:
        usuario = bd.execute(
            "SELECT * FROM usuarios WHERE id = ?", (usuario_id,)
        ).fetchone()
        if usuario is None:
            raise LookupError("Ese usuario no existe")

        stream = stream_en_vivo(bd)
        mes_actual = (stream["dia"] if stream else ahora().date().isoformat())[:7]

        # Si cambiaste la racha a mano, la damos por "al corriente"
        ultimo_dia = usuario["ultimo_dia"]
        if racha != usuario["racha"] and racha > 0:
            ultimo_dia = _ultimo_dia_de_stream(bd) or ultimo_dia

        try:
            bd.execute(
                """
                UPDATE usuarios
                SET nombre = ?, racha = ?, racha_maxima = ?, streams_totales = ?,
                    ultimo_dia = ?, mes_proteccion = ?
                WHERE id = ?
                """,
                (
                    nombre,
                    racha,
                    max(racha, racha_maxima),  # la máxima nunca queda por debajo
                    streams_totales,
                    ultimo_dia,
                    None if proteccion_disponible else mes_actual,
                    usuario_id,
                ),
            )
        except sqlite3.IntegrityError:
            raise ValueError("Ya existe un usuario con ese nombre")
    return {"ok": True}


def borrar_usuario(usuario_id: int) -> dict:
    """Borra a un usuario y su historial de activaciones."""
    with conectar() as bd:
        bd.execute("DELETE FROM activaciones WHERE usuario_id = ?", (usuario_id,))
        borrados = bd.execute(
            "DELETE FROM usuarios WHERE id = ?", (usuario_id,)
        ).rowcount
        if borrados == 0:
            raise LookupError("Ese usuario no existe")
    return {"ok": True}

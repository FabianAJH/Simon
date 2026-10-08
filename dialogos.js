/* ==========================================================================
 * DIALOGOS Y TEXTOS — SIMON: TU AMIGO VIRTUAL
 * ==========================================================================
 * Este archivo centraliza TODOS los textos, diálogos y frases del juego.
 * Está diseñado para que cualquier persona pueda leer, encontrar y modificar
 * fácilmente los diálogos sin tener que tocar la lógica interna del juego.
 *
 * ÍNDICE DE SECCIONES:
 *  1. CORTEX COMERCIANTE (Llegadas y despedidas diarias)
 *  2. CORTEX VISITAS (Saludos por hora, charlas, consejos y reacciones)
 *  3. CORTEX SIESTA (Frases al dormir y al ser despertado)
 *  4. BOMBAS Y BROMAS A CORTEX (Reacciones al ser explotado, tipos de bomba e hitos)
 *  5. HISTORIA PRINCIPAL / INTRO (Calle, bienvenida a casa, tutoriales de inicio)
 *  6. TUTORIALES DE LA CASA (Cocina, muebles, estudio, primer resfriado, pantalla)
 *  7. EL PERRITO SIF (Encuentro en el parque, darle keke, adopción)
 *  8. SIMON: TRADUCCIONES Y FRASES (Traductor para comer, jugar, caricias, ventana, clima)
 *  9. SIMON DICE (Lista de preguntas ocurrentes)
 * 10. DIARIO DE SECRETOS (Las 24 preguntas y respuestas de Simon)
 * 11. MISIONES DIARIAS (Títulos y metas de Cortex)
 * 12. EVENTOS SECRETOS (OVNI y nave espacial, Ojo de Cthulhu)
 * 13. RECUERDOS DE CORTEX AL SUBIR DE NIVEL (Niveles 2 al 25)
 * ========================================================================== */

// --------------------------------------------------------------------------
// HELPERS PARA CONSTRUCCIÓN DE LÍNEAS DE DIÁLOGO
// --------------------------------------------------------------------------
// C('texto')      -> Línea dicha por Cortex
// S()             -> Línea de Simon diciendo "Sí." con animación de habla
// T('texto')      -> Traducción de Simon mostrada entre comillas «texto»
// CT('texto', sel)-> Línea de Cortex resaltando un botón en pantalla (tutoriales)
// SS()            -> Simon diciendo "Sí..." tímido/triste
const C  = t => ({ q: 'CORTEX', t });
const S  = () => ({ q: 'SIMON', t: 'Sí.', fn: () => { if (typeof bocaT !== 'undefined') bocaT = 15; if (typeof gesto === 'function') gesto(); if (typeof hablar === 'function') hablar(); } });
const T  = t => ({ q: 'TRADUCTOR', t: '«' + t + '»' });
const CT = (t, sel) => ({ q: 'CORTEX', t, pre: () => { if (typeof tutRes === 'function') tutRes(sel); } });
const SS = () => ({ q: 'SIMON', t: 'Sí...', fn: () => { if (typeof bocaT !== 'undefined') bocaT = 10; } });

// ==========================================================================
// 1. CORTEX COMERCIANTE (Llegadas y despedidas diarias)
// ==========================================================================
// Cortex aparece una vez al día para vender objetos especiales traídos de sus viajes.
const DIALOGOS_COMERCIANTE = {
  // Cuando el jugador lo encuentra recién llegado (le quedan los 15 minutos completos)
  llegadaFresca: () => [
    C('¡Hola! Hoy vengo de comerciante.'),
    C('Traje cosas de mis viajes. Tengo 15 minutos.')
  ],
  // Cuando el jugador lo encuentra cuando ya han pasado algunos minutos
  llegadaTarde: (minutosRestantes) => [
    C('¡Justo a tiempo! Hoy vengo de comerciante.'),
    C('Me quedan ' + minutosRestantes + ' minutos. ¡Mira lo que traje!')
  ],
  // Cuando se cumplen los 15 minutos y Cortex se despide
  despedida: () => [
    C('Se me acabó el tiempo. ¡Nos vemos mañana, a otra hora!')
  ]
};

// ==========================================================================
// 2. CORTEX VISITAS (Saludos por hora, charlas, consejos y reacciones)
// ==========================================================================
// Saludos según la hora del día en que Cortex llega de visita
const SALUDOS_HORA = {
  madrugada: [
    '¿Qué hacen despiertos a esta hora? Yo tampoco podía dormir.',
    'Es de madrugada... y aquí estamos, los noctámbulos.'
  ],
  manana: [
    '¡Buenos días! Traigo energía y buen humor.',
    '¡Buen día! ¿Ya desayunó Simon?',
    'Buenos días... ¿hay keke para el desayuno?'
  ],
  tarde: [
    '¡Buenas tardes! Pasaba por aquí.',
    '¡Hola! Qué buena hora para visitar.',
    'Buenas tardes. ¿Hay keke para la merienda?'
  ],
  noche: [
    '¡Buenas noches! Vengo rapidito.',
    'Ya casi es hora de dormir, ¿verdad, Simon?',
    'La noche está linda. Perfecta para visitar.'
  ]
};

// Charlas aleatorias de Cortex sobre cosas que Simon le ha contado
const CHARLAS = [
  'Dice que anoche soñó que vivía dentro de una nube de keke.',
  'Dice que el volcán de su planeta era su mejor amigo.',
  'Dice que quiere aprender a cantar con la lavadora.',
  'Dice que los patos lo entienden mejor que nadie.',
  'Dice que algún día quiere ser rey de los pingüinos.',
  'Dice que tu habitación es la más bonita de todo el universo.',
  'Dice que la luna le guiñó el ojo anoche.',
  'Dice que le caes muy bien. Y que quiere keke.'
];

// Consejos y tips de juego que da Cortex al azar
const TIPS = [
  'Vendré a venderte cosas una vez al día. Te aviso antes.',
  'Cada 7 regalos diarios hay un premio especial.',
  'Cada nivel de cariño enseña un gesto nuevo a Simon.',
  'Toca a Simon: el traductor te dice qué necesita.',
  'Lo que Simon encuentra se recoge tocándolo.',
  'Demasiados mimos lo cansan. Déjalo descansar.',
  'La corona es símbolo de amistad: jamás se quita.'
];

// Comentarios de Cortex cuando Simon lleva puesta cierta ropa o accesorios
const ROPA_CORTEX = {
  mono: 'Ese moño rojo te queda increíble, Simon. Muy elegante.',
  monodorado: '¿Un moño dorado? Simon, hoy vienes de gala.',
  gafas: 'Esas gafas te dan aire de profesor. De profesor de keke.',
  gafas_corazon: 'Gafas de corazón... ¡me encantan!',
  corbata: 'Con esa corbata pareces el jefe de la empresa de keke.',
  bufanda: 'Qué bufanda tan calentita. Yo también quiero una.',
  bufanda_dorada: 'Una bufanda dorada... ¡qué lujo!',
  collar: 'Ese collar te queda perfecto. Muy a la moda.',
  audifonos: 'Oye, ¿qué estás escuchando? Préstame un audífono.',
  orejas_gato: '¿Orejas de gato? Jaja, ¡me encantan! Estás adorable.',
  capa_roja: '¡Una capa! Eres mi superhéroe favorito.',
  capa_azul: 'Esa capa azul te da un aire de héroe misterioso.',
  monoculo: 'Un monóculo. Pareces un conde del keke.',
  sud_calabaza: '¡Una calabaza! Casi te confundo con un adorno.',
  sud_navidad: 'Esa sudadera navideña me da ganas de galletas.',
  sud_dorada: 'Esa sudadera dorada brilla más que mi futuro.',
  sud_negra: 'Sudadera negra, como yo. Tienes buen gusto.',
  sud_arcoiris: '¡Qué sudadera arcoíris tan increíble!',
  sud_roja: 'Roja, como mi chaleco. Somos un equipo.'
};

const DIALOGOS_VISITAS = {
  avisoLlegada: 'Cortex vino de visita.',
  avisoEsperaRecamara: 'Cortex vino de visita. Te espera en la recámara.',
  fraseDescanso: () => C('Me siento a descansar un ratito, ¿sí?'),
  despedidaNormal: () => [
    C('Ya descansé. ¡Gracias por la compañía!'),
    C('Bueno, ya me voy, Simon.')
  ],
  ausenciaLarga: () => [
    C('¡Por fin volviste! Simon preguntaba por ti todo el día.'),
    S(),
    T('Te extrañé mucho.'),
    { q: 'CORTEX', t: 'Toma, una compensación por la espera: 30 monedas.', fn: () => { if (typeof ganar === 'function') ganar(30, 3, true); } }
  ],
  simonEnfermo: () => [
    C('¡Achú! Simon, ¿estás resfriado?'),
    S(),
    T('Tengo frío y la nariz tapada.'),
    { q: 'CORTEX', t: 'Toma, jarabe de mi abuela.', fn: () => { if (typeof curar === 'function') curar('jarabe'); } },
    C('Abrígalo más, ¿sí?')
  ],
  simonTriste: () => [
    C('¡Simon! ¿Estás llorando?'),
    S(),
    T('Necesito un abrazo.'),
    { q: 'CORTEX', t: '*lo abraza fuerte*', fn: () => { if (typeof e !== 'undefined') e.feliz = clamp(e.feliz + 30); if (typeof corazones === 'function') corazones(5); if (typeof gesto === 'function') gesto('besos'); if (typeof sfx !== 'undefined') sfx.regalo(); } },
    C('Ya, ya. Aquí estoy.')
  ],
  simonHambriento: () => [
    C('Se oye su estómago desde la puerta...'),
    S(),
    T('¡Quiero keke!'),
    { q: 'CORTEX', t: 'Traje keke de emergencia.', fn: () => { if (typeof e !== 'undefined') e.hambre = clamp(e.hambre + 35); if (typeof gesto === 'function') gesto('salto'); if (typeof sfx !== 'undefined') sfx.regalo(); } },
    C('¡Aliméntalo mejor, ¿sí?')
  ],
  simonCansado: () => [
    C('Simon, esas ojeras llegan al suelo.'),
    S(),
    T('Tengo muchísimo sueño.'),
    C('Déjalo dormir en su recámara.')
  ],
  regaloMonedas: () => [
    { q: 'CORTEX', t: 'Te traje algo que encontré en mis viajes.', fn: () => { if (typeof ganar === 'function') ganar(18 + Math.floor(Math.random() * 20), 3, true); } },
    S(),
    T('Gracias, Cortex.'),
    C('De nada.')
  ],
  charla: (saludo, frase) => [
    C(saludo),
    S(),
    C(frase)
  ],
  saludoGeneral: (saludo, fraseTraducida) => [
    C(saludo),
    C('¿Cómo está Simon?'),
    S(),
    { q: 'TRADUCTOR', t: '«' + fraseTraducida + '»', fn: () => {} },
    C('Cuídalo mucho.')
  ],
  reaccionRopa: (comentario) => [
    C(comentario),
    S(),
    T('Gracias. Me siento muy guapo.')
  ],
  reaccionBombasRecientes: (fraseCx, fraseSi) => [
    C(fraseCx),
    S(),
    T(fraseSi),
    C('No. No quiero. ...Bueno, no hoy.')
  ]
};

// ==========================================================================
// 3. CORTEX SIESTA (Dormirse, toques sonámbulo y despertar)
// ==========================================================================
const DIALOGOS_SIESTA = {
  iniciar: () => [
    C('Uf... qué día. Voy a sentarme un ratito aquí.'),
    { q: 'CORTEX', t: '...solo cierro los ojos un segundito...', pre: () => { if (typeof desc !== 'undefined') desc = { fin: ahora() + 150000, siesta: true, zzz: true, toques: 0 }; if (typeof bm !== 'undefined') bm = null; } },
    C('Zzz... zzz...')
  ],
  // Diálogos progresivos cuando el jugador toca a Cortex mientras duerme
  toque0: () => [
    C('Mmm... no, yo no me comí el keke... zzz'),
    S(),
    T('Sí se lo comió. ¿Y si lo explotamos?')
  ],
  toque1: () => [
    C('¡Mamá! ...cinco minutitos más... zzz'),
    S(),
    T('Cortex dice cosas raras cuando duerme.')
  ],
  toque2: () => [
    { q: 'CORTEX', t: '*abraza a Simon creyendo que es una almohada*', fn: () => { if (typeof corazones === 'function') corazones(3); if (typeof sfx !== 'undefined') sfx.regalo(); if (typeof gesto === 'function') gesto('besos'); } },
    S(),
    T('Me aprieta mucho. Pero está bien.'),
    C('Qué suave... zzz')
  ],
  toqueDespertarMolesto: () => [
    { q: 'CORTEX', t: '¡¿Quién me toca?! ...Ah. Eran ustedes.', pre: () => { if (typeof desc !== 'undefined') desc.zzz = false; if (typeof bm !== 'undefined') bm = { fase: 'adios', t: 0 }; if (typeof bombaTick === 'function') bombaTick(); } },
    C('Me quedé dormido... ¿tenía baba en la mejilla?'),
    S(),
    T('Un poquito.'),
    C('Jaja. Gracias por dejarme dormir. Hasta pronto.')
  ],
  despertarNatural: () => [
    { q: 'CORTEX', t: '¡Mmh! ...¿Me quedé dormido? ¿Cuánto tiempo pasó?', pre: () => { if (typeof desc !== 'undefined') desc.zzz = false; } },
    S(),
    T('Roncabas muy bonito.'),
    C('Jaja. Gracias por dejarme dormir, Simon. Hasta pronto.')
  ]
};

// ==========================================================================
// 4. BOMBAS Y BROMAS A CORTEX (Reacciones al ser explotado)
// ==========================================================================
// Frases aleatorias que dice Cortex al ser chamuscado por una bomba clásica
const FRASES_BOMBA = [
  '¿Puedes dejar de explotarme?',
  '¡SIMON! ¡Otra vez con las bombas!',
  'Estoy bien... estoy bien... estoy completamente negro, pero estoy bien.',
  '¿Por qué siempre yo?',
  'Esto no era parte del plan de descanso.',
  'Me ardió hasta el flequillo.',
  'Cof, cof... Ya sabía yo que algo tramabas.',
  'Vine por un descansito, no por un bronceado instantáneo.',
  'Ahora sí puedo decir que tengo la piel ahumada.',
  'Creo que me salió humo por las orejas. Y no era de enojo.',
  'Hay amigos que regalan flores. Tú regalas explosiones.',
  'Mi mamá me dijo que escogiera mejores amigos. No le hice caso.',
  'Cof... Qué rico huele... a Cortex frito.',
  'Antes era rojo y negro. Ahora soy solo negro.',
  'Si me vuelves a explotar, te cobro la tintorería.',
  'Siento el pelo parado. Y un poco crujiente.',
  'Esto es una conspiración entre tú y el keke, ¿verdad?',
  'Dime que al menos fue bonito desde ahí.',
  'Mis tenis blancos... ya no son blancos. Son un recuerdo.',
  'Mi chaleco acolchado ahora es chaleco "tostado".',
  'Oye, ¡estaba usando esa cara!',
  'Auch. Otra vez. Ya perdí la cuenta... ah no, la llevo perfectamente.',
  'Cortex crujiente, recién salido del horno.',
  'Tengo una gran noticia: ya no necesito calentarme las manos.'
];

// Traducciones de lo que Simon piensa o dice tras explotar a Cortex
const TRAD_BOMBA = [
  '¡Otra! ¡Otra!',
  'Fue hermoso.',
  'Me encanta cuando explota.',
  'Lo hice con cariño.',
  'Se ve muy bien chamuscado.',
  'Cortex hace un ruido muy gracioso.',
  'Más bombas, por favor.',
  'Fue el mejor BOOM del día.'
];

// Frases especiales por hitos acumulados de bombas lanzadas
const HITOS_BOMBA = {
  1:   'Es la primera vez que me explotas. Vamos a fingir que fue un accidente.',
  5:   'Van cinco explosiones. ¿Sabías que estoy llevando la cuenta?',
  10:  '¡Diez veces! Tengo un récord que nadie quiere tener.',
  25:  'Veinticinco explosiones. Mi lavandera ya me pidió aumento. Nuevo récord personal.',
  50:  'Cincuenta veces. Debería cobrar entrada. Récord personal... y no el que quería.',
  100: '¡CIEN! Soy el humano más explotado del planeta. Y del universo.',
  200: 'Doscientas. Ya hasta le tomo cariño al olor a chamuscado.'
};

// Frases de Cortex según el tipo especial de bomba lanzada
const FR_TIPO = {
  confeti: [
    '¡Confeti! Me cayó en el pelo y en la boca.',
    'Qué bonito... y ahora tengo papelitos hasta en los calcetines.',
    'Una fiesta sorpresa y ni siquiera es mi cumpleaños.',
    '¡Wow! ¿De dónde sacaste una bomba de fiesta?',
    'Cof... pfft... me tragué un papelito rojo.',
    'Esta me gustó más que las explosiones normales. Pero no se lo digas a nadie.'
  ],
  fuegos: [
    '¡Fuegos artificiales! Oooh... aaah...',
    'Qué bonito. Casi me hace llorar. Casi.',
    '¡Mira esos colores, Simon! Esta sí me gustó.',
    'Esta bomba no me quemó. ¡Gracias!',
    'Ojalá todas fueran así de lindas.',
    'El azul fue mi favorito. ¿Cuál fue el tuyo?'
  ],
  pastel: [
    '¡Crema! ¡Tengo crema en todo el pelo!',
    'Mmm... sabe a vainilla. Esto es una bomba de keke.',
    'Simon, ¿explotaste un keke encima de mí?',
    'Me cayó crema en la nariz. Me la voy a comer.',
    'Quedé hecho un pastel. Literalmente.',
    'Al menos huele delicioso.'
  ],
  monedas: [
    '¡Monedas! ¡Llovieron monedas!',
    'Esa sí fue una buena explosión. Me llovió dinero.',
    'Mira, Simon: es tu premio por ser tan travieso.',
    '¿Una bomba que explota en monedas? Quiero una.',
    'Ay, me cayó una en la cabeza. Pero valió la pena.'
  ],
  gigante: [
    '¡¡SIMON!! ¿Qué le pusiste a esa bomba?',
    'Eso... eso fue... demasiado.',
    'Siento las orejas zumbando. Y no es de música.',
    'Los vecinos se van a quejar. Otra vez.',
    'Creo que vi a mi bisabuelo en la luz. Me hizo señas.',
    'Bomba gigante: nivel dios del caos.'
  ]
};

// Respuestas de Simon por tipo especial de bomba
const TR_TIPO = {
  confeti: ['¡Fiesta! ¡Fiesta!', 'Me gusta el confeti.', 'Esto es para celebrar.'],
  fuegos:  ['¡Bonito!', 'Fue para ti, Cortex.', 'Los colores me hacen feliz.'],
  pastel:  ['Pensé que tenía hambre.', 'Keke para Cortex.', 'Está rico, ¿verdad?'],
  monedas: ['Es un regalo.', 'Brilla mucho.', 'Para ti, con cariño.'],
  gigante: ['¡LA MÁS GRANDE!', 'Me encantó el ruido.', 'Otra más grande, por favor.']
};

const DIALOGOS_BOMBAS = {
  siestaInterrumpida: '¡¡AAAAH!! ¡¡Estaba durmiendo!!',
  despedidaAfectuosa: () => [
    C('...Ay, Simon. Ven acá, cabezón.'),
    { q: 'CORTEX', t: '*le acaricia la cabeza con cariño*', fn: () => { if (typeof corazones === 'function') corazones(4); if (typeof gesto === 'function') gesto('besos'); if (typeof sfx !== 'undefined') sfx.regalo(); } },
    C('Nos vemos pronto. Guarda las bombas un ratito, ¿sí?')
  ],
  regaloPelucheBomba3: () => [
    C('Espera, Simon. No te vayas todavía.'),
    C('Tres veces me has explotado y sigues queriéndome igual.'),
    C('Toma. Hice algo para ti.'),
    { q: 'CORTEX', t: '.', fn: () => { if (typeof e !== 'undefined') { e.tiene.peluche_cortex = 1; if (typeof equipar === 'function') equipar('peluche_cortex'); if (typeof guardar === 'function') guardar(); } }, fan: { g: () => (typeof pelucheGrid === 'function' ? pelucheGrid() : null), t: 'MINI CORTEX DE PELUCHE', d: 'LO PUEDES COLOCAR EN TU CASA' } },
    C('Es un mini yo de peluche. Cuídalo mucho, ¿sí?')
  ]
};

// ==========================================================================
// 5. HISTORIA PRINCIPAL / INTRO (Calle, bienvenida a casa, tutoriales de inicio)
// ==========================================================================
const DIALOGOS_HISTORIA = {
  // Escena inicial bajo la lluvia en la calle
  calle: () => [
    C('¿Hay alguien junto a ese bote de basura?'),
    C('¡Oye! ¿Estás bien? Te ves flaquito y con sueño.'),
    SS(),
    C('Solo dices "sí"... pero se nota que estás triste.'),
    C('No puedo dejarte aquí. Yo te saco de esta calle.'),
    C('Ven conmigo y seremos mejores amigos. ¿Qué dices?'),
    { q: 'SIMON', t: '¡Sí!', fn: () => { if (typeof e !== 'undefined') e.feliz = Math.max(e.feliz, 30); if (typeof bocaT !== 'undefined') bocaT = 15; if (typeof gesto === 'function') gesto('salto'); if (typeof corazones === 'function') corazones(4); if (typeof sfx !== 'undefined') sfx.regalo(); if (typeof pintar === 'function') pintar(); } },
    C('Jaja, otra vez "sí". En mi tierra, "Simon" significa "sí".'),
    C('Ese será tu nombre: Simon. ¡Trato hecho!')
  ],
  // Llegada a casa y entrega de la corona
  casa1: () => [
    C('Bienvenido a tu nueva casa, Simon.'),
    SS(),
    { q: 'SIMON', t: '¡Sí!', fn: () => { if (typeof bocaT !== 'undefined') bocaT = 15; if (typeof hablar === 'function') hablar(); } },
    { q: 'CORTEX', t: 'Toma una corona: símbolo de nuestra amistad.', fn: () => { if (typeof sinCorona !== 'undefined') sinCorona = false; if (typeof sfx !== 'undefined') sfx.regalo(); if (typeof estrellas === 'function') estrellas(12); if (typeof corazones === 'function') corazones(5); if (typeof gesto === 'function') gesto('salto'); if (typeof pintar === 'function') pintar(); } },
    { q: 'SIMON', t: '¡Sí!', fn: () => { if (typeof bocaT !== 'undefined') bocaT = 15; if (typeof hablar === 'function') hablar(); } },
    C('La casa no está terminada. Al subir de nivel, abriré zonas nuevas.'),
    C('Yo no puedo cuidarlo todo el día. Él necesita a alguien como tú.'),
    C('Dime, ¿cómo te llamas?')
  ],
  // Tras ingresar el nombre del jugador
  casa2: () => [
    C('Mucho gusto, {n}.'),
    S(),
    { q: 'CORTEX', t: '¿Puedes encargarte de Simon, {n}?', op: ['¡Claro!', 'Mmm... ¿yo?'],
      res: [
        [{ q: 'TU', t: '¡Claro!' }, C('¡Sabía que dirías eso!')],
        [{ q: 'TU', t: 'Mmm... ¿yo?' }, C('Sí, tú. Yo te ayudo.')]
      ]
    },
    C('Míralo: hambriento, cansado y triste. Atiéndelo, ¡ya vuelvo!')
  ],
  // Entrega de bebidas energéticas cuando Simon está agotado en el tutorial
  bebida: () => [
    C('Uy, Simon está agotado. Dormir para recuperar energía toma su tiempo...'),
    C('Para que no tengas que esperar tanto ahorita, te dejo esto.'),
    { q: 'CORTEX', t: '', fan: { g: () => (typeof FGRID !== 'undefined' ? FGRID.bebida() : null), t: '¡3 BEBIDAS ENERGETICAS!', d: 'Le devuelven toda la energia.' }, fn: () => { if (typeof e !== 'undefined') { e.comida.bebida = 3; if (typeof guardar === 'function') guardar(); } } },
    C('Le devuelve la energía al instante, pero no siempre vas a tener bebidas a la mano.'),
    C('Lo normal es dejarlo dormir para que recupere energía. Dale una ahora.')
  ],
  // Entrega del traductor y explicación final del HUD
  final: () => [
    C('¡Mira, como nuevo!'),
    { q: 'SIMON', t: '¡Sí!', fn: () => { if (typeof bocaT !== 'undefined') bocaT = 15; if (typeof gesto === 'function') gesto('salto'); if (typeof hablar === 'function') hablar(); if (typeof corazones === 'function') corazones(3); } },
    C('Yo entiendo a Simon sin traductor. Nos conectamos desde el primer momento.'),
    C('Pero los demás no pueden. Por eso construí esto para ti, {n}.'),
    { q: 'CORTEX', t: '', fan: { c: () => (typeof sprite === 'function' && typeof iconoTrad === 'function' ? sprite('ic_trad', iconoTrad, 0) : null), t: '¡CONSEGUISTE EL TRADUCTOR!', d: 'Ahora entenderas lo que dice Simon.' }, fn: () => { if (typeof e !== 'undefined') { e.traductor = true; if (typeof guardar === 'function') guardar(); } } },
    C('Pruébalo. Simon, ¿qué piensas de {n}?'),
    S(),
    T('Te quiero mucho, {n}.'),
    { q: 'SIMON', t: '¡Quiero keke!', fn: () => { if (typeof bocaT !== 'undefined') bocaT = 15; if (typeof gesto === 'function') gesto('salto'); if (typeof hablar === 'function') hablar(); } },
    C('Jaja. El keke es su comida favorita.'),
    CT('Aquí ves su hambre, energía, felicidad y limpieza.', '.stats'),
    CT('Este círculo es su cariño. Al llenarlo, subes de nivel.', '.med'),
    CT('Vendré a visitarlos. Y una vez al día, como comerciante.'),
    C('Cuídalo mucho. ¡Y que no pierda la corona!')
  ]
};

// ==========================================================================
// 6. TUTORIALES DE LA CASA (Cocina, muebles, estudio, resfriado, pantalla)
// ==========================================================================
// Pasos del tutorial interactivo guiado
const GUIA = {
  comer:   ['1 DE 3', 'ALIMENTA A SIMON', 'DALE KEKES HASTA LLENAR SU BARRA DE HAMBRE'],
  jugar:   ['2 DE 3', 'JUEGA CON SIMON', 'TOCA JUGAR'],
  cansado: ['3 DE 3', 'SIMON ESTA AGOTADO', 'TOCA EL BOTON DORMIR PARA QUE DESCANSE'],
  bebida:  ['3 DE 3', 'DALE LA BEBIDA ENERGETICA', 'TOCA ALIMENTAR Y ELIGE LA BEBIDA']
};

const DIALOGOS_TUTORIALES = {
  cocinaIntro: () => [
    C('¡Esta es la COCINA! Compra ingredientes en el MERCADO y guárdalos en el REFRI.'),
    C('Toca la estufa. Hagamos una tostada juntos, ¡yo te guío!')
  ],
  cocinaFin: (r, est, porc) => [
    C('¡Muy bien! Mira lo que preparaste.'),
    { q: 'CORTEX', t: '', fan: { g: () => (typeof FGRID !== 'undefined' ? FGRID['pl_' + r.id]() : null), t: r.n, d: (est === 3 ? '¡PERFECTA! ' : est === 2 ? 'BIEN HECHA. ' : '') + 'SE GUARDÓ EN ALIMENTAR (x' + porc + ')' } },
    C('Se guarda en ALIMENTAR. Ojo: si algo se quema, pierdes los ingredientes. ¡Buen provecho, chef!')
  ],
  primerMueble: (cbProbar) => [
    C('Vi que compraste tu primer mueble. ¡Buena elección!'),
    C('Los muebles ya no se colocan solos: ve a tu inventario y toca COLOCAR.'),
    CT('Una vez colocado, se acomoda con este botón de la casita.', '#b-editar'),
    CT('Ahí arrastras cada mueble con el dedo hasta dejarlo donde quieras.', '#b-editar'),
    C('Tócalo para elegirlo: puedes girarlo, quitarlo o guardarlo otra vez.'),
    C('Cada habitación tiene sus propios muebles. Los de estudio solo van en el ESTUDIO.'),
    { q: 'CORTEX', t: 'Hoy mismo puedes acomodarlo. ¿Probamos?', op: ['¡Probar!', 'Más tarde'],
      res: [
        [{ q: 'TU', t: '¡Probar!', fn: cbProbar }],
        [{ q: 'TU', t: 'Más tarde' }]
      ]
    }
  ],
  estudioIntro: (cbTienda) => [
    C('Este es el ESTUDIO. Aquí Simon te acompaña mientras estudias.'),
    C('Toca el escritorio para empezar una sesión.'),
    { q: 'CORTEX', t: 'Y puedes personalizarlo con muebles de la tienda.', op: ['Ver la tienda', 'Más tarde'],
      res: [
        [{ q: 'TU', t: 'Ver la tienda', fn: cbTienda }],
        [{ q: 'TU', t: 'Más tarde' }]
      ]
    }
  ],
  primerResfriado: (cbTienda) => [
    C('Oí estornudar a Simon... ¿se resfrió?'),
    C('Pasa cuando se le descuida mucho: con hambre, sueño o tristeza al mismo tiempo.'),
    S(),
    T('Achú... tengo frío.'),
    CT('Hay varias formas de curarlo. La más rápida es el JARABE, que se compra en la tienda.', '#btn-tienda'),
    C('También puedes abrigarlo con una bufanda o una capa, y se le pasará en un ratito.'),
    C('O dejarlo dormir: al despertar ya estará mejor. Y si no haces nada, se cura solo en unas horas.'),
    C('Mientras esté resfriado no podrá jugar. ¡Cuídalo mucho!'),
    { q: 'CORTEX', t: '¿Quieres ir por el jarabe ahora?', op: ['Ver la tienda', 'Más tarde'],
      res: [
        [{ q: 'TU', t: 'Ver la tienda', fn: cbTienda }],
        [{ q: 'TU', t: 'Más tarde' }]
      ]
    }
  ],
  tutorialPantalla: () => [
    CT('Te explico rapidito qué es cada cosa.'),
    CT('Este círculo es el cariño: al llenarlo, subes de nivel.', '.med'),
    CT('Estas barras son su hambre, energía, felicidad y limpieza.', '.stats'),
    CT('Tus monedas, la campana de avisos y los ajustes. Ahí también están tus logros.', '.der2'),
    CT('Este botón abre tu Inventario.', '#b-inv'),
    CT('La cámara toma fotos y la casita mueve los muebles.', '#b-foto, #b-editar'),
    CT('Aquí están mis misiones.', '#t-mis'),
    CT('Abajo siguen las acciones de siempre: alimentar, dormir, jugar, la tienda y Simon dice. Los minijuegos están en la máquina arcade de la sala de juegos.', '.botones'),
    CT('¡Eso es todo! Puedes repetirlo en Ajustes.')
  ],
  cajaMisteriosa: (traeGafas, fnAbrir, fnPremio) => [
    { q: 'CORTEX', t: '¡Simon! Mira lo que encontré donde te encontré a ti.', pre: fnAbrir },
    S(),
    T('¿Una caja? ¿Para mí?'),
    C('Es tuya. Ábrela.'),
    { q: 'CORTEX', t: '*Simon sacude la caja, la abre...*', fn: fnPremio },
    { q: 'CORTEX', t: traeGafas ? '¡Gafas de sol y 25 monedas!' : '¡25 monedas!' },
    S(),
    T('¡Me encanta! No explotó... todavía.'),
    C('Jaja. Nos vemos pronto.')
  ]
};

// ==========================================================================
// 7. EL PERRITO SIF (Encuentro en el parque, darle keke, adopción)
// ==========================================================================
const DIALOGOS_SIF = {
  darKeke: (fnCome) => [
    { q: 'TRADUCTOR', t: '¿Dar keke para perros?', op: ['SÍ', 'NO'], res: [
      [
        { q: 'SIMON', t: 'Sí.', fn: fnCome },
        T('Toma, esto es para ti.'),
        { q: 'PERRO', t: '*mastica el keke y mueve la cola*', fn: () => { if (typeof sfx !== 'undefined') sfx.comer(); if (typeof corazones === 'function') corazones(5); } },
        { q: 'PERRO', t: '*te mira con ojos de distinto color*' },
        S(),
        T('¿Vienes a casa conmigo?')
      ],
      []
    ] }
  ],
  adopcion: (fnFanfare) => [
    S(),
    T('Oye... ¿quieres ser mi amigo?'),
    { q: 'PERRO', t: '¡GUAU!', fn: () => { if (typeof guau === 'function') guau(1); } },
    { q: 'SIMON', t: '¡Sí!', fn: () => { if (typeof bocaT !== 'undefined') bocaT = 15; if (typeof gesto === 'function') gesto('salto'); if (typeof hablar === 'function') hablar(); } },
    T('¡Entonces te llamaré Sif!'),
    { q: 'SIF', t: '¡GUAU, GUAU!', fn: () => { if (typeof guau === 'function') guau(2); if (typeof corazones === 'function') corazones(6); } },
    { q: 'SIF', t: '', fan: { mudo: true, g: () => (typeof sifGrid === 'function' ? sifGrid({ boca: 'b', cola: 1 }) : null), t: 'SIF', d: 'NUEVA MASCOTA. EFECTO: JUGAR TE QUITA 10% MENOS DE ENERGÍA.' }, fn: fnFanfare },
    S(),
    T('Ahora tengo un perro. ¡Qué felicidad!'),
    T('Con Sif cerca, jugar me cansa un 10% menos.')
  ],
  cortexReaccionaSif: () => [
    C('Oye, Simon... ¿y ese perrito?'),
    C('Se parece muchísimo a un mejor amigo que tuve.'),
    C('Fue quien me salvó de la tristeza cuando más lo necesitaba.'),
    S(),
    T('Qué bonito, Cortex.'),
    C('Cuídalo mucho. Los amigos así no se encuentran todos los días.')
  ]
};

// ==========================================================================
// 8. SIMON: TRADUCCIONES Y FRASES (Traductor según acción o contexto)
// ==========================================================================
// Frases traducidas que Simon piensa al realizar acciones
const TRAD = {
  comer:  ['¡Qué rico!', 'Más keke, por favor.', 'Gracias por la comida.'],
  jugar:  ['¡Otra vez, otra vez!', '¡Me divierto mucho!', 'Eres el mejor compañero.'],
  tocar:  ['Me haces cosquillas.', 'Aquí estoy, contigo.', 'Te quiero, {n}.'],
  dice:   ['Obvio que sí.', 'Qué idea tan rara... me encanta.', 'Siempre digo que sí a las locuras.'],
  dormir: ['Dormí rico.', 'Soñé con una nube de keke.'],
  otro:   ['Estoy aquí.', 'Me alegra verte.'],
  visita: ['Hola, Cortex.', 'Me alegra que vengas.']
};

// Comentarios traducidos de Simon al ponerse ropa
const ROPA_COM = {
  sud_roja: 'Me siento muy rojo. Muy veloz.',
  sud_verde: 'Soy verde como los pantanos de mi planeta.',
  sud_naranja: 'Naranja como una zanahoria. Me encanta.',
  sud_rosa: 'Rosa... ¡me veo elegante!',
  sud_celeste: 'Soy un pedacito de cielo.',
  sud_calabaza: '¡Soy una calabaza! ¡Buu!',
  sud_navidad: '¡Huelo a galletas y a nieve!',
  sud_dorada: 'Brillo más que el sol. Soy un rey.',
  sud_negra: 'Negro misterioso. Parezco un espía.',
  sud_morada: 'Morado, como mi planeta de noche.',
  sud_arcoiris: '¡Tengo todos los colores!',
  gafas: 'Con estas gafas veo el futuro. Es borroso.',
  gafas_corazon: 'Veo todo con amor. Todo se ve a keke.',
  mono: '¡Un moño rojo! Me siento muy elegante.',
  monodorado: '¡Moño dorado! Soy de la realeza.',
  corbata: 'Corbata. Hoy tengo una reunión importante.',
  bufanda: 'Calentito. Quiero quedarme así siempre.',
  bufanda_dorada: 'Bufanda de oro. Soy muy rico... en keke.',
  collar: '¿Es un collar? Me siento famoso.',
  audifonos: '¡Pon música! Quiero bailar.',
  orejas_gato: 'Miau. Digo... ¡sí! Soy un gatito.',
  capa_roja: '¡Soy un superhéroe! ¡Nadie me detiene!',
  capa_azul: 'Capa azul. Voy a salvar el keke del mundo.',
  monoculo: 'Qué distinguido. Ejem. Tráiganme té.',
  casco_espacial: 'Sí. (Me recuerda a casa. Un poquito.)',
  gorro_chef: '¡Sí! (¡Chef Simon, a sus órdenes!)',
  bigote: 'Bigote. Ahora soy un señor muy serio. Sí.',
  antifaz: 'Soy un héroe secreto. Nadie sabrá que soy yo.',
  parche: '¡Arrr! Soy un pirata. Busco el keke enterrado.',
  gafas_nerd: 'Con estas gafas soy muy listo. Sí.',
  antenas: 'Mis antenas captan señal de mi planeta. Dicen hola.',
  orejas_conejo: 'Salto, salto. ¡Soy un conejito!',
  halo: 'Soy un ángel... con muchas ganas de keke.',
  halo_dorado: 'Un halo de oro. Soy un santo del keke.',
  alitas_angel: '¿Puedo volar? Voy a intentarlo.',
  alitas_demonio: 'Soy un diablito. Uno muy bueno.',
  cuernitos: 'Cuernitos. Cuidado, que embisto.',
  sud_galaxia: 'Llevo el universo puesto. Es de mi barrio.',
  sud_realeza: 'Sudadera real. Todos deben decir sí.',
  sud_holo: 'Brillo en todos los colores. Soy una joya.',
  sud_keke: '¡Una sudadera de keke! Me voy a comer a mí mismo.',
  alas_dragon: '¡Soy un dragón! Rawr. Digo... sí.',
  alas_angel: 'Alas grandes. Quiero volar a la cocina.',
  capa_real: 'La capa de un rey. Inclínate. Pero poquito.',
  collar_diamante: 'Un diamante. Es más brillante que Cortex.',
  gafas_arcoiris: 'Veo el mundo en todos los colores. Sí.',
  bufanda_arcoiris: 'Una bufanda de arcoíris. Qué calentito de colores.',
  cuernos_dragon: 'Cuernos de dragón. Doy miedo. Un poquito.',
  sud_tiedye: 'Estoy muy relajado. Muy tie-dye.',
  medalla: '¡Soy un campeón! Del keke.',
  cadena: 'Cadena de oro. Sí. Soy un artista.'
};

// Frases cuando Simon mira por la ventana según el clima
function frasesVentana() {
  const c = typeof clima === 'function' ? clima() : 'sol';
  return {
    sol:      ['Sí. (qué bonito día)', 'Sí. (mira, nubes)', 'Sí. (afuera hay pasto)'],
    nublado:  ['Sí. (hoy no hay sol)', 'Sí. (nubes grandotas)'],
    lluvia:   ['Sí. (gotitas)', 'Sí. (llueve, llueve)', 'Sí. (me gusta la lluvia)'],
    tormenta: ['Sí. (¡truenos!)', 'Sí. (qué miedo... y qué bonito)'],
    nieve:    ['Sí. (¡nieve!)', 'Sí. (copitos)'],
    arcoiris: ['Sí. (¡un arcoíris!)', 'Sí. (todos los colores)']
  }[c] || ['Sí.'];
}

// Avisos de texto mostrados en pantalla cuando cambia el clima
const TXT_CLIMA = {
  nublado:  'Hoy el cielo está nublado.',
  lluvia:   'Hoy llueve afuera. ¡Qué acogedor!',
  tormenta: 'Hay tormenta afuera. Simon quiere mimos.',
  nieve:    '¡Está nevando afuera!',
  arcoiris: 'Salió un arcoíris. ¡Tómale una foto!'
};

// Frases de miedo cuando truena
const MIEDO = [
  '¡¡TRUENO!! ¡Quiero esconderme!',
  '¡Eso fue un monstruo gigante!',
  '¡Cortex! ¡Cortex! ¡Sálvame!',
  'Me da miedito... abrázame.',
  '¡El cielo está regañando!'
];

// Frases cuando Simon se cansa de recibir demasiados mimos
const HARTO = [
  'Ya... un ratito sin mimos, por favor.',
  'Estoy lleno de mimos. Ahora a descansar.',
  'Mmm... luego, ¿sí?',
  'Necesito mi espacio. Un momentito.'
];

// Nombres descriptivos de los dibujos que hace Simon
const NOMBRE_DIB = {
  sol:     'un sol',
  casa:    'una casita',
  flor:    'una flor',
  luna:    'la luna',
  corazon: 'un corazón'
};

// (SORPRESAS definido en items.js)

// ==========================================================================
// 9. SIMON DICE (Lista de preguntas ocurrentes)
// ==========================================================================
const DICE = [
  "¿Quieres ir a la luna?",
  "¿Le damos keke al gato?",
  "¿Hacemos una fiesta con 100 patos?",
  "¿Quieres vivir dentro de una nube?",
  "¿Le pedimos prestado el sol a alguien?",
  "¿Cantamos con la lavadora?",
  "¿Nos vamos a bailar con los dinosaurios?",
  "¿Te comes un calcetín con salsa?",
  "¿Adoptamos un volcán como mascota?",
  "¿Convertimos la habitación en una alberca?",
  "¿Le hacemos una torta a la luna?",
  "¿Quieres ser rey de los pingüinos?",
  "¿Salimos a pasear a un pez?"
];

// ==========================================================================
// 10. DIARIO DE SECRETOS (Las 24 preguntas y respuestas de Simon)
// ==========================================================================
// Formato: [Pregunta, Respuesta de Simon, Nivel de cariño requerido]
const SEC = [
  ['¿Cuál es tu comida favorita?', 'El keke. Siempre el keke. Con velita, si se puede.', 1],
  ['¿De dónde vienes?', 'De un planeta donde llueve confeti los jueves.', 1],
  ['¿Le tienes miedo a algo?', 'A los calcetines que se quedan solos.', 1],
  ['¿Qué haces cuando nadie te ve?', 'Le hablo a la planta. Me responde con silencio.', 1],
  ['¿Cuál es tu color favorito?', 'El rojo, como mi corona.', 1],
  ['¿Por qué solo dices sí?', 'Porque en mi planeta "sí" lo significa todo.', 1],
  ['¿Qué extrañas de tu planeta?', 'Las nubes de azúcar. Y a mi abuelo.', 1],
  ['¿Quién es Cortex para ti?', 'El que me encontró en la Tierra. Mi traductor y mi primer amigo.', 1],
  ['¿Qué sueñas por las noches?', 'Que vuelo sobre un keke gigante.', 2],
  ['¿Cuál es tu mayor talento?', 'Quedarme quieto. Soy campeón.', 2],
  ['¿Qué piensas de la luna?', 'Creo que me guiña el ojo.', 2],
  ['¿Qué harías con mil monedas?', 'Comprar una corona. Ah, no: ya tengo la mejor.', 2],
  ['¿Qué hay debajo de tu sudadera?', 'Más Simon.', 2],
  ['¿Qué pasó con tu pelo?', 'Nunca tuve. Nací brillante.', 2],
  ['¿Te gusta cómo te vistes?', 'Sí. Aunque a veces la capa me hace tropezar.', 3],
  ['¿Cuál es tu juego favorito?', 'Esconderme detrás de la planta.', 3],
  ['¿Tienes algún secreto?', 'Sí. Pero si te lo digo ya no es secreto. ...Bueno, te lo digo.', 3],
  ['¿Cómo llegaste a la Tierra?', 'No me acuerdo. Desperté aquí, y poco después me encontró Cortex.', 3],
  ['¿Cuál fue tu día más feliz?', 'Cuando abriste mi regalo y sonreíste.', 4],
  ['¿Por qué tienes corona?', 'Es el símbolo de mi gente. Todos la llevamos igual.', 4],
  ['¿Qué le dirías a Cortex?', 'Gracias por traducirme. Aunque me gusta que nadie sepa lo que pienso.', 4],
  ['¿Qué es lo que más te gusta de mí?', 'Que vuelves. Siempre vuelves.', 5],
  ['¿Cómo me ves?', 'Como alguien que me entiende, aunque solo diga sí.', 6],
  ['¿Algún día volverás a casa?', 'Quizá. Pero esta ya también es mi casa.', 7]
];

// ==========================================================================
// 11. MISIONES DIARIAS (Títulos y metas de Cortex)
// ==========================================================================
const MIS = [
  { k: 'comer',  t: 'Dale de comer a Simon',             n: 2, r: 8 },
  { k: 'jugar',  t: 'Juega con Simon',                   n: 2, r: 8 },
  { k: 'tocar',  t: 'Acaricia a Simon',                  n: 6, r: 8 },
  { k: 'ropa',   t: 'Cámbiale algo de ropa o habitación', n: 1, r: 9 },
  { k: 'foto',   t: 'Tómale una foto',                   n: 1, r: 9 },
  { k: 'preg',   t: 'Hazle una pregunta a Simon',        n: 1, r: 8 },
  { k: 'adiv',   t: 'Adivina en qué piensa Simon',       n: 2, r: 9 },
  { k: 'dormir', t: 'Déjalo dormir y despertar',          n: 1, r: 9 }
];

// ==========================================================================
// 12. EVENTOS SECRETOS (OVNI y nave espacial, Ojo de Cthulhu)
// ==========================================================================
const DIALOGOS_SECRETOS = {
  ovniSimonRecuerda: () => [
    S(),
    T('Yo llegué en algo así... hace mucho tiempo.'),
    T('Antes de conocer a Cortex.')
  ],
  cthulhuAcepta: () => [
    S(),
    T('Le encantó el keke... Entonces no puede ser malo.')
  ]
};

// ==========================================================================
// 13. RECUERDOS DE CORTEX AL SUBIR DE NIVEL (Niveles 2 al 25)
// ==========================================================================
const LV_MEM = {
  2:  'Nivel 2. ¿Recuerdas cuando te encontré? Estabas junto a la basura, porque nadie te quería. Yo sí te quise desde tu primer «sí».',
  3:  'Lo primero que te di fue un keke. Casi me muerdes la mano. Con cariño, claro.',
  4:  'Intenté enseñarte a decir «no». Tardaste un día entero y dijiste «sí».',
  5:  'Te di la corona porque eres mi mejor amigo. Verte usarla me llena de orgullo.',
  6:  'La primera noche dormiste en una caja de zapatos. Roncabas como un dragón.',
  7:  'Construir el traductor me costó semanas. Valió la pena: ahora sé que me quieres.',
  8:  'Te di un volcán de juguete y lo explotaste. Ahí supe que eras especial.',
  9:  'Recuerdo tu primera sonrisa. Fue en cuanto viste un keke sobre la mesa.',
  10: 'Una vez te perdiste en el parque y te encontré abrazando a un pato.',
  11: 'Los vecinos creían que eras un muñeco. Cuando dijiste «sí», se cayeron de espaldas.',
  12: 'Tu primer baile fue con la lavadora. Todavía me río.',
  13: 'Fuimos a ver las estrellas y señalaste una: «sí, esa es mi casa».',
  14: '¿Te acuerdas de cuando lloraste porque se acabó el keke? Desde entonces compro de sobra.',
  15: 'Cuando llegaste, jamás pensé que serías mi mejor amigo. ¡Qué equivocado estaba!',
  16: 'Esa vez que explotaste mi sombrero... aún lo tengo, chamuscado, de recuerdo.',
  17: 'Eres el único alienígena que conozco que ha hecho amistad con un cactus.',
  18: 'Cuando tengo un mal día, pienso en tu «sí» y se me pasa.',
  19: 'Me pregunto cómo será tu planeta. Si algún día regresas, llévame, ¿sí?',
  20: 'Veinte niveles. Recuerdo cuando eras tan pequeño que cabías en mi mochila.',
  21: 'Aún guardo el primer dibujo que hiciste de mí. Tenía seis ojos. Me encantó.',
  22: 'Cada vez que dices «sí», sé que todo va a salir bien.',
  23: 'Nunca te lo dije, pero el día que te encontré, tú me encontraste a mí.',
  24: 'Ya casi llegamos a lo más alto. Gracias por cuidarlo tan bien.',
  25: 'Nivel máximo. Simon vino de otro planeta y encontró un hogar. Gracias por eso.'
};

// Respuestas traducidas de Simon a los recuerdos de Cortex
const LV_RESP = [
  'Yo también me acuerdo.',
  'Fue un gran día.',
  '¿Había keke ese día?',
  'Gracias por encontrarme.'
];

// Objeto agrupador principal
const DIALOGOS = {
  comerciante:     DIALOGOS_COMERCIANTE,
  visitas:         DIALOGOS_VISITAS,
  siesta:          DIALOGOS_SIESTA,
  bombas:          DIALOGOS_BOMBAS,
  historia:        DIALOGOS_HISTORIA,
  tutoriales:      DIALOGOS_TUTORIALES,
  sif:             DIALOGOS_SIF,
  eventosSecretos: DIALOGOS_SECRETOS,
  saludosHora:     SALUDOS_HORA,
  charlasCortex:   CHARLAS,
  tipsCortex:      TIPS,
  ropaCortex:      ROPA_CORTEX,
  ropaSimon:       ROPA_COM,
  climaTextos:     TXT_CLIMA,
  miedoTrueno:     MIEDO,
  hartoMimos:      HARTO,
  simonDice:       DICE,
  diarioSecretos:  SEC,
  misiones:        MIS,
  recuerdosNivel:  LV_MEM,
  respuestasNivel: LV_RESP
};

if (typeof window !== 'undefined') window.DIALOGOS = DIALOGOS;

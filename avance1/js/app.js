// Acceso a datos compartido. Se carga antes del script de cada página.

const RUTA_DATOS = "../datos/";
const CLAVE_INICIATIVAS = "iniciativas";

async function cargarJSON(archivo) {
    const respuesta = await fetch(RUTA_DATOS + archivo);

    if (!respuesta.ok) {
        throw new Error(`No se pudo cargar ${archivo}`);
    }

    return respuesta.json();
}

function obtenerIniciativasGuardadas() {
    return JSON.parse(localStorage.getItem(CLAVE_INICIATIVAS)) || [];
}

async function obtenerIniciativas() {
    const iniciales = await cargarJSON("iniciativas.json");
    const guardadas = obtenerIniciativasGuardadas();
    const eliminadas = obtenerIdsEliminados();

    // Una copia guardada con el mismo id reemplaza a la del JSON
    const sinReemplazar = iniciales.filter(inicial =>
        !guardadas.some(guardada => guardada.id === inicial.id)
    );

    return sinReemplazar
        .concat(guardadas)
        .filter(iniciativa => !eliminadas.includes(iniciativa.id))
        .sort((a, b) => a.id - b.id);
}

async function obtenerIniciativaPorId(id) {
    const iniciativas = await obtenerIniciativas();
    return iniciativas.find(iniciativa => iniciativa.id === id);
}

async function obtenerSiguienteId() {
    const iniciativas = await obtenerIniciativas();

    // Se cuentan también las eliminadas para no reutilizar un id, aunque ya no estén en la lista principal.
    const ids = iniciativas.map(iniciativa => iniciativa.id).concat(obtenerIdsEliminados());
    return Math.max(0, ...ids) + 1;
}

function guardarIniciativa(iniciativa) {
    const guardadas = obtenerIniciativasGuardadas();
    guardadas.push(iniciativa);
    localStorage.setItem(CLAVE_INICIATIVAS, JSON.stringify(guardadas));
}

// TODO: las iniciativas guardan idPropietario y ademas una copia del nombre y la carrera.
// Normalizar para que solo guarden ids y resolver los datos con obtenerUsuario(id).
async function obtenerUsuarios() {
    return cargarJSON("usuarios.json");
}

async function obtenerUsuarioActual() {
    const [sesion, usuarios] = await Promise.all([
        cargarJSON("sesion.json"),
        obtenerUsuarios()
    ]);

    return usuarios.find(usuario => usuario.id === sesion.idUsuarioActual);
}

function fechaActual() {
    return new Date().toLocaleDateString("en-CA");
}

const CLAVE_SOLICITUDES = "solicitudes";

function obtenerSolicitudes() {
    return JSON.parse(localStorage.getItem(CLAVE_SOLICITUDES)) || [];
}

function guardarSolicitud(solicitud) {
    const solicitudes = obtenerSolicitudes();
    solicitudes.push(solicitud);
    localStorage.setItem(CLAVE_SOLICITUDES, JSON.stringify(solicitudes));
}

const CLAVE_ELIMINADAS = "iniciativasEliminadas";

function obtenerIdsEliminados() {
    return JSON.parse(localStorage.getItem(CLAVE_ELIMINADAS)) || [];
}

function actualizarIniciativa(iniciativa) {
    const guardadas = obtenerIniciativasGuardadas()
        .filter(guardada => guardada.id !== iniciativa.id);
    guardadas.push(iniciativa);
    localStorage.setItem(CLAVE_INICIATIVAS, JSON.stringify(guardadas));
}

function eliminarIniciativa(id) {
    const guardadas = obtenerIniciativasGuardadas()
        .filter(guardada => guardada.id !== id);
    localStorage.setItem(CLAVE_INICIATIVAS, JSON.stringify(guardadas));

    const eliminadas = obtenerIdsEliminados();
    eliminadas.push(id);
    localStorage.setItem(CLAVE_ELIMINADAS, JSON.stringify(eliminadas));
}

function archivarIniciativa(iniciativa) {
    actualizarIniciativa({
        ...iniciativa,
        estado: "Archivada",
        fechaModificacion: fechaActual()
    });
}

// TODO: REVISAR LOGICA. 
// Puntos 8 y 9: con miembros además del propietario o con solicitudes, se archiva en lugar de eliminar
function tieneInformacionRelacionada(iniciativa) {
    const otrosMiembros = (iniciativa.miembros || [])
        .some(miembro => miembro.idUsuario !== iniciativa.idPropietario);

    const conSolicitudes = obtenerSolicitudes()
        .some(solicitud => solicitud.idIniciativa === iniciativa.id);

    return otrosMiembros || conSolicitudes;
}

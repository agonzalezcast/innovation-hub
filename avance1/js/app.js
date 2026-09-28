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
    return iniciales.concat(obtenerIniciativasGuardadas());
}

async function obtenerIniciativaPorId(id) {
    const iniciativas = await obtenerIniciativas();
    return iniciativas.find(iniciativa => iniciativa.id === id);
}

async function obtenerSiguienteId() {
    const iniciativas = await obtenerIniciativas();
    return Math.max(0, ...iniciativas.map(iniciativa => iniciativa.id)) + 1;
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

const formulario = document.querySelector("#formulario-solicitud");
const estado = document.querySelector("#estado-solicitud");

let iniciativaActual;
let usuarioActual;

async function cargarSolicitud() {

    estado.innerHTML = `
        <div class="alert alert-secondary" role="status">
            Cargando iniciativa...
        </div>
    `;

    try {

        const parametros = new URLSearchParams(window.location.search);

        const id = Number(parametros.get("id"));

        const [iniciativa, usuario] = await Promise.all([
            obtenerIniciativaPorId(id),
            obtenerUsuarioActual()
        ]);

        if (!iniciativa) {
            mostrarAviso("warning", "La iniciativa solicitada no existe.");
            return;
        }

        iniciativaActual = iniciativa;
        usuarioActual = usuario;

        const esMiembro = (iniciativa.miembros || [])
            .some(miembro => miembro.idUsuario === usuario.id);

        // RN- 10: el propietario no puede solicitar participar en su propia iniciativa
        if (iniciativa.idPropietario === usuario.id) {
            mostrarAviso("info", "Usted es el propietario de esta iniciativa, por lo que no puede solicitar participación.");
            return;
        }

        if (esMiembro) {
            mostrarAviso("info", "Usted ya forma parte del equipo de esta iniciativa.");
            return;
        }

        if (iniciativa.estado === "Archivada") {
            mostrarAviso("warning", "Esta iniciativa está archivada y ya no recibe solicitudes.");
            return;
        }

        if (iniciativa.visibilidad === "Privada") {
            mostrarAviso("warning", "Esta iniciativa es privada y no admite solicitudes.");
            return;
        }

        // RN-11: una sola solicitud pendiente por usuario e iniciativa
        const pendiente = obtenerSolicitudes().some(solicitud =>
            solicitud.idIniciativa === iniciativa.id &&
            solicitud.idUsuario === usuario.id &&
            solicitud.estado === "Pendiente"
        );

        if (pendiente) {
            mostrarAviso("warning", "Ya tiene una solicitud pendiente para esta iniciativa. Espere la respuesta del propietario.");
            return;
        }

        mostrarFormulario(iniciativa, usuario);

    } catch (error) {
        console.error(error);
        mostrarAviso("danger", "Ocurrió un error al cargar la iniciativa.");
    }
}

function mostrarAviso(tipo, mensaje) {
    estado.innerHTML = `
        <div class="alert alert-${tipo}" role="alert">
            ${mensaje}
        </div>
        <a href="catalogo.html" class="btn btn-outline-primary">Volver al catálogo</a>
    `;
}

function mostrarFormulario(iniciativa, usuario) {
    document.querySelector("#titulo-iniciativa").textContent = iniciativa.titulo;
    document.querySelector("#enlace-cancelar").href = `detalle.html?id=${iniciativa.id}`;

    // Solo se ofrecen las competencias que la iniciativa requiere
    formulario.competencia.innerHTML = `
        <option value="">Seleccione una competencia</option>
        ${iniciativa.competencias
            .map(competencia => `<option value="${competencia}">${competencia}</option>`)
            .join("")}
    `;

    formulario.disponibilidad.value = usuario.disponibilidad || "";

    estado.innerHTML = "";
    formulario.classList.remove("d-none");
}

function validarTexto(valor, minimo, maximo, campo, obligatorio) {
    if (valor === "") {
        return obligatorio;
    }

    if (valor.length < minimo || valor.length > maximo) {
        return `${campo} debe tener entre ${minimo} y ${maximo} caracteres; ahora tiene ${valor.length}.`;
    }

    return "";
}

// Reglas por campo: cada una recibe el valor y devuelve el mensaje de error, o "" si es válido
const reglas = {
    mensaje: valor => validarTexto(valor, 30, 500, "El mensaje",
        "El mensaje de presentación es obligatorio."),

    competencia: valor => iniciativaActual.competencias.includes(valor)
        ? ""
        : "Seleccione una de las competencias requeridas.",

    rol: valor => validarTexto(valor, 3, 60, "El rol",
        "Indique el rol que desea."),

    disponibilidad: valor => validarTexto(valor, 3, 60, "La disponibilidad",
        "Indique su disponibilidad.")
};

function validarCampo(nombre) {
    const campo = formulario[nombre];
    const mensaje = reglas[nombre](campo.value.trim());
    const invalido = mensaje !== "";

    document.querySelector(`#error-${nombre}`).textContent = mensaje;
    campo.classList.toggle("is-invalid", invalido);
    campo.setAttribute("aria-invalid", invalido);

    return !invalido;
}

function validarFormulario() {
    const resultados = Object.keys(reglas).map(validarCampo);

    return resultados.every(resultado => resultado);
}

// Después del primer intento, cada campo marcado se vuelve a validar mientras el usuario lo corrige
formulario.addEventListener("input", evento => {
    const campo = evento.target;

    if (campo.classList.contains("is-invalid") && reglas[campo.name]) {
        validarCampo(campo.name);
    }
});

formulario.addEventListener("submit", evento => {
    evento.preventDefault();

    if (!validarFormulario()) {
        formulario.querySelector(".is-invalid").focus();
        return;
    }

    guardarSolicitud({
        id: obtenerSolicitudes().length + 1,
        idIniciativa: iniciativaActual.id,
        idUsuario: usuarioActual.id,
        mensaje: formulario.mensaje.value.trim(),
        competencia: formulario.competencia.value,
        rol: formulario.rol.value.trim(),
        disponibilidad: formulario.disponibilidad.value.trim(),
        estado: "Pendiente",
        fechaSolicitud: fechaActual()
    });

    formulario.classList.add("d-none");

    estado.innerHTML = `
        <div class="alert alert-success" role="status">
            Su solicitud fue enviada y quedó en estado <strong>Pendiente</strong>.
            El propietario de la iniciativa la revisará y decidirá si la acepta o la rechaza.
        </div>
        <a href="detalle.html?id=${iniciativaActual.id}" class="btn btn-outline-primary">Volver a la iniciativa</a>
    `;
});

cargarSolicitud();

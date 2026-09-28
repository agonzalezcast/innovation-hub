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

function validarCampo(campo, valido) {
    campo.classList.toggle("is-invalid", !valido);
    return valido;
}

function validarFormulario() {
    const mensaje = formulario.mensaje.value.trim();

    const resultados = [
        validarCampo(formulario.mensaje, mensaje.length >= 30 && mensaje.length <= 500),
        validarCampo(formulario.competencia, iniciativaActual.competencias.includes(formulario.competencia.value)),
        validarCampo(formulario.rol, formulario.rol.value.trim() !== ""),
        validarCampo(formulario.disponibilidad, formulario.disponibilidad.value.trim() !== "")
    ];

    return resultados.every(resultado => resultado);
}

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

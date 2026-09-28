async function cargarDetalle() {
    const contenedor = document.querySelector("#detalle-iniciativa");

    contenedor.innerHTML = `
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
            mostrarIniciativaNoEncontrada();
            return;
        }

        mostrarDetalle(iniciativa, usuario);

    } catch (error) {
        console.error(error);

        contenedor.innerHTML = `
            <div class="alert alert-danger" role="alert">
                Ocurrió un error al cargar la iniciativa.
            </div>
        `;
    }
}

function mostrarIniciativaNoEncontrada() {
    const contenedor = document.querySelector("#detalle-iniciativa");

    contenedor.innerHTML = `
        <h1>Iniciativa no encontrada</h1>

        <div class="alert alert-warning" role="alert">
            La iniciativa solicitada no existe.
        </div>
    `;
}

function esIntegrante(iniciativa, usuario) {
    return iniciativa.idPropietario === usuario.id ||
        (iniciativa.miembros || []).some(miembro => miembro.idUsuario === usuario.id);
}

// Punto 20 y visibilidad restringida: el propietario y los miembros ven todo
function mostrarDetalle(iniciativa, usuario) {
    const integrante = esIntegrante(iniciativa, usuario);

    if (iniciativa.visibilidad === "Restringida" && !integrante) {
        mostrarDetalleRestringido(iniciativa);
        return;
    }

    if (iniciativa.visibilidad === "Privada" && !integrante) {
        mostrarDetallePrivado();
        return;
    }

    mostrarDetalleCompleto(iniciativa, usuario);
}

function crearInsignias(iniciativa) {
    return `
        <div class="mb-3">
            <span class="badge badge-tipo--${iniciativa.tipo.toLowerCase()}">
                ${iniciativa.tipo}
            </span>

            <span class="badge text-bg-secondary">
                ${iniciativa.estado}
            </span>

            <span class="badge badge-visibilidad">
                ${iniciativa.visibilidad}
            </span>
        </div>
    `;
}

function crearAvisoVisibilidad(iniciativa) {
    if (iniciativa.visibilidad === "Institucional") {
        return `
            <div class="alert alert-info">
                Visible para usuarios autenticados de la institución.
            </div>
        `;
    }

    if (iniciativa.visibilidad === "Restringida" || iniciativa.visibilidad === "Privada") {
        return `
            <div class="alert alert-info">
                Esta iniciativa es ${iniciativa.visibilidad.toLowerCase()}.
                Usted ve el contenido completo porque forma parte del equipo.
            </div>
        `;
    }

    return "";
}

function crearMiembro(miembro) {
    const competencias = miembro.competencias.length > 0
        ? ` · ${miembro.competencias.join(", ")}`
        : "";

    return `
        <li class="list-group-item">
            <strong>${miembro.nombre}</strong> · ${miembro.rol}
            <br>
            <small class="text-body-secondary">${miembro.carrera}${competencias}</small>
        </li>
    `;
}

function mostrarDetalleCompleto(iniciativa, usuario) {
    const contenedor = document.querySelector("#detalle-iniciativa");

    const esPropietario = iniciativa.idPropietario === usuario.id;
    const miembros = iniciativa.miembros || [];
    const espacios = calcularEspaciosDisponibles(iniciativa);

    // RN-06 y RN-10: el propietario edita; los miembros ya están dentro; los demás solicitan participar
    let accion = `
        <a href="solicitud-participacion.html?id=${iniciativa.id}" class="btn btn-primary">
            Solicitar participación
        </a>
    `;

    if (esPropietario) {
        accion = iniciativa.estado === "Archivada"
            ? `<p class="alert alert-secondary">Esta iniciativa está archivada y ya no se puede modificar.</p>`
            : `<a href="publicar-iniciativa.html?editar=${iniciativa.id}" class="btn btn-primary">Editar iniciativa</a>`;
    } else if (esIntegrante(iniciativa, usuario)) {
        accion = `<p class="alert alert-secondary">Usted forma parte del equipo de esta iniciativa.</p>`;
    } else if (iniciativa.estado === "Archivada") {
        accion = `<p class="alert alert-secondary">Esta iniciativa está archivada y ya no recibe solicitudes.</p>`;
    }

    contenedor.innerHTML = `
        <article>
            ${crearInsignias(iniciativa)}

            <h1>${iniciativa.titulo}</h1>

            <p class="lead">
                ${iniciativa.resumen}
            </p>

            ${crearAvisoVisibilidad(iniciativa)}

            <hr>

            <section class="mb-4">
                <h2>Descripción</h2>
                <p>${iniciativa.descripcion}</p>
            </section>

            <section class="mb-4">
                <h2>Problema identificado</h2>
                <p>${iniciativa.problema}</p>
            </section>

            <section class="mb-4">
                <h2>Beneficiarios</h2>
                <p>${iniciativa.beneficiarios}</p>
            </section>

            <section class="mb-4">
                <h2>Información de la iniciativa</h2>

                <p>
                    <strong>Identificador:</strong>
                    ${iniciativa.id}
                </p>

                <p>
                    <strong>Categoría:</strong>
                    ${iniciativa.categoria}
                </p>

                <p>
                    <strong>Propietario:</strong>
                    ${iniciativa.propietario}
                </p>

                <p>
                    <strong>Integrantes actuales:</strong>
                    ${miembros.length} de ${iniciativa.participantes} estimados
                </p>

                <p>
                    <strong>Espacios disponibles:</strong>
                    ${espacios}
                </p>

                <p>
                    <strong>Visibilidad:</strong>
                    ${iniciativa.visibilidad}
                </p>

                <p>
                    <strong>Fecha de publicación:</strong>
                    ${iniciativa.fechaPublicacion}
                </p>

                <p>
                    <strong>Última modificación:</strong>
                    ${iniciativa.fechaModificacion}
                </p>
            </section>

            <section class="mb-4">
                <h2>Competencias requeridas</h2>

                <ul>
                    ${iniciativa.competencias
            .map(competencia => `<li>${competencia}</li>`)
            .join("")}
                </ul>
            </section>

            <section class="mb-4">
                <h2>Equipo</h2>

                <ul class="list-group">
                    ${miembros.map(crearMiembro).join("")}
                </ul>
            </section>

            <section class="mb-4">
                <h2>Etiquetas</h2>

                <p>
                    ${iniciativa.etiquetas
            .map(etiqueta =>
                `<span class="badge text-bg-light me-1">${etiqueta}</span>`
            )
            .join("")}
                </p>
            </section>

            ${accion}
        </article>
    `;
}

function mostrarDetalleRestringido(iniciativa) {
    const contenedor = document.querySelector("#detalle-iniciativa");

    contenedor.innerHTML = `
        <article>
            ${crearInsignias(iniciativa)}

            <h1>${iniciativa.titulo}</h1>

            <p class="lead">
                ${iniciativa.resumen}
            </p>

            <p>
                <strong>Categoría:</strong>
                ${iniciativa.categoria}
            </p>

            <section class="mb-4">
                <h2>Competencias requeridas</h2>

                <ul>
                    ${iniciativa.competencias
            .map(competencia => `<li>${competencia}</li>`)
            .join("")}
                </ul>
            </section>

            <div class="alert alert-warning" role="alert">
                Esta iniciativa tiene visibilidad restringida.
                El contenido completo solo está disponible para el propietario y los miembros del equipo.
            </div>

            ${iniciativa.estado === "Archivada" ? "" : `
                <a href="solicitud-participacion.html?id=${iniciativa.id}" class="btn btn-primary">
                    Solicitar participación
                </a>
            `}
        </article>
    `;
}

function mostrarDetallePrivado() {
    const contenedor = document.querySelector("#detalle-iniciativa");

    contenedor.innerHTML = `
        <h1>Iniciativa no disponible</h1>

        <div class="alert alert-warning" role="alert">
            Esta iniciativa es privada. Solo el propietario y los miembros del equipo pueden consultarla.
        </div>
    `;
}

cargarDetalle();


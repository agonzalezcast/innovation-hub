async function cargarPerfil() {
    const contenedor = document.querySelector("#perfil-usuario");

    contenedor.innerHTML = `
        <div class="alert alert-secondary" role="status">
            Cargando perfil...
        </div>
    `;

    try {
        const usuario = await obtenerUsuarioActual();

        if (!usuario) {
            contenedor.innerHTML = `
                <div class="alert alert-warning" role="alert">
                    No se encontró el usuario de la sesión.
                </div>
            `;
            return;
        }

        const iniciativas = await obtenerIniciativas();

        const proyectos = iniciativas.filter(iniciativa =>
            (iniciativa.miembros || []).some(miembro => miembro.idUsuario === usuario.id)
        );

        mostrarPerfil(usuario, proyectos);

    } catch (error) {
        console.error(error);

        contenedor.innerHTML = `
            <div class="alert alert-danger" role="alert">
                Ocurrió un error al cargar el perfil.
            </div>
        `;
    }
}

function mostrarPerfil(usuario, proyectos) {
    const contenedor = document.querySelector("#perfil-usuario");

    contenedor.innerHTML = `
        <div class="row g-4">
            <section class="col-12 col-lg-4" aria-labelledby="titulo-datos">
                <article class="card h-100">
                    <div class="card-body">
                        <h2 id="titulo-datos" class="h4">${usuario.nombreCompleto}</h2>

                        <p class="mb-2">
                            <span class="badge text-bg-primary">${usuario.tipoMiembro}</span>
                        </p>

                        <p><strong>Carrera:</strong> ${usuario.carrera}</p>
                        <p>${usuario.descripcion}</p>
                        <p><strong>Disponibilidad:</strong> ${usuario.disponibilidad}</p>

                        <p class="mb-0">
                            <strong>Portafolio:</strong>
                            <a href="${usuario.portafolio}" target="_blank" rel="noopener">
                                ${usuario.portafolio}
                            </a>
                        </p>
                    </div>
                </article>
            </section>

            <div class="col-12 col-lg-8">
                <section class="mb-4" aria-labelledby="titulo-competencias">
                    <h2 id="titulo-competencias" class="h4">Competencias</h2>

                    <ul class="list-group">
                        ${usuario.competencias.map(crearCompetencia).join("")}
                    </ul>
                </section>

                <section aria-labelledby="titulo-intereses">
                    <h2 id="titulo-intereses" class="h4">Intereses</h2>

                    <p>
                        ${usuario.intereses
                            .map(interes => `<span class="badge text-bg-light me-1">${interes}</span>`)
                            .join("")}
                    </p>
                </section>
            </div>
        </div>

        <section class="mt-4" aria-labelledby="titulo-proyectos">
            <h2 id="titulo-proyectos" class="h4">Proyectos en los que participa</h2>

            <div class="row g-4">
                ${crearListaProyectos(proyectos, usuario.id)}
            </div>
        </section>
    `;
}

function crearCompetencia(competencia) {
    return `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            ${competencia.nombre}
            <span class="badge text-bg-secondary">Nivel: ${competencia.nivel}</span>
        </li>
    `;
}

function crearListaProyectos(proyectos, idUsuario) {
    if (proyectos.length === 0) {
        return `
            <div class="col-12">
                <p class="alert alert-info">
                    Todavía no participa en ninguna iniciativa.
                </p>
            </div>
        `;
    }

    return proyectos
        .map(proyecto => crearTarjetaProyecto(proyecto, idUsuario))
        .join("");
}

function crearTarjetaProyecto(proyecto, idUsuario) {
    const miembro = proyecto.miembros.find(miembro => miembro.idUsuario === idUsuario);

    return `
        <div class="col-12 col-md-6">
            <article class="card h-100">
                <div class="card-body">
                    <span class="badge text-bg-primary mb-2">${proyecto.tipo}</span>
                    <h3 class="card-title h5">${proyecto.titulo}</h3>
                    <p class="card-text">${proyecto.resumen}</p>
                    <p class="mb-1"><strong>Rol:</strong> ${miembro.rol}</p>
                    <p class="mb-0"><strong>Estado:</strong> ${proyecto.estado}</p>
                </div>
                <div class="card-footer bg-transparent">
                    <a href="detalle.html?id=${proyecto.id}" class="btn btn-primary">
                        Ver detalle
                    </a>
                </div>
            </article>
        </div>
    `;
}

cargarPerfil();
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

        const respuesta = await fetch("../datos/iniciativas.json");

        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar las iniciativas");
        }

        const iniciativas = await respuesta.json();

        const iniciativa = iniciativas.find(
            iniciativa => iniciativa.id === id
        );

        if (!iniciativa) {
            mostrarIniciativaNoEncontrada();
            return;
        }

        mostrarDetalle(iniciativa);

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
        <div class="alert alert-warning" role="alert">
            La iniciativa solicitada no existe.
        </div>
    `;
}

function mostrarDetalle(iniciativa) {
    if (iniciativa.visibilidad === "Restringida") {
        mostrarDetalleRestringido(iniciativa);
        return;
    }

    if (iniciativa.visibilidad === "Privada") {
        mostrarDetallePrivado();
        return;
    }

    mostrarDetalleCompleto(iniciativa);
}

function mostrarDetalleCompleto(iniciativa) {
    const contenedor = document.querySelector("#detalle-iniciativa");

    contenedor.innerHTML = `
        <article>
            <div class="mb-3">
                <span class="badge text-bg-primary">
                    ${iniciativa.tipo}
                </span>

                <span class="badge text-bg-secondary">
                    ${iniciativa.estado}
                </span>
            </div>

            <h1>${iniciativa.titulo}</h1>

            <p class="lead">
                ${iniciativa.resumen}
            </p>

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
                    <strong>Categoría:</strong>
                    ${iniciativa.categoria}
                </p>

                <p>
                    <strong>Propietario:</strong>
                    ${iniciativa.propietario}
                </p>

                <p>
                    <strong>Participantes estimados:</strong>
                    ${iniciativa.participantes}
                </p>

                <p>
                    <strong>Visibilidad:</strong>
                    ${iniciativa.visibilidad}
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
                <h2>Etiquetas</h2>

                <p>
                    ${iniciativa.etiquetas
                    .map(etiqueta =>
                    `<span class="badge text-bg-light me-1">${etiqueta}</span>`
                    )
                    .join("")}
                </p>
            </section>

            <a
                href="solicitud.html?id=${iniciativa.id}"
                class="btn btn-primary">
                Solicitar participación
            </a>
        </article>
    `;
}

function mostrarDetalleRestringido(iniciativa) {
    const contenedor = document.querySelector("#detalle-iniciativa");

    contenedor.innerHTML = `
        <article>
            <span class="badge text-bg-primary mb-3">
                ${iniciativa.tipo}
            </span>

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
                El contenido completo no está disponible.
            </div>
        </article>
    `;
}

function mostrarDetallePrivado() {
    const contenedor = document.querySelector("#detalle-iniciativa");

    contenedor.innerHTML = `
        <div class="alert alert-warning" role="alert">
            Esta iniciativa es privada y su contenido no está disponible.
        </div>
        `;
}

cargarDetalle();
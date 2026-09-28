let iniciativas = [];
let usuarioActual;
let iniciativaPorConfirmar = null;
const modalConfirmacion = new bootstrap.Modal("#modal-confirmacion");

async function cargarIniciativas() {
    const contenedor = document.querySelector("#contenedor-iniciativas");

    contenedor.innerHTML = `
        <p class="alert alert-secondary">
            Cargando iniciativas...
        </p>
        `;

    try {
        let categorias;
        let competencias;

        [iniciativas, usuarioActual, categorias, competencias] = await Promise.all([
            obtenerIniciativas(),
            obtenerUsuarioActual(),
            obtenerCategorias(),
            obtenerCompetencias()
        ]);

        document.querySelector("#filtro-categoria")
            .insertAdjacentHTML("beforeend", crearOpciones(categorias));

        document.querySelector("#filtro-competencia")
            .insertAdjacentHTML("beforeend", crearOpciones(competencias));

        // Punto 20: las privadas no se muestran en el catálogo publico.
        iniciativas = iniciativas.filter(iniciativa => iniciativa.visibilidad !== "Privada");

        mostrarIniciativas(iniciativas);

    } catch (error) {
        console.error(error);

        contenedor.innerHTML = `
        <p class="alert alert-danger">
            Ocurrió un error al cargar las iniciativas.
        </p>
        `;
    }
}

function mostrarIniciativas(listaIniciativas) {
    const contenedor = document.querySelector("#contenedor-iniciativas");
    const tituloResultados = document.querySelector("#titulo-resultados");

    contenedor.innerHTML = "";

    if (listaIniciativas.length === 1) {
        tituloResultados.textContent = "1 iniciativa encontrada";
    } else {
        tituloResultados.textContent =
            `${listaIniciativas.length} iniciativas encontradas`;
    }

    if (listaIniciativas.length === 0) {
        tituloResultados.textContent = "";
        contenedor.innerHTML = `
            <p class="alert alert-info">
                No se encontraron iniciativas que coincidan con los criterios de búsqueda.
            </p>
        `;

        return;
    }

    listaIniciativas.forEach(iniciativa => {
        const tarjeta = crearTarjetaIniciativa(iniciativa);
        contenedor.appendChild(tarjeta);
    });
}

function crearTarjetaIniciativa(iniciativa) {
    const esPropietario = iniciativa.idPropietario === usuarioActual.id;
    const puedeGestionar = esPropietario && iniciativa.estado !== "Archivada";
    const accionBorrar = tieneInformacionRelacionada(iniciativa) ? "Archivar" : "Eliminar";
    const integrantes = (iniciativa.miembros || []).length;
    const espacios = calcularEspaciosDisponibles(iniciativa);

    const columna = document.createElement("div");
    columna.className = "col-12 col-md-6 col-lg-4";
    columna.innerHTML = `
        <article class="card h-100">
            <div class="card-body">
                <div class="mb-2">
                    <span class="badge badge-tipo--${iniciativa.tipo.toLowerCase()}">
                        ${iniciativa.tipo}
                    </span>
                    <span class="badge badge-visibilidad">
                        ${iniciativa.visibilidad}
                    </span>
                </div>
                <h3 class="card-title h5">
                    ${iniciativa.titulo}
                </h3>
                <p class="card-text">
                    ${iniciativa.resumen}
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
                    <strong>Competencias:</strong>
                    ${iniciativa.competencias.join(", ")}
                </p>
                <p>
                    <strong>Estado:</strong>
                    ${iniciativa.estado}
                </p>
                <p class="mb-0">
                    <strong>Integrantes:</strong>
                    ${integrantes} de ${iniciativa.participantes}
                    · ${espacios} ${espacios === 1 ? "espacio disponible" : "espacios disponibles"}
                </p>
            </div>
            <div class="card-footer bg-transparent d-flex flex-wrap gap-2">
                <a href="detalle.html?id=${iniciativa.id}" class="btn btn-primary">
                    Ver detalle
                </a>
                ${puedeGestionar ? `
                    <a href="publicar-iniciativa.html?editar=${iniciativa.id}" class="btn btn-outline-primary">Editar</a>
                    <button type="button" class="btn btn-outline-danger btn-borrar">${accionBorrar}</button>
                ` : ""}
            </div>
        </article>
        `;

    if (puedeGestionar) {
        columna.querySelector(".btn-borrar")
            .addEventListener("click", () => abrirConfirmacion(iniciativa));
    }

    return columna;
}

function aplicarFiltros() {
    const textoBusqueda = document.querySelector("#buscador")
        .value
        .toLowerCase()
        .trim();

    const tipoSeleccionado = document.querySelector("#filtro-tipo").value;

    const categoriaSeleccionada =
        document.querySelector("#filtro-categoria").value;

    const competenciaSeleccionada =
        document.querySelector("#filtro-competencia").value;

    const iniciativasFiltradas = iniciativas.filter(iniciativa => {

        const titulo = iniciativa.titulo.toLowerCase();
        const resumen = iniciativa.resumen.toLowerCase();
        const etiquetas = iniciativa.etiquetas.join(" ").toLowerCase();

        const coincideBusqueda =
            textoBusqueda === "" ||
            titulo.includes(textoBusqueda) ||
            resumen.includes(textoBusqueda) ||
            etiquetas.includes(textoBusqueda);

        const coincideTipo =
            tipoSeleccionado === "" ||
            iniciativa.tipo === tipoSeleccionado;

        const coincideCategoria =
            categoriaSeleccionada === "" ||
            iniciativa.categoria === categoriaSeleccionada;

        const coincideCompetencia =
            competenciaSeleccionada === "" ||
            iniciativa.competencias.includes(competenciaSeleccionada);

        return coincideBusqueda &&
            coincideTipo &&
            coincideCategoria &&
            coincideCompetencia;
    });

    mostrarIniciativas(iniciativasFiltradas);
}

const buscador = document.querySelector("#buscador");
const formFiltros = document.querySelector("#form-filtros");

buscador.addEventListener("input", aplicarFiltros);

formFiltros.addEventListener("submit", function (evento) {
    evento.preventDefault();

    aplicarFiltros();
});

const btnLimpiar = document.querySelector("#btn-limpiar");

btnLimpiar.addEventListener("click", function () {
    // El buscador está fuera del formulario, por eso se limpia aparte
    formFiltros.reset();
    buscador.value = "";

    aplicarFiltros();
});

function abrirConfirmacion(iniciativa) {
    iniciativaPorConfirmar = iniciativa;
    const archivar = tieneInformacionRelacionada(iniciativa);

    // RF-I-INI-04: la confirmación indica título, acción y mensaje
    document.querySelector("#titulo-modal").textContent =
        archivar ? "Archivar iniciativa" : "Eliminar iniciativa";

    document.querySelector("#mensaje-modal").textContent = archivar
        ? `"${iniciativa.titulo}" tiene miembros o solicitudes asociadas, por lo que no se puede eliminar. Se archivará: quedará en estado Archivada y ya no podrá modificarse.`
        : `¿Desea eliminar "${iniciativa.titulo}"? Esta acción no se puede deshacer.`;

    document.querySelector("#btn-confirmar").textContent = archivar ? "Archivar" : "Eliminar";

    modalConfirmacion.show();
}

document.querySelector("#btn-confirmar").addEventListener("click", async () => {
    const iniciativa = iniciativaPorConfirmar;
    const archivar = tieneInformacionRelacionada(iniciativa);

    if (archivar) {
        archivarIniciativa(iniciativa);
    } else {
        eliminarIniciativa(iniciativa.id);
    }

    modalConfirmacion.hide();

    // Se vuelve a pintar el catálogo sin recargar, respetando los filtros activos
    iniciativas = (await obtenerIniciativas())
        .filter(iniciativa => iniciativa.visibilidad !== "Privada");
    aplicarFiltros();

    document.querySelector("#mensaje-catalogo").innerHTML = `
        <div class="alert alert-success alert-dismissible fade show" role="status">
            La iniciativa "${iniciativa.titulo}" fue ${archivar ? "archivada" : "eliminada"}.
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
        </div>
    `;
});

cargarIniciativas();

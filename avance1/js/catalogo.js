let iniciativas = [];

async function cargarIniciativas() {
    const contenedor = document.querySelector("#contenedor-iniciativas");

    contenedor.innerHTML = `
        <p class="alert alert-secondary">
            Cargando iniciativas...
        </p>
        `;

    try {
        iniciativas = await obtenerIniciativas();

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

    if (listaIniciativas.length === 0) {
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
    const columna = document.createElement("div");
    columna.className = "col-12 col-md-6 col-lg-4";
    columna.innerHTML = `
        <article class="card h-100">
            <div class="card-body">
                <span class="badge text-bg-primary mb-2">
                    ${iniciativa.tipo}
                </span>
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
            </div>
            <div class="card-footer bg-transparent">
                <a href="detalle.html?id=${iniciativa.id}"
                   class="btn btn-primary">
                    Ver detalle
                </a>
            </div>
        </article>
        `;
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
    buscador.value = "";
    document.querySelector("#filtro-tipo").value = "";
    document.querySelector("#filtro-categoria").value = "";
    document.querySelector("#filtro-competencia").value = "";

    mostrarIniciativas(iniciativas);
});


cargarIniciativas();

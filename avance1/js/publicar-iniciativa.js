const listaCompetencias = document.querySelector("#lista-competencias");
const formIniciativa = document.querySelector("#form-iniciativa");
const btnAgregarCompetencia = document.querySelector("#btn-agregar-competencia");

btnAgregarCompetencia.addEventListener("click", () => agregarCompetencia());

const idEditar = Number(new URLSearchParams(window.location.search).get("editar"));
let iniciativaEditada = null;
let competenciasDisponibles = [];

function agregarCompetencia(valor = "") {
    const contenedor = document.createElement("div");

    contenedor.className = "input-group mb-2";

    contenedor.innerHTML = `
        <select class="form-select competencia">
            <option value="">Seleccione una competencia</option>
            ${crearOpciones(competenciasDisponibles)}
        </select>

        <button
            type="button"
            class="btn btn-outline-danger btn-eliminar-competencia">
            Eliminar
        </button>
    `;

    contenedor.querySelector(".competencia").value = valor;

    listaCompetencias.appendChild(contenedor);

    numerarCompetencias();
}

// Cada select dinámico necesita un nombre accesible propio
function numerarCompetencias() {
    listaCompetencias.querySelectorAll(".input-group").forEach((grupo, indice) => {
        grupo.querySelector(".competencia")
            .setAttribute("aria-label", `Competencia ${indice + 1}`);

        grupo.querySelector(".btn-eliminar-competencia")
            .setAttribute("aria-label", `Eliminar competencia ${indice + 1}`);
    });
}

// Un solo listener para todos los botones Eliminar, incluso los que se agregan después
listaCompetencias.addEventListener("click", function (evento) {
    const btnEliminar = evento.target.closest(".btn-eliminar-competencia");

    if (!btnEliminar) {
        return;
    }

    btnEliminar.closest(".input-group").remove();
    numerarCompetencias();
});

function mostrarError(id, mensaje) {
    document.querySelector(id).textContent = mensaje;
}

function validarFormulario() {
    let formularioValido = true;

    const titulo = document.querySelector("#titulo").value.trim();
    const tipo = document.querySelector("#tipo").value;
    const resumen = document.querySelector("#resumen").value.trim();
    const descripcion = document.querySelector("#descripcion").value.trim();
    const problema = document.querySelector("#problema").value.trim();
    const beneficiarios =
        document.querySelector("#beneficiarios").value.trim();

    const categoria = document.querySelector("#categoria").value;

    const participantes =
        Number(document.querySelector("#participantes").value);

    const visibilidad =
        document.querySelector("#visibilidad").value;

    const selectsCompetencias =
        document.querySelectorAll(".competencia");


    if (titulo === "") {
        mostrarError(
            "#error-titulo",
            "El título es obligatorio."
        );

        formularioValido = false;
    } else {
        mostrarError("#error-titulo", "");
    }


    if (tipo === "") {
        mostrarError(
            "#error-tipo",
            "Debe seleccionar un tipo de iniciativa."
        );

        formularioValido = false;
    } else {
        mostrarError("#error-tipo", "");
    }


    if (resumen === "") {
        mostrarError(
            "#error-resumen",
            "El resumen es obligatorio."
        );

        formularioValido = false;
    } else {
        mostrarError("#error-resumen", "");
    }


    if (descripcion === "") {
        mostrarError(
            "#error-descripcion",
            "La descripción es obligatoria."
        );

        formularioValido = false;
    } else {
        mostrarError("#error-descripcion", "");
    }


    if (problema === "") {
        mostrarError(
            "#error-problema",
            "Debe indicar el problema o necesidad."
        );

        formularioValido = false;
    } else {
        mostrarError("#error-problema", "");
    }


    if (beneficiarios === "") {
        mostrarError(
            "#error-beneficiarios",
            "Debe indicar los beneficiarios."
        );

        formularioValido = false;
    } else {
        mostrarError("#error-beneficiarios", "");
    }


    if (categoria === "") {
        mostrarError(
            "#error-categoria",
            "Debe seleccionar una categoría."
        );

        formularioValido = false;
    } else {
        mostrarError("#error-categoria", "");
    }


    if (participantes <= 0) {
        mostrarError(
            "#error-participantes",
            "La cantidad de participantes debe ser mayor que cero."
        );

        formularioValido = false;
    } else {
        mostrarError("#error-participantes", "");
    }


    if (visibilidad === "") {
        mostrarError(
            "#error-visibilidad",
            "Debe seleccionar una visibilidad."
        );

        formularioValido = false;
    } else {
        mostrarError("#error-visibilidad", "");
    }


    let tieneCompetencia = false;

    selectsCompetencias.forEach(select => {
        if (select.value !== "") {
            tieneCompetencia = true;
        }
    });

    if (!tieneCompetencia) {
        mostrarError(
            "#error-competencias",
            "Debe seleccionar al menos una competencia."
        );

        formularioValido = false;
    } else {
        mostrarError("#error-competencias", "");
    }


    return formularioValido;
}

function crearIniciativa(usuario, id) {
    const competencias = [];

    document.querySelectorAll(".competencia").forEach(select => {
        if (select.value !== "") {
            if (select.value !== "" && !competencias.includes(select.value)) {
                competencias.push(select.value);
            }
        }
    });

    const textoEtiquetas =
        document.querySelector("#etiquetas").value.trim();

    let etiquetas = [];

    if (textoEtiquetas !== "") {
        etiquetas = textoEtiquetas
            .split(",")
            .map(etiqueta => etiqueta.trim())
            .filter(etiqueta => etiqueta !== "");
    }

    const iniciativa = {
        id: id,
        titulo: document.querySelector("#titulo").value.trim(),
        tipo: document.querySelector("#tipo").value,
        resumen: document.querySelector("#resumen").value.trim(),
        descripcion: document.querySelector("#descripcion").value.trim(),
        problema: document.querySelector("#problema").value.trim(),
        beneficiarios: document.querySelector("#beneficiarios").value.trim(),
        categoria: document.querySelector("#categoria").value,
        competencias: competencias,
        participantes: Number(
            document.querySelector("#participantes").value
        ),
        visibilidad: document.querySelector("#visibilidad").value,
        propietario: usuario.nombreCompleto,
        idPropietario: usuario.id,
        estado: "Publicada",
        etiquetas: etiquetas,
        fechaCreacion: fechaActual(),
        fechaPublicacion: fechaActual(),
        fechaModificacion: fechaActual(),
        miembros: [
            {
                idUsuario: usuario.id,
                nombre: usuario.nombreCompleto,
                carrera: usuario.carrera,
                competencias: [],
                rol: "Propietario",
                fechaIncorporacion: fechaActual()
            }
        ]
    };

    return iniciativa;
}

async function cargarEdicion() {
    if (!idEditar) {
        agregarCompetencia();
        return;
    }

    try {
        const [iniciativa, usuario] = await Promise.all([
            obtenerIniciativaPorId(idEditar),
            obtenerUsuarioActual()
        ]);

        // RN-06: solo el propietario modifica, y una archivada ya no se modifica
        if (!iniciativa || iniciativa.idPropietario !== usuario.id || iniciativa.estado === "Archivada") {
            formIniciativa.classList.add("d-none");
            formIniciativa.insertAdjacentHTML("beforebegin", `
                <div class="alert alert-warning" role="alert">
                    No tiene permiso para modificar esta iniciativa.
                </div>
                <a href="catalogo.html" class="btn btn-outline-primary">Volver al catálogo</a>
            `);
            return;
        }

        iniciativaEditada = iniciativa;
        precargarFormulario(iniciativa);

    } catch (error) {
        console.error(error);
        alert("No se pudo cargar la iniciativa.");
    }
}

function precargarFormulario(iniciativa) {
    document.title = "Modificar iniciativa — Innovation Hub";
    document.querySelector("#titulo-pagina").textContent = "Modificar iniciativa";
    document.querySelector("#descripcion-pagina").textContent = "Actualice la información de su iniciativa.";
    document.querySelector("#btn-guardar").textContent = "Guardar cambios";

    const campos = ["titulo", "tipo", "resumen", "descripcion", "problema",
        "beneficiarios", "categoria", "participantes", "visibilidad"];

    campos.forEach(campo => {
        document.querySelector(`#${campo}`).value = iniciativa[campo] ?? "";
    });

    document.querySelector("#etiquetas").value = iniciativa.etiquetas.join(", ");

    iniciativa.competencias.forEach(competencia => agregarCompetencia(competencia));
}

formIniciativa.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const formularioValido = validarFormulario();

    if (!formularioValido) {
        return;
    }

    try {
        const usuario = await obtenerUsuarioActual();

        if (iniciativaEditada) {
            const cantidadMiembros = iniciativaEditada.miembros.length;

            // RF-I-INI-03: no puede quedar por debajo de los miembros ya aceptados
            if (Number(document.querySelector("#participantes").value) < cantidadMiembros) {
                mostrarError("#error-participantes",
                    `Debe ser al menos ${cantidadMiembros}, la cantidad de miembros actuales.`);
                return;
            }

            // Se conservan id, estado, fechas originales y miembros
            actualizarIniciativa({
                ...crearIniciativa(usuario, iniciativaEditada.id),
                estado: iniciativaEditada.estado,
                fechaCreacion: iniciativaEditada.fechaCreacion,
                fechaPublicacion: iniciativaEditada.fechaPublicacion,
                miembros: iniciativaEditada.miembros
            });

            window.location.href = `detalle.html?id=${iniciativaEditada.id}`;
            return;
        }
        const id = await obtenerSiguienteId();
        const iniciativa = crearIniciativa(usuario, id);

        guardarIniciativa(iniciativa);

        window.location.href = "catalogo.html";
    } catch (error) {
        console.error(error);
        alert("No se pudo publicar la iniciativa. Intente de nuevo.");
    }
});

// Las opciones se cargan antes de precargar una edición, para que los valores existan en los select
async function cargarFormulario() {
    const btnGuardar = document.querySelector("#btn-guardar");
    const estadoCarga = document.createElement("div");

    estadoCarga.className = "alert alert-secondary";
    estadoCarga.setAttribute("role", "status");
    estadoCarga.textContent = "Cargando opciones del formulario...";

    formIniciativa.before(estadoCarga);
    btnGuardar.disabled = true;

    try {
        const [categorias, competencias] = await Promise.all([
            obtenerCategorias(),
            obtenerCompetencias()
        ]);

        competenciasDisponibles = competencias;

        document.querySelector("#categoria")
            .insertAdjacentHTML("beforeend", crearOpciones(categorias));

        estadoCarga.remove();
        btnGuardar.disabled = false;

        await cargarEdicion();

    } catch (error) {
        console.error(error);

        formIniciativa.classList.add("d-none");
        estadoCarga.className = "alert alert-danger";
        estadoCarga.setAttribute("role", "alert");
        estadoCarga.textContent = "No se pudieron cargar las categorías y competencias. Intente de nuevo más tarde.";
    }
}

cargarFormulario();

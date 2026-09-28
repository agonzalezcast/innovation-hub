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
        <select class="form-select competencia" aria-describedby="ayuda-competencias error-competencias">
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

const TIPOS = ["Idea", "Necesidad", "Reto"];
const VISIBILIDADES = ["Pública", "Institucional", "Restringida", "Privada"];
const MAXIMO_PARTICIPANTES = 20;

let categoriasDisponibles = [];
let iniciativasExistentes = [];

function validarLongitud(valor, minimo, maximo, campo) {
    if (valor.length < minimo || valor.length > maximo) {
        return `${campo} debe tener entre ${minimo} y ${maximo} caracteres; ahora tiene ${valor.length}.`;
    }

    return "";
}

function validarSeleccion(valor, opciones, mensaje) {
    return opciones.includes(valor) ? "" : mensaje;
}

function separarEtiquetas(texto) {
    return texto
        .split(",")
        .map(etiqueta => etiqueta.trim())
        .filter(etiqueta => etiqueta !== "");
}

// Reglas por campo: cada una recibe el valor y devuelve el mensaje de error, o "" si es válido
const reglas = {
    titulo: valor => {
        if (valor === "") {
            return "El título es obligatorio.";
        }

        const repetido = iniciativasExistentes.some(iniciativa =>
            iniciativa.id !== idEditar &&
            iniciativa.titulo.toLowerCase() === valor.toLowerCase()
        );

        if (repetido) {
            return "Ya existe una iniciativa con este título. Use uno diferente.";
        }

        return validarLongitud(valor, 5, 80, "El título");
    },

    tipo: valor => validarSeleccion(valor, TIPOS, "Debe seleccionar un tipo de iniciativa."),

    resumen: valor => valor === ""
        ? "El resumen es obligatorio."
        : validarLongitud(valor, 20, 200, "El resumen"),

    descripcion: valor => valor === ""
        ? "La descripción es obligatoria."
        : validarLongitud(valor, 30, 1000, "La descripción"),

    // Problema y beneficiarios son opcionales según RF-I-INI-01; si se completan, se valida la longitud
    problema: valor => valor === ""
        ? ""
        : validarLongitud(valor, 10, 500, "El problema"),

    beneficiarios: valor => valor === ""
        ? ""
        : validarLongitud(valor, 10, 150, "El campo de beneficiarios"),

    categoria: valor => validarSeleccion(valor, categoriasDisponibles, "Debe seleccionar una categoría."),

    participantes: valor => {
        const cantidad = Number(valor);

        if (valor === "") {
            return "Indique la cantidad estimada de participantes.";
        }

        if (!Number.isInteger(cantidad)) {
            return "La cantidad de participantes debe ser un número entero.";
        }

        if (cantidad < 1 || cantidad > MAXIMO_PARTICIPANTES) {
            return `La cantidad de participantes debe estar entre 1 y ${MAXIMO_PARTICIPANTES}.`;
        }

        // RF-I-INI-03: no puede quedar por debajo de los miembros ya aceptados
        if (iniciativaEditada && cantidad < iniciativaEditada.miembros.length) {
            return `Debe ser al menos ${iniciativaEditada.miembros.length}, la cantidad de miembros actuales.`;
        }

        return "";
    },

    visibilidad: valor => validarSeleccion(valor, VISIBILIDADES, "Debe seleccionar una visibilidad."),

    etiquetas: valor => {
        const etiquetas = separarEtiquetas(valor);
        const invalida = etiquetas.find(etiqueta => etiqueta.length < 2 || etiqueta.length > 20);

        if (invalida) {
            return `Cada etiqueta debe tener entre 2 y 20 caracteres. Revise "${invalida}".`;
        }

        const distintas = new Set(etiquetas.map(etiqueta => etiqueta.toLowerCase()));

        if (distintas.size !== etiquetas.length) {
            return "Hay etiquetas repetidas.";
        }

        return "";
    }
};

function marcarCampo(control, mensaje) {
    const invalido = mensaje !== "";

    control.classList.toggle("is-invalid", invalido);
    control.setAttribute("aria-invalid", invalido);
}

function validarCampo(campo) {
    const control = document.querySelector(`#${campo}`);
    const mensaje = reglas[campo](control.value.trim());

    mostrarError(`#error-${campo}`, mensaje);
    marcarCampo(control, mensaje);

    return mensaje === "";
}

function validarCompetencias() {
    const selects = document.querySelectorAll(".competencia");
    const elegidas = [];
    let mensaje = "";

    selects.forEach(select => {
        const repetida = select.value !== "" && elegidas.includes(select.value);

        if (repetida) {
            mensaje = `La competencia "${select.value}" está repetida. Elimine una de las dos.`;
        }

        marcarCampo(select, repetida ? "repetida" : "");

        if (select.value !== "") {
            elegidas.push(select.value);
        }
    });

    if (elegidas.length === 0) {
        mensaje = "Debe seleccionar al menos una competencia.";
        selects.forEach(select => marcarCampo(select, mensaje));
    }

    mostrarError("#error-competencias", mensaje);

    return mensaje === "";
}

function validarFormulario() {
    const resultados = Object.keys(reglas).map(validarCampo);

    resultados.push(validarCompetencias());

    return resultados.every(resultado => resultado);
}

// Después del primer intento, cada campo marcado se vuelve a validar mientras el usuario lo corrige
formIniciativa.addEventListener("input", function (evento) {
    const control = evento.target;

    if (!control.classList.contains("is-invalid")) {
        return;
    }

    if (control.classList.contains("competencia")) {
        validarCompetencias();
    } else if (reglas[control.id]) {
        validarCampo(control.id);
    }
});

function crearIniciativa(usuario, id) {
    const competencias = [];

    document.querySelectorAll(".competencia").forEach(select => {
        if (select.value !== "") {
            if (select.value !== "" && !competencias.includes(select.value)) {
                competencias.push(select.value);
            }
        }
    });

    const etiquetas = separarEtiquetas(document.querySelector("#etiquetas").value);

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
        formIniciativa.querySelector(".is-invalid").focus();
        return;
    }

    try {
        const usuario = await obtenerUsuarioActual();

        if (iniciativaEditada) {
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
        const [categorias, competencias, iniciativas] = await Promise.all([
            obtenerCategorias(),
            obtenerCompetencias(),
            obtenerIniciativas()
        ]);

        categoriasDisponibles = categorias;
        competenciasDisponibles = competencias;
        iniciativasExistentes = iniciativas;

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

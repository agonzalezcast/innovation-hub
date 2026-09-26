let iniciativas = [];

async function cargarIniciativas(){
    try{
        const respuesta = await fetch("../datos/iniciativas.json");
        if (!respuesta.ok){
            throw new Error("No se pudieron cargar las iniciativas");
        }

        iniciativas = await respuesta.json();

        console.log("Iniciativas cargadas correctamente:");
        console.log(iniciativas);
    }catch(error){
        console.error("Error al cargar las iniciativas", error)
    }
}

cargarIniciativas()

// ../datos/iniciativas.json
import { Link } from 'react-router-dom'

function Inicio() {
    return (
        <main>
            <section className="hero" aria-labelledby="titulo-principal">
                <div className="container">
                    <img
                        src="/portada.svg"
                        className="img-fluid mb-3"
                        width="300"
                        height="300"
                        alt="Ilustración de una bombilla relacionada con ideas e innovación"
                    />

                    <h1 id="titulo-principal" className="display-5">
                        Innovation Hub
                    </h1>

                    <p className="lead col-lg-8">
                        Conectamos ideas, necesidades y retos de la comunidad
                        universitaria con personas dispuestas a colaborar
                        y formar equipos interdisciplinarios.
                    </p>

                    <div className="d-flex flex-wrap gap-2 mt-4">
                        <Link to="/catalogo" className="btn btn-warning btn-lg">
                            Explorar iniciativas
                        </Link>
                    </div>
                </div>
            </section>

            <section className="seccion" aria-labelledby="titulo-que-es">
                <div className="container">
                    <h2 id="titulo-que-es">¿Qué es Innovation Hub?</h2>

                    <p className="col-lg-8">
                        Esta es una plataforma donde estudiantes, docentes y personal administrativo
                        de la comunidad universitaria publicamos ideas, necesidades y retos, declaramos
                        las competencias que requieren y conformamos equipos interdisciplinarios.
                        Cualquier visitante puede consultar las iniciativas públicas sin iniciar sesión;
                        los usuarios registrados pueden además publicar, solicitar participación e integrar equipos.
                    </p>

                    <p className="col-lg-8">
                        Únete ahora a la comunidad y comienza a colaborar en iniciativas innovadoras.
                    </p>
                </div>
            </section>

            <section className="seccion bg-white" aria-labelledby="titulo-tipos">
                <div className="container">
                    <h2 id="titulo-tipos">Tipos de iniciativa</h2>

                    <div className="row g-4">
                        <div className="col-12 col-md-4">
                            <article className="card h-100">
                                <div className="card-body">
                                    <span className="badge badge-tipo--idea mb-2">
                                        Idea
                                    </span>
                                    <h3 className="h5">Una posible solución</h3>
                                    <p className="card-text">
                                        Propuesta de una solución, producto, servicio o proyecto.
                                        Por ejemplo, una plataforma para coordinar voluntarios
                                        universitarios.
                                    </p>
                                </div>
                            </article>
                        </div>

                        <div className="col-12 col-md-4">
                            <article className="card h-100">
                                <div className="card-body">
                                    <span className="badge badge-tipo--necesidad mb-2">
                                        Necesidad
                                    </span>
                                    <h3 className="h5">Un problema sin resolver</h3>
                                    <p className="card-text">
                                        Situación problemática para la cual todavía no existe
                                        una solución definida.
                                        Por ejemplo, una organización que coordina voluntarios
                                        con hojas de cálculo.
                                    </p>
                                </div>
                            </article>
                        </div>

                        <div className="col-12 col-md-4">
                            <article className="card h-100">
                                <div className="card-body">
                                    <span className="badge badge-tipo--reto mb-2">
                                        Reto
                                    </span>
                                    <h3 className="h5">Un desafío delimitado</h3>
                                    <p className="card-text">
                                        Problema concreto que requiere que uno o varios equipos
                                        propongan una solución.
                                        Por ejemplo, reducir el tiempo para asignar tutores
                                        a estudiantes.
                                    </p>
                                </div>
                            </article>
                        </div>
                    </div>
                </div>
            </section>

            <section className="seccion" aria-labelledby="titulo-como-funciona">
                <div className="container">
                    <h2 id="titulo-como-funciona">¿Cómo funciona?</h2>

                    <p className="col-lg-8">
                        Los usuarios registrados publican iniciativas y declaran las competencias que necesitan.
                        Otras personas exploran el catálogo, buscan y filtran por tipo, categoría o competencia,
                        y solicitan participar. El propietario acepta a los participantes, forma el equipo y,
                        cuando está listo, convierte la iniciativa en proyecto.
                    </p>

                    <div className="row g-4">
                        <div className="col-12 col-lg-6">
                            <h3 className="h4">Cómo publicar una iniciativa</h3>

                            <ol>
                                <li>Con su cuenta de usuario registrado, ingrese a <a href="paginas/publicar-iniciativa.html">Publicar iniciativa</a>.</li>
                                <li>Complete los datos obligatorios: título, tipo, resumen, descripción y categoría.</li>
                                <li>Describa el problema identificado, la población beneficiada, las competencias requeridas, la cantidad estimada de integrantes y las etiquetas.</li>
                                <li>Elija el nivel de visibilidad, también obligatorio: pública, institucional, restringida o privada.</li>
                                <li>Publique la iniciativa. Las privadas no aparecen en el catálogo; solo las consultan el propietario y los miembros del equipo.</li>
                            </ol>
                        </div>

                        <div className="col-12 col-lg-6">
                            <h3 className="h4">Cómo participar en una iniciativa</h3>

                            <ol>
                                <li>Explore el <Link to="/catalogo">catálogo</Link> y use la búsqueda o los filtros.</li>
                                <li>Abra el detalle de la iniciativa que le interese.</li>
                                <li>Revise las competencias requeridas y los espacios disponibles.</li>
                                <li>Con su cuenta de usuario registrado, envíe una solicitud con su mensaje de presentación, la competencia principal que aporta, el rol que desea y su disponibilidad.</li>
                                <li>La solicitud queda en estado Pendiente hasta que el propietario la acepte o la rechace; si la acepta, usted se incorpora al equipo.</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default Inicio
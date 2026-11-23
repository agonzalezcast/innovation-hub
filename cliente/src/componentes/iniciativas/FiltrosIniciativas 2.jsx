function FiltrosIniciativas({
    busqueda,
    setBusqueda,
    tipo,
    setTipo,
    categoria,
    setCategoria,
    competencia,
    setCompetencia,
    categorias,
    competencias,
    onLimpiar
}) {
    return (
        <>
            <section aria-labelledby="titulo-busqueda" className="mb-4">
                <h2 id="titulo-busqueda">Buscar iniciativas</h2>

                <label htmlFor="buscador" className="form-label">
                    Título, resumen o etiqueta
                </label>

                <input
                    type="search"
                    id="buscador"
                    className="form-control"
                    placeholder="Ej. tutorías"
                    value={busqueda}
                    onChange={(evento) => setBusqueda(evento.target.value)}
                />
            </section>

            <aside aria-labelledby="titulo-filtros">
                <h2 id="titulo-filtros">Filtrar iniciativas</h2>

                <div className="mb-3">
                    <label htmlFor="filtro-tipo" className="form-label">
                        Tipo
                    </label>

                    <select
                        id="filtro-tipo"
                        className="form-select"
                        value={tipo}
                        onChange={(evento) => setTipo(evento.target.value)}
                    >
                        <option value="">Todos</option>
                        <option value="Idea">Idea</option>
                        <option value="Necesidad">Necesidad</option>
                        <option value="Reto">Reto</option>
                    </select>
                </div>

                <div className="mb-3">
                    <label htmlFor="filtro-categoria" className="form-label">
                        Categoría
                    </label>

                    <select
                        id="filtro-categoria"
                        className="form-select"
                        value={categoria}
                        onChange={(evento) => setCategoria(evento.target.value)}
                    >
                        <option value="">Todas</option>

                        {categorias.map((opcion) => (
                            <option key={opcion} value={opcion}>
                                {opcion}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-3">
                    <label htmlFor="filtro-competencia" className="form-label">
                        Competencia requerida
                    </label>

                    <select
                        id="filtro-competencia"
                        className="form-select"
                        value={competencia}
                        onChange={(evento) => setCompetencia(evento.target.value)}
                    >
                        <option value="">Todas</option>

                        {competencias.map((opcion) => (
                            <option key={opcion.id} value={opcion.id}>
                                {opcion.name}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onLimpiar}
                >
                    Limpiar filtros
                </button>
            </aside>
        </>
    )
}

export default FiltrosIniciativas
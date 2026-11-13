# Datos de prueba

El script carga las competencias del Avance 1, tres usuarios y cuatro iniciativas en una base separada. Por defecto usa `innovation_hub_dummy`; si se define `DUMMY_DB_NAME`, su nombre debe terminar en `_dummy`.

Solo inserta documentos que aún no existen; una segunda ejecución conserva los datos anteriores. Los usuarios de ejemplo usan la contraseña `Prueba123!` y correos del dominio `example.com`. Estos datos son únicamente para desarrollo.

Desde `servidor/`:

```bash
python3 -m venv datos-prueba/.venv
datos-prueba/.venv/bin/pip install -r datos-prueba/requirements.txt
MONGODB_DNS_SERVERS=1.1.1.1 op run --env-file=dev.env -- datos-prueba/.venv/bin/python datos-prueba/cargar.py
```

`MONGODB_DNS_SERVERS` es opcional y solo se necesita si la resolución DNS local presenta problemas con MongoDB SRV. Para que el servidor consulte estos datos, configure `DB_NAME=innovation_hub_dummy` en su entorno de desarrollo. El script no modifica `DB_NAME` ni borra información.

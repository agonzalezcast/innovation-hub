"""Carga datos de ejemplo en una base separada del proyecto."""

import json
import os
from datetime import datetime, timezone
from pathlib import Path

import bcrypt
import dns.resolver
from pymongo import MongoClient


USUARIOS = [
    ('ana.prueba@example.com', 'Ana', 'Rodríguez', 'Ingeniería de Software'),
    ('luis.prueba@example.com', 'Luis', 'Pérez', 'Diseño Digital'),
    ('maria.prueba@example.com', 'María', 'Gómez', 'Administración'),
]

INICIATIVAS = [
    ('Tutorías para estudiantes', 'Idea', 'Educación', 'Pública', 'Programación'),
    ('Huerta para la comunidad', 'Necesidad', 'Sostenibilidad', 'Institucional', 'Sostenibilidad'),
    ('Mapa de recursos accesibles', 'Reto', 'Impacto social', 'Restringida', 'Desarrollo Web'),
    ('Prototipo de laboratorio', 'Idea', 'Tecnología', 'Privada', 'Electrónica'),
]


def main():
    uri = os.environ.get('MONGODB_URI') or os.environ.get('mongodbstring')
    nombre_db = os.environ.get('DUMMY_DB_NAME', 'innovation_hub_dummy')
    if not uri:
        raise ValueError('Falta configurar MONGODB_URI o mongodbstring')
    if not nombre_db.endswith('_dummy'):
        raise ValueError('La base de prueba debe terminar en _dummy')

    servidores = os.environ.get('MONGODB_DNS_SERVERS')
    if servidores:
        resolver = dns.resolver.Resolver()
        resolver.nameservers = [servidor.strip() for servidor in servidores.split(',') if servidor.strip()]
        dns.resolver.default_resolver = resolver

    archivo = Path(__file__).resolve().parents[2] / 'avance1' / 'datos' / 'competencias.json'
    nombres = json.loads(archivo.read_text(encoding='utf-8'))
    fecha = datetime.now(timezone.utc)

    with MongoClient(uri, serverSelectionTimeoutMS=10000) as cliente:
        db = cliente[nombre_db]
        habilidades = {}
        for nombre in nombres:
            db.skills.update_one({'name': nombre}, {'$setOnInsert': {'name': nombre}}, upsert=True)
            habilidades[nombre] = db.skills.find_one({'name': nombre})['_id']

        usuarios = []
        for email, nombre, apellido, carrera in USUARIOS:
            usuario = db.users.find_one({'email': email})
            if usuario is None:
                documento = {
                    'firstName': nombre, 'lastName': apellido, 'secondLastName': '',
                    'email': email,
                    'passwordHash': bcrypt.hashpw(b'Prueba123!', bcrypt.gensalt(rounds=12)).decode('utf-8'),
                    'memberType': 'Estudiante', 'career': carrera, 'description': 'Perfil de ejemplo',
                    'skills': [], 'interests': [], 'availability': '', 'portfolioUrl': None,
                    'active': True, 'createdAt': fecha, 'updatedAt': fecha,
                }
                db.users.update_one({'email': email}, {'$setOnInsert': documento}, upsert=True)
                usuario = db.users.find_one({'email': email})
            usuarios.append(usuario['_id'])

        for indice, (titulo, tipo, categoria, visibilidad, habilidad) in enumerate(INICIATIVAS):
            propietario = usuarios[indice % len(usuarios)]
            documento = {
                'title': titulo, 'titleKey': titulo.lower(), 'type': tipo,
                'summary': 'Iniciativa de ejemplo para explorar el catálogo.',
                'description': 'Descripción de ejemplo para probar la consulta de iniciativas y sus detalles.',
                'problem': None, 'beneficiaries': None, 'category': categoria,
                'skills': [habilidades[habilidad]], 'capacity': 5, 'visibility': visibilidad,
                'status': 'Publicada', 'ownerId': propietario,
                'members': [{'userId': propietario, 'role': 'Propietario', 'joinedAt': fecha}],
                'tags': ['ejemplo'], 'publishedAt': fecha, 'createdAt': fecha, 'updatedAt': fecha,
            }
            db.initiatives.update_one({'titleKey': titulo.lower()}, {'$setOnInsert': documento}, upsert=True)

    print(f'Datos de ejemplo disponibles en {nombre_db}: {len(nombres)} competencias, '
          f'{len(USUARIOS)} usuarios y {len(INICIATIVAS)} iniciativas.')


if __name__ == '__main__':
    try:
        main()
    except Exception:
        print('No se pudieron cargar los datos. Revisá la configuración y la conexión de la base de prueba.')
        raise SystemExit(1)

# Sistema web de gestión hotelera

Este proyecto corresponde al Trabajo de Fin de Grado **Sistema web de gestión hotelera**.  
La aplicación permite gestionar diferentes procesos internos de un entorno hotelero mediante una arquitectura web basada en frontend, backend y base de datos.

El sistema incluye autenticación por roles, dashboard de usuario, gestión de inventario, reservas mediante código de acceso, mensajería interna y gestión básica de turnos.

## Tecnologías utilizadas

### Frontend
- React
- React Router DOM
- CSS

### Backend
- Python
- Django
- Django REST Framework
- Django CORS Headers

### Base de datos
- SQLite en entorno de desarrollo

## Estructura del proyecto

```text
hotel-management-system/
│
├── backend/
│   ├── core/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── admin.py
│   │   ├── seed_users.py
│   │   └── migrations/
│   │
│   ├── hotel_backend/
│   │   ├── settings.py
│   │   └── urls.py
│   │
│   ├── manage.py
│   └── db.sqlite3
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── App.js
    │   └── pages/
    │       ├── Home.js
    │       ├── Login.js
    │       ├── Dashboard.js
    │       ├── Inventario.js
    │       ├── Reservas.js
    │       ├── ReservasRealizadas.js
    │       ├── Mensajes.js
    │       └── Turnos.js
    │
    └── package.json
```
Funcionalidades principales
Autenticación y roles

El sistema permite iniciar sesión con distintos tipos de usuario:

Administrador
Jefe
Empleado

Cada rol tiene permisos diferentes dentro de la aplicación.

Inventario

El módulo de inventario permite consultar productos registrados en el sistema.

Los permisos son:

Empleado: puede visualizar el inventario.
Jefe: puede crear, editar y eliminar productos.
Administrador: puede crear, editar y eliminar productos.
Reservas

El sistema permite realizar reservas mediante un código de acceso.

El flujo es el siguiente:

Un usuario interno genera un código de reserva desde el dashboard.
El código se facilita al cliente.
El cliente accede desde la página principal a la opción de realizar reserva.
El cliente introduce el código.
Si el código es válido, puede completar la reserva.
Los jefes y administradores pueden consultar las reservas realizadas y cambiar su estado.
Mensajería interna

El sistema incluye un módulo de mensajería entre usuarios internos.

Los usuarios pueden:

Enviar mensajes.
Consultar mensajes recibidos.
Consultar mensajes enviados.
Marcar mensajes como leídos.

El administrador puede consultar todos los mensajes del sistema.

Turnos

El módulo de turnos permite consultar la planificación básica del personal.

Los permisos son:

Empleado: puede ver los turnos.
Jefe: puede crear, editar y eliminar turnos.
Administrador: puede crear, editar y eliminar turnos.
Instalación y ejecución

Para ejecutar el proyecto es necesario iniciar por separado el backend y el frontend.

1. Ejecutar el backend

Entrar en la carpeta del backend:

cd backend

Crear un entorno virtual, si no existe:

python -m venv venv

Activar el entorno virtual.

En Windows:

venv\Scripts\activate

En Linux, macOS o GitHub Codespaces:

source venv/bin/activate

Instalar dependencias necesarias:

pip install django djangorestframework django-cors-headers

Aplicar migraciones:

python manage.py migrate

Crear usuarios de prueba, si la base de datos está vacía:

python manage.py shell -c "from core.seed_users import run; run()"

Arrancar el servidor de Django:

python manage.py runserver

Por defecto, el backend se ejecutará en:

http://127.0.0.1:8000/

En GitHub Codespaces, como hice yo, el backend suele exponerse mediante una URL pública asociada al puerto 8000.

2. Ejecutar el frontend

Abrir una nueva terminal y entrar en la carpeta del frontend:

cd frontend

Instalar dependencias:

npm install

Antes de arrancar el frontend, revisar el archivo:

frontend/package.json

En ese archivo aparece una línea llamada proxy.

Para ejecución local, debe tener este formato:

"proxy": "http://127.0.0.1:8000"

Para ejecución en GitHub Codespaces, debe cambiarse por la URL pública del puerto 8000.
Por ejemplo:

"proxy": "https://TU-CODESPACE-8000.app.github.dev/"

Es importante que esta URL corresponda al backend de Django, no al frontend, como se puede ver en mi caso donde el proxy corresponde al backend correspondiente.

Después de revisar el proxy, arrancar React:

npm start

Por defecto, el frontend se abrirá en:

http://localhost:3000/

En GitHub Codespaces, el frontend suele exponerse mediante una URL pública asociada al puerto 3000.

Usuarios de prueba

El proyecto incluye un script de creación de usuarios de prueba.

Rol	Nombre	Usuario	Contraseña
Administrador	Daniel	Dani	1234
Jefe	Jose	Pelopinto	1234
Jefe	Manuel	Angel	1234
Empleado	Francisco	Paco	1234
Empleado	Nicolas	Niko	1234

Rutas principales del frontend
/                       Página principal
/login                  Inicio de sesión
/dashboard              Panel principal
/inventario             Gestión de inventario
/reservas               Realización de reservas con código
/reservas-realizadas    Gestión interna de reservas
/mensajes               Mensajería interna
/turnos                 Gestión de turnos

Endpoints principales del backend
/api/login/
/api/inventario/
/api/inventario/<id>/
/api/reservas/generar-codigo/
/api/reservas/validar-codigo/
/api/reservas/crear/
/api/reservas/
/api/reservas/<id>/estado/
/api/usuarios/
/api/mensajes/
/api/mensajes/<id>/leido/
/api/turnos/
/api/turnos/<id>/

Notas sobre GitHub Codespaces

Si se ejecuta el proyecto en GitHub Codespaces, es necesario revisar la pestaña Ports y comprobar que:
El puerto 8000 corresponde al backend de Django.
El puerto 3000 corresponde al frontend de React.
El puerto 8000 está accesible públicamente si el frontend necesita comunicarse con él.
El valor proxy de frontend/package.json apunta a la URL pública del puerto 8000.

Si el login funciona pero alguna funcionalidad no conecta con el backend, revisar primero el valor de proxy y reiniciar el servidor de React.

Comandos útiles

Arrancar backend:

cd backend
python manage.py runserver

Arrancar frontend:

cd frontend
npm start

Aplicar migraciones:

cd backend
python manage.py migrate

Crear usuarios de prueba:

cd backend
python manage.py shell -c "from core.seed_users import run; run()"
Consideraciones

Este proyecto se ha desarrollado como prototipo académico para el Trabajo de Fin de Grado.
La aplicación está orientada a demostrar la viabilidad funcional de una plataforma web modular para la gestión hotelera.

Algunas decisiones técnicas, como el uso de SQLite o contraseñas simples en usuarios de prueba, responden al contexto de desarrollo y validación académica, no a un entorno de producción real.

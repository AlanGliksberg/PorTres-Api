# PadelCole-Api

### Descripción

Esta es la API backend de **PadelCole**, una aplicación que conecta a jugadores de pádel para crear y unirse a partidos. La aplicación permite registrar usuarios, iniciar sesión (con Google o correo y contraseña), crear partidos, aplicar a partidos y ver el historial de partidos.

### Funcionalidades:

- **Autenticación**:
  - Registro de usuarios (con Google o con correo y contraseña).
  - Login con Google y correo/contraseña.
  - Sesión persistente con JWT.
- **Partidos**:

  - Los usuarios pueden **crear partidos** con fecha, hora, lugar y categoría.
  - Los usuarios pueden **aplicar** para unirse a partidos disponibles.
  - Los creadores de los partidos pueden **aceptar o rechazar** aplicaciones de jugadores.

- **Notificaciones**:
  - Los creadores de partidos reciben notificaciones sobre nuevas aplicaciones a sus partidos.

### Requisitos previos

- **Node.js** >= 18
- **pnpm** instalado: `npm install -g pnpm`
- **PostgreSQL** configurado y corriendo en tu máquina.

### Instalación

1. Clona el repositorio:

   ```bash
   git clone https://github.com/tu-usuario/PadelCole-Api.git
   cd PadelCole-Api
   ```

2. Instala las dependencias:

   ```bash
   pnpm install
   ```

3. Configura las variables de entorno en el archivo `.env`:

   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/padelcole"
   JWT_SECRET="your_jwt_secret_here"
   GOOGLE_CLIENT_ID="your_google_client_id"
   ```

4. Genera el cliente de Prisma:

   ```bash
   pnpm prisma generate
   ```

5. Realiza las migraciones para crear la base de datos:

   ```bash
   pnpm prisma migrate dev --name init
   ```

6. Levanta el servidor en modo desarrollo:

   ```bash
   pnpm dev
   ```

7. El servidor estará corriendo en `http://localhost:3000`.

---

### Endpoints disponibles

- **POST /api/auth/register**: Registrar un usuario (correo/contraseña o Google).
- **POST /api/auth/login**: Login de un usuario con correo y contraseña.
- **POST /api/auth/google**: Login con Google.
- **POST /api/auth/refresh**: Refrescar el JWT de acceso usando el refresh token.
- **POST /api/matches**: Crear un nuevo partido.
- **GET /api/matches**: Obtener todos los partidos.
- **POST /api/matches/{id}/apply**: Aplicar para unirse a un partido.

---

### Estructura del proyecto

```
PadelCole-Api/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── prisma/
│   │   └── client.ts
│   ├── utils/
│   │   ├── hash.ts
│   │   └── jwt.ts
│   └── modules/
│       ├── auth/
│       │   ├── auth.controller.ts
│       │   ├── auth.router.ts
│       │   └── auth.service.ts
│       └── match/
│           ├── match.controller.ts
│           ├── match.router.ts
│           └── match.service.ts
├── prisma/
│   └── schema.prisma
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

---

### Mejoras y próximos pasos

- **Manejo de imágenes**: Implementar la carga y almacenamiento de fotos de perfil de los usuarios.
- **Notificaciones**: Crear el sistema de notificaciones para los usuarios.
- **Frontend**: Implementar la aplicación móvil usando **React Native**.

---

### Notas

- **Autenticación persistente**: El backend maneja la sesión usando **JWTs** para mantener al usuario autenticado de manera persistente, utilizando un sistema de **refresh tokens**.
- La API está configurada para permitir solicitudes desde **localhost** y la URL de **VSCode Ports**.

---

Este es el **README.md** básico para el proyecto. Puedes agregar más detalles conforme vayas avanzando o realizando cambios en la arquitectura del proyecto.

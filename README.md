# 🏓 PadelCole API

API REST para la gestión de partidos de pádel, jugadores y aplicaciones. Desarrollada con Node.js, TypeScript, Express y Prisma.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Endpoints](#-api-endpoints)
- [Base de Datos](#-base-de-datos)
- [Autenticación](#-autenticación)
- [Scripts Disponibles](#-scripts-disponibles)
- [Contribución](#-contribución)

## ✨ Características

- 🔐 **Autenticación JWT** con soporte para Google OAuth
- 👥 **Gestión de Jugadores** con perfiles completos
- 🏆 **Sistema de Categorías** y posiciones de juego
- 🎾 **Gestión de Partidos** con equipos y sets
- 📝 **Sistema de Aplicaciones** para unirse a partidos
- 🏳️ **Soporte para Géneros** (masculino, femenino, mixto)
- 📊 **Sistema de Puntos** y ranking
- 🗄️ **Base de Datos PostgreSQL** con Prisma ORM
- 📝 **Logging** de requests
- 🔒 **Middleware de Autenticación**
- 🚀 **TypeScript** para mejor desarrollo

## 🛠️ Tecnologías

- **Backend**: Node.js, Express.js
- **Lenguaje**: TypeScript
- **Base de Datos**: PostgreSQL
- **ORM**: Prisma
- **Autenticación**: JWT, Google OAuth
- **Encriptación**: bcrypt
- **CORS**: Habilitado para desarrollo
- **Gestión de Paquetes**: pnpm

## 🚀 Instalación

### Prerrequisitos

- Node.js (v16 o superior)
- PostgreSQL
- pnpm (recomendado) o npm

### Pasos de Instalación

1. **Clonar el repositorio**

   ```bash
   git clone <url-del-repositorio>
   cd PadelCole-Api
   ```

2. **Instalar dependencias**

   ```bash
   pnpm install
   ```

3. **Configurar variables de entorno**

   ```bash
   cp .env.example .env
   ```

4. **Configurar la base de datos**

   ```bash
   pnpm pgen    # Generar cliente Prisma
   pnpm pmig    # Ejecutar migraciones
   pnpm pseed   # Poblar datos iniciales
   ```

5. **Iniciar el servidor**
   ```bash
   pnpm dev     # Desarrollo
   # o
   pnpm build   # Compilar
   pnpm start   # Producción
   ```

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Base de Datos
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/padelcole"

# JWT
JWT_SECRET="tu-secreto-jwt-super-seguro"

# Google OAuth
GOOGLE_CLIENT_ID="tu-google-client-id"

# Servidor
PORT=3000
NODE_ENV=development
```

### Configuración de Base de Datos

1. Crear una base de datos PostgreSQL
2. Actualizar `DATABASE_URL` en el archivo `.env`
3. Ejecutar las migraciones: `pnpm pmig`

## 🎯 Uso

### Desarrollo

```bash
pnpm dev
```

El servidor se ejecutará en `http://localhost:3000`

### Producción

```bash
pnpm build
pnpm start
```

## 📁 Estructura del Proyecto

```
PadelCole-Api/
├── prisma/                 # Configuración de base de datos
│   ├── schema.prisma      # Esquema de la base de datos
│   ├── migrations/        # Migraciones de la base de datos
│   ├── seed.js           # Datos iniciales
│   └── clean.js          # Limpieza de datos
├── src/
│   ├── modules/          # Módulos de la aplicación
│   │   ├── auth/         # Autenticación
│   │   ├── player/       # Gestión de jugadores
│   │   ├── match/        # Gestión de partidos
│   │   └── application/  # Sistema de aplicaciones
│   ├── middlewares/      # Middlewares personalizados
│   ├── types/           # Tipos TypeScript
│   ├── utils/           # Utilidades
│   ├── config/          # Configuraciones
│   ├── constants/       # Constantes
│   ├── app.ts           # Configuración de Express
│   └── server.ts        # Punto de entrada
├── package.json
└── tsconfig.json
```

## 🔌 API Endpoints

### Autenticación (`/api/auth`)

| Método | Endpoint    | Descripción             |
| ------ | ----------- | ----------------------- |
| POST   | `/register` | Registrar nuevo usuario |
| POST   | `/login`    | Iniciar sesión          |
| POST   | `/google`   | Login con Google OAuth  |

### Jugadores (`/api/player`)

| Método | Endpoint    | Descripción                     |
| ------ | ----------- | ------------------------------- |
| POST   | `/`         | Crear nuevo jugador             |
| GET    | `/`         | Obtener todos los jugadores     |
| GET    | `/gender`   | Obtener géneros disponibles     |
| GET    | `/position` | Obtener posiciones de juego     |
| GET    | `/category` | Obtener categorías              |
| GET    | `/question` | Obtener preguntas de evaluación |

### Partidos (`/api/matches`)

| Método | Endpoint       | Descripción                    |
| ------ | -------------- | ------------------------------ |
| POST   | `/`            | Crear nuevo partido            |
| GET    | `/open`        | Obtener partidos abiertos      |
| GET    | `/me`          | Obtener mis partidos           |
| GET    | `/details/:id` | Obtener detalles de un partido |
| DELETE | `/:id`         | Eliminar partido               |
| POST   | `/player`      | Agregar jugador a partido      |

### Aplicaciones (`/api/application`)

| Método | Endpoint      | Descripción          |
| ------ | ------------- | -------------------- |
| POST   | `/`           | Aplicar a un partido |
| POST   | `/accept/:id` | Aceptar aplicación   |

## 🗄️ Base de Datos

### Modelos Principales

- **User**: Usuarios del sistema
- **Player**: Jugadores de pádel
- **Match**: Partidos organizados
- **Team**: Equipos en partidos
- **Application**: Aplicaciones a partidos
- **Category**: Categorías de juego
- **Gender**: Géneros (masculino, femenino, mixto)
- **PlayerPosition**: Posiciones de juego
- **MatchStatus**: Estados de partidos

### Relaciones Principales

- Un usuario puede tener un perfil de jugador
- Los partidos tienen un creador y múltiples jugadores
- Los partidos se organizan en equipos
- Los jugadores pueden aplicar a partidos
- Las categorías están asociadas a géneros

## 🔐 Autenticación

### JWT Token

La API utiliza JWT para autenticación. Incluye el token en el header:

```
Authorization: Bearer <tu-token-jwt>
```

### Google OAuth

Soporte para autenticación con Google. Configura `GOOGLE_CLIENT_ID` en las variables de entorno.

## 📜 Scripts Disponibles

| Comando       | Descripción                              |
| ------------- | ---------------------------------------- |
| `pnpm dev`    | Iniciar servidor en modo desarrollo      |
| `pnpm build`  | Compilar TypeScript a JavaScript         |
| `pnpm start`  | Iniciar servidor en producción           |
| `pnpm pgen`   | Generar cliente Prisma                   |
| `pnpm pmig`   | Ejecutar migraciones de base de datos    |
| `pnpm pstu`   | Abrir Prisma Studio                      |
| `pnpm pseed`  | Poblar base de datos con datos iniciales |
| `pnpm pclean` | Limpiar datos de la base de datos        |

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guías de Contribución

- Usa TypeScript para todo el código nuevo
- Sigue las convenciones de nomenclatura existentes
- Añade tests para nuevas funcionalidades
- Documenta nuevos endpoints
- Ejecuta `pnpm build` antes de commit

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**Desarrollado con ❤️ para la comunidad de pádel**

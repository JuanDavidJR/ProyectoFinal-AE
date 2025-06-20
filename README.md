# 🏥 PROYECTO FINAL ARQUITECTURA EMPRESARIAL - MEDIAGENDA

**Mediagenda** es una aplicación web desarrollada como proyecto final para la asignatura de Arquitectura Empresarial, cuyo propósito es gestionar eficientemente la asignación de citas médicas entre pacientes y doctores, permitiendo autenticación de usuarios, visualización de disponibilidad, creación y seguimiento de citas, y administración avanzada por parte del personal autorizado.

---

## 📁 Estructura del Proyecto

```bash
ProyectoFinal-AE/
├── deployment/           # Archivos para despliegue (Docker, Render, etc.)
├── docs/                 # Documentación técnica y manuales
├── src/                  # Código fuente (backend + frontend)
├── tests/                # Pruebas automatizadas y colección Postman
└── README.md             # Este archivo
```

---

## ⚙️ Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js con Express.js
- **Base de Datos**: PostgreSQL
- **Autenticación**: JWT (con blacklist)
- **Testing**: Postman + JSON Collection
- **Despliegue**: Render.com (en pruebas)

---

## 🔐 Funcionalidades Clave

- Registro y login seguro con validación por roles (`admin`, `doctor`, `user`)
- Gestión de citas:
  - Crear, listar, filtrar, eliminar (según permisos)
  - Visualización dinámica para cada tipo de usuario
- Gestión de especialidades y disponibilidad por doctor
- Panel administrativo con estadísticas y CRUD de doctores
- Middleware para control de acceso y validación
- Menús responsivos y navegación protegida

---

## 👨‍💻 Roles y Equipo de Trabajo

| Rol                  | Nombre                      |
|----------------------|-----------------------------|
| Scrum Master         | Juan David Jaimes Rojas     |
| Product Owner        | Sebastián David Cortés López|
| Developer            | Ronald Santiago Niño Tineo  |
| Developer            | Douglas Duván Bonilla Ospina|

---

## 📦 Instalación y Ejecución

```bash
# Clonar el repositorio
git clone https://github.com/JuanDavidJR/ProyectoFinal-AE.git
cd ProyectoFinal-AE

# Instalar dependencias
cd src
npm install

# Ejecutar el servidor
npm run dev

# Acceder a la app
http://localhost:3000
```

> ⚠️ Recuerda configurar el archivo `.env` con las variables necesarias: `PORT`, `JWT_SECRET`, `DATABASE_URL`, etc.

---

## 🧪 Testing

La carpeta `/tests` contiene una colección Postman con pruebas de:

- Registro e inicio de sesión
- Creación y consulta de citas
- Middleware de protección con JWT
- Pruebas de error (credenciales incorrectas, rutas protegidas, etc.)

Puedes importar `mediagenda_postman_collection.json` directamente en Postman para comenzar a probar los endpoints.

---

## 📚 Documentación

Toda la documentación técnica del sistema (manual de arquitectura, usuario y despliegue) se encuentra en la carpeta `/docs`:
- Manual de Arquitectura Empresarial
- Manual Técnico del Administrador
- Manual de Usuario (ES / EN)

---

## 🌐 Despliegue

La versión de prueba se encuentra configurada para ser desplegada en **Render.com**, con ajustes en `server.js` para servir estáticamente los archivos del frontend desde `src/frontend`.

---

## 📄 Licencia

Este proyecto ha sido desarrollado como ejercicio académico para la Universidad. Uso estrictamente educativo.

---

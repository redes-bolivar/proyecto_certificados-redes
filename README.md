# Generador Automatizado de Certificados

## 📄 Descripción del proyecto

Este proyecto consiste en un **generador automatizado de certificados y diplomas**, desarrollado como una **solución interna para el Instituto de Educación** de la **Cruz Roja Colombiana – Seccional Bolívar**, con el objetivo de optimizar y automatizar los procesos de emisión de certificaciones académicas.

El sistema utiliza **diseños base en formato SVG**, sobre los cuales se imprimen dinámicamente los datos correspondientes al estudiante y al programa académico, permitiendo generar certificados personalizados de manera eficiente, controlada y escalable.

El proyecto fue **asignado y desarrollado durante mis prácticas profesionales**, y su desarrollo técnico fue realizado de forma **individual**, desde el diseño hasta la implementación funcional.

---

## ⚙️ Características principales

El sistema cuenta con las siguientes funcionalidades:

- ✅ **Generación manual de certificados**.
- 📊 **Generación masiva de certificados** mediante carga de archivos:
  - Google Sheets
  - CSV
- 🔢 **Foliado automático** para cada certificado generado.
- 🎓 Soporte para distintos tipos de programas:
  - Carreras tecnicolaborales
  - Diplomados
  - Cursos cíclicos
  - Cursos empresariales
- ☁️ **Almacenamiento automático en Google Drive**:
  - Cada certificado generado, tanto manual como masivo, se guarda automáticamente.
- 🗂️ **Historial de certificados emitidos**:
  - Consulta, búsqueda y visualización individual.
- ❌ **Anulación de certificados** en caso de errores en la emisión.
- 📧 **Notificación por correo electrónico**:
  - Tras cada carga masiva, el sistema envía un correo a un email predefinido con un resumen del proceso.
- ⬇️ **Descarga automática de certificados**:
  - Descarga individual para generación manual.
  - Descarga de un archivo **ZIP** con todos los certificados en caso de carga masiva.

---

## 🛠️ Tecnologías utilizadas

El proyecto fue desarrollado utilizando:

- Vite
- TypeScript
- React
- Tailwind CSS
- shadcn/ui
- Generación de PDFs a partir de SVG
- N8N

---

## 🚀 Ejecución del proyecto en local

### Requisitos previos
- Node.js
- npm

### Pasos

```sh
# Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>

# Ingresar al directorio del proyecto
cd <NOMBRE_DEL_PROYECTO>

# Instalar dependencias
npm install

# Ejecutar el entorno de desarrollo
npm run dev

```

## Desarrollado por:

**Camilo Andrés Osorio Páez**  
Ingeniero Multimedia  

🔗 LinkedIn: [https://www.linkedin.com/in/caopdecode/](https://www.linkedin.com/in/caopdecode/)

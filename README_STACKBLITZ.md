# AgroShift v6.3.1 - compatibilidad con StackBlitz

Soluciona un bloqueo conocido de StackBlitz/WebContainers con el complemento nativo de Tailwind CSS 4 (`@tailwindcss/vite` y `@tailwindcss/oxide`).

- Se reemplazó Tailwind CSS 4 por Tailwind CSS 3 + PostCSS (implementación JavaScript).
- Se mantuvo React y Vite, y se trasladaron los colores personalizados al archivo `tailwind.config.cjs`.
- No se cambiaron las fórmulas ni las pantallas agrícolas.
- El archivo package-lock se eliminó porque correspondía a Tailwind 4; `npm install` generará uno actualizado.

## Pasos
1. Subir los archivos de esta carpeta (sin la carpeta contenedora) a una nueva rama `agroshift-v6-3-1` en GitHub.
2. Abrir https://stackblitz.com/github/luissanchezdavalos-wq/PROYECTO_HACKATON/tree/agroshift-v6-3-1
3. En la terminal: `npm install`, `npm run dev`, `npm test`, `npm run build`.

La carga real en StackBlitz debe verificarse.

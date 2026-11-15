# AgroShift v5.2 — actualización automática de NASA POWER

- Consultas NASA POWER desde 2015-01-01 hasta **UTC hoy menos 8 días** (margen conservador por la latencia de fuentes); la fecha de última observación válida **se extrae de la respuesta**, y puede ser anterior.
- No realiza pronósticos. El calendario continúa siendo una climatología histórica; cuando el año en curso es parcial se informa la fecha de cobertura.
- Caché local válida 1 día y clave que incluye el rango solicitado; botón *Refresh from NASA* fuerza la descarga.
- Las consultas climáticas y las ampliadas comparten el mismo rango dinámico. No requiere editar el código al cambiar de año.
- Si falla la API, muestra error y mantiene la opción de demostración diferenciada.
- NASA POWER ofrece datos de rejilla/modelados con rezagos, no mediciones en tiempo real de la parcela.

Pruebas: `npm test`; compilación: `npm run build`.

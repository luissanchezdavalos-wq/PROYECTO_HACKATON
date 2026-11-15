# AgroShift v5 — NASA POWER ampliado

Mantiene React/Vite, ocho indicadores originales y formularios opcionales.

## Nueva integración

Además de T2M, T2M_MAX y PRECTOTCORR, se consultan productos diarios opcionales `TSURF`, `SFMC`, `EVPTRNS`, `EVLAND` del mismo periodo histórico (2015–2024). Si la consulta extra falla, el panel climático principal sigue funcionando. Si falla la consulta conjunta, se intentan parámetros individuales, con advertencias visibles.

- `TSURF`: media histórica de temperatura superficial modelada (°C -> K). No es T2M.
- `SFMC`: media histórica de humedad volumétrica superficial modelada (m³/m³). No es una lectura en parcela ni humedad uniforme en profundidad.
- `EVPTRNS` + `EVLAND`: combinación aproximada de flujos de transpiración y evaporación en MJ/m²/día, convertidos a equivalente de agua (mm/día) con calor latente constante de 2.45 MJ/kg. **Estimación experimental**, no medición directa de ET real ni ET de referencia. Requiere valores no negativos y fechas coincidentes.

Nota: la disponibilidad de productos de POWER puede cambiar según ubicación, comunidad y periodo; la aplicación comprueba la respuesta y muestra datos no disponibles sin sustituir por cero. La app no integra SMAP ni MODIS todavía. Variables B, MOS, Zr, Gw, E, tc, FN, Topt no se inventan y requieren datos externos o manuales.

## Ejecución

`npm install && npm test && npm run build && npm run dev`

El cache se versionó para no reaprovechar resultados de v4 sin las variables añadidas. No se ha comprobado acceso a la API desde todos los navegadores ni todas las regiones; verificar en StackBlitz. Las ocho fórmulas no se han alterado. Los horizontes históricos medios no prueban aptitud actual de siembra.

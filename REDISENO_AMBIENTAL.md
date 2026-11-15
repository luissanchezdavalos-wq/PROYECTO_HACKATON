# AgroShift v3 — evaluación ambiental general

- Sin selección de cultivos ni generación de rotaciones.
- Se reutilizan NASA POWER y el motor original de ocho fórmulas (`src/lib/buckingham.js`). No se modificaron las ecuaciones.
- El calendario es climatológico **histórico**, sin presentar ventanas universales de siembra.
- La temperatura del aire de POWER no se presenta como temperatura superficial; esta última queda pendiente de fuente o entrada válida.
- Π7 depende de temperatura óptima de referencia; Π8 depende de biomasa, nitrógeno fijado, erosión y evapotranspiración, y conserva su nombre original «Resiliencia de la rotación» para no falsear el modelo.
- Las variables faltantes no se convierten en cero. Datos demo no alimentan P.
- El motor se mantiene con convenciones de tasas y periodos originales. Los resultados de distintas duraciones no deben compararse directamente.
- El formulario opcional permite introducir datos con sus unidades; **no** acredita verificación de fuentes y requiere validación adicional para uso agrícola real.
- Para la presentación: mostrar datos NASA y un calendario de contexto climático; indicadores solamente donde haya datos y periodos comparables.

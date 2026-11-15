# AgroShift v6.3 — corrección del planificador de rotaciones

- Los datos manuales de las tres estrategias se conservan al cambiar mes o año y al navegar por las pestañas.
- Al cambiar horizonte, se desmarca la verificación de viabilidad. El usuario debe revisar que los cuatro datos representen el nuevo periodo anual.
- Los bloques sin candidatos explican por qué faltan especies; muestran coincidencias parciales 1/3 o 2/3 **solo a título informativo**, sin presentarlas como cultivos adecuados.
- Si faltan datos climáticos se informa explícitamente.
- Se conservan las fórmulas, restricciones experimentales y las advertencias sobre perfiles no validados.
- No se inventan cultivos ni se simulan pronósticos.

Pruebas: `npm test`; compilación: `npm run build`.

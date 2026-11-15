# AgroShift v6.2 — Comparador experimental de rotaciones

Base: AgroShift v6.1. Se agrega pestaña **Rotaciones**.

## Qué está implementado
- Tres borradores de planificación (agua, suelo y equilibrio) para una ventana de 12 meses, usando una comprobación preliminar de temperatura histórica y evitando repetir inmediatamente familia cuando es posible.
- Se EXCLUYEN cítricos, vid y fresa de la construcción automática de rotaciones anuales. Los perfiles térmicos siguen siendo ILUSTRATIVOS, no validados; los bloques trimestrales NO representan fechas reales ni duración de cultivos.
- Panel de entradas independientes por estrategia para biomasa total (kg/m²/12 meses), FN (kg N/ha/año), erosión (kg/m²/año), ET promedio (mm/día).
- Conversión explícita al mismo horizonte de 12 meses (días exactos de calendario) y superficie de m². El cálculo conserva algebraicamente B × FN / (E × ET), PERO el resultado sigue teniendo unidades y no es un indicador adimensional.
- Comparación solo después de confirmar manualmente viabilidad agronómica y completar datos de las tres estrategias; sin datos no se inventan cifras ni se determina ganador.
- Los umbrales de la ficha original 1 / 5 NO se aplican a los totales normalizados. Requieren calibración. Las demás ocho fórmulas originales permanecen sin alterar (el Π8 histórico de indicadores avanzados es solo diagnóstico algebraico y no comparte escala con el nuevo comparador).

## Pendiente antes de una recomendación de siembra
1. Integrar perfiles agronómicos verificables (FAO Ecocrop o fuentes locales), duración real, restricciones de familias, suelo, agua y calendario.
2. Construir una evaluación agronómica automática que compruebe viabilidad sin depender de la casilla del usuario.
3. Obtener/estimar B, FN, E y ET para cada secuencia con fuentes documentadas, incertidumbre y sin asumir que NASA POWER entrega estos valores directamente.
4. Calibrar e interpretar científicamente la escala de Π8. No usar el índice para afirmar rendimientos o garantías ambientales.

## Validación
`npm test` (Node test runner). `npm run build` con Node y dependencias instaladas. El código fue sometido a pruebas unitarias, pero la compilación de Vite no pudo completarse en el entorno de entrega por instalación de dependencias no disponible.

## Rama sugerida
`agroshift-v6-2`

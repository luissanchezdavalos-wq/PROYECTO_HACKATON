# AgroShift v6 — Indicadores visuales y Crop Insights

## Funciones
- Conserva los datos NASA POWER y el periodo histórico móvil de v5.2.
- Barras de rango para los ocho indicadores, con valores, estados y explicaciones expandibles.
- Sin símbolos Pi visibles (se conservan internamente y en fórmulas matemáticas).
- Clasificador experimental según umbrales del equipo; Pi7 solo óptimo en igualdad numérica exacta a 1, sin redondeo.
- Validación numérica: no negativos, decimales con punto, no letras ni notación científica.
- Crop Insights: 3 categorías, 9 especies de ejemplo y coincidencia por temperatura media histórica mensual. No se afirma que las categorías sean universalmente aptas ni se asignan puntuaciones de idoneidad inventadas.
- Calendario mensual de coincidencias térmicas orientativas.

## Límites científicos y de producto
Los rangos de los indicadores son experimentales, no científicamente validados. El cálculo de compatibilidad de Crop Insights **NO** es aún una recomendación de plantación: los intervalos de temperatura por especie son **ilustrativos** y deben reemplazarse con fichas agronómicas verificadas (FAO Ecocrop/GAEZ u otras). Falta evaluar riego, suelo, salinidad, heladas, fenología y ventanas locales de siembra. No debe llamarse “porcentaje de aptitud”: el donut muestra número de especies que coinciden térmicamente. Los indicadores matemáticos no están ponderados ni se utilizan para asignar porcentajes de compatibilidad. El mapa es una ilustración, no una imagen de la parcela.

## Probar
```
npm install
npm test
npm run build
npm run dev
```

# AgroShift v4 — Indicadores normales + avanzados

Aplicación web React/Vite. Sin selección ni generación de cultivos.

## Secciones
Terreno → NASA POWER → Indicadores normales → Indicadores avanzados → Calendario ambiental.

## Fuentes reales
La integración existente usa NASA POWER (T2M, T2M_MAX, PRECTOTCORR), 2015–2024. La precipitación climática anual se incorpora a P si se obtuvieron datos reales; la temperatura del aire NO se inserta en T superficial. Los conjuntos demo nunca rellenan el motor. No existen conexiones SMAP/MODIS integradas en esta versión.

## Precauciones
El formulario permite ingresar variables ausentes, sin imponer un cultivo. Valores sin periodos compatibles no deben interpretarse como diagnósticos. Las ocho ecuaciones originales permanecen en src/lib/buckingham.js. El cálculo pi8 conserva sus limitaciones dimensionales; sin una rotación definida no determina resiliencia de cultivos. El calendario no predice el clima futuro.

## Ejecución
`npm install` → `npm run dev` → `npm test` → `npm run build`.

## Código
`src/lib/advancedIndicators.js` administra la procedencia y las entradas. `src/screens/AdvancedIndicatorsScreen.jsx` contiene el formulario; `src/screens/EnvironmentalIndicatorsScreen.jsx` los datos automáticos.

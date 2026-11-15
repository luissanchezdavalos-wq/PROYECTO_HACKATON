# AgroShift v6.1 — Diagnóstico del Índice hídrico del suelo

La fórmula del equipo no se ha alterado: Índice = θ × Zr / P (con Zr convertido a milímetros).

El indicador no es automáticamente calculable: requiere humedad volumétrica (θ), profundidad efectiva de raíces (Zr) y precipitación acumulada (P). NASA POWER proporciona precipitación y puede suministrar humedad superficial modelada; no conoce Zr de la parcela. No se rellenan datos faltantes. Si P=0, el índice es indefinido.

Esta modificación **no fuerza ni inventa resultados**: añade mensajes con variables faltantes en las pantallas de Indicadores normales y avanzados, y muestra los motivos de no cálculo dentro de las tarjetas.

Para probar: abrir Indicadores normales, revisar la advertencia, completar Zr (y θ si falta) en Indicadores avanzados, confirmar compatibilidad de periodos y revisar el cálculo. Si P=0, debe seguir mostrando indefinido.

# AgroShift — Etapa 2: motor matemático experimental

Este módulo **no está conectado a la interfaz**. El comportamiento anterior se conserva.

- `src/lib/variableRegistry.js`: variables, unidades canónicas, procedencia y conversiones explícitas.
- `src/lib/buckingham.js`: fórmulas originales Pi1–Pi8, manejo de valores faltantes y cálculo para un horizonte común.
- `tests/buckingham.test.js`: pruebas `node:test`.

## Uso

```bash
npm test
npm run build
```

## Restricciones y advertencias

1. Los indicadores usan las ecuaciones **originales del equipo**. Su dimensión física no siempre es nula. En particular Pi8 no es adimensional. No afirmar validación física de los ocho grupos Buckingham.
2. `calculateIndicators()` recibe variables en las unidades declaradas en `variableRegistry.js`, y usa los valores originales de tasas para Pi8. No sirve para comparar su resultado Pi8 contra el Pi8 de `calculateRotationPi8()`.
3. `calculateRotationPi8()` recibe totales agregados por unidad de superficie durante **los mismos 12 meses**, `B` (kg/m²), `FN` (kgN/m²), `E` (kg/m²) y `ET` (mm), y mantiene la expresión original B×FN/(E×ET). La elección de agregados es una convención experimental; requiere justificar cómo se acumulan biomasa, fijación, erosión y ET sin doble conteo. No introducir valores sintéticos en evaluaciones reales.
4. Si faltan variables, unidades, fuentes o se anula un denominador, devuelve estados explícitos (`missing`, `invalid`, `undefined`).
5. Las variables de NASA, en especial temperatura del aire frente a temperatura superficial y estimaciones de biomasa, no deben confundirse.
6. `compareRotationPi8()` únicamente clasifica estrategias con `viable:true` y mismos horizontes. La evaluación de viabilidad y la obtención de totales no están implementadas en esta etapa.
7. El índice se calcula solamente cuando todos los insumos son conocidos. No hay estimación automática de MOS, FN, E o reservas de acuíferos.
8. `DAYS_PER_YEAR=365.2425` se utiliza para convertir tasas anuales a periodos diarios de manera explícita. El calendario real y el cambio de años requieren un ajuste posterior de duración.
9. La interpretación `T/Topt` usa Kelvin, aun cuando puede no representar de manera robusta el estrés térmico. Es la definición del equipo.

## Próxima etapa

Implementar orígenes verificables de datos, agregación temporal consistente, restricciones agronómicas y tres rotaciones; después conectar los módulos con las pantallas existentes.

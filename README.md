# Escalas interactivas — Rehabilitación

Calculadoras web de apoyo del libro *Pruebas clínicas, escalas e instrumentos de
medida en rehabilitación*. Cada escala es una página autónoma que muestra la
descripción de cada nivel de puntaje y calcula el total en tiempo real.

**Sitio:** https://fortizc-max.github.io/escalas-aplicaciones/

## Escalas
- **SARA** — evaluación y calificación de la ataxia (8 ítems, 0–40)
- **Índice de Barthel** — AVD básicas (10 ítems, 0–100)
- **Escala de Berg** — equilibrio (14 ítems, 0–56)
- **MG-ADL** — AVD en miastenia gravis (8 ítems, 0–24)
- **EAT-10** — cribado de disfagia (10 ítems, 0–40)
- **Riesgo de pérdida de la marcha en DMD** — puntaje pronóstico de McDonald 2026 (2 pruebas cronometradas, 5 grupos de riesgo)

## Estructura
- `assets/style.css`, `assets/engine.js` — estilo y motor compartidos.
- Cada `*.html` define los datos de una escala (`window.SCALE`) y carga el motor.

Para añadir una escala nueva, copie una página existente y edite el objeto
`window.SCALE` (ítems y opciones con su valor de puntaje).

La calculadora de riesgo de pérdida de la marcha en DMD no es una escala sumativa
y no usa `engine.js`: es una página autónoma que implementa el árbol de decisión de
McDonald 2026 y dibuja las curvas de riesgo. Solo comparte `assets/style.css`.

## Aviso
Herramientas de apoyo clínico y docente; no sustituyen el juicio clínico. Las
escalas incluidas son de uso libre; las traducciones al español son de trabajo.

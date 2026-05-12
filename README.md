# Albion Express — Juego TSP

Juego web estático inspirado en Albion Express y el problema del Agente Viajero.

## Ejecutar

Opción recomendada (servidor local):

```bash
npm run dev
```

Luego abre `http://127.0.0.1:5173/`.

## Estructura

- `index.html`: pantalla de inicio
- `pages/game.html`: juego (mapa y ruta)
- `pages/results.html`: resultados y comparación
- `assets/styles/main.css`: estilos
- `assets/img/`: recursos
- `src/data/`: escenarios (nodos)
- `src/engine/`: lógica TSP (métricas y ruta óptima)
- `src/pages/`: lógica por pantalla
- `src/ui/`: componentes de UI para mapa y paneles
- `src/utils/`: utilidades (storage/format)


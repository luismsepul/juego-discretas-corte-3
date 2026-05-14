# Albion Express — Juego TSP

Juego web estático inspirado en Albion Express y el problema del Agente Viajero.

## Tecnologías
- Frontend: HTML + CSS + JavaScript (ES Modules)
- Mapa real: Leaflet (CDN) + tiles de OpenStreetMap
- Rutas por carretera: OSRM (API pública) para dibujar los tramos siguiendo vías
- Servidor: Node.js (server.mjs) para desarrollo local y para el despliegue en Vercel (Serverless)

## Ejecutar

Opción recomendada (servidor local):

```bash
npm run dev
```

Luego abre `http://localhost:3000/` (o el puerto que asigne `PORT`).

## Desplegar en Vercel
1. Sube el repositorio a GitHub.
2. En Vercel: Import Project → elige tu repo.
3. Framework Preset: Other.
4. Build Command: `npm run build` (en este proyecto no compila nada, solo valida).
5. Output Directory: deja vacío.

La configuración de Vercel está en `vercel.json` y usa `server.mjs` como entrada.

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
- `docs/`: documentos de diseño (PRD/arquitectura/diseño de páginas)

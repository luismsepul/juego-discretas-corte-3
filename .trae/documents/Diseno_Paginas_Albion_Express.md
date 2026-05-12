# Diseño de páginas — Albion Express (Agente Viajero)

## Global Styles (desktop-first)
- Layout base: contenedor centrado max-width 1200px; grid de 12 columnas; espaciado 8px.
- Tipografía: sistema (Inter/Arial); escala 14/16/20/28.
- Colores:
  - Fondo: #0B1020 (oscuro) o #F7F8FB (claro, opcional)
  - Superficie/tarjetas: #111833
  - Texto principal: #EAF0FF; secundario: #B8C2E0
  - Acento (tu ruta): #5B8CFF; Óptimo: #23C483; Error/alerta: #FF5B6E
- Botones:
  - Primario: fondo acento + hover + focus ring visible.
  - Secundario: borde 1px + hover con ligera elevación.
- Enlaces: subrayado al hover.
- Estados:
  - Nodo no visitado: borde neutro
  - Nodo visitado: relleno tenue
  - Nodo actual: halo/acento
- Responsive:
  - >= 1024px: panel lateral fijo (métricas)
  - 768–1023px: panel bajo el mapa
  - < 768px: apilar todo; botones en 2 columnas

## Página 1: Inicio y Configuración
### Layout
- CSS Grid: 2 columnas (contenido a la izquierda, tarjeta de configuración a la derecha). En pantallas pequeñas se apila.

### Meta Information
- Title: “Albion Express — Agente Viajero”
- Description: “Juego educativo para construir rutas y compararlas con la ruta óptima del TSP.”
- Open Graph: og:title, og:description, og:type=website

### Page Structure
1. Header superior
2. Bloque “Qué aprenderás”
3. Tarjeta “Configurar escenario”
4. Footer pequeño (créditos)

### Sections & Components
- Header
  - Logo/título “Albion Express”
  - Botón secundario: “Cómo se juega” (abre modal o despliega acordeón)
- Qué aprenderás (card)
  - Texto breve: objetivo (visitar todos y volver al inicio minimizando distancia)
  - Lista: conceptos (ruta, ciclo, distancia, óptimo)
- Configurar escenario (card)
  - Select: Escenario (Fácil/Medio/Difícil)
  - Texto pequeño: número de nodos y nota de métrica
  - Botón primario: “Empezar” (navega a Juego)

## Página 2: Juego (Mapa y Ruta)
### Layout
- Híbrido: Grid (2 columnas) + Flexbox.
- Columna izquierda: área del mapa (SVG/Canvas) con toolbar.
- Columna derecha: panel de métricas + lista de ruta.

### Meta Information
- Title: “Jugar — Albion Express”
- Description: “Construye tu ruta haciendo clic en los nodos del mapa.”

### Page Structure
1. Barra superior (breadcrumbs simples: Inicio > Juego)
2. Área de mapa
3. Panel lateral de métricas

### Sections & Components
- Barra superior
  - Link “Volver”
  - Título del escenario
  - Acciones: “Reiniciar ruta”, “Deshacer”
- Mapa interactivo
  - Nodos con label (A, B, C…)
  - Interacciones:
    - Hover: resaltar nodo
    - Click: agregar a la ruta si es válido
    - Línea de ruta: dibujar segmentos; si completa, cerrar ciclo al inicio
  - Leyenda de colores (Tu ruta / Óptima se muestra solo en Resultados)
- Panel de métricas (sticky en desktop)
  - Contador: visitados / total
  - Distancia total (actualizada en vivo)
  - Estado: “Incompleta / Lista para cerrar / Completada”
  - Lista de ruta (chips): A → D → ...
  - Botón primario: “Ver resultados” (habilitado solo al completar)

## Página 3: Resultados y Comparación
### Layout
- Grid de 2 columnas (desktop):
  - Izquierda: visualización del mapa con switch (Tu ruta / Óptima / Ambas)
  - Derecha: tarjetas de métricas comparativas

### Meta Information
- Title: “Resultados — Albion Express”
- Description: “Compara tu ruta con la ruta óptima y analiza métricas.”

### Page Structure
1. Header con navegación
2. Visualización comparativa
3. Métricas y conclusiones

### Sections & Components
- Header
  - Breadcrumbs: Inicio > Juego > Resultados
  - Botones: “Reintentar mismo escenario”, “Cambiar escenario”
- Visualización
  - Mapa reutilizado (misma escala)
  - Toggle:
    - Solo tu ruta (azul)
    - Solo óptima (verde)
    - Ambas (con distinta opacidad y leyenda)
- Métricas (cards)
  - Tu distancia total
  - Distancia óptima
  - Diferencia absoluta
  - % sobre óptimo
  - Texto corto: interpretación (p. ej. “Estuviste a X% del óptimo”)

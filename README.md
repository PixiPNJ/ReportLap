# ReportLap

Control semanal del estado de laptops, tablets y big tablets (pizarras interactivas), con historial de incidencias y exportación a Excel.

Pensado para revisar equipos físicos rápido desde el celular y llevar un registro ordenado semana a semana, sin depender de planillas sueltas.

## Features

- Registro por equipo (OK / con incidencia) para laptops, tablets agrupadas por carro y big tablets agrupadas por sala.
- Resumen con filtros (todas / OK / con incidencia) y búsqueda visual rápida.
- Historial: cada registro queda guardado, no se pisa el anterior — se puede ver cuántas veces falló un equipo y cuándo.
- Dashboard general con gráficos consolidados de los tres tipos de equipo.
- Exportación a Excel, CSV y vista de impresión / PDF.
- Backup manual: exportar e importar un `.json` con toda la configuración, registros e historial.
- Diseño responsive de verdad: pensado primero para desktop/HD/2K/4K y adaptado hacia abajo hasta celular, no al revés.

## Estructura del proyecto

```
index.html          Punto de entrada único (landing + shell de la app)
css/
  base.css          Variables, reset, tipografía
  layout.css         Grid del shell, sidebar/nav, breakpoints responsive
  components.css      Cards, botones, badges, tabs, formularios, tablas
  landing.css         Portada
  print.css           Vista de impresión
js/
  main.js            Router y bootstrap de la app
  state/
    store.js           Persistencia en localStorage y modelo de datos
    defaults.js         Configuración inicial de equipos
  modules/
    landing.js          Portada
    equipo.js            Registrar / Resumen / Gestión / Exportar por tipo de equipo
    dashboard.js          Vista consolidada con gráficos
    historial.js          Historial por equipo
    backup.js             Export / import de respaldo
    exportar.js           Lógica de exportación (Excel / CSV / imprimir)
  utils/
    dom.js              Helpers de creación de elementos y toasts
    format.js            Formato de fechas
assets/              Íconos y recursos estáticos
```

## Cómo correrlo

Es un sitio 100% estático, sin build ni backend. Como usa ES modules, no funciona abriendo `index.html` directo con `file://` — hay que servirlo con cualquier servidor estático:

```bash
python3 -m http.server 8080
```

y entrar a `http://localhost:8080`.

## Datos

Todo se guarda en el `localStorage` del navegador — nada se manda a ningún servidor. Para no perder la información si se cambia de dispositivo o se borra el caché, hay una sección de **Respaldo** para exportar/importar un `.json` con todo.

## Créditos

- Original por [PixiPNJ](https://github.com/PixiPNJ)
- Rediseño y reestructuración por [decatrondev](https://github.com/decatrondev)

## Licencia

Ver [LICENSE](./LICENSE).

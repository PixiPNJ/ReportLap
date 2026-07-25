import { getData, itemsDeTipo, getHistorial } from '../state/store.js?v=7';
import { crear } from '../utils/dom.js?v=7';
import { fechaLarga } from '../utils/format.js?v=7';

export function renderHistorial(root) {
  root.innerHTML = '';
  root.appendChild(crear('div', { class: 'view-header' }, [
    crear('h1', {}, ['🕘 Historial de equipos']),
  ]));

  const tipos = getData().tipos;
  let tipoFiltro = 'todos';

  const filterRow = crear('div', { class: 'filter-row' });
  const listBox = crear('div', {});

  const opciones = [{ id: 'todos', label: 'Todos' }, ...tipos.map((t) => ({ id: t.id, label: `${t.icono} ${t.nombre}` }))];
  opciones.forEach((o) => {
    filterRow.appendChild(crear('button', {
      class: 'filter-btn' + (o.id === tipoFiltro ? ' active-f' : ''),
      onclick: () => { tipoFiltro = o.id; render(); },
    }, [o.label]));
  });

  function render() {
    filterRow.querySelectorAll('.filter-btn').forEach((b, i) => b.classList.toggle('active-f', opciones[i].id === tipoFiltro));
    listBox.innerHTML = '';

    const tiposAMostrar = tipoFiltro === 'todos' ? tipos : tipos.filter((t) => t.id === tipoFiltro);
    let entradas = [];
    tiposAMostrar.forEach((tipo) => {
      itemsDeTipo(tipo).forEach((it) => {
        const hist = getHistorial(it.key);
        if (hist.length) entradas.push({ it, hist, tipo });
      });
    });
    entradas.sort((a, b) => {
      const ua = a.hist[a.hist.length - 1].fecha;
      const ub = b.hist[b.hist.length - 1].fecha;
      return ub.localeCompare(ua);
    });

    if (!entradas.length) {
      listBox.appendChild(crear('div', { class: 'empty-state' }, [crear('div', { class: 'icon' }, ['🕘']), 'Todavía no hay historial registrado.']));
      return;
    }

    entradas.forEach(({ it, hist, tipo }) => {
      const fallas = hist.filter((h) => h.estado === 'FALLA').length;
      const card = crear('div', { class: 'card' });
      card.appendChild(crear('div', { class: 'row-top', style: 'display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem' }, [
        crear('span', { class: 'tag-mono accent' }, [`${tipo.icono} ${it.label}`]),
        crear('span', { class: 'badge ' + (fallas ? 'badge-falla' : 'badge-ok') }, [`${fallas} falla${fallas === 1 ? '' : 's'} registrada${fallas === 1 ? '' : 's'}`]),
      ]));
      const lista = crear('div', {});
      [...hist].reverse().slice(0, 8).forEach((h) => {
        lista.appendChild(crear('div', { style: 'display:flex;gap:0.6rem;padding:0.35rem 0;border-bottom:1px solid var(--border);font-size:12.5px' }, [
          crear('span', { style: 'color:var(--text-muted);min-width:150px' }, [fechaLarga(h.fecha)]),
          crear('span', { class: 'badge ' + (h.estado === 'FALLA' ? 'badge-falla' : 'badge-ok') }, [h.estado === 'FALLA' ? '⚠️ Falla' : '✅ OK']),
          h.incidencia ? crear('span', { style: 'color:var(--text-muted)' }, [h.incidencia]) : null,
        ]));
      });
      card.appendChild(lista);
      listBox.appendChild(card);
    });
  }

  render();
  root.append(filterRow, listBox);
}

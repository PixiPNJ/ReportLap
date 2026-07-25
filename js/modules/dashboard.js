import { getData, itemsDeTipo, getRegistro } from '../state/store.js?v=7';
import { crear } from '../utils/dom.js?v=7';

function statsPorTipo() {
  return getData().tipos.map((tipo) => {
    const items = itemsDeTipo(tipo);
    const registrados = items.filter((it) => getRegistro(it.key));
    const falla = registrados.filter((it) => getRegistro(it.key).estado === 'FALLA').length;
    return { tipo, total: items.length, registrados: registrados.length, ok: registrados.length - falla, falla };
  });
}

function donut(ok, falla) {
  const total = ok + falla;
  const r = 46, c = 2 * Math.PI * r;
  const pctFalla = total ? falla / total : 0;
  const dashFalla = c * pctFalla;
  const svg = `
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r="${r}" fill="none" stroke="var(--surface-3)" stroke-width="14" />
      <circle cx="60" cy="60" r="${r}" fill="none" stroke="var(--ok)" stroke-width="14"
        stroke-dasharray="${c - dashFalla} ${c}" stroke-dashoffset="0" transform="rotate(-90 60 60)" />
      <circle cx="60" cy="60" r="${r}" fill="none" stroke="var(--falla)" stroke-width="14"
        stroke-dasharray="${dashFalla} ${c}" stroke-dashoffset="${-(c - dashFalla)}" transform="rotate(-90 60 60)" />
      <text x="60" y="56" text-anchor="middle" font-size="20" font-weight="700" fill="var(--text)" font-family="var(--font-tag)">${total ? Math.round((1 - pctFalla) * 100) : 0}%</text>
      <text x="60" y="74" text-anchor="middle" font-size="10" fill="var(--text-muted)">OK</text>
    </svg>`;
  return svg;
}

function barrasPorTipo(stats) {
  const maxTotal = Math.max(1, ...stats.map((s) => s.total));
  const alto = 120;
  const barras = stats.map((s, i) => {
    const x = i * 90 + 20;
    const hOk = s.total ? (s.ok / maxTotal) * alto : 0;
    const hFalla = s.total ? (s.falla / maxTotal) * alto : 0;
    return `
      <g transform="translate(${x},0)">
        <rect x="0" y="${alto - hFalla - hOk}" width="26" height="${hOk}" fill="var(--ok)" rx="3" />
        <rect x="0" y="${alto - hFalla}" width="26" height="${hFalla}" fill="var(--falla)" rx="3" />
        <text x="13" y="${alto + 16}" text-anchor="middle" font-size="10.5" fill="var(--text-muted)">${s.tipo.icono}</text>
      </g>`;
  }).join('');
  const width = stats.length * 90 + 20;
  return `<svg width="${width}" height="${alto + 30}" viewBox="0 0 ${width} ${alto + 30}">${barras}</svg>`;
}

export function renderDashboard(root) {
  root.innerHTML = '';
  const stats = statsPorTipo();
  const totalOk = stats.reduce((a, s) => a + s.ok, 0);
  const totalFalla = stats.reduce((a, s) => a + s.falla, 0);
  const totalItems = stats.reduce((a, s) => a + s.total, 0);
  const totalRegistrados = stats.reduce((a, s) => a + s.registrados, 0);

  root.appendChild(crear('div', { class: 'view-header' }, [
    crear('h1', {}, ['📊 Dashboard general']),
  ]));

  const statsRow = crear('div', { class: 'stats-row' }, [
    statBox('Equipos totales', totalItems, 'total'),
    statBox('Registrados', totalRegistrados, ''),
    statBox('OK', totalOk, 'ok'),
    statBox('Con incidencia', totalFalla, 'falla'),
  ]);
  root.appendChild(statsRow);

  const chartsCard = crear('div', { class: 'card' });
  chartsCard.appendChild(crear('h3', { style: 'font-size:13px;color:var(--text-muted);margin-bottom:0.85rem;text-transform:uppercase;letter-spacing:0.05em' }, ['Estado general vs. por tipo']));
  const chartWrap = crear('div', { class: 'chart-wrap' });
  chartWrap.appendChild(crear('div', { html: donut(totalOk, totalFalla) }));
  chartWrap.appendChild(crear('div', { html: barrasPorTipo(stats) }));
  chartsCard.appendChild(chartWrap);
  root.appendChild(chartsCard);

  const tabla = crear('div', { class: 'card' });
  tabla.appendChild(crear('h3', { style: 'font-size:13px;color:var(--text-muted);margin-bottom:0.6rem;text-transform:uppercase;letter-spacing:0.05em' }, ['Por tipo de equipo']));
  const table = crear('table', { class: 'data-table' });
  table.innerHTML = `
    <thead><tr><th>Tipo</th><th>Total</th><th>Registrados</th><th>OK</th><th>Incidencias</th></tr></thead>
    <tbody>${stats.map((s) => `
      <tr>
        <td>${s.tipo.icono} ${s.tipo.nombre}</td>
        <td>${s.total}</td>
        <td>${s.registrados}</td>
        <td style="color:var(--ok)">${s.ok}</td>
        <td style="color:var(--falla)">${s.falla}</td>
      </tr>`).join('')}
    </tbody>`;
  const tableScroll = crear('div', { class: 'table-scroll' }, [table]);
  tabla.appendChild(tableScroll);
  root.appendChild(tabla);
}

function statBox(label, num, tipoClase) {
  return crear('div', { class: 'stat-box' + (tipoClase ? ' stat-' + tipoClase : '') }, [
    crear('div', { class: 'stat-num' }, [String(num)]),
    crear('div', { class: 'stat-label' }, [label]),
  ]);
}

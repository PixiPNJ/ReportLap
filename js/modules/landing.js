import { getData, itemsDeTipo, getRegistro } from '../state/store.js?v=7';
import { crear } from '../utils/dom.js?v=7';

function statsDeTipo(tipo) {
  const items = itemsDeTipo(tipo);
  const registrados = items.filter((it) => getRegistro(it.key));
  const falla = registrados.filter((it) => getRegistro(it.key).estado === 'FALLA').length;
  return { total: items.length, ok: items.length - falla, falla };
}

const FOTO_POR_TIPO = {
  laptops: 'landing-card-laptop',
  tablets: 'landing-card-tablet',
  bigtablet: 'landing-card-big',
};

function tarjetaTipo(tipo) {
  const s = statsDeTipo(tipo);
  const claseFoto = FOTO_POR_TIPO[tipo.id] || '';
  return crear('a', { class: `landing-card landing-card-foto ${claseFoto}`, href: '#/tipo:' + tipo.id }, [
    crear('div', { class: 'landing-card-icon' }, [tipo.icono]),
    crear('div', { class: 'landing-card-title' }, [tipo.nombre]),
    crear('div', { class: 'landing-card-stats' }, [
      crear('span', { class: 'tag-mono' }, [`${s.total} equipos`]),
      crear('span', { class: 'tag-mono ok' }, [`${s.ok} OK`]),
      crear('span', { class: 'tag-mono falla' }, [`${s.falla} falla${s.falla === 1 ? '' : 's'}`]),
    ]),
    crear('div', { class: 'landing-card-cta' }, ['Registrar / ver detalle →']),
  ]);
}

function tarjetaDashboard(totalEquipos, totalFalla) {
  return crear('a', { class: 'landing-card landing-card-foto landing-card-about', href: '#/dashboard' }, [
    crear('div', { class: 'landing-card-icon' }, ['📊']),
    crear('div', { class: 'landing-card-title' }, ['Dashboard general']),
    crear('div', { class: 'landing-card-stats' }, [
      crear('span', { class: 'tag-mono' }, [`${totalEquipos} equipos en total`]),
      crear('span', { class: 'tag-mono falla' }, [`${totalFalla} con incidencia`]),
    ]),
    crear('div', { class: 'landing-card-cta' }, ['Ver análisis completo →']),
  ]);
}

export function renderLanding(root) {
  root.innerHTML = '';
  const tipos = getData().tipos;
  const statsPorTipo = tipos.map((t) => statsDeTipo(t));
  const totalEquipos = statsPorTipo.reduce((a, s) => a + s.total, 0);
  const totalFalla = statsPorTipo.reduce((a, s) => a + s.falla, 0);

  const page = crear('div', { class: 'landing-page' });

  const hero = crear('div', { class: 'landing-hero' }, [
    crear('div', { class: 'tag-mono accent landing-eyebrow' }, ['CONTROL DE EQUIPOS']),
    crear('h1', {}, ['ReportLap']),
    crear('p', { class: 'landing-tagline' }, [
      'Registro semanal del estado de laptops, tablets y big tablets — con historial y exportación a Excel.',
    ]),
    crear('p', { class: 'landing-resumen' }, [
      totalFalla > 0
        ? `${totalEquipos} equipos en total, ${totalFalla} con incidencia registrada ahora mismo.`
        : `${totalEquipos} equipos en total. Sin incidencias registradas por ahora.`,
    ]),
  ]);

  const grid = crear('div', { class: 'landing-grid' }, [
    ...tipos.map((t) => tarjetaTipo(t)),
    tarjetaDashboard(totalEquipos, totalFalla),
  ]);

  const footer = crear('div', { class: 'landing-footer' }, [
    'Hecho por ',
    crear('a', { href: 'https://github.com/PixiPNJ', target: '_blank', rel: 'noopener' }, ['PixiPNJ']),
  ]);

  page.append(hero, grid, footer);
  root.appendChild(page);
}

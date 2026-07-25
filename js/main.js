import { getData, getTheme, setTheme } from './state/store.js?v=7';
import { crear, qs } from './utils/dom.js?v=7';
import { fechaHoyCL } from './utils/format.js?v=7';
import { renderEquipoView } from './modules/equipo.js?v=7';
import { renderDashboard } from './modules/dashboard.js?v=7';
import { renderHistorial } from './modules/historial.js?v=7';
import { renderBackup } from './modules/backup.js?v=7';
import { renderLanding } from './modules/landing.js?v=7';

const root = qs('#app');

window.addEventListener('hashchange', () => pintarPagina());

function navItems() {
  const tipos = getData().tipos;
  return [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    ...tipos.map((t) => ({ id: 'tipo:' + t.id, label: t.nombre, icon: t.icono })),
    { id: 'historial', label: 'Historial', icon: '🕘' },
    { id: 'backup', label: 'Respaldo', icon: '🗄️' },
  ];
}

function rutaActual() {
  const hash = window.location.hash.replace(/^#\/?/, '') || 'landing';
  return hash;
}

function tituloDeRuta(ruta) {
  if (ruta === 'dashboard') return { titulo: 'Dashboard general', sub: `Semana del ${fechaHoyCL()}` };
  if (ruta === 'historial') return { titulo: 'Historial', sub: 'Registro histórico de todos los equipos' };
  if (ruta === 'backup') return { titulo: 'Respaldo de datos', sub: 'Exportar / importar copia de seguridad' };
  if (ruta.startsWith('tipo:')) {
    const tipo = getData().tipos.find((t) => t.id === ruta.slice(5));
    return { titulo: tipo ? tipo.nombre : 'Equipo', sub: `Semana del ${fechaHoyCL()}` };
  }
  return { titulo: 'ReportLap', sub: '' };
}

function renderShell() {
  root.innerHTML = '';
  const shell = crear('div', { class: 'app-shell' });

  const sidebar = crear('div', { class: 'sidebar' });
  sidebar.appendChild(crear('a', { class: 'sidebar-brand', href: '#/' }, ['REPORTLAP']));

  const topbar = crear('div', { class: 'topbar' });
  const topbarText = crear('div', {});
  const themeBtn = crear('button', { class: 'theme-toggle', onclick: toggleTheme }, [getTheme() === 'light' ? '☀️' : '🌙']);
  topbar.append(topbarText, crear('div', { class: 'topbar-actions' }, [themeBtn]));

  const main = crear('div', { class: 'main' });
  const view = crear('div', { id: 'view' });
  main.appendChild(view);

  shell.append(sidebar, topbar, main);
  root.appendChild(shell);

  function pintarNav() {
    sidebar.querySelectorAll('.nav-item').forEach((n) => n.remove());
    const ruta = rutaActual();
    navItems().forEach((item) => {
      const btn = crear('a', {
        class: 'nav-item' + (ruta === item.id ? ' active' : ''),
        href: '#/' + item.id,
      }, [
        crear('span', { class: 'icon' }, [item.icon]),
        crear('span', {}, [item.label]),
      ]);
      sidebar.appendChild(btn);
    });
  }

  function pintarVista() {
    const ruta = rutaActual();
    const { titulo, sub } = tituloDeRuta(ruta);
    topbarText.innerHTML = '';
    topbarText.append(crear('h1', {}, [titulo]), crear('div', { class: 'sub' }, [sub]));

    if (ruta === 'dashboard') renderDashboard(view);
    else if (ruta === 'historial') renderHistorial(view);
    else if (ruta === 'backup') renderBackup(view);
    else if (ruta.startsWith('tipo:')) renderEquipoView(view, ruta.slice(5));
    else renderDashboard(view);

    pintarNav();
  }

  pintarVista();
}

function toggleTheme() {
  const next = getTheme() === 'light' ? 'dark' : 'light';
  setTheme(next);
  document.documentElement.setAttribute('data-theme', next);
  pintarPagina();
}

function pintarPagina() {
  const ruta = rutaActual();
  if (ruta === 'landing') {
    root.innerHTML = '';
    renderLanding(root);
  } else {
    renderShell();
  }
}

document.documentElement.setAttribute('data-theme', getTheme());
pintarPagina();

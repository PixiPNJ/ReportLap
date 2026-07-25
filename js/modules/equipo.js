import {
  getTipo, itemsDeTipo, getRegistro, guardarRegistro, limpiarRegistros, resetTipoConfig,
  agregarItemPlano, quitarItemPlano, cambiarModeloPlano,
  renombrarGrupo, cambiarModeloGrupo, agregarItemGrupo, quitarItemGrupo, keyFor,
} from '../state/store.js?v=7';
import { crear, toast, confirmar } from '../utils/dom.js?v=7';
import { fechaInputDefault } from '../utils/format.js?v=7';
import { exportarExcel, exportarCSV, imprimirTipo } from './exportar.js?v=7';

const TABS = [
  { id: 'registrar', label: '✏️ Registrar' },
  { id: 'resumen', label: '📊 Resumen' },
  { id: 'gestion', label: '⚙️ Gestión' },
  { id: 'exportar', label: '⬇️ Exportar' },
];

export function renderEquipoView(container, tipoId) {
  const tipo = getTipo(tipoId);
  if (!tipo) {
    container.innerHTML = '<div class="empty-state">Tipo de equipo no encontrado.</div>';
    return;
  }

  let tabActual = 'registrar';
  container.innerHTML = '';

  const header = crear('div', { class: 'view-header' }, [
    crear('h1', {}, [`${tipo.icono} ${tipo.nombre}`]),
  ]);

  const tabsBar = crear('div', { class: 'tabs' });
  const content = crear('div', { class: 'view-content' });

  function renderTabs() {
    tabsBar.innerHTML = '';
    TABS.forEach((t) => {
      const btn = crear('button', {
        class: 'tab' + (t.id === tabActual ? ' active' : ''),
        onclick: () => { tabActual = t.id; renderTabs(); renderContent(); },
      }, [t.label]);
      tabsBar.appendChild(btn);
    });
  }

  function renderContent() {
    content.innerHTML = '';
    if (tabActual === 'registrar') renderRegistrar(content, tipo);
    if (tabActual === 'resumen') renderResumen(content, tipo);
    if (tabActual === 'gestion') renderGestion(content, tipo, () => { renderContent(); });
    if (tabActual === 'exportar') renderExportar(content, tipo);
  }

  container.append(header, tabsBar, content);
  renderTabs();
  renderContent();
}

/* ---------------- Registrar ---------------- */
function renderRegistrar(root, tipo) {
  const wrap = crear('div', { class: 'split-desktop' });
  const formCol = crear('div', { class: 'split-form' });
  const listCol = crear('div', { class: 'split-list' });

  let estado = 'OK';
  let grupoSel = tipo.agrupado ? '' : null;
  let itemSel = '';

  const formCard = crear('div', { class: 'card' });

  if (tipo.agrupado) {
    const selGrupo = crear('select', {
      onchange: (e) => { grupoSel = e.target.value; itemSel = ''; renderItemSelect(); },
    }, [
      crear('option', { value: '' }, [`— Seleccionar ${tipo.groupNoun.toLowerCase()} —`]),
      ...tipo.grupos.map((g) => crear('option', { value: g.id }, [`${g.nombre}${g.modelo ? ' — ' + g.modelo : ''}`])),
    ]);
    formCard.append(
      crear('label', {}, [tipo.groupNoun]),
      crear('div', { class: 'select-wrapper' }, [selGrupo]),
    );
  }

  const itemWrap = crear('div', {}, []);
  formCard.appendChild(itemWrap);

  const estadoCard = crear('div', { class: 'card', style: 'display:none' });
  const btnOk = crear('button', { class: 'status-btn ok active', onclick: () => setEstado('OK') }, ['✅ OK']);
  const btnFalla = crear('button', { class: 'status-btn falla', onclick: () => setEstado('FALLA') }, ['⚠️ Con Incidencia']);
  const incBox = crear('div', { class: 'incidencia-box' });
  const txtInc = crear('textarea', { placeholder: 'Describe la incidencia (ej: falta tecla, pantalla rota, no enciende...)' });
  incBox.append(crear('label', { style: 'margin-top:0.6rem' }, ['Descripción de la incidencia']), txtInc);
  estadoCard.append(
    crear('label', {}, ['Estado']),
    crear('div', { class: 'status-toggle' }, [btnOk, btnFalla]),
    incBox,
  );

  const btnGuardar = crear('button', { class: 'btn-main', style: 'display:none', onclick: guardar }, ['💾 Guardar registro']);

  formCol.append(formCard, estadoCard, btnGuardar);

  function setEstado(s) {
    estado = s;
    btnOk.classList.toggle('active', s === 'OK');
    btnFalla.classList.toggle('active', s === 'FALLA');
    incBox.classList.toggle('visible', s === 'FALLA');
  }

  function renderItemSelect() {
    itemWrap.innerHTML = '';
    if (tipo.agrupado && !grupoSel) {
      estadoCard.style.display = 'none';
      btnGuardar.style.display = 'none';
      return;
    }
    const items = tipo.agrupado
      ? tipo.grupos.find((g) => g.id === grupoSel).items
      : tipo.items;

    if (!items.length) {
      estadoCard.style.display = 'none';
      btnGuardar.style.display = 'none';
      itemWrap.appendChild(crear('p', { style: 'font-size:12.5px;color:var(--text-muted);margin-top:0.5rem' }, [
        `Sin ${tipo.itemNoun.toLowerCase()}s configurad${tipo.itemNoun.endsWith('a') ? 'as' : 'os'} en este grupo.`,
      ]));
      return;
    }

    const sel = crear('select', {
      onchange: (e) => { itemSel = e.target.value; onItemChange(); },
    }, items.map((it) => crear('option', { value: it.id }, [
      tipo.agrupado ? `${tipo.itemNoun} ${it.id}` : `${tipo.itemNoun} #${it.id.toString().padStart(2, '0')} — ${it.modelo || ''}`,
    ])));

    itemWrap.append(
      crear('label', { style: 'margin-top:0.8rem' }, [tipo.itemNoun]),
      crear('div', { class: 'select-wrapper' }, [sel]),
    );

    itemSel = items[0].id.toString();
    sel.value = itemSel;
    onItemChange();
  }

  function onItemChange() {
    estadoCard.style.display = 'block';
    btnGuardar.style.display = 'block';
    const key = keyFor(tipo.id, tipo.agrupado ? grupoSel : null, itemSel);
    const prev = getRegistro(key);
    if (prev) {
      setEstado(prev.estado);
      txtInc.value = prev.incidencia || '';
    } else {
      setEstado('OK');
      txtInc.value = '';
    }
  }

  function guardar() {
    if (tipo.agrupado && !grupoSel) { toast(`⚠️ Selecciona ${tipo.groupNoun.toLowerCase()}`); return; }
    if (!itemSel) { toast('⚠️ Selecciona un equipo'); return; }
    const inc = txtInc.value.trim();
    if (estado === 'FALLA' && !inc) { toast('⚠️ Describe la incidencia'); return; }
    const key = keyFor(tipo.id, tipo.agrupado ? grupoSel : null, itemSel);
    guardarRegistro(key, estado, inc);
    toast('✅ Registro guardado');
    renderListaProgreso();
  }

  if (!tipo.agrupado) renderItemSelect();

  function renderListaProgreso() {
    listCol.innerHTML = '';
    listCol.appendChild(crear('h3', { style: 'font-size:13px;color:var(--text-muted);margin-bottom:0.6rem;text-transform:uppercase;letter-spacing:0.05em' }, ['Progreso de esta sesión']));
    const items = itemsDeTipo(tipo);
    const registrados = items.filter((it) => getRegistro(it.key));
    if (!registrados.length) {
      listCol.appendChild(crear('div', { class: 'empty-state' }, [
        crear('div', { class: 'icon' }, ['📋']),
        `Aún no registras ningún ${tipo.itemNoun.toLowerCase()}.`,
      ]));
      return;
    }
    const grid = crear('div', { class: 'grid-equipos' });
    registrados.forEach((it) => grid.appendChild(itemCard(it)));
    listCol.appendChild(grid);
  }

  renderListaProgreso();
  wrap.append(formCol, listCol);
  root.appendChild(wrap);
}

function itemCard(it) {
  const d = getRegistro(it.key);
  const esFalla = d && d.estado === 'FALLA';
  const card = crear('div', { class: 'equipo-card' + (esFalla ? ' falla' : '') });
  card.append(
    crear('div', { class: 'row-top' }, [
      crear('span', { class: 'tag-mono' + (esFalla ? ' falla' : ' ok') }, [it.label]),
      crear('span', { class: 'badge ' + (esFalla ? 'badge-falla' : 'badge-ok') }, [esFalla ? '⚠️ Falla' : '✅ OK']),
    ]),
  );
  if (it.modelo) card.appendChild(crear('div', { class: 'desc-text' }, [it.modelo]));
  if (esFalla) card.appendChild(crear('div', { class: 'desc-text' }, [d.incidencia]));
  return card;
}

/* ---------------- Resumen ---------------- */
function renderResumen(root, tipo) {
  let filtro = 'todas';
  const items = itemsDeTipo(tipo);

  const statsRow = crear('div', { class: 'stats-row' });
  const filterRow = crear('div', { class: 'filter-row' });
  const listBox = crear('div', {});

  ['todas', 'ok', 'falla'].forEach((f) => {
    const label = { todas: 'Todas', ok: 'Solo OK', falla: 'Incidencias' }[f];
    filterRow.appendChild(crear('button', {
      class: 'filter-btn' + (f === filtro ? ' active-f' : ''),
      onclick: () => { filtro = f; renderAll(); },
    }, [label]));
  });

  function renderAll() {
    const registrados = items.filter((it) => getRegistro(it.key));
    const ok = registrados.filter((it) => getRegistro(it.key).estado === 'OK').length;
    const falla = registrados.length - ok;

    statsRow.innerHTML = '';
    statsRow.append(
      statBox('Total', items.length, 'total'),
      statBox('Registrados', registrados.length, ''),
      statBox('OK', ok, 'ok'),
      statBox('Incidencias', falla, 'falla'),
    );

    filterRow.querySelectorAll('.filter-btn').forEach((b, i) => {
      b.classList.toggle('active-f', ['todas', 'ok', 'falla'][i] === filtro);
    });

    let mostrar = registrados;
    if (filtro === 'ok') mostrar = registrados.filter((it) => getRegistro(it.key).estado === 'OK');
    if (filtro === 'falla') mostrar = registrados.filter((it) => getRegistro(it.key).estado === 'FALLA');

    listBox.innerHTML = '';
    if (!mostrar.length) {
      listBox.appendChild(crear('div', { class: 'empty-state' }, [crear('div', { class: 'icon' }, ['📂']), 'Sin registros que mostrar.']));
      return;
    }
    const grid = crear('div', { class: 'grid-equipos' });
    mostrar.forEach((it) => grid.appendChild(itemCard(it)));
    listBox.appendChild(grid);
  }

  renderAll();
  root.append(statsRow, filterRow, listBox);
}

function statBox(label, num, tipoClase) {
  return crear('div', { class: 'stat-box' + (tipoClase ? ' stat-' + tipoClase : '') }, [
    crear('div', { class: 'stat-num' }, [String(num)]),
    crear('div', { class: 'stat-label' }, [label]),
  ]);
}

/* ---------------- Gestión ---------------- */
function renderGestion(root, tipo, onChange) {
  const info = crear('p', { style: 'font-size:13px;color:var(--text-muted);line-height:1.5;margin-bottom:0.85rem' }, [
    tipo.agrupado
      ? `Edita el nombre y modelo de cada ${tipo.groupNoun.toLowerCase()}, y ajusta con +/- cuántas unidades de ${tipo.itemNoun.toLowerCase()} tiene.`
      : `Edita el modelo de cada ${tipo.itemNoun.toLowerCase()} o quítala si se dio de baja.`,
  ]);
  root.appendChild(info);

  if (tipo.agrupado) {
    const list = crear('div', {});
    tipo.grupos.forEach((g) => {
      const box = crear('div', { class: 'card' });
      const nombreInput = crear('input', { type: 'text', value: g.nombre, onchange: (e) => { renombrarGrupo(tipo.id, g.id, e.target.value); toast('✏️ Nombre actualizado'); } });
      box.appendChild(crear('label', {}, [tipo.groupNoun]));
      box.appendChild(nombreInput);
      if ('modelo' in g) {
        const modeloInput = crear('input', { type: 'text', value: g.modelo || '', style: 'margin-top:0.5rem', onchange: (e) => { cambiarModeloGrupo(tipo.id, g.id, e.target.value); toast('✏️ Modelo actualizado'); } });
        box.appendChild(crear('label', { style: 'margin-top:0.6rem' }, ['Modelo']));
        box.appendChild(modeloInput);
      }
      const countRow = crear('div', { style: 'display:flex;align-items:center;justify-content:space-between;margin-top:0.7rem' }, [
        crear('span', { style: 'font-size:12.5px;color:var(--text-muted)' }, [`${tipo.itemNoun}s`]),
        crear('div', { style: 'display:flex;align-items:center;gap:0.6rem' }, [
          crear('button', { class: 'count-btn', onclick: () => { quitarItemGrupo(tipo.id, g.id); onChange(); } }, ['−']),
          crear('span', { style: 'font-weight:700;min-width:20px;text-align:center;display:inline-block' }, [String(g.items.length)]),
          crear('button', { class: 'count-btn', onclick: () => { agregarItemGrupo(tipo.id, g.id); onChange(); } }, ['+']),
        ]),
      ]);
      box.appendChild(countRow);
      list.appendChild(box);
    });
    root.appendChild(list);
  } else {
    const list = crear('div', { class: 'card' });
    tipo.items.forEach((it) => {
      const row = crear('div', { class: 'manage-row' }, [
        crear('span', { class: 'tag-mono' }, [String(it.id)]),
        crear('input', { type: 'text', value: it.modelo || '', onchange: (e) => { cambiarModeloPlano(tipo.id, it.id, e.target.value); toast('✏️ Modelo actualizado'); } }),
        crear('button', { class: 'del-btn', onclick: () => { quitarItemPlano(tipo.id, it.id); onChange(); } }, ['✕']),
      ]);
      list.appendChild(row);
    });
    list.appendChild(crear('button', { class: 'add-btn', onclick: () => { agregarItemPlano(tipo.id); onChange(); } }, [`➕ Agregar ${tipo.itemNoun.toLowerCase()}`]));
    root.appendChild(list);
  }

  root.appendChild(crear('button', {
    class: 'btn-secondary',
    style: 'margin-top:0.5rem',
    onclick: () => {
      if (!confirmar('¿Restaurar la configuración original de este tipo de equipo? Los cambios personalizados se perderán.')) return;
      resetTipoConfig(tipo.id);
      onChange();
      toast('↺ Configuración restaurada');
    },
  }, ['↺ Restaurar valores originales']));
}

/* ---------------- Exportar ---------------- */
function renderExportar(root, tipo) {
  const fechaInput = crear('input', { type: 'text', value: fechaInputDefault(), placeholder: 'Ej: 09-07-2025' });
  const fechaCard = crear('div', { class: 'card' }, [
    crear('label', {}, ['Fecha del reporte']),
    fechaInput,
    crear('p', { style: 'font-size:12px;color:var(--text-muted);margin-top:6px' }, ['Se incluirá en el nombre del archivo.']),
  ]);

  const items = itemsDeTipo(tipo);
  const registrados = items.filter((it) => getRegistro(it.key));
  const falla = registrados.filter((it) => getRegistro(it.key).estado === 'FALLA').length;

  const resumenCard = crear('div', { class: 'card' }, [
    crear('label', {}, ['Resumen antes de exportar']),
    crear('div', { class: 'stats-row', style: 'margin-bottom:0' }, [
      statBox('Equipos', items.length, 'total'),
      statBox('OK', items.length - falla, 'ok'),
      statBox('Incidencias', falla, 'falla'),
    ]),
  ]);

  const btnExcel = crear('button', { class: 'btn-main', onclick: () => { exportarExcel(tipo, fechaInput.value || fechaInputDefault()); toast('📥 Excel descargado'); } }, ['📥 Descargar Excel']);
  const btnCsv = crear('button', { class: 'btn-secondary', style: 'margin-top:0.5rem', onclick: () => { exportarCSV(tipo, fechaInput.value || fechaInputDefault()); toast('📥 CSV descargado'); } }, ['📄 Descargar CSV']);
  const btnPdf = crear('button', { class: 'btn-secondary', style: 'margin-top:0.5rem', onclick: () => imprimirTipo(tipo, fechaInput.value || fechaInputDefault()) }, ['🖨️ Imprimir / Guardar como PDF']);
  const btnLimpiar = crear('button', {
    class: 'btn-ghost', style: 'margin-top:0.85rem;width:100%',
    onclick: () => {
      if (!confirmar('¿Seguro que quieres borrar todos los registros (OK/Falla)? La configuración no se toca.')) return;
      limpiarRegistros(tipo.id);
      toast('🗑️ Registros limpiados');
    },
  }, ['🗑️ Limpiar todos los registros']);

  root.append(fechaCard, resumenCard, btnExcel, btnCsv, btnPdf, btnLimpiar);
}

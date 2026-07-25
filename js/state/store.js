import { defaultAppData } from './defaults.js?v=7';

const STORAGE_KEY = 'reportlap_appdata_v1';
const THEME_KEY = 'reportlap_theme';

let data = load();
const listeners = new Set();

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('No se pudo leer el respaldo local, se usan los datos por defecto.', e);
  }
  return defaultAppData();
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  listeners.forEach((fn) => fn(data));
}

export function getData() {
  return data;
}

export function setData(next) {
  data = next;
  persist();
}

export function updateData(mutator) {
  mutator(data);
  persist();
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function keyFor(tipoId, grupoId, itemId) {
  return `${tipoId}::${grupoId ?? '_'}::${itemId}`;
}

export function getTipo(tipoId) {
  return data.tipos.find((t) => t.id === tipoId);
}

export function getRegistro(key) {
  return data.registros[key];
}

export function getHistorial(key) {
  return data.historial[key] || [];
}

export function itemsDeTipo(tipo) {
  if (!tipo.agrupado) {
    return tipo.items.map((it) => ({
      tipoId: tipo.id,
      grupoId: null,
      itemId: it.id,
      modelo: it.modelo,
      grupoNombre: null,
      key: keyFor(tipo.id, null, it.id),
      label: `${tipo.itemNoun} #${it.id.toString().padStart(2, '0')}`,
    }));
  }
  const out = [];
  tipo.grupos.forEach((g) => {
    g.items.forEach((it) => {
      out.push({
        tipoId: tipo.id,
        grupoId: g.id,
        itemId: it.id,
        modelo: g.modelo,
        grupoNombre: g.nombre,
        key: keyFor(tipo.id, g.id, it.id),
        label: `${g.nombre} — ${tipo.itemNoun} ${it.id}`,
      });
    });
  });
  return out;
}

export function guardarRegistro(key, estado, incidencia) {
  updateData((d) => {
    const fecha = new Date().toISOString();
    const inc = estado === 'FALLA' ? incidencia : '';
    d.registros[key] = { estado, incidencia: inc, actualizado: fecha };
    if (!d.historial[key]) d.historial[key] = [];
    d.historial[key].push({ fecha, estado, incidencia: inc });
  });
}

export function limpiarRegistros(tipoId) {
  updateData((d) => {
    Object.keys(d.registros).forEach((k) => {
      if (k.startsWith(tipoId + '::')) delete d.registros[k];
    });
  });
}

export function resetTipoConfig(tipoId) {
  updateData((d) => {
    const tipo = d.tipos.find((t) => t.id === tipoId);
    const fresh = defaultAppData().tipos.find((t) => t.id === tipoId);
    Object.keys(tipo).forEach((k) => delete tipo[k]);
    Object.assign(tipo, fresh);
  });
}

export function agregarItemPlano(tipoId) {
  updateData((d) => {
    const tipo = d.tipos.find((t) => t.id === tipoId);
    const nextId = tipo.items.length ? Math.max(...tipo.items.map((i) => i.id)) + 1 : 1;
    tipo.items.push({ id: nextId, modelo: 'Nuevo modelo' });
  });
}

export function quitarItemPlano(tipoId, itemId) {
  updateData((d) => {
    const tipo = d.tipos.find((t) => t.id === tipoId);
    tipo.items = tipo.items.filter((i) => i.id !== itemId);
    delete d.registros[keyFor(tipoId, null, itemId)];
  });
}

export function cambiarModeloPlano(tipoId, itemId, modelo) {
  updateData((d) => {
    const tipo = d.tipos.find((t) => t.id === tipoId);
    const item = tipo.items.find((i) => i.id === itemId);
    if (item) item.modelo = modelo.trim() || item.modelo;
  });
}

export function renombrarGrupo(tipoId, grupoId, nombre) {
  updateData((d) => {
    const tipo = d.tipos.find((t) => t.id === tipoId);
    const g = tipo.grupos.find((x) => x.id === grupoId);
    if (g) g.nombre = nombre.trim() || g.nombre;
  });
}

export function cambiarModeloGrupo(tipoId, grupoId, modelo) {
  updateData((d) => {
    const tipo = d.tipos.find((t) => t.id === tipoId);
    const g = tipo.grupos.find((x) => x.id === grupoId);
    if (g) g.modelo = modelo.trim() || g.modelo;
  });
}

export function agregarItemGrupo(tipoId, grupoId) {
  updateData((d) => {
    const tipo = d.tipos.find((t) => t.id === tipoId);
    const g = tipo.grupos.find((x) => x.id === grupoId);
    const nextId = g.items.length ? Math.max(...g.items.map((i) => i.id)) + 1 : 1;
    g.items.push({ id: nextId });
  });
}

export function quitarItemGrupo(tipoId, grupoId) {
  updateData((d) => {
    const tipo = d.tipos.find((t) => t.id === tipoId);
    const g = tipo.grupos.find((x) => x.id === grupoId);
    if (!g.items.length) return;
    const lastId = Math.max(...g.items.map((i) => i.id));
    g.items = g.items.filter((i) => i.id !== lastId);
    delete d.registros[keyFor(tipoId, grupoId, lastId)];
  });
}

export function getTheme() {
  return localStorage.getItem(THEME_KEY) || 'dark';
}

export function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

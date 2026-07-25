export const qs = (sel, root = document) => root.querySelector(sel);
export const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export function crear(tag, opts = {}, hijos = []) {
  const e = document.createElement(tag);
  Object.entries(opts).forEach(([k, v]) => {
    if (v == null) return;
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v);
  });
  hijos.forEach((h) => {
    if (h == null) return;
    e.appendChild(typeof h === 'string' || typeof h === 'number' ? document.createTextNode(h) : h);
  });
  return e;
}

let toastTimer;
export function toast(msg) {
  let t = qs('#toast');
  if (!t) {
    t = crear('div', { id: 'toast', class: 'toast' });
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

export function confirmar(msg) {
  return window.confirm(msg);
}

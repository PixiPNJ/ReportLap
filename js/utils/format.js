export function fechaHoyCL() {
  return new Date().toLocaleDateString('es-CL');
}

export function fechaInputDefault() {
  return fechaHoyCL().replace(/\//g, '-');
}

export function pad2(n) {
  return n.toString().padStart(2, '0');
}

export function fechaLarga(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
}

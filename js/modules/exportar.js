import { itemsDeTipo, getRegistro } from '../state/store.js?v=7';

function filasDeTipo(tipo, fecha) {
  const items = itemsDeTipo(tipo);
  const encabezado = tipo.agrupado
    ? [tipo.groupNoun, tipo.itemNoun, 'Modelo', 'Estado', 'Incidencia / Observación', 'Fecha Reporte']
    : [tipo.itemNoun, 'Modelo', 'Estado', 'Incidencia / Observación', 'Fecha Reporte'];

  const filas = items.map((it) => {
    const d = getRegistro(it.key);
    const estado = d ? d.estado : 'OK';
    const incidencia = d && d.estado === 'FALLA' ? d.incidencia : 'Sin incidencias';
    return tipo.agrupado
      ? [it.grupoNombre, `${tipo.itemNoun} ${it.itemId}`, it.modelo || '', estado, incidencia, fecha]
      : [`${tipo.itemNoun} #${it.itemId.toString().padStart(2, '0')}`, it.modelo || '', estado, incidencia, fecha];
  });

  return [encabezado, ...filas];
}

export function exportarExcel(tipo, fecha) {
  const rows = filasDeTipo(tipo, fecha);
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = rows[0].map((_, i) => ({ wch: i === rows[0].length - 2 ? 50 : 18 }));

  const headerStyle = {
    font: { bold: true, color: { rgb: 'FFFFFF' } },
    fill: { patternType: 'solid', fgColor: { rgb: 'C9860F' } },
    alignment: { horizontal: 'center' },
  };
  rows[0].forEach((_, i) => {
    const ref = XLSX.utils.encode_cell({ r: 0, c: i });
    if (ws[ref]) ws[ref].s = headerStyle;
  });

  XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
  XLSX.writeFile(wb, `Reporte_${tipo.nombre.replace(/\s+/g, '_')}_${fecha}.xlsx`);
}

export function exportarCSV(tipo, fecha) {
  const rows = filasDeTipo(tipo, fecha);
  const csv = rows
    .map((fila) => fila.map((celda) => `"${String(celda).replace(/"/g, '""')}"`).join(','))
    .join('\r\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Reporte_${tipo.nombre.replace(/\s+/g, '_')}_${fecha}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function imprimirTipo(tipo, fecha) {
  const rows = filasDeTipo(tipo, fecha);
  const win = window.open('', '_blank');
  const tabla = `
    <table class="data-table">
      <thead><tr>${rows[0].map((h) => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${rows.slice(1).map((f) => `<tr>${f.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>`;
  win.document.write(`
    <html><head><title>Reporte ${tipo.nombre} — ${fecha}</title>
    <style>
      body{font-family:-apple-system,'Segoe UI',sans-serif;padding:24px;color:#111;}
      h1{font-size:18px;margin-bottom:4px;}
      p{color:#555;margin-bottom:16px;font-size:13px;}
      table{width:100%;border-collapse:collapse;font-size:13px;}
      th,td{border:1px solid #999;padding:6px 8px;text-align:left;}
      th{background:#eee;}
    </style></head>
    <body><h1>Reporte ${tipo.nombre}</h1><p>Fecha: ${fecha}</p>${tabla}</body></html>
  `);
  win.document.close();
  win.focus();
  win.print();
}

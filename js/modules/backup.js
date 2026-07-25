import { getData, setData } from '../state/store.js?v=7';
import { crear, toast, confirmar } from '../utils/dom.js?v=7';
import { fechaInputDefault } from '../utils/format.js?v=7';

function exportarRespaldo() {
  const data = getData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reportlap-respaldo-${fechaInputDefault()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('💾 Respaldo descargado');
}

function importarRespaldo(file, onDone) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!parsed.tipos || !parsed.registros) throw new Error('Formato inválido');
      if (!confirmar('Esto reemplaza todos los datos actuales (equipos, registros e historial) por los del archivo. ¿Continuar?')) return;
      setData(parsed);
      toast('✅ Respaldo importado');
      onDone && onDone();
    } catch (e) {
      toast('⚠️ El archivo no es un respaldo válido');
    }
  };
  reader.readAsText(file);
}

export function renderBackup(root) {
  root.innerHTML = '';
  root.appendChild(crear('div', { class: 'view-header' }, [
    crear('h1', {}, ['🗄️ Respaldo de datos']),
  ]));

  const infoCard = crear('div', { class: 'card' }, [
    crear('p', { style: 'font-size:13.5px;color:var(--text-muted);line-height:1.6' }, [
      'Todo se guarda solo en este navegador. Si cambias de celular, borras el caché o formateas el equipo, se pierde. ',
      'Usa este respaldo para guardar una copia y poder restaurarla después, en este mismo dispositivo u otro.',
    ]),
  ]);

  const exportCard = crear('div', { class: 'card' }, [
    crear('label', {}, ['Exportar respaldo']),
    crear('p', { style: 'font-size:12.5px;color:var(--text-muted);margin-bottom:0.7rem' }, ['Descarga un archivo .json con la configuración de equipos, los registros y el historial completo.']),
    crear('button', { class: 'btn-main', onclick: exportarRespaldo }, ['💾 Descargar respaldo (.json)']),
  ]);

  const fileInput = crear('input', { type: 'file', accept: 'application/json' });
  const importCard = crear('div', { class: 'card' }, [
    crear('label', {}, ['Importar respaldo']),
    crear('p', { style: 'font-size:12.5px;color:var(--text-muted);margin-bottom:0.7rem' }, ['Selecciona un archivo .json exportado previamente. Esto reemplaza los datos actuales.']),
    fileInput,
    crear('button', {
      class: 'btn-secondary', style: 'margin-top:0.6rem',
      onclick: () => {
        const file = fileInput.files[0];
        if (!file) { toast('⚠️ Selecciona un archivo primero'); return; }
        importarRespaldo(file, () => { window.location.hash = '#/dashboard'; window.location.reload(); });
      },
    }, ['📤 Importar y reemplazar datos']),
  ]);

  root.append(infoCard, exportCard, importCard);
}

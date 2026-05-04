const editor = document.getElementById('editor');
const lineNumbers = document.getElementById('line-numbers');
const preview = document.getElementById('preview');
const errorPanel = document.getElementById('error-panel');
const errorMessage = document.getElementById('error-message');
const errorLine = document.getElementById('error-line');
const status = document.getElementById('status');
const savePumlBtn = document.getElementById('save-puml-btn');
const savePngBtn = document.getElementById('save-png-btn');
const openBtn = document.getElementById('open-btn');
const openFile = document.getElementById('open-file');

const STORAGE_KEY = 'pug-checker-source';
const DEFAULT_SOURCE = `@startuml
title Beispiel: Projektplan

actor "Product Owner" as PO
participant "Team" as T

PO -> T: Anforderungen
T --> PO: Schätzung
PO -> T: Freigabe
T -> T: Umsetzung
T --> PO: Auslieferung
@enduml
`;

editor.value = localStorage.getItem(STORAGE_KEY) ?? DEFAULT_SOURCE;

let errorLineNumber = null;

function updateLineNumbers() {
  const count = editor.value.split('\n').length;
  const parts = [];
  for (let i = 1; i <= count; i++) {
    parts.push(i === errorLineNumber ? `<span class="err">${i}</span>` : String(i));
  }
  lineNumbers.innerHTML = parts.join('\n');
  lineNumbers.scrollTop = editor.scrollTop;
}

editor.addEventListener('scroll', () => {
  lineNumbers.scrollTop = editor.scrollTop;
});

let timer = null;
let inflight = null;

function setStatus(state, text) {
  status.dataset.state = state;
  status.textContent = text;
}

function scheduleRender() {
  clearTimeout(timer);
  timer = setTimeout(render, 300);
}

async function render() {
  const source = editor.value;
  localStorage.setItem(STORAGE_KEY, source);

  if (inflight) inflight.abort?.();
  const controller = new AbortController();
  inflight = controller;

  setStatus('loading', 'rendere…');

  try {
    const res = await fetch('/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source }),
      signal: controller.signal,
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { svg, error, line } = await res.json();

    if (svg) preview.innerHTML = svg;

    if (error) {
      errorMessage.textContent = error;
      errorLine.textContent = line ? `Zeile ${line}` : '';
      errorPanel.hidden = false;
      setStatus('error', line ? `Fehler · Zeile ${line}` : 'Fehler');
      errorLineNumber = line;
    } else {
      errorPanel.hidden = true;
      setStatus('ok', 'OK');
      errorLineNumber = null;
    }
    updateLineNumbers();
  } catch (e) {
    if (e.name === 'AbortError') return;
    errorMessage.textContent = `Verbindungsfehler: ${e.message}`;
    errorLine.textContent = '';
    errorPanel.hidden = false;
    setStatus('error', 'Fehler');
  } finally {
    if (inflight === controller) inflight = null;
  }
}

editor.addEventListener('input', () => {
  updateLineNumbers();
  scheduleRender();
});

editor.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    e.preventDefault();
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    editor.setRangeText('  ', start, end, 'end');
    scheduleRender();
  }
});

async function saveAs({ data, suggestedName, mime, ext, description }) {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mime });

  if (typeof window.showSaveFilePicker === 'function') {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName,
        types: [{ description, accept: { [mime]: [ext] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
    } catch (e) {
      if (e.name !== 'AbortError') console.error(e);
    }
    return;
  }

  // Fallback (Firefox / Safari): Dateiname-Prompt + klassischer Download
  const input = window.prompt('Dateiname zum Speichern:', suggestedName);
  if (input === null) return;
  let name = input.trim();
  if (name === '') return;
  if (!/\.[a-z0-9]+$/i.test(name)) name += ext;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function defaultName(ext) {
  return `diagramm-${new Date().toISOString().slice(0, 10)}${ext}`;
}

savePumlBtn.addEventListener('click', () => {
  saveAs({
    data: editor.value,
    suggestedName: defaultName('.puml'),
    mime: 'text/plain',
    ext: '.puml',
    description: 'PlantUML-Quelldatei',
  });
});

savePngBtn.addEventListener('click', async () => {
  setStatus('loading', 'erzeuge PNG…');
  try {
    const res = await fetch('/png', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: editor.value }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    setStatus('ok', 'OK');
    await saveAs({
      data: blob,
      suggestedName: defaultName('.png'),
      mime: 'image/png',
      ext: '.png',
      description: 'PNG-Bild',
    });
  } catch (e) {
    setStatus('error', 'PNG-Fehler');
    errorMessage.textContent = `PNG-Export fehlgeschlagen: ${e.message}`;
    errorLine.textContent = '';
    errorPanel.hidden = false;
  }
});

openBtn.addEventListener('click', () => openFile.click());

openFile.addEventListener('change', async () => {
  const file = openFile.files?.[0];
  if (!file) return;
  editor.value = await file.text();
  openFile.value = '';
  render();
});

const refFilter = document.getElementById('ref-filter');
const refRows = document.querySelectorAll('.ref-table tbody tr');

refFilter?.addEventListener('input', () => {
  const q = refFilter.value.trim().toLowerCase();
  for (const row of refRows) {
    const label = row.cells[0]?.textContent.toLowerCase() ?? '';
    row.classList.toggle('hidden', q !== '' && !label.includes(q));
  }
});

updateLineNumbers();
render();

(async () => {
  try {
    const res = await fetch('/version');
    if (!res.ok) return;
    const { version, buildSha, buildTime } = await res.json();
    const el = document.getElementById('version');
    el.textContent = `v${version} · ${buildSha.slice(0, 7)}`;
    el.title = `Version ${version}\nBuild ${buildSha}\nGebaut: ${buildTime}`;
  } catch {}
})();

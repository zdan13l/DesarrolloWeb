// Helpers basicos para consumir la API REST desde las paginas MPA.

async function apiRequest(path, options) {
  const res = await fetch('/api' + path, Object.assign({
    headers: { 'Content-Type': 'application/json' }
  }, options));
  if (!res.ok) {
    let msg = 'Error ' + res.status;
    try {
      const body = await res.json();
      msg = body.message || body.error || msg;
    } catch (e) { /* respuesta sin cuerpo json */ }
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return res.json();
}

const api = {
  get: (path) => apiRequest(path, { method: 'GET' }),
  post: (path, data) => apiRequest(path, { method: 'POST', body: JSON.stringify(data) }),
  put: (path, data) => apiRequest(path, { method: 'PUT', body: JSON.stringify(data) }),
  del: (path) => apiRequest(path, { method: 'DELETE' }),
};

function showAlert(el, message, type) {
  el.textContent = message;
  el.className = 'alert show ' + type;
}

function toDatetimeLocalValue(instantString) {
  if (!instantString) return '';
  return instantString.substring(0, 16);
}

function fromDatetimeLocalValue(value) {
  if (!value) return null;
  return new Date(value).toISOString();
}

function formatDateTime(instantString) {
  if (!instantString) return '—';
  const d = new Date(instantString);
  return d.toLocaleDateString('es-CO') + ' ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

async function fillSelect(selectEl, items, valueKey, labelFn, placeholder) {
  selectEl.innerHTML = '';
  if (placeholder) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = placeholder;
    selectEl.appendChild(opt);
  }
  items.forEach((item) => {
    const opt = document.createElement('option');
    opt.value = item[valueKey];
    opt.textContent = labelFn(item);
    selectEl.appendChild(opt);
  });
}

const ESTADO_RECURSO_BADGE = {
  DISPONIBLE: 'green',
  PRESTADO: 'yellow',
  BLOQUEADO: 'red',
};

const ESTADO_RESERVA_BADGE = {
  CONFIRMADA: 'blue',
  FINALIZADA: 'green',
  CANCELADA: 'gray',
};

const ESTADO_PRESTAMO_BADGE = {
  ACTIVO: 'blue',
  DEVUELTO: 'green',
};

const SEVERIDAD_BADGE = {
  LEVE: 'green',
  MEDIA: 'yellow',
  CRITICA: 'red',
};

function badge(text, cls) {
  return '<span class="badge ' + cls + '">' + text + '</span>';
}

export function guardarTokenDesdeUrl() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  if (token) {
    localStorage.setItem('token', token);
  }
}

export function obtenerHeaders(conJson = false) {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (conJson) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
}

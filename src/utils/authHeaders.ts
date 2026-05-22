export function guardarTokenDesdeUrl() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  if (token) {
    localStorage.setItem('token', token);
  }
}

export function obtenerToken() {
  return localStorage.getItem('token');
}

export function obtenerHeaders(conJson = false) {
  const token = obtenerToken();
  const headers: Record<string, string> = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (conJson) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
}

export function redirigirALogin() {
  const loginUrl = import.meta.env.VITE_LOGIN_URL || 'http://10.0.40.10/login-admin';
  const redirectUrl = `${window.location.origin}/reportes`;
  const separator = loginUrl.includes('?') ? '&' : '?';

  window.location.href = `${loginUrl}${separator}redirect=${encodeURIComponent(redirectUrl)}`;
}

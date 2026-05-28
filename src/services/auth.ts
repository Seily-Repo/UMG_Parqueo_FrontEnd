export interface AuthUser {
  carne?: string | number;
  nombres?: string;
  apellidos?: string;
  rol?: string;
}

const TOKEN_KEYS = ["token", "jwt", "accessToken", "authToken"];

export const getAuthToken = () => {
  return TOKEN_KEYS.map((key) => localStorage.getItem(key)).find(Boolean) ?? null;
};

export const clearAuth = () => {
  TOKEN_KEYS.forEach((key) => localStorage.removeItem(key));
  localStorage.removeItem("usuarioParqueo");
  localStorage.removeItem("usuarioAdmin");
};

export const decodeJwtPayload = (token: string): any | null => {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const normalizeRole = (role?: string) => String(role ?? "").trim().toUpperCase();

export const getStoredUser = (): AuthUser | null => {
  const userRaw = localStorage.getItem("usuarioParqueo") || localStorage.getItem("usuarioAdmin");
  if (userRaw) {
    try {
      return JSON.parse(userRaw);
    } catch {
      return null;
    }
  }

  const token = getAuthToken();
  const payload = token ? decodeJwtPayload(token) : null;
  const usuario = payload?.usuario ?? payload;
  if (!usuario) return null;

  return {
    carne: usuario.carne ?? usuario.carne_usuario ?? usuario.LR_CARNE,
    nombres: usuario.nombres ?? usuario.nombre ?? "",
    apellidos: usuario.apellidos ?? "",
    rol: usuario.rol,
  };
};

export const isAuthenticated = () => Boolean(getAuthToken());

export const userHasRole = (allowedRoles: string[]) => {
  const userRole = normalizeRole(getStoredUser()?.rol);
  return allowedRoles.map(normalizeRole).includes(userRole);
};

export const persistAuthFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const urlToken = urlParams.get("token");
  if (!urlToken) return;

  localStorage.setItem("token", urlToken);

  const payload = decodeJwtPayload(urlToken);
  const usuario = payload?.usuario ?? payload;
  if (usuario) {
    const userData: AuthUser = {
      carne: usuario.carne ?? usuario.carne_usuario ?? usuario.LR_CARNE,
      nombres: usuario.nombres ?? usuario.nombre ?? "",
      apellidos: usuario.apellidos ?? "",
      rol: usuario.rol,
    };

    if (normalizeRole(usuario.rol) === "ADMINISTRADOR") {
      localStorage.setItem("usuarioAdmin", JSON.stringify(userData));
      localStorage.removeItem("usuarioParqueo");
    } else {
      localStorage.setItem("usuarioParqueo", JSON.stringify(userData));
      localStorage.removeItem("usuarioAdmin");
    }
  }

  window.history.replaceState({}, document.title, window.location.pathname);
};

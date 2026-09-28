import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = 'authToken';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// True if a token exists and hasn't expired. Expired/invalid tokens are cleared.
export function isLoggedIn() {
  const token = getToken();
  if (!token) return false;
  try {
    const { exp } = jwtDecode(token);
    if (exp && Date.now() >= exp * 1000) {
      clearToken();
      return false;
    }
    return true;
  } catch {
    clearToken();
    return false;
  }
}

// Web-only appStorage — no Capacitor dependencies, uses localStorage

export const AUTH_TOKEN_KEY = 'finly_token';
export const AUTH_USER_KEY = 'finly_user';

export function isNativeApp() {
    return false;
}

export async function getStoredValue(key) {
    return localStorage.getItem(key);
}

export async function setStoredValue(key, value) {
    localStorage.setItem(key, value);
}

export async function removeStoredValue(key) {
    localStorage.removeItem(key);
}

export async function getStoredJson(key, fallback = null) {
    const value = await getStoredValue(key);
    if (!value) return fallback;
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
}

export async function setStoredJson(key, value) {
    await setStoredValue(key, JSON.stringify(value));
}

export async function clearAuthStorage() {
    await Promise.all([
        removeStoredValue(AUTH_TOKEN_KEY),
        removeStoredValue(AUTH_USER_KEY),
    ]);
}

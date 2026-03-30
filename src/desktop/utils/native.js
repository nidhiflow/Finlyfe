// Web-only native.js — no Capacitor dependencies
// For the web app, all native features are no-ops.

export const MOBILE_APP_SCHEME = 'finly';
export const NATIVE_APP_API_BASE = 'https://www.nidhiflow.in/api';

export function isNativeApp() {
    return false;
}

export function getAppScheme() {
    return MOBILE_APP_SCHEME;
}

export function getApiBaseUrl() {
    const envBase = import.meta.env.VITE_API_BASE_URL?.trim();
    if (envBase) {
        return envBase.replace(/\/+$/, '');
    }
    return '/api';
}

export async function openExternalUrl(url) {
    if (url) window.location.href = url;
}

export async function closeExternalBrowser() {}

export async function applyNativeWindowStyling() {}

export async function hideNativeSplash() {}

export async function getNativeLaunchUrl() {
    return '';
}

export function addNativeAppUrlListener() {
    return () => {};
}

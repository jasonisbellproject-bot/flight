// Token management utilities

const TOKEN_KEY = 'docgen_token';

export function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
}

export interface UserPayload {
    id: string;
    email: string;
    role: 'user' | 'admin';
}

export function getUser(): UserPayload | null {
    const token = getToken();
    if (!token) return null;
    try {
        // Decode JWT payload (base64)
        const base64 = token.split('.')[1];
        const payload = JSON.parse(atob(base64));
        // Check expiry
        if (payload.exp && Date.now() / 1000 > payload.exp) {
            removeToken();
            return null;
        }
        return { id: payload.id, email: payload.email, role: payload.role };
    } catch {
        removeToken();
        return null;
    }
}

export function authHeaders(): Record<string, string> {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

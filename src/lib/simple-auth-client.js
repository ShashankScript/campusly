// Simple auth client as fallback for Better Auth
export const simpleAuthClient = {
    async signUp({ email, password, name, role }) {
        try {
            const response = await fetch('/api/auth/simple-register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password, name, role })
            });

            const data = await response.json();
            
            if (data.success) {
                return { data: { user: data.user }, error: null };
            } else {
                return { data: null, error: { message: data.error } };
            }
        } catch (error) {
            return { data: null, error: { message: error.message } };
        }
    },

    async signIn({ email, password }) {
        try {
            const response = await fetch('/api/auth/simple-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (data.success) {
                return { data: { user: data.user }, error: null };
            } else {
                return { data: null, error: { message: data.error } };
            }
        } catch (error) {
            return { data: null, error: { message: error.message } };
        }
    },

    async signOut() {
        try {
            const response = await fetch('/api/auth/simple-logout', {
                method: 'POST',
                credentials: 'include'
            });

            const data = await response.json();
            return { success: data.success, error: data.success ? null : data.error };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async getSession() {
        try {
            const response = await fetch('/api/auth/simple-session', {
                credentials: 'include'
            });

            const data = await response.json();
            
            if (data.success && data.authenticated) {
                return { user: data.user };
            } else {
                return null;
            }
        } catch (error) {
            console.error('Session error:', error);
            return null;
        }
    }
};
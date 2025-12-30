
'use client';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useResourceStore } from '@/store/resource-store';
import { useSession } from '@/lib/auth-client';

export default function AppStateProvider({ children }) {
    const { login, logout, isAuthenticated } = useAuthStore();
    const { initializeData } = useResourceStore();
    const { data: session } = useSession();

    useEffect(() => {
        if (session?.user) {
            login({
                id: session.user.id,
                name: session.user.name,
                email: session.user.email,
                role: session.user.role || 'student',
                image: session.user.image
            });
        } else {
            // logout(); // Optional: might cause loops if not careful
        }
    }, [session, login, logout]);

    useEffect(() => {
        if (isAuthenticated) {
            initializeData(isAuthenticated);
        }
    }, [isAuthenticated, initializeData]);

    return <>{children}</>;
}

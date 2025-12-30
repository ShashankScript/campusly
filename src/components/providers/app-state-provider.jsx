
'use client';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useResourceStore } from '@/store/resource-store';


export default function AppStateProvider({ children }) {
    const { login, logout, isAuthenticated } = useAuthStore();
    const { initializeData } = useResourceStore();

    useEffect(() => {
        if (isAuthenticated) {
            initializeData(isAuthenticated);
        }
    }, [isAuthenticated, initializeData]);

    return <>{children}</>;
}

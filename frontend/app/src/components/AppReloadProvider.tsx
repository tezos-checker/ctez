'use client';

import { createContext, useCallback, useContext, useState } from 'react';

interface AppReloadContextValue {
    reloadApp: () => void;
}

const AppReloadContext = createContext<AppReloadContextValue | undefined>(undefined);

export const AppReloadProvider: React.FC<React.PropsWithChildren<Record<string, unknown>>> = ({ children }) => {
    const [appKey, setAppKey] = useState(0);

    const reloadApp = useCallback(() => {
        console.log('Data reloading...');
        setAppKey(prev => prev + 1)
    }, []);

    return (
        <AppReloadContext.Provider key={appKey} value={{ reloadApp }}>
            {children}
        </AppReloadContext.Provider>
    );
};

export const useAppReload = (): AppReloadContextValue => {
    const context = useContext(AppReloadContext);
    if (!context) {
        throw new Error('useAppReload must be used within an AppReloadProvider');
    }
    return context;
};

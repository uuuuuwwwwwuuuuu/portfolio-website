import { createStore } from 'zustand/vanilla';

interface ThemeState {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;

    closedThemePicker: boolean;
    setClosedThemePicker: (closedThemePicker: boolean) => void;
}

export const systemStore = createStore<ThemeState>(set => {
    return {
        theme: 'dark',
        setTheme: (theme: 'light' | 'dark') => set({ theme }),

        closedThemePicker: false,
        setClosedThemePicker: (closedThemePicker: boolean) => set({ closedThemePicker }),
    };
});

import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";
import { useColorScheme } from "react-native";

import { getProfile, setProfileTheme } from "@/db/profile";
import { DARK, LIGHT, ThemeTokens } from "@/theme/tokens";

export type ThemePreference = "light" | "dark" | "system";

type AppThemeContextValue = {
    preference: ThemePreference;
    scheme: "light" | "dark";
    colors: ThemeTokens;
    setPreference: (preference: ThemePreference) => void;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

const isThemePreference = (value: string | undefined): value is ThemePreference =>
    value === "light" || value === "dark" || value === "system";

export const AppThemeProvider = ({ children }: { children: ReactNode }) => {
    const systemScheme = useColorScheme();
    const [preference, setPreferenceState] = useState<ThemePreference>(() => {
        const stored = getProfile()?.theme;
        return isThemePreference(stored) ? stored : "system";
    });

    const scheme: "light" | "dark" =
        preference === "system" ? (systemScheme === "dark" ? "dark" : "light") : preference;
    const colors = scheme === "dark" ? DARK : LIGHT;

    const setPreference = (next: ThemePreference) => {
        setPreferenceState(next);
        if (getProfile()) setProfileTheme(next);
    };

    return (
        <AppThemeContext.Provider value={{ preference, scheme, colors, setPreference }}>
            {children}
        </AppThemeContext.Provider>
    );
};

export const useAppTheme = () => {
    const ctx = useContext(AppThemeContext);
    if (!ctx) throw new Error("useAppTheme must be used within AppThemeProvider");
    return ctx;
};

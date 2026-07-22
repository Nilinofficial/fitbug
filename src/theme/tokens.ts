export type ThemeTokens = {
    background: string;
    surface: string;
    surfaceMuted: string;
    navBackground: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    tintOrangeBg: string;
    tintBlueBg: string;
    gradientStart: string;
    gradientEnd: string;
};

export const LIGHT: ThemeTokens = {
    background: "#F5F6FA",
    surface: "#ffffff",
    surfaceMuted: "#EDEEF2",
    navBackground: "#ffffff",
    textPrimary: "#20242d",
    textSecondary: "#9599a5",
    border: "#E4E6ED",
    tintOrangeBg: "#FFF1E6",
    tintBlueBg: "#EAF1FE",
    gradientStart: "#F3EFFE",
    gradientEnd: "#EAF2FE",
};

export const DARK: ThemeTokens = {
    background: "#121316",
    surface: "#1C1E22",
    surfaceMuted: "#26282D",
    navBackground: "#2C2F36",
    textPrimary: "#F5F6FA",
    textSecondary: "#A0A4B0",
    border: "#33353B",
    tintOrangeBg: "rgba(226,112,58,0.18)",
    tintBlueBg: "rgba(18,99,223,0.18)",
    gradientStart: "#241F35",
    gradientEnd: "#1B2436",
};

const ORANGE_TINTS = new Set(["#FFF1E6"]);
const BLUE_TINTS = new Set(["#EAF1FE", "#EAF1FB", "#E3EBFD"]);

/**
 * Maps a known light-mode pastel icon-badge background to its themed
 * equivalent. Falls back to the input hex for anything not recognized
 * (e.g. colors that are intentionally constant across themes).
 */
export const resolveTintBg = (hex: string, colors: ThemeTokens): string => {
    if (ORANGE_TINTS.has(hex)) return colors.tintOrangeBg;
    if (BLUE_TINTS.has(hex)) return colors.tintBlueBg;
    return hex;
};

import { createContext, useContext, useEffect, useState } from "react"

const initialState = {
    theme: "system",
    setTheme: () => null,
    primaryColor: '#f97316',
    setPrimaryColor: () => null,
    secondaryColor: '#6366f1',
    setSecondaryColor: () => null,
}

const ThemeContext = createContext(initialState)

export function ThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = "vite-ui-theme",
    ...props
}) {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem(storageKey) || defaultTheme
    })

    const [primaryColor, setPrimaryColor] = useState(() => localStorage.getItem('theme-primary') || '#f97316')
    const [secondaryColor, setSecondaryColor] = useState(() => localStorage.getItem('theme-secondary') || '#6366f1')

    const hexToHslComponents = (hex) => {
        let r = 0, g = 0, b = 0;
        if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16); g = parseInt(hex[2] + hex[2], 16); b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length === 7) {
            r = parseInt(hex.slice(1, 3), 16); g = parseInt(hex.slice(3, 5), 16); b = parseInt(hex.slice(5, 7), 16);
        }
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max === min) h = s = 0;
        else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return `${(h * 360).toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`;
    };

    useEffect(() => {
        const root = window.document.documentElement
        root.classList.remove("light", "dark")

        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
                .matches
                ? "dark"
                : "light"
            root.classList.add(systemTheme)
        } else {
            root.classList.add(theme)
        }
    }, [theme])

    useEffect(() => {
        const root = window.document.documentElement;
        root.style.setProperty('--primary', hexToHslComponents(primaryColor));
        root.style.setProperty('--ring', hexToHslComponents(primaryColor));
        root.style.setProperty('--secondary', hexToHslComponents(secondaryColor));
        localStorage.setItem('theme-primary', primaryColor);
        localStorage.setItem('theme-secondary', secondaryColor);
    }, [primaryColor, secondaryColor]);

    const value = {
        theme,
        setTheme: (theme) => {
            localStorage.setItem(storageKey, theme)
            setTheme(theme)
        },
        primaryColor,
        setPrimaryColor,
        secondaryColor,
        setSecondaryColor,
    }

    return (
        <ThemeContext.Provider {...props} value={value}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeContext)

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider")

    return context
}

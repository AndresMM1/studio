"use client"

import * as React from "react"

interface ThemeContextProps {
    theme: "light" | "dark"
    toggleTheme: () => void
}

const ThemeContext = React.createContext<ThemeContextProps | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = React.useState<"light" | "dark">(() => {
        if (globalThis.window === undefined) return "light"
        const stored = localStorage.getItem("theme") as "light" | "dark" | null
        return stored ?? "light"
    })

    React.useEffect(() => {
        const root = document.documentElement
        if (theme === "dark") {
            root.classList.add("dark")
        } else {
            root.classList.remove("dark")
        }
        localStorage.setItem("theme", theme)
    }, [theme])

    const toggleTheme = React.useCallback(() => {
        setTheme(prev => (prev === "dark" ? "light" : "dark"))
    }, [])

    const value = React.useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => {
    const ctx = React.useContext(ThemeContext)
    if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
    return ctx
}

import { render, screen, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ThemeProvider, useTheme } from '@/contexts/theme-context'

describe('ThemeContext', () => {
    const TestComponent = () => {
        const { theme, toggleTheme } = useTheme()
        return (
            <div>
                <div>Theme: {theme}</div>
                <button onClick={toggleTheme}>Toggle Theme</button>
            </div>
        )
    }

    it('renders and switches themes', () => {
        render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>
        )

        expect(screen.getByText('Theme: light')).toBeInTheDocument()

        act(() => {
            screen.getByText('Toggle Theme').click()
        })
        expect(screen.getByText('Theme: dark')).toBeInTheDocument()
        expect(document.documentElement.classList.contains('dark')).toBe(true)

        act(() => {
            screen.getByText('Toggle Theme').click()
        })
        expect(screen.getByText('Theme: light')).toBeInTheDocument()
        expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
})

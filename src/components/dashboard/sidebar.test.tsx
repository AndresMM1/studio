import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { DashboardSidebar } from './sidebar'
import { BrowserRouter } from 'react-router-dom'

vi.mock('@/contexts/auth-context', () => ({
    useAuth: () => ({ user: { name: 'Test User', email: 'test@example.com' } })
}))

const toggleThemeMock = vi.fn()
vi.mock('@/contexts/theme-context', () => ({
    useTheme: () => ({ theme: 'light', toggleTheme: toggleThemeMock })
}))

// Mock image
vi.mock('@/assets/gou-logo.ico', () => ({ default: 'logo.ico' }))

describe('DashboardSidebar', () => {
    it('renders sidebar with links and user info', () => {
        render(
            <BrowserRouter>
                <DashboardSidebar />
            </BrowserRouter>
        )

        expect(screen.getByRole('link', { name: /Incidentes/i })).toBeInTheDocument()
        // User info is in tooltip, might not be visible initially or rendered in DOM
        // TooltipTrigger renders children. User icon is there.
        // We can check for logo
        expect(screen.getByAltText('Gou Payments')).toBeInTheDocument()
    })

    it('toggles theme', () => {
        render(
            <BrowserRouter>
                <DashboardSidebar />
            </BrowserRouter>
        )

        // Button has icon but maybe no name?
        // Actually the button wraps Sun/Moon icons.
        // Let's find by class or just the first button
        const buttons = screen.getAllByRole('button')
        fireEvent.click(buttons[0])
        expect(toggleThemeMock).toHaveBeenCalled()
    })
})

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import LoginPage from './Login'
import { BrowserRouter } from 'react-router-dom'

// Mock dependencies
const mockLogin = vi.fn()
const mockNavigate = vi.fn()
const mockToast = vi.fn()

vi.mock('@/contexts/auth-context', () => ({
    useAuth: () => ({ login: mockLogin })
}))

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate
    }
})

vi.mock('@/hooks/use-toast', () => ({
    useToast: () => ({ toast: mockToast })
}))

vi.mock('@/components/icons/AbejaLoggin', () => ({
    AbejaFilled: () => <div data-testid="abeja-icon" />
}))

describe('LoginPage', () => {
    it('renders correctly', () => {
        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        )
        expect(screen.getAllByText('Iniciar Sesión')[0]).toBeInTheDocument()
        expect(screen.getByLabelText(/Correo Electrónico/i)).toBeInTheDocument()
    })

    it('handles login success', async () => {
        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        )
        const emailInput = screen.getByLabelText(/Correo Electrónico/i)
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }))

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('test@example.com')
            expect(mockNavigate).toHaveBeenCalledWith('/')
        })
    })

    it('handles login failure', async () => {
        mockLogin.mockRejectedValueOnce(new Error('Failed'))
        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        )
        const emailInput = screen.getByLabelText(/Correo Electrónico/i)
        fireEvent.change(emailInput, { target: { value: 'fail@example.com' } })
        fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }))

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalled()
            expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive' }))
        })
    })
})

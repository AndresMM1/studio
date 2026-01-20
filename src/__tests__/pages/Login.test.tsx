import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import LoginPage from '@/pages/Login'
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

    it('renders login form elements', () => {
        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        )
        
        expect(screen.getByTestId('abeja-icon')).toBeInTheDocument()
        expect(screen.getByLabelText(/Correo Electrónico/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Iniciar Sesión/i })).toBeInTheDocument()
    })

    it('handles login success', async () => {
        mockLogin.mockResolvedValueOnce(undefined)
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

    it('navigates to dashboard after successful login', async () => {
        mockLogin.mockResolvedValueOnce(undefined)
        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        )
        const emailInput = screen.getByLabelText(/Correo Electrónico/i)
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }))

        await waitFor(() => {
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

    it('displays error message on login failure', async () => {
        mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'))
        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        )
        const emailInput = screen.getByLabelText(/Correo Electrónico/i)
        fireEvent.change(emailInput, { target: { value: 'invalid@example.com' } })
        fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }))

        await waitFor(() => {
            expect(mockToast).toHaveBeenCalled()
        })
    })

    it('allows email input to be changed', () => {
        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        )
        const emailInput = screen.getByLabelText(/Correo Electrónico/i) as HTMLInputElement
        
        fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
        expect(emailInput.value).toBe('user@example.com')
    })

    it('renders abeja login icon', () => {
        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        )
        
        expect(screen.getByTestId('abeja-icon')).toBeInTheDocument()
    })

    it('has submit button in form', () => {
        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        )
        
        const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/i })
        expect(submitButton).toBeInTheDocument()
        expect(submitButton).toHaveAttribute('type', 'submit')
    })
})

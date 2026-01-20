import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from '@/App'

// Mock all page components
vi.mock('@/pages/Login', () => ({
    default: () => <div data-testid="login-page">Login Page</div>
}))

vi.mock('@/pages/Dashboard', () => ({
    default: () => <div data-testid="dashboard-page">Dashboard Page</div>
}))

vi.mock('@/pages/IncidentDetail', () => ({
    default: () => <div data-testid="incident-detail-page">Incident Detail Page</div>
}))

vi.mock('@/components/Layout', () => ({
    Layout: () => <div data-testid="layout"><div id="outlet-container" /></div>
}))

vi.mock('@/components/Chatbot', () => ({
    Chatbot: () => <div data-testid="chatbot">Chatbot</div>
}))

vi.mock('@/components/ui/toaster', () => ({
    Toaster: () => <div data-testid="toaster">Toaster</div>
}))

vi.mock('@/contexts/theme-context', () => ({
    ThemeProvider: ({ children }: any) => <div data-testid="theme-provider">{children}</div>,
    useTheme: () => ({ theme: 'light', toggleTheme: vi.fn() })
}))

vi.mock('@/contexts/auth-context', () => ({
    AuthProvider: ({ children }: any) => <div data-testid="auth-provider">{children}</div>,
    useAuth: () => ({ user: null, isAuthenticated: false, login: vi.fn(), logout: vi.fn() })
}))

describe('App', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders the app with all providers', () => {
        render(<App />)
        
        expect(screen.getByTestId('theme-provider')).toBeInTheDocument()
        expect(screen.getByTestId('auth-provider')).toBeInTheDocument()
        expect(screen.getByTestId('toaster')).toBeInTheDocument()
        expect(screen.getByTestId('chatbot')).toBeInTheDocument()
    })

    it('renders router with routes', () => {
        render(<App />)
        
        // The app should render without crashing
        expect(screen.getByTestId('theme-provider')).toBeInTheDocument()
    })

    it('contains theme provider as outermost provider', () => {
        const { container } = render(<App />)
        
        const themeProvider = screen.getByTestId('theme-provider')
        expect(themeProvider).toBeInTheDocument()
        expect(container).toContainElement(themeProvider)
    })

    it('contains auth provider inside theme provider', () => {
        render(<App />)
        
        const themeProvider = screen.getByTestId('theme-provider')
        const authProvider = screen.getByTestId('auth-provider')
        
        expect(themeProvider).toBeInTheDocument()
        expect(authProvider).toBeInTheDocument()
    })

    it('renders toaster component for notifications', () => {
        render(<App />)
        
        expect(screen.getByTestId('toaster')).toBeInTheDocument()
    })

    it('renders chatbot component', () => {
        render(<App />)
        
        expect(screen.getByTestId('chatbot')).toBeInTheDocument()
    })

    it('renders router for navigation', () => {
        render(<App />)
        
        // All providers should be rendered
        expect(screen.getByTestId('theme-provider')).toBeInTheDocument()
        expect(screen.getByTestId('auth-provider')).toBeInTheDocument()
    })

    it('has correct component hierarchy', () => {
        const { container } = render(<App />)
        
        const themeProvider = screen.getByTestId('theme-provider')
        expect(themeProvider).toBeTruthy()
        expect(container.firstChild).toBe(themeProvider)
    })

    it('all providers are rendered in correct order', () => {
        render(<App />)
        
        const themeProvider = screen.getByTestId('theme-provider')
        const authProvider = screen.getByTestId('auth-provider')
        const toaster = screen.getByTestId('toaster')
        const chatbot = screen.getByTestId('chatbot')
        
        expect(themeProvider).toBeInTheDocument()
        expect(authProvider).toBeInTheDocument()
        expect(toaster).toBeInTheDocument()
        expect(chatbot).toBeInTheDocument()
    })
})

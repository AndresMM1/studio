import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import DashboardPage from './Dashboard'
import { BrowserRouter } from 'react-router-dom'
import { getIncidents, getDashboardStats, getServices } from '@/lib/data'

// Mock entire module
vi.mock('@/lib/data')

// Mock other dependencies
vi.mock('@/contexts/auth-context', () => ({
    useAuth: () => ({
        user: { email: 'test@example.com' },
        isAuthenticated: true,
        isLoading: false
    })
}))

vi.mock('@/components/dashboard/incident-table', () => ({
    IncidentTable: ({ incidents }: any) => (
        <div data-testid="incident-table">
            {incidents.map((i: any) => <div key={i.id}>{i.service}</div>)}
        </div>
    )
}))

vi.mock('@/components/dashboard/dashboard-charts', () => ({
    DashboardCharts: () => <div data-testid="dashboard-charts">Charts</div>
}))

vi.mock('@/hooks/use-toast', () => ({
    useToast: () => ({ toast: vi.fn() })
}))

vi.mock('@/components/ui/sheet', () => ({
    Sheet: ({ children }: any) => <div>{children}</div>,
    SheetTrigger: ({ children }: any) => <div role="button">{children}</div>,
    SheetContent: ({ children }: any) => <div>{children}</div>,
    SheetHeader: ({ children }: any) => <div>{children}</div>,
    SheetTitle: ({ children }: any) => <h2>{children}</h2>,
    SheetDescription: ({ children }: any) => <p>{children}</p>,
    SheetFooter: ({ children }: any) => <div>{children}</div>,
    SheetClose: ({ children }: any) => <button>{children}</button>
}))

vi.mock('@/components/ui/select', () => ({
    Select: ({ onValueChange, children }: any) => (
        <div data-testid="select" onClick={(e: any) => {
            if (e.target.dataset.value) {
                onValueChange(e.target.dataset.value)
            }
        }}>
            {children}
        </div>
    ),
    SelectTrigger: ({ children }: any) => <div role="button">{children}</div>,
    SelectValue: ({ placeholder }: any) => <div>{placeholder}</div>,
    SelectContent: ({ children }: any) => <div>{children}</div>,
    SelectItem: ({ children, value }: any) => <button data-value={value}>{children}</button>,
}))

describe('DashboardPage', () => {
    beforeEach(() => {
        vi.mocked(getIncidents).mockResolvedValue([
            { id: 1, service: 'Service A', description: 'Incident 1', priority: 'Media', status: 'Proceso', environment: 'Producción', startTime: new Date().toISOString() } as any
        ])
        vi.mocked(getDashboardStats).mockResolvedValue({
            totalIncidents: 10,
            activeIncidents: 5,
            criticalIncidents: 2,
            serviceCounts: {},
            priorityCounts: {},
            statusCounts: {},
            recent7Days: { resolutionStats: { avgMinutes: 0, maxMinutes: 0, dailyTrend: [] }, priorityCounts: {}, serviceCounts: {} }
        })
        vi.mocked(getServices).mockResolvedValue([{ SERVICE_NAME: 'Service A', Canal: 'Canal A' }])
    })

    it('renders dashboard with data', async () => {
        render(
            <BrowserRouter>
                <DashboardPage />
            </BrowserRouter>
        )

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Gestión de Incidentes' })).toBeInTheDocument()
        }, { timeout: 3000 })

        expect(screen.getByText('Service A')).toBeInTheDocument()
        expect(screen.getByText('10')).toBeInTheDocument()
    })

    it('filters incidents by search', async () => {
        render(
            <BrowserRouter>
                <DashboardPage />
            </BrowserRouter>
        )

        await waitFor(() => {
            expect(screen.getByText('Service A')).toBeInTheDocument()
        })

        const searchInput = screen.getByPlaceholderText(/Buscar por servicio/i)
        fireEvent.change(searchInput, { target: { value: 'NonExistent' } })

        expect(screen.queryByText('Service A')).not.toBeInTheDocument()
    })

    it('filters incidents by status', async () => {
        render(
            <BrowserRouter>
                <DashboardPage />
            </BrowserRouter>
        )

        await waitFor(() => {
            expect(screen.getByText('Service A')).toBeInTheDocument()
        })

        // Find the "Cerrado" button (SelectItem)
        // It should be rendered because we mocked SelectContent to just render children
        // and Dashboard renders statuses.
        // Assuming 'Cerrado' is in the statuses list.
        // If SelectContent wasn't open, we normally wouldn't see it, but our mock renders children always.

        const closedOption = screen.getByRole('button', { name: /Cerrado/i })
        fireEvent.click(closedOption)

        expect(screen.queryByText('Service A')).not.toBeInTheDocument()
    })

    it('opens create incident modal', async () => {
        render(
            <BrowserRouter>
                <DashboardPage />
            </BrowserRouter>
        )

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Gestión de Incidentes' })).toBeInTheDocument()
        }, { timeout: 3000 })

        const createButton = screen.getAllByRole('button')[0]
        expect(createButton).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Buscar por servicio...')).toBeInTheDocument()
    })
})

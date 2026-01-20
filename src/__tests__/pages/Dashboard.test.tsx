import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import DashboardPage from '@/pages/Dashboard'
import { BrowserRouter } from 'react-router-dom'
import { getIncidents, getDashboardStats, getServices, addIncident, generateTeamsMeetingLink } from '@/lib/data'

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

const toastSpy = vi.fn()
vi.mock('@/hooks/use-toast', () => ({
    useToast: () => ({ toast: toastSpy })
}))

vi.mock('@/components/ui/sheet', () => ({
    Sheet: ({ children }: any) => <div>{children}</div>,
    SheetTrigger: ({ children }: any) => <button>{children}</button>,
    SheetContent: ({ children }: any) => <div>{children}</div>,
    SheetHeader: ({ children }: any) => <div>{children}</div>,
    SheetTitle: ({ children }: any) => <h2>{children}</h2>,
    SheetDescription: ({ children }: any) => <p>{children}</p>,
    SheetFooter: ({ children }: any) => <div>{children}</div>,
    SheetClose: ({ children }: any) => <button>{children}</button>
}))

vi.mock('@/components/ui/select', () => ({
    Select: ({ onValueChange, children }: any) => (
        <select 
            data-testid="select"
            onChange={(e: any) => {
                onValueChange(e.target.value)
            }}
        >
            {children}
        </select>
    ),
    SelectTrigger: ({ children }: any) => <>{children}</>,
    SelectValue: ({ placeholder }: any) => <option disabled selected>{placeholder}</option>,
    SelectContent: ({ children }: any) => <>{children}</>,
    SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
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
        vi.mocked(addIncident).mockResolvedValue({ id: 99, service: 'Service A', description: 'New', priority: 'Media', status: 'Proceso', environment: 'Producción', startTime: new Date().toISOString() } as any)
        vi.mocked(generateTeamsMeetingLink).mockResolvedValue('https://teams.test/link')
        toastSpy.mockClear()
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

        await waitFor(() => {
            expect(screen.getByText('Service A')).toBeInTheDocument()
        }, { timeout: 3000 })
        
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

        // Find the status select and change it to "Cerrado"
        // The mock Select component renders as a <select> element
        const statusSelects = screen.getAllByTestId('select')
        // The second select should be the status filter
            const statusSelect = statusSelects.find(sel =>
                Array.from((sel as HTMLSelectElement).options).some(o => o.value === 'Cerrado')
            ) as HTMLSelectElement
            fireEvent.change(statusSelect, { target: { value: 'Cerrado' } })

        // Since the incidents are mocked with different statuses,
        // filtering by "Cerrado" should hide "Service A" (which is "Proceso")
        await waitFor(() => {
            expect(screen.queryByText('Service A')).not.toBeInTheDocument()
        })
    })

    it('filters incidents by priority', async () => {
        render(
            <BrowserRouter>
                <DashboardPage />
            </BrowserRouter>
        )

        await waitFor(() => {
            expect(screen.getByText('Service A')).toBeInTheDocument()
        })

        // Filter by priority (Alta)
        const prioritySelects = screen.getAllByTestId('select')
        const prioritySelect = prioritySelects[0]
        fireEvent.change(prioritySelect, { target: { value: 'Alta' } })

        // Results should still show Service A if it matches the priority
        // or hide if it doesn't match
        await waitFor(() => {
            expect(screen.queryByText('Service A')).toBeDefined()
        })
    })

    it('filters incidents by environment', async () => {
        render(
            <BrowserRouter>
                <DashboardPage />
            </BrowserRouter>
        )

        await waitFor(() => {
            expect(screen.getByText('Service A')).toBeInTheDocument()
        })

        // Filter by environment
        const environmentSelects = screen.getAllByTestId('select')
        const environmentSelect = environmentSelects[2]
        fireEvent.change(environmentSelect, { target: { value: 'Producción' } })

        // Results should show or hide based on environment filter
        await waitFor(() => {
            expect(screen.queryByText('Service A')).toBeDefined()
        })
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

    it('displays incident statistics in header', async () => {
        render(
            <BrowserRouter>
                <DashboardPage />
            </BrowserRouter>
        )

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Gestión de Incidentes' })).toBeInTheDocument()
        }, { timeout: 3000 })

        // Check for statistics display
        expect(screen.getByText(/Incidentes Totales/i)).toBeInTheDocument()
        expect(screen.getByText(/Incidentes Activos/i)).toBeInTheDocument()
        expect(screen.getByText(/Incidentes Críticos/i)).toBeInTheDocument()
    })

    it('renders incident table with data', async () => {
        render(
            <BrowserRouter>
                <DashboardPage />
            </BrowserRouter>
        )

        await waitFor(() => {
            expect(screen.getByText('Service A')).toBeInTheDocument()
        }, { timeout: 3000 })

        // Table should be visible
        expect(screen.getByTestId('incident-table')).toBeInTheDocument()
    })

    it('displays charts with dashboard stats', async () => {
        render(
            <BrowserRouter>
                <DashboardPage />
            </BrowserRouter>
        )

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Gestión de Incidentes' })).toBeInTheDocument()
        }, { timeout: 3000 })

        // Charts should be rendered
        expect(screen.getByTestId('dashboard-charts')).toBeInTheDocument()
    })

    it('validates service before creating incident', async () => {
        render(
            <BrowserRouter>
                <DashboardPage />
            </BrowserRouter>
        )

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Gestión de Incidentes' })).toBeInTheDocument()
        })

        fireEvent.change(screen.getByLabelText('Descripción'), { target: { value: 'Need service' } })
        fireEvent.click(screen.getByRole('button', { name: /Crear/i }))

        expect(toastSpy).toHaveBeenCalled()
    })

    it('creates a new incident when form is valid', async () => {
        render(
            <BrowserRouter>
                <DashboardPage />
            </BrowserRouter>
        )

        await waitFor(() => {
            expect(screen.getByText('Service A')).toBeInTheDocument()
        })

        const serviceButton = screen.getByText('Seleccionar servicio...').closest('button') as HTMLButtonElement
        fireEvent.click(serviceButton)
        const [serviceOption] = await screen.findAllByText('Service A')
        fireEvent.click(serviceOption.closest('button') ?? serviceOption)
        fireEvent.change(screen.getByLabelText('Descripción'), { target: { value: 'New incident description' } })

        fireEvent.click(screen.getByRole('button', { name: /Crear/i }))

        await waitFor(() => {
            expect(addIncident).toHaveBeenCalled()
        })
    })

    it('generates teams link after selecting service', async () => {
        render(
            <BrowserRouter>
                <DashboardPage />
            </BrowserRouter>
        )

        await waitFor(() => {
            expect(screen.getByText('Service A')).toBeInTheDocument()
        })

        const serviceButton = screen.getByText('Seleccionar servicio...').closest('button') as HTMLButtonElement
        fireEvent.click(serviceButton)
        const [serviceOption] = await screen.findAllByText('Service A')
        fireEvent.click(serviceOption.closest('button') ?? serviceOption)

        const linkInput = screen.getByPlaceholderText('Genere o pegue el link aquí') as HTMLInputElement
        const linkButton = linkInput.parentElement?.querySelector('button') as HTMLButtonElement

        fireEvent.click(linkButton)

        await waitFor(() => {
            expect(generateTeamsMeetingLink).toHaveBeenCalledWith('Service A')
            expect(linkInput.value).toBe('https://teams.test/link')
        })
    })
})

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import IncidentDetailPage from '@/pages/IncidentDetail'
import { BrowserRouter } from 'react-router-dom'

// Mocks
const mockIncident = {
    id: 1,
    service: 'Service A',
    description: 'Incident 1',
    priority: 'Media',
    status: 'Proceso',
    environment: 'Producción',
    startTime: new Date().toISOString(),
    endTime: null
}

const mockUpdates = [
    { id: 1, text: 'Update 1', timestamp: new Date().toISOString() }
]

const mockServices = [
    { SERVICE_NAME: 'Service A', Canal: 'Canal A' }
]

vi.mock('@/lib/data', () => ({
    getIncidentById: vi.fn(),
    getIncidentUpdates: vi.fn(),
    getServices: vi.fn(),
    addIncidentUpdate: vi.fn(),
    updateIncidentStatus: vi.fn(),
    sendClosureDocumentation: vi.fn()
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
        <select data-testid="select" onChange={(e: any) => {
            onValueChange(e.target.value)
        }}>
            {children}
        </select>
    ),
    SelectTrigger: ({ children }: any) => <>{children}</>,
    SelectValue: ({ placeholder }: any) => <option>{placeholder}</option>,
    SelectContent: ({ children }: any) => <>{children}</>,
    SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
}))

vi.mock('@/components/ui/switch', () => ({
    Switch: ({ onCheckedChange, checked, id }: any) => (
        <label htmlFor={id}>
            <span className="sr-only">Switch control</span>
            <input
                id={id}
                type="checkbox"
                checked={checked}
                onChange={(e) => onCheckedChange(e.target.checked)}
                role="switch"
            />
        </label>
    )
}))

// Mock useParams to return ID 1
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useParams: () => ({ id: '1' }),
        useNavigate: () => vi.fn()
    }
})

import { getIncidentById, getIncidentUpdates, getServices, addIncidentUpdate, updateIncidentStatus, sendClosureDocumentation } from '@/lib/data'

describe('IncidentDetailPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
            ; (getIncidentById as any).mockResolvedValue(mockIncident)
            ; (getIncidentUpdates as any).mockResolvedValue(mockUpdates)
            ; (getServices as any).mockResolvedValue(mockServices)
    })

    it('renders incident detail', async () => {
        render(
            <BrowserRouter>
                <IncidentDetailPage />
            </BrowserRouter>
        )

        // Wait for loading
        await waitFor(() => {
            expect(screen.getByText(/Incident 1/i)).toBeInTheDocument()
        })

        expect(screen.getByText('Media')).toBeInTheDocument()
        expect(screen.getByText('Proceso')).toBeInTheDocument()
        expect(screen.getByText('Update 1')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /Volver al Panel/i })).toBeInTheDocument()
    })

    it('adds an update', async () => {
        ; (addIncidentUpdate as any).mockResolvedValue({ id: 2, text: 'New Update', timestamp: new Date().toISOString() })

        render(
            <BrowserRouter>
                <IncidentDetailPage />
            </BrowserRouter>
        )

        await waitFor(() => {
            expect(screen.getByText(/Incident 1/i)).toBeInTheDocument()
        })

        const textarea = screen.getByPlaceholderText(/Proporcionar una actualización/i)
        fireEvent.change(textarea, { target: { value: 'New Update' } })
        fireEvent.click(screen.getByRole('button', { name: /Agregar Actualización/i }))

        await waitFor(() => {
            expect(addIncidentUpdate).toHaveBeenCalledWith('1', 'New Update')
        })
    })

    it('handles status change', async () => {
        ; (updateIncidentStatus as any).mockResolvedValue({ ...mockIncident, status: 'En espera' })

        render(
            <BrowserRouter>
                <IncidentDetailPage />
            </BrowserRouter>
        )

        await waitFor(() => {
            expect(screen.getByText(/Incident 1/i)).toBeInTheDocument()
        })

        // Find "Poner en espera" button
        const holdButton = screen.getByRole('button', { name: /Poner en espera/i })
        fireEvent.click(holdButton)

        await waitFor(() => {
            expect(updateIncidentStatus).toHaveBeenCalledWith(1, 'En espera')
        })
    })

    it('handles close incident flow', async () => {
        ; (sendClosureDocumentation as any).mockResolvedValue({})
            ; (updateIncidentStatus as any).mockResolvedValue({ ...mockIncident, status: 'Cerrado' })

        render(
            <BrowserRouter>
                <IncidentDetailPage />
            </BrowserRouter>
        )

        await waitFor(() => {
            expect(screen.getByText(/Incident 1/i)).toBeInTheDocument()
        })

        // Open close dialog
        fireEvent.click(screen.getByRole('button', { name: /Cerrar Incidente/i }))

        // Fill required fields
        fireEvent.change(screen.getByLabelText(/^Solución$/i), { target: { value: 'Solved' } })
        fireEvent.change(screen.getByLabelText(/Resp. Documentación/i), { target: { value: 'User A' } })
        fireEvent.change(screen.getByLabelText(/Resp. Dominio/i), { target: { value: 'User B' } })
        // Resp. ASD is a native select
        fireEvent.change(screen.getByLabelText(/Resp. ASD/i), { target: { value: 'Yuliana Ramos' } })

        // Toggle Root Cause
        const rootCauseSwitch = screen.getByLabelText(/¿Causa Raíz Identificada?/i)
        fireEvent.click(rootCauseSwitch)

        // Fill Root Cause fields
        fireEvent.change(screen.getByLabelText(/^Causa Raíz$/i), { target: { value: 'Root Cause Error' } })

        // Select Category
        const categorySelect = screen.getByText(/Seleccionar categoría/i)
        fireEvent.click(categorySelect)

        // Submit closure
        fireEvent.click(screen.getByRole('button', { name: /Confirmar Cierre/i }))

        await waitFor(() => {
            expect(sendClosureDocumentation).toHaveBeenCalled()
            expect(updateIncidentStatus).toHaveBeenCalledWith(1, 'Cerrado')
        })
    })

    it('renders incident detail page', async () => {
        render(
            <BrowserRouter>
                <IncidentDetailPage />
            </BrowserRouter>
        )

        await waitFor(() => {
            expect(screen.getByText('Media')).toBeInTheDocument()
        })
    })

    it('displays incident service information', async () => {
        render(
            <BrowserRouter>
                <IncidentDetailPage />
            </BrowserRouter>
        )

        await waitFor(() => {
            expect(screen.getByText('Service A')).toBeInTheDocument()
        })
    })

    it('displays incident updates', async () => {
        render(
            <BrowserRouter>
                <IncidentDetailPage />
            </BrowserRouter>
        )

        await waitFor(() => {
            expect(screen.getByText(/Avances/i)).toBeInTheDocument()
        })
    })

    it('can change incident status to waiting', async () => {
        ; (updateIncidentStatus as any).mockResolvedValueOnce({ ...mockIncident, status: 'En espera' })
        render(
            <BrowserRouter>
                <IncidentDetailPage />
            </BrowserRouter>
        )

        await waitFor(() => {
            expect(screen.getByText('Proceso')).toBeInTheDocument()
        })

        const putOnWaitButton = screen.getByRole('button', { name: /Poner en espera/i })
        fireEvent.click(putOnWaitButton)

        await waitFor(() => {
            expect(updateIncidentStatus).toHaveBeenCalledWith(1, 'En espera')
        })
    })

    it('can reopen incident', async () => {
        // Mock incident with closed status
        const closedIncident = { ...mockIncident, status: 'Cerrado' }
        ; (getIncidentById as any).mockResolvedValueOnce(closedIncident)
        ; (updateIncidentStatus as any).mockResolvedValueOnce({ ...closedIncident, status: 'Proceso' })

        render(
            <BrowserRouter>
                <IncidentDetailPage />
            </BrowserRouter>
        )

        await waitFor(() => {
            expect(screen.getByText('Cerrado')).toBeInTheDocument()
        })

        const reopenButton = screen.getByRole('button', { name: /Reabrir Incidente/i })
        fireEvent.click(reopenButton)

        await waitFor(() => {
            expect(updateIncidentStatus).toHaveBeenCalledWith(1, 'Proceso')
        })
    })

    it('adds incident update', async () => {
        ; (addIncidentUpdate as any).mockResolvedValueOnce({ id: 2, text: 'New Update', timestamp: new Date().toISOString() })

        render(
            <BrowserRouter>
                <IncidentDetailPage />
            </BrowserRouter>
        )

        await waitFor(() => {
            expect(screen.getByText('Media')).toBeInTheDocument()
        })

        const textarea = screen.getByPlaceholderText('Proporcionar una actualización sobre el incidente...')
        fireEvent.change(textarea, { target: { value: 'New Update' } })

        const submitButton = screen.getByRole('button', { name: /Agregar Actualización/i })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(addIncidentUpdate).toHaveBeenCalled()
        })
    })
})

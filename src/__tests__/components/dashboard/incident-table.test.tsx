import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { IncidentTable } from '@/components/dashboard/incident-table'
import { BrowserRouter } from 'react-router-dom'
import type { Incident } from '@/lib/types'

const mockIncidents: Incident[] = [
    {
        id: 1,
        service: 'Service A',
        description: 'Desc 1',
        priority: 'Alta',
        status: 'Proceso',
        startTime: new Date().toISOString(),
        endDate: undefined,
        environment: 'Prod',
        teamsLink: ''
    }
]

describe('IncidentTable', () => {
    it('renders incidents', () => {
        render(
            <BrowserRouter>
                <IncidentTable incidents={mockIncidents} />
            </BrowserRouter>
        )

        expect(screen.getByText('Service A')).toBeInTheDocument()
        expect(screen.getByText('Alta')).toBeInTheDocument()
        expect(screen.getByText('Desc 1')).toBeInTheDocument()
    })

    it('renders empty state', () => {
        render(
            <BrowserRouter>
                <IncidentTable incidents={[]} />
            </BrowserRouter>
        )

        expect(screen.getByText('No se encontraron incidentes.')).toBeInTheDocument()
    })

    it('navigates on row click', () => {
        // Mock globalThis.location
        const originalLocation = globalThis.location
        delete (globalThis as any).location
        globalThis.location = { href: '' } as any

        render(
            <BrowserRouter>
                <IncidentTable incidents={mockIncidents} />
            </BrowserRouter>
        )

        fireEvent.click(screen.getByText('Service A'))
        expect(globalThis.location.href).toBe('/incident/1')

        globalThis.location = originalLocation as any
    })
})

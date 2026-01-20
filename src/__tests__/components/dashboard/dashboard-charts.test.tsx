
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { DashboardCharts } from '@/components/dashboard/dashboard-charts'
import { DashboardStats } from '@/lib/types'

// Mock Recharts to avoid DOM issues and simplify assertions
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: any) => <div className="recharts-responsive-container">{children}</div>,
    BarChart: ({ data, children }: any) => <div data-testid="bar-chart" data-data={JSON.stringify(data)}>{children}</div>,
    PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
    Bar: () => <div data-testid="bar" />,
    XAxis: () => <div data-testid="xaxis" />,
    YAxis: () => <div data-testid="yaxis" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Pie: ({ data }: any) => <div data-testid="pie" data-data={JSON.stringify(data)} />,
    Cell: () => <div data-testid="cell" />,
    Legend: () => <div data-testid="legend" />
}))

// Mock generic UI components if needed
vi.mock('@/components/ui/card', () => ({
    Card: ({ children, className }: any) => <div className={className}>{children}</div>,
    CardHeader: ({ children }: any) => <div>{children}</div>,
    CardTitle: ({ children }: any) => <div>{children}</div>,
    CardContent: ({ children }: any) => <div>{children}</div>
}))

const mockStats: DashboardStats = {
    totalIncidents: 10,
    activeIncidents: 5,
    criticalIncidents: 2,
    serviceCounts: {},
    priorityCounts: {},
    statusCounts: {},
    recent7Days: {
        priorityCounts: { 'Alta': 10, 'Media': 5 },
        serviceCounts: { 'Service A': 8, 'Service B': 3, 'Service C': 1, 'Service D': 5, 'Service E': 0, 'Service F': 2 }, // > 5 services to test sorting/slicing
        resolutionStats: {
            avgMinutes: 45,
            maxMinutes: 120,
            dailyTrend: [
                { date: '2023-01-01', avgMinutes: 30 },
                { date: '2023-01-02', avgMinutes: 60 }
            ]
        }
    }
}

describe('DashboardCharts', () => {
    it('renders all three charts', () => {
        render(<DashboardCharts stats={mockStats} />)

        expect(screen.getByText('Incidentes por Servicio (Últimos 7 días)')).toBeInTheDocument()
        expect(screen.getByText('Distribución por Prioridad (Últimos 7 días)')).toBeInTheDocument()
        expect(screen.getByText('Tiempo de Resolución Promedio (Últimos 7 días)')).toBeInTheDocument()

        expect(screen.getAllByTestId('bar-chart')).toHaveLength(2)
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
    })

    it('passes correct sorted data to Service BarChart', () => {
        render(<DashboardCharts stats={mockStats} />)

        const barCharts = screen.getAllByTestId('bar-chart')
        // The first one is likely the Service chart based on order in component
        const serviceChart = barCharts[0]

        const data = JSON.parse(serviceChart.dataset.data ?? '[]')

        // precise check for sorting (descending) and top 5
        expect(data).toHaveLength(5)
        expect(data[0].name).toBe('Service A') // 8
        expect(data[1].name).toBe('Service D') // 5
        expect(data[2].name).toBe('Service B') // 3
        // Service F (2)
        // Service C (1)
        expect(data[3].name).toBe('Service F')
        expect(data[4].name).toBe('Service C')
    })

    it('passes correct data to Priority PieChart', () => {
        render(<DashboardCharts stats={mockStats} />)

        const pie = screen.getByTestId('pie')
        const data = JSON.parse(pie.dataset.data ?? '[]')

        // Priority Counts: Alta: 10, Media: 5
        expect(data).toHaveLength(2)
        // Order depends on Object.entries, usually stable but not guaranteed sorted by key unless coded.
        // Implementation: Object.entries(stats.recent7Days.priorityCounts)
        // We just check if it contains our entries.
        expect(data).toEqual(expect.arrayContaining([
            { name: 'Alta', value: 10 },
            { name: 'Media', value: 5 }
        ]))
    })

    it('displays resolution stats text', () => {
        render(<DashboardCharts stats={mockStats} />)

        expect(screen.getByText('45m')).toBeInTheDocument()
        expect(screen.getByText('120m')).toBeInTheDocument()
    })
})

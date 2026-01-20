import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DashboardHeader } from '@/components/dashboard/header'

vi.mock('@/lib/notifications')
vi.mock('@/hooks/use-toast', () => ({
    useToast: () => ({ toast: vi.fn() })
}))

describe('DashboardHeader', () => {
    const mockOnSearch = vi.fn()
    const mockOnChannelChange = vi.fn()

    const defaultProps = {
        onSearch: mockOnSearch,
        channels: ['Canal A', 'Canal B', 'Canal C'],
        selectedChannel: 'Canal A',
        onChannelChange: mockOnChannelChange
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders header with search input', () => {
        render(<DashboardHeader {...defaultProps} />)

        const searchInput = screen.getByPlaceholderText(/Buscar servicio/i)
        expect(searchInput).toBeInTheDocument()
    })

    it('calls onSearch when user types in search input', () => {
        render(<DashboardHeader {...defaultProps} />)

        const searchInput = screen.getByPlaceholderText(/Buscar servicio/i) as HTMLInputElement
        fireEvent.change(searchInput, { target: { value: 'test search' } })

        expect(mockOnSearch).toHaveBeenCalledWith('test search')
    })

    it('renders channel select dropdown', () => {
        render(<DashboardHeader {...defaultProps} />)

        const channelSelect = screen.getByDisplayValue('Canal A')
        expect(channelSelect).toBeInTheDocument()
    })

    it('displays all available channels in dropdown', () => {
        render(<DashboardHeader {...defaultProps} />)

        const options = screen.getAllByRole('option')
        expect(options.length).toBeGreaterThan(0)
        expect(screen.getByRole('option', { name: 'Todos los Canales' })).toBeInTheDocument()
    })

    it('calls onChannelChange when channel is selected', () => {
        render(<DashboardHeader {...defaultProps} />)

        const channelSelect = screen.getByDisplayValue('Canal A')
        fireEvent.change(channelSelect, { target: { value: 'Canal B' } })

        expect(mockOnChannelChange).toHaveBeenCalledWith('Canal B')
    })

    it('renders test WhatsApp button', () => {
        render(<DashboardHeader {...defaultProps} />)

        const testButton = screen.getByRole('button', { name: /Probar WhatsApp/i })
        expect(testButton).toBeInTheDocument()
    })

    it('handles channel change to empty selection', () => {
        render(<DashboardHeader {...defaultProps} />)

        const channelSelect = screen.getByDisplayValue('Canal A')
        fireEvent.change(channelSelect, { target: { value: '' } })

        expect(mockOnChannelChange).toHaveBeenCalledWith('')
    })

    it('renders header with all elements in correct positions', () => {
        const { container } = render(<DashboardHeader {...defaultProps} />)

        const header = container.querySelector('header')
        expect(header).toHaveClass('flex', 'items-center', 'justify-between')
    })

    it('search input has correct placeholder text', () => {
        render(<DashboardHeader {...defaultProps} />)

        const searchInput = screen.getByPlaceholderText(/Buscar servicio/i)
        expect(searchInput).toHaveAttribute('type', 'search')
    })

    it('renders header structure correctly', () => {
        const { container } = render(<DashboardHeader {...defaultProps} />)

        const header = container.querySelector('header')
        expect(header).toBeInTheDocument()
        expect(header).toHaveClass('flex', 'gap-4', 'mb-6')
    })

    it('renders multiple elements in header', () => {
        render(<DashboardHeader {...defaultProps} />)

        // Search input
        expect(screen.getByPlaceholderText(/Buscar servicio/i)).toBeInTheDocument()
        // Channel select
        expect(screen.getByDisplayValue('Canal A')).toBeInTheDocument()
        // Test button
        expect(screen.getByRole('button', { name: /Probar WhatsApp/i })).toBeInTheDocument()
    })
})

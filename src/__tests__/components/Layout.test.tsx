import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Layout } from '@/components/Layout'
import { BrowserRouter } from 'react-router-dom'

// Mock the sidebar component
vi.mock('@/components/dashboard/sidebar', () => ({
    DashboardSidebar: () => <div data-testid="sidebar">Sidebar</div>
}))

describe('Layout', () => {
    it('renders the sidebar component', () => {
        render(
            <BrowserRouter>
                <Layout />
            </BrowserRouter>
        )

        expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    })

    it('renders layout structure with grid', () => {
        const { container } = render(
            <BrowserRouter>
                <Layout />
            </BrowserRouter>
        )

        const gridContainer = container.querySelector('.grid')
        expect(gridContainer).toBeInTheDocument()
        expect(gridContainer).toHaveClass('min-h-screen', 'w-full')
    })

    it('applies correct responsive grid classes', () => {
        const { container } = render(
            <BrowserRouter>
                <Layout />
            </BrowserRouter>
        )

        const gridContainer = container.querySelector('.grid')
        expect(gridContainer).toHaveClass('md:grid-cols-[60px_1fr]')
        expect(gridContainer).toHaveClass('lg:grid-cols-[60px_1fr]')
    })

    it('renders the outlet container for child routes', () => {
        const { container } = render(
            <BrowserRouter>
                <Layout />
            </BrowserRouter>
        )

        // Outlet is rendered as a flex container
        const flexContainer = container.querySelector('.flex')
        expect(flexContainer).toBeInTheDocument()
    })

    it('applies overflow and height styles to outlet area', () => {
        const { container } = render(
            <BrowserRouter>
                <Layout />
            </BrowserRouter>
        )

        // Find the outlet wrapper div
        const outletWrapper = container.querySelector('.flex.flex-col')
        expect(outletWrapper).toBeInTheDocument()
        expect(outletWrapper).toHaveClass('overflow-auto', 'h-screen')
    })

    it('renders sidebar on left side', () => {
        const { container } = render(
            <BrowserRouter>
                <Layout />
            </BrowserRouter>
        )

        const sidebar = screen.getByTestId('sidebar')
        const gridContainer = container.querySelector('.grid')
        
        // Sidebar should be first child of grid
        expect(gridContainer?.children[0]).toContainElement(sidebar)
    })

    it('renders outlet container on right side', () => {
        const { container } = render(
            <BrowserRouter>
                <Layout />
            </BrowserRouter>
        )

        const gridContainer = container.querySelector('.grid')
        const outletWrapper = container.querySelector('.flex.flex-col')
        
        // Outlet wrapper should be second child of grid
        expect(gridContainer?.children[1]).toContainElement(outletWrapper)
    })

    it('layout is responsive and full height', () => {
        const { container } = render(
            <BrowserRouter>
                <Layout />
            </BrowserRouter>
        )

        const gridContainer = container.querySelector('.grid')
        expect(gridContainer).toHaveClass('min-h-screen')
    })

    it('maintains layout structure with nested outlet', () => {
        const { container } = render(
            <BrowserRouter>
                <Layout />
            </BrowserRouter>
        )

        const sidebar = screen.getByTestId('sidebar')
        const gridContainer = container.querySelector('.grid')
        const outletWrapper = container.querySelector('.flex.flex-col')

        expect(gridContainer).toContainElement(sidebar)
        expect(gridContainer).toContainElement(outletWrapper)
    })
})

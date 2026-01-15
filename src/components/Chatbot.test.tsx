import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Chatbot } from './Chatbot'

// Mock useAuth
vi.mock('@/contexts/auth-context', () => ({
    useAuth: () => ({ user: { name: 'Test User' } }),
}))

// Mock dotlottie-wc
vi.stubGlobal('dotlottie-wc', 'div')

// Mock ScrollArea
vi.mock('@/components/ui/scroll-area', () => ({
    ScrollArea: ({ children, className }: any) => <div className={className}>{children}</div>
}))

// Mock fetch
global.fetch = vi.fn()

describe('Chatbot', () => {
    beforeEach(() => {
        // vi.clearAllMocks() - removed to avoid error
        // Reset the mock implementation for global.fetch for each test
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ answer: 'Test response' }),
        })
    })

    it('opens and closes', () => {
        render(<Chatbot />)
        const toggleButton = screen.getByRole('button', { name: '' }) // The main toggle button might not have a name if it's icon-only

        // Find button by icon presence (class check or similar) or just the button
        // Since there's only one button initially visible (the toggle), we can find it.
        // However, let's use a more robust way if possible.
        // The button has MessageCircle icon.

        fireEvent.click(toggleButton)
        expect(screen.getByText('Hola Test User! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?')).toBeInTheDocument()

        const closeButton = screen.getAllByRole('button')[0] // The X button in header
        fireEvent.click(closeButton)
        expect(screen.queryByText('Hola Test User! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?')).not.toBeInTheDocument()
    })

    it('sends a message', async () => {
        render(<Chatbot />)
        fireEvent.click(screen.getByRole('button')) // Open

        const input = screen.getByPlaceholderText('Escribe tu pregunta...')
        fireEvent.change(input, { target: { value: 'Hello' } })

        const sendButton = screen.getAllByRole('button').find(b => b.querySelector('.lucide-send'))
        fireEvent.click(sendButton!)

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled()
        })
    })
})

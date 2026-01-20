import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Chatbot } from '@/components/Chatbot'

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
globalThis.fetch = vi.fn()

describe('Chatbot', () => {
    beforeEach(() => {
        globalThis.fetch = vi.fn()
        ;(globalThis.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ answer: 'Test response' }),
        })
    })

    it('opens and closes', () => {
        render(<Chatbot />)
        const toggleButton = screen.getByRole('button', { name: '' })

        fireEvent.click(toggleButton)
        expect(screen.getByText('Hola Test User! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?')).toBeInTheDocument()

        const closeButton = screen.getAllByRole('button')[0]
        fireEvent.click(closeButton)
        expect(screen.queryByText('Hola Test User! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?')).not.toBeInTheDocument()
    })

    it('sends a message successfully', async () => {
        render(<Chatbot />)
        fireEvent.click(screen.getByRole('button')) // Open

        const input = screen.getByPlaceholderText('Escribe tu pregunta...')
        fireEvent.change(input, { target: { value: 'Hello' } })

        const sendButton = screen.getAllByRole('button').find(b => b.querySelector('.lucide-send'))
        expect(sendButton).toBeDefined()
        fireEvent.click(sendButton!)

        await waitFor(() => {
            expect(globalThis.fetch).toHaveBeenCalled()
        })
    })

    it('displays bot response message', async () => {
        (globalThis.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ answer: 'Bot response' }),
        })

        render(<Chatbot />)
        fireEvent.click(screen.getByRole('button')) // Open

        const input = screen.getByPlaceholderText('Escribe tu pregunta...')
        fireEvent.change(input, { target: { value: 'Test' } })

        const sendButton = screen.getAllByRole('button').find(b => b.querySelector('.lucide-send'))
        fireEvent.click(sendButton!)

        await waitFor(() => {
            expect(screen.getByText('Bot response')).toBeInTheDocument()
        })
    })

    it('displays error message on fetch failure', async () => {
        (globalThis.fetch as any).mockRejectedValueOnce(new Error('Network error'))

        render(<Chatbot />)
        fireEvent.click(screen.getByRole('button'))

        const input = screen.getByPlaceholderText('Escribe tu pregunta...')
        fireEvent.change(input, { target: { value: 'Test' } })

        const sendButton = screen.getAllByRole('button').find(b => b.querySelector('.lucide-send'))
        fireEvent.click(sendButton!)

        await waitFor(() => {
            expect(screen.getByText(/Lo siento, hubo un error al conectar con el servidor/)).toBeInTheDocument()
        })
    })

    it('does not send empty message', async () => {
        render(<Chatbot />)
        fireEvent.click(screen.getByRole('button'))

        const input = screen.getByPlaceholderText('Escribe tu pregunta...')
        fireEvent.change(input, { target: { value: '' } })

        const sendButton = screen.getAllByRole('button').find(b => b.querySelector('.lucide-send'))
        fireEvent.click(sendButton!)

        // Fetch should not be called for empty message
        expect(globalThis.fetch).not.toHaveBeenCalled()
    })

    it('clears input after sending message', async () => {
        render(<Chatbot />)
        fireEvent.click(screen.getByRole('button'))

        const input = screen.getByPlaceholderText('Escribe tu pregunta...') as HTMLInputElement
        fireEvent.change(input, { target: { value: 'Test message' } })

        const sendButton = screen.getAllByRole('button').find(b => b.querySelector('.lucide-send'))
        fireEvent.click(sendButton!)

        await waitFor(() => {
            expect(input.value).toBe('')
        })
    })

    it('renders chatbot component', () => {
        render(<Chatbot />)
        
        const buttons = screen.getAllByRole('button')
        expect(buttons.length).toBeGreaterThan(0)
    })

    it('handles response with different format (response field)', async () => {
        (globalThis.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ response: 'Alternative response' }),
        })

        render(<Chatbot />)
        fireEvent.click(screen.getByRole('button'))

        const input = screen.getByPlaceholderText('Escribe tu pregunta...')
        fireEvent.change(input, { target: { value: 'Test' } })

        const sendButton = screen.getAllByRole('button').find(b => b.querySelector('.lucide-send'))
        fireEvent.click(sendButton!)

        await waitFor(() => {
            expect(screen.getByText('Alternative response')).toBeInTheDocument()
        })
    })
})

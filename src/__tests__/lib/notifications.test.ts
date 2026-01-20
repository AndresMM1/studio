import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { sendWhatsAppGroupMessage } from '@/lib/notifications'

describe('Notifications Library', () => {
    let fetchMock: any
    let consoleErrorMock: any

    beforeEach(() => {
        fetchMock = vi.fn()
        consoleErrorMock = vi.fn()
        globalThis.fetch = fetchMock
        vi.spyOn(console, 'error').mockImplementation(consoleErrorMock)
    })

    afterEach(() => {
        vi.clearAllMocks()
        vi.restoreAllMocks()
    })

    describe('sendWhatsAppGroupMessage', () => {
        it('sends message successfully with default endpoint', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true })
            })

            const result = await sendWhatsAppGroupMessage('Test message')

            expect(fetchMock).toHaveBeenCalled()
            expect(result).toEqual({ success: true })
        })

        it('uses provided endpoint over default', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true })
            })

            const customEndpoint = 'https://custom.endpoint/send'
            await sendWhatsAppGroupMessage('Test message', undefined, customEndpoint)

            const callArgs = fetchMock.mock.calls[0][0]
            expect(callArgs).toBe(customEndpoint)
        })

        it('uses provided group name over default', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true })
            })

            await sendWhatsAppGroupMessage('Test message', 'CustomGroup')

            const callBody = JSON.parse(fetchMock.mock.calls[0][1].body)
            expect(callBody.groupName).toBe('CustomGroup')
        })

        it('sends message with correct payload structure', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true })
            })

            await sendWhatsAppGroupMessage('Test message', 'TestGroup')

            const callBody = JSON.parse(fetchMock.mock.calls[0][1].body)
            expect(callBody).toHaveProperty('message', 'Test message')
            expect(callBody).toHaveProperty('groupName', 'TestGroup')
        })

        it('uses POST method for request', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true })
            })

            await sendWhatsAppGroupMessage('Test message')

            const callOptions = fetchMock.mock.calls[0][1]
            expect(callOptions.method).toBe('POST')
        })

        it('sets correct Content-Type header', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true })
            })

            await sendWhatsAppGroupMessage('Test message')

            const callOptions = fetchMock.mock.calls[0][1]
            expect(callOptions.headers['Content-Type']).toBe('application/json')
        })

        it('throws error when response is not ok', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: false,
                status: 500,
                text: async () => 'Server error'
            })

            await expect(
                sendWhatsAppGroupMessage('Test message')
            ).rejects.toThrow('WhatsApp webhook failed: 500 Server error')
        })

        it('handles non-JSON response', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => { throw new Error('Not JSON') },
                text: async () => 'Text response'
            })

            const result = await sendWhatsAppGroupMessage('Test message')

            expect(result).toBeNull()
        })

        it('handles fetch network error', async () => {
            fetchMock.mockRejectedValueOnce(new Error('Network error'))

            await expect(
                sendWhatsAppGroupMessage('Test message')
            ).rejects.toThrow('Network error')
        })

        it('logs error to console when fetch fails', async () => {
            fetchMock.mockRejectedValueOnce(new Error('Network error'))

            try {
                await sendWhatsAppGroupMessage('Test message')
            } catch (err) {
                // Error is expected
            }

            expect(consoleErrorMock).toHaveBeenCalledWith(
                'sendWhatsAppGroupMessage error:',
                expect.any(Error)
            )
        })

        it('handles 401 unauthorized response', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: false,
                status: 401,
                text: async () => 'Unauthorized'
            })

            await expect(
                sendWhatsAppGroupMessage('Test message')
            ).rejects.toThrow('WhatsApp webhook failed: 401 Unauthorized')
        })

        it('handles 404 not found response', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: false,
                status: 404,
                text: async () => 'Not found'
            })

            await expect(
                sendWhatsAppGroupMessage('Test message')
            ).rejects.toThrow('WhatsApp webhook failed: 404 Not found')
        })

        it('handles 429 rate limit response', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: false,
                status: 429,
                text: async () => 'Too many requests'
            })

            await expect(
                sendWhatsAppGroupMessage('Test message')
            ).rejects.toThrow('WhatsApp webhook failed: 429 Too many requests')
        })

        it('handles very long messages', async () => {
            const longMessage = 'A'.repeat(10000)
            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true })
            })

            const result = await sendWhatsAppGroupMessage(longMessage)

            expect(result).toEqual({ success: true })
            const callBody = JSON.parse(fetchMock.mock.calls[0][1].body)
            expect(callBody.message).toBe(longMessage)
        })

        it('handles special characters in message', async () => {
            const specialMessage = 'Test 中文 🎉 <script>alert("xss")</script>'
            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true })
            })

            await sendWhatsAppGroupMessage(specialMessage)

            const callBody = JSON.parse(fetchMock.mock.calls[0][1].body)
            expect(callBody.message).toBe(specialMessage)
        })

        it('handles empty message', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true })
            })

            await sendWhatsAppGroupMessage('')

            const callBody = JSON.parse(fetchMock.mock.calls[0][1].body)
            expect(callBody.message).toBe('')
        })
    })
})

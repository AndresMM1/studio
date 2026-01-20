import { renderHook } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useIsMobile } from '@/hooks/use-mobile'

describe('useIsMobile', () => {
    let matchMediaMock: any

    beforeEach(() => {
        // Mock matchMedia
        matchMediaMock = vi.fn().mockImplementation(query => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }))

        Object.defineProperty(globalThis, 'matchMedia', {
            writable: true,
            value: matchMediaMock,
        })

        // Mock window.innerWidth
        Object.defineProperty(globalThis, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1024,
        })
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('returns false for desktop screen width', () => {
        Object.defineProperty(globalThis, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1024,
        })

        const { result } = renderHook(() => useIsMobile())

        expect(result.current).toBe(false)
    })

    it('returns true for mobile screen width', () => {
        Object.defineProperty(globalThis, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 600,
        })

        const { result } = renderHook(() => useIsMobile())

        expect(result.current).toBe(true)
    })

    it('handles screen width exactly at breakpoint (768px)', () => {
        Object.defineProperty(globalThis, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 768,
        })

        const { result } = renderHook(() => useIsMobile())

        expect(result.current).toBe(false)
    })

    it('handles screen width just below breakpoint (767px)', () => {
        Object.defineProperty(globalThis, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 767,
        })

        const { result } = renderHook(() => useIsMobile())

        expect(result.current).toBe(true)
    })

    it('returns false for very large screens', () => {
        Object.defineProperty(globalThis, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 2560,
        })

        const { result } = renderHook(() => useIsMobile())

        expect(result.current).toBe(false)
    })

    it('returns false for small desktop (800px)', () => {
        Object.defineProperty(globalThis, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 800,
        })

        const { result } = renderHook(() => useIsMobile())

        expect(result.current).toBe(false)
    })

    it('returns true for small tablet (600px)', () => {
        Object.defineProperty(globalThis, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 600,
        })

        const { result } = renderHook(() => useIsMobile())

        expect(result.current).toBe(true)
    })

    it('returns true for phone screen (375px)', () => {
        Object.defineProperty(globalThis, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 375,
        })

        const { result } = renderHook(() => useIsMobile())

        expect(result.current).toBe(true)
    })

    it('registers event listener for media query changes', () => {
        const addEventListenerMock = vi.fn()
        matchMediaMock.mockImplementation(query => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: addEventListenerMock,
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }))

        renderHook(() => useIsMobile())

        expect(addEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function))
    })

    it('removes event listener on unmount', () => {
        const removeEventListenerMock = vi.fn()
        matchMediaMock.mockImplementation(query => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: removeEventListenerMock,
            dispatchEvent: vi.fn(),
        }))

        const { unmount } = renderHook(() => useIsMobile())

        unmount()

        expect(removeEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function))
    })

    it('uses correct breakpoint value', () => {
        renderHook(() => useIsMobile())

        expect(matchMediaMock).toHaveBeenCalledWith('(max-width: 767px)')
    })
})

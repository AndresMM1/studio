import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useToast, toast } from './use-toast'

describe('useToast', () => {
    it('should add a toast', () => {
        const { result } = renderHook(() => useToast())

        act(() => {
            toast({ title: 'Test Toast' })
        })

        expect(result.current.toasts).toHaveLength(1)
        expect(result.current.toasts[0].title).toBe('Test Toast')
    })

    it('should dismiss a toast', () => {
        const { result } = renderHook(() => useToast())

        let toastId: string
        act(() => {
            const t = toast({ title: 'Test Toast' })
            toastId = t.id
        })

        expect(result.current.toasts[0].open).toBe(true)

        act(() => {
            result.current.dismiss(toastId!)
        })

        // Dismiss sets open to false (or removes depending on logic)
        // Reducer logic: DISMISS: open = false
        expect(result.current.toasts[0].open).toBe(false)
    })

    it('should update a toast', () => {
        const { result } = renderHook(() => useToast())

        let updateFn: any
        act(() => {
            const t = toast({ title: 'Initial' })
            updateFn = t.update
        })

        expect(result.current.toasts[0].title).toBe('Initial')

        act(() => {
            updateFn({ title: 'Updated' })
        })

        expect(result.current.toasts[0].title).toBe('Updated')
    })
})

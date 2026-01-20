import { cn } from '@/lib/utils'
import { describe, it, expect } from 'vitest'

describe('cn', () => {
    it('merges class names correctly', () => {
        expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('handles conditional classes', () => {
        const includeSecond = true
        const includeThird = false
        expect(cn('class1', includeSecond && 'class2', includeThird && 'class3')).toBe('class1 class2')
    })

    it('merges tailwind classes correctly', () => {
        expect(cn('p-4', 'p-2')).toBe('p-2')
    })

    it('handles arrays', () => {
        expect(cn(['class1', 'class2'])).toBe('class1 class2')
    })

    it('handles undefined and null', () => {
        expect(cn('class1', undefined, null)).toBe('class1')
    })
})

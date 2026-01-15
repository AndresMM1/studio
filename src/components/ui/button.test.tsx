import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Button } from './button'

describe('Button', () => {
    it('renders correctly', () => {
        render(<Button>Click me</Button>)
        const button = screen.getByRole('button', { name: /click me/i })
        expect(button).toBeInTheDocument()
    })

    it('applies variant classes', () => {
        render(<Button variant="destructive">Delete</Button>)
        const button = screen.getByRole('button')
        expect(button).toHaveClass('bg-destructive')
    })

    it('applies size classes', () => {
        render(<Button size="lg">Large</Button>)
        const button = screen.getByRole('button')
        expect(button).toHaveClass('h-11')
    })

    it('renders as child', () => {
        render(
            <Button asChild>
                <a href="/link">Link</a>
            </Button>
        )
        const link = screen.getByRole('link', { name: /link/i })
        expect(link).toBeInTheDocument()
        expect(link).toHaveClass('inline-flex')
    })

    it('passes other props', () => {
        render(<Button disabled>Disabled</Button>)
        const button = screen.getByRole('button')
        expect(button).toBeDisabled()
    })
})

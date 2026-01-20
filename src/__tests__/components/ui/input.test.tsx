import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Input } from '@/components/ui/input'

describe('Input', () => {
    it('renders correctly', () => {
        render(<Input placeholder="Type here" />)
        const input = screen.getByPlaceholderText('Type here')
        expect(input).toBeInTheDocument()
    })

    it('applies custom classes', () => {
        render(<Input className="custom-class" />)
        const input = screen.getByRole('textbox')
        expect(input).toHaveClass('custom-class')
    })

    it('passes props', () => {
        render(<Input type="password" />)
        // getByRole 'textbox' doesn't work for password inputs
        const input = screen.getByDisplayValue('') // Assuming empty initial value
        expect(input).toHaveAttribute('type', 'password')
    })
})

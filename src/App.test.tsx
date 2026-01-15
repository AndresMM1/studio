import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

describe('App', () => {
    it('renders correctly', () => {
        render(<div data-testid="app">Hello World</div>)
        expect(screen.getByTestId('app')).toBeInTheDocument()
    })
})

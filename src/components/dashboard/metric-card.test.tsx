import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MetricCard } from './metric-card'
import { Activity } from 'lucide-react'

describe('MetricCard', () => {
    it('renders correctly', () => {
        render(<MetricCard title="Test Metric" value="100" icon={Activity} />)
        expect(screen.getByText('Test Metric')).toBeInTheDocument()
        expect(screen.getByText('100')).toBeInTheDocument()
    })
})

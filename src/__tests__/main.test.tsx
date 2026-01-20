import React from 'react'
import { describe, it, expect, vi } from 'vitest'

const renderSpy = vi.fn()
const createRootSpy = vi.fn(() => ({ render: renderSpy }))

vi.mock('react-dom/client', () => ({
    createRoot: createRootSpy,
    default: { createRoot: createRootSpy },
}))

vi.mock('@/App', () => ({ default: () => <div>Mock App</div> }))

describe('main entrypoint', () => {
    it('mounts the React app at root', async () => {
        document.body.innerHTML = '<div id="root"></div>'

        await import('@/main')

        expect(createRootSpy).toHaveBeenCalledWith(document.getElementById('root'))
        expect(renderSpy).toHaveBeenCalled()
        const renderedElement = renderSpy.mock.calls[0][0] as React.ReactElement
        expect(renderedElement.type).toBe(React.StrictMode)
    })
})

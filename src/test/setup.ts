import '@testing-library/jest-dom'

// Lightweight polyfill for jsdom so components using ResizeObserver do not throw
globalThis.ResizeObserver = class ResizeObserver {
    observe() {
        return undefined
    }
    unobserve() {
        return undefined
    }
    disconnect() {
        return undefined
    }
}

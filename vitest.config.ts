import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        include: ['tests/**/*.test.ts'],
        globals: true,
        environment: 'node',
        coverage: {
            provider: 'istanbul',
            reporter: ['text', 'html'],
        },
    },
})

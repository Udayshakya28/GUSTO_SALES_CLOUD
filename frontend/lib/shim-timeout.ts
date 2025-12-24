// frontend/lib/shim-timeout.ts

if (typeof global.setTimeout === 'function') {
    const originalSetTimeout = global.setTimeout;
    // @ts-ignore
    global.setTimeout = (cb: any, ms: any, ...args: any[]) => {
        if (typeof ms === 'number' && ms < 0) {
            // Suppress the warning and default to 1ms
            // optional: console.warn(`[Shim] Negative timeout detected: ${ms}. Defaulting to 1ms.`);
            ms = 1;
        }
        return originalSetTimeout(cb, ms, ...args);
    };
}

// Export empty object to make this a module
export {};

import { z } from 'zod';

export const deviceDiscoveryDto = {
    query: z.object({
        timeoutMs: z.number().min(0).max(10_000).optional(),
    }),
};

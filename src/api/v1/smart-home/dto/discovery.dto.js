import { z } from 'zod';

export const deviceDiscoveryDto = {
    query: z.object({
        timeoutMs: z.coerce.number().min(0).max(10000).optional(),
    }),
};

import z from 'zod';

export const getDeviceDto = {
    query: z.object({
        id: z.string(),
    }),
};

export const controlDeviceDto = {};

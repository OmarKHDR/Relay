import { z } from 'zod';
export const setGoalDto = {
    body: z.object({
        x: z.number(),
        y: z.number(),
        yaw: z.number(),
    }),
};

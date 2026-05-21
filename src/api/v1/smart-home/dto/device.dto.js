import z from 'zod';

export const getDeviceDto = {
    params: z.object({
        id: z.string(),
    }),
};

export const controlDeviceDto = {
    body: z.object({
        id: z.string(),
        state: z.number(),
    }),
};

export const registerDeviceDto = {
    body: z.object({
        device: z.object({
            id: z.string(),
            name: z.string(),
            control_type: z.string(),
            state: z.number(),
        }),
        room: z
            .object({
                id: z.uuid().optional(),
                name: z.string().optional(),
            })
            .optional(),
    }),
};

export const updateDeviceDto = {
    body: z.object({
        id: z.string(),
        name: z.string(),
    }),
};

export const deleteDeviceDto = {
    params: z.object({
        id: z.string(),
    }),
};

export const changeDeviceRoomDto = {
    params: z.object({
        id: z.string(),
    }),
    body: z.object({
        roomId: z.string(),
    }),
};

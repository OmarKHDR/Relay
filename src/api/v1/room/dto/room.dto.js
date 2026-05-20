import { z } from 'zod';

export const registerRoomDto = {
    body: z.object({
        name: z.string(),
        minX: z.number(),
        maxX: z.number(),
        minY: z.number(),
        maxY: z.number(),
        theta: z.number(),
        poseX: z.number(),
        poseY: z.number(),
        poseTheta: z.number(),
        devices: z.array(z.object()).optional(),
    }),
};

export const updateRoomDto = {
    body: z.object({
        name: z.string().optional(),
        minX: z.number().optional(),
        maxX: z.number().optional(),
        minY: z.number().optional(),
        maxY: z.number().optional(),
        theta: z.number().optional(),
        poseX: z.number().optional(),
        poseY: z.number().optional(),
        poseTheta: z.number().optional(),
        devices: z.array(z.object()).optional(),
    }),
};


export const getRoomDto = {
    params: z.object({
        name: z.string(),
    }),
};

export const deleteRoomDto = {
    params: z.object({
        name: z.string(),
    }),
};

export const navigateToRoomDto = {
    params: z.object({
        name: z.string(),
    }),
};
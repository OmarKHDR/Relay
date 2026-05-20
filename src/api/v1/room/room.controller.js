import { roomService } from './room.service.js';

export async function getAllRooms(req, res, next) {
    const rooms = await roomService.getAllRooms();
    return rooms;
}

export async function registerRoom(req, res, next) {
    const room = req.body;
    const savedRoom = await roomService.registerRoom(room);
    return savedRoom;
}

export async function updateRoom(req, res, next) {
    const data = req.body;
    const updatedRoom = await roomService.updateRoom(data);
    return updatedRoom;
}

export async function getRoom(req, res, next) {
    const { id } = req.params;
    const room = await roomService.getRoom(id);
    return room;
}

export async function deleteRoom(req, res, next) {
    const { id } = req.params;
    await roomService.deleteRoom(id);
    return {
        id,
        deleted: true,
    };
}

export async function navigateToRoom(req, res, next) {
    const { id } = req.params;
    const result = await roomService.navigateToRoom(id);
    return result;
}

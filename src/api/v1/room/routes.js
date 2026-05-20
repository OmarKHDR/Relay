import {
    deleteRoomDto,
    getRoomDto,
    navigateToRoomDto,
    registerRoomDto,
    updateRoomDto,
} from './dto/room.dto.js';
import {
    deleteRoom,
    getAllRooms,
    getRoom,
    navigateToRoom,
    registerRoom,
    updateRoom,
} from './room.controller.js';

export const RoomRouter = {
    customRouter: true,
    base: '/room',
    routes: [
        {
            name: 'getAllRooms',
            description: 'get all rooms',
            method: 'GET',
            path: '/',
            controller: getAllRooms,
            middlewares: [],
            response: {
                200: ""
            }
        },
        {
            name: 'registerRoom',
            description: 'register a new room',
            method: 'POST',
            path: '/',
            dto: registerRoomDto,
            controller: registerRoom,
            middlewares: [],
        },
        {
            name: 'updateRoom',
            description: 'update existing room info',
            method: 'PATCH',
            path: '/',
            dto: updateRoomDto,
            controller: updateRoom,
            middlewares: [],
        },
        {
            name: 'getRoom',
            description: 'get one room',
            method: 'GET',
            path: '/:id',
            dto: getRoomDto,
            controller: getRoom,
            middlewares: [],
        },
        {
            name: 'deleteRoom',
            description: 'delete a room by id',
            method: 'DELETE',
            path: '/:id',
            dto: deleteRoomDto,
            controller: deleteRoom,
            middlewares: [],
        },
        {
            name: 'navigateToRoom',
            description: 'navigate robot to room',
            method: 'POST',
            path: '/:id/navigate',
            dto: navigateToRoomDto,
            controller: navigateToRoom,
            middlewares: [],
        },
    ],
};

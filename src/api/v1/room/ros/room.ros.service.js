import rosHandler from '#lib/ros/connection.js';
import ROSLIB from 'roslib';
import logger from '#utils/logger.js';
import { roomService } from '../room.service.js';

const mapToRosRoom = (room = {}) => ({
    name: room.name || '',
    min_x: Number(room.min_x) || 0.0,
    max_x: Number(room.max_x) || 0.0,
    min_y: Number(room.min_y) || 0.0,
    max_y: Number(room.max_y) || 0.0,
    theta: Number(room.theta) || 0.0,
    pose_x: Number(room.pose_x) || 0.0,
    pose_y: Number(room.pose_y) || 0.0,
    pose_theta: Number(room.pose_theta) || 0.0,
    devices: [] // devices array left empty for now to match interface
});

class RoomRosService {
    constructor() {
        rosHandler.on('ros_reconnected', newRosInstance => {
            logger.info('[Room ROS Service] ROS reconnected, refreshing subscription...');
            this.ros = newRosInstance;
            this.createService();
        });

        if (rosHandler.isConnected()) {
            this.ros = rosHandler.getRos();
            this.createService();
        }
    }

    createService() {
        this.getAllRooms = new ROSLIB.Service({
            ros: this.ros,
            name: '/room/getAllRooms',
            serviceType: 'sanad_interfaces/srv/GetAllRooms',
        });
        this.getAllRooms.advertise(this.getAllRoomsCallback.bind(this));

        this.deleteRoom = new ROSLIB.Service({
            ros: this.ros,
            name: '/room/deleteRoom',
            serviceType: 'sanad_interfaces/srv/DeleteRoom',
        });
        this.deleteRoom.advertise(this.deleteRoomCallback.bind(this));

        this.getRoom = new ROSLIB.Service({
            ros: this.ros,
            name: '/room/getRoom',
            serviceType: 'sanad_interfaces/srv/GetRoom',
        });
        this.getRoom.advertise(this.getRoomCallback.bind(this));

        this.registerRoom = new ROSLIB.Service({
            ros: this.ros,
            name: '/room/registerRoom',
            serviceType: 'sanad_interfaces/srv/RegisterRoom',
        });
        this.registerRoom.advertise(this.registerRoomCallback.bind(this));

        this.updateRoom = new ROSLIB.Service({
            ros: this.ros,
            name: '/room/updateRoom',
            serviceType: 'sanad_interfaces/srv/UpdateRoom',
        });
        this.updateRoom.advertise(this.updateRoomCallback.bind(this));
    }

    async getAllRoomsCallback(req, res) {
        const rooms = await roomService.getAllRooms();
        res.rooms = Object.values(rooms).map(mapToRosRoom);
        return true;
    }

    async deleteRoomCallback(req, res) {
        await roomService.deleteRoom(req.id);
        res.success = true;
        return true;
    }

    async getRoomCallback(req, res) {
        const rooms = await roomService.getAllRooms();
        // Fallback: look up by name (req.name from GetRoom.srv) or id
        const room = Object.values(rooms).find(r => r.name === req.name || r.id === req.name) || rooms[req.name];
        res.room = room ? mapToRosRoom(room) : mapToRosRoom({});
        res.success = !!room;
        return true;
    }

    async registerRoomCallback(req, res) {
        const roomMsg = req.room;
        const room = {
            name: roomMsg.name,
            min_x: roomMsg.min_x,
            max_x: roomMsg.max_x,
            min_y: roomMsg.min_y,
            max_y: roomMsg.max_y,
            theta: roomMsg.theta,
            pose_x: roomMsg.pose_x,
            pose_y: roomMsg.pose_y,
            pose_theta: roomMsg.pose_theta,
        };
        await roomService.registerRoom(room);
        res.success = true;
        return true;
    }

    async updateRoomCallback(req, res) {
        const roomMsg = req.room;
        const room = {
            name: roomMsg.name,
            min_x: roomMsg.min_x,
            max_x: roomMsg.max_x,
            min_y: roomMsg.min_y,
            max_y: roomMsg.max_y,
            theta: roomMsg.theta,
            pose_x: roomMsg.pose_x,
            pose_y: roomMsg.pose_y,
            pose_theta: roomMsg.pose_theta,
        };
        // To update without an ID in the message, we can find by name
        const rooms = await roomService.getAllRooms();
        const existing = Object.values(rooms).find(r => r.name === room.name);
        if (existing) {
            room.id = existing.id;
            await roomService.updateRoom(room);
        }
        res.success = true;
        return true;
    }
}

export default new RoomRosService();

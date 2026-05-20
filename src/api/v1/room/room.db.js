import logger from '#utils/logger.js';
import { dbRepositories } from '#src/db/db.repositories.js';
import { AppDataSource } from '#src/db/datasources.js';

class RoomDB {
    constructor() {
        this.rooms;
    }

    get roomsDb() {
        return dbRepositories.room;
    }

    async readDbContent() {
        try {
            const roomsArr = await this.roomsDb.find({});
            this.rooms = {};
            for (const room of roomsArr) {
                this.rooms[room.id] = room;
            }
            return this.rooms;
        } catch (err) {
            if (!AppDataSource.isInitialized) {
                throw err;
            }
            logger.warn(`[ROOM DB] Failed to read DB, initializing empty: ${err.message}`);
            this.rooms = {};
            return this.rooms;
        }
    }

    async getAllRooms() {
        if (this.rooms) {
            return this.rooms;
        }
        return await this.readDbContent();
    }

    async getRoomById(id) {
        if (this.rooms) {
            return this.rooms[id]
        }
        const rooms = await this.readDbContent();
        return rooms[id]
    }

    async registerRoom(room) {
        const rooms = await this.getAllRooms();
        const saved = await this.roomsDb.save(room);
        rooms[saved.id] = saved;
        logger.info(`[ROOM DB] Saved room: ${saved.id}`);
        return saved;
    }

    async updateRoom(roomData) {
        const rooms = await this.getAllRooms();
        const id = roomData.id;
        const updateData = { ...roomData };
        delete updateData.id;

        await this.roomsDb.update({ id }, updateData);
        rooms[id] = { ...rooms[id], ...updateData };
        logger.info(`[ROOM DB] Updated room info: ${id}`);
        return rooms[id];
    }

    async deleteRoom(id) {
        const rooms = await this.getAllRooms();
        await this.roomsDb.delete({ id });
        delete rooms[id];
        logger.info(`[ROOM DB] Deleted room: ${id}`);
    }
}

export const roomDB = new RoomDB();
export default RoomDB;

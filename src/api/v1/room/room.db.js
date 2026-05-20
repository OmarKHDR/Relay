import logger from '#utils/logger.js';
import { dbRepositories } from '#src/db/db.repositories.js';

class RoomDB {
    constructor() {
        this.rooms = {};
        this.roomsDb = dbRepositories.room;
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
            logger.warn(`[ROOM DB] Failed to read DB, initializing empty:`, err.message);
            this.rooms = {};
            return this.rooms;
        }
    }

    async getDb() {
        return await this.readDbContent();
    }

    async registerRoom(room) {
        const saved = await this.roomsDb.save(room);
        this.rooms[saved.id] = saved;
        logger.info(`[ROOM DB] Saved room: ${saved.id}`);
        return saved;
    }

    async updateRoom(roomData) {
        const id = roomData.id;
        const updateData = { ...roomData };
        delete updateData.id;

        await this.roomsDb.update({ id }, updateData);
        this.rooms[id] = { ...this.rooms[id], ...updateData };
        logger.info(`[ROOM DB] Updated room info: ${id}`);
        return this.rooms[id];
    }

    async deleteRoom(id) {
        await this.roomsDb.delete({ id });
        delete this.rooms[id];
        logger.info(`[ROOM DB] Deleted room: ${id}`);
    }
}

export const roomDB = new RoomDB();
export default RoomDB;

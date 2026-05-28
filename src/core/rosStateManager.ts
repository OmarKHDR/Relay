import rosHandler from '@/lib/ros/connection.js';
import logger from '@/utils/logger.js';
import { rosExcuter } from './rosExecuter.js';
import type { ROS, RosMount } from './types/Ros.types.js';

class RosStateManager {
    private configs = new Map<string, ROS>();
    private mounts = new Map<string, RosMount>();

    constructor() {
        rosHandler.on('ros_reconnected', () => {
            this.rebuildAll();
        });
    }

    register(key: string, config: ROS) {
        this.configs.set(key, config);
        this.rebuild(key);
    }

    get(key: string) {
        const mount = this.mounts.get(key);

        if (!mount) {
            throw new Error(`ROS communication is not ready for key: ${key}`);
        }

        return mount;
    }

    private rebuildAll() {
        for (const key of this.configs.keys()) {
            this.rebuild(key);
        }
    }

    private rebuild(key: string) {
        const config = this.configs.get(key);

        if (!config) {
            throw new Error(`ROS config was not registered for key: ${key}`);
        }

        try {
            this.mounts.set(key, rosExcuter.buildRosObject(config));
            logger.info(`[ROS STATE MANAGER] rebuilt ros object for key: ${key}`);
        } catch (error) {
            logger.warn(
                `[ROS STATE MANAGER] failed to rebuild ros object for key: ${key}`,
                error
            );
            this.mounts.delete(key);
        }
    }
}

export const rosStateManager = new RosStateManager();

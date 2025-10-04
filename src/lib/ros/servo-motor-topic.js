import rosHandler from '#lib/connection.js';
import logger from '#utils/logger.js';

class ServoMotor {
    constructor() {
        if (ServoMotor.instance) {
            return ServoMotor.instance;
        }
    }
}

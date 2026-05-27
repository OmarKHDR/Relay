import { Repository } from 'typeorm';
import SalutationSchema from ''
export class RobotDB {
    robotRepository: Repository<SalutationSchema>;
    static async init() {}
}
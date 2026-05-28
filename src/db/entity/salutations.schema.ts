import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export default class SalutationSchema {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;
}

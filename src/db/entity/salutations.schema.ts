import { EntitySchema, PrimaryGeneratedColumn, Column } from 'typeorm';

@EntitySchema()
class SalutationSchema {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    name: string;
}

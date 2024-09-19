import {Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn} from "typeorm";

@Entity()
export class Log {
    @PrimaryGeneratedColumn('increment', {type: 'bigint'})
    id: number

    @Column({nullable: true})
    source: string

    @Column({nullable: true})
    type: string

    @Column({nullable: true})
    description: string

    @Column({nullable: true})
    data: string

    @CreateDateColumn({type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)"})
    public created_at: Date

    @UpdateDateColumn({type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)"})
    public updated_at: Date
}
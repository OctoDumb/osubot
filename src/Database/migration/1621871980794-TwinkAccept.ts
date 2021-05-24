import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class TwinkAccept1621871980794 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'twinkaccept',
            columns: [{
                name: 'id',
                type: 'integer',
                isPrimary: true,
                isGenerated: true,
                generationStrategy: 'increment'
            }, {
                name: 'senderId',
                type: 'integer'
            }, {
                name: 'receiverId',
                type: 'integer'
            }, {
                name: 'server',
                type: 'text'
            }]
        }), true)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('twinkaccept', true, true, true);
    }

}

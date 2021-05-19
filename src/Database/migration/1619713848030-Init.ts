import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class Init1619713848030 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'covers',
            columns: [{
                name: 'id',
                type: 'integer',
                isPrimary: true,
                isGenerated: true,
                generationStrategy: "increment"
            }, {
                name: 'attachment',
                type: 'text'
            }]
        }), true)

        await queryRunner.createTable(new Table({
            name: 'newsrules',
            columns: [{
                name: 'id',
                type: 'integer',
                isPrimary: true,
                isGenerated: true,
                generationStrategy: "increment"
            }, {
                name: 'peerId',
                type: 'integer'
            }, {
                name: 'type',
                type: 'text'
            }, {
                name: 'enabled',
                type: 'boolean'
            }, {
                name: 'filters',
                type: 'text'
            }]
        }), true);

        await queryRunner.createTable(new Table({
            name: 'stats',
            columns: [{
                name: 'id',
                type: 'integer',
                isPrimary: true,
                isGenerated: true,
                generationStrategy: "increment"
            }, {
                name: 'server',
                type: 'text'
            }, {
                name: 'playerId',
                type: 'integer'
            }, {
                name: 'mode',
                type: 'integer'
            }, {
                name: 'rank',
                type: 'integer',
                default: 9999999
            }, {
                name: 'pp',
                type: 'float',
                default: 0
            }, {
                name: 'accuracy',
                type: 'float',
                default: 100
            }]
        }), true);

        await queryRunner.createTable(new Table({
            name: 'roles',
            columns: [{
                name: 'id',
                type: 'integer',
                isPrimary: true,
                isGenerated: true,
                generationStrategy: "increment"
            }, {
                name: 'name',
                type: 'text'
            }, {
                name: 'permissions',
                type: 'text',
                isNullable: true
            }]
        }), true);

        await queryRunner.createTable(new Table({
            name: 'statuses',
            columns: [{
                name: 'id',
                type: 'integer',
                isPrimary: true,
                isGenerated: true,
                generationStrategy: "increment"
            }, {
                name: 'name',
                type: 'text'
            }, {
                name: 'emoji',
                type: 'text'
            }, {
                name: 'description',
                type: 'text'
            }]
        }), true);

        await queryRunner.createTable(new Table({
            name: 'users',
            columns: [{
                name: 'id',
                type: 'integer',
                isPrimary: true
            }, {
                name: 'roleId',
                type: 'integer'
            }, {
                name: 'statusId',
                type: 'integer',
                isNullable: true
            }],
            foreignKeys: [{
                columnNames: ['roleId'],
                referencedTableName: 'roles',
                referencedColumnNames: ['id']
            }, {
                columnNames: ['statusId'],
                referencedTableName: 'statuses',
                referencedColumnNames: ['id']
            }]
        }), true);

        await queryRunner.createTable(new Table({
            name: 'connections',
            columns: [{
                name: 'id',
                type: 'integer',
                isPrimary: true,
                isGenerated: true,
                generationStrategy: "increment"
            }, {
                name: 'server',
                type: 'text'
            }, {
                name: 'userId',
                type: 'integer'
            }, {
                name: 'playerId',
                type: 'integer'
            }, {
                name: 'nickname',
                type: 'text'
            }, {
                name: 'mode',
                type: 'integer'
            }],
            foreignKeys: [{
                columnNames: ['userId'],
                referencedTableName: 'users',
                referencedColumnNames: ['id']
            }]
        }), true);

        await queryRunner.createTable(new Table({
            name: 'notifications',
            columns: [{
                name: 'id',
                type: 'integer',
                isPrimary: true,
                isGenerated: true,
                generationStrategy: "increment"
            }, {
                name: 'userId',
                type: 'integer'
            }, {
                name: 'message',
                type: 'text'
            }, {
                name: 'delivered',
                type: 'boolean',
                default: false
            }],
            foreignKeys: [{
                columnNames: ['userId'],
                referencedTableName: 'users',
                referencedColumnNames: ['id']
            }]
        }), true);

        await queryRunner.createTable(new Table({
            name: 'bans',
            columns: [{
                name: 'id',
                type: 'integer',
                isPrimary: true,
                isGenerated: true,
                generationStrategy: "increment"
            }, {
                name: 'userId',
                type: 'integer'
            }, {
                name: 'until',
                type: 'integer'
            }, {
                name: 'reason',
                type: 'text'
            }],
            foreignKeys: [{
                columnNames: ['userId'],
                referencedTableName: 'users',
                referencedColumnNames: ['id']
            }]
        }), true);

        await queryRunner.createTable(new Table({
            name: 'statusesowned',
            columns: [{
                name: 'id',
                type: 'integer',
                isPrimary: true,
                isGenerated: true,
                generationStrategy: "increment"
            }, {
                name: 'userId',
                type: 'integer'
            }, {
                name: 'statusId',
                type: 'integer'
            }],
            foreignKeys: [{
                columnNames: ['userId'],
                referencedTableName: 'users',
                referencedColumnNames: ['id']
            }, {
                columnNames: ['statusId'],
                referencedTableName: 'statuses',
                referencedColumnNames: ['id']
            }]
        }), true);

        await queryRunner.query('INSERT INTO `roles` ( "name" ) VALUES ( "Default" )');
        await queryRunner.query('INSERT INTO `roles` ( "name", "permissions" ) VALUES ( "Owner", "*" )');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('covers', true, true, true);
        await queryRunner.dropTable('newsrules', true, true, true);
        await queryRunner.dropTable('stats', true, true, true);
        await queryRunner.dropTable('roles', true, true, true);
        await queryRunner.dropTable('statuses', true, true, true);
        await queryRunner.dropTable('users', true, true, true);
        await queryRunner.dropTable('connections', true, true, true);
        await queryRunner.dropTable('notifications', true, true, true);
        await queryRunner.dropTable('bans', true, true, true);
        await queryRunner.dropTable('statusesowned', true, true, true);
    }

}

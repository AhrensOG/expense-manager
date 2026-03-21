import 'dotenv/config';
import { sequelize } from '../src/db';
import { Migration } from './types';
import { DataTypes } from 'sequelize';
import fs from 'fs';
import path from 'path';

const MIGRATIONS_DIR = __dirname;
const SCHEMA_TABLE = 'schema_migrations';

interface AppliedMigration {
  id: string;
  name: string;
  applied_at: Date;
}

async function createSchemaTable() {
  const queryInterface = sequelize.getQueryInterface();
  
  try {
    const results = await sequelize.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '${SCHEMA_TABLE}'
      ) as exists`
    ) as unknown as [{ exists: boolean }];
    const tableExists = results?.[0]?.exists ?? false;
    
    if (!tableExists) {
      await queryInterface.createTable(SCHEMA_TABLE, {
        id: {
          type: DataTypes.STRING(10),
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        applied_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      });
      console.log(`✅ Created table: ${SCHEMA_TABLE}`);
    }
  } catch (error) {
    console.error('Error creating schema table:', error);
    throw error;
  }
}

async function getAppliedMigrations(): Promise<AppliedMigration[]> {
  const [results] = await sequelize.query(
    `SELECT id, name, applied_at FROM ${SCHEMA_TABLE} ORDER BY applied_at ASC`
  ) as [AppliedMigration[], unknown];
  return results || [];
}

async function recordMigration(migration: Migration) {
  await sequelize.query(
    `INSERT INTO ${SCHEMA_TABLE} (id, name, applied_at) VALUES (:id, :name, :applied_at)`,
    {
      replacements: {
        id: migration.id,
        name: migration.name,
        applied_at: new Date(),
      },
    }
  );
}

async function removeMigrationRecord(migration: Migration) {
  await sequelize.query(
    `DELETE FROM ${SCHEMA_TABLE} WHERE id = :id`,
    {
      replacements: { id: migration.id },
    }
  );
}

function loadMigrations(): Migration[] {
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.ts') && f !== 'run.ts' && f !== 'types.ts')
    .sort();
  
  const migrations: Migration[] = [];
  
  for (const file of files) {
    const filePath = path.join(MIGRATIONS_DIR, file);
    const migration = require(filePath);
    
    if (migration.up && migration.down && migration.info) {
      migrations.push({
        up: migration.up,
        down: migration.down,
        ...migration.info,
      });
    }
  }
  
  return migrations;
}

async function runMigrations() {
  console.log('🔄 Starting migrations...\n');
  
  try {
    const migrations = loadMigrations();
    
    if (migrations.length === 0) {
      console.log('No migrations found.');
      process.exit(0);
      return;
    }
    
    await createSchemaTable();
    const appliedMigrations = await getAppliedMigrations();
    const appliedIds = new Set(appliedMigrations.map(m => m.id));
    
    const pendingMigrations = migrations.filter(m => !appliedIds.has(m.id));
    
    if (pendingMigrations.length === 0) {
      console.log('✅ All migrations are up to date.');
      process.exit(0);
      return;
    }
    
    console.log(`📋 Found ${pendingMigrations.length} pending migration(s):\n`);
    
    for (const migration of pendingMigrations) {
      console.log(`  → ${migration.id}: ${migration.name}`);
    }
    console.log('');
    
    for (const migration of pendingMigrations) {
      console.log(`\n⬆️  Running: ${migration.name}...`);
      
      try {
        await migration.up(sequelize.getQueryInterface() as any);
        await recordMigration(migration);
        console.log(`✅ Applied: ${migration.name}`);
      } catch (error) {
        console.error(`❌ Failed: ${migration.name}`);
        console.error(error);
        process.exit(1);
      }
    }
    
    console.log('\n🎉 All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

async function rollbackMigration() {
  console.log('🔄 Rolling back last migration...\n');
  
  try {
    const migrations = loadMigrations();
    
    if (migrations.length === 0) {
      console.log('No migrations to rollback.');
      process.exit(0);
      return;
    }
    
    await createSchemaTable();
    const appliedMigrations = await getAppliedMigrations();
    
    if (appliedMigrations.length === 0) {
      console.log('No migrations applied to rollback.');
      process.exit(0);
      return;
    }
    
    const lastApplied = appliedMigrations[appliedMigrations.length - 1];
    const migration = migrations.find(m => m.id === lastApplied.id);
    
    if (!migration) {
      console.error(`❌ Migration not found: ${lastApplied.id}`);
      process.exit(1);
    }
    
    console.log(`⬇️  Rolling back: ${migration.name}...\n`);
    
    try {
      await migration.down(sequelize.getQueryInterface() as any);
      await removeMigrationRecord(migration);
      console.log(`✅ Rolled back: ${migration.name}`);
    } catch (error) {
      console.error(`❌ Failed to rollback: ${migration.name}`);
      console.error(error);
      process.exit(1);
    }
    
    console.log('\n🎉 Rollback completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Rollback error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

const args = process.argv.slice(2);
if (args.includes('--rollback')) {
  rollbackMigration();
} else {
  runMigrations();
}

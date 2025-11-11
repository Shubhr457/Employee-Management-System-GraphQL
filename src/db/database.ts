import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { Database as SQLiteDatabase } from 'sqlite3';

export interface Database {
  run(sql: string, params?: any[]): Promise<{ lastID: number; changes: number }>;
  get<T = any>(sql: string, params?: any[]): Promise<T | undefined>;
  all<T = any>(sql: string, params?: any[]): Promise<T[]>;
  close(): Promise<void>;
}

class SQLiteDatabaseWrapper implements Database {
  private db: sqlite3.Database;

  constructor(db: sqlite3.Database) {
    this.db = db;
  }

  run(sql: string, params?: any[]): Promise<{ lastID: number; changes: number }> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params || [], function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  get<T = any>(sql: string, params?: any[]): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params || [], (err, row) => {
        if (err) reject(err);
        else resolve(row as T | undefined);
      });
    });
  }

  all<T = any>(sql: string, params?: any[]): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params || [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows as T[]);
      });
    });
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

let dbInstance: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = process.env.DATABASE_PATH || './employee_management.db';
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database:', err);
      throw err;
    }
    console.log('Connected to SQLite database');
  });

  dbInstance = new SQLiteDatabaseWrapper(db);
  await initializeDatabase(dbInstance);
  return dbInstance;
}

async function initializeDatabase(db: Database): Promise<void> {
  // Create departments table
  await db.run(`
    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Create roles table
  await db.run(`
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL UNIQUE,
      description TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Create employees table
  await db.run(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      departmentId INTEGER NOT NULL,
      roleId INTEGER NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (departmentId) REFERENCES departments(id) ON DELETE RESTRICT,
      FOREIGN KEY (roleId) REFERENCES roles(id) ON DELETE RESTRICT
    )
  `);

  // Create indexes for better query performance
  await db.run(`CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(departmentId)`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(roleId)`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email)`);
}

export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
  }
}


import { Database } from '../db/database';
import { EmployeeModel, EmployeeWithRelations } from './Employee';

export interface Role {
  id: number;
  title: string;
  description: string | null;
  createdAt: string;
}

export class RoleModel {
  private employeeModel: EmployeeModel;

  constructor(private db: Database) {
    this.employeeModel = new EmployeeModel(db);
  }

  async findAll(): Promise<Role[]> {
    return this.db.all<Role>('SELECT * FROM roles ORDER BY createdAt DESC');
  }

  async findById(id: number): Promise<Role | null> {
    return this.db.get<Role>('SELECT * FROM roles WHERE id = ?', [id]);
  }

  async getEmployees(roleId: number): Promise<EmployeeWithRelations[]> {
    return this.employeeModel.findByRole(roleId);
  }

  async create(data: { title: string; description?: string }): Promise<Role> {
    const result = await this.db.run(
      `INSERT INTO roles (title, description, createdAt)
       VALUES (?, ?, datetime('now'))`,
      [data.title, data.description || null]
    );

    const role = await this.findById(result.lastID);
    if (!role) {
      throw new Error('Failed to create role');
    }

    return role;
  }

  async update(id: number, data: Partial<{ title: string; description: string }>): Promise<Role> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) {
      updates.push('title = ?');
      values.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }

    if (updates.length === 0) {
      const role = await this.findById(id);
      if (!role) {
        throw new Error('Role not found');
      }
      return role;
    }

    values.push(id);

    await this.db.run(
      `UPDATE roles SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const role = await this.findById(id);
    if (!role) {
      throw new Error('Role not found');
    }

    return role;
  }

  async delete(id: number): Promise<boolean> {
    // Check if there are employees with this role
    const employees = await this.db.all('SELECT id FROM employees WHERE roleId = ?', [id]);
    if (employees.length > 0) {
      throw new Error('Cannot delete role with existing employees');
    }

    const result = await this.db.run('DELETE FROM roles WHERE id = ?', [id]);
    return result.changes > 0;
  }
}


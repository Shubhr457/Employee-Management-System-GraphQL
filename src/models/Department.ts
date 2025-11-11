import { Database } from '../db/database';
import { EmployeeModel, EmployeeWithRelations } from './Employee';

export interface Department {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
}

export class DepartmentModel {
  private employeeModel: EmployeeModel;

  constructor(private db: Database) {
    this.employeeModel = new EmployeeModel(db);
  }

  async findAll(): Promise<Department[]> {
    return this.db.all<Department>('SELECT * FROM departments ORDER BY createdAt DESC');
  }

  async findById(id: number): Promise<Department | null> {
    return this.db.get<Department>('SELECT * FROM departments WHERE id = ?', [id]);
  }

  async getEmployees(departmentId: number): Promise<EmployeeWithRelations[]> {
    return this.employeeModel.findByDepartment(departmentId);
  }

  async create(data: { name: string; description?: string }): Promise<Department> {
    const result = await this.db.run(
      `INSERT INTO departments (name, description, createdAt)
       VALUES (?, ?, datetime('now'))`,
      [data.name, data.description || null]
    );

    const department = await this.findById(result.lastID);
    if (!department) {
      throw new Error('Failed to create department');
    }

    return department;
  }

  async update(id: number, data: Partial<{ name: string; description: string }>): Promise<Department> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }

    if (updates.length === 0) {
      const department = await this.findById(id);
      if (!department) {
        throw new Error('Department not found');
      }
      return department;
    }

    values.push(id);

    await this.db.run(
      `UPDATE departments SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const department = await this.findById(id);
    if (!department) {
      throw new Error('Department not found');
    }

    return department;
  }

  async delete(id: number): Promise<boolean> {
    // Check if there are employees in this department
    const employees = await this.db.all('SELECT id FROM employees WHERE departmentId = ?', [id]);
    if (employees.length > 0) {
      throw new Error('Cannot delete department with existing employees');
    }

    const result = await this.db.run('DELETE FROM departments WHERE id = ?', [id]);
    return result.changes > 0;
  }
}


import { Database } from '../db/database';

export interface Employee {
  id: number;
  name: string;
  email: string;
  departmentId: number;
  roleId: number;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeWithRelations extends Employee {
  department: {
    id: number;
    name: string;
    description: string | null;
    createdAt: string;
  };
  role: {
    id: number;
    title: string;
    description: string | null;
    createdAt: string;
  };
}

export class EmployeeModel {
  constructor(private db: Database) {}

  async findAll(): Promise<EmployeeWithRelations[]> {
    const employees = await this.db.all<Employee>(`
      SELECT * FROM employees ORDER BY createdAt DESC
    `);

    return Promise.all(
      employees.map(async (emp) => {
        const department = await this.db.get<{ id: number; name: string; description: string | null; createdAt: string }>(
          'SELECT * FROM departments WHERE id = ?',
          [emp.departmentId]
        );
        const role = await this.db.get<{ id: number; title: string; description: string | null; createdAt: string }>(
          'SELECT * FROM roles WHERE id = ?',
          [emp.roleId]
        );

        if (!department || !role) {
          throw new Error('Department or role not found');
        }

        return {
          ...emp,
          department,
          role,
        };
      })
    );
  }

  async findById(id: number): Promise<EmployeeWithRelations | null> {
    const employee = await this.db.get<Employee>(
      'SELECT * FROM employees WHERE id = ?',
      [id]
    );

    if (!employee) {
      return null;
    }

    const department = await this.db.get<{ id: number; name: string; description: string | null; createdAt: string }>(
      'SELECT * FROM departments WHERE id = ?',
      [employee.departmentId]
    );
    const role = await this.db.get<{ id: number; title: string; description: string | null; createdAt: string }>(
      'SELECT * FROM roles WHERE id = ?',
      [employee.roleId]
    );

    if (!department || !role) {
      throw new Error('Department or role not found');
    }

    return {
      ...employee,
      department,
      role,
    };
  }

  async findByDepartment(departmentId: number): Promise<EmployeeWithRelations[]> {
    const employees = await this.db.all<Employee>(
      'SELECT * FROM employees WHERE departmentId = ? ORDER BY createdAt DESC',
      [departmentId]
    );

    const department = await this.db.get<{ id: number; name: string; description: string | null; createdAt: string }>(
      'SELECT * FROM departments WHERE id = ?',
      [departmentId]
    );

    if (!department) {
      throw new Error('Department not found');
    }

    return Promise.all(
      employees.map(async (emp) => {
        const role = await this.db.get<{ id: number; title: string; description: string | null; createdAt: string }>(
          'SELECT * FROM roles WHERE id = ?',
          [emp.roleId]
        );

        if (!role) {
          throw new Error('Role not found');
        }

        return {
          ...emp,
          department,
          role,
        };
      })
    );
  }

  async findByRole(roleId: number): Promise<EmployeeWithRelations[]> {
    const employees = await this.db.all<Employee>(
      'SELECT * FROM employees WHERE roleId = ? ORDER BY createdAt DESC',
      [roleId]
    );

    const role = await this.db.get<{ id: number; title: string; description: string | null; createdAt: string }>(
      'SELECT * FROM roles WHERE id = ?',
      [roleId]
    );

    if (!role) {
      throw new Error('Role not found');
    }

    return Promise.all(
      employees.map(async (emp) => {
        const department = await this.db.get<{ id: number; name: string; description: string | null; createdAt: string }>(
          'SELECT * FROM departments WHERE id = ?',
          [emp.departmentId]
        );

        if (!department) {
          throw new Error('Department not found');
        }

        return {
          ...emp,
          department,
          role,
        };
      })
    );
  }

  async create(data: { name: string; email: string; departmentId: number; roleId: number }): Promise<EmployeeWithRelations> {
    // Verify department and role exist
    const department = await this.db.get('SELECT * FROM departments WHERE id = ?', [data.departmentId]);
    if (!department) {
      throw new Error('Department not found');
    }

    const role = await this.db.get('SELECT * FROM roles WHERE id = ?', [data.roleId]);
    if (!role) {
      throw new Error('Role not found');
    }

    const result = await this.db.run(
      `INSERT INTO employees (name, email, departmentId, roleId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [data.name, data.email, data.departmentId, data.roleId]
    );

    const employee = await this.findById(result.lastID);
    if (!employee) {
      throw new Error('Failed to create employee');
    }

    return employee;
  }

  async update(id: number, data: Partial<{ name: string; email: string; departmentId: number; roleId: number }>): Promise<EmployeeWithRelations> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.email !== undefined) {
      updates.push('email = ?');
      values.push(data.email);
    }
    if (data.departmentId !== undefined) {
      // Verify department exists
      const department = await this.db.get('SELECT * FROM departments WHERE id = ?', [data.departmentId]);
      if (!department) {
        throw new Error('Department not found');
      }
      updates.push('departmentId = ?');
      values.push(data.departmentId);
    }
    if (data.roleId !== undefined) {
      // Verify role exists
      const role = await this.db.get('SELECT * FROM roles WHERE id = ?', [data.roleId]);
      if (!role) {
        throw new Error('Role not found');
      }
      updates.push('roleId = ?');
      values.push(data.roleId);
    }

    if (updates.length === 0) {
      const employee = await this.findById(id);
      if (!employee) {
        throw new Error('Employee not found');
      }
      return employee;
    }

    updates.push("updatedAt = datetime('now')");
    values.push(id);

    await this.db.run(
      `UPDATE employees SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const employee = await this.findById(id);
    if (!employee) {
      throw new Error('Employee not found');
    }

    return employee;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db.run('DELETE FROM employees WHERE id = ?', [id]);
    return result.changes > 0;
  }
}


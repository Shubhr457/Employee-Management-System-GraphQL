import { Database } from '../db/database';
import { EmployeeModel, EmployeeWithRelations } from '../models/Employee';
import { DepartmentModel, Department } from '../models/Department';
import { RoleModel, Role } from '../models/Role';

export interface Context {
  db: Database;
  employeeModel: EmployeeModel;
  departmentModel: DepartmentModel;
  roleModel: RoleModel;
}

const mapEmployeeToGraphQL = (emp: EmployeeWithRelations) => ({
  id: String(emp.id),
  name: emp.name,
  email: emp.email,
  department: {
    id: String(emp.department.id),
    name: emp.department.name,
    description: emp.department.description,
    createdAt: emp.department.createdAt,
  },
  role: {
    id: String(emp.role.id),
    title: emp.role.title,
    description: emp.role.description,
    createdAt: emp.role.createdAt,
  },
  createdAt: emp.createdAt,
  updatedAt: emp.updatedAt,
});

const mapDepartmentToGraphQL = (dept: Department) => ({
  id: String(dept.id),
  name: dept.name,
  description: dept.description,
  createdAt: dept.createdAt,
});

const mapRoleToGraphQL = (role: Role) => ({
  id: String(role.id),
  title: role.title,
  description: role.description,
  createdAt: role.createdAt,
});

export const resolvers = {
  Query: {
    employees: async (_: any, __: any, context: Context) => {
      const employees = await context.employeeModel.findAll();
      return employees.map(mapEmployeeToGraphQL);
    },

    employee: async (_: any, { id }: { id: string }, context: Context) => {
      const employee = await context.employeeModel.findById(parseInt(id));
      if (!employee) {
        return null;
      }
      return mapEmployeeToGraphQL(employee);
    },

    employeesByDepartment: async (_: any, { departmentId }: { departmentId: string }, context: Context) => {
      const employees = await context.employeeModel.findByDepartment(parseInt(departmentId));
      return employees.map(mapEmployeeToGraphQL);
    },

    employeesByRole: async (_: any, { roleId }: { roleId: string }, context: Context) => {
      const employees = await context.employeeModel.findByRole(parseInt(roleId));
      return employees.map(mapEmployeeToGraphQL);
    },

    departments: async (_: any, __: any, context: Context) => {
      const departments = await context.departmentModel.findAll();
      return departments.map(mapDepartmentToGraphQL);
    },

    department: async (_: any, { id }: { id: string }, context: Context) => {
      const department = await context.departmentModel.findById(parseInt(id));
      if (!department) {
        return null;
      }
      return mapDepartmentToGraphQL(department);
    },

    roles: async (_: any, __: any, context: Context) => {
      const roles = await context.roleModel.findAll();
      return roles.map(mapRoleToGraphQL);
    },

    role: async (_: any, { id }: { id: string }, context: Context) => {
      const role = await context.roleModel.findById(parseInt(id));
      if (!role) {
        return null;
      }
      return mapRoleToGraphQL(role);
    },
  },

  Mutation: {
    createEmployee: async (_: any, { input }: { input: any }, context: Context) => {
      const employee = await context.employeeModel.create({
        name: input.name,
        email: input.email,
        departmentId: parseInt(input.departmentId),
        roleId: parseInt(input.roleId),
      });
      return mapEmployeeToGraphQL(employee);
    },

    updateEmployee: async (_: any, { id, input }: { id: string; input: any }, context: Context) => {
      const updateData: any = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.email !== undefined) updateData.email = input.email;
      if (input.departmentId !== undefined) updateData.departmentId = parseInt(input.departmentId);
      if (input.roleId !== undefined) updateData.roleId = parseInt(input.roleId);

      const employee = await context.employeeModel.update(parseInt(id), updateData);
      return mapEmployeeToGraphQL(employee);
    },

    deleteEmployee: async (_: any, { id }: { id: string }, context: Context) => {
      return await context.employeeModel.delete(parseInt(id));
    },

    createDepartment: async (_: any, { input }: { input: any }, context: Context) => {
      const department = await context.departmentModel.create({
        name: input.name,
        description: input.description,
      });
      return mapDepartmentToGraphQL(department);
    },

    updateDepartment: async (_: any, { id, input }: { input: any; id: string }, context: Context) => {
      const updateData: any = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.description !== undefined) updateData.description = input.description;

      const department = await context.departmentModel.update(parseInt(id), updateData);
      return mapDepartmentToGraphQL(department);
    },

    deleteDepartment: async (_: any, { id }: { id: string }, context: Context) => {
      return await context.departmentModel.delete(parseInt(id));
    },

    createRole: async (_: any, { input }: { input: any }, context: Context) => {
      const role = await context.roleModel.create({
        title: input.title,
        description: input.description,
      });
      return mapRoleToGraphQL(role);
    },

    updateRole: async (_: any, { id, input }: { input: any; id: string }, context: Context) => {
      const updateData: any = {};
      if (input.title !== undefined) updateData.title = input.title;
      if (input.description !== undefined) updateData.description = input.description;

      const role = await context.roleModel.update(parseInt(id), updateData);
      return mapRoleToGraphQL(role);
    },

    deleteRole: async (_: any, { id }: { id: string }, context: Context) => {
      return await context.roleModel.delete(parseInt(id));
    },
  },

  Department: {
    employees: async (parent: any, __: any, context: Context) => {
      const employees = await context.employeeModel.findByDepartment(parseInt(parent.id));
      return employees.map(mapEmployeeToGraphQL);
    },
  },

  Role: {
    employees: async (parent: any, __: any, context: Context) => {
      const employees = await context.employeeModel.findByRole(parseInt(parent.id));
      return employees.map(mapEmployeeToGraphQL);
    },
  },
};


import { getDatabase, closeDatabase } from './database';
import { DepartmentModel } from '../models/Department';
import { RoleModel } from '../models/Role';
import { EmployeeModel } from '../models/Employee';

async function seed() {
  const db = await getDatabase();
  const departmentModel = new DepartmentModel(db);
  const roleModel = new RoleModel(db);
  const employeeModel = new EmployeeModel(db);

  try {
    console.log('🌱 Seeding database...');

    // Create departments
    const engineering = await departmentModel.create({
      name: 'Engineering',
      description: 'Software development and technical operations',
    });
    console.log('✅ Created Engineering department');

    const marketing = await departmentModel.create({
      name: 'Marketing',
      description: 'Marketing and communications',
    });
    console.log('✅ Created Marketing department');

    const hr = await departmentModel.create({
      name: 'Human Resources',
      description: 'HR and talent management',
    });
    console.log('✅ Created Human Resources department');

    // Create roles
    const seniorDev = await roleModel.create({
      title: 'Senior Developer',
      description: 'Senior software developer',
    });
    console.log('✅ Created Senior Developer role');

    const juniorDev = await roleModel.create({
      title: 'Junior Developer',
      description: 'Junior software developer',
    });
    console.log('✅ Created Junior Developer role');

    const marketingManager = await roleModel.create({
      title: 'Marketing Manager',
      description: 'Manages marketing campaigns and strategies',
    });
    console.log('✅ Created Marketing Manager role');

    const hrSpecialist = await roleModel.create({
      title: 'HR Specialist',
      description: 'Handles recruitment and employee relations',
    });
    console.log('✅ Created HR Specialist role');

    // Create employees
    await employeeModel.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      departmentId: engineering.id,
      roleId: seniorDev.id,
    });
    console.log('✅ Created employee: John Doe');

    await employeeModel.create({
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      departmentId: engineering.id,
      roleId: juniorDev.id,
    });
    console.log('✅ Created employee: Jane Smith');

    await employeeModel.create({
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      departmentId: marketing.id,
      roleId: marketingManager.id,
    });
    console.log('✅ Created employee: Bob Johnson');

    await employeeModel.create({
      name: 'Alice Williams',
      email: 'alice.williams@example.com',
      departmentId: hr.id,
      roleId: hrSpecialist.id,
    });
    console.log('✅ Created employee: Alice Williams');

    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await closeDatabase();
  }
}

seed().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});


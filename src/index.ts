import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { readFileSync } from 'fs';
import { join } from 'path';
import { existsSync } from 'fs';
import { getDatabase } from './db/database';
import { EmployeeModel } from './models/Employee';
import { DepartmentModel } from './models/Department';
import { RoleModel } from './models/Role';
import { resolvers, Context } from './resolvers/resolvers';

// Resolve schema path for both dev and production
let schemaPath = join(__dirname, './schema/schema.graphql');
if (!existsSync(schemaPath)) {
  // Fallback for production build
  schemaPath = join(process.cwd(), 'src/schema/schema.graphql');
}

const typeDefs = readFileSync(schemaPath, {
  encoding: 'utf-8',
});

async function startServer() {
  // Initialize database
  const db = await getDatabase();

  // Initialize models
  const employeeModel = new EmployeeModel(db);
  const departmentModel = new DepartmentModel(db);
  const roleModel = new RoleModel(db);

  // Create context
  const context: Context = {
    db,
    employeeModel,
    departmentModel,
    roleModel,
  };

  // Create Apollo Server
  const server = new ApolloServer<Context>({
    typeDefs,
    resolvers,
  });

  const port = process.env.PORT || 4000;

  const { url } = await startStandaloneServer(server, {
    context: async () => context,
    listen: { port: Number(port) },
  });

  console.log(`🚀 Server ready at: ${url}`);
  console.log(`📊 GraphQL Playground available at: ${url}`);
}

startServer().catch((error) => {
  console.error('Error starting server:', error);
  process.exit(1);
});


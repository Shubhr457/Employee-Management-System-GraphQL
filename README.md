# Employee Management System - GraphQL

A comprehensive Employee Management System built with Node.js, Apollo Server, TypeScript, and SQLite (with PostgreSQL support).

## Features

- ✅ Manage employees, departments, and roles
- ✅ Query employees by department or role
- ✅ Add/update/delete employees
- ✅ Full CRUD operations for all entities
- ✅ Type-safe with TypeScript
- ✅ GraphQL API with Apollo Server

## Tech Stack

- **Runtime**: Node.js
- **GraphQL Server**: Apollo Server 4
- **Language**: TypeScript
- **Database**: SQLite (easily switchable to PostgreSQL)

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Employee-Management-System-GraphQL
```

2. Install dependencies:
```bash
npm install
```

3. Seed the database with sample data (optional):
```bash
npm run db:seed
```

## Running the Application

### Development Mode
```bash
npm run dev
```

The server will start on `http://localhost:4000` by default.

### Production Mode
```bash
npm run build
npm start
```

## GraphQL Playground

Once the server is running, you can access the GraphQL Playground at:
```
http://localhost:4000
```

## Example Queries

### Get All Employees
```graphql
query {
  employees {
    id
    name
    email
    department {
      id
      name
    }
    role {
      id
      title
    }
  }
}
```

### Get Employee by ID
```graphql
query {
  employee(id: "1") {
    id
    name
    email
    department {
      name
      description
    }
    role {
      title
      description
    }
  }
}
```

### Get Employees by Department
```graphql
query {
  employeesByDepartment(departmentId: "1") {
    id
    name
    email
    role {
      title
    }
  }
}
```

### Get Employees by Role
```graphql
query {
  employeesByRole(roleId: "1") {
    id
    name
    email
    department {
      name
    }
  }
}
```

### Get All Departments
```graphql
query {
  departments {
    id
    name
    description
    employees {
      id
      name
      email
    }
  }
}
```

### Get All Roles
```graphql
query {
  roles {
    id
    title
    description
    employees {
      id
      name
      email
    }
  }
}
```

## Example Mutations

### Create Employee
```graphql
mutation {
  createEmployee(input: {
    name: "John Doe"
    email: "john.doe@example.com"
    departmentId: "1"
    roleId: "1"
  }) {
    id
    name
    email
    department {
      name
    }
    role {
      title
    }
  }
}
```

### Update Employee
```graphql
mutation {
  updateEmployee(id: "1", input: {
    name: "John Updated"
    email: "john.updated@example.com"
  }) {
    id
    name
    email
  }
}
```

### Delete Employee
```graphql
mutation {
  deleteEmployee(id: "1")
}
```

### Create Department
```graphql
mutation {
  createDepartment(input: {
    name: "Sales"
    description: "Sales and customer relations"
  }) {
    id
    name
    description
  }
}
```

### Create Role
```graphql
mutation {
  createRole(input: {
    title: "Product Manager"
    description: "Manages product development"
  }) {
    id
    title
    description
  }
}
```

## Project Structure

```
Employee-Management-System-GraphQL/
├── src/
│   ├── db/
│   │   ├── database.ts      # Database connection and initialization
│   │   └── seed.ts          # Database seeding script
│   ├── models/
│   │   ├── Employee.ts      # Employee model and business logic
│   │   ├── Department.ts    # Department model and business logic
│   │   └── Role.ts          # Role model and business logic
│   ├── resolvers/
│   │   └── resolvers.ts     # GraphQL resolvers
│   ├── schema/
│   │   └── schema.graphql   # GraphQL schema definition
│   └── index.ts             # Application entry point
├── package.json
├── tsconfig.json
└── README.md
```

## Database

The application uses SQLite by default. The database file (`employee_management.db`) will be created automatically on first run.

### Switching to PostgreSQL

To switch to PostgreSQL:

1. Install PostgreSQL dependencies (already included)
2. Update the `database.ts` file to use PostgreSQL connection
3. Set environment variables:
   ```bash
   export DATABASE_URL=postgresql://user:password@localhost:5432/employee_management
   ```

## Environment Variables

- `PORT` - Server port (default: 4000)
- `DATABASE_PATH` - SQLite database file path (default: ./employee_management.db)

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run db:seed` - Seed database with sample data

## License

ISC

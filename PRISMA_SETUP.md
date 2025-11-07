# Prisma Database Setup

This project uses Prisma ORM with PostgreSQL database.

## Database Configuration

The database connection is configured in the `.env` file:
```
DATABASE_URL="postgresql://postgres:CC$H5^H:0m2vN:lj@34.70.200.23:5432/postgres"
```

## Available Commands

### Generate Prisma Client
```bash
npm run prisma:generate
```

### Open Prisma Studio (Database GUI)
```bash
npm run prisma:studio
```

### Create and Run Migrations
```bash
npm run prisma:migrate
```

### Push Schema to Database (without migrations)
```bash
npm run prisma:push
```

### Pull Schema from Database
```bash
npm run prisma:pull
```

## Usage in Your Code

Import the Prisma client in your API routes or server components:

```javascript
import prisma from '@/lib/prisma';

// Example: Get all users
const users = await prisma.user.findMany();

// Example: Create a new user
const newUser = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
  },
});
```

## Testing Database Connection

You can test your database connection by visiting:
```
http://localhost:3000/api/db-test
```

## Next Steps

1. Define your data models in `prisma/schema.prisma`
2. Run `npm run prisma:push` to sync your schema with the database
3. Run `npm run prisma:generate` to generate the Prisma Client
4. Use the Prisma Client in your API routes and server components

## Example Models

Check `prisma/schema.prisma` for example models that you can uncomment and customize for your finance application:
- User
- Account
- Transaction
- Budget

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function main() {
  console.log('Seeding roles...');

  const rolesToSeed = [
    { name: 'ADMINISTRATOR', description: 'Full system access' },
    {
      name: 'GENERAL_MANAGER',
      description: 'Final report approval and oversight',
    },
    {
      name: 'MANAGER',
      description:
        'Department oversight, report review, and assessment overrides',
    },
    {
      name: 'HEAD_DEPARTMENT',
      description: 'Section oversight, initial report submission/rejection',
    },
    { name: 'SUPERVISOR', description: 'Daily data entry for subordinates' },
    { name: 'HR', description: 'Contract management and employee review' },
  ];

  for (const role of rolesToSeed) {
    await db
      .insert(schema.roles)
      .values(role)
      .onConflictDoUpdate({
        target: schema.roles.name,
        set: { description: role.description },
      });
  }

  console.log('Seeding permissions...');

  const permissionsToSeed = [
    // Records
    { name: 'records:create', description: 'Can create daily records' },
    { name: 'records:view', description: 'Can view daily records' },

    // Reports
    { name: 'reports:create', description: 'Can create appraisal reports' },
    { name: 'reports:view', description: 'Can view appraisal reports' },
    { name: 'reports:submit', description: 'Can submit reports to next level' },
    { name: 'reports:reject', description: 'Can reject reports back to draft' },
    {
      name: 'reports:approve',
      description: 'Can give final approval to reports',
    },
    {
      name: 'reports:override',
      description: 'Can override system assessment scores',
    },

    // Employees/Contracts
    { name: 'employees:view', description: 'Can view employee list' },
    {
      name: 'employees:manage',
      description: 'Can edit employee and contract details',
    },
    { name: 'contracts:review', description: 'Can review expiring contracts' },
  ];

  const insertedPermissions = [];
  for (const perm of permissionsToSeed) {
    const [p] = await db
      .insert(schema.permissions)
      .values(perm)
      .onConflictDoUpdate({
        target: schema.permissions.name,
        set: { description: perm.description },
      })
      .returning();
    insertedPermissions.push(p);
  }

  console.log('Mapping permissions to roles...');

  const rolePermMapping: Record<string, string[]> = {
    ADMINISTRATOR: permissionsToSeed.map((p) => p.name),
    GENERAL_MANAGER: [
      'reports:view',
      'reports:approve',
      'reports:reject',
      'employees:view',
    ],
    MANAGER: [
      'reports:view',
      'reports:submit',
      'reports:reject',
      'reports:override',
      'employees:view',
      'records:view',
    ],
    HEAD_DEPARTMENT: [
      'reports:view',
      'reports:submit',
      'reports:reject',
      'employees:view',
      'records:view',
    ],
    SUPERVISOR: ['records:create', 'records:view', 'employees:view'],
    HR: ['employees:view', 'employees:manage', 'contracts:review'],
  };

  const allRoles = await db.select().from(schema.roles);
  const allPerms = await db.select().from(schema.permissions);

  for (const roleName in rolePermMapping) {
    const role = allRoles.find((r) => r.name === roleName);
    if (!role) continue;

    const permsForRole = rolePermMapping[roleName];
    for (const permName of permsForRole) {
      const perm = allPerms.find((p) => p.name === permName);
      if (!perm) continue;

      await db
        .insert(schema.rolePermissions)
        .values({
          roleId: role.id,
          permissionId: perm.id,
        })
        .onConflictDoNothing();
    }
  }

  console.log('Seeding completed successfully.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});

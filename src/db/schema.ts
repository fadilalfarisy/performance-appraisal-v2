import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  date,
  pgEnum,
  decimal,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Base timestamps helper
const baseFields = {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
};

// --- 1. User Management & RBAC ---

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  employeeId: integer('employee_id').references(() => employees.id),
  ...baseFields,
});

export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  ...baseFields,
});

export const permissions = pgTable('permissions', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(), // e.g. "report:approve"
  description: text('description'),
  ...baseFields,
});

export const userRoles = pgTable(
  'user_roles',
  {
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    roleId: integer('role_id')
      .references(() => roles.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.roleId] }),
  }),
);

export const rolePermissions = pgTable(
  'role_permissions',
  {
    roleId: integer('role_id')
      .references(() => roles.id, { onDelete: 'cascade' })
      .notNull(),
    permissionId: integer('permission_id')
      .references(() => permissions.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.roleId, t.permissionId] }),
  }),
);

// --- 2. Employee & Contract Structure ---

export const contractStatusEnum = pgEnum('contract_status', [
  'CONTRACT',
  'PERMANENT',
]);
export const employeeStatusEnum = pgEnum('employee_status', [
  'DRAFT',
  'PENDING',
  'ACTIVE',
  'INACTIVE',
]);

export const departments = pgTable('departments', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  ...baseFields,
});

export const positions = pgTable('positions', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  ...baseFields,
});

export const employees = pgTable('employees', {
  id: serial('id').primaryKey(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  birthDate: date('birth_date').notNull(),
  positionId: integer('position_id').references(() => positions.id),
  departmentId: integer('department_id').references(() => departments.id),
  managerId: integer('manager_id'), // Self-reference configured in relations
  status: employeeStatusEnum('status').default('ACTIVE').notNull(),
  ...baseFields,
});

export const contracts = pgTable('contracts', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id')
    .references(() => employees.id, { onDelete: 'cascade' })
    .notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  statusContract: contractStatusEnum('status_contract')
    .default('CONTRACT')
    .notNull(),
  ...baseFields,
});

// --- 3. Criteria & Versioning (Non-destructive) ---

export const criteria = pgTable('criteria', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  ...baseFields,
});

export const criteriaVersions = pgTable('criteria_versions', {
  id: serial('id').primaryKey(),
  criteriaId: integer('criteria_id')
    .references(() => criteria.id, { onDelete: 'cascade' })
    .notNull(),
  version: integer('version').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  weight: decimal('weight', { precision: 5, scale: 2 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  ...baseFields,
});

// --- 4. Input Sources (Daily Records & External Metrics) ---

export const recordCategoryEnum = pgEnum('record_category', [
  'QUALITY',
  'QUANTITY',
  'ATTENDANCE',
  'RESPONSIBILITY',
]);
export const metricTypeEnum = pgEnum('metric_type', [
  'PRODUCTION',
  'ATTENDANCE',
]);

export const dailyRecords = pgTable('daily_records', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id')
    .references(() => employees.id, { onDelete: 'cascade' })
    .notNull(),
  supervisorId: integer('supervisor_id')
    .references(() => employees.id)
    .notNull(),
  recordDate: date('record_date').notNull(),
  category: recordCategoryEnum('category').notNull(),
  description: text('description').notNull(),
  ...baseFields,
});

export const externalMetrics = pgTable('external_metrics', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id')
    .references(() => employees.id, { onDelete: 'cascade' })
    .notNull(),
  period: date('period').notNull(),
  metricType: metricTypeEnum('metric_type').notNull(),
  value: decimal('value', { precision: 10, scale: 2 }).notNull(),
  ...baseFields,
});

// --- 5. Appraisal Reports & Assessments ---

export const reportStatusEnum = pgEnum('report_status', [
  'DRAFT',
  'PENDING',
  'SUBMITTED',
  'APPROVED',
  'DONE',
  'REJECTED',
]);
export const approvalStatusEnum = pgEnum('approval_status', [
  'APPROVED',
  'REJECTED',
]);

export const reports = pgTable('reports', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id')
    .references(() => employees.id, { onDelete: 'cascade' })
    .notNull(),
  reportDate: date('report_date').notNull(),
  status: reportStatusEnum('status').default('DRAFT').notNull(),
  reportFile: text('report_file'),
  ...baseFields,
});

export const reportApprovals = pgTable('report_approvals', {
  id: serial('id').primaryKey(),
  reportId: integer('report_id')
    .references(() => reports.id, { onDelete: 'cascade' })
    .notNull(),
  approverId: integer('approver_id')
    .references(() => users.id)
    .notNull(),
  status: approvalStatusEnum('status').notNull(),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const assessments = pgTable('assessments', {
  id: serial('id').primaryKey(),
  reportId: integer('report_id')
    .references(() => reports.id, { onDelete: 'cascade' })
    .notNull(),
  criteriaVersionId: integer('criteria_version_id')
    .references(() => criteriaVersions.id)
    .notNull(),
  score: decimal('score', { precision: 5, scale: 2 }).notNull(),
  originalScore: decimal('original_score', { precision: 5, scale: 2 }),
  isOverridden: boolean('is_overridden').default(false).notNull(),
  note: text('note'),
  ...baseFields,
});

// --- RELATIONSHIPS ---

export const usersRelations = relations(users, ({ one, many }) => ({
  employee: one(employees, {
    fields: [users.employeeId],
    references: [employees.id],
  }),
  userRoles: many(userRoles),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
  rolePermissions: many(rolePermissions),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, { fields: [userRoles.userId], references: [users.id] }),
  role: one(roles, { fields: [userRoles.roleId], references: [roles.id] }),
}));

export const rolePermissionsRelations = relations(
  rolePermissions,
  ({ one }) => ({
    role: one(roles, {
      fields: [rolePermissions.roleId],
      references: [roles.id],
    }),
    permission: one(permissions, {
      fields: [rolePermissions.permissionId],
      references: [permissions.id],
    }),
  }),
);

export const departmentsRelations = relations(departments, ({ many }) => ({
  employees: many(employees),
}));

export const positionsRelations = relations(positions, ({ many }) => ({
  employees: many(employees),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  manager: one(employees, {
    fields: [employees.managerId],
    references: [employees.id],
    relationName: 'managerRelation',
  }),
  subordinates: many(employees, { relationName: 'managerRelation' }),
  department: one(departments, {
    fields: [employees.departmentId],
    references: [departments.id],
  }),
  position: one(positions, {
    fields: [employees.positionId],
    references: [positions.id],
  }),
  contracts: many(contracts),
  reports: many(reports),
  dailyRecords: many(dailyRecords),
  externalMetrics: many(externalMetrics),
}));

export const contractsRelations = relations(contracts, ({ one }) => ({
  employee: one(employees, {
    fields: [contracts.employeeId],
    references: [employees.id],
  }),
}));

export const criteriaRelations = relations(criteria, ({ many }) => ({
  versions: many(criteriaVersions),
}));

export const criteriaVersionsRelations = relations(
  criteriaVersions,
  ({ one, many }) => ({
    criteria: one(criteria, {
      fields: [criteriaVersions.criteriaId],
      references: [criteria.id],
    }),
    assessments: many(assessments),
  }),
);

export const dailyRecordsRelations = relations(dailyRecords, ({ one }) => ({
  employee: one(employees, {
    fields: [dailyRecords.employeeId],
    references: [employees.id],
  }),
  supervisor: one(employees, {
    fields: [dailyRecords.supervisorId],
    references: [employees.id],
  }),
}));

export const externalMetricsRelations = relations(
  externalMetrics,
  ({ one }) => ({
    employee: one(employees, {
      fields: [externalMetrics.employeeId],
      references: [employees.id],
    }),
  }),
);

export const reportsRelations = relations(reports, ({ one, many }) => ({
  employee: one(employees, {
    fields: [reports.employeeId],
    references: [employees.id],
  }),
  assessments: many(assessments),
  approvals: many(reportApprovals),
}));

export const reportApprovalsRelations = relations(
  reportApprovals,
  ({ one }) => ({
    report: one(reports, {
      fields: [reportApprovals.reportId],
      references: [reports.id],
    }),
    approver: one(users, {
      fields: [reportApprovals.approverId],
      references: [users.id],
    }),
  }),
);

export const assessmentsRelations = relations(assessments, ({ one }) => ({
  report: one(reports, {
    fields: [assessments.reportId],
    references: [reports.id],
  }),
  criteriaVersion: one(criteriaVersions, {
    fields: [assessments.criteriaVersionId],
    references: [criteriaVersions.id],
  }),
}));

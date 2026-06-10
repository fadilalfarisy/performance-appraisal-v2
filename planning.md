# Implementation Plan: Administrative Modules

This document outlines the strategy for implementing the controllers, services, and modules for the core organizational and administrative components of the Performance Appraisal system.

## 1. Modules Overview

We will implement the following modules:
1.  **Departments**: Manage organizational units.
2.  **Positions**: Manage job titles/roles within departments.
3.  **Roles & Permissions**: Manage the RBAC (Role-Based Access Control) system.
4.  **Contracts**: Manage employee contract history and status.
5.  **Criteria Versions**: Manage versioned appraisal criteria with weights.

## 2. General Implementation Pattern

For each module, we will follow the standard NestJS pattern:
- **DTOs**: Define `Create` and `Update` data transfer objects.
- **Service**: Implement CRUD logic using Drizzle ORM.
- **Controller**: Define REST endpoints (GET, POST, PATCH, DELETE).
- **Module**: Wire up the service and controller.

## 3. Module Specifics

### 3.1 Departments
- **Endpoints**: `GET /departments`, `GET /departments/:id`, `POST /departments`, `PATCH /departments/:id`, `DELETE /departments/:id`.
- **Logic**: Simple CRUD. Ensure a department cannot be deleted if it still has employees.

### 3.2 Positions
- **Endpoints**: `GET /positions`, `GET /positions/:id`, `POST /positions`, `PATCH /positions/:id`, `DELETE /positions/:id`.
- **Logic**: Simple CRUD. Ensure a position cannot be deleted if it is assigned to employees.

### 3.3 RBAC (Roles & Permissions)
- **Roles Endpoints**: `GET /roles`, `POST /roles`, `GET /roles/:id`, `PATCH /roles/:id`, `DELETE /roles/:id`.
- **Permissions Endpoints**: `GET /permissions`, `POST /permissions`.
- **Assignment Logic**:
    - `POST /roles/:id/permissions`: Assign permissions to a role.
    - `POST /users/:id/roles`: Assign roles to a user (likely in `UsersModule` or `AuthModule`).

### 3.4 Contracts
- **Endpoints**: `GET /contracts`, `GET /contracts/employee/:employeeId`, `POST /contracts`, `PATCH /contracts/:id`.
- **Logic**:
    - When creating a contract, validate that dates don't overlap with existing contracts for the same employee.
    - Logic to automatically update employee status based on active contracts.

### 3.5 Criteria Versions
- **Endpoints**: `GET /criteria`, `POST /criteria` (create parent criteria).
- **Version Endpoints**: `GET /criteria/:id/versions`, `POST /criteria/:id/versions` (create new version).
- **Logic**:
    - Enforce non-destructive versioning.
    - Validate that weights across active criteria versions for a specific appraisal period/type sum to 100%.

## 4. Security & Access Control
- All administrative endpoints will be protected by `JwtAuthGuard`.
- We will use `@Roles()` and `@Permissions()` decorators (to be refined/implemented) to restrict access to these modules to Admin/HR roles.

## 5. Timeline & Order of Implementation
1.  **Departments & Positions** (Foundation for Employees).
2.  **Roles & Permissions** (Foundation for Security).
3.  **Contracts** (Critical for Employee Lifecycle).
4.  **Criteria Versions** (Core Appraisal Logic).

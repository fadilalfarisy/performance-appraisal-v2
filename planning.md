# Project Plan: Performance Appraisal System

## 1. User Management, Roles & Permissions
- **RBAC Implementation:** Setup a flexible Role-Based Access Control system.
- **Roles to Seed:**
    - `Administrator`: Full system access.
    - `General Manager`: Final report approval and oversight.
    - `Manager` (e.g., Production, Logistics, Sales): Department oversight, report review, and assessment overrides.
    - `Head Department` (e.g., Sewing, Packing, Cutting): Section oversight, initial report submission/rejection.
    - `Supervisor` (e.g., Sewing, Packing, Cutting): Daily data entry for subordinates.

## 2. Daily Records (Supervisor Module)
- **Feature:** Supervisors can input daily metrics for their team members.
- **Categories:**
    - Quality
    - Quantity
    - Attendance
    - Responsibility
- **Validation:** Ensure supervisors can only enter data for employees within their assigned section/department.

## 3. Contract Management & Scheduler
- **Monthly Scheduler:** A cron job running on the **1st day of every month**.
- **Task:** Generate a list of employees whose contracts expire within that month.
- **HR Workflow:**
    - These employees initially have a status of `DRAFT`.
    - HR reviews the list.
    - HR can **Edit** employee details or **Approve** (change status to `PENDING`).

## 4. Automated Assessment System
- **Generation:** System automatically calculates assessment scores based on:
    - Daily records (Quality, Quantity, Responsibility).
    - Attendance data.
- **Manager Overrides:**
    - If a Manager changes a system-generated value, the system must flag this as an "Override".
    - Store both original and modified values for transparency.

## 5. Multi-Level Report Approval Workflow
- **Workflow Steps:**
    1. **Head Department (HOD) Review:**
        - Click **Submit** to move to Manager.
        - Click **Reject** to revert to `DRAFT` (requires mandatory notes).
    2. **Manager Review:**
        - Click **Submit** to move to General Manager.
        - Click **Reject** to revert to `DRAFT` (requires mandatory notes).
    3. **General Manager (GM) Final Review:**
        - Click **Submit** (Approve) to finalize.
        - Click **Reject** to revert to `DRAFT` (requires mandatory notes).

## 6. Technical Implementation Phases
- **Phase 1: Database & RBAC:** Update schema with new enums and seed roles/permissions.
- **Phase 2: Supervisor & Employee Management:** Implement daily records API and HR employee status workflow.
- **Phase 3: Scheduler & Assessment Engine:** Implement the cron job and logic for automated scoring and overrides.
- **Phase 4: Approval Workflow:** Implement the state machine for reports (Submit/Reject logic at all levels).
- **Phase 5: Reporting & UI:** Finalize report generation and auditing (if needed).

import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

/**
 * Role-Based Access Control (RBAC) utilities
 */

// Define permissions for each role
export const PERMISSIONS = {
  ADMIN: {
    projects: ['create', 'read', 'update', 'delete'],
    tasks: ['create', 'read', 'update', 'delete'],
    timesheets: ['create', 'read', 'update', 'delete'],
    expenses: ['create', 'read', 'update', 'delete', 'approve'],
    users: ['create', 'read', 'update', 'delete'],
    financials: ['create', 'read', 'update', 'delete'],
  },
  PROJECT_MANAGER: {
    projects: ['create', 'read', 'update', 'delete'],
    tasks: ['create', 'read', 'update', 'delete'],
    timesheets: ['read'],
    expenses: ['read', 'approve'],
    users: ['read'],
    financials: ['create', 'read', 'update'],
  },
  TEAM_MEMBER: {
    projects: ['read'],
    tasks: ['read', 'update'],
    timesheets: ['create', 'read', 'update', 'delete'],
    expenses: ['create', 'read', 'update', 'delete'],
    users: ['read'],
    financials: ['read'],
  },
  SALES: {
    projects: ['read'],
    tasks: ['read'],
    timesheets: ['read'],
    expenses: ['read'],
    users: ['read'],
    financials: ['create', 'read', 'update'],
  },
  FINANCE: {
    projects: ['read'],
    tasks: ['read'],
    timesheets: ['read'],
    expenses: ['read', 'approve'],
    users: ['read'],
    financials: ['create', 'read', 'update', 'delete'],
  },
};

/**
 * Check if a user has permission to perform an action
 */
export function hasPermission(role, resource, action) {
  const rolePermissions = PERMISSIONS[role];
  if (!rolePermissions) return false;
  
  const resourcePermissions = rolePermissions[resource];
  if (!resourcePermissions) return false;
  
  return resourcePermissions.includes(action);
}

/**
 * Middleware to check authentication
 */
export async function requireAuth(req) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return {
      error: 'Unauthorized',
      status: 401,
    };
  }
  
  return { user: session.user };
}

/**
 * Middleware to check role-based permissions
 */
export async function requirePermission(req, resource, action) {
  const authResult = await requireAuth(req);
  
  if (authResult.error) {
    return authResult;
  }
  
  const { user } = authResult;
  
  if (!hasPermission(user.role, resource, action)) {
    return {
      error: 'Forbidden - Insufficient permissions',
      status: 403,
    };
  }
  
  return { user };
}

/**
 * Check if user is project manager or admin
 */
export function isProjectManagerOrAdmin(role) {
  return role === 'ADMIN' || role === 'PROJECT_MANAGER';
}

/**
 * Check if user can manage specific project
 */
export async function canManageProject(userId, projectId, prisma) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { managerId: true },
  });
  
  return project && project.managerId === userId;
}

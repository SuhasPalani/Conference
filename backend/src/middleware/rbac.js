// Role-Based Access Control (RBAC) Middleware

// Define role hierarchy (lower number = higher privilege)
const roleHierarchy = {
  admin: 4,
  evaluator: 3,
  founder: 2,
  basic: 1
};

// Define permissions for each role
const rolePermissions = {
  basic: [
    'read:own_profile',
    'update:own_profile'
  ],
  founder: [
    'read:own_profile',
    'update:own_profile',
    'create:idea',
    'read:own_ideas',
    'update:own_ideas',
    'delete:own_ideas',
    'submit:idea',
    'upload:pitch_deck',
    'read:own_evaluations'
  ],
  evaluator: [
    'read:own_profile',
    'update:own_profile',
    'read:assigned_ideas',
    'create:evaluation',
    'update:own_evaluations',
    'read:own_evaluations'
  ],
  admin: [
    'read:all_users',
    'update:user_roles',
    'delete:users',
    'read:all_ideas',
    'update:idea_status',
    'assign:evaluators',
    'read:all_evaluations',
    'export:data',
    'read:dashboard'
  ]
};

// Check if user has specific role
const hasRole = (user, role) => {
  return user && user.roles && user.roles.includes(role);
};

// Check if user has any of the specified roles
const hasAnyRole = (user, roles) => {
  if (!user || !user.roles) return false;
  return roles.some(role => user.roles.includes(role));
};

// Check if user has all of the specified roles
const hasAllRoles = (user, roles) => {
  if (!user || !user.roles) return false;
  return roles.every(role => user.roles.includes(role));
};

// Check if user has specific permission
const hasPermission = (user, permission) => {
  if (!user || !user.roles) return false;
  
  // Admin has all permissions
  if (user.roles.includes('admin')) return true;

  // Check if any of user's roles have the permission
  return user.roles.some(role => {
    const permissions = rolePermissions[role] || [];
    return permissions.includes(permission);
  });
};

// Get highest role level for user
const getHighestRoleLevel = (user) => {
  if (!user || !user.roles) return 0;
  
  const levels = user.roles.map(role => roleHierarchy[role] || 0);
  return Math.max(...levels);
};

// Check if user can manage target user (based on role hierarchy)
const canManageUser = (actingUser, targetUser) => {
  if (!actingUser || !targetUser) return false;
  
  // Admin can manage anyone except other admins (with exceptions)
  if (hasRole(actingUser, 'admin')) {
    // Can't demote the last admin
    if (hasRole(targetUser, 'admin')) {
      // This check would need to query the database
      // It's handled in the controller
      return true;
    }
    return true;
  }

  return false;
};

// Middleware: Require specific role(s)
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!hasAnyRole(req.user, roles)) {
      return res.status(403).json({ 
        error: `Access denied. Required role(s): ${roles.join(' or ')}. Your roles: ${req.user.roles.join(', ')}` 
      });
    }

    next();
  };
};

// Middleware: Require specific permission
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!hasPermission(req.user, permission)) {
      return res.status(403).json({ 
        error: `Access denied. Required permission: ${permission}` 
      });
    }

    next();
  };
};

// Middleware: Require ownership or admin
const requireOwnershipOrAdmin = (getResourceOwnerId) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Admin can access anything
    if (hasRole(req.user, 'admin')) {
      return next();
    }

    try {
      // Get the owner ID of the resource
      const ownerId = await getResourceOwnerId(req);

      if (!ownerId) {
        return res.status(404).json({ error: 'Resource not found' });
      }

      // Check if user is the owner
      if (ownerId.toString() !== req.user.id.toString()) {
        return res.status(403).json({ 
          error: 'Access denied. You can only access your own resources.' 
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware: Require verification
const requireVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({ 
      error: 'Email verification required. Please check your email and verify your account.' 
    });
  }

  next();
};

// Helper: Check if request is from resource owner
const isOwner = (req, ownerId) => {
  return req.user && req.user.id.toString() === ownerId.toString();
};

// Helper: Check if request is from admin
const isAdmin = (req) => {
  return req.user && hasRole(req.user, 'admin');
};

module.exports = {
  // Role checking functions
  hasRole,
  hasAnyRole,
  hasAllRoles,
  hasPermission,
  getHighestRoleLevel,
  canManageUser,
  
  // Middleware
  requireRole,
  requirePermission,
  requireOwnershipOrAdmin,
  requireVerification,
  
  // Helpers
  isOwner,
  isAdmin,
  
  // Constants
  roleHierarchy,
  rolePermissions
};
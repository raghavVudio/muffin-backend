export const ROLES = {
  ORG_ADMIN:   'ORG_ADMIN',
  BRAND_ADMIN: 'BRAND_ADMIN',
  VIEWER:      'VIEWER',
};

export const USER_BRAND_ROLES  = ['BRAND_ADMIN', 'VIEWER'];
export const PLAN_TYPES        = ['free', 'growth', 'pro'];
export const PAGE_CATEGORIES   = ['guide', 'product', 'blog', 'landing', 'location', 'recipe'];
export const PAGE_STATUS       = ['draft', 'published'];
export const VIDEO_STATUS      = ['draft', 'published'];
export const LEAD_STATUS       = ['new', 'contacted', 'qualified', 'converted', 'lost'];
export const LEAD_INTENT       = ['hot', 'warm', 'cold'];
export const LEAD_SOURCE       = ['page', 'video', 'direct', 'manual'];
export const ACTIVITY_TYPES    = ['signup', 'email_sent', 'status_changed', 'note_added', 'call_logged'];

export const PLAN_LIMITS = {
  free:   { pages: 10,  videos: 5   },
  growth: { pages: 100, videos: 25  },
  pro:    { pages: 500, videos: 100 },
};

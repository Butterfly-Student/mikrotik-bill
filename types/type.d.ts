export interface CreateActivityLogData {
  userId: number;
  action: string;
  resourceType?: string;
  resourceId?: number;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}
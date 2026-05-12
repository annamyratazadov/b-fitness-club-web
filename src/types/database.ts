export type UserRole = "admin" | "member";
export type MemberStatus = "active" | "passive";
export type Language = "tr" | "en";
export type PackageType = "student" | "normal";
export type NotificationStatus = "sent" | "failed";
export type NotificationMessageType = "3_days_before";

export interface User {
  id: string;
  role: UserRole;
  created_at: string;
}

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  birth_date: string;
  birth_place: string;
  occupation: string;
  address: string;
  status: MemberStatus;
  language: Language;
  created_at: string;
  updated_at: string;
}

export interface MembershipPackage {
  id: string;
  name: string;
  duration_days: number;
  price: number;
  package_type: PackageType;
  is_active: boolean;
  created_at: string;
}

export interface Membership {
  id: string;
  member_id: string;
  package_id: string;
  start_date: string;
  end_date: string;
  payment_amount: number;
  is_active: boolean;
  created_at: string;
  membership_packages?: MembershipPackage;
}

export interface MemberDeletionLog {
  id: string;
  member_id: string;
  deleted_by_admin_id: string;
  deleted_at: string;
  member_data: Record<string, unknown>;
}

export interface WhatsappNotification {
  id: string;
  member_id: string;
  message_type: NotificationMessageType;
  sent_at: string;
  status: NotificationStatus;
  error_message: string | null;
}

export interface MemberWithMembership extends Profile {
  memberships?: Membership[];
  active_membership?: Membership | null;
  days_remaining?: number;
}

export interface DashboardStats {
  total_members: number;
  active_members: number;
  passive_members: number;
  new_members_this_month: number;
  expiring_this_month: number;
  monthly_revenue: number;
  most_popular_package: string;
}

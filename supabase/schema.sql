-- ============================================
-- B-Fitness Club - Supabase Database Schema
-- ============================================
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('admin', 'member');
CREATE TYPE member_status AS ENUM ('active', 'passive');
CREATE TYPE language_type AS ENUM ('tr', 'en');
CREATE TYPE package_type AS ENUM ('student', 'normal');
CREATE TYPE notification_status AS ENUM ('sent', 'failed');
CREATE TYPE notification_message_type AS ENUM ('3_days_before');

-- ============================================
-- TABLE: profiles
-- ============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  birth_date DATE NOT NULL,
  birth_place TEXT NOT NULL,
  occupation TEXT NOT NULL,
  address TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'member',
  status member_status NOT NULL DEFAULT 'active',
  language language_type NOT NULL DEFAULT 'tr',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE: membership_packages
-- ============================================

CREATE TABLE membership_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  duration_days INTEGER NOT NULL CHECK (duration_days > 0),
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  package_type package_type NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TABLE: memberships
-- ============================================

CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES membership_packages(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  payment_amount DECIMAL(10, 2) NOT NULL CHECK (payment_amount >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_memberships_member_id ON memberships(member_id);
CREATE INDEX idx_memberships_end_date ON memberships(end_date);
CREATE INDEX idx_memberships_is_active ON memberships(is_active);

-- ============================================
-- TABLE: member_deletion_logs
-- ============================================

CREATE TABLE member_deletion_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL,
  deleted_by_admin_id UUID NOT NULL REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  member_data JSONB NOT NULL
);

-- ============================================
-- TABLE: whatsapp_notifications
-- ============================================

CREATE TABLE whatsapp_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message_type notification_message_type NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status notification_status NOT NULL,
  error_message TEXT
);

CREATE INDEX idx_whatsapp_notifications_member_id ON whatsapp_notifications(member_id);
CREATE INDEX idx_whatsapp_notifications_sent_at ON whatsapp_notifications(sent_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_deletion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- profiles: Admin sees all, member sees only own
CREATE POLICY "Admin can view all profiles" ON profiles
  FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY "Member can view own profile" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admin can insert profiles" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admin can update profiles" ON profiles
  FOR UPDATE TO authenticated
  USING (is_admin());

CREATE POLICY "Admin can delete profiles" ON profiles
  FOR DELETE TO authenticated
  USING (is_admin());

-- membership_packages: Everyone can read, only admin can modify
CREATE POLICY "Everyone can view active packages" ON membership_packages
  FOR SELECT TO authenticated
  USING (is_active = TRUE OR is_admin());

CREATE POLICY "Admin can manage packages" ON membership_packages
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- memberships: Admin sees all, member sees own
CREATE POLICY "Admin can view all memberships" ON memberships
  FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY "Member can view own memberships" ON memberships
  FOR SELECT TO authenticated
  USING (auth.uid() = member_id);

CREATE POLICY "Admin can manage memberships" ON memberships
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- member_deletion_logs: Only admin
CREATE POLICY "Admin can manage deletion logs" ON member_deletion_logs
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- whatsapp_notifications: Only admin
CREATE POLICY "Admin can view notifications" ON whatsapp_notifications
  FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY "Service role can insert notifications" ON whatsapp_notifications
  FOR INSERT TO service_role
  WITH CHECK (TRUE);

-- ============================================
-- SEED DATA: membership_packages
-- ============================================

INSERT INTO membership_packages (name, duration_days, price, package_type) VALUES
  ('1 Aylık Öğrenci', 30, 4000.00, 'student'),
  ('3 Aylık Öğrenci', 90, 7000.00, 'student'),
  ('6 Aylık Öğrenci', 180, 10000.00, 'student'),
  ('1 Aylık Normal', 30, 4000.00, 'normal'),
  ('3 Aylık Normal', 90, 7000.00, 'normal'),
  ('6 Aylık Normal', 180, 12000.00, 'normal');

-- ============================================
-- USEFUL VIEWS
-- ============================================

-- Active memberships with days remaining
CREATE OR REPLACE VIEW active_memberships_with_days AS
SELECT
  p.id,
  p.first_name,
  p.last_name,
  p.phone,
  p.status,
  m.start_date,
  m.end_date,
  m.payment_amount,
  mp.name AS package_name,
  mp.package_type,
  GREATEST(0, (m.end_date - CURRENT_DATE)) AS days_remaining
FROM profiles p
LEFT JOIN memberships m ON m.member_id = p.id AND m.is_active = TRUE
LEFT JOIN membership_packages mp ON mp.id = m.package_id
WHERE p.role = 'member';

-- Dashboard stats
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
  COUNT(*) FILTER (WHERE role = 'member') AS total_members,
  COUNT(*) FILTER (WHERE role = 'member' AND status = 'active') AS active_members,
  COUNT(*) FILTER (WHERE role = 'member' AND status = 'passive') AS passive_members,
  COUNT(*) FILTER (
    WHERE role = 'member'
    AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
  ) AS new_members_this_month
FROM profiles;

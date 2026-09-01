-- ==============================================================================
-- FleetPulse: PostgreSQL Relational Database Schema & Architecture
-- Requirement 45: Complete Relational PostgreSQL Database Structure
-- Requirement 46: Vehicle Data Relationships & Multi-Tenant Organization Isolation
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role_type AS ENUM ('Owner', 'Fleet Manager', 'Driver', 'Technician');
CREATE TYPE vehicle_status_type AS ENUM ('Active', 'Due for Service', 'Overdue', 'Under Repair', 'Inactive');
CREATE TYPE vehicle_type_enum AS ENUM ('Sedan', 'SUV', 'Truck', 'Van', 'Motorcycle', 'Bus', 'Heavy Commercial');
CREATE TYPE fuel_type_enum AS ENUM ('Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid');
CREATE TYPE transmission_type_enum AS ENUM ('Manual', 'Automatic', 'AMT', 'EV Single-Speed');
CREATE TYPE repair_stage_enum AS ENUM ('Reported', 'Inspection', 'Estimate', 'Approval', 'Repair In Progress', 'Completed', 'Closed');
CREATE TYPE repair_severity_enum AS ENUM ('Minor', 'Moderate', 'Major', 'Critical');
CREATE TYPE document_type_enum AS ENUM (
    'Registration Certificate', 'Insurance', 'PUC', 'Fitness Certificate', 
    'Permit', 'Tax Receipt', 'Service Invoice', 'Repair Invoice', 'Other'
);
CREATE TYPE expense_category_enum AS ENUM (
    'Maintenance', 'Repairs', 'Tyres', 'Battery', 'Fuel', 'Insurance', 
    'PUC', 'Permit', 'Spare Parts', 'Washing', 'Towing', 'Other'
);
CREATE TYPE payment_method_enum AS ENUM ('Cash', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Fleet Card');
CREATE TYPE driver_status_enum AS ENUM ('Active', 'On Leave', 'Inactive');

-- 1. organizations (Requirement 42)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100),
    contact_phone VARCHAR(50) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    tax_id VARCHAR(100),
    plan VARCHAR(50) DEFAULT 'Growth',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. organization_members
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role user_role_type NOT NULL DEFAULT 'Fleet Manager',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, user_id)
);

-- 4. drivers (Requirement 30)
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    license_number VARCHAR(100) NOT NULL,
    license_expiry DATE NOT NULL,
    joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status driver_status_enum NOT NULL DEFAULT 'Active',
    emergency_contact VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. service_centers (Requirement 32)
CREATE TABLE IF NOT EXISTS service_centers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100),
    rating NUMERIC(3, 2) DEFAULT 4.5 CHECK (rating >= 1.0 AND rating <= 5.0),
    services_offered TEXT[] NOT NULL DEFAULT '{}',
    is_authorized BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. vehicles (Requirement 46)
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    registration_number VARCHAR(50) NOT NULL,
    vin VARCHAR(100) NOT NULL,
    engine_number VARCHAR(100),
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    type vehicle_type_enum NOT NULL,
    fuel_type fuel_type_enum NOT NULL,
    transmission transmission_type_enum NOT NULL,
    current_odometer NUMERIC(12, 2) NOT NULL DEFAULT 0,
    status vehicle_status_type NOT NULL DEFAULT 'Active',
    health_score INTEGER NOT NULL DEFAULT 100 CHECK (health_score >= 0 AND health_score <= 100),
    primary_driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    backup_driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    department VARCHAR(100),
    location VARCHAR(100),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, registration_number),
    UNIQUE(organization_id, vin)
);

-- 7. driver_vehicle_assignments (Requirement 31)
CREATE TABLE IF NOT EXISTS driver_vehicle_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('Primary', 'Backup')),
    assigned_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    unassigned_date TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- 8. vehicle_odometer_logs (Requirement 45)
CREATE TABLE IF NOT EXISTS vehicle_odometer_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    odometer NUMERIC(12, 2) NOT NULL,
    recorded_by VARCHAR(255) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. maintenance_records
CREATE TABLE IF NOT EXISTS maintenance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    service_center_id UUID REFERENCES service_centers(id) ON DELETE SET NULL,
    service_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    service_date DATE NOT NULL,
    odometer NUMERIC(12, 2) NOT NULL,
    technician_name VARCHAR(255),
    parts_replaced TEXT[] DEFAULT '{}',
    labour_cost NUMERIC(12, 2) DEFAULT 0,
    parts_cost NUMERIC(12, 2) DEFAULT 0,
    tax NUMERIC(12, 2) DEFAULT 0,
    total_cost NUMERIC(12, 2) NOT NULL,
    invoice_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. maintenance_schedules
CREATE TABLE IF NOT EXISTS maintenance_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    service_category VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    interval_months INTEGER,
    interval_km NUMERIC(12, 2),
    last_service_date DATE,
    last_service_odometer NUMERIC(12, 2),
    next_due_date DATE,
    next_due_odometer NUMERIC(12, 2),
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. repair_tickets (Requirements 22, 23, 24, 25)
CREATE TABLE IF NOT EXISTS repair_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    service_center_id UUID REFERENCES service_centers(id) ON DELETE SET NULL,
    issue_title VARCHAR(255) NOT NULL,
    issue_category VARCHAR(100),
    description TEXT NOT NULL,
    severity repair_severity_enum NOT NULL DEFAULT 'Moderate',
    status repair_stage_enum NOT NULL DEFAULT 'Reported',
    reported_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reported_by VARCHAR(255) NOT NULL,
    odometer NUMERIC(12, 2),
    estimated_cost NUMERIC(12, 2) DEFAULT 0,
    approved_cost NUMERIC(12, 2) DEFAULT 0,
    actual_cost NUMERIC(12, 2) DEFAULT 0,
    cost_variance NUMERIC(12, 2) GENERATED ALWAYS AS (actual_cost - approved_cost) STORED,
    is_unusual_variance BOOLEAN DEFAULT FALSE,
    start_date DATE,
    expected_completion DATE,
    actual_completion DATE,
    technician_name VARCHAR(255),
    downtime_start TIMESTAMP WITH TIME ZONE,
    downtime_end TIMESTAMP WITH TIME ZONE,
    downtime_hours NUMERIC(8, 2),
    photos TEXT[] DEFAULT '{}',
    attachments TEXT[] DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. repair_updates
CREATE TABLE IF NOT EXISTS repair_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repair_id UUID NOT NULL REFERENCES repair_tickets(id) ON DELETE CASCADE,
    from_stage repair_stage_enum,
    to_stage repair_stage_enum NOT NULL,
    notes TEXT,
    updated_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. downtime_records (Requirement 35)
CREATE TABLE IF NOT EXISTS downtime_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    repair_id UUID REFERENCES repair_tickets(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    total_hours NUMERIC(8, 2),
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. expenses (Requirements 26 & 27)
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    category expense_category_enum NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    vendor VARCHAR(255) NOT NULL,
    payment_method payment_method_enum NOT NULL,
    description TEXT NOT NULL,
    invoice_number VARCHAR(100),
    invoice_url TEXT,
    odometer NUMERIC(12, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. vehicle_documents (Requirements 28 & 29)
CREATE TABLE IF NOT EXISTS vehicle_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    document_type document_type_enum NOT NULL,
    document_number VARCHAR(100) NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    uploaded_date DATE NOT NULL DEFAULT CURRENT_DATE,
    file_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. notification_preferences (Requirement 21)
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    in_app_notifications BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    browser_push_notifications BOOLEAN DEFAULT FALSE,
    notify_30_days_before BOOLEAN DEFAULT TRUE,
    notify_15_days_before BOOLEAN DEFAULT TRUE,
    notify_7_days_before BOOLEAN DEFAULT TRUE,
    notify_1_day_before BOOLEAN DEFAULT TRUE,
    notify_on_expiry BOOLEAN DEFAULT TRUE,
    critical_alerts_immediate BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. notifications (Requirement 40)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    category VARCHAR(100),
    is_read BOOLEAN DEFAULT FALSE,
    link_tab VARCHAR(50),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. activity_logs (Requirement 47: Audit Timeline)
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_name VARCHAR(255) NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    entity_name VARCHAR(255),
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 19. reports (Requirement 38)
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    report_type VARCHAR(100) NOT NULL,
    parameters JSONB NOT NULL DEFAULT '{}',
    generated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    file_url TEXT,
    format VARCHAR(20) NOT NULL CHECK (format IN ('CSV', 'PDF', 'JSON')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_vehicles_org ON vehicles(organization_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_vehicle ON maintenance_records(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_repairs_vehicle ON repair_tickets(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_repairs_status ON repair_tickets(status);
CREATE INDEX IF NOT EXISTS idx_expenses_vehicle ON expenses(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_documents_vehicle ON vehicle_documents(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_documents_expiry ON vehicle_documents(expiry_date);
CREATE INDEX IF NOT EXISTS idx_audit_org ON activity_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON activity_logs(created_at DESC);

-- Row-Level Security (RLS) Policies
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY org_isolation_policy_vehicles ON vehicles
    FOR ALL
    USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::UUID);

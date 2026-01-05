-- =====================================================
-- Personal CRM Database Schema v1
-- =====================================================
-- Supabase project: https://egjkkzxqlihzkozpnojz.supabase.co
-- Created: 2026-01-05
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- COMPANIES TABLE
-- =====================================================
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    website TEXT,
    industry TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster searches
CREATE INDEX idx_companies_name ON companies(name);

-- =====================================================
-- LEADS TABLE (People)
-- =====================================================
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    title TEXT,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    linkedin_url TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'nurturing', 'customer', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for faster lookups
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_company_id ON leads(company_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_name ON leads(first_name, last_name);

-- =====================================================
-- CONVERSATIONS TABLE
-- =====================================================
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('email', 'linkedin', 'call', 'meeting', 'other')),
    subject TEXT,
    content TEXT,
    conversation_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX idx_conversations_lead_id ON conversations(lead_id);
CREATE INDEX idx_conversations_type ON conversations(type);
CREATE INDEX idx_conversations_date ON conversations(conversation_date DESC);

-- =====================================================
-- NOTES TABLE (Activities)
-- =====================================================
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    note_type TEXT DEFAULT 'note' CHECK (note_type IN ('note', 'task', 'reminder', 'follow-up')),
    due_date TIMESTAMPTZ,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Constraint: note must be related to either a lead or company
    CONSTRAINT note_has_relation CHECK (lead_id IS NOT NULL OR company_id IS NOT NULL)
);

-- Indexes for faster queries
CREATE INDEX idx_notes_lead_id ON notes(lead_id);
CREATE INDEX idx_notes_company_id ON notes(company_id);
CREATE INDEX idx_notes_type ON notes(note_type);
CREATE INDEX idx_notes_due_date ON notes(due_date);
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);

-- =====================================================
-- AUTOMATIC TIMESTAMP UPDATES
-- =====================================================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for all tables
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
-- Enable RLS on all tables (currently permissive for single user)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policies (currently allow all for service role)
-- You can add user-specific policies later for multi-user support
CREATE POLICY "Enable all access for service role" ON companies
    FOR ALL USING (true);

CREATE POLICY "Enable all access for service role" ON leads
    FOR ALL USING (true);

CREATE POLICY "Enable all access for service role" ON conversations
    FOR ALL USING (true);

CREATE POLICY "Enable all access for service role" ON notes
    FOR ALL USING (true);

-- =====================================================
-- HELPFUL VIEWS
-- =====================================================

-- View: Leads with company information
CREATE VIEW leads_with_companies AS
SELECT
    l.id,
    l.first_name,
    l.last_name,
    l.email,
    l.phone,
    l.title,
    l.linkedin_url,
    l.status,
    l.created_at,
    l.updated_at,
    c.id as company_id,
    c.name as company_name,
    c.website as company_website,
    c.industry as company_industry
FROM leads l
LEFT JOIN companies c ON l.company_id = c.id;

-- View: Recent activity summary
CREATE VIEW recent_activity AS
SELECT
    'conversation' as activity_type,
    c.id,
    c.lead_id,
    l.first_name || ' ' || l.last_name as lead_name,
    c.type as detail_type,
    c.subject as title,
    c.conversation_date as activity_date,
    c.created_at
FROM conversations c
JOIN leads l ON c.lead_id = l.id
UNION ALL
SELECT
    'note' as activity_type,
    n.id,
    n.lead_id,
    CASE
        WHEN n.lead_id IS NOT NULL THEN l.first_name || ' ' || l.last_name
        WHEN n.company_id IS NOT NULL THEN c.name
    END as lead_name,
    n.note_type as detail_type,
    LEFT(n.content, 100) as title,
    n.created_at as activity_date,
    n.created_at
FROM notes n
LEFT JOIN leads l ON n.lead_id = l.id
LEFT JOIN companies c ON n.company_id = c.id
ORDER BY activity_date DESC;

-- =====================================================
-- SAMPLE DATA (Optional - uncomment to populate)
-- =====================================================
/*
-- Insert sample company
INSERT INTO companies (name, website, industry, description) VALUES
('Acme Corp', 'https://acme.example.com', 'Technology', 'Leading tech company');

-- Insert sample leads
INSERT INTO leads (first_name, last_name, email, phone, title, status) VALUES
('John', 'Doe', 'john.doe@example.com', '+1234567890', 'CEO', 'new'),
('Jane', 'Smith', 'jane.smith@example.com', '+1234567891', 'CTO', 'contacted');

-- Insert sample conversation
INSERT INTO conversations (lead_id, type, subject, content, conversation_date)
SELECT id, 'email', 'Initial outreach', 'Sent introductory email about our services', NOW()
FROM leads WHERE email = 'john.doe@example.com';

-- Insert sample note
INSERT INTO notes (lead_id, content, note_type)
SELECT id, 'Very interested in our product. Follow up next week.', 'follow-up'
FROM leads WHERE email = 'john.doe@example.com';
*/

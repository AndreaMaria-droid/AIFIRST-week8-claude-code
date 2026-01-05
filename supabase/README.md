# Personal CRM Database - Supabase

A simple, expandable personal CRM system built on Supabase.

## Database Schema

### Tables Overview

#### 1. Companies
Stores company/organization information.

**Fields:**
- `id` (UUID, PK) - Unique identifier
- `name` (TEXT, required) - Company name
- `website` (TEXT) - Company website
- `industry` (TEXT) - Industry/sector
- `description` (TEXT) - Additional notes
- `created_at` (TIMESTAMPTZ) - Record creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

**Relationships:**
- One company can have many leads

---

#### 2. Leads
Stores information about people (contacts/prospects).

**Fields:**
- `id` (UUID, PK) - Unique identifier
- `first_name` (TEXT, required) - First name
- `last_name` (TEXT, required) - Last name
- `email` (TEXT, unique) - Email address
- `phone` (TEXT) - Phone number
- `title` (TEXT) - Job title
- `company_id` (UUID, FK → companies) - Associated company
- `linkedin_url` (TEXT) - LinkedIn profile URL
- `status` (TEXT) - Lead status: new, contacted, qualified, nurturing, customer, inactive
- `created_at` (TIMESTAMPTZ) - Record creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

**Relationships:**
- Belongs to one company (optional)
- Has many conversations
- Has many notes

---

#### 3. Conversations
Tracks all interactions with leads.

**Fields:**
- `id` (UUID, PK) - Unique identifier
- `lead_id` (UUID, FK → leads, required) - Associated lead
- `type` (TEXT, required) - Conversation type: email, linkedin, call, meeting, other
- `subject` (TEXT) - Conversation subject/topic
- `content` (TEXT) - Conversation details/notes
- `conversation_date` (TIMESTAMPTZ) - When the conversation occurred
- `created_at` (TIMESTAMPTZ) - Record creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

**Relationships:**
- Belongs to one lead

---

#### 4. Notes
Stores notes and activities related to leads or companies.

**Fields:**
- `id` (UUID, PK) - Unique identifier
- `lead_id` (UUID, FK → leads) - Associated lead (optional)
- `company_id` (UUID, FK → companies) - Associated company (optional)
- `content` (TEXT, required) - Note content
- `note_type` (TEXT) - Type: note, task, reminder, follow-up
- `due_date` (TIMESTAMPTZ) - Due date for tasks/reminders
- `completed` (BOOLEAN) - Task completion status
- `created_at` (TIMESTAMPTZ) - Record creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

**Constraints:**
- Must be related to either a lead OR a company (at least one required)

**Relationships:**
- Belongs to one lead (optional)
- Belongs to one company (optional)

---

## Database Views

### leads_with_companies
Convenient view joining leads with their company information.

### recent_activity
Combined view of all conversations and notes, ordered by date.

---

## Setup Instructions

### 1. Execute the Schema

You can run the schema in several ways:

#### Option A: Supabase Dashboard (Recommended)
1. Go to [https://egjkkzxqlihzkozpnojz.supabase.co](https://egjkkzxqlihzkozpnojz.supabase.co)
2. Navigate to **SQL Editor**
3. Copy the contents of `schema.sql`
4. Paste and click **Run**

#### Option B: Using Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref egjkkzxqlihzkozpnojz

# Run the migration
supabase db push
```

#### Option C: Using psql
```bash
# Connect to your Supabase database
psql "postgresql://postgres:[YOUR-PASSWORD]@db.egjkkzxqlihzkozpnojz.supabase.co:5432/postgres"

# Run the schema file
\i schema.sql
```

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in your credentials (already done).

### 3. Verify Setup
After running the schema, verify the tables were created:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

You should see: `companies`, `leads`, `conversations`, `notes`

---

## Entity Relationship Diagram

```
┌─────────────┐
│  companies  │
│─────────────│
│ id (PK)     │
│ name        │
│ website     │
│ industry    │
└──────┬──────┘
       │
       │ 1:N
       │
┌──────▼──────┐
│    leads    │
│─────────────│
│ id (PK)     │
│ first_name  │
│ last_name   │
│ email       │
│ company_id  │◄────┐
│ status      │     │
└──────┬──────┘     │
       │            │
       │ 1:N        │
       │            │
┌──────▼────────┐   │
│ conversations │   │
│───────────────│   │
│ id (PK)       │   │
│ lead_id (FK)  │   │
│ type          │   │
│ subject       │   │
└───────────────┘   │
                    │
       │ 1:N        │
       │            │
┌──────▼─────────┐  │
│     notes      │  │
│────────────────│  │
│ id (PK)        │  │
│ lead_id (FK)   │  │
│ company_id (FK)├──┘
│ content        │
│ note_type      │
└────────────────┘
```

---

## Sample Queries

### Get all leads with their company info
```sql
SELECT * FROM leads_with_companies
ORDER BY created_at DESC;
```

### Get recent conversations for a lead
```sql
SELECT * FROM conversations
WHERE lead_id = 'YOUR-LEAD-ID'
ORDER BY conversation_date DESC
LIMIT 10;
```

### Get all pending tasks
```sql
SELECT n.*, l.first_name, l.last_name
FROM notes n
LEFT JOIN leads l ON n.lead_id = l.id
WHERE note_type IN ('task', 'reminder', 'follow-up')
  AND completed = FALSE
ORDER BY due_date ASC NULLS LAST;
```

### Get activity summary
```sql
SELECT * FROM recent_activity
LIMIT 20;
```

### Get leads by status
```sql
SELECT first_name, last_name, email, status
FROM leads
WHERE status = 'qualified'
ORDER BY updated_at DESC;
```

---

## Future Enhancements (v2 ideas)

- **Tags/Labels**: Add a tags table for categorizing leads and companies
- **Deals/Opportunities**: Track sales pipeline
- **Email Integration**: Sync with email providers
- **Attachments**: Store files related to leads/companies
- **Custom Fields**: User-defined fields for leads
- **Search**: Full-text search across all entities
- **Analytics**: Dashboards and reporting
- **Multi-user**: Team collaboration features
- **Automations**: Triggered actions and workflows

---

## Security Notes

- Row Level Security (RLS) is enabled but currently permissive
- Service role key has full access - keep it secure
- For production, implement proper RLS policies
- Consider using anon key with authentication for client-side access
- Never commit `.env` file to version control (already in .gitignore)

---

## Support

For Supabase documentation: [https://supabase.com/docs](https://supabase.com/docs)

For questions about this schema, refer to the inline comments in `schema.sql`.

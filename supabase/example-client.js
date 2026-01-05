/**
 * Personal CRM - Supabase Client Example
 *
 * This file demonstrates how to interact with your CRM database using the Supabase JS client.
 * It is not intended to be executed.
 *
 * Purpose: Reference code showing CRUD operations for the CRM
 *
 * Demonstrates:
 * - Creating, reading, updating companies and leads
 * - Logging conversations with leads
 * - Managing notes and tasks
 * - Querying views and relationships
 * - Complete example workflow
 *
 * Installation (if you want to run it):
 *   npm install @supabase/supabase-js dotenv
 *
 * Usage:
 *   node example-client.js
 */

require('dotenv').config({ path: './supabase/.env' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// =====================================================
// COMPANIES
// =====================================================

async function createCompany(name, website, industry, description) {
  const { data, error } = await supabase
    .from('companies')
    .insert([{ name, website, industry, description }])
    .select()
    .single();

  if (error) {
    console.error('Error creating company:', error);
    return null;
  }

  console.log('Created company:', data);
  return data;
}

async function getCompanies() {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching companies:', error);
    return [];
  }

  return data;
}

async function updateCompany(id, updates) {
  const { data, error } = await supabase
    .from('companies')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating company:', error);
    return null;
  }

  console.log('Updated company:', data);
  return data;
}

// =====================================================
// LEADS
// =====================================================

async function createLead(leadData) {
  const { data, error } = await supabase
    .from('leads')
    .insert([leadData])
    .select()
    .single();

  if (error) {
    console.error('Error creating lead:', error);
    return null;
  }

  console.log('Created lead:', data);
  return data;
}

async function getLeads(status = null) {
  let query = supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching leads:', error);
    return [];
  }

  return data;
}

async function getLeadsWithCompanies() {
  const { data, error } = await supabase
    .from('leads_with_companies')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching leads with companies:', error);
    return [];
  }

  return data;
}

async function updateLeadStatus(leadId, status) {
  const { data, error } = await supabase
    .from('leads')
    .update({ status })
    .eq('id', leadId)
    .select()
    .single();

  if (error) {
    console.error('Error updating lead status:', error);
    return null;
  }

  console.log('Updated lead status:', data);
  return data;
}

// =====================================================
// CONVERSATIONS
// =====================================================

async function createConversation(leadId, type, subject, content, conversationDate = new Date()) {
  const { data, error } = await supabase
    .from('conversations')
    .insert([{
      lead_id: leadId,
      type,
      subject,
      content,
      conversation_date: conversationDate.toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating conversation:', error);
    return null;
  }

  console.log('Created conversation:', data);
  return data;
}

async function getConversationsForLead(leadId, limit = 10) {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('lead_id', leadId)
    .order('conversation_date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }

  return data;
}

// =====================================================
// NOTES
// =====================================================

async function createNote(noteData) {
  const { data, error } = await supabase
    .from('notes')
    .insert([noteData])
    .select()
    .single();

  if (error) {
    console.error('Error creating note:', error);
    return null;
  }

  console.log('Created note:', data);
  return data;
}

async function getNotesForLead(leadId) {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notes:', error);
    return [];
  }

  return data;
}

async function getPendingTasks() {
  const { data, error } = await supabase
    .from('notes')
    .select(`
      *,
      leads (
        first_name,
        last_name,
        email
      )
    `)
    .in('note_type', ['task', 'reminder', 'follow-up'])
    .eq('completed', false)
    .order('due_date', { ascending: true, nullsFirst: false });

  if (error) {
    console.error('Error fetching pending tasks:', error);
    return [];
  }

  return data;
}

async function completeTask(noteId) {
  const { data, error } = await supabase
    .from('notes')
    .update({ completed: true })
    .eq('id', noteId)
    .select()
    .single();

  if (error) {
    console.error('Error completing task:', error);
    return null;
  }

  console.log('Completed task:', data);
  return data;
}

// =====================================================
// ACTIVITY
// =====================================================

async function getRecentActivity(limit = 20) {
  const { data, error } = await supabase
    .from('recent_activity')
    .select('*')
    .limit(limit);

  if (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }

  return data;
}

// =====================================================
// EXAMPLE USAGE
// =====================================================

async function exampleUsage() {
  console.log('=== Personal CRM Example Usage ===\n');

  // 1. Create a company
  console.log('1. Creating a company...');
  const company = await createCompany(
    'Tech Startup Inc',
    'https://techstartup.example.com',
    'Technology',
    'Innovative SaaS company'
  );

  if (!company) return;

  // 2. Create a lead
  console.log('\n2. Creating a lead...');
  const lead = await createLead({
    first_name: 'Alice',
    last_name: 'Johnson',
    email: 'alice.johnson@example.com',
    phone: '+1234567890',
    title: 'VP of Engineering',
    company_id: company.id,
    status: 'new'
  });

  if (!lead) return;

  // 3. Log a conversation
  console.log('\n3. Logging a conversation...');
  await createConversation(
    lead.id,
    'email',
    'Introduction to our services',
    'Had a great initial conversation about their needs. They are interested in our enterprise plan.',
    new Date()
  );

  // 4. Create a follow-up task
  console.log('\n4. Creating a follow-up task...');
  const followUpDate = new Date();
  followUpDate.setDate(followUpDate.getDate() + 3);

  await createNote({
    lead_id: lead.id,
    content: 'Send pricing proposal and schedule demo',
    note_type: 'follow-up',
    due_date: followUpDate.toISOString(),
    completed: false
  });

  // 5. Update lead status
  console.log('\n5. Updating lead status...');
  await updateLeadStatus(lead.id, 'contacted');

  // 6. Get all leads with companies
  console.log('\n6. Fetching all leads with company info...');
  const leadsWithCompanies = await getLeadsWithCompanies();
  console.log('Leads:', leadsWithCompanies);

  // 7. Get recent activity
  console.log('\n7. Fetching recent activity...');
  const activity = await getRecentActivity(10);
  console.log('Recent activity:', activity);

  // 8. Get pending tasks
  console.log('\n8. Fetching pending tasks...');
  const tasks = await getPendingTasks();
  console.log('Pending tasks:', tasks);

  console.log('\n=== Example completed successfully! ===');
}

// Export functions for use in other modules
module.exports = {
  supabase,
  // Companies
  createCompany,
  getCompanies,
  updateCompany,
  // Leads
  createLead,
  getLeads,
  getLeadsWithCompanies,
  updateLeadStatus,
  // Conversations
  createConversation,
  getConversationsForLead,
  // Notes
  createNote,
  getNotesForLead,
  getPendingTasks,
  completeTask,
  // Activity
  getRecentActivity
};

// Run example if this file is executed directly
if (require.main === module) {
  exampleUsage()
    .then(() => {
      console.log('\nDone!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}

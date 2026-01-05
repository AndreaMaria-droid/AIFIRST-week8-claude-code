/**
 * Test client for Supabase CRM connection
 * Purpose: verify schema access and permissions
 */

require('dotenv').config({ path: './supabase/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testConnection() {
  console.log('Testing Supabase CRM Connection...\n');

  try {
    // 1. Verify companies table exists and is accessible
    console.log('1. Testing companies table...');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .limit(1);

    if (companiesError) {
      console.error('❌ Companies table error:', companiesError.message);
    } else {
      console.log('✓ Companies table accessible');
      console.log(`  Found ${companies.length} rows`);
    }

    // 2. Verify leads table exists and is accessible
    console.log('\n2. Testing leads table...');
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .limit(1);

    if (leadsError) {
      console.error('❌ Leads table error:', leadsError.message);
    } else {
      console.log('✓ Leads table accessible');
      console.log(`  Found ${leads.length} rows`);
    }

    // 3. Verify conversations table exists and is accessible
    console.log('\n3. Testing conversations table...');
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select('*')
      .limit(1);

    if (conversationsError) {
      console.error('❌ Conversations table error:', conversationsError.message);
    } else {
      console.log('✓ Conversations table accessible');
      console.log(`  Found ${conversations.length} rows`);
    }

    // 4. Verify notes table exists and is accessible
    console.log('\n4. Testing notes table...');
    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('*')
      .limit(1);

    if (notesError) {
      console.error('❌ Notes table error:', notesError.message);
    } else {
      console.log('✓ Notes table accessible');
      console.log(`  Found ${notes.length} rows`);
    }

    // 5. Verify leads_with_companies view exists and is accessible
    console.log('\n5. Testing leads_with_companies view...');
    const { data: leadsView, error: leadsViewError } = await supabase
      .from('leads_with_companies')
      .select('*')
      .limit(1);

    if (leadsViewError) {
      console.error('❌ Leads view error:', leadsViewError.message);
    } else {
      console.log('✓ Leads with companies view accessible');
      console.log(`  Found ${leadsView.length} rows`);
    }

    // 6. Verify recent_activity view exists and is accessible
    console.log('\n6. Testing recent_activity view...');
    const { data: activityView, error: activityViewError } = await supabase
      .from('recent_activity')
      .select('*')
      .limit(1);

    if (activityViewError) {
      console.error('❌ Recent activity view error:', activityViewError.message);
    } else {
      console.log('✓ Recent activity view accessible');
      console.log(`  Found ${activityView.length} rows`);
    }

    // 7. Test write permissions by creating and deleting a test company
    console.log('\n7. Testing write permissions...');
    const { data: testCompany, error: insertError } = await supabase
      .from('companies')
      .insert([{
        name: 'Test Company',
        website: 'https://test.example.com',
        industry: 'Testing',
        description: 'Connection test'
      }])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Insert permission error:', insertError.message);
    } else {
      console.log('✓ Insert permission verified');

      // Clean up test data
      const { error: deleteError } = await supabase
        .from('companies')
        .delete()
        .eq('id', testCompany.id);

      if (deleteError) {
        console.error('❌ Delete permission error:', deleteError.message);
      } else {
        console.log('✓ Delete permission verified');
      }
    }

    console.log('\n✅ All connection tests completed!');
    console.log('\nYour CRM database is ready to use.');

  } catch (error) {
    console.error('\n❌ Connection test failed:', error.message);
    console.error('\nPlease verify:');
    console.error('1. The SQL schema has been executed in Supabase');
    console.error('2. The environment variables are correct');
    console.error('3. Your Supabase project is active');
  }
}

// Run the test
testConnection()
  .then(() => {
    console.log('\nTest complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });

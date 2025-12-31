#!/usr/bin/env node

/**
 * Seed Database Script
 * Creates admin account and populates database with starter content
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing required environment variables');
  console.error('   Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminAccount() {
  console.log('🔐 Creating admin account...');

  const adminEmail = 'admin@tcggossip.com';
  const adminPassword = 'ChangeThisPassword123!';

  // Check if admin already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const adminExists = existingUsers?.users?.some(u => u.email === adminEmail);

  if (adminExists) {
    console.log('✅ Admin account already exists');
    return;
  }

  // Create admin user
  const { data, error } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: {
      username: 'TCGAdmin'
    }
  });

  if (error) {
    console.error('❌ Error creating admin account:', error.message);
    throw error;
  }

  console.log('✅ Admin account created successfully');
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log('   ⚠️  CHANGE THIS PASSWORD after first login!');
}

async function runSeedData() {
  console.log('\n🌱 Running seed data...');

  // Read the SQL file
  const sqlPath = path.join(__dirname, '../SEED_DATA.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  // Execute the SQL
  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    // If exec_sql function doesn't exist, try direct query
    console.log('   Attempting direct SQL execution...');

    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        const { error: queryError } = await supabase.from('_').select('*').limit(0);
        // This won't work for arbitrary SQL, we need to use the SQL editor
      }
    }

    console.log('⚠️  Could not execute SQL directly via API');
    console.log('   Please run SEED_DATA.sql manually in Supabase SQL Editor:');
    console.log('   https://supabase.com/dashboard/project/vzgefgghnoqaqqjrthmw/sql/new');
    return false;
  }

  console.log('✅ Seed data executed successfully');
  return true;
}

async function verifySeedData() {
  console.log('\n📊 Verifying seed data...');

  // Check profiles count
  const { count: profileCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // Check threads count
  const { count: threadCount } = await supabase
    .from('threads')
    .select('*', { count: 'exact', head: true });

  // Check replies count
  const { count: replyCount } = await supabase
    .from('replies')
    .select('*', { count: 'exact', head: true });

  console.log(`   Users: ${profileCount || 0}`);
  console.log(`   Threads: ${threadCount || 0}`);
  console.log(`   Replies: ${replyCount || 0}`);

  if (profileCount >= 10 && threadCount >= 15) {
    console.log('✅ Seed data verified successfully!');
    return true;
  } else {
    console.log('⚠️  Expected at least 10 users and 15 threads');
    return false;
  }
}

async function main() {
  console.log('🚀 TCG Gossip - Database Seed Script\n');
  console.log('='.repeat(50));

  try {
    // Step 1: Create admin account
    await createAdminAccount();

    // Step 2: Wait a moment for auth to propagate
    console.log('\n⏳ Waiting for auth to propagate...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 3: Run seed data
    const sqlSuccess = await runSeedData();

    if (!sqlSuccess) {
      console.log('\n📝 Next Steps:');
      console.log('   1. Admin account is created ✅');
      console.log('   2. Open Supabase SQL Editor:');
      console.log('      https://supabase.com/dashboard/project/vzgefgghnoqaqqjrthmw/sql/new');
      console.log('   3. Copy contents of SEED_DATA.sql');
      console.log('   4. Paste and click "RUN"');
      return;
    }

    // Step 4: Verify
    await verifySeedData();

    console.log('\n' + '='.repeat(50));
    console.log('🎉 Database seeding complete!\n');
    console.log('📝 Next Steps:');
    console.log('   1. Visit your site: https://www.tcggossip.com');
    console.log('   2. Log in with:');
    console.log('      Email: admin@tcggossip.com');
    console.log('      Password: ChangeThisPassword123!');
    console.log('   3. ⚠️  IMPORTANT: Change your password immediately!');
    console.log('   4. Customize your profile');
    console.log('   5. Start inviting beta testers!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();

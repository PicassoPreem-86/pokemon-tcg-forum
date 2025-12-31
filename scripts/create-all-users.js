#!/usr/bin/env node

/**
 * Create all user accounts for seed data
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const users = [
  { email: 'admin@tcggossip.com', password: 'ChangeThisPassword123!', username: 'TCGAdmin' },
  { email: 'pikachumaster@tcggossip.com', password: 'TempPass123!', username: 'PikachuMaster' },
  { email: 'charizardfan99@tcggossip.com', password: 'TempPass123!', username: 'CharizardFan99' },
  { email: 'competitiveace@tcggossip.com', password: 'TempPass123!', username: 'CompetitiveAce' },
  { email: 'vintagecollector@tcggossip.com', password: 'TempPass123!', username: 'VintageCollector' },
  { email: 'pocketproplayer@tcggossip.com', password: 'TempPass123!', username: 'PocketProPlayer' },
  { email: 'gradehunter@tcggossip.com', password: 'TempPass123!', username: 'GradeHunter' },
  { email: 'marketwatch@tcggossip.com', password: 'TempPass123!', username: 'MarketWatch' },
  { email: 'pullmaster@tcggossip.com', password: 'TempPass123!', username: 'PullMaster' },
  { email: 'beginnertrainer@tcggossip.com', password: 'TempPass123!', username: 'BeginnerTrainer' },
  { email: 'fakecarddetective@tcggossip.com', password: 'TempPass123!', username: 'FakeCardDetective' },
];

async function createAllUsers() {
  console.log('🔐 Creating all user accounts...\n');

  for (const user of users) {
    try {
      // Check if user exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const exists = existingUsers?.users?.some(u => u.email === user.email);

      if (exists) {
        console.log(`✅ ${user.username} (${user.email}) - already exists`);
        continue;
      }

      // Create user
      const { error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { username: user.username }
      });

      if (error) {
        console.log(`❌ ${user.username} - Error: ${error.message}`);
      } else {
        console.log(`✅ ${user.username} (${user.email}) - created`);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`❌ ${user.username} - Error:`, error.message);
    }
  }

  console.log('\n✅ All users created successfully!');
  console.log('\n📝 Next: Run SEED_DATA.sql in Supabase SQL Editor');
}

createAllUsers();

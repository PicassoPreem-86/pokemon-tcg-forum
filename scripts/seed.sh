#!/bin/bash

# TCG Gossip - Database Seed Script
# Creates admin account and seeds database with starter content

set -e  # Exit on error

echo "🚀 TCG Gossip - Database Seed Script"
echo "==================================================
"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project details
PROJECT_REF="vzgefgghnoqaqqjrthmw"
ADMIN_EMAIL="admin@tcggossip.com"
ADMIN_PASSWORD="ChangeThisPassword123!"

echo -e "${BLUE}📍 Project:${NC} $PROJECT_REF"
echo -e "${BLUE}📧 Admin Email:${NC} $ADMIN_EMAIL"
echo ""

# Step 1: Create admin account using Node.js
echo -e "${YELLOW}🔐 Step 1: Creating admin account...${NC}"
node <<'EOF'
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function createAdmin() {
  try {
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const adminExists = existingUsers?.users?.some(u => u.email === 'admin@tcggossip.com');

    if (adminExists) {
      console.log('✅ Admin account already exists');
      return;
    }

    const { error } = await supabase.auth.admin.createUser({
      email: 'admin@tcggossip.com',
      password: 'ChangeThisPassword123!',
      email_confirm: true,
      user_metadata: { username: 'TCGAdmin' }
    });

    if (error) throw error;
    console.log('✅ Admin account created successfully');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
EOF

echo ""
echo -e "${YELLOW}⏳ Waiting for auth to propagate...${NC}"
sleep 3

# Step 2: Execute SQL seed data using psql
echo ""
echo -e "${YELLOW}🌱 Step 2: Running seed data SQL...${NC}"

# Get database connection string
echo "   Getting database connection string..."
DB_URL=$(supabase status --project-ref $PROJECT_REF 2>/dev/null | grep "DB URL" | awk '{print $3}')

if [ -z "$DB_URL" ]; then
  # Alternative: construct connection string
  DB_URL="postgresql://postgres:[DB-PASSWORD]@db.vzgefgghnoqaqqjrthmw.supabase.co:5432/postgres"
  echo -e "${YELLOW}   Using psql with Supabase connection...${NC}"
fi

echo "   Executing SEED_DATA.sql..."

# Use psql to execute the SQL file
PGPASSWORD=$DB_PASSWORD psql -h db.vzgefgghnoqaqqjrthmw.supabase.co -U postgres -d postgres -p 5432 -f SEED_DATA.sql 2>/dev/null || {
  echo ""
  echo -e "${RED}❌ Could not execute SQL automatically${NC}"
  echo ""
  echo "The admin account was created successfully, but we need to run the SQL manually."
  echo ""
  echo -e "${YELLOW}Please follow these steps:${NC}"
  echo "1. Open: https://supabase.com/dashboard/project/vzgefgghnoqaqqjrthmw/sql/new"
  echo "2. Copy the contents of SEED_DATA.sql"
  echo "3. Paste into the SQL Editor"
  echo "4. Click 'RUN'"
  echo ""
  exit 0
}

echo -e "${GREEN}✅ Seed data executed successfully${NC}"

# Step 3: Verify the data
echo ""
echo -e "${YELLOW}📊 Step 3: Verifying seed data...${NC}"
echo ""

node <<'EOF'
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verify() {
  const { count: users } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  const { count: threads } = await supabase.from('threads').select('*', { count: 'exact', head: true });
  const { count: replies } = await supabase.from('replies').select('*', { count: 'exact', head: true });

  console.log(`   Users: ${users || 0}`);
  console.log(`   Threads: ${threads || 0}`);
  console.log(`   Replies: ${replies || 0}`);
}

verify();
EOF

echo ""
echo "=================================================="
echo -e "${GREEN}🎉 Database seeding complete!${NC}"
echo ""
echo "📝 Next Steps:"
echo "   1. Visit your site: https://www.tcggossip.com"
echo "   2. Log in with:"
echo "      Email: $ADMIN_EMAIL"
echo "      Password: $ADMIN_PASSWORD"
echo -e "   3. ${RED}⚠️  IMPORTANT: Change your password immediately!${NC}"
echo "   4. Customize your profile"
echo "   5. Start inviting beta testers!"
echo ""

#!/bin/bash

# Pokemon TCG Forum - Moderation System Migration Script
# This script applies the moderation system database migration

set -e  # Exit on error

echo "=========================================="
echo "Pokemon TCG Forum - Moderation Migration"
echo "=========================================="
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "ERROR: Supabase CLI is not installed."
    echo "Please install it: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Check if we're in the project directory
if [ ! -f "package.json" ]; then
    echo "ERROR: Please run this script from the project root directory"
    exit 1
fi

echo "Step 1: Checking Supabase connection..."
if ! supabase status &> /dev/null; then
    echo "WARNING: Supabase is not running locally."
    echo "Do you want to:"
    echo "  1) Apply to local instance (requires supabase start)"
    echo "  2) Apply to remote/production instance"
    echo "  3) Exit"
    read -p "Enter choice (1-3): " choice

    case $choice in
        1)
            echo "Starting local Supabase..."
            supabase start
            ;;
        2)
            echo "Applying to remote instance..."
            supabase link
            ;;
        3)
            echo "Exiting..."
            exit 0
            ;;
        *)
            echo "Invalid choice. Exiting..."
            exit 1
            ;;
    esac
fi

echo ""
echo "Step 2: Applying moderation system migration..."
echo "This will:"
echo "  - Add ban/suspension fields to profiles table"
echo "  - Create moderation_logs table for audit trail"
echo "  - Add deletion tracking to threads and replies"
echo "  - Create helper functions for ban checking"
echo ""

read -p "Continue? (y/n): " confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "Migration cancelled."
    exit 0
fi

# Apply migration
echo ""
echo "Applying migration file: supabase/migrations/add_moderation_system.sql"
supabase db push

echo ""
echo "=========================================="
echo "Migration completed successfully!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Verify the migration:"
echo "     supabase db pull"
echo ""
echo "  2. (Optional) Setup automatic ban expiration:"
echo "     See MODERATION_SYSTEM.md for instructions"
echo ""
echo "  3. Test the moderation features:"
echo "     - Visit /admin/users to manage users"
echo "     - Try banning/unbanning a test user"
echo "     - Check moderation_logs table for audit trail"
echo ""
echo "  4. Review documentation:"
echo "     cat MODERATION_SYSTEM.md"
echo ""

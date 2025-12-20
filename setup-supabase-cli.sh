#!/bin/bash
# Supabase CLI Setup Script for Pokemon TCG Forum
# Run this script after generating your access token

PROJECT_REF="vzgefgghnoqaqqjrthmw"

echo "🔐 Supabase CLI Setup"
echo "====================="
echo ""
echo "This script will configure Supabase CLI access for your project."
echo ""

# Check if token is provided as argument
if [ -n "$1" ]; then
    SUPABASE_TOKEN="$1"
else
    echo "Please enter your Supabase access token:"
    echo "(Get it from: https://supabase.com/dashboard/account/tokens)"
    read -s SUPABASE_TOKEN
    echo ""
fi

if [ -z "$SUPABASE_TOKEN" ]; then
    echo "❌ Error: No token provided"
    exit 1
fi

# Export for current session
export SUPABASE_ACCESS_TOKEN="$SUPABASE_TOKEN"

# Add to shell profile for persistence
SHELL_PROFILE=""
if [ -f "$HOME/.zshrc" ]; then
    SHELL_PROFILE="$HOME/.zshrc"
elif [ -f "$HOME/.bashrc" ]; then
    SHELL_PROFILE="$HOME/.bashrc"
elif [ -f "$HOME/.bash_profile" ]; then
    SHELL_PROFILE="$HOME/.bash_profile"
fi

if [ -n "$SHELL_PROFILE" ]; then
    # Remove existing SUPABASE_ACCESS_TOKEN if present
    sed -i '' '/SUPABASE_ACCESS_TOKEN/d' "$SHELL_PROFILE" 2>/dev/null

    # Add new token
    echo "" >> "$SHELL_PROFILE"
    echo "# Supabase CLI Access Token" >> "$SHELL_PROFILE"
    echo "export SUPABASE_ACCESS_TOKEN=\"$SUPABASE_TOKEN\"" >> "$SHELL_PROFILE"
    echo "✅ Token saved to $SHELL_PROFILE"
fi

echo ""
echo "🔗 Linking project..."
supabase link --project-ref "$PROJECT_REF"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Supabase CLI setup complete!"
    echo ""
    echo "You can now run migrations with:"
    echo "  supabase db push"
    echo ""
    echo "Or run SQL directly:"
    echo "  supabase db execute --file supabase/migrations/COMBINED_MIGRATIONS.sql"
else
    echo ""
    echo "❌ Failed to link project. Please check your token and try again."
    exit 1
fi

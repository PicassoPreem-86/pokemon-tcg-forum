#!/bin/bash

# Rate Limiting Implementation Verification Script

echo "🔍 Verifying Rate Limiting Implementation..."
echo ""

# Check if files exist
echo "1. Checking core files..."
files=(
  "lib/rate-limit.ts"
  "supabase/migrations/add_rate_limiting.sql"
  "RATE_LIMITING.md"
  "IMPLEMENTATION_SUMMARY.md"
  "lib/__tests__/rate-limit.test.ts"
)

all_exist=true
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "   ✅ $file"
  else
    echo "   ❌ $file (missing)"
    all_exist=false
  fi
done

echo ""

# Check imports in server actions
echo "2. Checking server action integrations..."
actions=(
  "lib/actions/threads.ts"
  "lib/actions/replies.ts"
  "lib/actions/auth.ts"
)

for action in "${actions[@]}"; do
  if grep -q "checkRateLimit" "$action" 2>/dev/null; then
    echo "   ✅ $action (rate limiting integrated)"
  else
    echo "   ❌ $action (missing integration)"
  fi
done

echo ""

# Check CSS additions
echo "3. Checking CSS styles..."
if grep -q "rate-limit-error" "app/globals.css" 2>/dev/null; then
  echo "   ✅ Rate limit CSS classes added"
else
  echo "   ❌ Rate limit CSS missing"
fi

echo ""

# Check TypeScript types
echo "4. Checking database types..."
if grep -q "rate_limits" "lib/supabase/database.types.ts" 2>/dev/null; then
  echo "   ✅ RateLimit type added to database types"
else
  echo "   ❌ RateLimit type missing"
fi

echo ""

# Summary
if [ "$all_exist" = true ]; then
  echo "✨ All core files verified successfully!"
else
  echo "⚠️  Some files are missing. Please check the output above."
fi

echo ""
echo "📚 Documentation:"
echo "   - Read RATE_LIMITING.md for detailed documentation"
echo "   - Read IMPLEMENTATION_SUMMARY.md for implementation overview"
echo ""
echo "🚀 Next Steps:"
echo "   1. Run: supabase db push (to apply migration)"
echo "   2. Test rate limiting in development"
echo "   3. Monitor logs for rate limit events"
echo "   4. Adjust limits as needed in lib/rate-limit.ts"
echo ""

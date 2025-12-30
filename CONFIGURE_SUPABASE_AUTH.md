# Configure Supabase Authentication for tcggossip.com

## ✅ **Quick Fix for Registration**

Your registration is failing because Supabase needs to know about your custom domain for auth callbacks.

---

## 🔧 **Step 1: Add Redirect URLs in Supabase**

### **1. Go to Supabase Auth Settings**
Open: **https://supabase.com/dashboard/project/vzgefgghnoqaqqjrthmw/auth/url-configuration**

### **2. Add Your Site URLs**

In the **"Site URL"** field, enter:
```
https://www.tcggossip.com
```

### **3. Add Redirect URLs**

In the **"Redirect URLs"** section, add these URLs (one per line):

```
https://www.tcggossip.com/auth/callback
https://tcggossip.com/auth/callback
http://localhost:3000/auth/callback
https://www.tcggossip.com/*
https://tcggossip.com/*
```

**Why?** Supabase will only send auth tokens to whitelisted URLs. This allows:
- Production site (www and non-www)
- Local development
- Wildcard for all pages on your domain

### **4. Click "Save"**

---

## 🎯 **Step 2: Verify Email Settings**

### **Check Email Auth Configuration**

Go to: **https://supabase.com/dashboard/project/vzgefgghnoqaqqjrthmw/auth/providers**

Look for **"Email"** provider:

**Option A: Supabase Built-in Emails (Recommended for Testing)**
- ✅ **Enable Supabase Auth emails** - Toggle ON
- ✅ **Confirm email** - Can be ON (Supabase will send confirmation emails)
- ⚠️ **Rate limit**: 3-4 emails per hour on free tier

**Option B: Disable Email Confirmation (Quick Test)**
- ✅ **Enable email provider** - Toggle ON
- ❌ **Confirm email** - Toggle OFF
- Users can sign up instantly without email verification

**For now, I recommend Option A** - Supabase's built-in emails work great for testing and small projects!

---

## 📧 **How Supabase Email Confirmation Works**

When a user registers:

1. User fills out registration form
2. Supabase creates the account (but it's not confirmed yet)
3. Supabase sends a confirmation email using their servers
4. User clicks the link in email
5. User is redirected to: `https://www.tcggossip.com/auth/callback`
6. Your callback route exchanges the code for a session
7. User is logged in and redirected to homepage

**Your auth callback route is already set up correctly!**

---

## ✅ **Step 3: Test Registration**

After completing Steps 1 and 2:

1. Go to: **https://www.tcggossip.com/register**
2. Enter test credentials:
   - Email: your-real-email@example.com
   - Username: testuser
   - Password: password123

3. Click "Sign Up"

**What should happen:**
- If email confirmation is ON: You'll see a message to check your email
- If email confirmation is OFF: You'll be logged in immediately

4. Check your email inbox (if confirmation is ON)
5. Click the confirmation link
6. You should be redirected back and logged in!

---

## 🔍 **Troubleshooting**

### **Issue: "Invalid redirect URL" error**

**Fix:** Make sure you added the redirect URLs in Step 1

### **Issue: No email received**

**Possible causes:**
1. Check spam folder
2. Supabase rate limit hit (3-4 emails/hour on free tier)
3. Email provider configuration issue

**Fix:**
- Wait a few minutes and try again
- Or temporarily disable email confirmation
- Or check Supabase logs: https://supabase.com/dashboard/project/vzgefgghnoqaqqjrthmw/logs/explorer

### **Issue: Email received but link doesn't work**

**Fix:**
1. Verify Site URL is set to `https://www.tcggossip.com`
2. Check that redirect URLs include `/auth/callback`
3. Make sure the deployment finished successfully

### **Issue: Stuck on "Signing up..." spinner**

**Fix:**
1. Open browser console (F12)
2. Look for red error messages
3. Check Network tab for failed requests
4. Share the error with me!

---

## 🚀 **Current Deployment Status**

I've just updated your production deployment with:
- ✅ `NEXT_PUBLIC_SITE_URL` = `https://www.tcggossip.com`
- ✅ Updated environment configuration
- ✅ Auth callback route ready

**Deployment URL:** https://www.tcggossip.com (will be live in ~1 minute)

---

## 📝 **Quick Checklist**

Do these in order:

- [ ] Go to Supabase URL Configuration
- [ ] Set Site URL to `https://www.tcggossip.com`
- [ ] Add redirect URLs (see Step 1 above)
- [ ] Save
- [ ] Go to Auth Providers
- [ ] Verify Email provider is enabled
- [ ] Choose email confirmation setting (ON or OFF)
- [ ] Save
- [ ] Wait 1 minute for deployment to finish
- [ ] Test registration at https://www.tcggossip.com/register

---

## 🎯 **After You Configure Supabase**

Once you've completed the checklist above, try registering again and let me know:

1. **Did you see an error?** (If yes, what was it?)
2. **Did you get an email?** (Check spam!)
3. **Did the email link work?**
4. **Were you logged in successfully?**

---

## 💡 **Production Email Setup (Optional - For Later)**

For production with high volume, you'll want a custom email provider:

**Best Options:**
1. **Resend** - Free 3000 emails/month, easy setup
2. **SendGrid** - Free 100 emails/day
3. **AWS SES** - Cheap, reliable, but more complex

See `FIX_REGISTRATION_ISSUE.md` for detailed setup instructions.

---

**For now, Supabase's built-in emails should work perfectly for your forum!**

Just complete the checklist above and test registration again. 🚀

# Firebase to Supabase Migration Steps

## Step 1: Install Packages ✅
```bash
npm install @supabase/supabase-js @supabase/ssr
```

## Step 2: Add Environment Variables ✅
Add to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://zhwqjrclbarummyrbmbs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 3: Create Database Schema
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `supabase-schema.sql`
3. Click "Run" to execute the schema

## Step 4: Verify Schema
Run this in SQL Editor to verify tables were created:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

You should see:
- users
- receipts
- community_listings
- property_requests
- removed_properties

## Step 5: Test Supabase Connection
```bash
npm run dev
```

Check browser console for any Supabase connection errors.

## Next Steps (Code Migration)
1. Update auth context to use Supabase
2. Migrate receipt operations
3. Migrate property listings
4. Migrate property requests
5. Remove Firebase dependencies


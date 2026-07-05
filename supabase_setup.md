# Edutwin AI — Supabase Setup (Step-by-Step)

> **Your current state (from screenshot):**
> - ✅ `profiles` table exists (but UNRESTRICTED — no RLS)
> - ✅ `activities` table exists (id, student_id, title, category visible)
> - ✅ `faculty_reviews` table exists
> - ❌ Missing columns in `activities` (description, certificate_url, status, created_at)
> - ❌ No RLS policies set
> - ❌ No auto-trigger for profile creation

---

## 🔷 HOW TO OPEN THE SQL EDITOR

1. Look at the **left sidebar** in your Supabase dashboard
2. Click the **SQL Editor icon** (looks like `{ }` or a code bracket icon — it's the 5th icon from top)
3. Click **"New Query"** (top right of the SQL editor panel)
4. **Paste the SQL below**, then click the **green "Run" button** (▶)

> ⚠️ Run each numbered step ONE AT A TIME. Paste → Run → check for errors → proceed to next.

---

## ✅ STEP 1 — Add Missing Columns to `activities` Table

Your `activities` table is missing required columns. Run this:

```sql
ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS description    TEXT,
  ADD COLUMN IF NOT EXISTS certificate_url TEXT,
  ADD COLUMN IF NOT EXISTS status         TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS created_at     TIMESTAMPTZ DEFAULT NOW();
```

**Expected result:** "Success. No rows returned."

---

## ✅ STEP 2 — Add Missing Columns to `profiles` Table

```sql
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name    TEXT,
  ADD COLUMN IF NOT EXISTS email        TEXT,
  ADD COLUMN IF NOT EXISTS department   TEXT,
  ADD COLUMN IF NOT EXISTS year         INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS register_no  TEXT,
  ADD COLUMN IF NOT EXISTS role         TEXT DEFAULT 'student' CHECK (role IN ('student', 'faculty', 'admin')),
  ADD COLUMN IF NOT EXISTS created_at   TIMESTAMPTZ DEFAULT NOW();
```

**Expected result:** "Success. No rows returned."

---

## ✅ STEP 3 — Enable RLS (Row Level Security) on Both Tables

```sql
ALTER TABLE public.profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
```

**Expected result:** "Success. No rows returned."

> After this, your `profiles` table will no longer show "UNRESTRICTED" in the sidebar.

---

## ✅ STEP 4 — RLS Policies for `profiles` Table

Paste and run ALL of this at once:

```sql
-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view own profile"          ON public.profiles;
DROP POLICY IF EXISTS "Faculty and Admin can view all"      ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile"        ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile"        ON public.profiles;

-- Students: see only their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Faculty & Admin: see ALL profiles (needed for dashboards)
CREATE POLICY "Faculty and Admin can view all"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('faculty', 'admin')
    )
  );

-- Anyone can insert their own profile row (on registration)
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can edit their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
```

**Expected result:** "Success. No rows returned."

---

## ✅ STEP 5 — RLS Policies for `activities` Table

```sql
-- Drop old policies if they exist
DROP POLICY IF EXISTS "Students read own activities"     ON public.activities;
DROP POLICY IF EXISTS "Faculty reads all activities"     ON public.activities;
DROP POLICY IF EXISTS "Students insert own activities"   ON public.activities;
DROP POLICY IF EXISTS "Faculty updates activities"       ON public.activities;

-- Students: see only their own submissions
CREATE POLICY "Students read own activities"
  ON public.activities FOR SELECT
  USING (auth.uid() = student_id);

-- Faculty & Admin: see ALL submissions (for review panel)
CREATE POLICY "Faculty reads all activities"
  ON public.activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('faculty', 'admin')
    )
  );

-- Students: upload their own activities
CREATE POLICY "Students insert own activities"
  ON public.activities FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Faculty & Admin: approve/reject (UPDATE status)
CREATE POLICY "Faculty updates activities"
  ON public.activities FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('faculty', 'admin')
    )
  );
```

**Expected result:** "Success. No rows returned."

---

## ✅ STEP 6 — Auto-Create Profile on Signup (Trigger)

This automatically creates a row in `profiles` whenever someone registers:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

**Expected result:** "Success. No rows returned."

---

## ✅ STEP 7 — Set Up Storage Bucket for Certificates

1. In the **left sidebar**, click the **Storage icon** (looks like a bucket/folder)
2. Click **"New bucket"**
3. Name it exactly: `certificates`
4. Toggle **"Public bucket"** to ON
5. Click **"Save"**

Then go back to **SQL Editor** and run:

```sql
DROP POLICY IF EXISTS "Authenticated users upload"  ON storage.objects;
DROP POLICY IF EXISTS "Public can view certificates" ON storage.objects;

CREATE POLICY "Authenticated users upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'certificates' AND auth.role() = 'authenticated');

CREATE POLICY "Public can view certificates"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'certificates');
```

**Expected result:** "Success. No rows returned."

---

## ✅ STEP 8 — Create Your Admin Account

1. Go to **Authentication → Users** (left sidebar, person icon)
2. Click **"Invite user"** or **"Add user"**
3. Enter your admin email (e.g., `admin@college.edu`) and a password
4. After creating, go back to SQL Editor and run:

```sql
-- Replace with your actual admin email
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@college.edu';
```

For faculty accounts:
```sql
UPDATE public.profiles
SET role = 'faculty'
WHERE email = 'faculty@college.edu';
```

---

## ✅ STEP 9 — Verify Everything Works

Run this final check query in SQL Editor:

```sql
-- Should show your tables with RLS enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'activities');

-- Should show all columns in activities
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'activities'
ORDER BY ordinal_position;
```

**Expected result for first query:**

| tablename  | rowsecurity |
|-----------|-------------|
| profiles  | true        |
| activities| true        |

---

## 🗺️ Navigation Guide — Where to Find Each Section

| What you need | Where to click in Supabase |
|---|---|
| SQL Editor | Left sidebar → `{ }` icon (5th icon) |
| Table Editor | Left sidebar → Grid/table icon (2nd icon) |
| Authentication | Left sidebar → Person/shield icon |
| Storage | Left sidebar → Bucket/folder icon |
| RLS Policies | Table Editor → Click a table → "RLS policies" button at top |

---

## 🚨 Common Errors & Fixes

| Error Message | What to do |
|---|---|
| `policy already exists` | The `DROP POLICY IF EXISTS` lines above will handle this. Just re-run |
| `column already exists` | Safe to ignore — `ADD COLUMN IF NOT EXISTS` handles this |
| `permission denied for table profiles` | RLS policy is blocking — make sure Step 4 was run |
| `new row violates check constraint` | The `role` value must be exactly: `student`, `faculty`, or `admin` |

---

## ✅ Final Checklist

After all steps are done, test your app:

- [ ] Register a new student account → Should create profile row automatically (Step 6 trigger)
- [ ] Login as student → Goes to `/student` dashboard
- [ ] Upload an activity → Row appears in `activities` table with `status = pending`
- [ ] Login as faculty → Faculty dashboard shows pending activities
- [ ] Approve/reject → Status updates in `activities` table
- [ ] Login as admin → Admin dashboard loads with analytics

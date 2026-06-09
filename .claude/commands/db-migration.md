---
description: Create a correctly-named Supabase migration (with RLS) and optionally apply it via the Management API.
argument-hint: <short description of the change>
allowed-tools: Read, Write, Bash, Glob
---

Create a new Supabase migration for: `$ARGUMENTS`.

1. **Filename**: `supabase/migrations/YYYYMMDDHHMMSS_<uuid>.sql`.
   - Timestamp = current UTC, 14 digits. Generate it (don't hardcode):
     `export PATH="/c/Program Files/nodejs:$PATH" && node -e "console.log(new Date().toISOString().replace(/[-:T]/g,'').slice(0,14))"`
   - uuid4: `node -e "console.log(crypto.randomUUID())"`

2. **SQL**: write idempotent SQL. For a NEW table, ALWAYS include RLS (the project standard):

       CREATE TABLE IF NOT EXISTS public.<name> (
         id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
         -- columns...
         created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
       );
       ALTER TABLE public.<name> ENABLE ROW LEVEL SECURITY;
       CREATE POLICY "Allow public read access on <name>"
         ON public.<name> FOR SELECT USING (true);

   For a policy change, use `DROP POLICY IF EXISTS "..." ON public.x;` then `CREATE POLICY ...`.
   For a column add, `ALTER TABLE public.x ADD COLUMN IF NOT EXISTS ...`.

3. **Apply** (only if I confirm): run the SQL through the Management API — never psql directly:

       curl -X POST "https://api.supabase.com/v1/projects/avlbdqqwldjteafmzwjb/database/query" \
         -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
         -H "Content-Type: application/json" \
         -d @<payload.json>

   (Token is in the root CLAUDE.md. Put the SQL in a JSON payload file to avoid quoting issues;
   never commit the token.)

4. After applying, regenerate `src/integrations/supabase/types.ts` from the live schema and run
   `/lint-build`.

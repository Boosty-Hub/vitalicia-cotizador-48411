---
description: Scaffold a Supabase Edge Function (Deno) plus its config.toml entry.
argument-hint: <function-name> [public|auth]
allowed-tools: Read, Write, Edit, Bash
---

Scaffold a new Supabase Edge Function. Request: `$ARGUMENTS` (e.g. `notify-policy auth`).

1. Create `supabase/functions/$1/index.ts` using the project's inlined-CORS pattern (there is no
   `_shared/cors.ts`):

       import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
       import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

       const corsHeaders = {
         'Access-Control-Allow-Origin': '*',
         'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
       };

       serve(async (req) => {
         if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
         try {
           const supabase = createClient(
             Deno.env.get('SUPABASE_URL')!,
             Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
           );
           // TODO: business logic
           return new Response(JSON.stringify({ success: true }), {
             headers: { ...corsHeaders, 'Content-Type': 'application/json' },
           });
         } catch (error) {
           const message = error instanceof Error ? error.message : 'Error desconocido';
           return new Response(JSON.stringify({ success: false, error: message }), {
             status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
           });
         }
       });

   For an **auth** function, instead use the dual-client pattern: an anon client carrying the
   caller's `Authorization` header to verify identity, plus a service-role client for privileged ops.

2. Register it in `supabase/config.toml`:

       [functions.$1]
       verify_jwt = true   # use false ONLY for intentionally public endpoints

   `public` => `verify_jwt = false`; `auth` (default) => `verify_jwt = true`.

3. Read any secrets via `Deno.env.get(...)` — never hardcode. Remind me to set them in the Supabase
   dashboard / via the Management API.

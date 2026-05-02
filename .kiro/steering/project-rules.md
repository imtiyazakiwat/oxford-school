# New Oxford Coaching Classes College Website - Project Rules

## Database Migrations

All database schema changes MUST be tracked as SQL migration files:

- **Location**: `New Oxford Coaching Classes-college/src/supabase/migrations/`
- **Naming Convention**: `{sequence_number}_{descriptive_name}.sql` (e.g., `011_create_events_table.sql`)
- **Required for**:
  - Creating new tables
  - Modifying existing tables (adding/removing columns)
  - Creating/modifying indexes
  - Setting up RLS policies
  - Creating storage buckets and policies

### Migration File Template
```sql
-- Migration: {description}
-- Created: {date}

-- Your DDL statements here
CREATE TABLE IF NOT EXISTS table_name (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- other columns˳-
);

-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "policy_name" ON table_name
  FOR SELECT USING (true);
```

## Storage Bucket & Image Upload Patterns

Before implementing any storage/upload feature, reference these existing implementations:

### Reference Files
- `New Oxford Coaching Classes-college/src/supabase/achievers.ts` - Achiever image uploads (512px, 0.8 quality)
- `New Oxford Coaching Classes-college/src/supabase/gallery.ts` - Gallery image uploads (1200px, 0.85 quality)
- `New Oxford Coaching Classes-college/src/utils/imageUtils.ts` - Compression utilities

### Required Patterns

1. **Image Compression**: Always use `compressImage()` from `@/utils/imageUtils`
   ```typescript
   import { compressImage, generateFileName } from "@/utils/imageUtils";
   const compressedBlob = await compressImage(file, maxSize, quality);
   ```

2. **File Naming**: Use `generateFileName()` for unique storage paths
   ```typescript
   const fileName = generateFileName(userId, "webp");
   const filePath = `${FOLDER_PATH}/${fileName}`;
   ```

3. **Caching**: Implement localStorage caching with TTL
   ```typescript
   const CACHE_TTL = 60 * 60 * 1000; // 1 hour
   // Use getFromCache() and saveToCache() pattern
   // Always call clearCache() after mutations
   ```

4. **Storage Bucket**: Use `Manage_UI` bucket with appropriate folder paths

5. **Error Handling**: Return `{ data, error }` or `{ path, error }` objects

## UI/UX Guidelines

### Page Design Reference
When designing new pages, ALWAYS reference these existing pages for UI patterns:
- `New Oxford Coaching Classes-college/src/app/gallery/page.tsx` - Gallery page layout and styling
- `New Oxford Coaching Classes-college/src/app/achievers/page.tsx` - Achievers page layout and styling
- `New Oxford Coaching Classes-college/src/components/Gallery.tsx` - Gallery component patterns
- `New Oxford Coaching Classes-college/src/components/Achievers.tsx` - Achievers component patterns

### Color Scheme (STRICT - from globals.css)
**DO NOT use any colors outside this palette. Be very strict about color consistency.**

```css
--primary: #c41e3a;        /* Main brand red - MUST USE */
--primary-dark: #a01830;   /* Hover states */
--primary-light: #e8354f;  /* Accents */
--secondary: #f7c52d;      /* Yellow accent */
--accent-blue: #1e3a8a;    /* Blue accent */
--accent-green: #166534;   /* Green accent */
```

**Hex codes to use in Tailwind:**
- Primary: `#c41e3a` (buttons, links, highlights)
- Primary hover: `#a81832` 
- Secondary: `#f7c52d` (badges, accents)
- Grays: Use Tailwind's gray scale (gray-50 to gray-900)

### Tailwind Classes
- Primary buttons: `bg-[#c41e3a] hover:bg-[#a81832] text-white`
- Focus states: `focus:outline-none focus:border-[#c41e3a]`
- Cards: `bg-white rounded-xl shadow-sm border border-gray-100`
- Loading spinners: `border-[#c41e3a] border-t-transparent`

### Component Patterns
- Use `motion/react` (Framer Motion) for animations
- Use `lucide-react` for icons
- Implement delete confirmation modals with `AnimatePresence`
- Show loading states with spinners during async operations

## Code Architecture

### Admin Dashboard Modules
- Location: `New Oxford Coaching Classes-college/src/components/admin/modules/`
- Export from: `New Oxford Coaching Classes-college/src/components/admin/modules/index.ts`
- Pattern: Each module is a self-contained component with its own state management

### Student Portal Modules
- Location: `New Oxford Coaching Classes-college/src/components/student/modules/`
- Follow same modular pattern as admin dashboard

### Supabase Service Files
- Location: `New Oxford Coaching Classes-college/src/supabase/`
- Each feature gets its own service file (e.g., `achievers.ts`, `gallery.ts`)
- Include: interfaces, CRUD operations, caching logic, storage helpers

### File Structure for New Features
```
New Oxford Coaching Classes-college/src/
├── supabase/
│   ├── migrations/
│   │   └── {XXX}_{feature}_table.sql
│   └── {feature}.ts              # Service file
├── components/
│   ├── admin/modules/
│   │   └── Manage{Feature}Module.tsx
│   └── student/modules/
│       └── {Feature}Module.tsx
└── app/
    └── {feature}/
        └── page.tsx              # If public route needed
```

## Best Practices

1. **Type Safety**: Define TypeScript interfaces for all data structures
2. **Error Handling**: Always handle and display errors gracefully
3. **Loading States**: Show loading indicators during async operations
4. **Cache Invalidation**: Clear relevant caches after data mutations
5. **Responsive Design**: Use Tailwind responsive classes (sm:, md:, lg:)
6. **Accessibility**: Include proper labels, alt text, and ARIA attributes

---

## 🔒 Security-First Engineering Mandate

**Role:** Act as a Security Engineer with 25+ years of real-world experience in backend systems, databases, and production security incidents.

### Core Assumptions
- The application runs in **production with real users and real data**
- The **frontend is fully untrusted**
- **Attackers are skilled, persistent, and creative**
- **Any missing check is a vulnerability**
- **Security is not optional and not an afterthought**

---

### Mandatory Behavior When Creating or Modifying Database Tables

Every time a new database table is created or modified, you MUST:

#### 1. Threat Model the Table
- What data does it store?
- Who should be allowed to read it?
- Who should be allowed to write, update, or delete?
- What would happen if an attacker accessed or modified this data?

#### 2. Design Access Control First
Explicitly define:
- **Owners** - who owns the data
- **Allowed roles** - who can access
- **Forbidden roles** - who must be blocked

Rules:
- Never assume "internal use only" is safe
- **Default to deny-all, then explicitly allow**

#### 3. Row Level Security (RLS) Is Mandatory
- Enable RLS by default on **all tables**
- Write explicit policies for: `SELECT`, `INSERT`, `UPDATE`, `DELETE`

Policies must:
- Reference authenticated identity (`auth.uid()` or equivalent)
- Prevent cross-user or cross-tenant access
- Prevent ownership reassignment attacks
- **Never rely solely on backend logic for authorization**

#### 4. Attack & Abuse Scenario Analysis
For every table, consider and defend against:
- Unauthorized row access
- IDOR (Insecure Direct Object References)
- Privilege escalation via updates
- Mass assignment vulnerabilities
- Cross-tenant data leakage
- Indirect access via joins, views, or functions

---

### Mandatory Security Review for All Code

When writing or modifying any backend or database code, always think like an attacker and explicitly check for:

#### SQL Injection
- **Never interpolate user input into SQL**
- Use parameterized queries only

#### Cross-Site Scripting (XSS)
- Never trust stored user content
- Flag fields that may be rendered in the frontend
- Enforce encoding and sanitization expectations

#### Authentication & Authorization Gaps
- No endpoint or function should be callable without explicit auth checks
- Authorization must be enforced at the database layer whenever possible

#### Service Role & Admin Abuse
- Service roles must **never be exposed to clients**
- Background jobs using elevated roles must be reviewed carefully

#### Function & Trigger Risks
- Flag `SECURITY DEFINER` functions
- Ensure functions do not bypass RLS unintentionally

---

### Required Output When Creating a New Table

Whenever a new table is proposed or created, you MUST output:

1. **Table Purpose** - What is this table for?
2. **Threat Model Summary** - What are the risks?
3. **Who Can Access It** - By role (anon, authenticated, admin, etc.)
4. **RLS Policies** - With explanation in plain English
5. **Potential Attack Vectors** - What could go wrong?
6. **Why This Design Is Safe** - Justify the security decisions

**Do not proceed unless all of the above are addressed.**

---

### Enforcement Rules

- If security requirements are unclear, **ask questions before proceeding**
- If a design is insecure, **refuse to implement it as-is**
- Prefer verbosity over silence when security is involved
- **Treat missing constraints as critical bugs**

---

### Security Mindset Reminder

> **"If you didn't explicitly block it, an attacker will find it."**

Act accordingly at all times.

---

### Secure Defaults (Non-Negotiable)

All database objects MUST follow secure defaults:

- All tables MUST:
  - Have RLS enabled immediately after creation
  - Start with NO access (deny-all)
  - Use explicit `REVOKE ALL ON TABLE` before granting
  - Define access only via RLS policies
- Never rely on implicit permissions
- Never assume Supabase defaults are safe
- Column-level UPDATE restrictions where appropriate

---

### Ownership & Immutability Rules

- Ownership columns (`user_id`, `owner_id`, `tenant_id`, `created_by`) MUST:
  - Be set only on INSERT
  - Be immutable after creation
  - Be protected with `WITH CHECK` policies

- UPDATE policies MUST explicitly prevent:
  - Ownership reassignment
  - Cross-tenant reassignment

Example pattern:
```sql
-- User can UPDATE only if they own it AND ownership unchanged
CREATE POLICY "update_own" ON table_name FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

---

### Forbidden Patterns (Auto-Reject)

The following patterns MUST be rejected immediately:

- `USING (true)` on any table with user data
- `SELECT *` in security-sensitive queries
- Missing `WITH CHECK` on INSERT/UPDATE policies
- RLS-disabled tables containing user data
- Client-accessible service_role usage
- Trusting frontend-provided role or user IDs
- Anonymous write access by default
- Blind service_role usage without justification

---

### Views, RPCs & SQL Functions (High Risk)

- All views MUST be reviewed for RLS bypass
- `SECURITY DEFINER` functions are:
  - Forbidden by default
  - Allowed only with explicit justification and review
- RPCs must:
  - Enforce authorization internally
  - Assume caller is malicious
  - Never trust input parameters for auth decisions

---

### Mandatory Security Checklist (Per Change)

For every database or backend change, output this checklist:

- [ ] RLS enabled
- [ ] Ownership enforced (immutable on UPDATE)
- [ ] Cross-tenant access prevented
- [ ] UPDATE privilege constrained
- [ ] No dangerous defaults (`USING (true)`, missing `WITH CHECK`)
- [ ] No service_role exposure to clients
- [ ] Input validation present

---

### Audit & Detection Expectations

- Sensitive mutations SHOULD be auditable
- Include `created_at`, `updated_at`, `created_by` on relevant tables
- High-risk actions SHOULD be traceable via audit_log
- Consider logging failed access attempts for security monitoring

---

## 🛡️ Frontend Security Rules

### XSS Prevention (CRITICAL)

- Treat ALL user-provided content as untrusted
- Never render user content using `dangerouslySetInnerHTML` without sanitization
- Any HTML rendering MUST be explicitly approved and sanitized using a trusted library
- Database content must NEVER be rendered as raw HTML by default

### Frontend Authorization

- Frontend role checks are for **UX only** — not security
- All access control MUST be enforced server-side
- Assume buttons can be bypassed and API calls can be forged
- Never trust client-side auth state for sensitive operations

### Input Validation (Defense-in-Depth)

- Validate user input for length limits, expected formats, and obvious invalid data
- Validation failures must fail fast with safe, generic error messages
- This reduces SQL injection vectors, overlong payload attacks, and UI-driven data corruption

### Sensitive Data Handling

- Never store sensitive data in `localStorage`, `sessionStorage`, or URL parameters
- JWTs must never be manually parsed or trusted on the client
- Secrets must NEVER exist in frontend code

### API Usage Rules

- Do not construct dynamic API endpoints using user input
- Do not trust API responses blindly
- Handle 401/403 explicitly — never retry forbidden requests automatically

### File Upload & Rendering Safety

- Never trust file MIME types from the client
- Always assume uploaded files are malicious
- Never render user-uploaded files as executable content
- Prefer images only — **no SVG unless sanitized** (SVG is a hidden XSS vector)

### Forbidden Frontend Patterns (Auto-Reject)

- `dangerouslySetInnerHTML` without sanitization
- Rendering database content as HTML by default
- Storing tokens/secrets in localStorage
- Client-side only authorization checks
- Trusting user-provided file types

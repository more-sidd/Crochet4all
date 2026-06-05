# crochet4all 🧶

A cozy, free crochet website with three rooms:

- **Learn** — a library of crochet stitches with chart-symbol diagrams + step-by-step guides, a beginner **Yarn** guide (weights, fibers, reading a label), and a **Play** quiz where you guess the stitch from its symbol.
- **Create** — a pattern studio: pick colors by **color wheel** or **hex**, paint a grid by hand, or drop in a **photo** and turn it into a tapestry chart. Export your pattern as a PNG.
- **Blog** — a community circle. **No sign-in.** People pick a name (stored only in their browser), share photos of their makes, like, and comment.

Built on the Vite + React + TypeScript + Tailwind starter you provided.

---

## Run it locally

You'll need [Node.js](https://nodejs.org) (v18+).

```bash
npm install      # one-time, downloads dependencies
npm run dev      # starts a local server, usually http://localhost:5173
```

## Put it online (Netlify)

1. Push this folder to a GitHub repo.
2. On Netlify: **Add new site → Import an existing project →** pick the repo.
3. Netlify reads `netlify.toml`, so the settings are already filled in:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Click **Deploy**. That's it — free, on a `*.netlify.app` address.

(You can also drag-and-drop: run `npm run build` and drop the generated `dist`
folder onto Netlify.)

---

## How the Blog works (and the one decision to make)

By default the Blog runs in **demo mode**: each visitor's posts are saved in
*their own browser*. That means it works instantly with zero setup and zero
cost — but two different people won't see each other's posts. It's perfect for
trying things out.

To make it a **real shared community** (everyone sees the same feed) you add a
free database. It still requires **no sign-in for your visitors**.

### Optional upgrade: connect Supabase (free)

1. Create a free project at <https://supabase.com>.
2. In the Supabase dashboard open the **SQL Editor** and run:

   ```sql
   create table posts (
     id text primary key,
     author_id text,
     author_name text,
     author_avatar text,
     author_instagram text,
     image text,
     caption text,
     likes int default 0,
     reports int default 0,
     created_at timestamptz default now()
   );

   create table comments (
     id text primary key,
     post_id text references posts(id) on delete cascade,
     author_name text,
     author_avatar text,
     text text,
     created_at timestamptz default now()
   );

   -- Allow the public (no login) to read and write. Fine for a friendly
   -- community site; tighten later if you ever need to.
   alter table posts enable row level security;
   alter table comments enable row level security;
   create policy "public posts"    on posts    for all using (true) with check (true);
   create policy "public comments" on comments for all using (true) with check (true);
   ```

3. In **Project Settings → API**, copy the **Project URL** and the **anon public** key.
4. Copy `.env.example` to `.env` and paste them in:

   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

5. On Netlify, add those same two variables under **Site settings →
   Environment variables**, then redeploy.

The app detects the keys automatically and switches the Blog from
browser-storage to the shared database. No other code changes needed.

### Moderating the shared circle

Profiles are **nickname-only** (no email, no real name) and joining requires a
13+ confirmation. Every post has a **Report** button; reporting hides the post
for that viewer and bumps a counter you can see.

To delete *anyone's* post, click **Moderator tools** in the Blog sidebar and
enter your key. Set your own secret by adding `VITE_ADMIN_KEY=your-secret` to
`.env` (and to Netlify's environment variables). Until you set one, the
fallback key is `crochet4all-mod` — change it before going public.

> Note on photos: in demo mode, images live in the browser and large ones can
> fill the ~5MB limit. Photos are auto-shrunk before saving. With Supabase you
> get much more room; for very heavy photo use, Supabase Storage is the next
> step.

---

## Where things live

```
src/
  App.tsx                 # routing between the four views
  components/
    Nav.tsx               # top bar + dark-mode toggle
    Footer.tsx
    StitchDiagram.tsx     # draws crochet chart symbols as SVG
    PixelSparkle.tsx      # the little pixel star accent
  pages/
    Home.tsx
    Learn.tsx             # tabs: Library | Yarn | Play
    LearnYarn.tsx         # yarn weights, fibers, label guide
    LearnLibrary.tsx
    LearnPlay.tsx         # the guessing game
    Create.tsx            # the pattern studio
    Blog.tsx              # community feed + browser-identity profiles
  data/stitches.ts        # add or edit stitches here
  data/yarns.ts           # yarn weights & fibers
  lib/
    storage.ts            # localStorage helpers, profile, image shrinking
    supabase.ts           # optional database client
    blog.ts               # posts/comments — local OR Supabase, same API
```

**To add a stitch:** edit `src/data/stitches.ts`, then (optionally) add a matching
symbol in `src/components/StitchDiagram.tsx`. Everything else updates itself.

**To rename the site:** the brand word "crochet4all" lives in `Nav.tsx`, `Footer.tsx`,
and `index.html`.

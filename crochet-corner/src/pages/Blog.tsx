import { useEffect, useRef, useState } from 'react';
import { Heart, MessageCircle, Trash2, Send, Image as ImageIcon, Pencil, Flag, Shield } from 'lucide-react';
import {
  Profile, getProfile, saveProfile, newId, initials, fileToDataURL, timeAgo,
} from '../lib/storage';
import {
  Post, Comment, listPosts, addPost, deletePost, toggleLike, hasLiked,
  listComments, addComment, reportPost, isHidden, updatePost,
} from '../lib/blog';
import { isSupabaseConfigured } from '../lib/supabase';

// Set VITE_ADMIN_KEY in your .env to your own secret. Until then this fallback works.
const ADMIN_KEY = (import.meta.env.VITE_ADMIN_KEY as string) || 'crochet4all-mod';

function Avatar({ src, name, lg }: { src: string; name: string; lg?: boolean }) {
  if (src) return <img className={`avatar ${lg ? 'avatar-lg' : ''}`} src={src} alt={name} />;
  return <div className={`avatar avatar-fallback ${lg ? 'avatar-lg' : ''}`}>{initials(name)}</div>;
}

// ── profile setup / edit (nickname only) ─────────────────────────────────────
function ProfileForm({ initial, onSave }: { initial: Profile | null; onSave: (p: Profile) => void }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [bio, setBio] = useState(initial?.bio ?? '');
  const [instagram, setInstagram] = useState(initial?.instagram ?? '');
  const [avatar, setAvatar] = useState(initial?.avatar ?? '');
  const [ageOk, setAgeOk] = useState(initial?.ageOk ?? false);
  const [err, setErr] = useState('');

  const pickAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try { setAvatar(await fileToDataURL(f, 240, 0.8)); } catch { setErr('Could not load that image.'); }
  };

  const submit = () => {
    if (!name.trim()) { setErr('Please pick a nickname.'); return; }
    if (!ageOk) { setErr('Please confirm you are 13 or older.'); return; }
    onSave({
      id: initial?.id ?? newId(),
      name: name.trim(), bio: bio.trim(),
      instagram: instagram.trim().replace(/^@/, ''),
      avatar, ageOk: true,
    });
  };

  return (
    <div className="card panel">
      <h3 className="font-display" style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>
        {initial ? 'Edit your corner' : 'Join the circle'}
      </h3>
      <p className="muted" style={{ fontSize: '0.82rem', marginBottom: '1.2rem' }}>
        Just pick a nickname — no account, no email. This lives in your browser. Add socials only if you want to.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '1rem' }}>
        <Avatar src={avatar} name={name || '?'} lg />
        <label className="btn-ghost btn-sm" style={{ cursor: 'pointer' }}>
          <ImageIcon size={14} /> {avatar ? 'Change photo' : 'Add photo'}
          <input type="file" accept="image/*" onChange={pickAvatar} style={{ display: 'none' }} />
        </label>
      </div>

      <label className="field-label">Nickname *</label>
      <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. yarncat" style={{ marginBottom: '0.8rem' }} />

      <label className="field-label">Bio (optional)</label>
      <textarea className="field" value={bio} onChange={(e) => setBio(e.target.value)} rows={2} placeholder="Granny squares & sleepy cats" style={{ marginBottom: '0.8rem', resize: 'vertical' }} />

      <label className="field-label">Instagram (optional)</label>
      <input className="field" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="yourhandle" style={{ marginBottom: '1rem' }} />

      <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.82rem', marginBottom: '1rem', cursor: 'pointer' }}>
        <input type="checkbox" checked={ageOk} onChange={(e) => setAgeOk(e.target.checked)} style={{ marginTop: '0.2rem' }} />
        <span>I'm 13 or older.</span>
      </label>

      {err && <p style={{ color: 'var(--accent)', fontSize: '0.8rem', marginBottom: '0.8rem' }}>{err}</p>}
      <button className="btn-primary" onClick={submit} style={{ width: '100%', justifyContent: 'center' }}>
        {initial ? 'Save changes' : 'Join'}
      </button>
    </div>
  );
}

// ── one post ──────────────────────────────────────────────────────────────────
function PostCard({ post, comments, profile, admin, onLike, onDelete, onReport, onEdit, onComment }: {
  post: Post; comments: Comment[]; profile: Profile | null; admin: boolean;
  onLike: (p: Post) => void; onDelete: (id: string) => void; onReport: (p: Post) => void;
  onEdit: (id: string, caption: string) => void;
  onComment: (postId: string, text: string) => void;
}) {
  const [text, setText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post.caption);
  const liked = hasLiked(post.id);
  const mine = profile && post.authorId === profile.id;

  return (
    <div className="card post">
      <div className="post-head">
        <Avatar src={post.authorAvatar} name={post.authorName} />
        <div style={{ flex: 1 }}>
          <div className="post-author">{post.authorName}</div>
          {post.authorInstagram && (
            <span className="handle">
              <a href={`https://instagram.com/${post.authorInstagram}`} target="_blank" rel="noreferrer">@{post.authorInstagram}</a>
            </span>
          )}
        </div>
        <span className="post-time">{timeAgo(post.createdAt)}</span>
        {admin && post.reports > 0 && (
          <span className="tag tag-accent" style={{ marginLeft: '0.5rem' }}>⚑ {post.reports}</span>
        )}
        {mine && (
          <button className="icon-btn" onClick={() => { setDraft(post.caption); setEditing(true); }} aria-label="Edit post" style={{ marginLeft: '0.5rem' }}>
            <Pencil size={15} />
          </button>
        )}
        {(mine || admin) && (
          <button className="icon-btn" onClick={() => onDelete(post.id)} aria-label="Delete post" style={{ marginLeft: '0.5rem' }}>
            <Trash2 size={15} />
          </button>
        )}
      </div>

      {post.image && <img className="post-img" src={post.image} alt={post.caption || 'A crochet make'} />}
      {editing ? (
        <div style={{ marginBottom: '0.6rem' }}>
          <textarea className="field" rows={2} value={draft} onChange={(e) => setDraft(e.target.value)} style={{ resize: 'vertical', marginBottom: '0.5rem' }} />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-primary btn-sm" onClick={() => { onEdit(post.id, draft.trim()); setEditing(false); }}>Save</button>
            <button className="btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        post.caption && <p style={{ fontSize: '0.92rem', marginBottom: '0.6rem' }}>{post.caption}</p>
      )}

      <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center', paddingTop: '0.3rem' }}>
        <button className={`icon-btn ${liked ? 'liked' : ''}`} onClick={() => onLike(post)}>
          <Heart size={16} fill={liked ? 'currentColor' : 'none'} /> {post.likes}
        </button>
        <button className="icon-btn" onClick={() => setShowComments((s) => !s)}>
          <MessageCircle size={16} /> {comments.length}
        </button>
        {!mine && (
          <button className="icon-btn" onClick={() => onReport(post)} style={{ marginLeft: 'auto' }} title="Report this post">
            <Flag size={14} /> Report
          </button>
        )}
      </div>

      {showComments && (
        <div style={{ marginTop: '0.8rem' }}>
          {comments.map((c) => (
            <div key={c.id} className="comment">
              <Avatar src={c.authorAvatar} name={c.authorName} />
              <div><span className="comment-author">{c.authorName}</span>{' '}<span>{c.text}</span></div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem' }}>
            <input
              className="field" placeholder={profile ? 'Add a kind word…' : 'Join the circle to comment'}
              value={text} disabled={!profile}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && text.trim()) { onComment(post.id, text.trim()); setText(''); } }}
            />
            <button className="btn-primary btn-sm" disabled={!profile || !text.trim()}
              onClick={() => { if (text.trim()) { onComment(post.id, text.trim()); setText(''); } }}>
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── composer ────────────────────────────────────────────────────────────────
function Composer({ profile, onPost }: { profile: Profile; onPost: (image: string, caption: string) => Promise<void> }) {
  const [image, setImage] = useState('');
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try { setImage(await fileToDataURL(f)); setErr(''); } catch { setErr('Could not load that photo.'); }
  };

  const submit = async () => {
    if (!image) { setErr('Add a photo of your make first.'); return; }
    setBusy(true); setErr('');
    try {
      await onPost(image, caption.trim());
      setImage(''); setCaption('');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Something went wrong.');
    } finally { setBusy(false); }
  };

  return (
    <div className="card post">
      <div className="post-head" style={{ marginBottom: '0.8rem' }}>
        <Avatar src={profile.avatar} name={profile.name} />
        <span className="post-author">Share a make, {profile.name.split(' ')[0]}</span>
      </div>

      {image ? (
        <div style={{ position: 'relative' }}>
          <img className="post-img" src={image} alt="preview" />
          <button className="btn-ghost btn-sm" onClick={() => setImage('')} style={{ position: 'absolute', top: 12, right: 12 }}>Remove</button>
        </div>
      ) : (
        <label className="btn-ghost" style={{ cursor: 'pointer', width: '100%', justifyContent: 'center', padding: '1.4rem', borderStyle: 'dashed' }}>
          <ImageIcon size={16} /> Choose a photo
          <input ref={fileRef} type="file" accept="image/*" onChange={pick} style={{ display: 'none' }} />
        </label>
      )}

      <textarea className="field" rows={2} value={caption} onChange={(e) => setCaption(e.target.value)}
        placeholder="Tell us about it — yarn, pattern, how it went…" style={{ margin: '0.8rem 0', resize: 'vertical' }} />

      {err && <p style={{ color: 'var(--accent)', fontSize: '0.82rem', marginBottom: '0.6rem' }}>{err}</p>}
      <button className="btn-primary" onClick={submit} disabled={busy} style={{ width: '100%', justifyContent: 'center' }}>
        {busy ? 'Posting…' : 'Post to the circle'}
      </button>
    </div>
  );
}

// ── page ─────────────────────────────────────────────────────────────────────
export default function Blog() {
  const [profile, setProfile] = useState<Profile | null>(getProfile());
  const [editing, setEditing] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    try { if (localStorage.getItem('c4a.admin') === '1') setAdmin(true); } catch { /* ignore */ }
  }, []);

  const refresh = async () => {
    try {
      const [p, c] = await Promise.all([listPosts(), listComments()]);
      setPosts(p.filter((post) => !isHidden(post.id)));
      setComments(c);
    } catch { /* keep what we have */ } finally { setLoading(false); }
  };

  useEffect(() => { refresh(); }, []);

  const handleSaveProfile = (p: Profile) => { saveProfile(p); setProfile(p); setEditing(false); };

  const handlePost = async (image: string, caption: string) => {
    if (!profile) return;
    const post = await addPost({
      authorId: profile.id, authorName: profile.name, authorAvatar: profile.avatar,
      authorInstagram: profile.instagram, image, caption,
    });
    setPosts((ps) => [post, ...ps]);
  };

  const handleLike = async (post: Post) => {
    const updated = await toggleLike(post);
    setPosts((ps) => ps.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDelete = async (id: string) => {
    await deletePost(id);
    setPosts((ps) => ps.filter((p) => p.id !== id));
    setComments((cs) => cs.filter((c) => c.postId !== id));
  };

  const handleReport = async (post: Post) => {
    if (!window.confirm('Report this post to the moderator? It will be hidden from your feed.')) return;
    try { await reportPost(post); } catch { /* ignore */ }
    setPosts((ps) => ps.filter((p) => p.id !== post.id));
  };

  const handleEdit = async (id: string, caption: string) => {
    try { await updatePost(id, caption); } catch { return; }
    setPosts((ps) => ps.map((p) => (p.id === id ? { ...p, caption } : p)));
  };

  const handleComment = async (postId: string, text: string) => {
    if (!profile) return;
    const c = await addComment({ postId, authorName: profile.name, authorAvatar: profile.avatar, text });
    setComments((cs) => [...cs, c]);
  };

  const toggleModerator = () => {
    if (admin) {
      try { localStorage.removeItem('c4a.admin'); } catch { /* ignore */ }
      setAdmin(false);
      return;
    }
    const key = window.prompt('Moderator key:');
    if (key === null) return;
    if (key === ADMIN_KEY) {
      try { localStorage.setItem('c4a.admin', '1'); } catch { /* ignore */ }
      setAdmin(true);
    } else {
      window.alert('That key did not match.');
    }
  };

  const commentsFor = (postId: string) =>
    comments.filter((c) => c.postId === postId).sort((a, b) => a.createdAt - b.createdAt);

  return (
    <section className="section-pad">
      <div className="wrap">
        <p className="label">Blog</p>
        <h1 className="heading" style={{ marginBottom: '1.5rem' }}>The community circle</h1>

        <div className="blog-layout">
          {/* sidebar */}
          <div>
            {profile && !editing ? (
              <div className="card panel">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '0.8rem' }}>
                  <Avatar src={profile.avatar} name={profile.name} lg />
                  <div>
                    <div className="font-display" style={{ fontSize: '1.4rem' }}>{profile.name}</div>
                    {profile.instagram && <span className="handle"><a href={`https://instagram.com/${profile.instagram}`} target="_blank" rel="noreferrer">@{profile.instagram}</a></span>}
                  </div>
                </div>
                {profile.bio && <p className="muted" style={{ fontSize: '0.86rem', marginBottom: '0.9rem' }}>{profile.bio}</p>}
                <button className="btn-ghost btn-sm" onClick={() => setEditing(true)}><Pencil size={13} /> Edit corner</button>
              </div>
            ) : (
              <ProfileForm initial={editing ? profile : null} onSave={handleSaveProfile} />
            )}

            <p className="notice" style={{ marginTop: '1rem' }}>
              {isSupabaseConfigured
                ? 'A shared circle. Be kind — posts can be reported and removed.'
                : 'Demo mode: posts are saved in your browser only. See the README to connect a free database and make the circle shared.'}
            </p>

            <button className="icon-btn" onClick={toggleModerator} style={{ marginTop: '0.8rem', fontSize: '0.7rem' }}>
              <Shield size={13} /> {admin ? 'Exit moderator mode' : 'Moderator tools'}
            </button>
          </div>

          {/* feed */}
          <div>
            {profile && <Composer profile={profile} onPost={handlePost} />}

            {loading ? (
              <div className="empty">Loading the circle…</div>
            ) : posts.length === 0 ? (
              <div className="empty">
                <p style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>No makes yet.</p>
                <p>Be the first to share something you crocheted. 🧶</p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id} post={post} comments={commentsFor(post.id)} profile={profile} admin={admin}
                  onLike={handleLike} onDelete={handleDelete} onReport={handleReport} onEdit={handleEdit} onComment={handleComment}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

import { supabase, isSupabaseConfigured } from './supabase';
import { load, save, newId } from './storage';

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorInstagram: string;
  image: string;
  caption: string;
  createdAt: number;
  likes: number;
  reports: number;
}

export interface Comment {
  id: string;
  postId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: number;
}

const POSTS_KEY = 'loop.posts';
const COMMENTS_KEY = 'loop.comments';
const LIKED_KEY = 'loop.liked';
const HIDDEN_KEY = 'loop.hidden';

// ── Likes are always tracked per-browser (no accounts to attach them to) ────
export function likedSet(): Record<string, boolean> {
  return load<Record<string, boolean>>(LIKED_KEY, {});
}
export function hasLiked(id: string): boolean {
  return Boolean(likedSet()[id]);
}
function setLiked(id: string, liked: boolean) {
  const s = likedSet();
  if (liked) s[id] = true;
  else delete s[id];
  save(LIKED_KEY, s);
}

// ── Locally hidden (a viewer's own "don't show me this" list) ───────────────
export function hiddenSet(): Record<string, boolean> {
  return load<Record<string, boolean>>(HIDDEN_KEY, {});
}
export function isHidden(id: string): boolean {
  return Boolean(hiddenSet()[id]);
}
export function hideLocally(id: string) {
  const h = hiddenSet();
  h[id] = true;
  save(HIDDEN_KEY, h);
}

// ── Posts ───────────────────────────────────────────────────────────────────
export async function listPosts(): Promise<Post[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(rowToPost);
  }
  return load<Post[]>(POSTS_KEY, []).sort((a, b) => b.createdAt - a.createdAt);
}

export async function addPost(p: Omit<Post, 'id' | 'createdAt' | 'likes'>): Promise<Post> {
  const post: Post = { ...p, id: newId(), createdAt: Date.now(), likes: 0, reports: 0 };
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('posts').insert(postToRow(post)).select().single();
    if (error) throw error;
    return rowToPost(data);
  }
  const posts = load<Post[]>(POSTS_KEY, []);
  posts.push(post);
  if (!save(POSTS_KEY, posts)) {
    throw new Error('Your browser ran out of storage space. Try removing an older post, or connect a database (see the README) for unlimited shared posts.');
  }
  return post;
}

export async function updatePost(id: string, caption: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('posts').update({ caption }).eq('id', id);
    if (error) throw error;
    return;
  }
  save(POSTS_KEY, load<Post[]>(POSTS_KEY, []).map((p) => (p.id === id ? { ...p, caption } : p)));
}

export async function deletePost(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    await supabase.from('comments').delete().eq('post_id', id);
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) throw error;
    return;
  }
  save(POSTS_KEY, load<Post[]>(POSTS_KEY, []).filter((p) => p.id !== id));
  save(COMMENTS_KEY, load<Comment[]>(COMMENTS_KEY, []).filter((c) => c.postId !== id));
}

export async function toggleLike(post: Post): Promise<Post> {
  const liked = hasLiked(post.id);
  const nextLikes = Math.max(0, post.likes + (liked ? -1 : 1));
  setLiked(post.id, !liked);
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('posts')
      .update({ likes: nextLikes })
      .eq('id', post.id)
      .select()
      .single();
    if (error) throw error;
    return rowToPost(data);
  }
  const posts = load<Post[]>(POSTS_KEY, []).map((p) => (p.id === post.id ? { ...p, likes: nextLikes } : p));
  save(POSTS_KEY, posts);
  return { ...post, likes: nextLikes };
}

// ── Reporting ────────────────────────────────────────────────────────────────
// Increments a report counter the moderator can see, and hides the post for
// the person who reported it (on their own device).
export async function reportPost(post: Post): Promise<Post> {
  hideLocally(post.id);
  const next = post.reports + 1;
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('posts').update({ reports: next }).eq('id', post.id).select().single();
    if (error) throw error;
    return rowToPost(data);
  }
  const posts = load<Post[]>(POSTS_KEY, []).map((p) => (p.id === post.id ? { ...p, reports: next } : p));
  save(POSTS_KEY, posts);
  return { ...post, reports: next };
}

// ── Comments ─────────────────────────────────────────────────────────────────
export async function listComments(): Promise<Comment[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(rowToComment);
  }
  return load<Comment[]>(COMMENTS_KEY, []).sort((a, b) => a.createdAt - b.createdAt);
}

export async function addComment(c: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> {
  const comment: Comment = { ...c, id: newId(), createdAt: Date.now() };
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('comments').insert(commentToRow(comment)).select().single();
    if (error) throw error;
    return rowToComment(data);
  }
  const comments = load<Comment[]>(COMMENTS_KEY, []);
  comments.push(comment);
  save(COMMENTS_KEY, comments);
  return comment;
}

// ── Row mappers (snake_case in Supabase <-> camelCase in app) ───────────────
/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToPost(r: any): Post {
  return {
    id: r.id,
    authorId: r.author_id ?? '',
    authorName: r.author_name ?? 'Someone',
    authorAvatar: r.author_avatar ?? '',
    authorInstagram: r.author_instagram ?? '',
    image: r.image ?? '',
    caption: r.caption ?? '',
    createdAt: r.created_at ? new Date(r.created_at).getTime() : Date.now(),
    likes: r.likes ?? 0,
    reports: r.reports ?? 0,
  };
}
function postToRow(p: Post) {
  return {
    id: p.id,
    author_id: p.authorId,
    author_name: p.authorName,
    author_avatar: p.authorAvatar,
    author_instagram: p.authorInstagram,
    image: p.image,
    caption: p.caption,
    created_at: new Date(p.createdAt).toISOString(),
    likes: p.likes,
    reports: p.reports,
  };
}
function rowToComment(r: any): Comment {
  return {
    id: r.id,
    postId: r.post_id,
    authorName: r.author_name ?? 'Someone',
    authorAvatar: r.author_avatar ?? '',
    text: r.text ?? '',
    createdAt: r.created_at ? new Date(r.created_at).getTime() : Date.now(),
  };
}
function commentToRow(c: Comment) {
  return {
    id: c.id,
    post_id: c.postId,
    author_name: c.authorName,
    author_avatar: c.authorAvatar,
    text: c.text,
    created_at: new Date(c.createdAt).toISOString(),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

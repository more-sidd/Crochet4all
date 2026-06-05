// ── Safe localStorage wrappers ─────────────────────────────────────────────
// Everything degrades gracefully if storage is full or disabled (private mode).

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    // Most likely the 5MB quota was hit (usually too many big photos).
    return false;
  }
}

// ── Browser identity ───────────────────────────────────────────────────────
// A "profile" lives only in this browser. No password, no sign-in.
// The id lets people manage (edit/delete) their own posts on this device.

export interface Profile {
  id: string;
  name: string;      // nickname only — no real name requested
  bio: string;       // optional, user-chosen
  instagram: string; // optional public handle
  avatar: string;    // data URL or ''
  ageOk: boolean;    // affirmed 13 or older
}

const PROFILE_KEY = 'loop.profile';

export function getProfile(): Profile | null {
  return load<Profile | null>(PROFILE_KEY, null);
}

export function saveProfile(p: Profile): boolean {
  return save(PROFILE_KEY, p);
}

export function clearProfile(): void {
  try { localStorage.removeItem(PROFILE_KEY); } catch { /* ignore */ }
}

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Make a friendly two-letter monogram for avatar fallbacks.
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ── Image downscaling ──────────────────────────────────────────────────────
// Photos go straight into localStorage as data URLs, so we shrink them first
// to keep well under the storage quota.

export function fileToDataURL(file: File, maxDim = 1000, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('That file is not a valid image.'));
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas not supported.'));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// "3 hours ago" style timestamps.
export function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString();
}

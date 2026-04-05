/**
 * Returns a stable avatar URL for a given username/avatar.
 * - If user has a real avatar URL (http/https), use it.
 * - If user avatar is a server path (/uploads/...), prepend the server base.
 * - Otherwise generate a deterministic ui-avatars URL (no random!).
 */

const SERVER_BASE = 'http://localhost:5000';

// Deterministic hue from string
function stringToColor(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Convert HSL to hex for ui-avatars bg param (approximate)
  const colors = [
    '3B82F6', // blue
    '8B5CF6', // violet
    '06B6D4', // cyan
    '10B981', // emerald
    'F59E0B', // amber
    'EF4444', // red
    'EC4899', // pink
  ];
  return colors[Math.abs(hash) % colors.length];
}

export function getAvatarUrl(avatar, username = 'User') {
  if (!avatar) {
    const color = stringToColor(username);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=${color}&color=fff&size=200&bold=true`;
  }
  
  if (avatar.includes('pravatar.cc') && !avatar.includes('?u=') && !avatar.includes('?img=')) {
     return `${avatar}?u=${encodeURIComponent(username)}`;
  }

  if (avatar.startsWith('http')) return avatar;
  if (avatar.startsWith('/uploads')) return `${SERVER_BASE}${avatar}`;
  // Fallback
  const color = stringToColor(username);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=${color}&color=fff&size=200&bold=true`;
}

export function getImageUrl(image, seed = 'default') {
  if (!image) return null;
  // picsum.photos — use stable /seed/{id}/w/h format
  if (image.includes('picsum.photos')) {
    // Extract only dimensions from the original URL
    const match = image.match(/(\d+)\/?(\d+)?$/);
    const w = match ? match[1] : '600';
    const h = match ? match[2] : '300';
    return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h || '300'}`;
  }
  if (image.startsWith('http')) return image;
  if (image.startsWith('/uploads')) return `${SERVER_BASE}${image}`;
  return image;
}

export { SERVER_BASE };

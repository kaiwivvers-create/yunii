const BASE = 'http://localhost:7792';

async function j(path, opts) {
  const res = await fetch(BASE + path, opts);
  const text = await res.text();
  let body = null;
  try { body = JSON.parse(text); } catch { body = text; }
  return { status: res.status, body };
}

// Sign up a throwaway user
await j('/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Del Me', email: 'delme3@example.com', password: 'password123' }),
});

// Find their id
const users = await j('/admin/users');
const target = users.body.find((u) => u.email === 'delme3@example.com');
console.log('target id:', target.id);
console.log('users list leaks passwordHash:', users.body.some((u) => u.passwordHash !== undefined));

// Delete them
const del = await j(`/admin/users/${target.id}`, {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ actor: 'Kai', actorRole: 'super_admin' }),
});
console.log('delete status:', del.status);
console.log('delete response leaks passwordHash:', del.body && del.body.passwordHash !== undefined);

// Check trash
const trash = await j('/admin/trash');
const trashed = trash.body.find((t) => t.type === 'user' && t.item && t.item.email === 'delme3@example.com');
console.log('trash entry found:', !!trashed);
console.log('trash item leaks passwordHash:', trashed ? trashed.item.passwordHash !== undefined : 'n/a');

// Try to restore it (super admin) and check response
const restore = await j(`/admin/trash/${trashed.id}/restore`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ actor: 'Kai', actorRole: 'super_admin' }),
});
console.log('restore status:', restore.status);
console.log('restore response leaks passwordHash:', restore.body && restore.body.passwordHash !== undefined);

console.log('DONE');

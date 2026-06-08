import { supabase, isSupabaseConfigured } from './supabaseClient';

const USERS_KEY = 'tm_users';
const SESSION_KEY = 'tm_session';

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
  catch { return []; }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function saveSession(user) {
  const session = {
    id: user.id,
    name: user.name || user.user_metadata?.name || user.email.split('@')[0],
    email: user.email,
    avatar: (user.name || user.user_metadata?.name || user.email.split('@')[0]).slice(0,2).toUpperCase(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function register(name, email, password) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) return { ok: false, error: error.message };
    const user = data.user;
    const session = saveSession({ ...user, name });
    return { ok: true, user: session };
  }

  const users = getUsers();
  if (users.find(u => u.email === email)) {
    return { ok: false, error: 'Email already registered' };
  }
  const user = { id: Date.now().toString(), name, email, password, avatar: name.slice(0,2).toUpperCase(), createdAt: new Date().toISOString() };
  saveUsers([...users, user]);
  const session = saveSession(user);
  return { ok: true, user: session };
}

export async function login(email, password) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { ok: false, error: error.message };
    const user = data.user;
    if (!user) return { ok: false, error: 'Login failed' };
    const session = saveSession(user);
    return { ok: true, user: session };
  }

  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return { ok: false, error: 'Invalid email or password' };
  const session = saveSession(user);
  return { ok: true, user: session };
}

export async function logout() {
  if (supabase) await supabase.auth.signOut();
  localStorage.removeItem(SESSION_KEY);
}

export function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
  catch { return null; }
}

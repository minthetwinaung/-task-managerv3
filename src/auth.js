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

const NETWORK_ERROR_MESSAGE =
  'Cannot reach the Supabase server. The Supabase project may be paused or deleted, ' +
  'or REACT_APP_SUPABASE_URL is wrong. Check the project in the Supabase dashboard.';

function isNetworkError(error) {
  const msg = (error?.message || '').toLowerCase();
  return error?.name === 'AuthRetryableFetchError' ||
    error?.name === 'TypeError' ||
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('load failed');
}

export function friendlyError(error) {
  if (!error) return 'Unknown error';
  if (isNetworkError(error)) return NETWORK_ERROR_MESSAGE;
  return error.message || String(error);
}

export async function register(name, email, password) {
  if (isSupabaseConfigured && supabase) {
    let data, error;
    try {
      ({ data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      }));
    } catch (e) {
      return { ok: false, error: friendlyError(e) };
    }
    if (error) return { ok: false, error: friendlyError(error) };
    if (!data.session) {
      return { ok: false, needsConfirmation: true, email };
    }
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
    let data, error;
    try {
      ({ data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      }));
    } catch (e) {
      return { ok: false, error: friendlyError(e) };
    }
    if (error) return { ok: false, error: friendlyError(error) };
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
  try {
    if (supabase) await supabase.auth.signOut();
  } catch (e) {
    console.warn('Supabase sign-out failed; clearing local session anyway.', e);
  }
  localStorage.removeItem(SESSION_KEY);
}

export function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
  catch { return null; }
}

/**
 * When Supabase is configured, the cached app session is only valid if
 * Supabase still holds a matching auth session. Otherwise every query would
 * run unauthenticated and RLS would silently return no rows.
 */
export async function validateSession() {
  const cached = getSession();
  if (!cached) return null;
  if (!isSupabaseConfigured || !supabase) return cached;
  try {
    const { data } = await supabase.auth.getSession();
    const authUser = data?.session?.user;
    if (!authUser || authUser.id !== cached.id) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return cached;
  } catch {
    // Offline / server unreachable: keep the cached user so the UI can show errors.
    return cached;
  }
}

export async function resendConfirmation(email) {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, error: 'Supabase is not configured.' };
  }
  let error;
  try {
    ({ error } = await supabase.auth.resend({
      type: 'signup',
      email,
    }));
  } catch (e) {
    return { ok: false, error: friendlyError(e) };
  }
  if (error) return { ok: false, error: friendlyError(error) };
  return { ok: true };
}

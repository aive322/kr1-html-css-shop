import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { load, save, remove } from '../utils/storage.js';

const AccountContext = createContext(null);

// Пароль хранится только в виде хеша SHA-256 (с «солью» — адресом почты).
async function hashPassword(email, password) {
  const text = `tm:${email}:${password}`;
  if (window.crypto?.subtle && window.TextEncoder) {
    const buffer = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  let h = 5381;
  for (let i = 0; i < text.length; i += 1) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return `d${h}`;
}

// Личный кабинет: пользователи, вход, заказы и отзывы. Данные хранятся в браузере.
export function AccountProvider({ children }) {
  const [users, setUsers] = useState(() => load('tm-users', {}));
  const [session, setSession] = useState(() => load('tm-session', null));
  const [orders, setOrders] = useState(() => load('tm-orders', []));
  const [reviews, setReviews] = useState(() => load('tm-reviews', []));

  useEffect(() => { save('tm-users', users); }, [users]);
  useEffect(() => { if (session) save('tm-session', session); else remove('tm-session'); }, [session]);
  useEffect(() => { save('tm-orders', orders); }, [orders]);
  useEffect(() => { save('tm-reviews', reviews); }, [reviews]);

  const user = session && users[session] ? { email: session, ...users[session], passHash: undefined } : null;

  const register = useCallback(async ({ name, email, phone, password }) => {
    const key = email.trim().toLowerCase();
    if (users[key]) return { ok: false, error: 'Аккаунт с такой почтой уже есть. Войдите.' };
    const passHash = await hashPassword(key, password);
    setUsers((all) => ({ ...all, [key]: { name: name.trim(), phone: phone.trim(), address: '', passHash, createdAt: new Date().toISOString() } }));
    setSession(key);
    return { ok: true };
  }, [users]);

  const login = useCallback(async ({ email, password }) => {
    const key = email.trim().toLowerCase();
    const found = users[key];
    if (!found || found.passHash !== await hashPassword(key, password)) {
      return { ok: false, error: 'Неверная почта или пароль.' };
    }
    setSession(key);
    return { ok: true };
  }, [users]);

  const logout = useCallback(() => setSession(null), []);

  const updateProfile = useCallback((data) => {
    if (!session) return;
    setUsers((all) => ({ ...all, [session]: { ...all[session], ...data } }));
  }, [session]);

  const deleteAccount = useCallback(() => {
    if (!session) return;
    setUsers((all) => {
      const copy = { ...all };
      delete copy[session];
      return copy;
    });
    setOrders((list) => list.filter((o) => o.owner !== session));
    setReviews((list) => list.filter((r) => r.owner !== session));
    setSession(null);
  }, [session]);

  const addOrder = useCallback((order) => {
    const full = { ...order, id: String(100000 + Math.floor(Math.random() * 899999)), createdAt: new Date().toISOString(), owner: session, status: 'Принят' };
    setOrders((list) => [full, ...list].slice(0, 50));
    return full;
  }, [session]);

  const addReview = useCallback((review) => {
    const full = { ...review, id: `r${Date.now()}`, date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }), owner: session };
    setReviews((list) => [full, ...list]);
    return full;
  }, [session]);

  const deleteReview = useCallback((id) => setReviews((list) => list.filter((r) => r.id !== id)), []);

  const myOrders = useMemo(() => (session ? orders.filter((o) => o.owner === session) : []), [orders, session]);
  const myReviews = useMemo(() => (session ? reviews.filter((r) => r.owner === session) : []), [reviews, session]);

  const value = useMemo(() => ({
    user, register, login, logout, updateProfile, deleteAccount,
    addOrder, myOrders, reviews, myReviews, addReview, deleteReview
  }), [user?.email, user?.name, user?.phone, user?.address, register, login, logout, updateProfile, deleteAccount, addOrder, myOrders, reviews, myReviews, addReview, deleteReview]); // eslint-disable-line react-hooks/exhaustive-deps

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  return useContext(AccountContext);
}

export function initials(name) {
  const parts = String(name || '').trim().split(/\s+/);
  return ((parts[0] || '?').charAt(0) + (parts.length > 1 ? parts[parts.length - 1].charAt(0) : '')).toUpperCase();
}

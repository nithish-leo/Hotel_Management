'use client';
import { useEffect, useState } from 'react';

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Standard localStorage read
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (!storedUser || storedUser.role !== 'admin') {
      setIsAdmin(false);
      // For SPA, we can do standard window redirect
      window.location.hash = '#/admin/login';
      if (!window.location.hash) {
         window.location.pathname = '/';
      }
    } else {
      setIsAdmin(true);
      setUser(storedUser);
    }
  }, []);

  return { isAdmin, user };
}

export function useCustomerAuth() {
  const [isCustomer, setIsCustomer] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (!storedUser || storedUser.role !== 'customer') {
      setIsCustomer(false);
      window.location.hash = '#/customer/login';
      if (!window.location.hash) {
         window.location.pathname = '/';
      }
    } else {
      setIsCustomer(true);
      setUser(storedUser);
    }
  }, []);

  return { isCustomer, user };
}

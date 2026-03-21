'use client';

import React from 'react';
import { AppLayout } from '@/components/veritai/app/AppLayout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box } from '@mantine/core';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuthStore } from '@/store/auth';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token) {
      router.replace('/login');
    }
  }, [token, router]);

  if (!token) return null;

  return (
    <Box style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fa' }}>
      <Sidebar />
      <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Navbar />
        <Box
          style={{
            flex: 1,
            padding: '32px',
            overflowY: 'auto',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

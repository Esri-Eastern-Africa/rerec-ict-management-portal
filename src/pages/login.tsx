import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Text,
  Title,
  Stack,
  Group,
} from '@mantine/core';
import { IconLock, IconUser } from '@tabler/icons-react';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/store/auth';
import type { ArcGISUser } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const { token, setAuth } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) router.replace('/');
  }, [token, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error('Please enter your username and password');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Login failed');
        return;
      }
      setAuth(data.token as string, data.user as ArcGISUser);
      toast.success(`Welcome back, ${(data.user as ArcGISUser).fullName || username}!`);
      router.push('/');
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1c1a17 0%, #2d1a0e 50%, #431407 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <Box style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo area */}
        <Group justify="center" mb={32}>
          <img src="/logo.png" alt="REREC logo" style={{ height: 64, width: 'auto', display: 'block' }} />
        </Group>

        <Paper shadow="xl" radius="lg" p={40}>
          <Stack gap={4} mb={28}>
            <Title order={2} style={{ fontWeight: 700, color: '#1c1a17' }}>
              Welcome back
            </Title>
            <Text c="dimmed" size="sm">Sign in to the REREC ICT Management Portal</Text>
          </Stack>

          <form onSubmit={handleLogin}>
            <Stack gap={16}>
              <TextInput
                label="Username"
                placeholder="Your ArcGIS username"
                value={username}
                onChange={(e) => setUsername(e.currentTarget.value)}
                leftSection={<IconUser size={16} />}
                required
                size="md"
              />
              <PasswordInput
                label="Password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                leftSection={<IconLock size={16} />}
                required
                size="md"
              />
              <Button
                type="submit"
                loading={loading}
                fullWidth
                size="md"
                mt={8}
                style={{ background: 'linear-gradient(135deg, #e8590c 0%, #fd7e14 100%)' }}
              >
                Sign in
              </Button>
            </Stack>
          </form>
        </Paper>

        <Text ta="center" size="xs" c="rgba(255,255,255,0.4)" mt={20}>
          Access restricted to authorized ICT team members
        </Text>
      </Box>
    </Box>
  );
}

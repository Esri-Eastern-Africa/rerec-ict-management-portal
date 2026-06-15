import {
  Card,
  Avatar,
  Text,
  Title,
  Stack,
  Group,
  Box,
  Badge,
  Divider,
  Button,
} from '@mantine/core';
import { IconMail, IconUser, IconUsers, IconLogout } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import Layout from '@/components/Layout';
import { useAuthStore } from '@/store/auth';

export default function ProfilePage() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.username?.[0]?.toUpperCase() ?? 'U';

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      clearAuth();
      router.push('/login');
      toast.info('Signed out successfully');
    }
  };

  return (
    <Layout>
      <Stack gap={28} style={{ maxWidth: 640 }}>
        <Box>
          <Title order={2} fw={700} c="#1c1a17">Profile</Title>
          <Text c="dimmed" size="sm" mt={4}>Your ArcGIS portal account details</Text>
        </Box>

        <Card shadow="xs" radius="lg" p="xl" style={{ border: '1px solid #e9ecef' }}>
          <Group gap={20} mb={24}>
            <Avatar
              src={user?.thumbnailUrl}
              radius="xl"
              size={72}
              color="blue"
              style={{ fontSize: 28 }}
            >
              {initials}
            </Avatar>
            <Box>
              <Title order={3} fw={700} c="#1c1a17">
                {user?.fullName || user?.username || 'Unknown User'}
              </Title>
              <Text size="sm" c="dimmed">ArcGIS Portal User</Text>
            </Box>
          </Group>

          <Divider mb={20} />

          <Stack gap={16}>
            <Group gap={12}>
              <IconUser size={18} color="#868e96" />
              <Box>
                <Text size="xs" c="dimmed" fw={500}>Username</Text>
                <Text size="sm" fw={500}>{user?.username || '—'}</Text>
              </Box>
            </Group>

            <Group gap={12}>
              <IconMail size={18} color="#868e96" />
              <Box>
                <Text size="xs" c="dimmed" fw={500}>Email</Text>
                <Text size="sm" fw={500}>{user?.email || '—'}</Text>
              </Box>
            </Group>

            {user?.groups && user.groups.length > 0 && (
              <Box>
                <Group gap={12} mb={8}>
                  <IconUsers size={18} color="#868e96" />
                  <Text size="xs" c="dimmed" fw={500}>Groups</Text>
                </Group>
                <Group gap={8} ml={30}>
                  {user.groups.map((g) => (
                    <Badge key={g.id} variant="light" color="orange" size="sm">
                      {g.title}
                    </Badge>
                  ))}
                </Group>
              </Box>
            )}
          </Stack>
        </Card>

        <Card shadow="xs" radius="lg" p="xl" style={{ border: '1px solid #ffe3e3' }}>
          <Title order={5} c="#c92a2a" mb={8}>Sign out</Title>
          <Text size="sm" c="dimmed" mb={16}>
            This will end your session and return you to the login page.
          </Text>
          <Button
            leftSection={<IconLogout size={16} />}
            color="red"
            variant="light"
            onClick={handleSignOut}
          >
            Sign out
          </Button>
        </Card>
      </Stack>
    </Layout>
  );
}

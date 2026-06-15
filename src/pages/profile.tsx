import { Card, Avatar, Text, Title, Badge, Divider, Button } from '@mantine/core';
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
      <div className="flex flex-col gap-7 max-w-[640px]">
        <div>
          <Title order={2} fw={700} c="#1c1a17">Profile</Title>
          <Text c="dimmed" size="sm" mt={4}>Your ArcGIS portal account details</Text>
        </div>

        <Card shadow="xs" radius="lg" p="xl" style={{ border: '1px solid #e9ecef' }}>
          <div className="flex items-center gap-5 mb-6">
            <Avatar src={user?.thumbnailUrl} radius="xl" size={72} color="orange">
              {initials}
            </Avatar>
            <div>
              <Title order={3} fw={700} c="#1c1a17">
                {user?.fullName || user?.username || 'Unknown User'}
              </Title>
              <Text size="sm" c="dimmed">ArcGIS Portal User</Text>
            </div>
          </div>

          <Divider mb={20} />

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <IconUser size={18} color="#868e96" />
              <div>
                <Text size="xs" c="dimmed" fw={500}>Username</Text>
                <Text size="sm" fw={500}>{user?.username || '—'}</Text>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <IconMail size={18} color="#868e96" />
              <div>
                <Text size="xs" c="dimmed" fw={500}>Email</Text>
                <Text size="sm" fw={500}>{user?.email || '—'}</Text>
              </div>
            </div>

            {user?.groups && user.groups.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <IconUsers size={18} color="#868e96" />
                  <Text size="xs" c="dimmed" fw={500}>Groups</Text>
                </div>
                <div className="flex flex-wrap gap-2 ml-[30px]">
                  {user.groups.map((g) => (
                    <Badge key={g.id} variant="light" color="orange" size="sm">
                      {g.title}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card shadow="xs" radius="lg" p="xl" style={{ border: '1px solid #ffe3e3' }}>
          <Title order={5} c="#c92a2a" mb={8}>Sign out</Title>
          <Text size="sm" c="dimmed" mb={16}>
            This will end your session and return you to the login page.
          </Text>
          <Button leftSection={<IconLogout size={16} />} color="red" variant="light" onClick={handleSignOut}>
            Sign out
          </Button>
        </Card>
      </div>
    </Layout>
  );
}

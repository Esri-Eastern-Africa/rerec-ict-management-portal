import { useRouter } from 'next/router';
import {
  Group,
  Avatar,
  Text,
  Menu,
  UnstyledButton,
  Box,
  Divider,
} from '@mantine/core';
import { IconUser, IconLogout, IconChevronDown } from '@tabler/icons-react';
import { useAuthStore } from '@/store/auth';
import { toast } from 'react-toastify';

export default function Navbar() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      clearAuth();
      router.push('/login');
      toast.info('Signed out successfully');
    }
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.username?.[0]?.toUpperCase() ?? 'U';

  return (
    <Box
      style={{
        height: 64,
        background: '#fff',
        borderBottom: '1px solid #e9ecef',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <Group gap={12}>
        <img src="/logo.png" alt="REREC logo" style={{ height: 36, width: 'auto', display: 'block' }} />
        <Box>
          <Text fw={700} size="sm" c="#1c1a17">REREC</Text>
          <Text size="xs" c="dimmed">ICT Management Portal</Text>
        </Box>
      </Group>

      {/* User menu */}
      <Menu shadow="md" width={200} position="bottom-end">
        <Menu.Target>
          <UnstyledButton>
            <Group gap={10}>
              <Avatar
                src={user?.thumbnailUrl}
                radius="xl"
                size={36}
                color="orange"
              >
                {initials}
              </Avatar>
              <Box style={{ display: 'none' }} visibleFrom="sm">
                <Text size="sm" fw={500} c="#1c1a17" lineClamp={1}>
                  {user?.fullName || user?.username || 'User'}
                </Text>
                <Text size="xs" c="dimmed" lineClamp={1}>
                  {user?.email || ''}
                </Text>
              </Box>
              <IconChevronDown size={14} color="#868e96" />
            </Group>
          </UnstyledButton>
        </Menu.Target>

        <Menu.Dropdown>
          <Box style={{ padding: '10px 12px' }}>
            <Text size="sm" fw={500}>{user?.fullName || user?.username}</Text>
            <Text size="xs" c="dimmed">{user?.email}</Text>
          </Box>
          <Divider />
          <Menu.Item
            leftSection={<IconUser size={16} />}
            onClick={() => router.push('/profile')}
          >
            Profile
          </Menu.Item>
          <Menu.Item
            leftSection={<IconLogout size={16} />}
            color="red"
            onClick={handleSignOut}
          >
            Sign out
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Box>
  );
}

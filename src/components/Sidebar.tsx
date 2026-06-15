import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  IconLayoutDashboard,
  IconCategory,
  IconBuildingFactory,
  IconBuildingBank,
  IconFolderDollar,
  IconCircleDotted,
  IconProgressCheck,
  IconUsersGroup,
  IconFileDescription,
  IconBolt,
  IconTruck,
  IconTransform,
} from '@tabler/icons-react';
import { NavLink, ScrollArea, Text, Box } from '@mantine/core';

const navItems = [
  { label: 'Dashboard', href: '/', icon: IconLayoutDashboard },
  { label: 'Facility Categories', href: '/facility-categories', icon: IconCategory },
  { label: 'Facility Types', href: '/facility-types', icon: IconBuildingFactory },
  { label: 'Funding Agencies', href: '/funding-agencies', icon: IconBuildingBank },
  { label: 'Funding Categories', href: '/funding-categories', icon: IconFolderDollar },
  { label: 'Project Cycle Statuses', href: '/project-cycle-statuses', icon: IconCircleDotted },
  { label: 'Implementation Statuses', href: '/project-implementation-statuses', icon: IconProgressCheck },
  { label: 'Initiator Categories', href: '/project-initiator-categories', icon: IconUsersGroup },
  { label: 'Project Types', href: '/project-types', icon: IconFileDescription },
  { label: 'Substations', href: '/substations', icon: IconBolt },
  { label: 'Vendors', href: '/vendors', icon: IconTruck },
  { label: 'Voltage Transformations', href: '/voltage-transformations', icon: IconTransform },
];

export default function Sidebar() {
  const router = useRouter();

  return (
    <Box
      style={{
        width: 260,
        minHeight: '100vh',
        background: '#1c1a17',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      <Box style={{ padding: '24px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Text size="xs" c="dimmed" tt="uppercase" fw={600} style={{ letterSpacing: '0.08em' }}>
          ICT Management
        </Text>
      </Box>

      <ScrollArea style={{ flex: 1, padding: '8px 0' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = router.pathname === item.href;
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <NavLink
                label={item.label}
                leftSection={<Icon size={18} />}
                active={active}
                styles={{
                  root: {
                    borderRadius: 8,
                    margin: '2px 8px',
                    color: active ? '#fff' : 'rgba(255,255,255,0.65)',
                    background: active ? 'rgba(253, 126, 20, 0.22)' : 'transparent',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.06)',
                      color: '#fff',
                    },
                  },
                  label: { fontSize: 14 },
                }}
              />
            </Link>
          );
        })}
      </ScrollArea>
    </Box>
  );
}

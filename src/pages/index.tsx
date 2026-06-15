import { useEffect, useState } from 'react';
import {
  SimpleGrid,
  Card,
  Text,
  Title,
  Box,
  Skeleton,
  Group,
  ThemeIcon,
  Stack,
} from '@mantine/core';
import {
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
import Link from 'next/link';
import Layout from '@/components/Layout';
import { useAuthStore } from '@/store/auth';
import type { DashboardCounts } from '@/types';

const cards = [
  { key: 'facilityCategories', label: 'Facility Categories', icon: IconCategory, href: '/facility-categories', color: '#fd7e14' },
  { key: 'facilityTypes', label: 'Facility Types', icon: IconBuildingFactory, href: '/facility-types', color: '#8b5cf6' },
  { key: 'fundingAgencies', label: 'Funding Agencies', icon: IconBuildingBank, href: '/funding-agencies', color: '#10b981' },
  { key: 'fundingCategories', label: 'Funding Categories', icon: IconFolderDollar, href: '/funding-categories', color: '#e8590c' },
  { key: 'projectCycleStatuses', label: 'Project Cycle Statuses', icon: IconCircleDotted, href: '/project-cycle-statuses', color: '#ef4444' },
  { key: 'projectImplementationStatuses', label: 'Implementation Statuses', icon: IconProgressCheck, href: '/project-implementation-statuses', color: '#06b6d4' },
  { key: 'projectInitiatorCategories', label: 'Initiator Categories', icon: IconUsersGroup, href: '/project-initiator-categories', color: '#ec4899' },
  { key: 'projectTypes', label: 'Project Types', icon: IconFileDescription, href: '/project-types', color: '#14b8a6' },
  { key: 'substations', label: 'Substations', icon: IconBolt, href: '/substations', color: '#ff922b' },
  { key: 'vendors', label: 'Vendors', icon: IconTruck, href: '/vendors', color: '#6366f1' },
  { key: 'voltageTransformations', label: 'Voltage Transformations', icon: IconTransform, href: '/voltage-transformations', color: '#84cc16' },
];

export default function Dashboard() {
  const token = useAuthStore((s) => s.token);
  const [counts, setCounts] = useState<DashboardCounts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch('/api/dashboard/counts', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { setCounts(data as DashboardCounts); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  return (
    <Layout>
      <Stack gap={28}>
        <Box>
          <Title order={2} fw={700} c="#1c1a17">Dashboard</Title>
          <Text c="dimmed" size="sm" mt={4}>Overview of all reference data in ArcGIS</Text>
        </Box>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
          {cards.map(({ key, label, icon: Icon, href, color }) => (
            <Link key={key} href={href} style={{ textDecoration: 'none' }}>
              <Card
                shadow="xs"
                radius="lg"
                p="lg"
                style={{
                  border: '1px solid #e9ecef',
                  cursor: 'pointer',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'none';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '';
                }}
              >
                <Group justify="space-between" align="flex-start">
                  <Box>
                    {loading ? (
                      <Skeleton height={36} width={60} mb={4} radius="sm" />
                    ) : (
                      <Text size="xl" fw={800} c="#1c1a17" style={{ fontSize: 32, lineHeight: 1 }}>
                        {counts ? (counts as unknown as Record<string, number>)[key] ?? '—' : '—'}
                      </Text>
                    )}
                    <Text size="sm" c="dimmed" mt={6} fw={500}>{label}</Text>
                  </Box>
                  <ThemeIcon
                    radius="md"
                    size={44}
                    style={{ background: `${color}18` }}
                  >
                    <Icon size={22} color={color} />
                  </ThemeIcon>
                </Group>
              </Card>
            </Link>
          ))}
        </SimpleGrid>
      </Stack>
    </Layout>
  );
}

import { useState, useEffect } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import {
  Title, Text, Box, Button, Modal, TextInput, Stack, Group, Select,
} from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { toast } from 'react-toastify';
import Layout from '@/components/Layout';
import DataTable from '@/components/DataTable';
import { useFeatureLayer } from '@/lib/useFeatureLayer';
import { useAuthStore } from '@/store/auth';
import type { FacilityType, FacilityCategory } from '@/types';

export default function FacilityTypesPage() {
  const { records, loading, addRecord, updateRecord, deleteRecord } =
    useFeatureLayer<FacilityType>('/api/facility-types');

  const token = useAuthStore((s) => s.token);
  const [categories, setCategories] = useState<FacilityCategory[]>([]);

  useEffect(() => {
    if (!token) return;
    fetch('/api/facility-categories', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setCategories(d.records || []));
  }, [token]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<FacilityType | null>(null);
  const [facilityType, setFacilityType] = useState('');
  const [facilityCategory, setFacilityCategory] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FacilityType | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openAdd = () => {
    setEditTarget(null); setFacilityType(''); setFacilityCategory(null); setModalOpen(true);
  };
  const openEdit = (row: FacilityType) => {
    setEditTarget(row);
    setFacilityType(row.facility_type);
    setFacilityCategory(row.facility_category);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!facilityType.trim()) { toast.error('Facility type is required'); return; }
    if (!facilityCategory) { toast.error('Please select a facility category'); return; }
    setSaving(true);
    try {
      if (editTarget) {
        await updateRecord(editTarget.objectid, { facility_type: facilityType.trim(), facility_category: facilityCategory });
        toast.success('Facility type updated');
      } else {
        await addRecord({ facility_type: facilityType.trim(), facility_category: facilityCategory });
        toast.success('Facility type added');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteRecord(deleteTarget.objectid);
      toast.success('Facility type deleted');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const catMap = Object.fromEntries(categories.map((c) => [c.globalid, c.facility_category]));

  const columns: ColumnDef<FacilityType>[] = [
    { accessorKey: 'objectid', header: 'Object ID', size: 100 },
    { accessorKey: 'facility_type', header: 'Facility Type' },
    {
      accessorKey: 'facility_category',
      header: 'Facility Category',
      cell: ({ getValue }) => catMap[getValue<string>()] || getValue<string>() || '—',
    },
    { accessorKey: 'created_user', header: 'Created By' },
    {
      accessorKey: 'created_date',
      header: 'Created Date',
      cell: ({ getValue }) => {
        const v = getValue<number>();
        return v ? new Date(v).toLocaleDateString() : '—';
      },
    },
  ];

  const categoryOptions = categories.map((c) => ({
    value: c.globalid || '',
    label: c.facility_category,
  }));

  return (
    <Layout>
      <Stack gap={24}>
        <Group justify="space-between" align="flex-end">
          <Box>
            <Title order={2} fw={700} c="#1c1a17">Facility Types</Title>
            <Text c="dimmed" size="sm" mt={4}>{records.length} records</Text>
          </Box>
          <Button leftSection={<IconPlus size={16} />} onClick={openAdd}>
            Add Facility Type
          </Button>
        </Group>

        <DataTable
          data={records}
          columns={columns}
          loading={loading}
          onEdit={openEdit}
          onDelete={(row) => setDeleteTarget(row)}
        />
      </Stack>

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Edit Facility Type' : 'Add Facility Type'}
        radius="md"
      >
        <Stack gap={16}>
          <TextInput
            label="Facility Type"
            placeholder="e.g. Transformer"
            value={facilityType}
            onChange={(e) => setFacilityType(e.currentTarget.value)}
            required
            autoFocus
          />
          <Select
            label="Facility Category"
            placeholder="Select a category"
            data={categoryOptions}
            value={facilityCategory}
            onChange={setFacilityCategory}
            searchable
            required
          />
          <Group justify="flex-end" gap={8}>
            <Button variant="default" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>
              {editTarget ? 'Update' : 'Add'}
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Delete"
        radius="md"
        size="sm"
      >
        <Text size="sm" mb={20}>
          Are you sure you want to delete <strong>{deleteTarget?.facility_type}</strong>? This action cannot be undone.
        </Text>
        <Group justify="flex-end" gap={8}>
          <Button variant="default" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="red" onClick={handleDelete} loading={deleting} leftSection={<IconTrash size={14} />}>
            Delete
          </Button>
        </Group>
      </Modal>
    </Layout>
  );
}

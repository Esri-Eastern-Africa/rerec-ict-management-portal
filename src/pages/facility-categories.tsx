import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import {
  Title, Text, Box, Button, Modal, TextInput, Stack, Group,
  ActionIcon, Tooltip,
} from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { toast } from 'react-toastify';
import Layout from '@/components/Layout';
import DataTable from '@/components/DataTable';
import { useFeatureLayer } from '@/lib/useFeatureLayer';
import type { FacilityCategory } from '@/types';

export default function FacilityCategoriesPage() {
  const { records, loading, addRecord, updateRecord, deleteRecord } =
    useFeatureLayer<FacilityCategory>('/api/facility-categories');

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<FacilityCategory | null>(null);
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FacilityCategory | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openAdd = () => { setEditTarget(null); setValue(''); setModalOpen(true); };
  const openEdit = (row: FacilityCategory) => { setEditTarget(row); setValue(row.facility_category); setModalOpen(true); };

  const handleSave = async () => {
    if (!value.trim()) { toast.error('Facility category is required'); return; }
    setSaving(true);
    try {
      if (editTarget) {
        await updateRecord(editTarget.objectid, { facility_category: value.trim() });
        toast.success('Facility category updated');
      } else {
        await addRecord({ facility_category: value.trim() });
        toast.success('Facility category added');
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
      toast.success('Facility category deleted');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const columns: ColumnDef<FacilityCategory>[] = [
    { accessorKey: 'objectid', header: 'Object ID', size: 100 },
    { accessorKey: 'facility_category', header: 'Facility Category' },
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

  return (
    <Layout>
      <Stack gap={24}>
        <Group justify="space-between" align="flex-end">
          <Box>
            <Title order={2} fw={700} c="#1c1a17">Facility Categories</Title>
            <Text c="dimmed" size="sm" mt={4}>{records.length} records</Text>
          </Box>
          <Button leftSection={<IconPlus size={16} />} onClick={openAdd}>
            Add Facility Category
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

      {/* Add / Edit Modal */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Edit Facility Category' : 'Add Facility Category'}
        radius="md"
      >
        <Stack gap={16}>
          <TextInput
            label="Facility Category"
            placeholder="e.g. Transmission"
            value={value}
            onChange={(e) => setValue(e.currentTarget.value)}
            required
            autoFocus
          />
          <Group justify="flex-end" gap={8}>
            <Button variant="default" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>
              {editTarget ? 'Update' : 'Add'}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        opened={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Delete"
        radius="md"
        size="sm"
      >
        <Text size="sm" mb={20}>
          Are you sure you want to delete <strong>{deleteTarget?.facility_category}</strong>? This action cannot be undone.
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

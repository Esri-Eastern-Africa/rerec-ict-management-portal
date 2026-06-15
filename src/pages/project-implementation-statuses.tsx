import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Title, Text, Box, Button, Modal, TextInput, Stack, Group } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { toast } from 'react-toastify';
import Layout from '@/components/Layout';
import DataTable from '@/components/DataTable';
import { useFeatureLayer } from '@/lib/useFeatureLayer';
import type { ProjectImplementationStatus } from '@/types';

export default function ProjectImplementationStatusesPage() {
  const { records, loading, addRecord, updateRecord, deleteRecord } =
    useFeatureLayer<ProjectImplementationStatus>('/api/project-implementation-statuses');

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ProjectImplementationStatus | null>(null);
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProjectImplementationStatus | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openAdd = () => { setEditTarget(null); setValue(''); setModalOpen(true); };
  const openEdit = (row: ProjectImplementationStatus) => { setEditTarget(row); setValue(row.project_implementation_status); setModalOpen(true); };

  const handleSave = async () => {
    if (!value.trim()) { toast.error('Project implementation status is required'); return; }
    setSaving(true);
    try {
      if (editTarget) {
        await updateRecord(editTarget.objectid, { project_implementation_status: value.trim() });
        toast.success('Implementation status updated');
      } else {
        await addRecord({ project_implementation_status: value.trim() });
        toast.success('Implementation status added');
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
      toast.success('Implementation status deleted');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const columns: ColumnDef<ProjectImplementationStatus>[] = [
    { accessorKey: 'objectid', header: 'Object ID', size: 100 },
    { accessorKey: 'project_implementation_status', header: 'Implementation Status' },
    { accessorKey: 'created_user', header: 'Created By' },
    {
      accessorKey: 'created_date', header: 'Created Date',
      cell: ({ getValue }) => { const v = getValue<number>(); return v ? new Date(v).toLocaleDateString() : '—'; },
    },
  ];

  return (
    <Layout>
      <Stack gap={24}>
        <Group justify="space-between" align="flex-end">
          <Box>
            <Title order={2} fw={700} c="#1c1a17">Project Implementation Statuses</Title>
            <Text c="dimmed" size="sm" mt={4}>{records.length} records</Text>
          </Box>
          <Button leftSection={<IconPlus size={16} />} onClick={openAdd}>Add Status</Button>
        </Group>
        <DataTable data={records} columns={columns} loading={loading} onEdit={openEdit} onDelete={(row) => setDeleteTarget(row)} />
      </Stack>

      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Edit Implementation Status' : 'Add Implementation Status'} radius="md">
        <Stack gap={16}>
          <TextInput label="Implementation Status" placeholder="e.g. Ongoing" value={value} onChange={(e) => setValue(e.currentTarget.value)} required autoFocus />
          <Group justify="flex-end" gap={8}>
            <Button variant="default" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{editTarget ? 'Update' : 'Add'}</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirm Delete" radius="md" size="sm">
        <Text size="sm" mb={20}>Are you sure you want to delete <strong>{deleteTarget?.project_implementation_status}</strong>?</Text>
        <Group justify="flex-end" gap={8}>
          <Button variant="default" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="red" onClick={handleDelete} loading={deleting} leftSection={<IconTrash size={14} />}>Delete</Button>
        </Group>
      </Modal>
    </Layout>
  );
}

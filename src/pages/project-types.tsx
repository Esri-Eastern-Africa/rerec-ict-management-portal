import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Title, Text, Box, Button, Modal, TextInput, Stack, Group } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { toast } from 'react-toastify';
import Layout from '@/components/Layout';
import DataTable from '@/components/DataTable';
import { useFeatureLayer } from '@/lib/useFeatureLayer';
import type { ProjectType } from '@/types';

export default function ProjectTypesPage() {
  const { records, loading, addRecord, updateRecord, deleteRecord } =
    useFeatureLayer<ProjectType>('/api/project-types');

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ProjectType | null>(null);
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProjectType | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openAdd = () => { setEditTarget(null); setValue(''); setModalOpen(true); };
  const openEdit = (row: ProjectType) => { setEditTarget(row); setValue(row.project_type); setModalOpen(true); };

  const handleSave = async () => {
    if (!value.trim()) { toast.error('Project type is required'); return; }
    setSaving(true);
    try {
      if (editTarget) {
        await updateRecord(editTarget.objectid, { project_type: value.trim() });
        toast.success('Project type updated');
      } else {
        await addRecord({ project_type: value.trim() });
        toast.success('Project type added');
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
      toast.success('Project type deleted');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const columns: ColumnDef<ProjectType>[] = [
    { accessorKey: 'objectid', header: 'Object ID', size: 100 },
    { accessorKey: 'project_type', header: 'Project Type' },
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
            <Title order={2} fw={700} c="#1c1a17">Project Types</Title>
            <Text c="dimmed" size="sm" mt={4}>{records.length} records</Text>
          </Box>
          <Button leftSection={<IconPlus size={16} />} onClick={openAdd}>Add Project Type</Button>
        </Group>
        <DataTable data={records} columns={columns} loading={loading} onEdit={openEdit} onDelete={(row) => setDeleteTarget(row)} />
      </Stack>

      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Edit Project Type' : 'Add Project Type'} radius="md">
        <Stack gap={16}>
          <TextInput label="Project Type" placeholder="e.g. Infrastructure" value={value} onChange={(e) => setValue(e.currentTarget.value)} required autoFocus />
          <Group justify="flex-end" gap={8}>
            <Button variant="default" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{editTarget ? 'Update' : 'Add'}</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirm Delete" radius="md" size="sm">
        <Text size="sm" mb={20}>Are you sure you want to delete <strong>{deleteTarget?.project_type}</strong>?</Text>
        <Group justify="flex-end" gap={8}>
          <Button variant="default" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="red" onClick={handleDelete} loading={deleting} leftSection={<IconTrash size={14} />}>Delete</Button>
        </Group>
      </Modal>
    </Layout>
  );
}

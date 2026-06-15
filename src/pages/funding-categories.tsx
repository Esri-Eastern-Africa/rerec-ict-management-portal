import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Title, Text, Box, Button, Modal, TextInput, Stack, Group } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { toast } from 'react-toastify';
import Layout from '@/components/Layout';
import DataTable from '@/components/DataTable';
import { useFeatureLayer } from '@/lib/useFeatureLayer';
import type { FundingCategory } from '@/types';

export default function FundingCategoriesPage() {
  const { records, loading, addRecord, updateRecord, deleteRecord } =
    useFeatureLayer<FundingCategory>('/api/funding-categories');

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<FundingCategory | null>(null);
  const [fundingCategory, setFundingCategory] = useState('');
  const [fundingType, setFundingType] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FundingCategory | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openAdd = () => { setEditTarget(null); setFundingCategory(''); setFundingType(''); setModalOpen(true); };
  const openEdit = (row: FundingCategory) => {
    setEditTarget(row); setFundingCategory(row.funding_category); setFundingType(row.funding_type || ''); setModalOpen(true);
  };

  const handleSave = async () => {
    if (!fundingCategory.trim()) { toast.error('Funding category is required'); return; }
    setSaving(true);
    try {
      if (editTarget) {
        await updateRecord(editTarget.objectid, { funding_category: fundingCategory.trim(), funding_type: fundingType.trim() });
        toast.success('Funding category updated');
      } else {
        await addRecord({ funding_category: fundingCategory.trim(), funding_type: fundingType.trim() });
        toast.success('Funding category added');
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
      toast.success('Funding category deleted');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const columns: ColumnDef<FundingCategory>[] = [
    { accessorKey: 'objectid', header: 'Object ID', size: 100 },
    { accessorKey: 'funding_category', header: 'Funding Category' },
    { accessorKey: 'funding_type', header: 'Funding Type' },
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
            <Title order={2} fw={700} c="#1c1a17">Funding Categories</Title>
            <Text c="dimmed" size="sm" mt={4}>{records.length} records</Text>
          </Box>
          <Button leftSection={<IconPlus size={16} />} onClick={openAdd}>Add Funding Category</Button>
        </Group>
        <DataTable data={records} columns={columns} loading={loading} onEdit={openEdit} onDelete={(row) => setDeleteTarget(row)} />
      </Stack>

      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Edit Funding Category' : 'Add Funding Category'} radius="md">
        <Stack gap={16}>
          <TextInput label="Funding Category" placeholder="e.g. Grant" value={fundingCategory} onChange={(e) => setFundingCategory(e.currentTarget.value)} required autoFocus />
          <TextInput label="Funding Type" placeholder="e.g. International" value={fundingType} onChange={(e) => setFundingType(e.currentTarget.value)} />
          <Group justify="flex-end" gap={8}>
            <Button variant="default" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{editTarget ? 'Update' : 'Add'}</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirm Delete" radius="md" size="sm">
        <Text size="sm" mb={20}>Are you sure you want to delete <strong>{deleteTarget?.funding_category}</strong>?</Text>
        <Group justify="flex-end" gap={8}>
          <Button variant="default" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="red" onClick={handleDelete} loading={deleting} leftSection={<IconTrash size={14} />}>Delete</Button>
        </Group>
      </Modal>
    </Layout>
  );
}

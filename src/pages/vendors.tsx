import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Title, Text, Box, Button, Modal, TextInput, Stack, Group } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { toast } from 'react-toastify';
import Layout from '@/components/Layout';
import DataTable from '@/components/DataTable';
import { useFeatureLayer } from '@/lib/useFeatureLayer';
import type { Vendor } from '@/types';

export default function VendorsPage() {
  const { records, loading, addRecord, updateRecord, deleteRecord } =
    useFeatureLayer<Vendor>('/api/vendors');

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Vendor | null>(null);
  const [vendorName, setVendorName] = useState('');
  const [vendorEmail, setVendorEmail] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Vendor | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openAdd = () => {
    setEditTarget(null); setVendorName(''); setVendorEmail(''); setVendorPhone(''); setModalOpen(true);
  };
  const openEdit = (row: Vendor) => {
    setEditTarget(row);
    setVendorName(row.vendor_name);
    setVendorEmail(row.vendor_email || '');
    setVendorPhone(row.vendor_phone_number || '');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!vendorName.trim()) { toast.error('Vendor name is required'); return; }
    setSaving(true);
    try {
      const body = { vendor_name: vendorName.trim(), vendor_email: vendorEmail.trim(), vendor_phone_number: vendorPhone.trim() };
      if (editTarget) {
        await updateRecord(editTarget.objectid, body);
        toast.success('Vendor updated');
      } else {
        await addRecord(body);
        toast.success('Vendor added');
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
      toast.success('Vendor deleted');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const columns: ColumnDef<Vendor>[] = [
    { accessorKey: 'objectid', header: 'Object ID', size: 100 },
    { accessorKey: 'vendor_name', header: 'Vendor Name' },
    { accessorKey: 'vendor_email', header: 'Email' },
    { accessorKey: 'vendor_phone_number', header: 'Phone' },
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
            <Title order={2} fw={700} c="#1c1a17">Vendors</Title>
            <Text c="dimmed" size="sm" mt={4}>{records.length} records</Text>
          </Box>
          <Button leftSection={<IconPlus size={16} />} onClick={openAdd}>Add Vendor</Button>
        </Group>
        <DataTable data={records} columns={columns} loading={loading} onEdit={openEdit} onDelete={(row) => setDeleteTarget(row)} />
      </Stack>

      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Edit Vendor' : 'Add Vendor'} radius="md">
        <Stack gap={16}>
          <TextInput label="Vendor Name" placeholder="e.g. Acme Corp" value={vendorName} onChange={(e) => setVendorName(e.currentTarget.value)} required autoFocus />
          <TextInput label="Email" placeholder="contact@vendor.com" type="email" value={vendorEmail} onChange={(e) => setVendorEmail(e.currentTarget.value)} />
          <TextInput label="Phone Number" placeholder="+254..." value={vendorPhone} onChange={(e) => setVendorPhone(e.currentTarget.value)} />
          <Group justify="flex-end" gap={8}>
            <Button variant="default" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{editTarget ? 'Update' : 'Add'}</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirm Delete" radius="md" size="sm">
        <Text size="sm" mb={20}>Are you sure you want to delete <strong>{deleteTarget?.vendor_name}</strong>?</Text>
        <Group justify="flex-end" gap={8}>
          <Button variant="default" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="red" onClick={handleDelete} loading={deleting} leftSection={<IconTrash size={14} />}>Delete</Button>
        </Group>
      </Modal>
    </Layout>
  );
}

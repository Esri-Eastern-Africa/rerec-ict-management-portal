import { useState, useEffect } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import {
  Title, Text, Box, Button, Modal, TextInput, Stack, Group, NumberInput, Select,
} from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { toast } from 'react-toastify';
import Layout from '@/components/Layout';
import DataTable from '@/components/DataTable';
import { useFeatureLayer } from '@/lib/useFeatureLayer';
import { useAuthStore } from '@/store/auth';
import type { Substation, VoltageTransformation } from '@/types';

export default function SubstationsPage() {
  const { records, loading, addRecord, updateRecord, deleteRecord } =
    useFeatureLayer<Substation>('/api/substations');

  const token = useAuthStore((s) => s.token);
  const [voltageOptions, setVoltageOptions] = useState<VoltageTransformation[]>([]);

  useEffect(() => {
    if (!token) return;
    fetch('/api/voltage-transformations', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setVoltageOptions(d.records || []));
  }, [token]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Substation | null>(null);
  const [substationId, setSubstationId] = useState<number | string>('');
  const [substationName, setSubstationName] = useState('');
  const [substationNumber, setSubstationNumber] = useState('');
  const [substationType, setSubstationType] = useState('');
  const [voltageTransformationId, setVoltageTransformationId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Substation | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openAdd = () => {
    setEditTarget(null);
    setSubstationId(''); setSubstationName(''); setSubstationNumber(''); setSubstationType(''); setVoltageTransformationId(null);
    setModalOpen(true);
  };
  const openEdit = (row: Substation) => {
    setEditTarget(row);
    setSubstationId(row.substation_id || '');
    setSubstationName(row.substation_name || '');
    setSubstationNumber(row.substation_number || '');
    setSubstationType(row.substation_type || '');
    setVoltageTransformationId(row.voltage_transformation_id || null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!substationName.trim()) { toast.error('Substation name is required'); return; }
    setSaving(true);
    try {
      const body = {
        substation_id: substationId === '' ? null : Number(substationId),
        substation_name: substationName.trim(),
        substation_number: substationNumber.trim(),
        substation_type: substationType.trim(),
        voltage_transformation_id: voltageTransformationId,
      };
      if (editTarget) {
        await updateRecord(editTarget.objectid, body);
        toast.success('Substation updated');
      } else {
        await addRecord(body);
        toast.success('Substation added');
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
      toast.success('Substation deleted');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const voltMap = Object.fromEntries(voltageOptions.map((v) => [v.globalid, v.voltage_transformation]));

  const columns: ColumnDef<Substation>[] = [
    { accessorKey: 'objectid', header: 'Object ID', size: 80 },
    { accessorKey: 'substation_id', header: 'Substation ID' },
    { accessorKey: 'substation_name', header: 'Name' },
    { accessorKey: 'substation_number', header: 'Number' },
    { accessorKey: 'substation_type', header: 'Type' },
    {
      accessorKey: 'voltage_transformation_id',
      header: 'Voltage Transformation',
      cell: ({ getValue }) => voltMap[getValue<string>()] || getValue<string>() || '—',
    },
    { accessorKey: 'created_user', header: 'Created By' },
  ];

  const voltSelectOptions = voltageOptions.map((v) => ({
    value: v.globalid || '',
    label: v.voltage_transformation,
  }));

  return (
    <Layout>
      <Stack gap={24}>
        <Group justify="space-between" align="flex-end">
          <Box>
            <Title order={2} fw={700} c="#1c1a17">Substations</Title>
            <Text c="dimmed" size="sm" mt={4}>{records.length} records</Text>
          </Box>
          <Button leftSection={<IconPlus size={16} />} onClick={openAdd}>Add Substation</Button>
        </Group>
        <DataTable data={records} columns={columns} loading={loading} onEdit={openEdit} onDelete={(row) => setDeleteTarget(row)} />
      </Stack>

      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Edit Substation' : 'Add Substation'} radius="md" size="lg">
        <Stack gap={16}>
          <Group grow>
            <NumberInput
              label="Substation ID"
              placeholder="e.g. 1"
              value={substationId}
              onChange={(v) => setSubstationId(v)}
              min={0}
            />
            <TextInput
              label="Substation Number"
              placeholder="e.g. SUB-001"
              value={substationNumber}
              onChange={(e) => setSubstationNumber(e.currentTarget.value)}
            />
          </Group>
          <TextInput label="Substation Name" placeholder="e.g. Nairobi North" value={substationName} onChange={(e) => setSubstationName(e.currentTarget.value)} required autoFocus />
          <Group grow>
            <TextInput label="Substation Type" placeholder="e.g. Primary" value={substationType} onChange={(e) => setSubstationType(e.currentTarget.value)} />
            <Select
              label="Voltage Transformation"
              placeholder="Select voltage transformation"
              data={voltSelectOptions}
              value={voltageTransformationId}
              onChange={setVoltageTransformationId}
              searchable
              clearable
            />
          </Group>
          <Group justify="flex-end" gap={8}>
            <Button variant="default" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{editTarget ? 'Update' : 'Add'}</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirm Delete" radius="md" size="sm">
        <Text size="sm" mb={20}>Are you sure you want to delete substation <strong>{deleteTarget?.substation_name}</strong>?</Text>
        <Group justify="flex-end" gap={8}>
          <Button variant="default" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="red" onClick={handleDelete} loading={deleting} leftSection={<IconTrash size={14} />}>Delete</Button>
        </Group>
      </Modal>
    </Layout>
  );
}

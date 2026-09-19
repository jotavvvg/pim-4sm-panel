import { useEffect, useState } from 'react';

import { ActionButton } from '@/components/ActionButton';
import { DataTable, type DataTableColumn } from '@/components/DataTable';
import { FormField } from '@/components/FormField';
import { Modal } from '@/components/Modal';
import {
  createProfessor,
  deleteProfessor,
  fetchDisciplinas,
  fetchProfessores,
  toCreateProfessorPayload,
  updateProfessor,
} from '@/lib/api';
import type { Disciplina, Professor } from '@/types/entities';

const emptyForm = { nome: '', disciplinaId: '' };

export function ProfessoresPage() {
  const [items, setItems] = useState<Professor[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);

  const loadItems = async () => {
    const [professores, disciplinasData] = await Promise.all([fetchProfessores(), fetchDisciplinas()]);
    setItems(professores);
    setDisciplinas(disciplinasData);
    setLoading(false);
  };

  useEffect(() => {
    void loadItems();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (row: Professor) => {
    setEditingId(row.id);
    setForm({ nome: row.nome, disciplinaId: String(row.disciplinaId) });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.nome.trim() || !form.disciplinaId) {
      return;
    }

    const payload = toCreateProfessorPayload({
      nome: form.nome.trim(),
      disciplinaId: Number(form.disciplinaId),
    });

    if (editingId !== null) {
      await updateProfessor(editingId, payload);
    } else {
      await createProfessor(payload);
    }

    setModalOpen(false);
    setForm(emptyForm);
    setEditingId(null);
    await loadItems();
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('Deseja excluir este professor?');
    if (!confirmed) {
      return;
    }

    await deleteProfessor(id);
    await loadItems();
  };

  const columns: DataTableColumn<Professor>[] = [
    { key: 'id', header: 'ID' },
    { key: 'nome', header: 'Nome' },
    {
      key: 'disciplina',
      header: 'Disciplina',
      render: (row) => row.disciplina?.nome ?? '—',
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (row) => (
        <div className="row-actions">
          <ActionButton kind="edit" label="Editar professor" onClick={() => openEditModal(row)} />
          <ActionButton kind="delete" label="Excluir professor" onClick={() => void handleDelete(row.id)} />
        </div>
      ),
    },
  ];

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <p className="eyebrow">Cadastro</p>
          <h3>Professores</h3>
        </div>
        <button type="button" className="primary-button" onClick={openCreateModal}>
          + Novo professor
        </button>
      </div>

      {loading ? (
        <div className="panel-card"><p>Carregando professores...</p></div>
      ) : (
        <DataTable columns={columns} data={items} rowKey={(row) => row.id} emptyMessage="Nenhum professor cadastrado." />
      )}

      <Modal isOpen={modalOpen} title={editingId === null ? 'Novo professor' : 'Editar professor'} onClose={() => setModalOpen(false)}>
        <div className="form-grid">
          <FormField
            label="Nome"
            name="nome"
            value={form.nome}
            onChange={(value) => setForm((current) => ({ ...current, nome: String(value) }))}
            placeholder="Ex: Prof. Ana Silva"
          />
          <FormField
            label="Disciplina"
            name="disciplinaId"
            type="select"
            value={form.disciplinaId}
            options={disciplinas.map((disciplina) => ({
              value: disciplina.id,
              label: disciplina.nome,
            }))}
            onChange={(value) => setForm((current) => ({ ...current, disciplinaId: String(value) }))}
          />
        </div>

        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={() => setModalOpen(false)}>
            Cancelar
          </button>
          <button type="button" className="primary-button" onClick={() => void handleSubmit()}>
            {editingId === null ? 'Salvar' : 'Atualizar'}
          </button>
        </div>
      </Modal>
    </section>
  );
}

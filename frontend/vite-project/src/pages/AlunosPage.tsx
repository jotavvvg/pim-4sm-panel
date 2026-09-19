import { useEffect, useState } from 'react';

import { ActionButton } from '@/components/ActionButton';
import { DataTable, type DataTableColumn } from '@/components/DataTable';
import { FormField } from '@/components/FormField';
import { Modal } from '@/components/Modal';
import {
  createAluno,
  deleteAluno,
  fetchAlunos,
  fetchDisciplinas,
  fetchTurmas,
  toCreateAlunoPayload,
  updateAluno,
} from '@/lib/api';
import type { Aluno, Disciplina, Turma } from '@/types/entities';

const emptyForm = { nome: '', matriculado: false, turmaId: '', disciplinaId: '' };

export function AlunosPage() {
  const [items, setItems] = useState<Aluno[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);

  const loadItems = async () => {
    const [alunos, turmasData, disciplinasData] = await Promise.all([
      fetchAlunos(),
      fetchTurmas(),
      fetchDisciplinas(),
    ]);
    setItems(alunos);
    setTurmas(turmasData);
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

  const openEditModal = (row: Aluno) => {
    setEditingId(row.id);
    setForm({
      nome: row.nome,
      matriculado: row.matriculado,
      turmaId: String(row.turmaId),
      disciplinaId: String(row.disciplinaId),
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.nome.trim() || !form.turmaId || !form.disciplinaId) {
      return;
    }

    const payload = toCreateAlunoPayload({
      nome: form.nome.trim(),
      matriculado: Boolean(form.matriculado),
      turmaId: Number(form.turmaId),
      disciplinaId: Number(form.disciplinaId),
    });

    if (editingId !== null) {
      await updateAluno(editingId, payload);
    } else {
      await createAluno(payload);
    }

    setModalOpen(false);
    setForm(emptyForm);
    setEditingId(null);
    await loadItems();
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('Deseja excluir este aluno?');
    if (!confirmed) {
      return;
    }

    await deleteAluno(id);
    await loadItems();
  };

  const columns: DataTableColumn<Aluno>[] = [
    { key: 'id', header: 'ID' },
    { key: 'nome', header: 'Nome' },
    {
      key: 'matriculado',
      header: 'Status',
      render: (row) => (row.matriculado ? 'Matriculado' : 'Não matriculado'),
    },
    {
      key: 'turma',
      header: 'Turma',
      render: (row) => row.turma?.nome ?? '—',
    },
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
          <ActionButton kind="edit" label="Editar aluno" onClick={() => openEditModal(row)} />
          <ActionButton kind="delete" label="Excluir aluno" onClick={() => void handleDelete(row.id)} />
        </div>
      ),
    },
  ];

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <p className="eyebrow">Cadastro</p>
          <h3>Alunos</h3>
        </div>
        <button type="button" className="primary-button" onClick={openCreateModal}>
          + Novo aluno
        </button>
      </div>

      {loading ? (
        <div className="panel-card"><p>Carregando alunos...</p></div>
      ) : (
        <DataTable columns={columns} data={items} rowKey={(row) => row.id} emptyMessage="Nenhum aluno cadastrado." />
      )}

      <Modal isOpen={modalOpen} title={editingId === null ? 'Novo aluno' : 'Editar aluno'} onClose={() => setModalOpen(false)}>
        <div className="form-grid">
          <FormField
            label="Nome"
            name="nome"
            value={form.nome}
            onChange={(value) => setForm((current) => ({ ...current, nome: String(value) }))}
            placeholder="Ex: Maria Souza"
          />
          <FormField
            label="Matriculado"
            name="matriculado"
            type="checkbox"
            value={form.matriculado}
            onChange={(value) => setForm((current) => ({ ...current, matriculado: Boolean(value) }))}
          />
          <FormField
            label="Turma"
            name="turmaId"
            type="select"
            value={form.turmaId}
            options={turmas.map((turma) => ({ value: turma.id, label: turma.nome }))}
            onChange={(value) => setForm((current) => ({ ...current, turmaId: String(value) }))}
          />
          <FormField
            label="Disciplina"
            name="disciplinaId"
            type="select"
            value={form.disciplinaId}
            options={disciplinas.map((disciplina) => ({ value: disciplina.id, label: disciplina.nome }))}
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

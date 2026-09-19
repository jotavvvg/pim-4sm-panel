import axios from 'axios';

import type {
  Aluno,
  DashboardSummary,
  Disciplina,
  MetricsResponse,
  Professor,
  SearchResponse,
  Turma,
} from '@/types/entities';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

export const fetchDisciplinas = () => api.get<Disciplina[]>('/disciplinas').then((response) => response.data);
export const fetchTurmas = () => api.get<Turma[]>('/turmas').then((response) => response.data);
export const fetchProfessores = () => api.get<Professor[]>('/professores').then((response) => response.data);
export const fetchAlunos = () => api.get<Aluno[]>('/alunos').then((response) => response.data);
export const fetchMetrics = () => api.get<MetricsResponse>('/metrics').then((response) => response.data);
export const searchGlobal = (query: string) => api.get<SearchResponse>('/search', { params: { q: query } }).then((response) => response.data);

export const fetchTurmaById = (id: number) => api.get<Turma>(`/turmas/${id}`).then((response) => response.data);
export const fetchAlunoById = (id: number) => api.get<Aluno>(`/alunos/${id}`).then((response) => response.data);

export const fetchDashboardSummary = async (): Promise<DashboardSummary> => {
  const [disciplinas, turmas, professores, alunos] = await Promise.all([
    fetchDisciplinas(),
    fetchTurmas(),
    fetchProfessores(),
    fetchAlunos(),
  ]);

  return {
    disciplinas: disciplinas.length,
    turmas: turmas.length,
    professores: professores.length,
    alunos: alunos.length,
  };
};

export const createDisciplina = (payload: Omit<Disciplina, 'id'>) =>
  api.post<Disciplina>('/disciplinas', payload).then((response) => response.data);

export const updateDisciplina = (id: number, payload: Omit<Disciplina, 'id'>) =>
  api.put<Disciplina>(`/disciplinas/${id}`, payload).then((response) => response.data);

export const deleteDisciplina = (id: number) => api.delete(`/disciplinas/${id}`);

export const createTurma = (payload: Pick<Turma, 'nome'>) =>
  api.post<Turma>('/turmas', payload).then((response) => response.data);

export const updateTurma = (id: number, payload: Pick<Turma, 'nome'>) =>
  api.put<Turma>(`/turmas/${id}`, payload).then((response) => response.data);

export const deleteTurma = (id: number) => api.delete(`/turmas/${id}`);

export const createProfessor = (payload: { nome: string; disciplina_id: number }) =>
  api.post<Professor>('/professores', payload).then((response) => response.data);

export const updateProfessor = (id: number, payload: { nome: string; disciplina_id: number }) =>
  api.put<Professor>(`/professores/${id}`, payload).then((response) => response.data);

export const deleteProfessor = (id: number) => api.delete(`/professores/${id}`);

export const createAluno = (payload: { nome: string; matriculado: boolean; turma_id: number; disciplina_id: number }) =>
  api.post<Aluno>('/alunos', payload).then((response) => response.data);

export const updateAluno = (id: number, payload: { nome: string; matriculado: boolean; turma_id: number; disciplina_id: number }) =>
  api.put<Aluno>(`/alunos/${id}`, payload).then((response) => response.data);

export const deleteAluno = (id: number) => api.delete(`/alunos/${id}`);

export const toCreateProfessorPayload = (data: { nome: string; disciplinaId: number }) => ({
  nome: data.nome,
  disciplina_id: data.disciplinaId,
});

export const toUpdateProfessorPayload = toCreateProfessorPayload;

export const toCreateAlunoPayload = (data: { nome: string; matriculado: boolean; turmaId: number; disciplinaId: number }) => ({
  nome: data.nome,
  matriculado: data.matriculado,
  turma_id: data.turmaId,
  disciplina_id: data.disciplinaId,
});

export const toUpdateAlunoPayload = toCreateAlunoPayload;

export default api;

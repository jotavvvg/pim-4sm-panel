export interface Disciplina {
  id: number;
  nome: string;
  carga_hora: number;
}

export interface Turma {
  id: number;
  nome: string;
  alunos?: Aluno[];
}

export interface Professor {
  id: number;
  nome: string;
  disciplinaId: number;
  disciplina?: Disciplina;
}

export interface Aluno {
  id: number;
  nome: string;
  matriculado: boolean;
  turmaId: number;
  disciplinaId?: number;
  disciplinaIds?: number[];
  disciplinas?: Disciplina[];
  turma?: Turma;
  disciplina?: Disciplina;
}

export interface DashboardSummary {
  disciplinas: number;
  turmas: number;
  professores: number;
  alunos: number;
}

export interface MetricEntry {
  turma?: string;
  count?: number;
  nome?: string;
  horas?: number;
}

export interface MetricsResponse {
  totalAlunos: number;
  totalProfessores: number;
  alunosPorTurma: MetricEntry[];
  cargaHorariaPorDisciplina: MetricEntry[];
}

export interface SearchResponse {
  alunos: Aluno[];
  professores: Professor[];
  disciplinas: Disciplina[];
  turmas: Turma[];
}

import { z } from 'zod';
export const disciplinaSchema = z.object({
    id: z.number().int().positive().optional(),
    nome: z.string().min(1).max(255),
    carga_hora: z.number().int().positive(),
});
export const turmaSchema = z.object({
    id: z.number().int().positive().optional(),
    nome: z.string().min(1).max(1),
});
export const professorSchema = z.object({
    id: z.number().int().positive().optional(),
    nome: z.string().min(1).max(255),
    disciplina_id: z.number().int().positive(),
});
export const alunoSchema = z.object({
    id: z.number().int().positive().optional(),
    nome: z.string().min(1).max(255),
    matriculado: z.boolean().default(true),
    turma_id: z.number().int().positive(),
    disciplina_id: z.number().int().positive().optional(),
    disciplina_ids: z.array(z.number().int().positive()).min(1).optional(),
});
export const createDisciplinaSchema = disciplinaSchema.omit({ id: true });
export const createTurmaSchema = turmaSchema.omit({ id: true });
export const createProfessorSchema = professorSchema.omit({ id: true });
export const createAlunoSchema = z.object({
    nome: alunoSchema.shape.nome,
    matriculado: alunoSchema.shape.matriculado,
    turma_id: alunoSchema.shape.turma_id,
    disciplina_id: alunoSchema.shape.disciplina_id,
    disciplina_ids: alunoSchema.shape.disciplina_ids,
});
export const updateDisciplinaSchema = createDisciplinaSchema.partial();
export const updateTurmaSchema = createTurmaSchema.partial();
export const updateProfessorSchema = createProfessorSchema.partial();
export const updateAlunoSchema = createAlunoSchema.partial();
export const validateAlunoDisciplines = (payload) => {
    const hasSelectedDiscipline = payload.disciplina_id !== undefined || (payload.disciplina_ids && payload.disciplina_ids.length > 0);
    if (!hasSelectedDiscipline) {
        throw new Error('A student must include at least one discipline id.');
    }
};

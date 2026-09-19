import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { alunoDisciplinas, alunos, disciplinas, turmas } from '../db/schema.js';

const normalizeDisciplinaIds = (value?: number | number[]) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'number') return [value];
  return [];
};

const buildAlunoResponse = async (aluno: typeof alunos.$inferSelect) => {
  const turma = await db.select().from(turmas).where(eq(turmas.id, aluno.turmaId)).then((rows) => rows[0] ?? null);

  const disciplineRows = await db
    .select({
      id: disciplinas.id,
      nome: disciplinas.nome,
      carga_hora: disciplinas.carga_hora,
    })
    .from(alunoDisciplinas)
    .innerJoin(disciplinas, eq(alunoDisciplinas.disciplinaId, disciplinas.id))
    .where(eq(alunoDisciplinas.alunoId, aluno.id));

  return {
    id: aluno.id,
    nome: aluno.nome,
    matriculado: aluno.matriculado,
    turma_id: aluno.turmaId,
    turma: turma ? { id: turma.id, nome: turma.nome } : null,
    disciplinas: disciplineRows,
  };
};

export const alunosService = {
  async list() {
    const allAlunos = await db.select().from(alunos);
    return Promise.all(allAlunos.map((aluno) => buildAlunoResponse(aluno)));
  },

  async findById(id: number) {
    const [aluno] = await db.select().from(alunos).where(eq(alunos.id, id));
    if (!aluno) return null;
    return buildAlunoResponse(aluno);
  },

  async create(data: { nome: string; matriculado: boolean; turmaId: number; disciplinaIds: number[] }) {
    const [result] = await db.insert(alunos).values({
      nome: data.nome,
      matriculado: data.matriculado,
      turmaId: data.turmaId,
    });

    const alunoId = Number(result.insertId);
    const disciplineIds = [...new Set(data.disciplinaIds)];

    if (disciplineIds.length > 0) {
      await db.insert(alunoDisciplinas).values(
        disciplineIds.map((disciplinaId) => ({
          alunoId,
          disciplinaId,
        })),
      );
    }

    return this.findById(alunoId);
  },

  async update(
    id: number,
    data: Partial<{ nome: string; matriculado: boolean; turmaId: number; disciplinaIds: number[]; disciplinaId: number }>,
  ) {
    if (data.nome !== undefined || data.matriculado !== undefined || data.turmaId !== undefined) {
      await db.update(alunos)
        .set({
          ...(data.nome !== undefined ? { nome: data.nome } : {}),
          ...(data.matriculado !== undefined ? { matriculado: data.matriculado } : {}),
          ...(data.turmaId !== undefined ? { turmaId: data.turmaId } : {}),
        })
        .where(eq(alunos.id, id));
    }

    if (data.disciplinaIds !== undefined || data.disciplinaId !== undefined) {
      const nextIds = normalizeDisciplinaIds(data.disciplinaIds ?? data.disciplinaId);
      await db.delete(alunoDisciplinas).where(eq(alunoDisciplinas.alunoId, id));

      if (nextIds.length > 0) {
        await db.insert(alunoDisciplinas).values(
          nextIds.map((disciplinaId) => ({
            alunoId: id,
            disciplinaId,
          })),
        );
      }
    }

    return this.findById(id);
  },

  async remove(id: number) {
    await db.delete(alunoDisciplinas).where(eq(alunoDisciplinas.alunoId, id));
    const [result] = await db.delete(alunos).where(eq(alunos.id, id));
    return (result.affectedRows ?? 0) > 0;
  },
};

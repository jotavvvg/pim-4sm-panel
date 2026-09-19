import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { alunos } from '../db/schema.js';

export const alunosService = {
  async list() {
    return db.query.alunos.findMany({
      with: {
        turma: true,
        disciplina: true,
      },
    });
  },

  async findById(id: number) {
    return db.query.alunos.findFirst({
      where: (a, { eq }) => eq(a.id, id),
      with: {
        turma: true,
        disciplina: true,
      },
    });
  },

  async create(data: { nome: string; matriculado: boolean; turmaId: number; disciplinaId: number }) {
    const [result] = await db.insert(alunos).values(data);
    return result.insertId ? { id: Number(result.insertId), ...data } : null;
  },

  async update(
    id: number,
    data: Partial<{ nome: string; matriculado: boolean; turmaId: number; disciplinaId: number }>,
  ) {
    const [result] = await db.update(alunos).set(data).where(eq(alunos.id, id));

    if ((result.affectedRows ?? 0) === 0) {
      return null;
    }

    return this.findById(id);
  },

  async remove(id: number) {
    const [result] = await db.delete(alunos).where(eq(alunos.id, id));
    return (result.affectedRows ?? 0) > 0;
  },
};

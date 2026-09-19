import { db } from '../db/index.js';
import { alunos, disciplinas, professores, turmas } from '../db/schema.js';
import { asc, count, eq, sql } from 'drizzle-orm';

export const metricsService = {
  async getMetrics() {
    const [totalAlunosResult] = await db.select({ count: count() }).from(alunos);
    const [totalProfessoresResult] = await db.select({ count: count() }).from(professores);

    const alunosPorTurma = await db
      .select({
        turma: turmas.nome,
        count: count(alunos.id),
      })
      .from(alunos)
      .leftJoin(turmas, eq(alunos.turmaId, turmas.id))
      .groupBy(turmas.nome)
      .orderBy(asc(turmas.nome));

    const cargaHorariaPorDisciplina = await db
      .select({
        nome: disciplinas.nome,
        horas: sql<number>`sum(${disciplinas.carga_hora})`.as('horas'),
      })
      .from(disciplinas)
      .groupBy(disciplinas.id, disciplinas.nome)
      .orderBy(asc(disciplinas.nome));

    return {
      totalAlunos: Number(totalAlunosResult?.count ?? 0),
      totalProfessores: Number(totalProfessoresResult?.count ?? 0),
      alunosPorTurma: alunosPorTurma.map((item) => ({
        turma: item.turma ?? 'Sem turma',
        count: Number(item.count),
      })),
      cargaHorariaPorDisciplina: cargaHorariaPorDisciplina.map((item) => ({
        nome: item.nome,
        horas: Number(item.horas ?? 0),
      })),
    };
  },
};

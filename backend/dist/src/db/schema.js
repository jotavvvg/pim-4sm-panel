import { mysqlTable, int, varchar, boolean } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
export const disciplinas = mysqlTable('disciplina', {
    id: int('id').primaryKey().autoincrement(),
    nome: varchar('nome', { length: 255 }).notNull(),
    carga_hora: int('carga_hora').notNull(),
});
export const turmas = mysqlTable('turma', {
    id: int('id').primaryKey().autoincrement(),
    nome: varchar('nome', { length: 1 }).notNull(),
});
export const professores = mysqlTable('professor', {
    id: int('id').primaryKey().autoincrement(),
    nome: varchar('nome', { length: 255 }).notNull(),
    disciplinaId: int('disciplina_id').references(() => disciplinas.id).notNull(),
});
export const alunos = mysqlTable('aluno', {
    id: int('id').primaryKey().autoincrement(),
    nome: varchar('nome', { length: 255 }).notNull(),
    matriculado: boolean('matriculado').default(true).notNull(),
    turmaId: int('turma_id').references(() => turmas.id).notNull(),
    disciplinaId: int('disciplina_id').references(() => disciplinas.id).notNull(),
});
export const turmasRelations = relations(turmas, ({ many }) => ({
    alunos: many(alunos),
}));
export const alunosRelations = relations(alunos, ({ one }) => ({
    turma: one(turmas, {
        fields: [alunos.turmaId],
        references: [turmas.id],
    }),
    disciplina: one(disciplinas, {
        fields: [alunos.disciplinaId],
        references: [disciplinas.id],
    }),
}));
export const professoresRelations = relations(professores, ({ one }) => ({
    disciplina: one(disciplinas, {
        fields: [professores.disciplinaId],
        references: [disciplinas.id],
    }),
}));

import { createConnection } from 'mysql2/promise';

const runSeed = async () => {
  const connection = await createConnection({
    host: 'localhost',
    user: 'root',
    database: 'academico_db',
    port: 3306,
  });

  await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
  await connection.execute('DELETE FROM aluno');
  await connection.execute('DELETE FROM professor');
  await connection.execute('DELETE FROM disciplina');
  await connection.execute('DELETE FROM turma');
  await connection.execute('SET FOREIGN_KEY_CHECKS = 1');

  const [turmaResult] = await connection.execute(
    'INSERT INTO turma (nome) VALUES ("A"), ("B")',
  );

  const [disciplinaResult] = await connection.execute(
    'INSERT INTO disciplina (nome, carga_hora) VALUES ("Matemática", 80), ("História", 60), ("Programação", 120)',
  );

  const professorRows = [
    { nome: 'Prof. Ana Silva', disciplina_id: 1 },
    { nome: 'Prof. Carlos Rocha', disciplina_id: 2 },
    { nome: 'Prof. Bruna Costa', disciplina_id: 3 },
  ];

  for (const professor of professorRows) {
    await connection.execute(
      'INSERT INTO professor (nome, disciplina_id) VALUES (?, ?)',
      [professor.nome, professor.disciplina_id],
    );
  }

  const alunos = [
    { nome: 'Maria Souza', matriculado: true, turma_id: 1, disciplina_id: 1 },
    { nome: 'João Pereira', matriculado: true, turma_id: 1, disciplina_id: 1 },
    { nome: 'Lúcia Almeida', matriculado: false, turma_id: 2, disciplina_id: 2 },
    { nome: 'Pedro Martins', matriculado: true, turma_id: 2, disciplina_id: 3 },
    { nome: 'Fernanda Costa', matriculado: true, turma_id: 1, disciplina_id: 3 },
  ];

  for (const aluno of alunos) {
    await connection.execute(
      'INSERT INTO aluno (nome, matriculado, turma_id, disciplina_id) VALUES (?, ?, ?, ?)',
      [aluno.nome, aluno.matriculado ? 1 : 0, aluno.turma_id, aluno.disciplina_id],
    );
  }

  console.log('Seed complete.');
  console.log('Turmas inserted:', turmaResult);
  console.log('Disciplinas inserted:', disciplinaResult);
  await connection.end();
};

runSeed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});

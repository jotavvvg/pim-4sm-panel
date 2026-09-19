import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { serializerCompiler, validatorCompiler, jsonSchemaTransform } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { db } from './db/index.js';
import { disciplinas, professores, turmas, alunos } from './db/schema.js';
import { disciplinasService } from './services/disciplinas.js';
import { turmasService } from './services/turmas.js';
import { professoresService } from './services/professores.js';
import { alunosService } from './services/alunos.js';
import { searchService } from './services/search.js';
import { metricsService } from './services/metrics.js';
import {
  createDisciplinaSchema,
  createTurmaSchema,
  createProfessorSchema,
  createAlunoSchema,
  updateDisciplinaSchema,
  updateTurmaSchema,
  updateProfessorSchema,
  updateAlunoSchema,
} from './schemas/index.js';

const app = Fastify({
  logger: true,
});

await app.register(cors, {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.get('/health', async () => ({ status: 'ok' }));

app.post('/api/disciplinas', {
  schema: {
    body: createDisciplinaSchema,
  },
}, async (request, reply) => {
  const payload = request.body as z.infer<typeof createDisciplinaSchema>;
  const item = await disciplinasService.create(payload);
  return reply.code(201).send(item);
});

app.get('/api/disciplinas', async () => disciplinasService.list());

app.get('/api/disciplinas/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const item = await disciplinasService.findById(Number(id));
  if (!item) return reply.code(404).send({ message: 'Disciplina not found' });
  return item;
});

app.put('/api/disciplinas/:id', {
  schema: { body: updateDisciplinaSchema },
}, async (request, reply) => {
  const { id } = request.params as { id: string };
  const item = await disciplinasService.update(Number(id), request.body as z.infer<typeof updateDisciplinaSchema>);
  if (!item) return reply.code(404).send({ message: 'Disciplina not found' });
  return item;
});

app.delete('/api/disciplinas/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const removed = await disciplinasService.remove(Number(id));
  if (!removed) return reply.code(404).send({ message: 'Disciplina not found' });
  return reply.code(204).send();
});

app.post('/api/turmas', {
  schema: { body: createTurmaSchema },
}, async (request, reply) => {
  const payload = request.body as z.infer<typeof createTurmaSchema>;
  const item = await turmasService.create(payload);
  return reply.code(201).send(item);
});

app.get('/api/turmas', async () => turmasService.list());

app.get('/api/turmas/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const item = await turmasService.findById(Number(id));
  if (!item) return reply.code(404).send({ message: 'Turma not found' });
  return item;
});

app.put('/api/turmas/:id', {
  schema: { body: updateTurmaSchema },
}, async (request, reply) => {
  const { id } = request.params as { id: string };
  const item = await turmasService.update(Number(id), request.body as z.infer<typeof updateTurmaSchema>);
  if (!item) return reply.code(404).send({ message: 'Turma not found' });
  return item;
});

app.delete('/api/turmas/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const removed = await turmasService.remove(Number(id));
  if (!removed) return reply.code(404).send({ message: 'Turma not found' });
  return reply.code(204).send();
});

app.post('/api/professores', {
  schema: { body: createProfessorSchema },
}, async (request, reply) => {
  const payload = request.body as z.infer<typeof createProfessorSchema>;
  const item = await professoresService.create({
    nome: payload.nome,
    disciplinaId: payload.disciplina_id,
  });
  return reply.code(201).send(item);
});

app.get('/api/professores', async () => professoresService.list());

app.get('/api/professores/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const item = await professoresService.findById(Number(id));
  if (!item) return reply.code(404).send({ message: 'Professor not found' });
  return item;
});

app.put('/api/professores/:id', {
  schema: { body: updateProfessorSchema },
}, async (request, reply) => {
  const { id } = request.params as { id: string };
  const payload = request.body as z.infer<typeof updateProfessorSchema>;
  const item = await professoresService.update(Number(id), {
    ...(payload.nome ? { nome: payload.nome } : {}),
    ...(payload.disciplina_id ? { disciplinaId: payload.disciplina_id } : {}),
  });
  if (!item) return reply.code(404).send({ message: 'Professor not found' });
  return item;
});

app.delete('/api/professores/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const removed = await professoresService.remove(Number(id));
  if (!removed) return reply.code(404).send({ message: 'Professor not found' });
  return reply.code(204).send();
});

app.post('/api/alunos', {
  schema: { body: createAlunoSchema },
}, async (request, reply) => {
  const payload = request.body as z.infer<typeof createAlunoSchema>;
  const disciplinaIds = payload.disciplina_ids ?? (payload.disciplina_id ? [payload.disciplina_id] : []);

  const item = await alunosService.create({
    nome: payload.nome,
    matriculado: payload.matriculado,
    turmaId: payload.turma_id,
    disciplinaIds,
  });
  return reply.code(201).send(item);
});

app.get('/api/alunos', async () => alunosService.list());

app.get('/api/alunos/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const item = await alunosService.findById(Number(id));
  if (!item) return reply.code(404).send({ message: 'Aluno not found' });
  return item;
});

app.get('/api/search', async (request, reply) => {
  const query = (request.query as { q?: string })?.q ?? '';
  const results = await searchService.search(query);
  return reply.send(results);
});

app.get('/api/metrics', async () => metricsService.getMetrics());

app.put('/api/alunos/:id', {
  schema: { body: updateAlunoSchema },
}, async (request, reply) => {
  const { id } = request.params as { id: string };
  const payload = request.body as z.infer<typeof updateAlunoSchema>;
  const disciplinaIds = payload.disciplina_ids ?? (payload.disciplina_id ? [payload.disciplina_id] : undefined);

  const item = await alunosService.update(Number(id), {
    ...(payload.nome ? { nome: payload.nome } : {}),
    ...(payload.matriculado !== undefined ? { matriculado: payload.matriculado } : {}),
    ...(payload.turma_id ? { turmaId: payload.turma_id } : {}),
    ...(disciplinaIds ? { disciplinaIds } : {}),
  });
  if (!item) return reply.code(404).send({ message: 'Aluno not found' });
  return item;
});

app.delete('/api/alunos/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const removed = await alunosService.remove(Number(id));
  if (!removed) return reply.code(404).send({ message: 'Aluno not found' });
  return reply.code(204).send();
});

const start = async () => {
  try {
    const port = Number(process.env.PORT ?? 3000);
    await app.listen({ port, host: '0.0.0.0' });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

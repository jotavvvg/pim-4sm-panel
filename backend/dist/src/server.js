import 'dotenv/config';
import Fastify from 'fastify';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { disciplinasService } from './services/disciplinas.js';
import { turmasService } from './services/turmas.js';
import { professoresService } from './services/professores.js';
import { alunosService } from './services/alunos.js';
import { createDisciplinaSchema, createTurmaSchema, createProfessorSchema, createAlunoSchema, updateDisciplinaSchema, updateTurmaSchema, updateProfessorSchema, updateAlunoSchema, } from './schemas/index.js';
const app = Fastify({
    logger: true,
});
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.get('/health', async () => ({ status: 'ok' }));
app.post('/api/disciplinas', {
    schema: {
        body: createDisciplinaSchema,
    },
}, async (request, reply) => {
    const payload = request.body;
    const item = await disciplinasService.create(payload);
    return reply.code(201).send(item);
});
app.get('/api/disciplinas', async () => disciplinasService.list());
app.get('/api/disciplinas/:id', async (request, reply) => {
    const { id } = request.params;
    const item = await disciplinasService.findById(Number(id));
    if (!item)
        return reply.code(404).send({ message: 'Disciplina not found' });
    return item;
});
app.put('/api/disciplinas/:id', {
    schema: { body: updateDisciplinaSchema },
}, async (request, reply) => {
    const { id } = request.params;
    const item = await disciplinasService.update(Number(id), request.body);
    if (!item)
        return reply.code(404).send({ message: 'Disciplina not found' });
    return item;
});
app.delete('/api/disciplinas/:id', async (request, reply) => {
    const { id } = request.params;
    const removed = await disciplinasService.remove(Number(id));
    if (!removed)
        return reply.code(404).send({ message: 'Disciplina not found' });
    return reply.code(204).send();
});
app.post('/api/turmas', {
    schema: { body: createTurmaSchema },
}, async (request, reply) => {
    const payload = request.body;
    const item = await turmasService.create(payload);
    return reply.code(201).send(item);
});
app.get('/api/turmas', async () => turmasService.list());
app.get('/api/turmas/:id', async (request, reply) => {
    const { id } = request.params;
    const item = await turmasService.findById(Number(id));
    if (!item)
        return reply.code(404).send({ message: 'Turma not found' });
    return item;
});
app.put('/api/turmas/:id', {
    schema: { body: updateTurmaSchema },
}, async (request, reply) => {
    const { id } = request.params;
    const item = await turmasService.update(Number(id), request.body);
    if (!item)
        return reply.code(404).send({ message: 'Turma not found' });
    return item;
});
app.delete('/api/turmas/:id', async (request, reply) => {
    const { id } = request.params;
    const removed = await turmasService.remove(Number(id));
    if (!removed)
        return reply.code(404).send({ message: 'Turma not found' });
    return reply.code(204).send();
});
app.post('/api/professores', {
    schema: { body: createProfessorSchema },
}, async (request, reply) => {
    const payload = request.body;
    const item = await professoresService.create({
        nome: payload.nome,
        disciplinaId: payload.disciplina_id,
    });
    return reply.code(201).send(item);
});
app.get('/api/professores', async () => professoresService.list());
app.get('/api/professores/:id', async (request, reply) => {
    const { id } = request.params;
    const item = await professoresService.findById(Number(id));
    if (!item)
        return reply.code(404).send({ message: 'Professor not found' });
    return item;
});
app.put('/api/professores/:id', {
    schema: { body: updateProfessorSchema },
}, async (request, reply) => {
    const { id } = request.params;
    const payload = request.body;
    const item = await professoresService.update(Number(id), {
        ...(payload.nome ? { nome: payload.nome } : {}),
        ...(payload.disciplina_id ? { disciplinaId: payload.disciplina_id } : {}),
    });
    if (!item)
        return reply.code(404).send({ message: 'Professor not found' });
    return item;
});
app.delete('/api/professores/:id', async (request, reply) => {
    const { id } = request.params;
    const removed = await professoresService.remove(Number(id));
    if (!removed)
        return reply.code(404).send({ message: 'Professor not found' });
    return reply.code(204).send();
});
app.post('/api/alunos', {
    schema: { body: createAlunoSchema },
}, async (request, reply) => {
    const payload = request.body;
    const item = await alunosService.create({
        nome: payload.nome,
        matriculado: payload.matriculado,
        turmaId: payload.turma_id,
        disciplinaId: payload.disciplina_id,
    });
    return reply.code(201).send(item);
});
app.get('/api/alunos', async () => alunosService.list());
app.get('/api/alunos/:id', async (request, reply) => {
    const { id } = request.params;
    const item = await alunosService.findById(Number(id));
    if (!item)
        return reply.code(404).send({ message: 'Aluno not found' });
    return item;
});
app.put('/api/alunos/:id', {
    schema: { body: updateAlunoSchema },
}, async (request, reply) => {
    const { id } = request.params;
    const payload = request.body;
    const item = await alunosService.update(Number(id), {
        ...(payload.nome ? { nome: payload.nome } : {}),
        ...(payload.matriculado !== undefined ? { matriculado: payload.matriculado } : {}),
        ...(payload.turma_id ? { turmaId: payload.turma_id } : {}),
        ...(payload.disciplina_id ? { disciplinaId: payload.disciplina_id } : {}),
    });
    if (!item)
        return reply.code(404).send({ message: 'Aluno not found' });
    return item;
});
app.delete('/api/alunos/:id', async (request, reply) => {
    const { id } = request.params;
    const removed = await alunosService.remove(Number(id));
    if (!removed)
        return reply.code(404).send({ message: 'Aluno not found' });
    return reply.code(204).send();
});
const start = async () => {
    try {
        const port = Number(process.env.PORT ?? 3000);
        await app.listen({ port, host: '0.0.0.0' });
    }
    catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};
start();

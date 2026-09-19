import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { professores } from '../db/schema.js';
export const professoresService = {
    async list() {
        return db.query.professores.findMany({
            with: {
                disciplina: true,
            },
        });
    },
    async findById(id) {
        return db.query.professores.findFirst({
            where: (p, { eq }) => eq(p.id, id),
            with: {
                disciplina: true,
            },
        });
    },
    async create(data) {
        const [result] = await db.insert(professores).values(data);
        return result.insertId ? { id: Number(result.insertId), ...data } : null;
    },
    async update(id, data) {
        const [result] = await db.update(professores).set(data).where(eq(professores.id, id));
        if ((result.affectedRows ?? 0) === 0) {
            return null;
        }
        return this.findById(id);
    },
    async remove(id) {
        const [result] = await db.delete(professores).where(eq(professores.id, id));
        return (result.affectedRows ?? 0) > 0;
    },
};

import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, Cell, PieChart, Pie, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';

import { EmptyState } from '@/components/EmptyState';
import { fetchMetrics } from '@/lib/api';
import type { MetricsResponse } from '@/types/entities';

const summaryCards = [
  { key: 'totalAlunos', label: 'Total de alunos', accent: 'purple' },
  { key: 'totalProfessores', label: 'Total de professores', accent: 'blue' },
  { key: 'totalTurmas', label: 'Total de turmas', accent: 'green' },
  { key: 'totalDisciplinas', label: 'Total de disciplinas', accent: 'amber' },
] as const;

const chartColors = ['#8b5cf6', '#a78bfa', '#60a5fa', '#c084fc', '#818cf8'];

export function DashboardPage() {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    fetchMetrics()
      .then((data) => {
        if (mounted) {
          setMetrics(data);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const dashboardSummary = useMemo(() => {
    if (!metrics) {
      return null;
    }

    return {
      totalAlunos: metrics.totalAlunos,
      totalProfessores: metrics.totalProfessores,
      totalTurmas: metrics.alunosPorTurma.length,
      totalDisciplinas: metrics.cargaHorariaPorDisciplina.length,
    };
  }, [metrics]);

  if (loading) {
    return (
      <section className="page-section">
        <div className="page-header">
          <div>
            <p className="eyebrow">Visão geral</p>
            <h3>Dashboard acadêmico</h3>
          </div>
        </div>
        <div className="stats-grid">
          {summaryCards.map((card) => (
            <div key={card.key} className={`stat-card ${card.accent}`}>
              <span>{card.label}</span>
              <div className="skeleton-box" style={{ width: '52%', height: '26px' }} />
            </div>
          ))}
        </div>
        <div className="chart-grid">
          <div className="chart-panel"><div className="skeleton-box" style={{ height: '280px' }} /></div>
          <div className="chart-panel"><div className="skeleton-box" style={{ height: '280px' }} /></div>
        </div>
      </section>
    );
  }

  if (!metrics || !dashboardSummary) {
    return (
      <EmptyState
        title="Dashboard indisponível"
        description="Não foi possível carregar as métricas do sistema no momento."
      />
    );
  }

  const pieData = metrics.cargaHorariaPorDisciplina.map((item, index) => ({
    name: item.nome ?? 'Disciplina',
    value: item.horas ?? 0,
    fill: chartColors[index % chartColors.length],
  }));

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <p className="eyebrow">Visão geral</p>
          <h3>Dashboard acadêmico</h3>
        </div>
      </div>

      <div className="stats-grid">
        {summaryCards.map((card) => (
          <article key={card.key} className={`stat-card ${card.accent}`}>
            <span>{card.label}</span>
            <strong>{dashboardSummary[card.key as keyof typeof dashboardSummary]}</strong>
          </article>
        ))}
      </div>

      <div className="chart-grid">
        <div className="chart-panel">
          <h4>Alunos por turma</h4>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={metrics.alunosPorTurma}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="turma" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
              <YAxis tick={{ fill: '#cbd5e1', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: '#0f172a',
                  border: '1px solid rgba(148, 163, 184, 0.18)',
                  borderRadius: 12,
                  color: '#f8fafc',
                }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-panel">
          <h4>Carga horária por disciplina</h4>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={2}>
                {pieData.map((entry, index) => (
                  <Cell key={`${entry.name}-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${Number(value ?? 0)}h`, 'Carga']}
                contentStyle={{
                  background: '#0f172a',
                  border: '1px solid rgba(148, 163, 184, 0.18)',
                  borderRadius: 12,
                  color: '#f8fafc',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import './App.css';
import { DashboardLayout } from '@/components/Layout';
import { AlunosPage } from '@/pages/AlunosPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { DisciplinasPage } from '@/pages/DisciplinasPage';
import { ProfessoresPage } from '@/pages/ProfessoresPage';
import { TurmasPage } from '@/pages/TurmasPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/disciplinas" element={<DisciplinasPage />} />
          <Route path="/turmas" element={<TurmasPage />} />
          <Route path="/professores" element={<ProfessoresPage />} />
          <Route path="/alunos" element={<AlunosPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

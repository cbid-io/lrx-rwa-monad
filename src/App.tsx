import { Navigate, Route, Routes } from 'react-router-dom';
import { LayoutShell } from '@/components/LayoutShell';
import { DetailPage } from '@/pages/DetailPage';
import { HomePage } from '@/pages/HomePage';
import { LeaderboardPage } from '@/pages/LeaderboardPage';
import { DashboardPage } from '@/pages/DashboardPage';

export default function App() {
  return (
    <LayoutShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/art/:id" element={<DetailPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </LayoutShell>
  );
}

import { BrowserRouter, Routes, Route } from 'react-router';
import { Toaster } from '@/components/ui/sonner';
import HomePage from './pages/HomePage';
import DrivePage from './pages/DrivePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/drive" element={<DrivePage />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

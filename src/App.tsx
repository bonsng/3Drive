import { BrowserRouter, Routes, Route } from 'react-router';
import { Toaster } from '@/components/ui/sonner';
import { ModalRenderer } from '@/components/modal/ModalRenderer';
import HomePage from './pages/HomePage';
import DrivePage from './pages/DrivePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/drive" element={<DrivePage />} />
      </Routes>
      <ModalRenderer />
      <Toaster />
    </BrowserRouter>
  );
}

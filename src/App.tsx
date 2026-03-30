import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { Toaster } from '@/components/ui/sonner';
import { ModalRenderer } from '@/components/modal/ModalRenderer';

const HomePage = lazy(() => import('./pages/HomePage'));
const DrivePage = lazy(() => import('./pages/DrivePage'));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/drive" element={<DrivePage />} />
        </Routes>
      </Suspense>
      <ModalRenderer />
      <Toaster />
    </BrowserRouter>
  );
}

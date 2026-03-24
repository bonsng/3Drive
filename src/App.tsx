import { BrowserRouter, Routes, Route } from 'react-router';
import HomePage from './pages/HomePage';
import DrivePage from './pages/DrivePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/drive" element={<DrivePage />} />
      </Routes>
    </BrowserRouter>
  );
}

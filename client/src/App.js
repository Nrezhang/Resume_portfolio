import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ContentProvider } from './content/ContentContext';
import PortfolioLayout from './components/shell/PortfolioLayout';
import HomePage from './pages/HomePage';
import ResumePage from './pages/ResumePage';
import AdminPage from './pages/AdminPage';
import './styles/portfolio.css';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ContentProvider>
        <Routes>
          <Route element={<PortfolioLayout />}>
            <Route index element={<HomePage />} />
            <Route path="resume" element={<ResumePage />} />
            <Route path=":section" element={<HomePage />} />
          </Route>
          <Route path="admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ContentProvider>
    </BrowserRouter>
  );
}

export default App;

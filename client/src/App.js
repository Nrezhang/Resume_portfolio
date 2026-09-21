import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import { ContentProvider } from './content/ContentContext';
import { ChatProvider } from './components/chat/ChatContext';
import PortfolioLayout from './components/shell/PortfolioLayout';
import HomePage from './pages/HomePage';
import ResumePage from './pages/ResumePage';
import './styles/portfolio.css';
import './styles/chat.css';
import './styles/settings.css';

const PortfolioContentPage = lazy(() => import('./pages/PortfolioContentPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
function App() {
  return <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><MotionConfig reducedMotion="user"><ContentProvider><ChatProvider><Suspense fallback={<p className="chat-loading" role="status">Loading portfolio…</p>}><Routes>
    <Route element={<PortfolioLayout />}>
      <Route index element={<HomePage />} />
      <Route path="chat/:chatId" element={<HomePage />} />
      <Route path="resume" element={<ResumePage />} />
      <Route path="profile" element={<PortfolioContentPage section="profile" />} />
      <Route path="about" element={<Navigate to="/profile" replace />} />
      <Route path="projects" element={<PortfolioContentPage section="projects" />} />
      <Route path="projects/:projectId" element={<PortfolioContentPage section="projects" />} />
      <Route path="experience" element={<PortfolioContentPage section="experience" />} />
      <Route path="education" element={<PortfolioContentPage section="education" />} />
      <Route path="skills" element={<PortfolioContentPage section="skills" />} />
      <Route path="contact" element={<PortfolioContentPage section="contact" />} />
      <Route path="admin" element={<AdminPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></Suspense></ChatProvider></ContentProvider></MotionConfig></BrowserRouter>;
}
export default App;

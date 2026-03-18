import { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar/Navbar';
import AuthModal from './components/AuthModal/AuthModal';
import Forum from './pages/Forum/Forum';
import ChatPage from './pages/ChatPage/ChatPage';
import ResourcesPage from './pages/ResourcesPage/ResourcesPage';
import Settings from './pages/Settings/Settings';
import Admin from './pages/Admin/Admin';
import { useAuth } from './context/AuthContext';
import './index.css';

function AppContent() {
  const [page, setPage] = useState('forum');
  const [showAuth, setShowAuth] = useState(false);
  const { user } = useAuth();

  const renderPage = () => {
    switch (page) {
      case 'forum':     return <Forum onNavigateChat={() => setPage('chat')} />;
      case 'chat':      return <ChatPage onShowAuth={() => setShowAuth(true)} />;
      case 'resources': return <ResourcesPage />;
      case 'settings':  return <Settings />;
      case 'admin':     return <Admin />;
      default:          return <Forum onNavigateChat={() => setPage('chat')} />;
    }
  };

  return (
    <div>
      <Navbar
        activePage={page}
        onNavigate={setPage}
        onShowAuth={() => setShowAuth(true)}
        isAdmin={user?.role === 'admin'}
      />
      <main>{renderPage()}</main>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}

function AppWithAuth() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

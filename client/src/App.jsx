import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { AuthPage } from './pages/AuthPage';
import { WorkspaceView } from './pages/WorkspaceView';

const MainRouter = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 text-slate-900 dark:text-white space-y-4 transition-colors">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading SyncSpace...</p>
      </div>
    );
  }

  return user ? <WorkspaceView /> : <AuthPage />;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <MainRouter />
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}



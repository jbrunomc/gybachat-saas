import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import PWAInstallPrompt from '../ui/PWAInstallPrompt';
import PWAStatus from '../ui/PWAStatus';
import AgentDashboard from './AgentDashboard';
import AdminDashboard from './AdminDashboard';

const ClientDashboard: React.FC = () => {
  const { isAdminOrSupervisor } = useAuthStore();

  const renderDashboard = () => {
    // Renderizar dashboard específico baseado no role do usuário
    if (isAdminOrSupervisor()) {
      return <AdminDashboard />;
    } else {
      return <AgentDashboard />;
    }
  };

  return (
    <div>
      <PWAInstallPrompt />
      <PWAStatus />
      {renderDashboard()}
    </div>
  );
};

export default ClientDashboard;
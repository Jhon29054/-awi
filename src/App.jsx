import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/pages/Dashboard";
import Medicamentos from "@/pages/Medicamentos";
import Recordatorios from "@/pages/Recordatorios";
import Inventario from "@/pages/Inventario";
import Interacciones from "@/pages/Interacciones";
import Historial from "@/pages/Historial";
import SettingsPage from "@/pages/SettingsPage"; 
import MedicamentoForm from "@/components/MedicamentoForm";
import RecordatorioForm from "@/components/RecordatorioForm";
import WelcomePage from "@/pages/WelcomePage";
import AdminDashboard from "@/pages/AdminDashboard";
import { requestNotificationPermission } from "@/lib/notification";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { getCurrentUser, logoutUser } from "@/lib/auth";
import { useTheme } from "@/contexts/ThemeProvider";
import { Bell } from 'lucide-react';
import { getRecordatorios } from "@/lib/storage";
import { isToday, isFuture, parseISO } from "date-fns";
import { subscribeUserToPush } from "@/lib/notification";


function App() {
  const { toast } = useToast();
  const { theme } = useTheme(); 
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMedicamentoFormOpen, setIsMedicamentoFormOpen] = useState(false);
  const [currentMedicamentoForForm, setCurrentMedicamentoForForm] = useState(null);
  const [isRecordatorioFormOpen, setIsRecordatorioFormOpen] = useState(false);
  const [currentRecordatorioForForm, setCurrentRecordatorioForForm] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [refreshClientDataTrigger, setRefreshClientDataTrigger] = useState(0);
  const [pendingRecordatoriosCount, setPendingRecordatoriosCount] = useState(0);

  useEffect(() => {
    if (currentUser?.role === 'cliente' && currentUser?.id) {
      const allRecordatorios = getRecordatorios(currentUser.id);
      const pending = allRecordatorios.filter(r => 
        !r.tomado && (isToday(parseISO(r.fechaHora)) || isFuture(parseISO(r.fechaHora)))
      );
      setPendingRecordatoriosCount(pending.length);
    }
  }, [currentUser, refreshClientDataTrigger]);

  useEffect(() => {
    document.body.className = theme; 
  }, [theme]);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      if (user.role === "cliente") {
        const notificacionesPermitidas = requestNotificationPermission();
        if (!notificacionesPermitidas && Notification.permission !== "denied" && Notification.permission !== "granted") {
          toast({
            title: "Permiso de Notificaciones",
            description: "Habilita las notificaciones para recibir recordatorios de medicación.",
            duration: 7000,
            action: <Button onClick={() => Notification.requestPermission()}>Permitir</Button>
          });
        } else if (notificacionesPermitidas) {
          // Si ya hay permiso, intentar suscribir al usuario a push
          subscribeUserToPush().then(subscription => {
            if (subscription) {
              console.log('Suscripción push exitosa en App.jsx:', subscription);
              // TODO: Aquí debes enviar 'subscription' al backend
            }
          });
        } else if (Notification.permission === "granted") {
           // Si el permiso fue concedido previamente pero no via requestNotificationPermission (ej. al hacer clic en el toast)
           // También intentar suscribir al usuario a push
            subscribeUserToPush().then(subscription => {
            if (subscription) {
              console.log('Suscripción push exitosa después de conceder permiso:', subscription);
              // TODO: Aquí debes enviar 'subscription' al backend
            }
          });
        }
      }
    }
  }, [toast]);

  const handleLogin = (user) => {
    setCurrentUser(user);
    if (user.role === "cliente") {
      setActiveTab("dashboard");
    } else if (user.role === "admin") {
      setActiveTab("adminDashboard"); 
    }
    setRefreshClientDataTrigger(prev => prev + 1);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setActiveTab("dashboard"); 
    setRefreshClientDataTrigger(prev => prev + 1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const handleOpenMedicamentoForm = (medicamento = null) => {
    setCurrentMedicamentoForForm(medicamento);
    setIsMedicamentoFormOpen(true);
  };

  const handleOpenRecordatorioForm = (recordatorio = null) => {
    setCurrentRecordatorioForForm(recordatorio);
    setIsRecordatorioFormOpen(true);
  };

  const triggerClientDataRefresh = () => {
    setRefreshClientDataTrigger(prev => prev + 1);
  };

  const handleSaveMedicamento = () => {
    triggerClientDataRefresh();
  };

  const handleSaveRecordatorio = () => {
    triggerClientDataRefresh();
  };

  const handleSaveInventario = () => {
    triggerClientDataRefresh();
  };

  const handleBellClick = () => {
    if (pendingRecordatoriosCount === 0) {
      toast({
        title: "Recordatorios",
        description: "No tienes recordatorios pendientes en este momento.",
      });
    } else if (pendingRecordatoriosCount === 1) {
       toast({
        title: "Recordatorio Pendiente",
        description: "Tienes 1 recordatorio de medicamento pendiente.",
      });
    } else {
      toast({
        title: "Recordatorios Pendientes",
        description: `Tienes ${pendingRecordatoriosCount} recordatorios de medicamentos pendientes.`,
      });
    }
  };

  if (!currentUser) {
    return <WelcomePage onLogin={handleLogin} />;
  }
  
  const renderContent = () => {
    if (currentUser.role === "admin") {
      if (activeTab === "settings") {
        return <SettingsPage isAdmin={true} onBack={() => handleTabChange("adminDashboard")} />;
      }
      return <AdminDashboard onTabChange={handleTabChange} />; 
    }

    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            key={`dashboard-${refreshClientDataTrigger}`}
            userId={currentUser.id}
            onTabChange={handleTabChange}
            onAddMedicamento={() => handleOpenMedicamentoForm()}
            onAddRecordatorio={() => handleOpenRecordatorioForm()}
          />
        );
      case "medicamentos":
        return <Medicamentos key={`medicamentos-${refreshClientDataTrigger}`} userId={currentUser.id} />;
      case "recordatorios":
        return <Recordatorios key={`recordatorios-${refreshClientDataTrigger}`} userId={currentUser.id} onRecordatoriosChange={triggerClientDataRefresh} />;
      case "inventario":
        return <Inventario 
                  key={`inventario-${refreshClientDataTrigger}`} 
                  userId={currentUser.id} 
                  onDataChange={handleSaveInventario}
               />;
      case "interacciones":
        return <Interacciones key={`interacciones-${refreshClientDataTrigger}`} userId={currentUser.id} />;
      case "historial":
        return <Historial key={`historial-${refreshClientDataTrigger}`} userId={currentUser.id} />;
      case "settings":
        return <SettingsPage isAdmin={false} />; 
      default:
        return <Dashboard
          key={`default-dashboard-${refreshClientDataTrigger}`}
          userId={currentUser.id}
          onTabChange={handleTabChange}
          onAddMedicamento={() => handleOpenMedicamentoForm()}
          onAddRecordatorio={() => handleOpenRecordatorioForm()}
        />;
    }
  };


  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header 
        onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
        onLogout={handleLogout}
        currentUser={currentUser}
        onSettingsClick={() => handleTabChange("settings")} 
        onBellClick={handleBellClick}
        pendingRecordatoriosCount={pendingRecordatoriosCount}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {currentUser.role === "cliente" && (
          <Sidebar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            isMobileOpen={isMobileMenuOpen}
            onMobileClose={() => setIsMobileMenuOpen(false)}
          />
        )}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="container mx-auto max-w-none pt-16">
            {renderContent()}
          </div>
        </main>
      </div>
      
      {currentUser.role === "cliente" && (
        <>
          <MedicamentoForm
            medicamento={currentMedicamentoForForm}
            isOpen={isMedicamentoFormOpen}
            onClose={() => setIsMedicamentoFormOpen(false)}
            onSave={handleSaveMedicamento}
            userId={currentUser.id}
          />
          <RecordatorioForm
            recordatorio={currentRecordatorioForForm}
            isOpen={isRecordatorioFormOpen}
            onClose={() => setIsRecordatorioFormOpen(false)}
            onSave={handleSaveRecordatorio}
            userId={currentUser.id}
          />
        </>
      )}
      <Toaster />
    </div>
  );
}

export default App;
import React from "react";
import { Button } from "@/components/ui/button";
import { Pill, Clock, Package, AlertTriangle, History, Home, Settings, FolderX as // Importar icono de configuración
  X } from 'lucide-react';
import { motion } from "framer-motion";

const Sidebar = ({ activeTab, onTabChange, isMobileOpen, onMobileClose }) => {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: <Home className="h-5 w-5" /> },
    { id: "medicamentos", label: "Medicamentos", icon: <Pill className="h-5 w-5" /> },
    { id: "recordatorios", label: "Recordatorios", icon: <Clock className="h-5 w-5" /> },
    { id: "inventario", label: "Inventario", icon: <Package className="h-5 w-5" /> },
    { id: "interacciones", label: "Interacciones", icon: <AlertTriangle className="h-5 w-5" /> },
    { id: "historial", label: "Historial", icon: <History className="h-5 w-5" /> },
    { id: "settings", label: "Configuración", icon: <Settings className="h-5 w-5" /> } // Nuevo tab
  ];

  const sidebarContent = (
    <div className="space-y-1.5 py-4">
      {tabs.map(tab => (
        <Button
          key={tab.id}
          variant={activeTab === tab.id ? "default" : "ghost"}
          className={`w-full justify-start text-base py-6 rounded-md ${
            activeTab === tab.id 
              ? "bg-gradient-to-r from-primary to-blue-600 text-white shadow-md hover:shadow-lg" 
              : "hover:bg-primary/5 text-muted-foreground hover:text-primary"
          }`}
          onClick={() => {
            onTabChange(tab.id);
            if (isMobileOpen) onMobileClose();
          }}
        >
          {React.cloneElement(tab.icon, { className: `h-5 w-5 ${activeTab === tab.id ? 'text-white' : ''}` })}
          <span className="ml-3 font-medium">{tab.label}</span>
        </Button>
      ))}
    </div>
  );

  const desktopSidebar = (
    <aside className="hidden md:block w-72 h-[calc(100vh-var(--header-height,65px))] sticky top-[var(--header-height,65px)] border-r bg-background/80 backdrop-blur-sm">
      <div className="p-4">
        {sidebarContent}
      </div>
    </aside>
  );

  const mobileSidebar = (
    <motion.div 
      className={`md:hidden fixed inset-0 z-50 ${isMobileOpen ? "block" : "hidden"}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: isMobileOpen ? 1 : 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onMobileClose}></div>
      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: isMobileOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="absolute left-0 top-0 h-full w-72 bg-background shadow-2xl border-r flex flex-col"
      >
        {/* Contenedor del encabezado fijo en mobile - No necesita sticky aquí */}
        <div className="flex items-center justify-between p-4 border-b bg-background z-10">
           <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-primary to-blue-600 p-2 rounded-md shadow-lg">
              <Pill className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">RecordaMedic</h1>
              <p className="text-xs text-muted-foreground tracking-wider">
                MONITOREO DE MEDICACIÓN
              </p>
            </div>
          </div>
           <Button variant="ghost" size="icon" onClick={onMobileClose} className="rounded-full hover:bg-muted">
            <X className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
        
        {/* Contenedor del contenido desplazable del menú */}
        {/* flex-1 hará que ocupe el espacio restante y overflow-y-auto permitirá el scroll */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-1.5">
            {sidebarContent}
          </div>
        </div>
      </motion.aside>
    </motion.div>
  );

  return (
    <>
      {desktopSidebar}
      {mobileSidebar}
    </>
  );
};

export default Sidebar;

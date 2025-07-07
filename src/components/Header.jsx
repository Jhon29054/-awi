import React from "react";
import { Pill, Bell, Menu, LogOut, UserCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = ({ onMenuToggle, onLogout, currentUser, onSettingsClick, pendingRecordatoriosCount, onBellClick }) => {
  const showBadge = pendingRecordatoriosCount > 0;

  return (
    <header className="fixed top-0 z-30 glass-effect border-b w-full">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <motion.div 
          className="flex items-center gap-2 md:flex"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-gradient-to-r from-primary to-blue-600 p-2 rounded-md shadow-lg">
            <Pill className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">RecordaMedic</h1>
            <p className="text-xs text-muted-foreground tracking-wider">
              {currentUser?.role === 'admin' ? 'PANEL DE ADMINISTRADOR' : 'MONITOREO DE MEDICACIÓN'}
            </p>
          </div>
        </motion.div>
        
        <div className="flex items-center gap-2">
          {currentUser?.role === 'cliente' && (
            <Button 
              variant="ghost" 
              size="icon"
              className="relative rounded-full hover:bg-primary/10 focus-visible:ring-1 focus-visible:ring-primary"
              onClick={onBellClick}
              aria-label={`Tienes ${pendingRecordatoriosCount} recordatorios pendientes`}
            >
              <Bell className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
              {showBadge && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-primary-foreground transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full group-hover:bg-red-600">
                  {pendingRecordatoriosCount > 9 ? '9+' : pendingRecordatoriosCount}
                </span>
              )}
            </Button>
          )}

          {currentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 focus-visible:ring-1 focus-visible:ring-primary">
                  <UserCircle className="h-7 w-7 text-muted-foreground group-hover:text-primary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 mt-2 shadow-xl rounded-lg border-border/70">
                <DropdownMenuLabel className="px-3 py-2.5">
                  <p className="font-semibold text-base text-foreground">{currentUser.username}</p>
                  <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSettingsClick} className="py-2.5 px-3 text-base hover:!bg-primary/10 focus:!bg-primary/10 cursor-pointer">
                  <Settings className="mr-2.5 h-5 w-5 text-muted-foreground" />
                  Configuración
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="py-2.5 px-3 text-base text-destructive hover:!bg-destructive/10 focus:!bg-destructive/10 focus:!text-destructive cursor-pointer">
                  <LogOut className="mr-2.5 h-5 w-5" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {currentUser?.role === 'cliente' && (
            <Button 
              variant="ghost" 
              size="icon"
              className="md:hidden rounded-full hover:bg-primary/10 focus-visible:ring-1 focus-visible:ring-primary"
              onClick={onMenuToggle}
            >
              <Menu className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

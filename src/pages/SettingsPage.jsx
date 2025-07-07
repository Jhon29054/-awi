import React from 'react';
import { useTheme } from '@/contexts/ThemeProvider';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Sun, Moon, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const SettingsPage = ({ onBack, isAdmin }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-8 px-4 md:px-6"
    >
      <Card className="max-w-2xl mx-auto shadow-xl border-t-4 border-primary pt-8">
        <CardHeader className="bg-gradient-to-br from-primary/10 via-background to-background p-6">
          <div className="flex justify-between items-center">
            <CardTitle className="text-3xl font-extrabold gradient-text flex items-center">
              Configuración
            </CardTitle>
            {isAdmin && onBack && (
              <Button variant="outline" onClick={onBack} className="ml-auto">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Dashboard
              </Button>
            )}
          </div>
          <CardDescription className="text-base text-muted-foreground mt-1">
            Personaliza la apariencia de la aplicación.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg shadow-sm bg-muted/20">
            <div className="flex items-center space-x-3">
              {theme === 'light' ? <Sun className="h-6 w-6 text-yellow-500" /> : <Moon className="h-6 w-6 text-blue-400" />}
              <Label htmlFor="theme-switch" className="text-lg font-medium text-foreground">
                Tema de la Aplicación
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium ${theme === 'light' ? 'text-primary' : 'text-muted-foreground'}`}>
                Claro
              </span>
              <Switch
                id="theme-switch"
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
                aria-label="Cambiar tema"
              />
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-primary' : 'text-muted-foreground'}`}>
                Oscuro
              </span>
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground pt-4">
            <p>Tu preferencia de tema se guardará para futuras visitas.</p>
          </div>
        </CardContent>
        {isAdmin && onBack && (
           <CardFooter className="p-6 border-t">
             <Button variant="ghost" onClick={onBack} className="w-full text-muted-foreground hover:text-primary">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Ir al Panel de Administración
             </Button>
           </CardFooter>
        )}
      </Card>
    </motion.div>
  );
};

export default SettingsPage;
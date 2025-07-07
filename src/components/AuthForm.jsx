import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { loginUser, registerUser } from '@/lib/auth';
import { Pill, User, Mail, Lock, Eye, EyeOff, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

const AuthForm = ({ mode, role, isOpen, onClose, onSuccess }) => {
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isRegisterMode = mode === 'register';
  const title = `${isRegisterMode ? 'Crear Cuenta' : 'Iniciar Sesión'} ${role === 'admin' ? 'de Administrador' : 'de Cliente'}`;
  const description = isRegisterMode 
    ? `Regístrate para comenzar a gestionar tu medicación como ${role}.`
    : `Accede a tu panel de ${role}.`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (isRegisterMode && password !== confirmPassword) {
      toast({ title: 'Error', description: 'Las contraseñas no coinciden.', variant: 'destructive' });
      setIsLoading(false);
      return;
    }
    if (isRegisterMode && (!username || !email || !password)) {
      toast({ title: 'Error', description: 'Todos los campos son obligatorios para el registro.', variant: 'destructive' });
      setIsLoading(false);
      return;
    }
    if (!isRegisterMode && (!email || !password)) {
      toast({ title: 'Error', description: 'Correo y contraseña son obligatorios.', variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    try {
      let user;
      if (isRegisterMode) {
        user = registerUser({ username, email, password, role });
        toast({ title: '¡Registro Exitoso!', description: `Bienvenido, ${user.username}. Ahora puedes iniciar sesión.` });
        onSuccess(user); // Podrías hacer login automático o pedir que inicie sesión
      } else {
        user = loginUser({ email, password, role });
        toast({ title: '¡Inicio de Sesión Exitoso!', description: `Bienvenido de nuevo, ${user.username}.` });
        onSuccess(user);
      }
    } catch (error) {
      toast({ title: 'Error de Autenticación', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 shadow-2xl rounded-lg">
        <DialogHeader className="text-center pt-4 flex flex-col items-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="mx-auto mb-4 p-3 bg-gradient-to-br from-primary to-blue-600 rounded-full text-white inline-block"
          >
            {isRegisterMode ? <UserPlus size={32} /> : <Pill size={32} />}
          </motion.div>
          <DialogTitle className={`text-2xl font-bold gradient-text ${role === 'cliente' ? 'text-center' : ''}`}>{title}</DialogTitle>
          <DialogDescription className={`text-muted-foreground ${role === 'cliente' ? 'text-center' : ''}`}>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {isRegisterMode && (
            <div className="space-y-2">
              <Label htmlFor="username">Nombre de Usuario</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="username" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  placeholder="Tu nombre de usuario" 
                  className="pl-10"
                  required 
                />
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="tu@correo.com" 
                className="pl-10"
                required 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••" 
                className="pl-10 pr-10"
                required 
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          {isRegisterMode && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="confirmPassword" 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  placeholder="••••••••" 
                  className="pl-10 pr-10"
                  required 
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Procesando...' : (isRegisterMode ? 'Crear Cuenta' : 'Iniciar Sesión')}
            </Button>
          </DialogFooter>
        </form>
        
        <div className="px-6 pb-6 text-center">
          {isRegisterMode ? (
            <p className="text-xs text-muted-foreground">
              ¿Ya tienes una cuenta?{' '}
              <Button variant="link" className="p-0 h-auto text-primary" onClick={() => { onClose(); setTimeout(() => onSuccess({ openLogin: true, role }), 50); }}>
                Inicia Sesión
              </Button>
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              ¿No tienes una cuenta?{' '}
              <Button variant="link" className="p-0 h-auto text-primary" onClick={() => { onClose(); setTimeout(() => onSuccess({ openRegister: true, role }), 50); }}>
                Regístrate
              </Button>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthForm;
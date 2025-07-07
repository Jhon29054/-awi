import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pill, Zap, ShieldCheck, Users, HeartHandshake, UserCog, UserPlus, History, TrendingUp, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AuthForm from '@/components/AuthForm';

const WelcomePage = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState(null); 

  // Función para suscribir al usuario a notificaciones push
  const subscribeUserToPush = async () => {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Workers no soportados por este navegador.');
      return;
    }
    if (!('PushManager' in window)) {
      console.log('Push API no soportada por este navegador.');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array('TU_CLAVE_PUBLICA_VAPID') // Reemplaza con tu clave VAPID pública del backend
      });
      
      console.log('Usuario suscrito:', subscription);
      
      // TODO: Enviar el objeto subscription a tu backend para almacenarlo
      // fetch('/api/subscribe', {
      //   method: 'POST',
      //   body: JSON.stringify(subscription),
      //   headers: {
      //     'Content-Type': 'application/json'
      //   }
      // });

    } catch (error) {
      console.error('Error al suscribir al usuario:', error);
    }
  };

  // Función auxiliar para convertir la clave VAPID de Base64 a Uint8Array
  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const FeatureCard = ({ icon, title, description }) => (
    <motion.div
      className="bg-card p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-border"
      whileHover={{ y: -5 }}
    >
      <div className="flex items-center text-primary mb-3">
        {icon}
        <h3 className="ml-3 text-lg font-semibold text-card-foreground">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </motion.div>
  );

  const handleAuthSuccess = (userOrAction) => {
    setAuthMode(null);
    if (userOrAction.openLogin || userOrAction.openRegister) {
      // Si es una acción para cambiar de modo (login <-> register)
      const newMode = `${userOrAction.openLogin ? 'login' : 'register'}${userOrAction.role === 'admin' ? 'Admin' : 'Cliente'}`;
      setAuthMode(newMode);
    } else {
      // Si es un usuario (login/register exitoso)
      onLogin(userOrAction);
    }
  };

  const renderAuthModal = () => {
    if (!authMode) return null;
    const isLogin = authMode.startsWith('login');
    const role = authMode.includes('Admin') ? 'admin' : 'cliente';
    
    return (
      <AuthForm
        mode={isLogin ? 'login' : 'register'}
        role={role}
        isOpen={!!authMode}
        onClose={() => setAuthMode(null)}
        onSuccess={handleAuthSuccess}
      />
    );
  };
  
  useEffect(() => {
    // Aquí puedes decidir cuándo intentar suscribir al usuario
    // Por ejemplo, podrías llamarlo después de que el usuario inicie sesión
    // subscribeUserToPush(); 
  }, []);


  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-100 via-indigo-50 to-purple-100 dark:from-slate-900 dark:via-indigo-950 dark:to-purple-950 text-gray-800 dark:text-gray-200">
      <header className="py-6 px-4 sm:px-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-primary to-blue-600 p-2 rounded-lg shadow-md">
            <Pill className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">RecordaMedic</h1>
        </div>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => setAuthMode('loginCliente')} className="dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700">Iniciar Sesión Cliente</Button>
          <Button className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white" onClick={() => setAuthMode('registroCliente')}>
            Registrarse Cliente
          </Button>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6">
            Bienvenido a <span className="gradient-text">RecordaMedic</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-10">
            Tu plataforma integral para el monitoreo de medicación. Simplifica tu rutina, mejora tu adherencia al tratamiento y cuida tu salud de forma inteligente.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-lg" onClick={() => setAuthMode('registroCliente')}>
              Comienza tu Aventura Saludable <HeartHandshake className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="mt-12 max-w-4xl w-full px-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <img   
            className="rounded-xl shadow-2xl object-cover w-full h-auto max-h-[400px]" 
            alt="Panel de control de RecordaMedic mostrando gráficos y lista de medicamentos"
            src="https://img.freepik.com/vector-gratis/farmaceutico-profesional-ciencia-farmaceutica-que-revisa-medicamentos-tienda-farmacia-farmacia-negocio-medicina-farmacia-personaje-dibujos-animados-planos-vector-ilustracion_1150-58792.jpg?semt=ais_items_boosted&w=740" />
        </motion.div>
      </main>

      <section className="py-16 px-4 sm:px-8 bg-white dark:bg-slate-800/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">¿Qué puedes hacer con RecordaMedic?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <FeatureCard 
              icon={<Zap size={24} />} 
              title="Gestión de Medicamentos" 
              description="Organiza y sigue tus tratamientos de forma sencilla y eficaz. Registra dosis, horarios y más." 
            />
            <FeatureCard 
              icon={<Users size={24} />} 
              title="Recordatorios Inteligentes" 
              description="Nunca olvides una dosis con nuestras notificaciones personalizadas y alertas en la app." 
            />
            <FeatureCard 
              icon={<ShieldCheck size={24} />} 
              title="Control de Interacciones" 
              description="Verifica posibles interacciones entre tus medicamentos para mayor seguridad y tranquilidad." 
            />
            <FeatureCard 
              icon={<Bell size={24} />}
              title="Notificaciones Personalizables"
              description="Configura alertas y recordatorios a tu medida, por cada medicamento y horario."
            />
            <FeatureCard 
              icon={<History size={24} />}
              title="Historial de Tomas" 
              description="Lleva un registro detallado de todas tus tomas de medicamentos para un seguimiento preciso." 
            />
            <FeatureCard 
              icon={<TrendingUp size={24} />}
              title="Seguimiento de Progreso" 
              description="Visualiza tu adherencia al tratamiento a lo largo del tiempo con gráficos y estadísticas." 
            />
          </div>
        </div>
      </section>
      
      <section className="py-16 px-4 sm:px-8">
         <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">¿Por qué elegir RecordaMedic?</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            <Card className="text-center p-6 bg-white/50 dark:bg-slate-800/30 shadow-lg">
              <CardHeader><CardTitle>Fácil de Usar</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">Interfaz intuitiva diseñada para todas las edades.</p></CardContent>
            </Card>
             <Card className="text-center p-6 bg-white/50 dark:bg-slate-800/30 shadow-lg">
              <CardHeader><CardTitle>Seguro y Privado</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">Tus datos de salud están protegidos y son confidenciales.</p></CardContent>
            </Card>
             <Card className="text-center p-6 bg-white/50 dark:bg-slate-800/30 shadow-lg">
              <CardHeader><CardTitle>Personalizable</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">Adapta la aplicación a tus necesidades específicas.</p></CardContent>
            </Card>
            <Card className="text-center p-6 bg-white/50 dark:bg-slate-800/30 shadow-lg">
              <CardHeader><CardTitle>Historial Completo</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">Accede a un registro detallado de tus tomas pasadas para un mejor control y seguimiento médico.</p></CardContent>
            </Card>
            <Card className="text-center p-6 bg-white/50 dark:bg-slate-800/30 shadow-lg">
              <CardHeader><CardTitle>Control de Inventario</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">Gestiona tus existencias y recibe alertas para asegurarte de no quedarte sin tus medicamentos esenciales.</p></CardContent>
            </Card>
            <Card className="text-center p-6 bg-white/50 dark:bg-slate-800/30 shadow-lg">
              <CardHeader><CardTitle>Recordatorios Flexibles</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">Configura recordatorios adaptados a cualquier esquema de dosificación, ya sea diario, por horas o en días específicos.</p></CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer mejorado */}
      <footer className="bg-gray-100 dark:bg-slate-900 py-8 px-4 sm:px-8 text-gray-700 dark:text-gray-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">

          {/* Sección de Derechos de Autor y Créditos */}
          <div className="text-center sm:text-left">
            {/* Espacio para el logo de TECSUP */}
            {/* Puedes añadir tu etiqueta <img> aquí, por ejemplo: */}
            {/* <img src="/ruta/a/tu/logo-tecsup.png" alt="Logo TECSUP" className="h-10 mb-2 mx-auto sm:mx-0" /> */}

            <p className="text-sm mb-1 font-semibold text-foreground dark:text-gray-200">
              RecordaMedic: Tu aliado en la gestión de medicamentos.
            </p>
            <p className="text-sm mb-2 text-muted-foreground">
              Monitorea, recuerda y cuida tu salud con facilidad.
            </p>
            
            <p className="text-xs mt-1">
              Un proyecto de <span className="font-semibold text-primary dark:text-blue-400">TECSUP 2025</span>.
            </p>

          </div>

          {/* Sección de Acceso Administrador */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
             <span className="text-sm font-medium">Acceso Administrador:</span>
             <Button variant="link" className="p-0 h-auto text-primary dark:text-blue-400 dark:hover:text-blue-300" onClick={() => setAuthMode('loginAdmin')}>
              <UserCog className="mr-1 h-4 w-4" /> Iniciar Sesión Admin
            </Button>
            <span className="hidden sm:inline text-gray-400 dark:text-gray-600">|</span>
            <Button variant="link" className="p-0 h-auto text-xs text-gray-500 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-400" onClick={() => setAuthMode('registroAdmin')}>
              .
            </Button>
          </div>

        </div>
      </footer>
      {renderAuthModal()}
    </div>
  );
};

export default WelcomePage;
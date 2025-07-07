import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Pill, 
  Clock, 
  Package, 
  AlertTriangle, 
  Plus,
  CheckCircle2,
  Calendar
} from "lucide-react";
import { 
  getMedicamentos, 
  getRecordatorios, 
  getInventario, 
  getInteracciones, 
  markRecordatorioTomado
} from "@/lib/storage";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

const Dashboard = ({ userId, onTabChange, onAddMedicamento, onAddRecordatorio }) => {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    medicamentosActivos: 0,
    recordatoriosHoy: 0,
    medicamentosBajoInventario: 0,
    interaccionesActivas: 0
  });
  const [recordatoriosProximos, setRecordatoriosProximos] = useState([]);
  
  const loadDashboardData = useCallback(() => {
    if (!userId) return;

    const medicamentos = getMedicamentos(userId);
    const recordatorios = getRecordatorios(userId);
    const inventario = getInventario(userId);
    const interaccionesUsuario = getInteracciones(userId); // Usar interacciones del usuario
    
    const medicamentosActivos = medicamentos.filter(m => m.activo);
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);
    
    const recordatoriosHoy = recordatorios.filter(r => {
      const fecha = new Date(r.fechaHora);
      return fecha >= hoy && fecha < manana && !r.tomado;
    });
    
    const medicamentosBajoInventario = inventario.filter(i => {
      const medicamento = medicamentos.find(m => m.id === i.medicamentoId);
      // Asegurarse que medicamento.cantidadMinima exista y sea un número
      const cantidadMinimaDefinida = medicamento && typeof medicamento.cantidadMinima === 'number' ? medicamento.cantidadMinima : 5;
      return medicamento && medicamento.activo && i.cantidad <= cantidadMinimaDefinida;
    });
    
    const nombresMedicamentosActivos = medicamentosActivos.map(m => m.nombre.toLowerCase());
    // Calcular interacciones activas basadas en las interacciones DEFINIDAS POR EL USUARIO
    const interaccionesActivas = interaccionesUsuario.filter(interaccion => {
      const med1 = interaccion.medicamento1.toLowerCase();
      const med2 = interaccion.medicamento2.toLowerCase();
      // Una interacción es activa si ambos medicamentos de la interacción están en la lista de medicamentos activos del usuario
      return nombresMedicamentosActivos.includes(med1) && nombresMedicamentosActivos.includes(med2);
    });
    
    const ahora = new Date();
    const recordatoriosNoTomados = recordatorios
      .filter(r => !r.tomado /* && new Date(r.fechaHora) >= ahora*/)
      .sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora))
      .slice(0, 5);
    
    setStats({
      medicamentosActivos: medicamentosActivos.length,
      recordatoriosHoy: recordatoriosHoy.length,
      medicamentosBajoInventario: medicamentosBajoInventario.length,
      interaccionesActivas: interaccionesActivas.length
    });
    
    setRecordatoriosProximos(recordatoriosNoTomados);
  }, [userId]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]); // loadDashboardData ya incluye userId como dependencia
  
  const handleMarcarTomado = (id) => {
    markRecordatorioTomado(id, userId);
    
    // Para actualizar la UI inmediatamente sin esperar un re-render completo del dashboard
    // o un cambio en refreshClientDataTrigger, actualizamos localmente y luego recargamos.
    setRecordatoriosProximos(prev => prev.filter(r => r.id !== id));
    loadDashboardData(); // Recargar todos los datos del dashboard para reflejar cambios
    
    toast({
      title: "Medicamento tomado",
      description: "Se ha registrado correctamente en tu historial.",
      className: "bg-green-500 text-white"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <div className="flex gap-2">
          <Button 
            onClick={onAddMedicamento}
            className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
          >
            <Plus className="h-4 w-4 mr-1" /> Medicamento
          </Button>
          <Button 
            onClick={onAddRecordatorio}
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10"
          >
            <Plus className="h-4 w-4 mr-1" /> Recordatorio
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="overflow-hidden card-hover">
            <div className="h-1 bg-primary"></div>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Medicamentos Activos</p>
                  <h3 className="text-3xl font-bold">{stats.medicamentosActivos}</h3>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <Pill className="h-6 w-6 text-primary" />
                </div>
              </div>
              <Button 
                variant="ghost" 
                className="w-full mt-4 text-primary"
                onClick={() => onTabChange("medicamentos")}
              >
                Ver medicamentos
              </Button>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="overflow-hidden card-hover">
            <div className="h-1 bg-amber-500"></div>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Recordatorios Hoy</p>
                  <h3 className="text-3xl font-bold">{stats.recordatoriosHoy}</h3>
                </div>
                <div className="bg-amber-500/10 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-amber-500" />
                </div>
              </div>
              <Button 
                variant="ghost" 
                className="w-full mt-4 text-amber-500"
                onClick={() => onTabChange("recordatorios")}
              >
                Ver recordatorios
              </Button>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="overflow-hidden card-hover">
            <div className="h-1 bg-blue-500"></div>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Bajo Inventario</p>
                  <h3 className="text-3xl font-bold">{stats.medicamentosBajoInventario}</h3>
                </div>
                <div className="bg-blue-500/10 p-3 rounded-full">
                  <Package className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <Button 
                variant="ghost" 
                className="w-full mt-4 text-blue-500"
                onClick={() => onTabChange("inventario")}
              >
                Ver inventario
              </Button>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="overflow-hidden card-hover">
            <div className="h-1 bg-destructive"></div>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Interacciones</p>
                  <h3 className="text-3xl font-bold">{stats.interaccionesActivas}</h3>
                </div>
                <div className="bg-destructive/10 p-3 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
              </div>
              <Button 
                variant="ghost" 
                className="w-full mt-4 text-destructive"
                onClick={() => onTabChange("interacciones")}
              >
                Ver interacciones
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Próximos Recordatorios
              </h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onTabChange("recordatorios")}
              >
                Ver todos
              </Button>
            </div>
            
            {recordatoriosProximos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No tienes recordatorios próximos.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={onAddRecordatorio}
                >
                  <Plus className="h-4 w-4 mr-1" /> Añadir recordatorio
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recordatoriosProximos.map((recordatorio, index) => {
                  const fechaHora = new Date(recordatorio.fechaHora);
                  const esHoy = new Date().toDateString() === fechaHora.toDateString();
                  
                  return (
                    <motion.div 
                      key={recordatorio.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${esHoy ? "bg-amber-500/10" : "bg-primary/10"}`}>
                          <Pill className={`h-5 w-5 ${esHoy ? "text-amber-500" : "text-primary"}`} />
                        </div>
                        <div>
                          <h4 className="font-medium">{recordatorio.medicamentoNombre}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{recordatorio.dosis} {recordatorio.unidad}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(fechaHora, esHoy ? "'Hoy,' HH:mm" : "dd MMM, HH:mm", { locale: es })}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {esHoy && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-emerald-600"
                          onClick={() => handleMarcarTomado(recordatorio.id)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" /> Tomado
                        </Button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
        
        <Card className="overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Consejos de Medicación
              </h3>
            </div>
            
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-4 rounded-lg bg-primary/5 border border-primary/20"
              >
                <h4 className="font-medium text-primary mb-2">Mantén un horario consistente</h4>
                <p className="text-sm">Tomar tus medicamentos a la misma hora cada día ayuda a mantener niveles constantes en tu organismo y mejora su eficacia.</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20"
              >
                <h4 className="font-medium text-amber-600 mb-2">Revisa las interacciones</h4>
                <p className="text-sm">Algunos medicamentos pueden interactuar entre sí o con alimentos. Consulta siempre con tu médico o farmacéutico.</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20"
              >
                <h4 className="font-medium text-blue-600 mb-2">Controla tu inventario</h4>
                <p className="text-sm">Evita quedarte sin medicamentos. Reabastece tu inventario cuando te queden pocas unidades.</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20"
              >
                <h4 className="font-medium text-emerald-600 mb-2">Registra efectos secundarios</h4>
                <p className="text-sm">Mantén un registro de cualquier efecto secundario que experimentes y comunícalo a tu médico en la próxima consulta.</p>
              </motion.div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

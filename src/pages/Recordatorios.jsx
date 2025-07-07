import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Calendar, Edit, Trash2, CheckCircle2, Eye, XCircle, AlertCircle, Clock } from "lucide-react";
import RecordatorioForm from "@/components/RecordatorioForm";
import { getRecordatorios, deleteRecordatorio, markRecordatorioTomado } from "@/lib/storage";
import { requestNotificationPermission, scheduleNotification } from "@/lib/notification";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle as CardTitleShad, CardDescription as CardDescriptionShad } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { format, isPast, isToday, isFuture, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const Recordatorios = ({ userId, onRecordatoriosChange }) => {
  const { toast } = useToast();
  const [recordatorios, setRecordatorios] = useState([]);
  const [filteredRecordatorios, setFilteredRecordatorios] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilterTab, setActiveFilterTab] = useState("pendientes"); 
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentRecordatorio, setCurrentRecordatorio] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [recordatorioToDelete, setRecordatorioToDelete] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [recordatorioToView, setRecordatorioToView] = useState(null);

  useEffect(() => {
    requestNotificationPermission(); // Solicitar permiso al cargar la página
  }, []);

  const loadRecordatorios = () => {
    if (!userId) return;
    const data = getRecordatorios(userId);
    setRecordatorios(data);
  };
  
  useEffect(() => {
    loadRecordatorios();
  }, [userId]);

  useEffect(() => {
    filterAndSortRecordatorios();
  }, [searchTerm, activeFilterTab, recordatorios]);

  const filterAndSortRecordatorios = () => {
    let filtered = [...recordatorios];

    if (searchTerm) {
      filtered = filtered.filter(rec =>
        rec.medicamentoNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (rec.notas && rec.notas.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (activeFilterTab === "pendientes") {
      filtered = filtered.filter(r => !r.tomado && (isToday(new Date(r.fechaHora)) || isFuture(new Date(r.fechaHora))));
    } else if (activeFilterTab === "vencidos") {
      filtered = filtered.filter(r => !r.tomado && isPast(new Date(r.fechaHora)) && !isToday(new Date(r.fechaHora)));
    } else if (activeFilterTab === "completados") {
      filtered = filtered.filter(r => r.tomado);
    }
    
    filtered.sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora));
    setFilteredRecordatorios(filtered);
  };

  const handleAddRecordatorio = () => {
    setCurrentRecordatorio(null);
    setIsFormOpen(true);
  };

  const handleEditRecordatorio = (recordatorio) => {
    setCurrentRecordatorio(recordatorio);
    setIsFormOpen(true);
  };

  const handleDeleteRecordatorio = (recordatorio) => {
    setRecordatorioToDelete(recordatorio);
    setIsDeleteDialogOpen(true);
  };
  
  const handleViewRecordatorio = (recordatorio) => {
    setRecordatorioToView(recordatorio);
    setIsViewDialogOpen(true);
  };

  const confirmDelete = () => {
    if (recordatorioToDelete && userId) {
      deleteRecordatorio(recordatorioToDelete.id, userId);
      toast({
        title: "Recordatorio Eliminado",
        description: `El recordatorio para ${recordatorioToDelete.medicamentoNombre} ha sido eliminado.`,
        variant: "destructive"
      });
      loadRecordatorios();
      setIsDeleteDialogOpen(false);
      setRecordatorioToDelete(null);
      if (onRecordatoriosChange) {
        onRecordatoriosChange();
      }
    }
  };

  const handleMarcarTomado = (id) => {
    if (!userId) return;
    markRecordatorioTomado(id, userId);
    toast({
      title: "Medicamento Tomado",
      description: "Se ha registrado en tu historial.",
    });
    loadRecordatorios();
    if (onRecordatoriosChange) {
      onRecordatoriosChange();
    }
  };

  const handleSaveRecordatorio = (savedRecordatorio) => {
    loadRecordatorios();
    if (isViewDialogOpen && recordatorioToView && recordatorioToView.id === savedRecordatorio.id) {
      setRecordatorioToView(savedRecordatorio);
    }
    // Programar notificación para el recordatorio guardado
    if (Notification.permission === "granted") {
      scheduleNotification(
        `Recordatorio: ${savedRecordatorio.medicamentoNombre}`,
        {
          body: `Es hora de tomar ${savedRecordatorio.dosis} ${savedRecordatorio.unidad} de ${savedRecordatorio.medicamentoNombre}. ${savedRecordatorio.notas ? `Notas: ${savedRecordatorio.notas}` : ''}`,
          icon: '/assets/logo_recordamedic.png',
          tag: savedRecordatorio.id,
        },
        parseISO(savedRecordatorio.fechaHora)
      );
    }
    if (onRecordatoriosChange) {
      onRecordatoriosChange();
    }
  };
  
  const getStatusIconAndColor = (recordatorio) => {
    const fecha = new Date(recordatorio.fechaHora);
    if (recordatorio.tomado) return { icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />, text: "Completado", color: "text-emerald-500" };
    if (isPast(fecha) && !isToday(fecha)) return { icon: <XCircle className="h-5 w-5 text-red-500" />, text: "Vencido", color: "text-red-500" };
    return { icon: <AlertCircle className="h-5 w-5 text-amber-500" />, text: "Pendiente", color: "text-amber-500" };
  };


  return (
    <div className="space-y-6 pt-8">
      <Card className="shadow-lg">
        <CardHeader className="border-b bg-muted/30 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitleShad className="text-2xl font-bold gradient-text">Gestión de Recordatorios</CardTitleShad>
              <CardDescriptionShad>Programa, visualiza y gestiona tus recordatorios de medicación.</CardDescriptionShad>
            </div>
            <Button onClick={handleAddRecordatorio} className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
              <Plus className="h-4 w-4 mr-2" /> Nuevo Recordatorio
            </Button>
          </div>
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Buscar por nombre de medicamento o notas..."
              className="pl-10 text-base py-3 rounded-lg shadow-inner focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={activeFilterTab} onValueChange={setActiveFilterTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 shadow-sm">
              <TabsTrigger value="pendientes" className="py-2.5 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md">Pendientes</TabsTrigger>
              <TabsTrigger value="vencidos" className="py-2.5 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md">Vencidos</TabsTrigger>
              <TabsTrigger value="completados" className="py-2.5 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md">Completados</TabsTrigger>
            </TabsList>
            
            {["pendientes", "vencidos", "completados"].map(tabValue => (
              <TabsContent key={tabValue} value={tabValue}>
                {filteredRecordatorios.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Clock className="mx-auto h-12 w-12 text-primary/50 mb-4" />
                    <p className="text-xl font-medium">No hay recordatorios {tabValue}</p>
                    <p className="text-sm mt-2">
                      {searchTerm ? "Ajusta tu búsqueda o " : ""}
                      {tabValue === "pendientes" ? "añade un nuevo recordatorio." : "revisa otras pestañas."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRecordatorios.map((recordatorio, index) => {
                      const status = getStatusIconAndColor(recordatorio);
                      return (
                        <motion.div
                          key={recordatorio.id}
                          initial={{ opacity: 0, scale: 0.95, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
                        >
                          <Card className={`overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 min-h-[180px] flex flex-col ${
                            status.text === "Completado" ? "border-emerald-500" :
                            status.text === "Vencido" ? "border-red-500" : "border-amber-500"
                          }`}>
                            <CardContent className="p-5 space-y-3 flex-grow">
                              <div className="flex justify-between items-start">
                                <h3 className="text-lg font-semibold text-foreground">{recordatorio.medicamentoNombre}</h3>
                                {status.icon}
                              </div>
                              <p className="text-sm text-muted-foreground">{recordatorio.dosis} {recordatorio.unidad}</p>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4 mr-1.5" />
                                {format(new Date(recordatorio.fechaHora), "dd MMM yyyy, HH:mm", { locale: es })}
                              </div>
                              {recordatorio.notas && <p className="text-xs text-muted-foreground italic pt-1 border-t border-dashed">Nota: {recordatorio.notas}</p>}
                            </CardContent>
                            <CardFooter className="bg-muted/30 px-5 py-3 flex justify-end gap-2">
                              {!recordatorio.tomado && status.text !== "Vencido" && (
                                <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-300 hover:bg-emerald-50" onClick={() => handleMarcarTomado(recordatorio.id)}>
                                  <CheckCircle2 className="h-4 w-4 mr-1" /> Tomar
                                </Button>
                              )}
                              <Button variant="ghost" size="icon" className="text-sky-500 hover:text-sky-700" onClick={() => handleViewRecordatorio(recordatorio)}><Eye className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-700" onClick={() => handleEditRecordatorio(recordatorio)}><Edit className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-red-700" onClick={() => handleDeleteRecordatorio(recordatorio)}><Trash2 className="h-4 w-4" /></Button>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
      
      <RecordatorioForm
        recordatorio={currentRecordatorio}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveRecordatorio}
        userId={userId} 
      />
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-destructive">Confirmar Eliminación</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>¿Estás seguro de que deseas eliminar el recordatorio para <span className="font-bold">{recordatorioToDelete?.medicamentoNombre}</span>?</p>
            <p className="text-sm text-muted-foreground mt-2">Esta acción no se puede deshacer.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {recordatorioToView && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold gradient-text">Detalles del Recordatorio</DialogTitle>
              <DialogDescription>Para {recordatorioToView.medicamentoNombre}</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              <p><strong>Medicamento:</strong> {recordatorioToView.medicamentoNombre}</p>
              <p><strong>Dosis:</strong> {recordatorioToView.dosis} {recordatorioToView.unidad}</p>
              <p><strong>Frecuencia Programada:</strong> {recordatorioToView.frecuencia} {recordatorioToView.unidadFrecuencia}</p>
              <p><strong>Fecha y Hora:</strong> {format(new Date(recordatorioToView.fechaHora), "EEEE, dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}</p>
              <p><strong>Notas:</strong> {recordatorioToView.notas || "Ninguna"}</p>
              <p><strong>Estado:</strong> <span className={getStatusIconAndColor(recordatorioToView).color + " font-semibold"}>{getStatusIconAndColor(recordatorioToView).text}</span></p>
              {recordatorioToView.tomado && recordatorioToView.fechaTomado && (
                <p><strong>Fecha de Toma:</strong> {format(new Date(recordatorioToView.fechaTomado), "dd MMM yyyy, HH:mm", { locale: es })}</p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Cerrar</Button>
               <Button onClick={() => { setIsViewDialogOpen(false); handleEditRecordatorio(recordatorioToView); }} className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
                <Edit className="h-4 w-4 mr-2" /> Editar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Recordatorios;
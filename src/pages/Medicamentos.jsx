import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Edit, Trash2, Eye, Pill } from "lucide-react";
import MedicamentoForm from "@/components/MedicamentoForm";
import { getMedicamentos, deleteMedicamento } from "@/lib/storage";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle as CardTitleShad, CardDescription as CardDescriptionShad } from "@/components/ui/card";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const Medicamentos = ({ userId }) => {
  const { toast } = useToast();
  const [medicamentos, setMedicamentos] = useState([]);
  const [filteredMedicamentos, setFilteredMedicamentos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroActivo, setFiltroActivo] = useState("todos");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentMedicamento, setCurrentMedicamento] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [medicamentoToDelete, setMedicamentoToDelete] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [medicamentoToView, setMedicamentoToView] = useState(null);


  const loadMedicamentos = () => {
    if (!userId) return;
    const data = getMedicamentos(userId);
    setMedicamentos(data);
  };

  useEffect(() => {
    loadMedicamentos();
  }, [userId]); // Recargar si cambia userId

  useEffect(() => {
    filterMedicamentos();
  }, [searchTerm, filtroActivo, medicamentos]);

  const filterMedicamentos = () => {
    let filtered = medicamentos;
    if (searchTerm) {
      filtered = filtered.filter(med => 
        med.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (med.descripcion && med.descripcion.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (med.categoria && med.categoria.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (filtroActivo === "activos") {
      filtered = filtered.filter(med => med.activo);
    } else if (filtroActivo === "inactivos") {
      filtered = filtered.filter(med => !med.activo);
    }
    setFilteredMedicamentos(filtered);
  };

  const handleAddMedicamento = () => {
    setCurrentMedicamento(null);
    setIsFormOpen(true);
  };

  const handleEditMedicamento = (medicamento) => {
    setCurrentMedicamento(medicamento);
    setIsFormOpen(true);
  };

  const handleDeleteMedicamento = (medicamento) => {
    setMedicamentoToDelete(medicamento);
    setIsDeleteDialogOpen(true);
  };

  const handleViewMedicamento = (medicamento) => {
    setMedicamentoToView(medicamento);
    setIsViewDialogOpen(true);
  };

  const confirmDelete = () => {
    if (medicamentoToDelete && userId) {
      deleteMedicamento(medicamentoToDelete.id, userId);
      toast({
        title: "Medicamento Eliminado",
        description: `${medicamentoToDelete.nombre} ha sido eliminado.`,
        variant: "destructive"
      });
      loadMedicamentos();
      setIsDeleteDialogOpen(false);
      setMedicamentoToDelete(null);
    }
  };

  const handleSaveMedicamento = (savedMedicamento) => {
    loadMedicamentos();
    if (isViewDialogOpen && medicamentoToView && medicamentoToView.id === savedMedicamento.id) {
      setMedicamentoToView(savedMedicamento);
    }
  };
  
  const getFrecuenciaTextoCompleto = (frecuencia, unidadFrecuencia) => {
    if (!frecuencia || !unidadFrecuencia) return "No especificada";
    const unidades = {
      horas: "hora(s)",
      dias: "día(s)",
      semanas: "semana(s)",
      meses: "mes(es)",
      vecesAlDia: "veces al día"
    };
    return `${frecuencia} ${unidades[unidadFrecuencia] || unidadFrecuencia}`;
  };


  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="border-b bg-muted/30 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitleShad className="text-2xl font-bold gradient-text">Gestión de Medicamentos</CardTitleShad>
              <CardDescriptionShad>Visualiza, añade, edita y elimina tus medicamentos.</CardDescriptionShad>
            </div>
            <Button onClick={handleAddMedicamento} className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
              <Plus className="h-4 w-4 mr-2" /> Añadir Medicamento
            </Button>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Buscar por nombre, descripción o categoría..."
                className="pl-10 text-base py-3 rounded-lg shadow-inner focus:ring-2 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 justify-end">
              <Filter className="text-muted-foreground h-5 w-5" />
              <div className="flex">
                <Button variant={filtroActivo === "todos" ? "default" : "outline"} size="sm" className="rounded-l-md rounded-r-none" onClick={() => setFiltroActivo("todos")}>Todos</Button>
                <Button variant={filtroActivo === "activos" ? "default" : "outline"} size="sm" className="rounded-none" onClick={() => setFiltroActivo("activos")}>Activos</Button>
                <Button variant={filtroActivo === "inactivos" ? "default" : "outline"} size="sm" className="rounded-r-md rounded-l-none" onClick={() => setFiltroActivo("inactivos")}>Inactivos</Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 pt-6">
          {filteredMedicamentos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
               <Pill className="mx-auto h-12 w-12 text-primary/50 mb-4" />
              <p className="text-xl font-medium">No hay medicamentos</p>
              <p className="text-sm mt-2">
                {searchTerm || filtroActivo !== "todos" 
                  ? "No se encontraron medicamentos con los filtros actuales." 
                  : "Comienza añadiendo tu primer medicamento."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left py-3 px-6 font-semibold text-sm">Nombre</th>
                    <th className="text-left py-3 px-6 font-semibold text-sm">Dosis</th>
                    <th className="text-left py-3 px-6 font-semibold text-sm">Frecuencia</th>
                    <th className="text-center py-3 px-6 font-semibold text-sm">Estado</th>
                    <th className="text-right py-3 px-6 font-semibold text-sm">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMedicamentos.map((medicamento, index) => (
                    <motion.tr 
                      key={medicamento.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b hover:bg-muted/20 transition-colors"
                    >
                      <td className="py-4 px-6 font-medium">{medicamento.nombre}</td>
                      <td className="py-4 px-6">{medicamento.dosis} {medicamento.unidad}</td>
                      <td className="py-4 px-6">{getFrecuenciaTextoCompleto(medicamento.frecuencia, medicamento.unidadFrecuencia)}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${medicamento.activo ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                          {medicamento.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Button variant="ghost" size="icon" className="text-sky-500 hover:text-sky-700" onClick={() => handleViewMedicamento(medicamento)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-700" onClick={() => handleEditMedicamento(medicamento)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-red-700" onClick={() => handleDeleteMedicamento(medicamento)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <MedicamentoForm
        medicamento={currentMedicamento}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveMedicamento}
        userId={userId} // Pasar userId al formulario
      />
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-destructive">Confirmar Eliminación</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>¿Estás seguro de que deseas eliminar el medicamento <span className="font-bold">{medicamentoToDelete?.nombre}</span>?</p>
            <p className="text-sm text-muted-foreground mt-2">Esta acción no se puede deshacer.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {medicamentoToView && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold gradient-text">{medicamentoToView.nombre}</DialogTitle>
              <DialogDescription>{medicamentoToView.descripcion}</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              <p><strong>Dosis:</strong> {medicamentoToView.dosis} {medicamentoToView.unidad}</p>
              <p><strong>Frecuencia:</strong> {getFrecuenciaTextoCompleto(medicamentoToView.frecuencia, medicamentoToView.unidadFrecuencia)}</p>
              <p><strong>Vía de Administración:</strong> {medicamentoToView.viaAdmin}</p>
              <p><strong>Instrucciones:</strong> {medicamentoToView.instruccionesAdicionales || "No especificadas"}</p>
              <p><strong>Efectos Secundarios:</strong> {medicamentoToView.efectosSecundarios || "No especificados"}</p>
              <p><strong>Categoría:</strong> {medicamentoToView.categoria}</p>
              <p><strong>Cantidad Mínima en Inventario:</strong> {medicamentoToView.cantidadMinima}</p>
              <p><strong>Estado:</strong> <span className={medicamentoToView.activo ? "text-emerald-600 font-semibold" : "text-red-600 font-semibold"}>{medicamentoToView.activo ? "Activo" : "Inactivo"}</span></p>
              <p><strong>Fecha de Inicio:</strong> {format(new Date(medicamentoToView.fechaInicio), "dd 'de' MMMM 'de' yyyy", { locale: es })}</p>
              {medicamentoToView.fechaFin && <p><strong>Fecha de Fin:</strong> {format(new Date(medicamentoToView.fechaFin), "dd 'de' MMMM 'de' yyyy", { locale: es })}</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Cerrar</Button>
              <Button onClick={() => { setIsViewDialogOpen(false); handleEditMedicamento(medicamentoToView); }} className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
                <Edit className="h-4 w-4 mr-2" /> Editar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Medicamentos;

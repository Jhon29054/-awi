
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Search, Edit, Trash2, AlertTriangle } from "lucide-react";
import InteraccionForm from "@/components/InteraccionForm";
// import { getInteracciones, saveInteraccion, deleteInteraccion } from "@/lib/storage"; // Se maneja por props ahora
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle as CardTitleShad, CardDescription as CardDescriptionShad } from "@/components/ui/card";
import { motion } from "framer-motion";

const InteraccionesTable = ({ userId, interaccionesData, medicamentosParaFormulario, onSave, onDelete, onDataChange }) => {
  const { toast } = useToast();
  // const [interacciones, setInteracciones] = useState([]); // Recibido por prop: interaccionesData
  const [filteredInteracciones, setFilteredInteracciones] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentInteraccion, setCurrentInteraccion] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [interaccionToDelete, setInteraccionToDelete] = useState(null);
  
  // Ya no se llama a getInteracciones() aquí, se usa la prop interaccionesData
  // const loadInteracciones = () => {
  //   const data = getInteracciones(userId); // Ahora userId es necesario para la lógica por usuario
  //   setInteracciones(data);
  // };

  // useEffect(() => {
  //   loadInteracciones();
  // }, [userId, onDataChange]); // onDataChange es una señal para recargar si es necesario

  useEffect(() => {
    let filtered = interaccionesData || [];
    if (searchTerm) {
      filtered = (interaccionesData || []).filter(inter =>
        inter.medicamento1.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inter.medicamento2.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inter.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredInteracciones(filtered.sort((a,b) => a.medicamento1.localeCompare(b.medicamento1)));
  }, [searchTerm, interaccionesData]);

  const handleAddInteraccion = () => {
    setCurrentInteraccion(null);
    setIsFormOpen(true);
  };

  const handleEditInteraccion = (interaccion) => {
    setCurrentInteraccion(interaccion);
    setIsFormOpen(true);
  };

  const handleDeleteInteraccion = (interaccion) => {
    setInteraccionToDelete(interaccion);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (interaccionToDelete && onDelete) {
      onDelete(interaccionToDelete.id); // onDelete se encargará de la lógica de storage y el toast
      // Ya no se llama a loadInteracciones aquí. onDataChange es la señal.
      // if (onDataChange) onDataChange(); 
      setIsDeleteDialogOpen(false);
      setInteraccionToDelete(null);
    }
  };

  const handleSaveInteraccionInternal = (interaccionData) => {
    if (onSave) {
      onSave(interaccionData); // onSave se encargará de la lógica de storage y el toast
      // if (onDataChange) onDataChange();
    }
  };

  const getSeverityClass = (severidad) => {
    switch (severidad) {
      case "alta": return "bg-red-100 text-red-700 border-red-300 dark:bg-red-700/30 dark:text-red-300 dark:border-red-500/50";
      case "media": return "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-700/30 dark:text-yellow-300 dark:border-yellow-500/50";
      case "baja": return "bg-green-100 text-green-700 border-green-300 dark:bg-green-700/30 dark:text-green-300 dark:border-green-500/50";
      default: return "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700/30 dark:text-gray-300 dark:border-gray-500/50";
    }
  };


  return (
    <div className="space-y-6">
       <Card className="shadow-xl border-t-4 border-primary dark:border-primary/70 bg-card">
        <CardHeader className="border-b bg-muted/30 dark:bg-muted/20 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitleShad className="text-2xl font-bold gradient-text">Interacciones Medicamentosas</CardTitleShad>
              <CardDescriptionShad className="text-muted-foreground">
                {userId ? "Gestiona tus interacciones medicamentosas." : "Consulta posibles interacciones entre medicamentos."}
              </CardDescriptionShad>
            </div>
            {userId && ( // Solo mostrar si hay un userId (contexto de cliente o admin para cliente)
              <Button onClick={handleAddInteraccion} className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-primary-foreground">
                <PlusCircle className="h-4 w-4 mr-2" /> Añadir Interacción
              </Button>
            )}
          </div>
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Buscar por nombre de medicamento o descripción..."
              className="pl-10 text-base py-3 rounded-lg shadow-inner focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredInteracciones.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertTriangle className="mx-auto h-12 w-12 text-primary/50 mb-4" />
              <p className="text-xl font-medium">No hay interacciones</p>
              <p className="text-sm mt-2">
                {searchTerm ? "No se encontraron interacciones con tu búsqueda." : 
                 (userId ? "Añade interacciones para comenzar." : "No hay interacciones globales definidas.")}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Medicamento 1</TableHead>
                    <TableHead className="font-semibold">Medicamento 2</TableHead>
                    <TableHead className="font-semibold">Severidad</TableHead>
                    <TableHead className="font-semibold">Descripción</TableHead>
                    {userId && <TableHead className="text-right font-semibold">Acciones</TableHead> }
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInteracciones.map((inter, index) => (
                    <motion.tr 
                      key={inter.id || index} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-muted/20"
                    >
                      <TableCell className="font-medium">{inter.medicamento1}</TableCell>
                      <TableCell className="font-medium">{inter.medicamento2}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getSeverityClass(inter.severidad)}`}>
                          {inter.severidad.charAt(0).toUpperCase() + inter.severidad.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate" title={inter.descripcion}>{inter.descripcion}</TableCell>
                      {userId && (
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEditInteraccion(inter)} className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteInteraccion(inter)} className="text-destructive hover:text-red-700 dark:text-red-500 dark:hover:text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {isFormOpen && (
        <InteraccionForm
          interaccion={currentInteraccion}
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveInteraccionInternal}
          allMedicamentos={medicamentosParaFormulario || []} 
          userId={userId}
        />
      )}
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-destructive">Confirmar Eliminación</DialogTitle>
          </DialogHeader>
          <DialogDescription className="py-4">
            ¿Estás seguro de que deseas eliminar esta interacción? Esta acción no se puede deshacer.
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InteraccionesTable;

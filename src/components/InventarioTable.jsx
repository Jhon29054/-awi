
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, Edit3, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


const InventarioTable = ({ inventario, onEdit, onDelete }) => {
  const [inventarioData, setInventarioData] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  useEffect(() => {
    setInventarioData(inventario || []);
  }, [inventario]);
  
  const getEstadoInventario = (cantidad, cantidadMinima) => {
    const min = typeof cantidadMinima === 'number' ? cantidadMinima : 5; 
    if (cantidad <= 0) return "agotado";
    if (cantidad <= min) return "bajo";
    return "adecuado";
  };
  
  const getColorEstado = (estado) => {
    switch (estado) {
      case "agotado": return "text-destructive";
      case "bajo": return "text-amber-500";
      case "adecuado": return "text-emerald-500";
      default: return "";
    }
  };
  
  const getIconoEstado = (estado) => {
    switch (estado) {
      case "agotado":
      case "bajo":
        return <AlertTriangle className="h-4 w-4" />;
      case "adecuado":
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return null;
    }
  };
  
  const getTextoEstado = (estado) => {
    switch (estado) {
      case "agotado": return "Agotado";
      case "bajo": return "Bajo";
      case "adecuado": return "Adecuado";
      default: return "";
    }
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      onDelete(itemToDelete.medicamentoId);
    }
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  return (
    <>
      <Card className="overflow-hidden">
        <div className="p-0 sm:p-2 md:p-4">
          {inventarioData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay datos de inventario disponibles.</p>
              <p className="text-sm mt-2">Añade o actualiza el inventario para comenzar a hacer seguimiento.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Medicamento</th>
                    <th className="text-center py-3 px-4 font-semibold">Cantidad</th>
                    <th className="text-center py-3 px-4 font-semibold">Estado</th>
                    <th className="text-center py-3 px-4 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {inventarioData.map((item, index) => {
                    const estado = getEstadoInventario(item.cantidad, item.cantidadMinima);
                    return (
                      <motion.tr 
                        key={item.medicamentoId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`border-b hover:bg-muted/20`}
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium">{item.medicamentoNombre}</div>
                          {item.notas && <p className="text-xs text-muted-foreground">{item.notas}</p>}
                          {item.fechaCaducidad && <p className="text-xs text-muted-foreground">Cad: {new Date(item.fechaCaducidad).toLocaleDateString()}</p>}
                        </td>
                        <td className="py-3 px-4 text-center font-medium">
                          {item.cantidad}
                        </td>
                        <td className="py-3 px-4">
                          <div className={`flex items-center justify-center gap-1 ${getColorEstado(estado)}`}>
                            {getIconoEstado(estado)}
                            <span>{getTextoEstado(estado)}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => onEdit(item)}
                            className="text-primary hover:text-primary/80"
                            aria-label="Editar item de inventario"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteClick(item)}
                            className="text-destructive hover:text-destructive/80"
                            aria-label="Eliminar item de inventario"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de eliminar este ítem?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el ítem del inventario: <span className="font-semibold">{itemToDelete?.medicamentoNombre}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteConfirm(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default InventarioTable;

import React, { useState, useEffect, useCallback } from "react";
import InventarioTable from "@/components/InventarioTable";
import InventarioForm from "@/components/InventarioForm";
import { getMedicamentos, getInventario as getInventarioStorage, deleteItemInventario } from "@/lib/storage";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { PlusCircle, PackageSearch } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const Inventario = ({ userId, onDataChange }) => {
  const { toast } = useToast();
  const [inventario, setInventario] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  const loadData = useCallback(() => {
    if (userId) {
      const userMedicamentos = getMedicamentos(userId);
      setMedicamentos(userMedicamentos);
      const userInventario = getInventarioStorage(userId);
      
      const inventarioConNombres = userInventario.map(item => {
        const med = userMedicamentos.find(m => m.id === item.medicamentoId);
        return {
          ...item,
          medicamentoNombre: med ? med.nombre : "Medicamento Desconocido",
          cantidadMinima: med ? med.cantidadMinima : 5, 
        };
      });
      setInventario(inventarioConNombres);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEditItem = (item) => {
    const medicamentoOriginal = medicamentos.find(m => m.id === item.medicamentoId);
    setCurrentItem({
      ...item,
      medicamentoNombre: medicamentoOriginal ? medicamentoOriginal.nombre : "Desconocido",
    });
    setIsFormOpen(true);
  };
  
  const handleSaveItem = (itemData) => {
    if (!userId) {
      toast({ title: "Error", description: "Usuario no identificado.", variant: "destructive" });
      return;
    }
    
    toast({
      title: "Inventario Actualizado",
      description: `El inventario para ${itemData.medicamentoNombre || 'el medicamento'} ha sido guardado.`,
      className: "bg-green-500 text-white"
    });
    setIsFormOpen(false);
    setCurrentItem(null);
    loadData(); 
    if (onDataChange) { 
      onDataChange();
    }
  };

  const handleDeleteItem = (medicamentoId) => {
    if (!userId) {
      toast({ title: "Error", description: "Usuario no identificado.", variant: "destructive" });
      return;
    }
    const itemAEliminar = inventario.find(item => item.medicamentoId === medicamentoId);
    deleteItemInventario(medicamentoId, userId);
    toast({
      title: "Ítem Eliminado",
      description: `El ítem de inventario para ${itemAEliminar?.medicamentoNombre || 'el medicamento'} ha sido eliminado.`,
      className: "bg-red-500 text-white"
    });
    loadData();
    if (onDataChange) {
      onDataChange();
    }
  };

  const handleAddItemManualmente = () => {
    setCurrentItem(null); 
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6 pt-8">
      <Card className="shadow-xl border-t-4 border-primary dark:border-primary/70 bg-card">
        <CardHeader className="border-b bg-muted/30 dark:bg-muted/20 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold gradient-text flex items-center">
                <PackageSearch className="h-7 w-7 mr-3 text-primary" />
                Gestión de Inventario
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Controla las existencias de tus medicamentos.
              </CardDescription>
            </div>
            <Button 
              onClick={handleAddItemManualmente} 
              className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-primary-foreground"
            >
              <PlusCircle className="h-4 w-4 mr-2" /> Añadir/Actualizar Manualmente
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <InventarioTable
            inventario={inventario}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
          />
        </CardContent>
      </Card>

      {isFormOpen && (
        <InventarioForm
          item={currentItem}
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setCurrentItem(null);
          }}
          onSave={handleSaveItem} 
          medicamentos={medicamentos} 
          userId={userId} 
          isAdminContext={false}
        />
      )}
    </div>
  );
};

export default Inventario;

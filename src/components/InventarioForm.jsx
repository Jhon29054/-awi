
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { getInventario as storageGetInventario, updateInventario as storageUpdateInventario } from "@/lib/storage";
import { useToast } from "@/components/ui/use-toast";
import { format, parseISO } from "date-fns";

const InventarioForm = ({ 
  isOpen, 
  onClose, 
  onSave, 
  item, 
  medicamentos, 
  userId, 
  isAdminContext = false 
}) => {
  const { toast } = useToast();
  const [availableMedicamentos, setAvailableMedicamentos] = useState([]);
  
  const initialFormData = {
    medicamentoId: "",
    medicamentoNombre: "",
    cantidad: 0,
    fechaCaducidad: "",
    notas: ""
  };
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (isOpen && userId) {
      setAvailableMedicamentos(medicamentos || []);

      const currentInventario = storageGetInventario(userId);
      if (item && item.medicamentoId) { 
        const medicamentoExistente = (medicamentos || []).find(m => m.id === item.medicamentoId);
        const inventarioItemExistente = currentInventario.find(i => i.medicamentoId === item.medicamentoId);

        setFormData({
          medicamentoId: item.medicamentoId,
          medicamentoNombre: medicamentoExistente ? medicamentoExistente.nombre : item.medicamentoNombre || "",
          cantidad: inventarioItemExistente ? inventarioItemExistente.cantidad : (item.cantidad || 0),
          fechaCaducidad: inventarioItemExistente && inventarioItemExistente.fechaCaducidad ? format(parseISO(inventarioItemExistente.fechaCaducidad), "yyyy-MM-dd") : (item.fechaCaducidad ? format(parseISO(item.fechaCaducidad), "yyyy-MM-dd") : ""),
          notas: inventarioItemExistente ? inventarioItemExistente.notas : (item.notas || "")
        });
      } else { 
        setFormData({
            ...initialFormData,
            medicamentoId: medicamentos && medicamentos.length > 0 ? medicamentos[0].id : "",
            medicamentoNombre: medicamentos && medicamentos.length > 0 ? medicamentos[0].nombre : ""
        });
        if (medicamentos && medicamentos.length > 0) {
            handleMedicamentoChange(medicamentos[0].id, currentInventario); 
        }
      }
    }
  }, [isOpen, item, medicamentos, userId]);

  const handleMedicamentoChange = (id, currentInventarioForUser) => {
    const medicamento = (medicamentos || []).find(m => m.id === id);
    if (medicamento) {
      const inventarioParaUsar = currentInventarioForUser || storageGetInventario(userId);
      const inventarioItem = inventarioParaUsar.find(i => i.medicamentoId === id);
      
      setFormData({
        medicamentoId: id,
        medicamentoNombre: medicamento.nombre,
        cantidad: inventarioItem ? inventarioItem.cantidad : 0,
        fechaCaducidad: inventarioItem && inventarioItem.fechaCaducidad ? format(parseISO(inventarioItem.fechaCaducidad), "yyyy-MM-dd") : "",
        notas: inventarioItem ? inventarioItem.notas : ""
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'cantidad' ? parseInt(value, 10) : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!userId) {
        toast({ title: "Error", description: "Contexto de usuario no definido.", variant: "destructive"});
        return;
    }
    if (!formData.medicamentoId || formData.cantidad === undefined || isNaN(formData.cantidad)) {
      toast({
        title: "Error de Validación",
        description: "Medicamento y Cantidad (numérica) son campos obligatorios.",
        variant: "destructive"
      });
      return;
    }
    
    storageUpdateInventario(formData.medicamentoId, formData.cantidad, formData.fechaCaducidad ? new Date(formData.fechaCaducidad).toISOString() : null, formData.notas, userId);
    
    toast({
      title: "Inventario Actualizado",
      description: `El inventario de ${formData.medicamentoNombre} ha sido actualizado.`
    });
    
    onSave(formData); 
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold gradient-text">
            {item && item.medicamentoId ? "Editar Item de Inventario" : "Añadir/Actualizar Inventario"}
          </DialogTitle>
          <DialogDescription>
            Actualiza la cantidad y detalles de este medicamento en el inventario.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="space-y-2">
            <Label htmlFor="medicamentoId">Medicamento <span className="text-destructive">*</span></Label>
            <Select 
              value={formData.medicamentoId} 
              onValueChange={(value) => handleMedicamentoChange(value)} 
              required 
              disabled={!!(item && item.medicamentoId && isAdminContext)} 
            >
              <SelectTrigger><SelectValue placeholder="Seleccionar medicamento" /></SelectTrigger>
              <SelectContent>
                {availableMedicamentos.map(med => (
                  <SelectItem key={med.id} value={med.id}>
                    {med.nombre} {med.dosis ? `(${med.dosis} ${med.unidad || ''})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableMedicamentos.length === 0 && (
              <p className="text-sm text-amber-500 mt-1">
                {isAdminContext ? "Este cliente no tiene medicamentos registrados. Añade medicamentos al cliente primero." : "No hay medicamentos registrados. Añade medicamentos primero desde la sección 'Medicamentos'."}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cantidad">Cantidad <span className="text-destructive">*</span></Label>
            <Input id="cantidad" name="cantidad" type="number" min="0" value={formData.cantidad} onChange={handleChange} placeholder="Cantidad de unidades" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaCaducidad">Fecha de caducidad</Label>
            <Input id="fechaCaducidad" name="fechaCaducidad" type="date" value={formData.fechaCaducidad} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Input id="notas" name="notas" value={formData.notas} onChange={handleChange} placeholder="Ej: Comprado en Farmacia XYZ" />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
              {item && item.medicamentoId ? "Guardar Cambios" : "Añadir/Actualizar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InventarioForm;
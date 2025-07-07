import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { getMedicamentos, saveRecordatorio } from "@/lib/storage";
import { scheduleNotification, requestNotificationPermission } from "@/lib/notification";
import { useToast } from "@/components/ui/use-toast";
import { format, parseISO } from "date-fns";

const RecordatorioForm = ({ recordatorio, isOpen, onClose, onSave, userId }) => {
  const { toast } = useToast();
  const [medicamentos, setMedicamentos] = useState([]);
  const initialFormState = {
    id: null,
    medicamentoId: "",
    medicamentoNombre: "", 
    fechaHora: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    dosis: "",
    unidad: "",
    frecuencia: "", 
    unidadFrecuencia: "", 
    notas: ""
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (isOpen && userId) {
      requestNotificationPermission(); 
      const userMedicamentos = getMedicamentos(userId).filter(m => m.activo); 
      setMedicamentos(userMedicamentos);

      if (recordatorio) {
        const med = userMedicamentos.find(m => m.id === recordatorio.medicamentoId);
        setFormData({
          ...initialFormState,
          ...recordatorio,
          fechaHora: recordatorio.fechaHora ? format(parseISO(recordatorio.fechaHora), "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
          medicamentoNombre: med ? med.nombre : recordatorio.medicamentoNombre || "",
          dosis: recordatorio.dosis || (med ? med.dosis : ""), 
          unidad: recordatorio.unidad || (med ? med.unidad : ""), 
        });
      } else {
        setFormData({...initialFormState, fechaHora: format(new Date(), "yyyy-MM-dd'T'HH:mm")});
      }
    }
  }, [recordatorio, isOpen, userId]);

  const handleMedicamentoChange = (medicamentoId) => {
    const selectedMedicamento = medicamentos.find(m => m.id === medicamentoId);
    if (selectedMedicamento) {
      setFormData(prev => ({
        ...prev,
        medicamentoId: selectedMedicamento.id,
        medicamentoNombre: selectedMedicamento.nombre,
        dosis: selectedMedicamento.dosis, 
        unidad: selectedMedicamento.unidad, 
        frecuencia: selectedMedicamento.frecuencia,
        unidadFrecuencia: selectedMedicamento.unidadFrecuencia
      }));
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userId) {
      toast({ title: "Error", description: "Usuario no identificado.", variant: "destructive" });
      return;
    }
    if (!formData.medicamentoId || !formData.fechaHora || !formData.dosis || !formData.unidad) {
      toast({
        title: "Campos Incompletos",
        description: "Por favor, selecciona un medicamento, fecha/hora, dosis y unidad.",
        variant: "destructive"
      });
      return;
    }

    const fechaHoraProgramada = new Date(formData.fechaHora);
    const dataToSave = {
      ...formData,
      fechaHora: fechaHoraProgramada.toISOString()
    };
    
    const saved = saveRecordatorio(dataToSave, userId);

    if (Notification.permission === "granted") {
      scheduleNotification(
        `Recordatorio: ${saved.medicamentoNombre}`,
        {
          body: `Es hora de tomar ${saved.dosis} ${saved.unidad} de ${saved.medicamentoNombre}. ${saved.notas ? `Notas: ${saved.notas}` : ''}`,
          icon: '/assets/logo_recordamedic.png', 
          tag: saved.id, 
        },
        fechaHoraProgramada
      );
    } else {
        toast({
            title: "Permiso de Notificación Requerido",
            description: "Por favor, habilita las notificaciones para recibir alertas.",
            variant: "default"
        });
    }


    toast({
      title: "Recordatorio Guardado",
      description: `Recordatorio para ${saved.medicamentoNombre} guardado.`,
      className: "bg-green-500 text-white"
    });
    onSave(saved);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold gradient-text">
            {recordatorio ? "Editar Recordatorio" : "Nuevo Recordatorio"}
          </DialogTitle>
           <DialogDescription>
            {recordatorio ? "Actualiza los detalles de este recordatorio." : "Programa un nuevo recordatorio para tu medicación."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="space-y-2">
            <Label htmlFor="medicamentoId">Medicamento <span className="text-destructive">*</span></Label>
            <Select value={formData.medicamentoId} onValueChange={handleMedicamentoChange} required>
              <SelectTrigger><SelectValue placeholder="Seleccionar medicamento" /></SelectTrigger>
              <SelectContent>
                {medicamentos.map(med => (
                  <SelectItem key={med.id} value={med.id}>
                    {med.nombre} ({med.dosis} {med.unidad})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {medicamentos.length === 0 && (
                <p className="text-sm text-amber-600 mt-1">No hay medicamentos activos. Añade o activa medicamentos primero.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaHora">Fecha y Hora <span className="text-destructive">*</span></Label>
            <Input id="fechaHora" name="fechaHora" type="datetime-local" value={formData.fechaHora} onChange={handleChange} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dosis">Dosis a tomar <span className="text-destructive">*</span></Label>
              <Input id="dosis" name="dosis" type="number" step="any" value={formData.dosis} onChange={handleChange} placeholder="Ej: 1" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unidad">Unidad de la Dosis <span className="text-destructive">*</span></Label>
               <Select name="unidad" value={formData.unidad} onValueChange={(value) => setFormData(prev => ({...prev, unidad: value}))}>
                <SelectTrigger><SelectValue placeholder="Unidad" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mg">mg</SelectItem>
                  <SelectItem value="g">g</SelectItem>
                  <SelectItem value="mcg">mcg</SelectItem>
                  <SelectItem value="ml">ml</SelectItem>
                  <SelectItem value="UI">UI</SelectItem>
                  <SelectItem value="comprimido">comprimido(s)</SelectItem>
                  <SelectItem value="capsula">cápsula(s)</SelectItem>
                  <SelectItem value="gota">gota(s)</SelectItem>
                  <SelectItem value="inhalacion">inhalación(es)</SelectItem>
                  <SelectItem value="aplicacion">aplicación(es)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notas">Notas Adicionales</Label>
            <Input id="notas" name="notas" value={formData.notas} onChange={handleChange} placeholder="Ej: Tomar después de comer" />
          </div>
          
          <DialogFooter className="pt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
              {recordatorio ? "Actualizar Recordatorio" : "Guardar Recordatorio"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RecordatorioForm;
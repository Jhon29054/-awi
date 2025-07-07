import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { saveMedicamento, checkInteracciones } from "@/lib/storage";
import { useToast } from "@/components/ui/use-toast";
import { format, parseISO } from "date-fns";

const MedicamentoForm = ({ medicamento, isOpen, onClose, onSave, userId }) => {
  const { toast } = useToast();
  const initialFormState = {
    id: null,
    nombre: "",
    descripcion: "",
    dosis: "",
    unidad: "mg",
    frecuencia: "",
    unidadFrecuencia: "horas",
    viaAdmin: "Oral",
    instruccionesAdicionales: "",
    efectosSecundarios: "",
    categoria: "Analgésico",
    fechaInicio: format(new Date(), "yyyy-MM-dd"),
    fechaFin: "",
    activo: true,
    // cantidadMinima: 5, // Eliminado
    notas: ""
  };

  const [formData, setFormData] = useState(initialFormState);
  const [detectedInteractions, setDetectedInteractions] = useState([]);

  useEffect(() => {
    if (medicamento) {
      const { cantidadMinima, ...restOfMedicamento } = medicamento; // Excluir cantidadMinima
      setFormData({
        ...initialFormState,
        ...restOfMedicamento,
        fechaInicio: medicamento.fechaInicio ? format(parseISO(medicamento.fechaInicio), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
        fechaFin: medicamento.fechaFin ? format(parseISO(medicamento.fechaFin), "yyyy-MM-dd") : "",
        unidad: medicamento.unidad || "mg",
        unidadFrecuencia: medicamento.unidadFrecuencia || "horas",
        viaAdmin: medicamento.viaAdmin || "Oral",
        categoria: medicamento.categoria || "Analgésico",
        activo: medicamento.activo !== undefined ? medicamento.activo : true,
      });
    } else {
      setFormData(initialFormState);
    }
    setDetectedInteractions([]);
  }, [medicamento, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userId) {
      toast({ title: "Error", description: "Usuario no identificado.", variant: "destructive" });
      return;
    }

    const { cantidadMinima, ...dataToSaveWithoutMinima } = formData; // Excluir cantidadMinima
    const dataToSave = {
      ...dataToSaveWithoutMinima,
      fechaInicio: formData.fechaInicio ? new Date(formData.fechaInicio).toISOString() : null,
      fechaFin: formData.fechaFin ? new Date(formData.fechaFin).toISOString() : null,
      dosis: parseFloat(formData.dosis) || 0,
      frecuencia: parseInt(formData.frecuencia, 10) || 0,
    };

    const interacciones = checkInteracciones(dataToSave.nombre, userId);
    if (interacciones.length > 0) {
      setDetectedInteractions(interacciones);
      return; 
    }

    saveAndClose(dataToSave);
  };

  const saveAndClose = (dataToSave) => {
     const saved = saveMedicamento(dataToSave, userId);
    toast({
      title: "Medicamento Guardado",
      description: `${saved.nombre} ha sido guardado correctamente.`,
      className: "bg-green-500 text-white"
    });
    onSave(saved); 
    onClose();
  }

  const handleConfirmSaveWithInteractions = () => {
    const { cantidadMinima, ...dataToSaveWithoutMinima } = formData; // Excluir cantidadMinima
     const dataToSave = {
      ...dataToSaveWithoutMinima,
      fechaInicio: formData.fechaInicio ? new Date(formData.fechaInicio).toISOString() : null,
      fechaFin: formData.fechaFin ? new Date(formData.fechaFin).toISOString() : null,
      dosis: parseFloat(formData.dosis) || 0,
      frecuencia: parseInt(formData.frecuencia, 10) || 0,
    };
    saveAndClose(dataToSave);
    setDetectedInteractions([]);
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { setDetectedInteractions([]); onClose(); } }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold gradient-text">
            {medicamento ? "Editar Medicamento" : "Añadir Nuevo Medicamento"}
          </DialogTitle>
          <DialogDescription>
            {medicamento ? "Actualiza los detalles de este medicamento." : "Completa la información del nuevo medicamento."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre <span className="text-destructive">*</span></Label>
              <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej: Ibuprofeno" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción Breve</Label>
              <Input id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Ej: Antiinflamatorio no esteroideo" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dosis">Dosis <span className="text-destructive">*</span></Label>
              <Input id="dosis" name="dosis" type="number" step="any" value={formData.dosis} onChange={handleChange} placeholder="Ej: 200" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unidad">Unidad <span className="text-destructive">*</span></Label>
              <Select name="unidad" value={formData.unidad} onValueChange={(value) => handleSelectChange("unidad", value)}>
                <SelectTrigger><SelectValue placeholder="Seleccionar unidad" /></SelectTrigger>
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
             <div className="space-y-2">
              <Label htmlFor="viaAdmin">Vía de Administración</Label>
              <Select name="viaAdmin" value={formData.viaAdmin} onValueChange={(value) => handleSelectChange("viaAdmin", value)}>
                <SelectTrigger><SelectValue placeholder="Seleccionar vía" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Oral">Oral</SelectItem>
                  <SelectItem value="Tópica">Tópica</SelectItem>
                  <SelectItem value="Inhalatoria">Inhalatoria</SelectItem>
                  <SelectItem value="Intravenosa">Intravenosa</SelectItem>
                  <SelectItem value="Subcutánea">Subcutánea</SelectItem>
                  <SelectItem value="Intramuscular">Intramuscular</SelectItem>
                  <SelectItem value="Rectal">Rectal</SelectItem>
                  <SelectItem value="Vaginal">Vaginal</SelectItem>
                  <SelectItem value="Oftálmica">Oftálmica</SelectItem>
                  <SelectItem value="Ótica">Ótica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frecuencia">Frecuencia <span className="text-destructive">*</span></Label>
              <Input id="frecuencia" name="frecuencia" type="number" min="1" value={formData.frecuencia} onChange={handleChange} placeholder="Ej: Cada 8..." required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unidadFrecuencia">Unidad de Frecuencia <span className="text-destructive">*</span></Label>
              <Select name="unidadFrecuencia" value={formData.unidadFrecuencia} onValueChange={(value) => handleSelectChange("unidadFrecuencia", value)}>
                <SelectTrigger><SelectValue placeholder="Seleccionar unidad" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="horas">Horas</SelectItem>
                  <SelectItem value="dias">Días</SelectItem>
                  <SelectItem value="semanas">Semanas</SelectItem>
                  <SelectItem value="meses">Meses</SelectItem>
                  <SelectItem value="vecesAlDia">Veces al día</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="instruccionesAdicionales">Instrucciones Adicionales</Label>
            <Input id="instruccionesAdicionales" name="instruccionesAdicionales" value={formData.instruccionesAdicionales} onChange={handleChange} placeholder="Ej: Tomar con alimentos" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="efectosSecundarios">Efectos Secundarios Comunes</Label>
            <Input id="efectosSecundarios" name="efectosSecundarios" value={formData.efectosSecundarios} onChange={handleChange} placeholder="Ej: Mareos, náuseas" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="categoria">Categoría</Label>
              <Select name="categoria" value={formData.categoria} onValueChange={(value) => handleSelectChange("categoria", value)}>
              <SelectTrigger><SelectValue placeholder="Seleccionar categoría" /></SelectTrigger>
              <SelectContent>
                  <SelectItem value="Analgésico">Analgésico</SelectItem>
                  <SelectItem value="Antibiótico">Antibiótico</SelectItem>
                  <SelectItem value="Antiinflamatorio">Antiinflamatorio</SelectItem>
                  <SelectItem value="Antihistamínico">Antihistamínico</SelectItem>
                  <SelectItem value="Antihipertensivo">Antihipertensivo</SelectItem>
                  <SelectItem value="Antidepresivo">Antidepresivo</SelectItem>
                  <SelectItem value="Antidiabético">Antidiabético</SelectItem>
                  <SelectItem value="Broncodilatador">Broncodilatador</SelectItem>
                  <SelectItem value="Vitamina">Vitamina/Suplemento</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaInicio">Fecha de Inicio Tratamiento</Label>
              <Input id="fechaInicio" name="fechaInicio" type="date" value={formData.fechaInicio} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fechaFin">Fecha de Fin Tratamiento (Opcional)</Label>
              <Input id="fechaFin" name="fechaFin" type="date" value={formData.fechaFin} onChange={handleChange} />
            </div>
          </div>
           <div className="space-y-2">
              <Label htmlFor="notas">Notas Adicionales</Label>
              <Input id="notas" name="notas" value={formData.notas} onChange={handleChange} placeholder="Ej: Recetado por Dr. Pérez" />
            </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Switch id="activo" name="activo" checked={formData.activo} onCheckedChange={(checked) => handleSelectChange("activo", checked)} />
            <Label htmlFor="activo">Medicamento Activo (en uso actual)</Label>
          </div>
          
          <DialogFooter className="pt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
              {medicamento ? "Actualizar Medicamento" : "Guardar Medicamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <Dialog open={detectedInteractions.length > 0} onOpenChange={(open) => { if (!open) setDetectedInteractions([]); }}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="text-xl font-bold text-destructive">¡Atención! Posibles Interacciones</DialogTitle>
                <DialogDescription>
                    Se han detectado las siguientes interacciones potenciales con tus medicamentos activos:
                </DialogDescription>
            </DialogHeader>
            <div className="py-2 space-y-2 max-h-60 overflow-y-auto">
                {detectedInteractions.map(inter => (
                    <div key={inter.id} className="p-2 border rounded-md bg-yellow-50 border-yellow-200">
                        <p className="font-semibold">{inter.medicamento1} + {inter.medicamento2}</p>
                        <p className="text-sm"><span className="font-medium">Severidad:</span> {inter.severidad}</p>
                        <p className="text-sm">{inter.descripcion}</p>
                    </div>
                ))}
            </div>
             <p className="text-xs text-muted-foreground mt-2">
                Esta información es orientativa. Consulta siempre a tu médico o farmacéutico.
            </p>
            <DialogFooter>
                <Button variant="outline" onClick={() => setDetectedInteractions([])}>Cancelar</Button>
                <Button variant="destructive" onClick={handleConfirmSaveWithInteractions}>Guardar de todas formas</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
};

export default MedicamentoForm;
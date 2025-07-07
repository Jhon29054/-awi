
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const InteraccionForm = ({ interaccion, isOpen, onClose, onSave, allMedicamentos }) => {
  const [medicamento1, setMedicamento1] = useState('');
  const [medicamento2, setMedicamento2] = useState('');
  const [severidad, setSeveridad] = useState('media');
  const [descripcion, setDescripcion] = useState('');
  const [id, setId] = useState(null);
  const [availableMedicamentos, setAvailableMedicamentos] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const uniqueMedNombres = Array.from(new Set((allMedicamentos || []).map(m => m.nombre.trim()).filter(Boolean)));
      setAvailableMedicamentos(uniqueMedNombres);

      if (interaccion) {
        setMedicamento1(interaccion.medicamento1 || '');
        setMedicamento2(interaccion.medicamento2 || '');
        setSeveridad(interaccion.severidad || 'media');
        setDescripcion(interaccion.descripcion || '');
        setId(interaccion.id || null);
      } else {
        setMedicamento1('');
        setMedicamento2('');
        setSeveridad('media');
        setDescripcion('');
        setId(null);
      }
    }
  }, [interaccion, isOpen, allMedicamentos]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!medicamento1 || !medicamento2 || !descripcion) {
      alert('Por favor, completa todos los campos obligatorios.');
      return;
    }
    if (medicamento1.toLowerCase() === medicamento2.toLowerCase()) {
      alert('Los medicamentos 1 y 2 no pueden ser iguales.');
      return;
    }
    onSave({ id, medicamento1, medicamento2, severidad, descripcion });
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-card shadow-xl rounded-lg">
        <DialogHeader className="text-center pt-4">
           <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="mx-auto mb-4 p-3 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 rounded-full text-white inline-block"
          >
            <AlertTriangle size={32} />
          </motion.div>
          <DialogTitle className="text-2xl font-bold gradient-text">{id ? 'Editar Interacción' : 'Añadir Nueva Interacción'}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Define una interacción conocida entre dos medicamentos.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="medicamento1">Medicamento 1</Label>
              <Select value={medicamento1} onValueChange={setMedicamento1}>
                <SelectTrigger id="medicamento1">
                  <SelectValue placeholder="Selecciona Medicamento 1" />
                </SelectTrigger>
                <SelectContent>
                  {availableMedicamentos.map(nombre => (
                    <SelectItem key={`med1-${nombre}`} value={nombre}>{nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input 
                type="text" 
                value={medicamento1} 
                onChange={(e) => setMedicamento1(e.target.value)} 
                placeholder="O escribe el nombre"
                className="mt-1" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medicamento2">Medicamento 2</Label>
               <Select value={medicamento2} onValueChange={setMedicamento2}>
                <SelectTrigger id="medicamento2">
                  <SelectValue placeholder="Selecciona Medicamento 2" />
                </SelectTrigger>
                <SelectContent>
                  {availableMedicamentos.map(nombre => (
                    <SelectItem key={`med2-${nombre}`} value={nombre}>{nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input 
                type="text" 
                value={medicamento2} 
                onChange={(e) => setMedicamento2(e.target.value)} 
                placeholder="O escribe el nombre"
                className="mt-1" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="severidad">Severidad</Label>
            <Select value={severidad} onValueChange={setSeveridad}>
              <SelectTrigger id="severidad">
                <SelectValue placeholder="Selecciona la severidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="baja">Baja</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción de la Interacción</Label>
            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe la interacción y sus posibles efectos..."
              className="w-full min-h-[100px] p-2 border rounded-md bg-background focus:ring-primary focus:border-primary"
              required
            />
          </div>

          <DialogFooter className="pt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white">
              {id ? 'Actualizar Interacción' : 'Guardar Interacción'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InteraccionForm;

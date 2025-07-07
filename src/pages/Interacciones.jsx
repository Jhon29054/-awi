import React, { useState, useEffect, useCallback } from "react";
import InteraccionesTable from "@/components/InteraccionesTable";
import { getMedicamentos, getInteracciones as getInteraccionesStorage, saveInteraccion, deleteInteraccion } from "@/lib/storage"; 
import { getCurrentUser } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";

const Interacciones = ({ userId: propUserId }) => {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState(null);
  const [userMedicamentos, setUserMedicamentos] = useState([]);
  const [userInteracciones, setUserInteracciones] = useState([]);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  const effectiveUserId = propUserId || currentUser?.id;

  const loadClientData = useCallback(() => {
    if (effectiveUserId) {
      const meds = getMedicamentos(effectiveUserId);
      setUserMedicamentos(meds);
      const interacciones = getInteraccionesStorage(effectiveUserId);
      setUserInteracciones(interacciones);
    }
  }, [effectiveUserId]);

  useEffect(() => {
    loadClientData();
  }, [loadClientData]);

  const handleDataChange = () => {
    loadClientData(); // Recarga los datos cuando algo cambia
  };
  
  const handleSaveInteraccion = (interaccionData) => {
    if (!effectiveUserId) {
      toast({ title: "Error", description: "Usuario no identificado para guardar interacción.", variant: "destructive"});
      return;
    }
    saveInteraccion(interaccionData, effectiveUserId);
    toast({
      title: interaccionData.id ? "Interacción Actualizada" : "Interacción Añadida",
      description: "La interacción ha sido guardada correctamente.",
      className: "bg-green-500 text-white"
    });
    handleDataChange();
  };

  const handleDeleteInteraccion = (interaccionId) => {
    if (!effectiveUserId) {
      toast({ title: "Error", description: "Usuario no identificado para eliminar interacción.", variant: "destructive"});
      return;
    }
    deleteInteraccion(interaccionId, effectiveUserId);
    toast({
      title: "Interacción Eliminada",
      description: "La interacción ha sido eliminada.",
      variant: "destructive"
    });
    handleDataChange();
  };


  return (
    <div className="space-y-6 pt-8">
      <InteraccionesTable 
        userId={effectiveUserId} 
        interaccionesData={userInteracciones}
        medicamentosParaFormulario={userMedicamentos} 
        onSave={handleSaveInteraccion}
        onDelete={handleDeleteInteraccion}
        onDataChange={handleDataChange} 
      />

      <div className="p-6 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700/50 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-300 mb-2">Importancia de conocer las interacciones</h3>
        <p className="text-orange-700 dark:text-orange-400 mb-4">
          Algunos medicamentos pueden interactuar entre sí, alterando su efectividad o causando efectos secundarios. Es crucial estar informado.
        </p>
        <ul className="space-y-2 text-sm text-orange-600 dark:text-orange-500 list-disc list-inside">
          <li>Las interacciones pueden aumentar o disminuir el efecto de un medicamento.</li>
          <li>Pueden provocar efectos adversos inesperados.</li>
          <li>Ciertos alimentos o suplementos también pueden interactuar con tus medicamentos.</li>
          <li>Informa siempre a tu médico y farmacéutico sobre todos los medicamentos y suplementos que tomas.</li>
          <li>No dejes de tomar un medicamento prescrito sin consultar a tu médico.</li>
        </ul>
        <p className="mt-4 text-xs text-orange-500 dark:text-orange-600">
          La información proporcionada aquí es orientativa y no reemplaza el consejo médico profesional.
        </p>
      </div>
    </div>
  );
};

export default Interacciones;

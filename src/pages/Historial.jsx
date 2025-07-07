import React, { useState, useEffect } from "react"; // Importar useState y useEffect
import HistorialTable from "@/components/HistorialTable"; 
import { getCurrentUser } from "@/lib/auth"; // Para obtener el userId

const Historial = ({ userId: propUserId, key: propKey }) => { // Recibir key como prop
  const [currentUser, setCurrentUser] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Estado para forzar actualización

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    // Escuchar un evento personalizado para refrescar el historial
    const handleHistorialUpdated = () => {
      setRefreshTrigger(prev => prev + 1);
    };
    window.addEventListener('historialUpdated', handleHistorialUpdated);
    return () => {
      window.removeEventListener('historialUpdated', handleHistorialUpdated);
    };
  }, []);

  // Usar propUserId si está disponible, de lo contrario, el del currentUser
  const effectiveUserId = propUserId || currentUser?.id;

  return (
    <div className="space-y-6 pt-8">
      {/* Pasar una key que cambie para forzar la re-renderización de HistorialTable */}
      <HistorialTable userId={effectiveUserId} key={propKey || refreshTrigger} />
      
      <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-emerald-700 mb-2">Beneficios del seguimiento</h3>
        <p className="text-emerald-700 mb-4">
          Mantener un historial detallado de tu medicación proporciona múltiples beneficios para tu salud.
        </p>
        <ul className="space-y-2 text-sm text-emerald-600 list-disc list-inside">
          <li>Ayuda a identificar patrones en tu tratamiento y respuesta a los medicamentos.</li>
          <li>Proporciona información valiosa para tu médico durante las consultas.</li>
          <li>Permite detectar posibles problemas de adherencia al tratamiento.</li>
          <li>Facilita la comunicación con diferentes profesionales de la salud.</li>
          <li>Contribuye a prevenir errores en la medicación y duplicaciones.</li>
        </ul>
      </div>
    </div>
  );
};

export default Historial;

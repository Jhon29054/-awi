import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, Edit, Trash2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";

const RecordatorioCard = ({ recordatorio, onEdit, onDelete, onMarcarTomado }) => {
  const fechaHora = new Date(recordatorio.fechaHora);
  const esFuturo = fechaHora > new Date();
  const esHoy = new Date().toDateString() === fechaHora.toDateString();
  
  // Determinar el estado del recordatorio
  let estado = "pendiente";
  if (recordatorio.tomado) {
    estado = "tomado";
  } else if (!esFuturo && !esHoy) {
    estado = "vencido";
  } else if (esHoy) {
    estado = "hoy";
  }
  
  // Clases según el estado
  const getEstadoClase = () => {
    switch (estado) {
      case "tomado": return "pill-success";
      case "vencido": return "pill-danger";
      case "hoy": return "pill-warning";
      default: return "pill-primary";
    }
  };
  
  // Texto según el estado
  const getEstadoTexto = () => {
    switch (estado) {
      case "tomado": return "Tomado";
      case "vencido": return "Vencido";
      case "hoy": return "Hoy";
      default: return "Pendiente";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`overflow-hidden card-hover ${recordatorio.tomado ? "opacity-60" : ""}`}>
        <div className={`h-2 ${
          estado === "tomado" 
            ? "bg-emerald-500" 
            : estado === "vencido" 
              ? "bg-destructive" 
              : estado === "hoy" 
                ? "bg-amber-500" 
                : "bg-gradient-to-r from-primary to-blue-600"
        }`}></div>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold">{recordatorio.medicamentoNombre}</h3>
              <p className="text-sm text-muted-foreground">
                {recordatorio.dosis} {recordatorio.unidad}
              </p>
            </div>
            <div className={`pill ${getEstadoClase()}`}>
              {getEstadoTexto()}
            </div>
          </div>
          
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm">
                {format(fechaHora, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm">
                {format(fechaHora, "HH:mm", { locale: es })} hrs
              </span>
            </div>
          </div>
          
          {recordatorio.notas && (
            <div className="text-sm border-t pt-3 mt-3">
              <p><span className="font-medium">Notas:</span> {recordatorio.notas}</p>
            </div>
          )}
          
          {recordatorio.tomado && recordatorio.fechaTomado && (
            <div className="text-sm text-emerald-600 flex items-center gap-1 mt-3">
              <CheckCircle2 className="h-4 w-4" />
              <span>
                Tomado el {format(new Date(recordatorio.fechaTomado), "dd/MM/yyyy HH:mm", { locale: es })}
              </span>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="p-4 pt-0 border-t flex justify-end gap-2">
          {!recordatorio.tomado && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
              onClick={() => onMarcarTomado(recordatorio.id)}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" /> Marcar como tomado
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => onEdit(recordatorio)}>
            <Edit className="h-4 w-4 mr-1" /> Editar
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(recordatorio.id)}>
            <Trash2 className="h-4 w-4 mr-1" /> Eliminar
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default RecordatorioCard;
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pill, Clock, Calendar, Edit, Trash2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";

const MedicamentoCard = ({ medicamento, onEdit, onDelete }) => {
  const fechaInicio = new Date(medicamento.fechaInicio);
  const fechaFin = medicamento.fechaFin ? new Date(medicamento.fechaFin) : null;
  
  const getFrecuenciaTexto = (frecuencia) => {
    const frecuencias = {
      diaria: "Diaria",
      cada12h: "Cada 12 horas",
      cada8h: "Cada 8 horas",
      cada6h: "Cada 6 horas",
      semanal: "Semanal",
      mensual: "Mensual",
      segunNecesidad: "Según necesidad"
    };
    return frecuencias[frecuencia] || frecuencia;
  };
  
  const getViaTexto = (via) => {
    const vias = {
      oral: "Oral",
      sublingual: "Sublingual",
      topica: "Tópica",
      inhalada: "Inhalada",
      inyectable: "Inyectable",
      rectal: "Rectal",
      oftalmico: "Oftálmico"
    };
    return vias[via] || via;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`overflow-hidden card-hover ${medicamento.activo ? "" : "opacity-60"}`}>
        <div className="h-2 bg-gradient-to-r from-primary to-blue-600"></div>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold">{medicamento.nombre}</h3>
              <p className="text-sm text-muted-foreground">{medicamento.descripcion}</p>
            </div>
            <div className={`pill ${medicamento.activo ? "pill-success" : "pill-danger"}`}>
              {medicamento.activo ? "Activo" : "Inactivo"}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Pill className="h-4 w-4 text-primary" />
              <span className="text-sm">{medicamento.dosis} {medicamento.unidad}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm">{getFrecuenciaTexto(medicamento.frecuencia)}</span>
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm">
                Desde: {format(fechaInicio, "dd MMM yyyy", { locale: es })}
                {fechaFin && ` - Hasta: ${format(fechaFin, "dd MMM yyyy", { locale: es })}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Vía:</span>
              <span className="text-sm">{getViaTexto(medicamento.via)}</span>
            </div>
          </div>
          
          {(medicamento.instrucciones || medicamento.efectosSecundarios) && (
            <div className="space-y-2 text-sm border-t pt-3 mt-3">
              {medicamento.instrucciones && (
                <p><span className="font-medium">Instrucciones:</span> {medicamento.instrucciones}</p>
              )}
              {medicamento.efectosSecundarios && (
                <div className="flex items-start gap-1">
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p><span className="font-medium">Efectos secundarios:</span> {medicamento.efectosSecundarios}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="p-4 pt-0 border-t flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(medicamento)}>
            <Edit className="h-4 w-4 mr-1" /> Editar
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(medicamento.id)}>
            <Trash2 className="h-4 w-4 mr-1" /> Eliminar
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default MedicamentoCard;
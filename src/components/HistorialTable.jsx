import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getHistorial, deleteHistorial } from "@/lib/storage"; 
import { History, CheckCircle2, Calendar, Search, Download, Trash2, Filter } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle as DialogTitleShad, DialogFooter as DialogFooterShad, DialogDescription as DialogDescriptionShad } from "@/components/ui/dialog";


const HistorialTable = ({ userId }) => { 
  const { toast } = useToast();
  const [historial, setHistorial] = useState([]);
  const [filteredHistorial, setFilteredHistorial] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const loadHistorial = () => {
    if (!userId) return; 
    const historialData = getHistorial(userId); 
    const historialOrdenado = [...historialData].sort((a, b) => 
      new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
    setHistorial(historialOrdenado);
  };

  useEffect(() => {
    loadHistorial();
  }, [userId]); 

  useEffect(() => {
    filterHistorial();
  }, [searchTerm, filtroTipo, fechaDesde, fechaHasta, historial]);

  const filterHistorial = () => {
    let filtered = historial;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.medicamentoNombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filtroTipo !== "todos") {
      filtered = filtered.filter(item => 
        (filtroTipo === "programados" && item.programado) ||
        (filtroTipo === "manuales" && !item.programado)
      );
    }

    if (fechaDesde) {
      const desde = parseISO(fechaDesde + "T00:00:00");
      filtered = filtered.filter(item => new Date(item.fecha) >= desde);
    }

    if (fechaHasta) {
      const hasta = parseISO(fechaHasta + "T23:59:59");
      filtered = filtered.filter(item => new Date(item.fecha) <= hasta);
    }
    
    setFilteredHistorial(filtered);
  };

  const exportToPDF = () => {
    if (!userId) {
        toast({ title: "Error", description: "No se pudo identificar al usuario para exportar el historial.", variant: "destructive" });
        return;
    }
    const doc = new jsPDF();
    doc.text("Historial de Medicación - RecordaMedic", 14, 16);
    doc.setFontSize(10);
    doc.text(`Exportado el: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}`, 14, 22);

    const tableColumn = ["Medicamento", "Dosis", "Fecha y Hora", "Tipo"];
    const tableRows = [];

    filteredHistorial.forEach(item => {
      const itemData = [
        item.medicamentoNombre,
        `${item.dosis} ${item.unidad || ''}`,
        format(new Date(item.fecha), "dd MMM yyyy, HH:mm", { locale: es }),
        item.programado ? "Programado" : "Manual"
      ];
      tableRows.push(itemData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'grid',
      headStyles: { fillColor: [22, 160, 133] }, 
      styles: { fontSize: 9, cellPadding: 2 },
    });
    doc.save("historial_medicacion_recordamedic.pdf");
    toast({ title: "Exportación Exitosa", description: "El historial ha sido exportado a PDF." });
  };

  const handleBorrarHistorial = () => {
    if (!userId) {
        toast({ title: "Error", description: "No se pudo identificar al usuario para borrar el historial.", variant: "destructive" });
        return;
    }
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteHistorial = () => {
    if (!userId) return;
    deleteHistorial(userId); 
    loadHistorial(); 
    toast({
      title: "Historial Borrado",
      description: "Todos los registros del historial han sido eliminados.",
      variant: "destructive"
    });
    setIsDeleteDialogOpen(false);
  };


  return (
    <Card className="overflow-hidden shadow-xl border-t-4 border-primary">
      <CardHeader className="bg-gradient-to-br from-primary/10 via-background to-background p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="text-3xl font-extrabold gradient-text flex items-center">
              <History className="h-8 w-8 mr-3 text-primary" />
              Historial de Registros
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground mt-1">
              Consulta y gestiona todos los registros de toma de medicamentos.
            </CardDescription>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={exportToPDF} variant="outline" className="border-emerald-500 text-emerald-600 hover:bg-emerald-500/10">
              <Download className="h-4 w-4 mr-2" /> Exportar PDF
            </Button>
            <Button onClick={handleBorrarHistorial} variant="destructive" className="bg-red-600 hover:bg-red-700">
              <Trash2 className="h-4 w-4 mr-2" /> Borrar Historial
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end p-4 border rounded-lg bg-muted/20 shadow-sm">
          <div className="relative col-span-1 md:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Buscar por medicamento..."
              className="pl-10 py-2.5 text-base rounded-md shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="fechaDesde" className="block text-sm font-medium text-muted-foreground mb-1">Desde:</label>
            <Input
              id="fechaDesde"
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="py-2.5 text-base rounded-md shadow-inner"
            />
          </div>
          <div>
            <label htmlFor="fechaHasta" className="block text-sm font-medium text-muted-foreground mb-1">Hasta:</label>
            <Input
              id="fechaHasta"
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="py-2.5 text-base rounded-md shadow-inner"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-muted-foreground h-5 w-5" />
            <div className="flex gap-2 w-full justify-end md:w-auto">
              <Button
                variant={filtroTipo === "todos" ? "default" : "outline"}
                size="sm"
                className="rounded-md text-sm"
                onClick={() => setFiltroTipo("todos")}
              >
                Todos
              </Button>
              <Button
                variant={filtroTipo === "programados" ? "default" : "outline"}
                size="sm"
                className="rounded-md text-sm"
                onClick={() => setFiltroTipo("programados")}
              >
                Programados
              </Button>
            </div>
          </div>
        </div>
        
        {filteredHistorial.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground bg-background rounded-lg shadow-inner">
            <History className="mx-auto h-16 w-16 text-primary/30 mb-6" />
            <p className="text-2xl font-semibold mb-2">No se encontraron registros en el historial</p>
            <p className="text-lg">
              {searchTerm || fechaDesde || fechaHasta || filtroTipo !== "todos"
                ? "Intenta ajustar tus filtros de búsqueda."
                : "El historial se generará automáticamente cuando tomes tus medicamentos."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border shadow-md">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-3.5 px-6 font-semibold text-sm text-muted-foreground">Medicamento</th>
                  <th className="text-left py-3.5 px-6 font-semibold text-sm text-muted-foreground">Dosis</th>
                  <th className="text-left py-3.5 px-6 font-semibold text-sm text-muted-foreground">Fecha y Hora</th>
                  <th className="text-center py-3.5 px-6 font-semibold text-sm text-muted-foreground">Tipo</th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                {filteredHistorial.map((item, index) => (
                  <motion.tr 
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
                    className="hover:bg-muted/30 transition-colors duration-150"
                  >
                    <td className="py-4 px-6 font-medium text-foreground">{item.medicamentoNombre}</td>
                    <td className="py-4 px-6 text-muted-foreground">{item.dosis} {item.unidad || ''}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4 text-primary/70" />
                        <span>{format(new Date(item.fecha), "dd MMM yyyy, HH:mm", { locale: es })}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                        item.programado 
                          ? "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" 
                          : "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
                      }`}>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{item.programado ? "Programado" : "Manual"}</span>
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitleShad className="text-xl font-bold text-destructive">Confirmar Borrado Total del Historial</DialogTitleShad>
            <DialogDescriptionShad>
              Esta acción es irreversible y eliminará todos los registros de medicación.
            </DialogDescriptionShad>
          </DialogHeader>
          <div className="py-4">
            <p>¿Estás absolutamente seguro de que deseas borrar TODO el historial de medicación?</p>
            <p className="text-sm text-muted-foreground mt-2">No podrás recuperar esta información una vez eliminada.</p>
          </div>
          <DialogFooterShad>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDeleteHistorial}>Sí, Borrar Todo</Button>
          </DialogFooterShad>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default HistorialTable;

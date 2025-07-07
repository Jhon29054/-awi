import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Pill as PillIcon, BellMinus as BellIcon, FileArchive as ArchiveIcon, AlertTriangle as AlertTriangleIcon, History as HistoryIcon, Edit, Trash2, PlusCircle, Download, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const AdminClientDetails = ({ client, onBack, onRefreshData, globalMedicamentos, setModalState, toast }) => {
  const [activeClientTab, setActiveClientTab] = useState("medicamentos");

  const handleOpenForm = (type, data = null) => {
    let modalUpdate = {};
    switch(type) {
      case 'medicamento':
        modalUpdate = { currentMedicamentoForForm: data, isMedicamentoFormOpen: true };
        break;
      case 'recordatorio':
        modalUpdate = { currentRecordatorioForForm: data, isRecordatorioFormOpen: true };
        break;
      case 'inventario':
        const medForInv = globalMedicamentos.find(m => m.id === data?.medicamentoId);
        modalUpdate = { currentInventarioForForm: data ? {...data, medicamentoNombre: medForInv?.nombre } : null, isInventarioFormOpen: true };
        break;
      case 'interaccion':
        modalUpdate = { currentInteraccionForForm: data, isInteraccionFormOpen: true };
        break;
      default:
        return;
    }
    setModalState(modalUpdate);
  };

  const openDeleteDialog = (id, type) => {
    setModalState({ itemToDelete: { id, type }, deleteDialogType: type });
  };

  const handleMarkTaken = (recordatorioId) => {
    setModalState({ itemToMarkTaken: recordatorioId });
  };

  const exportClientDataToPDF = () => {
    if (!client) return;
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.setTextColor(40, 58, 90); 
    doc.text(`Informe Cliente: ${client.username}`, 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text(`Email: ${client.email}`, 14, 30);
    doc.text(`ID: ${client.id}`, 14, 36);
    doc.text(`Fecha de Exportación: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`, 14, 42);

    let yPos = 55;

    const addSectionToPdf = (title, columns, data, emptyMessage) => {
      if (yPos > 260) { doc.addPage(); yPos = 20; }
      doc.setFontSize(16);
      doc.setTextColor(22, 160, 133);
      doc.text(title, 14, yPos);
      yPos += 10;
      if (data && data.length > 0) {
        doc.autoTable({
          startY: yPos,
          head: [columns.map(col => col.header)],
          body: data.map(item => columns.map(col => col.accessor(item) ?? '-')),
          theme: 'grid',
          headStyles: { fillColor: [22, 160, 133], textColor: 255, fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 2 },
          alternateRowStyles: { fillColor: [240, 249, 255] },
        });
        yPos = doc.lastAutoTable.finalY + 12;
      } else {
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(emptyMessage, 14, yPos);
        yPos += 10;
      }
    };
    
    addSectionToPdf("Medicamentos", 
      [
        { header: 'Nombre', accessor: item => item.nombre },
        { header: 'Dosis', accessor: item => `${item.dosis} ${item.unidad}` },
        { header: 'Frecuencia', accessor: item => `${item.frecuencia} ${item.unidadFrecuencia}` },
        { header: 'Vía', accessor: item => item.viaAdmin },
        { header: 'Notas', accessor: item => item.notas },
      ], 
      client.medicamentos, "No hay medicamentos registrados."
    );

    addSectionToPdf("Recordatorios",
      [
        { header: 'Medicamento', accessor: item => item.medicamentoNombre },
        { header: 'Fecha/Hora', accessor: item => format(new Date(item.fechaHora), "dd/MM/yy HH:mm", { locale: es }) },
        { header: 'Dosis', accessor: item => `${item.dosis} ${item.unidad}` },
        { header: 'Estado', accessor: item => item.tomado ? 'Tomado' : 'Pendiente' },
      ],
      client.recordatorios, "No hay recordatorios registrados."
    );
    
    const inventarioData = client.inventario?.map(item => {
        const med = client.medicamentos?.find(m => m.id === item.medicamentoId);
        return { ...item, medicamentoNombre: med?.nombre || 'Desconocido' };
    });
    addSectionToPdf("Inventario",
      [
        { header: 'Medicamento', accessor: item => item.medicamentoNombre },
        { header: 'Cantidad', accessor: item => item.cantidad },
        { header: 'Caducidad', accessor: item => item.fechaCaducidad ? format(new Date(item.fechaCaducidad), "dd/MM/yyyy", { locale: es }) : '-' },
        { header: 'Notas', accessor: item => item.notas },
      ],
      inventarioData, "No hay ítems en el inventario."
    );

    addSectionToPdf("Interacciones",
      [
        { header: 'Med 1', accessor: item => item.medicamento1 },
        { header: 'Med 2', accessor: item => item.medicamento2 },
        { header: 'Severidad', accessor: item => item.severidad },
        { header: 'Descripción', accessor: item => item.descripcion },
      ],
      client.interacciones, "No hay interacciones registradas."
    );
    
    addSectionToPdf("Historial de Tomas",
      [
        { header: 'Medicamento', accessor: item => item.medicamentoNombre },
        { header: 'Dosis', accessor: item => `${item.dosis} ${item.unidad}` },
        { header: 'Fecha', accessor: item => format(new Date(item.fecha), "dd/MM/yy HH:mm", { locale: es }) },
      ],
      client.historial, "No hay historial de tomas."
    );

    doc.save(`Informe_RecordaMedic_${client.username.replace(/\s/g, '_')}.pdf`);
    toast({ title: "PDF Exportado", description: "El informe del cliente ha sido generado.", className: "bg-green-500 text-white" });
  };

  const ActionButtons = ({ onEdit, onDelete }) => (
    <div className="flex gap-1">
      {onEdit && (
        <Button variant="ghost" size="icon" onClick={onEdit} className="text-sky-600 hover:text-sky-700 hover:bg-sky-100 dark:hover:bg-sky-800/50 rounded-full">
          <Edit className="h-4 w-4"/>
        </Button>
      )}
      <Button variant="ghost" size="icon" onClick={onDelete} className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-800/50 rounded-full">
        <Trash2 className="h-4 w-4"/>
      </Button>
    </div>
  );

  const tabItems = [
    { value: "medicamentos", label: "Medicamentos", icon: PillIcon, data: client.medicamentos, cols: [
        { header: 'Nombre', accessor: item => item.nombre }, { header: 'Dosis', accessor: item => `${item.dosis} ${item.unidad}` }, 
        { header: 'Frec.', accessor: item => `${item.frecuencia} ${item.unidadFrecuencia?.substring(0,3)}.` }, { header: 'Vía', accessor: item => item.viaAdmin },
      ], formType: 'medicamento' },
    { value: "recordatorios", label: "Recordatorios", icon: BellIcon, data: client.recordatorios, cols: [
        { header: 'Medicamento', accessor: item => item.medicamentoNombre }, { header: 'Fecha/Hora', accessor: item => format(new Date(item.fechaHora), "dd/MM HH:mm", { locale: es }) },
        { header: 'Dosis', accessor: item => `${item.dosis} ${item.unidad}` }, { header: 'Estado', accessor: item => (
            <Button variant={item.tomado ? "secondary" : "outline"} size="xs" className={`text-xs ${item.tomado ? 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100' : 'bg-amber-100 text-amber-700 dark:bg-amber-700 dark:text-amber-100'}`} onClick={() => !item.tomado && handleMarkTaken(item.id)} disabled={item.tomado}>
                {item.tomado ? 'Tomado' : 'Marcar Tomado'}
            </Button>
        )},
      ], formType: 'recordatorio' },
    { value: "inventario", label: "Inventario", icon: ArchiveIcon, data: client.inventario?.map(i => ({...i, medicamentoNombre: globalMedicamentos.find(m => m.id === i.medicamentoId)?.nombre || 'N/A' })), cols: [
        { header: 'Medicamento', accessor: item => item.medicamentoNombre }, { header: 'Cantidad', accessor: item => item.cantidad },
        { header: 'Caducidad', accessor: item => item.fechaCaducidad ? format(new Date(item.fechaCaducidad), "dd/MM/yy", { locale: es }) : '-' },
      ], formType: 'inventario' },
    { value: "interacciones", label: "Interacciones", icon: AlertTriangleIcon, data: client.interacciones, cols: [
        { header: 'Med 1', accessor: item => item.medicamento1 }, { header: 'Med 2', accessor: item => item.medicamento2 },
        { header: 'Severidad', accessor: item => <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.severidad === 'alta' ? 'bg-red-100 text-red-700' : item.severidad === 'media' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{item.severidad}</span> },
      ], formType: 'interaccion' },
    { value: "historial", label: "Historial", icon: HistoryIcon, data: client.historial, cols: [
        { header: 'Medicamento', accessor: item => item.medicamentoNombre }, { header: 'Dosis', accessor: item => `${item.dosis} ${item.unidad}` },
        { header: 'Fecha', accessor: item => format(new Date(item.fecha), "dd/MM/yy HH:mm", { locale: es }) },
      ], formType: 'historial' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }} 
      animate={{ opacity: 1, x: 0 }} 
      transition={{ duration: 0.3 }}
      className="space-y-6 p-4 md:p-8 bg-gradient-to-br from-slate-50 to-sky-100 dark:from-slate-900 dark:to-sky-950 min-h-screen"
    >
      <div className="flex flex-wrap justify-between items-center gap-4 mb-2">
        <Button onClick={onBack} variant="outline" className="shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-800">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Gestión de Clientes
        </Button>
        <Button onClick={exportClientDataToPDF} variant="default" className="shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white">
          <Download className="mr-2 h-4 w-4" /> Exportar PDF
        </Button>
      </div>

      <Card className="shadow-2xl rounded-xl border-0 overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg">
        <CardHeader className="bg-gradient-to-br from-primary via-sky-500 to-indigo-600 text-white p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full">
              <Users size={36} className="text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl md:text-4xl font-bold">{client.username}</CardTitle>
              <CardDescription className="text-indigo-100 text-sm md:text-base">
                ID: {client.id} | Email: {client.email}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeClientTab} onValueChange={setActiveClientTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 rounded-none border-b bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300">
              {tabItems.map(tab => (
                <TabsTrigger 
                  key={tab.value} 
                  value={tab.value} 
                  className="py-3.5 text-sm font-semibold data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-primary/10 dark:data-[state=active]:bg-primary/20 rounded-none transition-all duration-200 ease-in-out hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <tab.icon className="mr-2 h-5 w-5"/>{tab.label} ({tab.data?.length || 0})
                </TabsTrigger>
              ))}
            </TabsList>
            
            <div className="p-4 md:p-6">
              {tabItems.map(tab => (
                <TabsContent key={tab.value} value={tab.value}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl md:text-2xl font-semibold text-slate-700 dark:text-slate-200">{tab.label} del Cliente</h3>
                    {tab.formType !== 'historial' && (
                       <Button onClick={() => handleOpenForm(tab.formType)} className="bg-gradient-to-r from-primary to-sky-500 hover:from-primary/90 hover:to-sky-500/90 text-white shadow-md hover:shadow-lg transition-shadow">
                         <PlusCircle className="mr-2 h-4 w-4" />Añadir {tab.label.slice(0, -1)}
                       </Button>
                    )}
                  </div>
                  {tab.data && tab.data.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg border shadow-sm">
                    <Table className="min-w-full">
                      <TableHeader className="bg-slate-50 dark:bg-slate-700/80">
                        <TableRow>
                          {tab.cols.map(col => <TableHead key={col.header} className="text-slate-600 dark:text-slate-300 font-semibold">{col.header}</TableHead>)}
                          <TableHead className="text-right text-slate-600 dark:text-slate-300 font-semibold">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tab.data.map((item, index) => (
                          <TableRow key={item.id || index} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                            {tab.cols.map(col => <TableCell key={`${col.header}-${item.id || index}`} className="text-slate-700 dark:text-slate-300 text-sm">{typeof col.accessor === 'function' ? col.accessor(item) : item[col.accessor]}</TableCell>)}
                            <TableCell className="text-right">
                              <ActionButtons 
                                onEdit={tab.formType !== 'historial' ? () => handleOpenForm(tab.formType, item) : undefined}
                                onDelete={() => openDeleteDialog(item.id || item.medicamentoId, tab.formType)}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    </div>
                  ) : <p className="text-muted-foreground text-center py-8 text-lg">No hay {tab.label.toLowerCase()} registrados para este cliente.</p>}
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminClientDetails;
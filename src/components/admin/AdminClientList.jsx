
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, User, ListChecks, Pill as PillIcon, BellRing as BellIcon, Archive as ArchiveIcon, AlertTriangle as AlertTriangleIcon, History as HistoryIcon, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const StatIcon = ({ type }) => {
  const icons = {
    meds: <PillIcon className="h-3.5 w-3.5 text-green-500" />,
    record: <BellIcon className="h-3.5 w-3.5 text-yellow-500" />,
    inv: <ArchiveIcon className="h-3.5 w-3.5 text-blue-500" />,
    interac: <AlertTriangleIcon className="h-3.5 w-3.5 text-orange-500" />,
    hist: <HistoryIcon className="h-3.5 w-3.5 text-purple-500" />,
  };
  const IconComponent = icons[type] || <ListChecks className="h-3.5 w-3.5 text-slate-500" />;
  return <span className="mr-1">{IconComponent}</span>;
};


const ClientStat = ({ type, count }) => {
  const labels = {
    meds: 'Meds',
    record: 'Record.',
    inv: 'Inv.',
    interac: 'Interac.',
    hist: 'Hist.',
  };
  return (
    <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
      <StatIcon type={type} /> {labels[type]}: {count || 0}
    </span>
  );
};


const AdminClientList = ({ clients, onSelectClient, onDeleteClient, searchTerm }) => {
  if (clients.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y:10 }}
        animate={{ opacity: 1, y:0 }}
        className="text-center text-slate-500 dark:text-slate-400 py-12"
      >
        <User size={48} className="mx-auto mb-4 text-slate-400 dark:text-slate-500" />
        <p className="text-xl font-semibold">
          {searchTerm ? "No se encontraron clientes." : "Aún no hay clientes registrados."}
        </p>
        <p className="text-sm">
          {searchTerm ? "Intenta con otros términos de búsqueda." : "Los nuevos clientes aparecerán aquí."}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {clients.map((client, index) => (
        <motion.div
          key={client.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Card className="hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <CardContent className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-2 bg-gradient-to-tr from-primary to-sky-500 rounded-full">
                     <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-lg text-slate-800 dark:text-slate-100">{client.username}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{client.email}</p>
                  </div>
                </div>
                <div className="text-xs mt-3 flex flex-wrap gap-2">
                  <ClientStat type="meds" count={client.medicamentos?.length} />
                  <ClientStat type="record" count={client.recordatorios?.length} />
                  <ClientStat type="inv" count={client.inventario?.length} />
                  <ClientStat type="interac" count={client.interacciones?.length} />
                  <ClientStat type="hist" count={client.historial?.length} />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-0 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onSelectClient(client)}
                  className="flex-1 sm:flex-none bg-transparent border-primary text-primary hover:bg-primary/10 hover:text-primary dark:border-sky-500 dark:text-sky-400 dark:hover:bg-sky-500/20 dark:hover:text-sky-300 transition-colors shadow-sm hover:shadow-md"
                >
                  <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => onDeleteClient(client)}
                  className="flex-1 sm:flex-none"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Eliminar Usuario
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default AdminClientList;

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from 'framer-motion';

const AdminStatCard = ({ title, value, icon, color, animationDelay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: animationDelay }}
  >
    <Card className={`shadow-xl rounded-xl border-0 ${color} overflow-hidden bg-white dark:bg-slate-800 hover:shadow-2xl transition-shadow duration-300`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-5 px-5">
        <CardTitle className="text-base font-semibold text-slate-600 dark:text-slate-300">{title}</CardTitle>
        <div className={`p-2 rounded-full ${color.replace('border-', 'bg-')}/10`}>
          {React.cloneElement(icon, { className: `${icon.props.className} ${color.replace('border-', 'text-')}` })}
        </div>
      </CardHeader>
      <CardContent className="pb-5 px-5">
        <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</div>
        {/* Podríamos añadir un % de cambio o una pequeña descripción aquí */}
      </CardContent>
    </Card>
  </motion.div>
);

export default AdminStatCard;
export function getMedicamentos(userId) {
  if (!userId) {
    const todosLosMedicamentosGlobales = localStorage.getItem('medicamentos_TODOS_PARA_ADMIN_O_GLOBAL');
    return todosLosMedicamentosGlobales ? JSON.parse(todosLosMedicamentosGlobales) : [];
  }
  const medicamentos = localStorage.getItem(`medicamentos_${userId}`);
  return medicamentos ? JSON.parse(medicamentos) : [];
}

export function saveMedicamento(medicamento, userId) {
  if (!userId) {
    console.error("UserID es necesario para guardar medicamento");
    return null; 
  }
  const medicamentos = getMedicamentos(userId);
  if (!medicamento.id) {
    medicamento.id = `med_${Date.now()}_${userId.substring(0,4)}`;
  }
  const index = medicamentos.findIndex(m => m.id === medicamento.id);
  if (index !== -1) {
    medicamentos[index] = medicamento;
  } else {
    medicamentos.push(medicamento);
  }
  localStorage.setItem(`medicamentos_${userId}`, JSON.stringify(medicamentos));
  return medicamento;
}

export function deleteMedicamento(id, userId) {
  if (!userId) {
    console.error("UserID es necesario para eliminar medicamento");
    return;
  }
  let medicamentos = getMedicamentos(userId);
  medicamentos = medicamentos.filter(m => m.id !== id);
  localStorage.setItem(`medicamentos_${userId}`, JSON.stringify(medicamentos));
  
  deleteItemInventario(id, userId); 
  let recordatorios = getRecordatorios(userId);
  recordatorios = recordatorios.filter(r => r.medicamentoId !== id);
  localStorage.setItem(`recordatorios_${userId}`, JSON.stringify(recordatorios));
}

export function deleteMedicamentos(userId) {
  if (!userId) {
    console.error("UserID es necesario para eliminar todos los medicamentos de un usuario");
    return;
  }
  localStorage.removeItem(`medicamentos_${userId}`);
}


export function getRecordatorios(userId) {
  if (!userId) {
    const todosLosRecordatoriosGlobales = localStorage.getItem('recordatorios_TODOS_PARA_ADMIN_O_GLOBAL');
    return todosLosRecordatoriosGlobales ? JSON.parse(todosLosRecordatoriosGlobales) : [];
  }
  const recordatorios = localStorage.getItem(`recordatorios_${userId}`);
  return recordatorios ? JSON.parse(recordatorios) : [];
}

export function saveRecordatorio(recordatorio, userId) {
  if (!userId) {
    console.error("UserID es necesario para guardar recordatorio");
    return null;
  }
  const recordatorios = getRecordatorios(userId);
  if (!recordatorio.id) {
    recordatorio.id = `rec_${Date.now()}_${userId.substring(0,4)}`;
  }
  const index = recordatorios.findIndex(r => r.id === recordatorio.id);
  if (index !== -1) {
    recordatorios[index] = recordatorio;
  } else {
    recordatorios.push(recordatorio);
  }
  localStorage.setItem(`recordatorios_${userId}`, JSON.stringify(recordatorios));
  return recordatorio;
}

export function deleteRecordatorio(id, userId) {
  if (!userId) {
    console.error("UserID es necesario para eliminar recordatorio");
    return;
  }
  let recordatorios = getRecordatorios(userId);
  recordatorios = recordatorios.filter(r => r.id !== id);
  localStorage.setItem(`recordatorios_${userId}`, JSON.stringify(recordatorios));
}

export function deleteRecordatorios(userId) {
  if (!userId) {
    console.error("UserID es necesario para eliminar todos los recordatorios de un usuario");
    return;
  }
  localStorage.removeItem(`recordatorios_${userId}`);
}


export function markRecordatorioTomado(id, userId) {
  if (!userId) {
    console.error("UserID es necesario para marcar recordatorio como tomado");
    return;
  }
  const recordatorios = getRecordatorios(userId);
  const index = recordatorios.findIndex(r => r.id === id);

  if (index !== -1 && !recordatorios[index].tomado) {
    recordatorios[index].tomado = true;
    recordatorios[index].fechaTomado = new Date().toISOString();
    localStorage.setItem(`recordatorios_${userId}`, JSON.stringify(recordatorios));
    
    addToHistorial({
      medicamentoId: recordatorios[index].medicamentoId,
      medicamentoNombre: recordatorios[index].medicamentoNombre,
      dosis: recordatorios[index].dosis,
      unidad: recordatorios[index].unidad,
      fecha: new Date().toISOString(), 
      programado: true 
    }, userId);

    const medicamento = getMedicamentos(userId).find(m => m.id === recordatorios[index].medicamentoId);
    if (medicamento) {
        const itemInventario = getInventario(userId).find(i => i.medicamentoId === medicamento.id);
        if (itemInventario) {
            const dosisTomada = parseFloat(recordatorios[index].dosis);
            const nuevaCantidad = isNaN(dosisTomada) ? itemInventario.cantidad : Math.max(0, itemInventario.cantidad - dosisTomada);
            updateInventario(medicamento.id, nuevaCantidad, itemInventario.fechaCaducidad, itemInventario.notas, userId);
        }
    }
  }
}


export function getInventario(userId) {
  if (!userId) {
     const todoElInventarioGlobal = localStorage.getItem('inventario_TODOS_PARA_ADMIN_O_GLOBAL');
    return todoElInventarioGlobal ? JSON.parse(todoElInventarioGlobal) : [];
  }
  const inventario = localStorage.getItem(`inventario_${userId}`);
  return inventario ? JSON.parse(inventario) : [];
}

export function updateInventario(medicamentoId, cantidad, fechaCaducidad = null, notas = "", userId) {
  if (!userId) {
    console.error("UserID es necesario para actualizar inventario");
    return;
  }
  let inventario = getInventario(userId);
  const index = inventario.findIndex(i => i.medicamentoId === medicamentoId);
  if (index !== -1) {
    inventario[index].cantidad = cantidad;
    inventario[index].fechaCaducidad = fechaCaducidad;
    inventario[index].notas = notas;
  } else {
    inventario.push({ medicamentoId, cantidad, fechaCaducidad, notas });
  }
  localStorage.setItem(`inventario_${userId}`, JSON.stringify(inventario));
}

export function deleteItemInventario(medicamentoId, userId) {
  if (!userId) {
    console.error("UserID es necesario para eliminar item de inventario");
    return;
  }
  let inventario = getInventario(userId);
  inventario = inventario.filter(i => i.medicamentoId !== medicamentoId);
  localStorage.setItem(`inventario_${userId}`, JSON.stringify(inventario));
}

export function deleteInventario(userId) {
  if (!userId) {
    console.error("UserID es necesario para eliminar todo el inventario de un usuario");
    return;
  }
  localStorage.removeItem(`inventario_${userId}`);
}


export function getHistorial(userId) {
  if (!userId) {
    const todoElHistorialGlobal = localStorage.getItem('historial_TODOS_PARA_ADMIN_O_GLOBAL');
    return todoElHistorialGlobal ? JSON.parse(todoElHistorialGlobal) : [];
  }
  const historial = localStorage.getItem(`historial_${userId}`);
  return historial ? JSON.parse(historial) : [];
}

export function addToHistorial(entrada, userId) {
  if (!userId) {
    console.error("UserID es necesario para añadir al historial");
    return null;
  }
  const historial = getHistorial(userId);
  if (!entrada.id) {
    entrada.id = `hist_${Date.now()}_${userId.substring(0,4)}`;
  }
  if (!entrada.fecha) {
    entrada.fecha = new Date().toISOString();
  }
  historial.push(entrada);
  localStorage.setItem(`historial_${userId}`, JSON.stringify(historial));
  return entrada;
}

export function deleteHistorial(userId) {
  if (!userId) { 
    console.warn("Intentando eliminar historial sin userId. Se eliminará el historial de todos los clientes.");
    const users = JSON.parse(localStorage.getItem('recordaMedic_users') || '[]');
    users.filter(u => u.role === 'cliente').forEach(client => {
        localStorage.removeItem(`historial_${client.id}`);
    });
    return;
  }
  localStorage.removeItem(`historial_${userId}`);
}

export function deleteHistorialEntry(id, userId) {
  if (!userId) {
    console.error("UserID es necesario para eliminar entrada del historial");
    return;
  }
  let historial = getHistorial(userId);
  historial = historial.filter(entry => entry.id !== id);
  localStorage.setItem(`historial_${userId}`, JSON.stringify(historial));
}


export function getInteracciones(userId) { 
  if (!userId) {
    // Ya no hay interacciones "globales" predeterminadas si todas son por usuario.
    // Si se requiere una lista de interacciones comunes o ejemplos, se pueden definir aquí.
    // Pero para la lógica de interacciones por usuario, si no hay userId, se retorna vacío.
    // console.warn("Se solicitó getInteracciones sin userId. Retornando lista vacía. Si necesita interacciones globales, esta lógica debe ajustarse.");
    // Devolvemos una lista predeterminada si no hay userId, para que el admin aún pueda ver ejemplos o añadir generales
    // Esto es una decisión de diseño: ¿El admin gestiona una lista global o solo ve las de los clientes?
    // Por ahora, mantendremos la idea de interacciones globales solo si NO se pasa userId.
    // Pero si el objetivo es que TODAS sean por usuario, esto debería retornar [] si !userId.
    // Para este cambio, SIEMPRE se debe pasar userId.
    // Si la intención es que el admin vea todas las interacciones de todos los clientes, esa lógica estaría en el componente admin.
    // Aquí, getInteracciones(userId) debe retornar las interacciones SOLO de ese userId.
    // Si no hay userId, es un error de llamada o una lógica que no debería llegar aquí para datos de cliente.
    // Retornamos lista vacía si no hay userId porque las interacciones son ahora por usuario.
    // console.warn("getInteracciones fue llamado sin userId. Las interacciones son ahora específicas del usuario.");
    return [];
  }
  const interacciones = localStorage.getItem(`interacciones_${userId}`);
  return interacciones ? JSON.parse(interacciones) : [];
}

export function saveInteraccion(interaccion, userId) { 
  if (!userId) {
    console.error("UserID es necesario para guardar interacción");
    return null;
  }
  const interacciones = getInteracciones(userId);
  if (!interaccion.id) {
    interaccion.id = `int_${Date.now()}_${userId.substring(0,4)}`;
  }
  const index = interacciones.findIndex(i => i.id === interaccion.id);
  if (index !== -1) {
    interacciones[index] = interaccion;
  } else {
    interacciones.push(interaccion);
  }
  localStorage.setItem(`interacciones_${userId}`, JSON.stringify(interacciones));
  return interaccion;
}

export function deleteInteraccion(id, userId) { 
  if (!userId) {
    console.error("UserID es necesario para eliminar interacción");
    return;
  }
  let interacciones = getInteracciones(userId);
  interacciones = interacciones.filter(i => i.id !== id);
  localStorage.setItem(`interacciones_${userId}`, JSON.stringify(interacciones));
}

export function deleteInteracciones(userId) { // Nueva función para eliminar todas las interacciones de un usuario
  if (!userId) {
    console.error("UserID es necesario para eliminar todas las interacciones de un usuario");
    return;
  }
  localStorage.removeItem(`interacciones_${userId}`);
}


export function checkInteracciones(medicamentoNombre, userIdToCheckContext) {
  if (!userIdToCheckContext) {
    // console.warn("checkInteracciones llamado sin userIdToCheckContext. No se pueden verificar interacciones específicas del usuario.");
    return []; // No se pueden verificar interacciones sin el contexto del usuario
  }
  const interaccionesUsuario = getInteracciones(userIdToCheckContext); 
  const medicamentosUsuario = getMedicamentos(userIdToCheckContext); 
  const medicamentosActivosUsuario = medicamentosUsuario.filter(m => m.activo); // Asumiendo que los medicamentos tienen un campo 'activo'
  const nombresMedicamentosActivosUsuario = medicamentosActivosUsuario.map(m => m.nombre.toLowerCase());
  
  const interaccionesDetectadas = [];
  const nombreActualLower = medicamentoNombre.toLowerCase();

  for (const interaccion of interaccionesUsuario) {
    const med1Lower = interaccion.medicamento1.toLowerCase();
    const med2Lower = interaccion.medicamento2.toLowerCase();
    
    // Comprobar si el medicamento actual (medicamentoNombre) es uno de los dos en la interacción
    if (med1Lower === nombreActualLower || med2Lower === nombreActualLower) {
      // Identificar el otro medicamento en la interacción
      const otroMedicamentoInteraccion = med1Lower === nombreActualLower ? med2Lower : med1Lower;
      // Comprobar si ese otro medicamento está en la lista de medicamentos activos del usuario
      if (nombresMedicamentosActivosUsuario.includes(otroMedicamentoInteraccion)) {
        // Asegurarse de no añadir duplicados si la interacción ya fue detectada
        if (!interaccionesDetectadas.some(d => d.id === interaccion.id)) {
             interaccionesDetectadas.push(interaccion);
        }
      }
    }
  }
  return interaccionesDetectadas;
}

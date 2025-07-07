
import { getMedicamentos, getRecordatorios, getInventario, getInteracciones, getHistorial, deleteMedicamentos, deleteRecordatorios, deleteInventario, deleteInteracciones, deleteHistorial } from './storage';

const USERS_KEY = 'recordaMedic_users';
const CURRENT_USER_KEY = 'recordaMedic_currentUser';

const getUsers = () => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const registerUser = ({ username, email, password, role }) => {
  const users = getUsers();
  const existingUser = users.find(user => user.email === email && user.role === role);

  if (existingUser) {
    throw new Error(`El correo electrónico ya está registrado para el rol de ${role}.`);
  }

  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const newUser = {
    id: userId,
    username,
    email,
    password, 
    role,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  if (role === 'cliente') {
    localStorage.setItem(`medicamentos_${userId}`, JSON.stringify([]));
    localStorage.setItem(`recordatorios_${userId}`, JSON.stringify([]));
    localStorage.setItem(`inventario_${userId}`, JSON.stringify([]));
    localStorage.setItem(`interacciones_${userId}`, JSON.stringify([]));
    localStorage.setItem(`historial_${userId}`, JSON.stringify([]));
  }
  
  return newUser;
};

export const loginUser = ({ email, password, role }) => {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password && u.role === role);

  if (!user) {
    throw new Error('Credenciales incorrectas o rol no coincide.');
  }
  
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ id: user.id, username: user.username, email: user.email, role: user.role }));
  return { id: user.id, username: user.username, email: user.email, role: user.role };
};

export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = () => {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const getAllClientData = () => {
  const users = getUsers();
  return users
    .filter(user => user.role === 'cliente')
    .map(clientUser => {
      const medicamentosCliente = getMedicamentos(clientUser.id);
      const recordatoriosCliente = getRecordatorios(clientUser.id);
      const inventarioCliente = getInventario(clientUser.id);
      const interaccionesCliente = getInteracciones(clientUser.id); 
      const historialCliente = getHistorial(clientUser.id);
      
      return {
        ...clientUser,
        medicamentos: medicamentosCliente,
        recordatorios: recordatoriosCliente,
        inventario: inventarioCliente,
        interacciones: interaccionesCliente, 
        historial: historialCliente,
      };
    });
};

export const updateUserClientDataInList = (clientId, updatedClientDataObject) => {
  const users = getUsers();
  const clientIndex = users.findIndex(user => user.id === clientId && user.role === 'cliente');

  if (clientIndex !== -1) {
    // Esta función es más para la lista de usuarios, no para los datos directos de storage.
    // Los datos de storage se actualizan directamente por las funciones de storage.js
    // No es necesario sobreescribir aquí.
    // Lo importante es que getAllClientData() siempre lea lo último de storage.
  }
};

export const deleteUserClient = (userIdToDelete) => {
  let users = getUsers();
  const userExists = users.some(user => user.id === userIdToDelete && user.role === 'cliente');

  if (!userExists) {
    throw new Error("Usuario cliente no encontrado para eliminar.");
  }

  users = users.filter(user => user.id !== userIdToDelete);
  saveUsers(users);

  deleteMedicamentos(userIdToDelete); 
  deleteRecordatorios(userIdToDelete); 
  deleteInventario(userIdToDelete); 
  deleteInteracciones(userIdToDelete); 
  deleteHistorial(userIdToDelete); 

  localStorage.removeItem(`medicamentos_${userIdToDelete}`);
  localStorage.removeItem(`recordatorios_${userIdToDelete}`);
  localStorage.removeItem(`inventario_${userIdToDelete}`);
  localStorage.removeItem(`interacciones_${userIdToDelete}`);
  localStorage.removeItem(`historial_${userIdToDelete}`);

  return true;
};


const initializeDefaultAdmin = () => {
  const users = getUsers();
  const adminExists = users.some(user => user.role === 'admin' && user.email === 'admin@recordamedic.com');
  if (!adminExists) {
    try {
      registerUser({ 
        username: 'Admin RecordaMedic', 
        email: 'admin@recordamedic.com', 
        password: 'adminpassword',
        role: 'admin' 
      });
      console.log("Usuario administrador por defecto creado. Email: admin@recordamedic.com, Pass: adminpassword");
    } catch (error) {
      console.error("Error creando admin por defecto:", error);
    }
  }
};

initializeDefaultAdmin();

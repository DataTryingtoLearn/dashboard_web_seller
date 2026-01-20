import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';

const UsersPage = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [clients, setClients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        password: '',
        role: 'user',
        permission_level: 1,
        client_id: currentUser?.client_id || ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchUsers = async () => {
        try {
            const params = new URLSearchParams({
                client_id: currentUser?.client_id || '',
                permission_level: currentUser?.permission_level || 1
            });
            const response = await fetch(`/api/users?${params}`);
            const data = await response.json();
            if (Array.isArray(data)) {
                setUsers(data);
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchClients = async () => {
        if (currentUser?.permission_level < 8) return;
        try {
            const response = await fetch('/api/clients');
            const data = await response.json();
            setClients(data);
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchClients();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    client_id: formData.client_id || null
                })
            });

            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'Usuario creado correctamente' });
                setFormData({ id: '', name: '', password: '', role: 'user', permission_level: 1, client_id: currentUser?.client_id || '' });
                setShowForm(false);
                fetchUsers();
            } else {
                setMessage({ type: 'error', text: data.message || 'Error al crear usuario' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error de conexión con el servidor' });
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Gestión de Usuarios</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Crea y administra las cuentas de acceso al panel.
                    </p>
                </div>
                <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"}>
                    {showForm ? 'Cancelar' : <><UserPlus className="w-4 h-4 mr-2" /> Nuevo Usuario</>}
                </Button>
            </div>

            {showForm && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 max-w-2xl mx-auto">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <UserPlus className="w-5 h-5 mr-2 text-primary" />
                        Registrar Nuevo Empleado
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">ID de Empleado</label>
                                <input
                                    type="text"
                                    name="id"
                                    value={formData.id}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="Ej. E029863"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Nombre Completo</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="Ej. Juan Pérez"
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Contraseña</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Rol / Nivel de Permiso</label>
                                <select
                                    name="permission_level"
                                    value={formData.permission_level}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                >
                                    <option value="1">Usuario (Nivel 1)</option>
                                    <option value="3">Analista (Nivel 3)</option>
                                    <option value="6">Administrador Cliente (Nivel 6)</option>
                                    {currentUser?.permission_level === 8 && (
                                        <option value="8">Super Administrador (Nivel 8)</option>
                                    )}
                                </select>
                            </div>
                        </div>

                        {currentUser?.permission_level === 8 && (
                            <div>
                                <label className="block text-sm font-medium mb-1">Asignar Cliente</label>
                                <select
                                    name="client_id"
                                    value={formData.client_id}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                    required
                                >
                                    <option value="">Selecciona un cliente...</option>
                                    {clients.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {message.text && (
                            <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {message.text}
                            </div>
                        )}

                        <Button type="submit" className="w-full">
                            Crear Usuario
                        </Button>
                    </form>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Empleado</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rol / Nivel</th>
                                {currentUser?.permission_level === 8 && (
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                                )}
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={currentUser?.permission_level === 8 ? "5" : "4"} className="px-6 py-10 text-center text-gray-400">
                                        Cargando usuarios...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={currentUser?.permission_level === 8 ? "5" : "4"} className="px-6 py-10 text-center text-gray-400">
                                        No hay usuarios registrados aparte del sistema principal.
                                    </td>
                                </tr>
                            ) : (
                                users.map((u) => (
                                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                                    {u.name?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{u.name || 'Sin nombre'}</div>
                                                    <div className="text-sm text-gray-500">{u.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.permission_level >= 6 ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                {u.permission_level >= 6 && <ShieldCheck className="w-3 h-3 mr-1" />}
                                                Nivel {u.permission_level}
                                            </span>
                                        </td>
                                        {currentUser?.permission_level === 8 && (
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {clients.find(c => c.id === u.client_id)?.name || 'Sin Asignar'}
                                            </td>
                                        )}
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center text-xs text-green-600">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></div>
                                                Activo
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-600">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UsersPage;

import React, { useState, useEffect } from 'react';
import { Plus, Search, Building, User, Loader2, Check, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

import { useAuth } from '../context/AuthContext';

const ClientsPage = () => {
    const { user: currentUser } = useAuth();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        clientName: '',
        adminId: '',
        adminName: '',
        adminPassword: ''
    });
    const [formStatus, setFormStatus] = useState({ loading: false, error: '', success: '' });

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const response = await fetch('/api/clients');
            const data = await response.json();
            if (data.success) {
                setClients(data.data);
            }
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormStatus({ loading: true, error: '', success: '' });

        if (!formData.clientName || !formData.adminId || !formData.adminName || !formData.adminPassword) {
            setFormStatus({ loading: false, error: 'Todos los campos son obligatorios', success: '' });
            return;
        }

        try {
            const clientRes = await fetch('/api/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.clientName,
                    admin_id: currentUser?.id
                })
            });
            const clientData = await clientRes.json();

            if (!clientData.success || !clientData.data?.clientId) {
                throw new Error(clientData.message || 'Error al crear el cliente');
            }

            const newClientId = clientData.data.clientId;

            const userRes = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: formData.adminId,
                    name: formData.adminName,
                    password: formData.adminPassword,
                    role: 'admin',
                    permission_level: 6,
                    client_id: newClientId
                })
            });
            const userData = await userRes.json();

            if (!userData.success) {
                throw new Error(userData.message || 'Error al crear el usuario admin');
            }

            setFormStatus({ loading: false, error: '', success: 'Cliente y Admin creados correctamente' });
            fetchClients();
            setTimeout(() => {
                setIsCreating(false);
                setFormData({ clientName: '', adminId: '', adminName: '', adminPassword: '' });
                setFormStatus({ loading: false, error: '', success: '' });
            }, 1500);

        } catch (error) {
            setFormStatus({ loading: false, error: error.message, success: '' });
        }
    };

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Clientes</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Administra los clientes y sus usuarios administradores.</p>
                </div>
                <Button onClick={() => setIsCreating(true)} className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Cliente
                </Button>
            </div>

            {isCreating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Registrar Nuevo Cliente</h2>
                            <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-gray-500">
                                <span className="sr-only">Cerrar</span>
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {formStatus.error && (
                                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    {formStatus.error}
                                </div>
                            )}
                            {formStatus.success && (
                                <div className="p-3 bg-green-50 text-green-600 rounded-lg text-sm flex items-center">
                                    <Check className="w-4 h-4 mr-2" />
                                    {formStatus.success}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Cliente (Empresa)</label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="clientName"
                                            value={formData.clientName}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                            placeholder="Ej. Tech Solutions Inc."
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Admin del Cliente (Nivel 6)</h3>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ID de Usuario (Login)</label>
                                            <input
                                                type="text"
                                                name="adminId"
                                                value={formData.adminId}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary/50 outline-none"
                                                placeholder="Ej. C001-ADMIN"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre Completo</label>
                                            <input
                                                type="text"
                                                name="adminName"
                                                value={formData.adminName}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary/50 outline-none"
                                                placeholder="Ej. Juan Pérez"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
                                            <input
                                                type="password"
                                                name="adminPassword"
                                                value={formData.adminPassword}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary/50 outline-none"
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-2">
                                <Button type="button" variant="ghost" onClick={() => setIsCreating(false)} disabled={formStatus.loading}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={formStatus.loading}>
                                    {formStatus.loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Creando...
                                        </>
                                    ) : (
                                        'Registrar Cliente'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar clientes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary/50 outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 font-medium">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Nombre Comercial</th>
                                <th className="px-6 py-4 text-center">Usuarios Admin</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Cargando clientes...
                                    </td>
                                </tr>
                            ) : filteredClients.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                        No se encontraron clientes.
                                    </td>
                                </tr>
                            ) : (
                                filteredClients.map((client) => (
                                    <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">#{client.id}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                                                    {client.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span>{client.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                Activo
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-primary">
                                                Editar
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

export default ClientsPage;

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';

const UserTable = ({ users, isLoading, currentUser, clients, onEdit, onChangePassword }) => {
    return (
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Empleado</th>
                            <th scope="col" className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rol / Nivel</th>
                            {currentUser?.permission_level === 8 && (
                                <th scope="col" className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cliente</th>
                            )}
                            <th scope="col" className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {isLoading ? (
                            <tr>
                                <td colSpan={currentUser?.permission_level === 8 ? "4" : "3"} className="px-6 py-10 text-center text-gray-400">
                                    Cargando usuarios...
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={currentUser?.permission_level === 8 ? "4" : "3"} className="px-6 py-10 text-center text-gray-400">
                                    No hay usuarios registrados.
                                </td>
                            </tr>
                        ) : (
                            users.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                                    <td className="px-6 py-4 text-sm">
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
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.permission_level >= 6 ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {u.permission_level >= 6 && <ShieldCheck className="w-3 h-3 mr-1" />}
                                            Nivel {u.permission_level}
                                        </span>
                                    </td>
                                    {currentUser?.permission_level === 8 && (
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {clients.find(c => c.id === u.client_id)?.name || 'Sin Asignar'}
                                        </td>
                                    )}
                                    <td className="px-6 py-4 flex space-x-2">
                                        <Button variant="ghost" size="sm" onClick={() => onEdit(u)} className="text-blue-600 hover:bg-blue-50">
                                            Editar
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => onChangePassword(u)} className="text-amber-600 hover:bg-amber-50">
                                            Cambiar Contraseña
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserTable;

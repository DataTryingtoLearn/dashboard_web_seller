import React from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '../ui/Button';

const UserForm = ({ formData, onChange, onSubmit, clients, currentUser, message }) => {
    return (
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
                <UserPlus className="w-5 h-5 mr-2 text-primary" />
                Registrar Nuevo Empleado
            </h3>
            <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="id" className="block text-sm font-medium mb-1">ID de Empleado</label>
                        <input
                            id="id"
                            type="text"
                            name="id"
                            value={formData.id}
                            onChange={onChange}
                            className="w-full p-2 border rounded-md bg-background border-input"
                            placeholder="Ej. E029863"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1">Nombre Completo</label>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={onChange}
                            className="w-full p-2 border rounded-md bg-background border-input"
                            placeholder="Ej. Juan Pérez"
                            required
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium mb-1">Contraseña</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={onChange}
                            className="w-full p-2 border rounded-md bg-background border-input"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="permission_level" className="block text-sm font-medium mb-1">Rol / Nivel de Permiso</label>
                        <select
                            id="permission_level"
                            name="permission_level"
                            value={formData.permission_level}
                            onChange={onChange}
                            className="w-full p-2 border rounded-md bg-background border-input"
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
                        <label htmlFor="client_id" className="block text-sm font-medium mb-1">Asignar Cliente</label>
                        <select
                            id="client_id"
                            name="client_id"
                            value={formData.client_id}
                            onChange={onChange}
                            className="w-full p-2 border rounded-md bg-background border-input"
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
    );
};

export default UserForm;

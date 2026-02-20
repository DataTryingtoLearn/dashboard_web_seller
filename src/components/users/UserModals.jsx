import React from 'react';
import { Button } from '../ui/Button';

export const EditUserModal = ({ user, onClose, onUpdate, onChange, currentUser }) => {
    if (!user) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-2xl">
                <h3 className="text-lg font-bold mb-4">Editar Usuario: {user.id}</h3>
                <form onSubmit={onUpdate} className="space-y-4">
                    <div>
                        <label htmlFor="edit_name" className="block text-sm font-medium mb-1">Nombre</label>
                        <input
                            id="edit_name"
                            className="w-full p-2 border rounded dark:bg-gray-700"
                            value={user.name}
                            onChange={e => onChange({ ...user, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label htmlFor="edit_permission" className="block text-sm font-medium mb-1">Nivel Permiso</label>
                        <select
                            id="edit_permission"
                            className="w-full p-2 border rounded dark:bg-gray-700"
                            value={user.permission_level}
                            onChange={e => onChange({ ...user, permission_level: parseInt(e.target.value) })}
                        >
                            <option value="1">Nivel 1 (Usuario)</option>
                            <option value="3">Nivel 3 (Analista)</option>
                            <option value="6">Nivel 6 (Admin Cliente)</option>
                            {currentUser?.permission_level === 8 && <option value="8">Nivel 8 (Super Admin)</option>}
                        </select>
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                        <Button variant="ghost" type="button" onClick={onClose}>Cancelar</Button>
                        <Button type="submit">Guardar Cambios</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const PasswordModal = ({ user, onClose, onUpdate, newPass, onPassChange }) => {
    if (!user) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-sm shadow-2xl">
                <h3 className="text-lg font-bold mb-4">Cambiar Contraseña</h3>
                <p className="text-sm text-gray-500 mb-4">Usuario: {user.name} ({user.id})</p>
                <form onSubmit={onUpdate} className="space-y-4">
                    <div>
                        <label htmlFor="new_password" className="block text-sm font-medium mb-1">Nueva Contraseña</label>
                        <input
                            id="new_password"
                            type="password"
                            className="w-full p-2 border rounded dark:bg-gray-700"
                            placeholder="Nueva contraseña"
                            value={newPass}
                            onChange={e => onPassChange(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                        <Button variant="ghost" type="button" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">Actualizar</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

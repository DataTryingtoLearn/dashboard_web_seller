import React, { useEffect, useReducer } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import UserForm from '../components/users/UserForm';
import UserTable from '../components/users/UserTable';
import { EditUserModal, PasswordModal } from '../components/users/UserModals';

const initialState = {
    users: [],
    clients: [],
    isLoading: true,
    showForm: false,
    formData: { id: '', name: '', password: '', role: 'user', permission_level: 1, client_id: '' },
    message: { type: '', text: '' },
    editingUser: null,
    passwordUser: null,
    newPass: ''
};

function reducer(state, action) {
    switch (action.type) {
        case 'SET_USERS': return { ...state, users: action.payload, isLoading: false };
        case 'SET_CLIENTS': return { ...state, clients: action.payload };
        case 'TOGGLE_FORM': return { ...state, showForm: !state.showForm, message: { type: '', text: '' } };
        case 'SET_FORM_DATA': return { ...state, formData: { ...state.formData, ...action.payload } };
        case 'RESET_FORM': return { ...state, formData: initialState.formData, showForm: false };
        case 'SET_MESSAGE': return { ...state, message: action.payload };
        case 'SET_EDITING_USER': return { ...state, editingUser: action.payload };
        case 'SET_PASSWORD_USER': return { ...state, passwordUser: action.payload };
        case 'SET_NEW_PASS': return { ...state, newPass: action.payload };
        case 'SET_LOADING': return { ...state, isLoading: action.payload };
        default: return state;
    }
}

const UsersPage = () => {
    const { user: currentUser } = useAuth();
    const [state, dispatch] = useReducer(reducer, {
        ...initialState,
        formData: { ...initialState.formData, client_id: currentUser?.client_id || '' }
    });

    const fetchUsers = async () => {
        try {
            const params = new URLSearchParams({
                client_id: currentUser?.client_id || '',
                permission_level: currentUser?.permission_level || 1
            });
            const response = await fetch(`/api/users?${params}`);
            const json = await response.json();
            if (json.success && Array.isArray(json.data)) {
                dispatch({ type: 'SET_USERS', payload: json.data });
            } else {
                dispatch({ type: 'SET_USERS', payload: [] });
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const fetchClients = async () => {
        if (currentUser?.permission_level < 8) return;
        try {
            const response = await fetch('/api/clients');
            const json = await response.json();
            if (json.success && Array.isArray(json.data)) {
                dispatch({ type: 'SET_CLIENTS', payload: json.data });
            }
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchClients();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch({ type: 'SET_MESSAGE', payload: { type: '', text: '' } });

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...state.formData, client_id: state.formData.client_id || null })
            });

            const data = await response.json();
            if (data.success) {
                dispatch({ type: 'SET_MESSAGE', payload: { type: 'success', text: 'Usuario creado correctamente' } });
                dispatch({ type: 'RESET_FORM' });
                fetchUsers();
            } else {
                dispatch({ type: 'SET_MESSAGE', payload: { type: 'error', text: data.message || 'Error al crear usuario' } });
            }
        } catch (error) {
            dispatch({ type: 'SET_MESSAGE', payload: { type: 'error', text: 'Error de conexión con el servidor' } });
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/users/${state.editingUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(state.editingUser)
            });
            const data = await res.json();
            if (data.success) {
                dispatch({ type: 'SET_EDITING_USER', payload: null });
                fetchUsers();
                alert("Usuario actualizado correctamente");
            } else {
                alert("Error al actualizar: " + data.message);
            }
        } catch (error) {
            alert("Error de conexión");
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!state.newPass) return;

        try {
            const res = await fetch(`/api/users/${state.passwordUser.id}/password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: state.newPass })
            });
            const data = await res.json();
            if (data.success) {
                dispatch({ type: 'SET_PASSWORD_USER', payload: null });
                dispatch({ type: 'SET_NEW_PASS', payload: '' });
                alert("Contraseña actualizada exitosamente");
            } else {
                alert("Error: " + data.message);
            }
        } catch (error) {
            alert("Error al cambiar contraseña");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground text-left">Gestión de Usuarios</h2>
                    <p className="text-muted-foreground mt-1 text-left">Crea y administra las cuentas de acceso al panel.</p>
                </div>
                <Button onClick={() => dispatch({ type: 'TOGGLE_FORM' })} variant={state.showForm ? "outline" : "default"}>
                    {state.showForm ? 'Cancelar' : <><UserPlus className="w-4 h-4 mr-2" /> Nuevo Usuario</>}
                </Button>
            </div>

            {state.showForm && (
                <UserForm
                    formData={state.formData}
                    onChange={(e) => dispatch({ type: 'SET_FORM_DATA', payload: { [e.target.name]: e.target.value } })}
                    onSubmit={handleSubmit}
                    clients={state.clients}
                    currentUser={currentUser}
                    message={state.message}
                />
            )}

            <UserTable
                users={state.users}
                isLoading={state.isLoading}
                currentUser={currentUser}
                clients={state.clients}
                onEdit={(u) => dispatch({ type: 'SET_EDITING_USER', payload: u })}
                onChangePassword={(u) => dispatch({ type: 'SET_PASSWORD_USER', payload: u })}
            />

            <EditUserModal
                user={state.editingUser}
                onClose={() => dispatch({ type: 'SET_EDITING_USER', payload: null })}
                onUpdate={handleUpdateUser}
                onChange={(u) => dispatch({ type: 'SET_EDITING_USER', payload: u })}
                currentUser={currentUser}
            />

            <PasswordModal
                user={state.passwordUser}
                onClose={() => { dispatch({ type: 'SET_PASSWORD_USER', payload: null }); dispatch({ type: 'SET_NEW_PASS', payload: '' }); }}
                onUpdate={handleChangePassword}
                newPass={state.newPass}
                onPassChange={(val) => dispatch({ type: 'SET_NEW_PASS', payload: val })}
            />
        </div>
    );
};

export default UsersPage;

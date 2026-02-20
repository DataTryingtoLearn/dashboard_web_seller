import React, { useState, useEffect } from 'react';
import VacancyWizard from '../components/vacancies/VacancyWizard';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Filter, Briefcase, Calendar, Building2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

const VacanciesPage = () => {
    const { user } = useAuth();
    const [showWizard, setShowWizard] = useState(false);
    const [vacancies, setVacancies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchClientId, setSearchClientId] = useState('');
    const isSuperAdmin = Number(user?.permission_level) >= 8;

    const fetchVacancies = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                permission_level: user?.permission_level || '',
                client_id: user?.client_id || '', id_cliente: user?.id_cliente || user?.client_id || ''
            });

            if (isSuperAdmin && searchClientId) {
                params.append('search_id_cliente', searchClientId);
            }

            const response = await fetch(`/api/vacantes?${params.toString()}`);
            const data = await response.json();
            if (data.success) {
                setVacancies(data.data);
            }
        } catch (error) {
            console.error('Error fetching vacancies:', error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchVacancies();
    }, [searchClientId]);

    const handleWizardComplete = () => {
        setShowWizard(false);
        fetchVacancies();
    };

    if (showWizard) {
        return (
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <button
                        onClick={() => setShowWizard(false)}
                        className="text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Volver al listado
                    </button>
                    <h1 className="text-2xl font-bold text-foreground">Nueva Vacante</h1>
                </div>
                <VacancyWizard onComplete={handleWizardComplete} />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Gestión de Vacantes</h1>
                    <p className="text-muted-foreground text-sm">Visualiza y administra las vacantes activas en el sistema Mía.</p>
                </div>
                <Button onClick={() => setShowWizard(true)}>
                    <Plus className="w-5 h-5 mr-2" />
                    Nueva Vacante
                </Button>
            </header>

            <div className="flex flex-col md:flex-row gap-4">
                {isSuperAdmin && (
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar por ID de Cliente..."
                            className="w-full bg-background border border-input rounded-xl pl-10 pr-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm"
                            value={searchClientId}
                            onChange={(e) => setSearchClientId(e.target.value)}
                        />
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : vacancies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vacancies.map((vacante) => (
                        <div key={vacante.id} className="bg-card border border-border rounded-2xl p-5 hover:border-primary/50 transition-all group shadow-sm">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-primary/10 rounded-xl">
                                    <Briefcase className="w-6 h-6 text-primary" />
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${vacante.estado === 'ACTIVO' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                                    {vacante.estado || 'Activo'}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                                {vacante.nombre}
                            </h3>

                            {isSuperAdmin && (
                                <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-4">
                                    <Building2 className="w-3.5 h-3.5" />
                                    <span>Cliente: </span>
                                    <span className="text-foreground font-medium">
                                        {vacante.client_name || `ID: ${vacante.id_cliente || vacante.client_id}`}
                                    </span>
                                </div>
                            )}

                            <div className="space-y-3 mt-4 pt-4 border-t border-border">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Calendar className="w-4 h-4" />
                                    <span>Creada el {new Date(vacante.fecha_creacion).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <Button variant="outline" className="w-full mt-6">
                                Ver Detalles
                            </Button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-muted/10 border border-dashed border-border rounded-3xl">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Briefcase className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">No se encontraron vacantes</h3>
                    <p className="text-muted-foreground mt-2">Comienza creando tu primera vacante en el sistema.</p>
                </div>
            )}
        </div>
    );
};

export default VacanciesPage;

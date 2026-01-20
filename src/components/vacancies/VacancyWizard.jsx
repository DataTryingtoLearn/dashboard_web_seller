import React, { useState } from 'react';
import FAQTable from './FAQTable';
import { useAuth } from '../../context/AuthContext';

const VacancyWizard = () => {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [vacanteId, setVacanteId] = useState(null);

    const [formData, setFormData] = useState({
        nombre: '',
        sueldo: '',
        bono: '',
        horarios: '',
        beneficios: '',
        requisitos: '',
        documentacion: ''
    });

    const [faqs, setFaqs] = useState([]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNextStep = async (e) => {
        e.preventDefault();
        if (step === 1) {
            setLoading(true);
            setError('');
            try {
                const response = await fetch('/api/vacantes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...formData,
                        client_id: user?.client_id
                    })
                });
                const data = await response.json();
                if (data.success) {
                    setVacanteId(data.vacanteId);
                    setStep(2);
                } else {
                    setError(data.message || 'Error al guardar la vacante');
                }
            } catch (err) {
                setError('Error de conexión con el servidor');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSubmitFinal = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`/api/vacantes/${vacanteId}/faq`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ faqs })
            });
            const data = await response.json();
            if (data.success) {
                setSuccess(true);
            } else {
                setError(data.message || 'Error al guardar las FAQs');
            }
        } catch (err) {
            setError('Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-4xl mx-auto mt-10 p-8 bg-slate-900 border border-emerald-500/30 rounded-2xl text-center">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-100 mb-2">¡Vacante Creada con Éxito!</h2>
                <p className="text-slate-400 mb-6">La vacante y sus preguntas frecuentes han sido registradas en el sistema Sophia.</p>
                <button
                    onClick={() => { setSuccess(false); setStep(1); setFormData({ nombre: '', sueldo: '', bono: '', horarios: '', beneficios: '', requisitos: '', documentacion: '' }); setFaqs([]); }}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                    Crear otra vacante
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto mt-10 p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-slate-100">Diseño de Vacante - Proyecto Sophia</h2>
                <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 1 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>1</div>
                    <div className="w-8 h-px bg-slate-700"></div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 2 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>2</div>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {step === 1 ? (
                <form onSubmit={handleNextStep} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Nombre de la Vacante</label>
                            <input
                                type="text"
                                name="nombre"
                                required
                                value={formData.nombre}
                                onChange={handleInputChange}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                                placeholder="Ej. Desarrollador React"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Sueldo Mensual</label>
                                <input
                                    type="number"
                                    name="sueldo"
                                    value={formData.sueldo}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Bono</label>
                                <input
                                    type="number"
                                    name="bono"
                                    value={formData.bono}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Horarios</label>
                        <input
                            type="text"
                            name="horarios"
                            value={formData.horarios}
                            onChange={handleInputChange}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                            placeholder="Ej. Lunes a Viernes 9am - 6pm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Beneficios</label>
                        <textarea
                            name="beneficios"
                            value={formData.beneficios}
                            onChange={handleInputChange}
                            rows="3"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                            placeholder="Detalla los beneficios extra..."
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Requisitos</label>
                            <textarea
                                name="requisitos"
                                value={formData.requisitos}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                                placeholder="Habilidades técnicas, experiencia..."
                            ></textarea>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Documentación</label>
                            <textarea
                                name="documentacion"
                                value={formData.documentacion}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                                placeholder="IFE, CURP, Comprobante de domicilio..."
                            ></textarea>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? 'Guardando...' : 'Siguiente: Configurar FAQs'}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </form>
            ) : (
                <div className="space-y-6">
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                        <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-1">Vacante Seleccionada</h3>
                        <p className="text-lg font-medium text-slate-200">{formData.nombre}</p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-slate-400">Preguntas Frecuentes Dinámicas</label>
                            <span className="text-xs text-slate-500">Estas preguntas las usará el agente Python</span>
                        </div>
                        <FAQTable faqs={faqs} onFaqsChange={setFaqs} />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={() => setStep(1)}
                            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all"
                        >
                            Atrás
                        </button>
                        <button
                            onClick={handleSubmitFinal}
                            disabled={loading}
                            className="flex-[2] py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Guardando...' : 'Finalizar y Publicar'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VacancyWizard;

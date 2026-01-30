
import React, { useRef, useState } from 'react';
import mammoth from 'mammoth';

const FAQTable = ({ faqs, onFaqsChange }) => {
    const fileInputRef = useRef(null);

    const addRow = () => {
        onFaqsChange([...faqs, { pregunta: '', respuesta: '', palabras_clave: '' }]);
    };

    const removeRow = (index) => {
        onFaqsChange(faqs.filter((_, i) => i !== index));
    };

    const handleChange = (index, field, value) => {
        const updatedFaqs = [...faqs];
        updatedFaqs[index][field] = value;
        onFaqsChange(updatedFaqs);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const arrayBuffer = event.target.result;
            try {
                const result = await mammoth.extractRawText({ arrayBuffer });
                const text = result.value;

                const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 5);

                const newFaqs = lines.map(line => {
                    const parts = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || line.split(',');

                    const cleanParts = parts.map(p => p.trim().replace(/^"|"$/g, ''));

                    return {
                        pregunta: cleanParts[0] || '',
                        respuesta: cleanParts[1] || '',
                        palabras_clave: cleanParts[2] || ''
                    };
                }).filter(f => f.pregunta.toLowerCase() !== 'pregunta' && f.respuesta);

                if (newFaqs.length === 0) {
                    alert("No se detectó el formato esperado. Asegúrate de que las preguntas y respuestas estén separadas por comas.");
                    return;
                }

                onFaqsChange([...faqs, ...newFaqs]);
                alert(`¡Éxito! Se agregaron ${newFaqs.length} registros desde el archivo.`);

            } catch (err) {
                console.error("Error:", err);
                alert("Error al procesar el archivo Word.");
            }
        };
        reader.readAsArrayBuffer(file);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-400">Preguntas Frecuentes Dinámicas</label>

                <div className="flex gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".docx"
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-400 border border-emerald-400/30 rounded-lg hover:bg-emerald-400/10 transition-colors"
                    >
                        Importar Word
                    </button>

                    <button
                        type="button"
                        onClick={addRow}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-400 border border-blue-400/30 rounded-lg hover:bg-blue-400/10 transition-colors"
                    >
                        + Agregar Fila
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-700 bg-slate-900/50">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-800/50 text-xs uppercase text-slate-400">
                        <tr>
                            <th className="px-4 py-3">Pregunta</th>
                            <th className="px-4 py-3">Respuesta</th>
                            <th className="px-4 py-3">Palabras Clave</th>
                            <th className="px-4 py-3 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {faqs.map((faq, index) => (
                            <tr key={index} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-4 py-2">
                                    <input
                                        type="text"
                                        value={faq.pregunta}
                                        onChange={(e) => handleChange(index, 'pregunta', e.target.value)}
                                        placeholder="¿Qué sueldo ofrecen?"
                                        className="w-full bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 outline-none text-slate-100 placeholder-slate-500"
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <input
                                        type="text"
                                        value={faq.respuesta}
                                        onChange={(e) => handleChange(index, 'respuesta', e.target.value)}
                                        placeholder="Ofrecemos $15,000 mensuales..."
                                        className="w-full bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 outline-none text-slate-100 placeholder-slate-500"
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <input
                                        type="text"
                                        value={faq.palabras_clave}
                                        onChange={(e) => handleChange(index, 'palabras_clave', e.target.value)}
                                        placeholder="sueldo, pago, mensualidad"
                                        className="w-full bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 outline-none text-slate-100 placeholder-slate-500"
                                    />
                                </td>
                                <td className="px-4 py-2 text-right">
                                    <button
                                        onClick={() => removeRow(index)}
                                        className="text-red-400 hover:text-red-300 p-1 transition-colors"
                                        title="Eliminar fila"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {faqs.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-4 py-8 text-center text-slate-500 italic">
                                    No hay FAQs agregadas. Haz clic en el botón de arriba para empezar o importa un Word.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FAQTable;

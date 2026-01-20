import React from 'react';
import VacancyWizard from '../components/vacancies/VacancyWizard';

const VacanciesPage = () => {
    return (
        <div className="p-6">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-100 mb-2">Gestión de Vacantes</h1>
                <p className="text-slate-400">Configura nuevas vacantes y define el conocimiento base para Sophia.</p>
            </header>

            <VacancyWizard />
        </div>
    );
};

export default VacanciesPage;

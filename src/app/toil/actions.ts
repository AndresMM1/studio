
'use server';

import { getLatestMedicionForActividad, addActividadMedicion } from "@/lib/toil/data";
import type { IniciativaAutomatizacion, ProyectoConNombre, ActividadMedicion } from "@/lib/toil/types";

// Helper function to calculate percentage reduction, ensuring it doesn't go below zero.
const reduceByPercentage = (value: number, percentage: number) => {
    return Math.max(0, value * (1 - (percentage / 100)));
};

export async function createProjectedMeasurements(
    initiative: IniciativaAutomatizacion, 
    project: ProyectoConNombre
): Promise<{ count: number }> {
    
    if (!initiative.id_actividades || initiative.id_actividades.length === 0) {
        throw new Error("La iniciativa no tiene actividades vinculadas.");
    }
    
    let createdCount = 0;

    for (const actividadId of initiative.id_actividades) {
        const latestRealMedicion = await getLatestMedicionForActividad(actividadId);

        if (latestRealMedicion) {
            const newProjectedMedicion: Omit<ActividadMedicion, 'id_medicion'> = {
                ...latestRealMedicion,
                "Tipo Medicion": "Proyectada",
                "Fecha Medicion": new Date().toISOString(),
                // Apply absolute values from project for seniority
                "Señority Tecnico": project.varSeniorityTecnico,
                "Señority Operativo": project.varSeniorityOperativo,
                // Apply percentage reductions for time, people, and frequency
                "Tiempo Minutos": reduceByPercentage(latestRealMedicion["Tiempo Minutos"], project.varTiempo),
                "Involucrados": Math.ceil(reduceByPercentage(latestRealMedicion["Involucrados"], project.varInvolucrados)),
                "Cantidad x Mes": reduceByPercentage(latestRealMedicion["Cantidad x Mes"], project.varFrecuencia),
                // Recalculate monthly hours
                "Tiempo Hrs x Mes": (reduceByPercentage(latestRealMedicion["Tiempo Minutos"], project.varTiempo) * reduceByPercentage(latestRealMedicion["Cantidad x Mes"], project.varFrecuencia)) / 60,
            };

            addActividadMedicion(newProjectedMedicion);
            createdCount++;
        }
    }

    if(createdCount === 0) {
        throw new Error("No se encontraron mediciones 'Reales' para las actividades vinculadas. No se crearon proyecciones.");
    }
    
    return { count: createdCount };
}

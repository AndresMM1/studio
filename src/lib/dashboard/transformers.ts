import { type DataRow } from "./api";

// Helper function to convert Excel serial date number to a JS Date
function excelDateToJSDate(serial: number): Date {
  if (typeof serial !== 'number') return new Date(); // Return current date if serial is not a number
  const utc_days = serial - 25569;
  const utc_value = utc_days * 86400;
  return new Date(utc_value * 1000);
}

// This function takes a raw data row from the API and transforms it
// into an object with the keys our components expect.
export function transformCambio(raw: DataRow): DataRow {
  // Get all property names from the raw object
  const keys = Object.keys(raw);

  // Map data by index, just like the original HTML did.
  // Column 9 -> IDCambio
  // Column 36 -> Resumen
  // Column 30 -> Estado
  // Column 13 -> FechaSolicitud
  return {
    IDCambio: raw[keys[9]] ?? "N/A",
    Resumen: raw[keys[36]] ?? "N/A",
    Estado: raw[keys[30]] ?? "N/A",
    FechaSolicitud: excelDateToJSDate(raw[keys[13]] as number).toLocaleDateString("es-CO"),
  };
}

// We can add transformers for other data types here in the future
export function transformIncidente(raw: DataRow): DataRow {
    const keys = Object.keys(raw);
    // Example mapping for incidents
    return {
        IDIncidente: raw[keys[0]] ?? "N/A",
        Titulo: raw[keys[13]] ?? "N/A",
        Prioridad: raw[keys[23]] ?? "N/A",
        Estado: raw[keys[49]] ?? "N/A",
    };
}

// --- New Transformers ---

export function transformAplicacion(raw: DataRow): DataRow {
  const keys = Object.keys(raw);
  // Assuming the API returns data in this order: Nombre, Tipo, Entorno
  return {
    NombreAplicacion: raw[keys[0]] ?? "N/A",
    Tipo: raw[keys[1]] ?? "N/A",
    Entorno: raw[keys[2]] ?? "N/A",
  };
}

export function transformBaseDatos(raw: DataRow): DataRow {
  const keys = Object.keys(raw);
  // Assuming the API returns data in this order: Nombre, Motor, Servidor
  return {
    NombreBD: raw[keys[0]] ?? "N/A",
    Motor: raw[keys[1]] ?? "N/A",
    Servidor: raw[keys[2]] ?? "N/A",
  };
}
const SERVICIOS_URL = "https://045498d8c2eae9f4994f58cd02cb99.e0.environment.api.powerplatform.com/powerautomate/automations/direct/workflows/0376b3cf91154958866177a0f39a0b44/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=tm_ANSoCLo92i6Mra2NacJ60UQVeRNh7YE_iE8XzL7Y";
const SERVICIO_DETALLE_URL = "https://045498d8c2eae9f4994f58cd02cb99.e0.environment.api.powerplatform.com/powerautomate/automations/direct/workflows/797b27ba20d145cdab54331cff9ed52b/triggers/manual/paths/invoke/?api-version=1&tenantId=tId&environmentId=045498d8-c2ea-e9f4-994f-58cd02cb99e0&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Z4fAOO9BTJo-D7kZLPUt5Lgqo9lLQh6jedIdz2Xm1gA";
const APLICACIONES_URL = "https://045498d8c2eae9f4994f58cd02cb99.e0.environment.api.powerplatform.com/powerautomate/automations/direct/workflows/b3c4381279e44c48915f401a3ed84771/triggers/manual/paths/invoke/?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=82Ai3CUUINN3DNKf12X8SSmP-6awvLRk0kZDttQ8ClI";
const BASES_DATOS_URL = "https://045498d8c2eae9f4994f58cd02cb99.e0.environment.api.powerplatform.com/powerautomate/automations/direct/workflows/ba78715cb1844afc8678b3ee60abb3d8/triggers/manual/paths/invoke/?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=XIXoAPzUvqYUBpiJ4A6cJo6GK8nJ-xYul11zOZ9uifA";
const CAMBIOS_URL = "https://045498d8c2eae9f4994f58cd02cb99.e0.environment.api.powerplatform.com/powerautomate/automations/direct/workflows/07fc86f031ea4181bbb2c9da185be890/triggers/manual/paths/invoke/?api-version=1&tenantId=tId&environmentId=045498d8-c2ea-e9f4-994f-58cd02cb99e0&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=cd1Ifb_lKmCQ76ZWMEel6d2mZD-jbXubdwRW0YJtlNA";
const INCIDENTES_URL = "https://045498d8c2eae9f4994f58cd02cb99.e0.environment.api.powerplatform.com/powerautomate/automations/direct/workflows/3a7c196642574e5fa089f3d3e69d43d0/triggers/manual/paths/invoke/?api-version=1&tenantId=tId&environmentId=045498d8-c2ea-e9f4-994f-58cd02cb99e0&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Gu_MaLwadu9P5uxj2X9vGBJfAQrr0iFtaQrk0U8tGTE";

export interface Servicio {
  SERVICE_NAME: string;
  [key: string]: unknown;
}

export type ServicioDetalle = Record<string, unknown>;
export type DataRow = Record<string, unknown>;

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export async function fetchServicios(): Promise<Servicio[]> {
  const json = await fetchJson<{ value?: any[] }>(SERVICIOS_URL);
  const services = json.value ?? [];
  return services.map((service) => ({
    SERVICE_NAME: service.SERVICE_NAME,
    ID: service.ID,
    SERVICE_CHANNEL: service.SERVICE_CHANNEL,
  }));
}

export async function fetchServicioDetalle(servicio: string): Promise<ServicioDetalle | null> {
  const json = await postJson<{ value?: ServicioDetalle[] }>(SERVICIO_DETALLE_URL, { servicio });
  return json.value?.[0] ?? null;
}

export async function fetchAplicaciones(servicio: string): Promise<DataRow[]> {
  const json = await postJson<{ value?: DataRow[] }>(APLICACIONES_URL, { servicio });
  return json.value ?? [];
}

export async function fetchBasesDatos(servicio: string): Promise<DataRow[]> {
  const json = await postJson<{ value?: DataRow[] }>(BASES_DATOS_URL, { servicio });
  return json.value ?? [];
}

export async function fetchCambios(servicio: string): Promise<DataRow[]> {
  return postJson<DataRow[]>(CAMBIOS_URL, { servicio });
}

export async function fetchIncidentes(servicio: string): Promise<DataRow[]> {
  return postJson<DataRow[]>(INCIDENTES_URL, { servicio });
}
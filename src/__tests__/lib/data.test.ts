import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as dataLib from '@/lib/data'
import { getServices, getIncidents, addIncident, getDashboardStats, updateIncidentStatus, sendClosureDocumentation, generateTeamsMeetingLink, getIncidentById } from '@/lib/data'

// Mock fetch
const fetchMock = vi.fn()
globalThis.fetch = fetchMock

vi.mock('./notifications', () => ({
    sendWhatsAppGroupMessage: vi.fn().mockResolvedValue(undefined)
}))

describe('Data Library', () => {
    beforeEach(() => {
        fetchMock.mockClear()
    })

    describe('getServices', () => {
        it('fetches services successfully', async () => {
            const mockResponse = {
                value: [{ SERVICE_NAME: 'Service A' }]
            }
            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            })

            const services = await getServices()
            expect(services).toHaveLength(1)
            expect(services[0].SERVICE_NAME).toBe('Service A')
        })

        it('returns empty array on failure', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: false
            })
            const services = await getServices()
            expect(services).toEqual([])
        })
    })

    describe('getIncidents', () => {
        it('fetches incidents successfully', async () => {
            const mockResponse = {
                value: [{
                    Id: 1,
                    AFFECT_SERVICE: 'Service A',
                    AFFECT_DETAILS: 'Details',
                    AFFECT_PRIORITY: 'Alta',
                    AFFECT_STATE: 'Proceso'
                }]
            }
            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            })

            const incidents = await getIncidents()
            expect(incidents).toHaveLength(1)
            expect(incidents[0].id).toBe(1)
            expect(incidents[0].priority).toBe('Alta')
        })

        it('returns empty array on fetch failure', async () => {
            fetchMock.mockResolvedValueOnce({ ok: false })
            const incidents = await getIncidents()
            expect(incidents).toEqual([])
        })
    })

    describe('getIncidentById', () => {
        it('returns incident from cached list', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ value: [{ Id: 42, AFFECT_SERVICE: 'Svc', AFFECT_DETAILS: 'd' }] })
            })
            const incident = await getIncidentById(42)
            expect(incident?.id).toBe(42)
        })
    })

    describe('getDashboardStats', () => {
        it('calculates stats correctly', async () => {
            const mockResponse = {
                value: [
                    { Id: 1, AFFECT_STATE: 'Proceso', AFFECT_PRIORITY: 'Alta' },
                    { Id: 2, AFFECT_STATE: 'Cerrado', AFFECT_PRIORITY: 'Media' }
                ]
            }
            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            })

            const stats = await getDashboardStats()
            expect(stats.totalIncidents).toBe(2)
            expect(stats.activeIncidents).toBe(1)
            expect(stats.criticalIncidents).toBe(1)
        })

        it('calculates recent 7 days resolution stats', async () => {
            const now = new Date();
            const twoDaysAgo = new Date(now);
            twoDaysAgo.setDate(now.getDate() - 2);

            const oneDayAgo = new Date(now);
            oneDayAgo.setDate(now.getDate() - 1); // Resolution time: 1 day (1440 mins)

            const mockResponse = {
                value: [
                    {
                        Id: 3,
                        AFFECT_STATE: 'Cerrado',
                        AFFECT_PRIORITY: 'Baja',
                        AFFECT_SERVICE: 'Service B',
                        AFFECT_START_DATE: twoDaysAgo.toISOString(),
                        AFFECT_END_DATE: oneDayAgo.toISOString()
                    }
                ]
            }

            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            })

            const stats = await getDashboardStats()
            // 2 days to 1 day ago = 24 hours = 1440 minutes
            expect(stats.recent7Days.resolutionStats.avgMinutes).toBeGreaterThan(0)
            expect(stats.recent7Days.resolutionStats.maxMinutes).toBeGreaterThan(0)
            expect(stats.recent7Days.serviceCounts['Service B']).toBe(1)
        })
    })

    describe('addIncident', () => {
        it('creates incident successfully', async () => {
            const mockResponse = { CreatedID: "123" }
            fetchMock.mockResolvedValue({
                ok: true,
                json: async () => mockResponse
            })

            const incident = {
                service: 'Service A',
                description: 'Test Incident',
                priority: 'Alta' as const,
                startTime: new Date().toISOString(),
                environment: 'Producción',
                teamsLink: ''
            }

            const newIncident = await addIncident(incident, 'test@example.com')
            expect(newIncident.id).toBe(123)
            expect(newIncident.status).toBe('Proceso')
        })

        it('parses legacy Incident payload', async () => {
            const legacy = { Incident: JSON.stringify({ CreatedID: "321" }) }
            fetchMock.mockResolvedValue({ ok: true, json: async () => legacy })

            const incident = {
                service: 'Service B',
                description: 'Legacy',
                priority: 'Baja' as const,
                startTime: new Date().toISOString(),
                environment: 'Producción',
                teamsLink: ''
            }

            const created = await addIncident(incident, 'legacy@example.com')
            expect(created.id).toBe(321)
            expect(created.service).toBe('Service B')
        })
    })

    describe('updateIncidentStatus', () => {
        it('updates status successfully', async () => {
            fetchMock.mockResolvedValueOnce({ ok: true })
            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ value: [{ Id: 1, AFFECT_STATE: 'Cerrado' }] })
            })

            const updated = await updateIncidentStatus(1, 'Cerrado')
            expect(updated?.status).toBe('Cerrado')
        })

        it('handles update failure', async () => {
            fetchMock.mockResolvedValueOnce({ ok: false, text: async () => 'Error' })
            const updated = await updateIncidentStatus(1, 'Cerrado')
            expect(updated).toBeUndefined()
        })
    })

    describe('sendClosureDocumentation', () => {
        it('sends documentation successfully', async () => {
            fetchMock.mockResolvedValueOnce({ ok: true })
            const data = {
                incidentId: 1,
                startTime: 'start',
                endTime: 'end',
                service: 'service',
                description: 'desc',
                solution: 'sol',
                generatedAlerts: true,
                docResponsible: 'doc',
                domainResponsible: 'domain',
                initialAnalysis: 'analysis',
                rootCause: 'cause',
                causeCategory: 'cat',
                rootCauseIdentified: true,
                repetitiveIncident: false,
                solutionActivities: 'activities',
                actionPlans: 'plans',
                asdResponsible: 'asd'
            }
            await expect(sendClosureDocumentation(data)).resolves.not.toThrow()
        })

        it('throws on failure', async () => {
            fetchMock.mockResolvedValueOnce({ ok: false })
            const data = {} as any
            await expect(sendClosureDocumentation(data)).rejects.toThrow()
        })
    })

    describe('generateTeamsMeetingLink', () => {
        it('generates link successfully', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ link: 'https://teams.com/meeting' })
            })
            const link = await generateTeamsMeetingLink('Service A')
            expect(link).toBe('https://teams.com/meeting')
        })

        it('throws on failure', async () => {
            fetchMock.mockResolvedValueOnce({ ok: false })
            await expect(generateTeamsMeetingLink('Service A')).rejects.toThrow()
        })
    })

    describe('getIncidentUpdates', () => {
        it('returns mapped updates from API', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ value: [{ ID: 11, AFFECT_ID: 7, MONITORING_DS: 'note', MONITORING_DATE: '2024-01-01' }] })
            })

            const updates = await dataLib.getIncidentUpdates(7)
            expect(updates).toHaveLength(1)
            expect(updates[0]).toMatchObject({ id: 11, incidentId: 7, text: 'note' })
        })

        it('returns empty array on fetch failure', async () => {
            fetchMock.mockResolvedValueOnce({ ok: false, text: async () => 'fail' })
            const updates = await dataLib.getIncidentUpdates(99)
            expect(updates).toEqual([])
        })
    })

    describe('addIncidentUpdate', () => {
        it('sends update and returns structured object', async () => {
            vi.useFakeTimers()
            vi.setSystemTime(new Date('2024-01-02T10:00:00Z'))

            fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ Id: 555 }) })

            const update = await dataLib.addIncidentUpdate('44', 'follow up')

            expect(update).toMatchObject({ id: 555, incidentId: 44, text: 'follow up', timestamp: '2024-01-02T10:00:00.000Z' })

            vi.useRealTimers()
        })

        it('throws when API call fails', async () => {
            fetchMock.mockResolvedValueOnce({ ok: false, text: async () => 'Error' })
            await expect(dataLib.addIncidentUpdate('1', 'bad')).rejects.toThrow()
        })
    })
})

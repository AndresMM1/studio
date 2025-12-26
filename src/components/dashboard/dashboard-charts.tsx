import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats } from "@/lib/types";

interface DashboardChartsProps {
    stats: DashboardStats;
}

const COLORS = ['#0EA5E9', '#22C55E', '#EAB308', '#EF4444', '#8B5CF6'];

export function DashboardCharts({ stats }: DashboardChartsProps) {
    const priorityData = Object.entries(stats.recent7Days.priorityCounts).map(([name, value]) => ({ name, value }));
    const serviceData = Object.entries(stats.recent7Days.serviceCounts).map(([name, value]) => ({ name, value }));

    // Sort service data by value descending and take top 5
    const topServices = serviceData.sort((a, b) => b.value - a.value).slice(0, 5);

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-8">
            <Card className="transition-all hover:shadow-lg">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Incidentes por Servicio (Últimos 7 días)</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={topServices}>
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                interval={0}
                                height={60}
                                angle={-10}
                                textAnchor="end"
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="value" name="Incidentes" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="transition-all hover:shadow-lg">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Distribución por Prioridad (Últimos 7 días)</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                            <Pie
                                data={priorityData}
                                cx="40%"
                                cy="50%"
                                innerRadius={35}
                                outerRadius={65}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {priorityData.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="transition-all hover:shadow-lg">
                <CardHeader className="pb-2">
                    <div className="flex flex-col gap-1">
                        <CardTitle className="text-sm font-medium">Tiempo de Resolución Promedio (Últimos 7 días)</CardTitle>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                            <span>Promedio: <span className="font-bold text-foreground">{stats.recent7Days.resolutionStats?.avgMinutes || 0}m</span></span>
                            <span>Máx: <span className="font-bold text-foreground">{stats.recent7Days.resolutionStats?.maxMinutes || 0}m</span></span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={stats.recent7Days.resolutionStats?.dailyTrend || []}>
                            <XAxis
                                dataKey="date"
                                stroke="#888888"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}m`}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                            />
                            <Bar dataKey="avgMinutes" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Minutos Promedio" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}

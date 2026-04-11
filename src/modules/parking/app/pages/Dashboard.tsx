import { useMemo } from 'react';
import { useParking } from '../context/ParkingContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { DollarSign, Car, TrendingUp, Clock } from 'lucide-react';
import { NewVehicleForm } from '../components/NewVehicleForm';

export function Dashboard() {
  const { vehicles, getActiveVehicles, getTodayRevenue } = useParking();
  
  const activeCount = getActiveVehicles().length;
  const todayRevenue = getTodayRevenue();
  const totalVehicles = vehicles.length;
  
  const { avgDuration } = useMemo(() => {
    // Calculate average duration for completed vehicles today
    const completedToday = vehicles.filter((v) => {
      if (v.status !== 'completed' || !v.exitTime) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return v.exitTime >= today;
    });
    
    const avgDuration = completedToday.length > 0
      ? completedToday.reduce((sum, v) => {
          const duration = v.exitTime!.getTime() - v.entryTime.getTime();
          return sum + duration / (1000 * 60 * 60); // duration in hours
        }, 0) / completedToday.length
      : 0;

    return { avgDuration };
  }, [vehicles]);

  const stats = [
    {
      title: 'Ingresos Hoy',
      value: `$${todayRevenue.toFixed(2)}`,
      description: 'Total recaudado hoy',
      icon: DollarSign,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      title: 'Vehículos Activos',
      value: activeCount,
      description: 'Actualmente en el parqueo',
      icon: Car,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      title: 'Total Vehículos',
      value: totalVehicles,
      description: 'Registrados en total',
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      title: 'Tiempo Promedio',
      value: `${avgDuration.toFixed(1)}h`,
      description: 'Duración promedio hoy',
      icon: Clock,
      color: 'text-red-600',
      bg: 'bg-red-100',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-1">Resumen general del sistema de parqueo</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="bg-white border border-blue-600 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* New Vehicle Registration */}
      <Card className="bg-white border border-blue-600 shadow-sm">
        <CardHeader>
          <CardTitle>Registrar Nuevo Vehículo</CardTitle>
          <CardDescription>
            Ingrese los datos del vehículo que está entrando al parqueo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewVehicleForm />
        </CardContent>
      </Card>
    </div>
  );
}

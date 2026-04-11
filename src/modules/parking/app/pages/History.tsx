import { useState } from 'react';
import { useParking, Vehicle } from '../context/ParkingContext';
import { Card } from '../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Car, Bike, Truck, Search } from 'lucide-react';

export function History() {
  const { getCompletedVehicles } = useParking();
  const [searchTerm, setSearchTerm] = useState('');
  const completedVehicles = getCompletedVehicles();

  const filteredVehicles = completedVehicles.filter((vehicle) =>
    vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getVehicleTypeLabel = (type: Vehicle['type']) => {
    switch (type) {
      case 'car':
        return 'Auto';
      case 'motorcycle':
        return 'Moto';
      case 'truck':
        return 'Camión';
    }
  };

  const getVehicleIcon = (type: Vehicle['type']) => {
    switch (type) {
      case 'car':
        return <Car className="w-4 h-4" />;
      case 'motorcycle':
        return <Bike className="w-4 h-4" />;
      case 'truck':
        return <Truck className="w-4 h-4" />;
    }
  };

  const calculateDuration = (entry: Date, exit: Date) => {
    const diff = exit.getTime() - entry.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const totalRevenue = completedVehicles.reduce((sum, v) => sum + (v.amountPaid || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Historial de Pagos</h2>
          <p className="text-gray-600 mt-1">
            {completedVehicles.length} {completedVehicles.length === 1 ? 'transacción' : 'transacciones'} completadas
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Ingresos Totales</p>
          <p className="text-2xl font-bold text-blue-600">${totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Buscar por placa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <Card>
        {filteredVehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Car className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'No se encontraron resultados' : 'No hay transacciones completadas'}
            </p>
            <p className="text-gray-400 text-sm">
              {searchTerm ? 'Intenta con otro término de búsqueda' : 'Las transacciones aparecerán aquí después del pago'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Placa</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead>Salida</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{vehicle.plate}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getVehicleIcon(vehicle.type)}
                        <span>{getVehicleTypeLabel(vehicle.type)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {vehicle.entryTime.toLocaleString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell>
                      {vehicle.exitTime?.toLocaleString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell>
                      {vehicle.exitTime && calculateDuration(vehicle.entryTime, vehicle.exitTime)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-blue-600">
                      ${vehicle.amountPaid?.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}

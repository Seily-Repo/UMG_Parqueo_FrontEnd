import { useState } from 'react';
import { useParking, Vehicle } from '../context/ParkingContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { CreditCard, Trash2, Car, Bike, Truck } from 'lucide-react';
import { CheckoutDialog } from '../components/CheckoutDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

export function ActiveVehicles() {
  const { getActiveVehicles, deleteVehicle } = useParking();
  const activeVehicles = getActiveVehicles();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

  const getVehicleIcon = (type: Vehicle['type']) => {
    switch (type) {
      case 'car':
        return <Car className="w-5 h-5" />;
      case 'motorcycle':
        return <Bike className="w-5 h-5" />;
      case 'truck':
        return <Truck className="w-5 h-5" />;
    }
  };

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

  const formatDuration = (entryTime: Date) => {
    const now = new Date();
    const diff = now.getTime() - entryTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleDelete = () => {
    if (vehicleToDelete) {
      deleteVehicle(vehicleToDelete.id);
      setVehicleToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Vehículos Activos</h2>
          <p className="text-gray-600 mt-1">
            {activeVehicles.length} {activeVehicles.length === 1 ? 'vehículo' : 'vehículos'} en el
            parqueo
          </p>
        </div>
      </div>

      {activeVehicles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Car className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No hay vehículos activos</p>
            <p className="text-gray-400 text-sm">
              Los vehículos aparecerán aquí cuando sean registrados
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeVehicles.map((vehicle) => (
            <Card key={vehicle.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      {getVehicleIcon(vehicle.type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{vehicle.plate}</CardTitle>
                      <CardDescription>{getVehicleTypeLabel(vehicle.type)}</CardDescription>
                    </div>
                  </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Activo
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hora de entrada:</span>
                    <span className="font-medium">
                      {vehicle.entryTime.toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tiempo transcurrido:</span>
                    <span className="font-medium">{formatDuration(vehicle.entryTime)}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1"
                    onClick={() => setSelectedVehicle(vehicle)}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Cobrar
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setVehicleToDelete(vehicle)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedVehicle && (
        <CheckoutDialog
          vehicle={selectedVehicle}
          open={!!selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
        />
      )}

      <AlertDialog open={!!vehicleToDelete} onOpenChange={() => setVehicleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar vehículo?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro que desea eliminar el vehículo con placa{' '}
              <span className="font-semibold">{vehicleToDelete?.plate}</span>? Esta acción no se
              puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

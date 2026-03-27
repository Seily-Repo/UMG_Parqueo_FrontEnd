import { useState } from 'react';
import { useParking, Vehicle } from '../context/ParkingContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Car, Bike, Truck } from 'lucide-react';
import { toast } from 'sonner';

export function NewVehicleForm() {
  const { addVehicle } = useParking();
  const [plate, setPlate] = useState('');
  const [vehicleType, setVehicleType] = useState<Vehicle['type']>('car');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!plate.trim()) {
      toast.error('Por favor ingrese una placa');
      return;
    }

    addVehicle(plate.trim(), vehicleType);
    toast.success(`Vehículo ${plate.toUpperCase()} registrado exitosamente`);
    setPlate('');
    setVehicleType('car');
  };

  const vehicleTypes = [
    { value: 'car', label: 'Auto', icon: Car, rate: '$3/hora' },
    { value: 'motorcycle', label: 'Moto', icon: Bike, rate: '$2/hora' },
    { value: 'truck', label: 'Camión', icon: Truck, rate: '$5/hora' },
  ] as const;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="plate">Placa del Vehículo</Label>
        <Input
          id="plate"
          placeholder="ABC-1234"
          value={plate}
          onChange={(e) => setPlate(e.target.value.toUpperCase())}
          className="uppercase"
          maxLength={10}
        />
      </div>

      <div className="space-y-3">
        <Label>Tipo de Vehículo</Label>
        <RadioGroup value={vehicleType} onValueChange={(value) => setVehicleType(value as Vehicle['type'])}>
          <div className="grid grid-cols-3 gap-4">
            {vehicleTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Label
                  key={type.value}
                  htmlFor={type.value}
                  className={`flex flex-col items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    vehicleType === type.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <RadioGroupItem value={type.value} id={type.value} className="sr-only" />
                  <Icon className={`w-8 h-8 ${vehicleType === type.value ? 'text-blue-600' : 'text-gray-400'}`} />
                  <div className="text-center">
                    <p className={`font-medium ${vehicleType === type.value ? 'text-blue-900' : 'text-gray-700'}`}>
                      {type.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{type.rate}</p>
                  </div>
                </Label>
              );
            })}
          </div>
        </RadioGroup>
      </div>

      <Button type="submit" className="w-full" size="lg">
        Registrar Vehículo
      </Button>
    </form>
  );
}

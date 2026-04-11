import { useMemo, useState } from 'react';
import { Vehicle, useParking } from '../context/ParkingContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { CreditCard, Banknote, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

interface CheckoutDialogProps {
  vehicle: Vehicle;
  open: boolean;
  onClose: () => void;
}

type PaymentMethod = 'cash' | 'card' | 'digital';

const RATES = {
  car: 3,
  motorcycle: 2,
  truck: 5,
};

const paymentMethods = [
  { value: 'cash', label: 'Efectivo', icon: Banknote },
  { value: 'card', label: 'Tarjeta', icon: CreditCard },
  { value: 'digital', label: 'Digital', icon: Smartphone },
] as const;

export function CheckoutDialog({ vehicle, open, onClose }: CheckoutDialogProps) {
  const { checkoutVehicle } = useParking();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');

  const { amount, hours, minutes } = useMemo(() => {
    const durationMs = new Date().getTime() - vehicle.entryTime.getTime();
    const totalHours = durationMs / (1000 * 60 * 60);
    const amount = Math.ceil(totalHours) * RATES[vehicle.type];
    const hours = Math.floor(totalHours);
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return { amount, hours, minutes };
  }, [vehicle.entryTime, vehicle.type, open]); // Recalculate when dialog opens

  const handleCheckout = () => {
    checkoutVehicle(vehicle.id, amount);
    toast.success(`Pago procesado exitosamente - ${vehicle.plate}`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Procesar Pago</DialogTitle>
          <DialogDescription>Detalles del cobro para el vehículo {vehicle.plate}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Vehicle Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tipo de vehículo:</span>
              <span className="font-medium capitalize">{vehicle.type === 'car' ? 'Auto' : vehicle.type === 'motorcycle' ? 'Moto' : 'Camión'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Hora de entrada:</span>
              <span className="font-medium">
                {vehicle.entryTime.toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tiempo transcurrido:</span>
              <span className="font-medium">{hours}h {minutes}m</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tarifa:</span>
              <span className="font-medium">${RATES[vehicle.type]}/hora</span>
            </div>
          </div>

          {/* Total Amount */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-red-900">Total a pagar:</span>
              <span className="text-3xl font-bold text-red-600">Q{amount.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <Label>Método de Pago</Label>
            <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
              <div className="grid grid-cols-3 gap-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <Label
                      key={method.value}
                      htmlFor={`payment-${method.value}`}
                      className={`flex flex-col items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === method.value
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <RadioGroupItem value={method.value} id={`payment-${method.value}`} className="sr-only" />
                      <Icon className={`w-6 h-6 ${paymentMethod === method.value ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span className={`text-xs font-medium ${paymentMethod === method.value ? 'text-blue-900' : 'text-gray-700'}`}>
                        {method.label}
                      </span>
                    </Label>
                  );
                })}
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleCheckout}>
            Confirmar Pago
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

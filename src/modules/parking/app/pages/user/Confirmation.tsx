import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useRegistration } from '../../context/RegistrationContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { CheckCircle2, Home } from 'lucide-react';
import { Button } from '../../components/ui/button';

export function Confirmation() {
  const navigate = useNavigate();
  const { currentRegistration, completeRegistration } = useRegistration();

  useEffect(() => {
    if (currentRegistration.paymentStatus !== 'paid') {
      navigate('/parking/user');
      return;
    }
    completeRegistration();
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-blue-200 bg-gray-50">
        <CardHeader className="items-center text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 size={48} className="text-blue-600" />
          </div>
          <CardTitle className="text-3xl text-blue-700">¡Pago Completado!</CardTitle>
          <p className="text-gray-600 pt-2">
            Su pago ha sido procesado exitosamente.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <Card className="text-start">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Número de Registro</p>
                <p className="text-2xl font-bold">
                  #{currentRegistration.carnet?.substring(0, 8) || 'XXXXXXXX'}
                </p>
              </div>

              <hr className="my-4" />

              <div>
                <p className="text-sm text-gray-500 mb-3">Información importante:</p>
                <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
                  <li>Recibirá un correo de confirmación en las próximas 24 horas.</li>
                  <li>Su sticker de parqueo estará disponible en la oficina administrativa.</li>
                  <li>Recuerde respetar las normas de parqueo establecidas.</li>
                  <li>El pago es mensual y debe realizarse los primeros 5 días.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Button
            size="lg"
            className="w-full"
            onClick={() => navigate('/parking')}
          >
            <Home size={16} className="mr-2" />
            Volver al Inicio
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

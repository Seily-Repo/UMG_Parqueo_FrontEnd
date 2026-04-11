import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useRegistration } from '../../context/RegistrationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ArrowLeft, RotateCcw, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

export function Signature() {
  const navigate = useNavigate();
  const { currentRegistration, updateRegistration } = useRegistration();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Set drawing style
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSubmit = () => {
    if (!hasDrawn) {
      toast.error('Por favor firme en el área designada');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const signatureData = canvas.toDataURL();
    updateRegistration({ signature: signatureData });
    navigate('/parking/user/confirmacion');
  };

  // Si ya hay firma, mostrar verificación
  if (currentRegistration.signature) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CheckCircle size={48} className="mx-auto text-blue-600" />
            <CardTitle className="mt-3 text-2xl">Firma Registrada</CardTitle>
            <CardDescription>
              Tu firma digital ha sido guardada.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <img 
                src={currentRegistration.signature} 
                alt="Firma" 
                className="max-w-full border-2 border-blue-600 rounded-lg bg-blue-50 p-4 inline-block"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/parking/user/pago')}
              >
                <ArrowLeft size={16} className="mr-2" />
                Atrás
              </Button>
              <Button size="lg" onClick={() => navigate('/parking/user/confirmacion')}>
                Siguiente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Firma Digital</CardTitle>
          <CardDescription>
            Firme en el área designada para completar su registro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Agreement Text */}
          <div 
            className="p-4 border rounded-lg bg-gray-50 max-h-64 overflow-y-auto"
          >
            <h3 className="font-semibold text-base mb-2">Términos y Condiciones del Servicio de Parqueo</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                <strong>1.</strong> El usuario se compromete a utilizar el espacio de parqueo asignado únicamente
                con los vehículos registrados en este formulario.
              </p>
              <p>
                <strong>2.</strong> La Universidad Nacional no se hace responsable por daños, robos o pérdidas
                que puedan ocurrir dentro de las instalaciones de parqueo.
              </p>
              <p>
                <strong>3.</strong> El estacionamiento debe realizarse únicamente en los espacios asignados,
                respetando las señalizaciones y normas de tránsito internas.
              </p>
              <p>
                <strong>4.</strong> El pago del servicio de parqueo es mensual y debe realizarse dentro de
                los primeros 5 días de cada mes.
              </p>
              <p>
                <strong>5.</strong> El incumplimiento de las normas puede resultar en la suspensión del
                servicio sin derecho a reembolso.
              </p>
              <p>
                <strong>6.</strong> Al firmar este documento, el usuario acepta haber leído y estar de acuerdo
                con todos los términos y condiciones establecidos.
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Firma del Estudiante *</label>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSignature}
              >
                <RotateCcw size={14} className="mr-2" />
                Limpiar
              </Button>
            </div>
            <div 
              className="border-2 border-dashed rounded-lg overflow-hidden bg-white"
            >
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-64 cursor-crosshair touch-none"
              />
            </div>
            <p className="text-center text-gray-500 text-xs mt-2">
              Dibuje su firma en el área de arriba usando el mouse o su dedo
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/parking/user/pago')}
            >
              <ArrowLeft size={16} className="mr-2" />
              Atrás
            </Button>
            <Button
              size="lg"
              onClick={handleSubmit}
            >
              Finalizar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

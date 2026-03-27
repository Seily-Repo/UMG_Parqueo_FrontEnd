import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useRegistration } from '../../context/RegistrationContext';
import { Card, Button, Row, Col } from 'react-bootstrap';
import { ArrowLeft, RotateCcw } from 'lucide-react';
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

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <Card className="shadow-sm">
        <Card.Header className="bg-white border-bottom">
          <Card.Title className="mb-1 h4">Firma Digital</Card.Title>
          <Card.Subtitle className="text-muted">
            Firme en el área designada para completar su registro
          </Card.Subtitle>
        </Card.Header>
        <Card.Body className="p-4">
          {/* Agreement Text */}
          <div 
            className="p-4 mb-4 border rounded"
            style={{ 
              backgroundColor: '#f8f9fa', 
              maxHeight: 256, 
              overflowY: 'auto' 
            }}
          >
            <h6 className="fw-semibold">Términos y Condiciones del Servicio de Parqueo</h6>
            <div className="small text-muted">
              <p className="mb-2">
                <strong>1.</strong> El usuario se compromete a utilizar el espacio de parqueo asignado únicamente
                con los vehículos registrados en este formulario.
              </p>
              <p className="mb-2">
                <strong>2.</strong> La Universidad Nacional no se hace responsable por daños, robos o pérdidas
                que puedan ocurrir dentro de las instalaciones de parqueo.
              </p>
              <p className="mb-2">
                <strong>3.</strong> El estacionamiento debe realizarse únicamente en los espacios asignados,
                respetando las señalizaciones y normas de tránsito internas.
              </p>
              <p className="mb-2">
                <strong>4.</strong> El pago del servicio de parqueo es mensual y debe realizarse dentro de
                los primeros 5 días de cada mes.
              </p>
              <p className="mb-2">
                <strong>5.</strong> El incumplimiento de las normas puede resultar en la suspensión del
                servicio sin derecho a reembolso.
              </p>
              <p className="mb-0">
                <strong>6.</strong> Al firmar este documento, el usuario acepta haber leído y estar de acuerdo
                con todos los términos y condiciones establecidos.
              </p>
            </div>
          </div>

          {/* Signature Area */}
          <div className="mb-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <label className="fw-medium">Firma del Estudiante *</label>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={clearSignature}
              >
                <RotateCcw size={16} className="me-2" />
                Limpiar
              </Button>
            </div>
            <div 
              style={{ 
                border: '2px dashed #dee2e6', 
                borderRadius: 8,
                overflow: 'hidden',
                backgroundColor: 'white'
              }}
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
                style={{ 
                  width: '100%', 
                  height: 256, 
                  cursor: 'crosshair',
                  touchAction: 'none'
                }}
              />
            </div>
            <p className="text-center text-muted small mt-2">
              Dibuje su firma en el área de arriba usando el mouse o su dedo
            </p>
          </div>

          {/* Navigation */}
          <Row className="g-3">
            <Col xs={6}>
              <Button
                variant="outline-secondary"
                size="lg"
                className="w-100"
                onClick={() => navigate('/parking/user/pago')}
              >
                <ArrowLeft size={16} className="me-2" />
                Atrás
              </Button>
            </Col>
            <Col xs={6}>
              <Button
                variant="primary"
                size="lg"
                className="w-100"
                onClick={handleSubmit}
              >
                Finalizar
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
}

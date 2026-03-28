import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useRegistration } from '../../context/RegistrationContext';
import { Card, Button, ListGroup } from 'react-bootstrap';
import { CheckCircle2, Home } from 'lucide-react';

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
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <Card className="shadow-sm" style={{ borderColor: '#d1e7dd', backgroundColor: '#f8f9fa' }}>
        <Card.Body className="text-center p-5">
          <div 
            style={{ 
              width: 80, 
              height: 80, 
              backgroundColor: '#d1e7dd', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}
          >
            <CheckCircle2 size={48} color="#198754" />
          </div>
          <h2 className="mb-4" style={{ color: '#198754' }}>¡Pago Completado!</h2>
          
          <p className="text-muted mb-4">
            Su pago ha sido procesado exitosamente.
          </p>

          <Card className="mb-4 text-start">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <small className="text-muted">Número de Registro</small>
                <h3 className="mb-0 fw-bold">
                  #{currentRegistration.carnet?.substring(0, 8) || 'XXXXXXXX'}
                </h3>
              </div>

              <hr />

              <div className="mt-4">
                <p className="small text-muted mb-3">Información importante:</p>
                <ListGroup variant="flush">
                  <ListGroup.Item className="px-0 py-2 small">
                    • Recibirá un correo de confirmación en las próximas 24 horas
                  </ListGroup.Item>
                  <ListGroup.Item className="px-0 py-2 small">
                    • Su sticker de parqueo estará disponible en la oficina administrativa
                  </ListGroup.Item>
                  <ListGroup.Item className="px-0 py-2 small">
                    • Recuerde respetar las normas de parqueo establecidas
                  </ListGroup.Item>
                  <ListGroup.Item className="px-0 py-2 small border-0">
                    • El pago es mensual y debe realizarse los primeros 5 días
                  </ListGroup.Item>
                </ListGroup>
              </div>
            </Card.Body>
          </Card>

          <Button
            variant="primary"
            size="lg"
            className="w-100"
            onClick={() => navigate('/parking')}
          >
            <Home size={16} className="me-2" />
            Volver al Inicio
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
}

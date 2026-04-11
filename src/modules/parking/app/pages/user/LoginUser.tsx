import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useRegistration } from '../../context/RegistrationContext';
import { Card, Form, Button, Alert, Container, Spinner } from 'react-bootstrap';
import { LogIn } from 'lucide-react';
import { toast } from 'react-toastify';
import { AppHeader } from '../../components/AppHeader';
import { AppFooter } from '../../components/AppFooter';
import { getReadableApiError } from '../../../../../shared/api';
import { delinquentStudentService, studentService } from '../../../../../shared/services';

export function LoginUser() {
  const navigate = useNavigate();
  const { updateRegistration } = useRegistration();
  const [carnet, setCarnet] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const student = await studentService.getByCarne(carnet.trim());
      const activeDelinquency = await delinquentStudentService.getActiveByCarne(carnet.trim());
      const delinquentRecord = activeDelinquency[0];

      updateRegistration({
        id: student.EST_CARNE,
        carnet: student.EST_CARNE,
        fullName: student.EST_NOMBRE_COMPLETO,
        institutionalEmail: student.EST_EMAIL,
        isDelinquent: !!delinquentRecord,
        delinquentReason: delinquentRecord?.MOR_MOTIVO,
        paymentStatus: 'pending',
        vehicles: [],
        createdAt: new Date(student.EST_FECHA_CREACION),
      });

      if (delinquentRecord) {
        toast.warning(`Estudiante con restricción temporal: ${delinquentRecord.MOR_MOTIVO}`);
      }

      toast.success(`Bienvenido, ${student.EST_NOMBRE_COMPLETO || 'Estudiante'}`);
      navigate('/parking');
    } catch (requestError) {
      setError(
        getReadableApiError(requestError, 'No fue posible validar el carné en este momento.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="parking-shell parking-shell--photo"
      style={{
        minHeight: '100vh',
        backgroundImage: 'url(/villanueva.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <AppHeader />

      <main>
      <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 170px)' }}>
        <div style={{ width: '100%', maxWidth: 450 }}>
          <Card className="shadow-lg border-0 rounded-3">
            <Card.Body className="p-4 p-md-5">
              <div className="text-center mb-4">
                <h4 className="fw-bold text-primary mb-1">Portal de Parqueo</h4>
                <p className="text-muted small">Universidad Nacional</p>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Número de Carnet</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="5190-23-XXXX"
                    value={carnet}
                    onChange={(e) => setCarnet(e.target.value)}
                    required
                  />
                </Form.Group>

                <Alert variant="info" className="mb-4 text-start">
                  <small>
                    <strong>Acceso temporal:</strong> por ahora el ingreso se valida únicamente con el carné del estudiante
                    y el sistema carga automáticamente el nombre desde el backend.
                  </small>
                </Alert>

                <Button variant="primary" type="submit" size="lg" className="w-100" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Validando carnet...
                    </>
                  ) : (
                    <>
                      <LogIn size={16} className="me-2" /> Ingresar
                    </>
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </Container>
      </main>
      <AppFooter />
    </div>
  );
}

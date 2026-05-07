import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useRegistration } from '../../context/RegistrationContext';
import { Card, Form, Button, Alert, Container, Spinner } from 'react-bootstrap';
import { LogIn } from 'lucide-react';
import { toast } from 'react-toastify';
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
    <div className="bg-mesh d-flex flex-column" style={{ minHeight: '100vh' }}>
      <div className="deco-circle deco-circle-1" />
      <div className="deco-circle deco-circle-2" />

      <main className="flex-grow-1 d-flex align-items-center justify-content-center py-5">
        <Container style={{ maxWidth: 520 }}>
          <div className="text-center mb-4 animate-fade-in">
            <div className="icon-glass d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 80, height: 80 }}>
              <LogIn size={32} color="var(--color-primario)" />
            </div>
            <h2 className="mb-1" style={{ color: 'var(--color-primario)' }}>Portal de Parqueo</h2>
            <p className="text-muted mb-0">Universidad Mariano Gálvez de Guatemala</p>
          </div>

          <Card className="liquid-card border-0 shadow-lg" style={{ overflow: 'hidden' }}>
            <div className="accent-bar" />
            <Card.Body className="p-4 p-md-5">
              <div className="text-center mb-4">
                <h4 className="fw-bold mb-1">Bienvenido</h4>
                <p className="text-muted small mb-0">Ingresa tu carné para continuar al sistema.</p>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label className="form-label">Número de Carnet</Form.Label>
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

                <Button
                  type="submit"
                  className="btn-liquid"
                  disabled={isSubmitting}
                  style={{ fontWeight: 700 }}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Validando carnet...
                    </>
                  ) : (
                    'Ingresar'
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Container>
      </main>

      <AppFooter />
    </div>
  );
}

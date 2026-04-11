import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Alert, Button, Card, Spinner, Table } from 'react-bootstrap';
import { AlertTriangle, ArrowLeft, CreditCard, Receipt, Search } from 'lucide-react';
import { useRegistration } from '../../context/RegistrationContext';
import { getReadableApiError } from '../../../../../shared/api';
import type { BackendEstudianteMulta } from '../../../../../shared/models/backend';
import { fineService } from '../../../../../shared/services';

function getFineStatusLabel(status?: string) {
  switch (status) {
    case 'A':
      return 'Activa';
    case 'C':
      return 'Cancelada';
    case 'P':
      return 'Pagada';
    default:
      return status || 'Desconocido';
  }
}

function getFineStatusVariant(status?: string) {
  switch (status) {
    case 'A':
      return 'danger';
    case 'C':
      return 'secondary';
    case 'P':
      return 'success';
    default:
      return 'secondary';
  }
}

function formatFineDate(value?: string) {
  if (!value) {
    return 'No disponible';
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  const year = parsed.getFullYear();
  const month = `${parsed.getMonth() + 1}`.padStart(2, '0');
  const day = `${parsed.getDate()}`.padStart(2, '0');

  return `${year}/${month}/${day}`;
}

export function UserFines() {
  const navigate = useNavigate();
  const { currentRegistration } = useRegistration();
  const [fines, setFines] = useState<BackendEstudianteMulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentRegistration.carnet) {
      return;
    }

    let isMounted = true;

    const loadFines = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fineService.getStudentFinesByCarne(currentRegistration.carnet);

        if (!isMounted) {
          return;
        }

        setFines(response);
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setError(getReadableApiError(requestError, 'No fue posible consultar las multas del estudiante.'));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadFines();

    return () => {
      isMounted = false;
    };
  }, [currentRegistration.carnet]);

  const activeFinesCount = useMemo(
    () => fines.filter((fine) => fine.EMU_ESTADO_MULTA === 'A').length,
    [fines]
  );

  if (!currentRegistration.carnet) {
    return <Alert variant="warning">Debe iniciar sesion antes de consultar multas.</Alert>;
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Card className="shadow-sm">
        <Card.Header className="bg-white border-bottom">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <Card.Title className="mb-1 h4">Consulta de Multas</Card.Title>
              <Card.Subtitle className="text-muted">
                Revise sus multas y abra el formulario de pago para las que sigan activas
              </Card.Subtitle>
            </div>
            <Button variant="outline-secondary" onClick={() => navigate('/parking')}>
              <ArrowLeft size={16} className="me-2" />
              Volver
            </Button>
          </div>
        </Card.Header>
        <Card.Body className="p-4">
          <div className="d-flex flex-wrap gap-3 mb-4">
            <Card className="border-0" style={{ backgroundColor: '#FFFFFF', minWidth: 220 }}>
              <Card.Body>
                <div className="d-flex align-items-center gap-3">
                  <AlertTriangle color="#C7352E" />
                  <div>
                    <div className="small text-muted">Multas activas</div>
                    <div className="h4 mb-0">{activeFinesCount}</div>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card className="border-0" style={{ backgroundColor: '#FFFFFF', minWidth: 220 }}>
              <Card.Body>
                <div className="d-flex align-items-center gap-3">
                  <Receipt color="#1A6AA6" />
                  <div>
                    <div className="small text-muted">Registros encontrados</div>
                    <div className="h4 mb-0">{fines.length}</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="text-muted mt-3 mb-0">Consultando multas del estudiante...</p>
            </div>
          ) : fines.length === 0 ? (
            <div className="text-center py-5">
              <Search size={56} color="#adb5bd" />
              <p className="text-muted mt-3 mb-1">No se encontraron multas para este estudiante.</p>
              <small className="text-muted">
                Cuando el backend asocie multas al carne, apareceran aqui.
              </small>
            </div>
          ) : (
            <>
              <Alert variant="info">
                Esta vista le permite consultar el estado de sus multas. Desde aqui puede abrir la segunda vista del
                modulo, que es el formulario para pagar una multa activa. El backend actual expone la relacion
                estudiante-multa, por eso el pago se apoya en esa informacion y el monto se completa en el formulario.
              </Alert>

              <div className="table-responsive parking-fines-table">
                <Table hover className="align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Carne</th>
                      <th>Estado</th>
                      <th>Creado por</th>
                      <th>Fecha</th>
                      <th className="text-end">Accion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fines.map((fine) => (
                      <tr key={fine.EMU_ESTUDIANTE_MULTA}>
                        <td className="fw-semibold">{fine.EST_CARNE}</td>
                        <td>
                          <span className={`badge text-bg-${getFineStatusVariant(fine.EMU_ESTADO_MULTA)}`}>
                            {getFineStatusLabel(fine.EMU_ESTADO_MULTA)}
                          </span>
                        </td>
                        <td>{fine.EMU_CREADO_POR}</td>
                        <td>{formatFineDate(fine.EMU_FECHA_CREACION)}</td>
                        <td className="text-end">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            disabled={fine.EMU_ESTADO_MULTA !== 'A'}
                            onClick={() =>
                              navigate(`/parking/user/multas/pagar/${fine.EMU_ESTUDIANTE_MULTA}`, {
                                state: { fineRelation: fine },
                              })
                            }
                          >
                            <CreditCard size={16} className="me-2" />
                            Pagar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

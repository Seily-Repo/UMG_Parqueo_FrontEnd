import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Alert, Button, Card, Spinner } from 'react-bootstrap';
import { AlertTriangle, CreditCard, Receipt, Search } from 'lucide-react';
import { useRegistration } from '../../context/RegistrationContext';
import { getReadableApiError } from '../../../../../shared/api';
import type { BackendEstudianteMulta } from '../../../../../shared/models/backend';
import { fineService } from '../../../../../shared/services';

function normalizeCarnet(carnet: string) {
  return carnet.replace(/\D/g, '');
}

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
  const location = useLocation();
  const { currentRegistration, updateRegistration } = useRegistration();

  const carnetFromUrl = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return normalizeCarnet(params.get('carne') || '');
  }, [location.search]);
  const isEmbedded = Boolean(carnetFromUrl);
  const activeCarnet = carnetFromUrl || currentRegistration.carnet || '';

  const [fines, setFines] = useState<BackendEstudianteMulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (carnetFromUrl && carnetFromUrl !== currentRegistration.carnet) {
      updateRegistration({ carnet: carnetFromUrl, id: carnetFromUrl });
    }
  }, [carnetFromUrl, currentRegistration.carnet, updateRegistration]);

  useEffect(() => {
    if (!activeCarnet) {
      return;
    }

    let isMounted = true;

    const loadFines = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fineService.getStudentFinesByCarne(activeCarnet);

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
  }, [activeCarnet]);

  const activeFinesCount = useMemo(
    () => fines.filter((fine) => fine.EMU_ESTADO_MULTA === 'A').length,
    [fines]
  );

  if (!activeCarnet) {
    return <Alert variant="warning">Debe iniciar sesion antes de consultar multas.</Alert>;
  }

  const embeddedWrapperStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: '#f2f2f2',
    padding: '38px 44px',
  };
  const embeddedInnerStyle: React.CSSProperties = {
    maxWidth: 1100,
    margin: '0 auto',
  };

  const content = (
    <div className="parking-user-view" style={isEmbedded ? embeddedInnerStyle : undefined}>
      <div className="parking-payments-page__heading">
        <h1>Multas</h1>
        <p>{isEmbedded ? `Carne ${activeCarnet}. Selecciona la multa que deseas pagar.` : 'Consulta tus multas, restricciones y pagos pendientes.'}</p>
      </div>

      <Card className="parking-dashboard-panel">
        <Card.Header>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <Card.Title className="mb-1 h4">Consulta de Multas</Card.Title>
              <Card.Subtitle className="text-muted">
                Revise sus multas y presione "Pagar" en cada una que siga activa
              </Card.Subtitle>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
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
              <p className="text-muted mt-3 mb-0">No se encontraron multas para este estudiante.</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {fines.map((fine) => {
                const isActive = fine.EMU_ESTADO_MULTA === 'A';
                return (
                  <Card
                    key={fine.EMU_ESTUDIANTE_MULTA}
                    className="border-0"
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: 12,
                      boxShadow: '0 8px 22px rgba(25, 40, 57, 0.08)',
                    }}
                  >
                    <Card.Body>
                      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                        <div className="d-flex align-items-center gap-3 flex-grow-1">
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 12,
                              background: isActive ? 'rgba(196, 18, 48, 0.12)' : 'rgba(108, 117, 125, 0.12)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: isActive ? '#C41230' : '#6c757d',
                            }}
                          >
                            <AlertTriangle size={22} />
                          </div>
                          <div>
                            <div className="fw-semibold" style={{ color: '#0d3a66' }}>
                              {fine.MUL_DESCRIPCION || `Multa #${fine.MUL_MULTA || fine.EMU_ESTUDIANTE_MULTA}`}
                            </div>
                            <small className="text-muted d-block">
                              {fine.VEH_ID_VEHICULO ? `Vehiculo ${fine.VEH_ID_VEHICULO} · ` : ''}
                              Creada el {formatFineDate(fine.EMU_FECHA_CREACION)}
                            </small>
                          </div>
                        </div>

                        {Number(fine.MUL_MONTO_TOTAL) > 0 && (
                          <div className="text-end">
                            <small className="text-muted d-block">Monto</small>
                            <span className="fw-bold" style={{ color: '#0d3a66', fontSize: '1.1rem' }}>
                              Q{Number(fine.MUL_MONTO_TOTAL).toFixed(2)}
                            </span>
                          </div>
                        )}

                        <span className={`badge text-bg-${getFineStatusVariant(fine.EMU_ESTADO_MULTA)}`} style={{ fontSize: '0.85rem' }}>
                          {getFineStatusLabel(fine.EMU_ESTADO_MULTA)}
                        </span>

                        <Button
                          variant="primary"
                          disabled={!isActive}
                          onClick={() => {
                            const search = isEmbedded ? `?carne=${encodeURIComponent(activeCarnet)}` : '';
                            navigate(`/parking/user/multas/pagar/${fine.EMU_ESTUDIANTE_MULTA}${search}`, {
                              state: { fineRelation: fine },
                            });
                          }}
                        >
                          <CreditCard size={16} className="me-2" />
                          Pagar
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                );
              })}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );

  if (isEmbedded) {
    return <div style={embeddedWrapperStyle}>{content}</div>;
  }

  return content;
}

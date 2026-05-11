import { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Row, Spinner, Table } from 'react-bootstrap';
import { CarFront, ListChecks, PlusCircle, RefreshCw, ShieldAlert, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { getReadableApiError } from '../../../../../shared/api';
import type { BackendEstudianteMulta, BackendMulta } from '../../../../../shared/models/backend';
import { fineService } from '../../../../../shared/services';

type FineFormState = {
  description: string;
  amount: string;
  dueDays: string;
};

type AssignFineFormState = {
  fineId: string;
  vehicleId: string;
};

const initialFormState: FineFormState = {
  description: '',
  amount: '',
  dueDays: '10',
};

const initialAssignFormState: AssignFineFormState = {
  fineId: '',
  vehicleId: '',
};

function getFineId(fine: BackendMulta) {
  return fine.MUL_MULTA || fine.MUL_id_multa || 0;
}

function getFineDescription(fine: BackendMulta) {
  return fine.MUL_DESCRIPCION || fine.MUL_descripcion || '';
}

function getFineAmount(fine: BackendMulta) {
  return Number(fine.MUL_MONTO_TOTAL ?? fine.MUL_monto_total ?? 0);
}

function getFineDueDays(fine: BackendMulta) {
  return Number(fine.MUL_DIAS_VENCIMIENTO ?? fine.MUL_dias_vencimiento ?? 0);
}

function formatCurrency(amount: number) {
  return `Q${amount.toFixed(2)}`;
}

export function AdminFines() {
  const [fines, setFines] = useState<BackendMulta[]>([]);
  const [assignedFines, setAssignedFines] = useState<BackendEstudianteMulta[]>([]);
  const [formData, setFormData] = useState<FineFormState>(initialFormState);
  const [assignFormData, setAssignFormData] = useState<AssignFineFormState>(initialAssignFormState);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const sortedFines = useMemo(
    () => fines.slice().sort((a, b) => getFineId(b) - getFineId(a)),
    [fines]
  );

  const loadFines = async () => {
    setLoading(true);
    setError('');

    try {
      const [fineResponse, assignedResponse] = await Promise.all([
        fineService.getAllFines(),
        fineService.getAllStudentFines(),
      ]);
      setFines(fineResponse);
      setAssignedFines(assignedResponse.filter((fine) => fine.EMU_ESTADO_MULTA !== 'C'));
    } catch (requestError) {
      setError(getReadableApiError(requestError, 'No fue posible cargar las multas.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadFines();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const amount = Number(formData.amount);
    const dueDays = Number(formData.dueDays);

    if (!formData.description.trim()) {
      toast.error('La descripcion de la multa es obligatoria');
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('El monto debe ser mayor a cero');
      return;
    }

    if (!Number.isInteger(dueDays) || dueDays < 0) {
      toast.error('Los dias de vencimiento deben ser un numero entero valido');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fineService.createFine({
        MUL_DESCRIPCION: formData.description.trim(),
        MUL_MONTO_TOTAL: amount,
        MUL_DIAS_VENCIMIENTO: dueDays,
        MUL_CREADO_POR: 'ADMINISTRADOR',
      });

      setFines((prev) => [response.data, ...prev]);
      setFormData(initialFormState);
      toast.success(response.message || 'Multa creada exitosamente');
    } catch (requestError) {
      const message = getReadableApiError(requestError, 'No fue posible crear la multa.');
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const fineId = Number(assignFormData.fineId);
    const vehicleId = assignFormData.vehicleId.trim();

    if (!fineId) {
      toast.error('Seleccione una multa para asignar');
      return;
    }

    if (!vehicleId) {
      toast.error('Ingrese el ID del vehiculo');
      return;
    }

    setAssigning(true);
    setError('');

    try {
      await fineService.createStudentFine({
        MUL_MULTA: fineId,
        VEH_ID_VEHICULO: vehicleId,
        EMU_ESTADO_MULTA: 'A',
        EMU_CREADO_POR: 'ADMINISTRADOR',
      });

      setAssignFormData(initialAssignFormState);
      toast.success(`Multa asignada al vehiculo #${vehicleId}`);
      void loadFines();
    } catch (requestError) {
      const message = getReadableApiError(requestError, 'No fue posible asignar la multa a la placa indicada.');
      setError(message);
      toast.error(message);
    } finally {
      setAssigning(false);
    }
  };

  const handleDeleteFine = async (fine: BackendMulta) => {
    const fineId = getFineId(fine);

    if (!fineId) {
      toast.error('No se pudo identificar la multa');
      return;
    }

    setDeletingId(fineId);
    setError('');

    try {
      await fineService.updateFine(fineId, {
        MUL_DESCRIPCION: getFineDescription(fine),
        MUL_MONTO_TOTAL: getFineAmount(fine),
        MUL_DIAS_VENCIMIENTO: getFineDueDays(fine),
        MUL_MODIFICADO_POR: 'ADMINISTRADOR',
        MUL_ESTADO_REGISTRO: 'I',
      });

      setFines((prev) => prev.filter((item) => getFineId(item) !== fineId));
      toast.success('Multa eliminada del catalogo');
    } catch (requestError) {
      const message = getReadableApiError(requestError, 'No fue posible eliminar la multa.');
      setError(message);
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAssignedFine = async (fine: BackendEstudianteMulta) => {
    const relationId = fine.EMU_USUARIO_MULTA || fine.EMU_ESTUDIANTE_MULTA;

    if (!relationId) {
      toast.error('No se pudo identificar la multa asignada');
      return;
    }

    setDeletingId(relationId);
    setError('');

    try {
      await fineService.updateStudentFineStatus(relationId, {
        EMU_ESTADO_MULTA: 'C',
        EMU_MODIFICADO_POR: 'ADMINISTRADOR',
      });

      setAssignedFines((prev) =>
        prev.filter((item) => (item.EMU_USUARIO_MULTA || item.EMU_ESTUDIANTE_MULTA) !== relationId)
      );
      toast.success('Multa asignada eliminada');
    } catch (requestError) {
      const message = getReadableApiError(requestError, 'No fue posible eliminar la multa asignada.');
      setError(message);
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-bold mb-1">Gestion de Multas</h3>
        <p className="text-muted mb-0">Crea el catalogo de multas y asignalo a vehiculos registrados.</p>
      </div>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      <Row className="g-4">
        <Col lg={4}>
          <Card className="shadow-sm" style={{ borderColor: '#0d47a1' }}>
            <Card.Header className="bg-white">
              <div className="d-flex align-items-center gap-2">
                <ShieldAlert size={20} color="#C41230" />
                <div>
                  <h5 className="mb-0">Nueva Multa</h5>
                  <small className="text-muted">Catalogo administrativo</small>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Descripcion *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.description}
                    onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
                    placeholder="Ej. Estacionarse en area no autorizada"
                    maxLength={100}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Monto *</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(event) => setFormData((prev) => ({ ...prev, amount: event.target.value }))}
                    placeholder="Ej. 150.00"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Dias para vencer *</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="1"
                    value={formData.dueDays}
                    onChange={(event) => setFormData((prev) => ({ ...prev, dueDays: event.target.value }))}
                    required
                  />
                </Form.Group>

                <Button type="submit" className="w-100" disabled={submitting}>
                  {submitting ? <Spinner size="sm" className="me-2" /> : <PlusCircle size={16} className="me-2" />}
                  {submitting ? 'Creando...' : 'Crear Multa'}
                </Button>
              </Form>
            </Card.Body>
          </Card>

          <Card className="shadow-sm mt-4" style={{ borderColor: '#0d47a1' }}>
            <Card.Header className="bg-white">
              <div className="d-flex align-items-center gap-2">
                <CarFront size={20} color="#0d47a1" />
                <div>
                  <h5 className="mb-0">Asignar Multa</h5>
                  <small className="text-muted">Relacionar multa con vehiculo registrado</small>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleAssignSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Multa *</Form.Label>
                  <Form.Select
                    value={assignFormData.fineId}
                    onChange={(event) => setAssignFormData((prev) => ({ ...prev, fineId: event.target.value }))}
                    required
                  >
                    <option value="">Seleccione una multa</option>
                    {sortedFines.map((fine) => (
                      <option key={getFineId(fine)} value={getFineId(fine)}>
                        #{getFineId(fine)} - {getFineDescription(fine)} ({formatCurrency(getFineAmount(fine))})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>ID del Vehiculo *</Form.Label>
                  <Form.Control
                    value={assignFormData.vehicleId}
                    onChange={(event) => setAssignFormData((prev) => ({ ...prev, vehicleId: event.target.value }))}
                    placeholder="Ej. 1"
                    required
                  />
                  <Form.Text className="text-muted">
                    La multa aparecera al usuario propietario de ese vehiculo.
                  </Form.Text>
                </Form.Group>

                <Button type="submit" variant="primary" className="w-100" disabled={assigning || loading}>
                  {assigning ? <Spinner size="sm" className="me-2" /> : <PlusCircle size={16} className="me-2" />}
                  {assigning ? 'Asignando...' : 'Asignar por Placa'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="shadow-sm" style={{ borderColor: '#0d47a1' }}>
            <Card.Header className="bg-white">
              <div className="d-flex align-items-center justify-content-between gap-3">
                <div>
                  <h5 className="mb-1">Multas Registradas</h5>
                  <p className="text-muted small mb-0">Catalogo activo usado para asignar multas a vehiculos.</p>
                </div>
                <Button variant="outline-primary" size="sm" onClick={loadFines} disabled={loading}>
                  <RefreshCw size={16} className="me-2" />
                  Actualizar
                </Button>
              </div>
            </Card.Header>
            <Card.Body className="p-4">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" />
                  <p className="text-muted mt-3 mb-0">Cargando multas...</p>
                </div>
              ) : sortedFines.length === 0 ? (
                <div className="text-center py-5">
                  <ShieldAlert size={56} color="#dee2e6" className="mb-3" />
                  <p className="text-muted mb-0">No hay multas registradas.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Descripcion</th>
                        <th>Monto</th>
                        <th>Vencimiento</th>
                        <th>Estado</th>
                        <th className="text-end">Accion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedFines.map((fine) => (
                        <tr key={getFineId(fine)}>
                          <td className="fw-medium">{getFineId(fine)}</td>
                          <td>{getFineDescription(fine)}</td>
                          <td>{formatCurrency(getFineAmount(fine))}</td>
                          <td>{getFineDueDays(fine)} dias</td>
                          <td>
                            <Badge bg="success">Activa</Badge>
                          </td>
                          <td className="text-end">
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteFine(fine)}
                              disabled={deletingId === getFineId(fine)}
                            >
                              {deletingId === getFineId(fine) ? <Spinner size="sm" className="me-2" /> : <Trash2 size={16} className="me-2" />}
                              Eliminar
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>

          <Card className="shadow-sm mt-4" style={{ borderColor: '#0d47a1' }}>
            <Card.Header className="bg-white">
              <div className="d-flex align-items-center justify-content-between gap-3">
                <div className="d-flex align-items-center gap-2">
                  <ListChecks size={20} color="#0d47a1" />
                  <div>
                    <h5 className="mb-1">Multas Asignadas</h5>
                    <p className="text-muted small mb-0">Registros activos creados para estudiantes o vehiculos.</p>
                  </div>
                </div>
                <Button variant="outline-primary" size="sm" onClick={loadFines} disabled={loading}>
                  <RefreshCw size={16} className="me-2" />
                  Actualizar
                </Button>
              </div>
            </Card.Header>
            <Card.Body className="p-4">
              {assignedFines.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted mb-0">No hay multas asignadas activas.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Multa</th>
                        <th>Vehiculo</th>
                        <th>Estado</th>
                        <th className="text-end">Accion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignedFines.map((fine) => {
                        const relationId = fine.EMU_USUARIO_MULTA || fine.EMU_ESTUDIANTE_MULTA;
                        return (
                          <tr key={relationId}>
                            <td className="fw-medium">{relationId}</td>
                            <td>{fine.MUL_MULTA}</td>
                            <td>{fine.VEH_ID_VEHICULO ? `#${fine.VEH_ID_VEHICULO}` : 'Sin vehiculo'}</td>
                            <td>
                              <Badge bg="danger">Activa</Badge>
                            </td>
                            <td className="text-end">
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteAssignedFine(fine)}
                                disabled={deletingId === relationId}
                              >
                                {deletingId === relationId ? <Spinner size="sm" className="me-2" /> : <Trash2 size={16} className="me-2" />}
                                Eliminar
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

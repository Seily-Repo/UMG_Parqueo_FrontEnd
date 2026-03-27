import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useRegistration } from '../../context/RegistrationContext';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import { Upload, User } from 'lucide-react';
import { toast } from 'react-toastify';

export function PersonalData() {
  const navigate = useNavigate();
  const { currentRegistration, updateRegistration } = useRegistration();
  
  const [formData, setFormData] = useState({
    carnet: (currentRegistration as any).carnet || '',
    dpi: (currentRegistration as any).dpi || '',
    fullName: currentRegistration.fullName || '',
    address: currentRegistration.address || '',
    phone: currentRegistration.phone || '',
    emergencyContact: currentRegistration.emergencyContact || '',
    emergencyPhone: currentRegistration.emergencyPhone || '',
    photo: currentRegistration.photo || '',
  });

  const [previewPhoto, setPreviewPhoto] = useState(currentRegistration.photo || '');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen debe ser menor a 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewPhoto(result);
        setFormData({ ...formData, photo: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.carnet || !formData.dpi || !formData.fullName || !formData.address || !formData.phone ||
        !formData.emergencyContact || !formData.emergencyPhone) {
      toast.error('Por favor complete todos los campos');
      return;
    }

    if (!formData.photo) {
      toast.error('Por favor suba una foto');
      return;
    }

    updateRegistration(formData);
    navigate('/parking/user/vehiculos');
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <Card className="shadow-sm">
        <Card.Header className="bg-white border-bottom">
          <Card.Title className="mb-1 h4">Datos Personales</Card.Title>
          <Card.Subtitle className="text-muted">
            Complete su información personal para continuar
          </Card.Subtitle>
        </Card.Header>
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            {/* Photo Upload */}
            <Form.Group className="mb-4">
              <Form.Label>Foto del Estudiante *</Form.Label>
              <div className="d-flex align-items-center gap-4">
                <div 
                  style={{ 
                    width: 128, 
                    height: 128, 
                    border: '2px dashed #dee2e6', 
                    borderRadius: 8, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: '#f8f9fa',
                    overflow: 'hidden'
                  }}
                >
                  {previewPhoto ? (
                    <img src={previewPhoto} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={48} color="#adb5bd" />
                  )}
                </div>
                <div className="flex-grow-1">
                  <label htmlFor="photo-upload" className="btn btn-primary">
                    <Upload size={16} className="me-2" />
                    Subir Foto
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                  />
                  <Form.Text className="d-block mt-2">
                    Formato JPG, PNG. Tamaño máximo 5MB.
                  </Form.Text>
                </div>
              </div>
            </Form.Group>

            {/* Carnet */}
            <Form.Group className="mb-3">
              <Form.Label>Número de Carnet *</Form.Label>
              <Form.Control
                type="text"
                placeholder="2021XXXXX"
                value={formData.carnet}
                onChange={(e) => setFormData({ ...formData, carnet: e.target.value })}
                maxLength={15}
              />
            </Form.Group>

            {/* DPI */}
            <Form.Group className="mb-3">
              <Form.Label>Número de DPI *</Form.Label>
              <Form.Control
                type="text"
                placeholder="XXXX XXXXX XXXX"
                value={formData.dpi}
                onChange={(e) => setFormData({ ...formData, dpi: e.target.value })}
                maxLength={20}
              />
            </Form.Group>

            {/* Full Name */}
            <Form.Group className="mb-3">
              <Form.Label>Nombre Completo *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Juan Carlos Pérez García"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </Form.Group>

            {/* Address */}
            <Form.Group className="mb-3">
              <Form.Label>Dirección *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Zona 1, Guatemala, Guatemala"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </Form.Group>

            {/* Phone */}
            <Form.Group className="mb-3">
              <Form.Label>Teléfono *</Form.Label>
              <Form.Control
                type="text"
                placeholder="5555-5555"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Form.Group>

            {/* Emergency Contact */}
            <Form.Group className="mb-3">
              <Form.Label>Contacto de Emergencia *</Form.Label>
              <Form.Control
                type="text"
                placeholder="María Pérez"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              />
            </Form.Group>

            {/* Emergency Phone */}
            <Form.Group className="mb-4">
              <Form.Label>Teléfono de Emergencia *</Form.Label>
              <Form.Control
                type="text"
                placeholder="5555-5555"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
              />
            </Form.Group>

            <Row className="g-3">
              <Col xs={6}>
                <Button
                  variant="outline-primary"
                  size="lg"
                  className="w-100"
                  onClick={() => navigate('/parking/user')}
                >
                  Atrás
                </Button>
              </Col>
              <Col xs={6}>
                <Button variant="primary" type="submit" size="lg" className="w-100">
                  Siguiente
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

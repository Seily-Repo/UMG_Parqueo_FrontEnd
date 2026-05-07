import { useNavigate } from 'react-router';
import { Row, Col, Button, Container } from 'react-bootstrap';
import { Car, AlertTriangle, FileText } from 'lucide-react';
import { AppFooter } from '../components/AppFooter';
import { useRegistration } from '../context/RegistrationContext';
import villanueva from '../../../../assets/villanueva.webp';
import umgLogo from '../../../../assets/umg_logo.png';

export function LandingPage() {
  const navigate = useNavigate();
  const { currentRegistration } = useRegistration();
  const displayName = currentRegistration?.fullName || 'Estudiante';

  return (
    <div className="bg-mesh" style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div className="deco-circle deco-circle-1" />
      <div className="deco-circle deco-circle-2" />

      <div className="header-glass" style={{ position: 'sticky', top: 0, zIndex: 20, padding: '1rem 0' }}>
        <Container className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <img src={umgLogo} alt="UMG Logo" style={{ height: 48, width: 'auto', objectFit: 'contain' }} />
            <div>
              <h5 className="mb-0" style={{ color: '#ffffff', fontFamily: 'var(--fuente-titulos)', fontStyle: 'italic' }}>
                Universidad Mariano Gálvez De Guatemala
              </h5>
              <small style={{ color: 'rgba(255,255,255,0.8)' }}>Sistema de Parqueo</small>
            </div>
          </div>
        </Container>
      </div>

      <div
        className="landing-shell"
        style={{
          backgroundImage: `url(${villanueva})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'relative',
          padding: '6rem 1rem 4rem',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.35), rgba(255,255,255,0.05))',
            pointerEvents: 'none',
          }}
        />

        <Container style={{ position: 'relative', zIndex: 2 }}>
          <div className="landing-hero text-center">
            <p className="landing-tag">Universidad Mariano Gálvez</p>
            <h1>Portal de Autogestión</h1>
            <p className="landing-subtitle">
              Bienvenid@, {displayName}. Elige el trámite que deseas realizar.
            </p>
          </div>

          <div className="landing-grid">
            <div className="landing-card">
              <div className="landing-card-icon" style={{ background: '#FFE8E8' }}>
                <AlertTriangle size={28} color="#C7352E" />
              </div>
              <h3>Consultas y Pago Multas</h3>
              <p>Consulta tus multas activas y registra su pago desde el portal.</p>
              <Button
                className="btn-liquid"
                style={{ maxWidth: 220, backgroundColor: 'var(--rojo-institucional)', border: 'none', marginTop: 'auto' }}
                onClick={() => navigate('/parking/user/multas')}
              >
                Consultar y Pagar
              </Button>
            </div>

            <div className="landing-card">
              <div className="landing-card-icon" style={{ background: '#E7F0FF' }}>
                <Car size={28} color="#1F4E79" />
              </div>
              <h3>Pagar Parqueo</h3>
              <p>Inscripción y pago de cuota mensual.</p>
              <Button
                className="btn-liquid"
                style={{ maxWidth: 220, backgroundColor: 'var(--color-accion)', border: 'none', marginTop: 'auto' }}
                onClick={() => navigate('/parking/user')}
              >
                Pagar
              </Button>
            </div>

            <div className="landing-card">
              <div className="landing-card-icon" style={{ background: '#F1F6FF' }}>
                <FileText size={28} color="#1F4E79" />
              </div>
              <h3>Estado de Cuenta</h3>
              <p>Revisa tu historial y pagos realizados.</p>
              <Button
                variant="outline-primary"
                className="w-100"
                style={{ maxWidth: 220, marginTop: 'auto' }}
                onClick={() => navigate('/parking/user/perfil')}
              >
                Ver
              </Button>
            </div>
          </div>
        </Container>
      </div>

      <AppFooter />
    </div>
  );
}

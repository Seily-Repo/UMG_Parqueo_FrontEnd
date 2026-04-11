import { ReactNode } from 'react';
import { Container } from 'react-bootstrap';
import umgLogo from '../../../../assets/umg_logo.png';

interface AppHeaderProps {
  subtitle?: string;
  actions?: ReactNode;
}

export function AppHeader({ subtitle = 'Sistema de Parqueo', actions }: AppHeaderProps) {
  return (
    <div style={{ borderBottom: '1px solid #a00e26', backgroundColor: '#C41230', position: 'sticky', top: 0, zIndex: 1000 }}>
      <Container fluid="lg">
        <div className="d-flex align-items-center justify-content-between py-3">
          <div className="d-flex align-items-center gap-3">
            <div style={{ backgroundColor: 'white', padding: '6px', borderRadius: '8px', display: 'flex' }}>
              <img src={umgLogo} alt="UMG Logo" style={{ width: 40, height: 40, objectFit: 'contain' }} />
            </div>
            <div>
              <h5 className="mb-0 fw-bold text-white">Universidad Mariano Galvez De Guatemala</h5>
              <small style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{subtitle}</small>
            </div>
          </div>
          {actions && (
            <div className="d-flex align-items-center gap-3">
              {actions}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}

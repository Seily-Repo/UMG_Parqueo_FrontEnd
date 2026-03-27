import { ReactNode } from 'react';
import { Container } from 'react-bootstrap';
import umgLogo from '../../../../assets/umg_logo.png';

interface AppHeaderProps {
  subtitle?: string;
  actions?: ReactNode;
}

export function AppHeader({ subtitle = 'Sistema de Parqueo', actions }: AppHeaderProps) {
  return (
    <div style={{ borderBottom: '1px solid #dee2e6', backgroundColor: 'rgba(255, 255, 255, 0.95)', position: 'sticky', top: 0, zIndex: 1000 }}>
      <Container fluid="lg">
        <div className="d-flex align-items-center justify-content-between py-3">
          <div className="d-flex align-items-center gap-3">
            <img src={umgLogo} alt="UMG Logo" style={{ width: 40, height: 40, objectFit: 'contain' }} />
            <div>
              <h5 className="mb-0 fw-bold">Universidad Mariano Galvez De Guatemala</h5>
              <small className="text-muted">{subtitle}</small>
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

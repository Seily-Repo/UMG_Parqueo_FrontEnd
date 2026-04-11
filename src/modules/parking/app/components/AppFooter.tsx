import { Container } from 'react-bootstrap';

export function AppFooter() {
  return (
    <footer className="parking-app-footer mt-auto">
      <Container fluid="lg" className="py-3">
        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-2">
          <small className="parking-app-footer__text">
            Universidad Mariano Galvez de Guatemala
          </small>
          <small className="parking-app-footer__text">
            Sistema de Parqueo
          </small>
        </div>
      </Container>
    </footer>
  );
}

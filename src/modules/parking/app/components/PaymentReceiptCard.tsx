import { Button, Card, Col, Row } from 'react-bootstrap';
import { Download, FileText, Printer } from 'lucide-react';

export interface PaymentReceiptData {
  receiptNumber: string;
  title: string;
  studentName: string;
  carnet: string;
  concept: string;
  amount: number;
  paymentMethod: string;
  status: string;
  issuedAt: string;
  detailLines?: Array<{ label: string; value: string }>;
}

interface PaymentReceiptCardProps {
  data: PaymentReceiptData;
  onExportPdf: () => void;
  onContinue?: () => void;
  continueLabel?: string;
}

export function PaymentReceiptCard({
  data,
  onExportPdf,
  onContinue,
  continueLabel = 'Continuar',
}: PaymentReceiptCardProps) {
  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-white border-bottom">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <Card.Title className="mb-1 h4">Recibo de Pago</Card.Title>
            <Card.Subtitle className="text-muted">Documento generado para exportar o imprimir</Card.Subtitle>
          </div>
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" onClick={onExportPdf}>
              <Printer size={16} className="me-2" />
              Exportar PDF
            </Button>
          </div>
        </div>
      </Card.Header>
      <Card.Body className="p-4">
        <div
          className="p-4 rounded-4 text-white mb-4"
          style={{ background: 'linear-gradient(135deg, rgba(9,36,68,0.96) 0%, rgba(196,18,48,0.9) 100%)' }}
        >
          <div className="d-flex align-items-center gap-2 mb-3" style={{ opacity: 0.92 }}>
            <FileText size={16} />
            <small>Comprobante institucional</small>
          </div>
          <Row className="g-4 align-items-end">
            <Col md={8}>
              <div className="small text-white-50">Recibo</div>
              <div className="fs-4 fw-bold">{data.receiptNumber}</div>
              <div className="small text-white-50 mt-3">Estudiante</div>
              <div className="fw-semibold">{data.studentName}</div>
              <div className="small text-white-50 mt-1">Carnet: {data.carnet}</div>
            </Col>
            <Col md={4} className="text-md-end">
              <div className="small text-white-50">Monto pagado</div>
              <div className="display-6 fw-bold">Q{data.amount.toFixed(2)}</div>
              <div className="small text-white-50">{data.status}</div>
            </Col>
          </Row>
        </div>

        <Row className="g-3 mb-4">
          <Col md={6}>
            <div className="p-3 rounded-4" style={{ background: 'rgba(248,250,252,0.86)', border: '1px solid rgba(15,38,64,0.08)' }}>
              <div className="small text-muted mb-1">Concepto</div>
              <div className="fw-semibold">{data.concept}</div>
            </div>
          </Col>
          <Col md={6}>
            <div className="p-3 rounded-4" style={{ background: 'rgba(248,250,252,0.86)', border: '1px solid rgba(15,38,64,0.08)' }}>
              <div className="small text-muted mb-1">Forma de pago</div>
              <div className="fw-semibold">{data.paymentMethod}</div>
            </div>
          </Col>
        </Row>

        <div className="p-3 rounded-4 mb-4" style={{ background: 'rgba(255,255,255,0.82)', border: '1px solid rgba(15,38,64,0.08)' }}>
          <div className="small text-muted mb-3">Detalle del recibo</div>
          <div className="d-flex flex-column gap-2">
            <div className="d-flex justify-content-between gap-3">
              <span className="text-muted">Fecha y hora</span>
              <span className="fw-semibold text-end">{data.issuedAt}</span>
            </div>
            {data.detailLines?.map((line) => (
              <div key={`${line.label}-${line.value}`} className="d-flex justify-content-between gap-3">
                <span className="text-muted">{line.label}</span>
                <span className="fw-semibold text-end">{line.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="small text-muted">
            Use el boton de exportacion para imprimir o guardar el recibo como PDF desde el navegador.
          </div>
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" onClick={onExportPdf}>
              <Download size={16} className="me-2" />
              Descargar PDF
            </Button>
            {onContinue && (
              <Button variant="primary" onClick={onContinue}>
                {continueLabel}
              </Button>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

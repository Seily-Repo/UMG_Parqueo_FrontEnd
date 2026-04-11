import type { PaymentReceiptData } from '../components/PaymentReceiptCard';

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function exportReceiptToPdf(data: PaymentReceiptData) {
  const detailLines = (data.detailLines || [])
    .map(
      (line) => `
        <div class="receipt-row">
          <span>${escapeHtml(line.label)}</span>
          <strong>${escapeHtml(line.value)}</strong>
        </div>
      `
    )
    .join('');

  const receiptWindow = window.open('', '_blank', 'width=900,height=1100');

  if (!receiptWindow) {
    window.alert('El navegador bloqueo la ventana del recibo. Habilita los popups e intenta de nuevo.');
    return;
  }

  receiptWindow.document.write(`
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${escapeHtml(data.receiptNumber)}</title>
        <style>
          body {
            margin: 0;
            font-family: Manrope, Arial, sans-serif;
            background: #eef2f7;
            color: #162334;
          }
          .page {
            max-width: 820px;
            margin: 32px auto;
            background: white;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 24px 60px rgba(10, 28, 52, 0.16);
          }
          .hero {
            padding: 36px;
            color: white;
            background: linear-gradient(135deg, rgba(9,36,68,0.96) 0%, rgba(196,18,48,0.9) 100%);
          }
          .hero h1 {
            margin: 0 0 8px;
            font-size: 28px;
          }
          .hero p {
            margin: 0;
            opacity: 0.82;
          }
          .section {
            padding: 28px 36px;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
          }
          .box {
            border: 1px solid rgba(15, 38, 64, 0.1);
            border-radius: 18px;
            padding: 16px 18px;
            background: #f8fafc;
          }
          .label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #697586;
            margin-bottom: 6px;
          }
          .value {
            font-size: 18px;
            font-weight: 800;
          }
          .receipt-row {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            padding: 12px 0;
            border-bottom: 1px solid rgba(15, 38, 64, 0.08);
          }
          .receipt-row:last-child {
            border-bottom: 0;
          }
          .footer {
            padding: 0 36px 36px;
            font-size: 13px;
            color: #5b6776;
          }
          @media print {
            body {
              background: white;
            }
            .page {
              margin: 0;
              max-width: none;
              box-shadow: none;
              border-radius: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="hero">
            <h1>Universidad Mariano Galvez de Guatemala</h1>
            <p>${escapeHtml(data.title)}</p>
          </div>
          <div class="section">
            <div class="grid">
              <div class="box">
                <div class="label">Recibo</div>
                <div class="value">${escapeHtml(data.receiptNumber)}</div>
              </div>
              <div class="box">
                <div class="label">Monto pagado</div>
                <div class="value">Q${data.amount.toFixed(2)}</div>
              </div>
              <div class="box">
                <div class="label">Estudiante</div>
                <div>${escapeHtml(data.studentName)}</div>
              </div>
              <div class="box">
                <div class="label">Carnet</div>
                <div>${escapeHtml(data.carnet)}</div>
              </div>
              <div class="box">
                <div class="label">Concepto</div>
                <div>${escapeHtml(data.concept)}</div>
              </div>
              <div class="box">
                <div class="label">Forma de pago</div>
                <div>${escapeHtml(data.paymentMethod)}</div>
              </div>
            </div>
          </div>
          <div class="section">
            <div class="receipt-row">
              <span>Estado</span>
              <strong>${escapeHtml(data.status)}</strong>
            </div>
            <div class="receipt-row">
              <span>Fecha y hora</span>
              <strong>${escapeHtml(data.issuedAt)}</strong>
            </div>
            ${detailLines}
          </div>
          <div class="footer">
            Documento emitido desde el portal de autogestion. Use la opcion Guardar como PDF en el dialogo de impresion.
          </div>
        </div>
        <script>
          window.onload = function () {
            window.print();
          };
        </script>
      </body>
    </html>
  `);

  receiptWindow.document.close();
}

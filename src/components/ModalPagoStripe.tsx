import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Swal from 'sweetalert2';

// IMPORTANTE: Colocar la clave pública de Stripe correcta
// Como esto es un ejemplo, asegúrate de reemplazar VITE_STRIPE_PUBLIC_KEY en tu archivo .env
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_51TPDVYDsVSh8C6brHhT2Zz...');

const FormularioStripe = ({ cargoInfo, onClose }: { cargoInfo: any; onClose: (success: boolean) => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const procesarPago = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);

    try {
      // 1. Consumimos la API del Backend de Cobros
      const bodyPago = {
        FPG_FORMA_PAGO: 1, // 1 = Tarjeta de Crédito/Débito
        ...(cargoInfo.TIPO === 'PLAN' ? { PLN_PLAN: cargoInfo.ID_A_PAGAR } : {}),
        ...(cargoInfo.TIPO === 'MULTA' ? { EMU_USUARIO_MULTA: cargoInfo.ID_A_PAGAR } : {})
      };

      // Recuerda que localStorage.getItem('token') debe ser la variable correcta de su JWT si lo usan
      const token = localStorage.getItem('tokenParqueo') || ''; 

      const res = await fetch('/api/cobros/api/pago', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(bodyPago)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Error en el servidor al generar el pago.');
      }

      const data = await res.json();
      const clientSecret = data.clientSecret;

      // 2. Stripe procesa la tarjeta de forma segura
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { 
            card: elements.getElement(CardElement)!
        }
      });

      if (result.error) {
        Swal.fire('Error', result.error.message, 'error');
      } else if (result.paymentIntent?.status === 'succeeded') {
        Swal.fire({
          title: '¡Pago Exitoso!',
          text: 'Tu transacción se ha procesado correctamente.',
          icon: 'success',
          confirmButtonColor: 'var(--color-accion)'
        });
        onClose(true); // Indica que hubo éxito y hay que recargar
      }
    } catch (error: any) {
      Swal.fire('Error', error.message || 'No se pudo procesar el pago', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={procesarPago}>
      <div className="p-3 border rounded-3 mb-4 bg-light shadow-sm">
        <CardElement options={{ 
            style: { 
                base: { 
                    fontSize: '16px', 
                    color: '#424770', 
                    fontFamily: 'Inter, sans-serif',
                    '::placeholder': { color: '#aab7c4' } 
                } 
            } 
        }} />
      </div>
      <Button 
        type="submit" 
        disabled={!stripe || loading} 
        style={{ backgroundColor: 'var(--color-accion)', border: 'none', borderRadius: '12px', padding: '12px' }} 
        className="w-100 fw-bold shadow-sm d-flex justify-content-center align-items-center gap-2"
      >
        {loading ? (
            <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Procesando...</>
        ) : (
            `Pagar Q.${cargoInfo?.MONTO}.00`
        )}
      </Button>
    </form>
  );
};

export const ModalPagoStripe = ({ show, onHide, cargoInfo }: { show: boolean; onHide: (recargar: boolean) => void; cargoInfo: any }) => {
    return (
        <Modal show={show} onHide={() => onHide(false)} centered backdrop="static">
            <Modal.Header closeButton style={{ borderBottom: 'none', paddingBottom: '0' }}>
            <Modal.Title style={{ color: 'var(--color-primario)', fontFamily: 'var(--fuente-titulos)', fontStyle: 'italic', fontWeight: 'bold' }}>
                Pasarela de Pago
            </Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-2 px-4 pb-4">
            {cargoInfo && (
                <div className="mb-4">
                    <p className="text-muted mb-1" style={{ fontSize: '0.9rem' }}>Concepto a facturar:</p>
                    <h5 className="fw-bold mb-1" style={{ color: 'var(--color-primario)' }}>{cargoInfo.DESCRIPCION}</h5>
                    <p className="mb-0 fs-5">Total: <strong className="text-dark">Q.{cargoInfo.MONTO}.00</strong></p>
                </div>
            )}
            <Elements stripe={stripePromise}>
                <FormularioStripe cargoInfo={cargoInfo} onClose={onHide} />
            </Elements>
            <div className="text-center mt-3">
                <small className="text-muted d-flex align-items-center justify-content-center gap-1">
                    Pagos seguros procesados por <strong>Stripe</strong>
                </small>
            </div>
            </Modal.Body>
        </Modal>
    );
};

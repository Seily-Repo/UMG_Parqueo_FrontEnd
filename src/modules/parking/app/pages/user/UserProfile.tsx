import React from 'react';
import { useNavigate } from 'react-router';
import { useRegistration } from '../../context/RegistrationContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { AppHeader } from '../../components/AppHeader';

function UserProfile() {
  const { currentRegistration, logout } = useRegistration();
  const navigate = useNavigate();

  if (!currentRegistration.id) {
    return <div>No hay datos de usuario.</div>;
  }

  const handleLogout = () => {
    logout();
    navigate('/parking/login');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(/assets/villanueva.webp)`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }}>
      <AppHeader subtitle="Perfil de Usuario" />
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold text-white">Perfil de Usuario</h1>

        <Card>
          <CardHeader>
            <CardTitle>Datos Personales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Nombre Completo:</strong> {currentRegistration.fullName}</p>
            <p><strong>DPI:</strong> {currentRegistration.dpi}</p>
            <p><strong>Carnet:</strong> {currentRegistration.carnet}</p>
            <p><strong>Dirección:</strong> {currentRegistration.address}</p>
            <p><strong>Teléfono:</strong> {currentRegistration.phone}</p>
            <p><strong>Contacto de Emergencia:</strong> {currentRegistration.emergencyContact}</p>
            <p><strong>Teléfono de Emergencia:</strong> {currentRegistration.emergencyPhone}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tipo de Vehículo y Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Tipo de Vehículo:</strong> <Badge variant="secondary">{currentRegistration.vehicleType}</Badge></p>
            <p><strong>Plan de Parqueo:</strong> <Badge variant="outline">{currentRegistration.parkingPlan}</Badge></p>
            <p><strong>Monto Pagado:</strong> Q{currentRegistration.amount}</p>
            <p><strong>Estado de Pago:</strong> <Badge variant={currentRegistration.paymentStatus === 'paid' ? 'default' : 'destructive'}>{currentRegistration.paymentStatus}</Badge></p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehículos Registrados</CardTitle>
          </CardHeader>
          <CardContent>
            {currentRegistration.vehicles && currentRegistration.vehicles.length > 0 ? (
              <div className="space-y-4">
                {currentRegistration.vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="border p-4 rounded-lg">
                    <p><strong>Placa:</strong> {vehicle.plate}</p>
                    <p><strong>Marca:</strong> {vehicle.brand}</p>
                    <p><strong>Modelo:</strong> {vehicle.model}</p>
                    <p><strong>Color:</strong> {vehicle.color}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No hay vehículos registrados.</p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button onClick={handleLogout} variant="destructive">
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </div>
  );
}

export { UserProfile };
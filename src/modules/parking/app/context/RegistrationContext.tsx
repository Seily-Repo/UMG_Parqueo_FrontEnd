import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Vehicle {
  id: string;
  color: string;
  brand: string;
  model: string;
  plate: string;
}

export interface Registration {
  id: string;
  // Datos iniciales
  carnet: string;
  dpi: string;
  vehicleType: 'moto' | 'carro';
  parkingPlan: 'entre-semana' | 'sabado' | 'domingo';
  // Datos personales
  fullName: string;
  address: string;
  phone: string;
  emergencyContact: string;
  emergencyPhone: string;
  photo?: string;
  // Vehículos
  vehicles: Vehicle[];
  // Pago
  amount: number;
  cardHolder: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  paymentStatus: 'pending' | 'paid';
  // Firma
  signature?: string;
  // Metadata
  createdAt: Date;
}

interface RegistrationContextType {
  currentRegistration: Partial<Registration>;
  registrations: Registration[];
  simulatedUsers: Registration[];
  selectUser: (index: number) => void;
  updateRegistration: (data: Partial<Registration>) => void;
  completeRegistration: () => void;
  getRegistrationById: (id: string) => Registration | undefined;
  resetRegistration: () => void;
  logout: () => void;
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

const simulatedUsers: Registration[] = [
  {
    id: 'simulated-1',
    carnet: '5190-23-0001',
    dpi: '1234567890123',
    vehicleType: 'carro',
    parkingPlan: 'entre-semana',
    fullName: 'Juan Pérez',
    address: 'Zona 1, Guatemala',
    phone: '55551234',
    emergencyContact: 'María Pérez',
    emergencyPhone: '55556789',
    vehicles: [
      {
        id: 'veh-1',
        color: 'Rojo',
        brand: 'Toyota',
        model: 'Corolla',
        plate: 'P123ABC',
      },
    ],
    amount: 200,
    cardHolder: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    paymentStatus: 'pending',
    signature: '',
    createdAt: new Date(),
  },
  {
    id: 'simulated-2',
    carnet: '5190-23-0002',
    dpi: '9876543210987',
    vehicleType: 'moto',
    parkingPlan: 'sabado',
    fullName: 'Ana García',
    address: 'Zona 10, Guatemala',
    phone: '55559876',
    emergencyContact: 'Carlos García',
    emergencyPhone: '55554321',
    vehicles: [
      {
        id: 'veh-2',
        color: 'Negro',
        brand: 'Honda',
        model: 'CBR 600',
        plate: 'M456DEF',
      },
    ],
    amount: 80,
    cardHolder: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    paymentStatus: 'pending',
    signature: '',
    createdAt: new Date(),
  },
  {
    id: 'simulated-3',
    carnet: '5190-23-0003',
    dpi: '4567890123456',
    vehicleType: 'carro',
    parkingPlan: 'domingo',
    fullName: 'Luis Martínez',
    address: 'Zona 5, Guatemala',
    phone: '55551111',
    emergencyContact: 'Sofia Martínez',
    emergencyPhone: '55552222',
    vehicles: [
      {
        id: 'veh-3',
        color: 'Azul',
        brand: 'Nissan',
        model: 'Sentra',
        plate: 'C789GHI',
      },
      {
        id: 'veh-4',
        color: 'Blanco',
        brand: 'Hyundai',
        model: 'Accent',
        plate: 'C101JKL',
      },
    ],
    amount: 50,
    cardHolder: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    paymentStatus: 'pending',
    signature: '',
    createdAt: new Date(),
  },
];

export function RegistrationProvider({ children }: { children: React.ReactNode }) {
  const [currentRegistration, setCurrentRegistration] = useState<Partial<Registration>>(() => {
    const saved = localStorage.getItem('currentRegistration');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        createdAt: parsed.createdAt ? new Date(parsed.createdAt) : new Date(),
      };
    }
    // Inicializar vacío para requerir login
    return {
      vehicles: [],
      paymentStatus: 'pending',
    };
  });
  
  const [registrations, setRegistrations] = useState<Registration[]>(() => {
    const saved = localStorage.getItem('parkingRegistrations');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((r: any) => ({
        ...r,
        createdAt: new Date(r.createdAt),
      }));
    }
    // Datos simulados si no hay registros
    const simulatedRegistration: Registration = {
      id: 'simulated-1',
      carnet: '5190-23-0001',
      dpi: '1234567890123',
      vehicleType: 'carro',
      parkingPlan: 'entre-semana',
      fullName: 'Juan Pérez',
      address: 'Zona 1, Guatemala',
      phone: '55551234',
      emergencyContact: 'María Pérez',
      emergencyPhone: '55556789',
      vehicles: [
        {
          id: 'veh-1',
          color: 'Rojo',
          brand: 'Toyota',
          model: 'Corolla',
          plate: 'P123ABC',
        },
      ],
      amount: 200,
      cardHolder: 'Juan Pérez',
      cardNumber: '1234567890123456',
      expiryDate: '12/28',
      cvv: '123',
      paymentStatus: 'pending', // Cambiar a pending para que el usuario ingrese
      signature: 'Firma simulada',
      createdAt: new Date(),
    };
    return [simulatedUsers[0]];
  });

  useEffect(() => {
    const toSave = registrations.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    }));
    localStorage.setItem('parkingRegistrations', JSON.stringify(toSave));
  }, [registrations]);

  useEffect(() => {
    localStorage.setItem('currentRegistration', JSON.stringify({
      ...currentRegistration,
      createdAt: currentRegistration.createdAt?.toISOString(),
    }));
  }, [currentRegistration]);

  const selectUser = (index: number) => {
    if (index >= 0 && index < simulatedUsers.length) {
      setCurrentRegistration(simulatedUsers[index]);
      setRegistrations([simulatedUsers[index]]);
    }
  };

  const updateRegistration = (data: Partial<Registration>) => {
    setCurrentRegistration((prev) => ({ ...prev, ...data }));
  };

  const completeRegistration = () => {
    const newRegistration: Registration = {
      id: Date.now().toString(),
      carnet: currentRegistration.carnet || '',
      dpi: currentRegistration.dpi || '',
      vehicleType: currentRegistration.vehicleType || 'carro',
      parkingPlan: currentRegistration.parkingPlan || 'entre-semana',
      fullName: currentRegistration.fullName || '',
      address: currentRegistration.address || '',
      phone: currentRegistration.phone || '',
      emergencyContact: currentRegistration.emergencyContact || '',
      emergencyPhone: currentRegistration.emergencyPhone || '',
      photo: currentRegistration.photo,
      vehicles: currentRegistration.vehicles || [],
      amount: currentRegistration.amount || 0,
      cardHolder: currentRegistration.cardHolder || '',
      cardNumber: currentRegistration.cardNumber || '',
      expiryDate: currentRegistration.expiryDate || '',
      cvv: currentRegistration.cvv || '',
      paymentStatus: 'paid',
      signature: currentRegistration.signature,
      createdAt: new Date(),
    };

    setRegistrations((prev) => [newRegistration, ...prev]);
    resetRegistration();
  };

  const getRegistrationById = (id: string) => {
    return registrations.find((r) => r.id === id);
  };

  const resetRegistration = () => {
    setCurrentRegistration({
      vehicles: [],
      paymentStatus: 'pending',
    });
  };

  const logout = () => {
    setCurrentRegistration({
      vehicles: [],
      paymentStatus: 'pending',
    });
  };

  return (
    <RegistrationContext.Provider
      value={{
        currentRegistration,
        registrations,
        simulatedUsers,
        selectUser,
        updateRegistration,
        completeRegistration,
        getRegistrationById,
        resetRegistration,
        logout,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
}

export function useRegistration() {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error('useRegistration must be used within RegistrationProvider');
  }
  return context;
}

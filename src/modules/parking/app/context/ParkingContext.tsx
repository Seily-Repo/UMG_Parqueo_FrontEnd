import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Vehicle {
  id: string;
  plate: string;
  type: 'car' | 'motorcycle' | 'truck';
  entryTime: Date;
  exitTime?: Date;
  amountPaid?: number;
  status: 'active' | 'completed';
}

interface ParkingContextType {
  vehicles: Vehicle[];
  addVehicle: (plate: string, type: Vehicle['type']) => void;
  checkoutVehicle: (id: string, amount: number) => void;
  deleteVehicle: (id: string) => void;
  getActiveVehicles: () => Vehicle[];
  getCompletedVehicles: () => Vehicle[];
  calculateAmount: (entryTime: Date) => number;
  getTodayRevenue: () => number;
}

const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

const RATES = {
  car: 3, // $3 per hour
  motorcycle: 2, // $2 per hour
  truck: 5, // $5 per hour
};

export function ParkingProvider({ children }: { children: React.ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('parkingVehicles');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((v: any) => ({
        ...v,
        entryTime: new Date(v.entryTime),
        exitTime: v.exitTime ? new Date(v.exitTime) : undefined,
      }));
    }
    return [];
  });

  useEffect(() => {
    const toSave = vehicles.map((v) => ({
      ...v,
      entryTime: v.entryTime.toISOString(),
      exitTime: v.exitTime?.toISOString(),
    }));
    localStorage.setItem('parkingVehicles', JSON.stringify(toSave));
  }, [vehicles]);

  const addVehicle = (plate: string, type: Vehicle['type']) => {
    const newVehicle: Vehicle = {
      id: Date.now().toString(),
      plate: plate.toUpperCase(),
      type,
      entryTime: new Date(),
      status: 'active',
    };
    setVehicles((prev) => [newVehicle, ...prev]);
  };

  const calculateAmount = (entryTime: Date, type: Vehicle['type'] = 'car') => {
    const now = new Date();
    const hours = Math.ceil((now.getTime() - entryTime.getTime()) / (1000 * 60 * 60));
    return hours * RATES[type];
  };

  const checkoutVehicle = (id: string, amount: number) => {
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === id
          ? {
              ...v,
              exitTime: new Date(),
              amountPaid: amount,
              status: 'completed' as const,
            }
          : v
      )
    );
  };

  const deleteVehicle = (id: string) => {
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  };

  const getActiveVehicles = () => {
    return vehicles.filter((v) => v.status === 'active');
  };

  const getCompletedVehicles = () => {
    return vehicles.filter((v) => v.status === 'completed');
  };

  const getTodayRevenue = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return vehicles
      .filter((v) => v.status === 'completed' && v.exitTime && v.exitTime >= today)
      .reduce((sum, v) => sum + (v.amountPaid || 0), 0);
  };

  return (
    <ParkingContext.Provider
      value={{
        vehicles,
        addVehicle,
        checkoutVehicle,
        deleteVehicle,
        getActiveVehicles,
        getCompletedVehicles,
        calculateAmount,
        getTodayRevenue,
      }}
    >
      {children}
    </ParkingContext.Provider>
  );
}

export function useParking() {
  const context = useContext(ParkingContext);
  if (!context) {
    throw new Error('useParking must be used within ParkingProvider');
  }
  return context;
}

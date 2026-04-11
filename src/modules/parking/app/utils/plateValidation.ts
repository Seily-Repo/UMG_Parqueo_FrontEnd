export function getGuatemalaPlatePattern(vehicleType: 'carro' | 'moto') {
  return vehicleType === 'carro' ? /^P\d{3}[A-Z]{3}$/ : /^M\d{3}[A-Z]{3}$/;
}

export function getGuatemalaPlateExample(vehicleType: 'carro' | 'moto') {
  return vehicleType === 'carro' ? 'P123ABC' : 'M123ABC';
}

export function validateGuatemalaPlate(plate: string, vehicleType: 'carro' | 'moto') {
  const normalizedPlate = plate.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const isValid = getGuatemalaPlatePattern(vehicleType).test(normalizedPlate);

  return {
    isValid,
    normalizedPlate,
  };
}

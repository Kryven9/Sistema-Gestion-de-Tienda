export function inicioDelDia(fecha: Date): Date {
  const inicio = new Date(fecha);
  inicio.setHours(0, 0, 0, 0);
  return inicio;
}

export function finDelDia(fecha: Date): Date {
  const fin = new Date(fecha);
  fin.setHours(23, 59, 59, 999);
  return fin;
}

export function inicioDeSemana(fecha: Date): Date {
  const inicio = new Date(fecha);
  const dia = inicio.getDay();
  const diferencia = (dia + 6) % 7;
  inicio.setDate(inicio.getDate() - diferencia);
  inicio.setHours(0, 0, 0, 0);
  return inicio;
}

export function inicioDeMes(fecha: Date): Date {
  return new Date(fecha.getFullYear(), fecha.getMonth(), 1, 0, 0, 0, 0);
}

export function finDeMes(fecha: Date): Date {
  return new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0, 23, 59, 59, 999);
}

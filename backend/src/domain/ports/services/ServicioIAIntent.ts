export interface ItemDetectado {
  productoNombre: string;
  cantidad: number;
}

export interface IntentResultado {
  intencion: string;
  items: ItemDetectado[];
  confianza: number;
}

export interface ServicioIAIntent {
  interpretar(texto: string): Promise<IntentResultado>;
}

export interface ServicioVoz {
  transcribir(audio: Buffer): Promise<string>;
  sintetizarVoz(texto: string): Promise<Buffer>;
}

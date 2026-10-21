/** Fecha y hora actuales con el formato de `<input type="datetime-local">` (hora local, sin segundos). */
export function ahoraParaInput(): string {
  const ahora = new Date();
  ahora.setSeconds(0, 0);
  const desfaseMs = ahora.getTimezoneOffset() * 60_000;
  return new Date(ahora.getTime() - desfaseMs).toISOString().slice(0, 16);
}

/** Convierte el valor de un `datetime-local` (hora local) a ISO-8601 UTC, que es lo que espera la API. */
export function inputAIso(valor: string): string {
  return new Date(valor).toISOString();
}

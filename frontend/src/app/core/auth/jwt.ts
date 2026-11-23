/** Datos que el backend firma dentro del token (ver `JwtService.generar`). */
export interface ClaimsJwt {
  /** Id del usuario. */
  sub: string;
  correo: string;
  nombre: string;
  rol: string;
  /** Vencimiento, en segundos desde 1970. */
  exp: number;
}

/**
 * Lee el contenido del token SIN verificar la firma: el navegador no tiene el secreto.
 * Sirve para que la interfaz no confíe en datos de localStorage que el usuario pudo editar;
 * la firma la verifica el backend en cada petición.
 * Devuelve `null` si el texto no es un JWT bien formado.
 */
export function leerClaims(token: string): ClaimsJwt | null {
  try {
    const partes = token.split('.');
    if (partes.length !== 3) return null;
    const base64 = partes[1].replace(/-/g, '+').replace(/_/g, '/');
    const binario = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
    const texto = new TextDecoder().decode(Uint8Array.from(binario, (c) => c.charCodeAt(0)));
    const claims = JSON.parse(texto) as Partial<ClaimsJwt>;
    const completos =
      typeof claims.sub === 'string' &&
      typeof claims.correo === 'string' &&
      typeof claims.nombre === 'string' &&
      typeof claims.rol === 'string' &&
      typeof claims.exp === 'number';
    return completos ? (claims as ClaimsJwt) : null;
  } catch {
    return null;
  }
}

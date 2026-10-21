import { TestBed } from '@angular/core/testing';
import { ConfirmService } from './confirm.service';

describe('ConfirmService', () => {
  let servicio: ConfirmService;

  beforeEach(() => {
    servicio = TestBed.inject(ConfirmService);
  });

  it('emite true al confirmar y limpia el diálogo', () => {
    const respuestas: boolean[] = [];
    servicio.confirmar({ titulo: 'Eliminar', mensaje: '¿Seguro?' }).subscribe((r) => respuestas.push(r));

    expect(servicio.pendiente()?.opciones.titulo).toBe('Eliminar');
    servicio.pendiente()?.resolver(true);

    expect(respuestas).toEqual([true]);
    expect(servicio.pendiente()).toBeNull();
  });

  it('emite false al cancelar', () => {
    const respuestas: boolean[] = [];
    servicio.confirmar({ titulo: 'Cancelar', mensaje: '¿Seguro?' }).subscribe((r) => respuestas.push(r));

    servicio.pendiente()?.resolver(false);

    expect(respuestas).toEqual([false]);
  });

  it('cierra el diálogo si el suscriptor se va antes de decidir', () => {
    const suscripcion = servicio.confirmar({ titulo: 'x', mensaje: 'y' }).subscribe();
    expect(servicio.pendiente()).not.toBeNull();

    suscripcion.unsubscribe();

    expect(servicio.pendiente()).toBeNull();
  });
});

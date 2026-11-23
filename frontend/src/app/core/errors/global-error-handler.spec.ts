import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ToastService } from '../../shared/toast/toast.service';
import { ManejadorErroresGlobal } from './global-error-handler';

describe('ManejadorErroresGlobal', () => {
  let manejador: ErrorHandler;
  let toast: ToastService;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    TestBed.configureTestingModule({ providers: [{ provide: ErrorHandler, useClass: ManejadorErroresGlobal }] });
    manejador = TestBed.inject(ErrorHandler);
    toast = TestBed.inject(ToastService);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('muestra un toast de error y registra la excepción en la consola', () => {
    const fallo = new Error('boom');

    manejador.handleError(fallo);

    expect(toast.toasts()).toHaveLength(1);
    expect(toast.toasts()[0].tipo).toBe('error');
    expect(toast.toasts()[0].mensaje).toContain('error inesperado');
    expect(console.error).toHaveBeenCalledWith(fallo);
  });

  it('también atiende promesas rechazadas con valores que no son Error', () => {
    manejador.handleError('texto suelto');

    expect(toast.toasts()).toHaveLength(1);
  });

  it('ignora los errores HTTP: ya los muestra el interceptor', () => {
    manejador.handleError(new HttpErrorResponse({ status: 500 }));

    expect(toast.toasts()).toHaveLength(0);
  });

  it('no repite el aviso si el error se repite de inmediato', () => {
    manejador.handleError(new Error('uno'));
    manejador.handleError(new Error('dos'));

    expect(toast.toasts()).toHaveLength(1);
  });

  it('vuelve a avisar pasada la ventana de repetición', () => {
    manejador.handleError(new Error('uno'));
    vi.advanceTimersByTime(3500);
    manejador.handleError(new Error('dos'));

    expect(toast.toasts()).toHaveLength(2);
  });
});

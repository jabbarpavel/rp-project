import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  type: 'success' | 'error' | 'info';
  text: string;
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts$ = new BehaviorSubject<ToastMessage[]>([]);
  private counter = 0;

  get toasts() {
    return this.toasts$.asObservable();
  }

  show(text: string, type: 'success' | 'error' | 'info' = 'info', duration = 4000) {
    const id = ++this.counter;
    const toast: ToastMessage = { id, text, type };
    this.toasts$.next([...this.toasts$.value, toast]);
    setTimeout(() => this.remove(id), duration);
  }

  private remove(id: number) {
    this.toasts$.next(this.toasts$.value.filter(t => t.id !== id));
  }
}

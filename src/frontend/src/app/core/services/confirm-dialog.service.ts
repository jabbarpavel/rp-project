import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface ConfirmData {
  message: string;
  confirmText: string;
  cancelText: string;
  resolve?: (confirmed: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private dialog$ = new BehaviorSubject<ConfirmData | null>(null);

  get dialog() {
    return this.dialog$.asObservable();
  }

  open(message: string, confirmText = 'Ja', cancelText = 'Abbrechen'): Promise<boolean> {
    return new Promise(resolve => {
      this.dialog$.next({ message, confirmText, cancelText, resolve });
    });
  }

  close(confirmed: boolean) {
    const data = this.dialog$.value;
    data?.resolve?.(confirmed);
    this.dialog$.next(null);
  }
}

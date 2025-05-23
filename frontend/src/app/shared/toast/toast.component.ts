import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ToastService } from './toast.service';
import { Subscription, timer } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-toast',
  imports: [],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css',
})
export class ToastComponent implements OnInit {
  toastService = inject(ToastService);
  router = inject(Router);
  destroyRef = inject(DestroyRef);

  toastMessage = signal<string>('');
  toastType = signal<'success' | 'error'>('success');
  toastShow = signal<boolean>(false);

  toastSubscription$: Subscription | undefined;

  ngOnInit(): void {
    this.toastSubscription$ = this.toastService.toastState$.subscribe(
      ({ message, type, duration, redirectUrl }) => {
        this.toastMessage.set(message);
        this.toastType.set(type);
        this.toastShow.set(true);

        timer(duration).subscribe(() => {
          this.toastShow.set(false);
          if (redirectUrl) {
            this.router.navigate([redirectUrl]);
          }
        });
      }
    );

    this.destroyRef.onDestroy(() => {
      this.toastSubscription$?.unsubscribe();
    });
  }
}

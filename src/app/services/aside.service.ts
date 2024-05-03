// In aside.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AsideService {
  private isVisible = new BehaviorSubject<boolean>(false);
  private content = new BehaviorSubject<string>('');

  isVisible$ = this.isVisible.asObservable();
  content$ = this.content.asObservable();

  get isVisibleValue(): boolean {
    return this.isVisible.value;  // Getter to expose the current value
  }

  toggleVisibility() {
    this.isVisible.next(!this.isVisible.value);
  }

  updateContent(newContent: string) {
    this.content.next(newContent);
  }
}

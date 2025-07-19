import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';

import {
  ModalController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonSearchbar,
  IonList,
  IonItem,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-athlete-name-modal',
  templateUrl: './athlete-name-modal.component.html',
  styleUrls: ['./athlete-name-modal.component.scss'],
  imports: [
    IonItem,
    IonList,
    IonSearchbar,
    IonContent,
    IonButton,
    IonButtons,
    IonTitle,
    IonToolbar,
    IonHeader,
  ],
})
export class AthleteNameModalComponent implements OnInit {
  modalController = inject(ModalController);
  athleteNames = input.required<string[]>();

  searchText = signal<string | null>(null);

  filteredNames = computed<string[]>(() =>
    !!this.searchText()
      ? this.athleteNames().filter((value: string) =>
          value.toLowerCase().includes(this.searchText()!.toLowerCase())
        )
      : this.athleteNames()
  );

  onSearchBarInput(event: Event) {
    const target = event.target as HTMLIonSearchbarElement;
    this.searchText.set(target.value?.toLowerCase() || null);
  }

  selectName(name: string) {
    this.modalController.dismiss(name);
  }

  close() {
    this.modalController.dismiss();
  }

  constructor() {}

  ngOnInit() {}
}

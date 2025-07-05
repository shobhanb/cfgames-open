import {
  Component,
  computed,
  EventEmitter,
  inject,
  input,
  OnInit,
  output,
  Output,
  signal,
} from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonButton,
  IonContent,
  IonSearchbar,
  IonList,
  IonItem,
  ModalController,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-athlete-name',
  templateUrl: './athlete-name.component.html',
  styleUrls: ['./athlete-name.component.scss'],
  imports: [
    IonItem,
    IonList,
    IonSearchbar,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    IonButton,
    IonContent,
  ],
})
export class AthleteNameComponent implements OnInit {
  modalController = inject(ModalController);
  athleteNames = input.required<string[]>();
  selectedName = output<string>();

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
    this.selectedName.emit(name);
    this.modalController.dismiss(name);
  }

  close() {
    this.modalController.dismiss();
  }

  constructor() {}

  ngOnInit() {}
}

export const events: EventModel[] = [
  { year: 2025, ordinal: 1, event: '25.1' },
  { year: 2025, ordinal: 2, event: '25.2' },
  { year: 2025, ordinal: 3, event: '25.3' },
  { year: 2024, ordinal: 1, event: '24.1' },
  { year: 2024, ordinal: 2, event: '24.2' },
  { year: 2024, ordinal: 3, event: '24.3' },
  { year: 2023, ordinal: 1, event: '23.1' },
  { year: 2023, ordinal: 2, event: '23.2a' },
  { year: 2023, ordinal: 3, event: '23.2b' },
  { year: 2023, ordinal: 4, event: '23.3' },
];

export interface EventModel {
  event: string;
  ordinal: number;
  year: number;
}

export interface ModalMessage {
  type: 'info' | 'confirm';
  title: string;
  message: string;
  redirectUrl?: string | null;
}

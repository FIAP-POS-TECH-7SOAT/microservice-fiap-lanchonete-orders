import { NotificationRequest } from './dtos/notification-request-dto';

export interface INotification {
  notificate(payload: NotificationRequest): Promise<void>;
}

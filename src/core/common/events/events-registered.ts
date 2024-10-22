import { UniqueEntityID } from '../entities/unique-entity-id';

export const EventMap = {
  PaymentCreatedEvent: {
    type: { order_id: UniqueEntityID },
    key: 'PaymentCreatedEvent',
  },
};

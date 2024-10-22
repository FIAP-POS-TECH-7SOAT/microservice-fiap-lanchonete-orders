import { UniqueEntityID } from '../entities/unique-entity-id';

export interface DomainEvent<T = unknown> {
  ocurredAt: Date;
  data: T;
  getAggregateId(): UniqueEntityID;
}

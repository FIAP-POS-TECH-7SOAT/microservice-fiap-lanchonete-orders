import { UseCaseError } from '@core/common/errors/use-case-error';

export class OrderAlreadyInProgressError extends Error implements UseCaseError {
  constructor() {
    super('The order is already in progress, it cannot be cancelled');
  }
}

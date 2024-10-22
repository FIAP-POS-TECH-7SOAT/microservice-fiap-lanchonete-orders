import { UseCaseError } from '@core/common/errors/use-case-error';

export class InvalidOrderStatusError extends Error implements UseCaseError {
  constructor() {
    super('Order status is invalid');
  }
}

import { UseCaseError } from '@core/common/errors/use-case-error';

export class ResourceAlreadyProcessedError
  extends Error
  implements UseCaseError
{
  constructor() {
    super('Resource already processed');
  }
}

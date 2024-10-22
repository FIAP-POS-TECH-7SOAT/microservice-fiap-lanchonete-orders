import { EventHandler } from '@core/common/events/event-handler';
import { AddCodeToOrderByIdUseCase } from '../use-case/add-code-to-order-by-id.use-case';
import { DomainEvents } from '@core/common/events/domain-events';
import { DomainEvent } from '@core/common/events/domain-event';
import { EventMap } from '@core/common/events/events-registered';

export class OnPaymentCreated implements EventHandler {
  constructor(private addCodeToOrderByIdUseCase: AddCodeToOrderByIdUseCase) {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendPaymentCreatedNotification.bind(this),
      EventMap.PaymentCreatedEvent.key,
    );
  }

  private async sendPaymentCreatedNotification({
    data,
  }: DomainEvent<(typeof EventMap)['PaymentCreatedEvent']['type']>) {
    await this.addCodeToOrderByIdUseCase.execute({
      id: data.order_id.toString(),
    });
  }
}

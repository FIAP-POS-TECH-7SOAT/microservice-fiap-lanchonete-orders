import { ProcessPaymentRequest } from './dtos/process-payment-request-dto';
import { ProcessPaymentResponse } from './dtos/process-payment-response-dto';

export interface IPaymentGateway {
  processPayment(
    payload: ProcessPaymentRequest,
  ): Promise<ProcessPaymentResponse>;
}

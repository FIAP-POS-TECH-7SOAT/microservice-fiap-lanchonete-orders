export interface ProcessPaymentRequest {
  amount: number;
  order_id: string;
  customer: {
    email: string;
    doc_number: string;
  } | null;
}

// Stripe service stub - returns mock payment links
// Configure your real Stripe keys in .env when ready

export async function createPaymentLink({
  amount,
  description,
  clientName,
  clientEmail,
  invoiceNumber,
}: {
  amount: number;
  description: string;
  clientName: string;
  clientEmail?: string;
  invoiceNumber: string;
}) {
  // STUB: Return mock payment link instead of creating real Stripe session
  console.log('[STRIPE STUB] Would create payment link for:', {
    amount,
    description,
    clientName,
    invoiceNumber,
  });

  return {
    paymentLink: `http://localhost:3000/mock-payment/${invoiceNumber}`,
    sessionId: `mock_session_${Date.now()}`,
  };
}

export async function createSubscriptionPaymentLink({
  amount,
  description,
  clientName,
  clientEmail,
  subscriptionId,
}: {
  amount: number;
  description: string;
  clientName: string;
  clientEmail?: string;
  subscriptionId: string;
}) {
  // STUB: Return mock subscription payment link
  console.log('[STRIPE STUB] Would create subscription payment link for:', {
    amount,
    description,
    clientName,
    subscriptionId,
  });

  return {
    paymentLink: `http://localhost:3000/mock-subscription/${subscriptionId}`,
    sessionId: `mock_sub_session_${Date.now()}`,
  };
}

export default {
  createPaymentLink,
  createSubscriptionPaymentLink,
};

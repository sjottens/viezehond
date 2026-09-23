import { syncPayment } from '@/lib/payments';

// Mollie roept dit aan bij elke statuswijziging van een betaling (ook bij terugbetalingen).
// Mollie stuurt alleen het betaling-id; de echte status halen we zelf op bij Mollie.
export async function POST(req: Request) {
  const id = (await req.formData().catch(() => null))?.get('id');
  if (typeof id !== 'string' || !/^tr_\w+$/.test(id)) return new Response('Missing id', { status: 400 });

  try {
    await syncPayment(id);
  } catch (e) {
    console.error('Webhook error', e);
    return new Response('Error', { status: 500 }); // Mollie probeert het later opnieuw
  }
  return new Response('OK');
}

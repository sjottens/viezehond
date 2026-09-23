import { syncPayment } from '@/lib/mollie';

// Mollie roept dit aan bij elke statuswijziging van een betaling.
// Mollie stuurt alleen het betaling-id; de echte status halen we zelf op bij Mollie.
export async function POST(req: Request) {
  const form = await req.formData();
  const id = form.get('id');
  if (typeof id !== 'string') return new Response('Missing id', { status: 400 });

  try {
    await syncPayment(id);
  } catch (e) {
    console.error('Webhook error', e);
    return new Response('Error', { status: 500 }); // Mollie probeert het later opnieuw
  }
  return new Response('OK');
}

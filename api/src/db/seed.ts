import { db } from '.'
import { webhooks } from './schema'
import { faker } from '@faker-js/faker'

// Tipos de eventos do Stripe
const stripeEvents = [
  'charge.succeeded',
  'charge.failed',
  'charge.refunded',
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'payment_intent.created',
  'payment_intent.canceled',
  'payment_method.attached',
  'payment_method.detached',
  'customer.created',
  'customer.updated',
  'customer.deleted',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'customer.subscription.trial_will_end',
  'invoice.created',
  'invoice.finalized',
  'invoice.paid',
  'invoice.payment_failed',
  'invoice.payment_action_required',
  'checkout.session.completed',
  'checkout.session.expired',
  'payout.created',
  'payout.paid',
  'payout.failed',
]

// IPs conhecidos do Stripe (para realismo)
const stripeIPs = [
  '3.18.12.63',
  '3.130.192.231',
  '13.235.14.237',
  '35.154.171.200',
  '52.89.214.238',
  '54.187.174.169',
  '54.187.205.235',
  '54.187.216.72',
]

function generateStripeWebhook() {
  const event = faker.helpers.arrayElement(stripeEvents)
  const amount = faker.number.int({ min: 1000, max: 50000 }) // em centavos
  const currency = faker.helpers.arrayElement(['brl', 'usd', 'eur'])

  let eventData: any = {}

  // Gera dados específicos baseado no tipo de evento
  if (event.startsWith('charge.')) {
    eventData = {
      id: `ch_${faker.string.alphanumeric(24)}`,
      object: 'charge',
      amount,
      currency,
      customer: `cus_${faker.string.alphanumeric(14)}`,
      description: faker.commerce.productName(),
      paid: event === 'charge.succeeded',
      status: event === 'charge.succeeded' ? 'succeeded' : event === 'charge.failed' ? 'failed' : 'refunded',
      payment_method: `pm_${faker.string.alphanumeric(24)}`,
      receipt_email: faker.internet.email(),
      receipt_url: `https://pay.stripe.com/receipts/${faker.string.alphanumeric(40)}`,
    }
  } else if (event.startsWith('payment_intent.')) {
    eventData = {
      id: `pi_${faker.string.alphanumeric(24)}`,
      object: 'payment_intent',
      amount,
      currency,
      customer: `cus_${faker.string.alphanumeric(14)}`,
      description: faker.commerce.productName(),
      status: event.includes('succeeded') ? 'succeeded' : event.includes('failed') ? 'failed' : event.includes('canceled') ? 'canceled' : 'processing',
      payment_method: `pm_${faker.string.alphanumeric(24)}`,
      receipt_email: faker.internet.email(),
    }
  } else if (event.startsWith('customer.subscription.')) {
    eventData = {
      id: `sub_${faker.string.alphanumeric(14)}`,
      object: 'subscription',
      customer: `cus_${faker.string.alphanumeric(14)}`,
      status: event.includes('deleted') ? 'canceled' : 'active',
      current_period_start: faker.date.past().getTime() / 1000,
      current_period_end: faker.date.future().getTime() / 1000,
      plan: {
        id: `plan_${faker.string.alphanumeric(14)}`,
        amount,
        currency,
        interval: faker.helpers.arrayElement(['month', 'year']),
        product: `prod_${faker.string.alphanumeric(14)}`,
      },
      items: {
        data: [{
          id: `si_${faker.string.alphanumeric(14)}`,
          price: {
            id: `price_${faker.string.alphanumeric(14)}`,
            product: faker.commerce.productName(),
            unit_amount: amount,
            currency,
          },
        }],
      },
    }
  } else if (event.startsWith('invoice.')) {
    eventData = {
      id: `in_${faker.string.alphanumeric(24)}`,
      object: 'invoice',
      amount_due: amount,
      amount_paid: event === 'invoice.paid' ? amount : 0,
      currency,
      customer: `cus_${faker.string.alphanumeric(14)}`,
      customer_email: faker.internet.email(),
      status: event === 'invoice.paid' ? 'paid' : event.includes('failed') ? 'open' : 'draft',
      hosted_invoice_url: `https://invoice.stripe.com/${faker.string.alphanumeric(40)}`,
      invoice_pdf: `https://pay.stripe.com/invoice/${faker.string.alphanumeric(40)}/pdf`,
      subscription: `sub_${faker.string.alphanumeric(14)}`,
    }
  } else if (event.startsWith('checkout.session.')) {
    eventData = {
      id: `cs_${faker.string.alphanumeric(60)}`,
      object: 'checkout.session',
      amount_total: amount,
      currency,
      customer: `cus_${faker.string.alphanumeric(14)}`,
      customer_email: faker.internet.email(),
      payment_status: event.includes('completed') ? 'paid' : 'unpaid',
      status: event.includes('completed') ? 'complete' : 'expired',
      success_url: `https://${faker.internet.domainName()}/success`,
      cancel_url: `https://${faker.internet.domainName()}/cancel`,
    }
  } else if (event.startsWith('customer.') && !event.includes('subscription')) {
    eventData = {
      id: `cus_${faker.string.alphanumeric(14)}`,
      object: 'customer',
      email: faker.internet.email(),
      name: faker.person.fullName(),
      phone: faker.phone.number(),
      address: {
        city: faker.location.city(),
        country: faker.location.countryCode(),
        line1: faker.location.streetAddress(),
        postal_code: faker.location.zipCode(),
        state: faker.location.state(),
      },
    }
  } else if (event.startsWith('payout.')) {
    eventData = {
      id: `po_${faker.string.alphanumeric(24)}`,
      object: 'payout',
      amount,
      currency,
      arrival_date: faker.date.future().getTime() / 1000,
      status: event === 'payout.paid' ? 'paid' : event === 'payout.failed' ? 'failed' : 'pending',
      method: 'standard',
      type: 'bank_account',
    }
  } else if (event.startsWith('payment_method.')) {
    eventData = {
      id: `pm_${faker.string.alphanumeric(24)}`,
      object: 'payment_method',
      type: faker.helpers.arrayElement(['card', 'boleto', 'pix']),
      customer: `cus_${faker.string.alphanumeric(14)}`,
      card: {
        brand: faker.helpers.arrayElement(['visa', 'mastercard', 'amex']),
        last4: faker.finance.creditCardNumber().slice(-4),
        exp_month: faker.number.int({ min: 1, max: 12 }),
        exp_year: faker.number.int({ min: 2024, max: 2030 }),
      },
    }
  }

  const webhookBody = {
    id: `evt_${faker.string.alphanumeric(24)}`,
    object: 'event',
    api_version: '2023-10-16',
    created: faker.date.recent({ days: 30 }).getTime() / 1000,
    type: event,
    data: {
      object: eventData,
    },
    livemode: false,
    pending_webhooks: 1,
    request: {
      id: `req_${faker.string.alphanumeric(14)}`,
      idempotency_key: faker.string.uuid(),
    },
  }

  const body = JSON.stringify(webhookBody, null, 2)

  return {
    method: 'POST',
    pathname: '/stripe/webhook',
    ip: faker.helpers.arrayElement(stripeIPs),
    statusCode: 200,
    contentType: 'application/json',
    contentLength: Buffer.byteLength(body),
    headers: {
      'content-type': 'application/json',
      'stripe-signature': `t=${Math.floor(Date.now() / 1000)},v1=${faker.string.hexadecimal({ length: 64, prefix: '' })}`,
      'user-agent': 'Stripe/1.0 (+https://stripe.com/docs/webhooks)',
      'accept': '*/*',
      'accept-encoding': 'gzip, deflate',
      'x-stripe-event-type': event,
    },
    body,
  }
}

async function seed() {
  console.log('🌱 Starting seed with Stripe webhooks...')

  const webhooksData = []

  // Gera 70 webhooks para garantir variedade
  for (let i = 0; i < 70; i++) {
    webhooksData.push(generateStripeWebhook())
  }

  console.log(`📦 Inserting ${webhooksData.length} webhooks...`)

  await db.insert(webhooks).values(webhooksData)

  console.log('✅ Seed completed successfully!')
  console.log(`📊 Total webhooks created: ${webhooksData.length}`)

  // Estatísticas por tipo de evento
  const eventCounts = webhooksData.reduce((acc, webhook) => {
    const body = JSON.parse(webhook.body)
    const eventType = body.type
    acc[eventType] = (acc[eventType] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  console.log('\n📈 Event distribution:')
  Object.entries(eventCounts)
    .sort(([, a], [, b]) => b - a)
    .forEach(([event, count]) => {
      console.log(`  ${event}: ${count}`)
    })
}

seed()
  .catch((error) => {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })

<?php

namespace App\Http\Controllers\Web;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Laravel\Cashier\Http\Controllers\WebhookController as CashierWebhookController;
use Symfony\Component\HttpFoundation\Response;

class StripeWebhookController extends CashierWebhookController
{
    /**
     * @return array<string, string>
     */
    protected function priceToPlanMap(): array
    {
        return [
            (string) config('stripe.prices.pro_monthly') => 'pro',
            (string) config('stripe.prices.enterprise_monthly') => 'enterprise',
        ];
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    protected function handleCustomerSubscriptionUpdated(array $payload): Response
    {
        $response = parent::handleCustomerSubscriptionUpdated($payload);

        $tenant = $this->getTenantByStripeId($payload['data']['object']['customer']);

        if ($tenant) {
            $data = $payload['data']['object'];
            $status = $data['status'] ?? null;
            $price = $data['items']['data'][0]['price']['id'] ?? null;

            $plan = $this->priceToPlanMap()[$price] ?? null;

            if ($plan && in_array($status, ['active', 'trialing'], true)) {
                $tenant->update(['plan' => $plan]);

                activity('billing')
                    ->performedOn($tenant)
                    ->event('subscription_updated')
                    ->withProperties([
                        'stripe_subscription_id' => $data['id'],
                        'plan' => $plan,
                        'status' => $status,
                        'stripe_price' => $price,
                    ])
                    ->log("Subscription updated to {$plan} ({$status})");
            }

            if ($status === 'past_due') {
                activity('billing')
                    ->performedOn($tenant)
                    ->event('subscription_past_due')
                    ->withProperties(['stripe_subscription_id' => $data['id']])
                    ->log('Subscription payment past due');
            }
        }

        return $response;
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    protected function handleCustomerSubscriptionDeleted(array $payload): Response
    {
        $response = parent::handleCustomerSubscriptionDeleted($payload);

        $tenant = $this->getTenantByStripeId($payload['data']['object']['customer']);

        if ($tenant) {
            $tenant->update(['plan' => 'free']);

            activity('billing')
                ->performedOn($tenant)
                ->event('subscription_cancelled')
                ->withProperties(['stripe_subscription_id' => $payload['data']['object']['id']])
                ->log('Subscription cancelled - plan reset to free');
        }

        return $response;
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    protected function handleInvoicePaymentSucceeded(array $payload): Response
    {
        $response = parent::handleInvoicePaymentSucceeded($payload);

        $tenant = $this->getTenantByStripeId($payload['data']['object']['customer']);

        if ($tenant) {
            activity('billing')
                ->performedOn($tenant)
                ->event('invoice_paid')
                ->withProperties([
                    'invoice_id' => $payload['data']['object']['id'],
                    'amount_paid' => $payload['data']['object']['amount_paid'],
                    'currency' => $payload['data']['object']['currency'],
                ])
                ->log('Invoice payment succeeded');
        }

        return $response;
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    protected function handleInvoicePaymentFailed(array $payload): Response
    {
        $tenant = $this->getTenantByStripeId($payload['data']['object']['customer']);

        if ($tenant) {
            activity('billing')
                ->performedOn($tenant)
                ->event('invoice_payment_failed')
                ->withProperties([
                    'invoice_id' => $payload['data']['object']['id'],
                    'amount_due' => $payload['data']['object']['amount_due'],
                    'currency' => $payload['data']['object']['currency'],
                ])
                ->log('Invoice payment failed');
        }

        return $this->successMethod();
    }

    protected function getTenantByStripeId(?string $stripeId): ?TenantModel
    {
        if (! $stripeId) {
            return null;
        }

        return TenantModel::where('stripe_id', $stripeId)->first();
    }
}

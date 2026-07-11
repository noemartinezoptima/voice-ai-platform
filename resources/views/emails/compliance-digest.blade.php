<x-mail::message>
# Compliance Summary

Hi **{{ $tenant->name }}**,

Here is your weekly compliance summary.

**Data Overview:**
- Total calls: {{ $stats['total_calls'] }}
- Retention period: {{ $stats['retention_days'] }} days

<x-mail::button :url="config('app.url') . '/settings/privacy'">
View Privacy Dashboard
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>

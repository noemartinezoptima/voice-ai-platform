# API Reference

Base URL: `https://voice-ai-platform.test/api`

Authentication: Bearer token (Sanctum).

```
Authorization: Bearer <token>
```

---

## Flows

### List flows
```
GET /api/flows
```

Response:
```json
{
    "data": [
        {
            "id": "uuid",
            "name": "Customer Support IVR",
            "description": "...",
            "phone_number": "+525512345678",
            "config": { "start_step": "welcome", "steps": {} },
            "is_active": true,
            "version": 2,
            "created_at": "2026-07-01T00:00:00Z"
        }
    ]
}
```

### Get flow
```
GET /api/flows/{id}
```

### Create flow
```
POST /api/flows
Content-Type: application/json

{
    "name": "My Flow",
    "description": "...",
    "phone_number": "+525512345678",
    "config": { "start_step": "...", "steps": {} },
    "is_active": true
}
```

### Update flow
```
PUT /api/flows/{id}
```

### Delete flow
```
DELETE /api/flows/{id}
```

---

## Calls

### List calls
```
GET /api/calls?status=completed&search=+52
```

Query params:
- `status` — Filter by status
- `search` — Search by phone number
- `per_page` — Pagination (default: 15)

Response:
```json
{
    "data": [
        {
            "id": "uuid",
            "call_sid": "CA...",
            "from_number": "+525512345678",
            "to_number": "+525598765432",
            "status": "completed",
            "duration_seconds": 120,
            "started_at": "2026-07-01T00:00:00Z",
            "flow": { "id": "uuid", "name": "Support IVR" }
        }
    ],
    "meta": { "current_page": 1, "last_page": 3, "total": 30 }
}
```

### Get call
```
GET /api/calls/{id}
```

Response includes `transcripts` and `logs` relations.

---

## Tenants

### Get current tenant
```
GET /api/tenants/current
```

### Update tenant
```
PUT /api/tenants/current
Content-Type: application/json

{
    "name": "Acme Corp",
    "settings": { "timezone": "America/Mexico_City", "language": "es" }
}
```

---

## Tokens

### List tokens
```
GET /api/tokens
```

### Create token
```
POST /api/tokens
Content-Type: application/json

{
    "name": "dev-client",
    "abilities": ["read", "write"]
}
```

Response includes the plain-text token (only time it's shown).

### Revoke token
```
DELETE /api/tokens/{id}
```

---

## Errors

```json
{
    "message": "Validation failed.",
    "errors": {
        "name": ["The name field is required."]
    }
}
```

| Status | Meaning |
|--------|---------|
| 401 | Unauthenticated |
| 403 | Forbidden |
| 404 | Not found |
| 422 | Validation error |
| 429 | Rate limited |

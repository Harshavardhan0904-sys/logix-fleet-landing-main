# FreightFlow Enterprise API Specifications

## Overview
This document defines the technical specifications for three core enterprise features: Rate Card Management, POD + Geofencing, and integration patterns.

---

## 1. RATE CARD MANAGEMENT API (Week 4-6)

### Business Context
- **Purpose**: Dynamic freight pricing engine with volume slabs, distance tiers, special conditions
- **User Segment**: Freight forwarders, 3PL logistics providers, SME shippers
- **Expected Impact**: 70% user adoption, 5-10% cost savings identification
- **Revenue Model**: Premium feature (₹2,999/month per company)

### Core Features
- **Multi-tier pricing**: Volume slabs (1-5 items, 6-20, 20+ units)
- **Distance-based rates**: Slab-based pricing (0-100km, 100-500km, 500km+)
- **Special conditions**: Customer discounts, seasonal rates, temporary promotions
- **Rate validity**: Date ranges for rate card effectiveness
- **Integration**: Auto-calculate freight cost per shipment during booking

---

### API Endpoints

#### 1.1 Create Rate Card
```
POST /api/ratecard/create
Authentication: Bearer {jwt_token}
Content-Type: application/json

Request Body:
{
  "name": "TCI Standard Rates - April 2026",
  "vendor_id": "VENDOR-001",
  "origin": "Kolkata",
  "destination": "Mumbai",
  "transport_mode": "road",
  "valid_from": "2026-04-01",
  "valid_until": "2026-06-30",
  "currency": "INR",
  "base_rate_per_km": 8.5,
  "tiers": [
    {
      "name": "Small (1-5 items)",
      "min_items": 1,
      "max_items": 5,
      "multiplier": 1.0,
      "description": "Up to 5 items"
    },
    {
      "name": "Medium (6-20 items)",
      "min_items": 6,
      "max_items": 20,
      "multiplier": 0.85,
      "description": "6-20 items (15% discount)"
    },
    {
      "name": "Bulk (20+ items)",
      "min_items": 21,
      "max_items": 999,
      "multiplier": 0.70,
      "description": "Bulk orders (30% discount)"
    }
  ],
  "distance_slabs": [
    {
      "name": "Local (0-100km)",
      "min_km": 0,
      "max_km": 100,
      "rate_per_km": 12.0
    },
    {
      "name": "Regional (100-500km)",
      "min_km": 100,
      "max_km": 500,
      "rate_per_km": 8.5
    },
    {
      "name": "National (500km+)",
      "min_km": 500,
      "max_km": 5000,
      "rate_per_km": 6.5
    }
  ],
  "surcharges": [
    {
      "name": "Fuel Surcharge",
      "type": "percentage",
      "value": 5.0,
      "description": "Dynamic fuel cost adjustment"
    },
    {
      "name": "Weekend Surcharge",
      "type": "fixed",
      "value": 500,
      "applicable_days": ["Saturday", "Sunday"]
    }
  ],
  "special_conditions": [
    {
      "condition_type": "customer_discount",
      "customer_id": "CUST-001",
      "discount_percentage": 10,
      "min_monthly_volume": 100
    },
    {
      "condition_type": "seasonal_promotion",
      "start_date": "2026-05-01",
      "end_date": "2026-05-31",
      "discount_percentage": 15,
      "max_usage": 20
    }
  ],
  "min_shipment_value": 500,
  "notes": "Q2 promotional rates for high-volume customers"
}

Response (201 Created):
{
  "ratecard_id": "RATE-001",
  "status": "active",
  "created_by": "user@company.com",
  "created_at": "2026-04-05T10:30:00Z",
  "message": "Rate card created successfully"
}
```

#### 1.2 Get Rate Card
```
GET /api/ratecard/{ratecard_id}
Authentication: Bearer {jwt_token}

Response (200 OK):
{
  "ratecard_id": "RATE-001",
  "name": "TCI Standard Rates - April 2026",
  "status": "active",
  "valid_from": "2026-04-01",
  "valid_until": "2026-06-30",
  "tiers": [...],
  "distance_slabs": [...],
  "surcharges": [...]
}
```

#### 1.3 List Rate Cards
```
GET /api/ratecard/list?vendor_id=VENDOR-001&transport_mode=road&status=active
Authentication: Bearer {jwt_token}

Response (200 OK):
{
  "count": 3,
  "ratecards": [
    { "ratecard_id": "RATE-001", "name": "TCI Standard...", "status": "active", ... },
    { "ratecard_id": "RATE-002", "name": "TCI Premium...", "status": "active", ... },
    { "ratecard_id": "RATE-003", "name": "TCI Economy...", "status": "draft", ... }
  ]
}
```

#### 1.4 Calculate Freight Cost
```
POST /api/ratecard/calculate
Authentication: Bearer {jwt_token}
Content-Type: application/json

Request Body:
{
  "ratecard_id": "RATE-001",
  "origin": "Kolkata",
  "destination": "Mumbai",
  "distance_km": 1500,
  "total_items": 15,
  "shipment_value": 50000,
  "customer_id": "CUST-001",
  "transport_mode": "road",
  "booking_date": "2026-04-05"
}

Response (200 OK):
{
  "calculation_detail": {
    "base_rate": 12750,
    "tier_discount": -2162.5,
    "fuel_surcharge": 637.5,
    "weekend_surcharge": 0,
    "customer_discount": -1306.25,
    "seasonal_discount": -1912.5,
    "total_freight": 7006.25
  },
  "breakdown": {
    "distance_km": 1500,
    "items": 15,
    "rate_applied": "Medium (6-20 items) | Regional (100-500km)",
    "discounts_applied": ["Bulk (15% off)", "Customer loyalty (10% off)", "May promotion (15% off)"]
  },
  "final_price": 7006.25,
  "currency": "INR",
  "valid_until": "2026-04-06T23:59:59Z"
}
```

#### 1.5 Update Rate Card
```
PUT /api/ratecard/{ratecard_id}
Authentication: Bearer {jwt_token}
Content-Type: application/json

Request Body:
{
  "tiers": [...],  // Updated tiers
  "surcharges": [...],  // Updated surcharges
  "status": "active"  // Can be: draft, active, inactive, archived
}

Response (200 OK):
{
  "ratecard_id": "RATE-001",
  "status": "active",
  "updated_at": "2026-04-05T11:30:00Z",
  "changes": {
    "tiers": "Updated bulk discount to 35%",
    "surcharges": "Added holiday surcharge"
  }
}
```

#### 1.6 Apply Rate Card to Shipment
```
POST /api/shipments/{shipment_id}/apply-ratecard
Authentication: Bearer {jwt_token}
Content-Type: application/json

Request Body:
{
  "ratecard_id": "RATE-001"
}

Response (200 OK):
{
  "shipment_id": "SHIP-001",
  "freight_cost": 7006.25,
  "ratecard_applied": "RATE-001",
  "cost_breakdown": {...},
  "status": "priced"
}
```

### Data Model

```javascript
// Rate Card Schema
{
  ratecard_id: String,
  company_id: String,
  vendor_id: String,
  name: String,
  origin: String,
  destination: String,
  transport_mode: String,  // road | rail | air | sea
  valid_from: Date,
  valid_until: Date,
  base_rate_per_km: Number,
  
  tiers: [{
    name: String,
    min_items: Number,
    max_items: Number,
    multiplier: Number,  // 1.0 = no discount, 0.85 = 15% discount
    description: String,
    created_at: Date
  }],
  
  distance_slabs: [{
    name: String,
    min_km: Number,
    max_km: Number,
    rate_per_km: Number
  }],
  
  surcharges: [{
    name: String,
    type: String,  // percentage | fixed
    value: Number,
    applicable_days: [String],  // Optional
    created_at: Date
  }],
  
  special_conditions: [{
    condition_type: String,  // customer_discount | seasonal | volume_based
    customer_id: String,
    discount_percentage: Number,
    start_date: Date,
    end_date: Date,
    max_usage: Number,
    usage_count: Number
  }],
  
  status: String,  // draft | active | inactive | archived
  min_shipment_value: Number,
  currency: String,
  created_by: String,
  created_at: Date,
  updated_at: Date,
  notes: String
}
```

---

## 2. POD + GEOFENCING API (Week 7-10)

### Business Context
- **Purpose**: Delivery proof & real-time location monitoring with auto-reconciliation
- **User Segment**: Drivers, fleet managers, delivery coordinators
- **Expected Impact**: 98%+ POD capture, 80% dispute reduction
- **Platform**: Mobile-first (React Native), also web dashboard

### Core Features
- **Geofence creation**: 2km radius around PIN code locations
- **Entry/Exit alerts**: Real-time notifications when driver approaches/leaves geofence
- **Photo evidence**: Capture delivery photos with timestamp & GPS
- **Signature**: Digital signature capture for delivery proof
- **Auto-reconciliation**: Match POD with invoices, auto-settle payments
- **Failed delivery**: Handle return-to-origin, customer contact retry

---

### API Endpoints

#### 2.1 Create Geofence
```
POST /api/geofencing/create
Authentication: Bearer {jwt_token}
Content-Type: application/json

Request Body:
{
  "location_name": "Pune Warehouse",
  "location_type": "warehouse",  // warehouse | customer | hub | delivery_point
  "latitude": 18.5204,
  "longitude": 73.8567,
  "radius_meters": 2000,
  "pin_code": "411001",
  "address": "Pune Central, Maharash",
  "alert_threshold": 500,  // meters - Alert when this distance
  "notifications_enabled": true,
  "notification_recipients": ["manager@company.com", "driver@company.com"]
}

Response (201 Created):
{
  "geofence_id": "GEO-001",
  "status": "active",
  "created_at": "2026-04-05T10:30:00Z"
}
```

#### 2.2 Track Device Location (Continuous)
```
POST /api/geofencing/track
Authentication: Bearer {jwt_token}
Content-Type: application/json

Request Body:
{
  "device_id": "DEVICE-001",
  "driver_id": "DRV-001",
  "latitude": 18.5210,
  "longitude": 73.8570,
  "accuracy_meters": 15,
  "timestamp": "2026-04-05T14:30:00Z",
  "speed_kmh": 45,
  "heading": 180,
  "battery_percent": 78
}

Response (200 OK):
{
  "device_id": "DEVICE-001",
  "geofence_status": {
    "nearest_geofence": "GEO-001",
    "distance_to_nearest_km": 0.15,
    "status": "approaching",  // approaching | inside | exiting | far
    "eta_to_geofence": "2 minutes"
  },
  "alerts": [
    {
      "type": "geofence_entry_warning",
      "geofence_id": "GEO-001",
      "distance_remaining_meters": 500,
      "message": "Arriving at Pune Warehouse in 2 minutes"
    }
  ]
}
```

#### 2.3 Record Geofence Event
```
POST /api/geofencing/event
Authentication: Bearer {jwt_token}
Content-Type: application/json

Request Body:
{
  "geofence_id": "GEO-001",
  "device_id": "DEVICE-001",
  "driver_id": "DRV-001",
  "event_type": "entry",  // entry | exit
  "latitude": 18.5204,
  "longitude": 73.8567,
  "accuracy_meters": 12,
  "timestamp": "2026-04-05T14:35:00Z"
}

Response (201 Created):
{
  "event_id": "EVENT-001",
  "geofence_id": "GEO-001",
  "event_type": "entry",
  "timestamp": "2026-04-05T14:35:00Z",
  "driver_name": "Rajesh Kumar",
  "vehicle_number": "MH12AB1234"
}
```

#### 2.4 Capture Proof of Delivery (POD)
```
POST /api/pod/capture
Authentication: Bearer {jwt_token}
Content-Type: multipart/form-data

Request Body:
{
  "shipment_id": "SHIP-001",
  "delivery_location": "Pune Office Complex",
  "latitude": 18.5210,
  "longitude": 73.8570,
  "gps_accuracy_meters": 15,
  "photo": <binary image>,
  "photo_timestamp": "2026-04-05T15:00:00Z",
  "recipient_name": "Rajesh Sharma",
  "recipient_signature": <base64 image>,
  "notes": "Delivered to reception",
  "delivery_time": "2026-04-05T15:05:00Z",
  "temperature_recorded": 22,  // Optional, for cold chain
  "custom_fields": {
    "consignee_contact": "9876543210",
    "building_name": "Phoenix Tower"
  }
}

Response (201 Created):
{
  "pod_id": "POD-001",
  "shipment_id": "SHIP-001",
  "status": "captured",
  "captured_at": "2026-04-05T15:00:00Z",
  "delivery_proof": {
    "photo_url": "https://cdn.freightflow.in/pods/POD-001-photo.jpg",
    "signature_url": "https://cdn.freightflow.in/pods/POD-001-sig.png",
    "metadata": {
      "gps_coordinates": "18.5210, 73.8570",
      "accuracy_meters": 15,
      "captured_device": "iPad Pro"
    }
  },
  "geofence_entry_time": "2026-04-05T14:35:00Z",
  "delivery_duration_minutes": 30
}
```

#### 2.5 POD Verification (Backend)
```
POST /api/pod/verify
Authentication: Bearer {jwt_token}
Content-Type: application/json

Request Body:
{
  "pod_id": "POD-001",
  "verify_photo": true,
  "photo_quality_check": "passed",
  "verify_gps": true,
  "gps_variance_acceptable": true,
  "verify_signature": true,
  "signature_quality": "clear",
  "notes": "All checks passed - Ready for settlement"
}

Response (200 OK):
{
  "pod_id": "POD-001",
  "shipment_id": "SHIP-001",
  "verification_status": "verified",
  "verification_timestamp": "2026-04-05T15:30:00Z",
  "auto_reconciliation": {
    "invoice_matched": true,
    "invoice_id": "INV-001",
    "amount": 7006.25,
    "reconciliation_status": "matched",
    "payment_release": "approved"
  }
}
```

#### 2.6 Failed Delivery Workflow
```
POST /api/pod/failed-delivery
Authentication: Bearer {jwt_token}
Content-Type: application/json

Request Body:
{
  "shipment_id": "SHIP-001",
  "reason": "customer_not_available",  // customer_not_available | address_incorrect | refused | damaged
  "photo": <binary image>,
  "phone_contact_attempted": true,
  "phone_number": "9876543210",
  "notes": "Customer not home - Attempted call at 3:15 PM",
  "next_action": "retry",  // retry | return_to_origin | hold_at_hub
  "retry_date": "2026-04-06"
}

Response (200 OK):
{
  "shipment_id": "SHIP-001",
  "status": "failed_delivery",
  "failure_reason": "customer_not_available",
  "failure_timestamp": "2026-04-05T15:10:00Z",
  "retry_scheduled": true,
  "retry_date": "2026-04-06T10:00:00Z",
  "customer_notification_sent": true,
  "next_steps": "Customer will receive SMS alert for scheduled retry"
}
```

### Data Models

```javascript
// Geofence Schema
{
  geofence_id: String,
  location_name: String,
  location_type: String,  // warehouse | customer | hub | delivery_point
  latitude: Number,
  longitude: Number,
  radius_meters: Number,
  address: String,
  pin_code: String,
  alert_threshold: Number,
  notifications_enabled: Boolean,
  notification_recipients: [String],
  company_id: String,
  created_at: Date,
  updated_at: Date,
  active: Boolean
}

// POD Schema
{
  pod_id: String,
  shipment_id: String,
  delivery_location: String,
  recipient_name: String,
  delivery_time: Date,
  latitude: Number,
  longitude: Number,
  gps_accuracy_meters: Number,
  photo_url: String,
  signature_url: String,
  temperature_recorded: Number,
  custom_fields: Object,
  status: String,  // captured | verified | failed
  captured_at: Date,
  verified_at: Date,
  verification_notes: String,
  company_id: String,
  driver_id: String
}

// Geofence Event Schema
{
  event_id: String,
  geofence_id: String,
  device_id: String,
  driver_id: String,
  event_type: String,  // entry | exit
  latitude: Number,
  longitude: Number,
  accuracy_meters: Number,
  timestamp: Date,
  company_id: String
}
```

---

## 3. INTEGRATION ARCHITECTURE

### Authentication
All endpoints require valid JWT token:
```
Authorization: Bearer {jwt_token}
```

### Error Handling
```json
{
  "error": "string",
  "error_code": "string",
  "details": "string",
  "timestamp": "ISO8601",
  "request_id": "string"
}
```

### Rate Limiting
- Authentication: 100 requests/minute
- Standard endpoints: 1000 requests/minute  
- Batch operations: 100 requests/minute

### Webhook Events
```
POST {customer_webhook_url}

Events:
- ratecard.created
- ratecard.updated
- shipment.priced (rate applied)
- pod.captured
- pod.verified
- geofence.entry
- geofence.exit
- delivery.failed
```

---

## 4. INTEGRATION WITH EXISTING SYSTEMS

### Connect to Shipments API
```
POST /api/shipments/{shipment_id}/apply-ratecard
Connects: Rate Card system → Shipment pricing
```

### Connect to Payments API
```
POST /api/pod/verify → Triggers → POST /api/payments/initiate-settlement
Auto-reconciliation: Invoice match → Payment release
```

### Connect to Notifications API
```
POST /api/geofencing/track → Triggers → POST /api/notifications/send
Events: Geofence entry/exit → Driver alerts
```

---

## 5. IMPLEMENTATION MILESTONES

**Week 4-6: Rate Card**
- [ ] Database schema and model
- [ ] CRUD endpoints
- [ ] Calculation engine
- [ ] Frontend form builder
- [ ] Integration with shipments

**Week 7-10: POD + Geofencing**
- [ ] Geofence CRUD and tracking
- [ ] Location streaming backend
- [ ] Mobile app (React Native)
- [ ] POD capture workflow
- [ ] Auto-reconciliation logic

---

## Testing & Validation

### Rate Card Testing
- Volume slab boundary conditions
- Distance calculation accuracy
- Discount stacking (multiple discounts)
- Date-based rate validity

### POD + Geofencing Testing
- GPS accuracy within 30 meters
- Geofence entry/exit detection <1 second
- Photo compression without quality loss
- Signature capture quality validation

---

## Success Metrics

| Metric | Target | Timeline |
|--------|--------|----------|
| Rate card adoption | 70% of users | Week 8 |
| Cost savings identified | 5-10% for adopters | Week 10 |
| POD capture rate | 98%+ | Week 12 |
| Delivery dispute rate | <2% | Week 14 |
| Auto-reconciliation success | 95%+ | Week 16 |


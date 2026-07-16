# Nomadia-Inspired Features API Documentation

**Backend Server:** `http://localhost:5000`  
**API Base URL:** `http://localhost:5000/api`  
**Authentication:** Bearer token in `Authorization` header

---

## 🔐 Authentication

All endpoints require a valid JWT token in the Authorization header:

```javascript
Authorization: Bearer <your-jwt-token>
```

The frontend uses `Session.getToken()` to retrieve the token from session storage.

---

## 📍 1. GPS TRACKING & REAL-TIME LOCATION

### GET `/api/shipments/tracking`
**Purpose:** Fetch real-time tracking data for all active shipments  
**Query Parameters:**
- `status` (optional): Filter by status (e.g., "in-transit", "out-for-delivery")
- `priority` (optional): Filter by priority (e.g., "high", "medium", "low")
- `timeRange` (optional): Time range ("1h", "6h", "24h")

**Response:**
```json
{
  "success": true,
  "shipments": [
    {
      "id": "SHP001",
      "trackingNumber": "TRK-2024-001",
      "status": "in-transit",
      "priority": "high",
      "location": "Bandra, Mumbai",
      "latitude": 19.0596,
      "longitude": 72.8295,
      "speed": 42,
      "eta": "2024-01-18T15:45:00Z",
      "lastUpdate": "2024-01-18T14:30:00Z",
      "driver": {
        "id": "DRV001",
        "name": "Raj Kumar",
        "phone": "+919876543210"
      },
      "from": "Warehouse, Mumbai",
      "to": "123 Marine Drive, Mumbai",
      "progress": 65,
      "distance": 12.5,
      "distanceRemaining": 4.5,
      "onTimePercentage": 98,
      "temperature": 28,
      "packageCondition": "good"
    }
  ],
  "stats": {
    "activeCount": 3,
    "onTimePercentage": 98.0,
    "averageDeliveryTime": 142,
    "totalDistance": 36.0,
    "averageSpeed": 35.0
  },
  "timestamp": "2024-01-18T14:30:00Z",
  "count": 3
}
```

### GET `/api/shipments/:id/tracking`
**Purpose:** Get detailed tracking info for a single shipment  
**Path Parameters:**
- `:id` - Shipment ID

**Response:**
```json
{
  "success": true,
  "shipment": {
    "id": "SHP001",
    "trackingNumber": "TRK-2024-001",
    "status": "in-transit",
    "location": "Bandra, Mumbai",
    "latitude": 19.0596,
    "longitude": 72.8295,
    "speed": 42,
    "eta": "2024-01-18T15:45:00Z",
    "driver": {
      "id": "DRV001",
      "name": "Raj Kumar",
      "phone": "+919876543210",
      "rating": 4.8
    },
    "from": "Warehouse, Mumbai",
    "to": "123 Marine Drive, Mumbai",
    "progress": 65,
    "timeline": [
      {
        "status": "picked-up",
        "timestamp": "2024-01-18T13:00:00Z",
        "location": "Warehouse, Mumbai"
      },
      {
        "status": "in-transit",
        "timestamp": "2024-01-18T13:30:00Z",
        "location": "Central Mumbai"
      },
      {
        "status": "out-for-delivery",
        "timestamp": "2024-01-18T14:00:00Z",
        "location": "Bandra"
      }
    ],
    "distance": 12.5,
    "distanceRemaining": 4.5,
    "expectedDeliveryDate": "2024-01-19T14:30:00Z",
    "attempts": 1,
    "notes": "Customer called for delay, rerouted via faster route"
  }
}
```

### POST `/api/shipments/:id/location/update`
**Purpose:** Update real-time GPS location (called by driver mobile app)  
**Path Parameters:**
- `:id` - Shipment ID

**Request Body:**
```json
{
  "latitude": 19.0596,
  "longitude": 72.8295,
  "speed": 42,
  "accuracy": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Location updated"
}
```

---

## 📦 2. PROOF OF DELIVERY

### GET `/api/shipments/pod/pending`
**Purpose:** Get list of deliveries pending proof of delivery  
**Query Parameters:**
- `driverId` (optional): Filter by driver ID

**Response:**
```json
{
  "success": true,
  "podPending": [
    {
      "id": "SHP001",
      "trackingNumber": "TRK-2024-001",
      "recipientName": "John Doe",
      "recipientPhone": "+919876543210",
      "address": "123 Marine Drive, Mumbai",
      "shipmentType": "Electronics",
      "value": 5000,
      "paymentType": "prepaid",
      "amountToCollect": 0,
      "priority": "high",
      "attemptNumber": 1
    }
  ],
  "count": 3
}
```

### POST `/api/shipments/pod/submit`
**Purpose:** Submit proof of delivery with photo and signature  
**Request Body:**
```json
{
  "shipmentId": "SHP001",
  "driverId": "DRV001",
  "receiverName": "John Doe",
  "receiverPhone": "+919876543210",
  "photoUrl": "data:image/jpeg;base64,...",
  "signatureData": "data:image/png;base64,...",
  "packageCondition": "good",
  "notes": "Delivered successfully",
  "paymentMethod": "prepaid",
  "amountCollected": 0,
  "location": {
    "latitude": 19.0596,
    "longitude": 72.8295
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Proof of delivery submitted successfully",
  "podId": "POD-1705594200000",
  "status": "submitted"
}
```

### GET `/api/shipments/pod/completed`
**Purpose:** Get list of deliveries with completed POD  
**Query Parameters:** None

**Response:**
```json
{
  "success": true,
  "completedPOD": [
    {
      "id": "SHP101",
      "trackingNumber": "TRK-2024-101",
      "recipientName": "Priya Patel",
      "deliveryDate": "2024-01-16T14:30:00Z",
      "photoUrl": "/uploads/pod-101.jpg",
      "signaturePresent": true,
      "packageCondition": "good",
      "attempts": 1
    }
  ],
  "count": 4
}
```

---

## 🗺️ 3. ROUTE OPTIMIZATION

### POST `/api/routes/optimize`
**Purpose:** Generate optimized route based on shipments and constraints  
**Request Body:**
```json
{
  "origin": "Warehouse, Mumbai",
  "shipmentIds": ["SHP001", "SHP002", "SHP003"],
  "vehicleType": "van",
  "priority": "fastest",
  "constraints": {
    "maxStops": 10,
    "timeLimit": 480
  }
}
```

**Response:**
```json
{
  "success": true,
  "route": {
    "id": "ROUTE-1705594200000",
    "origin": "Warehouse, Mumbai",
    "stops": [
      {
        "sequence": 1,
        "shipmentId": "SHP001",
        "address": "123 Marine Drive, Mumbai",
        "eta": "2024-01-18T14:30:00Z"
      },
      {
        "sequence": 2,
        "shipmentId": "SHP002",
        "address": "456 Lakeside Avenue, Mumbai",
        "eta": "2024-01-18T14:50:00Z"
      },
      {
        "sequence": 3,
        "shipmentId": "SHP003",
        "address": "789 Business District, Mumbai",
        "eta": "2024-01-18T15:10:00Z"
      }
    ],
    "metrics": {
      "totalDistance": 28.1,
      "totalTime": 92,
      "estimatedCost": 337,
      "co2Emissions": 6.4,
      "stopCount": 3
    },
    "alternatives": [
      {
        "routeId": "ALT-1",
        "distance": 35.2,
        "time": 115,
        "cost": 420,
        "description": "Via Toll Road (Fastest)"
      },
      {
        "routeId": "ALT-2",
        "distance": 42.1,
        "time": 98,
        "cost": 504,
        "description": "Highway Route (Cheapest)"
      }
    ],
    "vehicleType": "van",
    "priority": "fastest",
    "optimizationMethod": "nearest-neighbor",
    "savedDistance": 17.1,
    "savedCost": 203,
    "createdAt": "2024-01-18T14:30:00Z",
    "status": "optimized"
  },
  "message": "Route optimized with 3 stops"
}
```

### GET `/api/routes/:id`
**Purpose:** Get route details and progress  
**Path Parameters:**
- `:id` - Route ID

**Response:**
```json
{
  "success": true,
  "route": {
    "id": "ROUTE-1705594200000",
    "origin": "Warehouse, Mumbai",
    "status": "in-progress",
    "progress": 65,
    "stops": [
      {
        "sequence": 1,
        "completed": true,
        "completedAt": "2024-01-18T14:30:00Z"
      },
      {
        "sequence": 2,
        "completed": true,
        "completedAt": "2024-01-18T14:50:00Z"
      },
      {
        "sequence": 3,
        "completed": false,
        "eta": "2024-01-18T15:10:00Z"
      }
    ],
    "metrics": {
      "totalDistance": 28.1,
      "distanceCovered": 18.3,
      "distanceRemaining": 9.8,
      "averageSpeed": 42,
      "estimatedCompletion": "2024-01-18T15:15:00Z"
    }
  }
}
```

### POST `/api/routes/save-template`
**Purpose:** Save route as reusable template  
**Request Body:**
```json
{
  "routeId": "ROUTE-1705594200000",
  "templateName": "Monday Morning Delivery Circuit",
  "description": "Bandra-Dadar-Worli delivery route for weekday mornings"
}
```

**Response:**
```json
{
  "success": true,
  "template": {
    "id": "TEMPLATE-1705594200000",
    "routeId": "ROUTE-1705594200000",
    "templateName": "Monday Morning Delivery Circuit",
    "description": "Bandra-Dadar-Worli delivery route for weekday mornings",
    "createdAt": "2024-01-18T14:30:00Z"
  },
  "message": "Route saved as template"
}
```

---

## 👥 4. DRIVER MANAGEMENT & MOBILE APP

### GET `/api/drivers`
**Purpose:** Get list of all drivers with status  
**Query Parameters:**
- `status` (optional): Filter by status ("online", "on-delivery", "idle", "offline")

**Response:**
```json
{
  "success": true,
  "drivers": [
    {
      "id": "DRV001",
      "name": "Raj Kumar",
      "phone": "+919876543210",
      "status": "online",
      "location": {
        "latitude": 19.0596,
        "longitude": 72.8295,
        "address": "Bandra, Mumbai"
      },
      "activeTasks": 3,
      "completedToday": 8,
      "successRate": 98,
      "rating": 4.8,
      "appVersion": "2.4.1",
      "onlineSince": "2024-01-18T12:30:00Z",
      "avatar": "/assets/driver-1.jpg"
    }
  ],
  "stats": {
    "totalDrivers": 24,
    "onlineDrivers": 15,
    "onDeliveryDrivers": 8,
    "idleDrivers": 5,
    "offlineDrivers": 9,
    "averageSuccessRate": 97.6
  },
  "timestamp": "2024-01-18T14:30:00Z"
}
```

### GET `/api/drivers/:id/performance`
**Purpose:** Get driver performance metrics  
**Path Parameters:**
- `:id` - Driver ID

**Response:**
```json
{
  "success": true,
  "performance": {
    "driverId": "DRV001",
    "totalDeliveries": 1245,
    "completedDeliveries": 1210,
    "failedDeliveries": 35,
    "successRate": 97.2,
    "averageDeliveryTime": 28,
    "averageRating": 4.8,
    "totalDistance": 15420,
    "onTimePercentage": 94,
    "failedDeliveries": 2,
    "earnedIncentive": 12500,
    "monthlyBonus": 5000,
    "totalEarnings": 65000,
    "lastPaymentDate": "2024-01-11T00:00:00Z"
  }
}
```

### POST `/api/drivers/:id/assign-task`
**Purpose:** Assign delivery task to driver  
**Path Parameters:**
- `:id` - Driver ID

**Request Body:**
```json
{
  "shipmentIds": ["SHP001", "SHP002", "SHP003"]
}
```

**Response:**
```json
{
  "success": true,
  "assignment": {
    "driverId": "DRV001",
    "assignedTasks": 3,
    "assignedAt": "2024-01-18T14:30:00Z",
    "estimatedCompletion": "2024-01-18T18:30:00Z"
  },
  "message": "3 tasks assigned to driver"
}
```

### POST `/api/drivers/:id/update-app-version`
**Purpose:** Force update driver mobile app  
**Path Parameters:**
- `:id` - Driver ID

**Request Body:**
```json
{
  "version": "2.4.2",
  "forceUpdate": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Update triggered for driver DRV001",
  "version": "2.4.2",
  "forceUpdate": true
}
```

### POST `/api/drivers/broadcast-message`
**Purpose:** Send broadcast message to all drivers  
**Request Body:**
```json
{
  "message": "New delivery surge pricing active. ₹5 bonus per delivery!",
  "priority": "high",
  "targetDriverIds": ["DRV001", "DRV002", "DRV003"]
}
```

**Response:**
```json
{
  "success": true,
  "broadcast": {
    "id": "MSG-1705594200000",
    "message": "New delivery surge pricing active. ₹5 bonus per delivery!",
    "priority": "high",
    "targetCount": 3,
    "sentAt": "2024-01-18T14:30:00Z",
    "deliveredCount": 0,
    "readCount": 0
  },
  "message": "Message queued for delivery"
}
```

---

## 📊 5. DELIVERY ANALYTICS

### GET `/api/delivery-analytics/report`
**Purpose:** Get comprehensive delivery analytics report  
**Query Parameters:**
- `startDate` (optional): Start date (ISO format)
- `endDate` (optional): End date (ISO format)
- `timeRange` (optional): Quick range ("week", "month", "quarter", "year")

**Response:**
```json
{
  "success": true,
  "period": "week",
  "startDate": "2024-01-11T00:00:00Z",
  "endDate": "2024-01-18T23:59:59Z",
  "kpis": {
    "totalDeliveries": 1458,
    "successfulDeliveries": 1432,
    "failedDeliveries": 24,
    "pendingDeliveries": 2,
    "successRate": 98.3,
    "averageDeliveryTime": 138,
    "averageCostPerDelivery": 345,
    "totalRevenue": 503210,
    "totalCost": 287640,
    "profit": 215570,
    "co2Saved": 2.4,
    "fuelSaved": 89500
  },
  "statusBreakdown": {
    "inTransit": 145,
    "outForDelivery": 89,
    "delivered": 1432,
    "delayed": 18,
    "failed": 24
  },
  "hourlyBreakdown": [
    {"hour": 0, "deliveries": 0},
    {"hour": 6, "deliveries": 23},
    {"hour": 9, "deliveries": 142},
    {"hour": 12, "deliveries": 198},
    {"hour": 15, "deliveries": 256},
    {"hour": 18, "deliveries": 189},
    {"hour": 21, "deliveries": 45},
    {"hour": 24, "deliveries": 5}
  ],
  "topVendors": [
    {
      "vendorId": "V001",
      "name": "TechWorld",
      "deliveries": 245,
      "successRate": 99.2,
      "avgRating": 4.8
    }
  ],
  "costBreakdown": {
    "fuelCost": 125640,
    "driverSalary": 95000,
    "vehicleMaintenance": 32500,
    "miscellaneous": 34500,
    "totalCost": 287640
  },
  "trends": {
    "dayOverDayChange": 2.3,
    "weekOverWeekChange": 5.1,
    "costTrend": -1.5
  }
}
```

### GET `/api/delivery-analytics/export`
**Purpose:** Export analytics report in PDF or CSV format  
**Query Parameters:**
- `format` (required): "pdf" or "csv"
- `startDate` (optional): Start date
- `endDate` (optional): End date

**Response:** File download (application/pdf or text/csv)

---

## 🗺️ 6. TERRITORY MANAGEMENT

### GET `/api/territories`
**Purpose:** Get list of all territories  
**Query Parameters:**
- `status` (optional): Filter by status ("active", "inactive", "expansion")

**Response:**
```json
{
  "success": true,
  "territories": [
    {
      "id": "TER-001",
      "name": "North Delhi Zone",
      "description": "North Delhi and surrounding areas",
      "territoryCode": "NDZ-001",
      "boundaries": {
        "type": "Polygon",
        "coordinates": [[...]]
      },
      "postalCodes": ["110001", "110002", "110003"],
      "areas": ["Karol Bagh", "Sadar Bazar"],
      "assignedDriver": "DRV001",
      "assignmentDate": "2024-01-01T00:00:00Z",
      "workload": {
        "expectedDailyDeliveries": 45,
        "currentMonthDeliveries": 890,
        "estimatedWorkloadPercent": 85,
        "capacityStatus": "balanced"
      },
      "performanceMetrics": {
        "successRatePercent": 98.5,
        "averageDeliveryTimeHours": 0.45,
        "customerSatisfactionRating": 4.7
      },
      "status": "active"
    }
  ],
  "summary": {
    "totalTerritories": 12,
    "activeTerritories": 10,
    "assignedTerritories": 10,
    "unassignedCount": 2
  }
}
```

### POST `/api/territories/:id/assign`
**Purpose:** Assign territory to driver  
**Path Parameters:**
- `:id` - Territory ID

**Request Body:**
```json
{
  "driverId": "DRV001",
  "expectedDailyDeliveries": 45
}
```

**Response:**
```json
{
  "success": true,
  "assignment": {
    "territoryId": "TER-001",
    "driverId": "DRV001",
    "assignedAt": "2024-01-18T14:30:00Z",
    "expectedDailyDeliveries": 45
  },
  "message": "Territory assigned to driver successfully"
}
```

### POST `/api/territories/optimize`
**Purpose:** Optimize territory workload distribution  
**Request Body:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "recommendations": [
    {
      "action": "rebalance",
      "fromTerritory": "TER-001",
      "toTerritory": "TER-002",
      "reason": "Territory TER-001 is overloaded at 95% capacity",
      "affectedPostalCodes": ["110003", "110004"]
    }
  ],
  "message": "Territory optimization suggestions generated"
}
```

### GET `/api/territories/:id/workload`
**Purpose:** Get territory workload distribution  
**Path Parameters:**
- `:id` - Territory ID

**Response:**
```json
{
  "success": true,
  "workload": {
    "territoryId": "TER-001",
    "date": "2024-01-18T00:00:00Z",
    "hourlyBreakdown": [
      {"hour": 0, "deliveries": 0, "utilization": 0},
      {"hour": 6, "deliveries": 3, "utilization": 6},
      {"hour": 9, "deliveries": 12, "utilization": 26},
      {"hour": 12, "deliveries": 18, "utilization": 40},
      {"hour": 15, "deliveries": 15, "utilization": 33},
      {"hour": 18, "deliveries": 8, "utilization": 18},
      {"hour": 21, "deliveries": 3, "utilization": 6},
      {"hour": 24, "deliveries": 0, "utilization": 0}
    ],
    "peakHours": [12, 15],
    "averageUtilization": 41,
    "capacity": 45,
    "recommendations": [
      "Peak demand at 12-15h, ensure driver availability",
      "Consider extending hours 9-18h for better distribution"
    ]
  }
}
```

---

## ✅ Status Codes

- **200**: Success
- **400**: Bad Request (missing/invalid parameters)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found (resource doesn't exist)
- **500**: Server Error

---

## 📝 Error Response Format

All errors follow this format:

```json
{
  "error": "Error message",
  "message": "Detailed error description (optional)",
  "details": "Additional context (optional)"
}
```

---

## 🧪 Quick Test Commands

Test GPS Tracking endpoint:
```bash
curl -X GET http://localhost:5000/api/shipments/tracking \
  -H "Authorization: Bearer your-token"
```

Test Route Optimization endpoint:
```bash
curl -X POST http://localhost:5000/api/routes/optimize \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "Warehouse, Mumbai",
    "shipmentIds": ["SHP001", "SHP002"],
    "vehicleType": "van",
    "priority": "fastest"
  }'
```

---

## 🚀 Next Steps

1. **Frontend Integration:** Update API calls in feature pages to use actual endpoints
2. **Real Database:** Replace mock data with MongoDB queries
3. **Chart.js Integration:** Add real visualization for analytics charts
4. **File Upload:** Configure AWS S3 or Azure Blob for photo/signature storage
5. **WebSocket Setup:** Add real-time location updates for drivers
6. **Production Deployment:** Move to production server with proper SSL certificates

---

*Last Updated: January 18, 2024*  
*Version: 1.0 (Beta)*

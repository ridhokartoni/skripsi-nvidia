# Payment API Documentation

## Payment Status Management

### Status Codes
- `0` - **PENDING** (Menunggu Konfirmasi Admin)
- `1` - **APPROVED** (Disetujui)
- `2` - **REJECTED** (Ditolak)

### Endpoints

#### 1. Get All Payments (Admin Only)
```
GET /api/v1/payment
Headers: Authorization: Bearer {admin_token}
```

Response:
```json
{
  "data": [
    {
      "id": 1,
      "paketId": 1,
      "status": 0,
      "harga": 500000,
      "userId": 3,
      "tujuanPenelitian": "Research Purpose",
      "rejectionReason": null,
      "createdAt": "2025-08-07T12:00:00.000Z",
      "updatedAt": "2025-08-07T12:00:00.000Z",
      "user": {...},
      "paket": {...}
    }
  ],
  "meta": {
    "code": 200,
    "message": "Berhasil mengambil semua pembayaran"
  }
}
```

#### 2. Approve Payment (Admin Only)
```
PATCH /api/v1/payment/{paymentId}
Headers: Authorization: Bearer {admin_token}
Body:
{
  "status": 1
}
```

Response:
```json
{
  "data": {
    "id": 1,
    "status": 1,
    "rejectionReason": null,
    ...
  },
  "meta": {
    "code": 201,
    "message": "Pembayaran berhasil disetujui"
  }
}
```

#### 3. Reject Payment (Admin Only)
```
PATCH /api/v1/payment/{paymentId}
Headers: Authorization: Bearer {admin_token}
Body:
{
  "status": 2,
  "rejectionReason": "Bukti pembayaran tidak valid atau tidak sesuai dengan jumlah yang harus dibayar"
}
```

Response:
```json
{
  "data": {
    "id": 1,
    "status": 2,
    "rejectionReason": "Bukti pembayaran tidak valid atau tidak sesuai dengan jumlah yang harus dibayar",
    ...
  },
  "meta": {
    "code": 201,
    "message": "Pembayaran berhasil ditolak"
  }
}
```

#### 4. Get User's Payments
```
GET /api/v1/payment/mypayments
Headers: Authorization: Bearer {user_token}
```

Response shows all payments for the logged-in user with their status and rejection reason if applicable.

### Frontend Display Recommendations

#### For Admin Dashboard:
1. Show payment list with status badges:
   - 🟡 Yellow/Orange for PENDING (0)
   - ✅ Green for APPROVED (1)  
   - ❌ Red for REJECTED (2)

2. Action buttons for each payment:
   - "Approve" button (sets status to 1)
   - "Reject" button (sets status to 2, opens modal for rejection reason)
   - "View Details" button

3. Filter options:
   - All Payments
   - Pending Only
   - Approved Only
   - Rejected Only

#### For User Dashboard:
1. Payment history with clear status indicators
2. If rejected, show the rejection reason
3. Allow resubmission for rejected payments

### Example Rejection Reasons:
- "Bukti pembayaran tidak valid"
- "Jumlah pembayaran tidak sesuai"
- "Bukti pembayaran tidak terbaca/blur"
- "Pembayaran belum diterima di rekening"
- "Data pembayaran tidak lengkap"

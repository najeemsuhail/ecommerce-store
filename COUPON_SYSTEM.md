# Discount Coupon System Documentation

## Overview

The discount coupon system allows you to create and manage promotional codes for your e-commerce store. Customers can apply these coupons during checkout to receive discounts on their orders.

## Features

- **Flexible Discount Types**: Percentage-based or fixed amount discounts
- **Discount Caps**: Set maximum discount amounts for percentage-based coupons
- **Usage Limits**: Control total coupon usage and per-customer limits
- **Expiration Dates**: Set expiry dates for time-limited promotions
- **Minimum Order Requirements**: Require minimum order values for coupon eligibility
- **Product/Category Targeting**: Apply coupons to specific products or categories
- **Active/Inactive Status**: Easily enable or disable coupons
- **Usage Tracking**: Monitor how many times each coupon has been used

## Database Schema

### Coupon Model

```prisma
model Coupon {
  id                  String          @id @default(cuid())
  code                String          @unique
  description         String?
  discountType        String          @default("percentage")
  discountValue       Float
  maxDiscount         Float?
  minOrderValue       Float           @default(0)
  maxUses             Int?
  maxUsesPerCustomer  Int             @default(1)
  expiryDate          DateTime?
  isActive            Boolean         @default(true)
  applicableProducts  String[]
  applicableCategories String[]
  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt
  usages              CouponUsage[]
}
```

### CouponUsage Model

```prisma
model CouponUsage {
  id        String   @id @default(cuid())
  couponId  String
  userId    String?
  guestEmail String?
  orderId   String?
  discount  Float
  createdAt DateTime @default(now())
  coupon    Coupon   @relation(fields: [couponId], references: [id])
  user      User?    @relation(fields: [userId], references: [id])
}
```

## API Routes

### Validate Coupon

**POST** `/api/coupons/validate`

Validates a coupon code and calculates the discount.

**Request Body:**
```json
{
  "code": "SAVE10",
  "orderTotal": 100.00,
  "userId": "user123",
  "guestEmail": "customer@example.com",
  "productIds": ["prod1", "prod2"],
  "categoryIds": ["cat1", "cat2"]
}
```

**Response (Success):**
```json
{
  "valid": true,
  "message": "Coupon applied successfully",
  "discount": 10.00,
  "couponId": "coupon123"
}
```

**Response (Error):**
```json
{
  "valid": false,
  "message": "Coupon has expired"
}
```

### Get All Coupons (Admin)

**GET** `/api/coupons`

Retrieves all coupons with usage statistics.

**Response:**
```json
[
  {
    "id": "coupon123",
    "code": "SAVE10",
    "description": "10% off all products",
    "discountType": "percentage",
    "discountValue": 10,
    "maxDiscount": null,
    "minOrderValue": 0,
    "maxUses": 100,
    "maxUsesPerCustomer": 1,
    "expiryDate": "2026-12-31T23:59:59Z",
    "isActive": true,
    "createdAt": "2026-02-02T10:00:00Z",
    "_count": {
      "usages": 45
    }
  }
]
```

### Create Coupon (Admin)

**POST** `/api/coupons`

Creates a new coupon.

**Request Body:**
```json
{
  "code": "SAVE20",
  "description": "20% off sitewide",
  "discountType": "percentage",
  "discountValue": 20,
  "maxDiscount": null,
  "minOrderValue": 50,
  "maxUses": 200,
  "maxUsesPerCustomer": 1,
  "expiryDate": "2026-12-31",
  "isActive": true,
  "applicableProducts": [],
  "applicableCategories": []
}
```

### Get Coupon by ID (Admin)

**GET** `/api/coupons/[id]`

Retrieves a specific coupon.

### Update Coupon (Admin)

**PUT** `/api/coupons/[id]`

Updates a coupon. Same request body as create.

### Delete Coupon (Admin)

**DELETE** `/api/coupons/[id]`

Deletes a coupon.

## UI Components

### CouponInput Component

A customer-facing component for applying coupon codes during checkout.

```tsx
import CouponInput from '@/components/CouponInput';

export default function CheckoutPage() {
  const handleCouponApplied = (discount, code, couponId) => {
    // Update order total with discount
  };

  return (
    <CouponInput
      orderTotal={100}
      onCouponApplied={handleCouponApplied}
      onError={(message) => console.error(message)}
    />
  );
}
```

**Props:**
- `orderTotal` (number, required): The current order total
- `onCouponApplied` (function, optional): Callback when coupon is applied
- `onError` (function, optional): Callback for error messages
- `disabled` (boolean, optional): Disable the input
- `appliedCode` (string, optional): Show applied coupon info

### CouponManager Component

An admin-facing component for managing coupons.

```tsx
import CouponManager from '@/components/CouponManager';

export default function AdminCouponsPage() {
  return <CouponManager />;
}
```

## Usage Examples

### Example 1: Simple Percentage Discount

```json
{
  "code": "SUMMER20",
  "description": "20% off summer sale",
  "discountType": "percentage",
  "discountValue": 20,
  "minOrderValue": 0,
  "isActive": true
}
```

**Effect:** Customers get 20% off any order.

### Example 2: Fixed Amount with Minimum Order

```json
{
  "code": "WELCOME10",
  "description": "$10 off first order",
  "discountType": "fixed",
  "discountValue": 10,
  "minOrderValue": 50,
  "maxUsesPerCustomer": 1,
  "isActive": true
}
```

**Effect:** Customers get $10 off orders over $50, but can only use once.

### Example 3: Capped Percentage Discount

```json
{
  "code": "LOYALTY50",
  "description": "50% off up to $50",
  "discountType": "percentage",
  "discountValue": 50,
  "maxDiscount": 50,
  "minOrderValue": 100,
  "isActive": true
}
```

**Effect:** On a $200 order, instead of $100 discount, max is $50.

### Example 4: Limited-Time Promotion

```json
{
  "code": "FLASH30",
  "description": "30% off flash sale",
  "discountType": "percentage",
  "discountValue": 30,
  "expiryDate": "2026-02-10",
  "maxUses": 500,
  "isActive": true
}
```

**Effect:** Only valid until Feb 10, 2026, with max 500 total uses.

## Implementation in Checkout

Here's how to integrate the coupon system into your checkout flow:

```tsx
'use client';

import { useState } from 'react';
import CouponInput from '@/components/CouponInput';

export default function CheckoutPage() {
  const [orderTotal, setOrderTotal] = useState(100);
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState('');
  const [appliedCouponId, setAppliedCouponId] = useState('');

  const handleCouponApplied = (
    discountAmount: number,
    code: string,
    couponId: string
  ) => {
    setDiscount(discountAmount);
    setAppliedCode(code);
    setAppliedCouponId(couponId);
  };

  const finalTotal = Math.max(0, orderTotal - discount);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Order Summary</h2>

        <div className="space-y-2 border-b pb-4 mb-4">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${orderTotal.toFixed(2)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount ({appliedCode}):</span>
              <span>-${discount.toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="flex justify-between text-xl font-bold mb-6">
          <span>Total:</span>
          <span>${finalTotal.toFixed(2)}</span>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-3">Apply Discount Code</h3>
          <CouponInput
            orderTotal={orderTotal}
            onCouponApplied={handleCouponApplied}
            appliedCode={appliedCode}
          />
        </div>

        {appliedCouponId && (
          <button
            onClick={() => {
              // Save to cart/order context
            }}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold"
          >
            Continue to Payment
          </button>
        )}
      </div>
    </div>
  );
}
```

## Best Practices

1. **Code Naming**: Use clear, memorable codes (e.g., SAVE20, WELCOME10)
2. **Descriptions**: Always add descriptions for admin reference
3. **Usage Limits**: Set reasonable limits to prevent abuse
4. **Minimum Orders**: Consider setting minimums to maintain profitability
5. **Expiration**: Use expiry dates for promotional campaigns
6. **Capping Discounts**: For percentage discounts, consider setting max discount caps
7. **Testing**: Always test coupons before going live
8. **Monitoring**: Regularly check usage statistics

## Security Considerations

- Coupon codes are case-insensitive (stored in uppercase)
- Validate on the server side, never trust client-side calculations
- Track per-customer usage to prevent abuse
- Set usage limits and expiry dates for promotional codes
- Consider rate limiting the validation endpoint
- Audit coupon usage regularly

## Future Enhancements

- Email coupon codes to customers
- Bulk coupon code generation
- Coupon analytics and reporting
- Seasonal campaigns with templates
- Referral coupon programs
- Integration with email marketing

## Troubleshooting

**Coupon not found**: Make sure the code is correct (case-insensitive)

**Coupon expired**: Check the expiry date

**Minimum order not met**: Increase order total or reduce minimum requirement

**Usage limit exceeded**: Check global and per-customer limits

**Not applicable to cart**: Verify product/category targeting

## Support

For issues or questions about the coupon system, please contact support.

import { prisma } from '@/lib/prisma';

export interface ValidateCouponInput {
  code: string;
  orderTotal: number;
  userId?: string;
  guestEmail?: string;
  productIds?: string[];
  categoryIds?: string[];
}

export interface CouponValidationResult {
  valid: boolean;
  message: string;
  discount?: number;
  couponId?: string;
}

/**
 * Validate and calculate discount for a coupon code
 */
export async function validateCoupon(
  input: ValidateCouponInput
): Promise<CouponValidationResult> {
  const {
    code,
    orderTotal,
    userId,
    guestEmail,
    productIds = [],
    categoryIds = [],
  } = input;

  try {
    // Find coupon by code
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
      include: {
        usages: {
          where: userId
            ? { userId }
            : guestEmail
              ? { guestEmail }
              : undefined,
        },
      },
    });

    if (!coupon) {
      return {
        valid: false,
        message: 'Coupon code not found',
      };
    }

    if (!coupon.isActive) {
      return {
        valid: false,
        message: 'Coupon is inactive',
      };
    }

    // Check expiry
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return {
        valid: false,
        message: 'Coupon has expired',
      };
    }

    // Check minimum order value
    if (orderTotal < coupon.minOrderValue) {
      return {
        valid: false,
        message: `Minimum order value of $${coupon.minOrderValue} required`,
      };
    }

    // Check max uses
    if (coupon.maxUses) {
      const totalUsages = await prisma.couponUsage.count({
        where: { couponId: coupon.id },
      });

      if (totalUsages >= coupon.maxUses) {
        return {
          valid: false,
          message: 'Coupon usage limit reached',
        };
      }
    }

    // Check per-customer limit
    const customerUsages = coupon.usages.length;
    if (customerUsages >= coupon.maxUsesPerCustomer) {
      return {
        valid: false,
        message: `You have already used this coupon ${coupon.maxUsesPerCustomer} time(s)`,
      };
    }

    // Check applicable products/categories
    if (coupon.applicableProducts.length > 0 && productIds.length > 0) {
      const hasValidProduct = productIds.some((id) =>
        coupon.applicableProducts.includes(id)
      );

      if (!hasValidProduct) {
        return {
          valid: false,
          message: 'Coupon is not applicable to items in your cart',
        };
      }
    }

    if (coupon.applicableCategories.length > 0 && categoryIds.length > 0) {
      const hasValidCategory = categoryIds.some((id) =>
        coupon.applicableCategories.includes(id)
      );

      if (!hasValidCategory) {
        return {
          valid: false,
          message: 'Coupon is not applicable to items in your cart',
        };
      }
    }

    // Calculate discount
    let discount = 0;

    if (coupon.discountType === 'percentage') {
      discount = (orderTotal * coupon.discountValue) / 100;

      // Apply max discount cap if set
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      // Fixed amount
      discount = coupon.discountValue;
    }

    // Don't discount more than the order total
    discount = Math.min(discount, orderTotal);

    return {
      valid: true,
      message: 'Coupon applied successfully',
      discount: parseFloat(discount.toFixed(2)),
      couponId: coupon.id,
    };
  } catch (error) {
    console.error('Error validating coupon:', error);
    return {
      valid: false,
      message: 'Error validating coupon',
    };
  }
}

/**
 * Record coupon usage
 */
export async function recordCouponUsage(
  couponId: string,
  discount: number,
  userId?: string,
  guestEmail?: string,
  orderId?: string
) {
  try {
    await prisma.couponUsage.create({
      data: {
        couponId,
        userId,
        guestEmail,
        orderId,
        discount,
      },
    });
  } catch (error) {
    console.error('Error recording coupon usage:', error);
    throw error;
  }
}

/**
 * Create a new coupon (admin function)
 */
export async function createCoupon(data: {
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscount?: number;
  minOrderValue?: number;
  maxUses?: number;
  maxUsesPerCustomer?: number;
  expiryDate?: Date;
  isActive?: boolean;
  applicableProducts?: string[];
  applicableCategories?: string[];
}) {
  try {
    const coupon = await prisma.coupon.create({
      data: {
        code: data.code.toUpperCase().trim(),
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        maxDiscount: data.maxDiscount,
        minOrderValue: data.minOrderValue || 0,
        maxUses: data.maxUses,
        maxUsesPerCustomer: data.maxUsesPerCustomer || 1,
        expiryDate: data.expiryDate,
        isActive: data.isActive !== false,
        applicableProducts: data.applicableProducts || [],
        applicableCategories: data.applicableCategories || [],
      },
    });

    return coupon;
  } catch (error) {
    console.error('Error creating coupon:', error);
    throw error;
  }
}

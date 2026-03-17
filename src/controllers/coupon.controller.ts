import type { Request, Response } from "express";
import pool from "../config/db.js";

export const validateCoupon = async (req: Request, res: Response) => {
  const { code, subtotal } = req.body;

  try {
    const couponResult = await pool.query(
      `SELECT * FROM coupons
       WHERE UPPER(code) = UPPER($1)
       AND is_active = true
       AND (expires_at IS NULL OR expires_at >= CURRENT_TIMESTAMP)`,
      [code],
    );

    if (couponResult.rows.length === 0) {
      return res.status(404).json({
        valid: false,
        message: "Invalid or expired coupon code",
      });
    }

    const coupon = couponResult.rows[0];

    if (coupon.min_order_value && subtotal < coupon.min_order_value) {
      return res.status(400).json({
        valid: false,
        message: `Minimum order amount of Rs ${coupon.min_order_value} required`,
      });
    }

    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return res.status(400).json({
        valid: false,
        message: "Coupon usage limit reached",
      });
    }

    let discountAmount = 0;
    if (coupon.discount_type === "percentage") {
      discountAmount = (subtotal * coupon.discount_value) / 100;

      if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
        discountAmount = coupon.max_discount_amount;
      }
    } else if (coupon.discount_type === "fixed") {
      discountAmount = coupon.discount_value;
    }

    return res.json({
      valid: true,
      coupon_id: coupon.id,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_amount: parseFloat(Number(discountAmount).toFixed(2)),
      message: "Coupon applied successfully",
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllCoupons = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM coupons WHERE is_active = true ORDER BY min_order_value ASC");
    return res.json(result.rows);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

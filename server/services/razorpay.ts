import crypto from 'crypto';

interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

interface RazorpayPayment {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

class RazorpayService {
  private keyId: string;
  private keySecret: string;
  private baseUrl = 'https://api.razorpay.com/v1';

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || '';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    
    if (!this.keyId || !this.keySecret) {
      console.warn('Razorpay credentials not provided. Payment functionality will be disabled.');
    }
  }

  private getAuthHeader(): string {
    return 'Basic ' + Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
  }

  async createOrder(amount: number, currency: string = 'INR', receipt: string): Promise<RazorpayOrder> {
    const orderData = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt,
      payment_capture: 1,
    };

    try {
      const response = await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Razorpay order creation failed: ${error.error?.description || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Razorpay order creation error:', error);
      throw error;
    }
  }

  async verifyPayment(payment: RazorpayPayment): Promise<boolean> {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = payment;
    
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === razorpay_signature;
  }

  async getPaymentDetails(paymentId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
        headers: {
          'Authorization': this.getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch payment details: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching payment details:', error);
      throw error;
    }
  }

  getKeyId(): string {
    return this.keyId;
  }
}

export const razorpayService = new RazorpayService();

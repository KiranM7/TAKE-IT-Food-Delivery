package com.takeit.service;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;

@Service
public class RazorpayService {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    public JSONObject createRazorpayOrder(
            long amountInPaise,
            String receipt) throws Exception {

        if (amountInPaise <= 0) {
            throw new IllegalArgumentException(
                    "Payment amount must be greater than zero.");
        }

        if (receipt == null || receipt.isBlank()) {
            throw new IllegalArgumentException(
                    "Receipt cannot be empty.");
        }

        RazorpayClient client =
                new RazorpayClient(keyId, keySecret);

        JSONObject request = new JSONObject();

        request.put("amount", amountInPaise);
        request.put("currency", "INR");
        request.put("receipt", receipt);

        Order razorpayOrder =
                client.orders.create(request);

        JSONObject response = new JSONObject();

        response.put(
                "razorpayOrderId",
                razorpayOrder.get("id").toString());

        response.put(
                "amount",
                ((Number) razorpayOrder.get("amount")).longValue());

        response.put(
                "currency",
                razorpayOrder.get("currency").toString());

        response.put("keyId", keyId);

        return response;
    }

    public boolean verifyPaymentSignature(
            String razorpayOrderId,
            String razorpayPaymentId,
            String razorpaySignature) throws Exception {

        if (razorpayOrderId == null
                || razorpayPaymentId == null
                || razorpaySignature == null
                || razorpayOrderId.isBlank()
                || razorpayPaymentId.isBlank()
                || razorpaySignature.isBlank()) {

            return false;
        }

        JSONObject paymentData = new JSONObject();

        paymentData.put(
                "razorpay_order_id",
                razorpayOrderId);

        paymentData.put(
                "razorpay_payment_id",
                razorpayPaymentId);

        paymentData.put(
                "razorpay_signature",
                razorpaySignature);

        return Utils.verifyPaymentSignature(
                paymentData,
                keySecret);
    }
    
    public boolean verifyCapturedPayment(
            String razorpayPaymentId,
            String expectedRazorpayOrderId,
            long expectedAmountInPaise) throws Exception {

        if (razorpayPaymentId == null
                || razorpayPaymentId.isBlank()
                || expectedRazorpayOrderId == null
                || expectedRazorpayOrderId.isBlank()
                || expectedAmountInPaise <= 0) {

            return false;
        }

        RazorpayClient client =
                new RazorpayClient(keyId, keySecret);

        // Fetch the actual payment details from Razorpay.
        com.razorpay.Payment payment =
                client.payments.fetch(razorpayPaymentId);

        // Verify that the payment belongs to the expected Razorpay order.
        String actualOrderId =
                payment.get("order_id").toString();

        if (!expectedRazorpayOrderId.equals(actualOrderId)) {
            return false;
        }

        // Verify the payment amount.
        long actualAmount =
                ((Number) payment.get("amount")).longValue();

        if (actualAmount != expectedAmountInPaise) {
            return false;
        }

        // Verify the currency.
        String currency = payment.get("currency").toString();

        if (!"INR".equals(currency)) {
            return false;
        }

        // Accept only successfully captured payments.
        String status = payment.get("status").toString();

        Object capturedValue = payment.get("captured");

        boolean captured = Boolean.TRUE.equals(capturedValue);

        return "captured".equalsIgnoreCase(status) && captured;
    }
}

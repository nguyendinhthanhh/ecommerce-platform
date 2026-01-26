package com.ecommerce.platform.controller;

import com.ecommerce.platform.entity.Payment;
import com.ecommerce.platform.service.serviceimpl.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("api/payment")
public class PaymentController {
    @Autowired
    PaymentService paymentService;

    @PostMapping("/vn_pay")
    public ResponseEntity<String> vnpay() {
        Payment payment = new Payment();
        payment.setAmount(new BigDecimal(1000000));
        payment.setContenPayment("Thanh Toán Thành Công");

        return ResponseEntity.ok(paymentService.paymentUrl(payment));

    }

    @GetMapping("/vn-pay-callback")
    public ResponseEntity<String> Callback() {
        if (paymentService.checkPayment()) {
            return ResponseEntity.ok("Payment successful");
        }

        return ResponseEntity.ok("Payment failed");


    }
}


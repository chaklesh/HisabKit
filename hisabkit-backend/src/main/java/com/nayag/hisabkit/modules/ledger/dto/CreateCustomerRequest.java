package com.nayag.hisabkit.modules.ledger.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateCustomerRequest {
    @NotBlank(message = "Name is required")
    private String name;

    private String phone;
    private String email;
    private String address;
    private String gstNumber;
}


package com.nayag.hisabkit.core.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.OffsetDateTime;
import java.util.Map;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiErrorResponse {
  OffsetDateTime timestamp;
  int status;
  String error;
  String message;
  String path;
  Map<String, String> validationErrors;
}

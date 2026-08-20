package com.disease.prediction.service;

import com.disease.prediction.dto.AuthResponse;
import com.disease.prediction.dto.LoginRequest;
import com.disease.prediction.dto.RegisterRequest;
import com.disease.prediction.dto.UserDto;

public interface AuthService {

    AuthResponse register(RegisterRequest registerRequest);

    AuthResponse login(LoginRequest loginRequest);

    UserDto getCurrentUser(String username);
}

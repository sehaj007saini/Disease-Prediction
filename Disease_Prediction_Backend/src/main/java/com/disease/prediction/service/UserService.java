package com.disease.prediction.service;

import com.disease.prediction.dto.UserDto;
import java.util.List;

public interface UserService {
    List<UserDto> getAllUsers();
    UserDto getUserById(Long id);
    UserDto updateUserRole(Long id, String role);
    UserDto updateUserStatus(Long id, boolean enabled);
    UserDto updateUserProfile(String username, String fullName, String email);
    void deleteUser(Long id);
}

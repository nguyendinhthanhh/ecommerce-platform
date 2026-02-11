package com.ecommerce.platform.controller;

import com.ecommerce.platform.dto.request.CreateRoleRequest;
import com.ecommerce.platform.dto.request.UpdateRoleRequest;
import com.ecommerce.platform.dto.response.ApiResponse;
import com.ecommerce.platform.dto.response.RoleResponse;
import com.ecommerce.platform.entity.Role;
import com.ecommerce.platform.service.RoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<RoleResponse>>> getAllRoles() {
        List<Role> roles = roleService.getAllRoles();
        List<RoleResponse> response = roles.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RoleResponse>> getRoleById(@PathVariable Long id) {
        Role role = roleService.getRoleById(id);
        return ResponseEntity.ok(ApiResponse.success(mapToResponse(role)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RoleResponse>> createRole(@Valid @RequestBody CreateRoleRequest request) {
        Role role = Role.builder()
                .name(request.getName().toUpperCase())
                .description(request.getDescription())
                .build();

        Role createdRole = roleService.createRole(role);

        return ResponseEntity.ok(ApiResponse.success(mapToResponse(createdRole)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RoleResponse>> updateRole(
            @PathVariable Long id,
            @RequestBody UpdateRoleRequest request) {
        Role updatedRole = roleService.updateRole(id, request.getDescription());
        return ResponseEntity.ok(ApiResponse.success(mapToResponse(updatedRole)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteRole(@PathVariable Long id) {
        roleService.deleteRole(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    private RoleResponse mapToResponse(Role role) {
        return RoleResponse.builder()
                .id(role.getId())
                .name(role.getName())
                .description(role.getDescription())
                .build();
    }
}

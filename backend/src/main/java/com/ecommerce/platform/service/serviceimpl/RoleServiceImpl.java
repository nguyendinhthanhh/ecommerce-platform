package com.ecommerce.platform.service.serviceimpl;

import com.ecommerce.platform.entity.Role;
import com.ecommerce.platform.repository.RoleRepository;
import com.ecommerce.platform.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.ecommerce.platform.exception.ResourceNotFoundException;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;

    @Override
    public Optional<Role> findByName(String name) {
        return roleRepository.findByName(name);
    }

    @Override
    public Role getRoleByName(String name) {
        return roleRepository.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + name));
    }

    @Override
    public Role getRoleById(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", id));
    }

    @Override
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    @Override
    public Role createRole(Role role) {
        if (roleRepository.findByName(role.getName()).isPresent()) {
            throw new com.ecommerce.platform.exception.BadRequestException("Role already exists: " + role.getName());
        }
        return roleRepository.save(role);
    }

    @Override
    public Role updateRole(Long id, String description) {
        Role role = getRoleById(id);

        if (description != null) {
            role.setDescription(description);
        }

        return roleRepository.save(role);
    }

    @Override
    public void deleteRole(Long id) {
        Role role = getRoleById(id);
        // Prevent deleting core roles
        if (List.of("ADMIN", "STAFF", "CUSTOMER").contains(role.getName())) {
            throw new com.ecommerce.platform.exception.BadRequestException(
                    "Cannot delete system role: " + role.getName());
        }
        roleRepository.delete(role);
    }

}

package com.ecommerce.platform.service;

import com.ecommerce.platform.entity.Role;
import java.util.Optional;
import java.util.List;
import java.util.Set;

public interface RoleService {
    Optional<Role> findByName(String name);

    Role getRoleByName(String name);

    Role getRoleById(Long id);

    List<Role> getAllRoles();

    Role createRole(Role role);

    Role updateRole(Long id, String description);

    void deleteRole(Long id);
}

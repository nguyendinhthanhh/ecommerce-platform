import axiosClient from "./api";

const roleService = {
    getAllRoles: async () => {
        const response = await axiosClient.get("/roles");
        return response.data;
    },

    getRoleById: async (id) => {
        const response = await axiosClient.get(`/roles/${id}`);
        return response.data;
    },

    createRole: async (roleData) => {
        const response = await axiosClient.post("/roles", roleData);
        return response.data;
    },

    updateRole: async (id, roleData) => {
        const response = await axiosClient.put(`/roles/${id}`, roleData);
        return response.data;
    },

    deleteRole: async (id) => {
        const response = await axiosClient.delete(`/roles/${id}`);
        return response.data;
    },


};

export default roleService;

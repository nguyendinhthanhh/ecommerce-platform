import api from "./api";

const ekycService = {
  verify: async (ekycVerifyRequest) => {
    try {
      // The parameter needs to be a FormData object
      const response = await api.post("/ekyc/verify", ekycVerifyRequest, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default ekycService;

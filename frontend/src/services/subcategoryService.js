import api from './api';

/**
 * SubCategory service
 */
export const subcategoryService = {
  getSubCategories: async (categoryId = null) => {
    const params = categoryId ? `?categoryId=${categoryId}` : '';
    const response = await api.get(`/subcategories${params}`);
    return response.data;
  },

  getSubCategory: async (id) => {
    const response = await api.get(`/subcategories/${id}`);
    return response.data;
  },

  createSubCategory: async (subCategoryData) => {
    const response = await api.post('/subcategories', subCategoryData);
    return response.data;
  },

  updateSubCategory: async (id, subCategoryData) => {
    const response = await api.put(`/subcategories/${id}`, subCategoryData);
    return response.data;
  },

  deleteSubCategory: async (id) => {
    const response = await api.delete(`/subcategories/${id}`);
    return response.data;
  }
};


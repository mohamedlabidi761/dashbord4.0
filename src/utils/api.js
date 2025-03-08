import axios from 'axios';

// Set the base URL for all API requests
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Machine API services
export const machineService = {
  // Get all machines
  getAllMachines: async () => {
    try {
      const response = await api.get('/machines');
      return response.data;
    } catch (error) {
      console.error('Error fetching machines:', error);
      throw error;
    }
  },

  // Get a single machine by ID
  getMachine: async (id) => {
    try {
      const response = await api.get(`/machines/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching machine ${id}:`, error);
      throw error;
    }
  },

  // Create a new machine
  createMachine: async (machineData) => {
    try {
      const response = await api.post('/machines', machineData);
      return response.data;
    } catch (error) {
      console.error('Error creating machine:', error);
      throw error;
    }
  },

  // Update a machine
  updateMachine: async (id, machineData) => {
    try {
      const response = await api.put(`/machines/${id}`, machineData);
      return response.data;
    } catch (error) {
      console.error(`Error updating machine ${id}:`, error);
      throw error;
    }
  },

  // Delete a machine
  deleteMachine: async (id) => {
    try {
      const response = await api.delete(`/machines/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting machine ${id}:`, error);
      throw error;
    }
  }
};

// Worker API services
export const workerService = {
  // Get all workers
  getAllWorkers: async () => {
    try {
      const response = await api.get('/workers');
      return response.data;
    } catch (error) {
      console.error('Error fetching workers:', error);
      throw error;
    }
  },

  // Get a single worker by ID
  getWorker: async (id) => {
    try {
      const response = await api.get(`/workers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching worker ${id}:`, error);
      throw error;
    }
  },

  // Create a new worker
  createWorker: async (workerData) => {
    try {
      const response = await api.post('/workers', workerData);
      return response.data;
    } catch (error) {
      console.error('Error creating worker:', error);
      throw error;
    }
  },

  // Update a worker
  updateWorker: async (id, workerData) => {
    try {
      const response = await api.put(`/workers/${id}`, workerData);
      return response.data;
    } catch (error) {
      console.error(`Error updating worker ${id}:`, error);
      throw error;
    }
  },

  // Delete a worker
  deleteWorker: async (id) => {
    try {
      const response = await api.delete(`/workers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting worker ${id}:`, error);
      throw error;
    }
  }
};

export default {
  machineService,
  workerService
}; 
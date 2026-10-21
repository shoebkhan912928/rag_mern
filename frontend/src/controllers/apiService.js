import axios from 'axios';

const API_BASE_URL = "http://localhost:8000";

export const fetchFilesApi = async () => {
  const res = await axios.get(`${API_BASE_URL}/files`);
  return res.data.files;
};

export const uploadFilesApi = async (formData) => {
  const res = await axios.post(`${API_BASE_URL}/files/upload`, formData);
  return res.data;
};

export const sendQueryApi = async (queryData) => {
  // Root URL '/' par JSON data bhej rahe hain
  const res = await axios.post(`${API_BASE_URL}/`, queryData);
  return res.data;
};
const API_URL = "http://localhost:3000/api";

const getToken = () => localStorage.getItem("token");

const getHeaders = (auth = false) => {
  const headers = { "Content-Type": "application/json" };
  if (auth) headers["Authorization"] = `Bearer ${getToken()}`;
  return headers;
};

const get = async (endpoint) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: getHeaders(true),
  });
  return await response.json();
};

const post = async (endpoint, data, auth = false) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: getHeaders(auth),
    body: JSON.stringify(data),
  });
  return await response.json();
};

export default { get, post };

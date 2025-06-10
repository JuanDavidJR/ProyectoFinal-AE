const saveToken = (token) => localStorage.setItem("token", token);
const getToken = () => localStorage.getItem("token");
const clearToken = () => localStorage.removeItem("token");
export default { saveToken, getToken, clearToken };

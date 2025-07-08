import axios from "axios";

export const apiClient = () => {
  const user = localStorage.getItem("user");
  const token = user ? JSON.parse(user).token : "";

  return axios.create({
    baseURL: "https://1q34qmastc.execute-api.us-east-1.amazonaws.com/dev",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

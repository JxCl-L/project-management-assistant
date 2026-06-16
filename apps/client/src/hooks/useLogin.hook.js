// import { useMutation } from "@tanstack/react-query";
// import Cookies from "js-cookie";

// const loginUser = async (user) => {
//   const response = await fetch(`${import.meta.env.VITE_API_URL}auth/login`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(user),
//   });
//   if (!response.ok) {
//     throw new Error("Network response was not ok");
//   }
//     return await response.json();

// };

// export function useLogin() {
//     return useMutation({
//         mutationFn: loginUser,
//         onSuccess: (response) => {
//             Cookies.set("token", response.data.accessToken, { expires: 7 });
//             Cookies.set("user", JSON.stringify({
//                 firstName: response.data.firstName,
//                 lastName: response.data.lastName,
//                 email: response.data.email,
//             }), { expires: 7 });
//             console.log("User logged in successfully:", response);
//         },
//         onError: (error) => {
//             console.error("Error authenticating user:", error);
//         },
//     });
// }

import { useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";

const loginUser = async (user) => {
  // const apiUrl = import.meta.env.VITE_API_URL;
  // console.log("📤 Sending login request:", user.email); // Don't log password
  
  const response = await fetch(`${import.meta.env.VITE_API_URL}auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });
  
  // console.log("📥 Response status:", response.status);
  // console.log("📥 Response ok:", response.ok);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("❌ Error response:", errorData);
    throw new Error(errorData.message || "Network response was not ok");
  }
  
  const data = await response.json();
  return data;
};

export function useLogin() {
    return useMutation({
        mutationFn: loginUser,
        onSuccess: (response) => {
            // Handle both response formats
            const userData = response.data || response;
            
            Cookies.set("token", userData.accessToken, { expires: 7 });
            Cookies.set("user", JSON.stringify({
                _id: userData._id,
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
            }), { expires: 7 });
            
            console.log("✅ User logged in successfully");
        },
        onError: (error) => {
            console.error("❌ Error authenticating user:", error);
        },
    });
}

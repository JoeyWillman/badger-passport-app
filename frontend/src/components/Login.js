import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import React, { useState } from "react"; 

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Logged in – you can redirect to main app page
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Log In</button>
    </div>
  );
}
export default Login;

import { useState } from "react";
import { account, databases, DATABASE_ID } from "./appwrite";

function Auth({ setUser }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");

    const [isRegistering, setIsRegistering] = useState(false);

    const register = async () => {
        try {
            // 1. Create the Auth account (Secure/Encrypted)
            const user = await account.create("unique()", email, password, name);

            // 2. Save to Database (Visible to you in the 'users' collection)
            await databases.createDocument(
                DATABASE_ID,
                "users", // or USERS_COLLECTION_ID if you updated appwrite.js
                "unique()",
                {
                    email: email,
                    name: name,
                    password: password // This will be visible in the database tab
                }
            );

            alert("Registered successfully! Password saved to database.");
            setIsRegistering(false);
        } catch (error) {
            alert("Registration failed: " + error.message);
        }
    };

    const login = async () => {
        try {
            await account.createEmailPasswordSession(email, password);
            localStorage.setItem("hasSession", "true");
            const user = await account.get();
            setUser(user);
        } catch (error) {
            if (error.message.includes("session is active") || error.code === 401 || error.code === 400) {
                try {
                    const user = await account.get();
                    localStorage.setItem("hasSession", "true");
                    setUser(user);
                } catch (getErr) {
                    alert("Login failed: " + error.message);
                }
            } else {
                alert("Login failed: " + error.message);
            }
        }
    };

    return (
        <div className="card">
            <h2>{isRegistering ? "Create Account" : "Login"}</h2>
            <div className="auth-form">
                {isRegistering && (
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                )}

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />

                {isRegistering ? (
                    <button className="primary-btn submit-btn" onClick={register}>Register</button>
                ) : (
                    <button className="primary-btn submit-btn" onClick={login}>Login</button>
                )}

                <p style={{ textAlign: 'center', marginTop: '15px', color: 'var(--text-muted)' }}>
                    {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
                    <span
                        style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }}
                        onClick={() => setIsRegistering(!isRegistering)}
                    >
                        {isRegistering ? "Login here" : "Register here"}
                    </span>
                </p>
            </div>
        </div>
    );
}

export default Auth;

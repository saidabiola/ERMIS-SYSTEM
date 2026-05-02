import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Login({ setRole }){ 
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    // fake Users (Simulate database)
    const users = [
        { email: "admin@ermis.com", password: "1234", role: "ADMIN" },
        { email: "records@ermis.com", password: "1234", role: "RECORDS OFFICER" },
        { email: "supervisor@ermis.com", password: "1234", role: "SUPERVISOR" },
        { email: "ict@ermis.com", password: "1234", role: "ICT OFFICER" },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();

        // Handle form submission logic here
        const foundUser = users.find(
            (user) => user.email === email && user.password === password
        );

        if (foundUser) {
            setRole(foundUser.role);
            navigate("/Dashboard");
        } else {
            alert("Innvalid Credentials");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-blue-100">

            <div className="bg-white p-8 rounded-2x1 shadow-lg w-96">
                <h2 className="text-2xl font-bold text-center mb-6">ERMIS Login</h2>

                <form onSubmit = {handleSubmit}>
                    <input 
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full mb-4 p-2 border rounded-lg"
                    />
                    <input 
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full mb-12 p-2 border rounded-lg"
                    />
                    <button 
                        type="submit"
                        className="w-full bg-blue-600 text-white p-3 rounded-lg"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Login;
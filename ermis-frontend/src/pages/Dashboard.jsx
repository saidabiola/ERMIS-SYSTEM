import { useNavigate } from "react-router-dom";

function Dashboard({ role, setRole}){
    const navigate = useNavigate();
    return (
        <div className="min-h-screen flex items-center justify-center bg-blue-100">

            <div className="bg-white p-8 rounded-2x1 shadow-lg w-[500px]">
                <h2 className="text-2xl font-bold mb-4">ERMIS Dashboard</h2>
                <p className="mb-6 text-green-600">Logged in as: {role}</p>

                {role === "ADMIN" && <p>Admin Panel</p>}
                {role === "RECORDS OFFICER" && (
                    <div>
                        <h3 className = "semi-bold">Records Officer Panel</h3>
                        <p>Upload and search exam records</p>

                        <button onClick = {() => navigate("/records")}
                            className = "mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                            >
                            View Records

                        </button>
                    </div>)}
                {role === "SUPERVISOR" && <p>Supervisor Panel</p>}
                {role === "ICT OFFICER" && <p>ICT Officer Panel</p>}

                <button 
                    onClick = {() => setRole("")}
                    className = "mt-6 bg-red-500 text-white px-4 py-2 rounded">
                    Logout
                </button>
            </div>
        </div>
    )
}

export default Dashboard;
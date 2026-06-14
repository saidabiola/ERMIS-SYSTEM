import { useNavigate } from "react-router-dom";


export default function UnauthorizedPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
            <div className="text-center">
                <div className="text-6xl font-bold text-indigo-500 mb-4">403</div>
                <h1 className="text-xl font-medium text-slate-200 mb-2">
                    Access Denied
                </h1>
                <p>You don't have permission to view this page.</p>

                <button onClick={() => {
                    localStorage.removeItem('token');
                    navigate('/');
                }}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo:500
                            text-white text-sm font-medium rounded-lg transition"
                >
                    Back to login

                </button>
            </div>
        </div>
    );
}
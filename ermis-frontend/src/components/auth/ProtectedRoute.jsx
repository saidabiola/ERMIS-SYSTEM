import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
    
    //get token from local storage
    const token = localStorage.getItem('token');

    //if no token at all (not logged in), send to login page
    
    if (!token) {
        return <Navigate to = "/" replace />;
    }

    //decode the token payload (middle part) to read the role

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));

        //check if token has expired
        
        const isExpired = payload.exp * 1000 < new Date().getTime();
        if (isExpired) {
            localStorage.removeItem('token');
            return <Navigate to = "/" replace />;
        }

        //check if users role is allowed for this route
        if (allowedRoles && !allowedRoles.includes(payload.role)) {
            return <Navigate to = "/unauthorized" replace />;
        }

        //all checks passed (render the page)
        return children;

    } catch (_) {
        
        //token is malformed/tampered - clear it and send to login
        localStorage.removeItem('token');
        return <Navigate to = "/" replace />;
    }
}
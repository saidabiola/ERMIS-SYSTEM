import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Records from "./pages/Records";



function App(){
  const [role, setRole] = useState("");
  
  return (
    <Routes>
      <Route path = "/" element = {<Login setRole = {setRole} />} />
      
      <Route
        path = "/Dashboard"
        element = {
        role ? (
          <Dashboard role = {role} setRole = {setRole} />
        ) : (
          <Navigate to = "/" />
        )
      }
      />

      <Route
        path ="/records"
        element = {
          role === "RECORDS OFFICER" ? <Records /> : <Navigate to = "/" />
        }
        />
    </Routes>
  );
}

export default App;






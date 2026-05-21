import { useEffect, useState } from "react";
import RecordsTable from "../components/records/RecordsTable";
import { data } from "react-router-dom";

function Records() {
    const [nameOfSchool, setNameOfSchool] = useState("");
    const [schoolCode, setSchoolCode] = useState("");
    const [yearOfGraduation, setYearOfGraduation] = useState("");
    const [records, setRecords] = useState([]);
      
    useEffect(() => {
        fetch("http://localhost:5000/records")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)){
                setRecords(data);
                } else {
                    console.error("Expected an array but got:", data);
                    setRecords([]);
                } 
            })
            .catch(err => {
                console.log(err);
                setRecords([]);
            });
    }, []);
    const [searchTerm, setSearchTerm] = useState("");
    const [file, setFile] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!nameOfSchool || !schoolCode || !yearOfGraduation){
            alert("All fields are required")
            return;
        }
        const formData = new FormData();
        formData.append("nameOfSchool", nameOfSchool);
        formData.append("schoolCode", schoolCode);
        formData.append("yearOfGraduation", Number(yearOfGraduation));
        if (file) {
            formData.append("file", file);
        }
        
        

        try {
            const response = await fetch ("http://localhost:5000/records", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();

            if (!response.ok){
                console.log(alert("Server error", data))
                return;
            }
            
            // update UI with new save Record
            setRecords(prev => [...prev,data]);
            
            // clear form fields (input)
            setNameOfSchool("");
            setSchoolCode("");
            setYearOfGraduation("");
            setFile(null);
        } catch (error) {
            console.log("Error saving record:", error);
        }

       
    };

    const filteredRecords = records.filter((record) => {
        return (
            String(record.nameOfSchool || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
            String(record.schoolCode).includes(searchTerm) ||
            String(record.yearOfGraduation).includes(searchTerm)
            );
    });

    return (
        <div className = "min-h-screen bg-blue-100 p-6">
            <h2 className="text-2xl font-bold mb-6 mx-auto">Records Management</h2>
         
            { /*Form to add new record */ }

            <form onSubmit = {handleSubmit} className = "bg-white p-6 rounded-xl shadow-md max-w-md mx-auto">
                <input 
                type="text"
                placeholder = "School Name"
                value = {nameOfSchool}
                className = "w-full mb-4 p-3 border rounded-lg"
                onChange = {(e) => setNameOfSchool(e.target.value)}
                />

                <input 
                type="text"
                placeholder = "School Code"
                value = {schoolCode}
                className = "w-full mb-4 p-3 border rounded-lg"
                onChange = {(e) => setSchoolCode(e.target.value)}
                />

                

                <input 
                type = "number"
                placeholder = "Year of graduation"
                value = {yearOfGraduation}
                className = "w-full mb-4 p-3 border rounded-lg"
                onChange = {(e) => setYearOfGraduation(e.target.value)}
                />

                <input 
                type = "file"
                onChange = {(e) => setFile(e.target.files[0])}
                className = "w-full mb-4 p-2 border rounded-lg"
                />

                <button type = "submit" className = "bg-blue-600 text-white px-4 py-2 rounded">
                    Save Record
                </button>
            </form>


                <input 
                type = "text"
                placeholder = "Search by School, School Code, or year of graduation..."
                value = {searchTerm}
                onChange = {(e) => setSearchTerm(e.target.value)}
                className = "w-full mb-4 p-3 border rounded-lg max-w-md"
                />
            {/* List of records */}

            <div>
                <RecordsTable
                    records={filteredRecords}
                    onDelete={async (id) => {
                        const res = await fetch(`http://localhost:5000/records/${id}`, {
                            method: "DELETE"
                        });

                        if (res.ok){
                            setRecords(prev => prev.filter(r => r._id !== id))
                        }
                    }}

                    onEdit={(record) => {
                        const newName = prompt("Please enter a new name:" , record.nameOfSchool);

                        if (newName) {
                            fetch(`http://localhost:5000/records/${record._id}`, {
                                method: "PUT",
                                headers: {
                                    "content-type": "application/json"
                                },
                                body: JSON.stringify({nameOfSchool: newName})
                            })

                            .then(res => res.json())
                            .then(updated => {
                                setRecords(prev =>
                                    prev.map(r => r._id === updated._id ? updated: r)
                                );
                            });
                        }
                    }}
                />
            </div>

                        
                    
                    
                    
                     
                       
                    
                
                
            </div>
        
    )
};

export default Records
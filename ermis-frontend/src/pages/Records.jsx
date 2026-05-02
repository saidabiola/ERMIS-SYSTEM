import { useEffect, useState } from "react";


function Records() {
    const [studentName, setStudentName] = useState("");
    const [studentIndexNumber, setStudentIndexNumber] = useState("");
    const [yearOfGraduation, setYearOfGraduation] = useState("");
    const [records, setRecords] = useState([]);
      
    useEffect(() => {
        fetch("http://localhost:5000/records")
            .then(res => res.json())
            .then(data => setRecords(data))
            .catch(err => console.log(err));
    }, []);
    const [searchTerm, setSearchTerm] = useState("");
    const [file, setFile] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("studentName", studentName);
        formData.append("studentIndexNumber", studentIndexNumber);
        formData.append("yearOfGraduation", yearOfGraduation);
        if (file) {
            formData.append("file", file);
        }
        
        {
            studentName,
            studentIndexNumber,
            yearOfGraduation,
            file
        };

        try {
            const response = await fetch ("http://localhost:5000/records", {
                method: "POST",
                body: formData
            });
            const data = await response.json();

            // update UI with new save Record
            setRecords([...records, data]);

             // clear form fields (input)
            setStudentName("");
            setStudentIndexNumber("");
            setYearOfGraduation("");
            setFile(null);
        } catch (error) {
            console.log("Error saving record:", error);
        }

       
    };

    const filteredRecords = records.filter((record) => {
        return (
            String(record.studentName?.toLowerCase()).includes(searchTerm.toLowerCase()) || 
            String(record.studentIndexNumber).includes(searchTerm) ||
            String(record.yearOfGraduation).includes(searchTerm)
            );
    });

    return (
        <div className = "min-h-screen bg-blue-100 p-6">
            <h2 className="text-2xl font-bold mb-6">Records Management</h2>
         
            { /*Form to add new record */ }

            <form onSubmit = {handleSubmit} className = "bg-white p-6 rounded-xl shadow-md max-w-md">
                <input 
                type="text"
                placeholder = "student Name"
                value = {studentName}
                className = "w-full mb-4 p-3 border rounded-lg"
                onChange = {(e) => setStudentName(e.target.value)}
                />

                <input 
                type="text"
                placeholder = "Index Number"
                value = {studentIndexNumber}
                className = "w-full mb-4 p-3 border rounded-lg"
                onChange = {(e) => setStudentIndexNumber(e.target.value)}
                />

                

                <input 
                type = "text"
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
                placeholder = "Search by name, Index number, or year of graduation..."
                value = {searchTerm}
                onChange = {(e) => setSearchTerm(e.target.value)}
                className = "w-full mb-4 p-3 border rounded-lg mx-w-md"
                />
            {/* List of records */}

            <div>
                <h3 className = "text-xl font-semibold mb-4">Saved Records</h3>

                {records.length === 0 ? (
                    <p>No Records yet</p>
                ) : filteredRecords.length === 0 ? (
                    <p>No records match your search</p>
                ) : (

                    filteredRecords.map((record) => (
                        <div key = {record._id} className = "bg-white p-4 rounded-lg shadow mb-4">
                            <p><strong>Name:</strong> {record.studentName}</p>
                            <p><strong>Index Number:</strong> {record.studentIndexNumber}</p>
                            <p><strong>Year of Graduation:</strong> {record.yearOfGraduation}</p>
                            
                            {record.file && (
                            <a 
                                href = {`http://localhost:5000/uploads/${record.file}`}
                                target = "_blank"
                                rel = "noreferrer"
                                className = "text-blue-600 underline"
                            >
                            View file
                            
                            </a>
                        )}

                        <button 
                            onClick = {async () => {
                                await fetch(`http://localhost:5000/records/${record._id}`,{
                                     method: "DELETE"
                                });
                                   
                                setRecords(records.filter(r => r._id !== record._id));
                            }}
                            className = "bg-red-500 text-white px-3 py-1 rounded mt-2"
                        >
                            Delete
                        </button>

                        <button 
                            onClick = {() => {
                                const newName = prompt("Enter new name:", record.studentName);

                                if (newName) {
                                    fetch(`http://localhost:5000/records/${record._id}`,{
                                        method: "PUT",
                                        headers: {
                                            "Content-Type": "application/json"
                                        },
                                        body: JSON.stringify({studentName: newName })
                                    })
                                    .then(res => res.json())
                                    .then(updated => {
                                        setRecords(prevRecords => prevRecords.map(r => 
                                            r._id === updated._id ? updated : r
                                        )
                                    );
                                    });
                                }
                            }}
                            className = "bg-yellow-500 text-white px-3 py-1 rounded mt-2 ml-2"
                        >
                            Edit

                        </button>
                        </div>

                        
                    ))
                    
                    )}
                     
                       
                    
                
                
            </div>
        </div>
    )
};

export default Records
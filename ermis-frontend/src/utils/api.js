const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const authHeaders = () => ({
    'content-type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`
});

export const api = {

    get: async (path) => {
        const res = await fetch(`${BASE_URL}${path}`, {
            method: 'GET',
            headers: authHeaders()
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message);
        }
        return data;
    },

    post: async (path, body) => {
        const res = await fetch(`${BASE_URL}${path}`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(body)
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message);
        }
        return data;
    },
    
    put: async (path, body) => {
        const res = await fetch(`${BASE_URL}${path}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(body)
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message);
        }
        return data;
    },

    delete: async (path) => {
        const res = await fetch(`${BASE_URL}${path}`, {
            method: 'DELETE',
            headers: authHeaders()
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message);
        }
        return data;
    }
}

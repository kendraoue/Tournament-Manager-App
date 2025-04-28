async function fetchToken(credentials) {
    try {
        const response = await fetch('http://localhost:5000/auth/getToken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            let errorMsg = 'Unknown error';
            try {
                const errorData = await response.json();
                errorMsg = errorData.message || JSON.stringify(errorData);
            } catch (e) {
                errorMsg = response.statusText;
            }
            throw new Error(`Failed to fetch: ${errorMsg}`);
        }

        const data = await response.json();

        if (data.token) {
            return data.token;
        } else {
            console.error('Failed to obtain token: ', data);
            throw new Error('Token not found in response');
        }
    } catch (error) {
        console.error('Error fetching token:', error);
        throw error;
    }
} 
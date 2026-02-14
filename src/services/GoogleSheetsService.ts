
export const GoogleSheetsService = {
    // Key for storing the script URL in local storage
    SCRIPT_URL_KEY: 'rent_manager_script_url',

    getScriptUrl: () => {
        return localStorage.getItem(GoogleSheetsService.SCRIPT_URL_KEY) || '';
    },

    setScriptUrl: (url: string) => {
        localStorage.setItem(GoogleSheetsService.SCRIPT_URL_KEY, url);
    },

    /**
     * Sends payment data to the Google Sheet via the App Script URL
     */
    async appendRow(data: {
        billedDate: string;
        paidDate: string;
        tenantName: string;
        roomNo: string;
        rent: number;
        electricityUnits: number;
        electricityAmount: number;
        waterAmount: number;
        extraAmount: number;
        totalAmount: number;
        remarks: string;
    }) {
        const scriptUrl = this.getScriptUrl();
        if (!scriptUrl) {
            throw new Error('Google Sheet Script URL is not configured. Please set it in settings.');
        }

        console.log('=== GOOGLE SHEETS DEBUG ===');
        console.log('Script URL:', scriptUrl);
        console.log('Data being sent:', data);

        try {
            // Try with cors mode first to see if we get a response
            console.log('Attempting request with cors mode...');
            const response = await fetch(scriptUrl, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                redirect: 'follow',
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);
            const text = await response.text();
            console.log('Response body:', text);

            return true;
        } catch (corsError) {
            console.warn('CORS mode failed, trying no-cors mode:', corsError);

            // Fallback to no-cors
            try {
                const response = await fetch(scriptUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'text/plain',
                    },
                    body: JSON.stringify(data),
                });

                console.log('No-cors request sent (response is opaque)');
                return true;
            } catch (error) {
                console.error('Both CORS and no-cors failed:', error);
                throw error;
            }
        }
    }
};

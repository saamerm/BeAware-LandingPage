// Handles communicating with the server.

import { CONFIG } from './config.js';

export async function postContact(formData) {
    const response = await fetch(`${CONFIG.API_BASE}AddContact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    });

    if (!response.ok) throw new Error("API POST Error");
    return response;
}

export async function getContacts(contactUid) {
    const response = await fetch(`${CONFIG.API_BASE}GetStreamContacts?streamName=${CONFIG.STREAM_NAME}&contactUid=${contactUid}`);
    
    if (!response.ok) throw new Error("API GET Error");
    return await response.json();
}
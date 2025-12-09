// The main controller that ties everything together.
import { CONFIG } from './config.js';
import { state, resetPolling } from './state.js';
import { uuidv4, showToast } from './utils.js';
import { postContact, getContacts } from './api.js';
import { showView, setLoading, fillForm, renderList, downloadVcfLogic } from './ui.js';

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    
    // EXPOSE FUNCTIONS TO WINDOW 
    // (Required because we are using Modules, but HTML onclick attributes expect globals)
    window.downloadVcf = downloadVcfLogic;
    window.editProfile = editProfileLogic;

    initApp();
});

function initApp() {
    const storedData = localStorage.getItem(CONFIG.STORAGE_KEY);
    const today = new Date().toLocaleDateString();

    if (storedData) {
        const parsedData = JSON.parse(storedData);
        state.currentUserUid = parsedData.contactUid; 

        if (parsedData.submissionDate === today) {
            showView('list');
            startPolling();
            return;
        } 
        
        // Old data -> Pre-fill form
        fillForm(parsedData);
    }

    showView('register');
}

// --- FORM HANDLER ---
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    setLoading(true);

    const finalUid = state.currentUserUid || uuidv4();

    const formData = {
        streamName: CONFIG.STREAM_NAME,
        contactUid: finalUid,
        contactName: document.getElementById('inpName').value.trim(),
        contactEmail: document.getElementById('inpEmail').value.trim(),
        contactPhone: document.getElementById('inpPhone').value.trim(),
        contactInstagram: document.getElementById('inpInsta').value.trim(),
        contactLinkedin: document.getElementById('inpLinkedin').value.trim(),
        contactTwitter: document.getElementById('inpTwitter').value.trim(),
        customField: document.getElementById('inpTitle').value.trim()
    };

    const storagePayload = { ...formData, submissionDate: new Date().toLocaleDateString() };
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(storagePayload));
    
    state.currentUserUid = finalUid;

    try {
        await postContact(formData);
        
        const btnText = document.getElementById('btnText').innerText;
        showToast(btnText.includes('Update') ? "Profile Updated" : "You're on the list!");
        
        showView('list');
        resetPolling();
        startPolling(); 
    } catch (err) {
        console.error(err);
        showToast("Connection failed. Retrying...");
    } finally {
        setLoading(false);
    }
});

// --- EDIT LOGIC ---
function editProfileLogic() {
    const storedData = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (storedData) {
        // Stop polling while editing
        if(state.pollingTimer) clearTimeout(state.pollingTimer);
        
        const parsedData = JSON.parse(storedData);
        fillForm(parsedData);
        showView('register');
    }
}

// --- POLLING ---
async function fetchAndRender() {
    const viewList = document.getElementById('view-list');
    
    // If list is hidden, stop processing
    if (!viewList.classList.contains('hidden') === false) return;

    try {
        const data = await getContacts(state.currentUserUid);
        const currentDataString = JSON.stringify(data);

        if (currentDataString !== state.lastDataString) {
            renderList(data);
            state.lastDataString = currentDataString;
            resetPolling();
        } else {
            // Back-off Logic
            state.consecutiveNoChange++;
            if (state.consecutiveNoChange >= 4 && state.pollingInterval < 10000) {
                state.pollingInterval = 10000;
            }
            else if (state.consecutiveNoChange >= 2 && state.pollingInterval < 5000) {
                state.pollingInterval = 5000;
            }
        }
    } catch (error) {
        console.error("Polling error", error);
    } finally {
        // Schedule next poll using the dynamic interval
        state.pollingTimer = setTimeout(fetchAndRender, state.pollingInterval);
    }
}

function startPolling() {
    if(state.pollingTimer) clearTimeout(state.pollingTimer);
    fetchAndRender();
}
// --- CONSTANTS & CONFIG ---
const API_BASE = "https://api.deafassistant.com/contact/";
const STREAM_NAME = "techtown";
const STORAGE_KEY = "cc_user_data";

// --- STATE MANAGEMENT ---
let pollingInterval = 2000;
let pollingTimer = null;
let consecutiveNoChange = 0;
let lastDataString = ""; 
let currentUserUid = null; 

// --- DOM ELEMENTS ---
const viewRegister = document.getElementById('view-register');
const viewList = document.getElementById('view-list');
const contactForm = document.getElementById('contactForm');
const btnSubmit = document.getElementById('btnSubmit');
const btnText = document.getElementById('btnText');
const btnLoader = document.getElementById('btnLoader');
const contactsContainer = document.getElementById('contacts-container');

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    const storedData = localStorage.getItem(STORAGE_KEY);
    const today = new Date().toLocaleDateString();

    if (storedData) {
        const parsedData = JSON.parse(storedData);
        currentUserUid = parsedData.contactUid; 

        // Condition A: Submitted today
        if (parsedData.submissionDate === today) {
            showView('list');
            startPolling();
            return;
        } 
        
        // Condition B: Old data -> Pre-fill form
        fillForm(parsedData);
    }

    // Default: Show Form
    showView('register');
}

function showView(viewName) {
    if (viewName === 'register') {
        viewRegister.classList.remove('hidden');
        viewList.classList.add('hidden');
        if(pollingTimer) clearTimeout(pollingTimer);
    } else {
        viewRegister.classList.add('hidden');
        viewList.classList.remove('hidden');
    }
}

function fillForm(data) {
    document.getElementById('inpName').value = data.contactName || '';
    document.getElementById('inpEmail').value = data.contactEmail || '';
    document.getElementById('inpPhone').value = data.contactPhone || '';
    document.getElementById('inpTitle').value = data.customField || '';
    document.getElementById('inpInsta').value = data.contactInstagram || '';
    document.getElementById('inpTwitter').value = data.contactTwitter || '';
    document.getElementById('inpLinkedin').value = data.contactLinkedin || '';
}

// --- FORM SUBMISSION ---
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    setLoading(true);

    const finalUid = currentUserUid || uuidv4();

    // Gather Data
    const formData = {
        streamName: STREAM_NAME,
        contactUid: finalUid,
        contactName: document.getElementById('inpName').value.trim(),
        contactEmail: document.getElementById('inpEmail').value.trim(),
        contactPhone: document.getElementById('inpPhone').value.trim(),
        contactInstagram: document.getElementById('inpInsta').value.trim(),
        contactLinkedin: document.getElementById('inpLinkedin').value.trim(),
        contactTwitter: document.getElementById('inpTwitter').value.trim(),
        customField: document.getElementById('inpTitle').value.trim()
    };

    // Store in LocalStorage
    const storagePayload = { ...formData, submissionDate: new Date().toLocaleDateString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storagePayload));
    
    currentUserUid = finalUid;

    try {
        const response = await fetch(`${API_BASE}AddContact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            showToast(btnText.innerText.includes('Update') ? "Profile Updated" : "You're on the list!");
            showView('list');
            startPolling();
            pollingInterval = 2000; 
        } else {
            throw new Error("API Error");
        }
    } catch (err) {
        console.error(err);
        showToast("Connection failed. Retrying...");
    } finally {
        setLoading(false);
    }
});

function setLoading(isLoading) {
    if (isLoading) {
        btnSubmit.disabled = true;
        btnText.classList.add('hidden');
        btnLoader.classList.remove('hidden');
        btnSubmit.classList.add('opacity-75', 'cursor-not-allowed');
    } else {
        btnSubmit.disabled = false;
        btnText.classList.remove('hidden');
        btnLoader.classList.add('hidden');
        btnSubmit.classList.remove('opacity-75', 'cursor-not-allowed');
    }
}

// --- EDIT LOGIC ---
window.editProfile = function() {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
        const parsedData = JSON.parse(storedData);
        fillForm(parsedData);
        btnText.innerText = "Update Profile";
        showView('register');
    }
};

// --- POLLING & LIST LOGIC ---
function startPolling() {
    fetchContacts();
}

async function fetchContacts() {
    if (!viewList.classList.contains('hidden') === false) return;

    try {
        const response = await fetch(`${API_BASE}GetStreamContacts?streamName=${STREAM_NAME}`);
        if (!response.ok) throw new Error("Fetch failed");
        
        const data = await response.json();
        const currentDataString = JSON.stringify(data);

        if (currentDataString !== lastDataString) {
            renderList(data);
            lastDataString = currentDataString;
            pollingInterval = 2000;
            consecutiveNoChange = 0;
        } else {
            consecutiveNoChange++;
            if (consecutiveNoChange >= 4 && pollingInterval < 10000) pollingInterval = 10000;
            else if (consecutiveNoChange >= 2 && pollingInterval < 5000) pollingInterval = 5000;
        }
    } catch (error) {
        console.error("Polling error", error);
    } finally {
        pollingTimer = setTimeout(fetchContacts, pollingInterval);
    }
}

function renderList(contacts) {
    contactsContainer.innerHTML = "";
    
    if (contacts.length === 0) {
        contactsContainer.innerHTML = `<div class="text-center text-slate-500 mt-10">No other attendees yet.<br>Be the first!</div>`;
        return;
    }

    contacts.forEach((person, index) => {
        const initials = getInitials(person.contactName);
        const title = person.customField || "";
        const isMe = person.contactUid === currentUserUid;
        const delay = index < 10 ? index * 50 : 0; 
        
        const liUrl = person.contactLinkedin ? `https://linkedin.com/in/${cleanHandle(person.contactLinkedin)}` : null;
        const twUrl = person.contactTwitter ? `https://twitter.com/${cleanHandle(person.contactTwitter)}` : null;
        const igUrl = person.contactInstagram ? `https://instagram.com/${cleanHandle(person.contactInstagram)}` : null;
        const emailUrl = person.contactEmail ? `mailto:${person.contactEmail}` : null;
        const phoneUrl = person.contactPhone ? `tel:${person.contactPhone}` : null;

        const card = document.createElement('div');
        card.className = `bg-slate-800/50 border ${isMe ? 'border-indigo-500/50 bg-indigo-900/10' : 'border-white/5'} rounded-xl p-4 transition-all duration-300 animate__animated animate__fadeInUp`;
        card.style.animationDelay = `${delay}ms`;

        let html = `
            <div class="flex items-start">
                <div class="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0 mt-1">
                    ${initials}
                </div>
                
                <div class="ml-4 flex-1 min-w-0">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="text-white font-bold text-lg leading-tight truncate">
                                ${escapeHtml(person.contactName)}
                                ${isMe ? '<span class="ml-2 text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded uppercase tracking-wider">You</span>' : ''}
                            </h3>
                            ${title ? `<p class="text-indigo-300 text-sm truncate mb-1">${escapeHtml(title)}</p>` : ''}
                        </div>
                        
                        <div class="flex space-x-1">
                            ${isMe ? 
                            `<button onclick="editProfile()" class="text-slate-400 hover:text-white p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors" title="Edit your profile">
                                <i class="fas fa-pencil-alt"></i>
                            </button>` : ''}
                            
                            <button onclick="downloadVcf(this)" 
                                data-name="${escapeHtml(person.contactName)}"
                                data-email="${escapeHtml(person.contactEmail)}"
                                data-phone="${escapeHtml(person.contactPhone)}"
                                data-org="${escapeHtml(person.customField)}"
                                data-insta="${escapeHtml(person.contactInstagram)}"
                                data-li="${escapeHtml(person.contactLinkedin)}"
                                data-tw="${escapeHtml(person.contactTwitter)}"
                                class="text-slate-400 hover:text-white p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors" title="Save Contact">
                                <i class="fas fa-arrow-down"></i>
                            </button>
                        </div>
                    </div>

                    <div class="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-slate-400">
                        ${emailUrl ? `<a href="${emailUrl}" class="hover:text-pink-400 transition-colors flex items-center"><i class="far fa-envelope mr-1.5 opacity-70"></i>${escapeHtml(person.contactEmail)}</a>` : ''}
                        ${phoneUrl ? `<a href="${phoneUrl}" class="hover:text-pink-400 transition-colors flex items-center"><i class="fas fa-phone mr-1.5 opacity-70"></i>${escapeHtml(person.contactPhone)}</a>` : ''}
                    </div>
                    
                    <div class="flex space-x-3 mt-3">
                        ${liUrl ? `<a href="${liUrl}" target="_blank" class="text-slate-400 hover:text-[#0077b5] transition-colors text-lg"><i class="fab fa-linkedin"></i></a>` : ''}
                        ${twUrl ? `<a href="${twUrl}" target="_blank" class="text-slate-400 hover:text-[#1DA1F2] transition-colors text-lg"><i class="fab fa-twitter"></i></a>` : ''}
                        ${igUrl ? `<a href="${igUrl}" target="_blank" class="text-slate-400 hover:text-[#E1306C] transition-colors text-lg"><i class="fab fa-instagram"></i></a>` : ''}
                    </div>
                </div>
            </div>
        `;
        
        card.innerHTML = html;
        contactsContainer.appendChild(card);
    });
}

// --- VCF GENERATION & UTILS ---
window.downloadVcf = function(btn) {
    const d = btn.dataset;
    let vCard = "BEGIN:VCARD\nVERSION:4.0\n";
    vCard += `N:${d.name}\n`;
    vCard += `FN:${d.name}\n`;
    if (d.org && d.org !== 'null') vCard += `ORG:${d.org}\n`;
    if (d.email && d.email !== 'null') vCard += `EMAIL:${d.email}\n`;
    if (d.phone && d.phone !== 'null') vCard += `TEL:${d.phone}\n`;
    
    if (d.li && d.li !== 'null') vCard += `URL;type=LinkedIn:https://linkedin.com/in/${cleanHandle(d.li)}\n`;
    if (d.tw && d.tw !== 'null') vCard += `URL;type=Twitter:https://twitter.com/${cleanHandle(d.tw)}\n`;
    if (d.insta && d.insta !== 'null') vCard += `URL;type=Instagram:https://instagram.com/${cleanHandle(d.insta)}\n`;
    
    vCard += "END:VCARD";
    console.log("vCard");
    console.log(vCard);

    const blob = new Blob([vCard], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${d.name.replace(/\s+/g, '_')}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast("Contact card downloaded");
};

function cleanHandle(handle) {
    if(!handle) return "";
    return handle.replace('https://twitter.com/', '').replace('https://instagram.com/', '').replace('https://linkedin.com/in/', '').replace('/', '');
}

function uuidv4() {
    // Check if local storage has a value for contact uid already that is not null or empty, if so, return that instead
    const storedData = localStorage.getItem(STORAGE_KEY);

    if (storedData) {
        const parsedData = JSON.parse(storedData);
        if (parsedData.contactUid && parsedData.contactUid !== "") {
            return parsedData.contactUid;
        } 
    }
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

function getInitials(name) {
    if(!name) return "??";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0,2).toUpperCase();
    return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
}

function escapeHtml(text) {
    if (!text || text === 'null') return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-msg').innerText = msg;
    toast.classList.remove('opacity-0');
    setTimeout(() => {
        toast.classList.add('opacity-0');
    }, 3000);
}
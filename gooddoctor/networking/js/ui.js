// Handles DOM manipulation (rendering lists, toggling views, generating VCFs).
import { escapeHtml, getInitials, cleanHandle, showToast } from './utils.js';
import { state } from './state.js';

// Elements
const viewRegister = document.getElementById('view-register');
const viewList = document.getElementById('view-list');
const btnSubmit = document.getElementById('btnSubmit');
const btnText = document.getElementById('btnText');
const btnLoader = document.getElementById('btnLoader');
const contactsContainer = document.getElementById('contacts-container');

export function showView(viewName) {
    if (viewName === 'register') {
        viewRegister.classList.remove('hidden');
        viewList.classList.add('hidden');
    } else {
        viewRegister.classList.add('hidden');
        viewList.classList.remove('hidden');
    }
}

export function setLoading(isLoading) {
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

export function fillForm(data) {
    document.getElementById('inpName').value = data.contactName || '';
    document.getElementById('inpEmail').value = data.contactEmail || '';
    document.getElementById('inpPhone').value = data.contactPhone || '';
    document.getElementById('inpTitle').value = data.customField || '';
    document.getElementById('inpInsta').value = data.contactInstagram || '';
    document.getElementById('inpTwitter').value = data.contactTwitter || '';
    document.getElementById('inpLinkedin').value = data.contactLinkedin || '';
    
    // Update button text if editing
    btnText.innerText = "Update Profile";
}

export function renderList(contacts) {
    contactsContainer.innerHTML = "";
    
    if (contacts.length === 0) {
        contactsContainer.innerHTML = `<div class="text-center text-slate-500 mt-10">No other attendees yet.<br>Be the first!</div>`;
        return;
    }

    contacts.forEach((person, index) => {
        const initials = getInitials(person.contactName);
        const title = person.customField || "";
        const isMe = person.contactUid === state.currentUserUid;
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

// Logic to generate the VCF file
export function downloadVcfLogic(btn) {
    const d = btn.dataset;

    // --- 1. Parse Name for the "N" field (Required for Apple Contacts) ---
    // Format required: FamilyName;GivenName;MiddleName;Prefix;Suffix
    const nameParts = (d.name || '').trim().split(/\s+/);
    let givenName = '';
    let familyName = '';
    let middleName = '';

    if (nameParts.length > 0) {
        if (nameParts.length === 1) {
            // Only one name provided
            givenName = nameParts[0];
        } else {
            // Assume First word is Given, Last word is Family, everything else is Middle
            givenName = nameParts[0];
            familyName = nameParts[nameParts.length - 1];
            
            if (nameParts.length > 2) {
                middleName = nameParts.slice(1, nameParts.length - 1).join(' ');
            }
        }
    }

    // --- 2. Parse Organization vs Title ---
    // Input logic: "Title, Organization" OR just "Organization"
    let orgName = '';
    let title = '';

    if (d.org && d.org !== 'null') {
        if (d.org.includes(',')) {
            const orgParts = d.org.split(',');
            // First part is Title
            title = orgParts[0].trim();
            // Rest is Organization (joined back in case org name has commas like "Inc.")
            orgName = orgParts.slice(1).join(',').trim();
        } else {
            // No comma, treat entire string as Organization
            orgName = d.org.trim();
        }
    }

    // --- 3. Construct VCard ---
    let vCard = "BEGIN:VCARD\nVERSION:4.0\n";
    let location = "gooddoctor";
    let date = new Date();
    // N is structured: Family;Given;Middle;;
    vCard += `N:${familyName};${givenName};${middleName};;\n`;
    vCard += `FN:${d.name}\n`;
    
    if (orgName) vCard += `ORG:${orgName}\n`;
    if (title) vCard += `TITLE:${title}\n`;
    
    if (d.email && d.email !== 'null') vCard += `EMAIL:${d.email}\n`;
    if (d.phone && d.phone !== 'null') vCard += `TEL:${d.phone}\n`;
    vCard += `NOTE:Met at ${location} on ${date.toLocaleString()}\n`
    // Socials as URLs
    if (d.li && d.li !== 'null') vCard += `URL;type=LinkedIn:${d.li.includes('http') ? d.li : 'https://linkedin.com/in/'+d.li}\n`;
    if (d.tw && d.tw !== 'null') vCard += `URL;type=Twitter:https://twitter.com/${d.tw.replace('@','')}\n`;
    if (d.insta && d.insta !== 'null') vCard += `URL;type=Instagram:https://instagram.com/${d.insta.replace('@','')}\n`;

    vCard += "END:VCARD";

    console.log(vCard);

    // Create Blob
    const blob = new Blob([vCard], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    // Trigger Download
    const link = document.createElement('a');
    link.href = url;
    // Safety check for filename
    const fileName = d.name ? d.name.replace(/\s+/g, '_') : 'contact';
    link.setAttribute('download', `${fileName}.vcf`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (typeof showToast === "function") showToast("Contact card downloaded");
};
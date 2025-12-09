// Helper functions that don't depend on the app's specific logic.

export function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

export function getInitials(name) {
    if(!name) return "??";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0,2).toUpperCase();
    return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
}

export function escapeHtml(text) {
    if (!text || text === 'null') return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export function cleanHandle(handle) {
    if(!handle) return "";
    return handle.replace('https://twitter.com/', '')
                 .replace('https://instagram.com/', '')
                 .replace('https://linkedin.com/in/', '')
                 .replace('/', '');
}

export function showToast(msg) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-msg');
    
    if(toast && toastMsg) {
        toastMsg.innerText = msg;
        toast.classList.remove('opacity-0');
        setTimeout(() => {
            toast.classList.add('opacity-0');
        }, 3000);
    }
}
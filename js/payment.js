// Supabase Configuration
const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';

export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// User ID Management (Browser Based)
function getUserId() {
    let userId = localStorage.getItem('zahid_math_uid');
    if (!userId) {
        userId = crypto.randomUUID(); // Generates unique ID
        localStorage.setItem('zahid_math_uid', userId);
        // Register new user in DB
        registerUser(userId);
    }
    document.getElementById('userIdDisplay').innerText = `ID: ${userId.slice(0,8)}...`;
    return userId;
}

async function registerUser(uid) {
    const { error } = await supabase.from('users').insert([{ user_id: uid }]);
    if(error) console.log("User Exists or Error", error);
}

// Check if User is Premium
export async function checkSubscription() {
    const uid = getUserId();
    
    const { data, error } = await supabase
        .from('users')
        .select('is_premium, subscription_expiry')
        .eq('user_id', uid)
        .single();

    if (data && data.is_premium) {
        const now = new Date();
        const expiry = new Date(data.subscription_expiry);
        if (now < expiry) return true; // Still valid
    }
    return false;
}

// UddoktaPay Integration (Mockup Logic)
document.getElementById('payBtn').addEventListener('click', async () => {
    const uid = getUserId();
    
    // এখানে UddoktaPay API কল করতে হবে
    // ইনশাআল্লাহ পেমেন্ট সাকসেস হলে নিচের কোড এক্সিকিউট হবে (সার্ভার সাইড বা এজ ফাংশন দিয়ে করা ভালো)
    
    alert("InshaAllah Payment Gateway will open now. (Simulating Success)");
    
    // Simulating Success for Demo
    await supabase
        .from('users')
        .update({ 
            is_premium: true,
            subscription_expiry: new Date(Date.now() + 30*24*60*60*1000) // +30 Days
        })
        .eq('user_id', uid);
        
    location.reload();
});

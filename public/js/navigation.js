// Navigation functionality
document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle functionality
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const hamburgerIcon = document.getElementById('hamburger-icon');
    const closeIcon = document.getElementById('close-icon');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            const isOpen = !mobileMenu.classList.contains('hidden');
            
            if (isOpen) {
                // Close menu
                mobileMenu.classList.add('hidden');
                hamburgerIcon.classList.remove('hidden');
                closeIcon.classList.add('hidden');
            } else {
                // Open menu
                mobileMenu.classList.remove('hidden');
                hamburgerIcon.classList.add('hidden');
                closeIcon.classList.remove('hidden');
            }
        });
    }

    // Check authentication state and update navigation
    updateNavigation();

    // Add scroll-based header styling
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (header && window.scrollY > 10) {
            header.classList.add('shadow-sm');
        } else if (header) {
            header.classList.remove('shadow-sm');
        }
    });
});

// Check if user is authenticated (check for cookie)
function isAuthenticated() {
    // Since we're using HTTP-only cookies, we can't check directly
    // Instead, we'll make a request to check auth status
    return fetch('/auth/profile', {
        method: 'GET',
        credentials: 'include'
    }).then(response => {
        // Silently handle 401 responses without logging to console
        return response.ok;
    }).catch(() => false);
}

// Update navigation based on authentication state
async function updateNavigation() {
    const desktopNav = document.getElementById('desktop-nav');
    const mobileNav = document.querySelector('#mobile-menu .space-y-1');
    
    if (!desktopNav || !mobileNav) return;
    
    const authenticated = await isAuthenticated();
    
    if (authenticated) {
        // Authenticated navigation
        desktopNav.innerHTML = `
            <a href="/" class="text-gray-700 dark:text-gray-300 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Home</a>
            <a href="/dashboard" class="text-gray-700 dark:text-gray-300 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Dashboard</a>
            <a href="/keys" class="text-gray-700 dark:text-gray-300 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">API Keys</a>
            <a href="/documentation" class="text-gray-700 dark:text-gray-300 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Documentation</a>
            <a href="/profile" class="text-gray-700 dark:text-gray-300 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Profile</a>
            <button onclick="logout()" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium ml-4">Logout</button>
        `;
        
        mobileNav.innerHTML = `
            <a href="/" class="text-gray-700 dark:text-gray-300 hover:text-primary block px-3 py-2 rounded-md text-base font-medium">Home</a>
            <a href="/dashboard" class="text-gray-700 dark:text-gray-300 hover:text-primary block px-3 py-2 rounded-md text-base font-medium">Dashboard</a>
            <a href="/keys" class="text-gray-700 dark:text-gray-300 hover:text-primary block px-3 py-2 rounded-md text-base font-medium">API Keys</a>
            <a href="/documentation" class="text-gray-700 dark:text-gray-300 hover:text-primary block px-3 py-2 rounded-md text-base font-medium">Documentation</a>
            <a href="/profile" class="text-gray-700 dark:text-gray-300 hover:text-primary block px-3 py-2 rounded-md text-base font-medium">Profile</a>
            <button onclick="logout()" class="bg-red-600 hover:bg-red-700 text-white block w-full text-left px-3 py-2 rounded-md text-base font-medium mt-2">Logout</button>
        `;
    } else {
        // Non-authenticated navigation
        desktopNav.innerHTML = `
            <a href="/" class="text-gray-700 dark:text-gray-300 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Home</a>
            <a href="/#features" class="text-gray-700 dark:text-gray-300 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Features</a>
            <a href="/auth/login" class="text-primary hover:text-primary/80 px-3 py-2 rounded-md text-sm font-medium">Sign In</a>
            <a href="/auth/register" class="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md text-sm font-medium ml-2">Get Started</a>
        `;
        
        mobileNav.innerHTML = `
            <a href="/" class="text-gray-700 dark:text-gray-300 hover:text-primary block px-3 py-2 rounded-md text-base font-medium">Home</a>
            <a href="/#features" class="text-gray-700 dark:text-gray-300 hover:text-primary block px-3 py-2 rounded-md text-base font-medium">Features</a>
            <a href="/auth/login" class="text-primary hover:text-primary/80 block px-3 py-2 rounded-md text-base font-medium">Sign In</a>
            <a href="/auth/register" class="bg-primary hover:bg-primary/90 text-white block text-center px-3 py-2 rounded-md text-base font-medium mt-2">Get Started</a>
        `;
    }

    // Highlight current page
    highlightCurrentPage();
}

// Highlight the current page in navigation
function highlightCurrentPage() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('#desktop-nav a, #mobile-menu a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath === '/' && href === '/')) {
            // Add active state classes
            link.classList.remove('text-gray-700', 'dark:text-gray-300');
            link.classList.add('text-primary', 'font-semibold');
        }
    });
}

// Logout function
function logout() {
    // Clear any client-side storage (though we're using HTTP-only cookies)
    localStorage.removeItem('authToken');
    
    // Redirect to logout endpoint to clear the cookie
    window.location.href = '/auth/logout';
}

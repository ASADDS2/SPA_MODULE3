import { auth } from './js/auth';
import { showLogin } from "./views/login";
import { showStartingPage } from "./views/pagestart";
import { showRegister } from "./views/register";
import { showDashboard, showEvents, showCreateEvent, showEditEvent, showMyEvents } from "./views/dashboard";

export function renderNotFound() {
    document.getElementById('app').innerHTML = `<h1>404 Error, Page not found</h1>`;
}

export function renderAccessDenied() {
    document.getElementById('app').innerHTML = `<h1>Access Denied: You do not have permission to view this page.</h1>`;
}

function redirectToLogin() {
    history.pushState(null, null, "/login");
    router();
}

const routes = {
    "/": {
        showView: showStartingPage,
        private: false
    },
    "/login": {
        showView: showLogin,
        // Public view, but will have redirect logic if already logged in
    },
    "/register": {
        showView: showRegister,
        // Public view, but will have redirect logic if already logged in
    },
    "/dashboard": {
        showView: showDashboard,
        private: true
    },
    // Modify routes to match the statement if using the '/dashboard/events' prefix
    "/events": {
        showView: showEvents,
        private: true
    },
    "/events/create": {
        showView: showCreateEvent,
        private: true,
        roles: ['admin']
    },
    "/events/show":{
        showView: showMyEvents,
        private: true
    }
};

export async function router() {
    const path = window.location.pathname;
    const user = auth.getUser();

    let currentRoute = null;
    let isDynamicRoute = false;
    let dynamicId = null; // To store the ID for dynamic routes

    // 1. Redirect logic for authenticated users trying to access /login or /register
    if (user && (path === "/login" || path === "/register")) {
        history.pushState(null, null, "/dashboard"); // Redirect to dashboard
        router();
        return; // Stop current router execution
    }

    // 2. Try to find a static route
    if (routes[path]) {
        currentRoute = routes[path];
    } else {
        // 3. Try to find dynamic routes
        const pathSegments = path.split('/').filter(segment => segment !== '');
        if (pathSegments.length === 3 &&
            pathSegments[0] === 'events' &&
            pathSegments[1] === 'edit' &&
            !isNaN(pathSegments[2])) { // Ensure the last segment is a numeric ID
            currentRoute = {
                showView: showEditEvent,
                private: true,
                roles: ['admin']
            };
            isDynamicRoute = true;
            dynamicId = pathSegments[2]; // Capture the ID to pass to the view if needed
        }
    }

    // If no route was found
    if (!currentRoute) {
        renderNotFound();
        return;
    }

    if (currentRoute.private && !user) {
        renderNotFound(); // Or renderAccessDenied() if you have a specific view
        return;
    }

    // If the route requires specific roles
    if (currentRoute.roles && (!user || !currentRoute.roles.includes(user.role))) {
        renderAccessDenied(); // Or renderNotFound()
        return;
    }

    // --- Render the view ---
    // Pass the dynamic ID to the view if it's a dynamic route
    if (isDynamicRoute && dynamicId) {
        await currentRoute.showView(dynamicId); // Assumes showEditEvent can accept an ID
    } else {
        await currentRoute.showView();
    }

    // --- Execute afterRender if it exists and is a function ---
    if (typeof currentRoute.afterRender === "function") {
        currentRoute.afterRender();
    }
}

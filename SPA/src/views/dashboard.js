import { auth } from "../js/auth";
import { router } from "../router";
// views/dashboard.js
import { api } from "../main";




export async function showDashboard() {
    const user = auth.getUser();
    if (!user) { // Route protection
        history.pushState(null, null, "/login");
        router();
        return;
    }

    document.getElementById('app').innerHTML = `
        <h1>Welcome, ${user.name} (${user.role})</h1>
        <button id="logout-btn">Logout</button>
        <nav>
            <a href="/events" data-link>View events</a>
            ${user.role === 'admin' ? `<a href="/events/create" data-link>Create event</a>` : ''}
            <a href="/events/show" data-link>My Events</a>
        </nav>`;

    document.getElementById('logout-btn').onclick = () => {
        auth.logout();
        history.pushState(null, null, "/login"); // Redirect to login after logout
        router();
    };
}



export async function showEvents() {
    const user = auth.getUser();
    if (!user) { // Route protection
        history.pushState(null, null, "/login");
        router();
        return;
    }

    const events = await api.get('/events');


    document.getElementById('app').innerHTML = `
        <h2>Available Events</h2>
        <ul>${events.map(e => `
            <li>${e.title || 'No title'} (${e.capacity || 0} slots) — Showman: ${e.showman || 'N/A'}
                ${user.role === 'admin' ? `<button class="edit-btn" data-id="${e.id}">Edit</button>` : ''}
                ${user.role === 'user' ? `<button class="enroll-btn" data-id="${e.id}">Enroll</button>` : ''}
                <button id="logout-btn">Logout</button>
                <button id="go-back-btn">Go back</button>
            </li>`).join('')}</ul>`;

    // Edit Button (only for admin)
    if (user.role === 'admin') {
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.onclick = () => {
                const eventId = btn.dataset.id;
                history.pushState(null, null, `/events/edit/${eventId}`);
                router();
            };
            document.getElementById('logout-btn').onclick = () => {
                auth.logout();
                history.pushState(null, null, "/login"); // Redirect to login after logout
                router();
            };
            document.getElementById('go-back-btn').onclick = () => {
                history.pushState(null, null, "/dashboard");
                router();
            };

        });
    }

    // Enroll Button (only for user)
    if (user.role === 'user') {
        document.querySelectorAll('.enroll-btn').forEach(btn => {
            btn.onclick = async () => {
                const eventId = btn.dataset.id;

                const event = await api.get('/events/' + eventId);

                if (!event.enrolled) event.enrolled = [];

                if (event.enrolled.includes(user.email)) {
                    alert('You are already enrolled in this event.');
                    return;
                }

                if (event.enrolled.length >= event.capacity) {
                    alert('This event is full.');
                    return;
                }

                event.enrolled.push(user.email);
                event.capacity = event.capacity - 1;

                await api.put('/events/' + eventId, event);
                alert('Enrollment successful!');
                showEvents();
            }
        });
        document.getElementById('logout-btn').onclick = () => {
            auth.logout();
            history.pushState(null, null, "/login"); // Redirect to login after logout
            router();
        };
        document.getElementById('go-back-btn').onclick = () => {
                history.pushState(null, null, "/dashboard");
                router();
            };
    }
}


export function showCreateEvent() {
    const user = auth.getUser();
    if (!user || user.role !== 'admin') { // Route protection for admins only
        history.pushState(null, null, "/dashboard");
        router();
        return;
    }

    document.getElementById('app').innerHTML = `
        <h2>Create Event</h2>
        <form id="create-event-form"> <input placeholder="Title" id="title" name="title">
            <input placeholder="Showman" id="showman" name="showman">
            <input type="number" placeholder="Capacity" id="capacity" name="capacity">
            <button type="submit">Save</button>
        </form>`;

    // Attach the event to the form with the correct ID
    const formCreateEvent = document.getElementById('create-event-form');
    if (formCreateEvent) {
        formCreateEvent.onsubmit = async e => {
            e.preventDefault();
            const data = {
                title: e.target.title.value,
                showman: e.target.showman.value,
                capacity: parseInt(e.target.capacity.value)
            };
            await api.post('/events', data); // Make sure 'api' is imported or available globally
            history.pushState(null, null, '/events'); // Redirect to /events
            router();
        };
    }
}



export async function showEditEvent() {
    const user = auth.getUser();
    if (!user || user.role !== 'admin') {
        history.pushState(null, null, "/dashboard");
        router();
        return;
    }

    // Get the event ID from the URL (pathname)
    const eventId = window.location.pathname.split('/').pop();

    const event = await api.get('/events/' + eventId); // Make sure 'api' is imported or available globally

    if (!event) {
        history.pushState(null, null, "/events"); // Redirect if the event does not exist
        router();
        return;
    }

    document.getElementById('app').innerHTML = `
        <h2>Edit Event</h2>
        <form id="edit-event-form"> <input id="title" name="title" placeholder="Title" value="${event.title}">
            <input id="showman" name="showman" placeholder="Showman" value="${event.showman}">
            <input type="number" id="capacity" name="capacity" placeholder="Capacity" value="${event.capacity}">
            <button type="submit">Save</button>
            <button type="button" id="delete-event-btn" style="background-color: red;">Delete Event</button>
        </form>`;

    // Attach events
    const formEditEvent = document.getElementById('edit-event-form');
    if (formEditEvent) {
        formEditEvent.onsubmit = async e => {
            e.preventDefault();
            const updated = {
                title: e.target.title.value,
                showman: e.target.showman.value,
                capacity: parseInt(e.target.capacity.value)
            };
            await api.put('/events/' + eventId, updated); // Make sure 'api' is imported or available globally
            history.pushState(null, null, '/events');
            router();
        };

        const deleteButton = document.getElementById('delete-event-btn');
        if (deleteButton) {
            deleteButton.onclick = async () => {
                if (confirm('Are you sure you want to delete this event?')) {
                    try {
                        await api.delete('/events/' + eventId); // Make sure 'api' is imported or available globally
                        alert('Event deleted successfully!');
                        history.pushState(null, null, '/events');
                        router();
                    } catch (error) {
                        alert('Error deleting event: ' + error.message);
                    }
                }
            };
        }
    }
}

export async function showMyEvents() {
    const user = auth.getUser();
    if (!user) {
        history.pushState(null, null, "/login");
        router();
        return;
    }

    // Get the registrations for the user
    const registrations = await api.get('/registrations?email=' + user.email);

    // Get the related events
    const eventIds = registrations.map(r => r.eventId);
    const events = await Promise.all(eventIds.map(id => api.get('/events/' + id)));

    document.getElementById('app').innerHTML = `
        <h2>My Registered Events</h2>
        <ul>
            ${events.map(e => `
                <li>${e.title} (${e.showman}) - Capacity: ${e.capacity}</li>
            `).join('')}
        </ul>
        <button id="logout-btn">Logout</button>
        <button id="go-back-btn">Go back</button>
    `;

    document.getElementById('logout-btn').onclick = () => {
        auth.logout();
        history.pushState(null, null, "/login");
        router();
    };

    document.getElementById('go-back-btn').onclick = () => {
        history.back();
    };
}



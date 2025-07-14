// src/views/pagestart.js
// Function to display the starting page

export async function showStartingPage() {
    document.getElementById('app').innerHTML = `
    <main class = "starting-page-container">    
        <h1>Welcome to our application</h1>
        <p>Please <a href="/login" data-link>Login</a> or <a href="/register" data-link>Register</a> to continue</p>
    </main
    `
    
}
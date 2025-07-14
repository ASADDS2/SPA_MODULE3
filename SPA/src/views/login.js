import { auth } from "../js/auth";
import { router } from "../router";

// Function to display the login form
export async function showLogin(){
    document.getElementById('app').innerHTML = `
        <main class="login-container">
            <h2>Login</h2>
            <form id="form-login">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required />

                <label for="password">Password</label>
                <input type="password" id="password" name="password" required />

                <button type="submit">Enter</button>
            </form>
            <div class="links">
                <a href="/register" data-link>Register here</a>
            </div>
        </main>`;
// Attach the event to the form with the correct ID
        const formLogin = document.getElementById("form-login")
        if (formLogin){
            formLogin.onsubmit = async event => {
                event.preventDefault()
                try {
                    
                    const email = event.target.email.value
                    const password = event.target.password.value

                    await auth.login(email, password)

                    history.pushState(null, null, "/dashboard")
                    router()
                } catch (error) {
                    alert(error.message)
                }
            }
        }
}
import { auth } from "../js/auth";
import { router } from "../router";
// Function to display the register form
export async function showRegister() {
    // Render the register form HTML inside the 'app' element
    document.getElementById('app').innerHTML = `
        <main class="register-container">
            <h2>Register</h2>
            <form id="form-register"> <label for="username">Username</label>
                <input type="text" id="username" name="username" required />

                <label for="email">Email</label>
                <input type="email" id="email" name="email" required />

                <label for="password">Password</label>
                <input type="password" id="password" name="password" required />

                <label for="confirm-password">Confirm Password</label>
                <input type="password" id="confirmPassword" name="confirm-password" required />

                <button type="submit">Register</button>
            </form>
            <div class="links">
                <a href="/login" data-link>Already have an account? Login here</a>
            </div>
        </main>`;

        const formRegister = document.getElementById("form-register")
        if (formRegister) {
            formRegister.onsubmit = async event => {
                event.preventDefault()
                try {
                    const username = event.target.username.value
                    const email = event.target.email.value
                    const password = event.target.password.value
                    const confirmPassword = event.target['confirm-password'].value

                    if (password !== confirmPassword) {
                        throw new Error('Passwords do not match')
                    }

                    await auth.register(username, email, password)
                    alert('Registration successful! You can now login.')
                    history.pushState(null, null, "/login")
                    router()
                } catch (error) {
                    alert(error.message)
                }
            }
        }

}
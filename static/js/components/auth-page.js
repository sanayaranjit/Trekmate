let AuthPage = {
    template: `
    <div class="tm-auth-bg">
        <div class="container" style="max-width: 480px;">
            <div class="tm-form-card">
                <div class="text-center mb-4">
                    <h3 class="mb-0">
                        <i class="bi bi-mountains me-2"></i>
                        {{ isLogin ? 'Welcome Back' : 'Create Account' }}
                    </h3>
                    <p class="text-muted mt-1">
                        {{ isLogin ? 'Login to your account' : 'Join and start exploring' }}
                    </p>
                </div>

                <form v-if="isLogin" @submit.prevent="handleLogin" novalidate>
                    <div class="mb-3">
                        <label class="form-label tm-form-label">Email Address</label>
                        <input type="email" class="form-control" v-model="loginForm.email"
                               required minlength="5" placeholder="Enter your email">
                    </div>
                    <div class="mb-3">
                        <label class="form-label tm-form-label">Password</label>
                        <input type="password" class="form-control" v-model="loginForm.password"
                               required minlength="6" placeholder="Enter your password">
                    </div>
                    <div v-if="loginError" class="alert alert-danger small py-2">
                        {{ loginError }}
                    </div>
                    <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold mb-3"
                            :disabled="isSubmitting">
                        <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
                        {{ isSubmitting ? 'Logging in...' : 'Login' }}
                    </button>
                    <p class="text-center text-muted mb-0">
                        Don't have an account?
                        <a href="#" class="text-decoration-none fw-semibold"
                           @click.prevent="toggleMode">Register here</a>
                    </p>
                </form>

                <form v-else @submit.prevent="handleRegister" novalidate>
                    <div class="mb-3">
                        <label class="form-label tm-form-label">Full Name</label>
                        <input type="text" class="form-control" v-model="registerForm.name"
                               required minlength="2" maxlength="100" placeholder="Enter your full name">
                    </div>
                    <div class="mb-3">
                        <label class="form-label tm-form-label">Email Address</label>
                        <input type="email" class="form-control" v-model="registerForm.email"
                               required placeholder="Enter your email">
                    </div>
                    <div class="mb-3">
                        <label class="form-label tm-form-label">Phone Number</label>
                        <input type="tel" class="form-control" v-model="registerForm.phone"
                               required pattern="[0-9]{10}" placeholder="10-digit phone number">
                    </div>
                    <div class="mb-3">
                        <label class="form-label tm-form-label">Password</label>
                        <input type="password" class="form-control" v-model="registerForm.password"
                               required minlength="6" placeholder="Minimum 6 characters">
                    </div>
                    <div class="mb-3">
                        <label class="form-label tm-form-label">Confirm Password</label>
                        <input type="password" class="form-control" v-model="registerForm.confirmPassword"
                               required minlength="6" placeholder="Re-enter password">
                    </div>
                    <div v-if="registerError" class="alert alert-danger small py-2">
                        {{ registerError }}
                    </div>
                    <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold mb-3"
                            :disabled="isSubmitting">
                        <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
                        {{ isSubmitting ? 'Creating Account...' : 'Create Account' }}
                    </button>
                    <p class="text-center text-muted mb-0">
                        Already have an account?
                        <a href="#" class="text-decoration-none fw-semibold"
                           @click.prevent="toggleMode">Login here</a>
                    </p>
                </form>
            </div>
        </div>
    </div>
    `,

    data: function() {
        return {
            isLogin: true,
            isSubmitting: false,
            loginError: '',
            registerError: '',
            loginForm: {
                email: '',
                password: ''
            },
            registerForm: {
                name: '',
                email: '',
                phone: '',
                password: '',
                confirmPassword: ''
            }
        };
    },

    watch: {
        '$route.path': {
            immediate: true,
            handler(newPath) {
                this.isLogin = (newPath !== '/register');
                this.loginError = '';
                this.registerError = '';
            }
        }
    },

    methods: {
        toggleMode: function() {
            if (this.isLogin) {
                this.$router.push('/register');
            } else {
                this.$router.push('/login');
            }
        },

        handleLogin: async function() {
            this.loginError = '';

            if (!this.loginForm.email || !this.loginForm.password) {
                this.loginError = 'Please fill in all fields';
                return;
            }

            this.isSubmitting = true;

            try {
                let response = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: this.loginForm.email,
                        password: this.loginForm.password
                    })
                });

                let data = await response.json();

                if (response.ok) {
                    store.login(data.user);
                    store.showToast('Welcome, ' + data.user.name + '!', 'success');

                    if (data.user.role === 'admin') {
                        this.$router.push('/admin');
                    } else if (data.user.role === 'staff') {
                        this.$router.push('/staff');
                    } else {
                        this.$router.push('/user');
                    }
                } else {
                    this.loginError = data.error || 'Login failed';
                }
            } catch (error) {
                this.loginError = 'Cannot connect to server';
            }

            this.isSubmitting = false;
        },

        handleRegister: async function() {
            this.registerError = '';
            let form = this.registerForm;

            if (!form.name || !form.email || !form.phone || !form.password || !form.confirmPassword) {
                this.registerError = 'Please fill in all fields';
                return;
            }
            if (form.password !== form.confirmPassword) {
                this.registerError = 'Passwords do not match';
                return;
            }
            if (form.password.length < 6) {
                this.registerError = 'Password must be at least 6 characters';
                return;
            }
            if (!/^[0-9]{10}$/.test(form.phone)) {
                this.registerError = 'Please enter a valid 10-digit phone number';
                return;
            }

            this.isSubmitting = true;

            try {
                let response = await fetch('/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: form.name,
                        email: form.email,
                        phone: form.phone,
                        password: form.password
                    })
                });

                let data = await response.json();

                if (response.ok) {
                    store.login(data.user);
                    store.showToast('Registration successful!', 'success');
                    this.$router.push('/user');
                } else {
                    this.registerError = data.error || 'Registration failed';
                }
            } catch (error) {
                this.registerError = 'Cannot connect to server';
            }

            this.isSubmitting = false;
        }
    },

    mounted: function() {
        if (store.isLoggedIn) {
            if (store.currentUser.role === 'admin') {
                this.$router.push('/admin');
            } else if (store.currentUser.role === 'staff') {
                this.$router.push('/staff');
            } else {
                this.$router.push('/user');
            }
        }
    }
};
let NavBar = {
    template: `
    <nav class="navbar navbar-expand-lg tm-navbar sticky-top">
        <div class="container">
            <a class="navbar-brand" href="#" @click.prevent="goHome">
                <i class="bi bi-mountains me-2"></i>Trekking App
            </a>

            <button class="navbar-toggler d-lg-none" type="button"
                    data-bs-toggle="collapse" data-bs-target="#navMenu">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navMenu">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item">
                        <a class="nav-link"
                           :class="{ active: currentPage === 'landing' }"
                           href="#" @click.prevent="goHome">
                            Home
                        </a>
                    </li>

                    <li class="nav-item"
                        v-if="store.isLoggedIn && store.currentUser.role === 'admin'">
                        <a class="nav-link"
                           :class="{ active: currentPage === 'admin' }"
                           href="#" @click.prevent="$router.push('/admin')">
                            Dashboard
                        </a>
                    </li>

                    <li class="nav-item"
                        v-if="store.isLoggedIn && store.currentUser.role === 'staff'">
                        <a class="nav-link"
                           :class="{ active: currentPage === 'staff' }"
                           href="#" @click.prevent="$router.push('/staff')">
                            Dashboard
                        </a>
                    </li>

                    <li class="nav-item"
                        v-if="store.isLoggedIn && store.currentUser.role === 'user'">
                        <a class="nav-link"
                           :class="{ active: currentPage === 'user' }"
                           href="#" @click.prevent="$router.push('/user')">
                            Dashboard
                        </a>
                    </li>
                    <li class="nav-item"
                        v-if="store.isLoggedIn && store.currentUser.role === 'user'">
                        <a class="nav-link" href="#"
                           @click.prevent="$router.push('/user?tab=browse')">
                            Browse Treks
                        </a>
                    </li>
                </ul>

                <div class="d-flex align-items-center">
                    <template v-if="!store.isLoggedIn">
                        <button class="btn btn-outline-light me-2"
                                @click="$router.push('/login')">
                            Login
                        </button>
                        <button class="btn btn-outline-light"
                                @click="$router.push('/register')">
                            Register
                        </button>
                    </template>

                    <template v-else>
                        <span class="text-white me-3 d-none d-md-inline">
                            <i class="bi bi-person-circle me-1"></i>
                            {{ store.currentUser.name }}
                            <span class="badge bg-warning text-dark ms-1"
                                  style="font-size:0.65rem">
                                {{ store.currentUser.role }}
                            </span>
                        </span>
                        <button class="btn btn-outline-light btn-sm"
                                @click="handleLogout">
                            Logout
                        </button>
                    </template>
                </div>
            </div>
        </div>
    </nav>
    `,

    methods: {
        goHome() {
            this.$router.push('/');
        },

        async handleLogout() {
            try {
                await fetch('/logout', { method: 'POST' });
            } catch (error) {}
            store.logout();
            store.showToast('Logged out successfully', 'success');
            this.$router.push('/');
        }
    },

    computed: {
        currentPage() {
            let path = this.$route.path;
            if (path === '/') {
                return 'landing';
            }
            if (path === '/admin') {
                return 'admin';
            }
            if (path === '/staff') {
                return 'staff';
            }
            if (path === '/user') {
                return 'user';
            }
            return '';
        }
    }
};
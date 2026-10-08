let LandingPage = {
    template: `
    <div>
        <section class="tm-hero">
            <div class="container position-relative" style="z-index:5">
                <div class="row">
                    <div class="col-lg-7">
                        <h1 class="mb-3">Discover Your<br>Next Adventure</h1>
                        <p class="mb-4">
                            Explore breathtaking trekking routes across India.
                            From easy nature walks to extreme Himalayan expeditions.
                        </p>
                        <div class="d-flex gap-3 flex-wrap">
                            <button class="btn btn-light btn-lg px-4 fw-semibold"
                                    @click="handleExplore"
                                    v-if="!store.isLoggedIn">
                                Start Exploring <i class="bi bi-arrow-right ms-1"></i>
                            </button>
                            <button class="btn btn-outline-light btn-lg px-4"
                                    @click="scrollToTreks">
                                View Treks <i class="bi bi-chevron-down ms-1"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <div class="container">
            <div class="tm-search-bar">
                <div class="row g-3 align-items-end">
                    <div class="col-md-3">
                        <label class="form-label tm-form-label">Location</label>
                        <input type="text" class="form-control"
                               v-model="searchLocation"
                               placeholder="e.g., Uttarakhand">
                    </div>
                    <div class="col-md-2">
                        <label class="form-label tm-form-label">Difficulty</label>
                        <select class="form-select" v-model="searchDifficulty">
                            <option value="">All</option>
                            <option>Easy</option>
                            <option>Moderate</option>
                            <option>Hard</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <label class="form-label tm-form-label">Duration</label>
                        <select class="form-select" v-model="searchDuration">
                            <option value="">Any</option>
                            <option value="1-2">1-2 days</option>
                            <option value="3-5">3-5 days</option>
                            <option value="6+">6+ days</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label tm-form-label">Trek Name</label>
                        <input type="text" class="form-control"
                               v-model="searchName"
                               placeholder="Search by name...">
                    </div>
                    <div class="col-md-2">
                        <button class="btn btn-primary w-100 py-2"
                                @click="scrollToTreks">
                            <i class="bi bi-search me-1"></i> Search
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <section class="tm-landing-stats mt-4">
            <div class="container">
                <div class="row">
                    <div class="col-6 col-md-3 text-center mb-3 mb-md-0">
                        <div class="stat-num">{{ openTreksCount }}</div>
                        <div class="stat-txt">Open Treks</div>
                    </div>
                    <div class="col-6 col-md-3 text-center mb-3 mb-md-0">
                        <div class="stat-num">{{ totalTrekkers }}</div>
                        <div class="stat-txt">Trekkers</div>
                    </div>
                    <div class="col-6 col-md-3 text-center">
                        <div class="stat-num">{{ totalRoutes }}</div>
                        <div class="stat-txt">Routes</div>
                    </div>
                    <div class="col-6 col-md-3 text-center">
                        <div class="stat-num">{{ completedTreks }}</div>
                        <div class="stat-txt">Completed</div>
                    </div>
                </div>
            </div>
        </section>

        <section class="py-5" id="treks-section">
            <div class="container">
                <h2 class="tm-section-title mb-4">Featured Treks</h2>
                <div class="row g-4 mt-4">
                    <div class="col-md-6 col-lg-4 mb-4" v-for="trek in filteredTreks" :key="trek.id">
                        <div class="tm-card h-100 d-flex flex-column">
                            <div :class="['tm-card-banner', 'banner-' + trek.difficulty.toLowerCase()]" style="min-height:150px">
                                <i class="bi bi-mountain"></i>
                            </div>
                            <div class="card-body d-flex flex-column flex-grow-1">
                                <div class="d-flex justify-content-between align-items-start mb-2">
                                    <h5 class="card-title fw-bold mb-0">{{ trek.name }}</h5>
                                    <span :class="['badge', 'badge-' + trek.difficulty.toLowerCase()]">
                                        {{ trek.difficulty }}
                                    </span>
                                </div>
                                <p class="text-muted mb-2">
                                    <i class="bi bi-geo-alt me-1"></i>{{ trek.location }}
                                </p>
                                <p class="card-text text-muted small flex-grow-1">
                                    {{ trek.description }}
                                </p>
                                <div class="d-flex justify-content-between align-items-center mt-3">
                                    <div>
                                        <span class="badge bg-light text-dark me-1">
                                            <i class="bi bi-calendar3 me-1"></i>{{ trek.duration }} days
                                        </span>
                                        <span :class="['badge', trek.available_slots > 0 ? 'bg-light text-dark' : 'bg-danger']">
                                            {{ trek.available_slots }} slots left
                                        </span>
                                    </div>
                                    <span class="fw-bold text-success">
                                        &#8377;{{ trek.price ? trek.price.toLocaleString() : '0' }}
                                    </span>
                                </div>
                                <span :class="['badge mt-2', 'badge-' + trek.status.toLowerCase()]">
                                    {{ trek.status }}
                                </span>
                            </div>
                            <div class="card-footer bg-transparent border-top-0 pt-0">
                                <button class="btn btn-primary w-100 mt-2"
                                        v-if="trek.status === 'Open' && trek.available_slots > 0"
                                        @click="handleBookTrek(trek)">
                                    Book Now
                                </button>
                                <button class="btn btn-secondary w-100 mt-2 disabled"
                                        v-else>
                                    {{ trek.status === 'Closed' ? 'Closed' : trek.available_slots === 0 ? 'Full' : 'Not Available' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="filteredTreks.length === 0" class="text-center py-5">
                    <i class="bi bi-search display-1 'text-muted'"></i>
                    <p class="text-muted mt-2">No treks match your search criteria.</p>
                </div>
            </div>
        </section>

        <section class="py-5 bg-white">
            <div class="container">
                <h2 class="tm-section-title mb-4">Trekking Insights</h2>
                <div class="row g-4">
                    <div class="col-md-6">
                        <div class="tm-form-card">
                            <h6 class="fw-bold mb-3">Bookings by Difficulty</h6>
                            <canvas id="publicChart1" height="250"></canvas>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="tm-form-card">
                            <h6 class="fw-bold mb-3">Monthly Participation</h6>
                            <canvas id="publicChart2" height="250"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <footer class="tm-footer">
            <div class="container">
                <div class="row g-4">
                    <div class="col-md-4">
                        <h5><i class="bi bi-mountains me-2"></i>Trekking App</h5>
                        <p class="small">
                            Trekking management platform.
                            Discover, book, and conquer beautiful trails.
                        </p>
                    </div>
                    <div class="col-md-2">
                        <h5>Explore</h5>
                        <ul class="list-unstyled small">
                            <li class="mb-1"><a href="#">Easy Treks</a></li>
                            <li class="mb-1"><a href="#">Moderate Treks</a></li>
                            <li class="mb-1"><a href="#">Hard Treks</a></li>
                        </ul>
                    </div>
                    <div class="col-md-2">
                        <h5>Company</h5>
                        <ul class="list-unstyled small">
                            <li class="mb-1"><a href="#">About Us</a></li>
                            <li class="mb-1"><a href="#">Contact</a></li>
                        </ul>
                    </div>
                </div>
                <hr class="border-secondary mt-4">
                <p class="text-center small mb-0">
                    &copy; 2026 Trekking App. All rights reserved.
                </p>
            </div>
        </footer>
    </div>
    `,

    data: function() {
        return {
            searchLocation: '',
            searchDifficulty: '',
            searchDuration: '',
            searchName: '',
            treks: []
        };
    },

    computed: {
        filteredTreks: function() {
            let self = this;
            return this.treks.filter(function(trek) {
                if (trek.status !== 'Open' && trek.status !== 'Completed') {
                    return false;
                }
                if (self.searchLocation) {
                    let loc = self.searchLocation.toLowerCase();
                    if (trek.location.toLowerCase().indexOf(loc) === -1) {
                        return false;
                    }
                }
                if (self.searchDifficulty && trek.difficulty !== self.searchDifficulty) {
                    return false;
                }
                if (self.searchDuration) {
                    if (self.searchDuration === '1-2' && trek.duration > 2) {
                        return false;
                    }
                    if (self.searchDuration === '3-5' && (trek.duration < 3 || trek.duration > 5)) {
                        return false;
                    }
                    if (self.searchDuration === '6+' && trek.duration < 6) {
                        return false;
                    }
                }
                if (self.searchName) {
                    let name = self.searchName.toLowerCase();
                    if (trek.name.toLowerCase().indexOf(name) === -1) {
                        return false;
                    }
                }
                return true;
            });
        },
        openTreksCount: function() {
            return this.treks.filter(function(t) { return t.status === 'Open'; }).length;
        },
        totalTrekkers: function() {
            return 3;
        },
        totalRoutes: function() {
            return this.treks.length;
        },
        completedTreks: function() {
            return this.treks.filter(function(t) { return t.status === 'Completed'; }).length;
        }
    },

    methods: {
        handleExplore: function() {
            this.$router.push('/register');
        },
        scrollToTreks: function() {
            document.getElementById('treks-section').scrollIntoView({ behavior: 'smooth' });
        },
        handleBookTrek: function(trek) {
            if (!store.isLoggedIn) {
                store.showToast('Please login to book a trek', 'error');
                this.$router.push('/login');
                return;
            }
            if (store.currentUser.role !== 'user') {
                store.showToast('Only trekkers can book treks', 'error');
                return;
            }
            this.$router.push('/user?tab=browse&book=' + trek.id);
        },
        fetchTreks: async function() {
            try {
                let response = await fetch('/treks');
                let data = await response.json();
                this.treks = data;
            } catch (error) {
                this.treks = [];
            }
        },
        initCharts: function() {
            let ctx1 = document.getElementById('publicChart1');
            if (ctx1) {
                new Chart(ctx1, {
                    type: 'doughnut',
                    data: {
                        labels: ['Easy', 'Moderate', 'Hard'],
                        datasets: [{
                            data: [2, 1, 1],
                            backgroundColor: ['#40916c', '#e9c46a', '#d00000'],
                            borderWidth: 2,
                            borderColor: '#fff'
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: { legend: { position: 'bottom' } }
                    }
                });
            }

            let ctx2 = document.getElementById('publicChart2');
            if (ctx2) {
                new Chart(ctx2, {
                    type: 'bar',
                    data: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
                        datasets: [{
                            label: 'Participants',
                            data: [10, 8, 15, 22, 30, 45, 38, 50],
                            backgroundColor: 'rgba(45, 106, 79, 0.7)',
                            borderColor: '#2d6a4f',
                            borderWidth: 1,
                            borderRadius: 6
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: { y: { beginAtZero: true } },
                        plugins: { legend: { display: false } }
                    }
                });
            }
        }
    },

    mounted: function() {
        this.fetchTreks();
        let self = this;
        setTimeout(function() {
            self.initCharts();
        }, 200);
    }
};
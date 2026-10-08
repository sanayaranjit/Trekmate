let UserDashboard = {
    template: `
    <div class="container py-4">
        <h2 class="tm-section-title mb-4">My Dashboard</h2>

        <div class="row g-3 mb-4">
            <div class="col-6 col-md-3">
                <div class="tm-stat-card">
                    <div class="stat-number">{{ stats.booked }}</div>
                    <div class="stat-label">Booked</div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="tm-stat-card" style="border-left-color: #457b9d">
                    <div class="stat-number">{{ stats.completed }}</div>
                    <div class="stat-label">Completed</div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="tm-stat-card" style="border-left-color: var(--tm-secondary)">
                    <div class="stat-number">{{ stats.cancelled }}</div>
                    <div class="stat-label">Cancelled</div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="tm-stat-card" style="border-left-color: var(--tm-primary-light)">
                    <div class="stat-number">{{ stats.total }}</div>
                    <div class="stat-label">Total Trips</div>
                </div>
            </div>
        </div>

        <div class="tm-tabs">
            <ul class="nav nav-pills flex-nowrap overflow-auto">
                <li class="nav-item" v-for="tab in tabs" :key="tab.key">
                    <a class="nav-link" :class="{ active: activeTab === tab.key }"
                       href="#" @click.prevent="activeTab = tab.key">
                        <i :class="tab.icon" class="me-1"></i>{{ tab.label }}
                    </a>
                </li>
            </ul>
        </div>

        <div v-if="activeTab === 'browse'">
            <div class="tm-form-card mb-4">
                <div class="row g-3 align-items-end">
                    <div class="col-md-3">
                        <label class="form-label tm-form-label small">Search</label>
                        <input type="text" class="form-control" v-model="browseSearch"
                               placeholder="Trek name or location...">
                    </div>
                    <div class="col-md-2">
                        <label class="form-label tm-form-label small">Difficulty</label>
                        <select class="form-select" v-model="browseDifficulty">
                            <option value="">All</option>
                            <option>Easy</option>
                            <option>Moderate</option>
                            <option>Hard</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <label class="form-label tm-form-label small">Duration</label>
                        <select class="form-select" v-model="browseDuration">
                            <option value="">Any</option>
                            <option value="1-2">1-2 days</option>
                            <option value="3-5">3-5 days</option>
                            <option value="6+">6+ days</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <label class="form-label tm-form-label small">Location</label>
                        <input type="text" class="form-control" v-model="browseLocation"
                               placeholder="State...">
                    </div>
                    <div class="col-md-3">
                        <button class="btn btn-secondary btn-sm me-1" @click="clearFilters">
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            <div class="row g-4">
                <div class="col-md-6 col-lg-4" v-for="trek in filteredTreks" :key="trek.id">
                    <div class="tm-card h-100 d-flex flex-column">
                        <div :class="['tm-card-banner', 'banner-' + trek.difficulty.toLowerCase()]">
                            <i class="bi bi-mountain"></i>
                        </div>
                        <div class="card-body d-flex flex-column flex-grow-1">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h5 class="card-title fw-bold mb-0" style="font-size:1.05rem">
                                    {{ trek.name }}
                                </h5>
                                <span :class="['badge', 'badge-' + trek.difficulty.toLowerCase()]">
                                    {{ trek.difficulty }}
                                </span>
                            </div>
                            <p class="text-muted small mb-1">
                                <i class="bi bi-geo-alt me-1"></i>{{ trek.location }}
                            </p>
                            <p class="text-muted small mb-1">
                                <i class="bi bi-calendar3 me-1"></i>
                                {{ trek.start_date }} to {{ trek.end_date }}
                            </p>
                            <p class="text-muted small mb-1">
                                <i class="bi bi-rulers me-1"></i>{{ trek.duration }} days
                                <span v-if="trek.max_altitude"> | <i class="bi bi-arrow-up me-1"></i>{{ trek.max_altitude }}</span>
                            </p>
                            <p class="card-text small text-muted flex-grow-1 mt-2">
                                {{ trek.description }}
                            </p>
                            <div class="d-flex justify-content-between align-items-center mt-2">
                                <span :class="['badge',
                                    trek.available_slots > 5 ? 'bg-light text-dark' :
                                    trek.available_slots > 0 ? 'bg-warning text-dark' : 'bg-danger']">
                                    {{ trek.available_slots }} slots left
                                </span>
                                <span class="fw-bold text-success">
                                    &#8377;{{ trek.price ? trek.price.toLocaleString() : '0' }}
                                </span>
                            </div>
                        </div>
                        <div class="card-footer bg-transparent border-top-0">
                            <button class="btn btn-primary btn-sm w-100"
                                    v-if="trek.status === 'Open' && trek.available_slots > 0 && !isBooked(trek.id)"
                                    @click="openPaymentModal(trek)">
                                <i class="bi bi-bag-check me-1"></i>Book Now
                            </button>
                            <button class="btn btn-secondary btn-sm w-100 disabled"
                                    v-else-if="isBooked(trek.id)">
                                Already Booked
                            </button>
                            <button class="btn btn-secondary btn-sm w-100 disabled" v-else>
                                {{ trek.available_slots === 0 ? 'Slots Full' : 'Not Available' }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="filteredTreks.length === 0" class="text-center py-5 text-muted">
                <i class="bi bi-search display-1"></i>
                <p class="mt-2">No treks match your filters.</p>
            </div>
        </div>

        <div v-if="activeTab === 'bookings'">
            <div class="tm-table table-responsive" v-if="activeBookings.length > 0">
                <table class="table table-hover mb-0">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Trek</th>
                            <th>Location</th>
                            <th>Booked On</th>
                            <th>Trek Status</th>
                            <th>Payment</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="b in activeBookings" :key="b.id">
                            <td>{{ b.id }}</td>
                            <td class="fw-semibold">{{ b.trek_name }}</td>
                            <td>{{ b.trek_location }}</td>
                            <td>{{ b.booking_date ? b.booking_date.split(' ')[0] : 'N/A' }}</td>
                            <td>
                                <span class="badge badge-open">{{ getTrekStatus(b.trek_id) }}</span>
                            </td>
                            <td>
                                <span :class="['badge',
                                    b.payment_status === 'Paid' ? 'bg-success' : 'bg-warning text-dark']">
                                    {{ b.payment_status }}
                                </span>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-outline-danger"
                                        @click="cancelBooking(b)"
                                        v-if="b.booking_status === 'Booked'">
                                    Cancel
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div v-else class="text-center py-5 text-muted">
                <i class="bi bi-clipboard display-1"></i>
                <p class="mt-2">No active bookings.</p>
            </div>
        </div>

        <div v-if="activeTab === 'history'">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="mb-0">Trekking History</h5>
                <button class="btn btn-outline-primary btn-sm" @click="exportCSV">
                    <i class="bi bi-download me-1"></i>Export CSV
                </button>
            </div>
            <div class="tm-table table-responsive" v-if="pastBookings.length > 0">
                <table class="table table-hover mb-0">
                    <thead>
                        <tr>
                            <th>Booking ID</th>
                            <th>Trek Name</th>
                            <th>Location</th>
                            <th>Booking Date</th>
                            <th>Status</th>
                            <th>Payment</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="b in pastBookings" :key="b.id">
                            <td>{{ b.id }}</td>
                            <td class="fw-semibold">{{ b.trek_name }}</td>
                            <td>{{ b.trek_location }}</td>
                            <td>{{ b.booking_date ? b.booking_date.split(' ')[0] : 'N/A' }}</td>
                            <td>
                                <span :class="['badge', 'badge-' + b.booking_status.toLowerCase()]">
                                    {{ b.booking_status }}
                                </span>
                            </td>
                            <td>
                                <span :class="['badge',
                                    b.payment_status === 'Paid' ? 'bg-success' : 'bg-warning text-dark']">
                                    {{ b.payment_status }}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div v-else class="text-center py-5 text-muted">
                <i class="bi bi-clock-history display-1"></i>
                <p class="mt-2">No trekking history yet.</p>
            </div>
        </div>

        <div v-if="activeTab === 'profile'">
            <div class="row justify-content-center">
                <div class="col-md-8 col-lg-6">
                    <div class="tm-form-card">
                        <div class="text-center mb-4">
                            <div class="rounded-circle bg-success text-white d-inline-flex align-items-center justify-content-center"
                                 style="width:80px;height:80px;font-size:2rem;">
                                {{ profileForm.name ? profileForm.name.charAt(0).toUpperCase() : '?' }}
                            </div>
                            <h5 class="mt-2 mb-0">{{ profileForm.name }}</h5>
                            <small class="text-muted">{{ profileForm.email }}</small>
                        </div>
                        <form @submit.prevent="updateProfile">
                            <div class="mb-3">
                                <label class="form-label tm-form-label">Full Name</label>
                                <input type="text" class="form-control" v-model="profileForm.name"
                                       required minlength="2" maxlength="100">
                            </div>
                            <div class="mb-3">
                                <label class="form-label tm-form-label">Email</label>
                                <input type="email" class="form-control" v-model="profileForm.email"
                                       required disabled>
                                <small class="text-muted">Email cannot be changed</small>
                            </div>
                            <div class="mb-3">
                                <label class="form-label tm-form-label">Phone</label>
                                <input type="tel" class="form-control" v-model="profileForm.phone"
                                       required pattern="[0-9]{10}">
                            </div>
                            <button type="submit" class="btn btn-primary w-100">
                                <i class="bi bi-save me-1"></i>Update Profile
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <div class="modal fade" id="paymentModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header" style="background: var(--tm-primary-dark); color: #fff;">
                        <h5 class="modal-title">Confirm Booking</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" v-if="selectedTrek">
                        <div class="d-flex justify-content-between mb-3 p-3 rounded"
                             style="background: var(--tm-bg)">
                            <div>
                                <h6 class="mb-1">{{ selectedTrek.name }}</h6>
                                <small class="text-muted">
                                    {{ selectedTrek.location }} | {{ selectedTrek.duration }} days
                                </small>
                            </div>
                            <div class="text-end">
                                <div class="fw-bold text-success fs-5">
                                    &#8377;{{ selectedTrek.price ? selectedTrek.price.toLocaleString() : '0' }}
                                </div>
                            </div>
                        </div>

                        <h6 class="fw-bold mb-2">Payment Method</h6>
                        <div class="row g-2 mb-3">
                            <div class="col-4">
                                <div :class="['tm-payment-option', paymentMethod === 'card' ? 'selected' : '']"
                                     @click="paymentMethod = 'card'">
                                    <i class="bi bi-credit-card fs-4"></i>
                                    <div class="small mt-1">Card</div>
                                </div>
                            </div>
                            <div class="col-4">
                                <div :class="['tm-payment-option', paymentMethod === 'upi' ? 'selected' : '']"
                                     @click="paymentMethod = 'upi'">
                                    <i class="bi bi-phone fs-4"></i>
                                    <div class="small mt-1">UPI</div>
                                </div>
                            </div>
                            <div class="col-4">
                                <div :class="['tm-payment-option', paymentMethod === 'netbanking' ? 'selected' : '']"
                                     @click="paymentMethod = 'netbanking'">
                                    <i class="bi bi-bank fs-4"></i>
                                    <div class="small mt-1">Bank</div>
                                </div>
                            </div>
                        </div>

                        <div v-if="paymentMethod === 'card'">
                            <div class="mb-2">
                                <input type="text" class="form-control" placeholder="Card Number"
                                       v-model="cardNumber" maxlength="19" @input="formatCardNumber">
                            </div>
                            <div class="row g-2">
                                <div class="col-6">
                                    <input type="text" class="form-control" placeholder="MM/YY"
                                           v-model="cardExpiry" maxlength="5" @input="formatExpiry">
                                </div>
                                <div class="col-6">
                                    <input type="password" class="form-control" placeholder="CVV"
                                           v-model="cardCvv" maxlength="3">
                                </div>
                            </div>
                        </div>

                        <div v-if="paymentMethod === 'upi'">
                            <input type="text" class="form-control" placeholder="UPI ID (e.g., name@upi)"
                                   v-model="upiId">
                        </div>

                        <div v-if="paymentMethod === 'netbanking'">
                            <select class="form-select" v-model="selectedBank">
                                <option value="">Select Bank</option>
                                <option>State Bank of India</option>
                                <option>HDFC Bank</option>
                                <option>ICICI Bank</option>
                                <option>Axis Bank</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" @click="confirmBooking"
                                :disabled="isProcessing">
                            <span v-if="isProcessing" class="spinner-border spinner-border-sm me-1"></span>
                            {{ isProcessing ? 'Processing...' : 'Pay & Confirm' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

    </div>
    `,

    data: function() {
        return {
            activeTab: 'browse',
            tabs: [
                { key: 'browse', label: 'Browse Treks', icon: 'bi-search' },
                { key: 'bookings', label: 'My Bookings', icon: 'bi-bookmark-check' },
                { key: 'history', label: 'History', icon: 'bi-clock-history' },
                { key: 'profile', label: 'Profile', icon: 'bi-person' }
            ],

            browseSearch: '',
            browseDifficulty: '',
            browseDuration: '',
            browseLocation: '',

            allTreks: [],
            allBookings: [],
            stats: { booked: 0, completed: 0, cancelled: 0, total: 0 },

            selectedTrek: null,
            paymentMethod: 'card',
            cardNumber: '',
            cardExpiry: '',
            cardCvv: '',
            upiId: '',
            selectedBank: '',
            isProcessing: false,

            profileForm: {
                name: '',
                email: '',
                phone: ''
            }
        };
    },

    computed: {
        myBookings: function() {
            return (this.allBookings || []);
        },

        activeBookings: function() {
            return (this.allBookings || []).filter(function(b) {
                return b.booking_status === 'Booked' && b.trek_status !== 'Completed' && b.status !== 'Completed';
            });
        },
        pastBookings: function() {
            return (this.allBookings || []).filter(function(b) {
                return b.booking_status !== 'Booked' || b.trek_status === 'Completed' || b.status === 'Completed';
            });
        },

        filteredTreks: function() {
            let self = this;
            return this.allTreks.filter(function(trek) {
                if (trek.status !== 'Open') {
                    return false;
                }
                if (self.browseSearch) {
                    let q = self.browseSearch.toLowerCase();
                    let nameMatch = trek.name.toLowerCase().indexOf(q) !== -1;
                    let locMatch = trek.location.toLowerCase().indexOf(q) !== -1;
                    if (!nameMatch && !locMatch) {
                        return false;
                    }
                }
                if (self.browseDifficulty && trek.difficulty !== self.browseDifficulty) {
                    return false;
                }
                if (self.browseLocation) {
                    if (trek.location.toLowerCase().indexOf(self.browseLocation.toLowerCase()) === -1) {
                        return false;
                    }
                }
                if (self.browseDuration) {
                    if (self.browseDuration === '1-2' && trek.duration > 2) {
                        return false;
                    }
                    if (self.browseDuration === '3-5' && (trek.duration < 3 || trek.duration > 5)) {
                        return false;
                    }
                    if (self.browseDuration === '6+' && trek.duration < 6) {
                        return false;
                    }
                }
                return true;
            });
        }
    },

    methods: {
        isBooked: function(trekId) {
            return this.myBookings.some(function(b) {
                return b.trek_id === trekId && b.booking_status === 'Booked';
            });
        },

        getTrekStatus: function(trekId) {
            let trek = this.allTreks.find(function(t) { return t.id === trekId; });
            return trek ? trek.status : 'Unknown';
        },

        clearFilters: function() {
            this.browseSearch = '';
            this.browseDifficulty = '';
            this.browseDuration = '';
            this.browseLocation = '';
        },

        openPaymentModal: function(trek) {
            this.selectedTrek = trek;
            this.paymentMethod = 'card';
            this.cardNumber = '';
            this.cardExpiry = '';
            this.cardCvv = '';
            this.upiId = '';
            this.selectedBank = '';
            new bootstrap.Modal(document.getElementById('paymentModal')).show();
        },

        formatCardNumber: function(e) {
            let val = e.target.value.replace(/\D/g, '').substring(0, 16);
            this.cardNumber = val.replace(/(.{4})/g, '$1 ').trim();
        },

        formatExpiry: function(e) {
            let val = e.target.value.replace(/\D/g, '').substring(0, 4);
            if (val.length >= 2) {
                val = val.substring(0, 2) + '/' + val.substring(2);
            }
            this.cardExpiry = val;
        },

        confirmBooking: async function() {
            if (this.paymentMethod === 'card') {
                if (!this.cardNumber || this.cardNumber.replace(/\s/g, '').length < 16) {
                    store.showToast('Please enter a valid card number', 'error');
                    return;
                }
            }
            if (this.paymentMethod === 'upi' && !this.upiId) {
                store.showToast('Please enter UPI ID', 'error');
                return;
            }
            if (this.paymentMethod === 'netbanking' && !this.selectedBank) {
                store.showToast('Please select a bank', 'error');
                return;
            }

            this.isProcessing = true;

            try {
                let response = await fetch('/bookings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ trek_id: this.selectedTrek.id })
                });

                let data = await response.json();

                if (response.ok) {
                    store.showToast('Booking confirmed! ' + this.selectedTrek.name, 'success');
                    bootstrap.Modal.getInstance(document.getElementById('paymentModal')).hide();
                    this.fetchData();
                } else {
                    store.showToast(data.error || 'Booking failed', 'error');
                }
            } catch (error) {
                store.showToast('Cannot connect to server', 'error');
            }

            this.isProcessing = false;
        },

        cancelBooking: async function(booking) {
            if (!confirm('Cancel your booking for ' + booking.trek_name + '?')) {
                return;
            }

            try {
                let response = await fetch('/bookings/' + booking.id + '/cancel', {
                    method: 'PUT'
                });

                let data = await response.json();

                if (response.ok) {
                    store.showToast('Booking cancelled. Payment will be refunded.', 'success');
                    this.fetchData();
                } else {
                    store.showToast(data.error || 'Failed to cancel', 'error');
                }
            } catch (error) {
                store.showToast('Cannot connect to server', 'error');
            }
        },

        exportCSV: async function() {
            store.showToast('Processing your request...', 'success');

            try {
                const response = await fetch('/export-csv', { method: 'POST' });
                const data = await response.json();

                if (data.task_id) {
                    store.showToast('Processing export... check back in a few seconds', 'success');

                    let attempts = 0;
                    const pollInterval = setInterval(async function() {
                        attempts++;
                        if (attempts > 20) {
                            clearInterval(pollInterval);
                            store.showToast('Taking longer than expected. Check static/exports/ folder.', 'error');
                            return;
                        }
                        try {
                            const statusRes = await fetch('/task-status/' + data.task_id);
                            const statusData = await statusRes.json();

                            if (statusData.status === 'completed') {
                                clearInterval(pollInterval);
                                store.showToast('CSV ready! Downloading file...', 'success');
                                try {
                                    const downloadRes = await fetch('/static/exports/user_' + String(store.currentUser.id) + '_history.csv');
                                    if (downloadRes.ok) {
                                        const blob = await downloadRes.blob();
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = 'trek_history.csv';
                                        a.click();
                                        URL.revokeObjectURL(url);
                                    } else {
                                        store.showToast('File not found on server. Check static/exports/ folder.', 'error');
                                    }
                                } catch (e) {
                                    store.showToast('Download failed', 'error');
                                }
                            } else if (statusData.status === 'failed') {
                                clearInterval(pollInterval);
                                store.showToast('Export failed. Ensure Celery worker is running.', 'error');
                            }
                        } catch (e) {
                            clearInterval(pollInterval);
                        }
                    }, 3000);
                }
            } catch (error) {
                // Fallback: generate CSV locally in the browser
                let csv = 'Booking ID,Trek Name,Location,Booking Status,Date\n';
                this.pastBookings.forEach(function(b) {
                    csv += b.id + ',"' + b.trek_name + '","' + b.trek_location + '","' + b.booking_status + '","' + (b.booking_date ? b.booking_date.split(' ')[0] : 'N/A') + '\n';
                });
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'trek_history.csv';
                a.click();
                URL.revokeObjectURL(url);
                store.showToast('CSV exported successfully', 'success');
            }
        },

        updateProfile: async function() {
            if (!this.profileForm.name || !this.profileForm.phone) {
                store.showToast('Please fill all fields', 'error');
                return;
            }
            if (!/^[0-9]{10}$/.test(this.profileForm.phone)) {
                store.showToast('Enter a valid 10-digit phone number', 'error');
                return;
            }

            try {
                let userId = store.currentUser.id;
                let response = await fetch('/users/' + userId + '/profile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: this.profileForm.name,
                        phone: this.profileForm.phone
                    })
                });

                let data = await response.json();

                if (response.ok) {
                    store.currentUser.name = this.profileForm.name;
                    store.showToast('Profile updated successfully', 'success');
                } else {
                    store.showToast(data.error || 'Failed to update', 'error');
                }
            } catch (error) {
                store.showToast('Cannot connect to server', 'error');
            }
        },

        fetchData: async function() {
            let self = this;

            try {
                let trekRes = await fetch('/treks');
                self.allTreks = await trekRes.json();
            } catch (error) {
                self.allTreks = [];
            }

            try {
                let bookRes = await fetch('/bookings');
                self.allBookings = await bookRes.json();
            } catch (error) {
                self.allBookings = [];
            }

            try {
                let statRes = await fetch('/stats/user');
                self.stats = await statRes.json();
            } catch (error) {}
        }
    },

    mounted: function() {
        if (!store.isLoggedIn || store.currentUser.role !== 'user') {
            store.showToast('User access required', 'error');
            this.$router.push('/');
            return;
        }

        this.profileForm = {
            name: store.currentUser.name,
            email: store.currentUser.email,
            phone: store.currentUser.phone || ''
        };

        this.fetchData();

        if (this.$route.query.tab) {
            this.activeTab = this.$route.query.tab;
        }
        if (this.$route.query.book) {
            let trekId = parseInt(this.$route.query.book);
            let self = this;
            setTimeout(function() {
                let trek = self.allTreks.find(function(t) { return t.id === trekId; });
                if (trek) {
                    self.openPaymentModal(trek);
                }
            }, 500);
        }
    }
};
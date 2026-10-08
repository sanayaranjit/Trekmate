let StaffDashboard = {
    template: `
    <div class="container py-4">
        <h2 class="tm-section-title mb-4">Staff Dashboard</h2>
        <p class="text-muted mb-4">
            Welcome, <strong>{{ store.currentUser ? store.currentUser.name : '' }}</strong>.
            Manage your assigned treks below.
        </p>

        <div class="row g-3 mb-4">
            <div class="col-md-4">
                <div class="tm-stat-card">
                    <div class="stat-number">{{ myTreks.length }}</div>
                    <div class="stat-label">Assigned Treks</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="tm-stat-card" style="border-left-color: var(--tm-secondary)">
                    <div class="stat-number">{{ totalParticipants }}</div>
                    <div class="stat-label">Total Participants</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="tm-stat-card" style="border-left-color: #457b9d">
                    <div class="stat-number">{{ openCount }}</div>
                    <div class="stat-label">Open Treks</div>
                </div>
            </div>
        </div>

        <div class="tm-tabs">
            <ul class="nav nav-pills">
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'treks' }"
                       href="#" @click.prevent="activeTab = 'treks'">
                        <i class="bi bi-mountain me-1"></i>My Treks
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'participants' }"
                       href="#" @click.prevent="activeTab = 'participants'">
                        <i class="bi bi-people me-1"></i>Participants
                    </a>
                </li>
            </ul>
        </div>

        <div v-if="activeTab === 'treks'">
            <div class="row g-4" v-if="myTreks.length > 0">
                <div class="col-md-6" v-for="trek in myTreks" :key="trek.id">
                    <div class="tm-card">
                        <div :class="['tm-card-banner', 'banner-' + trek.difficulty.toLowerCase()]">
                            <i class="bi bi-mountain"></i>
                        </div>
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h5 class="card-title fw-bold mb-0">{{ trek.name }}</h5>
                                <span :class="['badge', 'badge-' + trek.status.toLowerCase()]">
                                    {{ trek.status }}
                                </span>
                            </div>
                            <p class="text-muted small mb-2">
                                <i class="bi bi-geo-alt me-1"></i>{{ trek.location }} |
                                <i class="bi bi-calendar3 me-1"></i>{{ trek.duration }} days |
                                <i class="bi bi-people me-1"></i>{{ trek.available_slots }}/{{ trek.max_slots }} slots
                            </p>
                            <p class="text-muted small mb-1">
                                <i class="bi bi-calendar-event me-1"></i>
                                {{ trek.start_date }} to {{ trek.end_date }}
                            </p>

                            <div class="row g-2 mb-3 mt-3">
                                <div class="col-6">
                                    <label class="form-label small fw-semibold">Available Slots</label>
                                    <input type="number" class="form-control form-control-sm"
                                           v-model.number="trek.available_slots"
                                           min="0" :max="trek.max_slots">
                                </div>
                                <div class="col-6">
                                    <label class="form-label small fw-semibold">Status</label>
                                    <select class="form-select form-select-sm" v-model="trek.status">
                                        <option>Open</option>
                                        <option>Closed</option>
                                        <option>Completed</option>
                                    </select>
                                </div>
                            </div>
                            <button class="btn btn-primary btn-sm w-100" @click="updateTrek(trek)">
                                <i class="bi bi-save me-1"></i>Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else class="text-center py-5 text-muted">
                <i class="bi bi-mountain display-1"></i>
                <p class="mt-2">No treks assigned to you yet.</p>
            </div>
        </div>

        <div v-if="activeTab === 'participants'">
            <div class="w-100" v-if="myTreks.length > 0">
                <div class="mb-3">
                    <label class="form-label tm-form-label">Select Trek</label>
                    <select class="form-select" style="max-width:400px" v-model="selectedTrekId">
                        <option v-for="trek in myTreks" :key="trek.id" :value="trek.id">
                            {{ trek.name }}
                        </option>
                    </select>
                </div>

                <div class="tm-table table-responsive" v-if="trekParticipants.length > 0">
                    <table class="table table-hover mb-0">
                        <thead>
                            <tr>
                                <th>Booking ID</th>
                                <th>User</th>
                                <th>Booking Date</th>
                                <th>Status</th>
                                <th>Payment</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="p in trekParticipants" :key="p.id">
                                <td>{{ p.id }}</td>
                                <td class="fw-semibold">{{ p.user_name }}</td>
                                <td>{{ p.booking_date ? p.booking_date.split(' ')[0] : 'N/A' }}</td>
                                <td>
                                    <span :class="['badge', 'badge-' + p.booking_status.toLowerCase()]">
                                        {{ p.booking_status }}
                                    </span>
                                </td>
                                <td>
                                    <span :class="['badge',
                                        p.payment_status === 'Paid' ? 'bg-success' : 'bg-warning text-dark']">
                                        {{ p.payment_status }}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else class="text-center py-4 text-muted">
                    No participants for this trek.
                </div>
            </div>
        </div>
    </div>
    `,

    data: function() {
        return {
            activeTab: 'treks',
            selectedTrekId: null,
            allTreks: [],
            allBookings: []
        };
    },

    computed: {
        myTreks: function() {
            let staffId = store.currentUser ? store.currentUser.id : null;
            if (!staffId) {
                return [];
            }
            return this.allTreks.filter(function(trek) {
                return trek.staff_id === staffId;
            });
        },

        totalParticipants: function() {
            let self = this;
            return this.myTreks.reduce(function(sum, trek) {
                let count = self.allBookings.filter(function(b) {
                    return b.trek_id === trek.id && b.booking_status === 'Booked';
                }).length;
                return sum + count;
            }, 0);
        },

        openCount: function() {
            return this.myTreks.filter(function(t) {
                return t.status === 'Open';
            }).length;
        },

        trekParticipants: function() {
            if (!this.selectedTrekId) {
                return [];
            }
            let self = this;
            return this.allBookings.filter(function(b) {
                return b.trek_id === self.selectedTrekId;
            });
        }
    },

    methods: {
        updateTrek: async function(trek) {
            try {
                let response = await fetch('/treks/' + trek.id, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        available_slots: trek.available_slots,
                        status: trek.status
                    })
                });

                let data = await response.json();

                if (response.ok) {
                    store.showToast('Trek updated successfully', 'success');
                } else {
                    store.showToast(data.error || 'Failed to update', 'error');
                }
            } catch (error) {
                store.showToast('Cannot connect to server', 'error');
            }
        },

        fetchData: async function() {
            try {
                let trekResponse = await fetch('/treks');
                this.allTreks = await trekResponse.json();
            } catch (error) {
                this.allTreks = [];
            }

            try {
                let bookingResponse = await fetch('/bookings');
                this.allBookings = await bookingResponse.json();
            } catch (error) {
                this.allBookings = [];
            }
        }
    },

    mounted: function() {
        if (!store.isLoggedIn || store.currentUser.role !== 'staff') {
            store.showToast('Staff access required', 'error');
            this.$router.push('/');
            return;
        }

        this.fetchData();

        let self = this;
        this.$watch('myTreks', function(newVal) {
            if (newVal.length > 0 && !self.selectedTrekId) {
                self.selectedTrekId = newVal[0].id;
            }
        });
    }
};
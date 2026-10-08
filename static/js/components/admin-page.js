let AdminDashboard = {
    template: `
    <div class="container py-4">
        <h2 class="tm-section-title mb-4">Admin Dashboard</h2>

        <div class="row g-3 mb-4">
            <div class="col-6 col-md-3">
                <div class="tm-stat-card">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <div class="stat-number">{{ stats.total_treks }}</div>
                            <div class="stat-label">Total Treks</div>
                        </div>
                        <div class="stat-icon"><i class="bi bi-mountain"></i></div>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="tm-stat-card" style="border-left-color: var(--tm-secondary)">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <div class="stat-number">{{ stats.total_users }}</div>
                            <div class="stat-label">Users</div>
                        </div>
                        <div class="stat-icon" style="background: var(--tm-secondary)">
                            <i class="bi bi-people"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="tm-stat-card" style="border-left-color: #457b9d">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <div class="stat-number">{{ stats.total_staff }}</div>
                            <div class="stat-label">Staff</div>
                        </div>
                        <div class="stat-icon" style="background: #457b9d">
                            <i class="bi bi-person-badge"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="tm-stat-card" style="border-left-color: var(--tm-primary-light)">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <div class="stat-number">{{ stats.total_bookings }}</div>
                            <div class="stat-label">Bookings</div>
                        </div>
                        <div class="stat-icon" style="background: var(--tm-primary-light)">
                            <i class="bi bi-clipboard-check"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="tm-tabs">
            <ul class="nav nav-pills">
                <li class="nav-item" v-for="tab in tabs" :key="tab.key">
                    <a class="nav-link"
                       :class="{ active: activeTab === tab.key }"
                       href="#"
                       @click.prevent="switchTab(tab.key)">
                        <i :class="tab.icon" class="me-1"></i>{{ tab.label }}
                    </a>
                </li>
            </ul>
        </div>

        <div v-if="activeTab === 'overview'">
            <div class="row g-4">
                <div class="col-md-6">
                    <div class="tm-form-card">
                        <h6 class="fw-bold mb-3">Booking Status Distribution</h6>
                        <canvas id="adminChart1" height="250"></canvas>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="tm-form-card">
                        <h6 class="fw-bold mb-3">Treks by Difficulty</h6>
                        <canvas id="adminChart2" height="250"></canvas>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="activeTab === 'treks'">
            <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <input type="text" class="form-control" style="max-width:300px"
                       v-model="trekSearch" placeholder="Search treks by name or location...">
                <button class="btn btn-primary" @click="openAddTrekModal">
                    <i class="bi bi-plus-lg me-1"></i> Add Trek
                </button>
            </div>
            <div class="tm-table table-responsive">
                <table class="table table-hover mb-0">
                    <thead>
                        <tr>
                            <th>ID</th><th>Name</th><th>Location</th><th>Difficulty</th>
                            <th>Duration</th><th>Slots</th><th>Staff</th><th>Status</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="trek in filteredTreks" :key="trek.id">
                            <td>{{ trek.id }}</td>
                            <td class="fw-semibold">{{ trek.name }}</td>
                            <td>{{ trek.location }}</td>
                            <td>
                                <span :class="['badge', 'badge-' + trek.difficulty.toLowerCase()]">{{ trek.difficulty }}</span>
                            </td>
                            <td>{{ trek.duration }} days</td>
                            <td>{{ trek.available_slots }}/{{ trek.max_slots }}</td>
                            <td>{{ trek.staff_name }}</td>
                            <td>
                                <span :class="['badge', 'badge-' + trek.status.toLowerCase()]">{{ trek.status }}</span>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-outline-primary me-1" @click="openEditTrekModal(trek)" title="Edit">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" @click="deleteTrek(trek.id)" title="Delete">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div v-if="activeTab === 'staff'">
            <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <input type="text" class="form-control" style="max-width:300px"
                       v-model="staffSearch" placeholder="Search staff...">
                <button class="btn btn-primary" @click="openAddStaffModal">
                    <i class="bi bi-plus-lg me-1"></i> Add Staff
                </button>
            </div>
            <div class="tm-table table-responsive">
                <table class="table table-hover mb-0">
                    <thead>
                        <tr>
                            <th>ID</th><th>Name</th><th>Email</th><th>Phone</th>
                            <th>Assigned Treks</th><th>Status</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="s in filteredStaff" :key="s.id">
                            <td>{{ s.id }}</td>
                            <td class="fw-semibold">{{ s.name }}</td>
                            <td>{{ s.email }}</td>
                            <td>{{ s.phone }}</td>
                            <td>
                                <span v-for="tid in s.assigned_treks" :key="tid" class="badge bg-light text-dark me-1">
                                    {{ getTrekName(tid) }}
                                </span>
                                <span v-if="!s.assigned_treks || s.assigned_treks.length === 0" class="text-muted small">None</span>
                            </td>
                            <td>
                                <span :class="['badge', s.status === 'active' ? 'bg-success' : 'bg-secondary']">{{ s.status }}</span>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-outline-primary me-1" @click="openAssignTrekModal(s)" title="Assign Trek">
                                    <i class="bi bi-link-45deg"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-warning" @click="toggleStaffStatus(s)"
                                        :title="s.status === 'active' ? 'Deactivate' : 'Activate'">
                                    <i :class="s.status === 'active' ? 'bi bi-pause-circle' : 'bi bi-play-circle'"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div v-if="activeTab === 'users'">
            <div class="mb-3">
                <input type="text" class="form-control" style="max-width:300px"
                       v-model="userSearch" placeholder="Search users by name or email...">
            </div>
            <div class="tm-table table-responsive">
                <table class="table table-hover mb-0">
                    <thead>
                        <tr>
                            <th>ID</th><th>Name</th><th>Email</th><th>Phone</th>
                            <th>Joined</th><th>Status</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="u in filteredUsers" :key="u.id">
                            <td>{{ u.id }}</td>
                            <td class="fw-semibold">{{ u.name }}</td>
                            <td>{{ u.email }}</td>
                            <td>{{ u.phone }}</td>
                            <td>{{ u.created_at ? u.created_at.split(' ')[0] : 'N/A' }}</td>
                            <td>
                                <span :class="['badge',
                                    u.status === 'active' ? 'bg-success' :
                                    u.status === 'blacklisted' ? 'bg-danger' : 'bg-secondary']">{{ u.status }}</span>
                            </td>
                            <td>
                                <button v-if="u.status === 'active'" class="btn btn-sm btn-outline-warning me-1"
                                        @click="changeUserStatus(u, 'deactivated')" title="Deactivate">
                                    <i class="bi bi-pause-circle"></i>
                                </button>
                                <button v-if="u.status === 'active'" class="btn btn-sm btn-outline-danger"
                                        @click="changeUserStatus(u, 'blacklisted')" title="Blacklist">
                                    <i class="bi bi-x-circle"></i>
                                </button>
                                <button v-if="u.status !== 'active'" class="btn btn-sm btn-outline-success"
                                        @click="changeUserStatus(u, 'active')" title="Activate">
                                    <i class="bi bi-check-circle"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div v-if="activeTab === 'bookings'">
            <div class="mb-3">
                <input type="text" class="form-control" style="max-width:300px"
                       v-model="bookingSearch" placeholder="Search bookings by user or trek name...">
            </div>
            <div class="tm-table table-responsive">
                <table class="table table-hover mb-0">
                    <thead>
                        <tr>
                            <th>ID</th><th>User</th><th>Trek</th><th>Booking Date</th>
                            <th>Status</th><th>Payment</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="b in filteredBookings" :key="b.id">
                            <td>{{ b.id }}</td>
                            <td class="fw-semibold">{{ b.user_name }}</td>
                            <td>{{ b.trek_name }}</td>
                            <td>{{ b.booking_date ? b.booking_date.split(' ')[0] : 'N/A' }}</td>
                            <td>
                                <span :class="['badge', 'badge-' + b.booking_status.toLowerCase()]">{{ b.booking_status }}</span>
                            </td>
                            <td>
                                <span :class="['badge', b.payment_status === 'Paid' ? 'bg-success' : 'bg-warning text-dark']">{{ b.payment_status }}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div v-if="activeTab === 'reports'">
            <div class="row g-4">
                <div class="col-md-4">
                    <div class="tm-form-card text-center">
                        <i class="bi bi-mountain display-4 text-success"></i>
                        <h3 class="mt-3 fw-bold">{{ stats.total_treks }}</h3>
                        <p class="text-muted">Total Trek Routes</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="tm-form-card text-center">
                        <i class="bi bi-people display-4" style="color: var(--tm-secondary)"></i>
                        <h3 class="mt-3 fw-bold">{{ stats.active_bookings }}</h3>
                        <p class="text-muted">Active Bookings</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="tm-form-card text-center">
                        <i class="bi bi-check-circle display-4" style="color: #457b9d"></i>
                        <h3 class="mt-3 fw-bold">{{ stats.completed_bookings }}</h3>
                        <p class="text-muted">Completed Treks</p>
                    </div>
                </div>
            </div>
            <div class="row g-4 mt-2">
                <div class="col-md-6">
                    <div class="tm-form-card">
                        <h6 class="fw-bold mb-3">User Participation per Trek</h6>
                        <canvas id="reportChart1" height="250"></canvas>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="tm-form-card">
                        <h6 class="fw-bold mb-3">Treks by Status</h6>
                        <canvas id="reportChart2" height="250"></canvas>
                    </div>
                </div>
            </div>
        </div>

        <div class="modal fade" id="trekModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header" style="background: var(--tm-primary-dark); color: #fff;">
                        <h5 class="modal-title">{{ editingTrek ? 'Edit Trek' : 'Add New Trek' }}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <label class="form-label tm-form-label">Trek Name *</label>
                                <input type="text" class="form-control" v-model="trekForm.name" required minlength="3">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label tm-form-label">Location *</label>
                                <input type="text" class="form-control" v-model="trekForm.location" required>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label tm-form-label">Difficulty *</label>
                                <select class="form-select" v-model="trekForm.difficulty" required>
                                    <option value="">Select</option>
                                    <option>Easy</option>
                                    <option>Moderate</option>
                                    <option>Hard</option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label tm-form-label">Duration (days) *</label>
                                <input type="number" class="form-control" v-model="trekForm.duration" required min="1" max="30">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label tm-form-label">Max Slots *</label>
                                <input type="number" class="form-control" v-model="trekForm.max_slots" required min="1" max="200">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label tm-form-label">Price (INR) *</label>
                                <input type="number" class="form-control" v-model="trekForm.price" required min="0">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label tm-form-label">Start Date *</label>
                                <input type="date" class="form-control" v-model="trekForm.start_date" required>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label tm-form-label">End Date *</label>
                                <input type="date" class="form-control" v-model="trekForm.end_date" required>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label tm-form-label">Max Altitude</label>
                                <input type="text" class="form-control" v-model="trekForm.max_altitude" placeholder="e.g., 4500m">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label tm-form-label">Base Camp</label>
                                <input type="text" class="form-control" v-model="trekForm.base_camp">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label tm-form-label">Assign Staff</label>
                                <select class="form-select" v-model="trekForm.staff_id">
                                    <option value="">Select Staff</option>
                                    <option v-for="s in staffList" :key="s.id" :value="s.id">{{ s.name }}</option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label tm-form-label">Status</label>
                                <select class="form-select" v-model="trekForm.status">
                                    <option>Pending</option>
                                    <option>Open</option>
                                    <option>Closed</option>
                                    <option>Completed</option>
                                </select>
                            </div>
                            <div class="col-12">
                                <label class="form-label tm-form-label">Description</label>
                                <textarea class="form-control" v-model="trekForm.description" rows="3" placeholder="Describe the trek route and highlights..."></textarea>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" @click="saveTrek">{{ editingTrek ? 'Update Trek' : 'Create Trek' }}</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="modal fade" id="staffModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header" style="background: var(--tm-primary-dark); color: #fff;">
                        <h5 class="modal-title">Add New Staff Member</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label tm-form-label">Full Name *</label>
                            <input type="text" class="form-control" v-model="staffForm.name" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label tm-form-label">Email *</label>
                            <input type="email" class="form-control" v-model="staffForm.email" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label tm-form-label">Phone *</label>
                            <input type="tel" class="form-control" v-model="staffForm.phone" required pattern="[0-9]{10}">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" @click="saveStaff">Add Staff</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="modal fade" id="assignModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header" style="background: var(--tm-primary-dark); color: #fff;">
                        <h5 class="modal-title">Assign Trek to {{ selectedStaff ? selectedStaff.name : '' }}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <label class="form-label tm-form-label">Select Trek</label>
                        <select class="form-select" v-model="assignTrekId">
                            <option value="">Choose a trek...</option>
                            <option v-for="t in treks" :key="t.id" :value="t.id">{{ t.name }}</option>
                        </select>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" @click="assignTrek">Assign</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,

    data: function() {
        return {
            activeTab: 'overview',
            tabs: [
                { key: 'overview', label: 'Overview', icon: 'bi-grid-1x2' },
                { key: 'treks', label: 'Treks', icon: 'bi-mountain' },
                { key: 'staff', label: 'Staff', icon: 'bi-person-badge' },
                { key: 'users', label: 'Users', icon: 'bi-people' },
                { key: 'bookings', label: 'Bookings', icon: 'bi-clipboard-check' },
                { key: 'reports', label: 'Reports', icon: 'bi-bar-chart' }
            ],
            stats: {
                total_treks: 0, total_users: 0, total_staff: 0, total_bookings: 0,
                open_treks: 0, completed_treks: 0, active_bookings: 0, completed_bookings: 0
            },
            treks: [],
            staffList: [],
            users: [],
            bookings: [],
            trekSearch: '',
            staffSearch: '',
            userSearch: '',
            bookingSearch: '',
            trekForm: {
                name: '', location: '', difficulty: '', duration: '', max_slots: '',
                price: '', start_date: '', end_date: '', max_altitude: '',
                base_camp: '', staff_id: '', status: 'Pending', description: ''
            },
            editingTrek: null,
            staffForm: { name: '', email: '', phone: '' },
            selectedStaff: null,
            assignTrekId: ''
        };
    },

    computed: {
        filteredTreks: function() {
            if (!this.trekSearch) return this.treks;
            const q = this.trekSearch.toLowerCase();
            return this.treks.filter(function(trek) {
                return trek.name.toLowerCase().indexOf(q) !== -1 || trek.location.toLowerCase().indexOf(q) !== -1;
            });
        },
        filteredStaff: function() {
            if (!this.staffSearch) return this.staffList;
            const q = this.staffSearch.toLowerCase();
            return this.staffList.filter(function(s) {
                return s.name.toLowerCase().indexOf(q) !== -1 || s.email.toLowerCase().indexOf(q) !== -1;
            });
        },
        filteredUsers: function() {
            if (!this.userSearch) return this.users;
            const q = this.userSearch.toLowerCase();
            return this.users.filter(function(u) {
                return u.name.toLowerCase().indexOf(q) !== -1 || u.email.toLowerCase().indexOf(q) !== -1;
            });
        },
        filteredBookings: function() {
            if (!this.bookingSearch) return this.bookings;
            const q = this.bookingSearch.toLowerCase();
            return this.bookings.filter(function(b) {
                return b.user_name.toLowerCase().indexOf(q) !== -1 || b.trek_name.toLowerCase().indexOf(q) !== -1;
            });
        }
    },

    methods: {
        switchTab: function(tabKey) {
            this.activeTab = tabKey;
            if (tabKey === 'overview' || tabKey === 'reports') {
                const self = this;
                setTimeout(function() { self.initCharts(); }, 100);
            }
        },

        getTrekName: function(trekId) {
            const trek = this.treks.find(function(t) { return t.id === trekId; });
            return trek ? trek.name : 'Unknown';
        },

        openAddTrekModal: function() {
            this.editingTrek = null;
            this.trekForm = {
                name: '', location: '', difficulty: '', duration: '', max_slots: '',
                price: '', start_date: '', end_date: '', max_altitude: '',
                base_camp: '', staff_id: '', status: 'Pending', description: ''
            };
            new bootstrap.Modal(document.getElementById('trekModal')).show();
        },

        openEditTrekModal: function(trek) {
            this.editingTrek = trek;
            this.trekForm = {
                name: trek.name, location: trek.location, difficulty: trek.difficulty,
                duration: trek.duration, max_slots: trek.max_slots, price: trek.price,
                start_date: trek.start_date, end_date: trek.end_date,
                max_altitude: trek.max_altitude, base_camp: trek.base_camp,
                staff_id: trek.staff_id, status: trek.status, description: trek.description
            };
            new bootstrap.Modal(document.getElementById('trekModal')).show();
        },

        saveTrek: async function() {
            const self = this;
            const form = this.trekForm;
            if (!form.name || !form.location || !form.difficulty || !form.duration || !form.max_slots || !form.price || !form.start_date || !form.end_date) {
                store.showToast('Please fill all required fields', 'error');
                return;
            }
            try {
                const url = this.editingTrek ? '/treks/' + this.editingTrek.id : '/treks';
                const method = this.editingTrek ? 'PUT' : 'POST';
                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(form)
                });
                const data = await response.json();
                if (response.ok) {
                    store.showToast(data.message, 'success');
                    bootstrap.Modal.getInstance(document.getElementById('trekModal')).hide();
                    self.loadEverything();
                } else {
                    store.showToast(data.error || 'Failed to save trek', 'error');
                }
            } catch (error) {
                store.showToast('Cannot connect to server', 'error');
            }
        },

        deleteTrek: async function(trekId) {
            if (!confirm('Are you sure you want to delete this trek?')) return;
            try {
                const response = await fetch('/treks/' + trekId, { method: 'DELETE' });
                const data = await response.json();
                if (response.ok) {
                    store.showToast(data.message, 'success');
                    this.loadEverything();
                } else {
                    store.showToast(data.error || 'Failed to delete', 'error');
                }
            } catch (error) {
                store.showToast('Cannot connect to server', 'error');
            }
        },

        openAddStaffModal: function() {
            this.staffForm = { name: '', email: '', phone: '' };
            new bootstrap.Modal(document.getElementById('staffModal')).show();
        },

        saveStaff: async function() {
            const form = this.staffForm;
            if (!form.name || !form.email || !form.phone) {
                store.showToast('Please fill all fields', 'error');
                return;
            }
            try {
                const response = await fetch('/staff', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(form)
                });
                const data = await response.json();
                if (response.ok) {
                    store.showToast(data.message, 'success');
                    bootstrap.Modal.getInstance(document.getElementById('staffModal')).hide();
                    this.loadEverything();
                } else {
                    store.showToast(data.error || 'Failed to add staff', 'error');
                }
            } catch (error) {
                store.showToast('Cannot connect to server', 'error');
            }
        },

        openAssignTrekModal: function(staffMember) {
            this.selectedStaff = staffMember;
            this.assignTrekId = '';
            new bootstrap.Modal(document.getElementById('assignModal')).show();
        },

        assignTrek: async function() {
            if (!this.assignTrekId) {
                store.showToast('Please select a trek', 'error');
                return;
            }
            try {
                const response = await fetch('/staff/' + this.selectedStaff.id + '/assign-trek', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ trek_id: parseInt(this.assignTrekId) })
                });
                const data = await response.json();
                if (response.ok) {
                    store.showToast(data.message, 'success');
                    bootstrap.Modal.getInstance(document.getElementById('assignModal')).hide();
                    this.loadEverything();
                } else {
                    store.showToast(data.error || 'Failed to assign', 'error');
                }
            } catch (error) {
                store.showToast('Cannot connect to server', 'error');
            }
        },

        toggleStaffStatus: async function(staffMember) {
            const newStatus = staffMember.status === 'active' ? 'deactivated' : 'active';
            try {
                const response = await fetch('/staff/' + staffMember.id + '/status', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                });
                const data = await response.json();
                if (response.ok) {
                    store.showToast(data.message, 'success');
                    this.loadEverything();
                } else {
                    store.showToast(data.error || 'Failed to update', 'error');
                }
            } catch (error) {
                store.showToast('Cannot connect to server', 'error');
            }
        },

        changeUserStatus: async function(user, newStatus) {
            if (newStatus === 'blacklisted' && !confirm('Blacklist ' + user.name + '?')) return;
            try {
                const response = await fetch('/users/' + user.id + '/status', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                });
                const data = await response.json();
                if (response.ok) {
                    store.showToast('User status updated to ' + newStatus, 'success');
                    this.loadEverything();
                } else {
                    store.showToast(data.error || 'Failed to update', 'error');
                }
            } catch (error) {
                store.showToast('Cannot connect to server', 'error');
            }
        },

        loadEverything: function() {
            this.fetchStats();
            this.fetchTreks();
            this.fetchStaff();
            this.fetchUsers();
            this.fetchBookings();
        },

        fetchStats: async function() {
            try {
                const response = await fetch('/stats/admin');
                this.stats = await response.json();
            } catch (error) {}
        },

        fetchTreks: async function() {
            try {
                const response = await fetch('/treks');
                this.treks = await response.json();
            } catch (error) {
                this.treks = [];
            }
        },

        fetchStaff: async function() {
            try {
                const response = await fetch('/staff');
                this.staffList = await response.json();
            } catch (error) {}
        },

        fetchUsers: async function() {
            try {
                const response = await fetch('/users');
                this.users = await response.json();
            } catch (error) {}
        },

        fetchBookings: async function() {
            try {
                const response = await fetch('/bookings');
                this.bookings = await response.json();
            } catch (error) {}
        },

        initCharts: function() {
            Chart.helpers.each(Chart.instances, function(instance) {
                instance.destroy();
            });

            const ctx1 = document.getElementById('adminChart1');
            if (ctx1) {
                new Chart(ctx1, {
                    type: 'pie',
                    data: {
                        labels: ['Booked', 'Completed', 'Cancelled'],
                        datasets: [{
                            data: [
                                this.stats.active_bookings,
                                this.stats.completed_bookings,
                                this.stats.total_bookings - this.stats.active_bookings - this.stats.completed_bookings
                            ],
                            backgroundColor: ['#2d6a4f', '#457b9d', '#6c757d'],
                            borderWidth: 2, borderColor: '#fff'
                        }]
                    },
                    options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
                });
            }

            const ctx2 = document.getElementById('adminChart2');
            if (ctx2) {
                const easy = this.treks.filter(function(t) { return t.difficulty === 'Easy'; }).length;
                const moderate = this.treks.filter(function(t) { return t.difficulty === 'Moderate'; }).length;
                const hard = this.treks.filter(function(t) { return t.difficulty === 'Hard'; }).length;
                new Chart(ctx2, {
                    type: 'doughnut',
                    data: {
                        labels: ['Easy', 'Moderate', 'Hard'],
                        datasets: [{
                            data: [easy, moderate, hard],
                            backgroundColor: ['#40916c', '#e9c46a', '#d00000'],
                            borderWidth: 2, borderColor: '#fff'
                        }]
                    },
                    options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
                });
            }

            const rctx1 = document.getElementById('reportChart1');
            if (rctx1) {
                const self = this;
                const labels = this.treks.map(function(t) {
                    return t.name.length > 15 ? t.name.substring(0, 15) + '...' : t.name;
                });
                const participants = this.treks.map(function(t) {
                    return self.bookings.filter(function(b) {
                        return b.trek_id === t.id && b.booking_status !== 'Cancelled';
                    }).length;
                });
                new Chart(rctx1, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Participants',
                            data: participants,
                            backgroundColor: 'rgba(45, 106, 79, 0.7)',
                            borderRadius: 6
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
                        plugins: { legend: { display: false } }
                    }
                });
            }

            const rctx2 = document.getElementById('reportChart2');
            if (rctx2) {
                const pending = this.treks.filter(function(t) { return t.status === 'Pending'; }).length;
                const open = this.treks.filter(function(t) { return t.status === 'Open'; }).length;
                const closed = this.treks.filter(function(t) { return t.status === 'Closed'; }).length;
                const completed = this.treks.filter(function(t) { return t.status === 'Completed'; }).length;
                new Chart(rctx2, {
                    type: 'polarArea',
                    data: {
                        labels: ['Pending', 'Open', 'Closed', 'Completed'],
                        datasets: [{
                            data: [pending, open, closed, completed],
                            backgroundColor: [
                                'rgba(233, 196, 106, 0.6)',
                                'rgba(64, 145, 108, 0.6)',
                                'rgba(208, 0, 0, 0.6)',
                                'rgba(69, 123, 157, 0.6)'
                            ]
                        }]
                    },
                    options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
                });
            }
        }
    },

    mounted: async function() {
        if (!store.isLoggedIn || store.currentUser.role !== 'admin') {
            store.showToast('Admin access required', 'error');
            this.$router.push('/');
            return;
        }

        await this.loadEverything();
        const self = this;
        setTimeout(function() { self.initCharts(); }, 300);
    }
};
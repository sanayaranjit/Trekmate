const store = Vue.reactive({
    currentUser: null,
    isLoggedIn: false,
    toasts: [],

    showToast(message, type) {
        if (!type) {
            type = 'success';
        }
        this.toasts.push({ message: message, type: type });
        const self = this;
        setTimeout(function() {
            self.toasts.shift();
        }, 3000);
    },

    login(user) {
        this.currentUser = user;
        this.isLoggedIn = true;
    },

    logout() {
        this.currentUser = null;
        this.isLoggedIn = false;
    },

    async checkSession() {
        try {
            const response = await fetch('/check-session');
            const data = await response.json();
            if (data.logged_in) {
                this.currentUser = data.user;
                this.isLoggedIn = true;
            } else {
                this.currentUser = null;
                this.isLoggedIn = false;
            }
        } catch (error) {
            this.currentUser = null;
            this.isLoggedIn = false;
        }
    }
});
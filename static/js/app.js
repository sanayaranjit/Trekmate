let app = Vue.createApp({
    setup: function() {
        // store.checkSession();
        return {
            store: store,
            toasts: store.toasts 
        };
    }
});

app.config.globalProperties.store = store;

app.component('nav-bar', NavBar);
app.component('landing-page', LandingPage);
app.component('auth-page', AuthPage);
app.component('admin-page', AdminDashboard);
app.component('staff-page', StaffDashboard);
app.component('user-page', UserDashboard);

app.use(router);
store.checkSession().then(() => {
    app.mount('#app');
});
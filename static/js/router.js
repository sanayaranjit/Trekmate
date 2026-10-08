let routes = [
    {
        path: '/',
        component: LandingPage
    },
    {
        path: '/login',
        component: AuthPage
    },
    {
        path: '/register',
        component: AuthPage
    },
    {
        path: '/admin',
        component: AdminDashboard
    },
    {
        path: '/staff',
        component: StaffDashboard
    },
    {
        path: '/user',
        component: UserDashboard
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
];

let router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes: routes
});
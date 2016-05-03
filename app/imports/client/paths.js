export default {
  // The paths the user can see while logged in.
  loggedIn: [
    {title: "Dashboard", path: "/dashboard"},
    {title: "My Events", path: "/myevents"},
    {title: "My Account", path: "/myaccount"},
    {title: "Logout", path: "/logout"}
  ],
  // The paths the user can see while not logged in.
  loggedOut: [
    {title: "Home", path: "/"},
    {title: "Get Started", path: "/login"}
  ]
};
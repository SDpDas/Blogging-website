// Helper function to check if a route is active
function isActiveRoute(route, currentRoute)
{
    return route === currentRoute ? 'active' : '';
}

module.exports = { isActiveRoute };
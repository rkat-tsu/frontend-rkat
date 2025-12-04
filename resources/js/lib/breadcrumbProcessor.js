export function generateBreadcrumbs(urlPath) {
    const cleanPath = urlPath.split('?')[0].split('#')[0].replace(/^\/|\/$/g, '');
    const segments = cleanPath.split('/').filter(segment => segment.length > 0);
    
    const breadcrumbs = [
        { name: 'Home', href: '/dashboard' }
    ];
    
    if (segments.length === 0 || (segments.length === 1 && segments[0] === 'dashboard')) {
        return breadcrumbs;
    }

    let currentPath = '';

    segments.forEach((segment, index) => {
        if (segment.toLowerCase() === 'dashboard' && index === 0) return;

        const name = segment
                        .replace(/-/g, ' ')
                        .split(' ')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');

        currentPath += '/' + segment;
        
        breadcrumbs.push({ 
            name: name, 
            href: currentPath 
        });
    });
    
    return breadcrumbs;
}
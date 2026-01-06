// Simple loader to fetch and transpile JSX files with Babel
async function loadScript(src) {
    try {
        const response = await fetch(src);
        if (!response.ok) {
            throw new Error(`Failed to load ${src}: ${response.statusText}`);
        }
        const code = await response.text();
        const transpiled = Babel.transform(code, { presets: ['react'] }).code;
        
        // Create and execute script element
        const script = document.createElement('script');
        script.textContent = transpiled;
        document.head.appendChild(script);
    } catch (error) {
        console.error(`Error loading ${src}:`, error);
        throw error;
    }
}

// Load scripts in order
(async () => {
    try {
        await loadScript('js/config.js');
        await loadScript('js/utils.js');
        await loadScript('js/supabase.js');
        await loadScript('js/espn.js');
        await loadScript('js/components.js');
        await loadScript('js/app.js');
    } catch (error) {
        console.error('Failed to load application scripts:', error);
        document.getElementById('root').innerHTML = 
            '<div style="padding: 20px; text-align: center; color: red;">' +
            'Error loading application. Please check the console for details.' +
            '</div>';
    }
})();


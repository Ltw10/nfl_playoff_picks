// Simple loader to fetch and transpile JSX files with Babel
async function loadScript(src) {
    try {
        console.log(`Loading ${src}...`);
        // Add cache-busting parameter to force fresh fetch
        const cacheBuster = `?v=${Date.now()}`;
        const url = src.includes('?') ? `${src}&v=${Date.now()}` : `${src}${cacheBuster}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load ${src}: ${response.statusText}`);
        }
        const code = await response.text();
        const transpiled = Babel.transform(code, { presets: ['react'] }).code;
        
        // Execute directly - variables declared with const/let in different
        // script tags are in the same global scope, so we need to avoid redeclarations
        // Create and execute script element
        const script = document.createElement('script');
        script.textContent = transpiled;
        document.head.appendChild(script);
        console.log(`✓ Loaded ${src}`);
    } catch (error) {
        console.error(`✗ Error loading ${src}:`, error);
        throw error;
    }
}

// Load scripts in order
(async () => {
    console.log('🚀 Starting NFL Playoff Picks App...');
    try {
        await loadScript('js/config.js');
        await loadScript('js/utils.js');
        await loadScript('js/supabase.js');
        await loadScript('js/espn.js');
        await loadScript('js/components.js');
        await loadScript('js/app.js');
        console.log('✅ All scripts loaded successfully!');
    } catch (error) {
        console.error('❌ Failed to load application scripts:', error);
        const root = document.getElementById('root');
        if (root) {
            root.innerHTML = 
                '<div style="padding: 20px; text-align: center; color: red; font-family: sans-serif;">' +
                '<h2>Error Loading Application</h2>' +
                '<p>Please check the browser console for details.</p>' +
                '<p style="font-size: 12px; color: #666;">Error: ' + error.message + '</p>' +
                '</div>';
        }
    }
})();


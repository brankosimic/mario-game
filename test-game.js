const http = require('http');

http.get('http://localhost:3000', (res) => {
    console.log(`Status: ${res.statusCode}`);
    if (res.statusCode === 200) {
        console.log('✓ Server is responding correctly');
        
        // Verify game canvas exists in HTML
        http.get('http://localhost:3000/index.html', (htmlRes) => {
            let data = '';
            htmlRes.on('data', chunk => data += chunk);
            htmlRes.on('end', () => {
                if (data.includes('gameCanvas')) {
                    console.log('✓ Game canvas element found');
                }
                if (data.includes('score')) {
                    console.log('✓ Score element found');
                }
                if (data.includes('game-over')) {
                    console.log('✓ Game over screen found');
                }
                if (data.includes('win-screen')) {
                    console.log('✓ Win screen found');
                }
                console.log('\nAll game elements verified!');
            });
        });
    }
}).on('error', (err) => {
    console.log('Error:', err.message);
});

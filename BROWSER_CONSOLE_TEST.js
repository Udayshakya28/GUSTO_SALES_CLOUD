// Copy and paste this ENTIRE script into your browser console on your deployed site
(async function() {
    console.log('🔍 API Route Diagnostic Test\n');
    const baseUrl = window.location.origin;
    const campaignId = 'demo-campaign-1';
    const results = { passed: [], failed: [], errors: [] };

    async function test(name, url, options = {}) {
        try {
            const response = await fetch(url, {
                ...options,
                headers: { 'Content-Type': 'application/json', ...options.headers }
            });
            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                try {
                    data = await response.json();
                } catch (e) {
                    data = { error: 'Failed to parse JSON', status: response.status };
                }
            } else {
                try {
                    data = { text: await response.text() };
                } catch (e) {
                    data = { error: 'Failed to read response', status: response.status };
                }
            }
            const result = { name, url, status: response.status, ok: response.ok, data };
            if (response.ok) {
                console.log(`✅ ${name}: ${response.status}`);
                results.passed.push(result);
            } else {
                console.error(`❌ ${name}: ${response.status}`, data);
                results.failed.push(result);
            }
            return result;
        } catch (e) {
            console.error(`💥 ${name}:`, e.message);
            results.errors.push({ name, error: e.message });
        }
    }

    console.log('📋 Testing Routes...\n');
    
    // Basic routes
    await test('Diagnostic GET', `${baseUrl}/api/diagnostic`);
    await test('Test Route GET', `${baseUrl}/api/test-route`);
    await test('Test Route POST', `${baseUrl}/api/test-route`, { method: 'POST', body: JSON.stringify({test:1}) });
    
    // Analytics (GET)
    await test('Analytics Metrics', `${baseUrl}/api/analytics/metrics/${campaignId}`);
    await test('Analytics Trends', `${baseUrl}/api/analytics/trends/${campaignId}`);
    await test('Analytics Weekly', `${baseUrl}/api/analytics/weekly-activity/${campaignId}`);
    await test('Analytics Subreddit', `${baseUrl}/api/analytics/subreddit-performance/${campaignId}`);
    await test('Analytics Distribution', `${baseUrl}/api/analytics/opportunity-distribution/${campaignId}`);
    
    // Leads
    await test('Leads Campaign', `${baseUrl}/api/leads/campaign/${campaignId}?intent=all&page=1&limit=1000`);
    
    // Discovery (POST - problematic)
    await test('Discovery POST', `${baseUrl}/api/leads/discover/manual/${campaignId}`, { method: 'POST', body: JSON.stringify({}) });
    
    // Campaigns
    await test('Campaign GET', `${baseUrl}/api/campaigns/${campaignId}`);
    await test('Campaign PATCH', `${baseUrl}/api/campaigns/${campaignId}`, { method: 'PATCH', body: JSON.stringify({name:'test'}) });
    
    // OPTIONS
    await test('Discovery OPTIONS', `${baseUrl}/api/leads/discover/manual/${campaignId}`, { method: 'OPTIONS' });

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Passed: ${results.passed.length} | ❌ Failed: ${results.failed.length} | 💥 Errors: ${results.errors.length}`);
    
    const method405 = results.failed.filter(r => r.status === 405);
    const notFound = results.failed.filter(r => r.status === 404);
    
    if (method405.length > 0) {
        console.log('\n⚠️  405 ERRORS (Method Not Allowed):');
        method405.forEach(r => console.log(`   - ${r.name}`));
        console.log('\n🔧 SOLUTION: Redeploy in Vercel WITHOUT build cache');
    }
    
    if (notFound.length > 0) {
        console.log('\n⚠️  404 ERRORS (Not Found):');
        notFound.forEach(r => console.log(`   - ${r.name}`));
        console.log('\n🔧 SOLUTION: Routes not deployed - check Vercel build logs');
    }
    
    window.testResults = results;
    console.log('\n💾 Results saved to window.testResults');
    return results;
})();


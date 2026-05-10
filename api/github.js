// api/github.js
export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_API = 'https://api.github.com/repos/n4taza/dev-id/contents/device-id.json';
    
    if (!GITHUB_TOKEN) {
        return res.status(500).json({ error: 'GITHUB_TOKEN not configured' });
    }
    
    try {
        // GET: Ambil daftar device
        if (req.method === 'GET') {
            const response = await fetch(GITHUB_API, {
                headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
            });
            
            if (response.status === 404) {
                return res.status(200).json({ devices: [], sha: null });
            }
            
            const data = await response.json();
            const content = Buffer.from(data.content, 'base64').toString();
            const devicesData = JSON.parse(content);
            
            return res.status(200).json({
                devices: devicesData.devices || [],
                sha: data.sha,
                last_updated: devicesData.last_updated
            });
        }
        
        // POST: Tambah device
        if (req.method === 'POST') {
            const { deviceId } = req.body;
            
            if (!deviceId) {
                return res.status(400).json({ error: 'Device ID required' });
            }
            
            // Ambil file saat ini
            const getResponse = await fetch(GITHUB_API, {
                headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
            });
            
            let sha = null;
            let devices = [];
            
            if (getResponse.status === 200) {
                const data = await getResponse.json();
                const content = Buffer.from(data.content, 'base64').toString();
                const devicesData = JSON.parse(content);
                devices = devicesData.devices || [];
                sha = data.sha;
            }
            
            // Cek duplikat
            if (devices.includes(deviceId)) {
                return res.status(400).json({ error: 'Device already registered' });
            }
            
            // Tambah device
            devices.push(deviceId);
            const newData = {
                devices: devices,
                last_updated: new Date().toISOString(),
                total_devices: devices.length
            };
            
            const content = Buffer.from(JSON.stringify(newData, null, 2)).toString('base64');
            
            const putResponse = await fetch(GITHUB_API, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Add device: ${deviceId}`,
                    content: content,
                    sha: sha
                })
            });
            
            if (putResponse.status === 200 || putResponse.status === 201) {
                return res.status(200).json({ success: true, devices: devices });
            } else {
                const error = await putResponse.json();
                return res.status(500).json({ error: error.message });
            }
        }
        
        // DELETE: Hapus device
        if (req.method === 'DELETE') {
            const { deviceId } = req.body;
            
            if (!deviceId) {
                return res.status(400).json({ error: 'Device ID required' });
            }
            
            const getResponse = await fetch(GITHUB_API, {
                headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
            });
            
            if (getResponse.status !== 200) {
                return res.status(404).json({ error: 'File not found' });
            }
            
            const data = await getResponse.json();
            const content = Buffer.from(data.content, 'base64').toString();
            const devicesData = JSON.parse(content);
            
            const newDevices = devicesData.devices.filter(d => d !== deviceId);
            
            if (newDevices.length === devicesData.devices.length) {
                return res.status(404).json({ error: 'Device not found' });
            }
            
            const newData = {
                devices: newDevices,
                last_updated: new Date().toISOString(),
                total_devices: newDevices.length
            };
            
            const newContent = Buffer.from(JSON.stringify(newData, null, 2)).toString('base64');
            
            const putResponse = await fetch(GITHUB_API, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Delete device: ${deviceId}`,
                    content: newContent,
                    sha: data.sha
                })
            });
            
            if (putResponse.status === 200 || putResponse.status === 201) {
                return res.status(200).json({ success: true, devices: newDevices });
            } else {
                const error = await putResponse.json();
                return res.status(500).json({ error: error.message });
            }
        }
        
        return res.status(405).json({ error: 'Method not allowed' });
        
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

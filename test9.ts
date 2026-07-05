import fetch from 'node-fetch';
const token = 'pit-5988b1f2-2c89-497d-ba07-342d4f155ba0';

async function checkScopes() {
  const endpoints = [
    '/locations/search',
    '/users/search?companyId=p5xdp384C09Px2pfMeRi',
    '/conversations/search?locationId=xKhOIocfzTKHxxiJzHm0',
    '/contacts/?locationId=xKhOIocfzTKHxxiJzHm0',
    '/businesses/search?companyId=p5xdp384C09Px2pfMeRi',
  ];

  for (const ep of endpoints) {
    const res = await fetch(`https://services.leadconnectorhq.com${ep}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Version': '2021-07-28'
      }
    });
    console.log(`Endpoint: ${ep}`);
    console.log(`Status: ${res.status}`);
  }
}
checkScopes();

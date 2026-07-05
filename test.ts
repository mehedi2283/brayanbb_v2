import fetch from 'node-fetch';

const token = 'pit-5988b1f2-2c89-497d-ba07-342d4f155ba0';
const locationId = 'xKhOIocfzTKHxxiJzHm0';
const companyId = 'p5xdp384C09Px2pfMeRi';

async function test() {
  console.log("Testing Voice AI with Agency Token + Company-Id...");
  try {
    const res = await fetch(`https://services.leadconnectorhq.com/voice-ai/dashboard/call-logs?locationId=${locationId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Version': 'v3',
        'Company-Id': companyId,
        'Accept': 'application/json'
      }
    });
    console.log("Status:", res.status);
    console.log("Data:", await res.json());
  } catch (e) {
    console.error(e);
  }
}
test();

import fetch from 'node-fetch';
const token = 'pit-5988b1f2-2c89-497d-ba07-342d4f155ba0';
fetch('https://services.leadconnectorhq.com/users/?locationId=xKhOIocfzTKHxxiJzHm0', {
  headers: {
    'Authorization': 'Bearer ' + token,
    'Version': '2021-07-28'
  }
}).then(r => r.json()).then(console.log).catch(console.error);

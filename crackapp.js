const url = "https://gofans.cn/limited/ios";

const headers = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36"
};

if (typeof $task !== 'undefined') {

  $task.fetch({ url: url, headers: headers }).then(response => {
    handleResponse(response.body);
  }, reason => {
    console.log('Khong lay duoc thong tin ung dung:', reason.error);
    $done();
  });
} else if (typeof $httpClient !== 'undefined' && typeof $notification !== 'undefined') {

  $httpClient.get({ url: url, headers: headers }, function (error, response, body) {
    if (error) {
      console.log('Khong lay duoc thong tin ung dung:', error);
      $done();
      return;
    }
    handleResponse(body);
  });
} else if (typeof $request !== 'undefined' && typeof $notify !== 'undefined') {

  $httpClient.get({ url: url, headers: headers }, function (error, response, body) {
    if (error) {
      console.log('Khong lay duoc thong tin ung dung:', error);
      $done();
      return;
    }
    handleResponse(body, $request.headers);
  });
} else {
  console.log('Moi truong chay tap lenh khong xac dinh');
  $done();
}

function handleResponse(body, requestHeaders) {
  const appList = parseAppList(body);
  const freeAppList = appList.filter(app => app.price === "Free");

  let notificationContent = '';
  const appCount = requestHeaders ? parseInt(requestHeaders['appCount']) || 8 : 8;
  for (let i = 0; i < freeAppList.length && i < appCount; i++) {
    const app = freeAppList[i];
    const description = truncateDescription(app.description, 30);
    notificationContent += `🆓${app.name}｜giagoc${app.originalPrice}\n`;
  }

  if (typeof $notify !== 'undefined') {

    $notify("AppStore gioi han ung dung mien phi", '', notificationContent);
  } else if (typeof $notification !== 'undefined') {

    $notification.post("AppStore gioi han ung dung mien phi", '', notificationContent);
  } else {
    console.log('Chuc nang thong bao khong xac dinh');
  }

  $done();
}

function parseAppList(html) {
  const regex = /<div[^>]+class="column[^"]*"[^>]*>[\s\S]*?<strong[^>]+class="title[^"]*"[^>]*>(.*?)<\/strong>[\s\S]*?<b[^>]*>(.*?)<\/b>[\s\S]*?<div[^>]+class="price-original[^"]*"[^>]*>[^<]*<del[^>]*>(.*?)<\/del>[\s\S]*?<p[^>]+class="intro[^"]*"[^>]*>([\s\S]*?)<\/p>/g;
  const appList = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    const name = match[1];
    const price = match[2];
    const originalPrice = parseFloat(match[3]).toFixed(1);
    const description = match[4].replace(/<.*?>/g, '').replace(/\n+/g, ' ').trim();
    appList.push({
      name: name,
      price: price,
      originalPrice: originalPrice,
      description: description,
    });
  }
  return appList;
}

function truncateDescription(description, maxLength) {
  if (description.length > maxLength) {
    return description.substring(0, maxLength) + '…';
  }
  return description;
}

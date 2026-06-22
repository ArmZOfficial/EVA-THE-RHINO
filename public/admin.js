let appData = {};
let currentPassword = '';

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = type === 'success' ? `✅ ${message}` : `❌ ${message}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

async function login() {
  const pwd = document.getElementById('password').value;
  if (!pwd) {
    showToast('Please enter password', 'error');
    return;
  }
  
  try {
    const res = await fetch('/api/data');
    if (res.ok) {
      appData = await res.json();
      currentPassword = pwd;
      document.getElementById('login-section').style.display = 'none';
      document.getElementById('admin-section').style.display = 'block';
      showToast('Login successful', 'success');
      populateForm();
    } else {
      showToast('Failed to load data', 'error');
    }
  } catch (err) {
    showToast('Server error', 'error');
  }
}

function populateForm() {
  // Populate flat inputs
  const flatFields = [
    'general.name', 'general.tagline', 'general.window', 'general.bio',
    'overview.totalFollowers', 'overview.totalFollowersGrowth', 'overview.views', 'overview.engagement', 'overview.watchTime',
    'tiktokStats.followers', 'tiktokStats.videoViews', 'tiktokStats.totalViewers', 'tiktokStats.likes', 'tiktokStats.shares', 'tiktokStats.profileViews', 'tiktokStats.male', 'tiktokStats.female', 'tiktokStats.thai',
    'youtubeStats.views', 'youtubeStats.impressions', 'youtubeStats.ctr', 'youtubeStats.watchHrs', 'youtubeStats.avgView', 'youtubeStats.fromShorts',
    'ageStats.age2534', 'ageStats.age3544', 'ageStats.age1824', 'ageStats.age4554', 'ageStats.age1317',
    'growthChart.start', 'growthChart.end', 'growthChart.diff',
    'location.mainPercent', 'location.mainCountry', 'location.others',
    'activeHours.peakStart', 'activeHours.peakEnd'
  ];

  flatFields.forEach(field => {
    const el = document.getElementById(field);
    if (el) {
      const parts = field.split('.');
      el.value = appData[parts[0]][parts[1]] || '';
    }
  });

  // Populate Top Perf
  const perfContainer = document.getElementById('top-perf-container');
  perfContainer.innerHTML = '';
  appData.topPerformance.forEach((item, index) => {
    perfContainer.innerHTML += `
      <div class="list-item">
        <strong>Item ${index + 1}</strong>
        <div class="row" style="margin-bottom: 10px; margin-top: 5px;">
          <div class="col" style="display:flex; gap:10px;">
            <input type="text" id="perf_${index}_url" placeholder="Paste TikTok URL here to auto-fill (Optional)" style="flex:1;" value="${item.url || ''}">
            <button type="button" class="btn" onclick="fetchTikTok(${index})" style="padding: 5px 15px; font-size: 14px;">Fetch from TikTok</button>
          </div>
        </div>
        <div class="row">
          <div class="col"><label>Title</label><input type="text" id="perf_${index}_title" value="${item.title}"></div>
          <div class="col"><label>Views</label><input type="text" id="perf_${index}_views" value="${item.views}"></div>
          <div class="col"><label>Type</label><input type="text" id="perf_${index}_type" value="${item.type}"></div>
        </div>
        <div class="row" style="margin-top:10px;">
          <div class="col"><label>Thumbnail URL</label><input type="text" id="perf_${index}_thumbnail" value="${item.thumbnail || ''}"></div>
        </div>
        <div id="perf_${index}_status" style="font-size:12px; margin-top:5px; font-weight:bold;"></div>
      </div>
    `;
  });

  // Populate Rate Card
  const rateContainer = document.getElementById('rate-card-container');
  rateContainer.innerHTML = '';
  appData.rateCard.forEach((item, index) => {
    rateContainer.innerHTML += `
      <div class="list-item">
        <strong>Package ${index + 1}</strong>
        <div class="row">
          <div class="col"><label>Name</label><input type="text" id="rate_${index}_name" value="${item.name}"></div>
          <div class="col"><label>Price</label><input type="text" id="rate_${index}_price" value="${item.price}"></div>
        </div>
      </div>
    `;
  });
}

async function fetchTikTok(index) {
  const urlEl = document.getElementById(`perf_${index}_url`);
  const url = urlEl.value;
  
  if (!url) {
    showToast("Please paste a URL first.", "error");
    return;
  }
  
  showToast("Fetching...", "success");
  
  try {
    const res = await fetch(`/api/tiktok-info?url=${encodeURIComponent(url)}`);
    const data = await res.json();
    
    if (res.ok && data.title) {
      document.getElementById(`perf_${index}_title`).value = data.title;
      document.getElementById(`perf_${index}_thumbnail`).value = data.thumbnail_url || '';
      if (data.views !== undefined) {
        document.getElementById(`perf_${index}_views`).value = data.views.toLocaleString('en-US');
      }
      showToast("Fetch successful!", "success");
    } else {
      showToast("Failed to fetch data from TikTok.", "error");
    }
  } catch (err) {
    showToast("Network error.", "error");
  }
}

async function saveData() {

  try {
    // Gather flat fields
    const flatFields = [
      'general.name', 'general.tagline', 'general.window', 'general.bio',
      'overview.totalFollowers', 'overview.totalFollowersGrowth', 'overview.views', 'overview.engagement', 'overview.watchTime',
      'tiktokStats.followers', 'tiktokStats.videoViews', 'tiktokStats.totalViewers', 'tiktokStats.likes', 'tiktokStats.shares', 'tiktokStats.profileViews', 'tiktokStats.male', 'tiktokStats.female', 'tiktokStats.thai',
      'youtubeStats.views', 'youtubeStats.impressions', 'youtubeStats.ctr', 'youtubeStats.watchHrs', 'youtubeStats.avgView', 'youtubeStats.fromShorts',
      'ageStats.age2534', 'ageStats.age3544', 'ageStats.age1824', 'ageStats.age4554', 'ageStats.age1317',
      'growthChart.start', 'growthChart.end', 'growthChart.diff',
      'location.mainPercent', 'location.mainCountry', 'location.others',
      'activeHours.peakStart', 'activeHours.peakEnd'
    ];

    flatFields.forEach(field => {
      const el = document.getElementById(field);
      if (el) {
        const parts = field.split('.');
        if(appData[parts[0]]) {
           appData[parts[0]][parts[1]] = el.value;
        }
      }
    });

    // Gather Top Perf
    if (appData.topPerformance) {
      appData.topPerformance.forEach((item, index) => {
        const titleEl = document.getElementById(`perf_${index}_title`);
        const viewsEl = document.getElementById(`perf_${index}_views`);
        const typeEl = document.getElementById(`perf_${index}_type`);
        const thumbEl = document.getElementById(`perf_${index}_thumbnail`);
        const urlEl = document.getElementById(`perf_${index}_url`);
        if (titleEl) item.title = titleEl.value;
        if (viewsEl) item.views = viewsEl.value;
        if (typeEl) item.type = typeEl.value;
        if (thumbEl) item.thumbnail = thumbEl.value;
        if (urlEl) item.url = urlEl.value;
      });
    }

    // Gather Rate Card
    if (appData.rateCard) {
      appData.rateCard.forEach((item, index) => {
        const nameEl = document.getElementById(`rate_${index}_name`);
        const priceEl = document.getElementById(`rate_${index}_price`);
        if (nameEl) item.name = nameEl.value;
        if (priceEl) item.price = priceEl.value;
      });
    }
  } catch (err) {
    console.error(err);
    showToast('Error gathering data: ' + err.message, 'error');
    return;
  }

  // Send request
  try {
    const res = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: currentPassword, data: appData })
    });

    const result = await res.json();
    if (res.ok && result.success) {
      showToast('บันทึกข้อมูลเรียบร้อยแล้ว! (Saved Successfully!)', 'success');
    } else {
      showToast('Error: ' + (result.error || 'Failed to save.'), 'error');
    }
  } catch (err) {
    showToast('Network error while saving data.', 'error');
  }
}

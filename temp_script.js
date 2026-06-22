
    function animateNumber(id, endStr, duration = 1500) {
      const el = document.getElementById(id);
      if (!el) return;
      const endNum = parseFloat(endStr.replace(/,/g, '').replace(/%/g, '').replace(/[a-zA-Z]/g, ''));
      if (isNaN(endNum)) {
        el.innerText = endStr;
        return;
      }
      const isFloat = endStr.includes('.');
      const hasPercent = endStr.includes('%');
      let suffix = hasPercent ? '%' : '';
      if (!hasPercent && endStr.match(/[a-zA-Z]/)) suffix = endStr.match(/[a-zA-Z]/)[0];

      const startTime = performance.now();
      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = endNum * ease;

        let output;
        if (isFloat) output = current.toFixed(1);
        else output = Math.floor(current).toLocaleString('en-US');
        
        el.innerText = output + suffix;
        if (progress < 1) requestAnimationFrame(update);
        else el.innerText = endStr; // Final value
      }
      requestAnimationFrame(update);
    }

    function initScrollAnimations() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      }, { threshold: 0.1 });

      document.querySelectorAll('.animate-on-scroll').forEach((el) => {
        observer.observe(el);
      });
    }

    async function loadData() {
      try {
        const res = await fetch('/api/data');
        const data = await res.json();

        // General
        document.getElementById('tagline').innerText = data.general.tagline;
        document.getElementById('window').innerText = data.general.window;
        document.getElementById('tiktokHandle').innerText = data.general.tiktokHandle;
        document.getElementById('tiktokHandle').href = data.general.tiktokUrl;
        document.getElementById('youtubeHandle').innerText = data.general.youtubeHandle;
        document.getElementById('youtubeHandle').href = data.general.youtubeUrl;
        document.getElementById('bio').innerText = data.general.bio;

        // Overview
        animateNumber('totalFollowers', data.overview.totalFollowers);
        document.getElementById('totalFollowersGrowth').innerText = data.overview.totalFollowersGrowth;
        animateNumber('views', data.overview.views);
        document.getElementById('engagement').innerText = data.overview.engagement;
        animateNumber('watchTime', data.overview.watchTime);

        // TikTok
        animateNumber('tk_followers', data.tiktokStats.followers);
        animateNumber('tk_videoViews', data.tiktokStats.videoViews);
        animateNumber('tk_totalViewers', data.tiktokStats.totalViewers);
        animateNumber('tk_likes', data.tiktokStats.likes);
        animateNumber('tk_shares', data.tiktokStats.shares);
        animateNumber('tk_profileViews', data.tiktokStats.profileViews);
        document.getElementById('tk_male').innerText = data.tiktokStats.male + '%';
        document.getElementById('tk_female').innerText = data.tiktokStats.female + '%';
        document.getElementById('tk_thai').innerText = data.tiktokStats.thai + '%';

        // YouTube
        animateNumber('yt_views', data.youtubeStats.views);
        animateNumber('yt_impressions', data.youtubeStats.impressions);
        animateNumber('yt_ctr', data.youtubeStats.ctr);
        animateNumber('yt_watchHrs', data.youtubeStats.watchHrs);
        document.getElementById('yt_avgView').innerText = data.youtubeStats.avgView;
        animateNumber('yt_fromShorts', data.youtubeStats.fromShorts);
        document.getElementById('yt_male').innerText = data.youtubeStats.male + '%';
        document.getElementById('yt_female').innerText = data.youtubeStats.female + '%';

        // Graphs Data Binding
        animateNumber('growthStart', data.growthChart.start);
        animateNumber('growthEnd', data.growthChart.end);
        document.getElementById('growthDiff').innerText = data.growthChart.diff;

        animateNumber('bar_tk_male_val', data.tiktokStats.male);
        animateNumber('bar_tk_female_val', data.tiktokStats.female);
        animateNumber('bar_yt_male_val', data.youtubeStats.male);
        animateNumber('bar_yt_female_val', data.youtubeStats.female);

        animateNumber('age_2534_val', data.ageStats.age2534 + '%');
        animateNumber('age_3544_val', data.ageStats.age3544 + '%');
        animateNumber('age_1824_val', data.ageStats.age1824 + '%');
        animateNumber('age_4554_val', data.ageStats.age4554 + '%');
        animateNumber('age_1317_val', data.ageStats.age1317 + '%');

        setTimeout(() => {
          document.getElementById('bar_tk_male').style.width = data.tiktokStats.male + '%';
          document.getElementById('bar_tk_female').style.width = data.tiktokStats.female + '%';
          document.getElementById('bar_yt_male').style.width = data.youtubeStats.male + '%';
          document.getElementById('bar_yt_female').style.width = data.youtubeStats.female + '%';
          
          document.getElementById('age_2534_bar').style.width = data.ageStats.age2534 + '%';
          document.getElementById('age_3544_bar').style.width = data.ageStats.age3544 + '%';
          document.getElementById('age_1824_bar').style.width = data.ageStats.age1824 + '%';
          document.getElementById('age_4554_bar').style.width = data.ageStats.age4554 + '%';
          document.getElementById('age_1317_bar').style.width = data.ageStats.age1317 + '%';
          
          const hBars = document.querySelectorAll('.h-bar');
          hBars.forEach(bar => {
            bar.style.height = bar.getAttribute('data-height');
          });
        }, 100);

        animateNumber('loc_percent', data.location.mainPercent);
        document.getElementById('loc_main').innerText = data.location.mainCountry;
        document.getElementById('loc_others').innerText = 'ส่วนที่เหลือ ' + (100 - parseInt(data.location.mainPercent)) + '% — ' + data.location.others;

        document.getElementById('active_start').innerText = data.activeHours.peakStart;
        document.getElementById('active_end').innerText = data.activeHours.peakEnd;

        const perfCards = document.getElementById('perf-cards-container');
        perfCards.innerHTML = '';
        data.topPerformance.forEach((p, i) => {
          let thumbHtml = p.thumbnail ? `<div class="perf-thumb" style="background-image: url('${p.thumbnail}'); background-size: cover; background-position: center;"><div class="perf-badge">0${i+1}</div></div>` : `<div class="perf-thumb"><div class="perf-badge">0${i+1}</div><div class="thumb-icon">🖼️</div><div class="thumb-text">ลากรูป thumbnail</div></div>`;
          perfCards.innerHTML += `<div class="perf-card">${thumbHtml}<div class="perf-info"><div class="p-views">${p.views} <span class="p-view-lbl">VIEWS</span></div><div class="p-title">${p.url ? `<a href="${p.url}" target="_blank" class="title-link">${p.title}</a>` : p.title}</div><div class="p-type">${p.type}</div></div></div>`;
        });

        const rateTable = document.getElementById('rate-table-container');
        rateTable.innerHTML = `
          <div class="r-row r-header">
            <div>แพ็กเกจ / DELIVERABLE</div>
            <div class="r-price-col">ราคา (THB)</div>
          </div>
        `;
        data.rateCard.forEach(r => {
          let extraClass = '';
          let nameHtml = r.name;
          let priceHtml = r.price;

          if (r.isBundle) extraClass = 'dark';
          if (r.isMain) {
            extraClass = 'highlight';
            nameHtml += ' <span class="r-tag">★ จุดขายหลัก</span>';
            priceHtml = '<span class="accent-red">' + r.price + '</span>';
          }
          if (r.startFrom) {
            priceHtml = '<span class="r-start">Start from</span><br>' + r.price;
          }

          rateTable.innerHTML += `
            <div class="r-row ${extraClass}">
              <div class="r-name">${nameHtml}</div>
              <div class="r-price">${priceHtml}</div>
            </div>
          `;
        });

        // Booking
        document.getElementById('contact_email').innerText = data.termsBooking.email;
        document.getElementById('contact_discord').innerText = data.termsBooking.discord;

      } catch (e) {
        console.error('Failed to load data', e);
      }
    }

    // Load data on start
    loadData();
  
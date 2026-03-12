(function () {
  'use strict';

  const API_URL = "./Api.json";

  /* ── Navbar burger ── */
  const burger   = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');
  if (burger && navLinks) {
    burger.addEventListener('click', () => navLinks.classList.toggle('open'));
  }

  /* ── Helpers ── */
  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    } catch {
      return dateStr.split("T")[0];
    }
  };

  /* ── Card templates — wrapped in <a> for navigation ── */
  const createNewsCard = ({ image_url, author, title, published_at }, idx, options = {}) => {
    const { bgColor = "" } = options;
    return `
      <a href="article.html?id=${idx}" class="card-link">
        <div class="news-card" style="background-image:url('${image_url}');">
          <div class="tag-badge" style="position:absolute;top:14px;right:14px;z-index:2;">
            <p class="tag-text">${author}</p>
          </div>
          <div class="news-card-body" style="${bgColor ? `background:${bgColor};padding:16px 20px;margin:-16px;width:calc(100% + 32px);` : ''}">
            <ul class="meta-list"><li>${formatDate(published_at)}</li></ul>
            <p class="news-heading">${title}</p>
          </div>
        </div>
      </a>`;
  };

  const createLatestCard = ({ image_url, author, title, published_at }, idx) => `
    <div class="col-md-3 col-sm-6" style="margin-bottom:30px;">
      <a href="article.html?id=${idx}" class="card-link">
        <div class="latest-card">
          <div class="latest-card-img" style="background-image:url('${image_url}')">
            <div class="tag-badge" style="position:absolute;top:12px;left:12px;z-index:1;">${author}</div>
          </div>
          <div class="latest-card-body">
            <ul class="meta-list" style="color:#7A7A7A;margin-bottom:6px;">
              <li>${formatDate(published_at)}</li>
            </ul>
            <p class="news-heading" style="color:#111;font-size:15px;">${title}</p>
          </div>
        </div>
      </a>
    </div>`;

  /* ── Render hero grid ── */
  const renderHeroGrid = (articles) => {
    const leftEl   = document.getElementById("leftNews");
    const centerEl = document.getElementById("centerNews");
    const rightEl  = document.getElementById("rightNews");
    if (!leftEl || !centerEl || !rightEl) return;

    articles.slice(0, 2).forEach((item, i) => {
      leftEl.innerHTML += createNewsCard(item, i);
    });

    const fi = 4;
    const featured = articles[fi] || articles[0];
    centerEl.innerHTML = `
      <a href="article.html?id=${fi}" class="card-link">
        <div class="news-card" style="background-image:url('${featured.image_url}');aspect-ratio:2/3;">
          <div class="tag-badge" style="position:absolute;top:14px;right:14px;z-index:2;">
            <p class="tag-text">${featured.author}</p>
          </div>
          <div class="news-card-body" style="background:rgba(232,50,31,0.92);padding:20px;margin:-16px;width:calc(100% + 32px);">
            <ul class="meta-list"><li>${formatDate(featured.published_at)}</li></ul>
            <p class="news-heading" style="font-size:20px;">${featured.title}</p>
          </div>
        </div>
      </a>`;

    articles.slice(2, 4).forEach((item, i) => {
      rightEl.innerHTML += createNewsCard(item, i + 2);
    });
  };

  /* ── Render latest posts ── */
  const renderLatestPosts = (articles) => {
    const latestEl = document.getElementById("latest");
    if (!latestEl) return;
    articles.slice(0, 4).forEach((item, i) => {
      latestEl.innerHTML += createLatestCard(item, i);
    });
  };

  /* ── Scroll reveal ── */
  const initScrollReveal = () => {
    const style = document.createElement('style');
    style.textContent = `
      .sr { opacity:0; transform:translateY(24px); transition:opacity 0.6s ease, transform 0.6s ease; }
      .sr.visible { opacity:1; transform:translateY(0); }
    `;
    document.head.appendChild(style);

    document.querySelectorAll('.latest-card,.featured-card,.card-overlay,.news-list-item,.photo-grid-item')
      .forEach((el, i) => {
        el.classList.add('sr');
        el.style.transitionDelay = `${(i % 4) * 0.08}s`;
      });

    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.sr').forEach(el => observer.observe(el));
  };

  /* ── Navbar scroll shadow ── */
  const initNavbar = () => {
    const navbar = document.querySelector('.top-navbar') || document.querySelector('.navbar-section');
    if (!navbar) return;
    window.addEventListener('scroll', () => {
      navbar.style.boxShadow = window.scrollY > 10 ? '0 2px 20px rgba(0,0,0,0.1)' : 'none';
    }, { passive: true });
  };

  /* ── Init ── */
  const init = async () => {
    initNavbar();
    try {
      const res      = await fetch(API_URL);
      const data     = await res.json();
      const articles = Array.isArray(data) ? data : data.articles;
      if (!articles || !articles.length) return;

      renderHeroGrid(articles);
      renderLatestPosts(articles);
      requestAnimationFrame(initScrollReveal);
    } catch (err) {
      console.error("API xətası:", err);
    }
  };

  document.addEventListener('DOMContentLoaded', init);
})();
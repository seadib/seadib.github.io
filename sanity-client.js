// sanity-client.js — High-performance Sanity Edge CDN Client & Full-Site CMS Hydrator for adi.pro.bd
import { createClient } from 'https://esm.sh/@sanity/client@6.28.2';
import { toHTML } from 'https://esm.sh/@portabletext/to-html@2.0.13';

// 1. Sanity Project Configuration
export const SANITY_CONFIG = {
  projectId: '48js0nln',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
};

export const sanityClient = createClient(SANITY_CONFIG);

// Image asset URL builder
export function getSanityImageUrl(source) {
  if (!source) return null;
  if (typeof source === 'string') return source;
  if (source.asset && source.asset._ref) {
    const ref = source.asset._ref;
    // Format: image-5b800e...-1200x800-jpg
    const parts = ref.replace('image-', '').replace(/-([a-z]+)$/, '.$1');
    return `https://cdn.sanity.io/images/${SANITY_CONFIG.projectId}/${SANITY_CONFIG.dataset}/${parts}`;
  }
  return null;
}

// 2. Media Link Parsers
export function parseYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export function parseGoogleDriveId(url) {
  if (!url) return null;
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

// 3. Custom Portable Text Serializers
export const portableTextComponents = {
  types: {
    youtubeEmbed: ({ value }) => {
      const videoId = parseYouTubeId(value?.url);
      if (!videoId) return '';
      return `
        <div class="video-responsive">
          <iframe src="https://www.youtube.com/embed/${videoId}" title="${value.caption || 'YouTube Video'}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
        ${value.caption ? `<span class="blog-caption">// ${value.caption}</span>` : ''}
      `;
    },

    googleDriveEmbed: ({ value }) => {
      const fileId = parseGoogleDriveId(value?.shareUrl);
      if (!fileId) return '';

      if (value.mediaType === 'pdf') {
        return `
          <div class="pdf-viewer-embed">
            <iframe src="https://drive.google.com/file/d/${fileId}/preview"></iframe>
          </div>
          <div class="pdf-download-action">
            <span>📄 ${value.title || 'Google Drive PDF Document'}</span>
            <a href="https://drive.google.com/u/0/uc?id=${fileId}&export=download" target="_blank" class="pdf-btn">Download PDF</a>
          </div>
        `;
      }

      return `
        <div class="video-responsive">
          <iframe src="https://drive.google.com/file/d/${fileId}/preview" allow="autoplay"></iframe>
        </div>
        ${value.title ? `<span class="blog-caption">// ${value.title}</span>` : ''}
      `;
    },

    megaDriveEmbed: ({ value }) => `
      <div class="file-attachment-card">
        <div class="file-card-info">
          <span class="file-name">🔴 MEGA: ${value.fileName || 'Cloud File'}</span>
          <span class="file-meta">${value.fileSize || 'Cloud File'} • Direct Cloud Download</span>
        </div>
        <a href="${value.megaUrl}" target="_blank" rel="noopener noreferrer" class="file-download-btn">Open on Mega</a>
      </div>
    `,

    audioEmbed: ({ value }) => {
      const audioUrl = value?.audioFile?.asset?._ref ?
        `https://cdn.sanity.io/files/${SANITY_CONFIG.projectId}/${SANITY_CONFIG.dataset}/${value.audioFile.asset._ref.replace('file-', '').replace('-mp3', '.mp3')}` :
        value?.externalUrl;

      return `
        <div class="blog-audio-card">
          <div class="audio-card-header">
            <div class="audio-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
            </div>
            <div class="audio-meta-text">
              <span class="audio-title">${value.title || 'Audio Recording'}</span>
              <span class="audio-artist">// ${value.speaker || 'SE Adib'}</span>
            </div>
            ${value.duration ? `<span class="audio-duration-badge">${value.duration}</span>` : ''}
          </div>
          <audio controls class="blog-audio-element">
            <source src="${audioUrl || ''}" type="audio/mpeg">
            Your browser does not support audio element.
          </audio>
        </div>
      `;
    },

    pdfViewer: ({ value }) => {
      const pdfUrl = value?.pdfFile?.asset?._ref ?
        `https://cdn.sanity.io/files/${SANITY_CONFIG.projectId}/${SANITY_CONFIG.dataset}/${value.pdfFile.asset._ref.replace('file-', '').replace('-pdf', '.pdf')}` :
        value?.externalPdfUrl;

      return `
        <div class="pdf-viewer-embed">
          <iframe src="${pdfUrl || ''}"></iframe>
        </div>
        <div class="pdf-download-action">
          <span>📄 ${value.title || 'PDF Document'}</span>
          <a href="${pdfUrl || ''}" target="_blank" download class="pdf-btn">Download PDF</a>
        </div>
      `;
    },

    fileAttachment: ({ value }) => {
      const fileUrl = value?.file?.asset?._ref ?
        `https://cdn.sanity.io/files/${SANITY_CONFIG.projectId}/${SANITY_CONFIG.dataset}/${value.file.asset._ref.replace('file-', '')}` :
        value?.externalFileUrl;

      return `
        <div class="file-attachment-card">
          <div class="file-card-info">
            <span class="file-name">💾 ${value.fileName || 'Resource File'}</span>
            <span class="file-meta">${value.fileSize || 'Attachment'} • ${value.fileType || 'Download'}</span>
          </div>
          <a href="${fileUrl || '#'}" target="_blank" download class="file-download-btn">Download</a>
        </div>
      `;
    },

    positionedImage: ({ value }) => {
      const align = value.alignment || 'center';
      const cssClass = align === 'float-left' ? 'img-wrap-float-left' :
                       align === 'float-right' ? 'img-wrap-float-right' :
                       'img-wrap-center';

      let imgUrl = value?.image?.asset?._ref ?
        `https://cdn.sanity.io/images/${SANITY_CONFIG.projectId}/${SANITY_CONFIG.dataset}/${value.image.asset._ref.replace('image-', '').replace(/-([a-z]+)$/, '.$1')}` :
        '';

      return `
        <div class="${cssClass}">
          <img src="${imgUrl}" alt="${value.alt || ''}" class="blog-positioned-img" />
          ${value.caption ? `<span class="blog-caption">// ${value.caption}</span>` : ''}
        </div>
      `;
    },

    calloutBox: ({ value }) => `
      <div class="callout-box callout-${value.type || 'info'}">
        <div class="callout-title">${value.title || 'Note'}</div>
        <p>${value.message || ''}</p>
      </div>
    `,
  },

  marks: {
    hlGreen: ({ children }) => `<span class="hl-green">${children}</span>`,
    hlCyan: ({ children }) => `<span class="hl-cyan">${children}</span>`,
    hlYellow: ({ children }) => `<span class="hl-yellow">${children}</span>`,
    code: ({ children }) => `<code>${children}</code>`,
    link: ({ children, value }) => {
      const target = value?.blank ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${value?.href || '#'}"${target}>${children}</a>`;
    },
  },

  block: {
    h2: ({ children }) => {
      const text = children.toString();
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      return `<h2 id="${id}" class="blog-h2">${children}</h2>`;
    },
    h3: ({ children }) => {
      const text = children.toString();
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      return `<h3 id="${id}" class="blog-h3">${children}</h3>`;
    },
    blockquote: ({ children }) => `<blockquote class="blog-quote">${children}</blockquote>`,
    normal: ({ children }) => `<p>${children}</p>`,
  },
};

export function renderPortableText(body) {
  if (!body) return '';
  return toHTML(body, { components: portableTextComponents });
}

// 4. Query Helper Functions
export async function fetchAllPosts() {
  const query = `*[_type == "post" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
    title,
    "slug": slug.current,
    publishedAt,
    category,
    readingTime,
    isFeatured,
    summary,
    "coverImageUrl": coverImage.asset->url,
    "author": author->{ name, role, "avatarUrl": avatar.asset->url }
  }`;
  return await sanityClient.fetch(query);
}

export async function fetchPostBySlug(slug) {
  const query = `*[_type == "post" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
    title,
    "slug": slug.current,
    publishedAt,
    category,
    readingTime,
    isFeatured,
    summary,
    "coverImageUrl": coverImage.asset->url,
    "author": author->{ name, role, "avatarUrl": avatar.asset->url },
    body
  }`;
  return await sanityClient.fetch(query, { slug });
}

export async function fetchSiteSettings() {
  return await sanityClient.fetch(`*[_type == "siteSettings" && !(_id in path("drafts.**"))][0]`);
}

export async function fetchHomePage() {
  return await sanityClient.fetch(`*[_type == "homePage" && !(_id in path("drafts.**"))][0]`);
}

export async function fetchAboutPage() {
  return await sanityClient.fetch(`*[_type == "aboutPage" && !(_id in path("drafts.**"))][0]`);
}

export async function fetchProjects() {
  return await sanityClient.fetch(`*[_type == "project" && !(_id in path("drafts.**"))] | order(order asc, _createdAt asc)`);
}

export async function fetchSkills() {
  return await sanityClient.fetch(`*[_type == "skillCategory" && !(_id in path("drafts.**"))] | order(order asc)`);
}

export async function fetchAchievements() {
  return await sanityClient.fetch(`*[_type == "achievement" && !(_id in path("drafts.**"))] | order(order asc, yearBadge desc)`);
}

export async function fetchContactPage() {
  return await sanityClient.fetch(`*[_type == "contactPage" && !(_id in path("drafts.**"))][0]`);
}

export async function fetchDhakaCollegeHub() {
  return await sanityClient.fetch(`*[_type == "dhakaCollegeHub" && !(_id in path("drafts.**"))][0]`);
}

// 5. Full-Site Progressive Hydration Functions

/**
 * Hydrates Footer, Social Links, and Branding across all pages
 */
export async function hydrateGlobalSettings() {
  try {
    const settings = await fetchSiteSettings();
    if (!settings) return;

    // Footer brand description
    if (settings.footer?.brandBio) {
      document.querySelectorAll('.footer-desc').forEach(el => {
        el.textContent = settings.footer.brandBio;
      });
    }

    // Footer tagline
    if (settings.footer?.tagline) {
      document.querySelectorAll('.footer-sub').forEach(el => {
        el.textContent = settings.footer.tagline;
      });
    }

    // Social & Contact Links across footer and page icons
    const links = settings.socialLinks;
    if (links) {
      if (links.github) document.querySelectorAll('a[href="@github"], a[title*="GitHub"]').forEach(a => a.href = links.github);
      if (links.facebook) document.querySelectorAll('a[href="@fb"], a[title*="Facebook"]').forEach(a => a.href = links.facebook);
      if (links.instagram) document.querySelectorAll('a[href="@insta"], a[title*="Instagram"]').forEach(a => a.href = links.instagram);
      if (links.telegram) document.querySelectorAll('a[href="@tg"], a[title*="Telegram"]').forEach(a => a.href = links.telegram);
      if (links.whatsapp) {
        const waUrl = links.whatsapp.startsWith('http') ? links.whatsapp : `https://wa.me/${links.whatsapp.replace(/[^\d]/g, '')}`;
        document.querySelectorAll('a[href="@wa"], a[title*="WhatsApp"]').forEach(a => a.href = waUrl);
      }
      if (links.email) document.querySelectorAll('a[href="@mail"], a[title*="email" i]').forEach(a => a.href = `mailto:${links.email}`);
      if (links.phone) document.querySelectorAll('a[href="@call"], a[title*="call" i]').forEach(a => a.href = `tel:${links.phone.replace(/[^\d+]/g, '')}`);
    }
  } catch (err) {
    console.debug('[Sanity] Global settings hydration skipped:', err);
  }
}

/**
 * Hydrates Home Page (index.html)
 */
export async function hydrateHomePage() {
  try {
    const [data, projects] = await Promise.all([fetchHomePage(), fetchProjects()]);
    if (!data) return;

    // 1. Hero text
    if (data.hero) {
      const h1 = document.querySelector('.hero-text h1');
      if (h1 && data.hero.headline) {
        h1.innerHTML = `${data.hero.headline}<span class="cursor"></span>`;
      }
      const subtitle = document.querySelector('.hero-subtitle');
      if (subtitle && data.hero.subtitle) {
        subtitle.textContent = data.hero.subtitle;
      }
      const desc = document.querySelector('.hero-desc');
      if (desc && data.hero.description) {
        desc.textContent = data.hero.description;
      }
      const avatar = document.querySelector('.hero-avatar');
      const avatarUrl = getSanityImageUrl(data.hero.avatar) || data.hero.avatarUrlFallback;
      if (avatar && avatarUrl) {
        avatar.src = avatarUrl;
      }
    }

    // 2. Terminal Code window
    if (data.codeWindow) {
      const cw = data.codeWindow;
      const title = document.querySelector('.code-title');
      if (title && cw.fileName) title.textContent = cw.fileName;

      // Update developer properties if present
      const nameEl = document.querySelector('.code-desktop div:nth-child(2) .string');
      if (nameEl && cw.developerName) nameEl.textContent = `'${cw.developerName}'`;

      const roleEl = document.querySelector('.code-desktop div:nth-child(4) .string');
      if (roleEl && cw.role) roleEl.textContent = `'${cw.role}'`;

      const collegeEl = document.querySelector('.code-desktop div:nth-child(5) .string');
      if (collegeEl && cw.college) collegeEl.textContent = `'${cw.college}'`;

      const goalEl = document.querySelector('.code-desktop div:nth-child(7) .string');
      if (goalEl && cw.goal) goalEl.textContent = `'${cw.goal}'`;
    }

    // 3. Featured projects on home page
    if (projects && projects.length > 0) {
      const featured = projects.filter(p => p.featured);
      const grid = document.querySelector('#projects .grid-2');
      if (grid && featured.length > 0) {
        // Render updated featured projects
        grid.innerHTML = featured.map(p => {
          const dark = getSanityImageUrl(p.darkImage) || p.darkImageUrlFallback || 'images/projects/n-dcsc.png';
          const light = getSanityImageUrl(p.lightImage) || p.lightImageUrlFallback || dark;
          return `
            <div class="project-card visible" style="opacity:1; transform:none;" data-url="${p.liveUrl || '#'}" data-name="${p.title}">
                <div class="browser-bar">
                    <div class="browser-dots">
                        <span class="browser-dot r"></span>
                        <span class="browser-dot y"></span>
                        <span class="browser-dot g"></span>
                    </div>
                    <div class="browser-address">
                        <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        ${p.browserAddress || p.liveUrl || 'seadib.project'}
                    </div>
                </div>
                <div class="project-thumb-wrap">
                    <img src="${dark}" data-dark="${dark}" data-light="${light}" alt="${p.title}" class="project-thumb theme-img" onerror="if(this.dataset.dark && this.src!==this.dataset.dark) this.src=this.dataset.dark;" />
                </div>
                <div class="project-body">
                    <div class="project-title">${p.title}</div>
                    <p class="project-desc">${p.description || ''}</p>
                    <div class="project-footer">
                        <span class="tag">${p.tag || 'web'}</span>
                        <a href="${p.liveUrl || '#'}" target="_blank" class="btn btn-outline btn-sm">${p.buttonText || 'Visit Website ↗'}</a>
                    </div>
                </div>
            </div>
          `;
        }).join('');
        if (window.reobserveStaggerItems) window.reobserveStaggerItems();
      }
    }
  } catch (err) {
    console.debug('[Sanity] Home page hydration skipped:', err);
  }
}

/**
 * Hydrates About Page (about.html)
 */
export async function hydrateAboutPage() {
  try {
    const data = await fetchAboutPage();
    if (!data) return;

    if (data.headerTitle) {
      const h1 = document.querySelector('.page-header h1');
      if (h1) h1.innerHTML = `&lt;<span class="accent">${data.headerTitle.replace(/[<>]/g, '')}</span>&gt;`;
    }
    if (data.headerSubtitle) {
      const p = document.querySelector('.page-header p');
      if (p) p.textContent = data.headerSubtitle;
    }

    if (data.heroBio) {
      const b = data.heroBio;
      const avatar = document.querySelector('.about-avatar');
      const avatarUrl = getSanityImageUrl(b.avatar) || b.avatarUrlFallback;
      if (avatar && avatarUrl) avatar.src = avatarUrl;

      const nameEl = document.querySelector('.about-text h2');
      if (nameEl && b.name) nameEl.textContent = b.name;

      const cvBtn = document.querySelector('.about-text a[download]');
      if (cvBtn && (b.cvUrlFallback || b.cvFile)) {
        cvBtn.href = b.cvUrlFallback || 'files/adib.pdf';
      }
    }
  } catch (err) {
    console.debug('[Sanity] About page hydration skipped:', err);
  }
}

/**
 * Hydrates Projects Page (projects.html)
 */
export async function hydrateProjectsPage() {
  try {
    const projects = await fetchProjects();
    if (!projects || projects.length === 0) return;

    const grid = document.querySelector('#projectGrid, .grid-2');
    if (grid) {
      grid.innerHTML = projects.map(p => {
        const dark = getSanityImageUrl(p.darkImage) || p.darkImageUrlFallback || 'images/projects/n-dcsc.png';
        const light = getSanityImageUrl(p.lightImage) || p.lightImageUrlFallback || dark;
        return `
          <div class="project-card visible" style="opacity:1; transform:none;" data-url="${p.liveUrl || '#'}" data-name="${p.title}" data-category="${p.category || 'web'}">
              <div class="browser-bar">
                  <div class="browser-dots">
                      <span class="browser-dot r"></span>
                      <span class="browser-dot y"></span>
                      <span class="browser-dot g"></span>
                  </div>
                  <div class="browser-address">
                      <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      ${p.browserAddress || p.liveUrl || 'seadib.project'}
                  </div>
              </div>
              <div class="project-thumb-wrap">
                  <img src="${dark}" data-dark="${dark}" data-light="${light}" alt="${p.title}" class="project-thumb theme-img" onerror="if(this.dataset.dark && this.src!==this.dataset.dark) this.src=this.dataset.dark;" />
              </div>
              <div class="project-body">
                  <div class="project-title">${p.title}</div>
                  <p class="project-desc">${p.description || ''}</p>
                  <div class="project-footer">
                      <span class="tag">${p.tag || 'web'}</span>
                      <a href="${p.liveUrl || '#'}" target="_blank" class="btn btn-outline btn-sm">${p.buttonText || 'Visit Website ↗'}</a>
                  </div>
              </div>
          </div>
        `;
      }).join('');
      if (window.reobserveStaggerItems) window.reobserveStaggerItems();
    }
  } catch (err) {
    console.debug('[Sanity] Projects page hydration skipped:', err);
  }
}

/**
 * Hydrates Achievements Page (achievements.html)
 */
export async function hydrateAchievementsPage() {
  try {
    const achievements = await fetchAchievements();
    if (!achievements || achievements.length === 0) return;

    const grid = document.getElementById('achievementGrid');
    if (grid) {
      grid.innerHTML = achievements.map(a => {
        const thumb = getSanityImageUrl(a.thumbnail) || a.thumbnailUrlFallback || 'images/projects/n-dcsc.png';
        const photosJson = JSON.stringify(a.photos || [thumb]);
        const pointsJson = JSON.stringify(a.bulletPoints || []);
        return `
          <div class="achievement-card visible" style="opacity:1; transform:none;"
               data-category="${a.category || 'science_club'}"
               data-title="${a.title}"
               data-meta="${a.metaText || ''}"
               data-photos='${photosJson}'
               data-desc="${(a.fullDescription || a.shortDescription || '').replace(/"/g, '&quot;')}"
               data-points='${pointsJson}'>
              <div class="achievement-thumb-wrap">
                  <img src="${thumb}" alt="${a.title}" class="achievement-thumb" />
                  <span class="achievement-badge-overlay">${a.yearBadge || '2026'}</span>
              </div>
              <div class="achievement-body">
                  <div class="achievement-meta">
                      <span>// ${a.category || 'achievement'}</span>
                      <span class="accent">${a.badgeLabel || 'featured'}</span>
                  </div>
                  <div class="achievement-title">${a.title}</div>
                  <p class="achievement-desc">${a.shortDescription || ''}</p>
                  <div class="achievement-footer">
                      <span class="tag">${a.tag || 'Honors'}</span>
                      <span class="btn btn-outline btn-sm">details() ↗</span>
                  </div>
              </div>
          </div>
        `;
      }).join('');
      if (window.reobserveStaggerItems) window.reobserveStaggerItems();
    }
  } catch (err) {
    console.debug('[Sanity] Achievements page hydration skipped:', err);
  }
}

/**
 * Auto-detect and run hydration on DOMContentLoaded
 */
export async function autoHydrateCurrentPage() {
  try {
    // 1. Global Footer, Socials, Brand elements
    await hydrateGlobalSettings();

    // 2. Page Specific Hydration
    const path = window.location.pathname.toLowerCase();
    if (path.endsWith('index.html') || path.endsWith('/') || path === '') {
      await hydrateHomePage();
    } else if (path.includes('about.html')) {
      await hydrateAboutPage();
    } else if (path.includes('projects.html')) {
      await hydrateProjectsPage();
    } else if (path.includes('achievements.html')) {
      await hydrateAchievementsPage();
    }
  } catch (err) {
    console.debug('[Sanity CMS] Progressive hydration completed with fallback.', err);
  }
}

// Automatically initialize when running in browser
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => autoHydrateCurrentPage());
  } else {
    autoHydrateCurrentPage();
  }
}

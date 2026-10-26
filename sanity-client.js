// sanity-client.js — High-performance Sanity Edge CDN Client & Media Serializer for adi.pro.bd
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

// 2. Smart Media Link Parsers
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

// 3. Custom Portable Text Serializers matching portfolio dark glassmorphism CSS
export const portableTextComponents = {
  types: {
    // YouTube Responsive Embed
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

    // Google Drive Video / PDF / Audio Embed
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

    // Mega Drive Download Card
    megaDriveEmbed: ({ value }) => `
      <div class="file-attachment-card">
        <div class="file-card-info">
          <span class="file-name">🔴 MEGA: ${value.fileName || 'Cloud File'}</span>
          <span class="file-meta">${value.fileSize || 'Cloud File'} • Direct Cloud Download</span>
        </div>
        <a href="${value.megaUrl}" target="_blank" rel="noopener noreferrer" class="file-download-btn">Open on Mega</a>
      </div>
    `,

    // Audio Player Card
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

    // Interactive PDF Viewer
    pdfViewer: ({ value }) => {
      let previewUrl = value?.driveShareUrl;
      const fileId = parseGoogleDriveId(value?.driveShareUrl);
      if (fileId) {
        previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
      } else if (value?.pdfFile?.asset?._ref) {
        previewUrl = `https://cdn.sanity.io/files/${SANITY_CONFIG.projectId}/${SANITY_CONFIG.dataset}/${value.pdfFile.asset._ref.replace('file-', '').replace('-pdf', '.pdf')}`;
      }

      return `
        <div class="pdf-viewer-embed">
          <iframe src="${previewUrl || ''}"></iframe>
        </div>
        <div class="pdf-download-action">
          <span>📄 ${value.title || 'PDF Document'}</span>
          <a href="${previewUrl || '#'}" target="_blank" class="pdf-btn">Open / Download PDF</a>
        </div>
      `;
    },

    // File Attachment Download Card
    fileAttachment: ({ value }) => {
      let downloadUrl = value?.externalDownloadUrl;
      if (value?.file?.asset?._ref) {
        const ref = value.file.asset._ref.replace('file-', '');
        const extMatch = ref.match(/-([a-zA-Z0-9]+)$/);
        const ext = extMatch ? extMatch[1] : '';
        const cleanRef = ext ? ref.substring(0, ref.lastIndexOf('-')) + '.' + ext : ref;
        downloadUrl = `https://cdn.sanity.io/files/${SANITY_CONFIG.projectId}/${SANITY_CONFIG.dataset}/${cleanRef}`;
      }

      return `
        <div class="file-attachment-card">
          <div class="file-card-info">
            <span class="file-name">${value.title || 'File Download'}</span>
            <span class="file-meta">${value.fileSize || ''} • ${value.fileType || 'ATTACHMENT'}</span>
          </div>
          <a href="${downloadUrl || '#'}" download target="_blank" class="file-download-btn">Download</a>
        </div>
      `;
    },

    // Positioned Image with Layout Wrapping
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

    // Callout Box
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

// 4. Render Portable Text to HTML
export function renderPortableText(body) {
  if (!body) return '';
  return toHTML(body, { components: portableTextComponents });
}

// 5. Query Helper Functions
export async function fetchAllPosts() {
  const query = `*[_type == "post"] | order(publishedAt desc) {
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
  const query = `*[_type == "post" && slug.current == $slug][0] {
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

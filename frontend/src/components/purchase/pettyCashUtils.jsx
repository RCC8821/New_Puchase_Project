import React from 'react';

export const formatINR = (n) =>
  '₹ ' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

// Drive link se file ID nikaalna
export const getDriveFileId = (url) => {
  if (!url) return '';
  const m = String(url).match(/\/d\/([a-zA-Z0-9_-]+)/) || String(url).match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return m ? m[1] : '';
};

// Drive photo ka thumbnail URL
export const driveThumb = (url, size = 600) => {
  const id = getDriveFileId(url);
  return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w${size}` : '';
};

// Photo ko chhota (compress) karke base64 banana — upload fast hoga
export const compressImage = (file, maxSize = 1280, quality = 0.7) =>
  new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Sirf photo (image) file allowed hai'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Photo load nahi hui'));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error('File read nahi hui'));
    reader.readAsDataURL(file);
  });

const STATUS_COLORS = {
  Pending: { bg: '#fef9c3', color: '#a16207', border: '#fde047' },
  Done: { bg: '#dcfce7', color: '#15803d', border: '#86efac' },
  Reject: { bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' },
};

export const StatusBadge = ({ status }) => {
  const c = STATUS_COLORS[status] || STATUS_COLORS.Pending;
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 12,
      fontSize: 12, fontWeight: 700, background: c.bg, color: c.color,
      border: `1px solid ${c.border}`, whiteSpace: 'nowrap',
    }}>
      {status === 'Done' ? '✓ ' : status === 'Reject' ? '✕ ' : '⏳ '}{status || 'Pending'}
    </span>
  );
};

export const PhotoLink = ({ url, label = 'View' }) =>
  url ? (
    <a href={url} target="_blank" rel="noopener noreferrer"
      style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
      📷 {label}
    </a>
  ) : (
    <span style={{ color: '#cbd5e1' }}>—</span>
  );
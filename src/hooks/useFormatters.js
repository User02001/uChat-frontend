import { useMemo } from 'react';

export const useFormatters = () => {
 const formatters = useMemo(() => ({
  formatTimeAgo: (timestamp) => {
   const now = new Date();
   const time = new Date(timestamp + "Z");
   const diff = now - time;
   const minutes = Math.floor(diff / 60000);
   const hours = Math.floor(diff / 3600000);
   const days = Math.floor(diff / 86400000);

   if (minutes < 1) return "now";
   if (minutes < 60) return `${minutes}m ago`;
   if (hours < 24) return `${hours}h ago`;
   if (days < 7) return `${days}d ago`;
   return time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  },

  formatInactiveTime: (lastSeenTimestamp) => {
   if (!lastSeenTimestamp) return "Inactive";

   const now = new Date();
   const lastSeen = new Date(lastSeenTimestamp + "Z");
   const diffMs = now - lastSeen;

   const minutes = Math.floor(diffMs / 60000);
   const hours = Math.floor(diffMs / 3600000);
   const days = Math.floor(diffMs / 86400000);
   const weeks = Math.floor(days / 7);

   if (minutes < 2) return "Inactive just now";
   if (minutes < 60) return `Inactive for ${minutes}m`;
   if (hours < 24) return `Inactive for ${hours}h`;
   if (days < 7) return `Inactive for ${days}d`;
   return `Inactive for ${weeks}w`;
  },

  formatLastSeen: (lastSeenTimestamp) => {
   if (!lastSeenTimestamp) return "Offline";

   const now = new Date();
   const lastSeen = new Date(lastSeenTimestamp + "Z");
   const diffMs = now - lastSeen;
   const diffMinutes = Math.floor(diffMs / 60000);
   const diffHours = Math.floor(diffMs / 3600000);
   const diffDays = Math.floor(diffMs / 86400000);
   const diffWeeks = Math.floor(diffDays / 7);

   if (diffMinutes < 2) return "Last seen just now";
   if (diffMinutes < 60) return `Last seen ${diffMinutes}m ago`;
   if (diffHours < 24) return `Last seen ${diffHours}h ago`;
   if (diffDays === 1) return "Last seen yesterday";
   if (diffDays < 7) return `Last seen ${diffDays}d ago`;
   if (diffWeeks < 5) return `Last seen ${diffWeeks}w ago`;

   // For dates older than ~1 month, just show the actual date
   return `Last seen on ${lastSeen.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: lastSeen.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
   })}`;
  },

  formatContactTime: (lastMessageTime, isMobile = false) => {
   if (!lastMessageTime) return "";

   const now = new Date();
   const messageTime = new Date(lastMessageTime + "Z");
   const isToday = now.toDateString() === messageTime.toDateString();

   const yesterday = new Date(now);
   yesterday.setDate(now.getDate() - 1);
   const isYesterday = yesterday.toDateString() === messageTime.toDateString();

   const timeString = messageTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
   });

   if (isMobile) {
    if (isToday) {
     return timeString;
    } else if (isYesterday) {
     return "1d";
    } else {
     const days = Math.floor((now - messageTime) / 86400000);
     return `${days}d`;
    }
   }

   // Desktop: Keep it SHORT and consistent
   if (isToday) {
    return timeString; // Just "3:45 PM"
   } else if (isYesterday) {
    return "Yesterday";
   } else {
    const days = Math.floor((now - messageTime) / 86400000);
    if (days < 7) {
     return `${days}d ago`;
    }
    // For older messages, show the actual date
    return messageTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
   }
  },

  formatFileSize: (bytes) => {
   if (bytes === 0) return "0 Bytes";
   const k = 1024;
   const sizes = ["Bytes", "KB", "MB", "GB"];
   const i = Math.floor(Math.log(bytes) / Math.log(k));
   return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  },

  getFileIcon: (fileType) => {
   const iconMap = {
    // Documents
    pdf: "fas fa-file-pdf",
    doc: "fas fa-file-word",
    docx: "fas fa-file-word",
    odt: "fas fa-file-word",
    rtf: "fas fa-file-alt",
    txt: "fas fa-file-alt",
    md: "fas fa-file-alt",

    // Spreadsheets
    xlsx: "fas fa-file-excel",
    xls: "fas fa-file-excel",
    csv: "fas fa-file-csv",
    ods: "fas fa-file-excel",

    // Presentations
    pptx: "fas fa-file-powerpoint",
    ppt: "fas fa-file-powerpoint",
    odp: "fas fa-file-powerpoint",
    key: "fas fa-file-powerpoint",

    // Archives
    zip: "fas fa-file-archive",
    rar: "fas fa-file-archive",
    "7z": "fas fa-file-archive",
    tar: "fas fa-file-archive",
    gz: "fas fa-file-archive",
    bz2: "fas fa-file-archive",
    xz: "fas fa-file-archive",

    // Videos
    mp4: "fas fa-file-video",
    avi: "fas fa-file-video",
    mkv: "fas fa-file-video",
    mov: "fas fa-file-video",
    wmv: "fas fa-file-video",
    flv: "fas fa-file-video",
    webm: "fas fa-file-video",
    m4v: "fas fa-file-video",
    mpg: "fas fa-file-video",
    mpeg: "fas fa-file-video",

    // Audio
    mp3: "fas fa-file-audio",
    wav: "fas fa-file-audio",
    flac: "fas fa-file-audio",
    aac: "fas fa-file-audio",
    ogg: "fas fa-file-audio",
    m4a: "fas fa-file-audio",
    wma: "fas fa-file-audio",
    opus: "fas fa-file-audio",

    // Code
    js: "fas fa-file-code",
    jsx: "fas fa-file-code",
    ts: "fas fa-file-code",
    tsx: "fas fa-file-code",
    html: "fas fa-file-code",
    htm: "fas fa-file-code",
    css: "fas fa-file-code",
    scss: "fas fa-file-code",
    sass: "fas fa-file-code",
    less: "fas fa-file-code",
    py: "fas fa-file-code",
    java: "fas fa-file-code",
    cpp: "fas fa-file-code",
    c: "fas fa-file-code",
    h: "fas fa-file-code",
    hpp: "fas fa-file-code",
    cs: "fas fa-file-code",
    php: "fas fa-file-code",
    rb: "fas fa-file-code",
    go: "fas fa-file-code",
    rs: "fas fa-file-code",
    swift: "fas fa-file-code",
    kt: "fas fa-file-code",
    sql: "fas fa-file-code",
    sh: "fas fa-file-code",
    bash: "fas fa-file-code",
    json: "fas fa-file-code",
    xml: "fas fa-file-code",
    yaml: "fas fa-file-code",
    yml: "fas fa-file-code",

    // Images
    jpg: "fas fa-file-image",
    jpeg: "fas fa-file-image",
    png: "fas fa-file-image",
    gif: "fas fa-file-image",
    bmp: "fas fa-file-image",
    svg: "fas fa-file-image",
    webp: "fas fa-file-image",
    ico: "fas fa-file-image",
    tiff: "fas fa-file-image",
    tif: "fas fa-file-image",

    // Executables
    exe: "fas fa-cog",
    msi: "fas fa-cog",
    app: "fas fa-cog",
    deb: "fas fa-cog",
    rpm: "fas fa-cog",
    dmg: "fas fa-cog",
    apk: "fas fa-cog",

    // Default
    default: "fas fa-file",
   };
   return iconMap[fileType?.toLowerCase()] || iconMap.default;
  }
 }), []);

 return formatters;
};
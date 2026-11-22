import React, { useState, useEffect, useRef } from 'react';
import {
  Scissors,
  Link2,
  Play,
  Pause,
  Download,
  Copy,
  Check,
  Trash2,
  Infinity as InfinityIcon,
  Flame,
  Subtitles,
  FolderKanban,
  RotateCcw,
  Camera,
  Terminal,
  Film,
  Zap,
  Volume2,
  VolumeX,
  MessageSquareFlame,
  Clock
} from 'lucide-react';

const SAMPLE_CHAT_LOG = `[00:04] viewer_1: yo stream looks clean tonight
[00:09] gamer_99: chat ready for ranked?
[00:15] hype_king: bro look left
[00:18] clip_hunter: OH MY GOD
[00:19] neon_zero: NO WAY HE ACTUALLY HIT THAT
[00:20] cracked_aim: INSANE SHOT W W W
[00:21] luv_clips: BRO WHAT WAS THAT CRAZY PLAY
[00:22] chat_goblins: LMAO NO WAY BRO
[00:23] twitch_rat: MY JAW IS ON THE FLOOR
[00:28] viewer_1: okay that was crazy ngl
[00:36] chill_guy: back to farming
[00:44] bait_master: press F for free loot
[00:46] no_scope: wait what happened
[00:47] fail_radar: BRUH HE FELL OFF
[00:48] laugh_track: LMAO NO WAY BAITED AGAIN
[00:49] clip_hunter: SO FUNNY OMG BRO
[00:50] neon_zero: CRACKED FAIL OF THE NIGHT
[01:02] viewer_1: gg next one`;

const PRESET_LINKS = [
  {
    id: 'link-vod-1',
    title: 'Ranked Grind VOD // Sample Stream Link',
    duration: '01:15',
    sourceType: 'Pasted Stream / VOD URL',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    chatLog: SAMPLE_CHAT_LOG
  },
  {
    id: 'link-vod-2',
    title: 'Creator Breakdown // Sample Clip Link',
    duration: '01:15',
    sourceType: 'Pasted Podcast / Interview URL',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    chatLog: `[00:05] sub_one: listening while working
[00:11] clip_pro: hold up say that again
[00:12] hook_master: CRAZY TRUTH RIGHT HERE
[00:13] editor_x: NO WAY PEOPLE SCROLL IN 1 SEC
[00:14] growth_lab: INSANE HOOK BREAKDOWN OMG
[00:27] viewer_4: solid point
[00:41] late_joiner: what did i miss
[00:45] clip_pro: BEST ADVICE ALL STREAM
[00:46] editor_x: BRO THAT CLIPPING FORMULA IS WILD
[00:47] hook_master: W W W INSANE GAMECHANGER`
  }
];

const CAPTION_PRESETS = [
  {
    id: 'neo-cyan',
    name: 'NEO CYBER',
    badge: 'High Retention',
    wrapperClass: 'bg-black/80 border border-cyan-400/70 shadow-[0_0_20px_rgba(34,211,238,0.35)]',
    textClass: 'text-cyan-300 font-black uppercase tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]'
  },
  {
    id: 'hormozi-gold',
    name: 'PUNCH GOLD',
    badge: 'Viral Bold',
    wrapperClass: 'bg-black/85 border border-amber-400/70 shadow-[0_0_20px_rgba(251,191,36,0.3)]',
    textClass: 'text-amber-300 font-extrabold uppercase tracking-tight'
  },
  {
    id: 'clean-glass',
    name: 'GLASS MINIMAL',
    badge: 'Clean Sub',
    wrapperClass: 'bg-zinc-950/75 backdrop-blur-md border border-white/15',
    textClass: 'text-white font-semibold tracking-normal'
  }
];

const INITIAL_CAMPAIGNS = ['Main Channel Shorts', 'TikTok Clipping', 'Streamer Bounty #1'];

const HYPE_KEYWORDS = [
  'no way',
  'omg',
  'insane',
  'crazy',
  'clutch',
  'what',
  'bro',
  'lmao',
  'lol',
  'bruh',
  'cracked',
  'wild',
  'best',
  'w',
  'lfg',
  'goated',
  'sheesh',
  'yo'
];

class StudioErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-[#07080d] text-zinc-100 p-6 flex items-center justify-center">
          <div className="max-w-lg w-full rounded-2xl bg-zinc-900 border border-rose-500/40 p-5 space-y-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-rose-400">
              Studio Render Error Caught
            </h2>
            <p className="text-xs font-mono text-zinc-300 wrap-break-word">
              {String(this.state.error?.message || this.state.error)}
            </p>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="px-4 py-2 rounded-xl bg-cyan-400 text-black text-xs font-black cursor-pointer"
            >
              Clear Storage & Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function readLocalJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(fallback) && !Array.isArray(parsed) ? fallback : parsed;
  } catch {
    return fallback;
  }
}

function parseTimestampToSec(raw) {
  if (!raw) return null;
  const parts = raw.split(':').map((n) => parseInt(n, 10));
  if (parts.some(Number.isNaN)) return null;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return null;
}

function parseChatLogLines(rawText) {
  const lines = String(rawText || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const parsed = [];
  lines.forEach((line, idx) => {
    const match = line.match(/^\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?\s*(?:([^:]+):\s*)?(.*)$/);
    if (match) {
      const sec = parseTimestampToSec(match[1]);
      if (sec !== null) {
        parsed.push({
          sec,
          user: (match[2] || 'viewer').trim(),
          message: (match[3] || line).trim()
        });
        return;
      }
    }
    parsed.push({
      sec: idx * 4,
      user: 'viewer',
      message: line
    });
  });

  return parsed.sort((a, b) => a.sec - b.sec);
}

function scoreChatForMoments(rawChatText, maxDurationSec) {
  const entries = parseChatLogLines(rawChatText);
  if (entries.length === 0) return [];

  const windowSize = 6;
  const buckets = new Map();

  for (const entry of entries) {
    const bucketStart = Math.floor(entry.sec / windowSize) * windowSize;
    if (!buckets.has(bucketStart)) {
      buckets.set(bucketStart, {
        bucketStart,
        messages: [],
        hypeHits: 0,
        capsBoost: 0
      });
    }
    const bucket = buckets.get(bucketStart);
    bucket.messages.push(entry);

    const lower = entry.message.toLowerCase();
    let lineHits = 0;
    for (const kw of HYPE_KEYWORDS) {
      if (lower.includes(kw)) lineHits += 1;
    }
    if (entry.message.includes('!')) lineHits += 1;
    if (/[A-Z]{4,}/.test(entry.message)) {
      bucket.capsBoost += 2;
      lineHits += 1;
    }
    bucket.hypeHits += lineHits;
  }

  const maxMsgs = Math.max(1, ...Array.from(buckets.values()).map((b) => b.messages.length));
  const maxHype = Math.max(1, ...Array.from(buckets.values()).map((b) => b.hypeHits + b.capsBoost));

  const scoredBuckets = Array.from(buckets.values()).map((b) => {
    const velocityRatio = b.messages.length / maxMsgs;
    const hypeRatio = (b.hypeHits + b.capsBoost) / maxHype;
    const rawScore = Math.round(55 + velocityRatio * 24 + hypeRatio * 20);
    const viralScore = Math.min(99, Math.max(60, rawScore));

    const topMsg =
      b.messages.find((m) =>
        HYPE_KEYWORDS.some((kw) => m.message.toLowerCase().includes(kw))
      ) || b.messages[0];

    const start = Math.max(0, b.bucketStart - 2);
    const proposedEnd = Math.min(b.bucketStart + 10, start + 14);
    const end = maxDurationSec > 2 ? Math.min(Math.floor(maxDurationSec), proposedEnd) : proposedEnd;

    return {
      id: `chat-hl-${b.bucketStart}`,
      title: `Chat Spike (${b.messages.length} msgs in ${windowSize}s • ${b.hypeHits} hype cues)`,
      reason: `${b.messages.length} rapid chat msgs + ${b.hypeHits} hype/reaction triggers`,
      start,
      end: Math.max(start + 3, end),
      viralScore,
      hook: topMsg ? topMsg.message.toUpperCase().slice(0, 56) : 'CHAT WENT CRAZY HERE 🔥',
      transcript: b.messages.map((m) => m.message).join(' • ')
    };
  });

  scoredBuckets.sort((a, b) => b.viralScore - a.viralScore);
  const picked = [];
  for (const candidate of scoredBuckets) {
    const overlaps = picked.some((p) => Math.abs(p.start - candidate.start) < 6);
    if (!overlaps) picked.push(candidate);
    if (picked.length >= 4) break;
  }

  return picked;
}

function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function formatSrtTime(seconds) {
  const totalMs = Math.max(0, Math.floor((seconds || 0) * 1000));
  const hrs = Math.floor(totalMs / 3600000);
  const mins = Math.floor((totalMs % 3600000) / 60000);
  const secs = Math.floor((totalMs % 60000) / 1000);
  const ms = totalMs % 1000;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}

function ClipStudioApp() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [savedClips, setSavedClips] = useState(() => readLocalJson('cereal_clip_vault_v1', []));
  const [campaigns, setCampaigns] = useState(() =>
    readLocalJson('cereal_clip_campaigns_v1', INITIAL_CAMPAIGNS)
  );
  const [recentLinks, setRecentLinks] = useState(() =>
    readLocalJson('cereal_recent_links_v1', PRESET_LINKS)
  );

  const safeLinks = recentLinks.length > 0 ? recentLinks : PRESET_LINKS;
  const [linkInput, setLinkInput] = useState(safeLinks[0].url);
  const [chatLogInput, setChatLogInput] = useState(safeLinks[0].chatLog || SAMPLE_CHAT_LOG);

  const [activeSource, setActiveSource] = useState(safeLinks[0]);
  const [videoDuration, setVideoDuration] = useState(15);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const initialMoments = scoreChatForMoments(safeLinks[0].chatLog || SAMPLE_CHAT_LOG, 15);
  const [detectedMoments, setDetectedMoments] = useState(initialMoments);
  const [isScanning, setIsScanning] = useState(false);

  const initialTop = initialMoments[0];
  const [clipTitle, setClipTitle] = useState(initialTop?.title || 'Top Hype Moment');
  const [hookText, setHookText] = useState(initialTop?.hook || 'CHAT WENT CRAZY HERE 🔥');
  const [captionText, setCaptionText] = useState(
    initialTop?.transcript || 'Ranked by real chat message spikes and hype cues.'
  );
  const [startSec, setStartSec] = useState(initialTop?.start ?? 0);
  const [endSec, setEndSec] = useState(initialTop?.end ?? 12);
  const [captionPresetId, setCaptionPresetId] = useState(CAPTION_PRESETS[0].id);
  const [zoomScale, setZoomScale] = useState(1.25);
  const [panX, setPanX] = useState(0);

  const safeCampaigns = campaigns.length > 0 ? campaigns : INITIAL_CAMPAIGNS;
  const [selectedCampaign, setSelectedCampaign] = useState(safeCampaigns[0]);
  const [newCampaignName, setNewCampaignName] = useState('');

  const [copiedId, setCopiedId] = useState(null);
  const [capturedFrameUrl, setCapturedFrameUrl] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('cereal_clip_vault_v1', JSON.stringify(savedClips));
    } catch (e) {
      console.error('Failed saving clips:', e);
    }
  }, [savedClips]);

  useEffect(() => {
    try {
      localStorage.setItem('cereal_clip_campaigns_v1', JSON.stringify(campaigns));
    } catch (e) {
      console.error('Failed saving campaigns:', e);
    }
  }, [campaigns]);

  useEffect(() => {
    try {
      localStorage.setItem('cereal_recent_links_v1', JSON.stringify(recentLinks));
    } catch (e) {
      console.error('Failed saving links:', e);
    }
  }, [recentLinks]);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2600);
  };

  const activeCaptionPreset =
    CAPTION_PRESETS.find((p) => p.id === captionPresetId) || CAPTION_PRESETS[0];

  const applyMoment = (moment) => {
    setClipTitle(moment.title);
    setHookText(moment.hook);
    setCaptionText(moment.transcript);
    setStartSec(moment.start);
    setEndSec(moment.end);
    if (videoRef.current) {
      videoRef.current.currentTime = moment.start;
    }
    triggerToast(`Loaded #1 ranked cut (${moment.viralScore} hype score)`);
  };

  const analyzeChatAndRank = (rawChat, durationOverride) => {
    setIsScanning(true);
    setTimeout(() => {
      const moments = scoreChatForMoments(rawChat, durationOverride ?? videoDuration);
      setDetectedMoments(moments);
      setIsScanning(false);
      if (moments.length > 0) {
        applyMoment(moments[0]);
        triggerToast(`Ranked ${moments.length} chat-spike moments`);
      } else {
        triggerToast('Paste chat lines with timestamps (e.g. [00:18] NO WAY!) to rank hype');
      }
    }, 350);
  };

  const handleLoadLink = (e) => {
    e.preventDefault();
    const trimmed = linkInput.trim();
    if (!trimmed) return;

    let label = trimmed;
    try {
      const parsed = new URL(trimmed);
      const lastSeg = parsed.pathname.split('/').filter(Boolean).pop();
      label = lastSeg || parsed.hostname;
    } catch {
      triggerToast('Enter a valid https:// video or stream link');
      return;
    }

    const newSource = {
      id: `link-${Date.now()}`,
      title: label,
      duration: 'LINK',
      sourceType: 'Pasted Video / VOD Link',
      url: trimmed,
      chatLog: chatLogInput
    };

    setActiveSource(newSource);
    setRecentLinks((prev) => {
      const deduped = prev.filter((item) => item.url !== trimmed);
      return [newSource, ...deduped].slice(0, 6);
    });
    setCapturedFrameUrl(null);
    analyzeChatAndRank(chatLogInput, videoDuration);
    triggerToast(`Loaded link: ${label}`);
  };

  const handleSelectSavedLink = (item) => {
    setLinkInput(item.url);
    if (item.chatLog) setChatLogInput(item.chatLog);
    setActiveSource(item);
    setCapturedFrameUrl(null);
    const moments = scoreChatForMoments(item.chatLog || chatLogInput, videoDuration);
    setDetectedMoments(moments);
    if (moments[0]) applyMoment(moments[0]);
  };

  const togglePlay = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      if (vid.currentTime < startSec || vid.currentTime >= endSec) {
        vid.currentTime = startSec;
      }
      vid.play().catch(() => triggerToast('Direct stream preview unavailable — use FFmpeg command in Vault'));
      setIsPlaying(true);
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    const vid = videoRef.current;
    if (!vid) return;
    setCurrentTime(vid.currentTime);
    if (isPlaying && endSec > startSec && vid.currentTime >= endSec) {
      vid.currentTime = startSec;
    }
  };

  const captureThumbnailFrame = () => {
    const vid = videoRef.current;
    const canvas = canvasRef.current;
    if (!vid || !canvas) return;

    try {
      canvas.width = 540;
      canvas.height = 960;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const vw = vid.videoWidth || 1280;
      const vh = vid.videoHeight || 720;
      const scale = Math.max(canvas.width / vw, canvas.height / vh) * zoomScale;
      const drawW = vw * scale;
      const drawH = vh * scale;
      const offsetX = (canvas.width - drawW) / 2 + panX * 2;
      const offsetY = (canvas.height - drawH) / 2;

      ctx.drawImage(vid, offsetX, offsetY, drawW, drawH);
      const dataUrl = canvas.toDataURL('image/png');
      setCapturedFrameUrl(dataUrl);
      triggerToast('9:16 Cover Frame Captured');
    } catch {
      triggerToast('Cross-origin stream frame capture blocked — works on direct/local video');
    }
  };

  const saveClipToVault = () => {
    const cleanStart = Math.max(0, Number(startSec) || 0);
    const cleanEnd = Math.max(cleanStart + 1, Number(endSec) || cleanStart + 10);

    const newClip = {
      id: `clip-${Date.now()}`,
      title: clipTitle.trim() || 'Untitled 9:16 Cut',
      sourceUrl: activeSource.url,
      sourceTitle: activeSource.title,
      campaign: selectedCampaign,
      start: cleanStart,
      end: cleanEnd,
      duration: cleanEnd - cleanStart,
      hook: hookText,
      caption: captionText,
      preset: activeCaptionPreset.name,
      zoomScale,
      panX,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setSavedClips((prev) => [newClip, ...prev]);
    triggerToast('Saved to Unlimited Clip Vault');
  };

  const buildFfmpegCommand = (clip) => {
    const outName = `"${clip.title.replace(/[^a-z0-9_-]/gi, '_').toLowerCase()}_9x16.mp4"`;
    const dur = Math.max(1, clip.end - clip.start);
    return `ffmpeg -ss ${clip.start} -i "${clip.sourceUrl}" -t ${dur} -vf "crop=ih*9/16:ih,scale=1080:1920" -c:v libx264 -crf 18 -preset fast -c:a aac -b:a 192k ${outName}`;
  };

  const buildSrtContent = (clip) => {
    const mid = clip.start + (clip.end - clip.start) / 2;
    return [
      '1',
      `${formatSrtTime(0)} --> ${formatSrtTime(mid - clip.start)}`,
      clip.hook,
      '',
      '2',
      `${formatSrtTime(mid - clip.start)} --> ${formatSrtTime(clip.end - clip.start)}`,
      clip.caption,
      ''
    ].join('\n');
  };

  const copyText = (id, text, label) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    triggerToast(label);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const downloadFile = (filename, content) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const addCampaign = (e) => {
    e.preventDefault();
    const name = newCampaignName.trim();
    if (!name || campaigns.includes(name)) return;
    setCampaigns((prev) => [...prev, name]);
    setSelectedCampaign(name);
    setNewCampaignName('');
    triggerToast(`Added campaign: ${name}`);
  };

  const resetVault = () => {
    setSavedClips([]);
    setCampaigns(INITIAL_CAMPAIGNS);
    setRecentLinks(PRESET_LINKS);
    setSelectedCampaign(INITIAL_CAMPAIGNS[0]);
    localStorage.removeItem('cereal_clip_vault_v1');
    localStorage.removeItem('cereal_clip_campaigns_v1');
    localStorage.removeItem('cereal_recent_links_v1');
    triggerToast('Local session vault cleared');
  };

  return (
    <div className="min-h-screen bg-[#07080d] text-zinc-100 font-sans selection:bg-cyan-400 selection:text-black">
      <header className="sticky top-0 z-30 border-b border-cyan-500/20 bg-[#090b12]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-400 to-fuchsia-500 p-px shadow-[0_0_24px_rgba(34,211,238,0.35)]">
              <div className="w-full h-full bg-[#090b12] rounded-[11px] flex items-center justify-center">
                <Scissors className="w-5 h-5 text-cyan-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black tracking-wider text-sm sm:text-base text-white">
                  CEREAL CLIP STUDIO <span className="text-cyan-400">// 1-OF-1</span>
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
                  <InfinityIcon className="w-3.5 h-3.5" /> UNLIMITED PERSONAL ACCESS
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Link-first intake • Chat-spike hype ranking • Zero API fees • 9:16 preview & FFmpeg/SRT vault
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-900 border border-zinc-800 text-cyan-300">
              Vault: {savedClips.length} / ∞ Clips
            </span>
            <button
              onClick={resetVault}
              title="Reset local vault"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Session
            </button>
          </div>
        </div>
      </header>

      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-zinc-900/95 border border-cyan-400/50 text-cyan-200 text-xs font-semibold shadow-[0_0_25px_rgba(34,211,238,0.25)] flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          {toastMsg}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-4 space-y-5">
          <div className="rounded-2xl bg-[#0d1019] border border-zinc-800/90 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                <Film className="w-4 h-4" /> 1. Paste Video / Stream Link
              </h2>
              <span className="text-[11px] text-zinc-500">URL MODE</span>
            </div>

            <form onSubmit={handleLoadLink} className="space-y-2.5">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link2 className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    required
                    placeholder="Paste https:// video or VOD link..."
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-cyan-400 outline-none text-xs text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs transition cursor-pointer shrink-0"
                >
                  Load Link
                </button>
              </div>
            </form>

            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Quick Links & Presets
              </p>
              {safeLinks.map((item) => {
                const active = activeSource.url === item.url;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectSavedLink(item)}
                    className={`w-full text-left p-2.5 rounded-xl border transition cursor-pointer ${
                      active
                        ? 'bg-cyan-500/10 border-cyan-400/60 text-white'
                        : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold truncate">{item.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-black/50 text-cyan-300 font-mono shrink-0">
                        {item.duration || 'URL'}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 truncate mt-0.5">{item.url}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl bg-[#0d1019] border border-zinc-800/90 p-4 space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs font-bold uppercase tracking-widest text-fuchsia-400 flex items-center gap-2">
                <MessageSquareFlame className="w-4 h-4" /> 2. Chat Hype Scorer
              </h2>
              <button
                onClick={() => analyzeChatAndRank(chatLogInput, videoDuration)}
                disabled={isScanning}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-fuchsia-500 hover:bg-fuchsia-400 disabled:opacity-50 text-black transition cursor-pointer"
              >
                {isScanning ? 'Scoring...' : 'Rank Best Clips'}
              </button>
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">
                Paste Timestamped Chat Log ([MM:SS] user: message)
              </label>
              <textarea
                rows={4}
                value={chatLogInput}
                onChange={(e) => setChatLogInput(e.target.value)}
                placeholder="[00:18] viewer: NO WAY HE ACTUALLY HIT THAT"
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-fuchsia-400 outline-none text-[11px] font-mono text-zinc-200 resize-y"
              />
            </div>

            <div className="space-y-2 max-h-72.5 overflow-y-auto pr-1">
              {detectedMoments.length === 0 ? (
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center text-xs text-zinc-400">
                  Paste chat lines with timestamps and click{' '}
                  <strong className="text-fuchsia-300">Rank Best Clips</strong> to score message spikes.
                </div>
              ) : (
                detectedMoments.map((m, idx) => (
                  <div
                    key={m.id}
                    onClick={() => applyMoment(m)}
                    className="p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-fuchsia-400/50 transition cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white truncate">
                        #{idx + 1} • {m.title}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-400/30 shrink-0">
                        <Flame className="w-3 h-3" /> {m.viralScore}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400">{m.reason}</p>
                    <p className="text-[11px] text-cyan-300 font-semibold truncate">“{m.hook}”</p>
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                      <span>
                        {formatTime(m.start)} → {formatTime(m.end)} ({m.end - m.start}s)
                      </span>
                      <span className="text-fuchsia-300">Load Cut →</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="lg:col-span-4 flex flex-col items-center">
          <div className="w-full rounded-2xl bg-[#0d1019] border border-zinc-800/90 p-4 flex flex-col items-center space-y-4">
            <div className="w-full flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                3. 9:16 Vertical Stage
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                {formatTime(currentTime)} / {formatTime(videoDuration)}
              </span>
            </div>

            <div className="relative w-full max-w-75 aspect-9/16 rounded-[28px] overflow-hidden bg-black border-2 border-zinc-800 shadow-[0_0_45px_rgba(34,211,238,0.12)]">
              <video
                ref={videoRef}
                src={activeSource.url}
                crossOrigin="anonymous"
                playsInline
                muted={isMuted}
                onLoadedMetadata={(e) => {
                  const d = e.currentTarget.duration || 15;
                  setVideoDuration(d);
                  if (endSec > d) setEndSec(Math.floor(d));
                }}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                style={{
                  transform: `scale(${zoomScale}) translateX(${panX}%)`
                }}
                className="w-full h-full object-cover transition-transform duration-150"
              />

              {hookText && (
                <div className="absolute top-6 inset-x-3 pointer-events-none flex justify-center">
                  <div className="px-3 py-1.5 rounded-xl bg-white text-black font-black text-xs text-center uppercase tracking-tight shadow-lg">
                    {hookText}
                  </div>
                </div>
              )}

              {captionText && (
                <div className="absolute bottom-14 inset-x-3 pointer-events-none flex justify-center">
                  <div
                    className={`px-3.5 py-2 rounded-xl text-center text-xs leading-snug line-clamp-3 ${activeCaptionPreset.wrapperClass}`}
                  >
                    <span className={activeCaptionPreset.textClass}>{captionText}</span>
                  </div>
                </div>
              )}

              <div className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none">
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 bg-black/50 px-2 py-0.5 rounded">
                  9:16 • 1080×1920 • CLEAN EXPORT
                </span>
              </div>
            </div>

            <div className="w-full max-w-75 flex items-center justify-between gap-2">
              <button
                onClick={togglePlay}
                className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? 'Pause Loop' : 'Preview Cut'}
              </button>

              <button
                onClick={() => setIsMuted((m) => !m)}
                className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 transition cursor-pointer"
                title="Mute / Unmute"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                onClick={captureThumbnailFrame}
                className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-cyan-300 transition cursor-pointer"
                title="Capture 9:16 Cover Frame"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full max-w-75 space-y-2.5 pt-1 border-t border-zinc-800/80">
              <div>
                <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                  <span>Subject Crop Zoom</span>
                  <span className="font-mono text-cyan-300">{zoomScale.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="2.2"
                  step="0.05"
                  value={zoomScale}
                  onChange={(e) => setZoomScale(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                  <span>Horizontal Face Pan</span>
                  <span className="font-mono text-cyan-300">{panX}%</span>
                </div>
                <input
                  type="range"
                  min="-25"
                  max="25"
                  step="1"
                  value={panX}
                  onChange={(e) => setPanX(parseInt(e.target.value, 10))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>

            {capturedFrameUrl && (
              <div className="w-full max-w-75 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={capturedFrameUrl}
                    alt="Captured cover"
                    className="w-9 h-14 object-cover rounded border border-zinc-700"
                  />
                  <div>
                    <p className="text-xs font-bold text-white">9:16 Cover Ready</p>
                    <p className="text-[10px] text-zinc-400">540×960 PNG</p>
                  </div>
                </div>
                <a
                  href={capturedFrameUrl}
                  download="clip-cover-9x16.png"
                  className="px-2.5 py-1.5 rounded-lg bg-cyan-400 text-black text-[11px] font-bold"
                >
                  Save PNG
                </a>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>
        </section>

        <section className="lg:col-span-4 space-y-5">
          <div className="rounded-2xl bg-[#0d1019] border border-zinc-800/90 p-4 space-y-3.5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-2">
              <Subtitles className="w-4 h-4" /> 4. Cut & Caption Controls
            </h2>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Clip Title</label>
              <input
                type="text"
                value={clipTitle}
                onChange={(e) => setClipTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-cyan-400 outline-none text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Start (sec)</label>
                <input
                  type="number"
                  min="0"
                  value={startSec}
                  onChange={(e) => setStartSec(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-cyan-400 outline-none text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">End (sec)</label>
                <input
                  type="number"
                  min="1"
                  value={endSec}
                  onChange={(e) => setEndSec(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-cyan-400 outline-none text-xs font-mono text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Top Hook Banner</label>
              <input
                type="text"
                value={hookText}
                onChange={(e) => setHookText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-cyan-400 outline-none text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Caption / Subtitle Line</label>
              <textarea
                rows={2}
                value={captionText}
                onChange={(e) => setCaptionText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-cyan-400 outline-none text-xs text-white resize-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1.5">Caption Preset</label>
              <div className="grid grid-cols-3 gap-2">
                {CAPTION_PRESETS.map((preset) => {
                  const selected = preset.id === captionPresetId;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => setCaptionPresetId(preset.id)}
                      className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                        selected
                          ? 'bg-cyan-500/15 border-cyan-400 text-white'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <p className="text-[10px] font-black">{preset.name}</p>
                      <p className="text-[9px] text-zinc-400">{preset.badge}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Assign Campaign / Channel</label>
              <select
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-cyan-400 outline-none text-xs text-white"
              >
                {safeCampaigns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <form onSubmit={addCampaign} className="mt-2 flex gap-2">
                <input
                  type="text"
                  placeholder="New campaign folder..."
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-cyan-300 cursor-pointer"
                >
                  + Add
                </button>
              </form>
            </div>

            <button
              onClick={saveClipToVault}
              className="w-full py-3 px-4 rounded-xl bg-linear-to-r from-cyan-400 to-emerald-400 hover:opacity-95 text-black font-black text-xs tracking-wide shadow-[0_0_24px_rgba(34,211,238,0.25)] transition cursor-pointer"
            >
              + SAVE CLIP TO UNLIMITED VAULT
            </button>
          </div>

          <div className="rounded-2xl bg-[#0d1019] border border-zinc-800/90 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                <FolderKanban className="w-4 h-4" /> 5. Unlimited Clip Vault ({savedClips.length})
              </h2>
              <span className="text-[10px] text-zinc-500">FFmpeg + SRT Ready</span>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {savedClips.length === 0 ? (
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center text-xs text-zinc-400">
                  No saved cuts yet. Set your timestamps and click{' '}
                  <strong className="text-emerald-300">Save Clip to Unlimited Vault</strong>.
                </div>
              ) : (
                savedClips.map((clip) => {
                  const ffmpegCmd = buildFfmpegCommand(clip);
                  const srtText = buildSrtContent(clip);
                  return (
                    <div
                      key={clip.id}
                      className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-white">{clip.title}</p>
                          <p className="text-[10px] text-cyan-300">
                            {clip.campaign} • {clip.start}s–{clip.end}s ({clip.duration}s)
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setSavedClips((prev) => prev.filter((item) => item.id !== clip.id))
                          }
                          className="text-zinc-500 hover:text-rose-400 transition cursor-pointer"
                          title="Delete clip"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <button
                          onClick={() =>
                            copyText(`ff-${clip.id}`, ffmpegCmd, 'Copied FFmpeg 9:16 render command')
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold text-cyan-300 cursor-pointer"
                        >
                          {copiedId === `ff-${clip.id}` ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Terminal className="w-3 h-3" />
                          )}
                          Copy FFmpeg
                        </button>

                        <button
                          onClick={() =>
                            downloadFile(
                              `${clip.title.replace(/[^a-z0-9_-]/gi, '_').toLowerCase()}.srt`,
                              srtText
                            )
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold text-emerald-300 cursor-pointer"
                        >
                          <Download className="w-3 h-3" /> .SRT
                        </button>

                        <button
                          onClick={() =>
                            copyText(
                              `hook-${clip.id}`,
                              `${clip.hook}\n\n${clip.caption}`,
                              'Copied Hook & Captions'
                            )
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold text-zinc-200 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" /> Copy Text
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <StudioErrorBoundary>
      <ClipStudioApp />
    </StudioErrorBoundary>
  );
}
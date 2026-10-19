/* ============ Helpers ============ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ============ Toast ============ */
let toastTimer;
function toast(msg, ms = 3200) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), ms);
}

/* ============ Discovery meter (gamified exploration) ============ */
const found = new Set();
const GOAL = 5;
function discover(key, msg) {
  if (found.has(key)) return;
  found.add(key);
  $("#meterCount").textContent = found.size;
  $("#meterFill").style.width = (found.size / GOAL) * 100 + "%";
  if (found.size === GOAL) {
    toast("🏆 You found all 5 secrets! You're officially awesome.", 5000);
    launchConfetti();
  } else if (msg) {
    toast(msg);
  }
}

/* ============ Typewriter ============ */
const roles = ["Web Developer 💻", "Creative Thinker 🎨", "Lifelong Learner 📚", "Coffee Enthusiast ☕"];
let r = 0, c = 0, deleting = false;
function type() {
  const word = roles[r];
  $("#typed").textContent = word.slice(0, c);
  if (!deleting && c < word.length) { c++; setTimeout(type, 85); }
  else if (!deleting) { deleting = true; setTimeout(type, 1200); }
  else if (c > 0) { c--; setTimeout(type, 40); }
  else { deleting = false; r = (r + 1) % roles.length; setTimeout(type, 300); }
}
type();

/* ============ Photo (with fallback if photo.jpg is missing) ============ */
const photo = $("#photo");
const img = $("#photoImg");
function photoFallback() {
  img.remove();
  const d = document.createElement("div");
  d.className = "initials";
  d.textContent = "YN"; // <- change to your initials
  photo.appendChild(d);
}
img.addEventListener("error", photoFallback);
if (img.complete && img.naturalWidth === 0) photoFallback();

const photoMsgs = ["Hi there! 👋", "Hehe, that tickles! 😄", "Okay okay, I'm famous now 😎", "Stop spinning me! 🌀"];
let pm = 0;
function photoClick() {
  photo.classList.remove("spin");
  void photo.offsetWidth; // restart animation
  photo.classList.add("spin");
  discover("photo", "📸 Secret #1 found: the spinning photo!");
  if (found.has("photo") && pm > 0) toast(photoMsgs[pm % photoMsgs.length], 1800);
  pm++;
}
photo.addEventListener("click", photoClick);
photo.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); photoClick(); } });

/* ============ Time spent counter + friendly nudges ============ */
let secs = 0;
setInterval(() => {
  secs++;
  $("#stay").textContent = secs;
  if (secs === 15 && found.size === 0) toast("💡 Psst... try clicking my photo!", 4000);
  if (secs === 30 && found.size < GOAL) toast("⏳ 15 seconds left... can you find all 5 secrets?", 4000);
  if (secs === 45) toast("🎉 45 seconds! Thanks for staying. Want to keep going?", 5000);
}, 1000);

/* ============ Theme toggle ============ */
$("#themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("light");
  const light = document.body.classList.contains("light");
  $("#themeBtn").textContent = light ? "☀️" : "🌙";
  discover("theme", "🎨 Secret found: theme switcher!");
});

/* ============ Scroll reveal + count-up + skill bars ============ */
function countUp(el) {
  const target = +el.dataset.count;
  const start = performance.now(), dur = 1500;
  (function step(now) {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = Math.floor(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  })(start);
}
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add("show");
    $$("[data-count]", e.target).forEach(countUp);
    $$(".skill", e.target).forEach((s, i) => {
      setTimeout(() => { $("i", s).style.width = s.dataset.level + "%"; }, i * 150);
    });
    io.unobserve(e.target);
  });
}, { threshold: 0.2 });
$$(".reveal").forEach(el => io.observe(el));

/* ============ Skills: interactive ============ */
$$(".skill").forEach(s => {
  const act = () => {
    s.classList.toggle("active");
    const bar = $("i", s);
    bar.style.width = "0";
    setTimeout(() => (bar.style.width = s.dataset.level + "%"), 80);
    discover("skill", "⚡ Secret found: animated skills!");
  };
  s.addEventListener("click", act);
  s.addEventListener("mouseenter", () => discover("skill", "⚡ Secret found: animated skills!"));
});

/* ============ Flip cards ============ */
$$(".card").forEach(card => {
  const flip = () => {
    card.classList.toggle("flipped");
    discover("flip", "🔄 Secret found: flip cards!");
  };
  card.addEventListener("click", flip);
  card.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });
});

/* ============ Interest chips ============ */
$$(".chip").forEach(chip => {
  chip.addEventListener("click", () => {
    $$(".chip").forEach(c => c.classList.remove("on"));
    chip.classList.add("on");
    $("#chipMsg").textContent = chip.dataset.msg;
  });
});

/* ============ Two Truths & a Lie ============ */
$$(".opt").forEach(btn => {
  btn.addEventListener("click", () => {
    const isLie = btn.dataset.lie === "true";
    $$(".opt").forEach(b => {
      b.disabled = true;
      if (b.dataset.lie === "true") b.classList.add("correct");
    });
    if (isLie) {
      $("#gameResult").textContent = "🎯 Correct! You spotted the lie. You know me well already!";
      discover("game", "🎮 Secret found: you beat my game!");
    } else {
      btn.classList.remove("correct");
      btn.classList.add("wrong");
      $("#gameResult").textContent = "😅 Nope! That one's true. The green one was the lie.";
      discover("game", "🎮 Secret found: you played my game!");
    }
  });
});

/* ============ Surprise button ============ */
const surprises = [
  "🍕 Fun fact: I can eat pizza any time of day.",
  "🚀 My dream: build something that helps people.",
  "🎧 I code best with music on.",
  "🌟 Thanks for being here, you made my day!"
];
let si = 0;
$("#surprise").addEventListener("click", () => {
  toast(surprises[si++ % surprises.length], 3500);
  launchConfetti();
});

/* ============ Background particles (reacts to mouse) ============ */
const bg = $("#bg"), bctx = bg.getContext("2d");
let W, H, parts = [];
const mouse = { x: -999, y: -999 };
function resize() {
  W = bg.width = innerWidth;
  H = bg.height = innerHeight;
  const n = Math.min(70, Math.floor((W * H) / 20000));
  parts = Array.from({ length: n }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
    r: Math.random() * 2 + 1
  }));
}
addEventListener("resize", resize);
addEventListener("mousemove", e => { mouse.x = e.clientX; mouse.y = e.clientY; });
resize();
(function draw() {
  bctx.clearRect(0, 0, W, H);
  const col = document.body.classList.contains("light") ? "80,70,200" : "160,140,255";
  parts.forEach((p, i) => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;
    const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
    if (d < 120) { p.x += dx / d * 1.6; p.y += dy / d * 1.6; }
    bctx.beginPath();
    bctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    bctx.fillStyle = `rgba(${col},0.7)`;
    bctx.fill();
    for (let j = i + 1; j < parts.length; j++) {
      const q = parts[j], dist = Math.hypot(p.x - q.x, p.y - q.y);
      if (dist < 110) {
        bctx.strokeStyle = `rgba(${col},${0.25 * (1 - dist / 110)})`;
        bctx.beginPath(); bctx.moveTo(p.x, p.y); bctx.lineTo(q.x, q.y); bctx.stroke();
      }
    }
  });
  requestAnimationFrame(draw);
})();

/* ============ Confetti ============ */
const cv = $("#confetti"), cx = cv.getContext("2d");
let bits = [], running = false;
function launchConfetti() {
  cv.width = innerWidth; cv.height = innerHeight;
  const colors = ["#7c5cff", "#00d4ff", "#ff5c9d", "#ffd166", "#06d6a0"];
  for (let i = 0; i < 150; i++) {
    bits.push({
      x: innerWidth / 2, y: innerHeight / 2,
      vx: (Math.random() - 0.5) * 16, vy: Math.random() * -14 - 2,
      s: Math.random() * 8 + 4, rot: Math.random() * 6,
      vr: (Math.random() - 0.5) * 0.3, c: colors[i % colors.length], life: 140
    });
  }
  if (!running) { running = true; requestAnimationFrame(tick); }
}
function tick() {
  cx.clearRect(0, 0, cv.width, cv.height);
  bits = bits.filter(b => b.life > 0);
  bits.forEach(b => {
    b.vy += 0.35; b.x += b.vx; b.y += b.vy; b.rot += b.vr; b.life--;
    cx.save();
    cx.translate(b.x, b.y); cx.rotate(b.rot);
    cx.globalAlpha = Math.min(1, b.life / 40);
    cx.fillStyle = b.c;
    cx.fillRect(-b.s / 2, -b.s / 2, b.s, b.s * 0.6);
    cx.restore();
  });
  if (bits.length) requestAnimationFrame(tick);
  else { running = false; cx.clearRect(0, 0, cv.width, cv.height); }
}

/* Welcome toast shortly after load */
setTimeout(() => toast("👋 Welcome! Click around, there are 5 secrets hidden here."), 1800);
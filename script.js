(function () {
  'use strict';

  /* ------------------------------------------------------------------
     Footer year
  ------------------------------------------------------------------ */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------
     Mobile nav toggle
  ------------------------------------------------------------------ */
  var navToggle = document.getElementById('navToggle');
  var mobileMenu = document.getElementById('mobileMenu');

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ------------------------------------------------------------------
     Scroll reveal
  ------------------------------------------------------------------ */
  var revealTargets = document.querySelectorAll(
    '.about-visual, .about-content, .card, .skills-grid > div, .contact-inner > *, .avatar-frame'
  );

  revealTargets.forEach(function (el, i) {
    el.classList.add('reveal');
    el.style.transitionDelay = (i % 6) * 60 + 'ms';
  });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ------------------------------------------------------------------
     Point-sphere background ("planet made of points")
  ------------------------------------------------------------------ */
  var canvas = document.getElementById('sky');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');

  var reducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var DPR = Math.min(window.devicePixelRatio || 1, 2);

  var width, height, sphereRadius, centerX, centerY;
  var pointCount, starCount;
  var points = [];   // base unit-sphere coordinates
  var edges = [];     // precomputed neighbor pairs [i, j]
  var stars = [];
  var projected = []; // reused per-frame projected point data

  var mouseX = 0, mouseY = 0;       // target, normalized -1..1
  var smoothX = 0, smoothY = 0;     // eased

  function isMobile() {
    return window.innerWidth < 720;
  }

  function setSizes() {
    pointCount = isMobile() ? 480 : 900;
    starCount = isMobile() ? 90 : 160;
  }

  function resize() {
    width = canvas.width = Math.floor(window.innerWidth * DPR);
    height = canvas.height = Math.floor(window.innerHeight * DPR);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';

    sphereRadius = Math.max(window.innerWidth, window.innerHeight) * 0.58 * DPR;
    centerX = width / 2;
    centerY = sphereRadius + window.innerHeight * 0.5 * DPR;
  }

  function buildSphere() {
    points = [];
    var n = pointCount;
    var goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (var i = 0; i < n; i++) {
      var y = 1 - (i / (n - 1)) * 2;         // 1 -> -1
      var radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      var theta = goldenAngle * i;
      var x = Math.cos(theta) * radiusAtY;
      var z = Math.sin(theta) * radiusAtY;
      points.push({ x: x, y: y, z: z });
    }

    // Precompute a few nearest neighbors per point for a subtle
    // constellation-line effect. Brute force is fine: this runs once.
    edges = [];
    var seen = Object.create(null);
    var k = isMobile() ? 2 : 3;

    for (var a = 0; a < points.length; a++) {
      var best = [];
      for (var b = 0; b < points.length; b++) {
        if (a === b) continue;
        var dx = points[a].x - points[b].x;
        var dy = points[a].y - points[b].y;
        var dz = points[a].z - points[b].z;
        var d2 = dx * dx + dy * dy + dz * dz;
        if (best.length < k) {
          best.push([d2, b]);
          best.sort(function (p, q) { return p[0] - q[0]; });
        } else if (d2 < best[best.length - 1][0]) {
          best[best.length - 1] = [d2, b];
          best.sort(function (p, q) { return p[0] - q[0]; });
        }
      }
      for (var m = 0; m < best.length; m++) {
        var bIdx = best[m][1];
        var key = a < bIdx ? a + '-' + bIdx : bIdx + '-' + a;
        if (!seen[key]) {
          seen[key] = true;
          edges.push([a, bIdx]);
        }
      }
    }
  }

  function buildStars() {
    stars = [];
    for (var i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random() * 0.75, // keep stars mostly in the upper sky
        r: (Math.random() * 1.1 + 0.3) * DPR,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.8
      });
    }
  }

  function init() {
    setSizes();
    resize();
    buildSphere();
    buildStars();
  }

  init();

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var wasMobile = pointCount === 480;
      setSizes();
      resize();
      if (wasMobile !== (pointCount === 480)) buildSphere();
      buildStars();
    }, 150);
  });

  window.addEventListener('mousemove', function (e) {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  /* -- render helpers -- */
  function lerp(a, b, t) { return a + (b - a) * t; }

  function drawFrame(time) {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#0a0d12';
    ctx.fillRect(0, 0, width, height);

    var t = time * 0.001;

    // Stars
    for (var s = 0; s < stars.length; s++) {
      var st = stars[s];
      var tw = reducedMotion ? 0.6 : 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * st.speed + st.phase));
      ctx.beginPath();
      ctx.fillStyle = 'rgba(238,243,247,' + (tw * 0.7).toFixed(3) + ')';
      ctx.arc(st.x * width, st.y * height, st.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ease mouse parallax
    smoothX = lerp(smoothX, mouseX, 0.04);
    smoothY = lerp(smoothY, mouseY, 0.04);

    var spin = reducedMotion ? 0.3 : t * 0.18 + smoothX * 0.4;
    var tilt = 0.5 + smoothY * 0.12; // base tilt so we view the sphere from slightly above

    var cosSpin = Math.cos(spin), sinSpin = Math.sin(spin);
    var cosTilt = Math.cos(tilt), sinTilt = Math.sin(tilt);

    var cx = centerX + smoothX * 30 * DPR;
    var cy = centerY - smoothY * 20 * DPR;

    for (var i = 0; i < points.length; i++) {
      var p = points[i];

      // Rotate around Y axis (spin)
      var x1 = p.x * cosSpin + p.z * sinSpin;
      var z1 = -p.x * sinSpin + p.z * cosSpin;
      var y1 = p.y;

      // Then tilt around X axis (viewing angle)
      var y2 = y1 * cosTilt - z1 * sinTilt;
      var z2 = y1 * sinTilt + z1 * cosTilt;

      var sx = cx + x1 * sphereRadius;
      var sy = cy + y2 * sphereRadius;

      projected[i] = { x: sx, y: sy, depth: (z2 + 1) / 2, visible: sy > -40 && sy < height + 40 };
    }

    // Edges (drawn first, underneath the points)
    for (var e = 0; e < edges.length; e++) {
      var pa = projected[edges[e][0]];
      var pb = projected[edges[e][1]];
      if (!pa || !pb || !pa.visible || !pb.visible) continue;
      var avgDepth = (pa.depth + pb.depth) / 2;
      if (avgDepth < 0.35) continue; // keep far-side lines from muddying the view
      var alpha = lerp(0.02, 0.16, avgDepth);
      ctx.strokeStyle = 'rgba(74,158,255,' + alpha.toFixed(3) + ')';
      ctx.lineWidth = DPR * 0.6;
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
    }

    // Points
    for (var j = 0; j < points.length; j++) {
      var pr = projected[j];
      if (!pr || !pr.visible) continue;
      var depth = pr.depth;
      var rad = lerp(0.5, 2.1, depth) * DPR;
      var a2 = lerp(0.12, 0.95, depth);
      var color = depth > 0.6 ? '142,203,255' : '90,120,150';
      ctx.beginPath();
      ctx.fillStyle = 'rgba(' + color + ',' + a2.toFixed(3) + ')';
      ctx.arc(pr.x, pr.y, rad, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (reducedMotion) {
    drawFrame(0);
  } else {
    (function loop(time) {
      drawFrame(time || 0);
      requestAnimationFrame(loop);
    })(0);
  }
})();

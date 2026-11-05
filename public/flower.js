// Shaded SVG flower renderer. Flower.svg(species, stage, {wet, uid}) → string.
(function () {
  let seq = 0;
  const hex = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const mix = (a, b, t) => { const x = hex(a), y = hex(b); return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
  const dark = (c, t) => mix(c, '#2a0f1f', t);
  const light = (c, t) => mix(c, '#ffffff', t);
  const r2 = (n) => Math.round(n * 100) / 100;

  function petalPath(shape, L, W) {
    switch (shape) {
      case 'pointed': return `M0 0 C${W} ${-L * .28} ${W * .55} ${-L * .82} 0 ${-L} C${-W * .55} ${-L * .82} ${-W} ${-L * .28} 0 0Z`;
      case 'long': return `M0 0 C${W} ${-L * .2} ${W * .9} ${-L * .9} 0 ${-L} C${-W * .9} ${-L * .9} ${-W} ${-L * .2} 0 0Z`;
      case 'heart': return `M0 0 C${W * 1.1} ${-L * .25} ${W * 1.15} ${-L * .95} ${W * .3} ${-L} Q0 ${-L * .86} ${-W * .3} ${-L} C${-W * 1.15} ${-L * .95} ${-W * 1.1} ${-L * .25} 0 0Z`;
      case 'ruffle': {
        const pts = [];
        for (let i = 0; i <= 28; i++) {
          const t = i / 28, a = Math.PI * t;
          const rr = 1 + (i % 2 ? .08 : -.06);
          pts.push([Math.cos(a) * W * 1.05 * rr, -L * .5 - Math.sin(a) * L * .5 * rr]);
        }
        return `M0 0 L${r2(pts[0][0])} ${r2(pts[0][1])} ` + pts.map((p) => `L${r2(p[0])} ${r2(p[1])}`).join(' ') + ' Z';
      }
      default: return `M0 0 C${W} ${-L * .25} ${W * 1.05} ${-L * .85} 0 ${-L} C${-W * 1.05} ${-L * .85} ${-W} ${-L * .25} 0 0Z`;
    }
  }

  function defs(u, f) {
    return `<defs>
      <filter id="${u}lit" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="2.6" result="b"/>
        <feSpecularLighting in="b" surfaceScale="5" specularConstant=".9" specularExponent="22" lighting-color="#fff" result="s"><fePointLight x="40" y="-60" z="220"/></feSpecularLighting>
        <feComposite in="s" in2="SourceAlpha" operator="in" result="s2"/>
        <feComposite in="SourceGraphic" in2="s2" operator="arithmetic" k1="0" k2="1" k3=".6" k4="0" result="lit"/>
        <feDropShadow in="lit" dx="0" dy="3" stdDeviation="3" flood-color="#3a1030" flood-opacity=".28"/>
      </filter>
      <filter id="${u}soft"><feGaussianBlur stdDeviation="6"/></filter>
      <filter id="${u}glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
      <radialGradient id="${u}petal" cx="150" cy="${f.cy}" r="${f.R}" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="${light(f.color2, .25)}"/><stop offset=".55" stop-color="${f.color2}"/><stop offset=".85" stop-color="${f.color}"/><stop offset="1" stop-color="${dark(f.color, .25)}"/>
      </radialGradient>
      <radialGradient id="${u}petalIn" cx="150" cy="${f.cy}" r="${f.R}" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="${light(f.color2, .45)}"/><stop offset=".6" stop-color="${light(f.color2, .1)}"/><stop offset="1" stop-color="${f.color}"/>
      </radialGradient>
      <radialGradient id="${u}center" cx=".38" cy=".35" r=".7">
        <stop offset="0" stop-color="${light(f.center, .45)}"/><stop offset=".6" stop-color="${f.center}"/><stop offset="1" stop-color="${dark(f.center, .45)}"/>
      </radialGradient>
      <linearGradient id="${u}side" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${dark(f.color, .3)}"/><stop offset=".45" stop-color="${f.color}"/><stop offset=".7" stop-color="${light(f.color2, .2)}"/><stop offset="1" stop-color="${dark(f.color, .2)}"/>
      </linearGradient>
      <linearGradient id="${u}tip" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stop-color="${f.color}"/><stop offset="1" stop-color="${light(f.color2, .2)}"/>
      </linearGradient>
      <linearGradient id="${u}stem" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#2f7a43"/><stop offset=".45" stop-color="#6fcf7e"/><stop offset="1" stop-color="#2c6e3d"/>
      </linearGradient>
      <linearGradient id="${u}leaf" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#8be08f"/><stop offset=".5" stop-color="#46b35e"/><stop offset="1" stop-color="#23753a"/>
      </linearGradient>
      <linearGradient id="${u}pot" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#a9553a"/><stop offset=".22" stop-color="#e48a64"/><stop offset=".42" stop-color="#f6b08c"/><stop offset=".7" stop-color="#d9764f"/><stop offset="1" stop-color="#8f432c"/>
      </linearGradient>
      <linearGradient id="${u}rim" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f7b593"/><stop offset="1" stop-color="#c7623f"/>
      </linearGradient>
      <radialGradient id="${u}soil" cx=".5" cy=".4" r=".6">
        <stop offset="0" stop-color="${f.wet ? '#4a2c1e' : '#7a4f36'}"/><stop offset="1" stop-color="${f.wet ? '#24130c' : '#4b2e1f'}"/>
      </radialGradient>
      <radialGradient id="${u}bg" cx=".5" cy=".42" r=".6">
        <stop offset="0" stop-color="${light(f.color2, .55)}" stop-opacity=".9"/><stop offset="1" stop-color="${light(f.color2, .55)}" stop-opacity="0"/>
      </radialGradient>
    </defs>`;
  }

  function leaf(u, x, y, ang, s) {
    return `<g transform="translate(${x} ${y}) rotate(${ang}) scale(${s})" filter="url(#${u}lit)">
      <path d="M0 0 C14 -16 44 -18 62 -4 C44 10 16 12 0 0Z" fill="url(#${u}leaf)"/>
      <path d="M2 0 C20 -4 40 -5 58 -4" stroke="#b9f0bd" stroke-width="1.4" fill="none" opacity=".75"/>
      ${[14, 26, 38].map((v) => `<path d="M${v} -2 l8 -7 M${v} -1 l8 6" stroke="#b9f0bd" stroke-width=".8" opacity=".5"/>`).join('')}
    </g>`;
  }

  function head(u, f) {
    const cx = 150, cy = f.cy, R = f.R;
    let g = '';
    if (f.shape === 'cup') {
      const w = R * .95, h = R * 1.15;
      g += `<g filter="url(#${u}lit)">
        <path d="M${cx - w * .55} ${cy + h * .35} C${cx - w * .7} ${cy - h * .2} ${cx - w * .2} ${cy - h * .75} ${cx} ${cy - h * .62} C${cx + w * .2} ${cy - h * .75} ${cx + w * .7} ${cy - h * .2} ${cx + w * .55} ${cy + h * .35} Z" fill="${dark(f.color, .12)}"/>
        <path d="M${cx - w * .62} ${cy + h * .3} C${cx - w * .95} ${cy - h * .25} ${cx - w * .45} ${cy - h * .78} ${cx - w * .12} ${cy - h * .66} C${cx + w * .05} ${cy - h * .2} ${cx + w * .1} ${cy + h * .2} ${cx + w * .05} ${cy + h * .42} Z" fill="url(#${u}side)"/>
        <path d="M${cx + w * .62} ${cy + h * .3} C${cx + w * .95} ${cy - h * .25} ${cx + w * .45} ${cy - h * .78} ${cx + w * .12} ${cy - h * .66} C${cx - w * .05} ${cy - h * .2} ${cx - w * .1} ${cy + h * .2} ${cx - w * .05} ${cy + h * .42} Z" fill="url(#${u}side)"/>
        <path d="M${cx - w * .32} ${cy + h * .42} C${cx - w * .45} ${cy} ${cx - w * .2} ${cy - h * .5} ${cx} ${cy - h * .55} C${cx + w * .2} ${cy - h * .5} ${cx + w * .45} ${cy} ${cx + w * .32} ${cy + h * .42} Z" fill="url(#${u}tip)"/>
      </g>
      <path d="M${cx - w * .18} ${cy - h * .35} C${cx - w * .25} ${cy - h * .05} ${cx - w * .2} ${cy + h * .2} ${cx - w * .1} ${cy + h * .32}" stroke="#fff" stroke-width="3" opacity=".35" fill="none" stroke-linecap="round"/>`;
      return g;
    }
    if (f.shape === 'spike') {
      const stalks = [[-14, -18, .82], [14, 16, .86], [0, 0, 1]];
      for (const [dx, rot, sc] of stalks) {
        let s2 = `<path d="M${cx} ${cy + R * .9} L${cx} ${cy - R * .9 * sc}" stroke="#4c9a5a" stroke-width="2.4"/>`;
        for (let i = 0; i < 13; i++) {
          const t = i / 12, y = cy + R * .75 - t * R * 1.6 * sc, sp = (1 - t * .55) * 7;
          const col = mix(f.color, f.color2, t * .8);
          for (const side of [-1, 1]) s2 += `<ellipse cx="${r2(cx + side * sp)}" cy="${r2(y)}" rx="${r2(4.6 - t * 1.6)}" ry="${r2(6.4 - t * 2)}" fill="${col}" stroke="${dark(col, .35)}" stroke-width=".6" transform="rotate(${side * 32} ${r2(cx + side * sp)} ${r2(y)})"/>`;
          if (i % 2) s2 += `<ellipse cx="${cx}" cy="${r2(y - 3)}" rx="${r2(4 - t * 1.4)}" ry="${r2(5.4 - t * 1.6)}" fill="${light(col, .15)}" stroke="${dark(col, .3)}" stroke-width=".5"/>`;
        }
        g += `<g transform="rotate(${rot} ${cx} ${cy + R * .9}) translate(${dx * .3} 0)">${s2}</g>`;
      }
      return `<g filter="url(#${u}lit)">${g}</g>`;
    }
    if (f.shape === 'ball') {
      const items = [];
      for (let i = 0; i < 46; i++) {
        const a = i * 2.39996, rr = Math.sqrt(i / 46) * R * .92;
        items.push({ x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr * .9, d: Math.sin(a) });
      }
      items.sort((a, b) => a.y - b.y);
      for (const it of items) {
        const t = (it.y - (cy - R)) / (2 * R);
        const col = mix(f.color2, f.color, Math.min(1, Math.max(0, t)));
        g += `<g transform="translate(${r2(it.x)} ${r2(it.y)}) rotate(${r2(it.d * 40)})">` +
          [0, 90, 180, 270].map((rot) => `<path d="${petalPath('round', 11, 6.5)}" transform="rotate(${rot})" fill="${col}" stroke="${dark(col, .25)}" stroke-width=".5"/>`).join('') +
          `<circle r="1.8" fill="${light(f.center, .5)}"/></g>`;
      }
      return `<g filter="url(#${u}lit)">${g}</g>`;
    }
    const layers = f.layers || 1;
    for (let L = 0; L < layers; L++) {
      const k = 1 - L * (layers > 2 ? .2 : .28);
      const n = f.petals;
      const len = R * k * (f.shape === 'long' ? 1 : .95), wid = (f.shape === 'long' ? R * .13 : R * (Math.PI / n) * .62) * (L ? 1.05 : 1);
      const fill = L === 0 ? `url(#${u}petal)` : `url(#${u}petalIn)`;
      const off = L * (180 / n) + (f.shape === 'trumpet' ? 30 : 0);
      for (let i = 0; i < n; i++) {
        const a = (360 / n) * i + off;
        g += `<path d="${petalPath(f.shape === 'trumpet' ? 'pointed' : f.shape, len, wid)}" transform="translate(${cx} ${cy}) rotate(${r2(a)})" fill="${fill}" stroke="${dark(f.color, .35)}" stroke-opacity=".35" stroke-width=".8"/>`;
        if (f.shape === 'trumpet' || f.shape === 'pointed') g += `<path d="M0 ${-len * .12} L0 ${-len * .82}" transform="translate(${cx} ${cy}) rotate(${r2(a)})" stroke="${dark(f.color, .2)}" stroke-opacity=".3" stroke-width="1.2"/>`;
      }
    }
    g = `<g filter="url(#${u}lit)">${g}</g>`;
    // Centers
    if (f.shape === 'trumpet' && f.id === 'daffodil') {
      g += `<circle cx="${cx}" cy="${cy}" r="${R * .38}" fill="url(#${u}center)" filter="url(#${u}lit)"/><circle cx="${cx}" cy="${cy}" r="${R * .22}" fill="${dark(f.center, .35)}" opacity=".55"/>`;
    } else if (f.shape === 'trumpet') {
      g += `<circle cx="${cx}" cy="${cy}" r="${R * .16}" fill="${light(f.color2, .3)}" opacity=".8"/>`;
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI * 2 * i) / 6 - Math.PI / 2, ex = cx + Math.cos(a) * R * .42, ey = cy + Math.sin(a) * R * .42;
        g += `<path d="M${cx} ${cy} Q${r2((cx + ex) / 2 + 4)} ${r2((cy + ey) / 2)} ${r2(ex)} ${r2(ey)}" stroke="#9bd18a" stroke-width="1.6" fill="none"/><ellipse cx="${r2(ex)}" cy="${r2(ey)}" rx="4" ry="2.4" fill="${f.center}" transform="rotate(${r2(a * 57.3)} ${r2(ex)} ${r2(ey)})"/>`;
      }
    } else if (['sunflower', 'gerbera', 'daisy'].includes(f.id)) {
      const cr = R * (f.id === 'sunflower' ? .42 : .3);
      g += `<circle cx="${cx}" cy="${cy}" r="${cr}" fill="url(#${u}center)" filter="url(#${u}lit)"/>`;
      for (let i = 0; i < (f.id === 'sunflower' ? 120 : 60); i++) {
        const a = i * 2.39996, rr = Math.sqrt(i / (f.id === 'sunflower' ? 120 : 60)) * cr * .9;
        g += `<circle cx="${r2(cx + Math.cos(a) * rr)}" cy="${r2(cy + Math.sin(a) * rr)}" r="${r2(cr * .045)}" fill="${dark(f.center, .5)}" opacity=".7"/>`;
      }
    } else if (f.shape !== 'ruffle' && !(f.shape === 'round' && f.layers > 2)) {
      g += `<circle cx="${cx}" cy="${cy}" r="${R * .16}" fill="url(#${u}center)" filter="url(#${u}lit)"/>`;
      for (let i = 0; i < 9; i++) {
        const a = (Math.PI * 2 * i) / 9;
        g += `<circle cx="${r2(cx + Math.cos(a) * R * .2)}" cy="${r2(cy + Math.sin(a) * R * .2)}" r="2" fill="${light(f.center, .6)}"/>`;
      }
    } else {
      g += `<circle cx="${cx}" cy="${cy}" r="${R * .12}" fill="${dark(f.color, .2)}" opacity=".55" filter="url(#${u}soft)"/>`;
    }
    if (f.id === 'rose' || f.id === 'camellia') {
      let sp = `M${cx} ${cy}`;
      for (let a = 0; a < Math.PI * 5; a += .25) { const rr = 1.5 + a * R * .032; sp += ` L${r2(cx + Math.cos(a) * rr)} ${r2(cy + Math.sin(a) * rr * .9)}`; }
      g += `<path d="${sp}" stroke="${dark(f.color, .45)}" stroke-width="2.2" fill="none" opacity=".75" stroke-linecap="round"/>`;
    }
    return g;
  }

  function bud(u, f) {
    const cx = 150, cy = f.cy + 10;
    return `<g filter="url(#${u}lit)">
      <path d="M${cx} ${cy + 22} C${cx - 20} ${cy + 6} ${cx - 16} ${cy - 22} ${cx} ${cy - 34} C${cx + 16} ${cy - 22} ${cx + 20} ${cy + 6} ${cx} ${cy + 22}Z" fill="url(#${u}tip)"/>
      <path d="M${cx} ${cy + 24} C${cx - 18} ${cy + 18} ${cx - 22} ${cy - 2} ${cx - 12} ${cy - 10} C${cx - 8} ${cy + 4} ${cx - 2} ${cy + 14} ${cx} ${cy + 24}Z" fill="url(#${u}leaf)"/>
      <path d="M${cx} ${cy + 24} C${cx + 18} ${cy + 18} ${cx + 22} ${cy - 2} ${cx + 12} ${cy - 10} C${cx + 8} ${cy + 4} ${cx + 2} ${cy + 14} ${cx} ${cy + 24}Z" fill="url(#${u}leaf)"/>
    </g>
    <path d="M${cx - 6} ${cy - 18} C${cx - 9} ${cy - 6} ${cx - 8} ${cy + 4} ${cx - 5} ${cy + 10}" stroke="#fff" stroke-width="2.5" opacity=".4" fill="none" stroke-linecap="round"/>`;
  }

  function svg(species, stage, opts = {}) {
    const u = `f${++seq}_`;
    const f = { ...(species || { id: 'none', shape: 'round', petals: 5, layers: 1, color: '#ff8fb5', color2: '#ffd6e3', center: '#ffd45e' }), wet: !!opts.wet };
    const soilY = 268;
    const stemTop = [soilY, soilY - 34, soilY - 82, soilY - 120, soilY - 142][Math.max(0, stage)];
    f.cy = stage >= 4 ? (f.shape === 'spike' ? stemTop - 30 : stemTop - 14) : stemTop;
    f.R = f.shape === 'ball' ? 58 : f.shape === 'spike' ? 46 : f.shape === 'cup' ? 52 : 64;
    let plant = '';
    if (stage >= 1) {
      const sway = stage >= 2 ? 8 : 3;
      plant += `<path d="M150 ${soilY} C${150 - sway} ${soilY - (soilY - stemTop) * .4} ${150 + sway} ${soilY - (soilY - stemTop) * .7} 150 ${stemTop}" stroke="#25643a" stroke-width="${stage >= 3 ? 9 : 7}" fill="none" stroke-linecap="round"/>
        <path d="M150 ${soilY} C${150 - sway} ${soilY - (soilY - stemTop) * .4} ${150 + sway} ${soilY - (soilY - stemTop) * .7} 150 ${stemTop}" stroke="url(#${u}stem)" stroke-width="${stage >= 3 ? 6 : 4.5}" fill="none" stroke-linecap="round"/>`;
    }
    if (stage === 1) plant += leaf(u, 150, stemTop + 4, -150, .45) + leaf(u, 150, stemTop + 4, -30, .45);
    if (stage >= 2) {
      plant += leaf(u, 150, soilY - 26, -165, .8) + leaf(u, 150, soilY - 40, -18, .85);
      if (stage >= 3) plant += leaf(u, 150, soilY - 70, -150, .7) + leaf(u, 150, soilY - 86, -32, .62);
    }
    if (stage === 3) plant += bud(u, f);
    if (stage >= 4) plant += head(u, f);
    const seed = stage === 0 ? `<ellipse cx="150" cy="${soilY - 2}" rx="9" ry="6" fill="#8a5a3a" filter="url(#${u}lit)"/><path d="M147 ${soilY - 7} q3 -7 9 -8" stroke="#6fcf7e" stroke-width="2.5" fill="none" stroke-linecap="round"/>` : '';
    const unplanted = stage < 0 ? `<text x="150" y="${soilY - 40}" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="900" font-size="14" fill="#9a84a3">pick today's flower ✨</text>` : '';
    const drops = opts.wet ? Array.from({ length: 9 }, (_, i) => `<path class="drop" style="animation-delay:${i * 90}ms" d="M${118 + i * 8} 40 q4 7 0 11 q-4 -4 0 -11z" fill="#7cc8ff" opacity=".85"/>`).join('') : '';
    const bloomGlow = stage >= 4 ? `<circle cx="150" cy="${f.cy}" r="${f.R * 1.15}" fill="${light(f.color2, .3)}" opacity=".55" filter="url(#${u}glow)"/>` : '';
    return `<svg viewBox="0 0 300 360" xmlns="http://www.w3.org/2000/svg" class="flower-svg">
      ${defs(u, f)}
      <rect width="300" height="360" fill="url(#${u}bg)"/>
      ${bloomGlow}
      <ellipse cx="150" cy="342" rx="78" ry="10" fill="#3a1030" opacity=".22" filter="url(#${u}soft)"/>
      <g class="sway">${plant}</g>
      <path d="M86 ${soilY + 4} L214 ${soilY + 4} L200 332 Q198 342 186 342 L114 342 Q102 342 100 332 Z" fill="url(#${u}pot)"/>
      <path d="M100 300 Q150 312 200 300" stroke="#fff" stroke-opacity=".18" stroke-width="3" fill="none"/>
      <rect x="78" y="${soilY - 8}" width="144" height="24" rx="12" fill="url(#${u}rim)" filter="url(#${u}lit)"/>
      <ellipse cx="150" cy="${soilY - 2}" rx="64" ry="9" fill="url(#${u}soil)"/>
      ${seed}${unplanted}
      <path d="M96 ${soilY - 4} Q104 ${soilY - 8} 120 ${soilY - 7}" stroke="#fff" stroke-opacity=".45" stroke-width="3" fill="none" stroke-linecap="round"/>
      ${drops}
    </svg>`;
  }

  window.Flower = { svg };
})();

"use client";
import { useEffect, useRef } from "react";
import { isMotionPaused } from "@/lib/motion";

const VERT = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
// Domain-warped fbm (ported from v1's ArtField): slow painterly paint flow in the theme palette, pulled gently toward the pointer.
// `k` is how much each theme colour is pulled toward the legacy amber/rose/teal, `g` the overall amount of paint over the base.
const FRAG = `precision mediump float;
uniform vec2 r,m;uniform float t,s,k,g;uniform vec3 bg,c1,c2,c3;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float a=.5,v=0.;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.02+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/r;vec2 p=(gl_FragCoord.xy-.5*r)/r.y;
  vec2 mm=(m-.5)*vec2(r.x/r.y,1.);float T=t*.05;
  p+=(mm-p)*exp(-length(p-mm)*3.)*.14;
  vec2 q=vec2(fbm(p*1.5+T),fbm(p*1.5+vec2(5.2,1.3)-T));
  vec2 w=vec2(fbm(p*2.+q*2.4+vec2(1.7,9.2)+T*1.5),fbm(p*2.+q*2.4+vec2(8.3,2.8)-T*1.2));
  float f=smoothstep(.12,.88,fbm(p*1.8+w*2.2+s*.5));
  vec3 amber=mix(c3,vec3(1.,.62,.28),.6*k),rose=mix(c2,vec3(.88,.34,.44),.6*k),teal=mix(c1,vec3(.1,.58,.58),.5*k);
  vec3 col=mix(bg,teal,smoothstep(.15,.6,f)*.85);
  col=mix(col,rose,smoothstep(.38,.8,w.x)*.8);
  col=mix(col,amber,smoothstep(.4,.9,w.y*f*2.3)*.95);
  col+=amber*exp(-length((uv-vec2(.72,.6))*vec2(1.2,1.6))*3.2)*.38*g;
  col=mix(bg,col,g);
  col*=1.+(smoothstep(.45,.5,fract(f*7.))-.5)*.05;
  col=mix(col,bg,(1.-smoothstep(.0,.55,length((uv-vec2(.22,.3))*vec2(1.1,1.5))))*.3);
  col=mix(col,bg,smoothstep(.55,1.2,length(uv-vec2(.5,.45))*1.5)*.45);
  gl_FragColor=vec4(clamp(col,0.,1.),1.);
}`;

/** "#rgb" / "#rrggbb" / "rgb(r g b)" token value to 0..1 floats. */
const rgb = (v: string): [number, number, number] => {
  const s = v.trim();
  const m = s.match(/rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i);
  if (m) return [+m[1] / 255, +m[2] / 255, +m[3] / 255];
  const h = s.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16) || 0;
  return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

/**
 * Paint-flow background of the direct view: v1's domain-warped fbm shader in the active theme palette (--paint-bg, --paint-1..3).
 * The server renders only the CSS fallback (layered radial gradients from the same tokens), so the page is never blank; once mounted the
 * canvas paints one still frame and fades in. It moves only after the first interaction, at ~30 fps, halves its resolution then freezes if
 * frames block (retrying a little later), pauses off-screen or with the motion toggle, and flows at a third of the speed under prefers-reduced-motion. The theme is
 * re-read when `data-theme` changes.
 */
export function PaintField() {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = root.current, cv = canvas.current;
    if (!el || !cv) return;
    let gl: WebGLRenderingContext | null = null;
    try { gl = cv.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" }) as WebGLRenderingContext | null; } catch { gl = null; }
    if (!gl) return;
    const g = gl;
    const sh = (type: number, src: string) => { const o = g.createShader(type)!; g.shaderSource(o, src); g.compileShader(o); return o; };
    const prog = g.createProgram()!;
    g.attachShader(prog, sh(g.VERTEX_SHADER, VERT));
    g.attachShader(prog, sh(g.FRAGMENT_SHADER, FRAG));
    g.linkProgram(prog);
    if (!g.getProgramParameter(prog, g.LINK_STATUS)) return;
    g.useProgram(prog);
    const buf = g.createBuffer();
    g.bindBuffer(g.ARRAY_BUFFER, buf);
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW);
    const loc = g.getAttribLocation(prog, "a");
    g.enableVertexAttribArray(loc);
    g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
    const u = (k: string) => g.getUniformLocation(prog, k);
    const U = { r: u("r"), m: u("m"), t: u("t"), s: u("s"), k: u("k"), g: u("g"), bg: u("bg"), c1: u("c1"), c2: u("c2"), c3: u("c3") };

    const calm = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pace = calm ? 0.35 : 1;
    let tx = 0.6, ty = 0.5, cx = tx, cy = ty, raf = 0, visible = true;
    const t0 = performance.now();
    let scale = 0.5;

    const palette = () => {
      const cs = getComputedStyle(document.documentElement);
      const num = (k: string, d: number) => { const v = parseFloat(cs.getPropertyValue(k)); return Number.isFinite(v) ? v : d; };
      g.uniform3fv(U.bg, rgb(cs.getPropertyValue("--paint-bg") || cs.getPropertyValue("--bg")));
      g.uniform3fv(U.c1, rgb(cs.getPropertyValue("--paint-1") || cs.getPropertyValue("--river-1")));
      g.uniform3fv(U.c2, rgb(cs.getPropertyValue("--paint-2") || cs.getPropertyValue("--river-2")));
      g.uniform3fv(U.c3, rgb(cs.getPropertyValue("--paint-3") || cs.getPropertyValue("--river-3")));
      g.uniform1f(U.k, num("--paint-pull", 1));
      g.uniform1f(U.g, num("--paint-amt", 1));
    };
    const size = () => {
      const k = Math.min(window.devicePixelRatio || 1, 1.5) * scale; // half-res by default: the field is soft by design
      cv.width = Math.max(2, Math.round(el.clientWidth * k));
      cv.height = Math.max(2, Math.round(el.clientHeight * k));
      g.viewport(0, 0, cv.width, cv.height);
      g.uniform2f(U.r, cv.width, cv.height);
    };
    const draw = () => {
      cx += (tx - cx) * 0.05; cy += (ty - cy) * 0.05;
      g.uniform2f(U.m, cx, cy);
      g.uniform1f(U.t, 8 + ((performance.now() - t0) / 1000) * pace);
      g.uniform1f(U.s, window.scrollY / Math.max(1, window.innerHeight));
      g.drawArrays(g.TRIANGLES, 0, 3);
    };
    // ~30 fps is plenty for a slow paint flow. Frames that block the main thread first halve the resolution, then freeze the field.
    let last = 0, live = false, slow = 0, frozen = false, retry = 0, retries = 0;
    const loop = (now: number) => {
      raf = 0;
      if (now - last >= 32) {
        const gap = now - last; // well over 32 ms = blocking frames; a very long gap is just a hidden tab
        last = now;
        draw();
        slow = gap > 48 && gap < 1000 ? slow + 1 : 0;
        if (slow >= 3) {
          slow = 0;
          if (scale > 0.25) { scale /= 2; size(); } else {
            frozen = true;
            // A busy moment (a heavy page load, a GPU waking up) should not freeze the field for good: try again a few times.
            if (retries < 3) retry = window.setTimeout(() => { retries++; frozen = false; last = 0; el.dataset.shader = `q${scale}`; kick(); }, 6000);
          }
          el.dataset.shader = frozen ? "still" : `q${scale}`;
        }
      }
      if (visible && !frozen && !isMotionPaused()) raf = requestAnimationFrame(loop);
    };
    const kick = () => { if (live && !frozen && !raf && visible && !isMotionPaused()) raf = requestAnimationFrame(loop); };
    // One still frame now; move only on the first sign of a person, so loading and first interaction never compete with decoration.
    const wake = ["pointermove", "pointerdown", "scroll", "keydown", "touchstart"] as const;
    const start = () => { wake.forEach((e) => removeEventListener(e, start)); live = true; kick(); };
    wake.forEach((e) => addEventListener(e, start, { passive: true }));
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      tx = e.clientX / window.innerWidth; ty = 1 - e.clientY / window.innerHeight;
    };
    const onLost = (e: Event) => { e.preventDefault(); cancelAnimationFrame(raf); raf = 0; el.dataset.shader = "css"; };
    const ro = typeof ResizeObserver === "function" ? new ResizeObserver(() => { size(); draw(); }) : null;
    const io = typeof IntersectionObserver === "function" ? new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) kick(); }) : null;
    const mo = new MutationObserver(() => { palette(); draw(); kick(); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-motion"] });
    addEventListener("pointermove", onMove, { passive: true });
    cv.addEventListener("webglcontextlost", onLost);
    palette(); size(); draw(); ro?.observe(el); io?.observe(el);
    el.dataset.shader = "on";
    return () => {
      removeEventListener("pointermove", onMove); wake.forEach((e) => removeEventListener(e, start));
      cv.removeEventListener("webglcontextlost", onLost);
      ro?.disconnect(); io?.disconnect(); mo.disconnect();
      cancelAnimationFrame(raf); window.clearTimeout(retry);
      g.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <div ref={root} className="paintfield" aria-hidden="true" data-shader="css">
      <canvas ref={canvas} className="pf-canvas" />
    </div>
  );
}

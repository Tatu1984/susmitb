"use client";

import { useEffect, useRef, useState } from "react";

/**
 * "Wet paint" hero. A low-res velocity field is advected every frame (ping-pong
 * FBOs); the painting is sampled through it so the cursor drags pigment around.
 * When the visitor stops moving, a ghost brush keeps improvising.
 */

type Slide = { src: string; color: string };

const VS = `#version 300 es
in vec2 p; out vec2 uv;
void main(){ uv = p*.5+.5; gl_Position = vec4(p,0.,1.); }`;

const SIM = `#version 300 es
precision highp float;
in vec2 uv; out vec4 o;
uniform sampler2D prev;
uniform vec2 mouse, vel, px;
uniform float aspect, radius;
uniform bool enc;
vec3 rd(vec2 q){ vec4 c = texture(prev,q); return enc ? vec3(c.rg*2.-1., c.b) : c.rgb; }
void main(){
  vec3 c = rd(uv);
  vec3 a = rd(uv - c.xy*px*7.);               // self-advection
  vec2 v = a.xy*.972; float s = a.z*.968;
  vec2 d = uv - mouse; d.x *= aspect;
  float f = exp(-dot(d,d)/radius);
  v += vel*f; s += f*min(length(vel)*3.,1.);
  v = clamp(v,-1.,1.);
  if (enc) { if (abs(v.x)<.012) v.x=0.; if (abs(v.y)<.012) v.y=0.; o = vec4(v*.5+.5, clamp(s,0.,1.), 1.); }
  else o = vec4(v, clamp(s,0.,1.), 1.);
}`;

const FS = `#version 300 es
precision highp float;
in vec2 uv; out vec4 o;
uniform sampler2D A, B, T;
uniform vec2 resA, resB;
uniform float aspect, mixT, time;
uniform vec3 edgeCol;
uniform bool enc;

float h(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float n2(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float s=0., a=.5; for(int i=0;i<5;i++){ s+=a*n2(p); p*=2.03; a*=.5; } return s; }

vec2 cover(vec2 q, vec2 res, float z){
  float ia = res.x/res.y;
  vec2 s = aspect > ia ? vec2(1., ia/aspect) : vec2(aspect/ia, 1.);
  return (q-.5)*s*z+.5;
}
vec3 samp(sampler2D t, vec2 res, vec2 q, vec2 off, float z){
  return vec3(
    texture(t, cover(q - off*1.3, res, z)).r,
    texture(t, cover(q - off,     res, z)).g,
    texture(t, cover(q - off*.7,  res, z)).b);
}

void main(){
  vec4 tr = texture(T, uv);
  vec2 v = enc ? tr.rg*2.-1. : tr.rg;
  float s = tr.b;
  vec2 wob = (vec2(fbm(uv*3.+time*.04), fbm(uv*3.+9.-time*.04))-.5)*.006;
  vec2 off = v*.075 + wob;

  float z = .93 + .015*sin(time*.15);
  vec3 a = samp(A, resA, uv, off, z);

  // ink-bleed dissolve between plates
  float n = fbm(uv*vec2(aspect,1.)*2.2 + time*.02);
  float e = mixT*1.25 - .12;
  float k = 1. - smoothstep(e-.07, e, n);
  vec3 col = a;
  if (mixT > 0.) {
    vec2 boff = off + (1.-mixT)*(vec2(n)-.5)*.08;
    vec3 b = samp(B, resB, uv, boff, z - (1.-mixT)*.05);
    col = mix(a, b, k);
    float rim = (1. - smoothstep(0., .035, abs(n-e))) * step(.001, mixT) * step(mixT, .999);
    col = mix(col, edgeCol, rim*.85);
  }

  // wet sheen where the brush has just passed
  col += s*s*.08;
  // legibility vignette
  float vg = 1. - smoothstep(.35, 1.25, length((uv-.5)*vec2(aspect*.7,1.)));
  col *= mix(.55, 1., vg);
  col *= 1. - (1. - smoothstep(0., .45, uv.y))*.35;
  col += (h(uv*1000.+time)-.5)*.035;
  o = vec4(col, 1.);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || "shader");
  return s;
}
function program(gl: WebGL2RenderingContext, fs: string) {
  const p = gl.createProgram()!;
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, VS));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs));
  gl.bindAttribLocation(p, 0, "p");
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || "link");
  return p;
}
const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16) / 255);

export default function PaintField({
  slides,
  interval = 7000,
  onIndex,
  onReady,
  advanceRef,
}: {
  slides: Slide[];
  interval?: number;
  onIndex?: (i: number) => void;
  onReady?: () => void;
  advanceRef?: React.RefObject<(() => void) | null>;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = ref.current!;
    const gl = canvas.getContext("webgl2", { antialias: false, premultipliedAlpha: false });
    if (!gl) {
      setFailed(true);
      onReady?.();
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const half = !!gl.getExtension("EXT_color_buffer_float");
    const enc = !half;

    let simP: WebGLProgram, drawP: WebGLProgram;
    try {
      simP = program(gl, SIM);
      drawP = program(gl, FS);
    } catch (e) {
      console.warn(e);
      setFailed(true);
      onReady?.();
      return;
    }
    const U = (p: WebGLProgram) => new Proxy({} as Record<string, WebGLUniformLocation | null>, { get: (_, k: string) => gl.getUniformLocation(p, k) });
    const us = U(simP), ud = U(drawP);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    // --- trail ping-pong
    type Fbo = { tex: WebGLTexture; fb: WebGLFramebuffer };
    let fbos: Fbo[] = [];
    let simW = 0, simH = 0;
    const makeFbo = (w: number, h: number): Fbo => {
      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      if (half) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
      else {
        const init = new Uint8Array(w * h * 4);
        for (let i = 0; i < init.length; i += 4) { init[i] = 128; init[i + 1] = 128; init[i + 3] = 255; }
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, init);
      }
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const fb = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      if (half) { gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      return { tex, fb };
    };

    const resize = () => {
      const dpr = Math.min(devicePixelRatio, 1.5);
      const w = canvas.clientWidth, h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const sw = Math.max(64, Math.round(w / 4)), sh = Math.max(64, Math.round(h / 4));
      if (sw !== simW || sh !== simH) {
        fbos.forEach((f) => { gl.deleteTexture(f.tex); gl.deleteFramebuffer(f.fb); });
        simW = sw; simH = sh;
        fbos = [makeFbo(sw, sh), makeFbo(sw, sh)];
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // --- painting textures
    const texs: { tex: WebGLTexture; w: number; h: number }[] = [];
    let loaded = 0;
    const loadAll = slides.map(
      (s, i) =>
        new Promise<void>((res) => {
          const img = new Image();
          img.decoding = "async";
          img.onload = () => {
            const tex = gl.createTexture()!;
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
            texs[i] = { tex, w: img.naturalWidth, h: img.naturalHeight };
            loaded++;
            res();
          };
          img.onerror = () => res();
          img.src = s.src;
        }),
    );

    // --- pointer + ghost brush
    const m = { x: 0.5, y: 0.5, px: 0.5, py: 0.5, last: -1e9 };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      if (e.clientY < r.top || e.clientY > r.bottom) return;
      m.x = (e.clientX - r.left) / r.width;
      m.y = 1 - (e.clientY - r.top) / r.height;
      m.last = performance.now();
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let cur = 0, next = 1, mixT = 0, lastSwap = performance.now(), swapping = false;
    const advance = () => {
      if (swapping || loaded < 2) return;
      next = (cur + 1) % slides.length;
      if (!texs[next]) return;
      swapping = true;
      mixT = 0;
      onIndex?.(next);
    };
    if (advanceRef) advanceRef.current = advance;

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);

    let raf = 0, ping = 0;
    const t0 = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || !texs[cur]) return;
      const t = (now - t0) / 1000;

      // ghost brush after 2.5s idle
      let mx = m.x, my = m.y, gain = 1;
      if (now - m.last > 2500 && !reduced) {
        mx = 0.5 + 0.34 * Math.sin(t * 0.71) + 0.08 * Math.sin(t * 2.3);
        my = 0.5 + 0.26 * Math.sin(t * 1.13 + 1.3) + 0.06 * Math.cos(t * 3.1);
        gain = 0.55;
      }
      let vx = (mx - m.px) * 14 * gain, vy = (my - m.py) * 14 * gain;
      const len = Math.hypot(vx, vy);
      if (len > 1) { vx /= len; vy /= len; }
      m.px = mx; m.py = my;

      if (!swapping && now - lastSwap > interval && !reduced) advance();
      if (swapping) {
        mixT = Math.min(1, mixT + 1 / 110);
        if (mixT >= 1) { cur = next; mixT = 0; swapping = false; lastSwap = now; }
      }

      const aspect = canvas.clientWidth / canvas.clientHeight;
      // sim
      gl.useProgram(simP);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbos[1 - ping].fb);
      gl.viewport(0, 0, simW, simH);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, fbos[ping].tex);
      gl.uniform1i(us.prev, 0);
      gl.uniform2f(us.mouse, mx, my);
      gl.uniform2f(us.vel, vx, vy);
      gl.uniform2f(us.px, 1 / simW, 1 / simH);
      gl.uniform1f(us.aspect, aspect);
      gl.uniform1f(us.radius, 0.0022);
      gl.uniform1i(us.enc, enc ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      ping = 1 - ping;

      // draw
      gl.useProgram(drawP);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      const a = texs[cur], b = texs[next] || a;
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, a.tex);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, b.tex);
      gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, fbos[ping].tex);
      gl.uniform1i(ud.A, 0); gl.uniform1i(ud.B, 1); gl.uniform1i(ud.T, 2);
      gl.uniform2f(ud.resA, a.w, a.h);
      gl.uniform2f(ud.resB, b.w, b.h);
      gl.uniform1f(ud.aspect, aspect);
      gl.uniform1f(ud.mixT, swapping ? mixT : 0);
      gl.uniform1f(ud.time, t);
      gl.uniform3fv(ud.edgeCol, hex(slides[next].color).map((c) => c * 0.35));
      gl.uniform1i(ud.enc, enc ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    loadAll[0].then(() => {
      onReady?.();
      raf = requestAnimationFrame(frame);
    });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (failed)
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={slides[0].src} alt="" className="absolute inset-0 h-full w-full object-cover" />;
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />;
}

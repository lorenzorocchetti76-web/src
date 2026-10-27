import { useMemo } from "react";
import * as THREE from "three";

// Terreno continuo iperrealistico: rilievo, fiume, dettagli e normali calcolati in GPU (morph tra epoche gratuito).
const HEIGHT_GLSL = `
uniform float uBase; uniform float uAmp; uniform float uRd; uniform float uDetail;
varying float vF; varying float vR; varying float vSlope; varying float vN;
float h2(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float n2(vec2 p){ vec2 i=floor(p); vec2 f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(h2(i),h2(i+vec2(1,0)),f.x),mix(h2(i+vec2(0,1)),h2(i+vec2(1,1)),f.x),f.y); }
float fb(vec2 p){ return n2(p)*0.55+n2(p*2.1)*0.28+n2(p*4.3)*0.17; }
float fieldF(vec2 p){ float v=sin(p.x*0.55)+cos(p.y*0.47)+sin((p.x+p.y)*0.31)*0.8+cos((p.x-p.y)*0.9)*0.35; return clamp((v+2.95)/5.9,0.0,1.0); }
float riverF(vec2 p){ return 1.0-smoothstep(0.45,0.85,abs(p.y-sin(p.x*0.45)*1.8-0.6)); }
float H(vec2 p){
  float f=fieldF(p);
  float h=uBase+uAmp*f+uRd*riverF(p)+(fb(p*1.3)-0.5)*uDetail*(0.4+uAmp*0.35);
  float e=smoothstep(9.4,12.2,max(abs(p.x),abs(p.y)));
  return mix(h,-0.55,e);
}
`;

export function useTerrainMaterial() {
  return useMemo(() => {
    const uniforms = {
      uBase: { value: 0.3 }, uAmp: { value: 1 }, uRd: { value: 0 }, uDetail: { value: 0.35 },
      uLow: { value: new THREE.Color() }, uHigh: { value: new THREE.Color() }, uRiver: { value: new THREE.Color() },
      uRock: { value: new THREE.Color("#4a4440") }, uLava: { value: 0 },
    };
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.92, metalness: 0, envMapIntensity: 0.35 });
    mat.onBeforeCompile = (s) => {
      Object.assign(s.uniforms, uniforms);
      s.vertexShader = s.vertexShader
        .replace("#include <common>", `#include <common>\n${HEIGHT_GLSL}`)
        .replace("#include <beginnormal_vertex>", `
          vec2 pp=position.xz; float e=0.06;
          float hc=H(pp); float hx=H(pp+vec2(e,0.0)); float hz=H(pp+vec2(0.0,e));
          vec3 objectNormal=normalize(vec3(hc-hx,e,hc-hz));
          vF=fieldF(pp); vR=riverF(pp); vSlope=1.0-objectNormal.y; vN=fb(pp*3.0);`)
        .replace("#include <begin_vertex>", "vec3 transformed=vec3(position.x,hc,position.z);");
      s.fragmentShader = s.fragmentShader
        .replace("#include <common>", `#include <common>\nuniform vec3 uLow; uniform vec3 uHigh; uniform vec3 uRiver; uniform vec3 uRock; uniform float uLava;\nvarying float vF; varying float vR; varying float vSlope; varying float vN;`)
        .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
          totalEmissiveRadiance += vec3(1.0,0.32,0.06)*uLava*(1.0-smoothstep(0.12,0.36,vF+(vN-0.5)*0.2))*1.8;`)
        .replace("#include <color_fragment>", `#include <color_fragment>
          vec3 base=mix(uLow,uHigh,smoothstep(0.0,1.0,vF+(vN-0.5)*0.25));
          base*=0.82+vN*0.36;
          base=mix(base,uRock,smoothstep(0.35,0.7,vSlope)*0.7);
          base=mix(base,uRiver,smoothstep(0.3,0.8,vR));
          diffuseColor.rgb=base;`);
    };
    return { mat, uniforms };
  }, []);
}

export function useTerrainGeometry(segments) {
  return useMemo(() => {
    const g = new THREE.PlaneGeometry(26, 26, segments, segments);
    g.rotateX(-Math.PI / 2);
    return g;
  }, [segments]);
}

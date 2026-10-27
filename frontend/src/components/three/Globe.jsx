import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { store } from "@/lib/store";
import { globeWeight, smooth } from "./worldMath";

const NOISE = `
float hash(vec3 p){ p=fract(p*0.3183099+.1); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float noise(vec3 x){ vec3 i=floor(x); vec3 f=fract(x); f=f*f*(3.0-2.0*f);
 return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
 mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z); }
float fbm(vec3 p){ float v=0.,a=.5; for(int i=0;i<OCT;i++){ v+=a*noise(p); p*=2.03; a*=.5;} return v; }
`;

const VERT = `
varying vec3 vPos; varying vec3 vN; varying vec3 vW;
void main(){ vPos=position; vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.0); vW=w.xyz;
 gl_Position=projectionMatrix*viewMatrix*w; }`;

// Shading in spazio oggetto: rilievo procedurale (domain warping + bump), oceani speculari, luci notturne.
const FRAG = `
uniform float uTime; uniform float uStage; uniform float uHeat; uniform float uAlpha; uniform vec3 uSunObj; uniform vec3 uCamObj; uniform vec3 uAtmo;
varying vec3 vPos; varying vec3 vN; varying vec3 vW;
${NOISE}
float terrain(vec3 p){ vec3 q=p*2.1; q+=0.45*vec3(fbm(q+1.7),fbm(q+5.2),fbm(q+9.1)); return fbm(q); }
void main(){
 vec3 n0=normalize(vPos);
 vec3 T1=normalize(cross(n0,vec3(0.0,1.0,0.0))+vec3(1e-4));
 vec3 T2=normalize(cross(n0,T1));
 float h=terrain(n0);
 float hx=terrain(normalize(n0+T1*0.004));
 float hy=terrain(normalize(n0+T2*0.004));
 float n2=fbm(n0*7.0-vec3(uTime*0.03));
 vec3 L=normalize(uSunObj); vec3 V=normalize(uCamObj-vPos*1.0);
 // magma
 float crack=1.0-smoothstep(0.0,0.045,abs(n2-0.5));
 float pool=smoothstep(0.42,0.3,h);
 vec3 crust=mix(vec3(0.05,0.025,0.02),vec3(0.2,0.08,0.04),smoothstep(0.35,0.7,h));
 vec3 magmaE=vec3(1.0,0.45,0.12)*crack*1.7+vec3(1.0,0.32,0.06)*pool*1.4;
 // oceano primordiale
 float landP=smoothstep(0.6,0.62,h);
 vec3 ocean0=mix(mix(vec3(0.015,0.09,0.13),vec3(0.05,0.28,0.32),smoothstep(0.4,0.6,h)),vec3(0.22,0.19,0.17),landP);
 // terra moderna
 float land=smoothstep(0.5,0.512,h);
 float lat=abs(n0.y);
 vec3 deep=vec3(0.006,0.035,0.11); vec3 shallow=vec3(0.03,0.24,0.36);
 vec3 sea=mix(deep,shallow,smoothstep(0.38,0.5,h));
 float dry=smoothstep(0.45,0.7,fbm(n0*3.0+4.0))*(1.0-smoothstep(0.5,0.8,lat));
 vec3 ground=mix(vec3(0.07,0.2,0.07),vec3(0.62,0.5,0.3),dry);
 ground=mix(ground,vec3(0.3,0.26,0.22),smoothstep(0.6,0.68,h));
 ground=mix(ground,vec3(0.95,0.32,0.14),uHeat*smoothstep(0.5,0.75,n2)*dry*0.9);
 float ice=smoothstep(0.78,0.88,lat+h*0.12)+smoothstep(0.7,0.76,h)*0.8;
 vec3 modern=mix(sea,ground,land);
 modern=mix(modern,vec3(0.94,0.97,1.0),clamp(ice,0.0,1.0)*(1.0-uHeat*0.35));
 float s1=clamp(uStage,0.0,1.0); float s2=clamp(uStage-1.0,0.0,1.0);
 vec3 albedo=mix(mix(crust,ocean0,s1),modern,s2);
 float water=mix(1.0-landP,1.0-land,s2)*s1;
 float bumpK=mix(3.0,mix(1.5,6.0*land,s2),s1);
 vec3 N=normalize(n0-(T1*(hx-h)+T2*(hy-h))*bumpK*40.0*0.03);
 float ndl=dot(N,L);
 float day=smoothstep(-0.12,0.25,dot(n0,L));
 vec3 col=albedo*(0.04+1.15*max(ndl,0.0))*mix(0.35,1.0,day);
 vec3 Hh=normalize(L+V);
 col+=vec3(1.0,0.95,0.85)*pow(max(dot(n0,Hh),0.0),70.0)*water*0.9*day;
 col+=magmaE*(1.0-s1);
 float city=step(0.8,noise(n0*90.0))*land*(1.0-ice)*(1.0-day)*s2;
 col+=vec3(1.0,0.66,0.3)*city*1.4;
 float fres=pow(1.0-max(dot(n0,V),0.0),3.0);
 col+=uAtmo*fres*(0.15+0.55*day);
 gl_FragColor=vec4(col,uAlpha);
}`;

const CLOUD_FRAG = `
uniform float uTime; uniform float uAmt; uniform vec3 uSun; varying vec3 vPos; varying vec3 vN; varying vec3 vW;
${NOISE}
void main(){ vec3 p=normalize(vPos);
 float c=fbm(p*3.2+vec3(uTime*0.012,0.0,uTime*0.006)+0.5*fbm(p*6.0));
 float a=smoothstep(0.52,0.78,c)*uAmt;
 float l=max(dot(normalize(vN),normalize(uSun)),0.0);
 gl_FragColor=vec4(vec3(0.95)*(0.08+0.95*l),a*0.9); }`;

const ATMO_FRAG_ = `
uniform vec3 uAtmo; uniform float uAlpha; varying vec3 vN; varying vec3 vW;
void main(){ float f=pow(0.75-dot(normalize(vN),normalize(cameraPosition-vW))*0.75,3.0);
 gl_FragColor=vec4(uAtmo,f*uAlpha*0.6); }`;

const MAGMA_ATMO = new THREE.Color("#ff6a2a");
const OCEAN_ATMO = new THREE.Color("#66d9ef");

const SUN = new THREE.Vector3(1, 0.5, 0.75).normalize().multiplyScalar(100);

export default function Globe({ segments = 96, low = false }) {
  const group = useRef();
  const mesh = useRef();
  const clouds = useRef();
  const defines = useMemo(() => ({ OCT: low ? 4 : 6 }), [low]);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 }, uStage: { value: 0 }, uHeat: { value: 0 }, uAlpha: { value: 1 },
    uSunObj: { value: new THREE.Vector3() }, uCamObj: { value: new THREE.Vector3() }, uAtmo: { value: MAGMA_ATMO.clone() },
  }), []);
  const atmoUniforms = useMemo(() => ({ uAtmo: uniforms.uAtmo, uAlpha: uniforms.uAlpha }), [uniforms]);
  const cloudUniforms = useMemo(() => ({ uTime: uniforms.uTime, uAmt: { value: 0 }, uSun: { value: SUN.clone() } }), [uniforms]);

  useFrame((state, dt) => {
    const p = store.progress;
    const gw = Math.min(1, globeWeight(p));
    const visible = gw > 0.01;
    group.current.visible = visible;
    if (!visible) return;
    const dive = p < 3.5 ? smooth(0, 0.9, p) : smooth(7, 6.1, p);
    group.current.scale.setScalar(1 + dive * 6);
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uAlpha.value = gw;
    const stage = p < 3.5 ? smooth(0.05, 0.8, p) : 2;
    uniforms.uStage.value = stage;
    uniforms.uHeat.value = p > 3.5 ? smooth(6.3, 7, p) : 0;
    uniforms.uAtmo.value.copy(MAGMA_ATMO).lerp(OCEAN_ATMO, Math.min(1, stage));
    mesh.current.rotation.y += dt * 0.05;
    clouds.current.rotation.y += dt * 0.065;
    cloudUniforms.uAmt.value = Math.min(1, stage) * gw * 0.9;
    mesh.current.updateMatrixWorld();
    uniforms.uSunObj.value.copy(SUN);
    mesh.current.worldToLocal(uniforms.uSunObj.value);
    uniforms.uSunObj.value.sub(mesh.current.worldToLocal(new THREE.Vector3()));
    uniforms.uCamObj.value.copy(state.camera.position);
    mesh.current.worldToLocal(uniforms.uCamObj.value);
    const transparent = gw < 0.999;
    if (mesh.current.material.transparent !== transparent) {
      mesh.current.material.transparent = transparent;
      mesh.current.material.needsUpdate = true;
    }
  });

  return (
    <group ref={group}>
      <mesh ref={mesh}>
        <sphereGeometry args={[3.2, segments, segments]} />
        <shaderMaterial vertexShader={VERT} fragmentShader={FRAG} uniforms={uniforms} defines={defines} />
      </mesh>
      <mesh ref={clouds} scale={1.018}>
        <sphereGeometry args={[3.2, 64, 64]} />
        <shaderMaterial vertexShader={VERT} fragmentShader={CLOUD_FRAG} uniforms={cloudUniforms} defines={defines} transparent depthWrite={false} />
      </mesh>
      <mesh scale={1.06}>
        <sphereGeometry args={[3.2, 48, 48]} />
        <shaderMaterial vertexShader={VERT} fragmentShader={ATMO_FRAG_} uniforms={atmoUniforms}
          side={THREE.BackSide} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

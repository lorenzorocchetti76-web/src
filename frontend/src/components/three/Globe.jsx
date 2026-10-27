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
float fbm(vec3 p){ float v=0.,a=.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.03; a*=.5;} return v; }
`;

const VERT = `
varying vec3 vPos; varying vec3 vN; varying vec3 vW;
void main(){ vPos=position; vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.0); vW=w.xyz;
 gl_Position=projectionMatrix*viewMatrix*w; }`;

const FRAG = `
uniform float uTime; uniform float uStage; uniform float uHeat; uniform float uAlpha; uniform vec3 uSun; uniform vec3 uAtmo;
varying vec3 vPos; varying vec3 vN; varying vec3 vW;
${NOISE}
void main(){
 vec3 p=normalize(vPos);
 float n=fbm(p*2.4+vec3(0.,uTime*0.015,0.));
 float n2=fbm(p*6.0-vec3(uTime*0.04));
 float crack=1.0-smoothstep(0.0,0.05,abs(n2-0.5));
 vec3 magma=mix(vec3(0.07,0.03,0.02),vec3(0.22,0.06,0.02),n)+vec3(1.0,0.42,0.12)*crack*1.5+vec3(1.0,0.28,0.05)*smoothstep(0.6,0.75,n)*1.3;
 float landP=smoothstep(0.58,0.6,n);
 vec3 ocean0=mix(mix(vec3(0.02,0.12,0.18),vec3(0.06,0.3,0.36),n),vec3(0.28,0.24,0.2),landP);
 float land=smoothstep(0.5,0.52,n);
 float ice=smoothstep(0.8,0.9,abs(p.y)+n*0.1);
 vec3 sea=mix(vec3(0.02,0.08,0.2),vec3(0.05,0.28,0.42),n);
 vec3 ground=mix(vec3(0.16,0.33,0.14),vec3(0.58,0.46,0.26),smoothstep(0.55,0.72,n));
 ground=mix(ground,vec3(0.95,0.3,0.14),uHeat*smoothstep(0.5,0.72,n2)*0.8);
 vec3 modern=mix(sea,ground,land);
 modern=mix(modern,vec3(0.93,0.96,1.0),ice*(1.0-uHeat*0.4));
 vec3 col=uStage<1.0?mix(magma,ocean0,uStage):mix(ocean0,modern,uStage-1.0);
 vec3 N=normalize(vN);
 float light=max(dot(N,normalize(uSun)),0.0);
 float glow=uStage<1.0?(1.0-uStage):0.0;
 vec3 lit=col*(0.12+1.05*light);
 lit=mix(lit,col*1.25,glow*0.75);
 float fres=pow(1.0-max(dot(N,normalize(cameraPosition-vW)),0.0),2.5);
 lit+=uAtmo*fres*0.9;
 gl_FragColor=vec4(lit,uAlpha);
}`;

const ATMO_FRAG = `
uniform vec3 uAtmo; uniform float uAlpha; varying vec3 vN; varying vec3 vW;
void main(){ float f=pow(0.75-dot(normalize(vN),normalize(cameraPosition-vW))*0.75,3.0);
 gl_FragColor=vec4(uAtmo,f*uAlpha*0.9); }`;

const MAGMA_ATMO = new THREE.Color("#ff6a2a");
const OCEAN_ATMO = new THREE.Color("#66d9ef");

export default function Globe({ segments = 96 }) {
  const group = useRef();
  const mesh = useRef();
  const uniforms = useMemo(() => ({
    uTime: { value: 0 }, uStage: { value: 0 }, uHeat: { value: 0 }, uAlpha: { value: 1 },
    uSun: { value: new THREE.Vector3(1, 0.6, 0.8) }, uAtmo: { value: MAGMA_ATMO.clone() },
  }), []);
  const atmoUniforms = useMemo(() => ({ uAtmo: uniforms.uAtmo, uAlpha: uniforms.uAlpha }), [uniforms]);

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
    mesh.current.rotation.y += dt * 0.06;
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
        <shaderMaterial vertexShader={VERT} fragmentShader={FRAG} uniforms={uniforms} />
      </mesh>
      <mesh scale={1.09}>
        <sphereGeometry args={[3.2, 48, 48]} />
        <shaderMaterial vertexShader={VERT} fragmentShader={ATMO_FRAG} uniforms={atmoUniforms}
          side={THREE.BackSide} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

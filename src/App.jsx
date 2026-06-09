import React, { useState, useEffect, useRef, useCallback } from 'react';

// ============================================
// SHADER LIBRARY
// ============================================
const SHADERS = [
  // ---- ORIGINAL 40 ----
  { name: 'PLASMA WAVE', category: 'organic', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=(uv*2.0-1.0)*u_scale;p.x*=u_resolution.x/u_resolution.y;float t=u_time*u_speed;float v=sin(p.x*10.0+t)+sin((p.y*10.0+t)*0.5)+sin((p.x*10.0+p.y*10.0+t)*0.5)+sin(sqrt(p.x*p.x+p.y*p.y)*10.0+t);vec3 col=vec3(sin(v*3.14159+t)*0.5+0.5,sin(v*3.14159+t+2.094)*0.5+0.5,sin(v*3.14159+t+4.188)*0.5+0.5)*u_intensity;gl_FragColor=vec4(col,1.0);}` },
  { name: 'FRACTAL TUNNEL', category: 'geometric', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=(uv-0.5)*u_scale;p.x*=u_resolution.x/u_resolution.y;float a=atan(p.y,p.x);float r=length(p);float t=u_time*u_speed;float z=fract(1.0/r-t);float spiral=fract(a/6.28318+t*0.1+z*2.0);vec3 col=(0.5+0.5*cos(6.28318*(z+vec3(0.0,0.33,0.67))))*smoothstep(0.0,0.02,abs(spiral-0.5)-0.2)*z*2.0*u_intensity;col+=0.1*vec3(0.3,0.1,0.5)/r;gl_FragColor=vec4(col,1.0);}` },
  { name: 'NEON GRID', category: 'retro', fragment: `#extension GL_OES_standard_derivatives : enable
precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=uv-0.5;p.x*=u_resolution.x/u_resolution.y;float t=u_time*u_speed;float z=1.0/(1.0-uv.y+0.1);vec2 gp=vec2(p.x*z,z-t*5.0)*u_scale;vec2 g=abs(fract(gp*0.5-0.5)-0.5)/fwidth(gp*0.5);float line=1.0-min(min(g.x,g.y),1.0);vec3 col=vec3(1.0,0.0,0.5)*line*0.5*u_intensity+vec3(0.0,1.0,1.0)*line*smoothstep(0.8,0.2,uv.y)*u_intensity+vec3(0.1,0.0,0.2)*(1.0-uv.y);float sun=smoothstep(0.3,0.28,length(p-vec2(0.0,0.2)));col+=vec3(1.0,0.3,0.1)*sun+vec3(1.0,0.8,0.0)*smoothstep(0.28,0.1,length(p-vec2(0.0,0.2)));gl_FragColor=vec4(col,1.0);}` },
  { name: 'LIQUID METAL', category: 'organic', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float noise(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}float sn(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(noise(i),noise(i+vec2(1.0,0.0)),f.x),mix(noise(i+vec2(0.0,1.0)),noise(i+vec2(1.0,1.0)),f.x),f.y);}float fbm(vec2 p){float v=0.0;float a=0.5;for(int i=0;i<6;i++){v+=a*sn(p);p*=2.0;a*=0.5;}return v;}void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=uv*3.0*u_scale;float t=u_time*u_speed;float n=fbm(p+fbm(p+fbm(p+t)));vec3 col=mix(vec3(0.1,0.1,0.3),vec3(0.8,0.8,1.0),n);col=mix(col,vec3(1.0,0.9,0.7),pow(n,3.0));col+=0.3*vec3(0.5,0.7,1.0)*pow(n,5.0);gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'COSMIC DUST', category: 'space', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float stars(vec2 uv,float t){vec2 gv=fract(uv)-0.5;vec2 id=floor(uv);float star=0.0;for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 o=vec2(float(x),float(y));float h=hash(id+o);vec2 p=o+vec2(h,fract(h*34.56))-0.5-gv;star+=smoothstep(0.1*(1.0+0.5*sin(t*(h*5.0+3.0))),0.0,length(p))*h;}return star;}void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=uv-0.5;p.x*=u_resolution.x/u_resolution.y;float t=u_time*u_speed;vec3 col=vec3(0.02,0.01,0.05);col+=vec3(1.0,0.9,0.8)*stars(p*20.0*u_scale+t*0.02,t)*0.5;col+=vec3(0.8,0.9,1.0)*stars(p*40.0*u_scale-t*0.03,t*1.3)*0.3;col+=vec3(0.3,0.1,0.4)*(sin(p.x*3.0+t*0.1)*sin(p.y*2.0-t*0.15)*0.5+0.5)*0.3;gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'KALEIDOSCOPE', category: 'psychedelic', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;vec2 kaleid(vec2 uv,float n){float angle=3.14159/n;float a=atan(uv.y,uv.x);a=mod(a,angle*2.0);a=abs(a-angle);return length(uv)*vec2(cos(a),sin(a));}void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=uv-0.5;p.x*=u_resolution.x/u_resolution.y;float t=u_time*u_speed;p=kaleid(p*u_scale,6.0);p=kaleid(p+0.1*sin(t),4.0);vec3 col=vec3(0.0);for(float i=0.0;i<5.0;i++){float fi=i+1.0;vec2 q=p*fi+t*0.5;col.r+=0.2/abs(sin(q.x*10.0+sin(q.y*5.0+t)));col.g+=0.2/abs(sin(q.x*10.0+sin(q.y*5.0+t+1.0)));col.b+=0.2/abs(sin(q.x*10.0+sin(q.y*5.0+t+2.0)));}gl_FragColor=vec4(clamp(pow(col,vec3(1.5))*u_intensity,0.0,1.0),1.0);}` },
  { name: 'ELECTRIC STORM', category: 'nature', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float rand(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}float bolt(vec2 uv,float t,float seed){float b=0.0;vec2 p=uv;for(float i=0.0;i<10.0;i++){p.x+=(rand(vec2(i,seed+floor(t*3.0)))-0.5)*0.15;b+=0.01/(abs(p.x)+0.01)*smoothstep(1.0,0.0,abs(p.y-i*0.1));}return b*smoothstep(1.0,0.5,abs(uv.y));}void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=(uv-0.5)*u_scale;p.x*=u_resolution.x/u_resolution.y;float t=u_time*u_speed;vec3 col=vec3(0.02,0.02,0.08)+vec3(0.1,0.05,0.15)*(sin(p.x*5.0+t*0.2)*sin(p.y*3.0-t*0.1)*0.5+0.5);col+=vec3(0.5,0.5,1.0)*bolt(p+vec2(0.3,0.0),t,1.0)*u_intensity;col+=vec3(0.8,0.6,1.0)*bolt(p-vec2(0.2,0.0),t*1.1,2.0)*u_intensity;col+=vec3(1.0)*bolt(p,t*0.9,3.0)*u_intensity;col+=vec3(0.2,0.2,0.3)*pow(rand(vec2(floor(t*4.0),0.0)),10.0);gl_FragColor=vec4(col,1.0);}` },
  { name: 'MORPHING BLOBS', category: 'organic', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float meta(vec2 p,vec2 c,float r){return r/dot(p-c,p-c);}void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=(uv-0.5)*2.0*u_scale;p.x*=u_resolution.x/u_resolution.y;float t=u_time*u_speed;float m=meta(p,vec2(sin(t)*0.5,cos(t*1.3)*0.5),0.15)+meta(p,vec2(sin(t*0.7+1.0)*0.6,cos(t*0.9)*0.4),0.12)+meta(p,vec2(sin(t*1.2+2.0)*0.4,cos(t*0.8+1.0)*0.6),0.1)+meta(p,vec2(cos(t*0.9)*0.5,sin(t*1.1+3.0)*0.5),0.13)+meta(p,vec2(0.0),0.08+0.03*sin(t*2.0));float edge=smoothstep(0.95,1.05,m);float inner=smoothstep(1.0,3.0,m);vec3 col=mix(vec3(0.05,0.0,0.1),vec3(0.8,0.2,0.5),edge);col=mix(col,vec3(1.0,0.6,0.8),inner);col+=vec3(1.0,0.9,0.95)*smoothstep(3.0,5.0,m)+vec3(0.3,0.1,0.4)*smoothstep(0.5,1.0,m)*(1.0-edge);gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'VORONOI CELLS', category: 'geometric', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;vec2 hash2(vec2 p){return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);}void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=uv*5.0*u_scale;float t=u_time*u_speed;vec2 n=floor(p);vec2 f=fract(p);float md=8.0;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 g=vec2(float(i),float(j));vec2 o=hash2(n+g);o=0.5+0.5*sin(t+6.2831*o);float d=dot(g+o-f,g+o-f);if(d<md)md=d;}vec3 col=(0.5+0.5*cos(6.2831*md+vec3(0.0,1.0,2.0)+t))*(1.0-0.5*smoothstep(0.0,0.05,md))+vec3(1.0)*smoothstep(0.02,0.0,md-0.01);gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'WAVEFORM', category: 'audio', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=uv-0.5;p.x*=u_resolution.x/u_resolution.y;float t=u_time*u_speed;vec3 col=vec3(0.02,0.02,0.05);for(float i=0.0;i<20.0;i++){float fi=i/20.0;float freq=(2.0+i*0.5)*u_scale;float amp=0.15*(1.0-fi*0.5);float phase=t*(0.5+fi*0.3)+i*0.5;float wave=sin(p.x*freq*6.28318+phase)*amp+sin(p.x*freq*2.0*6.28318+phase*1.5)*amp*0.5;float y=p.y-wave+(fi-0.5)*0.8;float line=smoothstep(0.02,0.0,abs(y));vec3 lc=0.5+0.5*cos(6.28318*fi+vec3(0.0,2.0,4.0)+t*0.5);col+=lc*line*0.5*u_intensity+lc*0.01/(abs(y)+0.01)*0.1*u_intensity;}gl_FragColor=vec4(col,1.0);}` },
  { name: 'DIGITAL RAIN', category: 'cyber', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float hash(float n){return fract(sin(n)*43758.5453);}void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;float t=u_time*u_speed;vec3 col=vec3(0.0,0.02,0.01);for(float layer=0.0;layer<3.0;layer++){float density=30.0+layer*20.0;density*=u_scale;float speed=0.5+layer*0.2;vec2 p=uv*vec2(density,1.0);vec2 id=floor(p);vec2 f=fract(p);float h=hash(id.x);float drop=fract(h+t*speed*(0.5+h*0.5));drop=smoothstep(0.0,0.1,drop)*smoothstep(1.0,0.9,drop);float y=fract(f.y-t*speed*(0.5+h*0.5));float trail=smoothstep(0.0,0.3,y)*smoothstep(1.0,0.5,y);float r=drop*trail*smoothstep(0.4,0.5,abs(f.x-0.5));col+=vec3(0.0,1.0,0.3)*r*(0.8-layer*0.2)*u_intensity;}col*=0.9+0.1*sin(uv.y*u_resolution.y*2.0);gl_FragColor=vec4(col,1.0);}` },
  { name: 'PRISM REFRACT', category: 'light', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=(uv-0.5)*u_scale;p.x*=u_resolution.x/u_resolution.y;float t=u_time*u_speed;float a=atan(p.y,p.x);float r=length(p);vec3 col=vec3(0.0);for(float i=0.0;i<7.0;i++){float hue=i/7.0;float offset=hue*0.1;float ra=r+offset-0.3;float aa=a+sin(t+i)*0.5;vec2 pp=vec2(cos(aa),sin(aa))*ra;float prism=smoothstep(0.3,0.28,abs(ra))*smoothstep(0.0,0.1,ra+0.3);float beam=0.01/(abs(pp.y)+0.01)*smoothstep(0.0,0.2,pp.x)*(prism*0.5+smoothstep(-0.1,0.3,ra));col+=(0.5+0.5*cos(6.28318*(hue+vec3(0.0,0.33,0.67))))*beam*0.3*u_intensity;}col+=vec3(1.0)*smoothstep(0.35,0.0,r)*0.3;gl_FragColor=vec4(col,1.0);}` },
  { name: 'FIRE DANCE', category: 'nature', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float noise(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}float sn(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(noise(i),noise(i+vec2(1.0,0.0)),f.x),mix(noise(i+vec2(0.0,1.0)),noise(i+vec2(1.0,1.0)),f.x),f.y);}float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*sn(p);p*=2.0;a*=0.5;}return v;}void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=uv*u_scale;p.x*=u_resolution.x/u_resolution.y;float t=u_time*u_speed;vec2 q=vec2(fbm(p+t*0.3),fbm(p+1.0));float f=fbm(p+vec2(fbm(p+q+t*0.5),fbm(p+q+2.0))*2.0+t*0.4);f=f*(1.0-uv.y);f=pow(f,1.5)*2.0;vec3 col=mix(vec3(0.1,0.0,0.0),vec3(0.8,0.2,0.0),f);col=mix(col,vec3(1.0,0.6,0.0),f*f);col=mix(col,vec3(1.0,1.0,0.6),pow(f,4.0));col*=smoothstep(0.0,0.3,uv.y)*u_intensity;gl_FragColor=vec4(col,1.0);}` },
  { name: 'HYPNOTIC SPIRAL', category: 'psychedelic', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=(uv-0.5)*u_scale;p.x*=u_resolution.x/u_resolution.y;float t=u_time*u_speed;float a=atan(p.y,p.x);float r=length(p);float spiral=smoothstep(-0.5,0.5,sin(a*5.0+r*20.0-t*3.0));float pulse=sin(r*10.0-t*2.0)*0.5+0.5;vec3 col=mix(vec3(0.1,0.0,0.2),vec3(0.9,0.3,0.8),spiral);col=mix(col,vec3(0.2,0.8,1.0),pulse*spiral*0.5);col+=vec3(1.0,0.8,0.9)*smoothstep(0.3,0.0,r);col*=(1.0-r*0.5)*u_intensity;gl_FragColor=vec4(col,1.0);}` },
  { name: 'AURORA BOREALIS', category: 'nature', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float noise(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}float sn(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(noise(i),noise(i+vec2(1.0,0.0)),f.x),mix(noise(i+vec2(0.0,1.0)),noise(i+vec2(1.0,1.0)),f.x),f.y);}void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;float t=u_time*u_speed;vec3 col=vec3(0.0,0.02,0.05);for(float i=0.0;i<5.0;i++){float fi=i/5.0;float y=uv.y+fi*0.2-0.3;float wave=sin(uv.x*3.0*u_scale+t+i)*0.1+sin(uv.x*5.0*u_scale-t*0.7+i*2.0)*0.05+sn(vec2(uv.x*2.0*u_scale+t*0.3,i))*0.1;float aurora=smoothstep(0.0,0.3,y+wave)*smoothstep(0.8,0.3,y+wave)*smoothstep(0.0,0.5,uv.x)*smoothstep(1.0,0.5,uv.x);col+=(0.5+0.5*cos(6.28318*(fi*0.5+vec3(0.3,0.6,0.9)+t*0.1)))*aurora*0.4*u_intensity;}col+=vec3(1.0)*smoothstep(0.97,1.0,noise(uv*200.0))*(1.0-uv.y);gl_FragColor=vec4(col,1.0);}` },
  { name: 'GLITCH WAVE', category: 'cyber', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float rand(float n){return fract(sin(n)*43758.5453);}float rand2(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;float t=u_time*u_speed;float gt=floor(t*10.0);float glitch=step(0.9,rand(gt));float gy=floor(uv.y*20.0)/20.0;float offset=(rand(gy+gt)-0.5)*0.1*glitch;vec2 uv2=uv;uv2.x+=offset;vec2 p=uv2*10.0*u_scale;float pattern=sin(p.x+t*2.0)*sin(p.y+t*1.5);vec3 col;col.r=sin((uv2.x+0.01*glitch)*50.0*u_scale+t*3.0)*0.5+0.5;col.g=sin(uv2.x*50.0*u_scale+t*3.0)*0.5+0.5;col.b=sin((uv2.x-0.01*glitch)*50.0*u_scale+t*3.0)*0.5+0.5;col*=pattern*0.5+0.5;col*=0.8+0.2*sin(uv.y*u_resolution.y*2.0);col=mix(col,1.0-col,step(0.95,rand2(floor(uv*10.0)+gt))*glitch);gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'OCEAN DEPTH', category: 'nature', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=uv-0.5;p.x*=u_resolution.x/u_resolution.y;float t=u_time*u_speed;vec3 col=mix(vec3(0.0,0.1,0.2),vec3(0.0,0.05,0.1),uv.y);for(float i=0.0;i<3.0;i++){vec2 q=p*(2.0+i)*u_scale+t*0.5;float c=abs(sin(q.x*3.0+sin(q.y*2.0+t))+sin(q.y*3.0+sin(q.x*2.0-t*0.7)));col+=vec3(0.1,0.3,0.4)*pow(0.1/c,1.5)*(1.0-i*0.2)*u_intensity;}float rays=0.0;for(float i=0.0;i<5.0;i++){float x=sin(i*1.5+t*0.2)*0.5;rays+=smoothstep(0.1,0.0,abs(p.x-x))*smoothstep(0.0,0.5,uv.y)*0.1;}col+=vec3(0.2,0.4,0.5)*rays*u_intensity;gl_FragColor=vec4(col,1.0);}` },
  { name: 'GEOMETRIC PULSE', category: 'geometric', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float sdBox(vec2 p,vec2 b){vec2 d=abs(p)-b;return length(max(d,0.0))+min(max(d.x,d.y),0.0);}mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=(uv-0.5)*u_scale;p.x*=u_resolution.x/u_resolution.y;float t=u_time*u_speed;vec3 col=vec3(0.02,0.02,0.05);for(float i=0.0;i<8.0;i++){float fi=i/8.0;float sc=0.3-fi*0.03;float rs=(mod(i,2.0)==0.0?1.0:-1.0)*0.5;vec2 pp=p*rot(t*rs+fi*3.14159);float d=sdBox(pp,vec2(sc));float pulse=sin(t*3.0+fi*6.28318)*0.02;float line=smoothstep(0.01,0.0,abs(d+pulse)-0.005);vec3 sc2=0.5+0.5*cos(6.28318*(fi+vec3(0.0,0.33,0.67)+t*0.2));col+=sc2*line*u_intensity+sc2*0.02/(abs(d)+0.02)*0.1*u_intensity;}gl_FragColor=vec4(col,1.0);}` },
  { name: 'NEON HIGHWAY', category: 'retro', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=uv-0.5;p.x*=u_resolution.x/u_resolution.y;float t=u_time*u_speed;vec3 col=mix(vec3(0.02,0.0,0.08),vec3(0.3,0.0,0.2),uv.y*uv.y);col+=vec3(1.0)*step(0.99,fract(sin(dot(floor(uv*200.0),vec2(12.9898,78.233)))*43758.5453))*(1.0-uv.y*0.5);float horizon=0.4;if(uv.y<horizon){float z=horizon/(horizon-uv.y);float x=p.x*z*u_scale;col=mix(col,vec3(0.05),smoothstep(2.5,2.4,abs(x)));col+=vec3(1.0,1.0,0.0)*smoothstep(0.05,0.0,abs(x))*step(0.5,fract(z*0.5-t*2.0))*0.8*u_intensity;col+=vec3(1.0,0.0,0.5)*smoothstep(0.1,0.0,abs(abs(x)-2.3))*u_intensity;col+=vec3(0.0,1.0,1.0)*smoothstep(0.1,0.0,abs(abs(x)-2.5))*u_intensity;}float sun=smoothstep(0.15,0.1,length(p-vec2(0.0,0.15)));col+=vec3(1.0,0.3,0.5)*sun;col=mix(col,vec3(0.02,0.0,0.08),step(0.5,fract(p.y*30.0))*sun*0.8);gl_FragColor=vec4(col,1.0);}` },
  { name: 'PARTICLE FLOW', category: 'organic', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=uv-0.5;p.x*=u_resolution.x/u_resolution.y;float t=u_time*u_speed;vec3 col=vec3(0.01,0.01,0.03);for(float i=0.0;i<80.0;i++){float fi=i/80.0;vec2 sp=vec2(hash(vec2(i,0.0))-0.5,hash(vec2(i,1.0))-0.5)*1.5*u_scale;float flow=t*0.3+fi*10.0;vec2 pos=sp;pos.x+=sin(flow+pos.y*3.0)*0.3;pos.y+=cos(flow+pos.x*2.0)*0.2;pos=mod(pos+0.75,1.5)-0.75;float dist=length(p-pos);float size=0.005+0.003*sin(t*2.0+fi*20.0);float particle=smoothstep(size,0.0,dist);float trail=0.003/(dist+0.01)*smoothstep(0.2,0.0,dist);vec3 pc=0.5+0.5*cos(6.28318*(fi+vec3(0.0,0.33,0.67)+t*0.1));col+=pc*particle*u_intensity+pc*trail*0.1*u_intensity;}gl_FragColor=vec4(col,1.0);}` },
  { name: 'SINE WAVES', category: 'audio', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=(uv-0.5)*u_scale;p.x*=u_resolution.x/u_resolution.y;float t=u_time*u_speed;float v=0.0;for(float i=0.0;i<8.0;i++){float angle=i*0.785398;vec2 dir=vec2(cos(angle),sin(angle));v+=sin(dot(p,dir)*20.0+t*(1.0+i*0.2));}v=v/8.0;vec3 col=0.5+0.5*cos(v*3.0+t+vec3(0.0,2.0,4.0));col*=0.8+0.2*v;gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'FRACTAL NOISE', category: 'organic', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float noise(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}float sn(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(noise(i),noise(i+vec2(1.0,0.0)),f.x),mix(noise(i+vec2(0.0,1.0)),noise(i+vec2(1.0,1.0)),f.x),f.y);}void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=uv*4.0*u_scale;float t=u_time*u_speed;float n=0.0,a=0.5,f=1.0;for(int i=0;i<8;i++){n+=a*sn(p*f+t);f*=2.0;a*=0.5;}vec3 col=0.5+0.5*cos(n*6.28318+t+vec3(0.0,2.0,4.0));gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'HEX GRID', category: 'geometric', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;vec2 hexCenter(vec2 p){vec2 a=mod(p,2.0)-1.0;vec2 b=mod(p+1.0,2.0)-1.0;return dot(a,a)<dot(b,b)?a:b;}void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=(uv-0.5)*10.0*u_scale;p.x*=u_resolution.x/u_resolution.y;float t=u_time*u_speed;vec2 h=hexCenter(p);float d=length(h);float pulse=sin(d*3.0-t*2.0)*0.5+0.5;vec3 col=0.5+0.5*cos(d*2.0+t+vec3(0.0,2.0,4.0));col*=smoothstep(0.5,0.4,d);col+=vec3(1.0)*smoothstep(0.02,0.0,abs(d-0.4))*pulse*u_intensity;col*=0.5+0.5*pulse;gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'RIPPLE POND', category: 'nature', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=(uv-0.5)*u_scale;p.x*=u_resolution.x/u_resolution.y;float t=u_time*u_speed;float ripple=0.0;for(float i=0.0;i<5.0;i++){vec2 center=vec2(sin(t*0.5+i*1.3),cos(t*0.4+i*1.7))*0.3;float d=length(p-center);ripple+=sin(d*30.0-t*3.0)*0.1/(d+0.3);}vec3 col=vec3(0.0,0.2,0.4)+vec3(0.2,0.5,0.7)*(ripple+0.5)+vec3(1.0)*pow(max(ripple,0.0),3.0)*u_intensity;gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'CIRCUIT BOARD', category: 'cyber', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=uv*20.0*u_scale;float t=u_time*u_speed;vec2 id=floor(p);vec2 f=fract(p);float h=hash(id);vec3 col=vec3(0.0,0.05,0.02);float trace=h>0.5?smoothstep(0.1,0.0,abs(f.x-0.5)):smoothstep(0.1,0.0,abs(f.y-0.5));float node=smoothstep(0.15,0.1,length(f-0.5));float pulse=sin(t*3.0+h*10.0)*0.5+0.5;col+=vec3(0.0,0.8,0.3)*trace*0.5*u_intensity+vec3(0.0,1.0,0.5)*node*pulse*u_intensity+vec3(0.0,0.3,0.1)*(1.0-length(uv-0.5))*0.3;gl_FragColor=vec4(col,1.0);}` },
  { name: 'LAVA LAMP', category: 'organic', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float meta(vec2 p,vec2 c,float r){return r*r/dot(p-c,p-c);}void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=(uv-0.5)*2.0*u_scale;p.x*=u_resolution.x/u_resolution.y;float t=u_time*u_speed*0.3;float m=0.0;for(float i=0.0;i<8.0;i++){float phase=i*0.8+t;vec2 c=vec2(sin(phase*0.7)*0.4,sin(phase)*0.6-0.2+i*0.15);m+=meta(p,c,0.15+0.05*sin(t+i));}vec3 col=vec3(0.1,0.0,0.05);float blob=smoothstep(0.8,1.2,m);col=mix(col,vec3(1.0,0.2,0.1),blob);col=mix(col,vec3(1.0,0.8,0.2),smoothstep(1.5,3.0,m));col+=vec3(0.3,0.0,0.1)*(1.0-uv.y)*0.5;gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'STARGATE', category: 'space', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=(uv-0.5)*u_scale;p.x*=u_resolution.x/u_resolution.y;float t=u_time*u_speed;float r=length(p);float a=atan(p.y,p.x);vec3 col=vec3(0.0);for(float i=0.0;i<10.0;i++){float fi=i/10.0;float z=fract(fi-t*0.5);float size=mix(0.5,0.01,z);float ring=smoothstep(size+0.02,size,r)*smoothstep(size-0.02,size,r);float seg=step(0.5,fract(a*3.0/6.28318+fi+t*0.2));col+=(0.5+0.5*cos(fi*6.28318+t+vec3(0.0,2.0,4.0)))*ring*seg*z*u_intensity;}col+=vec3(0.5,0.7,1.0)*smoothstep(0.1,0.0,r)*0.5;gl_FragColor=vec4(col,1.0);}` },
  { name: 'NOISE TERRAIN', category: 'nature', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float noise(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}float sn(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(noise(i),noise(i+vec2(1.0,0.0)),f.x),mix(noise(i+vec2(0.0,1.0)),noise(i+vec2(1.0,1.0)),f.x),f.y);}float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*sn(p);p*=2.0;a*=0.5;}return v;}void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;float t=u_time*u_speed*0.2;float terrain=fbm(vec2(uv.x*5.0*u_scale+t,t*0.5));float height=terrain*0.4+0.3;vec3 col=vec3(0.1,0.0,0.2);if(uv.y<height){float h=(height-uv.y)/height;col=mix(vec3(0.0,0.3,0.1),vec3(0.4,0.2,0.0),h);col=mix(col,vec3(0.8,0.8,0.9),smoothstep(0.35,0.4,height));}else{col=mix(vec3(0.8,0.4,0.2),vec3(0.1,0.0,0.3),(uv.y-height)/(1.0-height));}gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'CRYSTAL MATRIX', category: 'geometric', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=(uv-0.5)*10.0*u_scale;p.x*=u_resolution.x/u_resolution.y;float t=u_time*u_speed;vec3 col=vec3(0.02,0.02,0.05);for(float i=0.0;i<6.0;i++){float angle=i*1.047198+t*0.2;vec2 dir=vec2(cos(angle),sin(angle));float line=abs(dot(p,dir));line=sin(line*3.14159)*0.5+0.5;col+=(0.5+0.5*cos(i+t+vec3(0.0,2.0,4.0)))*pow(line,8.0)*u_intensity*0.3;}col+=vec3(1.0,0.9,0.95)*smoothstep(0.5,0.0,length(p/u_scale))*0.3;gl_FragColor=vec4(col,1.0);}` },
  { name: 'ELECTRIC FIELD', category: 'energy', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=(uv-0.5)*u_scale;p.x*=u_resolution.x/u_resolution.y;float t=u_time*u_speed;vec3 col=vec3(0.0);for(float i=0.0;i<8.0;i++){vec2 c1=vec2(sin(t+i),cos(t*0.7+i))*0.3;vec2 c2=vec2(sin(t*0.8+i+3.0),cos(t*0.6+i+3.0))*0.3;vec2 field=(p-c1)/dot(p-c1,p-c1)-(p-c2)/dot(p-c2,p-c2);float strength=length(field);col+=(0.5+0.5*cos(i*0.8+t+vec3(0.0,2.0,4.0)))*0.02/(strength+0.1)*u_intensity;}gl_FragColor=vec4(col,1.0);}` },
  { name: 'RADIAL BURST', category: 'energy', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=uv-0.5;p.x*=u_resolution.x/u_resolution.y;float t=u_time*u_speed;float r=length(p)*u_scale;float a=atan(p.y,p.x);vec3 col=vec3(0.0);for(float i=0.0;i<12.0;i++){float offset=i*0.523599;float ray=pow(abs(sin(a*6.0+offset+t)),20.0);float radial=smoothstep(0.0,0.5,r)*smoothstep(1.0,0.3,r);float pulse=sin(r*10.0-t*3.0+i)*0.5+0.5;col+=(0.5+0.5*cos(i*0.5+t+vec3(0.0,2.0,4.0)))*ray*radial*pulse*u_intensity*0.3;}col+=vec3(1.0,0.9,0.8)*smoothstep(0.1,0.0,r)*0.5;gl_FragColor=vec4(col,1.0);}` },
  { name: 'SMOKE WISPS', category: 'organic', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float noise(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}float sn(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(noise(i),noise(i+vec2(1.0,0.0)),f.x),mix(noise(i+vec2(0.0,1.0)),noise(i+vec2(1.0,1.0)),f.x),f.y);}float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<6;i++){v+=a*sn(p);p*=2.0;a*=0.5;}return v;}void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=uv*3.0*u_scale;float t=u_time*u_speed*0.3;vec2 q=vec2(fbm(p+t),fbm(p+1.0));float smoke=fbm(p+q*2.0);smoke=pow(smoke,1.5);vec3 col=mix(vec3(0.02,0.02,0.05),vec3(0.3,0.3,0.4),smoke);col=mix(col,vec3(0.8,0.7,0.6),pow(smoke,3.0));gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'DISCO BALL', category: 'retro', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=(uv-0.5)*u_scale;p.x*=u_resolution.x/u_resolution.y;float t=u_time*u_speed;float r=length(p);float a=atan(p.y,p.x)+t*0.5;vec3 col=vec3(0.0);float tiles=20.0;vec2 tileId=vec2(floor(a*tiles/6.28318),floor(r*tiles));float h=hash(tileId);float sparkle=pow(sin(t*5.0+h*20.0)*0.5+0.5,10.0);float sphere=smoothstep(0.5,0.48,r);col+=(0.5+0.5*cos(h*6.28318+t+vec3(0.0,2.0,4.0)))*sparkle*sphere*u_intensity+vec3(0.2)*sphere*0.3;for(float i=0.0;i<8.0;i++){float rayA=i*0.785398+t;vec2 rayDir=vec2(cos(rayA),sin(rayA));col+=vec3(1.0)*pow(max(0.0,dot(normalize(p),rayDir)),50.0)*smoothstep(0.5,0.8,r)*0.3*u_intensity;}gl_FragColor=vec4(col,1.0);}` },
  { name: 'INFINITY LOOP', category: 'geometric', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=(uv-0.5)*3.0*u_scale;p.x*=u_resolution.x/u_resolution.y;float t=u_time*u_speed;vec3 col=vec3(0.02,0.0,0.05);for(float i=0.0;i<20.0;i++){float fi=i/20.0;float phase=t+fi*6.28318;float sc=1.0-fi*0.3;vec2 inf=vec2(sin(phase),sin(phase*2.0)*0.5)*sc;float d=length(p-inf);float glow=0.02/(d+0.02);col+=(0.5+0.5*cos(fi*6.28318+t+vec3(0.0,2.0,4.0)))*glow*u_intensity*0.15;}gl_FragColor=vec4(col,1.0);}` },
  { name: 'PIXEL SORT', category: 'glitch', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;float t=u_time*u_speed;float columns=40.0*u_scale;float col_id=floor(uv.x*columns);float h=hash(vec2(col_id,floor(t)));float sortHeight=h*0.8+0.1;float sortOffset=sin(t*2.0+col_id*0.5)*0.1;vec2 sortedUV=uv;if(uv.y<sortHeight+sortOffset)sortedUV.y=mod(uv.y+t*h*2.0,sortHeight+sortOffset);vec3 col=0.5+0.5*cos(sortedUV.y*10.0+t+vec3(0.0,2.0,4.0));col*=0.5+0.5*sin(sortedUV.x*columns*3.14159);col=mix(col,1.0-col,step(0.98,hash(vec2(col_id,floor(t*10.0)))));gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'MANDELBROT', category: 'fractal', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;float t=u_time*u_speed*0.1;float zoom=pow(2.0,-mod(t,10.0));vec2 c=vec2(-0.745,0.186)+(uv-0.5)*zoom*3.0*u_scale;c.x*=u_resolution.x/u_resolution.y;vec2 z=vec2(0.0);float iter=0.0;for(int i=0;i<100;i++){z=vec2(z.x*z.x-z.y*z.y,2.0*z.x*z.y)+c;if(dot(z,z)>4.0)break;iter+=1.0;}float si=iter-log2(log2(dot(z,z)));vec3 col=(0.5+0.5*cos(si*0.1+t+vec3(0.0,2.0,4.0)))*smoothstep(100.0,0.0,iter);gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'JULIA SET', category: 'fractal', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;float t=u_time*u_speed*0.2;vec2 z=(uv-0.5)*3.0*u_scale;z.x*=u_resolution.x/u_resolution.y;vec2 c=vec2(sin(t)*0.7,cos(t*0.7)*0.5);float iter=0.0;for(int i=0;i<100;i++){z=vec2(z.x*z.x-z.y*z.y,2.0*z.x*z.y)+c;if(dot(z,z)>4.0)break;iter+=1.0;}vec3 col=(0.5+0.5*cos(iter*0.15+t+vec3(0.0,2.0,4.0)))*smoothstep(100.0,0.0,iter);gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'SPECTRUM BARS', category: 'audio', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float hash(float n){return fract(sin(n)*43758.5453);}void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;float t=u_time*u_speed;float bars=32.0*u_scale;float barId=floor(uv.x*bars);float barWidth=1.0/bars;float barCenter=(barId+0.5)*barWidth;float h=hash(barId);float height=0.3+0.5*(sin(t*3.0+barId*0.5)*0.5+0.5)*(0.5+0.5*sin(t*2.0+h*10.0));float bar=step(uv.y,height)*smoothstep(barWidth*0.1,barWidth*0.4,abs(uv.x-barCenter));vec3 col=vec3(0.02,0.02,0.05);vec3 barCol=0.5+0.5*cos(barId*0.2+t+vec3(0.0,2.0,4.0));col+=barCol*bar*u_intensity+barCol*smoothstep(height+0.02,height,uv.y)*0.5*u_intensity;gl_FragColor=vec4(col,1.0);}` },
  { name: 'SUPERNOVA', category: 'space', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float noise(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=(uv-0.5)*u_scale;p.x*=u_resolution.x/u_resolution.y;float t=u_time*u_speed;float r=length(p);float a=atan(p.y,p.x);vec3 col=vec3(0.0);float core=smoothstep(0.1,0.0,r);col+=vec3(1.0,0.95,0.9)*core;float corona=smoothstep(0.3,0.0,r)*(1.0-core);col+=vec3(1.0,0.6,0.2)*corona;for(float i=0.0;i<12.0;i++){float rayA=i*0.523599+t*0.3+noise(vec2(i,floor(t)))*0.5;float raySpread=0.1+0.1*noise(vec2(i+100.0,t));float ray=smoothstep(raySpread,0.0,abs(mod(a-rayA+3.14159,6.28318)-3.14159))*smoothstep(0.0,0.5,r)*smoothstep(1.0,0.2,r);col+=mix(vec3(1.0,0.8,0.3),vec3(1.0,0.3,0.1),noise(vec2(i,0.0)))*ray*0.5*u_intensity;}col+=vec3(0.5,0.7,1.0)*smoothstep(0.02,0.0,abs(r-0.4-sin(t)*0.1))*u_intensity;gl_FragColor=vec4(col,1.0);}` },
  { name: 'WORMHOLE', category: 'space', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=(uv-0.5)*u_scale;p.x*=u_resolution.x/u_resolution.y;float t=u_time*u_speed;float r=length(p);float a=atan(p.y,p.x);float warp=1.0/(r+0.1);float spiral=sin(a*5.0+warp*3.0-t*2.0);vec3 col=vec3(0.0);float tunnel=smoothstep(0.0,0.5,r)*smoothstep(1.0,0.3,r);col+=(0.5+0.5*cos(warp+t+vec3(0.0,2.0,4.0)))*tunnel*(spiral*0.5+0.5)*u_intensity;col=mix(col,vec3(0.0),smoothstep(0.15,0.0,r));col+=vec3(1.0,0.5,0.2)*smoothstep(0.02,0.0,abs(r-0.15))*u_intensity;gl_FragColor=vec4(col,1.0);}` },

  // ---- NEW: SACRED GEOMETRY ----
  { name: 'FLOWER OF LIFE', category: 'sacred', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float circle(vec2 p,vec2 c,float r){return smoothstep(r+0.008,r-0.008,length(p-c));}void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=(uv-0.5)*3.0*u_scale;p.x*=u_resolution.x/u_resolution.y;float t=u_time*u_speed;float r=0.5;float v=0.0;vec2 hex[7];hex[0]=vec2(0.0,0.0);hex[1]=vec2(r,0.0);hex[2]=vec2(r*0.5,r*0.866);hex[3]=vec2(-r*0.5,r*0.866);hex[4]=vec2(-r,0.0);hex[5]=vec2(-r*0.5,-r*0.866);hex[6]=vec2(r*0.5,-r*0.866);float ring=0.0;for(int i=0;i<7;i++){float d=length(p-hex[i]);ring+=smoothstep(r+0.015,r-0.015,d)-smoothstep(r-0.015,r-0.04,d);}float hue=ring*0.3+atan(p.y,p.x)/6.28318+t*0.1;vec3 col=(0.5+0.5*cos(hue*6.28318+vec3(0.0,2.09,4.18)))*ring;col+=vec3(0.2,0.05,0.3)*(sin(length(p)*8.0-t*2.0)*0.5+0.5)*(1.0-ring);gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'METATRON CUBE', category: 'sacred', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float line(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0);return length(pa-ba*h);}void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=(uv-0.5)*3.5*u_scale;p.x*=u_resolution.x/u_resolution.y;float t=u_time*u_speed*0.3;float c=cos(t),s=sin(t);p=vec2(c*p.x-s*p.y,s*p.x+c*p.y);float N=6.0;float d=1e9;vec2 pts[6];for(int i=0;i<6;i++){float a=float(i)/6.0*6.28318;pts[i]=vec2(cos(a),sin(a));}for(int i=0;i<6;i++)for(int j=0;j<6;j++){if(i!=j)d=min(d,line(p,pts[i],pts[j]));}d=min(d,line(p,vec2(0.0),pts[0]));d=min(d,line(p,vec2(0.0),pts[1]));d=min(d,line(p,vec2(0.0),pts[2]));d=min(d,line(p,vec2(0.0),pts[3]));d=min(d,line(p,vec2(0.0),pts[4]));d=min(d,line(p,vec2(0.0),pts[5]));float v=smoothstep(0.04,0.01,d);float hue=atan(p.y,p.x)/6.28318+t*0.2+length(p)*0.3;vec3 col=(0.5+0.5*cos(hue*6.28318+vec3(0.0,2.09,4.18)))*v;col+=vec3(0.05,0.0,0.1)*(1.0-v);gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'SRI YANTRA', category: 'sacred', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float tri(vec2 p,float sz,float flip){p.y*=flip;float d=max(-p.y-sz*0.5,max(p.x*0.866+p.y*0.5-sz*0.5,-p.x*0.866+p.y*0.5-sz*0.5));return abs(d)-0.012;}void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=(uv-0.5)*4.0*u_scale;p.x*=u_resolution.x/u_resolution.y;float t=u_time*u_speed*0.2;float c=cos(t*0.1),s=sin(t*0.1);p=vec2(c*p.x-s*p.y,s*p.x+c*p.y);float d=1e9;float scales[4];scales[0]=1.0;scales[1]=0.75;scales[2]=0.55;scales[3]=0.35;for(int i=0;i<4;i++){float sc=scales[i];d=min(d,abs(tri(p,sc,1.0)));d=min(d,abs(tri(p,sc*0.9,-1.0)));}float v=smoothstep(0.025,0.0,d);float pulse=sin(length(p)*6.0-t*2.0)*0.5+0.5;float hue=length(p)*0.3+t*0.15;vec3 col=(0.5+0.5*cos(hue*6.28318+vec3(0.0,2.09,4.18)))*v;col+=vec3(0.6,0.1,0.8)*pulse*(1.0-v)*0.15;col+=vec3(1.0,0.8,0.3)*smoothstep(0.0,0.02,v)*0.5;gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'TORUS MANDALA', category: 'sacred', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=(uv-0.5)*4.0*u_scale;p.x*=u_resolution.x/u_resolution.y;float t=u_time*u_speed;float r=length(p);float a=atan(p.y,p.x);float petals=12.0;float mandala=0.0;for(float i=0.0;i<petals;i++){float pa=a-i*6.28318/petals+t*0.2;float pr=r-0.6+sin(pa*2.0+t)*0.15;mandala+=smoothstep(0.04,0.0,abs(pr))*smoothstep(3.14159,0.0,abs(pa-floor((pa+3.14159)/6.28318*petals)/petals*6.28318+3.14159/petals));}float rings=0.0;for(float i=1.0;i<5.0;i++){rings+=smoothstep(0.025,0.0,abs(r-i*0.28));}float v=mandala+rings*0.5;float hue=a/6.28318+r*0.2+t*0.1;vec3 col=(0.5+0.5*cos(hue*6.28318+vec3(0.0,2.09,4.18)))*v;col+=vec3(0.3,0.0,0.5)*smoothstep(0.3,0.0,r)*(1.0-v);gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'GOLDEN SPIRAL', category: 'sacred', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=(uv-0.5)*5.0*u_scale;p.x*=u_resolution.x/u_resolution.y;float t=u_time*u_speed*0.3;float r=length(p);float a=atan(p.y,p.x)+t;float phi=1.61803398875;float logSpiral=log(r)/log(phi)-a/6.28318*log(phi);float spiral=fract(logSpiral);float v=smoothstep(0.1,0.0,abs(spiral-0.5)-0.4)*smoothstep(0.0,0.5,r);float shells=0.0;for(float i=0.0;i<6.0;i++){float sr=pow(phi,i)*0.05;shells+=smoothstep(0.015,0.0,abs(r-sr));}float hue=spiral+t*0.1;vec3 col=(0.5+0.5*cos(hue*6.28318+vec3(0.0,2.09,4.18)))*(v+shells);col+=vec3(0.8,0.6,0.1)*shells;gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'VESICA PISCIS', category: 'sacred', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float circle(vec2 p,vec2 c,float r){return abs(length(p-c)-r);}void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=(uv-0.5)*4.0*u_scale;p.x*=u_resolution.x/u_resolution.y;float t=u_time*u_speed*0.2;float r=0.8;float v=0.0;float N=7.0;for(float i=0.0;i<7.0;i++){float ang=i/7.0*6.28318+t*0.1;vec2 c=vec2(cos(ang),sin(ang))*r*0.5;v+=smoothstep(0.03,0.0,circle(p,c,r));}float pulse=sin(length(p)*5.0-t*2.0)*0.4+0.6;float hue=atan(p.y,p.x)/6.28318+t*0.15;vec3 col=(0.5+0.5*cos(hue*6.28318*2.0+vec3(0.0,2.09,4.18)))*v*pulse;col+=vec3(0.1,0.0,0.2)*(sin(length(p)*10.0+t)*0.5+0.5)*(1.0-min(v,1.0));gl_FragColor=vec4(col*u_intensity,1.0);}` },

  // ---- NEW: 3D RAYMARCHED ----
  { name: 'TORUS KNOT 3D', category: '3d', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
float sdTorus(vec3 p,vec2 t){vec2 q=vec2(length(p.xz)-t.x,p.y);return length(q)-t.y;}
mat3 rotY(float a){float c=cos(a),s=sin(a);return mat3(c,0,s,0,1,0,-s,0,c);}
mat3 rotX(float a){float c=cos(a),s=sin(a);return mat3(1,0,0,0,c,-s,0,s,c);}
float map(vec3 p,float t){
  float P=2.0,Q=3.0;
  float phi=atan(p.z,p.x);
  float r=length(p.xz);
  float theta=atan(p.y,r-1.0*u_scale);
  float knotPhi=P*phi-Q*theta;
  vec3 kp=vec3(cos(knotPhi)*(1.0+0.35*cos(P*phi)),0.35*sin(P*phi),sin(knotPhi)*(1.0+0.35*cos(P*phi)));
  return length(p-kp*u_scale*0.4)-0.08*u_scale;
}
void main(){
  vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;
  float t=u_time*u_speed;
  vec3 ro=vec3(0.0,0.0,3.5);
  vec3 rd=normalize(vec3(uv,-1.5));
  mat3 ry=rotY(t*0.4);mat3 rx=rotX(t*0.25);
  ro=ry*rx*ro;rd=ry*rx*rd;
  float d=0.0;vec3 p=ro;float hit=0.0;
  for(int i=0;i<80;i++){float s=map(p,t);if(s<0.002){hit=1.0;break;}d+=s;p=ro+rd*d;if(d>10.0)break;}
  vec3 col=vec3(0.0);
  if(hit>0.5){
    float eps=0.002;
    vec3 n=normalize(vec3(map(p+vec3(eps,0,0),t)-map(p-vec3(eps,0,0),t),map(p+vec3(0,eps,0),t)-map(p-vec3(0,eps,0),t),map(p+vec3(0,0,eps),t)-map(p-vec3(0,0,eps),t)));
    vec3 ld=normalize(vec3(1,2,1));
    float diff=max(dot(n,ld),0.0);
    float spec=pow(max(dot(reflect(-ld,n),normalize(ro-p)),0.0),32.0);
    float hue=d*0.15+t*0.2+p.y*0.5;
    col=(0.5+0.5*cos(hue*6.28318+vec3(0.0,2.09,4.18)))*(diff*0.8+0.2)+vec3(1.0)*spec*0.5;
    col+=vec3(0.3,0.1,0.8)*pow(1.0-diff,3.0);
  }else{col=vec3(0.02,0.0,0.05)+vec3(0.1,0.0,0.2)*length(uv);}
  gl_FragColor=vec4(col*u_intensity,1.0);}` },

  { name: 'GYROID OCEAN', category: '3d', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
float gyroid(vec3 p){return dot(sin(p),cos(p.yzx));}
float map(vec3 p,float t){
  p*=u_scale*1.5;
  float g=gyroid(p+vec3(t*0.3,t*0.2,t*0.15));
  float g2=gyroid(p*2.0+vec3(-t*0.5,t*0.3,t*0.4))*0.5;
  return g+g2-0.3;
}
void main(){
  vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;
  float t=u_time*u_speed;
  vec3 ro=vec3(0.0,0.0,4.0);
  vec3 rd=normalize(vec3(uv,-1.8));
  float d=0.0;vec3 p=ro;float hit=0.0;int steps=0;
  for(int i=0;i<64;i++){
    float s=map(p,t)*0.4;
    if(abs(s)<0.003){hit=float(i)/64.0;break;}
    d+=s;p=ro+rd*d;steps=i;
    if(d>8.0)break;
  }
  vec3 col=vec3(0.0);
  if(hit>0.0){
    float eps=0.01;
    vec3 n=normalize(vec3(map(p+vec3(eps,0,0),t)-map(p-vec3(eps,0,0),t),map(p+vec3(0,eps,0),t)-map(p-vec3(0,eps,0),t),map(p+vec3(0,0,eps),t)-map(p-vec3(0,0,eps),t)));
    float diff=max(dot(n,normalize(vec3(1,2,1))),0.0);
    float ao=1.0-hit;
    float hue=p.x*0.2+p.y*0.3+p.z*0.1+t*0.15;
    col=(0.5+0.5*cos(hue*6.28318+vec3(0.0,2.09,4.18)))*(diff*0.7+0.3)*ao;
    col+=vec3(0.1,0.5,0.8)*pow(1.0-diff,2.0)*0.4;
  }else{col=vec3(0.02,0.01,0.04);}
  gl_FragColor=vec4(col*u_intensity,1.0);}` },

  { name: 'MENGER SPONGE', category: '3d', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
float sdBox(vec3 p,vec3 b){vec3 d=abs(p)-b;return length(max(d,0.0))+min(max(d.x,max(d.y,d.z)),0.0);}
float menger(vec3 p){
  float d=sdBox(p,vec3(1.0));
  float s=1.0;
  for(int i=0;i<4;i++){
    vec3 a=mod(p*s,2.0)-1.0;
    s*=3.0;
    vec3 r=abs(1.0-3.0*abs(a));
    float da=max(r.x,r.y);float db=max(r.y,r.z);float dc=max(r.z,r.x);
    float c=(min(da,min(db,dc))-1.0)/s;
    d=max(d,c);
  }
  return d;
}
mat3 rotY(float a){float c=cos(a),s=sin(a);return mat3(c,0,s,0,1,0,-s,0,c);}
mat3 rotX(float a){float c=cos(a),s=sin(a);return mat3(1,0,0,0,c,-s,0,s,c);}
void main(){
  vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;
  float t=u_time*u_speed*0.3;
  vec3 ro=vec3(0.0,0.0,3.0);
  vec3 rd=normalize(vec3(uv,-1.5));
  mat3 ry=rotY(t*0.5);mat3 rx=rotX(t*0.3);
  ro=ry*rx*ro;rd=ry*rx*rd;
  float d=0.0;vec3 p=ro;bool hit=false;
  for(int i=0;i<100;i++){float s=menger(p/u_scale)*u_scale;if(s<0.002){hit=true;break;}d+=s;p=ro+rd*d;if(d>10.0)break;}
  vec3 col=vec3(0.0);
  if(hit){
    float eps=0.002;
    vec3 n=normalize(vec3(menger((p+vec3(eps,0,0))/u_scale)-menger((p-vec3(eps,0,0))/u_scale),menger((p+vec3(0,eps,0))/u_scale)-menger((p-vec3(0,eps,0))/u_scale),menger((p+vec3(0,0,eps))/u_scale)-menger((p-vec3(0,0,eps))/u_scale)));
    float diff=max(dot(n,normalize(vec3(1,1,1))),0.0);
    float spec=pow(max(dot(reflect(-normalize(vec3(1,1,1)),n),normalize(ro-p)),0.0),16.0);
    float hue=d*0.1+t*0.3;
    col=(0.5+0.5*cos(hue*6.28318+vec3(0.0,2.09,4.18)))*(diff*0.6+0.2)+vec3(1.0)*spec*0.4;
  }else{col=vec3(0.03,0.02,0.05);}
  gl_FragColor=vec4(col*u_intensity,1.0);}` },

  { name: 'HYPERCUBE', category: '3d', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
float line3(vec3 p,vec3 a,vec3 b){vec3 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0);return length(pa-ba*h)-0.015;}
vec3 proj4(vec4 v,float w){return v.xyz/(v.w+w);}
mat4 rot4XW(float a){float c=cos(a),s=sin(a);return mat4(c,0,0,-s,0,1,0,0,0,0,1,0,s,0,0,c);}
mat4 rot4YZ(float a){float c=cos(a),s=sin(a);return mat4(1,0,0,0,0,c,-s,0,0,s,c,0,0,0,0,1);}
void main(){
  vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;
  float t=u_time*u_speed*0.4;
  mat4 r1=rot4XW(t*0.7);mat4 r2=rot4YZ(t*0.5);
  vec4 verts[16];
  for(int i=0;i<16;i++){
    float fi=float(i);
    float x=mod(fi,2.0)*2.0-1.0,y=mod(floor(fi/2.0),2.0)*2.0-1.0,z=mod(floor(fi/4.0),2.0)*2.0-1.0,w=mod(floor(fi/8.0),2.0)*2.0-1.0;
    vec4 v=r2*r1*vec4(x,y,z,w)*0.5*u_scale;
    verts[i]=v;
  }
  float d=1e9;
  for(int a=0;a<16;a++)for(int b=0;b<16;b++){
    if(b>a){
      float fa=float(a),fb=float(b);
      float dx=abs(mod(fa,2.0)-mod(fb,2.0));
      float dy=abs(mod(floor(fa/2.0),2.0)-mod(floor(fb/2.0),2.0));
      float dz=abs(mod(floor(fa/4.0),2.0)-mod(floor(fb/4.0),2.0));
      float dw=abs(mod(floor(fa/8.0),2.0)-mod(floor(fb/8.0),2.0));
      if(dx+dy+dz+dw<1.5){
        vec3 pa=proj4(verts[a],2.5);
        vec3 pb=proj4(verts[b],2.5);
        float ld=line3(vec3(uv,0.0),pa,pb);
        d=min(d,ld);
      }
    }
  }
  float v=smoothstep(0.04,0.0,d);
  float hue=d*2.0+t*0.2;
  vec3 col=(0.5+0.5*cos(hue*6.28318+vec3(0.0,2.09,4.18)))*v;
  col+=vec3(0.05,0.0,0.1)*(1.0-v);
  gl_FragColor=vec4(col*u_intensity,1.0);}` },

  { name: 'SIERPINSKI 3D', category: '3d', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
float tetra(vec3 p){
  p/=u_scale;
  const int IT=8;
  float s=1.0;
  for(int i=0;i<8;i++){
    if(p.x+p.y<0.0){float t2=p.x;p.x=-p.y;p.y=-t2;}
    if(p.x+p.z<0.0){float t2=p.x;p.x=-p.z;p.z=-t2;}
    if(p.y+p.z<0.0){float t2=p.z;p.z=-p.y;p.y=-t2;}
    p=p*2.0-vec3(1.0);s*=2.0;
  }
  return length(p)/s*u_scale;
}
mat3 rotY(float a){float c=cos(a),s=sin(a);return mat3(c,0,s,0,1,0,-s,0,c);}
void main(){
  vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;
  float t=u_time*u_speed*0.25;
  vec3 ro=rotY(t)*(vec3(0,0,3.5));
  vec3 rd=normalize(rotY(t)*vec3(uv,-1.5));
  float d=0.0;vec3 p=ro;bool hit=false;
  for(int i=0;i<120;i++){float s=tetra(p);if(s<0.003){hit=true;break;}d+=max(s,0.005);p=ro+rd*d;if(d>12.0)break;}
  vec3 col=vec3(0.0);
  if(hit){
    float eps=0.005;
    vec3 n=normalize(vec3(tetra(p+vec3(eps,0,0))-tetra(p-vec3(eps,0,0)),tetra(p+vec3(0,eps,0))-tetra(p-vec3(0,eps,0)),tetra(p+vec3(0,0,eps))-tetra(p-vec3(0,0,eps))));
    float diff=max(dot(n,normalize(vec3(1,2,1))),0.0)*0.8+0.2;
    float hue=p.x*0.3+p.y*0.4+t*0.15;
    col=(0.5+0.5*cos(hue*6.28318+vec3(0.0,2.09,4.18)))*diff;
    col+=vec3(0.5,0.2,1.0)*pow(1.0-diff,3.0);
  }else{col=vec3(0.02,0.01,0.04);}
  gl_FragColor=vec4(col*u_intensity,1.0);}` },

  { name: 'VOLUMETRIC CLOUD', category: '3d', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float noise3(vec3 p){vec3 i=floor(p);vec3 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm3(vec3 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*noise3(p);p*=2.0;a*=0.5;}return v;}
void main(){
  vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;
  float t=u_time*u_speed*0.2;
  vec3 ro=vec3(0.0,0.0,3.0);
  vec3 rd=normalize(vec3(uv,-1.5));
  vec3 col=vec3(0.0);float alpha=0.0;
  float step=0.08;
  for(int i=0;i<40;i++){
    vec3 p=ro+rd*(float(i)*step+0.5);
    float d=fbm3(p*u_scale*0.8+vec3(t*0.3,t*0.15,t*0.2));
    d=max(d-0.4,0.0)*2.0;
    float hue=d*0.5+t*0.1+p.y*0.2;
    vec3 c=(0.5+0.5*cos(hue*6.28318+vec3(0.0,2.09,4.18)))*d;
    col+=c*(1.0-alpha)*step*3.0;
    alpha+=d*(1.0-alpha)*step*2.0;
    if(alpha>0.95)break;
  }
  col+=vec3(0.02,0.01,0.04)*(1.0-alpha);
  gl_FragColor=vec4(col*u_intensity,1.0);}` },

  { name: 'RHODOPSIN FOLD', category: '3d', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float noise3(vec3 p){vec3 i=floor(p);vec3 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float map(vec3 p,float t){
  vec3 q=p;
  q.x+=sin(q.z*2.0+t)*0.4;
  q.y+=sin(q.x*1.5-t*0.7)*0.4;
  float n=noise3(q*u_scale+vec3(t*0.2))*0.5;
  float n2=noise3(q*u_scale*2.3-vec3(t*0.3,t*0.1,0))*0.25;
  float shell=length(p)-1.2+n+n2;
  float gyroid=dot(sin(p*u_scale*2.0+t*0.3),cos(p.yzx*u_scale*2.0-t*0.2))*0.15;
  return shell+gyroid;
}
void main(){
  vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;
  float t=u_time*u_speed;
  vec3 ro=vec3(sin(t*0.2)*0.5,cos(t*0.15)*0.3,3.5);
  vec3 rd=normalize(vec3(uv,-1.6));
  float d=0.5;vec3 p=ro;bool hit=false;
  for(int i=0;i<80;i++){float s=map(p,t);if(s<0.004){hit=true;break;}d+=s*0.6;p=ro+rd*d;if(d>8.0)break;}
  vec3 col=vec3(0.0);
  if(hit){
    float eps=0.01;
    vec3 n=normalize(vec3(map(p+vec3(eps,0,0),t)-map(p-vec3(eps,0,0),t),map(p+vec3(0,eps,0),t)-map(p-vec3(0,eps,0),t),map(p+vec3(0,0,eps),t)-map(p-vec3(0,0,eps),t)));
    vec3 ld=normalize(vec3(sin(t),cos(t*0.7),1.0));
    float diff=max(dot(n,ld),0.0);
    float spec=pow(max(dot(reflect(-ld,n),normalize(ro-p)),0.0),48.0);
    float fres=pow(1.0-max(dot(n,normalize(ro-p)),0.0),3.0);
    float hue=p.x*0.4+p.y*0.3+d*0.15+t*0.1;
    col=(0.5+0.5*cos(hue*6.28318+vec3(0.0,2.09,4.18)))*(diff*0.7+0.15);
    col+=vec3(1.0,0.5,0.9)*spec*0.8+vec3(0.3,0.1,0.9)*fres*0.5;
  }else{
    float hue=length(uv)*0.5+t*0.05;
    col=(0.5+0.5*cos(hue*6.28318+vec3(0.0,2.09,4.18)))*0.05;
  }
  gl_FragColor=vec4(col*u_intensity,1.0);}` },

  { name: 'CLIFFORD TORUS', category: '3d', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
float sdTorus(vec3 p,vec2 t){vec2 q=vec2(length(p.xz)-t.x,p.y);return length(q)-t.y;}
mat3 rotX(float a){float c=cos(a),s=sin(a);return mat3(1,0,0,0,c,-s,0,s,c);}
mat3 rotZ(float a){float c=cos(a),s=sin(a);return mat3(c,-s,0,s,c,0,0,0,1);}
float map(vec3 p,float t){
  float d=1e9;
  for(float i=0.0;i<4.0;i++){
    float a=i*1.5708+t*0.3;
    vec3 q=rotX(a)*rotZ(a*0.618)*p;
    d=min(d,sdTorus(q,vec2(0.6*u_scale,0.12*u_scale)));
  }
  return d;
}
void main(){
  vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;
  float t=u_time*u_speed*0.5;
  vec3 ro=vec3(0,0,3.5);
  vec3 rd=normalize(vec3(uv,-1.5));
  mat3 ry=mat3(cos(t*0.4),0,sin(t*0.4),0,1,0,-sin(t*0.4),0,cos(t*0.4));
  ro=ry*ro;rd=ry*rd;
  float d=0.0;vec3 p=ro;bool hit=false;
  for(int i=0;i<80;i++){float s=map(p,t);if(s<0.003){hit=true;break;}d+=s;p=ro+rd*d;if(d>10.0)break;}
  vec3 col=vec3(0.0);
  if(hit){
    float eps=0.003;
    vec3 n=normalize(vec3(map(p+vec3(eps,0,0),t)-map(p-vec3(eps,0,0),t),map(p+vec3(0,eps,0),t)-map(p-vec3(0,eps,0),t),map(p+vec3(0,0,eps),t)-map(p-vec3(0,0,eps),t)));
    float diff=max(dot(n,normalize(vec3(1,2,1))),0.0);
    float spec=pow(max(dot(reflect(-normalize(vec3(1,2,1)),n),normalize(ro-p)),0.0),32.0);
    float hue=atan(p.z,p.x)/6.28318+p.y*0.5+t*0.1;
    col=(0.5+0.5*cos(hue*6.28318+vec3(0.0,2.09,4.18)))*(diff*0.7+0.15)+vec3(1.0)*spec*0.4;
    col+=vec3(0.3,0.0,0.8)*pow(1.0-diff,2.0)*0.3;
  }else{col=vec3(0.02,0.01,0.04);}
  gl_FragColor=vec4(col*u_intensity,1.0);}` },

  { name: 'ALIEN MEMBRANE', category: '3d', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float n3(vec3 p){vec3 i=floor(p);vec3 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float map(vec3 p,float t){
  float r=length(p);
  float theta=acos(p.y/max(r,0.001));
  float phi=atan(p.z,p.x);
  float spikes=0.0;
  for(float i=0.0;i<5.0;i++){spikes+=sin(theta*3.0+i*1.26+t)*cos(phi*4.0+i*0.5-t*0.7)*0.06;}
  float membrane=r-0.9*u_scale-spikes-n3(p*2.0*u_scale+t*0.2)*0.12-n3(p*5.0*u_scale-t*0.3)*0.04;
  return membrane;
}
void main(){
  vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;
  float t=u_time*u_speed;
  vec3 ro=vec3(sin(t*0.3)*0.3,cos(t*0.25)*0.2,3.2);
  vec3 rd=normalize(vec3(uv,-1.5));
  float d=0.3;vec3 p=ro;bool hit=false;
  for(int i=0;i<90;i++){float s=map(p,t);if(abs(s)<0.004){hit=true;break;}d+=s*0.7;p=ro+rd*d;if(d>8.0)break;}
  vec3 col=vec3(0.0);
  if(hit){
    float eps=0.008;
    vec3 n=normalize(vec3(map(p+vec3(eps,0,0),t)-map(p-vec3(eps,0,0),t),map(p+vec3(0,eps,0),t)-map(p-vec3(0,eps,0),t),map(p+vec3(0,0,eps),t)-map(p-vec3(0,0,eps),t)));
    vec3 ld=normalize(vec3(cos(t*0.5),sin(t*0.3),1.0));
    float diff=max(dot(n,ld),0.0);
    float spec=pow(max(dot(reflect(-ld,n),normalize(ro-p)),0.0),64.0);
    float fres=pow(1.0-abs(dot(n,normalize(ro-p))),4.0);
    float hue=p.x*0.5+p.z*0.4+t*0.15;
    col=(0.5+0.5*cos(hue*6.28318+vec3(1.0,2.09,4.18)))*(diff*0.6+0.1);
    col+=vec3(0.2,1.0,0.5)*spec*0.6;
    col+=vec3(0.0,0.5,1.0)*fres*0.4;
    col+=vec3(0.4,0.0,0.8)*(1.0-diff)*0.2;
  }else{col=vec3(0.01,0.02,0.03);}
  gl_FragColor=vec4(col*u_intensity,1.0);}` },

  // ---- NEW: EXTRA PSYCHEDELIC ----
  { name: 'DMT TUNNEL', category: 'psychedelic', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
  vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;
  float t=u_time*u_speed;
  float r=length(uv);float a=atan(uv.y,uv.x);
  vec3 col=vec3(0.0);
  float depth=1.0/(r+0.02)-t*2.0;
  for(float i=0.0;i<8.0;i++){
    float fi=i/8.0;
    float layer=fract(depth+fi);
    float hue=a/6.28318+layer*0.5+fi*0.3+t*0.1;
    float geom=sin(a*floor(3.0+i)+layer*12.0+t*(1.0+fi))*0.5+0.5;
    geom*=sin(a*floor(5.0+i*1.3)-layer*8.0-t*(0.7+fi*0.5))*0.5+0.5;
    float v=pow(geom,2.0)*smoothstep(0.0,0.2,layer)*smoothstep(1.0,0.7,layer);
    col+=(0.5+0.5*cos(hue*6.28318+vec3(0.0,2.09,4.18)))*v/8.0;
  }
  col*=u_intensity*(0.5+0.5/(r+0.1));
  gl_FragColor=vec4(col,1.0);}` },

  { name: 'FRACTAL FLAME', category: 'psychedelic', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
void main(){
  vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;
  float t=u_time*u_speed;
  vec2 p=uv*u_scale;
  vec3 col=vec3(0.0);
  for(float i=0.0;i<6.0;i++){
    float fi=i/6.0;
    vec2 q=p;
    for(int j=0;j<5;j++){
      q=abs(q)/dot(q,q)-vec2(0.5+sin(t*0.3+fi)*0.2,0.2+cos(t*0.2+fi)*0.15);
    }
    float v=1.0/(length(q)+0.1);
    v=min(v,2.0);
    float hue=fi+t*0.1+length(q)*0.2;
    col+=(0.5+0.5*cos(hue*6.28318+vec3(0.0,2.09,4.18)))*v*0.3;
  }
  gl_FragColor=vec4(col*u_intensity,1.0);}` },

  { name: 'ACID VORONOI', category: 'psychedelic', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
vec2 hash2(vec2 p){return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);}
void main(){
  vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;
  float t=u_time*u_speed;
  vec2 p=uv*5.0*u_scale;
  vec2 warp=vec2(sin(p.y*1.3+t)*0.3,cos(p.x*1.1-t*0.7)*0.3);
  p+=warp;
  vec2 n=floor(p),f=fract(p);
  float d1=8.0,d2=8.0;vec2 mv=vec2(0.0);
  for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){
    vec2 g=vec2(float(i),float(j));
    vec2 o=hash2(n+g);
    o=0.5+0.5*sin(t*1.3+6.2831*o);
    vec2 r=g+o-f;float d=dot(r,r);
    if(d<d1){d2=d1;d1=d;mv=r;}
    else if(d<d2)d2=d;
  }
  float edge=smoothstep(0.0,0.05,sqrt(d2)-sqrt(d1));
  float hue=atan(mv.y,mv.x)/6.28318+sqrt(d1)*0.5+t*0.12;
  vec3 col=(0.5+0.5*cos(hue*6.28318*2.0+vec3(0.0,2.09,4.18)))*edge;
  col+=vec3(1.0,0.5,0.9)*(1.0-edge)*0.15;
  col+=vec3(0.0,1.0,0.6)*smoothstep(0.03,0.0,sqrt(d2)-sqrt(d1))*2.0;
  gl_FragColor=vec4(col*u_intensity,1.0);}` },

  { name: 'INFINITE ZOOM', category: 'psychedelic', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
float noise(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
float sn(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(noise(i),noise(i+vec2(1,0)),f.x),mix(noise(i+vec2(0,1)),noise(i+vec2(1,1)),f.x),f.y);}
void main(){
  vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;
  float t=u_time*u_speed;
  vec2 p=uv;
  float zoom=exp(mod(t*0.5,log(2.0*u_scale)));
  p*=zoom;
  vec3 col=vec3(0.0);
  for(float i=0.0;i<5.0;i++){
    float s=pow(2.0,i);
    float n1=sn(p*s+vec2(t*0.3,-t*0.2));
    float n2=sn(p*s*1.7+vec2(-t*0.25,t*0.35));
    float v=n1*n2;
    float hue=v+i*0.2+t*0.08;
    col+=(0.5+0.5*cos(hue*6.28318+vec3(0.0,2.09,4.18)))*v*(0.5/s);
  }
  col*=u_intensity*1.5;
  gl_FragColor=vec4(col,1.0);}` },

  { name: 'MOIRÉ DREAM', category: 'psychedelic', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
void main(){
  vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;
  float t=u_time*u_speed;
  vec2 p=uv*u_scale*8.0;
  float v=0.0;
  for(float i=0.0;i<6.0;i++){
    float fi=i/6.0;
    float ang=fi*3.14159+t*0.15*(1.0+fi*0.5);
    float c2=cos(ang),s2=sin(ang);
    vec2 rp=vec2(c2*p.x-s2*p.y,s2*p.x+c2*p.y);
    float freq=10.0+i*3.0;
    v+=sin(rp.x*freq+t*(0.5+fi*0.3))*sin(rp.y*freq*0.7-t*(0.4+fi*0.2));
  }
  v/=6.0;
  float hue=v*0.5+atan(uv.y,uv.x)/6.28318+t*0.08;
  vec3 col=0.5+0.5*cos(hue*6.28318+vec3(0.0,2.09,4.18));
  col*=0.7+0.3*sin(v*8.0+t);
  gl_FragColor=vec4(col*u_intensity,1.0);}` },

  // ---- NEW: GLITCH EXTRA ----
  { name: 'DATA CORRUPT', category: 'glitch', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
float hash(float n){return fract(sin(n)*43758.5453);}
float hash2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution.xy;
  float t=u_time*u_speed;
  float slice=floor(uv.y*30.0*u_scale);
  float glitchT=floor(t*8.0);
  float glitchAmt=step(0.85,hash(slice+glitchT*100.0));
  float offsetX=(hash(slice+glitchT)-0.5)*0.3*glitchAmt;
  float scaleX=1.0+glitchAmt*0.1*(hash(slice+glitchT*50.0)-0.5);
  vec2 uv2=vec2((uv.x+offsetX)*scaleX,uv.y);
  float r=hash2(vec2(floor(uv2.x*80.0),slice)+glitchT);
  float g=hash2(vec2(floor(uv2.x*80.0+1.0),slice)+glitchT);
  float b=hash2(vec2(floor(uv2.x*80.0+2.0),slice)+glitchT);
  vec3 col=vec3(r,g,b);
  col=mix(col,0.5+0.5*cos(uv.y*10.0+t+vec3(0,2,4)),1.0-glitchAmt);
  float scanline=0.9+0.1*sin(uv.y*u_resolution.y*2.0);
  col*=scanline*u_intensity;
  gl_FragColor=vec4(col,1.0);}` },

  // ---- EXPANSION: FRACTAL ----
  { name: 'APOLLONIAN GASKET', category: 'fractal', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed*0.3;float ca=cos(t*0.4),sa=sin(t*0.4);vec3 p=vec3(mat2(ca,-sa,sa,ca)*uv*1.2*u_scale,0.15+0.1*sin(t));float sc=1.0;float trap=1e9;for(int i=0;i<8;i++){p=mod(p-1.0,2.0)-1.0;float r2=max(dot(p,p),1e-4);float k=1.25/r2;p*=k;sc*=k;trap=min(trap,r2);}float d=length(p.xy)/sc;float v=clamp(0.0025/(d+0.0008),0.0,2.2);vec3 col=(0.5+0.5*cos(6.28318*(trap*0.7+t*0.15+vec3(0.0,0.33,0.67))))*v*0.55;col+=vec3(0.8,0.6,1.0)*pow(max(1.0-trap,0.0),5.0)*0.35;gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'MANDELBOX', category: 'fractal', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;float ca=cos(t*0.05),sa=sin(t*0.05);vec2 c=mat2(ca,-sa,sa,ca)*uv*3.0*u_scale;vec2 z=c;float sf=2.0+0.35*sin(t*0.3);float trap=1e9;for(int i=0;i<14;i++){z=clamp(z,-1.0,1.0)*2.0-z;float r2=dot(z,z);if(r2<0.25)z*=4.0;else if(r2<1.0)z/=r2;z=z*sf+c;trap=min(trap,length(z));if(dot(z,z)>1e4)break;}vec3 col=(0.5+0.5*cos(6.28318*(trap*0.35+t*0.06+vec3(0.0,0.3,0.6))))*smoothstep(4.0,0.2,trap);col+=vec3(1.0,0.8,0.9)*exp(-trap*2.5)*0.7;gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'BURNING SHIP', category: 'fractal', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;float zm=pow(2.0,-mod(t*0.4,8.0))*2.6*u_scale;vec2 c=vec2(-1.7533,-0.0257)+vec2(uv.x,-uv.y)*zm;vec2 z=vec2(0.0);float it=0.0;for(int i=0;i<90;i++){z=abs(z);z=vec2(z.x*z.x-z.y*z.y,2.0*z.x*z.y)+c;if(dot(z,z)>16.0)break;it+=1.0;}float si=it-log2(log2(max(dot(z,z),1.0001)))+4.0;float inside=step(89.5,it);vec3 col=(0.5+0.5*cos(6.28318*(si*0.045+t*0.08+vec3(0.0,0.35,0.7))))*(1.0-inside);col+=vec3(1.0,0.6,0.2)*exp(-si*0.18)*(1.0-inside);gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'KALI WEAVE', category: 'fractal', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*1.6*u_scale;vec2 c=vec2(0.85+0.1*sin(t*0.37),0.58+0.1*cos(t*0.43));float acc=0.0;float w=1.0;float trap=1e9;for(int i=0;i<13;i++){p=abs(p)/max(dot(p,p),1e-6)-c;acc+=w*exp(-3.5*abs(length(p)-0.45));trap=min(trap,length(p));w*=0.92;}acc*=0.34;vec3 col=(0.5+0.5*cos(6.28318*(acc*0.6+trap*0.3+t*0.07+vec3(0.0,0.33,0.67))))*acc;col+=vec3(0.9,0.5,1.0)*exp(-trap*4.0)*0.5;gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'NEWTON BASINS', category: 'fractal', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;vec2 cmul(vec2 a,vec2 b){return vec2(a.x*b.x-a.y*b.y,a.x*b.y+a.y*b.x);}vec2 cdiv(vec2 a,vec2 b){return vec2(a.x*b.x+a.y*b.y,a.y*b.x-a.x*b.y)/max(dot(b,b),1e-8);}void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;float ca=cos(t*0.1),sa=sin(t*0.1);vec2 z=mat2(ca,-sa,sa,ca)*uv*2.4*u_scale+vec2(0.001);float it=0.0;for(int i=0;i<24;i++){vec2 z2=cmul(z,z);vec2 f=cmul(z2,z)-vec2(1.0,0.0);if(dot(f,f)<1e-6)break;z-=cdiv(f,3.0*z2);it+=1.0;}float root=mod(floor((atan(z.y,z.x)+3.14159)/2.0944),3.0);vec3 col=0.5+0.5*cos(6.28318*(root/3.0+t*0.05+vec3(0.0,0.33,0.67)));col*=(1.0-it/24.0*0.85)*(0.8+0.2*sin(it*0.7-t*2.0));col+=vec3(1.0)*exp(-it*0.45)*0.3;gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'TRICORN', category: 'fractal', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 z=uv*1.9*u_scale;vec2 c=0.62*vec2(cos(t*0.31),sin(t*0.43));float it=0.0;for(int i=0;i<70;i++){z=vec2(z.x*z.x-z.y*z.y,-2.0*z.x*z.y)+c;if(dot(z,z)>9.0)break;it+=1.0;}float si=it-log2(log2(max(dot(z,z),1.0001)))+4.0;float inside=step(69.5,it);vec3 col=(0.5+0.5*cos(6.28318*(si*0.06+t*0.1+vec3(0.0,0.25,0.55))))*(1.0-inside);col+=vec3(0.12,0.05,0.2)*inside*(0.5+0.5*sin(length(z)*20.0+t*2.0));gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'KIFS TEMPLE', category: 'fractal', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}float sdB(vec2 p,vec2 b){vec2 d=abs(p)-b;return length(max(d,0.0))+min(max(d.x,d.y),0.0);}void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*1.5*u_scale;float sec=1.0472;float a=atan(p.y,p.x);a=mod(a,2.0*sec);a=abs(a-sec);p=vec2(cos(a),sin(a))*length(p);float d=1e9;float g=0.0;mat2 m=rot(0.6+t*0.08);for(int i=0;i<7;i++){p=abs(p)-vec2(0.45+0.06*sin(t*0.5),0.32);p=m*p;float bd=sdB(p,vec2(0.4,0.012));d=min(d,abs(bd));g+=exp(-40.0*abs(bd));}vec3 col=(0.5+0.5*cos(6.28318*(g*0.08+t*0.05+vec3(0.0,0.33,0.67))))*(smoothstep(0.012,0.0,d)+g*0.12);gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'PHOENIX FRACTAL', category: 'fractal', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;vec2 cmul(vec2 a,vec2 b){return vec2(a.x*b.x-a.y*b.y,a.x*b.y+a.y*b.x);}void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 z=vec2(uv.y,uv.x)*1.8*u_scale;vec2 zp=vec2(0.0);float cr=0.5667+0.04*sin(t*0.33);float pr=-0.5+0.04*cos(t*0.41);float it=0.0;for(int i=0;i<60;i++){vec2 nz=cmul(z,z)+vec2(cr,0.0)+pr*zp;zp=z;z=nz;if(dot(z,z)>16.0)break;it+=1.0;}float si=it-log2(log2(max(dot(z,z),1.0001)))+4.0;float inside=step(59.5,it);vec3 col=(0.5+0.5*cos(6.28318*(si*0.05+t*0.07+vec3(0.0,0.33,0.67))))*(1.0-inside);col+=(0.5+0.5*cos(6.28318*(length(zp)*0.3+vec3(0.5,0.8,1.1))))*inside*0.3;gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'LYAPUNOV SPACE', category: 'fractal', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 q=uv*1.4*u_scale+vec2(0.25*sin(t*0.11),0.25*cos(t*0.09));float A=clamp(3.12+q.x*0.85,2.2,4.0);float B=clamp(3.12+q.y*0.85,2.2,4.0);float x=0.5;for(int i=0;i<10;i++){float r=mod(float(i),2.0)<0.5?A:B;x=r*x*(1.0-x);}float ly=0.0;for(int i=0;i<36;i++){float r=mod(float(i),2.0)<0.5?A:B;x=r*x*(1.0-x);ly+=log(abs(r*(1.0-2.0*x))+1e-6);}ly/=36.0;float stab=clamp(-ly*1.6,0.0,1.0);float cha=clamp(ly*2.2,0.0,1.0);vec3 col=mix(vec3(0.08,0.02,0.12),vec3(1.0,0.8,0.25),stab);col=mix(col,vec3(0.15,0.45,0.95),pow(stab,4.0));col=mix(col,vec3(0.02,0.0,0.08),cha);col*=0.85+0.15*sin(ly*30.0+t);gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'ORBIT TRAP GARDEN', category: 'fractal', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;vec2 cmul(vec2 a,vec2 b){return vec2(a.x*b.x-a.y*b.y,a.x*b.y+a.y*b.x);}void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 z=uv*1.8*u_scale;vec2 c=vec2(-0.745+0.05*sin(t*0.37),0.186+0.05*cos(t*0.29));vec2 tc=0.35*vec2(cos(t*0.8),sin(t*0.8));float trC=1e9,trL=1e9;for(int i=0;i<36;i++){z=cmul(z,z)+c;trC=min(trC,abs(length(z-tc)-0.35));trL=min(trL,min(abs(z.x),abs(z.y)));if(dot(z,z)>36.0)break;}vec3 col=(0.5+0.5*cos(6.28318*(trC*1.2+t*0.1+vec3(0.0,0.33,0.67))))*exp(-trC*3.5);col+=vec3(1.0,0.95,0.8)*exp(-trL*8.0)*0.45;col+=vec3(0.3,0.05,0.4)*exp(-trC*0.8)*0.3;gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'DUCKS FRACTAL', category: 'fractal', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*2.2*u_scale+vec2(0.0,-0.3);vec2 c=vec2(-0.62+0.1*sin(t*0.21),0.78+0.1*cos(t*0.27));float acc=0.0;for(int i=0;i<22;i++){p=vec2(p.x,abs(p.y));p=vec2(0.5*log(max(dot(p,p),1e-9)),atan(p.y,p.x))+c;acc+=exp(-length(p)*1.2);}acc*=0.16;vec3 col=0.5+0.5*cos(6.28318*(acc+t*0.05+vec3(0.0,0.4,0.7)));col*=acc*1.4;col+=vec3(0.7,0.3,0.9)*pow(acc,3.0)*0.8;gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'CANTOR VEIL', category: 'fractal', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;float t=u_time*u_speed;vec3 col=vec3(0.01,0.0,0.03);for(int L=0;L<4;L++){float fl=float(L);float x=(uv.x+sin(uv.y*2.5+t*(0.3+fl*0.1))*0.04)*u_scale*pow(2.0,fl)+t*0.05*(fl+1.0);float v=1.0;for(int j=0;j<5;j++){float f=fract(x);v*=smoothstep(0.0,0.045,abs(f-0.5)-0.1667);x*=3.0;}float band=smoothstep(0.0,0.15,uv.y)*smoothstep(1.0,0.55-fl*0.1,uv.y);col+=(0.5+0.5*cos(6.28318*(fl*0.22+t*0.06+vec3(0.0,0.33,0.67))))*v*band*(0.55-fl*0.1);}gl_FragColor=vec4(col*u_intensity,1.0);}` },

  // ---- EXPANSION: PSYCHEDELIC ----
  { name: 'COSMIC MELT', category: 'psychedelic', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float sn(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),f.x),f.y);}float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*sn(p);p*=2.03;a*=0.5;}return v;}void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*2.5*u_scale;p.y+=t*0.12;vec2 q=vec2(fbm(p+vec2(0.0,t*0.3)),fbm(p+vec2(5.2,t*0.2)));vec2 r=vec2(fbm(p+q*2.0+vec2(1.7,9.2)+t*0.15),fbm(p+q*2.0+vec2(8.3,2.8)-t*0.13));float f=fbm(p+r*2.5);float hue=f*1.2+q.x*0.5+t*0.1;vec3 col=(0.5+0.5*cos(6.28318*(hue+vec3(0.0,0.33,0.67))))*(f*f*1.8+0.2);col+=(0.5+0.5*cos(6.28318*(hue+0.5+vec3(0.0,0.33,0.67))))*pow(r.x,3.0)*0.6;gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'EYE OF GOD', category: 'psychedelic', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*1.4*u_scale;float r=length(p);float a=atan(p.y,p.x);float stri=sin(a*12.0+sin(r*10.0-t*2.0))*0.5+sin(a*7.0-t*0.7)*0.3+sin(a*19.0+r*15.0)*0.2;float pp=0.16+0.04*sin(t*1.3);float iris=smoothstep(pp,pp+0.03,r)*smoothstep(0.58,0.5,r);vec3 col=(0.5+0.5*cos(6.28318*(stri*0.13+r*0.8+t*0.05+vec3(0.0,0.33,0.67))))*iris*(0.55+0.45*stri);col+=vec3(1.0,0.8,0.5)*exp(-abs(r-pp)*40.0)*0.8;col+=vec3(0.9,0.95,1.0)*smoothstep(0.05,0.0,length(p-vec2(0.07,0.09))-0.03)*iris;float rays=pow(abs(sin(a*24.0+t*0.3)),8.0)*smoothstep(0.5,0.9,r)*smoothstep(1.4,0.7,r);col+=(0.5+0.5*cos(6.28318*(a/6.28318+t*0.1+vec3(0.0,0.33,0.67))))*rays*0.5;float blink=pow(abs(sin(t*0.35)),24.0);float lid=smoothstep(0.0,0.06,0.62*(1.0-blink)-abs(uv.y*1.4));col*=lid;gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'SERPENT SCALES', category: 'psychedelic', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*6.0*u_scale;p.x+=sin(p.y*0.7+t)*0.7;p.y+=sin(p.x*0.4-t*0.6)*0.3;float row=floor(p.y);float px=p.x+mod(row,2.0)*0.5;float cell=floor(px);vec2 f=vec2(fract(px),fract(p.y));float d=length(f-vec2(0.5,0.0));float dome=clamp(1.0-d*1.6,0.0,1.0);float edge=smoothstep(0.04,0.0,abs(d-0.58));float h=hash(vec2(cell,row));float hue=h*0.25+row*0.04+t*0.12;vec3 col=(0.5+0.5*cos(6.28318*(hue+vec3(0.0,0.33,0.67))))*pow(dome,1.5)*1.2;col+=vec3(1.0)*pow(dome,8.0)*0.5;col+=(0.5+0.5*cos(6.28318*(hue+0.5+vec3(0.0,0.33,0.67))))*edge*0.6;gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'CHROMA STORM', category: 'psychedelic', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}float field(vec2 p,float t){return sin(p.x*3.0+sin(p.y*2.7+t*1.3))+sin(p.y*3.4+sin(p.x*2.2-t));}void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*2.2*u_scale;float r0=length(p);p=rot(1.2*exp(-r0*1.2)*sin(t*0.5))*p;float fr=field(rot(0.06)*p,t);float fg=field(p,t+0.13);float fb=field(rot(-0.06)*p,t+0.26);vec3 col=vec3(fr,fg,fb)*0.25+0.5;col=pow(clamp(col,0.0,1.0),vec3(1.6))*1.5;col+=(0.5+0.5*cos(6.28318*(r0*0.4+t*0.1+vec3(0.0,0.33,0.67))))*exp(-r0*1.5)*0.4;gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'MANDALA BLOOM', category: 'psychedelic', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*1.6*u_scale;float r=length(p);float a=atan(p.y,p.x);vec3 col=vec3(0.0);for(int i=0;i<5;i++){float fi=float(i);float n=5.0+fi*2.0;float dir=mod(fi,2.0)<0.5?1.0:-1.0;float base=0.16+fi*0.14+0.03*sin(t+fi*1.3);float amp=0.05+0.02*sin(t*0.7+fi);float d=abs(r-base-amp*cos(a*n+t*0.4*dir));float v=smoothstep(0.018,0.0,d-0.004)+0.005/(d+0.012);col+=(0.5+0.5*cos(6.28318*(fi*0.17+r*0.3+t*0.07+vec3(0.0,0.33,0.67))))*v*0.5;}col+=vec3(1.0,0.9,0.7)*exp(-r*8.0)*(0.5+0.5*sin(t*2.0));gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'LIQUID RAINBOW', category: 'psychedelic', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float sn(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),f.x),f.y);}float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<4;i++){v+=a*sn(p);p*=2.1;a*=0.5;}return v;}void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*2.0*u_scale;float w=fbm(p*1.5+vec2(t*0.25,t*0.1));float v=sin(p.y*4.0+w*9.0+t)+sin(p.x*3.0-w*7.0-t*0.7);vec3 col=0.5+0.5*cos(v*2.0+w*4.0+t*0.3+vec3(0.0,2.09,4.18));float sheen=pow(0.5+0.5*sin(v*3.0-t*2.0),8.0);col+=vec3(1.0)*sheen*0.5;col*=0.7+0.3*w;gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'FRACTAL PINWHEEL', category: 'psychedelic', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*u_scale;float r=length(p);float a=atan(p.y,p.x);vec2 lp=vec2(log(r+1e-5)*1.2-t*0.4,a*1.90986);lp.y+=lp.x*0.4;vec2 id=floor(lp);vec2 f=fract(lp)-0.5;float h=hash(id);f=rot(h*6.28318+t*(h-0.5)*1.5)*f;float blades=pow(abs(sin(atan(f.y,f.x)*2.0+t*h)),4.0)*smoothstep(0.5,0.1,length(f));vec3 col=(0.5+0.5*cos(6.28318*(h+lp.x*0.08+t*0.06+vec3(0.0,0.33,0.67))))*blades*1.3;col+=(0.5+0.5*cos(6.28318*(lp.x*0.1+vec3(0.5,0.83,1.17))))*0.04/(abs(length(f)-0.42)+0.05);gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'HONEY DRIP', category: 'psychedelic', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float hash(float n){return fract(sin(n)*43758.5453);}float sn(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);float h00=fract(sin(dot(i,vec2(127.1,311.7)))*43758.5453);float h10=fract(sin(dot(i+vec2(1.0,0.0),vec2(127.1,311.7)))*43758.5453);float h01=fract(sin(dot(i+vec2(0.0,1.0),vec2(127.1,311.7)))*43758.5453);float h11=fract(sin(dot(i+vec2(1.0,1.0),vec2(127.1,311.7)))*43758.5453);return mix(mix(h00,h10,f.x),mix(h01,h11,f.x),f.y);}void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;float t=u_time*u_speed;float x=uv.x*7.0*u_scale;float id=floor(x);float f=fract(x);float h=hash(id);float front=1.0-fract(t*0.15*(0.4+h*0.8)+h*7.0)*1.7;float edge=front+sn(vec2(x*2.0,t*0.5))*0.08+(f-0.5)*(f-0.5)*1.2;float fill=smoothstep(0.015,-0.015,uv.y-edge);float hue=0.06+h*0.2+uv.y*0.25+t*0.06;vec3 col=(0.5+0.5*cos(6.28318*(hue+vec3(0.0,0.33,0.67))))*fill;col*=0.6+0.7*pow(1.0-abs(f-0.5)*2.0,2.0);col+=vec3(1.0,0.9,0.6)*pow(max(1.0-abs(f-0.5)*4.0,0.0),6.0)*fill*0.5;col+=vec3(1.0,0.8,0.4)*exp(-abs(uv.y-edge)*60.0)*0.8;gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'ASTRAL JELLY', category: 'psychedelic', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float sn(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),f.x),f.y);}void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*1.5*u_scale;p.y-=0.12;float r=length(p);float a=atan(p.y,p.x);float R=0.42+0.09*sin(a*3.0+t)+0.05*sin(a*7.0-t*1.3)+0.03*sin(a*11.0+t*0.7);float d=r-R;float body=smoothstep(0.02,-0.06,d);float rim=exp(-abs(d)*22.0);float organ=sn(p*6.0+t*0.3)*body;vec3 col=(0.5+0.5*cos(6.28318*(d*0.6+t*0.1+vec3(0.0,0.33,0.67))))*body*(0.25+0.25*sin(d*35.0-t*2.5));col+=(0.5+0.5*cos(6.28318*(0.6+a*0.1+t*0.12+vec3(0.0,0.33,0.67))))*rim*0.9;col+=vec3(0.9,0.5,1.0)*organ*0.35;float tent=0.0;for(int i=0;i<7;i++){float fi=float(i);float tx=(fi/3.0-1.0)*0.33;float wig=sin(p.y*6.0+t*2.0+fi*1.7)*0.07*clamp(-p.y,0.0,1.0);tent+=smoothstep(0.015,0.0,abs(p.x-tx-wig))*smoothstep(0.1,-0.2,p.y+R*0.5);}col+=(0.5+0.5*cos(6.28318*(0.8+t*0.1+vec3(0.0,0.33,0.67))))*tent*0.5;gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'TRIP HEX', category: 'psychedelic', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*2.0*u_scale;for(int i=0;i<3;i++){float r=length(p);float a=atan(p.y,p.x);float sec=0.5236;a=mod(a,2.0*sec);a=abs(a-sec);p=vec2(cos(a),sin(a))*r-vec2(0.45,0.0);p*=1.35;p=rot(t*0.12+float(i)*0.4)*p;}float pat=sin(p.x*8.0+t)+sin(p.y*8.0-t*0.8)+sin(length(p)*12.0-t*2.0);vec3 col=(0.5+0.5*cos(6.28318*(pat*0.12+t*0.08+vec3(0.0,0.33,0.67))))*(0.55+0.45*sin(pat*2.0));col+=vec3(1.0,0.7,0.9)*pow(0.5+0.5*sin(pat*3.0+t),8.0)*0.6;gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'WARP NEXUS', category: 'psychedelic', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*2.0*u_scale;float glow=0.0;for(int i=0;i<4;i++){float fi=float(i);vec2 c=0.55*vec2(cos(t*0.4+fi*1.5708),sin(t*0.31+fi*1.5708));vec2 d=p-c;float r=length(d);p=c+rot(1.6*exp(-r*2.2)*sin(t*0.6+fi))*d;glow+=0.012/(r*r+0.02);}float stripes=sin((p.x+p.y)*9.0+t)+sin((p.x-p.y)*7.0-t*0.7);vec3 col=(0.5+0.5*cos(6.28318*(stripes*0.1+p.x*0.15+t*0.09+vec3(0.0,0.33,0.67))))*(0.5+0.5*stripes*0.5);col+=(0.5+0.5*cos(6.28318*(glow*0.3+t*0.15+vec3(0.5,0.83,1.17))))*glow*0.6;gl_FragColor=vec4(col*u_intensity,1.0);}` },

  // ---- EXPANSION: 3D RAYMARCHED ----
  { name: 'MANDELBULB', category: '3d', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
mat3 rotY(float a){float c=cos(a),s=sin(a);return mat3(c,0,s,0,1,0,-s,0,c);}
float de(vec3 p){p/=u_scale;vec3 z=p;float dr=1.0;float r=0.0;for(int i=0;i<6;i++){r=length(z);if(r>2.0)break;float th=acos(clamp(z.z/max(r,1e-6),-1.0,1.0))*8.0;float ph=atan(z.y,z.x)*8.0;dr=pow(r,7.0)*8.0*dr+1.0;float zr=pow(r,8.0);z=zr*vec3(sin(th)*cos(ph),sin(ph)*sin(th),cos(th))+p;}return 0.5*log(max(r,1e-6))*r/dr*u_scale;}
void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed*0.3;mat3 m=rotY(t);vec3 ro=m*vec3(0.0,0.4,2.6);vec3 rd=m*normalize(vec3(uv,-1.6));float d=0.0;vec3 p=ro;bool hit=false;for(int i=0;i<70;i++){float s=de(p);if(s<0.0015){hit=true;break;}d+=s;p=ro+rd*d;if(d>6.0)break;}vec3 col=vec3(0.01,0.0,0.03);if(hit){float eps=0.002;vec3 n=normalize(vec3(de(p+vec3(eps,0,0))-de(p-vec3(eps,0,0)),de(p+vec3(0,eps,0))-de(p-vec3(0,eps,0)),de(p+vec3(0,0,eps))-de(p-vec3(0,0,eps))));float diff=max(dot(n,normalize(vec3(1,2,2))),0.0);float hue=length(p)*0.7+t*0.25;col=(0.5+0.5*cos(6.28318*(hue+vec3(0.0,0.33,0.67))))*(diff*0.75+0.2);col+=vec3(1.0,0.6,0.9)*pow(1.0-max(dot(n,-rd),0.0),3.0)*0.5;}gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'QUATERNION JULIA', category: '3d', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
vec4 qmul(vec4 a,vec4 b){return vec4(a.x*b.x-dot(a.yzw,b.yzw),a.x*b.yzw+b.x*a.yzw+cross(a.yzw,b.yzw));}
mat3 rotY(float a){float c=cos(a),s=sin(a);return mat3(c,0,s,0,1,0,-s,0,c);}
float de(vec3 p,vec4 c){vec4 z=vec4(p/u_scale,0.0);float dr=1.0;for(int i=0;i<8;i++){dr=2.0*length(z)*dr;z=qmul(z,z)+c;if(dot(z,z)>16.0)break;}float r=length(z);return 0.5*r*log(max(r,1e-6))/max(dr,1e-6)*u_scale;}
void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec4 c=vec4(-0.2+0.25*sin(t*0.43),0.55+0.2*cos(t*0.31),0.2*sin(t*0.27),0.1*cos(t*0.5));mat3 m=rotY(t*0.25);vec3 ro=m*vec3(0.0,0.0,2.5);vec3 rd=m*normalize(vec3(uv,-1.5));float d=0.0;vec3 p=ro;bool hit=false;for(int i=0;i<70;i++){float s=de(p,c);if(s<0.002){hit=true;break;}d+=s;p=ro+rd*d;if(d>6.0)break;}vec3 col=vec3(0.02,0.0,0.04);if(hit){float eps=0.002;vec3 n=normalize(vec3(de(p+vec3(eps,0,0),c)-de(p-vec3(eps,0,0),c),de(p+vec3(0,eps,0),c)-de(p-vec3(0,eps,0),c),de(p+vec3(0,0,eps),c)-de(p-vec3(0,0,eps),c)));float diff=max(dot(n,normalize(vec3(1,2,1))),0.0);float hue=p.x*0.5+p.y*0.4+t*0.12;col=(0.5+0.5*cos(6.28318*(hue+vec3(0.0,0.33,0.67))))*(diff*0.75+0.18);col+=vec3(0.6,0.9,1.0)*pow(1.0-max(dot(n,-rd),0.0),4.0)*0.6;}gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'KLEINIAN CAVE', category: '3d', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
float de(vec3 p){float s=1.0;for(int i=0;i<7;i++){p=-1.0+2.0*fract(0.5*p+0.5);float r2=max(dot(p,p),1e-4);float k=1.15/r2;p*=k;s*=k;}return 0.25*abs(p.y)/s;}
void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec3 ro=vec3(t*0.18,0.12*sin(t*0.4),t*0.13);vec3 rd=normalize(vec3(uv*u_scale,-1.3));float ca=t*0.07;rd=mat3(cos(ca),0,sin(ca),0,1,0,-sin(ca),0,cos(ca))*rd;float d=0.01;vec3 p=ro;float it=0.0;bool hit=false;for(int i=0;i<80;i++){float s=de(p);if(s<0.0012){hit=true;break;}d+=s*0.8;p=ro+rd*d;it+=1.0;if(d>7.0)break;}vec3 col=vec3(0.01,0.0,0.02);if(hit){float ao=1.0-it/80.0;float hue=p.x*0.3+p.z*0.3+d*0.2+t*0.05;col=(0.5+0.5*cos(6.28318*(hue+vec3(0.0,0.33,0.67))))*ao*ao*1.3;col+=vec3(0.9,0.6,1.0)*exp(-d*0.8)*0.25;}col=mix(col,vec3(0.02,0.0,0.05),clamp(d/7.0,0.0,1.0));gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'OCTAHEDRON FOLD', category: '3d', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
mat3 rotY(float a){float c=cos(a),s=sin(a);return mat3(c,0,s,0,1,0,-s,0,c);}
mat3 rotX(float a){float c=cos(a),s=sin(a);return mat3(1,0,0,0,c,-s,0,s,c);}
float de(vec3 p,float t){p/=u_scale;float s=1.0;vec3 off=vec3(1.0,0.62,0.3)*(1.0+0.08*sin(t*0.4));for(int i=0;i<6;i++){p=abs(p);if(p.x<p.y)p.xy=p.yx;if(p.x<p.z)p.xz=p.zx;if(p.y<p.z)p.yz=p.zy;p=p*2.0-off;s*=2.0;}return (length(p)-1.4)/s*u_scale;}
void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed*0.4;mat3 m=rotY(t*0.6)*rotX(t*0.37);vec3 ro=m*vec3(0.0,0.0,2.8);vec3 rd=m*normalize(vec3(uv,-1.5));float d=0.0;vec3 p=ro;float it=0.0;bool hit=false;for(int i=0;i<80;i++){float s=de(p,t);if(s<0.0018){hit=true;break;}d+=s;p=ro+rd*d;it+=1.0;if(d>7.0)break;}vec3 col=vec3(0.02,0.01,0.04);if(hit){float eps=0.003;vec3 n=normalize(vec3(de(p+vec3(eps,0,0),t)-de(p-vec3(eps,0,0),t),de(p+vec3(0,eps,0),t)-de(p-vec3(0,eps,0),t),de(p+vec3(0,0,eps),t)-de(p-vec3(0,0,eps),t)));float diff=max(dot(n,normalize(vec3(1,2,1))),0.0);float ao=1.0-it/80.0;float hue=d*0.25+p.y*0.3+t*0.2;col=(0.5+0.5*cos(6.28318*(hue+vec3(0.0,0.33,0.67))))*(diff*0.7+0.2)*ao;col+=vec3(1.0,0.5,0.8)*pow(1.0-max(dot(n,-rd),0.0),3.0)*0.4;}gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'TWISTED COLUMNS', category: '3d', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float sdBox(vec3 p,vec3 b){vec3 d=abs(p)-b;return length(max(d,0.0))+min(max(d.x,max(d.y,d.z)),0.0);}
float map(vec3 p,float t){vec2 cell=floor((p.xz+1.5)/3.0);float h=hash(cell);vec3 q=p;q.xz=mod(p.xz+1.5,3.0)-1.5;float ang=p.y*(0.4+0.4*h)+t*(0.3+h*0.5);float c=cos(ang),s=sin(ang);q.xz=mat2(c,-s,s,c)*q.xz;return sdBox(q,vec3(0.3*u_scale,20.0,0.3*u_scale))-0.06;}
void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec3 ro=vec3(t*0.5,0.0,t*0.35);float ca=t*0.1;vec3 rd=normalize(vec3(uv,-1.4));rd=mat3(cos(ca),0,sin(ca),0,1,0,-sin(ca),0,cos(ca))*rd;float d=0.0;vec3 p=ro;bool hit=false;for(int i=0;i<80;i++){float s=map(p,t);if(s<0.003){hit=true;break;}d+=s*0.8;p=ro+rd*d;if(d>14.0)break;}vec3 col=vec3(0.02,0.01,0.05);if(hit){float eps=0.004;vec3 n=normalize(vec3(map(p+vec3(eps,0,0),t)-map(p-vec3(eps,0,0),t),map(p+vec3(0,eps,0),t)-map(p-vec3(0,eps,0),t),map(p+vec3(0,0,eps),t)-map(p-vec3(0,0,eps),t)));float diff=max(dot(n,normalize(vec3(1,1.5,1))),0.0);float hue=p.y*0.15+floor((p.x+1.5)/3.0)*0.13+t*0.08;col=(0.5+0.5*cos(6.28318*(hue+vec3(0.0,0.33,0.67))))*(diff*0.7+0.15);col+=vec3(0.4,0.2,0.9)*pow(1.0-max(dot(n,-rd),0.0),2.0)*0.5;}col=mix(col,vec3(0.02,0.01,0.05),clamp(d/14.0,0.0,1.0));gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'METABALL FORGE', category: '3d', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
float smin(float a,float b,float k){float h=clamp(0.5+0.5*(b-a)/k,0.0,1.0);return mix(b,a,h)-k*h*(1.0-h);}
float map(vec3 p,float t){float d=1e9;for(int i=0;i<5;i++){float fi=float(i);vec3 c=vec3(sin(t*0.7+fi*2.1),cos(t*0.5+fi*1.3),sin(t*0.6+fi*2.6)*0.6)*0.55*u_scale;d=smin(d,length(p-c)-(0.28+0.08*sin(t+fi*2.0))*u_scale,0.35);}return d;}
void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec3 ro=vec3(0.0,0.0,3.0);vec3 rd=normalize(vec3(uv,-1.5));float ca=t*0.2;mat3 m=mat3(cos(ca),0,sin(ca),0,1,0,-sin(ca),0,cos(ca));ro=m*ro;rd=m*rd;float d=0.0;vec3 p=ro;bool hit=false;for(int i=0;i<72;i++){float s=map(p,t);if(s<0.002){hit=true;break;}d+=s;p=ro+rd*d;if(d>8.0)break;}vec3 col=vec3(0.015,0.005,0.04)+vec3(0.1,0.02,0.15)*length(uv);if(hit){float eps=0.003;vec3 n=normalize(vec3(map(p+vec3(eps,0,0),t)-map(p-vec3(eps,0,0),t),map(p+vec3(0,eps,0),t)-map(p-vec3(0,eps,0),t),map(p+vec3(0,0,eps),t)-map(p-vec3(0,0,eps),t)));vec3 ld=normalize(vec3(1,2,1.5));float diff=max(dot(n,ld),0.0);float spec=pow(max(dot(reflect(-ld,n),-rd),0.0),48.0);float fres=pow(1.0-max(dot(n,-rd),0.0),3.0);float hue=n.x*0.2+n.y*0.15+t*0.1;col=(0.5+0.5*cos(6.28318*(hue+vec3(0.0,0.33,0.67))))*(diff*0.7+0.15);col+=vec3(1.0)*spec*0.7+vec3(1.0,0.4,0.8)*fres*0.5;}gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'INFINITE LATTICE', category: '3d', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
float sdFrame(vec3 p,vec3 b,float e){p=abs(p)-b;vec3 q=abs(p+e)-e;return min(min(length(max(vec3(p.x,q.y,q.z),0.0))+min(max(p.x,max(q.y,q.z)),0.0),length(max(vec3(q.x,p.y,q.z),0.0))+min(max(q.x,max(p.y,q.z)),0.0)),length(max(vec3(q.x,q.y,p.z),0.0))+min(max(q.x,max(q.y,p.z)),0.0));}
void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec3 ro=vec3(0.35*sin(t*0.3),0.35*cos(t*0.23),t*0.9);float ca=t*0.1;vec3 rd=normalize(vec3(uv,1.4));rd.xy=mat2(cos(ca),-sin(ca),sin(ca),cos(ca))*rd.xy;vec3 col=vec3(0.0);float d=0.05;for(int i=0;i<64;i++){vec3 p=ro+rd*d;vec3 q=mod(p,2.0)-1.0;float s=sdFrame(q,vec3(0.62*u_scale),0.045);float em=exp(-abs(s)*30.0);float hue=floor(p.z*0.5)*0.11+t*0.1;col+=(0.5+0.5*cos(6.28318*(hue+vec3(0.0,0.33,0.67))))*em*exp(-d*0.35)*0.09;d+=max(abs(s)*0.7,0.02);if(d>16.0)break;}gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'HELIX DNA', category: '3d', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
float map(vec3 p,float t,out float kind){float ph=p.y*1.5+t;vec2 dir=vec2(cos(ph),sin(ph));float R=0.55*u_scale;vec2 c1=dir*R;vec2 c2=-dir*R;float d1=length(p.xz-c1)-0.13*u_scale;float d2=length(p.xz-c2)-0.13*u_scale;float proj=dot(p.xz,dir);float perp=dot(p.xz,vec2(-dir.y,dir.x));float ry=mod(p.y,0.7)-0.35;float dr=max(abs(proj)-R,length(vec2(perp,ry))-0.05*u_scale);kind=0.0;float d=d1;if(d2<d){d=d2;kind=1.0;}if(dr<d){d=dr;kind=2.0;}return d;}
void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec3 ro=vec3(0.0,0.0,2.6);vec3 rd=normalize(vec3(uv,-1.5));float ca=t*0.15;mat3 m=mat3(cos(ca),0,sin(ca),0,1,0,-sin(ca),0,cos(ca));ro=m*ro;rd=m*rd;float d=0.0;vec3 p=ro;float kind=0.0;bool hit=false;for(int i=0;i<80;i++){float k;float s=map(p,t,k);if(s<0.003){kind=k;hit=true;break;}d+=s*0.6;p=ro+rd*d;if(d>8.0)break;}vec3 col=vec3(0.01,0.01,0.03);if(hit){float eps=0.004;float k0;vec3 n=normalize(vec3(map(p+vec3(eps,0,0),t,k0)-map(p-vec3(eps,0,0),t,k0),map(p+vec3(0,eps,0),t,k0)-map(p-vec3(0,eps,0),t,k0),map(p+vec3(0,0,eps),t,k0)-map(p-vec3(0,0,eps),t,k0)));float diff=max(dot(n,normalize(vec3(1,1.5,2))),0.0);vec3 base;if(kind<0.5)base=vec3(0.2,0.7,1.0);else if(kind<1.5)base=vec3(1.0,0.3,0.6);else base=0.5+0.5*cos(6.28318*(p.y*0.4+t*0.1+vec3(0.0,0.33,0.67)));col=base*(diff*0.8+0.2);col+=vec3(1.0)*pow(max(dot(reflect(-normalize(vec3(1,1.5,2)),n),-rd),0.0),32.0)*0.5;}gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'POLYTOPE STAR', category: '3d', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
mat3 rotY(float a){float c=cos(a),s=sin(a);return mat3(c,0,s,0,1,0,-s,0,c);}
mat3 rotX(float a){float c=cos(a),s=sin(a);return mat3(1,0,0,0,c,-s,0,s,c);}
float de(vec3 p,float t){float d=0.0;d=max(d,abs(dot(p,normalize(vec3(1.0,1.0,1.0)))));d=max(d,abs(dot(p,normalize(vec3(-1.0,1.0,1.0)))));d=max(d,abs(dot(p,normalize(vec3(1.0,-1.0,1.0)))));d=max(d,abs(dot(p,normalize(vec3(1.0,1.0,-1.0)))));d=max(d,abs(dot(p,normalize(vec3(0.0,0.357,0.934)))));d=max(d,abs(dot(p,normalize(vec3(0.934,0.0,0.357)))));d=max(d,abs(dot(p,normalize(vec3(0.357,0.934,0.0)))));float m=0.5+0.45*sin(t*0.6);return mix(d,length(p),m)-0.85*u_scale;}
void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;mat3 m=rotY(t*0.5)*rotX(t*0.33);vec3 ro=m*vec3(0.0,0.0,2.7);vec3 rd=m*normalize(vec3(uv,-1.5));float d=0.0;vec3 p=ro;bool hit=false;for(int i=0;i<72;i++){float s=de(p,t);if(s<0.002){hit=true;break;}d+=s*0.9;p=ro+rd*d;if(d>7.0)break;}vec3 col=vec3(0.02,0.01,0.04)+vec3(0.08,0.02,0.12)*length(uv);if(hit){float eps=0.003;vec3 n=normalize(vec3(de(p+vec3(eps,0,0),t)-de(p-vec3(eps,0,0),t),de(p+vec3(0,eps,0),t)-de(p-vec3(0,eps,0),t),de(p+vec3(0,0,eps),t)-de(p-vec3(0,0,eps),t)));vec3 ld=normalize(vec3(1,2,1));float diff=max(dot(n,ld),0.0);float spec=pow(max(dot(reflect(-ld,n),-rd),0.0),24.0);float hue=n.x*0.25+n.z*0.2+t*0.12;col=(0.5+0.5*cos(6.28318*(hue+vec3(0.0,0.33,0.67))))*(diff*0.7+0.2)+vec3(1.0)*spec*0.5;col+=vec3(0.5,0.2,1.0)*pow(1.0-max(dot(n,-rd),0.0),3.0)*0.4;}gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'PULSE REACTOR', category: '3d', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec3 ro=vec3(0.0,0.0,2.6);vec3 rd=normalize(vec3(uv,-1.4));float ca=t*0.22;mat3 m=mat3(cos(ca),0,sin(ca),0,1,0,-sin(ca),0,cos(ca));ro=m*ro;rd=m*rd;vec3 col=vec3(0.0);float d=0.3;for(int i=0;i<48;i++){vec3 p=ro+rd*d;float r=length(p);float g=dot(sin(p*3.0*u_scale+t*0.5),cos(p.yzx*3.0*u_scale-t*0.3))*0.12;float sd=r-(0.75+0.22*sin(t*2.0-r*4.5))*u_scale+g;float em=0.018/(abs(sd)+0.045);float hue=r*0.5-t*0.25;col+=(0.5+0.5*cos(6.28318*(hue+vec3(0.0,0.33,0.67))))*em*0.06;col+=vec3(1.0,0.7,0.3)*exp(-r*3.0)*0.012;d+=0.075;if(d>5.0)break;}gl_FragColor=vec4(col*u_intensity,1.0);}` },

  // ---- EXPANSION: SACRED ----
  { name: 'SEED OF LIFE', category: 'sacred', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*2.4*u_scale;float ca=cos(t*0.1),sa=sin(t*0.1);p=mat2(ca,-sa,sa,ca)*p;float R=0.55;float phase=mod(t*0.5,10.0);float fade=smoothstep(10.0,8.5,phase);float v=0.0;for(int i=0;i<7;i++){float fi=float(i);vec2 c=fi<0.5?vec2(0.0):R*vec2(cos((fi-1.0)*1.0472),sin((fi-1.0)*1.0472));float grow=clamp(phase-fi*0.9,0.0,1.0);grow=grow*grow*(3.0-2.0*grow);float d=abs(length(p-c)-R*grow);v+=(smoothstep(0.012,0.0,d)+0.004/(d+0.015))*step(0.01,grow);}v*=fade;float hue=atan(p.y,p.x)/6.28318+length(p)*0.25+t*0.08;vec3 col=(0.5+0.5*cos(6.28318*(hue+vec3(0.0,0.33,0.67))))*v;col+=vec3(0.15,0.05,0.25)*(sin(length(p)*7.0-t*1.5)*0.5+0.5)*(1.0-min(v,1.0))*0.5;gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'MERKABA', category: 'sacred', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
float line2(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0);return length(pa-ba*h);}
vec2 proj(vec3 v,float t){float c=cos(t*0.5),s=sin(t*0.5);v.xz=mat2(c,-s,s,c)*v.xz;float c2=cos(t*0.33),s2=sin(t*0.33);v.yz=mat2(c2,-s2,s2,c2)*v.yz;return v.xy/(v.z*0.22+1.8);}
void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*1.7/u_scale;vec2 a0=proj(vec3(1.0,1.0,1.0),t),a1=proj(vec3(1.0,-1.0,-1.0),t),a2=proj(vec3(-1.0,1.0,-1.0),t),a3=proj(vec3(-1.0,-1.0,1.0),t);vec2 b0=proj(vec3(-1.0,-1.0,-1.0),t),b1=proj(vec3(-1.0,1.0,1.0),t),b2=proj(vec3(1.0,-1.0,1.0),t),b3=proj(vec3(1.0,1.0,-1.0),t);float dA=1e9,dB=1e9;dA=min(dA,line2(p,a0,a1));dA=min(dA,line2(p,a0,a2));dA=min(dA,line2(p,a0,a3));dA=min(dA,line2(p,a1,a2));dA=min(dA,line2(p,a1,a3));dA=min(dA,line2(p,a2,a3));dB=min(dB,line2(p,b0,b1));dB=min(dB,line2(p,b0,b2));dB=min(dB,line2(p,b0,b3));dB=min(dB,line2(p,b1,b2));dB=min(dB,line2(p,b1,b3));dB=min(dB,line2(p,b2,b3));vec3 col=vec3(1.0,0.5,0.15)*(smoothstep(0.018,0.0,dA)+0.006/(dA+0.02));col+=vec3(0.2,0.6,1.0)*(smoothstep(0.018,0.0,dB)+0.006/(dB+0.02));col+=vec3(0.9,0.8,1.0)*exp(-length(p)*3.0)*(0.4+0.3*sin(t*2.0));float ring=abs(length(p)-1.05);col+=(0.5+0.5*cos(6.28318*(t*0.1+vec3(0.0,0.33,0.67))))*0.004/(ring+0.012);gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'TREE OF LIFE', category: 'sacred', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*2.6/max(u_scale,0.1);vec2 pts[10];pts[0]=vec2(0.0,1.05);pts[1]=vec2(0.45,0.72);pts[2]=vec2(-0.45,0.72);pts[3]=vec2(0.45,0.28);pts[4]=vec2(-0.45,0.28);pts[5]=vec2(0.0,0.02);pts[6]=vec2(0.45,-0.42);pts[7]=vec2(-0.45,-0.42);pts[8]=vec2(0.0,-0.68);pts[9]=vec2(0.0,-1.05);vec3 col=vec3(0.01,0.0,0.03);for(int i=0;i<10;i++){for(int j=0;j<10;j++){if(j>i){vec2 a=pts[i],b=pts[j];if(length(a-b)<0.95){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0);float d=length(pa-ba*h);col+=vec3(0.5,0.35,0.8)*smoothstep(0.014,0.0,d)*0.55;float pulse=exp(-pow((h-fract(t*0.25+float(i)*0.13+float(j)*0.07))*6.0,2.0));col+=(0.5+0.5*cos(6.28318*(float(i)*0.1+t*0.1+vec3(0.0,0.33,0.67))))*pulse*exp(-d*70.0)*0.8;}}}float fi=float(i);float nd=length(p-pts[i]);float breathe=0.8+0.2*sin(t*1.5+fi*0.7);col+=(0.5+0.5*cos(6.28318*(fi*0.1+t*0.05+vec3(0.0,0.33,0.67))))*(smoothstep(0.02,0.0,abs(nd-0.13))+exp(-nd*14.0)*0.5)*breathe;}gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'PLATONIC WIRE', category: 'sacred', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
float line2(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0);return length(pa-ba*h);}
void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed*0.4;vec2 p=uv*3.4/max(u_scale,0.1);float PHI=1.618034;vec3 vr[12];vr[0]=vec3(0.0,1.0,PHI);vr[1]=vec3(0.0,1.0,-PHI);vr[2]=vec3(0.0,-1.0,PHI);vr[3]=vec3(0.0,-1.0,-PHI);vr[4]=vec3(1.0,PHI,0.0);vr[5]=vec3(1.0,-PHI,0.0);vr[6]=vec3(-1.0,PHI,0.0);vr[7]=vec3(-1.0,-PHI,0.0);vr[8]=vec3(PHI,0.0,1.0);vr[9]=vec3(-PHI,0.0,1.0);vr[10]=vec3(PHI,0.0,-1.0);vr[11]=vec3(-PHI,0.0,-1.0);float c=cos(t),s=sin(t);mat3 my=mat3(c,0.0,s,0.0,1.0,0.0,-s,0.0,c);float c2=cos(t*0.7),s2=sin(t*0.7);mat3 mx=mat3(1.0,0.0,0.0,0.0,c2,-s2,0.0,s2,c2);vec3 col=vec3(0.005,0.0,0.02);for(int i=0;i<12;i++){for(int j=0;j<12;j++){if(j>i){if(abs(length(vr[i]-vr[j])-2.0)<0.1){vec3 ra=mx*my*vr[i];vec3 rb=mx*my*vr[j];vec2 pa=ra.xy/(ra.z*0.12+1.6);vec2 pb=rb.xy/(rb.z*0.12+1.6);float d=line2(p,pa,pb);float depth=(ra.z+rb.z)*0.25+0.5;col+=(0.5+0.5*cos(6.28318*(depth*0.4+t*0.15+vec3(0.0,0.33,0.67))))*(smoothstep(0.016,0.0,d)+0.004/(d+0.018))*(0.35+0.4*depth);}}}vec3 rv=mx*my*vr[i];vec2 pv=rv.xy/(rv.z*0.12+1.6);col+=vec3(1.0,0.9,0.7)*exp(-length(p-pv)*30.0)*0.7;}gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'ENNEAGRAM', category: 'sacred', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
vec2 pt(float i){float a=i/9.0*6.28318-1.5708;return vec2(cos(a),sin(a));}
vec3 seg(vec2 p,float i,float j,float t){vec2 a=pt(i),b=pt(j);vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0);float d=length(pa-ba*h);vec3 c=(0.5+0.5*cos(6.28318*(i/9.0+t*0.08+vec3(0.0,0.33,0.67))));float pulse=exp(-pow((h-fract(t*0.4+i*0.11))*5.0,2.0));return c*(smoothstep(0.012,0.0,d)*0.6+pulse*exp(-d*60.0)*1.2);}
void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;float ca=cos(t*0.06),sa=sin(t*0.06);vec2 p=mat2(ca,-sa,sa,ca)*uv*2.4/max(u_scale,0.1);vec3 col=vec3(0.01,0.0,0.03);col+=seg(p,1.0,4.0,t)+seg(p,4.0,2.0,t)+seg(p,2.0,8.0,t)+seg(p,8.0,5.0,t)+seg(p,5.0,7.0,t)+seg(p,7.0,1.0,t);col+=seg(p,3.0,6.0,t)+seg(p,6.0,9.0,t)+seg(p,9.0,3.0,t);float ring=abs(length(p)-1.0);col+=(0.5+0.5*cos(6.28318*(atan(p.y,p.x)/6.28318+t*0.1+vec3(0.0,0.33,0.67))))*(smoothstep(0.012,0.0,ring)+0.005/(ring+0.02));for(int i=0;i<9;i++){float fi=float(i)+1.0;float nd=length(p-pt(fi));col+=vec3(1.0,0.95,0.85)*exp(-nd*40.0)*(0.6+0.4*sin(t*2.0+fi));}gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'LABYRINTH MANDALA', category: 'sacred', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*2.0*u_scale;float r=length(p);float a=atan(p.y,p.x);vec3 col=vec3(0.015,0.005,0.03);float wave=fract(t*0.15)*1.4;for(int i=0;i<8;i++){float fi=float(i);float ri=0.14+fi*0.12;float dir=mod(fi,2.0)<0.5?1.0:-1.0;float ga=a*dir+t*(0.08+fi*0.04);float arc=step(0.1,fract(ga*0.95493+fi*0.37));float wall=smoothstep(0.014,0.004,abs(r-ri))*arc;float hl=exp(-abs(ri-wave)*7.0);col+=(0.5+0.5*cos(6.28318*(fi*0.09+t*0.05+vec3(0.0,0.33,0.67))))*wall*(0.45+hl*1.1);}float spoke=smoothstep(0.008,0.0,abs(mod(a+t*0.05,0.7854)-0.3927)*r)*smoothstep(1.1,0.2,r)*step(0.14,r);col+=vec3(0.8,0.6,1.0)*spoke*0.3;col+=vec3(1.0,0.85,0.6)*exp(-r*9.0)*(0.5+0.5*sin(t*1.3));gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'FIBONACCI ROSE', category: 'sacred', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*1.6/max(u_scale,0.1);float ca=cos(t*0.1),sa=sin(t*0.1);p=mat2(ca,-sa,sa,ca)*p;vec3 col=vec3(0.01,0.0,0.02);for(int i=0;i<110;i++){float fi=float(i);float rr=0.095*sqrt(fi);float aa=fi*2.39996+t*0.2;vec2 c=rr*vec2(cos(aa),sin(aa));float d=length(p-c);float sz=0.012+fi*0.0003;float pulse=0.7+0.3*sin(t*2.0-rr*4.0);col+=(0.5+0.5*cos(6.28318*(fi*0.012+t*0.06+vec3(0.0,0.33,0.67))))*(smoothstep(sz,sz*0.2,d)+exp(-d*22.0)*0.25)*pulse;}col+=vec3(1.0,0.9,0.6)*exp(-length(p)*7.0)*0.6;gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'CHAKRA COLUMN', category: 'sacred', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*1.15*u_scale;vec3 col=vec3(0.01,0.0,0.03);float stream=exp(-abs(p.x+0.025*sin(p.y*6.0+t*2.0))*28.0)*(0.5+0.5*sin(p.y*12.0-t*3.5));col+=vec3(0.9,0.95,1.0)*max(stream,0.0)*0.5;for(int i=0;i<7;i++){float fi=float(i);vec2 c=vec2(0.0,(fi/3.0-1.0)*0.78);vec2 q=p-c;float r=length(q);float a=atan(q.y,q.x);float n=3.0+fi;float breathe=0.8+0.2*sin(t*1.2+fi*0.9);float lotus=abs(r-0.085*breathe*(1.0+0.3*cos(a*n+t*(0.4+fi*0.1))));float hue=fi*0.111;vec3 cc=0.5+0.5*cos(6.28318*(hue+vec3(0.0,0.33,0.67)));col+=cc*(smoothstep(0.012,0.0,lotus)+exp(-r*9.0)*0.45)*breathe;}gl_FragColor=vec4(col*u_intensity,1.0);}` },

  // ---- EXPANSION: TILING ----
  { name: 'TRUCHET FLOW', category: 'tiling', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*5.0*u_scale;vec2 id=floor(p);vec2 f=fract(p);float h=hash(id);float o=step(0.5,fract(h*7.13+floor(t*0.3+h*3.0)*0.5));vec2 c1=o<0.5?vec2(0.0):vec2(1.0,0.0);vec2 c2=o<0.5?vec2(1.0):vec2(0.0,1.0);float d1=abs(length(f-c1)-0.5);float d2=abs(length(f-c2)-0.5);float d=min(d1,d2);vec2 cc=d1<d2?c1:c2;float ang=atan(f.y-cc.y,f.x-cc.x);float chk=mod(id.x+id.y,2.0)<0.5?1.0:-1.0;float flow=0.5+0.5*sin(ang*4.0*chk-t*3.0+h*6.28);float ribbon=smoothstep(0.09,0.06,d);float hue=hash(id+cc)*0.4+t*0.08;vec3 col=(0.5+0.5*cos(6.28318*(hue+vec3(0.0,0.33,0.67))))*ribbon*(0.35+0.75*flow);col+=vec3(1.0)*smoothstep(0.02,0.0,d)*flow*0.4;col+=vec3(0.04,0.01,0.08);gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'TRUCHET WEAVE', category: 'tiling', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*4.5*u_scale;p=mat2(0.9659,-0.2588,0.2588,0.9659)*p;vec2 id=floor(p);vec2 f=fract(p)-0.5;float over=mod(id.x+id.y,2.0);float w=0.16;float hd=abs(f.y);float vd=abs(f.x);float hs=smoothstep(w,w-0.03,hd);float vs=smoothstep(w,w-0.03,vd);float hueH=hash(vec2(0.0,id.y))*0.5+t*0.07;float hueV=hash(vec2(id.x,0.0))*0.5+t*0.07+0.45;float sheenH=0.6+0.5*sin(p.x*2.0-t*2.0+id.y);float sheenV=0.6+0.5*sin(p.y*2.0+t*1.7+id.x);vec3 ch=(0.5+0.5*cos(6.28318*(hueH+vec3(0.0,0.33,0.67))))*sheenH*(1.0-smoothstep(0.0,0.25,abs(f.y))*0.5);vec3 cv=(0.5+0.5*cos(6.28318*(hueV+vec3(0.0,0.33,0.67))))*sheenV*(1.0-smoothstep(0.0,0.25,abs(f.x))*0.5);vec3 col=vec3(0.02,0.01,0.05);float shadow=smoothstep(0.3,0.12,max(hd,vd));if(over<0.5){col=mix(col,cv*(1.0-hs*shadow*0.75),vs);col=mix(col,ch,hs);}else{col=mix(col,ch*(1.0-vs*shadow*0.75),hs);col=mix(col,cv,vs);}gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'HEX PULSE TILES', category: 'tiling', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float hexDist(vec2 p){p=abs(p);return max(dot(p,vec2(0.866025,0.5)),p.y);}void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*6.0*u_scale;vec2 r=vec2(1.0,1.7320508);vec2 h2=r*0.5;vec2 a=mod(p,r)-h2;vec2 b=mod(p-h2,r)-h2;vec2 gv=dot(a,a)<dot(b,b)?a:b;vec2 id=p-gv;float h=hash(id);float hd=hexDist(gv);float pulse=0.5+0.5*sin(t*2.0+h*6.28318+length(id)*0.5);float sizeA=0.34+0.1*pulse;float fill=smoothstep(0.02,0.0,hd-sizeA);float border=smoothstep(0.035,0.0,abs(hd-0.46));float hue=h*0.35+length(id)*0.04+t*0.08;vec3 col=(0.5+0.5*cos(6.28318*(hue+vec3(0.0,0.33,0.67))))*fill*(0.35+0.75*pulse);col+=(0.5+0.5*cos(6.28318*(hue+0.5+vec3(0.0,0.33,0.67))))*border*0.8;col+=vec3(0.02,0.01,0.05);gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'QUASICRYSTAL', category: 'tiling', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;float ca=cos(t*0.04),sa=sin(t*0.04);vec2 p=mat2(ca,-sa,sa,ca)*uv*9.0*u_scale;float v=0.0;for(int k=0;k<5;k++){float fk=float(k);vec2 dir=vec2(cos(fk*1.25664),sin(fk*1.25664));v+=cos(dot(p,dir)+t*(0.5+fk*0.1));}float iso=abs(fract(v*0.7)-0.5);float lines=smoothstep(0.12,0.02,iso);vec3 col=(0.5+0.5*cos(6.28318*(v*0.09+t*0.06+vec3(0.0,0.33,0.67))))*(0.25+0.45*(v*0.2+0.5));col+=(0.5+0.5*cos(6.28318*(v*0.05+0.5+t*0.1+vec3(0.0,0.33,0.67))))*lines*0.8;col+=vec3(1.0,0.9,0.8)*smoothstep(4.2,5.0,v)*0.8;gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'PINWHEEL TILES', category: 'tiling', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*4.0*u_scale;vec2 id=floor(p);vec2 f=fract(p)-0.5;float h=hash(id);f=rot(t*(h-0.5)*2.5+h*6.28318)*f;float q1=step(f.y,f.x);float q2=step(-f.x,f.y);float tri=q1+q2*2.0;float e=min(abs(f.x-f.y),abs(f.x+f.y));float border=min(0.5-abs(f.x),0.5-abs(f.y));float hue=h*0.3+tri*0.08+t*0.1;vec3 col=(0.5+0.5*cos(6.28318*(hue+vec3(0.0,0.33,0.67))))*(0.35+tri*0.18);col*=smoothstep(0.0,0.04,border);col+=vec3(1.0)*smoothstep(0.025,0.0,e)*(0.5+0.5*sin(t*2.0+h*9.0))*0.6;gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'TRI MORPH TILES', category: 'tiling', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*5.0*u_scale;p.x+=t*0.15;vec2 q=vec2(p.x+p.y*0.57735,p.y*1.1547);vec2 id=floor(q);vec2 f=fract(q);float up=step(1.0,f.x+f.y);float e=up<0.5?min(min(f.x,f.y),1.0-f.x-f.y):min(min(1.0-f.x,1.0-f.y),f.x+f.y-1.0);float h=hash(id+up*0.37);float pulse=0.5+0.5*sin(t*1.8+h*6.28318);float hue=h*0.4+up*0.12+t*0.07;vec3 col=(0.5+0.5*cos(6.28318*(hue+vec3(0.0,0.33,0.67))))*(0.25+0.75*pulse)*smoothstep(0.0,0.06,e);col+=vec3(1.0,0.95,0.9)*smoothstep(0.05,0.0,e)*pulse*0.45;gl_FragColor=vec4(col*u_intensity,1.0);}` },

  // ---- EXPANSION: FLOW ----
  { name: 'CURL RIVER', category: 'flow', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float sn(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),f.x),f.y);}float psi(vec2 p,float t){float v=0.0,a=0.5;for(int i=0;i<4;i++){v+=a*sn(p+vec2(0.0,t*0.3));p*=2.07;a*=0.5;}return v;}void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*3.0*u_scale;float s0=psi(p,t);float e=0.04;float gx=(psi(p+vec2(e,0.0),t)-psi(p-vec2(e,0.0),t))/(2.0*e);float gy=(psi(p+vec2(0.0,e),t)-psi(p-vec2(0.0,e),t))/(2.0*e);float speed=length(vec2(gy,-gx));float lines=abs(fract(s0*9.0-t*0.6)-0.5);float v=smoothstep(0.22,0.02,lines);vec3 col=(0.5+0.5*cos(6.28318*(s0*0.7+speed*0.25+t*0.05+vec3(0.0,0.33,0.67))))*(0.2+v*1.1);col+=vec3(0.9,0.95,1.0)*pow(speed*0.9,3.0)*0.3;gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'INK BLOOM', category: 'flow', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float sn(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),f.x),f.y);}float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*sn(p);p*=2.13;a*=0.5;}return v;}void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed*0.4;vec2 p=uv*2.2*u_scale;vec2 q=vec2(fbm(p+vec2(t*0.5,0.0)),fbm(p+vec2(3.1,t*0.4)));vec2 r=vec2(fbm(p+q*2.2+vec2(8.4,1.2)+t*0.3),fbm(p+q*2.2+vec2(2.7,6.9)-t*0.25));float ink=fbm(p*1.6+r*2.8);float wisp=pow(ink,2.4);vec3 col=mix(vec3(0.01,0.01,0.04),vec3(0.1,0.18,0.38),smoothstep(0.2,0.65,ink));col=mix(col,vec3(0.55,0.75,0.95),wisp*1.3);col=mix(col,vec3(0.95,0.98,1.0),pow(ink,5.0)*1.5);col+=vec3(0.2,0.1,0.4)*q.x*0.3;gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'MAGNETIC LINES', category: 'flow', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*2.0*u_scale;float phi=0.0;float poles=0.0;for(int i=0;i<3;i++){float fi=float(i);vec2 c=0.55*vec2(cos(t*(0.3+fi*0.1)+fi*2.094),sin(t*(0.23+fi*0.08)+fi*2.094));vec2 m=vec2(cos(t*0.5+fi*2.0),sin(t*0.5+fi*2.0));vec2 d=p-c;float r2=max(dot(d,d),0.003);phi+=dot(m,d)/r2;poles+=0.012/r2;}float v=sin(phi*4.0-t*1.5);float lines=smoothstep(0.75,0.98,abs(v));vec3 col=(0.5+0.5*cos(6.28318*(phi*0.08+t*0.06+vec3(0.0,0.33,0.67))))*(0.15+lines*1.1);col+=vec3(1.0,0.8,0.5)*min(poles,2.0)*0.35;gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'VORTEX STREET', category: 'flow', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*2.0*u_scale;float glow=0.0;for(int i=0;i<6;i++){float fi=float(i);float sgn=mod(fi,2.0)<0.5?1.0:-1.0;vec2 vp=vec2(mod(fi*1.3-t*0.5,4.0)-2.0,sgn*0.32+0.06*sin(t+fi));vec2 d=p-vp;float r=length(d);p=vp+rot(sgn*1.8*exp(-r*r*3.0))*d;glow+=0.004/(r*r+0.01);}float stripes=sin(p.y*11.0+sin(p.x*2.0))+0.5*sin(p.x*5.0-t*0.8);vec3 col=(0.5+0.5*cos(6.28318*(stripes*0.1+p.y*0.12+t*0.05+vec3(0.0,0.33,0.67))))*(0.45+0.4*stripes*0.5);col+=vec3(0.8,0.95,1.0)*glow*0.7;gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'SILK CURRENTS', category: 'flow', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 q=uv*2.0*u_scale;for(int i=0;i<5;i++){float fi=float(i);q=vec2(q.x+0.55*sin(q.y*1.4+t*0.4+fi*1.7),q.y+0.55*cos(q.x*1.2-t*0.33+fi*2.3));}float v=sin(q.x*1.6)+sin(q.y*1.8);float sheen=pow(0.5+0.5*sin(q.x+q.y-t*0.5),7.0);vec3 col=(0.5+0.5*cos(6.28318*(v*0.13+t*0.04+vec3(0.0,0.33,0.67))))*(0.4+0.3*v*0.5+0.3);col+=vec3(1.0,0.97,0.92)*sheen*0.75;col*=0.85+0.15*sin(q.y*3.0);gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'PLASMA DRIFT', category: 'flow', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float sn(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),f.x),f.y);}float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*sn(p);p*=2.02;a*=0.5;}return v;}void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*2.6*u_scale+vec2(t*0.25,sin(t*0.3)*0.2);float r1=1.0-abs(2.0*fbm(p+vec2(0.0,t*0.15))-1.0);float r2=1.0-abs(2.0*fbm(p*2.3-vec2(t*0.2,0.0))-1.0);float fil=pow(r1,4.0)+pow(r2,5.0)*0.5;vec3 col=vec3(0.05,0.0,0.12);col+=vec3(0.25,0.1,0.8)*pow(r1,2.0);col+=(0.5+0.5*cos(6.28318*(fil*0.35+t*0.08+vec3(0.55,0.83,1.1))))*fil*0.9;col+=vec3(0.9,0.85,1.0)*pow(fil,3.5)*0.7;gl_FragColor=vec4(col*u_intensity,1.0);}` },

  // ---- EXPANSION: VOLUMETRIC ----
  { name: 'NEBULA CORE', category: 'volumetric', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
float hash3(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float n3(vec3 p){vec3 i=floor(p);vec3 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(mix(hash3(i),hash3(i+vec3(1,0,0)),f.x),mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x),mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm3(vec3 p){float v=0.0,a=0.5;for(int i=0;i<4;i++){v+=a*n3(p);p*=2.1;a*=0.5;}return v;}
void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed*0.3;vec3 ro=vec3(0.0,0.0,2.4);vec3 rd=normalize(vec3(uv,-1.4));float ca=t*0.3;mat3 m=mat3(cos(ca),0,sin(ca),0,1,0,-sin(ca),0,cos(ca));ro=m*ro;rd=m*rd;vec3 col=vec3(0.0);float alpha=0.0;for(int i=0;i<44;i++){vec3 p=ro+rd*(float(i)*0.09+0.4);float r=length(p);float den=max(fbm3(p*1.3*u_scale+vec3(t*0.5,t*0.3,-t*0.4))-0.42,0.0)*2.2;den*=exp(-r*0.7);float hue=r*0.45+den*0.6-t*0.15;vec3 c=(0.5+0.5*cos(6.28318*(hue+vec3(0.0,0.33,0.67))))*den;col+=c*(1.0-alpha)*0.22;alpha+=den*(1.0-alpha)*0.16;col+=vec3(1.0,0.85,0.6)*exp(-r*4.5)*0.01*(1.0-alpha);if(alpha>0.95)break;}gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'GOD RAYS', category: 'volumetric', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float sn(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),f.x),f.y);}
float cloud(vec2 p,float t){float v=0.0,a=0.5;for(int i=0;i<4;i++){v+=a*sn(p+vec2(t*0.15,0.0));p*=2.1;a*=0.55;}return smoothstep(0.45,0.75,v);}
void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 sun=vec2(0.35*sin(t*0.12),0.42);vec2 p=uv*u_scale;float shaft=0.0;for(int i=0;i<24;i++){float fi=float(i)/24.0;vec2 sp=mix(p,sun,fi);shaft+=(1.0-cloud(sp*3.0,t))*(1.0-fi*0.6);}shaft/=24.0;float d=length(p-sun);float occ=cloud(p*3.0,t);vec3 col=mix(vec3(0.03,0.02,0.08),vec3(0.12,0.06,0.2),uv.y+0.5);col+=vec3(1.0,0.85,0.55)*pow(shaft,2.2)*1.4*exp(-d*0.9);col+=vec3(1.0,0.9,0.7)*0.06/(d+0.04)*(1.0-occ*0.8);col=mix(col,vec3(0.05,0.03,0.1),occ*0.75);gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'EMISSION TUNNEL', category: 'volumetric', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec3 ro=vec3(0.25*sin(t*0.7),0.25*cos(t*0.55),0.0);vec3 rd=normalize(vec3(uv,1.5));vec3 col=vec3(0.0);float d=0.1;for(int i=0;i<48;i++){vec3 p=ro+rd*d;p.z+=t*2.5;float ang=atan(p.y,p.x);float r=length(p.xy);float wall=1.0+0.18*sin(ang*5.0+p.z*1.2)+0.1*sin(p.z*2.0-t);float sd=abs(wall*u_scale-r);float rings=0.6+0.6*sin(p.z*3.5-t*5.0);float em=0.016/(sd+0.05)*rings;float hue=p.z*0.12+ang*0.1-t*0.2;col+=(0.5+0.5*cos(6.28318*(hue+vec3(0.0,0.33,0.67))))*em*exp(-d*0.22)*0.16;d+=0.16;if(d>9.0)break;}gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'STORM CLOUDS', category: 'volumetric', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
float hash3(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float n3(vec3 p){vec3 i=floor(p);vec3 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(mix(hash3(i),hash3(i+vec3(1,0,0)),f.x),mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x),mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm3(vec3 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*n3(p);p*=2.05;a*=0.5;}return v;}
float hash1(float n){return fract(sin(n)*43758.5453);}
void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec3 ro=vec3(0.0,0.0,2.8);vec3 rd=normalize(vec3(uv,-1.5));float fl=step(0.93,hash1(floor(t*4.0)))*(0.5+0.5*hash1(floor(t*4.0)+0.5));vec2 flpos=vec2(hash1(floor(t*4.0)+1.0)-0.5,hash1(floor(t*4.0)+2.0)-0.5)*1.6;vec3 col=vec3(0.0);float alpha=0.0;for(int i=0;i<36;i++){vec3 p=ro+rd*(float(i)*0.11+0.5);float den=max(fbm3(p*u_scale*1.1+vec3(t*0.25,t*0.1,t*0.18))-0.38,0.0)*2.4;vec3 base=mix(vec3(0.04,0.04,0.07),vec3(0.22,0.2,0.28),den);base+=vec3(0.7,0.7,1.0)*fl*exp(-length(p.xy-flpos)*2.2)*den*2.5;col+=base*den*(1.0-alpha)*0.25;alpha+=den*(1.0-alpha)*0.2;if(alpha>0.95)break;}col+=vec3(0.5,0.5,0.8)*fl*0.12;col=mix(vec3(0.02,0.02,0.05),col,clamp(alpha+0.2,0.0,1.0));gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'AURORA VEIL', category: 'volumetric', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec3 ro=vec3(0.0,-0.3,0.0);vec3 rd=normalize(vec3(uv.x,uv.y+0.35,1.2));vec3 col=vec3(0.01,0.01,0.04);for(int i=0;i<40;i++){float d=0.5+float(i)*0.16;vec3 p=ro+rd*d;float w1=sin(p.z*1.3*u_scale+t*0.5)+0.5*sin(p.z*2.7*u_scale-t*0.3)+0.25*sin(p.z*5.1*u_scale+t*0.7);float w2=sin(p.z*1.1*u_scale-t*0.4+2.0)+0.5*sin(p.z*3.1*u_scale+t*0.35);float s1=abs(p.x-w1*0.4);float s2=abs(p.x-w2*0.4-1.1);float band=smoothstep(0.1,0.9,p.y)*smoothstep(3.2,1.2,p.y);float den=(exp(-s1*s1*14.0)+exp(-s2*s2*14.0)*0.7)*band;float hue=0.32+p.y*0.13-den*0.1;vec3 c=0.5+0.5*cos(6.28318*(hue+vec3(0.0,0.33,0.67)));col+=c*den*exp(-d*0.25)*0.05;}col+=vec3(1.0)*step(0.9985,hash(floor(uv*vec2(200.0,120.0))))*0.5;gl_FragColor=vec4(col*u_intensity,1.0);}` },

  // ---- EXPANSION: LIGHT ----
  { name: 'CAUSTIC POOL', category: 'light', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed*0.5;vec2 p=uv*4.0*u_scale+4.0;vec2 i0=p;float c=1.0;float inten=0.005;for(int n=0;n<5;n++){float fn=float(n);float tt=t*(1.0-3.5/(fn+1.0));i0=p+vec2(cos(tt-i0.x)+sin(tt+i0.y),sin(tt-i0.y)+cos(tt+i0.x));c+=1.0/length(vec2(p.x/(sin(i0.x+tt)/inten+1e-6),p.y/(cos(i0.y+tt)/inten+1e-6)));}c/=5.0;c=1.17-pow(abs(c),1.4);float v=pow(abs(c),8.0);vec3 col=vec3(0.0,0.25,0.4)+vec3(v*0.9,v*1.05,v*1.15);col+=vec3(0.0,0.1,0.15)*sin(uv.y*3.0+t);gl_FragColor=vec4(clamp(col,0.0,1.6)*u_intensity,1.0);}` },
  { name: 'THIN FILM', category: 'light', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float sn(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),f.x),f.y);}float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*sn(p);p*=2.08;a*=0.5;}return v;}void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*1.8*u_scale;vec2 q=vec2(fbm(p+vec2(t*0.2,0.0)),fbm(p-vec2(0.0,t*0.17)));float th=fbm(p*1.3+q*1.8+t*0.1);vec3 film=0.5+0.5*cos(th*34.0*vec3(1.0,1.22,1.51)+vec3(0.0,0.8,1.8)+t*0.5);float sweep=pow(0.5+0.5*sin(p.x*1.5+p.y*0.8-t*1.2),5.0);vec3 col=film*(0.45+0.45*th)+vec3(1.0)*sweep*0.35;col*=smoothstep(1.8,0.7,length(uv));gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'DIFFRACTION STAR', category: 'light', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*1.5*u_scale;float r=length(p);float a=atan(p.y,p.x);float spikes=pow(abs(cos(a*3.0+t*0.15)),40.0)+pow(abs(sin(a*3.0+t*0.15)),40.0)*0.6;float star=spikes*exp(-r*2.0)+exp(-r*7.0)*1.4;float rings=0.25/(abs(sin(r*14.0-t*1.6))+0.32)*exp(-r*1.1);vec3 col=(0.5+0.5*cos(6.28318*(r*1.4-t*0.18+vec3(0.0,0.33,0.67))))*rings;col+=vec3(1.0,0.95,0.85)*star;col+=(0.5+0.5*cos(6.28318*(a/6.28318*2.0+r-t*0.1+vec3(0.0,0.33,0.67))))*spikes*exp(-r*1.0)*0.5;gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'LENS FLARE', category: 'light', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 l=0.55*vec2(cos(t*0.3),sin(t*0.21)*0.6);vec2 p=uv*u_scale;float dl=length(p-l);vec3 col=vec3(0.02,0.03,0.07);col+=vec3(1.0,0.9,0.7)*0.1/(dl+0.04);col+=vec3(1.0,0.7,0.4)*exp(-abs(p.y-l.y)*38.0)*exp(-abs(p.x-l.x)*1.6)*0.9;for(int i=0;i<6;i++){float fi=float(i);float k=-0.8+fi*0.4;vec2 gp=l*k;float gr=0.04+fi*0.035;float gd=length(p-gp);float ring=smoothstep(gr,gr*0.75,gd)*(0.5+0.5*smoothstep(gr*0.5,gr,gd));col+=(0.5+0.5*cos(6.28318*(fi*0.16+t*0.05+vec3(0.0,0.33,0.67))))*ring*0.27;}float halo=abs(dl-0.42);col+=(0.5+0.5*cos(6.28318*(dl*1.5+vec3(0.0,0.33,0.67))))*0.012/(halo+0.025);gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'INTERFERENCE RINGS', category: 'light', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*u_scale;float amp=0.0;for(int i=0;i<3;i++){float fi=float(i);vec2 c=0.45*vec2(cos(t*(0.4+fi*0.13)+fi*2.094),sin(t*(0.3+fi*0.11)+fi*2.094));amp+=sin(length(p-c)*42.0-t*4.0);}float I=amp*amp/9.0;vec3 col=(0.5+0.5*cos(6.28318*(amp*0.12+t*0.05+vec3(0.0,0.33,0.67))))*I;col+=vec3(1.0)*pow(I,3.0)*0.4;col+=vec3(0.03,0.02,0.08);gl_FragColor=vec4(col*u_intensity,1.0);}` },

  // ---- EXPANSION: ENERGY ----
  { name: 'TESLA COILS', category: 'energy', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float sn(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),f.x),f.y);}
float arc(vec2 p,float t,float seed){float seg=floor(t*9.0)+seed*37.0;float yb=0.15+0.12*sin(p.x*3.0+seed*5.0);float disp=(sn(vec2(p.x*6.0+seed*13.0,seg))-0.5)*0.34+(sn(vec2(p.x*16.0-seed*7.0,seg*1.7))-0.5)*0.12;float mask=smoothstep(0.68,0.55,abs(p.x));return 0.008/(abs(p.y-yb-disp*mask)+0.009)*mask;}
void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*1.4*u_scale;vec3 col=vec3(0.015,0.01,0.04);float tower=smoothstep(0.05,0.02,abs(abs(p.x)-0.6))*smoothstep(0.2,-0.45,p.y);col+=vec3(0.25,0.3,0.45)*tower;col+=vec3(0.6,0.7,1.0)*(exp(-length(p-vec2(-0.6,0.18))*8.0)+exp(-length(p-vec2(0.6,0.18))*8.0))*(0.7+0.3*sin(t*30.0));col+=vec3(0.55,0.6,1.0)*arc(p,t,1.0);col+=vec3(0.75,0.6,1.0)*arc(p,t*1.13,2.0)*0.8;col+=vec3(0.9,0.9,1.0)*arc(p,t*0.91,3.0)*0.6;col+=vec3(0.3,0.2,0.6)*exp(-abs(p.y-0.15)*2.5)*0.25*(0.6+0.4*sin(t*17.0));gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'PLASMA GLOBE', category: 'energy', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float sn(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),f.x),f.y);}
void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*1.3*u_scale;float r=length(p);float a=atan(p.y,p.x);float R=0.82;vec3 col=vec3(0.02,0.0,0.05);for(int i=0;i<7;i++){float fi=float(i);float ai=hash(vec2(fi,floor(t*1.5)))*6.28318+t*0.3;float wob=(sn(vec2(r*5.0-t*2.5,fi*7.0))-0.5)*1.3*r;float ad=abs(mod(a-ai-wob+3.14159,6.28318)-3.14159)*max(r,0.05);float fil=0.006/(ad+0.007)*smoothstep(R,R*0.85,r)*step(r,R);col+=(0.5+0.5*cos(6.28318*(fi*0.13+t*0.1+vec3(0.55,0.8,1.05))))*fil;col+=vec3(1.0,0.8,1.0)*exp(-abs(r-R)*45.0)*exp(-ad*7.0)*0.8;}col+=vec3(0.9,0.6,1.0)*exp(-r*9.0)*1.3;float shell=abs(r-R);col+=vec3(0.4,0.5,0.9)*0.005/(shell+0.012);col+=vec3(0.1,0.05,0.2)*smoothstep(R,0.0,r)*0.4;gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'ION STREAM', category: 'energy', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*u_scale;vec3 col=vec3(0.01,0.01,0.04);for(int i=0;i<5;i++){float fi=float(i);float yi=(fi/2.0-1.0)*0.42;float path=yi+0.16*sin(p.x*2.2+t*(0.8+fi*0.2)+fi*2.4);float d=abs(p.y-path);float core=0.0035/(d+0.004);float bunch=0.0;for(int j=0;j<3;j++){float fj=float(j);float bx=fract(p.x*0.4-t*(0.35+fi*0.08)+fj*0.333+fi*0.21)-0.5;bunch+=exp(-bx*bx*150.0);}col+=(0.5+0.5*cos(6.28318*(fi*0.16+t*0.06+vec3(0.45,0.7,1.0))))*(core*(0.4+bunch*1.6))*0.55;col+=vec3(1.0)*exp(-d*120.0)*bunch*0.5;}gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'SHOCKWAVE', category: 'energy', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*1.6*u_scale;float r=length(p);float cyc=floor(t*0.45);float wr=fract(t*0.45)*1.9;vec2 dir=r>0.001?p/r:vec2(0.0);vec2 q=p+dir*0.1*exp(-abs(r-wr)*7.0)*sin((r-wr)*30.0);vec2 g=abs(fract(q*4.0)-0.5);float grid=smoothstep(0.06,0.02,min(g.x,g.y))*0.4;float front=exp(-abs(r-wr)*14.0);float flash=exp(-r*3.0)*exp(-fract(t*0.45)*6.0)*2.0;float sparks=0.0;for(int i=0;i<14;i++){float fi=float(i);float sa=hash(vec2(fi,cyc))*6.28318;float sr=wr*(0.75+0.25*hash(vec2(fi,cyc+0.5)));vec2 sp=sr*vec2(cos(sa),sin(sa));sparks+=exp(-length(p-sp)*55.0);}vec3 col=vec3(0.04,0.02,0.08)+(0.5+0.5*cos(6.28318*(r*0.4-t*0.2+vec3(0.0,0.33,0.67))))*grid;col+=vec3(1.0,0.55,0.2)*front*(0.7+0.3*sin(r*40.0-t*8.0));col+=vec3(1.0,0.85,0.6)*flash+vec3(1.0,0.8,0.5)*sparks*0.9;gl_FragColor=vec4(col*u_intensity,1.0);}` },

  // ---- EXPANSION: GLITCH ----
  { name: 'VHS TRACKING', category: 'glitch', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;float t=u_time*u_speed;float band=fract(uv.y+t*0.13);float tb=smoothstep(0.0,0.05,band)*smoothstep(0.12,0.05,band);float jit=(hash(vec2(floor(uv.y*90.0),floor(t*15.0)))-0.5)*0.012;vec2 q=uv;q.x+=tb*0.22*(hash(vec2(floor(t*11.0),1.0))-0.3)+jit;float hue=floor(q.x*6.0*u_scale)/6.0;vec3 colR=0.5+0.5*cos(6.28318*(hue+0.006+t*0.02+vec3(0.0,0.33,0.67)));vec3 colG=0.5+0.5*cos(6.28318*(hue+t*0.02+vec3(0.0,0.33,0.67)));vec3 colB=0.5+0.5*cos(6.28318*(hue-0.006+t*0.02+vec3(0.0,0.33,0.67)));vec3 col=vec3(colR.r,colG.g,colB.b)*(0.6+0.25*sin(q.y*7.0+t));col=mix(col,vec3(hash(q*vec2(310.0,170.0)+t*60.0)),tb*0.8);float head=smoothstep(0.06,0.02,uv.y);col=mix(col,vec3(hash(vec2(uv.x*200.0,floor(t*30.0)))*0.7),head);col*=0.88+0.12*sin(uv.y*u_resolution.y*1.8);col*=1.0-0.25*step(0.992,hash(vec2(floor(t*7.0),3.0)));gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'CRT MELTDOWN', category: 'glitch', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float hash(float n){return fract(sin(n)*43758.5453);}void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;float t=u_time*u_speed;vec2 p=uv*2.0-1.0;p*=1.0+0.22*dot(p,p);vec2 q=p*0.5+0.5;float roll=step(0.6,hash(floor(t*1.4)))*fract(t*1.4);q.y=fract(q.y+roll);float inside=step(abs(p.x),1.0)*step(abs(p.y),1.0);float v=sin(q.x*9.0*u_scale+t*1.5)+sin(q.y*7.0*u_scale-t)+sin((q.x+q.y)*11.0*u_scale+t*0.7);vec3 col=0.5+0.5*cos(v*1.8+t*0.4+vec3(0.0,2.09,4.18));float m=mod(floor(gl_FragCoord.x),3.0);vec3 mask=vec3(step(m,0.5),step(0.5,m)*step(m,1.5),step(1.5,m));col*=mask*2.4+0.15;col*=0.85+0.15*sin(q.y*u_resolution.y*2.0);col*=0.92+0.08*sin(t*55.0);col*=inside*(1.0-0.5*pow(length(p),3.0));col+=vec3(0.07,0.09,0.12)*(1.0-inside);gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'SIGNAL DECAY', category: 'glitch', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float pat(vec2 p,float t){return (0.5+0.5*sin(p.x*8.0+t*1.4))*(0.5+0.5*sin(p.y*6.0-t))+0.5*smoothstep(0.25,0.0,abs(length(p-vec2(0.5))-0.27+0.1*sin(t*0.8)));}
void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;float t=u_time*u_speed;vec2 p=uv*u_scale;float row=floor(uv.y*70.0);float drop=step(0.93,hash(vec2(row,floor(t*6.0))));p.x+=drop*(hash(vec2(row,floor(t*6.0)+0.5))-0.5)*0.25;float v=0.0;float w=1.0;for(int k=0;k<5;k++){v+=pat(p-vec2(float(k)*0.035*(1.0+0.5*sin(t*0.7)),0.0),t)*w;w*=0.55;}v/=2.1;v=mix(v,hash(uv*vec2(210.0,140.0)+floor(t*24.0)),0.13);vec3 col=vec3(v*0.55,v*0.95,v*0.7);col*=1.0-drop*0.55;col*=0.88+0.12*sin(uv.y*u_resolution.y*1.7);col+=vec3(0.0,0.06,0.03);gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'BAD HOLOGRAM', category: 'glitch', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float sn(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),f.x),f.y);}
float body(vec2 p,float t){float r=length(p*vec2(1.0,0.75));return smoothstep(0.02,-0.02,r-0.5-sn(vec2(atan(p.y,p.x)*2.0+10.0,t*0.5))*0.16);}
void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*1.4*u_scale;float slice=step(0.9,hash(vec2(floor(p.y*22.0),floor(t*9.0))));p.x+=slice*(hash(vec2(floor(p.y*22.0),floor(t*9.0)+0.3))-0.5)*0.22;float fl=0.72+0.28*sin(t*43.0)*sin(t*7.3);fl*=1.0-0.55*step(0.94,hash(vec2(floor(t*12.0),2.0)));float bR=body(p-vec2(0.008,0.0),t);float bC=body(p,t);float bB=body(p+vec2(0.008,0.0),t);vec3 col=vec3(bR*0.35,bC*0.95,bB*1.0)*fl;col*=0.6+0.4*sin(uv.y*240.0+t*6.0);col+=vec3(0.2,0.9,1.0)*bC*sn(p*7.0+t*0.4)*0.3*fl;vec2 g=abs(fract(uv*vec2(9.0,5.0)+vec2(0.0,t*0.12))-0.5);col+=vec3(0.05,0.25,0.3)*smoothstep(0.04,0.01,min(g.x,g.y))*(0.4-0.3*bC);gl_FragColor=vec4(col*u_intensity,1.0);}` },

  // ---- EXPANSION: SPACE ----
  { name: 'GALAXY SPIRAL', category: 'space', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;float ca=cos(t*0.06),sa=sin(t*0.06);vec2 p=mat2(ca,-sa,sa,ca)*uv*1.7*u_scale;float r=length(p);float a=atan(p.y,p.x);float arm=cos(a*2.0-log(r+0.04)*4.6);float dens=exp(-r*1.7)*pow(0.5+0.5*arm,2.0);float dust=exp(-r*1.9)*pow(0.5+0.5*cos(a*2.0-log(r+0.04)*4.6-0.55),3.0);vec3 col=mix(vec3(0.35,0.45,0.95),vec3(1.0,0.85,0.6),exp(-r*2.2))*dens*1.6;col-=vec3(0.25,0.2,0.15)*dust;col+=vec3(1.0,0.92,0.75)*exp(-r*7.0)*1.5;vec2 sp=p*14.0;float st=hash(floor(sp));col+=vec3(1.0)*step(0.985,st)*(0.4+0.6*sin(t*3.0+st*40.0))*smoothstep(0.4,0.1,length(fract(sp)-0.5))*(dens*2.5+0.12);col=max(col,0.0)+vec3(0.012,0.01,0.03);gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'PULSAR BEACON', category: 'space', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*1.5*u_scale;float r=length(p);float a=atan(p.y,p.x);float ab=t*1.6;float beam=pow(max(cos(a-ab),0.0),50.0)+pow(max(cos(a-ab+3.14159),0.0),50.0);beam*=exp(-r*0.7)*(1.2+0.5*sin(t*9.0));float ring=exp(-abs(r-fract(t*0.55)*1.7)*11.0)*(1.0-fract(t*0.55));float ring2=exp(-abs(r-fract(t*0.55+0.5)*1.7)*11.0)*(1.0-fract(t*0.55+0.5));vec3 col=vec3(0.01,0.01,0.04);col+=vec3(1.0)*step(0.991,hash(floor(uv*90.0)))*0.5;col+=vec3(0.55,0.7,1.0)*beam;col+=(0.5+0.5*cos(6.28318*(r*0.5-t*0.2+vec3(0.5,0.8,1.1))))*(ring+ring2)*0.9;col+=vec3(0.8,0.9,1.0)*exp(-r*10.0)*(1.4+0.8*sin(t*9.0));gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'ASTEROID FIELD', category: 'space', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
vec2 hash2(vec2 p){return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);}
float sn(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),f.x),f.y);}
void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec3 col=vec3(0.01,0.01,0.035);col+=vec3(1.0)*step(0.993,hash(floor(uv*110.0)))*0.4;for(int L=0;L<3;L++){float fl=float(L);float sc=(2.0+fl*2.0)*u_scale;vec2 p=uv*sc+vec2(t*(0.25+fl*0.18),sin(t*0.1+fl)*0.2);vec2 id=floor(p);vec2 f=fract(p);vec2 j=hash2(id)*0.5+0.25;float sz=(0.1+hash(id+3.7)*0.16)*step(0.35,hash(id+1.3));float d=length(f-j);float rock=smoothstep(sz,sz*0.75,d);float lit=clamp(0.5+(j.x-f.x)*2.5,0.1,1.0);float tex=0.7+0.5*sn((id+f)*9.0);float bright=(0.85-fl*0.25);col=mix(col,vec3(0.42,0.38,0.34)*lit*tex*bright,rock);col+=vec3(1.0,0.95,0.85)*smoothstep(sz*0.4,0.0,d)*step(0.93,hash(id+floor(t*2.0)*0.1))*0.45*rock;}gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'BLACK HOLE', category: 'space', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*1.5*u_scale;float r=length(p);float a=atan(p.y,p.x);float aw=a+0.7/(r+0.12)+t*0.25;float rs=length(vec2(p.x,p.y*3.4));float disk=smoothstep(0.22,0.3,rs)*smoothstep(1.15,0.45,rs);float bands=0.6+0.4*sin(rs*16.0-aw*2.0-t*2.2);float doppler=1.25+0.75*sin(a+0.6);vec3 dc=mix(vec3(1.0,0.45,0.15),vec3(0.7,0.8,1.0),clamp(doppler-0.8,0.0,1.0));vec3 col=dc*disk*bands*doppler*0.85;float photon=exp(-abs(r-0.235)*55.0);col+=vec3(1.0,0.85,0.6)*photon*1.6;col*=smoothstep(0.2,0.225,r);vec2 sp=p+0.35*p/(dot(p,p)+0.12);col+=vec3(1.0)*step(0.992,hash(floor(sp*60.0)))*0.45*smoothstep(0.25,0.4,r);col+=vec3(0.01,0.01,0.03);gl_FragColor=vec4(col*u_intensity,1.0);}` },

  // ---- EXPANSION: CYBER ----
  { name: 'NEURAL NET', category: 'cyber', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
vec2 hash2(vec2 p){return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);}
void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*4.0*u_scale;vec2 id=floor(p);vec2 f=fract(p);vec3 col=vec3(0.01,0.02,0.05);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 g=vec2(float(i),float(j));vec2 o=g+0.5+0.32*sin(t*0.5+6.28318*hash2(id+g))-f;for(int j2=-1;j2<=1;j2++)for(int i2=-1;i2<=1;i2++){if(i2>i||(i2==i&&j2>j)){vec2 g2=vec2(float(i2),float(j2));vec2 o2=g2+0.5+0.32*sin(t*0.5+6.28318*hash2(id+g2))-f;vec2 ba=o2-o;float ll=length(ba);if(ll<1.45){float h=clamp(dot(-o,ba)/dot(ba,ba),0.0,1.0);float d=length(-o-ba*h);float sig=exp(-pow((h-fract(t*0.7+dot(id+g,vec2(0.17,0.31))))*4.0,2.0));col+=vec3(0.1,0.45,0.7)*smoothstep(0.025,0.005,d)*(1.0-ll*0.5)*0.45;col+=vec3(0.4,1.0,0.9)*sig*exp(-d*55.0)*0.6;}}}float nd=length(o);float pulse=0.6+0.4*sin(t*2.5+hash2(id+g).x*9.0);col+=vec3(0.2,0.85,1.0)*exp(-nd*16.0)*pulse;}gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'DATA STREAM 3D', category: 'cyber', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec3 col=vec3(0.0,0.01,0.03);for(int L=0;L<4;L++){float fl=float(L);float z=1.0+fl*1.4;vec2 p=uv*z*u_scale;p.y+=t*(1.6-fl*0.25);float lanes=9.0;float lane=floor(p.x*lanes);float fy=floor(p.y*7.0);float h=hash(vec2(lane,fy));float on=step(0.45,hash(vec2(lane,fy+floor(fl*7.0))));vec2 cell=vec2(fract(p.x*lanes),fract(p.y*7.0));float block=smoothstep(0.45,0.35,abs(cell.x-0.5))*smoothstep(0.48,0.38,abs(cell.y-0.5))*on;float fade=1.0/(z*1.1);float flicker=0.7+0.3*sin(t*9.0+h*40.0);vec3 cc=mix(vec3(0.0,0.9,0.6),vec3(0.3,0.6,1.0),hash(vec2(lane,fl)));col+=cc*block*fade*flicker*(0.4+h*0.6);col+=cc*smoothstep(0.06,0.0,abs(fract(p.x*lanes)-0.5))*0.05*fade;}col*=0.9+0.1*sin(uv.y*u_resolution.y*1.5);gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'FIREWALL', category: 'cyber', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float hexDist(vec2 p){p=abs(p);return max(dot(p,vec2(0.866025,0.5)),p.y);}
void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*5.5*u_scale;vec2 r=vec2(1.0,1.7320508);vec2 h2=r*0.5;vec2 a=mod(p,r)-h2;vec2 b=mod(p-h2,r)-h2;vec2 gv=dot(a,a)<dot(b,b)?a:b;vec2 id=p-gv;float hd=hexDist(gv);float imp=0.0;for(int i=0;i<3;i++){float fi=float(i);float cyc=floor(t*0.8+fi*0.33);vec2 ic=(vec2(hash(vec2(cyc,fi)),hash(vec2(cyc,fi+5.0)))-0.5)*vec2(5.0,3.0);float age=fract(t*0.8+fi*0.33);float rr=age*3.5;imp+=exp(-abs(length(id-ic)-rr)*1.8)*(1.0-age);}float border=smoothstep(0.06,0.015,abs(hd-0.44));vec3 col=vec3(0.0,0.06,0.09);col+=vec3(0.0,0.55,0.6)*border*(0.4+0.3*sin(t*2.0+hash(id)*6.28));col+=vec3(1.0,0.45,0.1)*border*imp*2.2;col+=vec3(1.0,0.25,0.05)*smoothstep(0.4,0.0,hd)*imp*0.55;col+=vec3(0.0,0.3,0.35)*smoothstep(0.4,0.0,hd)*0.12;gl_FragColor=vec4(col*u_intensity,1.0);}` },

  // ---- EXPANSION: AUDIO ----
  { name: 'OSCILLOSCOPE XY', category: 'audio', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*1.3*u_scale;float fx=3.0+floor(mod(t*0.21,4.0));float fy=2.0+floor(mod(t*0.13,3.0));float ph=t*0.5;vec3 col=vec3(0.01,0.03,0.02);vec2 g=abs(fract(p*2.5+0.5)-0.5);col+=vec3(0.0,0.12,0.05)*smoothstep(0.03,0.0,min(g.x,g.y));float glow=0.0;for(int i=0;i<64;i++){float fi=float(i)/64.0;float s=t*1.2-fi*0.55;vec2 c=0.75*vec2(sin(fx*s+ph),sin(fy*s));float d=length(p-c);glow+=exp(-d*90.0)*(1.0-fi)*1.4+exp(-d*18.0)*(1.0-fi)*0.06;}col+=vec3(0.25,1.0,0.45)*glow;col+=vec3(0.7,1.0,0.8)*glow*glow*0.05;gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'CYMATIC PLATE', category: 'audio', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*3.14159*u_scale;float m1=2.0+floor(mod(t*0.3,4.0));float n1=3.0+floor(mod(t*0.19,4.0));float blendK=smoothstep(0.3,0.7,fract(t*0.3));float m2=m1+1.0;float v1=cos(m1*p.x)*cos(n1*p.y)-cos(n1*p.x)*cos(m1*p.y);float v2=cos(m2*p.x)*cos(n1*p.y)-cos(n1*p.x)*cos(m2*p.y);float v=mix(v1,v2,blendK)+0.15*sin(t*2.0)*sin(p.x*2.0)*sin(p.y*2.0);float sand=smoothstep(0.16,0.0,abs(v));vec3 col=vec3(0.03,0.02,0.06);col+=vec3(0.95,0.85,0.6)*sand*(0.7+0.3*sin(length(p)*4.0-t));col+=(0.5+0.5*cos(6.28318*(v*0.2+t*0.05+vec3(0.0,0.33,0.67))))*(1.0-sand)*0.18;col*=smoothstep(3.4,2.4,max(abs(p.x),abs(p.y)));gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'SPECTROGRAM', category: 'audio', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float sn(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),f.x),f.y);}
void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;float t=u_time*u_speed;float freq=uv.y*16.0*u_scale;float time=uv.x*6.0+t*1.4;float e=sn(vec2(time*1.2,freq*0.5))*0.7+sn(vec2(time*3.1,freq*0.23))*0.3;e*=smoothstep(16.0,2.0,freq)*0.8+0.2;float harm=0.3*pow(0.5+0.5*sin(freq*3.5-time*0.8),4.0);e+=harm*sn(vec2(time*2.0,1.0));float beat=pow(0.5+0.5*sin(time*3.14159),8.0)*smoothstep(4.0,0.5,freq);e=clamp(e+beat*0.5,0.0,1.0);vec3 col=vec3(0.02,0.0,0.05);col=mix(col,vec3(0.25,0.0,0.4),smoothstep(0.15,0.4,e));col=mix(col,vec3(0.9,0.2,0.1),smoothstep(0.4,0.65,e));col=mix(col,vec3(1.0,0.85,0.3),smoothstep(0.65,0.85,e));col=mix(col,vec3(1.0),smoothstep(0.85,1.0,e));col*=0.92+0.08*sin(uv.y*u_resolution.y*2.0);gl_FragColor=vec4(col*u_intensity,1.0);}` },

  // ---- EXPANSION: RETRO ----
  { name: 'OUTRUN CHEVRONS', category: 'retro', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*u_scale;vec3 col=mix(vec3(0.12,0.0,0.2),vec3(0.35,0.02,0.25),uv.y+0.5);float sd=length(p-vec2(0.0,0.28));float sun=smoothstep(0.3,0.295,sd);float stripes=step(0.5,fract(p.y*22.0+t*0.5))*smoothstep(0.05,0.2,0.28-p.y);col=mix(col,mix(vec3(1.0,0.85,0.2),vec3(1.0,0.25,0.45),(0.28-p.y)*1.8)*(1.0-stripes*step(p.y,0.28)),sun);float chev=abs(p.x)*1.4-p.y-t*0.9;float band=step(0.5,fract(chev*2.2));float lower=smoothstep(0.1,-0.1,p.y+0.12);vec3 cc=mix(vec3(1.0,0.1,0.5),vec3(0.1,0.9,1.0),band);col=mix(col,cc*(0.5+0.5*fract(chev*2.2)),lower*0.9);col+=vec3(1.0,0.4,0.7)*exp(-abs(p.y+0.12)*30.0)*0.8;col+=vec3(1.0,0.6,0.3)*exp(-sd*3.5)*0.45;gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'LASER ARENA', category: 'retro', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv;vec3 col=vec3(0.02,0.0,0.06);float horiz=abs(p.y);if(abs(p.y)>0.02){float z=0.35/abs(p.y);vec2 gp=vec2(p.x*z,z+t*2.2)*u_scale;vec2 g=abs(fract(gp)-0.5);float line=smoothstep(0.06,0.01,min(g.x,g.y));vec3 gc=p.y<0.0?vec3(1.0,0.1,0.6):vec3(0.1,0.8,1.0);float fade=smoothstep(0.0,0.45,abs(p.y));col+=gc*line*fade*(0.8+0.2*sin(gp.y*3.14159-t*4.0));}col+=vec3(0.9,0.3,1.0)*exp(-horiz*22.0);for(int i=0;i<4;i++){float fi=float(i);float ly=sin(t*(0.7+fi*0.23)+fi*2.4)*0.42;float beam=exp(-abs(p.y-ly)*120.0)*(0.6+0.4*sin(t*8.0+fi*3.0));col+=(0.5+0.5*cos(6.28318*(fi*0.25+t*0.1+vec3(0.0,0.33,0.67))))*beam*0.7;}gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'CHROME RIBBON', category: 'retro', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*u_scale;vec3 col=mix(vec3(0.05,0.0,0.12),vec3(0.16,0.02,0.2),uv.y+0.5);for(int i=0;i<3;i++){float fi=float(i);float yc=sin(p.x*1.6+t*(0.8+fi*0.2)+fi*2.1)*0.22+(fi-1.0)*0.34;float w=0.09;float d=p.y-yc;float band=smoothstep(w,w-0.015,abs(d));float sh=d/w*0.5+0.5;vec3 chrome=mix(vec3(0.15,0.1,0.3),vec3(1.0),pow(abs(sin(sh*3.14159+p.x*2.0-t)),3.0));chrome=mix(chrome,vec3(1.0,0.4,0.7),smoothstep(0.35,0.5,sh)*smoothstep(0.65,0.5,sh)*0.7);float stripe=step(0.5,fract(p.x*9.0+t*1.5+fi*0.3));chrome*=0.75+0.25*stripe;col=mix(col,chrome,band);col+=vec3(0.8,0.5,1.0)*exp(-abs(d)*18.0)*0.18;}gl_FragColor=vec4(col*u_intensity,1.0);}` },

  // ---- EXPANSION: GEOMETRIC ----
  { name: 'SUPERFORMULA', category: 'geometric', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
float superR(float a,float m,float n1,float n2,float n3){float t1=pow(abs(cos(m*a*0.25)),n2);float t2=pow(abs(sin(m*a*0.25)),n3);return pow(max(t1+t2,1e-6),-1.0/n1);}
void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*2.4*u_scale;float r=length(p);float a=atan(p.y,p.x);vec3 col=vec3(0.015,0.01,0.04);for(int i=0;i<3;i++){float fi=float(i);float m=3.0+2.0*floor(mod(t*0.15+fi*0.37,4.0));float n1=mix(0.3,2.5,0.5+0.5*sin(t*0.4+fi*2.0));float n2=mix(0.5,2.0,0.5+0.5*sin(t*0.31+fi));float R=superR(a+t*0.1*(fi-1.0),m,n1,n2,n2)*(0.55+fi*0.22);float d=abs(r-R);col+=(0.5+0.5*cos(6.28318*(fi*0.22+R*0.4+t*0.07+vec3(0.0,0.33,0.67))))*(smoothstep(0.02,0.0,d-0.004)+0.006/(d+0.018))*0.7;}col+=vec3(0.9,0.8,1.0)*exp(-r*5.0)*0.3;gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'LISSAJOUS KNOT', category: 'geometric', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*1.3*u_scale;vec3 col=vec3(0.01,0.01,0.035);float cy=cos(t*0.3),sy=sin(t*0.3);for(int i=0;i<70;i++){float s=float(i)/70.0*6.28318;vec3 k=vec3(sin(3.0*s+t*0.5),sin(4.0*s+t*0.4+1.0),sin(5.0*s+t*0.6+2.0))*0.7;k.xz=mat2(cy,-sy,sy,cy)*k.xz;vec2 q=k.xy/(k.z*0.25+1.4);float d=length(p-q);float depth=k.z*0.5+0.5;col+=(0.5+0.5*cos(6.28318*(float(i)/70.0+t*0.08+vec3(0.0,0.33,0.67))))*exp(-d*60.0)*(0.5+0.6*depth);col+=vec3(1.0)*exp(-d*200.0)*depth*0.4;}gl_FragColor=vec4(col*u_intensity,1.0);}` },

  // ---- EXPANSION: NATURE ----
  { name: 'CORAL REEF', category: 'nature', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float sn(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),f.x),f.y);}
float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*sn(p);p*=2.15;a*=0.5;}return v;}
void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed*0.25;vec2 p=uv*3.2*u_scale;vec2 w=vec2(fbm(p+vec2(t,0.0)),fbm(p+vec2(0.0,t*0.8)+3.0));float v=sin(p.x*5.0+w.x*9.0)+sin(p.y*5.0+w.y*9.0)+sin((p.x+p.y)*3.5-w.x*6.0);float lab=smoothstep(0.35,0.0,abs(v*0.33));float spots=smoothstep(0.55,0.75,fbm(p*2.6+w*3.0+t*0.5));vec3 col=mix(vec3(0.03,0.1,0.16),vec3(0.0,0.25,0.3),uv.y+0.5);col=mix(col,vec3(1.0,0.4,0.3),lab*0.85);col=mix(col,vec3(1.0,0.75,0.3),spots*lab);col=mix(col,vec3(0.65,0.1,0.45),spots*(1.0-lab)*0.7);col+=vec3(0.2,0.5,0.5)*fbm(p*1.3-t)*0.25;gl_FragColor=vec4(col*u_intensity,1.0);}` },
  { name: 'DENDRITE FROST', category: 'nature', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float sn(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),f.x),f.y);}
void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*2.0*u_scale;float r=length(p);float a=atan(p.y,p.x);float sec=0.5236;float af=abs(mod(a,2.0*sec)-sec);vec2 q=vec2(cos(af),sin(af))*r;float ridge=0.0;float amp=0.55;vec2 rp=q*3.0;for(int i=0;i<5;i++){ridge+=amp*(1.0-abs(2.0*sn(rp+t*0.1)-1.0));rp*=2.2;amp*=0.5;}float grow=mod(t*0.22,2.2);float front=smoothstep(grow,grow-0.5,r);float frost=pow(ridge,3.2)*front;float vein=smoothstep(0.06,0.0,q.y*(1.0+r))*front*smoothstep(grow,0.0,r);vec3 col=vec3(0.01,0.03,0.08);col+=vec3(0.45,0.7,0.95)*frost*1.1;col+=vec3(0.85,0.95,1.0)*vein*0.9;col+=vec3(1.0)*pow(frost,3.0)*step(0.93,hash(floor(p*40.0)))*1.5;col+=vec3(0.5,0.8,1.0)*exp(-abs(r-grow)*9.0)*front*0.4;gl_FragColor=vec4(col*u_intensity,1.0);}` },

  // ---- EXPANSION: ORGANIC ----
  { name: 'PHYSARUM VEINS', category: 'organic', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;
vec2 hash2(vec2 p){return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);}
void main(){vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;float t=u_time*u_speed;vec2 p=uv*4.5*u_scale;vec2 n=floor(p);vec2 f=fract(p);float d1=8.0,d2=8.0;vec2 mv=vec2(0.0);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 g=vec2(float(i),float(j));vec2 o=hash2(n+g);o=0.5+0.45*sin(t*0.6+6.2831*o);vec2 r=g+o-f;float d=dot(r,r);if(d<d1){d2=d1;d1=d;mv=r;}else if(d<d2)d2=d;}float edge=sqrt(d2)-sqrt(d1);float vein=smoothstep(0.14,0.0,edge);float flow=0.5+0.5*sin(sqrt(d1)*9.0-t*3.0+atan(mv.y,mv.x));vec3 col=vec3(0.04,0.02,0.01);col+=vec3(0.95,0.75,0.1)*vein*(0.35+0.75*flow);col+=vec3(1.0,0.95,0.5)*smoothstep(0.04,0.0,edge)*flow*0.8;col+=vec3(0.35,0.2,0.04)*smoothstep(0.5,0.0,sqrt(d1))*(1.0-vein)*0.5;gl_FragColor=vec4(col*u_intensity,1.0);}` },
];

const VERTEX_SHADER = `attribute vec2 a_position;void main(){gl_Position=vec4(a_position,0.0,1.0);}`;
const BLEND_MODES = ['add', 'multiply', 'screen', 'normal'];
const RESOLUTIONS = [
  { name: '720p', width: 1280, height: 720 },
  { name: '1080p', width: 1920, height: 1080 },
  { name: '1440p', width: 2560, height: 1440 },
  { name: '4K', width: 3840, height: 2160 },
  { name: 'Square', width: 1080, height: 1080 },
  { name: 'Portrait', width: 1080, height: 1920 },
];

export default function VisualSynthesizer() {
  const canvasRef = useRef(null);
  const glRef = useRef(null);
  const programsRef = useRef({});
  const animationRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const tapCountRef = useRef(0);
  const tapTimerRef = useRef(null);

  const [layers, setLayers] = useState([{ id: 1, shaderIndex: 0, opacity: 1, blendMode: 'add', speed: 0.5, scale: 1, intensity: 1, visible: true }]);
  const [selectedLayer, setSelectedLayer] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const handleCanvasTap = useCallback((e) => {
    // only count taps on the canvas itself, not bubbled from UI buttons
    if (e.target !== canvasRef.current) return;
    tapCountRef.current += 1;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    tapTimerRef.current = setTimeout(() => {
      if (tapCountRef.current >= 3) setShowControls(c => !c);
      tapCountRef.current = 0;
    }, 400);
  }, []);
  const [showShaderPicker, setShowShaderPicker] = useState(false);
  const [resolution, setResolution] = useState(RESOLUTIONS[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showResolutionPicker, setShowResolutionPicker] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [shaderSearch, setShaderSearch] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef(null);
  const recordingCapRef = useRef(null);

  const categories = ['all', ...new Set(SHADERS.map(s => s.category))];

  const createShader = useCallback((gl, type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { console.error('Shader compile failed:', gl.getShaderInfoLog(shader)); gl.deleteShader(shader); return null; }
    return shader;
  }, []);

  const createProgram = useCallback((gl, fragmentSource) => {
    const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    if (!vs || !fs) return null;
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
    return program;
  }, [createShader]);

  const getOrCreateProgram = useCallback((gl, shaderIndex) => {
    if (programsRef.current[shaderIndex] === undefined) {
      const program = createProgram(gl, SHADERS[shaderIndex].fragment);
      if (!program) console.error(`Shader program failed to build: ${SHADERS[shaderIndex].name}`);
      // cache false on failure so broken shaders don't recompile every frame
      programsRef.current[shaderIndex] = program || false;
    }
    return programsRef.current[shaderIndex] || null;
  }, [createProgram]);

  const initGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { antialias: true, preserveDrawingBuffer: true, premultipliedAlpha: false });
    if (!gl) return;
    gl.getExtension('OES_standard_derivatives');
    glRef.current = gl;
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    gl.enable(gl.BLEND);
  }, []);

  const renderFrame = useCallback((layersSnap, isPlayingSnap) => {
    if (!isPlayingSnap) return;
    const gl = glRef.current;
    const canvas = canvasRef.current;
    if (!gl || !canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth * dpr, h = canvas.clientHeight * dpr;
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    const time = (Date.now() - startTimeRef.current) / 1000;
    layersSnap.filter(l => l.visible).forEach(layer => {
      const program = getOrCreateProgram(gl, layer.shaderIndex);
      if (!program) return;
      gl.useProgram(program);
      const posLoc = gl.getAttribLocation(program, 'a_position');
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
      gl.uniform1f(gl.getUniformLocation(program, 'u_time'), time);
      gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), w, h);
      gl.uniform1f(gl.getUniformLocation(program, 'u_speed'), layer.speed);
      gl.uniform1f(gl.getUniformLocation(program, 'u_scale'), layer.scale);
      gl.uniform1f(gl.getUniformLocation(program, 'u_intensity'), layer.intensity * layer.opacity);
      switch(layer.blendMode) {
        case 'add': gl.blendFunc(gl.SRC_ALPHA, gl.ONE); break;
        case 'multiply': gl.blendFunc(gl.DST_COLOR, gl.ZERO); break;
        case 'screen': gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_COLOR); break;
        default: gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      }
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    });
  }, [getOrCreateProgram]);

  const layersRef = useRef(layers);
  const isPlayingRef = useRef(isPlaying);
  useEffect(() => { layersRef.current = layers; }, [layers]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  useEffect(() => {
    initGL();
    const loop = () => { renderFrame(layersRef.current, isPlayingRef.current); animationRef.current = requestAnimationFrame(loop); };
    animationRef.current = requestAnimationFrame(loop);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, []);

  // Dev-only: open with ?verify to compile-check every shader in the library
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has('verify')) return;
    const off = document.createElement('canvas');
    const gl = off.getContext('webgl');
    if (!gl) { console.error('[verify] could not create WebGL context'); return; }
    gl.getExtension('OES_standard_derivatives');
    let failures = 0;
    SHADERS.forEach(s => {
      const fs = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fs, s.fragment);
      gl.compileShader(fs);
      if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        failures++;
        console.error(`[verify] ${s.name} failed:`, gl.getShaderInfoLog(fs));
      }
      gl.deleteShader(fs);
    });
    if (failures === 0) console.log(`All ${SHADERS.length} shaders compiled`);
  }, []);

  const saveImage = useCallback(() => {
    renderFrame(layers, true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.download = `prism-${Date.now()}.png`;
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/png');
  }, [layers, renderFrame]);

  const saveHiRes = useCallback(() => {
    const off = document.createElement('canvas');
    off.width = resolution.width; off.height = resolution.height;
    const gl = off.getContext('webgl', { preserveDrawingBuffer: true, premultipliedAlpha: false });
    if (!gl) return;
    gl.getExtension('OES_standard_derivatives');
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    gl.enable(gl.BLEND);
    gl.viewport(0, 0, resolution.width, resolution.height);
    gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
    const time = (Date.now() - startTimeRef.current) / 1000;
    layers.filter(l => l.visible).forEach(layer => {
      const prog = createProgram(gl, SHADERS[layer.shaderIndex].fragment);
      if (!prog) return;
      gl.useProgram(prog);
      const posLoc = gl.getAttribLocation(prog, 'a_position');
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
      gl.uniform1f(gl.getUniformLocation(prog, 'u_time'), time);
      gl.uniform2f(gl.getUniformLocation(prog, 'u_resolution'), resolution.width, resolution.height);
      gl.uniform1f(gl.getUniformLocation(prog, 'u_speed'), layer.speed);
      gl.uniform1f(gl.getUniformLocation(prog, 'u_scale'), layer.scale);
      gl.uniform1f(gl.getUniformLocation(prog, 'u_intensity'), layer.intensity * layer.opacity);
      switch(layer.blendMode) {
        case 'add': gl.blendFunc(gl.SRC_ALPHA, gl.ONE); break;
        case 'multiply': gl.blendFunc(gl.DST_COLOR, gl.ZERO); break;
        case 'screen': gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_COLOR); break;
        default: gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      }
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    });
    off.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.download = `prism-${resolution.name}-${Date.now()}.png`;
      a.href = url;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
      setShowResolutionPicker(false);
    }, 'image/png');
  }, [layers, resolution, createProgram]);

  const clearRecordingTimers = useCallback(() => {
    if (recordingTimerRef.current) { clearInterval(recordingTimerRef.current); recordingTimerRef.current = null; }
    if (recordingCapRef.current) { clearTimeout(recordingCapRef.current); recordingCapRef.current = null; }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
  }, []);

  const startRecording = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    try {
      const stream = canvas.captureStream(30);
      const opts = { mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm;codecs=vp8', videoBitsPerSecond: 8000000 };
      const mr = new MediaRecorder(stream, opts);
      mediaRecorderRef.current = mr;
      recordedChunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) recordedChunksRef.current.push(e.data); };
      mr.onstop = () => {
        clearRecordingTimers();
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.download = `prism-video-${Date.now()}.webm`; a.href = url;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        recordedChunksRef.current = [];
        setIsRecording(false);
        setRecordingSeconds(0);
      };
      // e.g. tab backgrounded mid-recording: drop the recording and reset
      mr.onerror = () => {
        clearRecordingTimers();
        recordedChunksRef.current = [];
        setIsRecording(false);
        setRecordingSeconds(0);
      };
      mr.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000);
      // safety net: hard cap at 5 minutes so a forgotten recording can't eat memory
      recordingCapRef.current = setTimeout(stopRecording, 5 * 60 * 1000);
    } catch(e) { alert('Recording failed: ' + e.message); }
  }, [clearRecordingTimers, stopRecording]);

  const randomizeLayer = useCallback((index) => {
    const rnd = (a, b) => a + Math.random() * (b - a);
    updateLayer(index, {
      shaderIndex: Math.floor(Math.random() * SHADERS.length),
      opacity: rnd(0.3, 1.0), speed: rnd(0.1, 1.8),
      scale: rnd(0.3, 2.5), intensity: rnd(0.5, 2.0),
      blendMode: BLEND_MODES[Math.floor(Math.random() * BLEND_MODES.length)]
    });
  }, []);

  const randomizeAll = useCallback(() => {
    const rnd = (a, b) => a + Math.random() * (b - a);
    setLayers(prev => prev.map(l => ({
      ...l,
      shaderIndex: Math.floor(Math.random() * SHADERS.length),
      opacity: rnd(0.3, 1.0), speed: rnd(0.1, 1.8),
      scale: rnd(0.3, 2.5), intensity: rnd(0.5, 2.0),
      blendMode: BLEND_MODES[Math.floor(Math.random() * BLEND_MODES.length)]
    })));
  }, []);

  const addLayer = () => {
    const newId = Math.max(...layers.map(l => l.id)) + 1;
    setLayers(prev => [...prev, { id: newId, shaderIndex: Math.floor(Math.random() * SHADERS.length), opacity: 0.7, blendMode: 'add', speed: 0.5, scale: 1, intensity: 1, visible: true }]);
    setSelectedLayer(layers.length);
  };

  const removeLayer = (index) => {
    if (layers.length <= 1) return;
    const nl = layers.filter((_, i) => i !== index);
    setLayers(nl);
    setSelectedLayer(Math.min(selectedLayer, nl.length - 1));
  };

  const updateLayer = (index, updates) => {
    setLayers(prev => { const nl = [...prev]; nl[index] = { ...nl[index], ...updates }; return nl; });
  };

  const currentLayer = layers[selectedLayer] || layers[0];
  const filteredShaders = SHADERS.filter(s =>
    (filterCategory === 'all' || s.category === filterCategory) &&
    s.name.toLowerCase().includes(shaderSearch.trim().toLowerCase())
  );

  const topBarStyle = { position: 'fixed', top: 0, left: 0, right: 0, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(rgba(0,0,0,0.8), transparent)', transition: 'opacity 0.3s', opacity: showControls ? 1 : 0, pointerEvents: showControls ? 'auto' : 'none' };
  const btnStyle = { background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 12, cursor: 'pointer' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', fontFamily: "'SF Pro Display', -apple-system, sans-serif", touchAction: 'none', userSelect: 'none' }}>
      <canvas ref={canvasRef} onClick={handleCanvasTap} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />


      {/* Top Bar */}
      <div style={topBarStyle}>
        <div style={{ color: '#fff', fontSize: 14, fontWeight: 600, letterSpacing: 1 }}>PRISM</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => setIsPlaying(p => !p)} style={btnStyle}>{isPlaying ? '⏸' : '▶'}</button>
          <button onClick={randomizeAll} style={{ ...btnStyle, background: 'rgba(255,200,100,0.25)', color: '#ffd' }}>🎲 all</button>
          <button onClick={saveImage} style={btnStyle}>📷</button>
          <button onClick={() => isRecording ? stopRecording() : startRecording()} style={{ ...btnStyle, background: isRecording ? 'rgba(255,60,60,0.35)' : 'rgba(255,255,255,0.15)', color: isRecording ? '#f88' : '#fff', fontVariantNumeric: 'tabular-nums' }}>{isRecording ? `⏺ ${Math.floor(recordingSeconds / 60)}:${String(recordingSeconds % 60).padStart(2, '0')}` : '🎥'}</button>
          <button onClick={() => setShowResolutionPicker(true)} style={btnStyle}>{resolution.name}</button>
        </div>
      </div>

      {/* Bottom Controls */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.95))', padding: '20px 16px', paddingBottom: 'max(20px, env(safe-area-inset-bottom))', transition: 'opacity 0.3s', opacity: showControls ? 1 : 0, pointerEvents: showControls ? 'auto' : 'none' }}>
        {/* Layer Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, overflowX: 'auto', paddingBottom: 4 }}>
          {layers.map((layer, i) => (
            <button key={layer.id} onClick={() => setSelectedLayer(i)} style={{ background: i === selectedLayer ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: '8px 14px', color: '#fff', fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap', opacity: layer.visible ? 1 : 0.45, flexShrink: 0 }}>
              {SHADERS[layer.shaderIndex].name.slice(0, 11)}
            </button>
          ))}
          <button onClick={addLayer} style={{ background: 'rgba(100,200,255,0.2)', border: 'none', borderRadius: 8, padding: '8px 14px', color: '#6cf', fontSize: 11, cursor: 'pointer', flexShrink: 0 }}>+ ADD</button>
        </div>

        {/* Current Layer */}
        <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: 14 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
            <button onClick={() => setShowShaderPicker(true)} style={{ flex: 1, background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 12, cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, display: 'block', marginBottom: 2 }}>{SHADERS[currentLayer.shaderIndex].category}</span>
              {SHADERS[currentLayer.shaderIndex].name} ▾
            </button>
            <button onClick={() => randomizeLayer(selectedLayer)} style={{ background: 'rgba(255,200,100,0.2)', border: 'none', borderRadius: 8, padding: '10px 11px', color: '#ffd', fontSize: 13, cursor: 'pointer' }}>🎲</button>
            <button onClick={() => updateLayer(selectedLayer, { visible: !currentLayer.visible })} style={{ background: currentLayer.visible ? 'rgba(80,255,120,0.2)' : 'rgba(255,80,80,0.2)', border: 'none', borderRadius: 8, padding: '10px 11px', color: '#fff', fontSize: 13, cursor: 'pointer' }}>{currentLayer.visible ? '👁' : '🙈'}</button>
            {layers.length > 1 && <button onClick={() => removeLayer(selectedLayer)} style={{ background: 'rgba(255,80,80,0.2)', border: 'none', borderRadius: 8, padding: '10px 11px', color: '#f66', fontSize: 13, cursor: 'pointer' }}>✕</button>}
          </div>

          {[
            { label: 'Opacity', key: 'opacity', min: 0, max: 1, step: 0.01 },
            { label: 'Speed', key: 'speed', min: 0, max: 2, step: 0.01 },
            { label: 'Scale', key: 'scale', min: 0.1, max: 3, step: 0.01 },
            { label: 'Intensity', key: 'intensity', min: 0, max: 2, step: 0.01 },
          ].map(({ label, key, min, max, step }) => (
            <div key={key} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10 }}>{label}</span>
                <span style={{ color: '#fff', fontSize: 10 }}>{currentLayer[key].toFixed(2)}</span>
              </div>
              <input type="range" min={min} max={max} step={step} value={currentLayer[key]} onChange={e => updateLayer(selectedLayer, { [key]: parseFloat(e.target.value) })} style={{ width: '100%', accentColor: '#c678ff' }} />
            </div>
          ))}

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {BLEND_MODES.map(mode => (
              <button key={mode} onClick={() => updateLayer(selectedLayer, { blendMode: mode })} style={{ background: currentLayer.blendMode === mode ? 'rgba(198,120,255,0.35)' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 6, padding: '5px 11px', color: '#fff', fontSize: 10, cursor: 'pointer', textTransform: 'uppercase' }}>{mode}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Shader Picker */}
      {showShaderPicker && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.97)', zIndex: 300, overflow: 'auto' }}>
          <div style={{ padding: '16px', paddingTop: 'max(16px, env(safe-area-inset-top))' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>Select Visual</span>
              <button onClick={() => setShowShaderPicker(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>✕</button>
            </div>
            <input
              type="search"
              placeholder="Search shaders…"
              value={shaderSearch}
              onChange={e => setShaderSearch(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none', marginBottom: 12 }}
            />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
              {categories.map(cat => (
                <button key={cat} onClick={() => setFilterCategory(cat)} style={{ background: filterCategory === cat ? 'rgba(198,120,255,0.35)' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 6, padding: '5px 11px', color: '#fff', fontSize: 11, cursor: 'pointer', textTransform: 'capitalize' }}>{cat}</button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
              {filteredShaders.map(shader => {
                const idx = SHADERS.indexOf(shader);
                return (
                  <button key={idx} onClick={() => { updateLayer(selectedLayer, { shaderIndex: idx }); setShowShaderPicker(false); }} style={{ background: currentLayer.shaderIndex === idx ? 'rgba(198,120,255,0.3)' : 'rgba(255,255,255,0.08)', border: currentLayer.shaderIndex === idx ? '1px solid rgba(198,120,255,0.6)' : '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 12, color: '#fff', cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, lineHeight: 1.2 }}>{shader.name}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'capitalize' }}>{shader.category}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Resolution Picker */}
      {showResolutionPicker && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, width: 280 }}>
            <div style={{ color: '#fff', fontSize: 15, fontWeight: 600, marginBottom: 14, textAlign: 'center' }}>Export Resolution</div>
            <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
              {RESOLUTIONS.map(res => (
                <button key={res.name} onClick={() => setResolution(res)} style={{ background: resolution.name === res.name ? 'rgba(198,120,255,0.3)' : 'rgba(255,255,255,0.08)', border: resolution.name === res.name ? '1px solid rgba(198,120,255,0.5)' : '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '11px 14px', color: '#fff', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{res.name}</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{res.width}×{res.height}</span>
                </button>
              ))}
            </div>
            <button onClick={saveHiRes} style={{ width: '100%', background: 'linear-gradient(135deg, #c678ff, #6cf)', border: 'none', borderRadius: 8, padding: 13, color: '#000', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 8 }}>Save {resolution.name} Image</button>
            <button onClick={() => setShowResolutionPicker(false)} style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, padding: 11, color: '#aaa', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

    </div>
  );
}

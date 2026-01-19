import React, { useState, useEffect, useRef, useCallback } from 'react';

// ============================================
// SHADER LIBRARY - 40 base visuals
// ============================================
const SHADERS = [
  { name: 'PLASMA WAVE', category: 'organic', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=(uv*2.0-1.0)*u_scale;p.x*=u_resolution.x/u_resolution.y;float t=u_time*u_speed;float v=sin(p.x*10.0+t)+sin((p.y*10.0+t)*0.5)+sin((p.x*10.0+p.y*10.0+t)*0.5)+sin(sqrt(p.x*p.x+p.y*p.y)*10.0+t);vec3 col=vec3(sin(v*3.14159+t)*0.5+0.5,sin(v*3.14159+t+2.094)*0.5+0.5,sin(v*3.14159+t+4.188)*0.5+0.5)*u_intensity;gl_FragColor=vec4(col,1.0);}` },
  { name: 'FRACTAL TUNNEL', category: 'geometric', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=(uv-0.5)*u_scale;p.x*=u_resolution.x/u_resolution.y;float a=atan(p.y,p.x);float r=length(p);float t=u_time*u_speed;float z=fract(1.0/r-t);float spiral=fract(a/6.28318+t*0.1+z*2.0);vec3 col=(0.5+0.5*cos(6.28318*(z+vec3(0.0,0.33,0.67))))*smoothstep(0.0,0.02,abs(spiral-0.5)-0.2)*z*2.0*u_intensity;col+=0.1*vec3(0.3,0.1,0.5)/r;gl_FragColor=vec4(col,1.0);}` },
  { name: 'NEON GRID', category: 'retro', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=uv-0.5;p.x*=u_resolution.x/u_resolution.y;float t=u_time*u_speed;float z=1.0/(1.0-uv.y+0.1);vec2 gp=vec2(p.x*z,z-t*5.0)*u_scale;vec2 g=abs(fract(gp*0.5-0.5)-0.5)/fwidth(gp*0.5);float line=1.0-min(min(g.x,g.y),1.0);vec3 col=vec3(1.0,0.0,0.5)*line*0.5*u_intensity+vec3(0.0,1.0,1.0)*line*smoothstep(0.8,0.2,uv.y)*u_intensity+vec3(0.1,0.0,0.2)*(1.0-uv.y);float sun=smoothstep(0.3,0.28,length(p-vec2(0.0,0.2)));col+=vec3(1.0,0.3,0.1)*sun+vec3(1.0,0.8,0.0)*smoothstep(0.28,0.1,length(p-vec2(0.0,0.2)));gl_FragColor=vec4(col,1.0);}` },
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
  { name: 'WORMHOLE', category: 'space', fragment: `precision highp float;uniform float u_time,u_speed,u_scale,u_intensity;uniform vec2 u_resolution;void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=(uv-0.5)*u_scale;p.x*=u_resolution.x/u_resolution.y;float t=u_time*u_speed;float r=length(p);float a=atan(p.y,p.x);float warp=1.0/(r+0.1);float spiral=sin(a*5.0+warp*3.0-t*2.0);vec3 col=vec3(0.0);float tunnel=smoothstep(0.0,0.5,r)*smoothstep(1.0,0.3,r);col+=(0.5+0.5*cos(warp+t+vec3(0.0,2.0,4.0)))*tunnel*(spiral*0.5+0.5)*u_intensity;col=mix(col,vec3(0.0),smoothstep(0.15,0.0,r));col+=vec3(1.0,0.5,0.2)*smoothstep(0.02,0.0,abs(r-0.15))*u_intensity;gl_FragColor=vec4(col,1.0);}` }
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
  
  const [layers, setLayers] = useState([{ id: 1, shaderIndex: 0, opacity: 1, blendMode: 'add', speed: 0.5, scale: 1, intensity: 1, visible: true }]);
  const [selectedLayer, setSelectedLayer] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [showShaderPicker, setShowShaderPicker] = useState(false);
  const [resolution, setResolution] = useState(RESOLUTIONS[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showResolutionPicker, setShowResolutionPicker] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');

  const categories = ['all', ...new Set(SHADERS.map(s => s.category))];

  const createShader = useCallback((gl, type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); return null; }
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
    if (!programsRef.current[shaderIndex]) {
      programsRef.current[shaderIndex] = createProgram(gl, SHADERS[shaderIndex].fragment);
    }
    return programsRef.current[shaderIndex];
  }, [createProgram]);

  const initGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { antialias: true, preserveDrawingBuffer: true, premultipliedAlpha: false });
    if (!gl) return;
    glRef.current = gl;
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    gl.enable(gl.BLEND);
  }, []);

  const render = useCallback(() => {
    if (!isPlaying) { animationRef.current = requestAnimationFrame(render); return; }
    const gl = glRef.current;
    const canvas = canvasRef.current;
    if (!gl || !canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth * dpr;
    const height = canvas.clientHeight * dpr;
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; gl.viewport(0, 0, width, height); }
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    const time = (Date.now() - startTimeRef.current) / 1000;
    layers.filter(l => l.visible).forEach((layer, index) => {
      const program = getOrCreateProgram(gl, layer.shaderIndex);
      if (!program) return;
      gl.useProgram(program);
      const posLoc = gl.getAttribLocation(program, 'a_position');
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
      gl.uniform1f(gl.getUniformLocation(program, 'u_time'), time);
      gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), width, height);
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
    animationRef.current = requestAnimationFrame(render);
  }, [layers, isPlaying, getOrCreateProgram]);

  useEffect(() => { initGL(); render(); return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); }; }, []);
  useEffect(() => { if (animationRef.current) cancelAnimationFrame(animationRef.current); render(); }, [layers, isPlaying]);

  const saveImage = useCallback(() => {
    const canvas = canvasRef.current;
    const gl = glRef.current;
    if (!canvas || !gl) return;
    
    // Force a render to ensure canvas has current frame
    const time = (Date.now() - startTimeRef.current) / 1000;
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    layers.filter(l => l.visible).forEach((layer) => {
      const program = getOrCreateProgram(gl, layer.shaderIndex);
      if (!program) return;
      gl.useProgram(program);
      const posLoc = gl.getAttribLocation(program, 'a_position');
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
      gl.uniform1f(gl.getUniformLocation(program, 'u_time'), time);
      gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), canvas.width, canvas.height);
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
    
    // Now capture
    try {
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `prism-${Date.now()}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (e) {
      // Fallback for some browsers
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `prism-${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [layers, getOrCreateProgram]);

  const saveHiRes = useCallback(() => {
    const offscreen = document.createElement('canvas');
    offscreen.width = resolution.width;
    offscreen.height = resolution.height;
    const gl = offscreen.getContext('webgl', { preserveDrawingBuffer: true, premultipliedAlpha: false, antialias: true });
    if (!gl) { alert('Could not create WebGL context for export'); return; }
    
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    gl.enable(gl.BLEND);
    gl.viewport(0, 0, resolution.width, resolution.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    const time = (Date.now() - startTimeRef.current) / 1000;
    
    layers.filter(l => l.visible).forEach((layer) => {
      const program = createProgram(gl, SHADERS[layer.shaderIndex].fragment);
      if (!program) return;
      gl.useProgram(program);
      const posLoc = gl.getAttribLocation(program, 'a_position');
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
      gl.uniform1f(gl.getUniformLocation(program, 'u_time'), time);
      gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), resolution.width, resolution.height);
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
    
    try {
      offscreen.toBlob((blob) => {
        if (!blob) { alert('Failed to create image'); return; }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `prism-${resolution.name}-${Date.now()}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setShowResolutionPicker(false);
      }, 'image/png');
    } catch (e) {
      const dataUrl = offscreen.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `prism-${resolution.name}-${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowResolutionPicker(false);
    }
  }, [layers, resolution, createProgram]);

  const addLayer = () => {
    const newId = Math.max(...layers.map(l => l.id)) + 1;
    setLayers([...layers, { id: newId, shaderIndex: Math.floor(Math.random() * SHADERS.length), opacity: 0.7, blendMode: 'add', speed: 0.5, scale: 1, intensity: 1, visible: true }]);
    setSelectedLayer(layers.length);
  };

  const removeLayer = (index) => {
    if (layers.length <= 1) return;
    const newLayers = layers.filter((_, i) => i !== index);
    setLayers(newLayers);
    setSelectedLayer(Math.min(selectedLayer, newLayers.length - 1));
  };

  const updateLayer = (index, updates) => {
    const newLayers = [...layers];
    newLayers[index] = { ...newLayers[index], ...updates };
    setLayers(newLayers);
  };

  const currentLayer = layers[selectedLayer] || layers[0];
  const filteredShaders = filterCategory === 'all' ? SHADERS : SHADERS.filter(s => s.category === filterCategory);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', fontFamily: "'SF Pro Display', -apple-system, sans-serif", touchAction: 'none', userSelect: 'none' }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
      
      {/* Top Bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: showControls ? 'linear-gradient(rgba(0,0,0,0.8), transparent)' : 'none', opacity: showControls ? 1 : 0, transition: 'opacity 0.3s', pointerEvents: showControls ? 'auto' : 'none' }}>
        <div style={{ color: '#fff', fontSize: 14, fontWeight: 600, letterSpacing: 1 }}>PRISM</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setIsPlaying(!isPlaying)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 12, cursor: 'pointer' }}>{isPlaying ? '⏸' : '▶'}</button>
          <button onClick={saveImage} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 12, cursor: 'pointer' }}>📷</button>
          <button onClick={() => setShowResolutionPicker(true)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 12, cursor: 'pointer' }}>{resolution.name}</button>
        </div>
      </div>

      {/* Bottom Controls */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: showControls ? 'linear-gradient(transparent, rgba(0,0,0,0.95))' : 'none', padding: '20px 16px', paddingBottom: 'max(20px, env(safe-area-inset-bottom))', opacity: showControls ? 1 : 0, transition: 'opacity 0.3s', pointerEvents: showControls ? 'auto' : 'none' }}>
        
        {/* Layer Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 8 }}>
          {layers.map((layer, i) => (
            <button key={layer.id} onClick={() => setSelectedLayer(i)} style={{ background: i === selectedLayer ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: '8px 16px', color: '#fff', fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap', opacity: layer.visible ? 1 : 0.5 }}>
              {SHADERS[layer.shaderIndex].name.slice(0, 12)}
            </button>
          ))}
          <button onClick={addLayer} style={{ background: 'rgba(100,200,255,0.2)', border: 'none', borderRadius: 8, padding: '8px 16px', color: '#6cf', fontSize: 11, cursor: 'pointer' }}>+ ADD</button>
        </div>

        {/* Current Layer Controls */}
        <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <button onClick={() => setShowShaderPicker(true)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: '10px 16px', color: '#fff', fontSize: 13, cursor: 'pointer', flex: 1, marginRight: 8, textAlign: 'left' }}>
              {SHADERS[currentLayer.shaderIndex].name} ▼
            </button>
            <button onClick={() => updateLayer(selectedLayer, { visible: !currentLayer.visible })} style={{ background: currentLayer.visible ? 'rgba(100,255,100,0.2)' : 'rgba(255,100,100,0.2)', border: 'none', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 12, cursor: 'pointer' }}>{currentLayer.visible ? '👁' : '👁‍🗨'}</button>
            {layers.length > 1 && <button onClick={() => removeLayer(selectedLayer)} style={{ background: 'rgba(255,100,100,0.2)', border: 'none', borderRadius: 8, padding: '10px 12px', color: '#f66', fontSize: 12, cursor: 'pointer', marginLeft: 8 }}>✕</button>}
          </div>

          {/* Sliders */}
          {[
            { label: 'Opacity', key: 'opacity', min: 0, max: 1, step: 0.01 },
            { label: 'Speed', key: 'speed', min: 0, max: 2, step: 0.01 },
            { label: 'Scale', key: 'scale', min: 0.1, max: 3, step: 0.01 },
            { label: 'Intensity', key: 'intensity', min: 0, max: 2, step: 0.01 },
          ].map(({ label, key, min, max, step }) => (
            <div key={key} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>{label}</span>
                <span style={{ color: '#fff', fontSize: 11 }}>{currentLayer[key].toFixed(2)}</span>
              </div>
              <input type="range" min={min} max={max} step={step} value={currentLayer[key]} onChange={(e) => updateLayer(selectedLayer, { [key]: parseFloat(e.target.value) })} style={{ width: '100%', accentColor: '#6cf' }} />
            </div>
          ))}

          {/* Blend Mode */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {BLEND_MODES.map(mode => (
              <button key={mode} onClick={() => updateLayer(selectedLayer, { blendMode: mode })} style={{ background: currentLayer.blendMode === mode ? 'rgba(100,200,255,0.3)' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 6, padding: '6px 12px', color: '#fff', fontSize: 10, cursor: 'pointer', textTransform: 'uppercase' }}>{mode}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Toggle Controls Button */}
      <button onClick={() => setShowControls(!showControls)} style={{ position: 'fixed', bottom: 'max(20px, env(safe-area-inset-bottom))', right: 16, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 44, height: 44, color: '#fff', fontSize: 18, cursor: 'pointer', zIndex: 100 }}>{showControls ? '▼' : '▲'}</button>

      {/* Shader Picker Modal */}
      {showShaderPicker && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 200, overflow: 'auto' }}>
          <div style={{ padding: 16, paddingTop: 'max(16px, env(safe-area-inset-top))' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>Select Visual</span>
              <button onClick={() => setShowShaderPicker(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {categories.map(cat => (
                <button key={cat} onClick={() => setFilterCategory(cat)} style={{ background: filterCategory === cat ? 'rgba(100,200,255,0.3)' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 6, padding: '6px 12px', color: '#fff', fontSize: 11, cursor: 'pointer', textTransform: 'capitalize' }}>{cat}</button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
              {filteredShaders.map((shader, i) => {
                const actualIndex = SHADERS.indexOf(shader);
                return (
                  <button key={i} onClick={() => { updateLayer(selectedLayer, { shaderIndex: actualIndex }); setShowShaderPicker(false); }} style={{ background: currentLayer.shaderIndex === actualIndex ? 'rgba(100,200,255,0.3)' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 10, padding: 12, color: '#fff', cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{shader.name}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize' }}>{shader.category}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Resolution Picker Modal */}
      {showResolutionPicker && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 24, maxWidth: 320 }}>
            <div style={{ color: '#fff', fontSize: 16, fontWeight: 600, marginBottom: 16, textAlign: 'center' }}>Export Resolution</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {RESOLUTIONS.map(res => (
                <button key={res.name} onClick={() => { setResolution(res); }} style={{ background: resolution.name === res.name ? 'rgba(100,200,255,0.3)' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: '12px 16px', color: '#fff', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{res.name}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{res.width} × {res.height}</div>
                </button>
              ))}
            </div>
            <button onClick={saveHiRes} style={{ width: '100%', background: 'linear-gradient(135deg, #6cf, #c6f)', border: 'none', borderRadius: 8, padding: 14, color: '#000', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 16 }}>Save {resolution.name} Image</button>
            <button onClick={() => setShowResolutionPicker(false)} style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: 12, color: '#fff', fontSize: 12, cursor: 'pointer', marginTop: 8 }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

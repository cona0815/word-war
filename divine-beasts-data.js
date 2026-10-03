/* ImageGen art, deterministic frame extraction, named target IDs for future parties. */
window.DivineBeasts=[
  {
    "id": "01-celestial-dragon",
    "name": "蒼穹神龍王",
    "small": "星晶吐息",
    "ultimate": "蒼穹星陣",
    "body": {
      "small": {
        "frames": 6,
        "releaseFrame": 3
      },
      "ultimate": {
        "frames": 9,
        "releaseFrame": 5
      }
    },
    "fx": {
      "small": {
        "frames": 4,
        "peakFrame": 2
      },
      "ultimate": {
        "frames": 6,
        "peakFrame": 3
      }
    },
    "muzzle": {
      "x": 0.24,
      "y": 0.48
    }
  },
  {
    "id": "02-solar-lion",
    "name": "曜焰神獅王",
    "small": "曜焰衝爪",
    "ultimate": "九陽焚天",
    "body": {
      "small": {
        "frames": 6,
        "releaseFrame": 3
      },
      "ultimate": {
        "frames": 9,
        "releaseFrame": 5
      }
    },
    "fx": {
      "small": {
        "frames": 4,
        "peakFrame": 2
      },
      "ultimate": {
        "frames": 6,
        "peakFrame": 3
      }
    },
    "muzzle": {
      "x": 0.24,
      "y": 0.48
    }
  },
  {
    "id": "03-glacial-xuanwu",
    "name": "玄霜玄武王",
    "small": "冰晶飛刃",
    "ultimate": "玄霜封界",
    "body": {
      "small": {
        "frames": 6,
        "releaseFrame": 3
      },
      "ultimate": {
        "frames": 9,
        "releaseFrame": 5
      }
    },
    "fx": {
      "small": {
        "frames": 4,
        "peakFrame": 2
      },
      "ultimate": {
        "frames": 6,
        "peakFrame": 3
      }
    },
    "muzzle": {
      "x": 0.25,
      "y": 0.5
    }
  },
  {
    "id": "04-violet-qilin",
    "name": "紫宸麒麟王",
    "small": "紫雷咒擊",
    "ultimate": "紫宸天罰",
    "body": {
      "small": {
        "frames": 6,
        "releaseFrame": 3
      },
      "ultimate": {
        "frames": 9,
        "releaseFrame": 5
      }
    },
    "fx": {
      "small": {
        "frames": 4,
        "peakFrame": 2
      },
      "ultimate": {
        "frames": 6,
        "peakFrame": 3
      }
    },
    "muzzle": {
      "x": 0.25,
      "y": 0.45
    }
  }
].map(beast=>{
  if(beast.id==='03-glacial-xuanwu')beast.muzzles={small:{x:.23,y:.50},ultimate:{x:.26,y:.29}};
  for(const kind of ['small','ultimate']){
    const base=`assets/generated/divine-beasts-v1/${beast.id}-${kind}`;
    beast.body[kind].urls=Array.from({length:beast.body[kind].frames},(_,i)=>`${base}-body/cast-${i+1}.png`);
    beast.fx[kind].urls=Array.from({length:beast.fx[kind].frames},(_,i)=>`${base}-fx/impact-${i+1}.png`);
  }
  return beast;
});

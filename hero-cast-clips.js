/* Only visually reviewed, complete body-and-weapon pose sheets belong here. */
window.HeroCastClips=Object.freeze(Object.fromEntries([
 ['male:1:starlight','hero-cast-lv1-v1',896,600],
 ['female:1:starlight','hero-female-cast-lv1-v1',896,600],
 ['male:1:shadow','hero-male-shadow-cast-lv1-v1',1152,650],
 ['female:1:shadow','hero-female-shadow-cast-lv1-v1',1152,650],
 ['male:2:starlight','hero-male-starlight-cast-lv2-v1',1152,650],
 ['female:2:starlight','hero-female-starlight-cast-lv2-v1',1152,650],
 ['male:3:starlight','hero-male-starlight-cast-lv3-v1',1152,650],
 ['female:3:starlight','hero-female-starlight-cast-lv3-v1',1152,650]
].map(([key,folder,width,duration])=>[key,Object.freeze({url:`assets/generated/${folder}/cast-strip.png`,width,duration,release:Math.round(duration*.42),wide:width===1152})])));

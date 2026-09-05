# Body Scale Revision

Source: ../hero-female-cast-lv1-v1/cast-strip.png (built-in generated art; original retained).
Deterministic resizing only, no new painted content. tools/audit-hero-body.py measures the reviewed central idle silhouette; tools/normalize-hero-body.py applies one scale to all six poses, centers feet at (576,610), and rejects clipped frames.
Target idle body height: 460 pixels. Cell: 1152x648. See body-scale.json for original measurements and scale factor. Weapons do not determine the body-height measurement. Motion crouches retain their source pose height.

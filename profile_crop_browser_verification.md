# Profile-photo crop browser verification

## 15 August 2026 — development preview

An authenticated disposable job-seeker account was created with `crop-browser-1786781788@example.test` solely for verification and will be removed after testing.

The profile page opened the new **Crop your profile photo** dialog after selecting a normal-sized PNG through the profile-photo input. The dialog presented the instruction, **“Drag the photo to position it. Use zoom to fill the square profile frame.”** The visual crop boundary was square, the zoom control displayed `100%`, and the **Use cropped photo** action was enabled for a valid image.

The cancel path was also verified: selecting an undersized temporary test image opened the dialog, and choosing **Cancel** returned to the profile form without uploading it. A second, normal-sized image was then selected to continue confirmation and managed-upload testing.

The dialog’s crop area measured `293 × 293` pixels in the rendered page, confirming a square frame. Its accessible zoom slider exposed a minimum of `1`, maximum of `3`, and initial value of `1`. Focusing the slider and pressing the keyboard Right Arrow changed the rendered zoom from `100%` to `110%`.

Choosing **Use cropped photo** completed processing and uploaded the generated crop through the existing authenticated endpoint. The dialog closed, and the profile immediately displayed the resulting managed-storage image at `/manus-storage/job-seekers/300002/profile-photo_304aa887.jpg`. This confirms the browser path preserves the intended chain: select → square crop → zoom → confirm → managed upload → visible profile image.

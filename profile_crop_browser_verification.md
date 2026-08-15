# Profile-photo crop browser verification

## 15 August 2026 — development preview

An authenticated disposable job-seeker account was created with `crop-browser-1786781788@example.test` solely for verification and will be removed after testing.

The profile page opened the new **Crop your profile photo** dialog after selecting a normal-sized PNG through the profile-photo input. The dialog presented the instruction, **“Drag the photo to position it. Use zoom to fill the square profile frame.”** The visual crop boundary was square, the zoom control displayed `100%`, and the **Use cropped photo** action was enabled for a valid image.

The cancel path was also verified: selecting an undersized temporary test image opened the dialog, and choosing **Cancel** returned to the profile form without uploading it. A second, normal-sized image was then selected to continue confirmation and managed-upload testing.

The dialog’s crop area measured `293 × 293` pixels in the rendered page, confirming a square frame. Its accessible zoom slider exposed a minimum of `1`, maximum of `3`, and initial value of `1`. Focusing the slider and pressing the keyboard Right Arrow changed the rendered zoom from `100%` to `110%`.

Choosing **Use cropped photo** completed processing and uploaded the generated crop through the existing authenticated endpoint. The dialog closed, and the profile immediately displayed the resulting managed-storage image at `/manus-storage/job-seekers/300002/profile-photo_304aa887.jpg`. This confirms the browser path preserves the intended chain: select → square crop → zoom → confirm → managed upload → visible profile image.

## 15 August 2026 — published deployment

The release checkpoint `89a2be16` was saved and published to `https://talenthub-gkbobftg.manus.space`. The public edge initially served the previous asset bundle while the deployment propagated. Once the managed deployment completed, its current JavaScript bundle was verified to contain both the crop-dialog title and the profile-page crop instruction.

The published site was then opened in a fresh authenticated disposable job-seeker session. The live `/profile` page now presents the expected instruction: **“Select a photo, crop it to fit your profile, then upload it securely.”** Final live image-selection and managed-upload confirmation is in progress using this temporary account, which will be deleted afterward.

The final live check confirmed that the published profile-photo selector opens an active **Crop your profile photo** dialog for a valid PNG. Its visible overlay is square, it displays the instruction to use zoom for the square profile frame, it shows the zoom control at `100%`, and both **Cancel** and **Use cropped photo** are available. The generated preview was visibly centred in the square frame.

Selecting **Use cropped photo** on the live site entered the expected processing state, including the visible labels **“Preparing photo…”** and **“Uploading file…”**. The outcome is being monitored before the temporary account is removed.

The live browser recorded the profile-photo mutation request and a resulting managed-storage asset request at `/manus-storage/job-seekers/330002/profile-photo_5b938c5a.jpg`, which confirms that the published flow generated and submitted a managed-storage profile image for the temporary account. The final UI completion state is being checked separately.

The published profile displayed the returned cropped image and the database confirmed that the profile-save request persisted the same managed-storage URL in `job_seekers.photo_url` for the temporary account. The interface remained on its **Saving…** state longer than expected after the database update, so that presentation-state delay is being checked before cleanup.

A clean reload of the published authenticated profile rendered the cropped image from the persisted database value at `/manus-storage/job-seekers/330002/profile-photo_5b938c5a.jpg`, with the normal **Save Profile** action available. This verifies the end-to-end production flow: select → square crop → confirm → managed upload → profile save → persisted image after reload. The temporary account was then deleted, and a database count confirmed that no record remains for `crop-browser-1786781788@example.test`.

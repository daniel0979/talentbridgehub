# Logo and Profile Upload Validation Notes

The original KMD College, Tech Khit, Tech Khit AU, Samsung, and Apple logo bytes were recovered from the project SQL dump and uploaded to managed storage. The five corresponding company records now reference the managed `/manus-storage/` URLs, and the development company directory confirms that all five image elements are present and load successfully.

The reported job-seeker profile failure was caused by the old form flow sending a large data URI as a database field. The revised implementation uploads validated profile images and resumes to managed storage first, then saves only the returned storage URL in the job-seeker profile. A submitted file labelled as an image but containing PDF bytes is rejected with a clear validation message.

After checkpoint `1e38f27c` was published, the public company directory was checked twice and continued to return a platform-level HTTP 500 page. Production log retrieval reported that the backing Cloud Run service could not be found, while the local development preview continued to load the company directory and all five restored logo images. This indicates a hosting-service availability mismatch rather than a remaining company-directory data or UI error.

After checkpoint `e8a33277`, the public domain still returned the same platform-level 500 response and production log retrieval again reported that the Cloud Run service could not be found. A local production-mode process built from the same release started successfully and returned HTTP 200 for `/companies`, confirming that the current application bundle and route are healthy; the remaining fault is isolated to the hosted service layer.

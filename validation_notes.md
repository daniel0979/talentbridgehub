# Logo and Profile Upload Validation Notes

The original KMD College, Tech Khit, Tech Khit AU, Samsung, and Apple logo bytes were recovered from the project SQL dump and uploaded to managed storage. The five corresponding company records now reference the managed `/manus-storage/` URLs, and the development company directory confirms that all five image elements are present and load successfully.

The reported job-seeker profile failure was caused by the old form flow sending a large data URI as a database field. The revised implementation uploads validated profile images and resumes to managed storage first, then saves only the returned storage URL in the job-seeker profile. A submitted file labelled as an image but containing PDF bytes is rejected with a clear validation message.

// Client-side random contributor picker.
// Fetches `contributors/manifest.json`, picks one entry at random, and
// navigates to `contributors/<name>/index.html`.

(function () {
	const MANIFEST_PATH = "contributors/manifest.json";

	async function fetchManifest(path) {
		const res = await fetch(path, { cache: "no-cache" });
		if (!res.ok) throw new Error(`Could not fetch manifest: ${res.status}`);
		const json = await res.json();
		if (!Array.isArray(json) || json.length === 0) throw new Error("Manifest is empty or invalid");
		return json;
	}

	async function goToRandom() {
		try {
			const manifest = await fetchManifest(MANIFEST_PATH);
			const choice = manifest[Math.floor(Math.random() * manifest.length)];
			const url = `contributors/${encodeURIComponent(choice)}/index.html`;
			window.location.href = url;
		} catch (err) {
			// Fallback: log and inform the user.
			// Keep messaging minimal; detailed troubleshooting belongs in dev console.
			console.error(err);
			alert("Couldn't pick a random contributor right now. Try again later.");
		}
	}

	// Wire the button if present.
	document.addEventListener("DOMContentLoaded", () => {
		const btn = document.getElementById("random-btn");
		if (btn) btn.addEventListener("click", (e) => { e.preventDefault(); goToRandom(); });

		// Support visiting a path that ends with /random as a shortcut.
		// Example: https://example.com/your-repo/random
		const parts = location.pathname.split("/").filter(Boolean);
		if (parts.length && parts[parts.length - 1].toLowerCase() === "random") {
			goToRandom();
		}
	});
})();

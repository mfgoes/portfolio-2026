// Password protection gate — comment out the <script> tag in the page to disable.
// To change the password: run `echo -n "newpassword" | shasum -a 256` and update HASH below.
(function () {
    const HASH = "6bf11791be96b2ae05a9ac75001487fc35b4e0edf3439cd45647bdb9768415cc";
    const STORAGE_KEY = "portfolio_access";

    async function sha256(str) {
        const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
        return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
    }

    function showGate() {
        const overlay = document.createElement("div");
        overlay.id = "pw-gate";
        overlay.innerHTML = `
            <div class="pw-gate-backdrop"></div>
            <div class="pw-gate-card">
                <a href="index.html" class="pw-gate-back">← Back to portfolio</a>
                <h2>Protected case study</h2>
                <p>This case study is password-protected. Enter the password to continue.</p>
                <form id="pw-gate-form">
                    <div class="pw-gate-input-wrap">
                        <input type="password" id="pw-gate-input" placeholder="Password" autocomplete="current-password" />
                        <button type="button" id="pw-gate-toggle" title="Show password" aria-label="Show password">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="18" height="18" fill="currentColor"><path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4 142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1 3.3-7.9 3.3-16.7 0-24.6-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1-288 0zm144-64c0 35.3-28.7 64-64 64-7.1 0-13.9-1.2-20.3-3.3-5.5-1.8-11.9 1.6-11.7 7.4.3 6.9 1.3 13.8 3.2 20.7 13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1-5.8-.2-9.2 6.1-7.4 11.7 2.1 6.4 3.3 13.2 3.3 20.3z"/></svg>
                        </button>
                    </div>
                    <button type="submit" id="pw-gate-submit">Unlock</button>
                    <p id="pw-gate-error" class="pw-gate-error hidden">Incorrect password — try again.</p>
                </form>
            </div>
        `;

        const style = document.createElement("style");
        style.textContent = `
            #pw-gate { position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 1rem; font-family: "Archivo", sans-serif; }
            .pw-gate-backdrop { position: absolute; inset: 0; background: #f8f8f8; }
            .pw-gate-card { position: relative; background: #fff; border: 1px solid #e0e0e0; border-radius: 16px; padding: 2.5rem 2rem; width: 100%; max-width: 400px; box-shadow: 0 4px 24px rgba(0,0,0,.08); }
            .pw-gate-back { display: inline-block; font-size: .85rem; color: #666; text-decoration: none; margin-bottom: 1.5rem; }
            .pw-gate-back:hover { color: #1a1a1a; }
            .pw-gate-card h2 { font-size: 1.25rem; font-weight: 600; margin: 0 0 .5rem; color: #1a1a1a; }
            .pw-gate-card p { font-size: .9rem; color: #555; margin: 0 0 1.25rem; }
            .pw-gate-input-wrap { position: relative; margin-bottom: .75rem; }
            #pw-gate-input { width: 100%; padding: .65rem 2.5rem .65rem .85rem; border: 1px solid #ccc; border-radius: 8px; font-size: .95rem; outline: none; box-sizing: border-box; }
            #pw-gate-input:focus { border-color: #8E78FF; box-shadow: 0 0 0 3px rgba(142,120,255,.15); }
            #pw-gate-toggle { position: absolute; right: .6rem; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #888; padding: 0; line-height: 1; }
            #pw-gate-submit { width: 100%; padding: .7rem; background: #1a1a1a; color: #fff; border: none; border-radius: 8px; font-size: .95rem; font-weight: 500; cursor: pointer; transition: background .15s; }
            #pw-gate-submit:hover { background: #333; }
            .pw-gate-error { font-size: .85rem; color: #d00; margin: .5rem 0 0; }
            .pw-gate-error.hidden { display: none; }
        `;

        document.head.appendChild(style);
        document.body.appendChild(overlay);

        const input = document.getElementById("pw-gate-input");
        const toggle = document.getElementById("pw-gate-toggle");
        const error = document.getElementById("pw-gate-error");

        toggle.addEventListener("click", () => {
            input.type = input.type === "password" ? "text" : "password";
        });

        document.getElementById("pw-gate-form").addEventListener("submit", async function (e) {
            e.preventDefault();
            const hash = await sha256(input.value);
            if (hash === HASH) {
                sessionStorage.setItem(STORAGE_KEY, "1");
                overlay.remove();
                style.remove();
            } else {
                error.classList.remove("hidden");
                input.value = "";
                input.focus();
            }
        });
    }

    if (sessionStorage.getItem(STORAGE_KEY) !== "1") {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", showGate);
        } else {
            showGate();
        }
    }
})();

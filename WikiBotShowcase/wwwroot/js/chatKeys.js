console.log("[WikiBot] chatKeys.js loaded");

/**
 * Bind Enter to send and auto scroll to bottom.
 * - Enter (without Shift) triggers SendFromJs on the .razor component.
 * - After the send completes, we scroll the thread to the bottom.
 * - We store the handler on the input element to safely unbind later.
 */
export function bindEnterAndScroll(inputEl, threadEl, dotnetRef) {
    if (!inputEl) {
        console.warn("[WikiBot] bindEnterAndScroll: input element missing");
        return;
    }
    unbindEnterAndScroll(inputEl); // avoids duplicates

    const handler = (ev) => {
        if (ev.key === "Enter" && !ev.shiftKey) {
            ev.preventDefault();
            ev.stopPropagation();
            // Fire .NET send, then scroll down
            dotnetRef.invokeMethodAsync("SendFromJs")
                .then(() => {
                    // slight delay so DOM updates are in
                    requestAnimationFrame(() => {
                        tryScrollToBottom(threadEl);
                    });
                })
                .catch(() => { /* ignore */ });
        }
    };

    inputEl.addEventListener("keydown", handler, { passive: false });
    inputEl._wikibotHandler = handler;
    inputEl._wikibotThread = threadEl;
    console.log("[WikiBot] Enter bound + auto-scroll ready");
}

export function unbindEnterAndScroll(inputEl) {
    if (!inputEl) return;
    const h = inputEl._wikibotHandler;
    if (h) {
        inputEl.removeEventListener("keydown", h);
        inputEl._wikibotHandler = null;
        inputEl._wikibotThread = null;
        console.log("[WikiBot] Enter unbound");
    }
}

export function focusEl(el) {
    if (!el) return;
    el.focus();
    try {
        const v = el.value || "";
        el.setSelectionRange(v.length, v.length);
    } catch { /* ignore */ }
}

/** Expose an explicit scroll function (used after message appends). */
export function scrollToBottom(threadEl) {
    tryScrollToBottom(threadEl);
}

function tryScrollToBottom(threadEl) {
    if (!threadEl) return;
    try {
        threadEl.scrollTo({ top: threadEl.scrollHeight, behavior: "smooth" });
    } catch {
        // fallback
        threadEl.scrollTop = threadEl.scrollHeight ?? 0;
    }
}

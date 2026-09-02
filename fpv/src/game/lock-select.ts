/** iOS/WKWebView ignores CSS user-select on long-press and still rubber-bands
 *  the visual viewport on drag. Native non-passive listeners + a pinned
 *  layout viewport are required. React's onTouchStart is passive. */

function pinScroll() {
  if (window.scrollX || window.scrollY) window.scrollTo(0, 0);
  const html = document.documentElement;
  const body = document.body;
  if (html.scrollTop) html.scrollTop = 0;
  if (body.scrollTop) body.scrollTop = 0;
}

function pinShell(root: HTMLElement) {
  const html = document.documentElement;
  const body = document.body;
  const freeze = (node: HTMLElement) => {
    node.style.setProperty("position", "fixed", "important");
    node.style.setProperty("inset", "0px", "important");
    node.style.setProperty("width", "100%", "important");
    node.style.setProperty("height", "100%", "important");
    node.style.setProperty("max-height", "100%", "important");
    node.style.setProperty("overflow", "hidden", "important");
    node.style.setProperty("overscroll-behavior", "none", "important");
    node.style.setProperty("touch-action", "none");
    node.style.setProperty("-webkit-user-select", "none", "important");
    node.style.setProperty("user-select", "none", "important");
    node.style.setProperty("-webkit-touch-callout", "none", "important");
  };
  freeze(html);
  freeze(body);
  freeze(root);

  const vv = window.visualViewport;
  if (!vv) {
    pinScroll();
    return;
  }
  root.style.position = "fixed";
  root.style.top = `${vv.offsetTop}px`;
  root.style.left = `${vv.offsetLeft}px`;
  root.style.right = "auto";
  root.style.bottom = "auto";
  root.style.width = `${vv.width}px`;
  root.style.height = `${vv.height}px`;
  pinScroll();
}

export function lockSelection(root: HTMLElement): () => void {
  const opts: AddEventListenerOptions = { capture: true, passive: false };

  const clear = () => {
    const sel = window.getSelection?.();
    if (sel && sel.rangeCount) sel.removeAllRanges();
  };

  const prevent = (e: Event) => {
    e.preventDefault();
    clear();
  };

  const onTouchStart = (e: TouchEvent) => {
    clear();
    pinScroll();
    const el = e.target as HTMLElement | null;
    if (el?.closest("button, a, input, textarea, [data-allow-select]")) return;
    e.preventDefault();
  };

  const onTouchMove = (e: TouchEvent) => {
    pinScroll();
    if (e.cancelable) e.preventDefault();
  };

  const fit = () => pinShell(root);

  root.addEventListener("selectstart", prevent, opts);
  root.addEventListener("contextmenu", prevent, opts);
  root.addEventListener("dragstart", prevent, opts);
  root.addEventListener("gesturestart", prevent, opts);
  root.addEventListener("gesturechange", prevent, opts);
  root.addEventListener("touchstart", onTouchStart, opts);
  root.addEventListener("touchmove", onTouchMove, opts);
  window.addEventListener("touchmove", onTouchMove, opts);
  window.addEventListener("scroll", pinScroll, opts);
  document.addEventListener("selectionchange", clear);
  window.visualViewport?.addEventListener("scroll", fit);
  window.visualViewport?.addEventListener("resize", fit);
  window.addEventListener("orientationchange", fit);
  window.addEventListener("resize", fit);

  let held = false;
  const onDown = () => {
    held = true;
    clear();
    pinScroll();
  };
  const onUp = () => {
    held = false;
    clear();
    pinScroll();
  };
  root.addEventListener("pointerdown", onDown, opts);
  window.addEventListener("pointerup", onUp, true);
  window.addEventListener("pointercancel", onUp, true);
  const tick = window.setInterval(() => {
    if (held) {
      clear();
      pinScroll();
    }
  }, 80);

  fit();

  return () => {
    root.removeEventListener("selectstart", prevent, opts);
    root.removeEventListener("contextmenu", prevent, opts);
    root.removeEventListener("dragstart", prevent, opts);
    root.removeEventListener("gesturestart", prevent, opts);
    root.removeEventListener("gesturechange", prevent, opts);
    root.removeEventListener("touchstart", onTouchStart, opts);
    root.removeEventListener("touchmove", onTouchMove, opts);
    window.removeEventListener("touchmove", onTouchMove, opts);
    window.removeEventListener("scroll", pinScroll, opts);
    document.removeEventListener("selectionchange", clear);
    window.visualViewport?.removeEventListener("scroll", fit);
    window.visualViewport?.removeEventListener("resize", fit);
    window.removeEventListener("orientationchange", fit);
    window.removeEventListener("resize", fit);
    root.removeEventListener("pointerdown", onDown, opts);
    window.removeEventListener("pointerup", onUp, true);
    window.removeEventListener("pointercancel", onUp, true);
    window.clearInterval(tick);
  };
}

// Carousel navigation, its controls, and the optional autoplay clock.
import { german, wireOnce } from "./copy.ts";
import { reducedMotion } from "./motion-preference.ts";
import { holdWhileUsed } from "./usage-hold.ts";

/** Creates the labelled button and fill for one slide. */
function carouselDot(label: string) {
  const dot = document.createElement("button");
  dot.type = "button";
  dot.className = "hw-carousel-dot";
  dot.setAttribute("aria-label", label);
  dot.append(document.createElement("span"));
  return dot;
}

/** Reuses authored dots when they match the slide count, or prepares the counter. */
function preparePosition(position: HTMLElement, total: number, of: string) {
  let written = [...position.querySelectorAll<HTMLButtonElement>(".hw-carousel-dot")];
  if (written.length !== total) {
    position.replaceChildren();
    written = [];
  }
  if (total > 5) {
    position.className = "hw-carousel-count";
    return [];
  }
  return Array.from({ length: total }, (_, i) => {
    const label = `${i + 1} ${of} ${total}`;
    const dot = written[i] ?? position.appendChild(carouselDot(label));
    if (!dot.hasAttribute("aria-label")) dot.setAttribute("aria-label", label);
    return dot;
  });
}

/** Renders slide position and exposes reader steps through the controls. */
class CarouselControls {
  private readonly of = german() ? "von" : "of";
  private readonly position: HTMLElement | null;
  private readonly status: HTMLElement | null;
  private readonly previous: HTMLButtonElement | null;
  private readonly next: HTMLButtonElement | null;
  private readonly dots: HTMLButtonElement[];

  readonly element: HTMLElement;
  private readonly total: number;

  constructor(element: HTMLElement, total: number) {
    this.element = element;
    this.total = total;
    this.position = element.querySelector("[data-hw-position]");
    this.status = element.querySelector(":scope > .hw-sr-only");
    this.previous = element.querySelector('[data-hw-step="-1"]');
    this.next = element.querySelector('[data-hw-step="1"]');
    this.dots = this.position ? preparePosition(this.position, total, this.of) : [];
  }

  render(index: number) {
    this.dots.forEach((dot, i) =>
      i === index ? dot.setAttribute("aria-current", "true") : dot.removeAttribute("aria-current"),
    );
    if (this.total > 5 && this.position) this.position.textContent = `${index + 1} / ${this.total}`;
    if (this.previous) this.previous.disabled = index === 0;
    if (this.next) this.next.disabled = index === this.total - 1;
  }

  announce(index: number) {
    if (this.status) this.status.textContent = `${index + 1} ${this.of} ${this.total}`;
  }

  connect(viewport: CarouselViewport, move: (index: number) => void) {
    this.dots.forEach((dot, i) => dot.addEventListener("click", () => move(i)));
    this.previous?.addEventListener("click", () => move(viewport.active - 1));
    this.next?.addEventListener("click", () => move(viewport.active + 1));
  }
}

/** Owns track scroll position, snap selection, and overflow detection. */
class CarouselViewport {
  private readonly items: HTMLElement[];
  readonly root: HTMLElement;
  readonly track: HTMLElement;
  readonly controls: CarouselControls;
  active = 0;
  private restartStep?: () => void;

  constructor(root: HTMLElement, track: HTMLElement, controls: HTMLElement) {
    this.root = root;
    this.track = track;
    this.items = [...track.children] as HTMLElement[];
    this.controls = new CarouselControls(controls, this.items.length);
    this.controls.render(this.active);
  }

  private offset(index: number) {
    // An item's scroll position is its distance from the first item, so the track's padding
    // (the focus ring's room) stays out of the sum.
    return this.items[index]!.offsetLeft - this.items[0]!.offsetLeft;
  }

  private select(index: number) {
    if (index !== this.active) this.restartStep?.();
    this.active = index;
    this.controls.render(index);
  }

  go(index: number) {
    const wrapped = (index + this.items.length) % this.items.length;
    this.track.scrollTo({
      left: this.offset(wrapped),
      behavior: reducedMotion() ? "auto" : "smooth",
    });
    this.select(wrapped);
    return wrapped;
  }

  watchScroll() {
    let timer = 0;
    this.track.addEventListener("scroll", () => {
      clearTimeout(timer);
      timer = window.setTimeout(() => this.selectNearestSlide(), 80);
    });
  }

  private selectNearestSlide() {
    const { scrollLeft, scrollWidth, clientWidth } = this.track;
    // At the end, the track cannot bring the last items to its start. Keep the one asked for.
    if (scrollLeft >= scrollWidth - clientWidth - 2 && this.active > 0) return;
    const nearest = this.items.reduce(
      (best, _, i) =>
        Math.abs(this.offset(i) - scrollLeft) < Math.abs(this.offset(best) - scrollLeft) ? i : best,
      0,
    );
    this.select(nearest);
  }

  /** A new slide starts the autoplay step afresh, before the controls render. */
  onSlideChange(restart: () => void) {
    this.restartStep = restart;
  }

  updateControlVisibility() {
    // Only a track that scrolls shows its controls; a phone-only carousel is a grid from 48rem.
    this.controls.element.hidden = this.track.scrollWidth <= this.track.clientWidth + 2;
  }

  watchLayout(onFitChange: () => void) {
    const {
      track,
      controls: { element },
    } = this;
    new ResizeObserver(() => {
      this.updateControlVisibility();
      onFitChange();
    }).observe(track);
    // A lazy image beside the view would wait for a sideways scroll: load them all once in view.
    new IntersectionObserver(([entry], observer) => {
      if (!entry?.isIntersecting || element.hidden) return;
      for (const img of track.querySelectorAll("img")) img.loading = "eager";
      observer.disconnect();
    }).observe(track);
  }
}

// The hold after the reader's own step, in ms. The step is carousel.css's, the time its dot fills.
const READER_HOLD = 4000;

/** Runs the step clock only while the reader and the viewport allow it. */
class CarouselAutoplay {
  private readonly holds = new Set<string>();
  private remaining: number;
  private since = 0;
  private timer = 0;
  private readerTimer = 0;
  private readonly pause: HTMLButtonElement | null;

  private readonly viewport: CarouselViewport;
  private readonly surfaces: HTMLElement[];
  private readonly step: number;

  constructor(viewport: CarouselViewport, surfaces: HTMLElement[], step: number) {
    this.viewport = viewport;
    this.surfaces = surfaces;
    this.step = step;
    this.remaining = step;
    this.pause = viewport.controls.element.querySelector("[data-hw-pause]");
  }

  connect() {
    this.viewport.onSlideChange(() => this.restart());
    for (const surface of this.surfaces) holdWhileUsed(surface, (by, on) => this.hold(by, on));
    new IntersectionObserver(([entry]) => this.hold("offscreen", !entry?.isIntersecting)).observe(
      this.viewport.root,
    );
    document.addEventListener("visibilitychange", () => this.update());
    for (const type of ["pointerdown", "keydown"])
      this.viewport.track.addEventListener(type, () => this.readerHold());
    // Under reduced motion it starts paused. The pause button starts it at once, though the pointer
    // and focus are on it.
    this.setStopped(reducedMotion());
    this.pause?.addEventListener("click", () => this.setStopped(!this.stopped));
  }

  private get stopped() {
    return this.viewport.root.hasAttribute("data-hw-stopped");
  }

  private setStopped(on: boolean) {
    this.pause?.setAttribute("aria-pressed", String(on));
    markSurfaces(this.surfaces, "data-hw-stopped", on);
    if (!on) for (const by of ["pointer", "focus"]) this.holds.delete(by);
    this.restart();
  }

  // The step's time left runs while nothing holds the viewport; the dot's fill pauses with it.
  update() {
    const held = this.holds.size > 0 || document.hidden;
    markSurfaces(this.surfaces, "data-hw-held", held);
    clearTimeout(this.timer);
    if (this.since) this.remaining -= Date.now() - this.since;
    this.since = 0;
    if (held || this.stopped || this.viewport.controls.element.hidden) return;
    this.since = Date.now();
    this.timer = window.setTimeout(
      () => this.viewport.go(this.viewport.active + 1),
      this.remaining,
    );
  }

  private restart() {
    this.remaining = this.step;
    this.since = 0;
    for (const animation of this.viewport.controls.element.getAnimations({ subtree: true }))
      animation.currentTime = 0;
    this.update();
  }

  private hold(by: string, on: boolean) {
    if (on) this.holds.add(by);
    else this.holds.delete(by);
    this.update();
  }

  // A step or swipe of the reader's holds the carousel for READER_HOLD ms, then runs a whole step.
  readerHold() {
    clearTimeout(this.readerTimer);
    this.hold("reader", true);
    this.readerTimer = window.setTimeout(() => this.hold("reader", false), READER_HOLD);
    this.restart();
  }
}

function markSurfaces(surfaces: HTMLElement[], name: string, on: boolean) {
  for (const surface of surfaces) surface.toggleAttribute(name, on);
}

/** Reads the CSS step duration and marks the surfaces that display autoplay. */
function createCarouselAutoplay(viewport: CarouselViewport) {
  const { root } = viewport;
  if (!("hwAutoplay" in root.dataset)) return;
  const controls = viewport.controls.element;
  // External controls carry the carousel's autoplay state too, which carousel.css reads.
  const surfaces = root.contains(controls) ? [root] : [root, controls];
  markSurfaces(surfaces, "data-hw-autoplay", true);
  const step = parseFloat(getComputedStyle(root).getPropertyValue("--_hw-step")) * 1000;
  if (!(step > 0)) return;
  return new CarouselAutoplay(viewport, surfaces, step);
}

/** Connects a complete track and its controls once, when both are present. */
function enhanceCarousel(carousel: HTMLElement) {
  const track = carousel.querySelector<HTMLElement>(".hw-carousel-track");
  const controls =
    carousel.querySelector<HTMLElement>(".hw-carousel-controls") ??
    document.getElementById(carousel.dataset.hwControls ?? "");
  // Not wired until both are there, so a later call wires controls added since.
  if (!track || !controls || !wireOnce(carousel, "carousel")) return;
  const viewport = new CarouselViewport(carousel, track, controls);
  viewport.updateControlVisibility();
  // The autoplay's hooks: a new slide starts its step afresh, a reader's step holds it.
  const autoplay = createCarouselAutoplay(viewport);
  viewport.controls.connect(viewport, (index) => {
    viewport.controls.announce(viewport.go(index));
    autoplay?.readerHold();
  });
  viewport.watchScroll();
  viewport.watchLayout(() => autoplay?.update());
  autoplay?.connect();
}

/** Wires every carousel in `root` alone, without the document-wide behaviour handlers. */
export function carousels(root: ParentNode = document) {
  for (const carousel of root.querySelectorAll<HTMLElement>(".hw-carousel"))
    enhanceCarousel(carousel);
}

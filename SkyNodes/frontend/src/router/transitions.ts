import gsap from 'gsap';

export function slideIn(el: HTMLElement, onComplete?: () => void) {
  gsap.fromTo(
    el,
    { x: '100vw', opacity: 0 },
    { x: 0, opacity: 1, duration: 0.45, ease: 'power3.out', onComplete },
  );
}

export function slideOut(el: HTMLElement, onComplete?: () => void) {
  gsap.to(el, {
    x: '100vw',
    opacity: 0,
    duration: 0.35,
    ease: 'power3.in',
    onComplete,
  });
}

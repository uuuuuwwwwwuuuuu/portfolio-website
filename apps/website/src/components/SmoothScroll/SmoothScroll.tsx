import { useEffect, type FC } from 'react';
import Lenis from 'lenis';
import { scrollStore } from '@store/scrollStore';

export const SmoothScroll: FC = () => {
	useEffect(() => {
		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (prefersReducedMotion) return;

		const lenis = new Lenis({
			autoRaf: true,
			lerp: 0.08,
			smoothWheel: true,
			syncTouch: true,
		});

		scrollStore.setLenis(lenis);
		document.documentElement.classList.add('lenis', 'lenis-smooth');

		return () => {
			lenis.destroy();
			scrollStore.clearLenis();
			document.documentElement.classList.remove('lenis', 'lenis-smooth');
		};
	}, []);

	return null;
};

import type Lenis from 'lenis';

let lenisInstance: Lenis | null = null;

export const scrollStore = {
	setLenis(instance: Lenis) {
		lenisInstance = instance;
	},
	getLenis() {
		return lenisInstance;
	},
	clearLenis() {
		lenisInstance = null;
	},
};

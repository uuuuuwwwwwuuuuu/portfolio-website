import { useEffect, useRef, useState, type FC } from 'react';
import { Button, type ButtonProps } from '@components/Button/Button';
import { scrollStore } from '@store/scrollStore';
import styles from './HeroScrollController.module.scss';

const FRAME_COUNT = 118;
const FRAMES_PATH = '/frames-compressed';

function clamp(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value));
}

function getFramePath(index: number) {
	return `${FRAMES_PATH}/${String(index + 1).padStart(4, '0')}.webp`;
}

/** Draw image on canvas with object-fit: cover behavior */
function drawCover(
	ctx: CanvasRenderingContext2D,
	image: HTMLImageElement,
	width: number,
	height: number,
) {
	const imageAspect = image.width / image.height;
	const canvasAspect = width / height;

	let drawWidth: number;
	let drawHeight: number;
	let offsetX: number;
	let offsetY: number;

	if (imageAspect > canvasAspect) {
		drawHeight = height;
		drawWidth = image.width * (height / image.height);
		offsetX = (width - drawWidth) / 2;
		offsetY = 0;
	} else {
		drawWidth = width;
		drawHeight = image.height * (width / image.width);
		offsetX = 0;
		offsetY = (height - drawHeight) / 2;
	}

	ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
}

export interface HeroScrollControllerProps {
	title: string;
	description: string;
	buttons: ButtonProps[];
}

/**
 * Scroll-driven hero animation.
 *
 * Layout (see HeroScrollController.module.scss):
 *   heroScrollTrack  — tall container (100svh + 200svh extra scroll distance)
 *   heroSection      — sticky block pinned to viewport while track scrolls
 *
 * Flow:
 *   1. User scrolls → Lenis updates scrollY
 *   2. scrollY mapped to progress (0 → 1) within the track
 *   3. progress picks a frame index and fades out text/buttons
 *   4. When track ends, sticky releases and hero scrolls away naturally
 */
export const HeroScrollController: FC<HeroScrollControllerProps> = ({
	title,
	description,
	buttons,
}) => {
	const trackRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const canvasContainerRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const framesRef = useRef<HTMLImageElement[]>([]);

	// progress: 0 = first frame + visible content, 1 = last frame + hidden content
	const [progress, setProgress] = useState(0);
	// Mirror of progress for callbacks that must read the latest value without re-subscribing
	const progressRef = useRef(0);

	useEffect(() => {
		progressRef.current = progress;
	}, [progress]);

	const drawFrame = (frameProgress: number) => {
		const canvas = canvasRef.current;
		const container = canvasContainerRef.current;
		const frames = framesRef.current;
		if (!canvas || !container || frames.length === 0) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const frameIndex = Math.min(
			Math.round(frameProgress * (FRAME_COUNT - 1)),
			FRAME_COUNT - 1,
		);
		const image = frames[frameIndex];
		if (!image?.complete) return;

		const { clientWidth, clientHeight } = container;
		ctx.clearRect(0, 0, clientWidth, clientHeight);
		drawCover(ctx, image, clientWidth, clientHeight);
	};

	// React to progress changes: update canvas frame + text opacity
	useEffect(() => {
		const content = contentRef.current;
		if (content) {
			content.style.opacity = String(1 - (progress * 4));
		}
		drawFrame(progress);
	}, [progress]);

	// Preload all frames once, then keep canvas sized to the container
	useEffect(() => {
		const canvas = canvasRef.current;
		const container = canvasContainerRef.current;
		if (!canvas || !container) return;

		const resizeCanvas = () => {
			const dpr = window.devicePixelRatio || 1;
			const { clientWidth, clientHeight } = container;

			// Internal resolution scaled for retina; CSS size stays in layout pixels
			canvas.width = clientWidth * dpr;
			canvas.height = clientHeight * dpr;
			canvas.style.width = `${clientWidth}px`;
			canvas.style.height = `${clientHeight}px`;

			const ctx = canvas.getContext('2d');
			ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
			drawFrame(progressRef.current);
		};

		const loadFrame = (index: number) =>
			new Promise<HTMLImageElement>((resolve, reject) => {
				const image = new Image();
				image.src = getFramePath(index);
				image.onload = () => resolve(image);
				image.onerror = reject;
			});

		let cancelled = false;

		Promise.all(Array.from({ length: FRAME_COUNT }, (_, index) => loadFrame(index)))
			.then((frames) => {
				if (cancelled) return;
				framesRef.current = frames;
				resizeCanvas();
			})
			.catch(() => {});

		const resizeObserver = new ResizeObserver(resizeCanvas);
		resizeObserver.observe(container);

		return () => {
			cancelled = true;
			resizeObserver.disconnect();
		};
	}, []);

	// Map page scroll position → progress within the sticky track
	useEffect(() => {
		const track = trackRef.current;
		if (!track) return;

		const updateProgressFromScroll = () => {
			const scrollY = scrollStore.getLenis()?.scroll ?? window.scrollY;
			const trackTop = track.offsetTop;
			// How many pixels of scroll it takes to go from progress 0 to 1
			const scrollRange = track.offsetHeight - window.innerHeight;

			if (scrollRange <= 0) return;

			// scrollY at trackTop       → progress 0
			// scrollY at trackTop + range → progress 1
			const next = clamp((scrollY - trackTop) / scrollRange, 0, 1);
			if (next === progressRef.current) return;

			setProgress(next);
		};

		updateProgressFromScroll();

		let unsubscribeLenis: (() => void) | undefined;
		let rafId = 0;

		const attachLenis = () => {
			const lenis = scrollStore.getLenis();
			if (!lenis) return false;

			unsubscribeLenis = lenis.on('scroll', updateProgressFromScroll);
			updateProgressFromScroll();
			return true;
		};

		// SmoothScroll may hydrate after this component — poll until Lenis is ready
		if (!attachLenis()) {
			const waitForLenis = () => {
				if (attachLenis()) return;
				rafId = requestAnimationFrame(waitForLenis);
			};
			rafId = requestAnimationFrame(waitForLenis);
		}

		// Fallback when Lenis is disabled (e.g. prefers-reduced-motion)
		window.addEventListener('scroll', updateProgressFromScroll, { passive: true });

		return () => {
			cancelAnimationFrame(rafId);
			unsubscribeLenis?.();
			window.removeEventListener('scroll', updateProgressFromScroll);
		};
	}, []);

	return (
		// Tall scroll area — hero stays pinned inside until this container is fully scrolled
		<div ref={trackRef} className={styles.heroScrollTrack}>
			<section className={styles.heroSection}>
				<div ref={contentRef} className={styles.content}>
					<h1
						className={`${styles.title} font-accent`}
						dangerouslySetInnerHTML={{ __html: title }}
					/>
					<p className={styles.description}>{description}</p>
					<div className={styles.buttons}>
						{buttons.map((buttonData) => (
							<Button
								key={buttonData.children?.toString()}
								{...buttonData}
								className={styles.button}
							/>
						))}
					</div>
				</div>
				<div ref={canvasContainerRef} className={styles.canvas}>
					<canvas ref={canvasRef} />
				</div>
			</section>
		</div>
	);
};

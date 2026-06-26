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
	const [progress, setProgress] = useState(0);
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

	useEffect(() => {
		const content = contentRef.current;
		if (content) {
			content.style.opacity = String(1 - progress);
		}
		drawFrame(progress);
	}, [progress]);

	useEffect(() => {
		const canvas = canvasRef.current;
		const container = canvasContainerRef.current;
		if (!canvas || !container) return;

		const resizeCanvas = () => {
			const dpr = window.devicePixelRatio || 1;
			const { clientWidth, clientHeight } = container;

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

	useEffect(() => {
		const track = trackRef.current;
		if (!track) return;

		const updateProgressFromScroll = () => {
			const scrollY = scrollStore.getLenis()?.scroll ?? window.scrollY;
			const trackTop = track.offsetTop;
			const scrollRange = track.offsetHeight - window.innerHeight;

			if (scrollRange <= 0) return;

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

		if (!attachLenis()) {
			const waitForLenis = () => {
				if (attachLenis()) return;
				rafId = requestAnimationFrame(waitForLenis);
			};
			rafId = requestAnimationFrame(waitForLenis);
		}

		window.addEventListener('scroll', updateProgressFromScroll, { passive: true });

		return () => {
			cancelAnimationFrame(rafId);
			unsubscribeLenis?.();
			window.removeEventListener('scroll', updateProgressFromScroll);
		};
	}, []);

	return (
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

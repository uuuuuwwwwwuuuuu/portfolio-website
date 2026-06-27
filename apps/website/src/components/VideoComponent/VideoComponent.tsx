import styles from './VideoComponent.module.scss';

const VideoComponent = () => {
    return (
        <div className={styles.videoComponent}>
            <video src="/videos/hero-video.webm" />
        </div>
    );
};

export default VideoComponent;
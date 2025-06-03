import YouTube from 'react-youtube';
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

export const YouTubePlayer = forwardRef((props, ref) => {
  const { videoUrl, onEnded, onTimeUpdate } = props;
  const playerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    pause: () => {
      if (playerRef.current) {
        playerRef.current.pauseVideo();
      }
    },
    seekTo: (seconds) => {
      if (playerRef.current) {
        playerRef.current.seekTo(seconds, true);
      }
    },
  }));

  // Lấy videoId và listId từ URL
  const extractVideoParams = (url) => {
    try {
      const urlObj = new URL(url);
      const videoId = urlObj.searchParams.get("v");
      const listId = urlObj.searchParams.get("list");
      return { videoId, listId };
    } catch (e) {
      return { videoId: null, listId: null };
    }
  };

  const { videoId, listId } = extractVideoParams(videoUrl);

  const onPlayerReady = (event) => {
    playerRef.current = event.target;

    const interval = setInterval(() => {
      const player = playerRef.current;
      if (
        player &&
        typeof onTimeUpdate === 'function' &&
        player.getPlayerState() === 1
      ) {
        const currentTime = player.getCurrentTime();
        onTimeUpdate(currentTime);
      }
    }, 1000);

    playerRef.current._interval = interval;
  };

  const onPlayerStateChange = (event) => {
    const state = event.data;
    if (state === 0 && typeof onEnded === 'function') {
      onEnded();
    }
  };

  useEffect(() => {
    return () => {
      if (playerRef.current && playerRef.current._interval) {
        clearInterval(playerRef.current._interval);
      }
    };
  }, []);

  return (
    <YouTube
      videoId={videoId}
      onReady={onPlayerReady}
      onStateChange={onPlayerStateChange}
      opts={{
        width: '100%',
        height: '400',
        playerVars: {
          controls: 1,
          rel: 0,
          ...(listId && { list: listId }) 
        },
      }}
      className="chapter-video"
    />
  );
});

import React from "react";
import type { FileRendererProps } from "./types";

/** Plays a video via the native `<video>` element (restores the format the old
 * viewer handled). Media playback executes no scripts, and the `uri` has
 * already passed the viewer's safety gate. */
const VideoViewer = ({ uri, fileName }: FileRendererProps) => (
  <div className="flex items-center justify-center p-4">
    <video
      src={uri}
      controls
      className="max-h-[80vh] max-w-full"
      aria-label={fileName}
    >
      Your browser can&apos;t play this video.
    </video>
  </div>
);

export default VideoViewer;

import { AspectRatio } from "@mantine/core";
import { useParams } from "@remix-run/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useAction } from "convex/react";
import { useEffect, useState } from "react";
import ReactPlayer from "react-player";

export default function Stream() {
  const params = useParams();
  const [url, setUrl] = useState<string | undefined>(undefined);
  const video = useAction(api.azure.generateURL);

  useEffect(() => {
    video({ id: params.videoId as Id<"videos"> }).then(setUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!url) {
    return <>Wait a minute...</>;
  }

  return (
    <AspectRatio ratio={2 / 1}>
      <ReactPlayer
        url={url}
        playing={false}
        controls
        width="100%"
        height="100%"
      />
    </AspectRatio>
  );
}

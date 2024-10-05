import { AspectRatio } from "@mantine/core";
import { useParams } from "@remix-run/react";
import { api } from "convex/_generated/api";
import { useAction } from "convex/react";
import { useEffect, useState } from "react";
import ReactPlayer from "react-player";

export default function Stream() {
  const params = useParams();
  const [streams, setStreams] = useState<Array<{
    name: string;
    url: string;
  }> | null>(null);
  const getStreams = useAction(api.tiktok.getStreamData);

  useEffect(() => {
    getStreams({
      roomId: params.roomId || "",
    }).then(setStreams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return streams && streams.length > 0 ? (
    <AspectRatio ratio={2 / 1}>
      <ReactPlayer
        url={streams[0].url}
        playing={false}
        controls
        width="100%"
        height="100%"
        config={{
          file: {
            forceFLV: true,
            attributes: {
              controls: true,
            },
          },
        }}
      />
    </AspectRatio>
  ) : null;
}

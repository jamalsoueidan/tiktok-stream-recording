import { AspectRatio } from "@mantine/core";
import { useParams } from "@remix-run/react";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import ReactPlayer from "react-player";

export default function Stream() {
  const params = useParams();
  const follower = useQuery(api.follower.get, {
    uniqueId: params.uniqueId || "",
  });

  const log = follower?.log;

  return log?.stream?.flv_pull_url?.FULL_HD1 ? (
    <AspectRatio ratio={2 / 1}>
      <ReactPlayer
        url={log?.stream?.flv_pull_url?.HD1}
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

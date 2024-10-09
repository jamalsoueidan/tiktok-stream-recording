import { useParams } from "@remix-run/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useAction } from "convex/react";
import { FunctionReturnType } from "convex/server";
import { useEffect, useState } from "react";

export default function Stream() {
  const params = useParams();
  const [video, setVideo] = useState<
    FunctionReturnType<typeof api.azure.generateURL> | undefined
  >(undefined);
  const loadVideo = useAction(api.azure.generateURL);

  useEffect(() => {
    loadVideo({ id: params.videoId as Id<"videos"> }).then(setVideo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!video) {
    return <>Wait a minute...</>;
  }

  return (
    <video controls width="100%" height="100%" style={{ position: "relative" }}>
      <source src={video.url} type="video/mp4" />
      <track kind="captions" default />
    </video>
  );
}

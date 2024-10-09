import { Button, TextInput } from "@mantine/core";
import { useNavigate } from "@remix-run/react";
import { api } from "convex/_generated/api";
import { useAction } from "convex/react";
import { useState } from "react";
import { useMobile } from "~/lib/useMobile";

export const FollowerForm = () => {
  const [uniqueId, setUniqueId] = useState("");
  const navigate = useNavigate();
  const isMobile = useMobile();
  const addFollower = useAction(api.follower.follow);

  return (
    <>
      <TextInput
        placeholder="Enter tiktok user @neymarjr"
        value={uniqueId}
        size={isMobile ? "xs" : "lg"}
        onChange={(event) => setUniqueId(event.currentTarget.value)}
        flex="1"
      />
      <Button
        size={isMobile ? "xs" : "lg"}
        onClick={() => {
          addFollower({ uniqueId }).then(() => {
            setUniqueId("");
            navigate("/");
          });
        }}
      >
        Add follower
      </Button>
    </>
  );
};

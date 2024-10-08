import { Button, TextInput } from "@mantine/core";
import { api } from "convex/_generated/api";
import { useAction } from "convex/react";
import { useState } from "react";

export const FollowerForm = () => {
  const [uniqueId, setUniqueId] = useState("");
  const addFollower = useAction(api.follower.follow);

  return (
    <>
      <TextInput
        placeholder="Add follower"
        value={uniqueId}
        size="lg"
        onChange={(event) => setUniqueId(event.currentTarget.value)}
        flex="1"
      />
      <Button
        size="lg"
        onClick={() => {
          addFollower({ uniqueId }).then(() => {
            setUniqueId("");
          });
        }}
      >
        Add follower
      </Button>
    </>
  );
};

import { Center, Text, Flex, ActionIcon, Box, Tooltip } from "@mantine/core";
import { IconExternalLink, IconExclamationCircle } from "@tabler/icons-react";
import { CategorizedDocument, ClassificationStatus } from "../types/client";

const classificationStatusColors = {
  error: "red-600",
  invalid: "yellow-400",
  success: "gray",
};

const InfoTooltip = ({
  status,
  errorMsg,
}: {
  status: ClassificationStatus;
  errorMsg?: string;
}) => {
  switch (status) {
    case "success":
      return null;
    case "error":
      return (
        <Tooltip label={`Error occurred: "${errorMsg}"`}>
          <ActionIcon radius={"xl"} aria-label="Open in new tab" color="none">
            <IconExclamationCircle color="red" size={20} />
          </ActionIcon>
        </Tooltip>
      );
    case "invalid":
      return (
        <Tooltip label={"Invalid document (uncategorizable)"}>
          <ActionIcon radius={"xl"} aria-label="Open in new tab" color="none">
            <IconExclamationCircle color="yellow" size={20} />
          </ActionIcon>
        </Tooltip>
      );
  }
};

const CategorizedFile = ({
  file: { file, result },
  status,
}: {
  file: CategorizedDocument;
  status: ClassificationStatus;
}) => {
  return (
    <Box className="mt-2" key={file.name}>
      <Flex justify="space-between" key={file.name}>
        <Center className="gap-2">
          <Text
            size="sm"
            fw={600}
            className={`text-${classificationStatusColors[status]}`}
          >
            {file.name}
          </Text>

          <Text c="dimmed" size="sm">
            {" "}
            ({(file.size / 1048 ** 2).toFixed(2)}
            MB)
          </Text>
        </Center>

        <Center className="gap-1">
          {/* if status is error, then result.error will have the error message from our backend */}
          <InfoTooltip status={status} errorMsg={result?.error} />
          <a href={URL.createObjectURL(file)} target="_blank">
            <ActionIcon aria-label="Open in new tab" color="none">
              <IconExternalLink size={20} />
            </ActionIcon>
          </a>
        </Center>
      </Flex>
    </Box>
  );
};

export default CategorizedFile;

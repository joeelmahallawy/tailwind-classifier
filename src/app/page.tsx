"use client";

import {
  Box,
  Button,
  Card,
  Center,
  Group,
  Text,
  Title,
  rem,
  List,
  ThemeIcon,
  Divider,
  Flex,
  ActionIcon,
  Switch,
  Checkbox,
  Tooltip,
} from "@mantine/core";
import {
  IconUpload,
  IconHelp,
  IconPhoto,
  IconX,
  IconCircleCheck,
  IconExternalLink,
} from "@tabler/icons-react";
import { Dropzone, PDF_MIME_TYPE } from "@mantine/dropzone";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";

const HomePage = () => {
  const [uncategorizedDocument, setUncategorizedDocument] = useState<File>();
  const [forceCategorization, setForceCategorization] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <Box>
      <header className="shadow-sm shadow-gray-500 w-full justify-between px-6 py-2 items-center flex">
        <Title ff="Helvetica" order={1}>
          ClassifAI
        </Title>
        <Button radius={"xl"} size="sm" color="orange">
          Enter app
        </Button>
      </header>
      <Center className="pt-2 flex-col mt-5">
        <Card
          className="max-w-[45%] w-[45%]"
          shadow="sm"
          padding="lg"
          radius="md"
          withBorder
        >
          <Group justify="space-between" mb="xs">
            <Text c="white" size="xl" fw={500}>
              Insurance Document Classifier
            </Text>
          </Group>
          <Divider />

          <Group justify="space-between" my="xs">
            <Text size="sm">
              Our intelligent AI model categorizes your insurance documents
              while keeping privacy in mind.
              <br />
              <br />
              At this time, we can categorize your insurance document into any
              one of the following documents:
            </Text>
            <List
              spacing="xs"
              center
              size="sm"
              icon={
                <ThemeIcon color="teal" size={"sm"} radius="xl">
                  <IconCircleCheck size={20} stroke={2} />
                </ThemeIcon>
              }
            >
              <List.Item>Policy Document</List.Item>
              <List.Item>Authorization Letter</List.Item>
              <List.Item>Loss Run Document</List.Item>
              <List.Item>Notice of Cancellation</List.Item>
              <List.Item>Certificate of Insurance</List.Item>
            </List>
          </Group>

          <form
            onSubmit={async (e) => {
              e.preventDefault();

              setIsLoading(true);

              // submit file via form data
              const formSubmission = new FormData();
              // we use blobs because it'll be easier to use in Node.js (our API endpoints)
              const uncategorizedDocumentBlob = new Blob(
                [uncategorizedDocument as File],
                { type: uncategorizedDocument?.type }
              );
              formSubmission.append(
                "uncategorizedDocument",
                uncategorizedDocumentBlob
              );
              // classify!
              const classifyDocumentRequest = await fetch(
                // use Sensible if we want to force categorization based on similarity search (embeddings), otherwise use good ol' GPT-4
                forceCategorization ? `/api/classifySensible` : `/api/classify`,
                {
                  method: "POST",
                  body: formSubmission,
                }
              );

              const classificationResult = await classifyDocumentRequest.json();

              // error occurred on backend
              if (!classificationResult.success) {
                notifications.show({
                  color: "red",
                  message: classificationResult.error,
                });
              } else {
                notifications.show({
                  color: "green",
                  message: `Success! ${classificationResult.result}`,
                });
              }
              setIsLoading(false);
            }}
          >
            <Dropzone
              className="mt-3"
              onDrop={(files) => {
                setUncategorizedDocument(files[0]);
              }}
              onReject={(files) => console.log("rejected files", files)}
              // 25MB size max
              maxSize={25 * 1024 ** 2}
              accept={PDF_MIME_TYPE}
            >
              <Group
                justify="center"
                gap="xl"
                mih={120}
                style={{ pointerEvents: "none" }}
              >
                <Dropzone.Accept>
                  <IconUpload
                    style={{
                      width: rem(52),
                      height: rem(52),
                      color: "var(--mantine-color-blue-6)",
                    }}
                    stroke={1.5}
                  />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX
                    style={{
                      width: rem(52),
                      height: rem(52),
                      color: "var(--mantine-color-red-6)",
                    }}
                    stroke={1.5}
                  />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconPhoto
                    style={{
                      width: rem(52),
                      height: rem(52),
                      color: "var(--mantine-color-dimmed)",
                    }}
                    stroke={1.5}
                  />
                </Dropzone.Idle>

                <div>
                  <Text size="xl" inline>
                    Drag files here or click to select files
                  </Text>
                  <Text size="sm" c="dimmed" inline mt={7}>
                    Attach a single file no larger than 25MB
                  </Text>
                </div>
              </Group>
            </Dropzone>
            {uncategorizedDocument && (
              <Box className="mt-2">
                <Center className="justify-between my-3">
                  <Text>Current file</Text>
                  <Checkbox
                    onChange={(e) => {
                      setForceCategorization(e.currentTarget.checked);
                    }}
                    checked={forceCategorization}
                    label={
                      <div className="flex items-center gap-1">
                        <Text>Force categorization </Text>
                        <Tooltip label="This will categorize your document even if it can't find a match.">
                          <ActionIcon size={24} radius={"xl"} color="dimmed">
                            <IconHelp size={24} stroke={2} />
                          </ActionIcon>
                        </Tooltip>
                      </div>
                    }
                  />
                </Center>
                <Divider my={3} />
                <Flex justify="space-between">
                  <Center className="gap-1">
                    <Text size="sm" fw={700} c="white">
                      {uncategorizedDocument.name}
                    </Text>
                    <Text c="dimmed" size="sm">
                      {" "}
                      ({(uncategorizedDocument.size / 1048 ** 2).toFixed(2)}MB)
                    </Text>
                  </Center>
                  <a
                    href={URL.createObjectURL(uncategorizedDocument)}
                    target="_blank"
                  >
                    <ActionIcon
                      aria-label="Open in new tab"
                      // size="xs"
                      color="none"
                    >
                      <IconExternalLink size={20} />
                    </ActionIcon>
                  </a>
                </Flex>
              </Box>
            )}
            <Button
              loading={isLoading}
              disabled={!uncategorizedDocument}
              type="submit"
              color="violet"
              fullWidth
              className="mt-3"
              radius="md"
            >
              {isLoading ? `Classifying...` : `Submit`}
            </Button>
          </form>
        </Card>
      </Center>
    </Box>
  );
};

export default HomePage;

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
  Checkbox,
  Tooltip,
  Modal,
  Badge,
} from "@mantine/core";
import {
  IconUpload,
  IconHelp,
  IconPhoto,
  IconX,
  IconCircleCheck,
  IconExternalLink,
  IconTrash,
} from "@tabler/icons-react";
import Image from "next/image";
import { Dropzone, PDF_MIME_TYPE } from "@mantine/dropzone";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { CategorizedDocument } from "./types/client";
import { useDisclosure } from "@mantine/hooks";
import Header from "./components/Header";
import CategorizedDocumentsModal from "./components/categoriesModal";

const HomePage = () => {
  const [categorizedDocuments, setCategorizedDocuments] = useState<
    CategorizedDocument[]
  >([]);
  const [uncategorizedDocuments, setUncategorizedDocuments] = useState<File[]>(
    []
  );
  const [forceCategorization, setForceCategorization] =
    useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [isModalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);

  return (
    <Box className="pb-10">
      <Header />
      <Center className="pt-2 flex-col mt-5">
        <Card
          className="lg:w-[45%] lg:max-w-[45%] md:w-[65%] md:max-w-[65%] sm:max-w-[80%] sm:w-[80%] xs:max-w-[90%] xs:w-[90%]"
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
              spacing={8}
              center
              size="sm"
              icon={
                <ThemeIcon color="teal" size={"sm"} radius="xl">
                  <IconCircleCheck size={18} stroke={2} />
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

              try {
                setIsLoading(true);
                // NOTE: this submission will make requests in parallel for each classification

                // for each file...
                const categorizeAll = uncategorizedDocuments.map((doc) => {
                  // submit via form data
                  const formDataSubmission = new FormData();
                  // use blob (easier to deal w/ IMO)
                  const uncategorizedDocumentBlob = new Blob([doc as File], {
                    type: doc?.type,
                  });
                  formDataSubmission.append(
                    "uncategorizedDocument",
                    uncategorizedDocumentBlob
                  );

                  // classify!
                  return fetch(
                    // use Sensible if we want to force categorization based on similarity search (embeddings), otherwise use good ol' GPT-4
                    forceCategorization
                      ? `/api/classifySensible`
                      : `/api/classify`,
                    {
                      method: "POST",
                      body: formDataSubmission,
                    }
                  ).then(async (res) => ({
                    file: doc, // pass file along so we can display list of classified files
                    result: await res.json(), // finalize classification
                  }));
                });

                // send requests in parallel to get results of classification
                const classifyAllSimultaneously = await Promise.all(
                  categorizeAll
                );

                setCategorizedDocuments([...classifyAllSimultaneously]);

                openModal(); // opens list with documents and their categories
                notifications.show({
                  color: "green",
                  message: `Success!`,
                });
                setIsLoading(false);
              } catch (err) {
                setIsLoading(false);
                notifications.show({
                  color: "red",
                  // @ts-expect-error
                  message: err?.message,
                });
              }

              // // error occurred on backend
              // if (!classificationResult.success) {
              //   notifications.show({
              //     color: "red",
              //     message: classificationResult.error,
              //   });
              // } else {
              //   notifications.show({
              //     color: "green",
              //     message: `Success! ${classificationResult.documentType}`,
              //   });
              // }
              //
            }}
          >
            <Dropzone
              className="mt-3"
              onDrop={(files) => {
                setUncategorizedDocuments([...files]);
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
                    Attach as many files as you like, each file should not
                    exceed 25MB
                  </Text>
                </div>
              </Group>
            </Dropzone>
            {uncategorizedDocuments.length > 0 && (
              <Box className="mt-2">
                <Center className="justify-between my-3">
                  <Text>Current files</Text>
                  <Checkbox
                    onChange={(e) => {
                      setForceCategorization(e.currentTarget.checked);
                    }}
                    checked={forceCategorization}
                    label={
                      <div className="flex items-center gap-1">
                        <Text>Force categorization </Text>

                        <Tooltip label="This will categorize your document by similarity if it can't find a match.">
                          <ActionIcon size={24} radius={"xl"} color="dimmed">
                            <IconHelp size={24} stroke={2} />
                          </ActionIcon>
                        </Tooltip>
                      </div>
                    }
                  />
                </Center>
                <Divider my={3} />
                {uncategorizedDocuments.map((document, index) => (
                  <Flex justify="space-between" key={document.name}>
                    <Center className="gap-1">
                      <Text size="sm" fw={700} c="white">
                        {document.name}
                      </Text>
                      <Text c="dimmed" size="sm">
                        {" "}
                        ({(document.size / 1048 ** 2).toFixed(2)}
                        MB)
                      </Text>
                    </Center>
                    <Center className="gap-1.5">
                      <a href={URL.createObjectURL(document)} target="_blank">
                        <ActionIcon aria-label="Open in new tab" color="none">
                          <IconExternalLink size={20} />
                        </ActionIcon>
                      </a>

                      <ActionIcon
                        onClick={() => {
                          // removes a file from the selected files
                          const shallowCopy = [...uncategorizedDocuments];
                          shallowCopy.splice(index, 1);
                          setUncategorizedDocuments([...shallowCopy]);
                        }}
                        aria-label="Open in new tab"
                        size={24}
                        color="red"
                      >
                        <IconTrash size={20} />
                      </ActionIcon>
                    </Center>
                  </Flex>
                ))}
              </Box>
            )}
            <Button
              loading={isLoading}
              disabled={uncategorizedDocuments.length < 1}
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
      <CategorizedDocumentsModal
        categorizedDocuments={categorizedDocuments}
        isModalOpened={isModalOpened}
        closeModal={closeModal}
      />
    </Box>
  );
};

export default HomePage;

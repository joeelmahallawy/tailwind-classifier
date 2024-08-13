import { Center, Title, Modal, Badge, Divider, Box } from "@mantine/core";
import { CategorizedDocument, InsuranceDocumentType } from "../types/client";
import { useMemo } from "react";
import CategorizedFile from "./categorizedFile";

const CategorizedDocumentsModal = ({
  isModalOpened,
  categorizedDocuments,
  closeModal,
}: {
  isModalOpened: boolean;
  categorizedDocuments: CategorizedDocument[];
  closeModal: () => void;
}) => {
  const successfulCategorizations = useMemo(
    () =>
      Object.entries(
        Object.groupBy(
          // files that were successful
          categorizedDocuments
            .filter((doc) => doc.result.success)
            // AND AREN'T INVALID
            .filter(
              (successfulDoc) =>
                !String(successfulDoc.result.documentType)
                  .toLowerCase()
                  .includes("invalid")
            ),
          // group by document type
          (file) => file.result.documentType as InsuranceDocumentType
        )
      ),
    [categorizedDocuments]
  );

  const failedCategorizations = useMemo(
    // any file that failed
    () => categorizedDocuments.filter((file) => !file.result.success),
    [categorizedDocuments]
  );

  const invalidCategorization = useMemo(
    () =>
      categorizedDocuments.filter((doc) =>
        // any file that has an invalid document type
        String(doc.result.documentType).toLowerCase().includes("invalid")
      ),
    [categorizedDocuments]
  );

  return (
    <Modal
      size="xl"
      opened={isModalOpened}
      onClose={closeModal}
      withCloseButton={false}
    >
      <u>
        <Title order={2} c="white">
          Document categorization
        </Title>
      </u>

      {successfulCategorizations.map(([documentType, successfulFiles]) => {
        return (
          <Box className="mt-5" key={documentType}>
            <Center className="justify-start gap-1.5">
              <Title order={4} c="white">
                {/* each group has it's section title */}
                {documentType}
              </Title>
              {documentType.includes("valid") && (
                <Badge color="red">Invalid Document</Badge>
              )}
            </Center>

            <Divider className="my-1" />
            {/* every file in each group gets listed with an external link to view it */}
            {successfulFiles?.map((file) => (
              <CategorizedFile
                file={file}
                status="success"
                key={file.file.name}
              />
            ))}
          </Box>
        );
      })}

      {invalidCategorization.length > 0 && (
        <>
          <Center className="justify-start items-center content-center mt-5 gap-2">
            <Title order={3} className="text-yellow-400">
              Invalid documents
            </Title>
            <Badge color="yellow">Invalid</Badge>
          </Center>
          <Divider className="my-1" />
          {invalidCategorization.map((invalidCategoryFile) => (
            <CategorizedFile
              file={invalidCategoryFile}
              status="invalid"
              key={invalidCategoryFile.file.name}
            />
          ))}
        </>
      )}

      {/* show the failed classifications if there are any */}
      {failedCategorizations.length > 0 && (
        <>
          <Center className="justify-start items-center content-center mt-5 gap-2">
            <Title order={3} className="text-red-600">
              Failed classifications
            </Title>
            <Badge color="red">Error</Badge>
          </Center>
          <Divider className="my-1" />
          {failedCategorizations.map((failedFile) => (
            <CategorizedFile
              file={failedFile}
              status="error"
              key={failedFile.file.name}
            />
          ))}
        </>
      )}
    </Modal>
  );
};
export default CategorizedDocumentsModal;
